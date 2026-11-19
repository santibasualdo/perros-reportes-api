import { useLocalSearchParams } from 'expo-router';

import { CoincidenciasDetalleScreen } from '@/components/coincidencias-detalle-screen';

export default function CoincidenciasDetalleRoute() {
  const { idReporte, nombre, tipo } = useLocalSearchParams<{ idReporte: string; nombre?: string; tipo?: string }>();

  return <CoincidenciasDetalleScreen idReporte={idReporte} nombreReporte={nombre} tipoReporte={tipo} />;
}
