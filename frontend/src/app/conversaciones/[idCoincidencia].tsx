import { Redirect, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/components/auth-provider';
import { ConversacionScreen } from '@/components/conversacion-screen';

export default function Conversacion() {
  const { cargandoSesion, sesion } = useAuth();
  const { idCoincidencia, nombre } = useLocalSearchParams<{
    idCoincidencia: string;
    nombre?: string;
  }>();

  if (cargandoSesion) {
    return null;
  }

  if (!sesion || !idCoincidencia) {
    return <Redirect href="/" />;
  }

  return <ConversacionScreen idCoincidencia={idCoincidencia} nombreOtroParticipante={nombre} />;
}
