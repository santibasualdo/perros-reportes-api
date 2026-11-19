import { useRouter } from 'expo-router';
import { ChatCircleIcon, FileTextIcon, MapPinIcon, UserIcon } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/constants/colors';

type SeccionActiva = 'inicio' | 'coincidencias' | 'crear' | 'mensajes' | 'perfil';
type SeccionPrincipal = Exclude<SeccionActiva, 'crear'>;
type RutaPrincipal = '/' | '/coincidencias' | '/conversaciones' | '/perfil';

type BarraNavegacionProps = {
  seccionActiva: SeccionActiva;
  onNavegar?: (seccion: SeccionPrincipal) => void;
};

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
const DURACION_INDICADOR = 200;
const DURACION_PRESION = 120;
const ANCHO_INDICADOR = 52;
const ALTO_INDICADOR = 34;
const ESPACIO_LATERAL = 8;
const ESPACIO_VERTICAL = 8;
const ALTO_OPCION = 64;

export function BarraNavegacion({ seccionActiva, onNavegar }: BarraNavegacionProps) {
  const router = useRouter();
  const movimientoReducido = useReducedMotion();
  const [centrosSecciones, setCentrosSecciones] = useState<Partial<Record<SeccionPrincipal, number>>>({});
  const indicadorInicializado = useRef(false);
  const posicionIndicador = useSharedValue(0);

  useEffect(() => {
    if (seccionActiva === 'crear') {
      return;
    }

    const centroActivo = centrosSecciones[seccionActiva];

    if (centroActivo === undefined) {
      return;
    }

    const destino = centroActivo - ANCHO_INDICADOR / 2;
    posicionIndicador.set(indicadorInicializado.current && !movimientoReducido
      ? withTiming(destino, { duration: DURACION_INDICADOR, easing: EASE_IN_OUT, reduceMotion: ReduceMotion.System })
      : destino);
    indicadorInicializado.current = true;
  }, [centrosSecciones, movimientoReducido, posicionIndicador, seccionActiva]);

  const estiloIndicador = useAnimatedStyle(() => ({
    transform: [{ translateX: posicionIndicador.get() }],
  }));

  const registrarCentro = (seccion: SeccionPrincipal, evento: LayoutChangeEvent) => {
    const { width, x } = evento.nativeEvent.layout;
    const centro = x + width / 2;

    setCentrosSecciones((centrosActuales) =>
      centrosActuales[seccion] === centro
        ? centrosActuales
        : { ...centrosActuales, [seccion]: centro },
    );
  };

  const navegarASeccion = (ruta: RutaPrincipal, seccionDestino: SeccionPrincipal) => {
    if (seccionDestino === seccionActiva) {
      return;
    }

    if (onNavegar) {
      onNavegar(seccionDestino);
    } else {
      router.replace(ruta);
    }
  };

  return (
    <View style={{ alignItems: 'center', backgroundColor: colors.reportListBackground, borderColor: colors.reportCardBorder, borderTopWidth: 1 }}>
      {/* Barra fija con el circulo que indica la seccion abierta */}
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.reportListBackground,
          borderColor: colors.reportCardBorder,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          flexDirection: 'row',
          paddingHorizontal: ESPACIO_LATERAL,
          paddingVertical: ESPACIO_VERTICAL,
          width: '100%',
        }}>
        {seccionActiva !== 'crear' ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                backgroundColor: colors.action,
                borderRadius: 12,
                height: ALTO_INDICADOR,
                left: 0,
                position: 'absolute',
                top: ESPACIO_VERTICAL + 4,
                width: ANCHO_INDICADOR,
              },
              estiloIndicador,
            ]}
          />
        ) : null}

        <OpcionNavegacion
          activa={seccionActiva === 'inicio'}
          ajusteHorizontal={1}
          etiqueta="Inicio"
          icono={MapPinIcon}
          onLayout={(evento) => registrarCentro('inicio', evento)}
          onPress={() => navegarASeccion('/', 'inicio')}
        />
        <OpcionNavegacion
          activa={seccionActiva === 'coincidencias'}
          ajusteHorizontal={1}
          etiqueta="Coincidencias"
          icono={FileTextIcon}
          onLayout={(evento) => registrarCentro('coincidencias', evento)}
          onPress={() => navegarASeccion('/coincidencias', 'coincidencias')}
        />

        <OpcionNavegacion
          activa={seccionActiva === 'mensajes'}
          ajusteHorizontal={1}
          etiqueta="Mensajes"
          icono={ChatCircleIcon}
          onLayout={(evento) => registrarCentro('mensajes', evento)}
          onPress={() => navegarASeccion('/conversaciones', 'mensajes')}
        />
        <OpcionNavegacion
          activa={seccionActiva === 'perfil'}
          ajusteHorizontal={1}
          etiqueta="Perfil"
          icono={UserIcon}
          onLayout={(evento) => registrarCentro('perfil', evento)}
          onPress={() => navegarASeccion('/perfil', 'perfil')}
        />
      </View>
    </View>
  );
}

function OpcionNavegacion({
  activa,
  ajusteHorizontal = 0,
  etiqueta,
  icono: Icono,
  onLayout,
  onPress,
}: {
  activa: boolean;
  ajusteHorizontal?: number;
  etiqueta: string;
  icono: typeof MapPinIcon;
  onLayout: (evento: LayoutChangeEvent) => void;
  onPress: () => void;
}) {
  const movimientoReducido = useReducedMotion();
  const escala = useSharedValue(1);
  const estiloPresion = useAnimatedStyle(() => ({
    transform: [{ translateX: ajusteHorizontal }, { scale: escala.get() }],
  }));

  const actualizarEscala = (destino: number) => {
    escala.set(
      withTiming(destino, {
        duration: DURACION_PRESION,
        easing: EASE_OUT,
        reduceMotion: ReduceMotion.System,
      }),
    );
  };

  return (
    <Pressable
      accessibilityLabel={etiqueta}
      accessibilityRole="tab"
      accessibilityState={{ selected: activa }}
      onPress={onPress}
      onPressIn={() => {
        if (!movimientoReducido) {
          actualizarEscala(0.97);
        }
      }}
      onPressOut={() => actualizarEscala(1)}
      onLayout={onLayout}
      pressRetentionOffset={16}
      style={{ alignItems: 'center', flex: 1, minHeight: ALTO_OPCION, minWidth: 44, paddingTop: 4 }}>
      <Animated.View style={[{ alignItems: 'center', height: ALTO_INDICADOR, justifyContent: 'center', width: ANCHO_INDICADOR }, estiloPresion]}>
        {/* La seccion activa tambien se reconoce por el icono relleno. */}
        <Icono size={24} weight={activa ? 'fill' : 'regular'} color={activa ? colors.surface : colors.textSecondary} />
      </Animated.View>
      <Text numberOfLines={1} style={{ color: activa ? colors.action : colors.textSecondary, fontSize: 11, fontWeight: activa ? '700' : '400', marginTop: 3 }}>
        {etiqueta}
      </Text>
    </Pressable>
  );
}

