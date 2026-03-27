import { router } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { rutasApp } from '@/src/shared/navigation/rutas-app';
import { useEstadoApp } from '@/src/shared/state/contexto-app';
import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { CampoFormulario } from '@/src/shared/ui/campo-formulario';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

export function PantallaResetPassword() {
  const [nuevaClave, setNuevaClave] = useState('');
  const [confirmacionClave, setConfirmacionClave] = useState('');
  const [guardando, setGuardando] = useState(false);
  const { actualizarClave } = useEstadoApp();

  const guardarNuevaClave = async () => {
    if (guardando) {
      return;
    }

    if (!nuevaClave.trim() || !confirmacionClave.trim()) {
      Alert.alert('Campos incompletos', 'Completa ambos campos para continuar.');
      return;
    }

    if (nuevaClave.length < 6) {
      Alert.alert('Contrasena invalida', 'La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    if (nuevaClave !== confirmacionClave) {
      Alert.alert('Contrasenas distintas', 'La confirmacion no coincide con la nueva contrasena.');
      return;
    }

    setGuardando(true);
    const resultado = await actualizarClave(nuevaClave);
    setGuardando(false);

    if (!resultado.ok) {
      Alert.alert('No pudimos actualizar la clave', resultado.mensaje ?? 'Intentalo nuevamente.');
      return;
    }

    Alert.alert('Clave actualizada', resultado.mensaje ?? 'Ya puedes iniciar sesion.', [
      {
        text: 'Ir a login',
        onPress: () => router.replace(rutasApp.auth.login),
      },
    ]);
  };

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <Pressable style={estilos.botonVolver} onPress={() => router.back()}>
        <ArrowLeft color={coloresBase.textoPrincipalOscuro} size={30} strokeWidth={2.4} />
      </Pressable>

      <View style={estilos.encabezado}>
        <Text style={estilos.titulo}>Crear nueva contrasena</Text>
        <Text style={estilos.subtitulo}>
          Elige una contrasena segura para proteger tu cuenta y continuar con tu plan 21K.
        </Text>
      </View>

      <View style={estilos.formulario}>
        <CampoFormulario
          etiqueta="NUEVA CONTRASENA"
          placeholder="******"
          valor={nuevaClave}
          onChangeText={setNuevaClave}
          icono={Shield}
          esClave
        />

        <CampoFormulario
          etiqueta="CONFIRMAR CONTRASENA"
          placeholder="******"
          valor={confirmacionClave}
          onChangeText={setConfirmacionClave}
          icono={Shield}
          esClave
        />
      </View>

      <BotonPrincipal
        titulo={guardando ? 'Guardando...' : 'Guardar contrasena'}
        onPress={guardarNuevaClave}
        cargando={guardando}
        deshabilitado={guardando}
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
  encabezado: {
    gap: espaciadoBase.sm,
    marginTop: espaciadoBase.xs,
  },
  titulo: {
    fontSize: 40,
    color: coloresBase.textoPrincipalOscuro,
    fontWeight: '800',
    lineHeight: 46,
  },
  subtitulo: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 17,
    lineHeight: 28,
  },
  formulario: {
    gap: espaciadoBase.md,
  },
});
