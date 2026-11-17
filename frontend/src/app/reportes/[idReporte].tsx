import { Redirect, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/components/auth-provider';
import { ReporteDetalleScreen } from '@/components/reporte-detalle-screen';

export default function ReporteDetalle() {
  const { cargandoSesion, sesion } = useAuth();
  const { idReporte, idCoincidencia, estadoCoincidencia } = useLocalSearchParams<{
    idReporte: string;
    idCoincidencia?: string;
    estadoCoincidencia?: string;
  }>();

  if (cargandoSesion) {
    return null;
  }

  if (!sesion || !idReporte) {
    return <Redirect href="/" />;
  }

  return (
    <ReporteDetalleScreen
      idCoincidencia={idCoincidencia}
      idReporte={idReporte}
      estadoCoincidenciaInicial={estadoCoincidencia}
    />
  );
}
