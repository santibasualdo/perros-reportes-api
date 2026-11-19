import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { BarraNavegacion } from '@/components/barra-navegacion';
import { colors } from '@/constants/colors';

export default function NavegacionPrincipal() {
  const { sesion } = useAuth();
  const insets = useSafeAreaInsets();

  return (
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
          <View style={{ backgroundColor: colors.reportListBackground, paddingBottom: insets.bottom }}>
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
  );
}
