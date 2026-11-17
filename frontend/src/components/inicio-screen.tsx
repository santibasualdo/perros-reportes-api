import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { BarraNavegacion } from '@/components/barra-navegacion';
import { listarReportesMapa, type ReporteMapa } from '@/lib/api';

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
  const { sesion } = useAuth();
  const router = useRouter();
  const { latitud, longitud } = useLocalSearchParams<{
    latitud?: string;
    longitud?: string;
  }>();
  const insets = useSafeAreaInsets();
  const [regionMapa, setRegionMapa] = useState<Region | null>(null);
  const [ubicacionPermitida, setUbicacionPermitida] = useState(false);
  const [mensajeUbicacion, setMensajeUbicacion] = useState<string | null>(null);
  const [reportes, setReportes] = useState<ReporteMapa[]>([]);
  const [mensajeReportes, setMensajeReportes] = useState<string | null>(null);

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

  useEffect(() => {
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
  }, [sesion]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: '#ffffff',
        paddingBottom: insets.bottom,
      }}>
      <StatusBar style="light" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: '#183B56', height: insets.top }} />
      <View style={{ backgroundColor: '#ffffff', flex: 1 }}>
        {/* Titulo de la pantalla */}
        <View
          style={{
            borderBottomColor: '#DCE3E6',
            borderBottomWidth: 1,
            paddingHorizontal: 24,
            paddingBottom: 24,
            paddingTop: 32,
          }}>
          <Text selectable style={{ color: '#183B56', fontSize: 20, fontWeight: '700' }}>
            Cerca tuyo
          </Text>
        </View>

        {/* Area principal para el mapa */}
        <View style={{ flex: 1, padding: 24 }}>
          <View
            style={{
              borderColor: '#DCE3E6',
              borderRadius: 12,
              borderWidth: 1,
              flex: 1,
              overflow: 'hidden',
            }}>
            {regionMapa ? (
              <MapView
                onRegionChangeComplete={setRegionMapa}
                region={regionMapa}
                showsUserLocation={ubicacionPermitida}
                style={{ flex: 1 }}>
                {reportes.map((reporte) => (
                  <Marker
                    coordinate={{
                      latitude: reporte.latitud,
                      longitude: reporte.longitud,
                    }}
                    description={reporte.tipo === 'PERDIDO' ? 'Perro perdido' : 'Avistamiento'}
                    key={reporte.idReporte}
                    onPress={() =>
                      router.push({
                        pathname: '/reportes/[idReporte]',
                        params: { idReporte: reporte.idReporte },
                      })
                    }
                    pinColor={reporte.tipo === 'PERDIDO' ? '#E9826B' : '#183B56'}
                    title={reporte.nombre ?? 'Reporte sin nombre'}
                  />
                ))}
              </MapView>
            ) : (
              <ActivityIndicator color="#183B56" style={{ flex: 1 }} />
            )}
          </View>

          {mensajeUbicacion ? (
            <Text selectable style={{ color: '#5A6E7C', fontSize: 14, paddingTop: 8 }}>
              {mensajeUbicacion}
            </Text>
          ) : null}

          {mensajeReportes ? (
            <Text selectable style={{ color: '#b3261e', fontSize: 14, paddingTop: 8 }}>
              {mensajeReportes}
            </Text>
          ) : null}
        </View>

        {/* Barra de navegacion de abajo */}
        <BarraNavegacion seccionActiva="inicio" />
      </View>
    </ScrollView>
  );
}
