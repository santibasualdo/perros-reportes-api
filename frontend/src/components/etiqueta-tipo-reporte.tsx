import { Text, View } from 'react-native';

import { colors } from '@/constants/colors';

// Usamos la misma etiqueta para identificar el tipo de reporte.
export function EtiquetaTipoReporte({ tipo }: { tipo: 'PERDIDO' | 'AVISTAMIENTO' }) {
  const perdido = tipo === 'PERDIDO';

  return (
    <View style={{
      alignSelf: 'flex-start',
      backgroundColor: perdido ? colors.lostBackground : colors.sightingBackground,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 4,
    }}>
      <Text selectable style={{ color: perdido ? colors.lostText : colors.sightingText, fontSize: 12, fontWeight: '700' }}>
        {perdido ? 'Perdido' : 'Avistamiento'}
      </Text>
    </View>
  );
}
