import ArrowBackIcon from '@expo/material-symbols/arrow_back.xml';
import SendIcon from '@expo/material-symbols/send.xml';
import { Host, Icon } from '@expo/ui/jetpack-compose';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { colors } from '@/constants/colors';
import {
  enviarMensaje,
  listarMensajes,
  marcarMensajesLeidos,
  type Mensaje,
} from '@/lib/api';

type ConversacionScreenProps = {
  idCoincidencia: string;
  nombreOtroParticipante?: string;
};

export function ConversacionScreen({
  idCoincidencia,
  nombreOtroParticipante,
}: ConversacionScreenProps) {
  const { sesion } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [contenido, setContenido] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nombreParticipante =
    nombreOtroParticipante ??
    mensajes.find((mensaje) => mensaje.idUsuario !== sesion?.user.id)?.nombreUsuario ??
    'Conversacion';

  useEffect(() => {
    if (!sesion) {
      setCargando(false);
      return;
    }

    const controller = new AbortController();

    // Trae los mensajes ordenados desde el mas antiguo al mas reciente.
    const cargarMensajes = async () => {
      try {
        const mensajesRecibidos = await listarMensajes(
          idCoincidencia,
          sesion.access_token,
          controller.signal,
        );

        setMensajes(mensajesRecibidos);
        setError(null);

        // Al abrir, deja como leidos solamente los mensajes del otro participante.
        await marcarMensajesLeidos(idCoincidencia, sesion.access_token, controller.signal);
        setMensajes((mensajesActuales) =>
          mensajesActuales.map((mensaje) =>
            mensaje.idUsuario === sesion.user.id ? mensaje : { ...mensaje, leido: true },
          ),
        );
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

    cargarMensajes();

    return () => controller.abort();
  }, [idCoincidencia, sesion]);

  const manejarEnvio = async () => {
    if (!sesion) {
      return;
    }

    const contenidoLimpio = contenido.trim();

    if (!contenidoLimpio) {
      setError('Escribi un mensaje antes de enviarlo.');
      return;
    }

    try {
      setEnviando(true);

      const mensajeNuevo = await enviarMensaje(
        idCoincidencia,
        contenidoLimpio,
        sesion.access_token,
      );

      setMensajes((mensajesActuales) => [...mensajesActuales, mensajeNuevo]);
      setContenido('');
      setError(null);
    } catch (errorEnvio) {
      setError(errorEnvio instanceof Error ? errorEnvio.message : 'No se pudo enviar el mensaje.');
    } finally {
      setEnviando(false);
    }
  };

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

      {/* Cabecera de la conversacion */}
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          borderBottomWidth: 1,
          flexDirection: 'row',
          gap: 12,
          paddingBottom: 20,
          paddingHorizontal: 24,
          paddingTop: 24,
        }}>
        <Pressable
          accessibilityLabel="Volver a la coincidencia"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={{ alignItems: 'center', height: 36, justifyContent: 'center', width: 28 }}>
          <Host matchContents>
            <Icon contentDescription="Volver" size={22} source={ArrowBackIcon} tint={colors.primary} />
          </Host>
        </Pressable>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.tagBackground,
            borderRadius: 20,
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}>
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>
            {nombreParticipante.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text selectable style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>
            {nombreParticipante}
          </Text>
          <Text selectable style={{ color: colors.textSecondary, fontSize: 12 }}>
            Coincidencia confirmada
          </Text>
        </View>
      </View>

      {/* Mensajes de la conversacion */}
      <View style={{ flex: 1, gap: 12, padding: 20 }}>
        {cargando ? <ActivityIndicator color={colors.primary} /> : null}

        {error ? <Text selectable style={{ color: colors.lostText }}>{error}</Text> : null}

        {mensajes.map((mensaje) => {
          const esPropio = mensaje.idUsuario === sesion?.user.id;

          return (
            <View
              key={mensaje.idMensaje}
              style={{
                alignSelf: esPropio ? 'flex-end' : 'flex-start',
                backgroundColor: esPropio ? colors.primary : colors.tagBackground,
                borderColor: esPropio ? colors.primary : colors.border,
                borderRadius: 18,
                borderWidth: esPropio ? 0 : 1,
                maxWidth: '80%',
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text selectable style={{ color: esPropio ? colors.surface : colors.text, fontSize: 16 }}>
                {mensaje.contenido}
              </Text>
              <Text
                selectable
                style={{
                  color: esPropio ? colors.surface : colors.textSecondary,
                  fontSize: 12,
                  marginTop: 4,
                }}>
                {`${mensaje.leido ? 'Leido' : 'Enviado'} - ${formatearHora(mensaje.fechaHora)}`}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Barra para escribir al final del chat */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          flexDirection: 'row',
          gap: 10,
          paddingBottom: Math.max(insets.bottom, 16),
          paddingHorizontal: 16,
          paddingTop: 12,
        }}>
        <TextInput
          accessibilityLabel="Contenido del mensaje"
          editable={!enviando}
          maxLength={200}
          multiline
          onChangeText={setContenido}
          placeholder="Escribi un mensaje..."
          placeholderTextColor={colors.textSecondary}
          style={{
            borderColor: colors.border,
            borderRadius: 24,
            borderWidth: 1,
            color: colors.text,
            flex: 1,
            maxHeight: 100,
            minHeight: 48,
            paddingHorizontal: 12,
          }}
          value={contenido}
        />
        <Pressable
          accessibilityLabel="Enviar mensaje"
          accessibilityRole="button"
          disabled={enviando}
          onPress={manejarEnvio}
          style={{
            alignItems: 'center',
            alignSelf: 'flex-end',
            backgroundColor: colors.action,
            borderRadius: 26,
            justifyContent: 'center',
            height: 52,
            opacity: enviando ? 0.6 : 1,
            width: 52,
          }}>
          <Host matchContents>
            <Icon
              contentDescription={enviando ? 'Enviando mensaje' : 'Enviar mensaje'}
              size={23}
              source={SendIcon}
              tint={colors.onAction}
            />
          </Host>
        </Pressable>
      </View>

    </ScrollView>
  );
}

function formatearHora(fechaHora: string) {
  const fecha = new Date(fechaHora);

  if (Number.isNaN(fecha.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
}
