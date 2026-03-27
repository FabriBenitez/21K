import { router } from 'expo-router';
import { Bell, LogOut, Save, Sparkles, Target } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { guardarObjetivo21k, obtenerObjetivo21k } from '@/src/modules/goals/data/objetivos.api';
import {
  crearFraseMotivacionalPersonalizada,
  listarFrasesMotivacionalesActivas,
  type ContextoFrase,
  type FraseMotivacional,
} from '@/src/modules/motivation/data/frases.api';
import { listarEntrenamientosDominioPorRango } from '@/src/modules/trainings/data/entrenamientos.api';
import {
  calcularKmTotales,
  calcularRitmoPromedioSemana,
  formatearRitmo,
  obtenerFondoMasLargo,
} from '@/src/modules/trainings/domain/metricas-entrenamiento';
import { rutasApp } from '@/src/shared/navigation/rutas-app';
import { useEstadoApp } from '@/src/shared/state/contexto-app';
import { AnilloProgreso } from '@/src/shared/ui/anillo-progreso';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { calcularDiasHasta, convertirFechaIsoEnUtc, convertirFechaEnIso, obtenerFechaIsoActual, obtenerFechaIsoHaceDias } from '@/src/shared/utils/fechas';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

const contextosFrase: { valor: ContextoFrase; etiqueta: string }[] = [
  { valor: 'general', etiqueta: 'General' },
  { valor: 'running', etiqueta: 'Running' },
  { valor: 'gym', etiqueta: 'Gym' },
  { valor: 'logro', etiqueta: 'Logro' },
  { valor: 'descanso', etiqueta: 'Descanso' },
];

interface EstadoPerfil {
  fechaObjetivo: string;
  distanciaObjetivo: string;
  ritmoObjetivo: string;
  kmAcumulados: number;
  ritmoPromedio: string;
  fondoMaximo: number;
  diasRestantes?: number;
  frases: FraseMotivacional[];
}

const estadoInicial: EstadoPerfil = {
  fechaObjetivo: '',
  distanciaObjetivo: '21.1',
  ritmoObjetivo: '',
  kmAcumulados: 0,
  ritmoPromedio: '-',
  fondoMaximo: 0,
  frases: [],
};

function convertirRitmoTextoASegundos(ritmoTexto: string): number | undefined {
  const limpio = ritmoTexto.trim();
  if (!limpio) {
    return undefined;
  }

  const partes = limpio.split(':');
  if (partes.length !== 2) {
    return undefined;
  }

  const minutos = Number.parseInt(partes[0] ?? '', 10);
  const segundos = Number.parseInt(partes[1] ?? '', 10);
  if (!Number.isFinite(minutos) || !Number.isFinite(segundos)) {
    return undefined;
  }

  return minutos * 60 + segundos;
}

function convertirRitmoSegundosATexto(ritmoSeg?: number): string {
  if (!ritmoSeg || ritmoSeg <= 0) {
    return '';
  }

  const minutos = Math.floor(ritmoSeg / 60);
  const segundos = ritmoSeg % 60;
  return `${minutos}:${segundos.toString().padStart(2, '0')}`;
}

function convertirDistanciaObjetivoATexto(distanciaKm?: number): string {
  if (!distanciaKm || distanciaKm <= 0) {
    return '21.1';
  }

  return distanciaKm.toFixed(1);
}

function convertirTextoADistanciaObjetivo(valor: string): number | null {
  const normalizado = valor.trim().replace(',', '.');
  if (!normalizado) {
    return null;
  }

  const distancia = Number.parseFloat(normalizado);
  if (!Number.isFinite(distancia) || distancia <= 0) {
    return null;
  }

  return distancia;
}

