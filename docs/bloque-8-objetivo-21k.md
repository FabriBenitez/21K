# Bloque 8 - Objetivo de Carrera 21K

## Objetivo

Permitir definir fecha objetivo y seguir progreso real hacia la media maraton.

## Implementado

1. Persistencia de objetivo:
- Tabla: `objetivos_21k`.
- API: `src/modules/goals/data/objetivos.api.ts`.
- Operaciones:
  - obtener objetivo actual
  - guardar/actualizar objetivo (`upsert` por usuario)

2. Configuracion desde perfil:
- Archivo: `src/modules/profile/ui/pantalla-perfil.tsx`.
- Campos:
  - fecha objetivo (`YYYY-MM-DD`)
  - ritmo objetivo opcional (`mm:ss`)
  - notas opcionales

3. Indicadores de progreso:
- Dias restantes al objetivo.
- Distancia acumulada.
- Ritmo promedio actual.
- Fondo maximo (progreso hacia 21.1 km).
- Visualizacion con anillo de progreso.

4. Integracion transversal:
- Dashboard consume `objetivos_21k` para mostrar contador y estado semanal.

## Validacion

- `npm run lint`: OK
- `npx tsc --noEmit`: OK
