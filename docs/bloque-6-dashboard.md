# Bloque 6 - Dashboard Semanal

## Objetivo

Mostrar un resumen semanal claro con foco en consistencia, volumen y ultimo entrenamiento.

## Implementado

1. Dashboard con datos reales:
- Archivo: `src/modules/dashboard/ui/pantalla-dashboard.tsx`.
- Carga de Supabase al entrar a la pantalla (`useFocusEffect`).

2. Resumen semanal:
- KM de running de la semana.
- Cantidad total de sesiones (running + gym).
- Dias activos y dias de descanso.
- Ritmo promedio.
- Volumen de fuerza.

3. Ultimo entrenamiento:
- Muestra tipo, fecha y resumen.
- Boton para ir directo a editar el ultimo registro.

4. Indicadores de preparacion 21K:
- Fecha objetivo (si existe).
- Dias restantes.
- KM acumulados de ventana reciente.
- Fondo mas largo.

5. Frase motivacional contextual:
- Contexto dinamico en base a:
  - logro (fondo alto o alta actividad semanal)
  - descanso (si hoy no hubo entrenamiento)
  - running/gym segun ultimo entrenamiento
  - general como fallback
- API: `src/modules/motivation/data/frases.api.ts`.

## Validacion

- `npm run lint`: OK
- `npx tsc --noEmit`: OK
