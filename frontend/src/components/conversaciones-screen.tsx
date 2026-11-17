import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraNavegacion } from '@/components/barra-navegacion';
import { useAuth } from '@/components/auth-provider';
import { colors } from '@/constants/colors';
import { listarConversaciones, type Conversacion } from '@/lib/api';

export function ConversacionesScreen() {
  const { sesion } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [sesion]);

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
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          paddingBottom: 20,
          paddingHorizontal: 24,
          paddingTop: 24,
        }}>
        <Text selectable style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>
          Mensajes
        </Text>
      </View>

      {/* Lista de conversaciones */}
      <View style={{ flex: 1, gap: 12, padding: 20 }}>
        {cargando ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text selectable style={{ color: colors.lostText }}>{error}</Text> : null}

        {!cargando && !error && conversaciones.length === 0 ? (
          <Text selectable style={{ color: colors.textSecondary, textAlign: 'center' }}>
            Aun no tenes conversaciones.
          </Text>
        ) : null}

        {conversaciones.map((conversacion) => {
          const nombreParticipante = conversacion.nombreOtroParticipante ?? 'Participante';
          const ultimoMensajeEsPropio = conversacion.idEmisorUltimoMensaje === sesion?.user.id;
          const textoUltimoMensaje = conversacion.ultimoMensaje
            ? `${ultimoMensajeEsPropio ? 'Tu: ' : ''}${conversacion.ultimoMensaje}`
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
            style={{
              borderColor: colors.border,
              borderBottomWidth: 1,
              flexDirection: 'row',
              gap: 12,
              paddingHorizontal: 4,
              paddingVertical: 14,
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: colors.tagBackground,
                borderRadius: 24,
                height: 48,
                justifyContent: 'center',
                width: 48,
              }}>
              <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '700' }}>
                {nombreParticipante.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text selectable style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                {nombreParticipante}
              </Text>
              <Text
                numberOfLines={1}
                selectable
                style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>
                {textoUltimoMensaje}
              </Text>
            </View>
            <Text selectable style={{ color: colors.textSecondary, fontSize: 12 }}>
              {formatearFecha(conversacion.fechaUltimoMensaje ?? conversacion.fechaCreacion)}
            </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Barra de navegacion con mensajes seleccionado */}
      <BarraNavegacion seccionActiva="mensajes" />
    </ScrollView>
  );
}

function formatearFecha(fechaHora: string) {
  const fecha = new Date(fechaHora);

  if (Number.isNaN(fecha.getTime())) {
    return 'fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(fecha);
}
