import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CalendarDays, Clock3, PersonStanding, Save, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  eliminarRegistroRunning,
  eliminarRutinaRunningSemanal,
  guardarRegistroRunning,
  guardarRutinaRunningSemanal,
  listarRutinasRunningSemanales,
  obtenerRegistroRunning,
  type RegistroRunning,
} from '@/src/modules/trainings/data/entrenamientos.api';
import {
  obtenerEtiquetaTipoRunning,
  tiposRunningDisponibles,
  type RutinaRunningSemanal,
  type TipoRunning,
} from '@/src/modules/trainings/domain/tipos-entrenamiento';
import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { diasSemanaOrdenados, esDiaSemana, obtenerDiaSemanaActual, obtenerNombreDiaSemana, type DiaSemana } from '@/src/shared/utils/dias-semana';
import { obtenerFechaIsoActual } from '@/src/shared/utils/fechas';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

function parsearEntero(valor: string): number {
  const numero = Number.parseInt(valor, 10);
  return Number.isFinite(numero) ? numero : 0;
}

function formatearDosDigitos(valor: number) {
  return Math.max(0, valor).toString().padStart(2, '0');
}

function partirDuracionSegundos(duracionSegundos: number) {
  const horas = Math.floor(duracionSegundos / 3600);
  const minutos = Math.floor((duracionSegundos % 3600) / 60);
  const segundos = duracionSegundos % 60;

  return {
    horas: formatearDosDigitos(horas),
    minutos: formatearDosDigitos(minutos),
    segundos: formatearDosDigitos(segundos),
  };
}

function resolverDiaSemanaInicial(valor?: string): DiaSemana {
  const numero = Number.parseInt(valor ?? '', 10);
  return esDiaSemana(numero) ? numero : obtenerDiaSemanaActual();
}

function ordenarRutinasPorDia<T extends { diaSemana: DiaSemana }>(rutinas: T[]) {
  return [...rutinas].sort((a, b) => a.diaSemana - b.diaSemana);
}

