import { Redirect } from 'expo-router';
import { ActivityIndicator, ScrollView } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { ConversacionesScreen } from '@/components/conversaciones-screen';

export default function Conversaciones() {
  const { cargandoSesion, sesion } = useAuth();

  if (cargandoSesion) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </ScrollView>
    );
  }

  if (!sesion) {
    return <Redirect href="/" />;
  }

  return <ConversacionesScreen />;
}
