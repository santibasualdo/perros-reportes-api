import { Redirect, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/components/auth-provider';
import { ConversacionScreen } from '@/components/conversacion-screen';

export default function Conversacion() {
  const { cargandoSesion, sesion } = useAuth();
  const { idCoincidencia } = useLocalSearchParams<{ idCoincidencia: string }>();

  if (cargandoSesion) {
    return null;
  }

  if (!sesion || !idCoincidencia) {
    return <Redirect href="/" />;
  }

  return <ConversacionScreen idCoincidencia={idCoincidencia} />;
}
