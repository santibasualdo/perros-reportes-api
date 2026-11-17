import { fetch } from 'expo/fetch';

// Direccion base del backend configurada para esta instalacion de la app.
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export type ReporteMapa = {
  idReporte: string;
  tipo: 'PERDIDO' | 'AVISTAMIENTO';
  nombre: string | null;
  latitud: number;
  longitud: number;
};

export type ReportePropio = {
  idReporte: string;
  tipo: 'PERDIDO' | 'AVISTAMIENTO';
  nombre: string | null;
  fechaHora: string;
  estado: string;
  urlFotografia: string | null;
};

export type Coincidencia = {
  idCoincidencia: string;
  idReportePerdido: string;
  idReporteAvistamiento: string;
  similitudCaracteristicas: number;
  distancia: number;
  puntajeTotal: number;
  estado: string;
  creadoEn: string;
  similitudVisual: number | null;
  urlFotografiaReportePerdido: string | null;
  urlFotografiaReporteAvistamiento: string | null;
  fechaHoraReportePerdido: string;
  fechaHoraReporteAvistamiento: string;
};

export type Mensaje = {
  idMensaje: string;
  idUsuario: string;
  nombreUsuario: string;
  contenido: string;
  fechaHora: string;
  leido: boolean;
};

export type Conversacion = {
  idCoincidencia: string;
  nombreOtroParticipante: string;
  ultimoMensaje: string | null;
  idEmisorUltimoMensaje: string | null;
  fechaUltimoMensaje: string | null;
  fechaCreacion: string;
};

export type ReporteDetalle = {
  idReporte: string;
  tipo: 'PERDIDO' | 'AVISTAMIENTO';
  nombre: string | null;
  descripcion: string | null;
  fechaHora: string;
  estado: string;
  caracteristicas: {
    tamano: string;
    color: string;
    raza: string | null;
    sexo: 'MACHO' | 'HEMBRA' | 'DESCONOCIDO' | null;
    senasParticulares: string | null;
  } | null;
  ubicacion: {
    latitud: number;
    longitud: number;
    direccion: string | null;
  } | null;
  fotografias: {
    idFotografia: string;
    url: string;
    creadoEn: string;
  }[];
};

export type TipoReporte = 'PERDIDO' | 'AVISTAMIENTO';

export type SexoPerro = 'MACHO' | 'HEMBRA' | 'DESCONOCIDO';

type ReporteCreado = {
  idReporte: string;
};

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

export async function listarReportesMapa(accessToken: string, signal?: AbortSignal) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}/api/reportes/mapa`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    throw new Error('No se pudo conectar con el backend para cargar los reportes.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend no pudo cargar los reportes (${respuesta.status}).`);
  }

  return (await respuesta.json()) as ReporteMapa[];
}

export async function listarMisReportes(accessToken: string, signal?: AbortSignal) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}/api/reportes/mios`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    throw new Error('No se pudo conectar con el backend para cargar tus reportes.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend no pudo cargar tus reportes (${respuesta.status}).`);
  }

  return (await respuesta.json()) as ReportePropio[];
}

export async function listarCoincidencias(
  idReporte: string,
  accessToken: string,
  signal?: AbortSignal,
) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}/api/reportes/${idReporte}/coincidencias`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    throw new Error('No se pudo conectar con el backend para cargar las coincidencias.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend no pudo cargar las coincidencias (${respuesta.status}).`);
  }

  return (await respuesta.json()) as Coincidencia[];
}

export async function listarMensajes(
  idCoincidencia: string,
  accessToken: string,
  signal?: AbortSignal,
) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}/api/coincidencias/${idCoincidencia}/mensajes`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    throw new Error('No se pudieron cargar los mensajes.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend no pudo cargar los mensajes (${respuesta.status}).`);
  }

  return (await respuesta.json()) as Mensaje[];
}

export async function listarConversaciones(accessToken: string, signal?: AbortSignal) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}/api/conversaciones`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    throw new Error('No se pudieron cargar las conversaciones.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend no pudo cargar las conversaciones (${respuesta.status}).`);
  }

  return (await respuesta.json()) as Conversacion[];
}

