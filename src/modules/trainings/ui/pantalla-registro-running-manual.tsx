import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CalendarDays, Clock3, PersonStanding, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  eliminarRegistroRunning,
  guardarRegistroRunning,
  obtenerRegistroRunning,
  type RegistroRunning,
} from '@/src/modules/trainings/data/entrenamientos.api';
import { type TipoRunning } from '@/src/modules/trainings/domain/tipos-entrenamiento';
import { BotonPrincipal } from '@/src/shared/ui/boton-principal';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { obtenerFechaIsoActual } from '@/src/shared/utils/fechas';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

const tiposRunning: { valor: TipoRunning; etiqueta: string }[] = [
  { valor: 'rodaje_suave', etiqueta: 'Rodaje suave' },
  { valor: 'series', etiqueta: 'Series' },
  { valor: 'fondo_largo', etiqueta: 'Fondo largo' },
  { valor: 'tempo', etiqueta: 'Tempo' },
  { valor: 'recuperacion', etiqueta: 'Recuperacion' },
];

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

export function PantallaRegistroRunningManual() {
  const parametros = useLocalSearchParams<{ runningId?: string | string[]; fecha?: string | string[] }>();
  const runningId = Array.isArray(parametros.runningId)
    ? parametros.runningId[0]
    : parametros.runningId;
  const fechaPrefijada = Array.isArray(parametros.fecha) ? parametros.fecha[0] : parametros.fecha;

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

  const tituloPantalla = runningId ? 'Editar corrida' : 'Registrar corrida manual';

  useEffect(() => {
    if (!runningId && fechaPrefijada) {
      setFechaSesion(fechaPrefijada);
    }
  }, [fechaPrefijada, runningId]);

  useEffect(() => {
    if (!runningId) {
      return;
    }

    let montado = true;

    const cargarRegistro = async () => {
      try {
        const registro = await obtenerRegistroRunning(runningId);
        if (!montado) {
          return;
        }

        if (!registro) {
          Alert.alert('No encontramos la corrida', 'Puede que haya sido eliminada.', [
            { text: 'Volver', onPress: () => router.back() },
          ]);
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

    cargarRegistro();

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

      <View style={estilos.alertaMeta}>
        <PersonStanding color={coloresBase.acentoNeon} size={22} strokeWidth={2.4} />
        <View style={estilos.alertaTexto}>
          <Text style={estilos.alertaTitulo}>Camino al 21K</Text>
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
          {tiposRunning.map((opcion) => (
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

