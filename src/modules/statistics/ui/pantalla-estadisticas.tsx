import { router } from 'expo-router';
import { ArrowLeft, CalendarDays } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Polyline } from 'react-native-svg';

import { obtenerObjetivo21k } from '@/src/modules/goals/data/objetivos.api';
import {
  listarEntrenamientosDominioPorRango,
} from '@/src/modules/trainings/data/entrenamientos.api';
import type { Entrenamiento } from '@/src/modules/trainings/domain/tipos-entrenamiento';
import {
  calcularConsistenciaSemanal,
  calcularKmTotales,
  calcularRitmoPromedioSemana,
  calcularTendenciaKilometraje,
  calcularVolumenTotalGimnasio,
  formatearRitmo,
  obtenerFondoMasLargo,
  obtenerMaximosPesoPorEjercicio,
  obtenerProgresosPesosGimnasio,
  type MaximoPesoEjercicio,
  type ProgresoPesoEjercicio,
} from '@/src/modules/trainings/domain/metricas-entrenamiento';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { obtenerFechaIsoActual, obtenerFechaIsoHaceDias } from '@/src/shared/utils/fechas';
import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

interface ResumenEstadisticas {
  nombreObjetivo: string;
  distanciaObjetivoKm: number;
  kilometrosSemanales: number;
  ritmoPromedio: number;
  fondoMasLargo: number;
  volumenTotalGimnasio: number;
  progresosPesos: ProgresoPesoEjercicio[];
  maximosPeso: MaximoPesoEjercicio[];
  semanasKm: number[];
  consistenciaSemanal: number;
  tendenciaKilometraje: number;
  objetivoProgreso: number;
}

const resumenInicial: ResumenEstadisticas = {
  nombreObjetivo: 'Media maraton',
  distanciaObjetivoKm: 21.1,
  kilometrosSemanales: 0,
  ritmoPromedio: 0,
  fondoMasLargo: 0,
  volumenTotalGimnasio: 0,
  progresosPesos: [],
  maximosPeso: [],
  semanasKm: [0, 0, 0, 0, 0, 0, 0, 0],
  consistenciaSemanal: 0,
  tendenciaKilometraje: 0,
  objetivoProgreso: 0,
};

