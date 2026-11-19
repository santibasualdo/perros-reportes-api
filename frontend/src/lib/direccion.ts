import * as Location from 'expo-location';

// Traduce las coordenadas a una direccion legible cuando hay permiso.
export async function obtenerDireccion(latitud: number, longitud: number): Promise<string | null> {
  let permiso = await Location.getForegroundPermissionsAsync();
  if (!permiso.granted) permiso = await Location.requestForegroundPermissionsAsync();
  if (!permiso.granted) return null;

  const [direccion] = await Location.reverseGeocodeAsync({ latitude: latitud, longitude: longitud });
  if (!direccion) return null;
  if (direccion.formattedAddress) return direccion.formattedAddress;

  const calle = [direccion.street, direccion.streetNumber].filter(Boolean).join(' ');
  return [calle, direccion.city, direccion.region].filter(Boolean).join(', ') || null;
}
