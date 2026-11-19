// Imagen del logo y herramientas para cargar las conversaciones.
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { colors } from '@/constants/colors';
import { listarConversaciones, type Conversacion } from '@/lib/api';

export function ConversacionesScreen() {
  const { sesion } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Guardamos la lista y los estados que se muestran mientras carga.
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    if (!sesion) {
      setCargando(false);
      return;
    }

    const controller = new AbortController();

    // Busca solo las conversaciones donde participa la cuenta actual.
    const cargarConversaciones = async () => {
      try {
        const conversacionesRecibidas = await listarConversaciones(
          sesion.access_token,
          controller.signal,
        );

        setConversaciones(conversacionesRecibidas);
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

    cargarConversaciones();

    return () => controller.abort();
  }, [sesion]));

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        backgroundColor: colors.reportListBackground,
        flexGrow: 1,
        paddingBottom: insets.bottom,
      }}>
      <StatusBar style="dark" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: colors.reportListBackground, height: insets.top }} />

      {/* Titulo de la pantalla */}
      <View
        style={{
          backgroundColor: colors.reportListBackground,
          paddingBottom: 20,
          paddingHorizontal: 24,
          paddingTop: 12,
        }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          <Image source={require('../../assets/images/logo-huellas-transparente.png')} contentFit="contain" style={{ height: 36, width: 36 }} />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Huellas a Casa</Text>
        </View>
        <Text selectable style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>
          Mensajes
        </Text>
      </View>

      {/* Lista de conversaciones */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {cargando ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text selectable style={{ color: colors.error }}>{error}</Text> : null}

        {!cargando && !error && conversaciones.length === 0 ? (
          <Text selectable style={{ color: colors.textSecondary, textAlign: 'center' }}>
            Aun no tenes conversaciones.
          </Text>
        ) : null}

        {conversaciones.map((conversacion) => {
          const nombreParticipante = conversacion.nombreOtroParticipante ?? 'Participante';
          const ultimoMensajeEsPropio = conversacion.idEmisorUltimoMensaje === sesion?.user.id;
          const textoUltimoMensaje = conversacion.ultimoMensaje
            ? `${ultimoMensajeEsPropio ? 'Tu: ' : ''}${conversacion.ultimoMensaje.replace(/\s*\r?\n\s*/g, ' ')}`
            : 'Conversacion por coincidencia';

          return (
            <Pressable
            key={conversacion.idCoincidencia}
            accessibilityLabel="Abrir conversacion"
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/conversaciones/[idCoincidencia]',
                params: {
                  idCoincidencia: conversacion.idCoincidencia,
                  nombre: nombreParticipante,
                },
              })
            }
            style={({ pressed }) => ({
              alignItems: 'center',
              flexDirection: 'row',
              gap: 12,
              opacity: pressed ? 0.7 : 1,
              paddingHorizontal: 4,
              minHeight: 80,
              paddingVertical: 14,
            })}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors.reportSummaryBackground,
                borderRadius: 24,
                height: 48,
                justifyContent: 'center',
                width: 48,
              }}>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>
                {obtenerIniciales(nombreParticipante)}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: 0, justifyContent: 'center' }}>
              <Text numberOfLines={1} selectable style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                {nombreParticipante}
              </Text>
              <VistaPrevia key={textoUltimoMensaje} texto={textoUltimoMensaje} />
            </View>
            <Text selectable style={{ color: colors.textSecondary, fontSize: 12 }}>
              {formatearFecha(conversacion.fechaUltimoMensaje ?? conversacion.fechaCreacion)}
            </Text>
            </Pressable>
          );
        })}
      </View>

    </ScrollView>
  );
}

function VistaPrevia({ texto }: { texto: string }) {
  const [ancho, setAncho] = useState(0);
  const [visible, setVisible] = useState(texto);
  const [medido, setMedido] = useState(false);

  // Al cambiar el mensaje o el ancho, volvemos a medir el texto completo.
  const prepararMedicion = (nuevoAncho: number) => {
    if (nuevoAncho !== ancho) {
      setAncho(nuevoAncho);
      setVisible(texto);
      setMedido(false);
    }
  };

  return (
    <View onLayout={(evento) => prepararMedicion(evento.nativeEvent.layout.width)} style={{ marginTop: 2, width: '100%' }}>
      <Text numberOfLines={1} style={{ color: colors.textSecondary, fontSize: 14 }}>
        {medido ? visible : texto}
      </Text>
      {ancho > 0 && !medido ? (
        <Text accessible={false} onTextLayout={(evento) => {
          const lineas = evento.nativeEvent.lines;
          if (lineas.length <= 1) {
            setMedido(true);
            return;
          }
          // Dejamos espacio para los puntos y quitamos los espacios sobrantes.
          const primero = lineas[0].text;
          const longitud = Math.max(0, Math.min(primero.length - 3, visible.length - 4));
          const siguiente = `${visible.slice(0, longitud).trimEnd()}...`;
          if (siguiente === visible) setMedido(true);
          else setVisible(siguiente);
        }} style={{ color: colors.textSecondary, fontSize: 14, left: 0, opacity: 0, position: 'absolute', top: 0, width: ancho }}>
          {visible}
        </Text>
      ) : null}
    </View>
  );
}

function formatearFecha(fechaHora: string) {
  const fecha = new Date(fechaHora);

  if (Number.isNaN(fecha.getTime())) {
    return 'fecha no disponible';
  }

  // Las conversaciones recientes muestran hora o «Ayer» para ubicarlas rapido.
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicioAyer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1);
  if (fecha >= inicioHoy && fecha <= hoy) {
    return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(fecha);
  }
  if (fecha >= inicioAyer && fecha < inicioHoy) return 'Ayer';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fecha);
}

// Usamos hasta dos letras aunque el nombre tenga espacios de mas.
function obtenerIniciales(nombre: string) {
  return nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((palabra) => palabra.charAt(0).toUpperCase()).join('') || 'P';
}
