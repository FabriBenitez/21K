export type DiaSemana = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const diasSemanaOrdenados: DiaSemana[] = [1, 2, 3, 4, 5, 6, 7];

const etiquetasDiaSemana: Record<DiaSemana, string> = {
  1: 'lunes',
  2: 'martes',
  3: 'miercoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sabado',
  7: 'domingo',
};

const etiquetasDiaSemanaCorta: Record<DiaSemana, string> = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mie',
  4: 'Jue',
  5: 'Vie',
  6: 'Sab',
  7: 'Dom',
};

export function esDiaSemana(valor: number): valor is DiaSemana {
  return Number.isInteger(valor) && valor >= 1 && valor <= 7;
}

export function obtenerDiaSemanaActual(fechaBase = new Date()): DiaSemana {
  const dia = fechaBase.getDay();
  return (dia === 0 ? 7 : dia) as DiaSemana;
}

export function obtenerNombreDiaSemana(
  diaSemana: DiaSemana,
  opciones?: { abreviado?: boolean; capitalizar?: boolean }
): string {
  const base = opciones?.abreviado ? etiquetasDiaSemanaCorta[diaSemana] : etiquetasDiaSemana[diaSemana];

  if (opciones?.abreviado) {
    return base;
  }

  if (opciones?.capitalizar === false) {
    return base;
  }

  return `${base.charAt(0).toUpperCase()}${base.slice(1)}`;
}
