import { Link, router } from 'expo-router';
import { Bolt, Mail, Shield } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { CampoFormulario } from '@/src/shared/ui/campo-formulario';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { SeparadorSocial } from '@/src/shared/ui/separador-social';
import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

export function PantallaLogin() {
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [clave, setClave] = useState('');

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.iconoMarca}>
        <Bolt color="#111" size={34} strokeWidth={2.8} />
      </View>

      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>
          Bienvenido <Text style={estilos.tituloAcento}>de nuevo.</Text>
        </Text>
        <Text style={estilos.subtitulo}>Inicia sesion para continuar tu camino al 21K.</Text>
      </View>

      <View style={estilos.formulario}>
        <CampoFormulario
          etiqueta="Correo electronico"
          placeholder="nombre@ejemplo.com"
          valor={correoElectronico}
          onChangeText={setCorreoElectronico}
          icono={Mail}
          teclado="email-address"
        />
        <CampoFormulario
          etiqueta="Contrasena"
          textoDerechaEtiqueta="OLVIDASTE?"
          onPressTextoDerechaEtiqueta={() => router.push('/(auth)/recuperar-clave')}
          placeholder="......"
          valor={clave}
          onChangeText={setClave}
          icono={Shield}
          esClave
        />
      </View>

      <BotonPrincipal titulo="Iniciar sesion" onPress={() => router.replace('/(tabs)')} />

      <SeparadorSocial texto="O CONTINUAR CON" />

      <View style={estilos.redes}>
        <Pressable style={estilos.botonRed}>
          <Text style={estilos.textoRed}>Google</Text>
        </Pressable>
        <Pressable style={estilos.botonRed}>
          <Text style={estilos.textoRed}>Apple</Text>
        </Pressable>
      </View>

      <View style={estilos.pie}>
        <Text style={estilos.textoPie}>No tienes cuenta?</Text>
        <Link href="/(auth)/registro" style={estilos.enlacePie}>
          Registrate
        </Link>
      </View>
    </ContenedorPantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingTop: espaciadoBase.xxl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconoMarca: {
    width: 92,
    height: 92,
    borderRadius: radiosBase.lg,
    backgroundColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
    ...sombrasNeon.glowSuave,
  },
  encabezado: {
    gap: espaciadoBase.sm,
  },
  titulo: {
    fontSize: 58 / 2,
    color: coloresBase.textoPrincipalOscuro,
    fontWeight: '800',
    lineHeight: 38,
  },
  tituloAcento: {
    color: coloresBase.acentoNeon,
  },
  subtitulo: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 38 / 2,
    lineHeight: 31,
  },
  formulario: {
    gap: espaciadoBase.lg,
    marginTop: espaciadoBase.sm,
  },
  redes: {
    flexDirection: 'row',
    gap: espaciadoBase.md,
  },
  botonRed: {
    flex: 1,
    minHeight: 62,
    borderRadius: radiosBase.lg,
    backgroundColor: '#1A1E29',
    borderWidth: 1,
    borderColor: '#2B3040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoRed: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 18,
    fontWeight: '700',
  },
  pie: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: espaciadoBase.xs,
    marginTop: espaciadoBase.xs,
  },
  textoPie: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 18,
  },
  enlacePie: {
    color: coloresBase.acentoNeon,
    fontSize: 18,
    fontWeight: '700',
  },
});
