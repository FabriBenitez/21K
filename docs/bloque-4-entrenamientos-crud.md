# Bloque 4 - Registro de Entrenamientos (Gym + Running)

## Objetivo

Conectar el modulo de entrenamientos a Supabase para registrar datos reales con CRUD base.

## Implementado

1. Capa de datos Supabase:
- Archivo: `src/modules/trainings/data/entrenamientos.api.ts`.
- Running:
  - listar
  - obtener por id
  - guardar (crear/editar)
  - eliminar
- Gym:
  - listar
  - obtener por id
  - guardar (crear/editar, con multiples ejercicios)
  - eliminar
  - duplicar sesion
- Plantillas:
  - listar plantillas propias
  - crear plantilla

2. Running manual conectado:
- Archivo: `src/modules/trainings/ui/pantalla-registro-running-manual.tsx`.
- Validaciones:
  - distancia > 0
  - duracion > 0
  - coherencia ritmo (2:00 a 20:00 min/km)
- Soporta crear y editar por `runningId`.
- Soporta eliminar registro.

3. Gym conectado:
- Archivo: `src/modules/trainings/ui/pantalla-sesion-gym.tsx`.
- Soporta:
  - agregar/quitar multiples ejercicios
  - crear y editar por `gymId`
  - eliminar sesion
  - duplicar sesion para hoy
  - aplicar plantillas base y propias
  - guardar plantilla desde la sesion actual

4. Historial de entrenamientos:
- Archivo: `src/modules/trainings/ui/pantalla-entrenamientos.tsx`.
- Lista unificada de running + gym.
- Acciones disponibles:
  - editar
  - eliminar
  - duplicar (gym)

5. Rutas conectadas:
- `app/(tabs)/entrenamientos.tsx` ahora muestra historial real.
- `src/modules/trainings/ui/pantalla-selector-entrenamiento.tsx` agrega acceso a historial.

## Validacion

- `npm run lint`: OK
- `npx tsc --noEmit`: OK
