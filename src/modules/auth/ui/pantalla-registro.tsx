import { Link, router } from 'expo-router';
import { ArrowLeft, Mail, Shield, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { CampoFormulario } from '@/src/shared/ui/campo-formulario';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { SeparadorSocial } from '@/src/shared/ui/separador-social';
import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

export function PantallaRegistro() {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [clave, setClave] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(true);

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <Pressable style={estilos.botonVolver} onPress={() => router.back()}>
        <ArrowLeft color={coloresBase.textoPrincipalOscuro} size={30} strokeWidth={2.4} />
      </Pressable>

      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>
          Crear <Text style={estilos.tituloAcento}>cuenta</Text>
        </Text>
        <Text style={estilos.subtitulo}>
          Unete al plan 21K y comienza hoy tu proceso de entrenamiento.
        </Text>
      </View>

      <View style={estilos.formulario}>
        <CampoFormulario
          etiqueta="NOMBRE COMPLETO"
          placeholder="Nombre y apellido"
          valor={nombreCompleto}
          onChangeText={setNombreCompleto}
          icono={UserRound}
        />
        <CampoFormulario
          etiqueta="CORREO ELECTRONICO"
          placeholder="correo@ejemplo.com"
          valor={correoElectronico}
          onChangeText={setCorreoElectronico}
          icono={Mail}
          teclado="email-address"
        />
        <CampoFormulario
          etiqueta="CONTRASENA"
          placeholder="......"
          valor={clave}
          onChangeText={setClave}
          icono={Shield}
          esClave
        />
      </View>

      <Pressable style={estilos.filaTerminos} onPress={() => setAceptaTerminos((valor) => !valor)}>
        <View style={[estilos.checkbox, aceptaTerminos ? estilos.checkboxActivo : null]} />
        <Text style={estilos.textoTerminos}>
          Acepto los <Text style={estilos.textoAcento}>Terminos de servicio</Text> y la{' '}
          <Text style={estilos.textoAcento}>Politica de privacidad</Text>
        </Text>
      </Pressable>

      <BotonPrincipal titulo="Crear cuenta" onPress={() => router.replace('/(tabs)')} />

      <SeparadorSocial texto="O REGISTRARTE CON" />

      <View style={estilos.redes}>
        <Pressable style={estilos.botonRed}>
          <Text style={estilos.textoRed}>Google</Text>
        </Pressable>
        <Pressable style={estilos.botonRed}>
          <Text style={estilos.textoRed}>Apple</Text>
        </Pressable>
      </View>

      <View style={estilos.pie}>
        <Text style={estilos.textoPie}>Ya tienes cuenta?</Text>
        <Link href="/(auth)/login" style={estilos.enlacePie}>
          Iniciar sesion
        </Link>
      </View>
    </ContenedorPantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    minHeight: '100%',
    paddingTop: espaciadoBase.sm,
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
  },
  titulo: {
    fontSize: 58 / 2,
    color: coloresBase.textoPrincipalOscuro,
    fontWeight: '800',
    lineHeight: 40,
  },
  tituloAcento: {
    color: coloresBase.acentoNeon,
  },
  subtitulo: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 38 / 2,
    lineHeight: 30,
  },
  formulario: {
    gap: espaciadoBase.md,
    marginTop: espaciadoBase.sm,
  },
  filaTerminos: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espaciadoBase.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: radiosBase.sm,
    borderWidth: 1.5,
    borderColor: '#3A404F',
    marginTop: 2,
  },
  checkboxActivo: {
    backgroundColor: coloresBase.acentoNeon,
    borderColor: coloresBase.acentoNeon,
    ...sombrasNeon.glowSuave,
  },
  textoTerminos: {
    flex: 1,
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 16,
    lineHeight: 26,
  },
  textoAcento: {
    color: coloresBase.acentoNeon,
    fontWeight: '700',
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
    paddingBottom: espaciadoBase.md,
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
