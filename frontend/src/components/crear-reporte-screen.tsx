// Imagenes, seleccion de fotos y navegacion entre pantallas.
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BinocularsIcon, CaretRightIcon, DogIcon, PlusIcon } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
// Componentes del formulario y el mapa donde se elige la ubicacion.
import { Keyboard, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import MapView, { Marker, type MapPressEvent } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraNavegacion } from '@/components/barra-navegacion';
import { useAuth } from '@/components/auth-provider';
import { PinReporte } from '@/components/pin-reporte';
import { colors } from '@/constants/colors';
import { estiloMapa } from '@/constants/estilo-mapa';
import {
  crearCaracteristicasReporte,
  crearReporte,
  crearUbicacionReporte,
  subirFotografiaReporte,
  type SexoPerro,
  type TipoReporte,
} from '@/lib/api';

// Punto inicial del mapa antes de elegir una ubicacion.
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
  // Guardamos los datos mientras la persona avanza y vuelve entre pasos.
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
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const { sesion } = useAuth();
  const insets = useSafeAreaInsets();
  const { height: altoPantalla } = useWindowDimensions();
  // Dejamos lugar para los botones y evitamos que el mapa quede demasiado chico o grande.
  const altoMapa = Math.max(180, Math.min(275, (altoPantalla - insets.top - insets.bottom) * 0.34));
  const router = useRouter();

  useEffect(() => {
    const mostrar = Keyboard.addListener('keyboardDidShow', () => setTecladoVisible(true));
    const ocultar = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));
    return () => {
      mostrar.remove();
      ocultar.remove();
    };
  }, []);

  const elegirUbicacion = (evento: MapPressEvent) => {
    // Guarda el punto que la persona toca en el mapa.
    setUbicacion({
      latitud: evento.nativeEvent.coordinate.latitude,
      longitud: evento.nativeEvent.coordinate.longitude,
    });
    setError(null);
  };

  const avanzar = () => {
    Keyboard.dismiss();
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
    <View style={{ backgroundColor: colors.reportListBackground, flex: 1 }}>
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ backgroundColor: colors.reportListBackground, flexGrow: 1 }}>
      <StatusBar style="dark" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: colors.reportListBackground, height: insets.top }} />

      {/* Titulo y progreso */}
      <View style={{ alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 6 }}>
          <Image source={require('../../assets/images/logo-huellas-transparente.png')} contentFit="contain" style={{ height: 34, width: 34 }} />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Huellas a Casa</Text>
        </View>
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 23, fontWeight: '700' }}>Crear reporte</Text>
        {/* Cada marca representa un paso del formulario. */}
        <View accessibilityLabel={`Paso ${paso} de 5`} style={{ flexDirection: 'row', gap: 6 }}>
          {[1, 2, 3, 4, 5].map((numero) => (
            <View key={numero} style={{ backgroundColor: numero <= paso ? colors.lostMapPin : colors.reportCardBorder, borderRadius: 4, height: 6, width: 32 }} />
          ))}
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Paso {paso} de 5</Text>
      </View>

      {/* Contenido del paso actual */}
      <View style={{ flex: 1, gap: paso === 3 ? 10 : 14, padding: 20, paddingTop: paso === 3 ? 12 : 20 }}>
        {paso === 1 ? (
          <>
            <Text style={{ color: '#183B56', fontSize: 18, fontWeight: '600' }}>¿Qué ocurrió?</Text>
            <Text style={{ color: colors.textSecondary }}>Elegí la opción que describe tu situación.</Text>
            <Opcion texto="Perdí un perro" tipoReporte="PERDIDO" activa={tipo === 'PERDIDO'} onPress={() => { setTipo('PERDIDO'); setError(null); setPaso(2); }} />
            <Opcion texto="Avisté o encontré un perro" tipoReporte="AVISTAMIENTO" activa={tipo === 'AVISTAMIENTO'} onPress={() => { setTipo('AVISTAMIENTO'); setError(null); setPaso(2); }} />
          </>
        ) : null}

        {paso === 2 ? (
          <>
            <Text style={{ color: '#183B56', fontSize: 18, fontWeight: '600' }}>Datos básicos</Text>
            <Text style={{ color: colors.textSecondary }}>Contanos un poco sobre el perro.</Text>
            <Campo etiqueta="Nombre del perro (opcional)" placeholder="Ej. Simón" value={nombre} onChangeText={setNombre} />
            <Campo
              etiqueta="Descripción"
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
            <View style={{ borderColor: colors.reportCardBorder, borderRadius: 16, borderWidth: 1, overflow: 'hidden' }}>
            <MapView initialRegion={centroCordoba} onPress={elegirUbicacion} customMapStyle={Platform.OS === 'android' ? estiloMapa : undefined} mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'} style={{ height: altoMapa, width: '100%' }}>
              {ubicacion ? (
                <Marker coordinate={{ latitude: ubicacion.latitud, longitude: ubicacion.longitud }} anchor={{ x: 0.5, y: 1 }}>
                  <PinReporte color={tipo === 'PERDIDO' ? colors.lostMapPin : colors.sightingMapPin} />
                </Marker>
              ) : null}
            </MapView>
            </View>
            <Campo etiqueta="Dirección o referencia (opcional)" placeholder="Ej. cerca de la plaza" value={direccion} onChangeText={setDireccion} />
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
            <Campo etiqueta="Raza (opcional)" placeholder="Ej. Mestizo" value={raza} onChangeText={setRaza} />
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
              etiqueta="Señas particulares (opcional)"
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
                backgroundColor: colors.reportCardBackground,
                borderColor: colors.reportCardBorder,
                borderRadius: 14,
                borderWidth: 1,
                borderStyle: 'dashed',
                gap: 8,
                padding: 20,
              }}>
              <PlusIcon color={colors.action} size={26} />
              <Text style={{ color: colors.action, fontWeight: '600' }}>
                {fotografias.length >= 5 ? 'Máximo de 5 fotos' : 'Agregar fotos'}
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
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{fotografias.length} de 5 fotos</Text>
          </>
        ) : null}

        {error ? <Text selectable style={{ color: '#b3261e' }}>{error}</Text> : null}

        {/* Botones para cambiar de paso */}
        {paso !== 1 ? <View style={{ flexDirection: 'row', gap: 10, marginTop: 'auto', paddingTop: 16 }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              Keyboard.dismiss();
              setError(null);
              if (paso === 1) {
                router.back();
              } else {
                setPaso((pasoActual) => pasoActual - 1);
              }
            }}
            style={{ alignItems: 'center', borderColor: colors.action, borderRadius: 14, borderWidth: 1, flex: 1, minHeight: 48, justifyContent: 'center', padding: 13 }}>
            <Text style={{ color: colors.action, fontWeight: '600' }}>{paso === 1 ? 'Cancelar' : 'Atrás'}</Text>
          </Pressable>
          {paso !== 1 ? <Pressable
            accessibilityRole="button"
            disabled={enviando}
            onPress={paso === 5 ? guardarReporte : avanzar}
            style={{ alignItems: 'center', backgroundColor: enviando ? colors.border : colors.action, borderRadius: 14, flex: 1, justifyContent: 'center', minHeight: 48, padding: 13 }}>
            <Text style={{ color: enviando ? colors.textSecondary : colors.onAction, fontWeight: '600' }}>
              {enviando ? 'Guardando...' : paso === 5 ? 'Publicar reporte' : 'Siguiente'}
            </Text>
          </Pressable> : null}
        </View> : null}
      </View>

    </ScrollView>
      {!tecladoVisible ? (
        <View style={{ backgroundColor: colors.reportListBackground, paddingBottom: insets.bottom }}>
          <BarraNavegacion seccionActiva="crear" />
        </View>
      ) : null}
    </View>
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

