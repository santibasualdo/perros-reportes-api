import ArrowBackIcon from '@expo/material-symbols/arrow_back.xml';
import SearchIcon from '@expo/material-symbols/search.xml';
import VisibilityIcon from '@expo/material-symbols/visibility.xml';
import { Host, Icon } from '@expo/ui/jetpack-compose';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { colors } from '@/constants/colors';
import { listarCoincidencias, type Coincidencia } from '@/lib/api';

type CoincidenciasDetalleScreenProps = {
  idReporte: string;
};

export function CoincidenciasDetalleScreen({ idReporte }: CoincidenciasDetalleScreenProps) {
  const { sesion } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [coincidencias, setCoincidencias] = useState<Coincidencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const puntajeMasAlto = Math.max(...coincidencias.map((coincidencia) => coincidencia.puntajeTotal));

  useEffect(() => {
    if (!sesion) {
      return;
    }

    const controller = new AbortController();

    // Busca las coincidencias que el backend ya guardo para este reporte.
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

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        backgroundColor: colors.background,
        flexGrow: 1,
        paddingBottom: insets.bottom,
      }}>
      <StatusBar style="light" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: colors.primary, height: insets.top }} />

      {/* Titulo de la pantalla */}
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          flexDirection: 'row',
          gap: 12,
          paddingBottom: 24,
          paddingHorizontal: 24,
          paddingTop: 32,
        }}>
        <Pressable
          accessibilityLabel="Volver a tus reportes"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={{ alignItems: 'center', height: 36, justifyContent: 'center', width: 28 }}>
          <Host matchContents>
            <Icon contentDescription="Volver" size={22} source={ArrowBackIcon} tint={colors.primary} />
          </Host>
        </Pressable>
        <Text selectable style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
          Coincidencias encontradas
        </Text>
      </View>

      {/* Lista de coincidencias */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {cargando ? <ActivityIndicator color={colors.primary} /> : null}

        {error ? (
          <Text selectable style={{ color: '#b3261e', fontSize: 15 }}>
            {error}
          </Text>
        ) : null}

        {!cargando && !error && coincidencias.length === 0 ? (
          <Text selectable style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
            Este reporte todavía no tiene coincidencias.
          </Text>
        ) : null}

        {coincidencias.map((coincidencia) => {
          const idReporteRelacionado =
            coincidencia.idReportePerdido === idReporte
              ? coincidencia.idReporteAvistamiento
              : coincidencia.idReportePerdido;
          const urlFotografiaRelacionada =
            coincidencia.idReportePerdido === idReporte
              ? coincidencia.urlFotografiaReporteAvistamiento
              : coincidencia.urlFotografiaReportePerdido;
          const fechaHoraRelacionada =
            coincidencia.idReportePerdido === idReporte
              ? coincidencia.fechaHoraReporteAvistamiento
              : coincidencia.fechaHoraReportePerdido;
          const tipoRelacionado =
            coincidencia.idReportePerdido === idReporte ? 'Avistamiento' : 'Perdido';
          const puedeDecidir =
            coincidencia.idReportePerdido === idReporte && coincidencia.estado === 'PENDIENTE';
          const esCoincidenciaMasProbable = coincidencia.puntajeTotal === puntajeMasAlto;

          return (
            <Pressable
              key={coincidencia.idCoincidencia}
              accessibilityLabel={`Ver reporte de ${tipoRelacionado}`}
              accessibilityRole="button"
              onPress={() =>
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
                })
              }
              style={{
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
                paddingVertical: 18,
              }}>
              <View style={{ alignItems: 'center', flexDirection: 'row', gap: 16 }}>
                {/* Foto del reporte relacionado */}
                {urlFotografiaRelacionada ? (
                  <Image
                    accessibilityLabel="Fotografia principal del reporte relacionado"
                    contentFit="contain"
                    source={urlFotografiaRelacionada}
                    style={{ backgroundColor: colors.background, borderRadius: 12, height: 112, width: 112 }}
                  />
                ) : (
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: colors.tagBackground,
                      borderRadius: 12,
                      height: 112,
                      justifyContent: 'center',
                      width: 112,
                    }}>
                    <Text selectable style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }}>
                      Sin foto
                    </Text>
                  </View>
                )}

                <View style={{ flex: 1, gap: 8 }}>
                  {/* Tipo del reporte relacionado */}
                  <View
                    style={{
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      backgroundColor:
                        tipoRelacionado === 'Perdido' ? colors.lostBackground : colors.sightingBackground,
                      borderColor: tipoRelacionado === 'Perdido' ? colors.lostText : colors.sightingText,
                      borderRadius: 999,
                      borderWidth: 1,
                      flexDirection: 'row',
                      gap: 4,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}>
                    <Host matchContents>
                      <Icon
                        contentDescription={tipoRelacionado}
                        size={16}
                        source={tipoRelacionado === 'Perdido' ? SearchIcon : VisibilityIcon}
                        tint={tipoRelacionado === 'Perdido' ? colors.lostText : colors.sightingText}
                      />
                    </Host>
                    <Text
                      selectable
                      style={{
                        color: tipoRelacionado === 'Perdido' ? colors.lostText : colors.sightingText,
                        fontSize: 13,
                        fontWeight: '600',
                      }}>
                      {tipoRelacionado}
                    </Text>
                  </View>
                  <Text selectable style={{ color: colors.textSecondary, fontSize: 14 }}>
                    {new Date(fechaHoraRelacionada).toLocaleDateString('es-AR')} -{' '}
                    {coincidencia.distancia.toFixed(2)} km
                  </Text>
                  {/* Puntaje de similitud */}
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: esCoincidenciaMasProbable
                        ? colors.tagStrongBackground
                        : colors.tagBackground,
                      borderRadius: 999,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}>
                    <Text
                      selectable
                      style={{
                        color: esCoincidenciaMasProbable ? colors.tagStrongText : colors.tagText,
                        fontSize: 13,
                        fontWeight: '700',
                      }}>
                      {Math.round(coincidencia.puntajeTotal)}% similar
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                selectable
                style={{ alignSelf: 'flex-end', color: colors.action, fontSize: 15, fontWeight: '700', marginTop: 12 }}>
                Ver reporte
              </Text>
            </Pressable>
          );
        })}

      </View>
    </ScrollView>
  );
}
