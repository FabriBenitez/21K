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

export interface MaximoPesoEjercicio {
  nombreEjercicio: string;
  pesoMaximoKg: number;
  fecha: string;
}

function obtenerClaveInicioSemana(fechaIso: string): string {
  const fecha = new Date(`${fechaIso}T00:00:00`);
  const diaSemana = fecha.getDay();
  const deltaHaciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  fecha.setDate(fecha.getDate() + deltaHaciaLunes);

  const anio = fecha.getFullYear();
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function obtenerClavesSemanasObjetivo(totalSemanas: number): string[] {
  const hoy = new Date();
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const diaSemana = base.getDay();
  const deltaHaciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const inicioSemanaActual = new Date(base);
  inicioSemanaActual.setDate(base.getDate() + deltaHaciaLunes);

  const claves: string[] = [];
  for (let i = totalSemanas - 1; i >= 0; i -= 1) {
    const fechaSemana = new Date(inicioSemanaActual);
    fechaSemana.setDate(inicioSemanaActual.getDate() - i * 7);
    const anio = fechaSemana.getFullYear();
    const mes = `${fechaSemana.getMonth() + 1}`.padStart(2, '0');
    const dia = `${fechaSemana.getDate()}`.padStart(2, '0');
    claves.push(`${anio}-${mes}-${dia}`);
  }

  return claves;
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

export function obtenerMaximosPesoPorEjercicio(
  entrenamientos: Entrenamiento[]
): MaximoPesoEjercicio[] {
  const maximosPorEjercicio = new Map<string, MaximoPesoEjercicio>();

  entrenamientos
    .filter(esEntrenamientoGimnasio)
    .forEach((entrenamiento) => {
      entrenamiento.ejercicios.forEach((ejercicio) => {
        const nombreLimpio = ejercicio.nombre.trim();
        if (!nombreLimpio) {
          return;
        }

        const clave = nombreLimpio.toLowerCase();
        const maximoActual = maximosPorEjercicio.get(clave);

        if (
          !maximoActual ||
          ejercicio.pesoKg > maximoActual.pesoMaximoKg ||
          (ejercicio.pesoKg === maximoActual.pesoMaximoKg &&
            entrenamiento.fecha.localeCompare(maximoActual.fecha) > 0)
        ) {
          maximosPorEjercicio.set(clave, {
            nombreEjercicio: nombreLimpio,
            pesoMaximoKg: ejercicio.pesoKg,
            fecha: entrenamiento.fecha,
          });
        }
      });
    });

  return Array.from(maximosPorEjercicio.values()).sort((a, b) => {
    if (a.pesoMaximoKg !== b.pesoMaximoKg) {
      return b.pesoMaximoKg - a.pesoMaximoKg;
    }

    return a.nombreEjercicio.localeCompare(b.nombreEjercicio);
  });
}

export function calcularConsistenciaSemanal(
  entrenamientos: Entrenamiento[],
  numeroSemanas = 8,
  minimoSesionesObjetivo = 3
): number {
  if (numeroSemanas <= 0 || minimoSesionesObjetivo <= 0) {
    return 0;
  }

  const sesionesPorSemana = new Map<string, number>();

  entrenamientos.forEach((entrenamiento) => {
    const claveSemana = obtenerClaveInicioSemana(entrenamiento.fecha);
    sesionesPorSemana.set(claveSemana, (sesionesPorSemana.get(claveSemana) ?? 0) + 1);
  });

  const semanasObjetivo = obtenerClavesSemanasObjetivo(numeroSemanas);
  const semanasCumplidas = semanasObjetivo.filter(
    (semana) => (sesionesPorSemana.get(semana) ?? 0) >= minimoSesionesObjetivo
  ).length;

  return (semanasCumplidas / numeroSemanas) * 100;
}

export function calcularTendenciaKilometraje(
  entrenamientos: Entrenamiento[],
  semanasVentana = 4
): number {
  if (semanasVentana <= 0) {
    return 0;
  }

  const clavesObjetivo = obtenerClavesSemanasObjetivo(semanasVentana * 2);
  const clavesPrevias = clavesObjetivo.slice(0, semanasVentana);
  const clavesRecientes = clavesObjetivo.slice(semanasVentana);

  const kmPorSemana = new Map<string, number>();

  entrenamientos
    .filter(esEntrenamientoRunning)
    .forEach((entrenamiento) => {
      const claveSemana = obtenerClaveInicioSemana(entrenamiento.fecha);
      kmPorSemana.set(claveSemana, (kmPorSemana.get(claveSemana) ?? 0) + entrenamiento.distanciaKm);
    });

  const kmPrevios = clavesPrevias.reduce((total, clave) => total + (kmPorSemana.get(clave) ?? 0), 0);
  const kmRecientes = clavesRecientes.reduce((total, clave) => total + (kmPorSemana.get(clave) ?? 0), 0);

  if (kmPrevios <= 0) {
    return kmRecientes > 0 ? 100 : 0;
  }

  return ((kmRecientes - kmPrevios) / kmPrevios) * 100;
}


