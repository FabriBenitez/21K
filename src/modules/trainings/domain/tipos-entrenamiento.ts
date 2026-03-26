export type TipoEntrenamiento = 'running' | 'gimnasio';
export type TipoRunning = 'rodaje_suave' | 'series' | 'fondo_largo';

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