export function PantallaRegistroRunningManual() {
  const parametros = useLocalSearchParams<{ runningId?: string | string[]; fecha?: string | string[]; diaSemana?: string | string[] }>();
  const runningId = Array.isArray(parametros.runningId)
    ? parametros.runningId[0]
    : parametros.runningId;
  const fechaPrefijada = Array.isArray(parametros.fecha) ? parametros.fecha[0] : parametros.fecha;
  const diaSemanaPrefijado = Array.isArray(parametros.diaSemana) ? parametros.diaSemana[0] : parametros.diaSemana;

  const [cargando, setCargando] = useState(Boolean(runningId));
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const [fechaSesion, setFechaSesion] = useState(fechaPrefijada ?? obtenerFechaIsoActual());
  const [distancia, setDistancia] = useState('');
  const [horas, setHoras] = useState('00');
  const [minutos, setMinutos] = useState('00');
  const [segundos, setSegundos] = useState('00');
  const [tipo, setTipo] = useState<TipoRunning>('rodaje_suave');
  const [notas, setNotas] = useState('');

  const [rutinasSemanales, setRutinasSemanales] = useState<RutinaRunningSemanal[]>([]);
  const [diaSemanaSeleccionado, setDiaSemanaSeleccionado] = useState<DiaSemana>(() =>
    resolverDiaSemanaInicial(diaSemanaPrefijado)
  );
  const [tipoRutinaSemanal, setTipoRutinaSemanal] = useState<TipoRunning>('rodaje_suave');
  const [detalleRutinaSemanal, setDetalleRutinaSemanal] = useState('');
  const [distanciaRutinaSemanal, setDistanciaRutinaSemanal] = useState('');
  const [guardandoRutinaSemanal, setGuardandoRutinaSemanal] = useState(false);
  const [eliminandoRutinaSemanalActual, setEliminandoRutinaSemanalActual] = useState(false);

  const tituloPantalla = runningId ? 'Editar corrida' : 'Registrar corrida manual';
  const rutinaSemanalActiva = useMemo(
    () => rutinasSemanales.find((rutina) => rutina.diaSemana === diaSemanaSeleccionado) ?? null,
    [diaSemanaSeleccionado, rutinasSemanales]
  );

  useEffect(() => {
    if (!runningId && fechaPrefijada) {
      setFechaSesion(fechaPrefijada);
    }
  }, [fechaPrefijada, runningId]);

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
    setTipoRutinaSemanal(rutinaSemanalActiva?.tipo ?? 'rodaje_suave');
    setDetalleRutinaSemanal(rutinaSemanalActiva?.detalle ?? '');
    setDistanciaRutinaSemanal(
      typeof rutinaSemanalActiva?.distanciaObjetivoKm === 'number'
        ? rutinaSemanalActiva.distanciaObjetivoKm.toString()
        : ''
    );
  }, [rutinaSemanalActiva, diaSemanaSeleccionado]);

  useEffect(() => {
    let montado = true;

    const cargar = async () => {
      try {
        const [registro, rutinas] = await Promise.all([
          runningId ? obtenerRegistroRunning(runningId) : Promise.resolve(null),
          listarRutinasRunningSemanales(),
        ]);

        if (!montado) {
          return;
        }

        setRutinasSemanales(ordenarRutinasPorDia(rutinas));

        if (!registro) {
          if (runningId) {
            Alert.alert('No encontramos la corrida', 'Puede que haya sido eliminada.', [
              { text: 'Volver', onPress: () => router.back() },
            ]);
          }
          return;
        }

        hidratarDesdeRegistro(registro);
      } catch (error) {
        if (!montado) {
          return;
        }

        const mensaje = error instanceof Error ? error.message : 'No se pudo cargar la corrida.';
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
  }, [runningId]);

  const duracionTotalSegundos = useMemo(() => {
    const horasNumero = parsearEntero(horas);
    const minutosNumero = parsearEntero(minutos);
    const segundosNumero = parsearEntero(segundos);

    return horasNumero * 3600 + minutosNumero * 60 + segundosNumero;
  }, [horas, minutos, segundos]);

  const guardar = async () => {
    if (guardando || eliminando) {
      return;
    }

    const distanciaNumero = Number.parseFloat(distancia.replace(',', '.'));
    if (!Number.isFinite(distanciaNumero) || distanciaNumero <= 0) {
      Alert.alert('Distancia invalida', 'Ingresa una distancia mayor a 0 km.');
      return;
    }

    if (duracionTotalSegundos <= 0) {
      Alert.alert('Duracion invalida', 'Ingresa una duracion mayor a 0 segundos.');
      return;
    }

    const ritmoSegKm = duracionTotalSegundos / distanciaNumero;
    if (ritmoSegKm < 120 || ritmoSegKm > 1200) {
      Alert.alert(
        'Datos incoherentes',
        'Revisa distancia y duracion. El ritmo promedio debe estar entre 2:00 y 20:00 min/km.'
      );
      return;
    }

    try {
      setGuardando(true);
      await guardarRegistroRunning({
        id: runningId,
        fechaSesion,
        distanciaKm: distanciaNumero,
        duracionSegundos: duracionTotalSegundos,
        tipo,
        notas,
      });

      Alert.alert(
        'Guardado',
        runningId ? 'La corrida se actualizo correctamente.' : 'La corrida se registro correctamente.',
        [{ text: 'Ver historial', onPress: () => router.replace('/(tabs)/entrenamientos') }]
      );
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la corrida.';
      Alert.alert('Error', mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!runningId || eliminando || guardando) {
      return;
    }

    Alert.alert('Eliminar corrida', 'Esta accion no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setEliminando(true);
            await eliminarRegistroRunning(runningId);
            Alert.alert('Eliminada', 'La corrida fue eliminada.', [
              { text: 'Aceptar', onPress: () => router.replace('/(tabs)/entrenamientos') },
            ]);
          } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo eliminar la corrida.';
            Alert.alert('Error', mensaje);
          } finally {
            setEliminando(false);
          }
        },
      },
    ]);
  };

  const guardarRutinaSemanalActual = async () => {
    if (guardandoRutinaSemanal || eliminandoRutinaSemanalActual) {
      return;
    }

    const distanciaObjetivoNumero = Number.parseFloat(distanciaRutinaSemanal.replace(',', '.'));
    const distanciaObjetivo =
      distanciaRutinaSemanal.trim().length > 0 && Number.isFinite(distanciaObjetivoNumero)
        ? distanciaObjetivoNumero
        : undefined;

    if (distanciaRutinaSemanal.trim().length > 0 && !distanciaObjetivo) {
      Alert.alert('Distancia invalida', 'La distancia semanal debe ser un numero mayor a 0.');
      return;
    }

    try {
      setGuardandoRutinaSemanal(true);
      const rutinaGuardada = await guardarRutinaRunningSemanal({
        id: rutinaSemanalActiva?.id,
        diaSemana: diaSemanaSeleccionado,
        tipo: tipoRutinaSemanal,
        detalle: detalleRutinaSemanal,
        distanciaObjetivoKm: distanciaObjetivo,
      });

      setRutinasSemanales((actual) =>
        ordenarRutinasPorDia([
          ...actual.filter((rutina) => rutina.diaSemana !== rutinaGuardada.diaSemana),
          rutinaGuardada,
        ])
      );

      Alert.alert(
        'Plan semanal guardado',
        `Quedo cargado para ${obtenerNombreDiaSemana(diaSemanaSeleccionado, { capitalizar: false })}.`
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

    Alert.alert('Eliminar plan semanal', 'Ese dia quedara sin plan de running.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setEliminandoRutinaSemanalActual(true);
            await eliminarRutinaRunningSemanal(rutinaSemanalActiva.id);
            setRutinasSemanales((actual) => actual.filter((rutina) => rutina.id !== rutinaSemanalActiva.id));
            Alert.alert('Plan eliminado', 'Ese dia ahora figura como "No se entreno".');
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
        <Text style={estilos.tituloPantalla}>{tituloPantalla}</Text>
        {runningId ? (
          <Pressable style={estilos.botonCircular} onPress={eliminar} disabled={eliminando || guardando}>
            <Trash2 color="#FF6666" size={22} strokeWidth={2.4} />
          </Pressable>
        ) : (
          <View style={estilos.botonCircular} />
        )}
      </View>

      <View style={estilos.tarjetaPlanSemanal}>
        <Text style={estilos.tituloBloque}>Plan semanal running</Text>
        <Text style={estilos.subtituloBloque}>
          Define que se corre cada dia para que el dashboard te lo muestre automaticamente.
        </Text>

        <View style={estilos.filaDiasSemana}>
          {diasSemanaOrdenados.map((diaSemana) => {
            const tienePlan = rutinasSemanales.some((rutina) => rutina.diaSemana === diaSemana);
            const estaActivo = diaSemana === diaSemanaSeleccionado;

            return (
              <Pressable
                key={diaSemana}
                style={[
                  estilos.chipDiaSemana,
                  estaActivo ? estilos.chipDiaSemanaActivo : null,
                  tienePlan && !estaActivo ? estilos.chipDiaSemanaCargado : null,
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

        <Text style={estilos.textoEstadoPlan}>
          {rutinaSemanalActiva
            ? `${obtenerNombreDiaSemana(diaSemanaSeleccionado)}: ${obtenerEtiquetaTipoRunning(rutinaSemanalActiva.tipo)}`
            : `${obtenerNombreDiaSemana(diaSemanaSeleccionado)} sin plan. Si no cargas nada, en Home dira "No se entreno."`}
        </Text>

        <View style={estilos.bloqueCampo}>
          <Text style={estilos.etiqueta}>TIPO DE ENTRENAMIENTO</Text>
          <View style={estilos.filaTipos}>
            {tiposRunningDisponibles.map((opcion) => (
              <Pressable
                key={opcion.valor}
                style={[
                  estilos.chipTipo,
                  tipoRutinaSemanal === opcion.valor ? estilos.chipTipoActivo : null,
                ]}
                onPress={() => setTipoRutinaSemanal(opcion.valor)}>
                <Text
                  style={[
                    estilos.textoChipTipo,
                    tipoRutinaSemanal === opcion.valor ? estilos.textoChipTipoActivo : null,
                  ]}>
                  {opcion.etiqueta}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={estilos.bloqueCampo}>
          <Text style={estilos.etiqueta}>DETALLE DEL DIA</Text>
          <TextInput
            value={detalleRutinaSemanal}
            onChangeText={setDetalleRutinaSemanal}
            style={estilos.inputNotas}
            placeholder="Ej: 8x400, 6 km suaves, fondo progresivo."
            placeholderTextColor="#5F667A"
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={estilos.bloqueCampo}>
          <Text style={estilos.etiqueta}>DISTANCIA OBJETIVO (OPCIONAL)</Text>
          <View style={estilos.campoGrande}>
            <TextInput
              value={distanciaRutinaSemanal}
              onChangeText={(valor) => setDistanciaRutinaSemanal(valor.replace(/[^0-9.,]/g, '').replace(',', '.'))}
              style={estilos.inputGrande}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#5F667A"
            />
            <Text style={estilos.sufijoCampo}>km</Text>
          </View>
        </View>

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

      <View style={estilos.alertaMeta}>
        <PersonStanding color={coloresBase.acentoNeon} size={22} strokeWidth={2.4} />
        <View style={estilos.alertaTexto}>
          <Text style={estilos.alertaTitulo}>Sesion puntual</Text>
          <Text style={estilos.alertaMensaje}>
            Registra distancia y tiempo para medir ritmo y constancia de forma confiable.
          </Text>
        </View>
      </View>

      <View style={estilos.bloqueCampo}>
        <Text style={estilos.etiqueta}>FECHA (YYYY-MM-DD)</Text>
        <View style={estilos.cajaFechaHora}>
          <CalendarDays color={coloresBase.acentoNeon} size={20} />
          <TextInput
            value={fechaSesion}
            onChangeText={setFechaSesion}
            style={estilos.inputFecha}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="2026-03-26"
            placeholderTextColor="#5F667A"
          />
        </View>
      </View>

      <View style={estilos.bloqueCampo}>
        <Text style={estilos.etiqueta}>DISTANCIA (KM)</Text>
        <View style={estilos.campoGrande}>
          <TextInput
            value={distancia}
            onChangeText={setDistancia}
            style={estilos.inputGrande}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#5F667A"
            editable={!cargando}
          />
          <Text style={estilos.sufijoCampo}>km</Text>
        </View>
      </View>

      <View style={estilos.bloqueCampo}>
        <Text style={estilos.etiqueta}>DURACION</Text>
        <View style={estilos.filaDuracion}>
          <CajaDuracion valor={horas} onChangeText={setHoras} unidad="HORAS" />
          <CajaDuracion valor={minutos} onChangeText={setMinutos} unidad="MIN" />
          <CajaDuracion valor={segundos} onChangeText={setSegundos} unidad="SEG" />
        </View>
      </View>

      <View style={estilos.bloqueCampo}>
        <Text style={estilos.etiqueta}>TIPO DE CORRIDA</Text>
        <View style={estilos.filaTipos}>
          {tiposRunningDisponibles.map((opcion) => (
            <Pressable
              key={opcion.valor}
              style={[estilos.chipTipo, tipo === opcion.valor ? estilos.chipTipoActivo : null]}
              onPress={() => setTipo(opcion.valor)}>
              <Text style={[estilos.textoChipTipo, tipo === opcion.valor ? estilos.textoChipTipoActivo : null]}>
                {opcion.etiqueta}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={estilos.bloqueCampo}>
        <Text style={estilos.etiqueta}>NOTAS (OPCIONAL)</Text>
        <TextInput
          value={notas}
          onChangeText={setNotas}
          style={estilos.inputNotas}
          placeholder="Sensaciones, clima, terreno, etc."
          placeholderTextColor="#5F667A"
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={estilos.filaFechaHora}>
        <View style={estilos.itemFechaHora}>
          <Text style={estilos.etiqueta}>DURACION TOTAL</Text>
          <View style={estilos.cajaFechaHora}>
            <Clock3 color={coloresBase.acentoNeon} size={20} />
            <Text style={estilos.textoFechaHora}>{`${horas}:${minutos}:${segundos}`}</Text>
          </View>
        </View>
      </View>

      <BotonPrincipal
        titulo={guardando ? 'Guardando...' : runningId ? 'Guardar cambios' : 'Guardar entrenamiento'}
        onPress={guardar}
        cargando={guardando}
        deshabilitado={guardando || eliminando || cargando}
      />
    </ContenedorPantalla>
  );

  function hidratarDesdeRegistro(registro: RegistroRunning) {
    setFechaSesion(registro.fechaSesion);
    setDistancia(registro.distanciaKm.toFixed(2));
    setTipo(registro.tipo);
    setNotas(registro.notas ?? '');

    const duracion = partirDuracionSegundos(registro.duracionSegundos);
    setHoras(duracion.horas);
    setMinutos(duracion.minutos);
    setSegundos(duracion.segundos);
  }
}

interface PropiedadesCajaDuracion {
  valor: string;
  unidad: string;
  onChangeText: (valor: string) => void;
}

function CajaDuracion({ valor, unidad, onChangeText }: PropiedadesCajaDuracion) {
  return (
    <View style={estilos.cajaDuracion}>
      <TextInput
        value={valor}
        onChangeText={(texto) => onChangeText(texto.replace(/[^0-9]/g, '').slice(0, 2))}
        style={estilos.inputDuracion}
        keyboardType="number-pad"
        maxLength={2}
        placeholder="00"
        placeholderTextColor="#68718A"
      />
      <Text style={estilos.unidadDuracion}>{unidad}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 140,
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
    fontSize: 24,
    fontWeight: '800',
  },
  tarjetaPlanSemanal: {
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: 'rgba(216,255,62,0.35)',
    backgroundColor: 'rgba(216,255,62,0.08)',
    padding: espaciadoBase.md,
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
  textoEstadoPlan: {
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
  alertaMeta: {
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: 'rgba(216,255,62,0.45)',
    backgroundColor: 'rgba(216,255,62,0.12)',
    padding: espaciadoBase.md,
    flexDirection: 'row',
    gap: espaciadoBase.sm,
  },
  alertaTexto: {
    flex: 1,
    gap: 4,
  },
  alertaTitulo: {
    color: coloresBase.acentoNeon,
    fontSize: 20,
    fontWeight: '700',
  },
  alertaMensaje: {
    color: '#A7B17C',
    fontSize: 16,
    lineHeight: 24,
  },
  bloqueCampo: {
    gap: espaciadoBase.sm,
  },
  etiqueta: {
    color: '#8F98AF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  campoGrande: {
    minHeight: 78,
    borderRadius: radiosBase.lg,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    paddingHorizontal: espaciadoBase.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputGrande: {
    flex: 1,
    color: '#D9E0F0',
    fontSize: 21,
    fontWeight: '700',
  },
  sufijoCampo: {
    color: '#96A0B8',
    fontSize: 18,
    fontWeight: '600',
  },
  filaDuracion: {
    flexDirection: 'row',
    gap: espaciadoBase.sm,
  },
  cajaDuracion: {
    flex: 1,
    minHeight: 90,
    borderRadius: radiosBase.md,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 8,
  },
  inputDuracion: {
    color: '#DCE3F3',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 40,
  },
  unidadDuracion: {
    color: '#8E97AF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  filaTipos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciadoBase.xs,
  },
  chipTipo: {
    borderRadius: radiosBase.pill,
    borderWidth: 1,
    borderColor: '#2E3343',
    backgroundColor: '#232633',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 10,
  },
  chipTipoActivo: {
    backgroundColor: 'rgba(216,255,62,0.2)',
    borderColor: 'rgba(216,255,62,0.8)',
  },
  textoChipTipo: {
    color: '#B2BAD0',
    fontSize: 14,
    fontWeight: '700',
  },
  textoChipTipoActivo: {
    color: coloresBase.acentoNeon,
  },
  filaFechaHora: {
    flexDirection: 'row',
    gap: espaciadoBase.sm,
  },
  itemFechaHora: {
    flex: 1,
    gap: espaciadoBase.sm,
  },
  cajaFechaHora: {
    minHeight: 64,
    borderRadius: radiosBase.md,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.xs,
    paddingHorizontal: espaciadoBase.md,
  },
  inputFecha: {
    flex: 1,
    color: '#E5EAF8',
    fontSize: 18,
    fontWeight: '600',
  },
  textoFechaHora: {
    color: '#E5EAF8',
    fontSize: 18,
    fontWeight: '600',
  },
  inputNotas: {
    minHeight: 120,
    borderRadius: radiosBase.lg,
    backgroundColor: '#232633',
    borderWidth: 1,
    borderColor: '#2E3343',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: espaciadoBase.md,
    color: '#DDE3F4',
    fontSize: 16,
  },
});
