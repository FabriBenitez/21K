import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CalendarDays, CirclePlus, Copy, Save, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import {
  crearPlantillaGym,
  duplicarRegistroGym,
  eliminarRegistroGym,
  eliminarRutinaGymSemanal,
  guardarRegistroGym,
  guardarRutinaGymSemanal,
  listarPlantillasGym,
  listarRutinasGymSemanales,
  obtenerRegistroGym,
} from '@/src/modules/trainings/data/entrenamientos.api';
import { type EntradaEjercicioGym, type PlantillaGym, type RutinaGymSemanal } from '@/src/modules/trainings/domain/tipos-entrenamiento';
import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { diasSemanaOrdenados, esDiaSemana, obtenerDiaSemanaActual, obtenerNombreDiaSemana, type DiaSemana } from '@/src/shared/utils/dias-semana';
import { convertirFechaIsoEnUtc, convertirFechaEnIso, obtenerFechaIsoActual } from '@/src/shared/utils/fechas';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

interface EjercicioEditable {
  idLocal: string;
  nombre: string;
  series: string;
  repeticiones: string;
  pesoKg: string;
  notas: string;
}

const plantillasBase: PlantillaGym[] = [
  {
    id: 'base-piernas-fuerza',
    nombre: 'Piernas Fuerza',
    descripcion: 'Base de fuerza para 21K',
    ejercicios: [
      { nombre: 'Sentadilla con barra', series: 4, repeticiones: 6, pesoKg: 60 },
      { nombre: 'Peso muerto rumano', series: 3, repeticiones: 8, pesoKg: 55 },
      { nombre: 'Zancadas', series: 3, repeticiones: 10, pesoKg: 20 },
    ],
  },
  {
    id: 'base-core-estabilidad',
    nombre: 'Core y Estabilidad',
    descripcion: 'Prevencion para running',
    ejercicios: [
      { nombre: 'Plancha frontal', series: 3, repeticiones: 45, pesoKg: 1 },
      { nombre: 'Elevacion de cadera', series: 3, repeticiones: 12, pesoKg: 20 },
      { nombre: 'Sentadilla goblet', series: 3, repeticiones: 10, pesoKg: 18 },
    ],
  },
];

function crearIdLocal() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function crearEjercicioVacio(): EjercicioEditable {
  return {
    idLocal: crearIdLocal(),
    nombre: '',
    series: '',
    repeticiones: '',
    pesoKg: '',
    notas: '',
  };
}

function mapearEjercicioEditable(ejercicio: EntradaEjercicioGym): EjercicioEditable {
  return {
    idLocal: crearIdLocal(),
    nombre: ejercicio.nombre,
    series: ejercicio.series.toString(),
    repeticiones: ejercicio.repeticiones.toString(),
    pesoKg: ejercicio.pesoKg.toString(),
    notas: ejercicio.notas ?? '',
  };
}

function transformarParaGuardar(ejercicios: EjercicioEditable[]): EntradaEjercicioGym[] {
  return ejercicios.map((ejercicio) => ({
    nombre: ejercicio.nombre,
    series: Number.parseInt(ejercicio.series || '0', 10),
    repeticiones: Number.parseInt(ejercicio.repeticiones || '0', 10),
    pesoKg: Number.parseFloat((ejercicio.pesoKg || '0').replace(',', '.')),
    notas: ejercicio.notas,
  }));
}

function obtenerFechaSesionDesdeIso(fechaIso: string): Date {
  const fecha = convertirFechaIsoEnUtc(fechaIso);
  if (fecha) {
    return new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
  }

  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
}

function resolverDiaSemanaInicial(valor?: string): DiaSemana {
  const numero = Number.parseInt(valor ?? '', 10);
  return esDiaSemana(numero) ? numero : obtenerDiaSemanaActual();
}

function actualizarEjercicioLista(
  ejercicios: EjercicioEditable[],
  idLocal: string,
  campo: keyof EjercicioEditable,
  valor: string
) {
  return ejercicios.map((ejercicio) =>
    ejercicio.idLocal === idLocal
      ? {
          ...ejercicio,
          [campo]: valor,
        }
      : ejercicio
  );
}

