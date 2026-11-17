import { type Session } from '@supabase/supabase-js';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

type AuthContextValue = {
  cargandoSesion: boolean;
  sesion: Session | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Comparte la sesion actual con todas las pantallas de la app.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setCargandoSesion(false);
      return;
    }

    // Busca si el celular ya tenia una sesion guardada.
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargandoSesion(false);
    });

    // Mantiene la sesion actualizada cuando alguien inicia o cierra sesion.
    const { data } = supabase.auth.onAuthStateChange((_evento, siguienteSesion) => {
      setSesion(siguienteSesion);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ cargandoSesion, sesion }}>
      {children}
    </AuthContext.Provider>
  );
}

// Permite que una pantalla lea la sesion sin recibirla por parametros.
export function useAuth() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return auth;
}
