import type { MapViewProps } from 'react-native-maps';

// Suaviza el mapa base para que los marcadores de reportes tengan prioridad.
export const estiloMapa: NonNullable<MapViewProps['customMapStyle']> = [
  { elementType: 'geometry', stylers: [{ color: '#EEECE3' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#535D56' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FAFAF7' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FAFAF7' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#E8DCC9' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#DCE7D6' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#C9DEE0' }] },
];