function obtenerFechaObjetivoDesdeEstado(fechaObjetivoIso: string): Date {
  const fecha = convertirFechaIsoEnUtc(fechaObjetivoIso);
  if (fecha) {
    return new Date(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
  }

  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
}

export function PantallaPerfil() {
  const { width } = useWindowDimensions();
  const esPantallaCompacta = width < 380;
  const tamanoAnillo = esPantallaCompacta ? 112 : 130;
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [guardandoObjetivo, setGuardandoObjetivo] = useState(false);
  const [guardandoFrase, setGuardandoFrase] = useState(false);
  const [estado, setEstado] = useState<EstadoPerfil>(estadoInicial);
  const [mostrarCalendarioObjetivo, setMostrarCalendarioObjetivo] = useState(false);
  const [fraseNueva, setFraseNueva] = useState('');
  const [contextoFrase, setContextoFrase] = useState<ContextoFrase>('general');

  const { cerrarSesion, usuario } = useEstadoApp();

  const cargarPerfil = useCallback(async () => {
    try {
      const hoy = obtenerFechaIsoActual();
      const fechaDesde = obtenerFechaIsoHaceDias(84);

      const [objetivo, frases, entrenamientos] = await Promise.all([
        obtenerObjetivo21k(),
        listarFrasesMotivacionalesActivas(),
        listarEntrenamientosDominioPorRango(fechaDesde, hoy),
      ]);

      const kmAcumulados = calcularKmTotales(entrenamientos);
      const fondoMaximo = obtenerFondoMasLargo(entrenamientos);
      const ritmoPromedio = formatearRitmo(calcularRitmoPromedioSemana(entrenamientos));

      setEstado({
        fechaObjetivo: objetivo?.fechaObjetivo ?? '',
        distanciaObjetivo: convertirDistanciaObjetivoATexto(objetivo?.distanciaObjetivoKm),
        ritmoObjetivo: convertirRitmoSegundosATexto(objetivo?.ritmoObjetivoSegKm),
        kmAcumulados,
        ritmoPromedio,
        fondoMaximo,
        diasRestantes: objetivo ? calcularDiasHasta(objetivo.fechaObjetivo, hoy) ?? undefined : undefined,
        frases,
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo cargar perfil.';
      Alert.alert('Error', mensaje);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarPerfil();
    }, [cargarPerfil])
  );

  const cerrarSesionCuenta = async () => {
    if (cerrandoSesion) {
      return;
    }

    setCerrandoSesion(true);
    const resultado = await cerrarSesion();
    setCerrandoSesion(false);

    if (!resultado.ok) {
      Alert.alert('No pudimos cerrar sesion', resultado.mensaje ?? 'Intentalo nuevamente.');
      return;
    }

    router.replace(rutasApp.auth.login);
  };

  const guardarObjetivo = async () => {
    if (guardandoObjetivo) {
      return;
    }

    if (!estado.fechaObjetivo.trim()) {
      Alert.alert('Fecha requerida', 'Selecciona la fecha objetivo desde el calendario.');
      return;
    }

    const hoy = obtenerFechaIsoActual();
    if (estado.fechaObjetivo.localeCompare(hoy) < 0) {
      Alert.alert('Fecha invalida', 'La fecha objetivo no puede ser anterior a hoy.');
      return;
    }

    const distanciaObjetivoKm = convertirTextoADistanciaObjetivo(estado.distanciaObjetivo);
    if (!distanciaObjetivoKm) {
      Alert.alert('Distancia invalida', 'Ingresa una distancia objetivo valida en km.');
      return;
    }

    try {
      setGuardandoObjetivo(true);
      await guardarObjetivo21k({
        fechaObjetivo: estado.fechaObjetivo,
        distanciaObjetivoKm,
        ritmoObjetivoSegKm: convertirRitmoTextoASegundos(estado.ritmoObjetivo),
      });
      Alert.alert('Objetivo guardado', 'Tu meta 21K fue actualizada.');
      await cargarPerfil();
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el objetivo.';
      Alert.alert('Error', mensaje);
    } finally {
      setGuardandoObjetivo(false);
    }
  };

  const onCambiarFechaObjetivo = (evento: DateTimePickerEvent, fechaSeleccionada?: Date) => {
    if (Platform.OS === 'android') {
      setMostrarCalendarioObjetivo(false);
    }

    if (evento.type !== 'set' || !fechaSeleccionada) {
      return;
    }

    const hoy = new Date();
    const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const fechaSinHora = new Date(
      fechaSeleccionada.getFullYear(),
      fechaSeleccionada.getMonth(),
      fechaSeleccionada.getDate()
    );

    if (fechaSinHora < hoySinHora) {
      Alert.alert('Fecha invalida', 'No puedes elegir una fecha pasada.');
      return;
    }

    setEstado((actual) => ({ ...actual, fechaObjetivo: convertirFechaEnIso(fechaSinHora) }));
  };

  const guardarFrase = async () => {
    if (guardandoFrase) {
      return;
    }

    if (fraseNueva.trim().length < 3) {
      Alert.alert('Frase invalida', 'Escribe al menos 3 caracteres.');
      return;
    }

    try {
      setGuardandoFrase(true);
      await crearFraseMotivacionalPersonalizada({ frase: fraseNueva, contexto: contextoFrase });
      setFraseNueva('');
      await cargarPerfil();
      Alert.alert('Frase guardada', 'Ya esta disponible para aparecer en tu pantalla de estadisticas.');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo guardar la frase.';
      Alert.alert('Error', mensaje);
    } finally {
      setGuardandoFrase(false);
    }
  };

  const progresoMeta = useMemo(() => {
    const valor = (estado.fondoMaximo / 21.1) * 100;
    return Number.isFinite(valor) ? Math.min(Math.max(valor, 0), 100) : 0;
  }, [estado.fondoMaximo]);

  const inicialNombre = (usuario?.nombreMostrado ?? 'Corredor').charAt(0).toUpperCase() || 'C';
  const nombreMostrado = usuario?.nombreMostrado ?? 'Corredor 21K';

  return (
    <ContenedorPantalla modo="claro" desplazable estiloContenido={estilos.contenido}>
      <View style={[estilos.encabezado, esPantallaCompacta ? estilos.encabezadoCompacto : null]}>
        <View style={[estilos.filaUsuario, esPantallaCompacta ? estilos.filaUsuarioCompacta : null]}>
          <View style={estilos.avatar}>
            <Text style={estilos.avatarTexto}>{inicialNombre}</Text>
          </View>
          <View style={estilos.bloqueNombreUsuario}>
            <Text style={estilos.saludo}>Bienvenido de nuevo,</Text>
            <Text style={[estilos.nombre, esPantallaCompacta ? estilos.nombreCompacto : null]} numberOfLines={1}>
              {nombreMostrado}
            </Text>
          </View>
        </View>

        <View style={[estilos.accionesEncabezado, esPantallaCompacta ? estilos.accionesEncabezadoCompacto : null]}>
          <Pressable style={estilos.botonIconoEncabezado}>
            <Bell color={coloresBase.acentoNeonSuave} size={24} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            style={[estilos.botonSalir, cerrandoSesion ? estilos.botonDeshabilitado : null]}
            onPress={cerrarSesionCuenta}
            disabled={cerrandoSesion}>
            <LogOut color={coloresBase.textoPrincipalClaro} size={18} strokeWidth={2.4} />
            <Text style={estilos.textoBotonSalir}>{cerrandoSesion ? '...' : 'Salir'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={estilos.tarjetaMetaPrincipal}>
        <View style={estilos.filaMetaTitulo}>
          <Target color={coloresBase.fondoOscuro} size={20} />
          <Text style={estilos.textoRuta}>CAMINO A LA MEDIA MARATON</Text>
        </View>
        <Text style={[estilos.tituloMetaPrincipal, esPantallaCompacta ? estilos.tituloMetaPrincipalCompacto : null]}>
          {estado.diasRestantes ?? '--'} dias para tu objetivo
        </Text>

        <View style={[estilos.filaProgresoMeta, esPantallaCompacta ? estilos.filaProgresoMetaCompacta : null]}>
          <View style={[estilos.anilloClaro, esPantallaCompacta ? estilos.anilloClaroCompacto : null]}>
            <AnilloProgreso progreso={progresoMeta / 100} tamano={tamanoAnillo} textoCentro={`${Math.round(progresoMeta)}%`} />
            <Text style={estilos.textoReady}>FONDO MAX</Text>
          </View>

          <View style={estilos.metricasMeta}>
            <View style={estilos.itemMetricaMeta}>
              <Text style={estilos.etiquetaMetricaMeta}>Distancia acumulada</Text>
              <Text style={estilos.valorMetricaMeta}>{estado.kmAcumulados.toFixed(1)} km</Text>
            </View>
            <View style={estilos.itemMetricaMeta}>
              <Text style={estilos.etiquetaMetricaMeta}>Ritmo promedio</Text>
              <Text style={estilos.valorMetricaMeta}>{estado.ritmoPromedio}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={estilos.tarjetaConfiguracion}>
        <Text style={estilos.tituloSeccion}>Objetivo 21K</Text>
        <Text style={estilos.etiquetaCampo}>Fecha objetivo</Text>
        <Pressable style={estilos.selectorFecha} onPress={() => setMostrarCalendarioObjetivo(true)}>
          <Text style={[estilos.textoSelectorFecha, !estado.fechaObjetivo ? estilos.textoPlaceholder : null]}>
            {estado.fechaObjetivo || 'Seleccionar fecha'}
          </Text>
        </Pressable>
        {mostrarCalendarioObjetivo ? (
          <View style={estilos.bloqueCalendario}>
            <DateTimePicker
              value={obtenerFechaObjetivoDesdeEstado(estado.fechaObjetivo)}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onCambiarFechaObjetivo}
            />
            {Platform.OS === 'ios' ? (
              <Pressable style={estilos.botonCerrarCalendario} onPress={() => setMostrarCalendarioObjetivo(false)}>
                <Text style={estilos.textoCerrarCalendario}>Listo</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <Text style={estilos.etiquetaCampo}>Distancia objetivo (km)</Text>
        <TextInput
          value={estado.distanciaObjetivo}
          onChangeText={(valor) => setEstado((actual) => ({ ...actual, distanciaObjetivo: valor.replace(',', '.') }))}
          style={estilos.inputSimple}
          placeholder="Ej: 21.1"
          placeholderTextColor="#7E879D"
          keyboardType="decimal-pad"
        />
        <Text style={estilos.etiquetaCampo}>Ritmo objetivo (opcional)</Text>
        <TextInput
          value={estado.ritmoObjetivo}
          onChangeText={(valor) => setEstado((actual) => ({ ...actual, ritmoObjetivo: valor }))}
          style={estilos.inputSimple}
          placeholder="Ritmo objetivo (mm:ss) opcional"
          placeholderTextColor="#7E879D"
        />
        <Pressable style={estilos.botonGuardar} onPress={guardarObjetivo}>
          <Save color={coloresBase.fondoOscuro} size={16} />
          <Text style={estilos.textoBotonGuardar}>{guardandoObjetivo ? 'Guardando...' : 'Guardar objetivo'}</Text>
        </Pressable>
      </View>

      <View style={estilos.tarjetaFrases}>
        <View style={estilos.filaFrasesTitulo}>
          <Sparkles color={coloresBase.acentoNeon} size={18} />
          <Text style={estilos.tituloSeccion}>Frases motivacionales</Text>
        </View>
        <TextInput
          value={fraseNueva}
          onChangeText={setFraseNueva}
          style={estilos.inputSimple}
          placeholder="Escribe una frase personalizada"
          placeholderTextColor="#7E879D"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.filaContextos}>
          {contextosFrase.map((contexto) => (
            <Pressable
              key={contexto.valor}
              style={[estilos.chipContexto, contextoFrase === contexto.valor ? estilos.chipContextoActivo : null]}
              onPress={() => setContextoFrase(contexto.valor)}>
              <Text
                style={[
                  estilos.textoChipContexto,
                  contextoFrase === contexto.valor ? estilos.textoChipContextoActivo : null,
                ]}>
                {contexto.etiqueta}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable style={estilos.botonGuardar} onPress={guardarFrase}>
          <Text style={estilos.textoBotonGuardar}>{guardandoFrase ? 'Guardando...' : 'Guardar frase'}</Text>
        </Pressable>

        <View style={estilos.listaFrases}>
          {estado.frases.slice(0, 6).map((frase) => (
            <View key={frase.id} style={estilos.itemFrase}>
              <Text style={estilos.textoFrase}>{`"${frase.frase}"`}</Text>
              <Text style={estilos.contextoFrase}>{frase.contexto}</Text>
            </View>
          ))}
        </View>
      </View>
    </ContenedorPantalla>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 172,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espaciadoBase.sm,
  },
  encabezadoCompacto: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  accionesEncabezado: {
    flexDirection: 'row',
    gap: espaciadoBase.xs,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  accionesEncabezadoCompacto: {
    alignSelf: 'flex-end',
  },
  filaUsuario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaciadoBase.md,
    flex: 1,
  },
  filaUsuarioCompacta: {
    gap: espaciadoBase.sm,
  },
  bloqueNombreUsuario: {
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radiosBase.pill,
    backgroundColor: '#121826',
    borderWidth: 3,
    borderColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTexto: {
    color: '#EAF0FF',
    fontWeight: '800',
    fontSize: 14,
  },
  saludo: {
    color: coloresBase.textoSecundarioClaro,
    fontSize: 15,
  },
  nombre: {
    color: coloresBase.textoPrincipalClaro,
    fontSize: 22,
    fontWeight: '800',
  },
  nombreCompacto: {
    fontSize: 19,
  },
  botonIconoEncabezado: {
    width: 48,
    height: 48,
    borderRadius: radiosBase.pill,
    backgroundColor: '#E8EDF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonSalir: {
    minHeight: 48,
    borderRadius: radiosBase.pill,
    backgroundColor: '#121826',
    paddingHorizontal: espaciadoBase.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  textoBotonSalir: {
    color: '#F4F7FF',
    fontSize: 13,
    fontWeight: '700',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  tarjetaMetaPrincipal: {
    borderRadius: 26,
    backgroundColor: '#F7F8F3',
    borderWidth: 1,
    borderColor: '#E8EBDD',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.md,
  },
  filaMetaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textoRuta: {
    color: '#6B7F13',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  tituloMetaPrincipal: {
    color: '#0F1526',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  tituloMetaPrincipalCompacto: {
    fontSize: 22,
    lineHeight: 28,
  },
  filaProgresoMeta: {
    flexDirection: 'row',
    gap: espaciadoBase.md,
  },
  filaProgresoMetaCompacta: {
    flexDirection: 'column',
    gap: espaciadoBase.md,
  },
  anilloClaro: {
    width: 148,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  anilloClaroCompacto: {
    width: 124,
  },
  textoReady: {
    marginTop: 8,
    color: '#5B6377',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  metricasMeta: {
    flex: 1,
    gap: espaciadoBase.sm,
    justifyContent: 'center',
  },
  itemMetricaMeta: {
    backgroundColor: '#EFF2F8',
    borderRadius: radiosBase.md,
    padding: espaciadoBase.md,
    gap: 2,
  },
  etiquetaMetricaMeta: {
    color: '#7D859A',
    fontSize: 14,
  },
  valorMetricaMeta: {
    color: '#13192B',
    fontSize: 18,
    fontWeight: '800',
  },
  tarjetaConfiguracion: {
    borderRadius: radiosBase.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E7F0',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.sm,
  },
  tarjetaFrases: {
    borderRadius: radiosBase.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E7F0',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.sm,
  },
  tituloSeccion: {
    color: coloresBase.textoPrincipalClaro,
    fontSize: 18,
    fontWeight: '800',
  },
  etiquetaCampo: {
    color: '#6F778B',
    fontSize: 13,
    fontWeight: '700',
  },
  selectorFecha: {
    minHeight: 50,
    borderRadius: radiosBase.md,
    borderWidth: 1,
    borderColor: '#DDE3EE',
    backgroundColor: '#F4F7FB',
    paddingHorizontal: espaciadoBase.md,
    justifyContent: 'center',
  },
  textoSelectorFecha: {
    color: coloresBase.textoPrincipalClaro,
    fontSize: 15,
    fontWeight: '600',
  },
  textoPlaceholder: {
    color: '#7E879D',
    fontWeight: '500',
  },
  bloqueCalendario: {
    borderRadius: radiosBase.md,
    borderWidth: 1,
    borderColor: '#DDE3EE',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  botonCerrarCalendario: {
    borderTopWidth: 1,
    borderTopColor: '#DDE3EE',
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCerrarCalendario: {
    color: '#121826',
    fontWeight: '700',
    fontSize: 14,
  },
  inputSimple: {
    minHeight: 50,
    borderRadius: radiosBase.md,
    borderWidth: 1,
    borderColor: '#DDE3EE',
    backgroundColor: '#F4F7FB',
    paddingHorizontal: espaciadoBase.md,
    color: coloresBase.textoPrincipalClaro,
    fontSize: 15,
    fontWeight: '600',
  },
  inputNotas: {
    minHeight: 84,
    borderRadius: radiosBase.md,
    borderWidth: 1,
    borderColor: '#DDE3EE',
    backgroundColor: '#F4F7FB',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: espaciadoBase.sm,
    color: coloresBase.textoPrincipalClaro,
    fontSize: 15,
  },
  botonGuardar: {
    minHeight: 44,
    borderRadius: radiosBase.pill,
    backgroundColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  textoBotonGuardar: {
    color: coloresBase.fondoOscuro,
    fontSize: 14,
    fontWeight: '800',
  },
  filaFrasesTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filaContextos: {
    gap: 8,
  },
  chipContexto: {
    borderRadius: radiosBase.pill,
    borderWidth: 1,
    borderColor: '#D9DFEA',
    backgroundColor: '#F4F7FB',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 8,
  },
  chipContextoActivo: {
    backgroundColor: coloresBase.acentoNeon,
    borderColor: '#C1E728',
  },
  textoChipContexto: {
    color: '#57607A',
    fontSize: 13,
    fontWeight: '700',
  },
  textoChipContextoActivo: {
    color: '#121826',
  },
  listaFrases: {
    gap: 8,
  },
  itemFrase: {
    borderRadius: radiosBase.md,
    backgroundColor: '#F4F7FB',
    borderWidth: 1,
    borderColor: '#DEE4EF',
    padding: espaciadoBase.sm,
    gap: 2,
  },
  textoFrase: {
    color: '#20283A',
    fontSize: 14,
    fontWeight: '600',
  },
  contextoFrase: {
    color: '#6F778B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
