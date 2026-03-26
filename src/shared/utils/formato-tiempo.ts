export function formatearDuracionMinutos(duracionTotalMin: number): string {
  const horas = Math.floor(duracionTotalMin / 60);
  const minutos = duracionTotalMin % 60;

  if (horas <= 0) {
    return `${minutos} min`;
  }

  return `${horas} h ${minutos.toString().padStart(2, '0')} min`;
}


