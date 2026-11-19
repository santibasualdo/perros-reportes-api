// Iconos que aparecen en la tarjeta del reporte.
import ChevronIcon from '@expo/material-symbols/chevron_right.xml';
import LocationIcon from '@expo/material-symbols/location_on.xml';
import PetsIcon from '@expo/material-symbols/pets.xml';
import ScheduleIcon from '@expo/material-symbols/schedule.xml';
// Componentes para mostrar los iconos y la imagen.
import { Host, Icon } from '@expo/ui/jetpack-compose';
import { Image } from 'expo-image';
// Ubicacion del celular y navegacion entre pantallas.
import * as Location from 'expo-location';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// Herramientas de React y componentes para armar la pantalla.
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, View } from 'react-native';
// Mapa, marcadores y espacio seguro de la pantalla.
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Sesion, colores y funciones propias de la app.
import { useAuth } from '@/components/auth-provider';
import { PinReporte } from '@/components/pin-reporte';
import { colors } from '@/constants/colors';
import { estiloMapa } from '@/constants/estilo-mapa';
import { obtenerDireccion } from '@/lib/direccion';
import { buscarReportePorId, listarReportesMapa, type ReporteDetalle, type ReporteMapa } from '@/lib/api';

// Textos y colores que usamos para cada tipo de reporte.
const tiposReporte = {
  PERDIDO: { filtro: 'Perdidos', etiqueta: 'Perdido', fondo: colors.lostBackground, texto: colors.lostText, pin: colors.lostMapPin },
  AVISTAMIENTO: { filtro: 'Avistamientos', etiqueta: 'Avistamiento', fondo: colors.sightingBackground, texto: colors.sightingText, pin: colors.sightingMapPin },
};

// Opciones que aparecen arriba del mapa.
const filtros = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: 'PERDIDO', etiqueta: tiposReporte.PERDIDO.filtro },
  { id: 'AVISTAMIENTO', etiqueta: tiposReporte.AVISTAMIENTO.filtro },
] as const;
type FiltroMapa = (typeof filtros)[number]['id'];
// Muestra las fechas con el formato habitual de Argentina.
const formatoFecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' });

