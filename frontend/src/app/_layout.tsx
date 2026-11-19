
import { NavigationBar } from 'expo-navigation-bar';
import { Stack } from 'expo-router/stack';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  useEffect(() => {
    const clienteSupabase = supabase;

    if (!clienteSupabase) {
      return;
    }

    // Renueva el token mientras la app esta abierta y lo pausa en segundo plano.
    const actualizarRenovacion = (estado: AppStateStatus) => {
      if (estado === 'active') {
        clienteSupabase.auth.startAutoRefresh();
      } else {
        clienteSupabase.auth.stopAutoRefresh();
      }
    };

    if (AppState.currentState === 'active') {
      clienteSupabase.auth.startAutoRefresh();
    } else {
      clienteSupabase.auth.stopAutoRefresh();
    }

    const suscripcion = AppState.addEventListener('change', actualizarRenovacion);

    return () => {
      suscripcion.remove();
      clienteSupabase.auth.stopAutoRefresh();
    };
  }, []);

  return (
    // Estos proveedores dejan disponibles los bordes seguros y la sesion en toda la app.
    <SafeAreaProvider>
      {/* Controles oscuros sobre la barra de navegacion clara de Android */}
      <NavigationBar style="light" />
      <AuthProvider>
        {/* Lista de pantallas y navegacion principal */}
        <Stack screenOptions={{ animation: 'none' }}>
          <Stack.Screen name="(principal)" options={{ headerShown: false }} />
          <Stack.Screen name="registro" options={{ animation: 'fade', headerShown: false }} />
          <Stack.Screen
            name="coincidencias/[idReporte]"
            options={{ animation: 'fade', animationMatchesGesture: true, headerShown: false }}
          />
          <Stack.Screen
            name="conversaciones/[idCoincidencia]"
            options={{ animation: 'fade', animationMatchesGesture: true, headerShown: false }}
          />
          <Stack.Screen name="reportes/nuevo" options={{ headerShown: false }} />
          <Stack.Screen
            name="reportes/[idReporte]"
            options={{ animation: 'fade', animationMatchesGesture: true, headerShown: false }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
