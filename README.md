# 21K App

Aplicacion movil para corredores amateur que combina running y fuerza para preparar una media maraton (21K).

## Stack

- React Native
- Expo + Expo Router
- TypeScript
- React Native Paper
- Supabase

## Scripts

```bash
npm install
npm run start
npm run android
npm run ios
npm run web
npm run lint
```

## Arquitectura Base (Bloque 1)

- Navegacion por archivos con `app/` y `expo-router`.
- Provider raiz centralizado en `src/shared/providers/proveedor-app.tsx`.
- Estado global de aplicacion con contexto en `src/shared/state/contexto-app.tsx`.
- Guardas de navegacion para separar flujo autenticado y no autenticado.
- Manejo global de errores:
  - Limite de error de React: `src/shared/errors/limite-error-global.tsx`
  - Fallback visual reutilizable: `src/shared/errors/pantalla-error-global.tsx`
  - Error boundary de rutas en `app/_layout.tsx`
  - Pantalla 404 en `app/+not-found.tsx`

## Estructura recomendada

```text
app/
  (auth)/
  (tabs)/
  _layout.tsx
  +not-found.tsx

src/
  modules/
    auth/
    dashboard/
    trainings/
    calendar/
    statistics/
    profile/
  shared/
    errors/
    navigation/
    providers/
    state/
    theme/
    ui/
    utils/
```

## Convenciones

- Rutas centralizadas en `src/shared/navigation/rutas-app.ts`.
- UI compartida en `src/shared/ui`.
- Pantallas por modulo en `src/modules/*/ui`.
- Utilidades puras en `src/shared/utils`.

## Supabase

- Configuracion de entorno: `docs/supabase-configuracion.md`.
- Esquema y seguridad (Bloque 2): `supabase/migrations/20260326000100_initial_schema.sql`.
- Seed inicial: `supabase/seed.sql`.
- Auth real app (Bloque 3): `docs/bloque-3-auth-supabase.md`.
- Entrenamientos CRUD (Bloque 4): `docs/bloque-4-entrenamientos-crud.md`.
- Calendario (Bloque 5): `docs/bloque-5-calendario.md`.
- Dashboard (Bloque 6): `docs/bloque-6-dashboard.md`.
- Estadisticas (Bloque 7): `docs/bloque-7-estadisticas.md`.
- Objetivo 21K (Bloque 8): `docs/bloque-8-objetivo-21k.md`.
- Frases motivacionales (Bloque 9): `docs/bloque-9-frases-motivacionales.md`.

## Estado De Bloques

- Bloque 1: completo
- Bloque 2: completo
- Bloque 3: completo
- Bloque 4: completo
- Bloque 5: completo
- Bloque 6: completo
- Bloque 7: completo
- Bloque 8: completo
- Bloque 9: completo
