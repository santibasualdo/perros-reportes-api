import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { crearPerfilUsuario } from '@/lib/api';
import { supabase, supabaseConfigurationError } from '@/lib/supabase';

export function RegistroScreen() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacionContrasena, setConfirmacionContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const validarDatosRegistro = () => {
    const correoNormalizado = correo.trim();

    if (!nombre.trim()) {
      setError('Ingresá tu nombre.');
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(correoNormalizado)) {
      setError('Ingresá un correo válido.');
      return false;
    }

    if (contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return false;
    }

    if (contrasena !== confirmacionContrasena) {
      setError('Las contraseñas no coinciden.');
      return false;
    }

    setError(null);
    return true;
  };

  const crearCuenta = async () => {
    if (!validarDatosRegistro()) {
      return;
    }

    if (!supabase) {
      setError(supabaseConfigurationError);
      return;
    }

    setEnviando(true);
    setMensaje(null);

    try {
      const { data, error: errorRegistro } = await supabase.auth.signUp({
        email: correo.trim(),
        password: contrasena,
      });

      if (errorRegistro) {
        setError(errorRegistro.message);
        return;
      }

      if (!data.session) {
        setMensaje('Revisá tu correo para confirmar la cuenta antes de iniciar sesión.');
        return;
      }

      await crearPerfilUsuario(nombre.trim(), data.session.access_token);
      setMensaje('La cuenta y el perfil interno se crearon correctamente.');
    } catch (errorCreacion) {
      setError(
        errorCreacion instanceof Error
          ? errorCreacion.message
          : 'Ocurrió un error inesperado al crear la cuenta.',
      );
    } finally {
      setEnviando(false);
    }
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
      <View style={{ backgroundColor: '#ffffff', flex: 1 }}>
        <View
          style={{
            borderBottomColor: '#ded9ce',
            borderBottomWidth: 1,
            paddingHorizontal: 24,
            paddingBottom: 24,
            paddingTop: 32,
          }}>
          <Text selectable style={{ color: '#263238', fontSize: 20, fontWeight: '700' }}>
            Crear cuenta
          </Text>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end', padding: 24 }}>
          <View style={{ gap: 12 }}>
            <TextInput
              accessibilityLabel="Nombre"
              autoComplete="name"
              onChangeText={setNombre}
              placeholder="Nombre"
              placeholderTextColor="#7a7a7a"
              style={{
                borderColor: '#ded9ce',
                borderRadius: 10,
                borderWidth: 1,
                fontSize: 16,
                padding: 12,
              }}
              textContentType="name"
              value={nombre}
            />
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
              autoComplete="new-password"
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
              textContentType="newPassword"
              value={contrasena}
            />
            <TextInput
              accessibilityLabel="Confirmar contraseña"
              autoComplete="new-password"
              onChangeText={setConfirmacionContrasena}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#7a7a7a"
              secureTextEntry
              style={{
                borderColor: '#ded9ce',
                borderRadius: 10,
                borderWidth: 1,
                fontSize: 16,
                padding: 12,
              }}
              textContentType="newPassword"
              value={confirmacionContrasena}
            />
            <Pressable
              accessibilityRole="button"
              disabled={enviando}
              onPress={crearCuenta}
              style={{
                alignItems: 'center',
                backgroundColor: enviando ? '#8aaeb5' : '#2f7383',
                borderRadius: 10,
                padding: 13,
              }}>
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                {enviando ? 'Creando cuenta...' : 'Crear cuenta'}
              </Text>
            </Pressable>
            {error ? (
              <Text selectable style={{ color: '#b3261e', lineHeight: 22 }}>
                {error}
              </Text>
            ) : null}
            {mensaje ? (
              <Text selectable style={{ color: '#2f7383', lineHeight: 22 }}>
                {mensaje}
              </Text>
            ) : null}
            <Link href="/" asChild>
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
                  Ya tengo cuenta
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
