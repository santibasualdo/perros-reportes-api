import { useRouter } from 'expo-router';
import { ChatCircleIcon, FileTextIcon, MapPinIcon, PlusIcon, UserIcon } from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, View } from 'react-native';
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
const TAMANO_INDICADOR = 40;
const ESPACIO_LATERAL = 8;
const ESPACIO_VERTICAL = 8;
const ALTO_OPCION = 52;

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

    const destino = centroActivo - TAMANO_INDICADOR / 2;
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

  const abrirCrearReporte = () => {
    if (seccionActiva === 'crear') {
      return;
    }

    router.push('/reportes/nuevo');
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
                borderRadius: 20,
                height: TAMANO_INDICADOR,
                left: 0,
                position: 'absolute',
                top: ESPACIO_VERTICAL + (ALTO_OPCION - TAMANO_INDICADOR) / 2,
                width: TAMANO_INDICADOR,
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

        <BotonCrear activo={seccionActiva === 'crear'} onPress={abrirCrearReporte} />

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
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => {
        if (!movimientoReducido) {
          actualizarEscala(0.97);
        }
      }}
      onPressOut={() => actualizarEscala(1)}
      onLayout={onLayout}
      pressRetentionOffset={16}
      style={{ alignItems: 'center', flex: 1, height: ALTO_OPCION, justifyContent: 'center' }}>
      <Animated.View style={[{ alignItems: 'center', height: 40, justifyContent: 'center', width: 40 }, estiloPresion]}>
        {/* Usamos el mismo grosor en todas las secciones. */}
        <Icono size={26} weight="regular" color={activa ? colors.surface : colors.textSecondary} />
      </Animated.View>
    </Pressable>
  );
}

function BotonCrear({ activo, onPress }: { activo: boolean; onPress: () => void }) {
  const movimientoReducido = useReducedMotion();
  const escala = useSharedValue(1);
  const estiloPresion = useAnimatedStyle(() => ({ transform: [{ translateY: -16 }, { scale: escala.get() }] }));

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
      accessibilityLabel="Crear reporte"
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => {
        if (!movimientoReducido) {
          actualizarEscala(0.97);
        }
      }}
      onPressOut={() => actualizarEscala(1)}
      pressRetentionOffset={16}
      style={{ alignItems: 'center', flex: 1, height: ALTO_OPCION, justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            alignItems: 'center',
            backgroundColor: activo ? colors.primary : colors.action,
            borderColor: colors.reportListBackground,
            borderRadius: 32,
            borderWidth: 4,
            height: 60,
            justifyContent: 'center',
            width: 60,
          },
          estiloPresion,
        ]}>
        <PlusIcon size={32} weight="regular" color={colors.onAction} />
      </Animated.View>
    </Pressable>
  );
}


