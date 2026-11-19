import { View } from 'react-native';

import { colors } from '@/constants/colors';

// La punta del pin señala el lugar elegido en el mapa.
export function PinReporte({ color }: { color: string }) {
  return (
    <View style={{ width: 40, height: 41, alignItems: 'center', justifyContent: 'flex-start' }}>
      <View style={{ width: 32, height: 32, marginTop: 4, borderWidth: 3,
        borderColor: colors.surface, backgroundColor: color,
        borderRadius: 16, borderBottomRightRadius: 3, transform: [{ rotate: '45deg' }],
        alignItems: 'center', justifyContent: 'center', elevation: 3 }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.surface }} />
      </View>
    </View>
  );
}
