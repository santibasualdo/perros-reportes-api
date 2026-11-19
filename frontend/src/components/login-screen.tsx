import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { colors } from '@/constants/colors';
import { supabase, supabaseConfigurationError } from '@/lib/supabase';

export function LoginScreen() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const { cargandoSesion, sesion } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const mostrar = Keyboard.addListener('keyboardDidShow', () => setTecladoVisible(true));
    const ocultar = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));
    return () => {
      mostrar.remove();
      ocultar.remove();
    };
  }, []);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}>
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: colors.background,
        paddingBottom: insets.bottom,
      }}>
      <StatusBar style="dark" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: colors.background, height: insets.top }} />
      <View
        style={{
          backgroundColor: colors.background,
          flex: 1,
        }}>
        {/* Titulo de bienvenida */}
        <View
          style={{
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingBottom: tecladoVisible ? 0 : 16,
            paddingTop: tecladoVisible ? 12 : 20,
          }}>
          {!tecladoVisible ? <Text selectable style={{ color: '#183B56', fontSize: 20, fontWeight: '700' }}>
            Huellas a Casa
          </Text> : null}
          <View style={{ alignItems: 'center', height: 165, justifyContent: 'center', marginTop: tecladoVisible ? 8 : 16, width: '100%' }}>
            <Image source={require('../../assets/images/logo-huellas.png')} contentFit="contain" style={{ height: 165, width: 165 }} />
          </View>
          {!tecladoVisible ? <>
          <Text selectable style={{ color: '#183B56', fontFamily: 'serif', fontSize: 24, fontWeight: '700', marginTop: 12, textAlign: 'center' }}>
            Ayudemos a que vuelvan a casa.
          </Text>
          </> : null}
        </View>

        {/* Formulario de inicio de sesion */}
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: tecladoVisible ? 8 : 12, paddingBottom: tecladoVisible ? 20 : 24 }}>
          {/* Cargando la sesion guardada */}
          {cargandoSesion ? <ActivityIndicator color="#183B56" /> : null}

          {!cargandoSesion && !supabase ? (
            <Text selectable style={{ color: '#b3261e', lineHeight: 24 }}>
              {supabaseConfigurationError}
            </Text>
          ) : null}

          {/* Se muestra cuando no hay una sesion */}
          {!cargandoSesion && supabase && !sesion ? (
            <View style={{ flex: 1, gap: 12, justifyContent: 'flex-start' }}>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>Te damos la bienvenida</Text>
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
                  backgroundColor: enviando ? '#DCEAF0' : colors.action,
                  borderRadius: 10,
                  marginTop: tecladoVisible ? 12 : 0,
                  padding: 13,
                }}>
                <Text style={{ color: enviando ? colors.textSecondary : colors.onAction, fontSize: 16, fontWeight: '600' }}>
                  {enviando ? 'Ingresando...' : 'Iniciar sesión'}
                </Text>
              </Pressable>

              {!tecladoVisible ? <View style={{ alignItems: 'center', marginTop: 'auto', paddingTop: 32 }}>
              <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>¿Todavía no tenés cuenta?</Text>
              <Link href="/registro" asChild>
                <Pressable
                  accessibilityRole="button"
                  style={{
                    alignItems: 'center',
                    borderColor: '#183B56',
                    borderRadius: 10,
                    borderWidth: 1,
                    padding: 13,
                    width: '100%',
                  }}>
                  <Text style={{ color: '#183B56', fontSize: 16, fontWeight: '600' }}>
                    Crear cuenta
                  </Text>
                </Pressable>
              </Link>
              </View> : null}
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
    </KeyboardAvoidingView>
  );
}
