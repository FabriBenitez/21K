import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

interface PropiedadesBotonPrincipal {
  titulo: string;
  onPress?: () => void;
  estilo?: ViewStyle;
  deshabilitado?: boolean;
  cargando?: boolean;
}

export function BotonPrincipal({
  titulo,
  onPress,
  estilo,
  deshabilitado = false,
  cargando = false,
}: PropiedadesBotonPrincipal) {
  const bloqueado = deshabilitado || cargando;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={bloqueado}
      onPress={bloqueado ? undefined : onPress}
      style={({ pressed }) => [
        estilos.boton,
        sombrasNeon.glowSuave,
        pressed && !bloqueado ? estilos.botonPresionado : null,
        bloqueado ? estilos.botonDeshabilitado : null,
        estilo,
      ]}>
      <Text style={estilos.titulo}>{titulo}</Text>
      {cargando ? (
        <ActivityIndicator size="small" color={coloresBase.fondoOscuro} />
      ) : (
        <ArrowRight color={coloresBase.fondoOscuro} size={28} strokeWidth={2.4} />
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    minHeight: 66,
    borderRadius: radiosBase.lg,
    backgroundColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: espaciadoBase.md,
    paddingHorizontal: espaciadoBase.lg,
  },
  botonPresionado: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
  },
  botonDeshabilitado: {
    opacity: 0.65,
  },
  titulo: {
    fontSize: 38 / 2,
    fontWeight: '700',
    color: coloresBase.fondoOscuro,
    letterSpacing: 0.3,
  },
});
