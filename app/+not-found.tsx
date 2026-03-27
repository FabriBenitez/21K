import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { rutasApp } from '@/src/shared/navigation/rutas-app';
import { useEstadoApp } from '@/src/shared/state/contexto-app';

export default function RutaNoEncontrada() {
  const { estadoSesion } = useEstadoApp();
  const destino =
    estadoSesion === 'autenticado'
      ? rutasApp.tabs.raiz
      : estadoSesion === 'cargando'
        ? '/'
        : rutasApp.auth.login;

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.codigo}>404</Text>
      <Text style={estilos.titulo}>Pantalla no encontrada</Text>
      <Text style={estilos.descripcion}>
        La ruta a la que intentaste entrar no existe en esta version de la app.
      </Text>
      <Link href={destino} style={estilos.enlace}>
        Volver al inicio
      </Link>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
    backgroundColor: '#0A0C12',
  },
  codigo: {
    fontSize: 54,
    fontWeight: '900',
    color: '#D8FF3E',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F4F7FF',
  },
  descripcion: {
    color: '#A3A9BB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  enlace: {
    marginTop: 10,
    color: '#D8FF3E',
    fontSize: 16,
    fontWeight: '700',
  },
});
