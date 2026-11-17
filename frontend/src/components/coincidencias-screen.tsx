import SearchIcon from '@expo/material-symbols/search.xml';
import VisibilityIcon from '@expo/material-symbols/visibility.xml';
import { Host, Icon } from '@expo/ui/jetpack-compose';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarraNavegacion } from '@/components/barra-navegacion';
import { useAuth } from '@/components/auth-provider';
import { colors } from '@/constants/colors';
import { listarMisReportes, type ReportePropio } from '@/lib/api';

export function CoincidenciasScreen() {
  const { sesion } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [reportes, setReportes] = useState<ReportePropio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sesion) {
      return;
    }

    const controller = new AbortController();

    // Trae solamente los reportes creados por el usuario que inicio sesion.
    const cargarReportes = async () => {
      try {
        const reportesRecibidos = await listarMisReportes(
          sesion.access_token,
          controller.signal,
        );

        setReportes(reportesRecibidos);
        setError(null);
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

    cargarReportes();

    return () => controller.abort();
  }, [sesion]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        backgroundColor: colors.background,
        flexGrow: 1,
        paddingBottom: insets.bottom,
      }}>
      <StatusBar style="light" />
      {/* Parte de arriba del celular */}
      <View style={{ backgroundColor: colors.primary, height: insets.top }} />

      <View style={{ backgroundColor: colors.background, flex: 1 }}>
        {/* Titulo de la pantalla */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            paddingBottom: 24,
            paddingHorizontal: 24,
            paddingTop: 32,
          }}>
          <Text selectable style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
            Tus reportes
          </Text>
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.tagBackground,
              borderRadius: 999,
              marginTop: 10,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}>
            <Text selectable style={{ color: colors.tagText, fontSize: 13, fontWeight: '600' }}>
              Elige uno de tus reportes
            </Text>
          </View>
        </View>

        {/* Reportes del usuario */}
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          {cargando ? <ActivityIndicator color={colors.primary} /> : null}

          {error ? (
            <Text selectable style={{ color: '#b3261e', fontSize: 15 }}>
              {error}
            </Text>
          ) : null}

          {!cargando && !error && reportes.length === 0 ? (
            <Text selectable style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
              Todavía no creaste ningún reporte.
            </Text>
          ) : null}

          {reportes.map((reporte) => (
            // Cada fila resume un reporte del usuario.
            <View
              key={reporte.idReporte}
              style={{
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
                gap: 12,
                paddingVertical: 18,
              }}>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                {/* Primera foto del reporte */}
                {reporte.urlFotografia ? (
                  <Image
                    contentFit="contain"
                    source={{ uri: reporte.urlFotografia }}
                    style={{ backgroundColor: colors.surface, borderRadius: 12, height: 88, width: 88 }}
                  />
                ) : (
                  <View
                    style={{
                      backgroundColor: colors.tagBackground,
                      borderRadius: 12,
                      height: 88,
                      width: 88,
                    }}
                  />
                )}

                <View style={{ flex: 1, gap: 5 }}>
                  <Text selectable style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>
                    {reporte.nombre ?? 'Sin nombre'}
                  </Text>
                  {/* Tipo de reporte */}
                  <View
                    style={{
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                      backgroundColor:
                        reporte.tipo === 'PERDIDO'
                          ? colors.lostBackground
                          : colors.sightingBackground,
                      borderColor:
                        reporte.tipo === 'PERDIDO' ? colors.lostText : colors.sightingText,
                      borderRadius: 999,
                      borderWidth: 1,
                      flexDirection: 'row',
                      gap: 4,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}>
                    <Host matchContents>
                      <Icon
                        contentDescription={reporte.tipo === 'PERDIDO' ? 'Perdido' : 'Avistamiento'}
                        size={16}
                        source={reporte.tipo === 'PERDIDO' ? SearchIcon : VisibilityIcon}
                        tint={reporte.tipo === 'PERDIDO' ? colors.lostText : colors.sightingText}
                      />
                    </Host>
                    <Text
                      selectable
                      style={{
                        color: reporte.tipo === 'PERDIDO' ? colors.lostText : colors.sightingText,
                        fontSize: 13,
                        fontWeight: '600',
                      }}>
                      {reporte.tipo === 'PERDIDO' ? 'Perdido' : 'Avistamiento'}
                    </Text>
                  </View>
                  <Text selectable style={{ color: colors.textSecondary, fontSize: 14 }}>
                    {formatearFecha(reporte.fechaHora)}
                  </Text>
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: colors.tagStrongBackground,
                      borderRadius: 999,
                      paddingHorizontal: 9,
                      paddingVertical: 3,
                    }}>
                    <Text
                      selectable
                      style={{ color: colors.tagStrongText, fontSize: 12, fontWeight: '600' }}>
                      {reporte.estado === 'ACTIVO' ? 'Activo' : reporte.estado}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Enlace para abrir las coincidencias de este reporte */}
              <Pressable
                accessibilityLabel={`Ver coincidencias del reporte ${reporte.nombre ?? 'sin nombre'}`}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/coincidencias/[idReporte]',
                    params: { idReporte: reporte.idReporte },
                  })
                }
                style={{
                  alignSelf: 'flex-end',
                  paddingBottom: 2,
                  paddingTop: 2,
                }}>
                <Text style={{ color: colors.action, fontSize: 15, fontWeight: '700' }}>
                  Ver coincidencias
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Barra de navegacion con coincidencias seleccionada */}
        <BarraNavegacion seccionActiva="coincidencias" />
      </View>
    </ScrollView>
  );
}

function formatearFecha(fechaHora: string) {
  const fecha = new Date(fechaHora);

  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(fecha)
    .replace(',', ' ·');
}