// Zona inicial si no podemos obtener la ubicacion del celular.
const regionCordoba: Region = {
  latitude: -31.4201,
  longitude: -64.1888,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Arma la zona que se muestra cuando conocemos una ubicacion concreta.
const crearRegion = (latitude: number, longitude: number): Region => ({
  latitude,
  longitude,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
});

export function InicioScreen() {
  // Datos de la sesion, navegacion y ubicacion recibida desde otra pantalla.
  const { sesion } = useAuth();
  const router = useRouter();
  const { latitud, longitud } = useLocalSearchParams<{
    latitud?: string;
    longitud?: string;
  }>();
  const insets = useSafeAreaInsets();
  // Guardamos la zona del mapa y si tenemos permiso para mostrar al usuario.
  const [regionMapa, setRegionMapa] = useState<Region | null>(null);
  const mapaRef = useRef<MapView>(null);
  const [ubicacionPermitida, setUbicacionPermitida] = useState(false);
  const [mensajeUbicacion, setMensajeUbicacion] = useState<string | null>(null);
  // Reportes cargados y filtro elegido.
  const [reportes, setReportes] = useState<ReporteMapa[]>([]);
  const [mensajeReportes, setMensajeReportes] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroMapa>('todos');
  // Datos de la tarjeta que se abre al tocar un marcador.
  const [idSeleccionado, setIdSeleccionado] = useState<string | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<ReporteDetalle | null>(null);
  const [errorVistaPrevia, setErrorVistaPrevia] = useState<string | null>(null);
  // Elegimos que marcadores y que tarjeta mostrar segun el filtro y la seleccion.
  const reportesVisibles = filtro === 'todos' ? reportes : reportes.filter((reporte) => reporte.tipo === filtro);
  const reporteSeleccionado = reportesVisibles.find((reporte) => reporte.idReporte === idSeleccionado);
  const detalleSeleccionado = vistaPrevia?.idReporte === idSeleccionado ? vistaPrevia : null;

  useFocusEffect(useCallback(() => {
    if (!idSeleccionado || !sesion) return;

    // Pedimos la foto y los datos extra solo para el marcador seleccionado.
    const controller = new AbortController();
    setVistaPrevia(null);
    setErrorVistaPrevia(null);
    buscarReportePorId(idSeleccionado, sesion.access_token, controller.signal)
      .then(async (detalle) => {
        if (detalle.ubicacion && !detalle.ubicacion.direccion?.trim()) {
          try {
            const direccion = await obtenerDireccion(detalle.ubicacion.latitud, detalle.ubicacion.longitud);
            detalle = { ...detalle, ubicacion: { ...detalle.ubicacion, direccion } };
          } catch {
            // Si no se obtiene una direccion, se conserva el resto de la tarjeta.
          }
        }
        if (!controller.signal.aborted) setVistaPrevia(detalle);
      })
      .catch(() => {
        if (!controller.signal.aborted) setErrorVistaPrevia(idSeleccionado);
      });

    // Evita mostrar una respuesta vieja si se toca otro marcador o se sale del mapa.
    return () => controller.abort();
  }, [idSeleccionado, sesion]));

  useEffect(() => {
    // La camara solo se centra cuando cambia la ubicacion, sin controlar el giro.
    if (regionMapa) mapaRef.current?.animateToRegion(regionMapa);
  }, [regionMapa]);

  useEffect(() => {
    // Centra el mapa en un reporte concreto o en la ultima ubicacion del celular.
    let pantallaActiva = true;
    const latitudReporte = Number(latitud);
    const longitudReporte = Number(longitud);
    const mostrarReporte = Number.isFinite(latitudReporte) && Number.isFinite(longitudReporte);

    const cargarUbicacion = async () => {
      try {
        if (mostrarReporte) {
          setRegionMapa(crearRegion(latitudReporte, longitudReporte));
        }

        const permiso = await Location.requestForegroundPermissionsAsync();

        if (!pantallaActiva) {
          return;
        }

        if (permiso.status !== Location.PermissionStatus.GRANTED) {
          setMensajeUbicacion('No se permitio usar la ubicacion del celular.');

          if (!mostrarReporte) {
            setRegionMapa(regionCordoba);
          }

          return;
        }

        setUbicacionPermitida(true);

        if (mostrarReporte) {
          return;
        }

        let ultimaUbicacion: Location.LocationObject | null = null;

        try {
          ultimaUbicacion = await Location.getLastKnownPositionAsync({
            maxAge: 10 * 60 * 1000,
          });
        } catch {
          ultimaUbicacion = null;
        }

        if (!pantallaActiva) {
          return;
        }

        if (ultimaUbicacion) {
          setRegionMapa(
            crearRegion(ultimaUbicacion.coords.latitude, ultimaUbicacion.coords.longitude),
          );
        } else {
          setRegionMapa(regionCordoba);
        }

        try {
          const ubicacionActual = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          if (pantallaActiva) {
            setRegionMapa(
              crearRegion(ubicacionActual.coords.latitude, ubicacionActual.coords.longitude),
            );
          }
        } catch {
          if (pantallaActiva) {
            setMensajeUbicacion('No se pudo actualizar la ubicacion actual.');
          }
        }
      } catch {
        if (pantallaActiva) {
          setMensajeUbicacion('No se pudo obtener la ubicacion del celular.');

          if (!mostrarReporte) {
            setRegionMapa(regionCordoba);
          }
        }
      }
    };

    cargarUbicacion();

    return () => {
      pantallaActiva = false;
    };
  }, [latitud, longitud]);

  useFocusEffect(useCallback(() => {
    if (!sesion) {
      return;
    }

    const controller = new AbortController();

    // Carga los puntos que se van a mostrar como marcadores en el mapa.
    const cargarReportes = async () => {
      try {
        const reportesRecibidos = await listarReportesMapa(
          sesion.access_token,
          controller.signal,
        );

        setReportes(reportesRecibidos);
        setMensajeReportes(null);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          setMensajeReportes(error.message);
        }
      }
    };

    cargarReportes();

    return () => controller.abort();
  }, [sesion]));

  return (
    <View style={{ backgroundColor: colors.reportListBackground, flex: 1 }}>
      <StatusBar style="dark" />
      {/* Parte de arriba del celular */}
      <View style={{ height: insets.top }} />
      <View style={{ backgroundColor: colors.reportListBackground, flex: 1 }}>
        {/* Titulo de la pantalla */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 8,
            paddingTop: 12,
          }}>
          <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>
            Cerca tuyo
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 4 }}>
            Explorá reportes cerca de vos
          </Text>
        </View>

        {/* El filtro trabaja sobre los reportes ya cargados del mapa. */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 12 }}>
          {filtros.map(({ id, etiqueta }) => {
            const activo = id === filtro;
            const identidad = id === 'todos' ? null : tiposReporte[id];
            return (
              <Pressable
                key={id}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                onPress={() => {
                  setFiltro(id);
                  if (id !== 'todos' && reporteSeleccionado?.tipo !== id) {
                    setIdSeleccionado(null);
                  }
                }}
                style={({ pressed }) => ({
                  backgroundColor: activo ? (id === 'PERDIDO' ? colors.lostMapPin : colors.action) : id === 'PERDIDO' ? colors.lostMapBackground : identidad?.fondo ?? colors.border,
                  borderRadius: 24, minHeight: 44, justifyContent: 'center',
                  paddingHorizontal: 14, opacity: pressed ? 0.8 : 1,
                })}>
                <Text style={{ color: activo ? colors.onAction : identidad?.texto ?? colors.text, fontWeight: '600' }}>
                  {etiqueta}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Area principal para el mapa */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              overflow: 'hidden',
            }}>
            {regionMapa ? (
              <MapView
                ref={mapaRef}
                customMapStyle={Platform.OS === 'android' ? estiloMapa : undefined}
                mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
                moveOnMarkerPress={false}
                onPress={(evento) => {
                  if (evento.nativeEvent.action !== 'marker-press') setIdSeleccionado(null);
                }}
                initialRegion={regionMapa}
                rotateEnabled
                showsUserLocation={ubicacionPermitida}
                style={{ flex: 1 }}>
                {reportesVisibles.map((reporte) => (
                  <Marker
                    key={reporte.idReporte}
                    coordinate={{
                      latitude: reporte.latitud,
                      longitude: reporte.longitud,
                    }}
                    accessibilityLabel={`${tiposReporte[reporte.tipo].etiqueta}: ${reporte.nombre ?? 'Perro sin nombre'}`}
                    onPress={() => setIdSeleccionado(reporte.idReporte)}
                    anchor={{ x: 0.5, y: 1 }}
                    stopPropagation
                    tracksViewChanges={false}>
                    <PinReporte color={tiposReporte[reporte.tipo].pin} />
                  </Marker>
                ))}
              </MapView>
            ) : (
              <ActivityIndicator color="#183B56" style={{ flex: 1 }} />
            )}
            {reporteSeleccionado ? (
              <TarjetaReporteMapa
                key={reporteSeleccionado.idReporte}
                reporte={reporteSeleccionado}
                detalle={detalleSeleccionado}
                cargando={!detalleSeleccionado && errorVistaPrevia !== idSeleccionado}
                abrirDetalle={() => router.push({
                  pathname: '/reportes/[idReporte]',
                  params: { idReporte: reporteSeleccionado.idReporte },
                })}
              />
            ) : null}
          </View>

          {mensajeUbicacion ? (
            <Text selectable style={{ color: '#5A6E7C', fontSize: 14, paddingHorizontal: 16, paddingTop: 8 }}>
              {mensajeUbicacion}
            </Text>
          ) : null}

          {mensajeReportes ? (
            <Text selectable style={{ color: '#b3261e', fontSize: 14, paddingHorizontal: 16, paddingTop: 8 }}>
              {mensajeReportes}
            </Text>
          ) : null}
        </View>

      </View>
    </View>
  );
}

