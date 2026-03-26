import { StyleSheet, Text, View } from 'react-native';

import { coloresBase, espaciadoBase } from '@/src/shared/theme/tokens-ui';

interface PropiedadesSeparadorSocial {
  texto: string;
}

export function SeparadorSocial({ texto }: PropiedadesSeparadorSocial) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.linea} />
      <Text style={estilos.texto}>{texto}</Text>
      <View style={estilos.linea} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.md,
  },
  linea: {
    flex: 1,
    height: 1,
    backgroundColor: '#242837',
  },
  texto: {
    color: coloresBase.textoSecundarioOscuro,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 2,
  },
});
