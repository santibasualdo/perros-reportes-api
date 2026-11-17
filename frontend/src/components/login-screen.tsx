import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
      }}>
      <StatusBar style="light" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: '#183B56', height: insets.top }} />
      <View
        style={{
          backgroundColor: '#ffffff',
          flex: 1,
        }}>
        {/* Titulo de bienvenida */}
        <View
          style={{
            borderBottomColor: '#DCE3E6',
            borderBottomWidth: 1,
            paddingHorizontal: 24,
            paddingBottom: 24,
            paddingTop: 32,
          }}>
          <Text selectable style={{ color: '#183B56', fontSize: 20, fontWeight: '700' }}>
            Bienvenido
          </Text>
        </View>

        {/* Formulario de inicio de sesion */}
        <View style={{ flex: 1, justifyContent: 'flex-end', padding: 24 }}>
          {/* Cargando la sesion guardada */}
          {cargandoSesion ? <ActivityIndicator color="#183B56" /> : null}

          {!cargandoSesion && !supabase ? (
            <Text selectable style={{ color: '#b3261e', lineHeight: 24 }}>
              {supabaseConfigurationError}
            </Text>
          ) : null}

          {/* Se muestra cuando no hay una sesion */}
          {!cargandoSesion && supabase && !sesion ? (
            <View style={{ gap: 12 }}>
              <TextInput
                accessibilityLabel="Correo electrónico"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setCorreo}
                placeholder="Email"
                placeholderTextColor="#5A6E7C"
                style={{
                  borderColor: '#DCE3E6',
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
                placeholderTextColor="#5A6E7C"
                secureTextEntry
                style={{
                  borderColor: '#DCE3E6',
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
                  backgroundColor: enviando ? '#DCEAF0' : '#E9826B',
                  borderRadius: 10,
                  padding: 13,
                }}>
                <Text style={{ color: '#07182A', fontSize: 16, fontWeight: '600' }}>
                  {enviando ? 'Ingresando...' : 'Ingresar'}
                </Text>
              </Pressable>

              <Link href="/registro" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={{
                    alignItems: 'center',
                    borderColor: '#183B56',
                    borderRadius: 10,
                    borderWidth: 1,
                    padding: 13,
                  }}>
                  <Text style={{ color: '#183B56', fontSize: 16, fontWeight: '600' }}>
                    Crear cuenta
                  </Text>
                </Pressable>
              </Link>
            </View>
          ) : null}

          {/* Se muestra cuando ya hay una sesion */}
          {!cargandoSesion && sesion ? (
            <View style={{ gap: 12 }}>
              <Text selectable style={{ color: '#183B56', lineHeight: 24 }}>
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

          {/* Mensaje de error */}
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
