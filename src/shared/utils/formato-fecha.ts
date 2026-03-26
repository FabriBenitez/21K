const nombresMesCortos = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

export function formatearFechaCorta(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const nombreMes = nombresMesCortos[mes - 1];

  if (!anio || !mes || !dia || !nombreMes) {
    return fechaIso;
  }

  return `${dia.toString().padStart(2, '0')} ${nombreMes} ${anio}`;
}


