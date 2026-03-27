import { router } from 'expo-router';
import { ChevronLeft, Dumbbell, PersonStanding } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';

import { guardarSensacionDia, listarSensacionesPorRango, type SensacionDiaria } from '@/src/modules/calendar/data/sensaciones.api';
import {
  listarRegistrosGymPorRango,
  listarRegistrosRunningPorRango,
  type RegistroGym,
  type RegistroRunning,
} from '@/src/modules/trainings/data/entrenamientos.api';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { obtenerFechaIsoActual, obtenerRangoMesIso } from '@/src/shared/utils/fechas';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

type EntradaDia =
  | { tipo: 'running'; id: string; titulo: string; subtitulo: string }
  | { tipo: 'gimnasio'; id: string; titulo: string; subtitulo: string };

type DiaMarcado = {
  selected?: boolean;
  selectedColor?: string;
  dots?: { key: string; color: string }[];
};

type DiasMarcados = Record<string, DiaMarcado>;

const colorRunning = '#D8FF3E';
const colorGym = '#6EB5FF';

function descripcionRunning(registro: RegistroRunning) {
  const minutos = Math.floor(registro.duracionSegundos / 60);
  const segundos = registro.duracionSegundos % 60;
  return `${registro.distanciaKm.toFixed(2)} km - ${minutos}:${segundos.toString().padStart(2, '0')} - ${registro.tipo}`;
}

function descripcionGym(registro: RegistroGym) {
  return `${registro.ejercicios.length} ejercicios`;
}

function generarClaveMes(fechaIso: string) {
  return fechaIso.slice(0, 7);
}

function obtenerAnioMes(fechaIso: string) {
  const [anioTexto, mesTexto] = fechaIso.split('-');
  return {
    anio: Number.parseInt(anioTexto ?? '', 10),
    mes: Number.parseInt(mesTexto ?? '', 10),
  };
}

