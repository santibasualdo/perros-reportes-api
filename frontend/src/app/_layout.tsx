
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
    <SafeAreaProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="registro" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
