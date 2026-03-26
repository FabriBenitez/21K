import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

interface PropiedadesBotonPrincipal {
  titulo: string;
  onPress?: () => void;
  estilo?: ViewStyle;
}

export function BotonPrincipal({ titulo, onPress, estilo }: PropiedadesBotonPrincipal) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        estilos.boton,
        sombrasNeon.glowSuave,
        pressed ? estilos.botonPresionado : null,
        estilo,
      ]}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <ArrowRight color={coloresBase.fondoOscuro} size={28} strokeWidth={2.4} />
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
  titulo: {
    fontSize: 38 / 2,
    fontWeight: '700',
    color: coloresBase.fondoOscuro,
    letterSpacing: 0.3,
  },
});