export function PantallaCalendario() {
  const hoyIso = obtenerFechaIsoActual();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyIso);
  const [claveMesVisible, setClaveMesVisible] = useState(generarClaveMes(hoyIso));
  const [runningMes, setRunningMes] = useState<RegistroRunning[]>([]);
  const [gymMes, setGymMes] = useState<RegistroGym[]>([]);
  const [sensacionesMes, setSensacionesMes] = useState<SensacionDiaria[]>([]);
  const [sensacionSeleccionada, setSensacionSeleccionada] = useState<number>(3);
  const [notasSensacion, setNotasSensacion] = useState('');
  const [guardandoSensacion, setGuardandoSensacion] = useState(false);

  const cargarMes = useCallback(async (fechaReferencia: string) => {
    try {
      const { anio, mes } = obtenerAnioMes(fechaReferencia);
      if (!anio || !mes) {
        return;
      }

      const rangoMes = obtenerRangoMesIso(anio, mes);
      const [running, gym, sensaciones] = await Promise.all([
        listarRegistrosRunningPorRango(rangoMes.inicio, rangoMes.fin),
        listarRegistrosGymPorRango(rangoMes.inicio, rangoMes.fin),
        listarSensacionesPorRango(rangoMes.inicio, rangoMes.fin),
      ]);

      setRunningMes(running);
      setGymMes(gym);
      setSensacionesMes(sensaciones);

      const sensacionDia = sensaciones.find((item) => item.fecha === fechaSeleccionada);
      if (sensacionDia) {
        setSensacionSeleccionada(sensacionDia.sensacion);
        setNotasSensacion(sensacionDia.notas ?? '');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo cargar el calendario.';
      Alert.alert('Error', mensaje);
    }
  }, [fechaSeleccionada]);

  useFocusEffect(
    useCallback(() => {
      void cargarMes(fechaSeleccionada);
    }, [cargarMes, fechaSeleccionada])
  );

  const entradasDiaSeleccionado = useMemo<EntradaDia[]>(() => {
    const running = runningMes
      .filter((item) => item.fechaSesion === fechaSeleccionada)
      .map<EntradaDia>((item) => ({
        tipo: 'running',
        id: item.id,
        titulo: 'Running',
        subtitulo: descripcionRunning(item),
      }));

    const gym = gymMes
      .filter((item) => item.fechaSesion === fechaSeleccionada)
      .map<EntradaDia>((item) => ({
        tipo: 'gimnasio',
        id: item.id,
        titulo: 'Gimnasio',
        subtitulo: descripcionGym(item),
      }));

    return [...running, ...gym];
  }, [fechaSeleccionada, gymMes, runningMes]);

  const diasMarcados = useMemo<DiasMarcados>(() => {
    const marcado: DiasMarcados = {};

    const runningPorDia = new Set(runningMes.map((item) => item.fechaSesion));
    const gymPorDia = new Set(gymMes.map((item) => item.fechaSesion));

    const dias = new Set([...runningPorDia, ...gymPorDia]);

    dias.forEach((dia) => {
      const dots: { key: string; color: string }[] = [];
      if (runningPorDia.has(dia)) {
        dots.push({ key: 'running', color: colorRunning });
      }
      if (gymPorDia.has(dia)) {
        dots.push({ key: 'gym', color: colorGym });
      }

      marcado[dia] = { dots };
    });

    marcado[fechaSeleccionada] = {
      ...(marcado[fechaSeleccionada] ?? {}),
      selected: true,
      selectedColor: coloresBase.acentoNeon,
    };

    return marcado;
  }, [fechaSeleccionada, gymMes, runningMes]);

  const guardarSensacion = async () => {
    if (guardandoSensacion) {
      return;
    }

    try {
      setGuardandoSensacion(true);
      await guardarSensacionDia({
        fecha: fechaSeleccionada,
        sensacion: sensacionSeleccionada,
        notas: notasSensacion,
      });

      setSensacionesMes((actual) => {
        const resto = actual.filter((item) => item.fecha !== fechaSeleccionada);
        return [...resto, { id: `local-${fechaSeleccionada}`, fecha: fechaSeleccionada, sensacion: sensacionSeleccionada, notas: notasSensacion }];
      });

      Alert.alert('Guardado', 'Sensacion del dia actualizada.');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la sensacion.';
      Alert.alert('Error', mensaje);
    } finally {
      setGuardandoSensacion(false);
    }
  };

  return (
    <ContenedorPantalla modo="claro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.encabezadoPrincipal}>
        <Pressable style={estilos.botonCircular} onPress={() => router.push('/(tabs)')}>
          <ChevronLeft color={coloresBase.textoPrincipalClaro} size={26} strokeWidth={2.4} />
        </Pressable>
        <Text style={estilos.tituloPantalla}>Calendario</Text>
        <View style={estilos.botonCircular} />
      </View>

      <View style={estilos.tarjetaCalendario}>
        <Calendar
          current={fechaSeleccionada}
          markingType="multi-dot"
          markedDates={diasMarcados}
          onDayPress={(dia: DateData) => {
            setFechaSeleccionada(dia.dateString);

            const sensacion = sensacionesMes.find((item) => item.fecha === dia.dateString);
            setSensacionSeleccionada(sensacion?.sensacion ?? 3);
            setNotasSensacion(sensacion?.notas ?? '');
          }}
          onMonthChange={(mes) => {
            const claveMes = `${mes.year}-${mes.month.toString().padStart(2, '0')}`;
            if (claveMes !== claveMesVisible) {
              setClaveMesVisible(claveMes);
              void cargarMes(`${mes.year}-${mes.month.toString().padStart(2, '0')}-01`);
            }
          }}
          firstDay={1}
          hideExtraDays={false}
          theme={{
            calendarBackground: 'transparent',
            textSectionTitleColor: '#7D859A',
            monthTextColor: coloresBase.textoPrincipalClaro,
            dayTextColor: coloresBase.textoPrincipalClaro,
            textDisabledColor: '#C9CFDC',
            selectedDayBackgroundColor: coloresBase.acentoNeon,
            selectedDayTextColor: '#111827',
            todayTextColor: '#111827',
            arrowColor: coloresBase.textoPrincipalClaro,
          }}
        />
      </View>

      <View style={estilos.filaAgendaEncabezado}>
        <Text style={estilos.tituloAgenda}>Agenda {fechaSeleccionada}</Text>
        <View style={estilos.leyenda}>
          <View style={[estilos.dotLeyenda, { backgroundColor: colorRunning }]} />
          <Text style={estilos.textoLeyenda}>Running</Text>
          <View style={[estilos.dotLeyenda, { backgroundColor: colorGym }]} />
          <Text style={estilos.textoLeyenda}>Gym</Text>
        </View>
      </View>

      {entradasDiaSeleccionado.length === 0 ? (
        <View style={estilos.tarjetaVacia}>
          <Text style={estilos.textoVacio}>No hay entrenamientos para este dia.</Text>
        </View>
      ) : (
        entradasDiaSeleccionado.map((entrada) => (
          <Pressable
            key={`${entrada.tipo}-${entrada.id}`}
            style={estilos.tarjetaAgenda}
            onPress={() => {
              if (entrada.tipo === 'running') {
                router.push({ pathname: '/registro-running', params: { runningId: entrada.id } });
                return;
              }

              router.push({ pathname: '/sesion-gym', params: { gymId: entrada.id } });
            }}>
            <View style={[estilos.iconoAgenda, entrada.tipo === 'running' ? estilos.iconoRunning : estilos.iconoGym]}>
              {entrada.tipo === 'running' ? (
                <PersonStanding color={coloresBase.fondoOscuro} size={24} />
              ) : (
                <Dumbbell color={coloresBase.fondoOscuro} size={24} />
              )}
            </View>
            <View style={estilos.infoAgenda}>
              <Text style={estilos.tituloItemAgenda}>{entrada.titulo}</Text>
              <Text style={estilos.subtituloItemAgenda}>{entrada.subtitulo}</Text>
            </View>
          </Pressable>
        ))
      )}

      <View style={estilos.filaAccionesDia}>
        <Pressable
          style={estilos.botonAccionDia}
          onPress={() => router.push({ pathname: '/registro-running', params: { fecha: fechaSeleccionada } })}>
          <Text style={estilos.textoAccionDia}>+ Running</Text>
        </Pressable>
        <Pressable
          style={estilos.botonAccionDia}
          onPress={() => router.push({ pathname: '/sesion-gym', params: { fecha: fechaSeleccionada } })}>
          <Text style={estilos.textoAccionDia}>+ Gym</Text>
        </Pressable>
      </View>

      <View style={estilos.tarjetaSensacion}>
        <Text style={estilos.tituloSensacion}>Sensacion del dia</Text>
        <View style={estilos.filaSensaciones}>
          {[1, 2, 3, 4, 5].map((valor) => (
            <Pressable
              key={valor}
              style={[estilos.chipSensacion, sensacionSeleccionada === valor ? estilos.chipSensacionActiva : null]}
              onPress={() => setSensacionSeleccionada(valor)}>
              <Text style={[estilos.textoChipSensacion, sensacionSeleccionada === valor ? estilos.textoChipSensacionActiva : null]}>
                {valor}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={notasSensacion}
          onChangeText={setNotasSensacion}
          style={estilos.inputNotas}
          placeholder="Como te sentiste hoy?"
          placeholderTextColor="#6F778B"
          multiline
          textAlignVertical="top"
        />

        <Pressable style={estilos.botonGuardarSensacion} onPress={guardarSensacion}>
          <Text style={estilos.textoGuardarSensacion}>{guardandoSensacion ? 'Guardando...' : 'Guardar sensacion'}</Text>
        </Pressable>
      </View>
    </ContenedorPantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 130,
  },
  encabezadoPrincipal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botonCircular: {
    width: 52,
    height: 52,
    borderRadius: radiosBase.pill,
    backgroundColor: '#E9ECF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloPantalla: {
    fontSize: 24,
    fontWeight: '800',
    color: coloresBase.textoPrincipalClaro,
  },
  tarjetaCalendario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E5EE',
    paddingVertical: espaciadoBase.sm,
    paddingHorizontal: espaciadoBase.xs,
  },
  filaAgendaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espaciadoBase.sm,
  },
  tituloAgenda: {
    color: coloresBase.textoPrincipalClaro,
    fontSize: 20,
    fontWeight: '800',
  },
  leyenda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dotLeyenda: {
    width: 8,
    height: 8,
    borderRadius: 99,
  },
  textoLeyenda: {
    color: '#7D859A',
    fontSize: 12,
    fontWeight: '600',
  },
  tarjetaVacia: {
    borderRadius: radiosBase.lg,
    backgroundColor: '#ECEFF5',
    padding: espaciadoBase.md,
  },
  textoVacio: {
    color: '#7A839A',
    fontSize: 15,
  },
  tarjetaAgenda: {
    backgroundColor: '#ECEFF5',
    borderRadius: radiosBase.lg,
    padding: espaciadoBase.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.md,
  },
  iconoAgenda: {
    width: 54,
    height: 54,
    borderRadius: radiosBase.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoRunning: {
    backgroundColor: colorRunning,
  },
  iconoGym: {
    backgroundColor: colorGym,
  },
  infoAgenda: {
    flex: 1,
    gap: 4,
  },
  tituloItemAgenda: {
    color: coloresBase.textoPrincipalClaro,
    fontSize: 19,
    fontWeight: '800',
  },
  subtituloItemAgenda: {
    color: '#79839A',
    fontSize: 14,
    fontWeight: '500',
  },
  filaAccionesDia: {
    flexDirection: 'row',
    gap: espaciadoBase.sm,
  },
  botonAccionDia: {
    flex: 1,
    minHeight: 48,
    borderRadius: radiosBase.pill,
    backgroundColor: '#121826',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAccionDia: {
    color: '#F4F7FF',
    fontSize: 14,
    fontWeight: '700',
  },
  tarjetaSensacion: {
    borderRadius: radiosBase.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E5EE',
    padding: espaciadoBase.md,
    gap: espaciadoBase.sm,
  },
  tituloSensacion: {
    color: coloresBase.textoPrincipalClaro,
    fontSize: 17,
    fontWeight: '800',
  },
  filaSensaciones: {
    flexDirection: 'row',
    gap: 8,
  },
  chipSensacion: {
    width: 36,
    height: 36,
    borderRadius: radiosBase.pill,
    backgroundColor: '#EFF2F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSensacionActiva: {
    backgroundColor: coloresBase.acentoNeon,
  },
  textoChipSensacion: {
    color: '#6A7288',
    fontWeight: '700',
  },
  textoChipSensacionActiva: {
    color: '#111827',
  },
  inputNotas: {
    minHeight: 88,
    borderRadius: radiosBase.md,
    backgroundColor: '#EFF2F8',
    borderWidth: 1,
    borderColor: '#D8DFEC',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: espaciadoBase.sm,
    color: coloresBase.textoPrincipalClaro,
    fontSize: 15,
  },
  botonGuardarSensacion: {
    minHeight: 44,
    borderRadius: radiosBase.pill,
    backgroundColor: '#121826',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoGuardarSensacion: {
    color: '#F4F7FF',
    fontSize: 14,
    fontWeight: '700',
  },
});

