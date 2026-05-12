import { type DiaSemana } from '@/src/shared/utils/dias-semana';

export type TipoEntrenamiento = 'running' | 'gimnasio';
export type TipoRunning = 'rodaje_suave' | 'series' | 'fondo_largo' | 'tempo' | 'recuperacion';

export const tiposRunningDisponibles: { valor: TipoRunning; etiqueta: string }[] = [
  { valor: 'rodaje_suave', etiqueta: 'KM cortos' },
  { valor: 'series', etiqueta: 'Pasadas' },
  { valor: 'fondo_largo', etiqueta: 'Fondo' },
  { valor: 'tempo', etiqueta: 'Tempo' },
  { valor: 'recuperacion', etiqueta: 'Recuperacion' },
];

export function obtenerEtiquetaTipoRunning(tipo: TipoRunning): string {
  return tiposRunningDisponibles.find((item) => item.valor === tipo)?.etiqueta ?? 'Running';
}

export interface BaseEntrenamiento {
  id: string;
  fecha: string;
  notas?: string;
}

export interface EjercicioGimnasio {
  nombre: string;
  series: number;
  repeticiones: number;
  pesoKg: number;
}

export interface EntrenamientoRunning extends BaseEntrenamiento {
  tipo: 'running';
  modalidad: TipoRunning;
  distanciaKm: number;
  duracionMin: number;
}

export interface EntrenamientoGimnasio extends BaseEntrenamiento {
  tipo: 'gimnasio';
  ejercicios: EjercicioGimnasio[];
}

export type Entrenamiento = EntrenamientoRunning | EntrenamientoGimnasio;

export interface EntradaSesionRunning {
  id?: string;
  fechaSesion: string;
  distanciaKm: number;
  duracionSegundos: number;
  tipo: TipoRunning;
  notas?: string;
}

export interface EntradaEjercicioGym {
  nombre: string;
  series: number;
  repeticiones: number;
  pesoKg: number;
  notas?: string;
}

export interface EntradaSesionGym {
  id?: string;
  fechaSesion: string;
  notas?: string;
  sesionDuplicadaDesde?: string;
  ejercicios: EntradaEjercicioGym[];
}

export interface PlantillaGym {
  id: string;
  nombre: string;
  descripcion?: string;
  ejercicios: EntradaEjercicioGym[];
}

export interface EntradaRutinaGymSemanal {
  id?: string;
  diaSemana: DiaSemana;
  notas?: string;
  ejercicios: EntradaEjercicioGym[];
}

export interface RutinaGymSemanal extends EntradaRutinaGymSemanal {
  id: string;
  createdAt: string;
}

export interface EntradaRutinaRunningSemanal {
  id?: string;
  diaSemana: DiaSemana;
  tipo: TipoRunning;
  detalle?: string;
  distanciaObjetivoKm?: number;
}

export interface RutinaRunningSemanal extends EntradaRutinaRunningSemanal {
  id: string;
  createdAt: string;
}


