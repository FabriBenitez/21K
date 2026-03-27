import { router } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { rutasApp } from '@/src/shared/navigation/rutas-app';
import { useEstadoApp } from '@/src/shared/state/contexto-app';
import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { CampoFormulario } from '@/src/shared/ui/campo-formulario';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

export function PantallaRecuperarClave() {
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { enviarRecuperacionClave } = useEstadoApp();

  const enviarEnlaceRecuperacion = async () => {
    if (enviando) {
      return;
    }

    if (!correoElectronico.trim()) {
      Alert.alert('Correo requerido', 'Ingresa un correo valido para continuar.');
      return;
    }

    setEnviando(true);
    const resultado = await enviarRecuperacionClave(correoElectronico);
    setEnviando(false);

    if (!resultado.ok) {
      Alert.alert('No pudimos enviar el enlace', resultado.mensaje ?? 'Intentalo nuevamente.');
      return;
    }

    Alert.alert('Correo enviado', resultado.mensaje ?? 'Revisa tu bandeja de entrada.', [
      {
        text: 'Volver a login',
        onPress: () => router.replace(rutasApp.auth.login),
      },
    ]);
  };

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <Pressable style={estilos.botonVolver} onPress={() => router.back()}>
        <ArrowLeft color={coloresBase.textoPrincipalOscuro} size={30} strokeWidth={2.4} />
      </Pressable>

      <View style={estilos.logoMarcaContenedor}>
        <Image
          source={require('../../../../assets/images/logo-21k.png')}
          style={estilos.logoMarcaImagen}
          resizeMode="contain"
        />
      </View>

      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>Olvidaste tu contrasena?</Text>
        <Text style={estilos.subtitulo}>
          No te preocupes. Ingresa tu correo electronico y te enviaremos un enlace para recuperar
          el acceso.
        </Text>
      </View>

      <CampoFormulario
        etiqueta="Correo electronico"
        placeholder="correo@ejemplo.com"
        valor={correoElectronico}
        onChangeText={setCorreoElectronico}
        icono={Mail}
        teclado="email-address"
      />

      <BotonPrincipal
        titulo={enviando ? 'Enviando enlace...' : 'Enviar enlace'}
        onPress={enviarEnlaceRecuperacion}
        cargando={enviando}
        deshabilitado={enviando}
      />
    </ContenedorPantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    minHeight: '100%',
    paddingTop: espaciadoBase.sm,
    justifyContent: 'flex-start',
  },
  botonVolver: {
    width: 56,
    height: 56,
    borderRadius: radiosBase.pill,
    backgroundColor: '#171A22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#262B37',
  },
  logoMarcaContenedor: {
    width: '100%',
    minHeight: 104,
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#262B38',
    backgroundColor: '#0B0D14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarcaImagen: {
    width: '88%',
    height: 84,
  },
  encabezado: {
    gap: espaciadoBase.sm,
    marginTop: espaciadoBase.xs,
  },
  titulo: {
    fontSize: 44,
    color: coloresBase.textoPrincipalOscuro,
    fontWeight: '800',
    lineHeight: 50,
  },
  subtitulo: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 34 / 2,
    lineHeight: 30,
  },
});
