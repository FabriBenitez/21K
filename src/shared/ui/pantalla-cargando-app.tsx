import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

interface PropiedadesPantallaCargandoApp {
  mensaje?: string;
}

export function PantallaCargandoApp({ mensaje = 'Preparando tu sesion...' }: PropiedadesPantallaCargandoApp) {
  return (
    <View style={estilos.contenedor}>
      <Image
        source={require('../../../assets/images/logo-21k.png')}
        style={estilos.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#D8FF3E" />
      <Text style={estilos.mensaje}>{mensaje}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#0A0C12',
  },
  logo: {
    width: 220,
    height: 96,
  },
  mensaje: {
    color: '#F4F7FF',
    fontSize: 16,
    fontWeight: '600',
  },
});
