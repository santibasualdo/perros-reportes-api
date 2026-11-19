import { Tabs, useRouter } from 'expo-router';
import { PlusIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { BarraNavegacion } from '@/components/barra-navegacion';
import { colors } from '@/constants/colors';

export default function NavegacionPrincipal() {
  const { sesion } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [alturaBarra, setAlturaBarra] = useState(80 + insets.bottom);
  const [tecladoVisible, setTecladoVisible] = useState(false);

  useEffect(() => {
    const mostrar = Keyboard.addListener('keyboardDidShow', () => setTecladoVisible(true));
    const ocultar = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));
    return () => { mostrar.remove(); ocultar.remove(); };
  }, []);

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{ headerShown: false, animation: 'none' }}
      tabBar={({ state, navigateToTab }) => {
        if (!sesion) return null;

        const secciones = {
          index: 'inicio',
          coincidencias: 'coincidencias',
          conversaciones: 'mensajes',
          perfil: 'perfil',
        } as const;
        const rutaActiva = state.routes[state.index].name as keyof typeof secciones;

        return (
          <View onLayout={(evento) => setAlturaBarra(evento.nativeEvent.layout.height)} style={{ backgroundColor: colors.reportListBackground, paddingBottom: insets.bottom }}>
            <BarraNavegacion
              seccionActiva={secciones[rutaActiva]}
              onNavegar={(seccion) => {
                const ruta = state.routes.find((item) => secciones[item.name as keyof typeof secciones] === seccion);
                if (ruta) navigateToTab(ruta.key);
              }}
            />
          </View>
        );
      }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="coincidencias" />
      <Tabs.Screen name="conversaciones" />
      <Tabs.Screen name="perfil" />
    </Tabs>
    {/* El boton queda separado de la barra y acompaña su altura. */}
    {sesion && !tecladoVisible ? (
      <Pressable
        accessibilityLabel="Crear reporte"
        accessibilityRole="button"
        onPress={() => router.push('/reportes/nuevo')}
        style={({ pressed }) => ({
          alignItems: 'center',
          backgroundColor: colors.action,
          borderRadius: 18,
          bottom: alturaBarra + 12,
          elevation: 5,
          height: 56,
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
          position: 'absolute',
          right: 20,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          width: 56,
        })}>
        <PlusIcon size={24} weight="bold" color={colors.onAction} />
      </Pressable>
    ) : null}
    </View>
  );
}
