import { LinearGradient } from 'expo-linear-gradient';
import { type PropsWithChildren } from 'react';
import { Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { coloresBase, espaciadoBase } from '@/src/shared/theme/tokens-ui';

export type ModoContenedor = 'oscuro' | 'claro';

interface PropiedadesContenedorPantalla extends PropsWithChildren {
  modo?: ModoContenedor;
  desplazable?: boolean;
  estiloContenido?: StyleProp<ViewStyle>;
}

export function ContenedorPantalla({
  children,
  modo = 'oscuro',
  desplazable = true,
  estiloContenido,
}: PropiedadesContenedorPantalla) {
  const estiloFondo = modo === 'oscuro' ? estilos.fondoOscuro : estilos.fondoClaro;
  const estiloBaseContenido = modo === 'oscuro' ? estilos.contenidoOscuro : estilos.contenidoClaro;

  return (
    <SafeAreaView style={[estilos.pantalla, estiloFondo]}>
      {modo === 'oscuro' ? <CapasNeonOscuras /> : null}
      {desplazable ? (
        <ScrollView
          style={estilos.pantalla}
          contentContainerStyle={[estiloBaseContenido, estiloContenido]}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[estiloBaseContenido, estiloContenido]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

function CapasNeonOscuras() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={['rgba(216,255,62,0.08)', 'rgba(216,255,62,0)']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.6 }}
        style={estilos.glowSuperior}
      />
      <LinearGradient
        colors={['rgba(216,255,62,0.07)', 'rgba(216,255,62,0)']}
        start={{ x: 0.4, y: 1 }}
        end={{ x: 0.8, y: 0.3 }}
        style={estilos.glowInferior}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  fondoOscuro: {
    backgroundColor: coloresBase.fondoOscuro,
  },
  fondoClaro: {
    backgroundColor: coloresBase.fondoClaro,
  },
  contenidoOscuro: {
    paddingHorizontal: espaciadoBase.lg,
    paddingTop: espaciadoBase.lg,
    paddingBottom: Platform.OS === 'ios' ? 150 : 138,
    gap: espaciadoBase.lg,
  },
  contenidoClaro: {
    paddingHorizontal: espaciadoBase.lg,
    paddingTop: espaciadoBase.lg,
    paddingBottom: Platform.OS === 'ios' ? 150 : 138,
    gap: espaciadoBase.lg,
  },
  glowSuperior: {
    position: 'absolute',
    top: -130,
    left: -60,
    right: -60,
    height: 320,
    borderRadius: 240,
  },
  glowInferior: {
    position: 'absolute',
    bottom: -160,
    left: -80,
    right: -80,
    height: 360,
    borderRadius: 260,
  },
});



