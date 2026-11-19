import { Redirect } from 'expo-router';
import { ActivityIndicator, ScrollView } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { PerfilScreen } from '@/components/perfil-screen';

export default function Perfil() {
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
        <ActivityIndicator />
      </ScrollView>
    );
  }

  if (!sesion) {
    return <Redirect href="/" />;
  }

  return <PerfilScreen />;
}