export async function enviarMensaje(
  idCoincidencia: string,
  contenido: string,
  accessToken: string,
) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}/api/coincidencias/${idCoincidencia}/mensajes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contenido }),
    });
  } catch {
    throw new Error('No se pudo enviar el mensaje.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend no pudo enviar el mensaje (${respuesta.status}).`);
  }

  return (await respuesta.json()) as Mensaje;
}

export async function marcarMensajesLeidos(
  idCoincidencia: string,
  accessToken: string,
  signal?: AbortSignal,
) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}/api/coincidencias/${idCoincidencia}/mensajes/leidos`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    throw new Error('No se pudieron marcar los mensajes como leidos.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend no pudo marcar los mensajes como leidos (${respuesta.status}).`);
  }
}

// Usa el mismo endpoint para confirmar o rechazar una coincidencia.
async function actualizarEstadoCoincidencia(
  idCoincidencia: string,
  accion: 'confirmar' | 'descartar',
  accessToken: string,
) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}/api/coincidencias/${idCoincidencia}/${accion}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    throw new Error('No se pudo conectar con el backend para actualizar la coincidencia.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend no pudo actualizar la coincidencia (${respuesta.status}).`);
  }

  return (await respuesta.json()) as Coincidencia;
}

export function confirmarCoincidencia(idCoincidencia: string, accessToken: string) {
  return actualizarEstadoCoincidencia(idCoincidencia, 'confirmar', accessToken);
}

export function descartarCoincidencia(idCoincidencia: string, accessToken: string) {
  return actualizarEstadoCoincidencia(idCoincidencia, 'descartar', accessToken);
}

export async function buscarReportePorId(
  idReporte: string,
  accessToken: string,
  signal?: AbortSignal,
) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}/api/reportes/${idReporte}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }

    throw new Error('No se pudo conectar con el backend para cargar el reporte.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend no pudo cargar el reporte (${respuesta.status}).`);
  }

  return (await respuesta.json()) as ReporteDetalle;
}

async function enviarJson<T>(ruta: string, accessToken: string, datos: unknown) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${apiUrl}${ruta}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    });
  } catch {
    throw new Error('No se pudo conectar con el backend.');
  }

  if (!respuesta.ok) {
    throw new Error(`El backend rechazó los datos (${respuesta.status}).`);
  }

  return (await respuesta.json()) as T;
}

// Crea primero el reporte y despues la pantalla agrega ubicacion, caracteristicas y fotos.
export function crearReporte(
  datos: {
    tipo: TipoReporte;
    nombre: string | null;
    descripcion: string | null;
    fechaHora: string;
  },
  accessToken: string,
) {
  return enviarJson<ReporteCreado>('/api/reportes', accessToken, datos);
}

export function crearUbicacionReporte(
  idReporte: string,
  datos: { latitud: number; longitud: number; direccion: string | null },
  accessToken: string,
) {
  return enviarJson(`/api/reportes/${idReporte}/ubicacion`, accessToken, datos);
}

export function crearCaracteristicasReporte(
  idReporte: string,
  datos: {
    tamano: string;
    color: string;
    raza: string | null;
    sexo: SexoPerro;
    senasParticulares: string | null;
  },
  accessToken: string,
) {
  return enviarJson(`/api/reportes/${idReporte}/caracteristicas`, accessToken, datos);
}

export async function subirFotografiaReporte(
  idReporte: string,
  foto: { uri: string; nombre: string; tipo: string },
  accessToken: string,
) {
  if (!apiUrl) {
    throw new Error('Falta EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  try {
    const archivoLocal = await fetch(foto.uri);
    const archivoSinTipo = await archivoLocal.blob();
    const archivo = archivoSinTipo.slice(0, archivoSinTipo.size, foto.tipo);
    const formulario = new FormData();
    formulario.append('archivo', archivo, foto.nombre);

    const respuesta = await fetch(`${apiUrl}/api/reportes/${idReporte}/fotografias`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formulario,
    });

    if (!respuesta.ok) {
      throw new Error(`El backend rechazó la fotografía (${respuesta.status}).`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('El backend')) {
      throw error;
    }

    throw new Error('No se pudo subir la fotografía.');
  }
}
