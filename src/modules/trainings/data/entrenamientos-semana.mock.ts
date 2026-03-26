import type { Entrenamiento } from '@/src/modules/trainings/domain/tipos-entrenamiento';

export const entrenamientosSemanaMock: Entrenamiento[] = [
  {
    id: 'run-01',
    tipo: 'running',
    modalidad: 'rodaje_suave',
    fecha: '2026-03-09',
    distanciaKm: 8,
    duracionMin: 46,
    notas: 'Respiracion controlada durante toda la sesion.',
  },
  {
    id: 'gym-01',
    tipo: 'gimnasio',
    fecha: '2026-03-09',
    ejercicios: [
      { nombre: 'Sentadilla', series: 4, repeticiones: 6, pesoKg: 70 },
      { nombre: 'Peso muerto rumano', series: 3, repeticiones: 8, pesoKg: 55 },
      { nombre: 'Plancha', series: 3, repeticiones: 45, pesoKg: 1 },
    ],
    notas: 'Trabajo de fuerza base.',
  },
  {
    id: 'run-02',
    tipo: 'running',
    modalidad: 'series',
    fecha: '2026-03-11',
    distanciaKm: 7.2,
    duracionMin: 40,
    notas: 'Serie 6x400 con buena tecnica.',
  },
  {
    id: 'gym-02',
    tipo: 'gimnasio',
    fecha: '2026-03-12',
    ejercicios: [
      { nombre: 'Sentadilla', series: 4, repeticiones: 6, pesoKg: 72 },
      { nombre: 'Press banca', series: 4, repeticiones: 8, pesoKg: 50 },
      { nombre: 'Zancadas', series: 3, repeticiones: 10, pesoKg: 22 },
    ],
  },
  {
    id: 'gym-03',
    tipo: 'gimnasio',
    fecha: '2026-03-15',
    ejercicios: [
      { nombre: 'Sentadilla', series: 4, repeticiones: 6, pesoKg: 75 },
      { nombre: 'Press banca', series: 4, repeticiones: 8, pesoKg: 52 },
      { nombre: 'Peso muerto rumano', series: 3, repeticiones: 8, pesoKg: 60 },
    ],
    notas: 'Buena progresion de cargas en los basicos.',
  },
  {
    id: 'run-03',
    tipo: 'running',
    modalidad: 'fondo_largo',
    fecha: '2026-03-13',
    distanciaKm: 14,
    duracionMin: 83,
    notas: 'Ultimos 3 km mas fuertes.',
  },
];

export const fechaObjetivo21KMock = '2026-08-30';



