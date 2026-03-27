import { Pressable, StyleSheet, Text, View } from 'react-native';

interface PropiedadesPantallaErrorGlobal {
  descripcion?: string;
  onReintentar: () => void;
}

export function PantallaErrorGlobal({ descripcion, onReintentar }: PropiedadesPantallaErrorGlobal) {
  return (
    <View style={estilos.contenedor}>
      <View style={estilos.tarjeta}>
        <Text style={estilos.etiqueta}>ERROR</Text>
        <Text style={estilos.titulo}>Algo salio mal en la app.</Text>
        <Text style={estilos.descripcion}>
          {descripcion ?? 'Estamos preparando una recuperacion segura. Podes reintentar ahora.'}
        </Text>

        <Pressable style={estilos.boton} onPress={onReintentar}>
          <Text style={estilos.textoBoton}>Reintentar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#0A0C12',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  tarjeta: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#171922',
    borderWidth: 1,
    borderColor: '#2A3042',
    padding: 20,
    gap: 12,
  },
  etiqueta: {
    color: '#D8FF3E',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  titulo: {
    color: '#F4F7FF',
    fontSize: 24,
    fontWeight: '800',
  },
  descripcion: {
    color: '#A3A9BB',
    fontSize: 16,
    lineHeight: 24,
  },
  boton: {
    marginTop: 8,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#D8FF3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoBoton: {
    color: '#111723',
    fontSize: 16,
    fontWeight: '800',
  },
});
