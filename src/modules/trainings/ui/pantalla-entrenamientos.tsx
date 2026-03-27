import { router } from 'expo-router';
import { ArrowLeft, Copy, Dumbbell, Pencil, PersonStanding, Plus, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import {
  duplicarRegistroGym,
  eliminarRegistroGym,
  eliminarRegistroRunning,
  listarHistorialEntrenamientos,
  type RegistroEntrenamiento,
} from '@/src/modules/trainings/data/entrenamientos.api';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { formatearFechaCorta } from '@/src/shared/utils/formato-fecha';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

export function PantallaEntrenamientos() {
  const [cargando, setCargando] = useState(true);
  const [historial, setHistorial] = useState<RegistroEntrenamiento[]>([]);

  const cargarHistorial = useCallback(async () => {
    try {
      setCargando(true);
      const registros = await listarHistorialEntrenamientos(120);
      setHistorial(registros);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo cargar el historial.';
      Alert.alert('Error', mensaje);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarHistorial();
    }, [cargarHistorial])
  );

  const eliminar = (registro: RegistroEntrenamiento) => {
    Alert.alert('Eliminar entrenamiento', 'Esta accion no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            if (registro.tipo === 'running') {
              await eliminarRegistroRunning(registro.id);
            } else {
              await eliminarRegistroGym(registro.id);
            }

            await cargarHistorial();
          } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo eliminar el entrenamiento.';
            Alert.alert('Error', mensaje);
          }
        },
      },
    ]);
  };

  const editar = (registro: RegistroEntrenamiento) => {
    if (registro.tipo === 'running') {
      router.push({ pathname: '/registro-running', params: { runningId: registro.id } });
      return;
    }

    router.push({ pathname: '/sesion-gym', params: { gymId: registro.id } });
  };

  const duplicarGym = async (id: string) => {
    try {
      const copia = await duplicarRegistroGym(id);
      Alert.alert('Sesion duplicada', 'Se creo una copia con la fecha de hoy.', [
        {
          text: 'Editar copia',
          onPress: () => router.push({ pathname: '/sesion-gym', params: { gymId: copia.id } }),
        },
      ]);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo duplicar la sesion.';
      Alert.alert('Error', mensaje);
    }
  };

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.encabezado}>
        <Pressable style={estilos.botonCircular} onPress={() => router.back()}>
          <ArrowLeft color={coloresBase.textoPrincipalOscuro} size={24} strokeWidth={2.4} />
        </Pressable>

        <View style={estilos.encabezadoTexto}>
          <Text style={estilos.titulo}>Historial</Text>
          <Text style={estilos.subtitulo}>Edita o elimina tus registros</Text>
        </View>

        <Pressable style={[estilos.botonCircular, estilos.botonAcento]} onPress={() => router.push('/(tabs)/agregar')}>
          <Plus color={coloresBase.fondoOscuro} size={22} strokeWidth={2.5} />
        </Pressable>
      </View>

      {cargando ? <Text style={estilos.mensajeEstado}>Cargando entrenamientos...</Text> : null}

      {!cargando && historial.length === 0 ? (
        <View style={estilos.tarjetaVacia}>
          <Text style={estilos.tituloVacio}>Aun no tienes entrenamientos</Text>
          <Text style={estilos.textoVacio}>Registra tu primera sesion de running o gimnasio para empezar.</Text>
          <Pressable style={estilos.botonAccionVacio} onPress={() => router.push('/(tabs)/agregar')}>
            <Text style={estilos.textoBotonVacio}>Registrar ahora</Text>
          </Pressable>
        </View>
      ) : null}

      {!cargando
        ? historial.map((registro) => (
            <View key={`${registro.tipo}-${registro.id}`} style={estilos.tarjetaRegistro}>
              <View style={estilos.filaEncabezadoRegistro}>
                <View style={estilos.filaIconoTipo}>
                  <View
                    style={[
                      estilos.iconoTipo,
                      registro.tipo === 'running' ? estilos.iconoRunning : estilos.iconoGym,
                    ]}>
                    {registro.tipo === 'running' ? (
                      <PersonStanding color={coloresBase.fondoOscuro} size={20} />
                    ) : (
                      <Dumbbell color={coloresBase.fondoOscuro} size={20} />
                    )}
                  </View>
                  <View>
                    <Text style={estilos.tipoRegistro}>
                      {registro.tipo === 'running' ? 'Running' : 'Gimnasio'}
                    </Text>
                    <Text style={estilos.fechaRegistro}>{formatearFechaCorta(registro.fechaSesion)}</Text>
                  </View>
                </View>
              </View>

              <Text style={estilos.descripcionRegistro}>{registro.descripcion}</Text>

              <View style={estilos.filaAcciones}>
                <Pressable style={estilos.botonAccion} onPress={() => editar(registro)}>
                  <Pencil color={coloresBase.textoPrincipalOscuro} size={16} />
                  <Text style={estilos.textoAccion}>Editar</Text>
                </Pressable>

                {registro.tipo === 'gimnasio' ? (
                  <Pressable style={estilos.botonAccion} onPress={() => duplicarGym(registro.id)}>
                    <Copy color={coloresBase.textoPrincipalOscuro} size={16} />
                    <Text style={estilos.textoAccion}>Duplicar</Text>
                  </Pressable>
                ) : null}

                <Pressable style={estilos.botonAccion} onPress={() => eliminar(registro)}>
                  <Trash2 color="#FF7474" size={16} />
                  <Text style={[estilos.textoAccion, estilos.textoAccionEliminar]}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          ))
        : null}
    </ContenedorPantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 150,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaciadoBase.sm,
  },
  encabezadoTexto: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitulo: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 14,
  },
  botonCircular: {
    width: 50,
    height: 50,
    borderRadius: radiosBase.pill,
    backgroundColor: '#171A22',
    borderWidth: 1,
    borderColor: '#2B3040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonAcento: {
    backgroundColor: coloresBase.acentoNeon,
    borderColor: coloresBase.acentoNeon,
  },
  mensajeEstado: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 16,
    marginTop: espaciadoBase.sm,
  },
  tarjetaVacia: {
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#2A3142',
    backgroundColor: '#171922',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.sm,
  },
  tituloVacio: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 20,
    fontWeight: '800',
  },
  textoVacio: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 16,
    lineHeight: 24,
  },
  botonAccionVacio: {
    alignSelf: 'flex-start',
    borderRadius: radiosBase.pill,
    backgroundColor: coloresBase.acentoNeon,
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 10,
  },
  textoBotonVacio: {
    color: coloresBase.fondoOscuro,
    fontWeight: '800',
    fontSize: 14,
  },
  tarjetaRegistro: {
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#252A38',
    backgroundColor: '#171922',
    padding: espaciadoBase.md,
    gap: espaciadoBase.sm,
  },
  filaEncabezadoRegistro: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filaIconoTipo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.sm,
  },
  iconoTipo: {
    width: 40,
    height: 40,
    borderRadius: radiosBase.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoRunning: {
    backgroundColor: 'rgba(216,255,62,0.9)',
  },
  iconoGym: {
    backgroundColor: 'rgba(122,191,255,0.9)',
  },
  tipoRegistro: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 17,
    fontWeight: '800',
  },
  fechaRegistro: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 13,
    fontWeight: '600',
  },
  descripcionRegistro: {
    color: '#B8C1D8',
    fontSize: 15,
    lineHeight: 22,
  },
  filaAcciones: {
    flexDirection: 'row',
    gap: espaciadoBase.xs,
    flexWrap: 'wrap',
  },
  botonAccion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radiosBase.pill,
    borderWidth: 1,
    borderColor: '#2E3548',
    backgroundColor: '#222733',
    paddingHorizontal: espaciadoBase.sm,
    paddingVertical: 8,
  },
  textoAccion: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 13,
    fontWeight: '700',
  },
  textoAccionEliminar: {
    color: '#FF8383',
  },
});

