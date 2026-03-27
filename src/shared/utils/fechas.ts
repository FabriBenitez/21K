export function obtenerFechaIsoActual(): string {
  const fechaActual = new Date();
  const anio = fechaActual.getFullYear();
  const mes = `${fechaActual.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fechaActual.getDate()}`.padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

export function convertirFechaEnIso(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

export function convertirFechaIsoEnUtc(fechaIso: string): Date | null {
  const partes = fechaIso.split('-');
  if (partes.length !== 3) {
    return null;
  }

  const [anio, mes, dia] = partes.map(Number);
  if (!Number.isInteger(anio) || !Number.isInteger(mes) || !Number.isInteger(dia)) {
    return null;
  }

  const fechaUtc = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    fechaUtc.getUTCFullYear() !== anio ||
    fechaUtc.getUTCMonth() !== mes - 1 ||
    fechaUtc.getUTCDate() !== dia
  ) {
    return null;
  }

  return fechaUtc;
}

export function sumarDiasAFechaIso(fechaIso: string, dias: number): string | null {
  const fechaUtc = convertirFechaIsoEnUtc(fechaIso);
  if (!fechaUtc) {
    return null;
  }

  fechaUtc.setUTCDate(fechaUtc.getUTCDate() + dias);
  const anio = fechaUtc.getUTCFullYear();
  const mes = `${fechaUtc.getUTCMonth() + 1}`.padStart(2, '0');
  const dia = `${fechaUtc.getUTCDate()}`.padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

export function obtenerRangoSemanaIso(fechaBase = new Date()): { inicio: string; fin: string } {
  const base = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate());
  const diaSemana = base.getDay(); // 0=domingo
  const deltaHaciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

  const inicio = new Date(base);
  inicio.setDate(base.getDate() + deltaHaciaLunes);

  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 6);

  return {
    inicio: convertirFechaEnIso(inicio),
    fin: convertirFechaEnIso(fin),
  };
}

export function obtenerRangoMesIso(anio: number, mes: number): { inicio: string; fin: string } {
  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 0);

  return {
    inicio: convertirFechaEnIso(inicio),
    fin: convertirFechaEnIso(fin),
  };
}

export function obtenerFechaIsoHaceDias(dias: number, fechaBase = new Date()): string {
  const base = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate());
  base.setDate(base.getDate() - dias);
  return convertirFechaEnIso(base);
}

export function calcularDiasHasta(
  fechaObjetivoIso: string,
  fechaDesdeIso: string = obtenerFechaIsoActual()
): number | null {
  const fechaObjetivoUtc = convertirFechaIsoEnUtc(fechaObjetivoIso);
  const fechaDesdeUtc = convertirFechaIsoEnUtc(fechaDesdeIso);

  if (!fechaObjetivoUtc || !fechaDesdeUtc) {
    return null;
  }

  const milisegundosPorDia = 1000 * 60 * 60 * 24;
  return Math.ceil((fechaObjetivoUtc.getTime() - fechaDesdeUtc.getTime()) / milisegundosPorDia);
}


