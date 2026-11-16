import { fetch } from 'expo/fetch';

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export async function crearPerfilUsuario(nombre: string, accessToken: string) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}/api/usuarios`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre }),
    });
  } catch {
    throw new Error('No se pudo conectar con el backend. Verificá que esté iniciado y accesible.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend rechazó la creación del perfil (${respuesta.status}).`);
  }
}
