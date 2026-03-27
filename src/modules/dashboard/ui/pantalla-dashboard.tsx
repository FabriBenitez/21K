import { router } from 'expo-router';
import { CalendarClock, Dumbbell, Gauge, PersonStanding, Sparkles, Target } from 'lucide-react-native';
import { type ReactNode, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { obtenerObjetivo21k } from '@/src/modules/goals/data/objetivos.api';
import { obtenerFraseMotivacionalContextual, type ContextoFrase } from '@/src/modules/motivation/data/frases.api';
import {
  listarEntrenamientosDominioPorRango,
  listarHistorialEntrenamientos,
  listarRegistrosGymPorRango,
  listarRegistrosRunningPorRango,
  type RegistroEntrenamiento,
  type RegistroGym,
} from '@/src/modules/trainings/data/entrenamientos.api';
import {
  calcularRitmoPromedioSemana,
  calcularVolumenTotalGimnasio,
  formatearRitmo,
  obtenerFondoMasLargo,
} from '@/src/modules/trainings/domain/metricas-entrenamiento';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import {
  calcularDiasHasta,
  obtenerFechaIsoActual,
  obtenerFechaIsoHaceDias,
  obtenerRangoSemanaIso,
  sumarDiasAFechaIso,
} from '@/src/shared/utils/fechas';
import { coloresBase, espaciadoBase, radiosBase } from '@/src/shared/theme/tokens-ui';

interface ResumenDashboard {
  kmSemana: number;
  entrenamientosSemana: number;
  diasActivos: number;
  diasDescanso: number;
  ritmoPromedioSemana: string;
  ultimoEntrenamiento: RegistroEntrenamiento | null;
  fraseMotivacional: string;
  objetivoFecha?: string;
  diasRestantes?: number;
  kmAcumulados: number;
  fondoMaximo: number;
  volumenFuerza: number;
  proximaRutinaGym: RegistroGym | null;
}

const resumenInicial: ResumenDashboard = {
  kmSemana: 0,
  entrenamientosSemana: 0,
  diasActivos: 0,
  diasDescanso: 7,
  ritmoPromedioSemana: '-',
  ultimoEntrenamiento: null,
  fraseMotivacional: 'Cada entrenamiento suma para tu 21K.',
  kmAcumulados: 0,
  fondoMaximo: 0,
  volumenFuerza: 0,
  proximaRutinaGym: null,
};

function resolverContextoFrase(parametros: {
  ultimoEntrenamiento: RegistroEntrenamiento | null;
  diasActivosSemana: number;
  entrenoHoy: boolean;
  fondoMaximo: number;
}): ContextoFrase {
  if (parametros.fondoMaximo >= 18 || parametros.diasActivosSemana >= 5) {
    return 'logro';
  }

  if (!parametros.entrenoHoy) {
    return 'descanso';
  }

  if (!parametros.ultimoEntrenamiento) {
    return 'general';
  }

  return parametros.ultimoEntrenamiento.tipo === 'running' ? 'running' : 'gym';
}

function describirUltimoEntrenamiento(registro: RegistroEntrenamiento | null): string {
  if (!registro) {
    return 'Todavia no registraste entrenamientos.';
  }

  const tipo = registro.tipo === 'running' ? 'Running' : 'Gym';
  return `${tipo} - ${registro.fechaSesion} - ${registro.descripcion}`;
}

export function PantallaDashboard() {
  const { width } = useWindowDimensions();
  const esPantallaCompacta = width < 390;
  const [cargando, setCargando] = useState(true);
  const [resumen, setResumen] = useState<ResumenDashboard>(resumenInicial);

  const cargarDashboard = useCallback(async () => {
    try {
      setCargando(true);

      const hoy = obtenerFechaIsoActual();
      const rangoSemana = obtenerRangoSemanaIso();
      const fechaHace84Dias = obtenerFechaIsoHaceDias(84);
      const fechaLimiteRutinas = sumarDiasAFechaIso(hoy, 120) ?? hoy;

      const [runningSemana, gymSemana, historial, objetivo, entrenamientosUltimas12Semanas, rutinasGymProgramadas] =
        await Promise.all([
          listarRegistrosRunningPorRango(rangoSemana.inicio, rangoSemana.fin),
          listarRegistrosGymPorRango(rangoSemana.inicio, rangoSemana.fin),
          listarHistorialEntrenamientos(40),
          obtenerObjetivo21k(),
          listarEntrenamientosDominioPorRango(fechaHace84Dias, hoy),
          listarRegistrosGymPorRango(hoy, fechaLimiteRutinas),
        ]);

      const kmSemana = runningSemana.reduce((acumulado, item) => acumulado + item.distanciaKm, 0);
      const entrenamientosSemana = runningSemana.length + gymSemana.length;
      const diasActivos = new Set([
        ...runningSemana.map((item) => item.fechaSesion),
        ...gymSemana.map((item) => item.fechaSesion),
      ]).size;

      const kmAcumulados = entrenamientosUltimas12Semanas
        .filter((item) => item.tipo === 'running')
        .reduce((acumulado, item) => acumulado + item.distanciaKm, 0);

      const ritmoPromedioSemana = formatearRitmo(calcularRitmoPromedioSemana(entrenamientosUltimas12Semanas));
      const fondoMaximo = obtenerFondoMasLargo(entrenamientosUltimas12Semanas);
      const volumenFuerza = calcularVolumenTotalGimnasio(entrenamientosUltimas12Semanas);
      const ultimoEntrenamiento = historial[0] ?? null;
      const entrenoHoy = runningSemana.some((item) => item.fechaSesion === hoy) || gymSemana.some((item) => item.fechaSesion === hoy);
      const contextoFrase = resolverContextoFrase({
        ultimoEntrenamiento,
        diasActivosSemana: diasActivos,
        entrenoHoy,
        fondoMaximo,
      });
      const fraseMotivacional =
        (await obtenerFraseMotivacionalContextual(contextoFrase))?.frase ?? resumenInicial.fraseMotivacional;
      const proximaRutinaGym =
        [...rutinasGymProgramadas].sort((a, b) => a.fechaSesion.localeCompare(b.fechaSesion))[0] ?? null;

      setResumen({
        kmSemana,
        entrenamientosSemana,
        diasActivos,
        diasDescanso: Math.max(7 - diasActivos, 0),
        ritmoPromedioSemana,
        ultimoEntrenamiento,
        fraseMotivacional,
        objetivoFecha: objetivo?.fechaObjetivo,
        diasRestantes: objetivo ? calcularDiasHasta(objetivo.fechaObjetivo, hoy) ?? undefined : undefined,
        kmAcumulados,
        fondoMaximo,
        volumenFuerza,
        proximaRutinaGym,
      });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo cargar la pantalla de estadisticas.';
      setResumen((actual) => ({ ...actual, fraseMotivacional: mensaje }));
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarDashboard();
    }, [cargarDashboard])
  );

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <View style={[estilos.encabezado, esPantallaCompacta ? estilos.encabezadoCompacto : null]}>
        <View style={estilos.bloqueTitulos}>
          <Text style={[estilos.saludo, esPantallaCompacta ? estilos.saludoCompacto : null]}>Estadisticas semanales</Text>
          <Text style={[estilos.subtitulo, esPantallaCompacta ? estilos.subtituloCompacto : null]}>
            Seguimiento real de tu proceso 21K
          </Text>
        </View>
        <Pressable style={[estilos.botonNuevo, esPantallaCompacta ? estilos.botonNuevoCompacto : null]} onPress={() => router.push('/(tabs)/agregar')}>
          <Text style={estilos.textoBotonNuevo}>{esPantallaCompacta ? '+ Crear' : '+ Nuevo'}</Text>
        </Pressable>
      </View>

      <View style={estilos.tarjetaMeta}>
        <View style={estilos.filaMeta}>
          <Target color={coloresBase.fondoOscuro} size={22} />
          <Text style={estilos.tituloMeta}>Objetivo 21K</Text>
        </View>
        <Text style={[estilos.valorMeta, esPantallaCompacta ? estilos.valorMetaCompacto : null]}>
          {resumen.objetivoFecha ?? 'Sin fecha objetivo'}
        </Text>
        <Text style={estilos.detalleMeta}>
          {resumen.objetivoFecha
            ? `${resumen.diasRestantes ?? 0} dias restantes para tu carrera.`
            : 'Configuralo en Perfil para activar el contador.'}
        </Text>
      </View>

      <View style={estilos.grillaMetricas}>
        <TarjetaMetrica icono={<PersonStanding color="#111" size={20} />} titulo="KM semana" valor={`${resumen.kmSemana.toFixed(1)} km`} />
        <TarjetaMetrica icono={<CalendarClock color="#111" size={20} />} titulo="Sesiones" valor={`${resumen.entrenamientosSemana}`} />
        <TarjetaMetrica icono={<Gauge color="#111" size={20} />} titulo="Ritmo promedio" valor={resumen.ritmoPromedioSemana} />
        <TarjetaMetrica icono={<Dumbbell color="#111" size={20} />} titulo="Volumen gym" valor={`${Math.round(resumen.volumenFuerza)} kg`} />
      </View>

      <View style={estilos.tarjetaSemana}>
        <Text style={[estilos.tituloTarjeta, esPantallaCompacta ? estilos.tituloTarjetaCompacto : null]}>
          Resumen semanal
        </Text>
        <Text style={estilos.textoTarjeta}>Dias activos: {resumen.diasActivos}</Text>
        <Text style={estilos.textoTarjeta}>Dias descanso: {resumen.diasDescanso}</Text>
        <Text style={estilos.textoTarjeta}>KM acumulados (12 semanas): {resumen.kmAcumulados.toFixed(1)}</Text>
        <Text style={estilos.textoTarjeta}>Fondo maximo: {resumen.fondoMaximo.toFixed(1)} km</Text>
      </View>

      <View style={estilos.tarjetaSemana}>
        <Text style={[estilos.tituloTarjeta, esPantallaCompacta ? estilos.tituloTarjetaCompacto : null]}>
          Proxima rutina de gym
        </Text>
        {resumen.proximaRutinaGym ? (
          <>
            <Text style={estilos.textoTarjeta}>Dia: {resumen.proximaRutinaGym.fechaSesion}</Text>
            <Text style={estilos.textoTarjeta}>
              Ejercicios: {resumen.proximaRutinaGym.ejercicios.length}
            </Text>
            <Pressable
              style={estilos.botonEditar}
              onPress={() => {
                const rutina = resumen.proximaRutinaGym;
                if (!rutina) {
                  return;
                }

                router.push({ pathname: '/sesion-gym', params: { gymId: rutina.id } });
              }}>
              <Text style={estilos.textoBotonEditar}>Editar rutina</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={estilos.textoTarjeta}>No tienes rutina de gym programada.</Text>
            <Pressable style={estilos.botonEditar} onPress={() => router.push('/sesion-gym')}>
              <Text style={estilos.textoBotonEditar}>Crear rutina</Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={estilos.tarjetaUltimo}>
        <Text style={[estilos.tituloTarjeta, esPantallaCompacta ? estilos.tituloTarjetaCompacto : null]}>
          Ultimo entrenamiento
        </Text>
        <Text style={estilos.textoTarjeta}>{describirUltimoEntrenamiento(resumen.ultimoEntrenamiento)}</Text>
        {resumen.ultimoEntrenamiento ? (
          <Pressable style={estilos.botonEditar} onPress={() => {
            const ultimoEntrenamiento = resumen.ultimoEntrenamiento;
            if (!ultimoEntrenamiento) {
              return;
            }

            if (ultimoEntrenamiento.tipo === 'running') {
              router.push({ pathname: '/registro-running', params: { runningId: ultimoEntrenamiento.id } });
              return;
            }

            router.push({ pathname: '/sesion-gym', params: { gymId: ultimoEntrenamiento.id } });
          }}>
            <Text style={estilos.textoBotonEditar}>Editar ultimo</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={estilos.tarjetaFrase}>
        <View style={estilos.filaFrase}>
          <Sparkles color={coloresBase.acentoNeon} size={18} />
          <Text style={estilos.tituloFrase}>{cargando ? 'Cargando...' : 'Motivacion del dia'}</Text>
        </View>
        <Text style={estilos.textoFrase}>{resumen.fraseMotivacional}</Text>
      </View>
    </ContenedorPantalla>
  );
}

function TarjetaMetrica({ icono, titulo, valor }: { icono: ReactNode; titulo: string; valor: string }) {
  return (
    <View style={estilos.tarjetaMetrica}>
      <View style={estilos.iconoMetrica}>{icono}</View>
      <Text style={estilos.tituloMetrica}>{titulo}</Text>
      <Text style={estilos.valorMetrica}>{valor}</Text>
    </View>
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
    gap: espaciadoBase.md,
  },
  encabezadoCompacto: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  bloqueTitulos: {
    flexShrink: 1,
    gap: 2,
  },
  saludo: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 28,
    fontWeight: '800',
  },
  saludoCompacto: {
    fontSize: 34 / 2,
    lineHeight: 24,
  },
  subtitulo: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 15,
    marginTop: 4,
  },
  subtituloCompacto: {
    fontSize: 13,
    marginTop: 2,
  },
  botonNuevo: {
    borderRadius: radiosBase.pill,
    backgroundColor: coloresBase.acentoNeon,
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 10,
  },
  botonNuevoCompacto: {
    alignSelf: 'flex-start',
  },
  textoBotonNuevo: {
    color: coloresBase.fondoOscuro,
    fontWeight: '800',
    fontSize: 14,
  },
  tarjetaMeta: {
    borderRadius: 26,
    backgroundColor: coloresBase.acentoNeon,
    padding: espaciadoBase.lg,
    gap: 6,
  },
  filaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tituloMeta: {
    color: coloresBase.fondoOscuro,
    fontSize: 16,
    fontWeight: '800',
  },
  valorMeta: {
    color: '#10141D',
    fontSize: 30,
    fontWeight: '900',
  },
  valorMetaCompacto: {
    fontSize: 26,
  },
  detalleMeta: {
    color: '#263000',
    fontSize: 15,
    fontWeight: '700',
  },
  grillaMetricas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciadoBase.sm,
  },
  tarjetaMetrica: {
    width: '48%',
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#252A38',
    backgroundColor: '#171922',
    padding: espaciadoBase.md,
    gap: 6,
  },
  iconoMetrica: {
    width: 32,
    height: 32,
    borderRadius: radiosBase.sm,
    backgroundColor: coloresBase.acentoNeon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloMetrica: {
    color: '#9CA6BE',
    fontSize: 13,
    fontWeight: '700',
  },
  valorMetrica: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 18,
    fontWeight: '800',
  },
  tarjetaSemana: {
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#252A38',
    backgroundColor: '#171922',
    padding: espaciadoBase.lg,
    gap: 8,
  },
  tituloTarjeta: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 21,
    fontWeight: '800',
  },
  tituloTarjetaCompacto: {
    fontSize: 19,
  },
  textoTarjeta: {
    color: '#B2BAD0',
    fontSize: 15,
    lineHeight: 22,
  },
  tarjetaUltimo: {
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#252A38',
    backgroundColor: '#171922',
    padding: espaciadoBase.lg,
    gap: 10,
  },
  botonEditar: {
    alignSelf: 'flex-start',
    borderRadius: radiosBase.pill,
    borderWidth: 1,
    borderColor: '#2D3448',
    backgroundColor: '#232A36',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 8,
  },
  textoBotonEditar: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 13,
    fontWeight: '700',
  },
  tarjetaFrase: {
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: 'rgba(216,255,62,0.4)',
    backgroundColor: 'rgba(216,255,62,0.08)',
    padding: espaciadoBase.lg,
    gap: 10,
  },
  filaFrase: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tituloFrase: {
    color: coloresBase.acentoNeon,
    fontSize: 15,
    fontWeight: '800',
  },
  textoFrase: {
    color: '#C8D09A',
    fontSize: 16,
    lineHeight: 24,
  },
});


