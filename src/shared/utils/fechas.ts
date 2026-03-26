export function obtenerFechaIsoActual(): string {
  const fechaActual = new Date();
  const anio = fechaActual.getFullYear();
  const mes = `${fechaActual.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fechaActual.getDate()}`.padStart(2, '0');

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


