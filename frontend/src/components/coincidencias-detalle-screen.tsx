import ArrowBackIcon from '@expo/material-symbols/arrow_back.xml';
import { Host, Icon } from '@expo/ui/jetpack-compose';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CalendarBlankIcon, MapPinIcon } from 'phosphor-react-native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { colors } from '@/constants/colors';
import { listarCoincidencias, type Coincidencia } from '@/lib/api';

type CoincidenciasDetalleScreenProps = {
  idReporte: string;
  nombreReporte?: string;
  tipoReporte?: string;
};

export function CoincidenciasDetalleScreen({ idReporte, nombreReporte, tipoReporte }: CoincidenciasDetalleScreenProps) {
  const { sesion } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [coincidencias, setCoincidencias] = useState<Coincidencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const coincidenciasOrdenadas = [...coincidencias].sort(
    (primera, segunda) => segunda.puntajeTotal - primera.puntajeTotal,
  );
  // Si hay coincidencias, la respuesta también incluye la foto del reporte elegido.
  const primera = coincidenciasOrdenadas[0];
  const fotoReporte = primera && (primera.idReportePerdido === idReporte
    ? primera.urlFotografiaReportePerdido : primera.urlFotografiaReporteAvistamiento);

  useEffect(() => {
    if (!sesion) {
      return;
    }

    const controller = new AbortController();

    // Busca las coincidencias que pertenecen al reporte elegido.
    const cargarCoincidencias = async () => {
      try {
        const coincidenciasRecibidas = await listarCoincidencias(
          idReporte,
          sesion.access_token,
          controller.signal,
        );

        setCoincidencias(coincidenciasRecibidas);
        setError(null);
      } catch (errorCarga) {
        if (errorCarga instanceof Error && errorCarga.name !== 'AbortError') {
          setError(errorCarga.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    cargarCoincidencias();

    return () => controller.abort();
  }, [idReporte, sesion]);

  const abrirCoincidencia = (coincidencia: Coincidencia) => {
    const elReporteActualEsPerdido = coincidencia.idReportePerdido === idReporte;
    const idReporteRelacionado = elReporteActualEsPerdido
      ? coincidencia.idReporteAvistamiento
      : coincidencia.idReportePerdido;
    const puedeDecidir = elReporteActualEsPerdido && coincidencia.estado === 'PENDIENTE';

    router.push({
      pathname: '/reportes/[idReporte]',
      params: {
        idReporte: idReporteRelacionado,
        idCoincidencia:
          puedeDecidir || coincidencia.estado === 'CONFIRMADA'
            ? coincidencia.idCoincidencia
            : undefined,
        estadoCoincidencia:
          puedeDecidir || coincidencia.estado === 'CONFIRMADA'
            ? coincidencia.estado
            : undefined,
      },
    });
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        backgroundColor: colors.reportListBackground,
        flexGrow: 1,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />

      {/* Cabecera simple de la pantalla */}
      <View style={{ alignItems: 'center', flexDirection: 'row', marginTop: insets.top + 8, minHeight: 52 }}>
        <Pressable
          accessibilityLabel="Volver a tus reportes"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.back()}
          style={{ alignItems: 'center', height: 48, justifyContent: 'center', width: 48 }}>
          <Host matchContents>
            <Icon contentDescription="Volver" size={24} source={ArrowBackIcon} tint={colors.primary} />
          </Host>
        </Pressable>
        <Text selectable style={{ color: colors.primary, fontSize: 21, fontWeight: '700', marginLeft: 4 }}>
          Coincidencias
        </Text>
      </View>

      <View style={{ flex: 1, gap: 14, paddingTop: 12 }}>
        {/* Recordamos qué reporte está consultando la persona. */}
        <View style={{ alignItems: 'center', backgroundColor: colors.reportSummaryBackground, borderRadius: 18, flexDirection: 'row', gap: 12, padding: 12 }}>
          {fotoReporte ? (
            <Image source={fotoReporte} contentFit="contain" style={{ borderRadius: 12, height: 52, width: 52 }} />
          ) : (
            <View style={{ alignItems: 'center', backgroundColor: colors.reportCardBackground, borderRadius: 12, height: 52, justifyContent: 'center', width: 52 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Reporte</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>BUSCANDO COINCIDENCIAS PARA</Text>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 }}>
              {nombreReporte?.trim() || 'Tu reporte'}{tipoReporte === 'PERDIDO' ? ' · Perdido' : tipoReporte === 'AVISTAMIENTO' ? ' · Avistamiento' : ''}
            </Text>
          </View>
        </View>
        {!cargando && !error && coincidencias.length > 0 ? (
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 8 }}>
            {coincidencias.length} {coincidencias.length === 1 ? 'coincidencia encontrada' : 'coincidencias encontradas'}
          </Text>
        ) : null}
        {cargando ? <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} /> : null}

        {error ? <Text selectable style={{ color: colors.error, fontSize: 15 }}>{error}</Text> : null}

        {!cargando && !error && coincidencias.length === 0 ? (
          <View style={{ alignItems: 'center', gap: 8, paddingTop: 56 }}>
            <Text selectable style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
              Aun no hay coincidencias
            </Text>
            <Text selectable style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center' }}>
              Cuando alguien publique un reporte compatible, aparecerá acá.
            </Text>
          </View>
        ) : null}

        {coincidenciasOrdenadas.map((coincidencia) => {
          const reporteActualEsPerdido = coincidencia.idReportePerdido === idReporte;
          const tipoRelacionado = reporteActualEsPerdido ? 'Avistamiento' : 'Perdido';
          const urlFotografiaRelacionada = reporteActualEsPerdido
            ? coincidencia.urlFotografiaReporteAvistamiento
            : coincidencia.urlFotografiaReportePerdido;
          const fechaHoraRelacionada = reporteActualEsPerdido
            ? coincidencia.fechaHoraReporteAvistamiento
            : coincidencia.fechaHoraReportePerdido;
          const nombreReporteRelacionado = reporteActualEsPerdido
            ? coincidencia.nombreReporteAvistamiento
            : coincidencia.nombreReportePerdido;

          return (
            <ResultadoCoincidencia
              key={coincidencia.idCoincidencia}
              coincidencia={coincidencia}
              fechaHora={fechaHoraRelacionada}
              nombreReporte={nombreReporteRelacionado}
              onPress={() => abrirCoincidencia(coincidencia)}
              tipo={tipoRelacionado}
              urlFotografia={urlFotografiaRelacionada}
            />
          );
        })}
        {!cargando && !error && coincidencias.length > 0 ? (
          <Text style={{ color: colors.textSecondary, fontSize: 12, lineHeight: 18 }}>
            La compatibilidad se calcula con los datos de los reportes. Revisá el detalle para confirmar si se trata del mismo perro.
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

function ResultadoCoincidencia({
  coincidencia, fechaHora, nombreReporte, onPress, tipo, urlFotografia,
}: {
  coincidencia: Coincidencia;
  fechaHora: string;
  nombreReporte: string | null;
  onPress: () => void;
  tipo: 'Perdido' | 'Avistamiento';
  urlFotografia: string | null;
}) {
  const esPerdido = tipo === 'Perdido';
  const estiloPuntaje = obtenerEstiloPuntaje(coincidencia.puntajeTotal);
  const fondoTipo = esPerdido ? colors.lostBackground : colors.sightingBackground;
  const textoTipo = esPerdido ? colors.lostText : colors.sightingText;

  return (
    <Pressable
      accessibilityHint="Abre el detalle del reporte relacionado"
      accessibilityLabel={`${tipo}, ${Math.round(coincidencia.puntajeTotal)} por ciento de compatibilidad`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: colors.reportCardBackground,
        borderColor: colors.reportCardBorder,
        borderRadius: 18,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 12,
        opacity: pressed ? 0.74 : 1,
        padding: 12,
      })}>
      {/* La foto queda junto a los datos, como en la tarjeta compacta. */}
      {urlFotografia ? (
        <Image source={urlFotografia} contentFit="contain" style={{ backgroundColor: colors.reportCardBackground, borderRadius: 14, height: 112, width: 100 }} />
      ) : (
        <View style={{ alignItems: 'center', backgroundColor: fondoTipo, borderRadius: 14, height: 112, justifyContent: 'center', width: 100 }}>
          <Text style={{ color: textoTipo, fontSize: 12 }}>Sin foto</Text>
        </View>
      )}
      <View style={{ flex: 1, gap: 6, justifyContent: 'center' }}>
        <View style={{ alignItems: 'flex-start', flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
          <Text style={{ backgroundColor: fondoTipo, borderRadius: 12, color: textoTipo, fontSize: 11, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 }}>{tipo}</Text>
          <Text style={{ backgroundColor: estiloPuntaje.fondo, borderRadius: 12, color: estiloPuntaje.texto, fontSize: 11, fontWeight: '700', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 }}>{Math.round(coincidencia.puntajeTotal)}% compatible</Text>
        </View>
        <Text numberOfLines={2} style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
          {nombreReporte?.trim() || `Reporte de ${tipo.toLowerCase()}`}
        </Text>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
          <MapPinIcon color={colors.textSecondary} size={15} />
          <Text style={{ color: colors.textSecondary, flexShrink: 1, fontSize: 12 }}>{coincidencia.distancia.toFixed(1)} km de tu reporte</Text>
        </View>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
          <CalendarBlankIcon color={colors.textSecondary} size={15} />
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{formatearFecha(fechaHora)}</Text>
        </View>
        <Text style={{ color: colors.action, fontSize: 13, fontWeight: '700', marginTop: 2 }}>Revisar coincidencia →</Text>
      </View>
    </Pressable>
  );
}

function obtenerEstiloPuntaje(puntaje: number) {
  if (puntaje >= 80) {
    return { fondo: colors.scoreHighBackground, texto: colors.scoreHighText };
  }

  if (puntaje >= 60) {
    return { fondo: colors.scoreMediumBackground, texto: colors.scoreMediumText };
  }

  return { fondo: colors.tagBackground, texto: colors.primary };
}

function formatearFecha(fechaHora: string) {
  const fecha = new Date(fechaHora);

  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(fecha);
}
