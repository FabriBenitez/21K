import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BarChart3, CalendarDays, Home, Plus, UserRound } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

interface ConfiguracionTab {
  etiqueta: string;
  Icono: ComponentType<{ color: string; size: number; strokeWidth?: number }>;
}

const configuracionTabs: Record<string, ConfiguracionTab> = {
  index: { etiqueta: 'INICIO', Icono: Home },
  entrenamientos: { etiqueta: 'DIARIO', Icono: CalendarDays },
  agregar: { etiqueta: '', Icono: Plus },
  estadisticas: { etiqueta: 'ESTAD.', Icono: BarChart3 },
  perfil: { etiqueta: 'PERFIL', Icono: UserRound },
};

export function BarraTabsNeon({ state, descriptors, navigation }: BottomTabBarProps) {
  const rutasVisibles = state.routes.filter((ruta) => configuracionTabs[ruta.name]);

  return (
    <View style={estilos.areaFlotante} pointerEvents="box-none">
      <View style={estilos.contenedor}>
        {rutasVisibles.map((ruta) => {
          const indice = state.routes.findIndex((item) => item.key === ruta.key);
          const estaActivo = state.index === indice;
          const configuracion = configuracionTabs[ruta.name];
          const opciones = descriptors[ruta.key]?.options;
          const Icono = configuracion.Icono;
          const esBotonCentral = ruta.name === 'agregar';

          return (
            <Pressable
              key={ruta.key}
              accessibilityRole="button"
              onPress={() => navigation.navigate(ruta.name)}
              style={({ pressed }) => [
                esBotonCentral ? estilos.botonCentral : estilos.botonTab,
                esBotonCentral && estaActivo ? sombrasNeon.glowFuerte : null,
                pressed && !esBotonCentral ? estilos.botonPresionado : null,
              ]}>
              {esBotonCentral ? (
                <View style={estilos.fondoBotonCentral}>
                  <Icono color={coloresBase.fondoOscuro} size={30} strokeWidth={2.5} />
                </View>
              ) : (
                <>
                  <Icono
                    color={estaActivo ? coloresBase.acentoNeon : '#8E95AB'}
                    size={22}
                    strokeWidth={estaActivo ? 2.5 : 2.2}
                  />
                  <Text style={[estilos.etiqueta, estaActivo ? estilos.etiquetaActiva : null]}>
                    {(opciones?.title as string) ?? configuracion.etiqueta}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  areaFlotante: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 6,
    alignItems: 'center',
  },
  contenedor: {
    width: '92%',
    minHeight: 78,
    borderRadius: radiosBase.pill,
    backgroundColor: 'rgba(16,18,25,0.98)',
    borderWidth: 1,
    borderColor: '#232837',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: espaciadoBase.xs,
  },
  botonTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  botonPresionado: {
    opacity: 0.75,
  },
  etiqueta: {
    color: '#8E95AB',
    fontSize: 10,
    letterSpacing: 0.7,
    fontWeight: '700',
  },
  etiquetaActiva: {
    color: coloresBase.acentoNeon,
  },
  botonCentral: {
    width: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  fondoBotonCentral: {
    width: 68,
    height: 68,
    borderRadius: radiosBase.pill,
    backgroundColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
