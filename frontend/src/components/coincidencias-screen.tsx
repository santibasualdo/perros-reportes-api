import ChevronIcon from '@expo/material-symbols/chevron_right.xml';
import ScheduleIcon from '@expo/material-symbols/schedule.xml';
import { Host, Icon } from '@expo/ui/jetpack-compose';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  useFocusEffect(useCallback(() => {
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
  }, [sesion]));

  return (
    <View style={{ backgroundColor: '#F5F3ED', flex: 1 }}>
      <StatusBar style="dark" />
      {/* Parte de arriba del celular */}
      <View style={{ height: insets.top }} />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>
        {/* Titulo y explicacion breve */}
        <View
          style={{
            paddingBottom: 12,
            paddingHorizontal: 20,
            paddingTop: 28,
          }}>
          <Text selectable style={{ color: colors.text, fontFamily: 'serif', fontSize: 30, fontWeight: '700' }}>
            Tus reportes
          </Text>
          <Text selectable style={{ color: colors.textSecondary, fontSize: 15, lineHeight: 21, marginTop: 7 }}>
            Seleccioná un reporte para ver sus coincidencias.
          </Text>
        </View>

        {/* Tarjetas de los reportes del usuario */}
        <View style={{ flex: 1, gap: 12, paddingHorizontal: 14, paddingTop: 12 }}>
          {cargando ? <ActivityIndicator color={colors.primary} style={{ marginTop: 36 }} /> : null}

          {error ? (
            <Text selectable style={{ color: colors.error, fontSize: 15, marginTop: 28, textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}

          {!cargando && !error && reportes.length === 0 ? (
            <Text selectable style={{ color: colors.textSecondary, fontSize: 16, marginTop: 36, textAlign: 'center' }}>
              Todavía no creaste ningún reporte.
            </Text>
          ) : null}

          {reportes.map((reporte) => (
            <Pressable
              key={reporte.idReporte}
              accessibilityLabel={`Ver coincidencias del reporte ${reporte.nombre ?? 'sin nombre'}`}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/coincidencias/[idReporte]',
                  params: { idReporte: reporte.idReporte, nombre: reporte.nombre ?? '', tipo: reporte.tipo },
                })
              }
              style={({ pressed }) => ({
                opacity: pressed ? 0.72 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}>
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: '#FFFAF3',
                  borderColor: '#E9E2D6',
                  borderRadius: 18,
                  borderWidth: 1,
                  flexDirection: 'row',
                  gap: 12,
                  padding: 10,
                }}>
                {/* Primera foto del reporte */}
                {reporte.urlFotografia ? (
                  <Image
                    contentFit="contain"
                    source={{ uri: reporte.urlFotografia }}
                    style={{
                      backgroundColor: '#FFFAF3',
                      borderRadius: 12,
                      height: 98,
                      width: 88,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      backgroundColor: colors.tagBackground,
                      borderRadius: 12,
                      height: 98,
                      width: 88,
                    }}
                  />
                )}

                <View style={{ flex: 1, justifyContent: 'center' }}>
                  {/* Primero mostramos el tipo y despues el nombre del perro. */}
                  <EtiquetaTipo tipo={reporte.tipo} />
                  <Text
                    numberOfLines={2}
                    selectable
                    style={{ color: colors.text, fontFamily: 'serif', fontSize: 22, fontWeight: '700', marginTop: 6 }}>
                    {reporte.nombre ?? 'Sin nombre'}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                    <Host matchContents>
                      <Icon source={ScheduleIcon} size={14} tint={colors.textSecondary} />
                    </Host>
                  <Text selectable style={{ flex: 1, color: colors.textSecondary, fontSize: 13 }}>
                    {formatearFecha(reporte.fechaHora)} ·{' '}
                    <Text style={{ color: reporte.estado === 'ACTIVO' ? colors.sightingText : colors.textSecondary, fontWeight: '700' }}>
                      {reporte.estado === 'ACTIVO' ? 'Activo' : reporte.estado}
                    </Text>
                  </Text>
                  </View>

                  <Text style={{ color: colors.action, fontSize: 13, fontWeight: '700', marginTop: 4 }}>
                    Ver coincidencias
                  </Text>
                </View>
                <Host matchContents>
                  <Icon source={ChevronIcon} size={22} tint={colors.lostMapPin} />
                </Host>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Barra de navegacion con coincidencias seleccionada */}
    </View>
  );
}

function EtiquetaTipo({ tipo }: { tipo: ReportePropio['tipo'] }) {
  const perdido = tipo === 'PERDIDO';
  const colorFondo = perdido ? colors.lostBackground : colors.sightingBackground;
  const colorTexto = perdido ? colors.lostText : colors.sightingText;

  return (
    <View
      style={{
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: colorFondo,
        borderRadius: 999,
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 4,
      }}>
      <Text selectable style={{ color: colorTexto, fontSize: 12, fontWeight: '700' }}>
        {perdido ? 'Perdido' : 'Avistamiento'}
      </Text>
    </View>
  );
}

function formatearFecha(fechaHora: string) {
  const fecha = new Date(fechaHora);

  if (Number.isNaN(fecha.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(fecha);
}
