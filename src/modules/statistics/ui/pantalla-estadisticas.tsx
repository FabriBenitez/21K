import { router } from 'expo-router';
import { ArrowLeft, CalendarDays } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { entrenamientosSemanaMock } from '@/src/modules/trainings/data/entrenamientos-semana.mock';
import {
  calcularKmTotales,
  calcularRitmoPromedioSemana,
  calcularVolumenTotalGimnasio,
  formatearRitmo,
  obtenerFondoMasLargo,
  obtenerProgresosPesosGimnasio,
  type ProgresoPesoEjercicio,
} from '@/src/modules/trainings/domain/metricas-entrenamiento';
import { ContenedorPantalla } from '@/src/shared/ui/contenedor-pantalla';
import { coloresBase, espaciadoBase, radiosBase, sombrasNeon } from '@/src/shared/theme/tokens-ui';

const kilometrosUltimosSieteDias = [18, 26, 20, 38, 29, 48, 55, 41];

export function PantallaEstadisticas() {
  const { width: anchoPantalla } = useWindowDimensions();
  const anchoGrafico = Math.min(300, anchoPantalla - espaciadoBase.lg * 4);

  const kilometrosSemanales = calcularKmTotales(entrenamientosSemanaMock);
  const ritmoPromedio = calcularRitmoPromedioSemana(entrenamientosSemanaMock);
  const fondoMasLargo = obtenerFondoMasLargo(entrenamientosSemanaMock);
  const volumenTotalGimnasio = calcularVolumenTotalGimnasio(entrenamientosSemanaMock);

  const progresosPesos = useMemo(
    () => obtenerProgresosPesosGimnasio(entrenamientosSemanaMock),
    []
  );
  const progresoDestacado = progresosPesos[0] ?? null;

  const puntosKm = construirPolyline(kilometrosUltimosSieteDias, anchoGrafico, 140);
  const puntosPeso = construirPolyline(
    progresoDestacado?.puntos.map((punto) => punto.pesoKg) ?? [],
    anchoGrafico,
    130
  );

  return (
    <ContenedorPantalla modo="oscuro" desplazable estiloContenido={estilos.contenido}>
      <View style={estilos.encabezadoSuperior}>
        <Pressable style={estilos.botonCircular} onPress={() => router.back()}>
          <ArrowLeft color={coloresBase.textoPrincipalOscuro} size={28} strokeWidth={2.4} />
        </Pressable>
        <Text style={estilos.tituloPantalla}>Progreso</Text>
        <Pressable style={estilos.botonCircular}>
          <CalendarDays color={coloresBase.textoPrincipalOscuro} size={26} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={estilos.tarjetaObjetivo}>
        <View style={estilos.filaObjetivo}>
          <View>
            <Text style={estilos.etiquetaObjetivo}>OBJETIVO DE PREPARACION</Text>
            <Text style={estilos.tituloObjetivo}>Media maraton</Text>
          </View>
          <View style={estilos.chipObjetivo}>
            <Text style={estilos.textoChipObjetivo}>21.1 KM</Text>
          </View>
        </View>
        <View style={estilos.barraObjetivoFondo}>
          <View style={estilos.barraObjetivoProgreso} />
        </View>
        <Text style={estilos.valorObjetivo}>72%</Text>
      </View>

      <View style={estilos.tarjetaGrafico}>
        <View style={estilos.filaGraficoTitulo}>
          <Text style={estilos.tituloGrafico}>Kilometros semanales</Text>
          <Text style={estilos.subtituloGrafico}>Ultimos 7 dias</Text>
        </View>
        <View style={estilos.contenedorGrafico}>
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
        </View>
        <View style={estilos.filaDiasGrafico}>
          {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map((dia) => (
            <Text key={dia} style={estilos.diaGrafico}>
              {dia}
            </Text>
          ))}
        </View>
      </View>

      <View style={estilos.grillaMetricas}>
        <TarjetaMetrica titulo="Ritmo promedio" valor={formatearRitmo(ritmoPromedio)} unidad="" />
        <TarjetaMetrica titulo="Fondo mas largo" valor={`${fondoMasLargo.toFixed(1)} km`} unidad="Mejor marca" acento />
        <TarjetaMetrica titulo="Km semanales" valor={`${kilometrosSemanales.toFixed(1)} km`} unidad="Volumen actual" />
        <TarjetaMetrica titulo="Volumen fuerza" valor={`${Math.round(volumenTotalGimnasio)} kg`} unidad="Carga total" acento />
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
              <Text style={estilos.textoResumenPeso}>
                Inicio: {progresoDestacado.pesoInicialKg} kg
              </Text>
              <Text style={estilos.textoResumenPeso}>
                Actual: {progresoDestacado.pesoActualKg} kg
              </Text>
            </View>
          </View>
        ) : (
          <View style={estilos.tarjetaSinFuerza}>
            <Text style={estilos.textoSinFuerza}>Todavia no hay registros de gimnasio para mostrar progreso.</Text>
          </View>
        )}

        <View style={estilos.listaProgresosPesos}>
          {progresosPesos.slice(0, 4).map((progreso) => (
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
    fontSize: 26,
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
  barraObjetivoFondo: {
    height: 14,
    borderRadius: radiosBase.pill,
    backgroundColor: '#C2EA32',
    overflow: 'hidden',
    marginTop: espaciadoBase.sm,
  },
  barraObjetivoProgreso: {
    width: '72%',
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
  },
  tituloGrafico: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 28,
    fontWeight: '800',
  },
  subtituloGrafico: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 16,
  },
  contenedorGrafico: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: espaciadoBase.md,
  },
  filaDiasGrafico: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diaGrafico: {
    color: '#8E95AB',
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  valorMetrica: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 28,
    fontWeight: '900',
  },
  valorMetricaAcento: {
    color: coloresBase.acentoNeon,
  },
  unidadMetrica: {
    color: coloresBase.textoSecundarioOscuro,
    fontSize: 16,
  },
  bloqueFuerza: {
    gap: espaciadoBase.md,
  },
  tituloSeccion: {
    color: coloresBase.textoPrincipalOscuro,
    fontSize: 26,
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
