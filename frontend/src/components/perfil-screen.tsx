import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraNavegacion } from '@/components/barra-navegacion';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';

export function PerfilScreen() {
  const { sesion } = useAuth();
  const insets = useSafeAreaInsets();
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrarSesion = async () => {
    if (!supabase) {
      setError('Supabase no está configurado.');
      return;
    }

    setCerrandoSesion(true);
    setError(null);

    try {
      const { error: errorCierreSesion } = await supabase.auth.signOut();

      if (errorCierreSesion) {
        setError(errorCierreSesion.message);
      }
    } catch {
      setError('No se pudo cerrar la sesión. Intentá nuevamente.');
    } finally {
      setCerrandoSesion(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        backgroundColor: '#ffffff',
        flexGrow: 1,
        paddingBottom: insets.bottom,
      }}>
      <StatusBar style="light" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: '#183B56', height: insets.top }} />
      <View style={{ backgroundColor: '#ffffff', flex: 1 }}>
        {/* Titulo de la pantalla */}
        <View
          style={{
            borderBottomColor: '#DCE3E6',
            borderBottomWidth: 1,
            paddingBottom: 24,
            paddingHorizontal: 24,
            paddingTop: 32,
          }}>
          <Text selectable style={{ color: '#183B56', fontSize: 20, fontWeight: '700' }}>
            Perfil
          </Text>
        </View>

        {/* Datos de la cuenta y boton para cerrar sesion */}
        <View style={{ flex: 1, padding: 24 }}>
          <Text style={{ color: '#5A6E7C', fontSize: 14, marginBottom: 6 }}>Correo</Text>
          <Text selectable style={{ color: '#183B56', fontSize: 17, marginBottom: 32 }}>
            {sesion?.user.email ?? 'Correo no disponible'}
          </Text>

          {error ? (
            <Text selectable style={{ color: '#b3261e', fontSize: 14, marginBottom: 16 }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={cerrandoSesion}
            onPress={cerrarSesion}
            style={{
              alignItems: 'center',
              backgroundColor: cerrandoSesion ? '#a6b9bd' : '#183B56',
              borderRadius: 10,
              paddingVertical: 14,
            }}>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
              {cerrandoSesion ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </Text>
          </Pressable>
        </View>

        {/* Barra de navegacion con perfil seleccionado */}
        <BarraNavegacion seccionActiva="perfil" />
      </View>
    </ScrollView>
  );
}