function agregarEjercicioLista(ejercicios: EjercicioEditable[]) {
  return [...ejercicios, crearEjercicioVacio()];
}

function quitarEjercicioLista(ejercicios: EjercicioEditable[], idLocal: string) {
  if (ejercicios.length <= 1) {
    return ejercicios;
  }

  return ejercicios.filter((ejercicio) => ejercicio.idLocal !== idLocal);
}

function ordenarRutinasPorDia<T extends { diaSemana: DiaSemana }>(rutinas: T[]) {
  return [...rutinas].sort((a, b) => a.diaSemana - b.diaSemana);
}

export function PantallaSesionGym() {
  const parametros = useLocalSearchParams<{ gymId?: string | string[]; fecha?: string | string[]; diaSemana?: string | string[] }>();
  const gymId = Array.isArray(parametros.gymId) ? parametros.gymId[0] : parametros.gymId;
  const fechaPrefijada = Array.isArray(parametros.fecha) ? parametros.fecha[0] : parametros.fecha;
  const diaSemanaPrefijado = Array.isArray(parametros.diaSemana) ? parametros.diaSemana[0] : parametros.diaSemana;

  const [cargando, setCargando] = useState(Boolean(gymId));
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [duplicando, setDuplicando] = useState(false);
  const [guardandoPlantilla, setGuardandoPlantilla] = useState(false);
  const [mostrarCalendarioSesion, setMostrarCalendarioSesion] = useState(false);

  const [fechaSesion, setFechaSesion] = useState(fechaPrefijada ?? obtenerFechaIsoActual());
  const [notas, setNotas] = useState('');
  const [ejercicios, setEjercicios] = useState<EjercicioEditable[]>([crearEjercicioVacio()]);

  const [plantillasUsuario, setPlantillasUsuario] = useState<PlantillaGym[]>([]);
  const [nombrePlantilla, setNombrePlantilla] = useState('');

  const [rutinasSemanales, setRutinasSemanales] = useState<RutinaGymSemanal[]>([]);
  const [diaSemanaSeleccionado, setDiaSemanaSeleccionado] = useState<DiaSemana>(() =>
    resolverDiaSemanaInicial(diaSemanaPrefijado)
  );
  const [notasRutinaSemanal, setNotasRutinaSemanal] = useState('');
  const [ejerciciosRutinaSemanal, setEjerciciosRutinaSemanal] = useState<EjercicioEditable[]>([crearEjercicioVacio()]);
  const [guardandoRutinaSemanal, setGuardandoRutinaSemanal] = useState(false);
  const [eliminandoRutinaSemanalActual, setEliminandoRutinaSemanalActual] = useState(false);

  const plantillasDisponibles = useMemo(() => [...plantillasBase, ...plantillasUsuario], [plantillasUsuario]);
  const rutinaSemanalActiva = useMemo(
    () => rutinasSemanales.find((rutina) => rutina.diaSemana === diaSemanaSeleccionado) ?? null,
    [diaSemanaSeleccionado, rutinasSemanales]
  );
  const titulo = gymId ? 'Editar rutina de gym' : 'Nueva rutina de gym';

  useEffect(() => {
    if (!gymId && fechaPrefijada) {
      setFechaSesion(fechaPrefijada);
    }
  }, [fechaPrefijada, gymId]);

  useEffect(() => {
    if (!diaSemanaPrefijado) {
      return;
    }

    const numero = Number.parseInt(diaSemanaPrefijado, 10);
    if (esDiaSemana(numero)) {
      setDiaSemanaSeleccionado(numero);
    }
  }, [diaSemanaPrefijado]);

  useEffect(() => {
    setNotasRutinaSemanal(rutinaSemanalActiva?.notas ?? '');
    setEjerciciosRutinaSemanal(
      rutinaSemanalActiva ? rutinaSemanalActiva.ejercicios.map(mapearEjercicioEditable) : [crearEjercicioVacio()]
    );
  }, [rutinaSemanalActiva, diaSemanaSeleccionado]);

  useEffect(() => {
    let montado = true;

    const cargar = async () => {
      try {
        const [sesion, plantillas, rutinas] = await Promise.all([
          gymId ? obtenerRegistroGym(gymId) : Promise.resolve(null),
          listarPlantillasGym(),
          listarRutinasGymSemanales(),
        ]);

        if (!montado) {
          return;
        }

        setPlantillasUsuario(plantillas);
        setRutinasSemanales(ordenarRutinasPorDia(rutinas));

        if (gymId) {
          if (!sesion) {
            Alert.alert('No encontramos la rutina', 'Puede que ya no exista.', [
              { text: 'Volver', onPress: () => router.back() },
            ]);
            return;
          }

          setFechaSesion(sesion.fechaSesion);
          setNotas(sesion.notas ?? '');
          setEjercicios(sesion.ejercicios.map(mapearEjercicioEditable));
        }
      } catch (error) {
        if (!montado) {
          return;
        }

        const mensaje = error instanceof Error ? error.message : 'No pudimos cargar la rutina.';
        Alert.alert('Error', mensaje, [{ text: 'Volver', onPress: () => router.back() }]);
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    };

    void cargar();

    return () => {
      montado = false;
    };
  }, [gymId]);

  const aplicarPlantilla = (plantilla: PlantillaGym) => {
    setEjercicios(plantilla.ejercicios.map(mapearEjercicioEditable));
    Alert.alert('Plantilla aplicada', `Se cargo la plantilla: ${plantilla.nombre}.`);
  };

  const onCambiarFechaSesion = (evento: DateTimePickerEvent, fechaSeleccionada?: Date) => {
    if (Platform.OS === 'android') {
      setMostrarCalendarioSesion(false);
    }

    if (evento.type !== 'set' || !fechaSeleccionada) {
      return;
    }

    const fechaSinHora = new Date(
      fechaSeleccionada.getFullYear(),
      fechaSeleccionada.getMonth(),
      fechaSeleccionada.getDate()
    );

    setFechaSesion(convertirFechaEnIso(fechaSinHora));
  };

  const guardarSesion = async () => {
    if (guardando || eliminando || duplicando) {
      return;
    }

    try {
      setGuardando(true);
      await guardarRegistroGym({
        id: gymId,
        fechaSesion,
        notas,
        ejercicios: transformarParaGuardar(ejercicios),
      });

      Alert.alert(
        'Guardado',
        gymId ? 'La rutina se actualizo correctamente.' : 'La rutina se guardo correctamente.',
        [{ text: 'Ver historial', onPress: () => router.replace('/(tabs)/entrenamientos') }]
      );
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la rutina.';
      Alert.alert('Error', mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarSesion = async () => {
    if (!gymId || guardando || eliminando || duplicando) {
      return;
    }

    Alert.alert('Eliminar rutina', 'Esta accion no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setEliminando(true);
            await eliminarRegistroGym(gymId);
            Alert.alert('Eliminada', 'La rutina fue eliminada.', [
              { text: 'Aceptar', onPress: () => router.replace('/(tabs)/entrenamientos') },
            ]);
          } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo eliminar la rutina.';
            Alert.alert('Error', mensaje);
          } finally {
            setEliminando(false);
          }
        },
      },
    ]);
  };

  const duplicarSesion = async () => {
    if (!gymId || guardando || eliminando || duplicando) {
      return;
    }

    try {
      setDuplicando(true);
      const nuevaSesion = await duplicarRegistroGym(gymId, obtenerFechaIsoActual());
      Alert.alert('Rutina duplicada', 'Se creo una copia para la fecha de hoy.', [
        {
          text: 'Editar copia',
          onPress: () =>
            router.replace({ pathname: '/sesion-gym', params: { gymId: nuevaSesion.id } }),
        },
      ]);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo duplicar la rutina.';
      Alert.alert('Error', mensaje);
    } finally {
      setDuplicando(false);
    }
  };

  const guardarPlantilla = async () => {
    if (guardandoPlantilla) {
      return;
    }

    if (nombrePlantilla.trim().length < 3) {
      Alert.alert('Nombre invalido', 'La plantilla debe tener al menos 3 caracteres.');
      return;
    }

    try {
      setGuardandoPlantilla(true);
      await crearPlantillaGym(nombrePlantilla, transformarParaGuardar(ejercicios), notas);
      const plantillas = await listarPlantillasGym();
      setPlantillasUsuario(plantillas);
      setNombrePlantilla('');
      Alert.alert('Plantilla guardada', 'Ya puedes reutilizarla en futuras rutinas.');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la plantilla.';
      Alert.alert('Error', mensaje);
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  const guardarRutinaSemanalActual = async () => {
    if (guardandoRutinaSemanal || eliminandoRutinaSemanalActual) {
      return;
    }

    try {
      setGuardandoRutinaSemanal(true);
      const rutinaGuardada = await guardarRutinaGymSemanal({
        id: rutinaSemanalActiva?.id,
        diaSemana: diaSemanaSeleccionado,
        notas: notasRutinaSemanal,
        ejercicios: transformarParaGuardar(ejerciciosRutinaSemanal),
      });

      setRutinasSemanales((actual) =>
        ordenarRutinasPorDia([
          ...actual.filter((rutina) => rutina.diaSemana !== rutinaGuardada.diaSemana),
          rutinaGuardada,
        ])
      );

      Alert.alert(
        'Rutina semanal guardada',
        `Quedo asignada para ${obtenerNombreDiaSemana(diaSemanaSeleccionado, { capitalizar: false })}.`
      );
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la rutina semanal.';
      Alert.alert('Error', mensaje);
    } finally {
      setGuardandoRutinaSemanal(false);
    }
  };

  const eliminarRutinaSemanalSeleccionada = async () => {
    if (!rutinaSemanalActiva || guardandoRutinaSemanal || eliminandoRutinaSemanalActual) {
      return;
    }

    Alert.alert('Eliminar rutina semanal', 'Ese dia quedara sin plan de gym.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setEliminandoRutinaSemanalActual(true);
            await eliminarRutinaGymSemanal(rutinaSemanalActiva.id);
            setRutinasSemanales((actual) => actual.filter((rutina) => rutina.id !== rutinaSemanalActiva.id));
            Alert.alert('Rutina eliminada', 'Ese dia ahora figura sin entrenamiento de gym.');
          } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo eliminar la rutina semanal.';
            Alert.alert('Error', mensaje);
          } finally {
            setEliminandoRutinaSemanalActual(false);
          }
        },
      },
    ]);
  };

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.encabezadoSuperior}>
        <Pressable style={estilos.botonCircular} onPress={() => router.back()}>
          <ArrowLeft color={coloresBase.textoPrincipalOscuro} size={26} strokeWidth={2.4} />
        </Pressable>
        <Text style={estilos.tituloPantalla}>{titulo}</Text>
        {gymId ? (
          <Pressable style={estilos.botonCircular} onPress={eliminarSesion} disabled={eliminando || guardando}>
            <Trash2 color="#FF6666" size={22} strokeWidth={2.4} />
          </Pressable>
        ) : (
          <View style={estilos.botonCircular} />
        )}
      </View>

      <View style={estilos.tarjetaRutinaSemanal}>
        <Text style={estilos.tituloBloque}>Rutina semanal</Text>
        <Text style={estilos.subtituloBloque}>
          Elige un dia y deja cargados los ejercicios fijos de esa jornada.
        </Text>

        <View style={estilos.filaDiasSemana}>
          {diasSemanaOrdenados.map((diaSemana) => {
            const diaTieneRutina = rutinasSemanales.some((rutina) => rutina.diaSemana === diaSemana);
            const estaActivo = diaSemana === diaSemanaSeleccionado;

            return (
              <Pressable
                key={diaSemana}
                style={[
                  estilos.chipDiaSemana,
                  estaActivo ? estilos.chipDiaSemanaActivo : null,
                  diaTieneRutina && !estaActivo ? estilos.chipDiaSemanaCargado : null,
                ]}
                onPress={() => setDiaSemanaSeleccionado(diaSemana)}>
                <Text
                  style={[
                    estilos.textoChipDiaSemana,
                    estaActivo ? estilos.textoChipDiaSemanaActivo : null,
                  ]}>
                  {obtenerNombreDiaSemana(diaSemana, { abreviado: true })}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={estilos.textoEstadoRutinaSemanal}>
          {rutinaSemanalActiva
            ? `${obtenerNombreDiaSemana(diaSemanaSeleccionado)} cargado con ${rutinaSemanalActiva.ejercicios.length} ejercicios.`
            : `${obtenerNombreDiaSemana(diaSemanaSeleccionado)} sin rutina. Si no cargas nada, en Home dira "No se entreno."`}
        </Text>

        <View style={estilos.bloqueCampo}>
          <Text style={estilos.etiqueta}>NOTAS DEL DIA (OPCIONAL)</Text>
          <TextInput
            value={notasRutinaSemanal}
            onChangeText={setNotasRutinaSemanal}
            style={estilos.inputNotas}
            placeholder="Ej: fuerza de piernas, movilidad, core."
            placeholderTextColor="#5F667A"
            multiline
            textAlignVertical="top"
          />
        </View>

        <EditorEjerciciosGym
          titulo={`Ejercicios de ${obtenerNombreDiaSemana(diaSemanaSeleccionado, { capitalizar: false })}`}
          ejercicios={ejerciciosRutinaSemanal}
          onAgregar={() => setEjerciciosRutinaSemanal((actual) => agregarEjercicioLista(actual))}
          onQuitar={(idLocal) =>
            setEjerciciosRutinaSemanal((actual) => quitarEjercicioLista(actual, idLocal))
          }
          onActualizar={(idLocal, campo, valor) =>
            setEjerciciosRutinaSemanal((actual) => actualizarEjercicioLista(actual, idLocal, campo, valor))
          }
        />

        <View style={estilos.filaAccionesPlan}>
          <Pressable
            style={estilos.botonPlanPrincipal}
            onPress={guardarRutinaSemanalActual}
            disabled={guardandoRutinaSemanal || eliminandoRutinaSemanalActual}>
            <Save color={coloresBase.fondoOscuro} size={18} />
            <Text style={estilos.textoBotonPlanPrincipal}>
              {guardandoRutinaSemanal ? 'Guardando...' : 'Guardar dia'}
            </Text>
          </Pressable>
          <Pressable
            style={[estilos.botonPlanSecundario, !rutinaSemanalActiva ? estilos.botonDeshabilitado : null]}
            onPress={eliminarRutinaSemanalSeleccionada}
            disabled={!rutinaSemanalActiva || guardandoRutinaSemanal || eliminandoRutinaSemanalActual}>
            <Trash2 color={rutinaSemanalActiva ? '#FF8A8A' : '#5B6070'} size={18} />
            <Text
              style={[
                estilos.textoBotonPlanSecundario,
                !rutinaSemanalActiva ? estilos.textoBotonDeshabilitado : null,
              ]}>
              {eliminandoRutinaSemanalActual ? 'Eliminando...' : 'Borrar dia'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={estilos.separadorSeccion} />

      <View style={estilos.bloqueContenido}>
        <Text style={estilos.tituloBloque}>Sesion puntual</Text>
        <Text style={estilos.subtituloBloque}>
          Sigue disponible para cargar una rutina especifica de una fecha.
        </Text>

        <View style={estilos.bloqueCampo}>
          <Text style={estilos.etiqueta}>DIA DE LA RUTINA</Text>
          <Pressable style={estilos.cajaFechaHora} onPress={() => setMostrarCalendarioSesion(true)}>
            <CalendarDays color={coloresBase.acentoNeon} size={20} />
            <Text style={estilos.textoFechaRutina}>{fechaSesion}</Text>
          </Pressable>
          {mostrarCalendarioSesion ? (
            <View style={estilos.bloqueCalendario}>
              <DateTimePicker
                value={obtenerFechaSesionDesdeIso(fechaSesion)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onCambiarFechaSesion}
              />
              {Platform.OS === 'ios' ? (
                <Pressable style={estilos.botonCerrarCalendario} onPress={() => setMostrarCalendarioSesion(false)}>
                  <Text style={estilos.textoCerrarCalendario}>Listo</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={estilos.bloqueCampo}>
          <Text style={estilos.etiqueta}>NOTAS DE SESION (OPCIONAL)</Text>
          <TextInput
            value={notas}
            onChangeText={setNotas}
            style={estilos.inputNotas}
            placeholder="Objetivo del dia, sensaciones, etc."
            placeholderTextColor="#5F667A"
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={estilos.bloqueCampo}>
          <Text style={estilos.etiqueta}>PLANTILLAS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filaPlantillas}>
            {plantillasDisponibles.map((plantilla) => (
              <Pressable key={plantilla.id} style={estilos.chipPlantilla} onPress={() => aplicarPlantilla(plantilla)}>
                <Text style={estilos.textoChipPlantilla}>{plantilla.nombre}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={estilos.bloqueCampo}>
          <Text style={estilos.etiqueta}>GUARDAR COMO PLANTILLA</Text>
          <View style={estilos.filaGuardarPlantilla}>
            <TextInput
              value={nombrePlantilla}
              onChangeText={setNombrePlantilla}
              style={estilos.inputSimple}
              placeholder="Ej: Piernas semana 6"
              placeholderTextColor="#5F667A"
            />
            <Pressable style={estilos.botonGuardarPlantilla} onPress={guardarPlantilla}>
              <Save color={coloresBase.fondoOscuro} size={20} />
            </Pressable>
          </View>
        </View>

        <EditorEjerciciosGym
          titulo="Ejercicios de la sesion"
          ejercicios={ejercicios}
          onAgregar={() => setEjercicios((actual) => agregarEjercicioLista(actual))}
          onQuitar={(idLocal) => setEjercicios((actual) => quitarEjercicioLista(actual, idLocal))}
          onActualizar={(idLocal, campo, valor) =>
            setEjercicios((actual) => actualizarEjercicioLista(actual, idLocal, campo, valor))
          }
        />

        {gymId ? (
          <Pressable style={estilos.botonDuplicar} onPress={duplicarSesion} disabled={duplicando || guardando}>
            <Copy color={coloresBase.textoPrincipalOscuro} size={20} />
            <Text style={estilos.textoDuplicar}>{duplicando ? 'Duplicando...' : 'Duplicar rutina para hoy'}</Text>
          </Pressable>
        ) : null}

        <BotonPrincipal
          titulo={guardando ? 'Guardando...' : gymId ? 'Guardar cambios' : 'Guardar rutina'}
          onPress={guardarSesion}
          cargando={guardando}
          deshabilitado={guardando || eliminando || duplicando || cargando}
        />
      </View>
    </ContenedorPantalla>
  );
}

interface PropiedadesEditorEjerciciosGym {
  titulo: string;
  ejercicios: EjercicioEditable[];
  onAgregar: () => void;
  onQuitar: (idLocal: string) => void;
  onActualizar: (idLocal: string, campo: keyof EjercicioEditable, valor: string) => void;
}

function EditorEjerciciosGym({
  titulo,
  ejercicios,
  onAgregar,
  onQuitar,
  onActualizar,
}: PropiedadesEditorEjerciciosGym) {
  return (
    <View style={estilos.bloqueCampo}>
      <View style={estilos.filaTituloEjercicios}>
        <Text style={estilos.tituloSeccion}>{titulo}</Text>
        <Pressable style={estilos.botonAgregarEjercicio} onPress={onAgregar}>
          <CirclePlus color={coloresBase.acentoNeon} size={20} />
          <Text style={estilos.textoAgregarEjercicio}>Agregar</Text>
        </Pressable>
      </View>

      {ejercicios.map((ejercicio, indice) => (
        <View key={ejercicio.idLocal} style={estilos.tarjetaEjercicio}>
          <View style={estilos.filaEjercicioHeader}>
            <Text style={estilos.tituloEjercicio}>{`Ejercicio ${indice + 1}`}</Text>
            <Pressable onPress={() => onQuitar(ejercicio.idLocal)} disabled={ejercicios.length <= 1}>
              <Trash2 color={ejercicios.length <= 1 ? '#5B6070' : '#FF6666'} size={18} />
            </Pressable>
          </View>

          <TextInput
            value={ejercicio.nombre}
            onChangeText={(valor) => onActualizar(ejercicio.idLocal, 'nombre', valor)}
            style={estilos.inputSimple}
            placeholder="Nombre del ejercicio"
            placeholderTextColor="#5F667A"
          />

          <View style={estilos.filaNumeros}>
            <CampoNumero
              etiqueta="Series"
              valor={ejercicio.series}
              onChangeText={(valor) => onActualizar(ejercicio.idLocal, 'series', valor)}
            />
            <CampoNumero
              etiqueta="Reps"
              valor={ejercicio.repeticiones}
              onChangeText={(valor) => onActualizar(ejercicio.idLocal, 'repeticiones', valor)}
            />
            <CampoNumero
              etiqueta="Peso kg"
              valor={ejercicio.pesoKg}
              onChangeText={(valor) => onActualizar(ejercicio.idLocal, 'pesoKg', valor)}
              decimal
            />
          </View>

          <TextInput
            value={ejercicio.notas}
            onChangeText={(valor) => onActualizar(ejercicio.idLocal, 'notas', valor)}
            style={estilos.inputSimple}
            placeholder="Notas del ejercicio (opcional)"
            placeholderTextColor="#5F667A"
          />
        </View>
      ))}
    </View>
  );
}

interface PropiedadesCampoNumero {
  etiqueta: string;
  valor: string;
  onChangeText: (valor: string) => void;
  decimal?: boolean;
}

function CampoNumero({ etiqueta, valor, onChangeText, decimal = false }: PropiedadesCampoNumero) {
  return (
    <View style={estilos.campoNumero}>
      <Text style={estilos.etiquetaNumero}>{etiqueta}</Text>
      <TextInput
        value={valor}
        onChangeText={(texto) =>
          onChangeText(
            decimal ? texto.replace(/[^0-9.,]/g, '').replace(',', '.') : texto.replace(/[^0-9]/g, '')
          )
        }
        style={estilos.inputNumero}
        keyboardType={decimal ? 'decimal-pad' : 'number-pad'}
        placeholder="0"
        placeholderTextColor="#68718A"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 150,
  },
  encabezadoSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botonCircular: {
    width: 52,
    height: 52,
    borderRadius: radiosBase.pill,
    backgroundColor: '#171A22',
    borderWidth: 1,
    borderColor: '#2B3040',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloPantalla: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 22,
    fontWeight: '800',
  },
  tarjetaRutinaSemanal: {
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: 'rgba(216,255,62,0.35)',
    backgroundColor: 'rgba(216,255,62,0.08)',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.md,
  },
  bloqueContenido: {
    gap: espaciadoBase.md,
  },
  tituloBloque: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 24,
    fontWeight: '800',
  },
  subtituloBloque: {
    color: '#AAB58D',
    fontSize: 15,
    lineHeight: 22,
  },
  filaDiasSemana: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciadoBase.xs,
  },
  chipDiaSemana: {
    minWidth: 62,
    borderRadius: radiosBase.pill,
    borderWidth: 1,
    borderColor: '#2E3343',
    backgroundColor: '#232633',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipDiaSemanaActivo: {
    borderColor: coloresBase.acentoNeon,
    backgroundColor: coloresBase.acentoNeon,
  },
  chipDiaSemanaCargado: {
    borderColor: 'rgba(216,255,62,0.45)',
    backgroundColor: 'rgba(216,255,62,0.12)',
  },
  textoChipDiaSemana: {
    color: '#B2BAD0',
    fontSize: 13,
    fontWeight: '700',
  },
  textoChipDiaSemanaActivo: {
    color: coloresBase.fondoOscuro,
  },
  textoEstadoRutinaSemanal: {
    color: '#CBD596',
    fontSize: 14,
    lineHeight: 21,
  },
  filaAccionesPlan: {
    flexDirection: 'row',
    gap: espaciadoBase.sm,
  },
  botonPlanPrincipal: {
    flex: 1,
    minHeight: 54,
    borderRadius: radiosBase.md,
    backgroundColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  textoBotonPlanPrincipal: {
    color: coloresBase.fondoOscuro,
    fontSize: 15,
    fontWeight: '800',
  },
  botonPlanSecundario: {
    flex: 1,
    minHeight: 54,
    borderRadius: radiosBase.md,
    borderWidth: 1,
    borderColor: '#364055',
    backgroundColor: '#202430',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  textoBotonPlanSecundario: {
    color: '#FF9A9A',
    fontSize: 15,
    fontWeight: '700',
  },
  botonDeshabilitado: {
    opacity: 0.55,
  },
  textoBotonDeshabilitado: {
    color: '#7F869B',
  },
  separadorSeccion: {
    height: 1,
    backgroundColor: '#252A39',
  },
  bloqueCampo: {
    gap: espaciadoBase.sm,
  },
  etiqueta: {
    color: '#8F98AF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  cajaFechaHora: {
    minHeight: 58,
    borderRadius: radiosBase.md,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.xs,
    paddingHorizontal: espaciadoBase.md,
  },
  textoFechaRutina: {
    color: '#E5EAF8',
    fontSize: 16,
    fontWeight: '700',
  },
  bloqueCalendario: {
    borderRadius: radiosBase.md,
    borderWidth: 1,
    borderColor: '#2E3343',
    backgroundColor: '#20232F',
    overflow: 'hidden',
  },
  botonCerrarCalendario: {
    minHeight: 40,
    borderTopWidth: 1,
    borderTopColor: '#2E3343',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCerrarCalendario: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 14,
    fontWeight: '700',
  },
  inputSimple: {
    minHeight: 56,
    borderRadius: radiosBase.md,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    color: '#E5EAF8',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: espaciadoBase.md,
  },
  inputNotas: {
    minHeight: 92,
    borderRadius: radiosBase.md,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    color: '#E5EAF8',
    fontSize: 16,
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: espaciadoBase.md,
  },
  filaPlantillas: {
    gap: espaciadoBase.xs,
  },
  chipPlantilla: {
    borderRadius: radiosBase.pill,
    borderWidth: 1,
    borderColor: 'rgba(216,255,62,0.6)',
    backgroundColor: 'rgba(216,255,62,0.12)',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 10,
  },
  textoChipPlantilla: {
    color: coloresBase.acentoNeon,
    fontSize: 14,
    fontWeight: '700',
  },
  filaGuardarPlantilla: {
    flexDirection: 'row',
    gap: espaciadoBase.xs,
  },
  botonGuardarPlantilla: {
    width: 56,
    borderRadius: radiosBase.md,
    backgroundColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaTituloEjercicios: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloSeccion: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
    paddingRight: espaciadoBase.sm,
  },
  botonAgregarEjercicio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radiosBase.pill,
    borderWidth: 1,
    borderColor: '#2E3343',
    backgroundColor: '#232633',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 8,
  },
  textoAgregarEjercicio: {
    color: '#B9C1D8',
    fontSize: 14,
    fontWeight: '700',
  },
  tarjetaEjercicio: {
    borderRadius: radiosBase.lg,
    backgroundColor: '#171922',
    borderWidth: 1,
    borderColor: '#262B39',
    padding: espaciadoBase.md,
    gap: espaciadoBase.sm,
  },
  filaEjercicioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tituloEjercicio: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 17,
    fontWeight: '800',
  },
  filaNumeros: {
    flexDirection: 'row',
    gap: espaciadoBase.xs,
  },
  campoNumero: {
    flex: 1,
    gap: 6,
  },
  etiquetaNumero: {
    color: '#8F98AF',
    fontSize: 13,
    fontWeight: '700',
  },
  inputNumero: {
    minHeight: 48,
    borderRadius: radiosBase.md,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    color: '#E5EAF8',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  botonDuplicar: {
    minHeight: 56,
    borderRadius: radiosBase.md,
    backgroundColor: '#252A36',
    borderWidth: 1,
    borderColor: '#30374A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaciadoBase.xs,
  },
  textoDuplicar: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 16,
    fontWeight: '700',
  },
});
