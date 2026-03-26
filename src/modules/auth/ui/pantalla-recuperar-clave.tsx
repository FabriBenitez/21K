import { router } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { CampoFormulario } from '@/src/shared/ui/campo-formulario';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

export function PantallaRecuperarClave() {
  const [correoElectronico, setCorreoElectronico] = useState('');

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <Pressable style={estilos.botonVolver} onPress={() => router.back()}>
        <ArrowLeft color={coloresBase.textoPrincipalOscuro} size={30} strokeWidth={2.4} />
      </Pressable>

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

      <BotonPrincipal titulo="Enviar enlace" />
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
