import 'react-native-url-polyfill/auto';

import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// Datos publicos necesarios para conectar la app con Supabase.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Guarda la sesion de forma segura dentro del celular.
const storage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Crea el cliente solo cuando existe la configuracion necesaria.
export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          storage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const supabaseConfigurationError =
  'Faltan EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env.';
