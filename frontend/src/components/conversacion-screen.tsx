// Iconos del encabezado y del boton para enviar.
import { ArrowLeftIcon, PaperPlaneRightIcon } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Fragment, type ComponentRef, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
  // Bajamos al final cuando llegan los mensajes iniciales o enviamos uno nuevo.
  const listaRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const bajarAlFinal = useRef(false);
  // Datos del chat y estado del mensaje que se esta escribiendo.
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [contenido, setContenido] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const nombreParticipante =
    nombreOtroParticipante ??
    mensajes.find((mensaje) => mensaje.idUsuario !== sesion?.user.id)?.nombreUsuario ??
    'Conversacion';

  useEffect(() => {
    // Al abrir el teclado dejamos visible el mensaje mas reciente.
    const mostrar = Keyboard.addListener('keyboardDidShow', () => {
      setTecladoVisible(true);
      requestAnimationFrame(() => listaRef.current?.scrollToEnd({ animated: false }));
    });
    const ocultar = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));
    return () => { mostrar.remove(); ocultar.remove(); };
  }, []);

  useEffect(() => {
    if (!sesion) {
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

        bajarAlFinal.current = true;
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

      bajarAlFinal.current = true;
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ backgroundColor: colors.reportListBackground, flex: 1 }}>
      <StatusBar style="dark" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: colors.reportListBackground, height: insets.top }} />

      {/* Cabecera de la conversacion */}
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.reportListBackground,
          borderBottomColor: colors.reportCardBorder,
          borderBottomWidth: 1,
          flexDirection: 'row',
          gap: 12,
          paddingBottom: 12,
          paddingHorizontal: 16,
          paddingTop: 12,
        }}>
        <Pressable
          accessibilityLabel="Volver a la pantalla anterior"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={{ alignItems: 'center', backgroundColor: colors.reportSummaryBackground, borderRadius: 24, height: 48, justifyContent: 'center', width: 48 }}>
          <ArrowLeftIcon size={22} color={colors.primary} />
        </Pressable>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: colors.action,
            borderRadius: 24,
            height: 48,
            justifyContent: 'center',
            width: 48,
          }}>
          <Text style={{ color: colors.onAction, fontSize: 16, fontWeight: '700' }}>
            {obtenerIniciales(nombreParticipante)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} selectable style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>
            {nombreParticipante}
          </Text>
        </View>
      </View>

      {/* Solo los mensajes se desplazan; la cabecera y el campo quedan fijos. */}
      <ScrollView
        ref={listaRef}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (bajarAlFinal.current) {
            bajarAlFinal.current = false;
            // Esperamos a que la lista termine de acomodar los mensajes.
            requestAnimationFrame(() => listaRef.current?.scrollToEnd({ animated: false }));
          }
        }}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: tecladoVisible ? 1 : undefined, gap: 12, justifyContent: tecladoVisible ? 'flex-end' : undefined, padding: 20 }}>
        {cargando && sesion ? <ActivityIndicator color={colors.primary} /> : null}

        {error ? <Text selectable style={{ color: colors.error }}>{error}</Text> : null}

        {mensajes.map((mensaje, indice) => {
          const esPropio = mensaje.idUsuario === sesion?.user.id;
          const diaActual = obtenerDia(mensaje.fechaHora);
          const diaAnterior = indice > 0 ? obtenerDia(mensajes[indice - 1].fechaHora) : null;

          return (
            <Fragment key={mensaje.idMensaje}>
            {diaActual !== diaAnterior ? (
              <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10, marginVertical: 6 }}>
                <View style={{ backgroundColor: colors.reportCardBorder, flex: 1, height: 1 }} />
                <Text style={{ backgroundColor: colors.reportSummaryBackground, borderRadius: 14, color: colors.text, fontSize: 12, overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 6 }}>
                  {formatearDia(mensaje.fechaHora)}
                </Text>
                <View style={{ backgroundColor: colors.reportCardBorder, flex: 1, height: 1 }} />
              </View>
            ) : null}
            <View
              style={{
                alignSelf: esPropio ? 'flex-end' : 'flex-start',
                backgroundColor: esPropio ? colors.reportDetailSectionHeader : colors.reportCardBackground,
                borderColor: colors.reportCardBorder,
                borderRadius: 18,
                borderWidth: esPropio ? 0 : 1,
                maxWidth: '80%',
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}>
              <Text selectable style={{ color: colors.text, fontSize: 16 }}>
                {mensaje.contenido}
              </Text>
              <Text
                selectable
                style={{
                  alignSelf: 'flex-end',
                  color: colors.textSecondary,
                  fontSize: 12,
                  marginTop: 4,
                }}>
                {`${formatearHora(mensaje.fechaHora)}${esPropio ? mensaje.leido ? ' · Leído' : ' · Enviado' : ''}`}
              </Text>
            </View>
            </Fragment>
          );
        })}
      </ScrollView>

      {/* Barra para escribir al final del chat */}
      <View
        style={{
          backgroundColor: colors.reportListBackground,
          borderTopColor: colors.reportCardBorder,
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
          placeholder="Escribí un mensaje"
          placeholderTextColor={colors.textSecondary}
          style={{
            backgroundColor: colors.reportCardBackground,
            borderColor: colors.reportCardBorder,
            borderRadius: 24,
            borderWidth: 1,
            color: colors.text,
            flex: 1,
            maxHeight: 100,
            minHeight: 48,
            paddingLeft: 20,
            paddingRight: 12,
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
          <PaperPlaneRightIcon size={23} color={colors.onAction} weight="fill" />
        </Pressable>
      </View>

    </KeyboardAvoidingView>
  );
}

// Si no hay foto de perfil, identificamos a la persona con sus iniciales.
function obtenerIniciales(nombre: string) {
  return nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((palabra) => palabra.charAt(0).toUpperCase()).join('') || 'C';
}

function obtenerDia(fechaHora: string) {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) {
    return 'invalida';
  }
  return `${fecha.getFullYear()}-${fecha.getMonth()}-${fecha.getDate()}`;
}

function formatearDia(fechaHora: string) {
  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha no disponible';
  }

  const hoy = new Date();
  const ayer = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1);
  if (obtenerDia(fechaHora) === obtenerDia(hoy.toISOString())) return 'Hoy';
  if (obtenerDia(fechaHora) === obtenerDia(ayer.toISOString())) return 'Ayer';

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    ...(fecha.getFullYear() !== hoy.getFullYear() ? { year: 'numeric' } : {}),
  }).format(fecha);
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