function TarjetaReporteMapa({ reporte, detalle, cargando, abrirDetalle }: {
  reporte: ReporteMapa;
  detalle: ReporteDetalle | null;
  cargando: boolean;
  abrirDetalle: () => void;
}) {
  // Preparamos los datos y colores que se ven en la tarjeta.
  const identidad = tiposReporte[reporte.tipo];
  const foto = detalle?.fotografias[0]?.url;
  const fecha = detalle ? new Date(detalle.fechaHora) : null;
  const nombre = reporte.nombre || 'Perro sin nombre';
  // Cada fila tiene su icono y el texto correspondiente.
  const datos = [
    { icono: LocationIcon, texto: detalle?.ubicacion?.direccion },
    { icono: ScheduleIcon, texto: fecha && Number.isFinite(fecha.getTime()) ? formatoFecha.format(fecha) : null },
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Abre el detalle del reporte"
      onPress={abrirDetalle}
      style={({ pressed }) => ({
        position: 'absolute', bottom: 28, left: 12, right: 12,
        backgroundColor: colors.reportCardBackground, borderRadius: 18, padding: 12,
        flexDirection: 'row', gap: 12, alignItems: 'center',
        boxShadow: colors.reportCardShadow, opacity: pressed ? 0.85 : 1,
      })}>
      <View style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden',
        alignItems: 'center', justifyContent: 'center', backgroundColor: cargando ? colors.border : colors.reportCardBackground }}>
        {!cargando ? <Host matchContents>
          <Icon source={PetsIcon} size={26} tint={identidad.texto} />
        </Host> : null}
        {foto ? <Image source={foto} contentFit="contain" style={{ position: 'absolute', width: 80, height: 80, backgroundColor: colors.reportCardBackground }} /> : null}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 8,
          paddingVertical: 2, backgroundColor: identidad.fondo, color: identidad.texto, fontWeight: '600' }}>
          {identidad.etiqueta}
        </Text>
        <Text numberOfLines={1} style={{ color: colors.text, fontSize: 20, fontFamily: 'serif', fontWeight: '700' }}>
          {nombre}
        </Text>
        {/* Las dos filas conservan su altura mientras llega el detalle. */}
        {datos.map(({ icono, texto }, indice) => (
          <View key={indice} style={{ minHeight: 18, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {cargando ? <View style={{ height: 12, width: indice === 0 ? '75%' : '50%', borderRadius: 6, backgroundColor: colors.border }} /> : texto ? <>
            <Host matchContents>
              <Icon source={icono} size={14} tint={colors.textSecondary} />
            </Host>
            <Text numberOfLines={1} style={{ flex: 1, color: colors.textSecondary, fontSize: 13 }}>{texto}</Text>
            </> : null}
          </View>
        ))}
      </View>
      <Host matchContents>
        <Icon source={ChevronIcon} size={20} tint={colors.action} />
      </Host>
    </Pressable>
  );
}
