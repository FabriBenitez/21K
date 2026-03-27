# Bloque 3 - Auth Real con Supabase

## Objetivo

Implementar autenticacion real end-to-end:

- Registro.
- Login.
- Persistencia de sesion.
- Logout.
- Recuperacion de contrasena.

## Cambios implementados

1. Contexto global de auth con Supabase:
- Archivo: `src/shared/state/contexto-app.tsx`.
- Estado de sesion: `cargando`, `invitado`, `autenticado`.
- Metodos expuestos:
  - `iniciarSesion`
  - `registrarCuenta`
  - `enviarRecuperacionClave`
  - `actualizarClave`
  - `cerrarSesion`

2. Persistencia de sesion:
- Archivo: `src/shared/integrations/supabase/cliente-supabase.ts`.
- `AsyncStorage` configurado en `supabase.auth`.
- Rehidratacion inicial con `getSession`.
- Suscripcion a `onAuthStateChange`.

3. Deep links de recuperacion:
- Parseo de `access_token` y `refresh_token` desde URL.
- Carga de sesion con `supabase.auth.setSession`.
- Ruta callback: `app/auth/callback.tsx`.
- Ruta nueva clave: `app/reset-password.tsx`.

4. Pantallas auth conectadas:
- `src/modules/auth/ui/pantalla-login.tsx`
- `src/modules/auth/ui/pantalla-registro.tsx`
- `src/modules/auth/ui/pantalla-recuperar-clave.tsx`
- `src/modules/auth/ui/pantalla-reset-password.tsx`

5. Guardas y carga de sesion:
- `app/index.tsx`
- `app/(auth)/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `src/shared/ui/pantalla-cargando-app.tsx`

6. Logout real:
- `src/modules/profile/ui/pantalla-perfil.tsx`

## Estado

- `npm run lint`: OK
- `npx tsc --noEmit`: OK