function Campo({ etiqueta, ...props }: React.ComponentProps<typeof TextInput> & { etiqueta: string }) {
  // Input reutilizable para no repetir los mismos estilos en cada paso.
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontWeight: '600' }}>{etiqueta}</Text>
      <TextInput
        {...props}
        accessibilityLabel={etiqueta}
        placeholderTextColor={colors.textSecondary}
        style={{
          backgroundColor: colors.reportCardBackground,
          borderColor: colors.reportCardBorder,
          borderRadius: 12,
          borderWidth: 1,
          color: colors.text,
          fontSize: 16,
          minHeight: props.multiline ? 100 : 48,
          padding: 12,
          textAlignVertical: props.multiline ? 'top' : 'center',
        }}
      />
    </View>
  );
}

function Opcion({
  activa,
  compacta = false,
  onPress,
  texto,
  tipoReporte,
}: {
  activa: boolean;
  compacta?: boolean;
  onPress: () => void;
  texto: string;
  tipoReporte?: TipoReporte;
}) {
  // Boton reutilizable para elegir una opcion dentro del formulario.
  const esPerdido = tipoReporte === 'PERDIDO';
  const Icono = esPerdido ? DogIcon : BinocularsIcon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={tipoReporte ? undefined : { selected: activa }}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        backgroundColor: tipoReporte ? colors.reportCardBackground : activa ? colors.lostMapPin : colors.reportCardBackground,
        borderColor: !tipoReporte && activa ? colors.lostMapPin : colors.reportCardBorder,
        borderRadius: compacta ? 24 : 16,
        borderWidth: 1,
        flexDirection: tipoReporte ? 'row' : 'column',
        flexGrow: compacta ? 1 : undefined,
        gap: 12,
        minHeight: tipoReporte ? 78 : 44,
        opacity: pressed ? 0.75 : 1,
        padding: 13,
      })}>
      {tipoReporte ? (
        <View style={{ alignItems: 'center', backgroundColor: esPerdido ? colors.lostMapBackground : colors.sightingBackground, borderRadius: 14, height: 42, justifyContent: 'center', width: 42 }}>
          <Icono color={esPerdido ? colors.lostText : colors.sightingText} size={25} />
        </View>
      ) : null}
      <Text style={{ color: activa && !tipoReporte ? colors.onAction : colors.text, flex: tipoReporte ? 1 : undefined, fontWeight: '600' }}>{texto}</Text>
      {tipoReporte ? <CaretRightIcon color={colors.action} size={20} /> : null}
    </Pressable>
  );
}
