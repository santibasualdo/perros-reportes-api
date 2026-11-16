import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { supabase, supabaseConfigurationError } from '@/lib/supabase';

export function LoginScreen() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cargandoSesion, sesion } = useAuth();
  const insets = useSafeAreaInsets();

  const iniciarSesion = async () => {
    if (!supabase) {
      setError(supabaseConfigurationError);
      return;
    }

    if (!correo.trim() || !contrasena) {
      setError('Ingresá tu correo y contraseña.');
      return;
    }

    setEnviando(true);
    setError(null);

    const { error: errorInicioSesion } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    });

    if (errorInicioSesion) {
      setError(errorInicioSesion.message);
    }

    setEnviando(false);
  };

  const cerrarSesion = async () => {
    if (!supabase) {
      return;
    }

    setEnviando(true);
    setError(null);

    const { error: errorCierreSesion } = await supabase.auth.signOut();

    if (errorCierreSesion) {
      setError(errorCierreSesion.message);
    }

    setEnviando(false);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: '#ffffff',
        paddingBottom: insets.bottom,
        paddingTop: insets.top,
      }}>
      <View
        style={{
          backgroundColor: '#ffffff',
          flex: 1,
        }}>
        <View
          style={{
            borderBottomColor: '#ded9ce',
            borderBottomWidth: 1,
            paddingHorizontal: 24,
            paddingBottom: 24,
            paddingTop: 32,
          }}>
          <Text selectable style={{ color: '#263238', fontSize: 20, fontWeight: '700' }}>
            Bienvenido
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end', padding: 24 }}>
          {cargandoSesion ? <ActivityIndicator color="#2f7383" /> : null}

          {!cargandoSesion && !supabase ? (
            <Text selectable style={{ color: '#b3261e', lineHeight: 24 }}>
              {supabaseConfigurationError}
            </Text>
          ) : null}

          {!cargandoSesion && supabase && !sesion ? (
            <View style={{ gap: 12 }}>
              <TextInput
                accessibilityLabel="Correo electrónico"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setCorreo}
                placeholder="Email"
                placeholderTextColor="#7a7a7a"
                style={{
                  borderColor: '#ded9ce',
                  borderRadius: 10,
                  borderWidth: 1,
                  fontSize: 16,
                  padding: 12,
                }}
                textContentType="emailAddress"
                value={correo}
              />
              <TextInput
                accessibilityLabel="Contraseña"
                autoComplete="password"
                onChangeText={setContrasena}
                placeholder="Contraseña"
                placeholderTextColor="#7a7a7a"
                secureTextEntry
                style={{
                  borderColor: '#ded9ce',
                  borderRadius: 10,
                  borderWidth: 1,
                  fontSize: 16,
                  padding: 12,
                }}
                textContentType="password"
                value={contrasena}
              />
              <Pressable
                accessibilityRole="button"
                disabled={enviando}
                onPress={iniciarSesion}
                style={{
                  alignItems: 'center',
                  backgroundColor: enviando ? '#8aaeb5' : '#2f7383',
                  borderRadius: 10,
                  padding: 13,
                }}>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                  {enviando ? 'Ingresando...' : 'Ingresar'}
                </Text>
              </Pressable>

              <Link href="/registro" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={{
                    alignItems: 'center',
                    borderColor: '#2f7383',
                    borderRadius: 10,
                    borderWidth: 1,
                    padding: 13,
                  }}>
                  <Text style={{ color: '#2f7383', fontSize: 16, fontWeight: '600' }}>
                    Crear cuenta
                  </Text>
                </Pressable>
              </Link>
            </View>
          ) : null}

          {!cargandoSesion && sesion ? (
            <View style={{ gap: 12 }}>
              <Text selectable style={{ color: '#263238', lineHeight: 24 }}>
                Sesión iniciada: {sesion.user.email}
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={enviando}
                onPress={cerrarSesion}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#b3261e',
                  borderRadius: 10,
                  padding: 13,
                }}>
                <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                  Cerrar sesión
                </Text>
              </Pressable>
            </View>
          ) : null}

          {error ? (
            <Text selectable style={{ color: '#b3261e', lineHeight: 22, marginTop: 12 }}>
              {error}
            </Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
