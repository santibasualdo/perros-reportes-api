import { useLocalSearchParams } from 'expo-router';

import { CoincidenciasDetalleScreen } from '@/components/coincidencias-detalle-screen';

export default function CoincidenciasDetalleRoute() {
  const { idReporte } = useLocalSearchParams<{ idReporte: string }>();

  return <CoincidenciasDetalleScreen idReporte={idReporte} />;
}
