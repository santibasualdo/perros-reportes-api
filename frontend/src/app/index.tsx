import { ActivityIndicator, ScrollView } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { InicioScreen } from '@/components/inicio-screen';
import { LoginScreen } from '@/components/login-screen';

export default function HomeScreen() {
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

  return sesion ? <InicioScreen /> : <LoginScreen />;
}
