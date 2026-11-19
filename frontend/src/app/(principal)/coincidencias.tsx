import { Redirect } from 'expo-router';
import { ActivityIndicator, ScrollView } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { CoincidenciasScreen } from '@/components/coincidencias-screen';

export default function Coincidencias() {
  const { cargandoSesion, sesion } = useAuth();

  if (cargandoSesion) {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: 'center',
        }}>
        <ActivityIndicator color="#183B56" />
      </ScrollView>
    );
  }

  if (!sesion) {
    return <Redirect href="/" />;
  }

  return <CoincidenciasScreen />;
}
