import AddIcon from '@expo/material-symbols/add.xml';
import ChatBubbleIcon from '@expo/material-symbols/chat_bubble.xml';
import DescriptionIcon from '@expo/material-symbols/description.xml';
import LocationOnIcon from '@expo/material-symbols/location_on.xml';
import PersonIcon from '@expo/material-symbols/person.xml';
import { Host, Icon } from '@expo/ui/jetpack-compose';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { colors } from '@/constants/colors';

type BarraNavegacionProps = {
  seccionActiva: 'inicio' | 'coincidencias' | 'perfil';
};

export function BarraNavegacion({ seccionActiva }: BarraNavegacionProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        // Fondo alrededor de la barra para coincidir con la pantalla.
        backgroundColor: colors.background,
        paddingTop: 12,
      }}>
      {/* Barra flotante con las acciones principales */}
      <View
        style={{
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: 0,
          borderWidth: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 8,
          paddingVertical: 8,
          width: '100%',
        }}>
        <OpcionNavegacion
          activa={seccionActiva === 'inicio'}
          etiqueta="Inicio"
          icono={LocationOnIcon}
          ruta="/"
        />
        <OpcionNavegacion
          activa={seccionActiva === 'coincidencias'}
          etiqueta="Coincidencias"
          icono={DescriptionIcon}
          ruta="/coincidencias"
        />

        {/* Accion principal para crear un reporte */}
        <Link href="/reportes/nuevo" asChild>
          <Pressable
            accessibilityLabel="Crear reporte"
            accessibilityRole="button"
            style={{
              alignItems: 'center',
              backgroundColor: colors.action,
              borderColor: colors.surface,
              borderRadius: 32,
              borderWidth: 4,
              height: 60,
              justifyContent: 'center',
          transform: [{ translateY: -16 }],
              width: 60,
            }}>
            <Host matchContents>
              <Icon
                contentDescription="Crear reporte"
                size={32}
                source={AddIcon}
                tint={colors.onAction}
              />
            </Host>
          </Pressable>
        </Link>

        {/* Mensajes se habilitara cuando exista el listado de conversaciones */}
        <View style={{ alignItems: 'center', height: 52, justifyContent: 'center', width: 54 }}>
          <Host matchContents>
            <Icon
              contentDescription="Mensajes"
              size={28}
              source={ChatBubbleIcon}
              tint={colors.textSecondary}
            />
          </Host>
        </View>
        <OpcionNavegacion
          activa={seccionActiva === 'perfil'}
          etiqueta="Perfil"
          icono={PersonIcon}
          ruta="/perfil"
        />
      </View>
    </View>
  );
}

function OpcionNavegacion({
  activa,
  etiqueta,
  icono,
  ruta,
}: {
  activa: boolean;
  etiqueta: string;
  icono: typeof LocationOnIcon;
  ruta: '/' | '/coincidencias' | '/perfil';
}) {
  return (
    <Link href={ruta} replace asChild>
      <Pressable
        accessibilityLabel={etiqueta}
        accessibilityRole="button"
        style={{ alignItems: 'center', height: 52, justifyContent: 'center', width: 54 }}>
        {/* Circulo e icono de la seccion actual */}
        <View
          style={{
            alignItems: 'center',
            backgroundColor: activa ? colors.primary : colors.surface,
            borderRadius: 20,
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}>
          <Host matchContents>
            <Icon
              contentDescription={etiqueta}
              size={26}
              source={icono}
              tint={activa ? colors.surface : colors.textSecondary}
            />
          </Host>
        </View>
      </Pressable>
    </Link>
  );
}
