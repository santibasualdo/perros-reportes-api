import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ConversacionScreenProps = {
  idCoincidencia: string;
};

export function ConversacionScreen({ idCoincidencia }: ConversacionScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        backgroundColor: '#ffffff',
        flexGrow: 1,
        paddingBottom: insets.bottom,
      }}>
      <StatusBar style="light" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: '#183B56', height: insets.top }} />

      {/* Titulo de la conversacion */}
      <View
        style={{
          borderBottomColor: '#DCE3E6',
          borderBottomWidth: 1,
          paddingBottom: 24,
          paddingHorizontal: 24,
          paddingTop: 32,
        }}>
        <Text selectable style={{ color: '#183B56', fontSize: 20, fontWeight: '700' }}>
          Conversacion
        </Text>
      </View>

      {/* Lugar donde se mostraran los mensajes */}
      <View style={{ alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 24 }}>
        <Text selectable style={{ color: '#183B56', fontSize: 18, fontWeight: '600' }}>
          Chat habilitado
        </Text>
        <Text selectable style={{ color: '#5A6E7C', fontSize: 15, textAlign: 'center' }}>
          En el siguiente paso cargaremos los mensajes de esta coincidencia.
        </Text>
      </View>

      {/* Volver al detalle de la coincidencia */}
      <View style={{ padding: 24 }}>
        <Pressable
          accessibilityLabel={`Volver desde la conversacion ${idCoincidencia}`}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={{
            alignItems: 'center',
            borderColor: '#183B56',
            borderRadius: 10,
            borderWidth: 1,
            paddingVertical: 13,
          }}>
          <Text style={{ color: '#183B56', fontSize: 16, fontWeight: '600' }}>
            Volver
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