function obtenerClaveSemana(fechaIso: string): string {
  const fecha = new Date(`${fechaIso}T00:00:00`);
  const diaSemana = fecha.getDay();
  const delta = diaSemana === 0 ? -6 : 1 - diaSemana;
  fecha.setDate(fecha.getDate() + delta);

  const anio = fecha.getFullYear();
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

function construirSerieSemanalKilometros(entrenamientos: Entrenamiento[], numeroSemanas = 8): number[] {
  const hoy = new Date(`${obtenerFechaIsoActual()}T00:00:00`);
  const diaSemana = hoy.getDay();
  const delta = diaSemana === 0 ? -6 : 1 - diaSemana;
  const inicioSemanaActual = new Date(hoy);
  inicioSemanaActual.setDate(hoy.getDate() + delta);

  const semanasObjetivo: string[] = [];
  for (let i = numeroSemanas - 1; i >= 0; i -= 1) {
    const semana = new Date(inicioSemanaActual);
    semana.setDate(inicioSemanaActual.getDate() - i * 7);
    const anio = semana.getFullYear();
    const mes = `${semana.getMonth() + 1}`.padStart(2, '0');
    const dia = `${semana.getDate()}`.padStart(2, '0');
    semanasObjetivo.push(`${anio}-${mes}-${dia}`);
  }

  const kmPorSemana = new Map<string, number>();

  entrenamientos.forEach((entrenamiento) => {
    if (entrenamiento.tipo !== 'running') {
      return;
    }

    const claveSemana = obtenerClaveSemana(entrenamiento.fecha);
    kmPorSemana.set(claveSemana, (kmPorSemana.get(claveSemana) ?? 0) + entrenamiento.distanciaKm);
  });

  return semanasObjetivo.map((clave) => Number((kmPorSemana.get(clave) ?? 0).toFixed(2)));
}

function construirPolyline(valores: number[], ancho: number, alto: number): string {
  if (valores.length === 0) {
    return '';
  }

  if (valores.length === 1) {
    const y = alto / 2;
    return `0,${y} ${ancho},${y}`;
  }

  const maximo = Math.max(...valores);
  const minimo = Math.min(...valores);
  const rango = Math.max(maximo - minimo, 1);

  return valores
    .map((valor, indice) => {
      const x = (indice / (valores.length - 1)) * ancho;
      const y = alto - ((valor - minimo) / rango) * (alto - 12) - 6;
      return `${x},${y}`;
    })
    .join(' ');
}

function formatearCambioKg(diferenciaKg: number): string {
  if (diferenciaKg > 0) {
    return `+${diferenciaKg.toFixed(1)} kg`;
  }

  if (diferenciaKg < 0) {
    return `${diferenciaKg.toFixed(1)} kg`;
  }

  return '0.0 kg';
}

function formatearPorcentaje(valor: number): string {
  if (!Number.isFinite(valor)) {
    return '0.0%';
  }

  const valorRedondeado = Math.round(valor * 10) / 10;
  if (valorRedondeado > 0) {
    return `+${valorRedondeado}%`;
  }

  return `${valorRedondeado}%`;
}

function resolverNombreObjetivo(distanciaObjetivoKm: number): string {
  if (!Number.isFinite(distanciaObjetivoKm) || distanciaObjetivoKm <= 0) {
    return 'Media maraton';
  }

  if (Math.abs(distanciaObjetivoKm - 21.1) < 0.01) {
    return 'Media maraton';
  }

  return `Objetivo ${distanciaObjetivoKm.toFixed(1)}K`;
}

export function PantallaEstadisticas() {
  const { width: anchoPantalla } = useWindowDimensions();
  const esPantallaCompacta = anchoPantalla < 390;
  const anchoGrafico = Math.min(esPantallaCompacta ? 270 : 300, anchoPantalla - espaciadoBase.lg * 4);

  const [resumen, setResumen] = useState<ResumenEstadisticas>(resumenInicial);

  const cargarEstadisticas = useCallback(async () => {
    try {
      const hoy = obtenerFechaIsoActual();
      const fechaDesde = obtenerFechaIsoHaceDias(84);
      const entrenamientos = await listarEntrenamientosDominioPorRango(fechaDesde, hoy);

      const [objetivo] = await Promise.all([obtenerObjetivo21k()]);

      const kilometrosSemanales = calcularKmTotales(entrenamientos);
      const ritmoPromedio = calcularRitmoPromedioSemana(entrenamientos);
      const fondoMasLargo = obtenerFondoMasLargo(entrenamientos);
      const volumenTotalGimnasio = calcularVolumenTotalGimnasio(entrenamientos);
      const progresosPesos = obtenerProgresosPesosGimnasio(entrenamientos);
      const maximosPeso = obtenerMaximosPesoPorEjercicio(entrenamientos).slice(0, 6);
      const semanasKm = construirSerieSemanalKilometros(entrenamientos, 8);
      const consistenciaSemanal = calcularConsistenciaSemanal(entrenamientos, 8, 3);
      const tendenciaKilometraje = calcularTendenciaKilometraje(entrenamientos, 4);
      const distanciaObjetivoKm = objetivo?.distanciaObjetivoKm ?? 21.1;
      const nombreObjetivo = resolverNombreObjetivo(distanciaObjetivoKm);

      const progresoObjetivo = objetivo
        ? Math.min((fondoMasLargo / distanciaObjetivoKm) * 100, 100)
        : 0;

      setResumen({
        nombreObjetivo,
        distanciaObjetivoKm,
        kilometrosSemanales,
        ritmoPromedio,
        fondoMasLargo,
        volumenTotalGimnasio,
        progresosPesos,
        maximosPeso,
        semanasKm,
        consistenciaSemanal,
        tendenciaKilometraje,
        objetivoProgreso: progresoObjetivo,
      });
    } catch {
      setResumen(resumenInicial);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargarEstadisticas();
    }, [cargarEstadisticas])
  );

  const progresoDestacado = useMemo(() => resumen.progresosPesos[0] ?? null, [resumen.progresosPesos]);
  const puntosKm = construirPolyline(resumen.semanasKm, anchoGrafico, 140);
  const puntosPeso = construirPolyline(
    progresoDestacado?.puntos.map((punto) => punto.pesoKg) ?? [],
    anchoGrafico,
    130
  );
  const sinDatosKm = resumen.semanasKm.every((valor) => valor <= 0);

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.encabezadoSuperior}>
        <Pressable style={estilos.botonCircular} onPress={() => router.back()}>
          <ArrowLeft color={coloresBase.textoPrincipalOscuro} size={28} strokeWidth={2.4} />
        </Pressable>
        <Text style={estilos.tituloPantalla}>Estadisticas</Text>
        <Pressable style={estilos.botonCircular}>
          <CalendarDays color={coloresBase.textoPrincipalOscuro} size={26} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={estilos.tarjetaObjetivo}>
        <View style={[estilos.filaObjetivo, esPantallaCompacta ? estilos.filaObjetivoCompacta : null]}>
          <View>
            <Text style={estilos.etiquetaObjetivo}>OBJETIVO DE PREPARACION</Text>
            <Text style={[estilos.tituloObjetivo, esPantallaCompacta ? estilos.tituloObjetivoCompacto : null]} numberOfLines={2}>
              {resumen.nombreObjetivo}
            </Text>
          </View>
          <View style={estilos.chipObjetivo}>
            <Text style={[estilos.textoChipObjetivo, esPantallaCompacta ? estilos.textoChipObjetivoCompacto : null]}>
              {`${resumen.distanciaObjetivoKm.toFixed(1)} KM`}
            </Text>
          </View>
        </View>
        <View style={estilos.barraObjetivoFondo}>
          <View style={[estilos.barraObjetivoProgreso, { width: `${resumen.objetivoProgreso}%` }]} />
        </View>
        <Text style={estilos.valorObjetivo}>{`${resumen.objetivoProgreso.toFixed(0)}%`}</Text>
      </View>

      <View style={estilos.tarjetaGrafico}>
        <View style={[estilos.filaGraficoTitulo, esPantallaCompacta ? estilos.filaGraficoTituloCompacta : null]}>
          <Text style={[estilos.tituloGrafico, esPantallaCompacta ? estilos.tituloGraficoCompacto : null]}>Km semanales</Text>
          <Text style={[estilos.subtituloGrafico, esPantallaCompacta ? estilos.subtituloGraficoCompacto : null]}>Ultimas 8 semanas</Text>
        </View>
        <View style={estilos.contenedorGrafico}>
          {sinDatosKm ? (
            <Text style={estilos.textoSinDatosGrafico}>Todavia no hay kilometros registrados.</Text>
          ) : (
            <Svg width={anchoGrafico} height={140}>
              <Polyline
                points={puntosKm}
                stroke={coloresBase.acentoNeon}
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          )}
        </View>
      </View>

      <View style={estilos.grillaMetricas}>
        <TarjetaMetrica titulo="Ritmo promedio" valor={formatearRitmo(resumen.ritmoPromedio)} unidad="" />
        <TarjetaMetrica titulo="Fondo mas largo" valor={`${resumen.fondoMasLargo.toFixed(1)} km`} unidad="Mejor marca" acento />
        <TarjetaMetrica titulo="Km acumulados" valor={`${resumen.kilometrosSemanales.toFixed(1)} km`} unidad="Periodo" />
        <TarjetaMetrica titulo="Volumen fuerza" valor={`${Math.round(resumen.volumenTotalGimnasio)} kg`} unidad="Carga total" acento />
        <TarjetaMetrica
          titulo="Consistencia"
          valor={`${resumen.consistenciaSemanal.toFixed(0)}%`}
          unidad="Semanas con 3+ sesiones"
        />
        <TarjetaMetrica
          titulo="Tendencia KM"
          valor={formatearPorcentaje(resumen.tendenciaKilometraje)}
          unidad="Ultimas 4 vs previas"
          acento
        />
      </View>

      <View style={estilos.bloqueMaximos}>
        <Text style={estilos.tituloSeccion}>Peso maximo por ejercicio</Text>
        {resumen.maximosPeso.length === 0 ? (
          <View style={estilos.tarjetaSinFuerza}>
            <Text style={estilos.textoSinFuerza}>Todavia no hay datos suficientes para calcular maximos.</Text>
          </View>
        ) : (
          <View style={estilos.listaProgresosPesos}>
            {resumen.maximosPeso.map((maximo) => (
              <View key={maximo.nombreEjercicio} style={estilos.tarjetaProgresoPeso}>
                <Text style={estilos.nombreEjercicio}>{maximo.nombreEjercicio}</Text>
                <Text style={estilos.detalleProgresoPeso}>Fecha: {maximo.fecha}</Text>
                <Text style={estilos.valorCambioPeso}>{maximo.pesoMaximoKg.toFixed(1)} kg</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={estilos.bloqueFuerza}>
        <Text style={estilos.tituloSeccion}>Progreso de pesos en gimnasio</Text>

        {progresoDestacado ? (
          <View style={estilos.tarjetaFuerzaDestacada}>
            <View style={estilos.filaFuerzaDestacada}>
              <View>
                <Text style={estilos.etiquetaFuerzaDestacada}>EJERCICIO DESTACADO</Text>
                <Text style={estilos.tituloFuerzaDestacada}>{progresoDestacado.nombreEjercicio}</Text>
              </View>
              <View style={estilos.chipFuerza}>
                <Text style={estilos.textoChipFuerza}>{formatearCambioKg(progresoDestacado.diferenciaKg)}</Text>
              </View>
            </View>

            <View style={estilos.contenedorGraficoPeso}>
              <Svg width={anchoGrafico} height={130}>
                <Polyline
                  points={puntosPeso}
                  stroke={coloresBase.acentoNeon}
                  strokeWidth={4.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            <View style={estilos.filaResumenPeso}>
              <Text style={estilos.textoResumenPeso}>Inicio: {progresoDestacado.pesoInicialKg} kg</Text>
              <Text style={estilos.textoResumenPeso}>Actual: {progresoDestacado.pesoActualKg} kg</Text>
            </View>
          </View>
        ) : (
          <View style={estilos.tarjetaSinFuerza}>
            <Text style={estilos.textoSinFuerza}>Todavia no hay registros de gimnasio para mostrar progreso.</Text>
          </View>
        )}

        <View style={estilos.listaProgresosPesos}>
          {resumen.progresosPesos.slice(0, 4).map((progreso) => (
            <TarjetaProgresoPeso key={progreso.nombreEjercicio} progreso={progreso} />
          ))}
        </View>
      </View>
    </ContenedorPantalla>
  );
}

interface PropiedadesTarjetaMetrica {
  titulo: string;
  valor: string;
  unidad: string;
  acento?: boolean;
}

function TarjetaMetrica({ titulo, valor, unidad, acento = false }: PropiedadesTarjetaMetrica) {
  return (
    <View style={estilos.tarjetaMetrica}>
      <Text style={estilos.tituloMetrica}>{titulo}</Text>
      <Text style={[estilos.valorMetrica, acento ? estilos.valorMetricaAcento : null]}>{valor}</Text>
      {unidad ? <Text style={estilos.unidadMetrica}>{unidad}</Text> : null}
    </View>
  );
}

function TarjetaProgresoPeso({ progreso }: { progreso: ProgresoPesoEjercicio }) {
  return (
    <View style={estilos.tarjetaProgresoPeso}>
      <Text style={estilos.nombreEjercicio}>{progreso.nombreEjercicio}</Text>
      <Text style={estilos.detalleProgresoPeso}>
        {progreso.pesoInicialKg} kg a {progreso.pesoActualKg} kg
      </Text>
      <Text style={estilos.valorCambioPeso}>
        {formatearCambioKg(progreso.diferenciaKg)} ({formatearPorcentaje(progreso.porcentajeCambio)})
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: {
    paddingBottom: 172,
  },
  encabezadoSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botonCircular: {
    width: 56,
    height: 56,
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
  tarjetaObjetivo: {
    backgroundColor: coloresBase.acentoNeon,
    borderRadius: 32,
    padding: espaciadoBase.lg,
    gap: espaciadoBase.sm,
    ...sombrasNeon.glowSuave,
  },
  filaObjetivo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  filaObjetivoCompacta: {
    flexDirection: 'column',
    gap: espaciadoBase.sm,
  },
  etiquetaObjetivo: {
    color: '#344000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tituloObjetivo: {
    color: '#090D16',
    fontSize: 32,
    fontWeight: '900',
  },
  tituloObjetivoCompacto: {
    fontSize: 26,
    lineHeight: 30,
  },
  chipObjetivo: {
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 8,
    borderRadius: radiosBase.pill,
    backgroundColor: '#C5ED37',
  },
  textoChipObjetivo: {
    color: '#111624',
    fontWeight: '800',
    fontSize: 17,
  },
  textoChipObjetivoCompacto: {
    fontSize: 14,
  },
  barraObjetivoFondo: {
    height: 14,
    borderRadius: radiosBase.pill,
    backgroundColor: '#C2EA32',
    overflow: 'hidden',
    marginTop: espaciadoBase.sm,
  },
  barraObjetivoProgreso: {
    height: '100%',
    backgroundColor: '#0E121D',
  },
  valorObjetivo: {
    alignSelf: 'flex-end',
    color: '#0E121D',
    fontSize: 22,
    fontWeight: '800',
  },
  tarjetaGrafico: {
    backgroundColor: '#171922',
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#252A38',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.md,
  },
  filaGraficoTitulo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espaciadoBase.sm,
  },
  filaGraficoTituloCompacta: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  tituloGrafico: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 28,
    fontWeight: '800',
  },
  tituloGraficoCompacto: {
    fontSize: 34 / 2,
    lineHeight: 24,
  },
  subtituloGrafico: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 16,
    textAlign: 'right',
  },
  subtituloGraficoCompacto: {
    textAlign: 'left',
    fontSize: 13,
  },
  contenedorGrafico: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: espaciadoBase.md,
    minHeight: 140,
  },
  textoSinDatosGrafico: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 15,
    textAlign: 'center',
  },
  grillaMetricas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espaciadoBase.md,
  },
  tarjetaMetrica: {
    width: '47%',
    backgroundColor: '#171922',
    borderRadius: radiosBase.lg,
    borderWidth: 1,
    borderColor: '#252A38',
    padding: espaciadoBase.lg,
    gap: 6,
  },
  tituloMetrica: {
    color: '#95A0B6',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  valorMetrica: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 26,
    fontWeight: '900',
  },
  valorMetricaAcento: {
    color: coloresBase.acentoNeon,
  },
  unidadMetrica: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 14,
  },
  bloqueMaximos: {
    gap: espaciadoBase.md,
  },
  bloqueFuerza: {
    gap: espaciadoBase.md,
  },
  tituloSeccion: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 24,
    fontWeight: '800',
  },
  tarjetaFuerzaDestacada: {
    borderRadius: radiosBase.lg,
    backgroundColor: '#171922',
    borderWidth: 1,
    borderColor: '#2A2F3E',
    padding: espaciadoBase.lg,
    gap: espaciadoBase.md,
  },
  filaFuerzaDestacada: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etiquetaFuerzaDestacada: {
    color: '#95A0B6',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tituloFuerzaDestacada: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 24,
    fontWeight: '800',
  },
  chipFuerza: {
    borderRadius: radiosBase.pill,
    backgroundColor: 'rgba(216,255,62,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(216,255,62,0.5)',
    paddingHorizontal: espaciadoBase.md,
    paddingVertical: 6,
  },
  textoChipFuerza: {
    color: coloresBase.acentoNeon,
    fontSize: 15,
    fontWeight: '800',
  },
  contenedorGraficoPeso: {
    alignItems: 'center',
  },
  filaResumenPeso: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textoResumenPeso: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 15,
    fontWeight: '600',
  },
  tarjetaSinFuerza: {
    borderRadius: radiosBase.lg,
    backgroundColor: '#171922',
    borderWidth: 1,
    borderColor: '#2A2F3E',
    padding: espaciadoBase.lg,
  },
  textoSinFuerza: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 17,
    lineHeight: 26,
  },
  listaProgresosPesos: {
    gap: espaciadoBase.sm,
  },
  tarjetaProgresoPeso: {
    borderRadius: radiosBase.md,
    backgroundColor: '#181C25',
    borderWidth: 1,
    borderColor: '#2A2F3E',
    padding: espaciadoBase.md,
    gap: 3,
  },
  nombreEjercicio: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 20,
    fontWeight: '800',
  },
  detalleProgresoPeso: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 15,
  },
  valorCambioPeso: {
    color: coloresBase.acentoNeon,
    fontSize: 16,
    fontWeight: '700',
  },
});

