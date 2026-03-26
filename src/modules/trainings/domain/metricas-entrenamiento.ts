import type {
  EjercicioGimnasio,
  Entrenamiento,
  EntrenamientoGimnasio,
  EntrenamientoRunning,
} from '@/src/modules/trainings/domain/tipos-entrenamiento';

export interface PuntoPesoEjercicio {
  fecha: string;
  pesoKg: number;
}

export interface ProgresoPesoEjercicio {
  nombreEjercicio: string;
  pesoInicialKg: number;
  pesoActualKg: number;
  diferenciaKg: number;
  porcentajeCambio: number;
  puntos: PuntoPesoEjercicio[];
}

export function esEntrenamientoRunning(
  entrenamiento: Entrenamiento
): entrenamiento is EntrenamientoRunning {
  return entrenamiento.tipo === 'running';
}

export function esEntrenamientoGimnasio(
  entrenamiento: Entrenamiento
): entrenamiento is EntrenamientoGimnasio {
  return entrenamiento.tipo === 'gimnasio';
}

export function calcularRitmoMinPorKm(distanciaKm: number, duracionMin: number): number {
  if (distanciaKm <= 0 || duracionMin <= 0) {
    return 0;
  }

  return duracionMin / distanciaKm;
}

export function formatearRitmo(ritmoMinPorKm: number): string {
  if (!Number.isFinite(ritmoMinPorKm) || ritmoMinPorKm <= 0) {
    return '-';
  }

  const totalSegundos = Math.round(ritmoMinPorKm * 60);
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;

  return `${minutos}:${segundos.toString().padStart(2, '0')} min/km`;
}

export function calcularKmTotales(entrenamientos: Entrenamiento[]): number {
  return entrenamientos
    .filter(esEntrenamientoRunning)
    .reduce((kmAcumulados, entrenamiento) => kmAcumulados + entrenamiento.distanciaKm, 0);
}

export function calcularRitmoPromedioSemana(entrenamientos: Entrenamiento[]): number {
  const running = entrenamientos.filter(esEntrenamientoRunning);
  const distanciaTotal = running.reduce((total, entrenamiento) => total + entrenamiento.distanciaKm, 0);
  const duracionTotal = running.reduce((total, entrenamiento) => total + entrenamiento.duracionMin, 0);

  if (distanciaTotal <= 0 || duracionTotal <= 0) {
    return 0;
  }

  return duracionTotal / distanciaTotal;
}

export function contarDiasActivos(entrenamientos: Entrenamiento[]): number {
  return new Set(entrenamientos.map((entrenamiento) => entrenamiento.fecha)).size;
}

export function calcularVolumenEjercicio(ejercicio: EjercicioGimnasio): number {
  return ejercicio.series * ejercicio.repeticiones * ejercicio.pesoKg;
}

export function calcularVolumenTotalGimnasio(entrenamientos: Entrenamiento[]): number {
  return entrenamientos
    .filter(esEntrenamientoGimnasio)
    .flatMap((entrenamiento) => entrenamiento.ejercicios)
    .reduce((volumenAcumulado, ejercicio) => volumenAcumulado + calcularVolumenEjercicio(ejercicio), 0);
}

export function obtenerFondoMasLargo(entrenamientos: Entrenamiento[]): number {
  return entrenamientos
    .filter(esEntrenamientoRunning)
    .reduce((fondoActual, entrenamiento) => Math.max(fondoActual, entrenamiento.distanciaKm), 0);
}

export function obtenerUltimoEntrenamiento(entrenamientos: Entrenamiento[]): Entrenamiento | null {
  if (entrenamientos.length === 0) {
    return null;
  }

  return [...entrenamientos].sort((actual, siguiente) =>
    siguiente.fecha.localeCompare(actual.fecha)
  )[0];
}

export function obtenerProgresosPesosGimnasio(
  entrenamientos: Entrenamiento[]
): ProgresoPesoEjercicio[] {
  const entrenamientosGimnasioOrdenados = entrenamientos
    .filter(esEntrenamientoGimnasio)
    .sort((actual, siguiente) => actual.fecha.localeCompare(siguiente.fecha));

  const puntosPorEjercicio = new Map<string, PuntoPesoEjercicio[]>();

  entrenamientosGimnasioOrdenados.forEach((entrenamiento) => {
    entrenamiento.ejercicios.forEach((ejercicio) => {
      const puntosActuales = puntosPorEjercicio.get(ejercicio.nombre) ?? [];
      const ultimoPunto = puntosActuales[puntosActuales.length - 1];

      // Evitamos duplicar el mismo dia para un ejercicio y nos quedamos con la mayor carga.
      if (ultimoPunto?.fecha === entrenamiento.fecha) {
        ultimoPunto.pesoKg = Math.max(ultimoPunto.pesoKg, ejercicio.pesoKg);
      } else {
        puntosActuales.push({ fecha: entrenamiento.fecha, pesoKg: ejercicio.pesoKg });
      }

      puntosPorEjercicio.set(ejercicio.nombre, puntosActuales);
    });
  });

  const progresos = Array.from(puntosPorEjercicio.entries())
    .map(([nombreEjercicio, puntos]) => {
      const pesoInicialKg = puntos[0]?.pesoKg ?? 0;
      const pesoActualKg = puntos[puntos.length - 1]?.pesoKg ?? 0;
      const diferenciaKg = pesoActualKg - pesoInicialKg;
      const porcentajeCambio = pesoInicialKg > 0 ? (diferenciaKg / pesoInicialKg) * 100 : 0;

      return {
        nombreEjercicio,
        pesoInicialKg,
        pesoActualKg,
        diferenciaKg,
        porcentajeCambio,
        puntos,
      };
    })
    .filter((progreso) => progreso.puntos.length > 0)
    .sort((actual, siguiente) => Math.abs(siguiente.diferenciaKg) - Math.abs(actual.diferenciaKg));

  return progresos;
}



