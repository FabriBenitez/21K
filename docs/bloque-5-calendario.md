# Bloque 5 - Calendario de Entrenamientos

## Objetivo

Tener una vista mensual interactiva con diferenciacion visual de running vs gym, detalle por dia, sensaciones y accesos rapidos para crear/editar.

## Implementado

1. Pantalla calendario conectada a Supabase:
- Archivo: `src/modules/calendar/ui/pantalla-calendario.tsx`.
- Muestra mes actual y cambio de mes.
- Carga datos reales de:
  - running (`sesiones_running`)
  - gym (`sesiones_gym` + ejercicios)
  - sensaciones (`sensaciones_diarias`)

2. Diferenciacion visual por tipo:
- Marcado `multi-dot` en calendario:
  - Running: color neon.
  - Gym: color azul.

3. Detalle al seleccionar dia:
- Lista de entrenamientos del dia con resumen:
  - running: distancia, duracion y tipo
  - gym: cantidad de ejercicios
- Navegacion a edicion:
  - running -> `/registro-running?runningId=...`
  - gym -> `/sesion-gym?gymId=...`

4. Acceso rapido a creacion:
- Botones `+ Running` y `+ Gym` con fecha preseleccionada del dia elegido.

5. Sensacion diaria:
- Selector 1 a 5 + notas.
- Guardado por `upsert` (una sensacion por usuario por dia).
- API: `src/modules/calendar/data/sensaciones.api.ts`.

## Validacion

- `npm run lint`: OK
- `npx tsc --noEmit`: OK
