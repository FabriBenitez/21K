# Bloque 1 - Base Tecnica

## Objetivo

Dejar lista la arquitectura base del proyecto para construir los modulos funcionales sin retrabajo:

- Navegacion base con Expo Router.
- Estado global transversal de la app.
- Guardas de rutas autenticadas y publicas.
- Manejo global de errores y pantalla 404.

## Implementado

1. Estado global de aplicacion:
- Archivo: `src/shared/state/contexto-app.tsx`
- Estado inicial de sesion: `invitado`.
- Acciones base: `iniciarSesionLocal` y `cerrarSesionLocal`.

2. Manejo global de errores:
- `src/shared/errors/limite-error-global.tsx`
- `src/shared/errors/pantalla-error-global.tsx`
- Integracion con `ErrorBoundary` de Expo Router en `app/_layout.tsx`.

3. Provider raiz:
- Archivo: `src/shared/providers/proveedor-app.tsx`.
- Composicion actual:
  - `SafeAreaProvider`
  - `LimiteErrorGlobal`
  - `PaperProvider`
  - `ProveedorEstadoApp`

4. Guardas de navegacion:
- `app/(auth)/_layout.tsx` redirige a tabs si existe sesion autenticada.
- `app/(tabs)/_layout.tsx` redirige a login cuando no hay sesion.
- `app/index.tsx` decide el entrypoint segun `estadoSesion`.

5. Rutas centralizadas:
- Archivo: `src/shared/navigation/rutas-app.ts`.
- Se evita hardcodear paths de Router distribuidos en pantallas.

6. Pantalla not found:
- Archivo: `app/+not-found.tsx`.

## Salida funcional de este bloque

- La app ya puede manejar flujo basico de entrada/salida de sesion en forma centralizada.
- La navegacion queda protegida por contexto global.
- Errores no controlados muestran un fallback reutilizable.

## Notas tecnicas

- La autenticacion todavia es local (sin backend).
- La persistencia real de sesion se implementa en Bloque 2/3 junto a Supabase.
