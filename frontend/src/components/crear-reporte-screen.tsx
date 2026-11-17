import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import MapView, { Marker, type MapPressEvent } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraNavegacion } from '@/components/barra-navegacion';
import { useAuth } from '@/components/auth-provider';
import {
  crearCaracteristicasReporte,
  crearReporte,
  crearUbicacionReporte,
  subirFotografiaReporte,
  type SexoPerro,
  type TipoReporte,
} from '@/lib/api';

const centroCordoba = {
  latitude: -31.4167,
  longitude: -64.1833,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

type TamanoPerro = 'PEQUENO' | 'MEDIANO' | 'GRANDE';

type ColorPerro =
  | 'NEGRO'
  | 'BLANCO'
  | 'MARRON'
  | 'GRIS'
  | 'BEIGE_DORADO'
  | 'ROJIZO'
  | 'MULTICOLOR';

export function CrearReporteScreen() {
  const [paso, setPaso] = useState(1);
  const [tipo, setTipo] = useState<TipoReporte | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState<{ latitud: number; longitud: number } | null>(null);
  const [direccion, setDireccion] = useState('');
  const [tamano, setTamano] = useState<TamanoPerro | ''>('');
  const [color, setColor] = useState<ColorPerro | ''>('');
  const [raza, setRaza] = useState('');
  const [sexo, setSexo] = useState<SexoPerro>('DESCONOCIDO');
  const [senasParticulares, setSenasParticulares] = useState('');
  const [fotografias, setFotografias] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const { sesion } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const elegirUbicacion = (evento: MapPressEvent) => {
    // Guarda el punto que la persona toca en el mapa.
    setUbicacion({
      latitud: evento.nativeEvent.coordinate.latitude,
      longitud: evento.nativeEvent.coordinate.longitude,
    });
    setError(null);
  };

  const avanzar = () => {
    // Cada paso valida solo los datos necesarios antes de continuar.
    if (paso === 1 && !tipo) {
      setError('Elegí si el perro está perdido o fue avistado.');
      return;
    }

    if (paso === 2 && !descripcion.trim()) {
      setError('Ingresá una descripción.');
      return;
    }

    if (paso === 3 && !ubicacion) {
      setError('Tocá el mapa para indicar la ubicación.');
      return;
    }

    if (paso === 4 && (!tamano.trim() || !color.trim())) {
      setError('El tamaño y el color son obligatorios.');
      return;
    }

    setError(null);
    setPaso((pasoActual) => pasoActual + 1);
  };

  const elegirFotografias = async () => {
    // Pide permiso y deja elegir hasta cinco fotos del telefono.
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      setError('Necesitamos permiso para acceder a tus fotos.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ['images'],
      quality: 0.8,
      selectionLimit: 5 - fotografias.length,
    });

    if (!resultado.canceled) {
      setFotografias((actuales) => [...actuales, ...resultado.assets].slice(0, 5));
      setError(null);
    }
  };

  const guardarReporte = async () => {
    if (!tamano.trim() || !color.trim()) {
      setError('El tamaño y el color son obligatorios.');
      return;
    }

    if (!sesion || !tipo || !ubicacion) {
      setError('La sesión o los datos del reporte no están disponibles.');
      return;
    }

    if (fotografias.length === 0) {
      setError('Elegí al menos una fotografía.');
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      // El backend necesita el reporte antes de asociarle el resto de los datos.
      const reporte = await crearReporte(
        {
          tipo,
          nombre: nombre.trim() || null,
          descripcion: descripcion.trim(),
          fechaHora: new Date().toISOString(),
        },
        sesion.access_token,
      );

      // Agrega la ubicacion, las caracteristicas y cada foto al reporte creado.
      await crearUbicacionReporte(
        reporte.idReporte,
        {
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud,
          direccion: direccion.trim() || null,
        },
        sesion.access_token,
      );

      await crearCaracteristicasReporte(
        reporte.idReporte,
        {
          tamano: tamano.trim(),
          color: color.trim(),
          raza: raza.trim() || null,
          sexo,
          senasParticulares: senasParticulares.trim() || null,
        },
        sesion.access_token,
      );

      for (const [indice, fotografia] of fotografias.entries()) {
        await subirFotografiaReporte(
          reporte.idReporte,
          {
            uri: fotografia.uri,
            nombre: fotografia.fileName ?? `fotografia-${indice + 1}.jpg`,
            tipo: obtenerTipoFotografia(fotografia),
          },
          sesion.access_token,
        );
      }

      router.replace({ pathname: '/reportes/[idReporte]', params: { idReporte: reporte.idReporte } });
    } catch (errorCreacion) {
      setError(
        errorCreacion instanceof Error
          ? errorCreacion.message
          : 'No se pudo crear el reporte.',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ backgroundColor: '#ffffff', flexGrow: 1, paddingBottom: insets.bottom }}>
      <StatusBar style="light" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: '#183B56', height: insets.top }} />

      {/* Titulo y progreso */}
      <View style={{ borderBottomColor: '#DCE3E6', borderBottomWidth: 1, gap: 4, padding: 20 }}>
        <Text style={{ color: '#183B56', fontSize: 20, fontWeight: '700' }}>Crear reporte</Text>
        <Text style={{ color: '#5A6E7C' }}>Paso {paso} de 5</Text>
      </View>

      {/* Contenido del paso actual */}
      <View style={{ flex: 1, gap: 14, padding: 20 }}>
        {paso === 1 ? (
          <>
            <Text style={{ color: '#183B56', fontSize: 18, fontWeight: '600' }}>¿Qué ocurrió?</Text>
            <Opcion texto="Perdido" activa={tipo === 'PERDIDO'} onPress={() => setTipo('PERDIDO')} />
            <Opcion texto="Avistamiento" activa={tipo === 'AVISTAMIENTO'} onPress={() => setTipo('AVISTAMIENTO')} />
          </>
        ) : null}

        {paso === 2 ? (
          <>
            <Text style={{ color: '#183B56', fontSize: 18, fontWeight: '600' }}>Datos básicos</Text>
            <Campo placeholder="Nombre del perro (opcional)" value={nombre} onChangeText={setNombre} />
            <Campo
              multiline
              placeholder="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
            />
          </>
        ) : null}

        {paso === 3 ? (
          <>
            <Text style={{ color: '#183B56', fontSize: 18, fontWeight: '600' }}>Ubicación</Text>
            <Text style={{ color: '#5A6E7C' }}>Tocá el mapa donde se perdió o fue visto.</Text>
            <MapView initialRegion={centroCordoba} onPress={elegirUbicacion} style={{ height: 330, width: '100%' }}>
              {ubicacion ? (
                <Marker coordinate={{ latitude: ubicacion.latitud, longitude: ubicacion.longitud }} />
              ) : null}
            </MapView>
            <Campo placeholder="Dirección o referencia (opcional)" value={direccion} onChangeText={setDireccion} />
          </>
        ) : null}

        {paso === 4 ? (
          <>
            <Text style={{ color: '#183B56', fontSize: 18, fontWeight: '600' }}>Características</Text>
            <Text style={{ color: '#183B56', fontWeight: '600' }}>Tamaño</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Opcion
                texto="Pequeño"
                activa={tamano === 'PEQUENO'}
                onPress={() => setTamano('PEQUENO')}
                compacta
              />
              <Opcion
                texto="Mediano"
                activa={tamano === 'MEDIANO'}
                onPress={() => setTamano('MEDIANO')}
                compacta
              />
              <Opcion
                texto="Grande"
                activa={tamano === 'GRANDE'}
                onPress={() => setTamano('GRANDE')}
                compacta
              />
            </View>
            <Text style={{ color: '#183B56', fontWeight: '600' }}>Color principal</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Opcion texto="Negro" activa={color === 'NEGRO'} onPress={() => setColor('NEGRO')} compacta />
              <Opcion texto="Blanco" activa={color === 'BLANCO'} onPress={() => setColor('BLANCO')} compacta />
              <Opcion texto="Marrón" activa={color === 'MARRON'} onPress={() => setColor('MARRON')} compacta />
              <Opcion texto="Gris" activa={color === 'GRIS'} onPress={() => setColor('GRIS')} compacta />
              <Opcion
                texto="Beige / dorado"
                activa={color === 'BEIGE_DORADO'}
                onPress={() => setColor('BEIGE_DORADO')}
                compacta
              />
              <Opcion texto="Rojizo" activa={color === 'ROJIZO'} onPress={() => setColor('ROJIZO')} compacta />
              <Opcion
                texto="Multicolor"
                activa={color === 'MULTICOLOR'}
                onPress={() => setColor('MULTICOLOR')}
                compacta
              />
            </View>
            <Campo placeholder="Raza (opcional)" value={raza} onChangeText={setRaza} />
            <Text style={{ color: '#183B56', fontWeight: '600' }}>Sexo</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Opcion texto="Macho" activa={sexo === 'MACHO'} onPress={() => setSexo('MACHO')} compacta />
              <Opcion texto="Hembra" activa={sexo === 'HEMBRA'} onPress={() => setSexo('HEMBRA')} compacta />
              <Opcion
                texto="No sé"
                activa={sexo === 'DESCONOCIDO'}
                onPress={() => setSexo('DESCONOCIDO')}
                compacta
              />
            </View>
            <Campo
              multiline
              placeholder="Señas particulares (opcional)"
              value={senasParticulares}
              onChangeText={setSenasParticulares}
            />
          </>
        ) : null}

        {paso === 5 ? (
          <>
            <Text style={{ color: '#183B56', fontSize: 18, fontWeight: '600' }}>Fotografías</Text>
            <Text style={{ color: '#5A6E7C' }}>Elegí entre 1 y 5 fotos del perro.</Text>
            <Pressable
              accessibilityRole="button"
              disabled={fotografias.length >= 5}
              onPress={elegirFotografias}
              style={{
                alignItems: 'center',
                borderColor: '#183B56',
                borderRadius: 10,
                borderWidth: 1,
                padding: 13,
              }}>
              <Text style={{ color: '#183B56', fontWeight: '600' }}>
                {fotografias.length >= 5 ? 'Máximo de 5 fotos' : 'Elegir fotos'}
              </Text>
            </Pressable>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {fotografias.map((fotografia, indice) => (
                <View key={`${fotografia.uri}-${indice}`} style={{ gap: 5, width: '47%' }}>
                  <Image
                    contentFit="cover"
                    source={{ uri: fotografia.uri }}
                    style={{ borderRadius: 10, height: 130, width: '100%' }}
                  />
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      setFotografias((actuales) =>
                        actuales.filter((_, indiceActual) => indiceActual !== indice),
                      )
                    }>
                    <Text style={{ color: '#b3261e', textAlign: 'center' }}>Quitar</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {error ? <Text selectable style={{ color: '#b3261e' }}>{error}</Text> : null}

        {/* Botones para cambiar de paso */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 'auto', paddingTop: 16 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => (paso === 1 ? router.back() : setPaso((pasoActual) => pasoActual - 1))}
            style={{ alignItems: 'center', borderColor: '#183B56', borderRadius: 10, borderWidth: 1, flex: 1, padding: 13 }}>
            <Text style={{ color: '#183B56', fontWeight: '600' }}>{paso === 1 ? 'Cancelar' : 'Atrás'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={enviando}
            onPress={paso === 5 ? guardarReporte : avanzar}
            style={{ alignItems: 'center', backgroundColor: enviando ? '#DCEAF0' : '#E9826B', borderRadius: 10, flex: 1, padding: 13 }}>
            <Text style={{ color: '#07182A', fontWeight: '600' }}>
              {enviando ? 'Guardando...' : paso === 5 ? 'Crear reporte' : 'Siguiente'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* La barra se mantiene visible tambien al crear un reporte */}
      <BarraNavegacion seccionActiva="crear" />
    </ScrollView>
  );
}

function obtenerTipoFotografia(fotografia: ImagePicker.ImagePickerAsset) {
  // Obtiene el tipo de archivo para que el backend pueda validarlo.
  if (fotografia.mimeType) {
    return fotografia.mimeType;
  }

  const nombre = (fotografia.fileName ?? fotografia.uri).toLowerCase();

  if (nombre.endsWith('.jpg') || nombre.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (nombre.endsWith('.png')) {
    return 'image/png';
  }

  if (nombre.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'application/octet-stream';
}

function Campo(props: React.ComponentProps<typeof TextInput>) {
  // Input reutilizable para no repetir los mismos estilos en cada paso.
  return (
    <TextInput
      {...props}
      placeholderTextColor="#5A6E7C"
      style={{
        borderColor: '#DCE3E6',
        borderRadius: 10,
        borderWidth: 1,
        fontSize: 16,
        minHeight: props.multiline ? 90 : undefined,
        padding: 12,
        textAlignVertical: props.multiline ? 'top' : 'center',
      }}
    />
  );
}

function Opcion({
  activa,
  compacta = false,
  onPress,
  texto,
}: {
  activa: boolean;
  compacta?: boolean;
  onPress: () => void;
  texto: string;
}) {
  // Boton reutilizable para elegir una opcion dentro del formulario.
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        alignItems: 'center',
        backgroundColor: activa ? '#183B56' : '#ffffff',
        borderColor: '#183B56',
        borderRadius: 10,
        borderWidth: 1,
        flexGrow: compacta ? 1 : undefined,
        padding: 13,
      }}>
      <Text style={{ color: activa ? '#ffffff' : '#183B56', fontWeight: '600' }}>{texto}</Text>
    </Pressable>
  );
}
