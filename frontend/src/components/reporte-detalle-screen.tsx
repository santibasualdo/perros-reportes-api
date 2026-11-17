import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import {
  buscarReportePorId,
  confirmarCoincidencia,
  descartarCoincidencia,
  type ReporteDetalle,
} from '@/lib/api';

type ReporteDetalleScreenProps = {
  idCoincidencia?: string;
  idReporte: string;
  estadoCoincidenciaInicial?: string;
};

export function ReporteDetalleScreen({
  idCoincidencia,
  idReporte,
  estadoCoincidenciaInicial,
}: ReporteDetalleScreenProps) {
  const { sesion } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: anchoPantalla } = useWindowDimensions();
  const anchoCarrusel = anchoPantalla - 48;
  const [reporte, setReporte] = useState<ReporteDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fotoActual, setFotoActual] = useState(0);
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);
  const [direccionCalculada, setDireccionCalculada] = useState<string | null>(null);
  const [cargandoDireccion, setCargandoDireccion] = useState(false);
  const [estadoCoincidencia, setEstadoCoincidencia] = useState(estadoCoincidenciaInicial);
  const [procesandoCoincidencia, setProcesandoCoincidencia] = useState(false);

  useEffect(() => {
    if (!sesion) {
      return;
    }

    const controller = new AbortController();

    const cargarReporte = async () => {
      try {
        const reporteRecibido = await buscarReportePorId(
          idReporte,
          sesion.access_token,
          controller.signal,
        );

        setReporte(reporteRecibido);
        setFotoActual(0);
        setError(null);
        setDireccionCalculada(null);

        if (reporteRecibido.ubicacion && !reporteRecibido.ubicacion.direccion) {
          setCargandoDireccion(true);

          try {
            let permiso = await Location.getForegroundPermissionsAsync();

            if (!permiso.granted) {
              permiso = await Location.requestForegroundPermissionsAsync();
            }

            if (permiso.granted) {
              const [direccion] = await Location.reverseGeocodeAsync({
                latitude: reporteRecibido.ubicacion.latitud,
                longitude: reporteRecibido.ubicacion.longitud,
              });

              if (direccion && !controller.signal.aborted) {
                setDireccionCalculada(formatearDireccion(direccion));
              }
            }
          } catch {
            if (!controller.signal.aborted) {
              setDireccionCalculada(null);
            }
          } finally {
            if (!controller.signal.aborted) {
              setCargandoDireccion(false);
            }
          }
        }
      } catch (errorCarga) {
        if (errorCarga instanceof Error && errorCarga.name !== 'AbortError') {
          setError(errorCarga.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    cargarReporte();

    return () => controller.abort();
  }, [idReporte, sesion]);

  const actualizarEstadoCoincidencia = async (accion: 'confirmar' | 'descartar') => {
    if (!sesion || !idCoincidencia) {
      return;
    }

    setProcesandoCoincidencia(true);
    setError(null);

    try {
      const coincidenciaActualizada =
        accion === 'confirmar'
          ? await confirmarCoincidencia(idCoincidencia, sesion.access_token)
          : await descartarCoincidencia(idCoincidencia, sesion.access_token);

      setEstadoCoincidencia(coincidenciaActualizada.estado);
    } catch (errorActualizacion) {
      if (errorActualizacion instanceof Error) {
        setError(errorActualizacion.message);
      }
    } finally {
      setProcesandoCoincidencia(false);
    }
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          backgroundColor: '#ffffff',
          flexGrow: 1,
          paddingBottom: insets.bottom,
        }}>
      <StatusBar style="light" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: '#183B56', height: insets.top }} />

      {/* Titulo de la pantalla */}
      <View
        style={{
          borderBottomColor: '#DCE3E6',
          borderBottomWidth: 1,
          paddingBottom: 24,
          paddingHorizontal: 24,
          paddingTop: 32,
        }}>
        <Text selectable style={{ color: '#183B56', fontSize: 20, fontWeight: '700' }}>
          Detalle del reporte
          {reporte ? ` - ${reporte.tipo === 'PERDIDO' ? 'Perdido' : 'Avistamiento'}` : ''}
        </Text>
      </View>

      {/* Contenido del reporte */}
      <View style={{ flex: 1, gap: 20, padding: 24 }}>
        {cargando ? <ActivityIndicator color="#183B56" /> : null}

        {error ? (
          <Text selectable style={{ color: '#b3261e', fontSize: 15 }}>
            {error}
          </Text>
        ) : null}

        {reporte ? (
          <View style={{ gap: 18 }}>
            {/* Fotos del reporte */}
            {reporte.fotografias.length > 0 ? (
              <View style={{ gap: 8 }}>
                <ScrollView
                  decelerationRate="fast"
                  horizontal
                  onMomentumScrollEnd={(evento) => {
                    const nuevaFoto = Math.round(
                      evento.nativeEvent.contentOffset.x / anchoCarrusel,
                    );
                    setFotoActual(nuevaFoto);
                  }}
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}>
                  {reporte.fotografias.map((fotografia, indice) => (
                    <Pressable
                      accessibilityLabel={`Ampliar fotografia ${indice + 1} del perro reportado`}
                      accessibilityRole="button"
                      key={fotografia.idFotografia}
                      onPress={() => setFotoAmpliada(fotografia.url)}>
                      <Image
                        contentFit="cover"
                        source={fotografia.url}
                        style={{
                          backgroundColor: '#FAFAF7',
                          borderRadius: 12,
                          height: 220,
                          width: anchoCarrusel,
                        }}
                      />
                    </Pressable>
                  ))}
                </ScrollView>

                <Text
                  style={{
                    color: '#5A6E7C',
                    fontSize: 14,
                    fontVariant: ['tabular-nums'],
                    textAlign: 'center',
                  }}>
                  {fotoActual + 1} / {reporte.fotografias.length}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FAFAF7',
                  borderRadius: 12,
                  height: 160,
                  justifyContent: 'center',
                }}>
                <Text selectable style={{ color: '#5A6E7C', fontSize: 16 }}>
                  Sin fotografias
                </Text>
              </View>
            )}

            <View style={{ gap: 6 }}>
              <Text selectable style={{ color: '#5A6E7C', fontSize: 14 }}>
                Nombre
              </Text>
              <Text selectable style={{ color: '#183B56', fontSize: 17 }}>
                {reporte.nombre ?? 'Sin nombre'}
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text selectable style={{ color: '#5A6E7C', fontSize: 14 }}>
                Descripcion
              </Text>
              <Text selectable style={{ color: '#183B56', fontSize: 17 }}>
                {reporte.descripcion ?? 'Sin descripcion'}
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text selectable style={{ color: '#5A6E7C', fontSize: 14 }}>
                Fecha
              </Text>
              <Text selectable style={{ color: '#183B56', fontSize: 17 }}>
                {new Date(reporte.fechaHora).toLocaleString('es-AR')}
              </Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text selectable style={{ color: '#5A6E7C', fontSize: 14 }}>
                Estado
              </Text>
              <Text selectable style={{ color: '#183B56', fontSize: 17 }}>
                {reporte.estado === 'ACTIVO' ? 'Activo' : reporte.estado}
              </Text>
            </View>

            {idCoincidencia ? (
              <View
                style={{
                  borderTopColor: '#DCE3E6',
                  borderTopWidth: 1,
                  gap: 12,
                  paddingTop: 18,
                }}>
                <Text selectable style={{ color: '#183B56', fontSize: 18, fontWeight: '700' }}>
                  Coincidencia
                </Text>
                <Text selectable style={{ color: '#5A6E7C', fontSize: 15 }}>
                  Estado: {estadoCoincidencia ?? 'PENDIENTE'}
                </Text>

                {estadoCoincidencia === 'PENDIENTE' ? (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Pressable
                      accessibilityRole="button"
                      disabled={procesandoCoincidencia}
                      onPress={() => actualizarEstadoCoincidencia('descartar')}
                      style={{
                        alignItems: 'center',
                        borderColor: '#b3261e',
                        borderRadius: 10,
                        borderWidth: 1,
                        flex: 1,
                        opacity: procesandoCoincidencia ? 0.6 : 1,
                        paddingVertical: 13,
                      }}>
                      <Text style={{ color: '#b3261e', fontSize: 16, fontWeight: '600' }}>
                        Rechazar
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      disabled={procesandoCoincidencia}
                      onPress={() => actualizarEstadoCoincidencia('confirmar')}
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#E9826B',
                        borderRadius: 10,
                        flex: 1,
                        opacity: procesandoCoincidencia ? 0.6 : 1,
                        paddingVertical: 13,
                      }}>
                      <Text style={{ color: '#07182A', fontSize: 16, fontWeight: '600' }}>
                        Confirmar
                      </Text>
                    </Pressable>
                  </View>
                ) : null}

                {estadoCoincidencia === 'CONFIRMADA' ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: '/conversaciones/[idCoincidencia]',
                        params: { idCoincidencia },
                      })
                    }
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#E9826B',
                      borderRadius: 10,
                      paddingVertical: 13,
                    }}>
                    <Text style={{ color: '#07182A', fontSize: 16, fontWeight: '600' }}>
                      Abrir chat
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {/* Caracteristicas fisicas */}
            <View
              style={{
                borderTopColor: '#DCE3E6',
                borderTopWidth: 1,
                gap: 14,
                paddingTop: 18,
              }}>
              <Text selectable style={{ color: '#183B56', fontSize: 18, fontWeight: '700' }}>
                Caracteristicas fisicas
              </Text>

              {reporte.caracteristicas ? (
                <View style={{ gap: 12 }}>
                  <Text selectable style={{ color: '#183B56', fontSize: 16 }}>
                    Tamaño: {reporte.caracteristicas.tamano}
                  </Text>
                  <Text selectable style={{ color: '#183B56', fontSize: 16 }}>
                    Color: {reporte.caracteristicas.color}
                  </Text>
                  <Text selectable style={{ color: '#183B56', fontSize: 16 }}>
                    Raza: {reporte.caracteristicas.raza ?? 'Desconocida'}
                  </Text>
                  <Text selectable style={{ color: '#183B56', fontSize: 16 }}>
                    Sexo:{' '}
                    {reporte.caracteristicas.sexo === 'MACHO'
                      ? 'Macho'
                      : reporte.caracteristicas.sexo === 'HEMBRA'
                        ? 'Hembra'
                        : 'Desconocido'}
                  </Text>
                  <Text selectable style={{ color: '#183B56', fontSize: 16 }}>
                    Señas particulares:{' '}
                    {reporte.caracteristicas.senasParticulares ?? 'No registradas'}
                  </Text>
                </View>
              ) : (
                <Text selectable style={{ color: '#5A6E7C', fontSize: 16 }}>
                  Sin caracteristicas registradas
                </Text>
              )}
            </View>

            {reporte.ubicacion ? (
              <View style={{ gap: 10 }}>
                <View style={{ gap: 6 }}>
                  <Text selectable style={{ color: '#5A6E7C', fontSize: 14 }}>
                    Ubicacion
                  </Text>
                  <Text selectable style={{ color: '#183B56', fontSize: 17 }}>
                    {reporte.ubicacion.direccion ??
                      (cargandoDireccion
                        ? 'Buscando direccion...'
                        : direccionCalculada ?? 'Direccion no disponible')}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    router.replace({
                      pathname: '/',
                      params: {
                        latitud: String(reporte.ubicacion?.latitud),
                        longitud: String(reporte.ubicacion?.longitud),
                      },
                    })
                  }
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#E9826B',
                    borderRadius: 10,
                    paddingVertical: 13,
                  }}>
                  <Text style={{ color: '#07182A', fontSize: 16, fontWeight: '600' }}>
                    Ver en el mapa
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={{
            alignItems: 'center',
            borderColor: '#183B56',
            borderRadius: 10,
            borderWidth: 1,
            paddingVertical: 13,
          }}>
          <Text style={{ color: '#183B56', fontSize: 16, fontWeight: '600' }}>
            Volver al mapa
          </Text>
        </Pressable>
      </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setFotoAmpliada(null)}
        transparent
        visible={fotoAmpliada !== null}>
        <Pressable
          accessibilityLabel="Cerrar fotografia ampliada"
          accessibilityRole="button"
          onPress={() => setFotoAmpliada(null)}
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            flex: 1,
            justifyContent: 'center',
            padding: 24,
          }}>
          {fotoAmpliada ? (
            <Image
              accessibilityLabel="Fotografia ampliada del perro reportado"
              contentFit="contain"
              source={fotoAmpliada}
              style={{ height: '85%', width: '100%' }}
            />
          ) : null}
          <Text style={{ color: '#ffffff', fontSize: 15, marginTop: 18 }}>
            Tocá para cerrar
          </Text>
        </Pressable>
      </Modal>
    </>
  );
}

function formatearDireccion(direccion: Location.LocationGeocodedAddress) {
  if (direccion.formattedAddress) {
    return direccion.formattedAddress;
  }

  const calle = [direccion.street, direccion.streetNumber].filter(Boolean).join(' ');
  const partes = [calle, direccion.city, direccion.region].filter(Boolean);

  return partes.join(', ') || 'Direccion no disponible';
}
