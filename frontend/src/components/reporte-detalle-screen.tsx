import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeftIcon, CalendarBlankIcon, MapPinIcon } from 'phosphor-react-native';
import { type ReactNode, useEffect, useState } from 'react';
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
import { colors } from '@/constants/colors';
import { obtenerDireccion } from '@/lib/direccion';
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
  const anchoFotoCarrusel = anchoPantalla;
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
            const direccion = await obtenerDireccion(
              reporteRecibido.ubicacion.latitud,
              reporteRecibido.ubicacion.longitud,
            );
            if (!controller.signal.aborted) setDireccionCalculada(direccion);
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
      <StatusBar style="light" />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ backgroundColor: colors.reportDetailBackground, flexGrow: 1, paddingBottom: insets.bottom + 24 }}>
        {/* La galería ocupa el ancho de la pantalla; cada foto se puede ampliar. */}
        <View style={{ backgroundColor: colors.primary, height: 300 + insets.top }}>
          {reporte && reporte.fotografias.length > 0 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(evento) => setFotoActual(Math.round(evento.nativeEvent.contentOffset.x / anchoFotoCarrusel))}>
              {reporte.fotografias.map((fotografia, indice) => (
                <Pressable key={fotografia.idFotografia} accessibilityRole="button"
                  accessibilityLabel={`Ampliar fotografía ${indice + 1} del perro reportado`}
                  onPress={() => setFotoAmpliada(fotografia.url)}>
                  <Image source={fotografia.url} contentFit="cover"
                    style={{ width: anchoFotoCarrusel, height: 300 + insets.top, backgroundColor: colors.reportDetailSection }} />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              {cargando ? <ActivityIndicator color={colors.surface} /> : <Text style={{ color: colors.surface }}>Sin fotografías</Text>}
            </View>
          )}
          {/* Un fondo oscuro mantiene legible la barra de estado sobre cualquier foto. */}
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: 'rgba(0, 0, 0, 0.35)' }} />
          <Pressable accessibilityLabel="Volver a la pantalla anterior" accessibilityRole="button" onPress={() => router.back()}
            style={{ alignItems: 'center', backgroundColor: colors.reportCardBackground, borderRadius: 24, height: 48, justifyContent: 'center', left: 18, position: 'absolute', top: insets.top + 12, width: 48 }}>
            <ArrowLeftIcon color={colors.primary} size={24} />
          </Pressable>
          {reporte && reporte.fotografias.length > 0 ? (
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', borderRadius: 20, bottom: 22, paddingHorizontal: 12, paddingVertical: 6, position: 'absolute', right: 18 }}>
              <Text style={{ color: colors.surface, fontSize: 13 }}>{fotoActual + 1} / {reporte.fotografias.length}</Text>
            </View>
          ) : null}
        </View>

        <View style={{ backgroundColor: colors.reportDetailBackground, borderTopLeftRadius: 18, borderTopRightRadius: 18, flex: 1, gap: 14, marginTop: -10, paddingHorizontal: 20, paddingTop: 20 }}>
          {error ? <Text selectable style={{ color: colors.error, fontSize: 15 }}>{error}</Text> : null}
          {reporte ? (
            <>
              <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
                <Image source={require('../../assets/images/logo-huellas-transparente.png')} contentFit="contain" style={{ height: 32, width: 32 }} />
                <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>Huellas a Casa</Text>
              </View>
              <View style={{ gap: 9 }}>
                <View style={{ alignSelf: 'flex-start', backgroundColor: reporte.tipo === 'PERDIDO' ? colors.lostBackground : colors.sightingBackground, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: reporte.tipo === 'PERDIDO' ? colors.lostText : colors.sightingText, fontWeight: '700' }}>
                    {reporte.tipo === 'PERDIDO' ? 'Perdido' : 'Avistamiento'}
                  </Text>
                </View>
                <Text selectable style={{ color: colors.primary, fontSize: 32, fontWeight: '700' }}>{reporte.nombre?.trim() || 'Sin nombre'}</Text>
                {reporte.ubicacion ? (
                  <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
                    <MapPinIcon color={colors.primary} size={20} />
                    <Text selectable style={{ color: colors.text, flex: 1, fontSize: 15 }}>
                      {reporte.ubicacion.direccion || (cargandoDireccion ? 'Buscando dirección...' : direccionCalculada ?? 'Dirección no disponible')}
                    </Text>
                  </View>
                ) : null}
                <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
                  <CalendarBlankIcon color={colors.primary} size={20} />
                  <Text selectable style={{ color: colors.text, fontSize: 15 }}>{new Date(reporte.fechaHora).toLocaleString('es-AR')}</Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Estado: {reporte.estado === 'ACTIVO' ? 'Activo' : reporte.estado}</Text>
              </View>

              <SeccionDetalle titulo="Descripción">
                <Text selectable style={{ color: colors.text, fontSize: 15, lineHeight: 22 }}>{reporte.descripcion || 'Sin descripción'}</Text>
              </SeccionDetalle>
              <SeccionDetalle titulo="Características">
                {reporte.caracteristicas ? (
                  <>
                    <DatoDetalle etiqueta="Tamaño" valor={reporte.caracteristicas.tamano} />
                    <DatoDetalle etiqueta="Color" valor={reporte.caracteristicas.color} />
                    <DatoDetalle etiqueta="Sexo" valor={reporte.caracteristicas.sexo === 'MACHO' ? 'Macho' : reporte.caracteristicas.sexo === 'HEMBRA' ? 'Hembra' : 'Desconocido'} />
                    <DatoDetalle etiqueta="Raza" valor={reporte.caracteristicas.raza || 'Desconocida'} />
                    <DatoDetalle etiqueta="Señas particulares" valor={reporte.caracteristicas.senasParticulares || 'No registradas'} />
                  </>
                ) : <Text style={{ color: colors.textSecondary }}>Sin características registradas</Text>}
              </SeccionDetalle>
              {reporte.ubicacion ? (
                <SeccionDetalle titulo="Ubicación">
                  <Text selectable style={{ color: colors.text, fontSize: 15 }}>
                    {reporte.ubicacion.direccion || (cargandoDireccion ? 'Buscando dirección...' : direccionCalculada ?? 'Dirección no disponible')}
                  </Text>
                  <Pressable accessibilityRole="button" onPress={() => router.replace({ pathname: '/', params: {
                    latitud: String(reporte.ubicacion?.latitud), longitud: String(reporte.ubicacion?.longitud),
                  } })} style={{ alignSelf: 'flex-start', justifyContent: 'center', minHeight: 44 }}>
                    <Text style={{ color: colors.action, fontWeight: '700' }}>Ver en el mapa →</Text>
                  </Pressable>
                </SeccionDetalle>
              ) : null}
              {idCoincidencia ? (
                <View style={{ gap: 10 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Coincidencia: {estadoCoincidencia ?? 'PENDIENTE'}</Text>
                  {estadoCoincidencia === 'PENDIENTE' ? (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Pressable accessibilityRole="button" disabled={procesandoCoincidencia}
                        onPress={() => actualizarEstadoCoincidencia('descartar')}
                        style={{ alignItems: 'center', borderColor: colors.error, borderRadius: 25, borderWidth: 1, flex: 1, justifyContent: 'center', minHeight: 48, opacity: procesandoCoincidencia ? 0.6 : 1 }}>
                        <Text style={{ color: colors.error, fontWeight: '700' }}>Rechazar</Text>
                      </Pressable>
                      <Pressable accessibilityRole="button" disabled={procesandoCoincidencia}
                        onPress={() => actualizarEstadoCoincidencia('confirmar')}
                        style={{ alignItems: 'center', backgroundColor: colors.action, borderRadius: 25, flex: 1, justifyContent: 'center', minHeight: 48, opacity: procesandoCoincidencia ? 0.6 : 1 }}>
                        <Text style={{ color: colors.onAction, fontWeight: '700' }}>Confirmar</Text>
                      </Pressable>
                    </View>
                  ) : null}
                  {estadoCoincidencia === 'CONFIRMADA' ? (
                    <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/conversaciones/[idCoincidencia]', params: { idCoincidencia } })}
                      style={{ alignItems: 'center', backgroundColor: colors.action, borderRadius: 25, justifyContent: 'center', minHeight: 48 }}>
                      <Text style={{ color: colors.onAction, fontWeight: '700' }}>Abrir chat</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => setFotoAmpliada(null)}
        statusBarTranslucent
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

// Compartimos el formato de las secciones para que mantengan el mismo aspecto.
function SeccionDetalle({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.reportDetailSection, borderRadius: 16, overflow: 'hidden' }}>
      <Text style={{ backgroundColor: colors.reportDetailSectionHeader, color: colors.primary, fontSize: 17, fontWeight: '700', paddingHorizontal: 16, paddingVertical: 8 }}>{titulo}</Text>
      <View style={{ gap: 4, padding: 16 }}>{children}</View>
    </View>
  );
}

function DatoDetalle({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 5 }}>
      <Text style={{ color: colors.textSecondary, flex: 1, fontSize: 14 }}>{etiqueta}</Text>
      <Text selectable style={{ color: colors.text, flex: 1.2, fontSize: 14 }}>{valor}</Text>
    </View>
  );
}

