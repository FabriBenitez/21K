# Bloque 7 - Estadisticas de Entrenamiento

## Objetivo

Dar analisis de progreso para running y gimnasio con tendencias y consistencia.

## Implementado

1. Pantalla de estadisticas conectada:
- Archivo: `src/modules/statistics/ui/pantalla-estadisticas.tsx`.
- Carga entrenamientos por rango desde Supabase.

2. Running:
- KM acumulados.
- Ritmo promedio.
- Fondo mas largo.
- Grafico de km semanales (ultimas 8 semanas).
- Tendencia de kilometraje (ultimas 4 semanas vs 4 previas).
- Consistencia semanal (% de semanas con 3 o mas sesiones).

3. Gimnasio:
- Volumen total de fuerza.
- Evolucion de peso por ejercicio (progresion temporal).
- Ejercicio destacado con mini grafico.
- Lista de progreso por ejercicios.
- Maximo peso por ejercicio (top ejercicios).

4. Capa de metricas extendida:
- Archivo: `src/modules/trainings/domain/metricas-entrenamiento.ts`.
- Nuevas funciones:
  - `obtenerMaximosPesoPorEjercicio`
  - `calcularConsistenciaSemanal`
  - `calcularTendenciaKilometraje`

## Validacion

- `npm run lint`: OK
- `npx tsc --noEmit`: OK
