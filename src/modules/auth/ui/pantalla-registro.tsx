import { Link, router } from 'expo-router';
import { ArrowLeft, Mail, Shield, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { rutasApp } from '@/src/shared/navigation/rutas-app';
import { useEstadoApp } from '@/src/shared/state/contexto-app';
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
  const [creandoCuenta, setCreandoCuenta] = useState(false);
  const { registrarCuenta, iniciarSesionGoogle } = useEstadoApp();

  const crearCuenta = async () => {
    if (creandoCuenta) {
      return;
    }

    if (!nombreCompleto.trim() || !correoElectronico.trim() || !clave.trim()) {
      Alert.alert('Campos incompletos', 'Completa nombre, correo y contrasena.');
      return;
    }

    if (!aceptaTerminos) {
      Alert.alert('Terminos requeridos', 'Debes aceptar terminos y politica para continuar.');
      return;
    }

    if (clave.length < 6) {
      Alert.alert('Contrasena invalida', 'La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    setCreandoCuenta(true);
    const resultado = await registrarCuenta(nombreCompleto, correoElectronico, clave);
    setCreandoCuenta(false);

    if (!resultado.ok) {
      Alert.alert('No pudimos crear la cuenta', resultado.mensaje ?? 'Intentalo nuevamente.');
      return;
    }

    Alert.alert('Registro exitoso', resultado.mensaje ?? 'Tu cuenta ya esta disponible.', [
      {
        text: 'Continuar',
        onPress: () => {
          if (resultado.requiereConfirmacion) {
            router.replace(rutasApp.auth.login);
            return;
          }

          router.replace(rutasApp.tabs.raiz);
        },
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

      <BotonPrincipal
        titulo={creandoCuenta ? 'Creando cuenta...' : 'Crear cuenta'}
        onPress={crearCuenta}
        cargando={creandoCuenta}
        deshabilitado={creandoCuenta}
      />

      <SeparadorSocial texto="O REGISTRARTE CON" />

      <View style={estilos.redes}>
        <Pressable style={estilos.botonRed} onPress={iniciarSesionGoogle}>
          <Text style={estilos.textoRed}>Google</Text>
        </Pressable>
        <Pressable style={estilos.botonRed}>
          <Text style={estilos.textoRed}>Apple</Text>
        </Pressable>
      </View>

      <View style={estilos.pie}>
        <Text style={estilos.textoPie}>Ya tienes cuenta?</Text>
        <Link href={rutasApp.auth.login} style={estilos.enlacePie}>
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
  logoMarcaContenedor: {
    width: '100%',
    minHeight: 108,
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#262B38',
    backgroundColor: '#0B0D14',
    alignItems: 'center',
    justifyContent: 'center',
    ...sombrasNeon.glowSuave,
  },
  logoMarcaImagen: {
    width: '88%',
    height: 88,
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
