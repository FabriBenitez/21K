# Bloque 2 - Backend y Seguridad (Supabase)

## Objetivo

Preparar capa de datos segura para la app de entrenamiento:

- Esquema SQL inicial.
- Relaciones e indices para performance.
- RLS por usuario.
- Seed de frases motivacionales predefinidas.

## Archivos creados

- `supabase/migrations/20260326000100_initial_schema.sql`
- `supabase/seed.sql`
- `src/shared/integrations/supabase/cliente-supabase.ts`
- `src/shared/config/variables-entorno.ts`
- `.env.example`
- `docs/supabase-configuracion.md`

## Tablas incluidas

- `profiles`
- `objetivos_21k`
- `sesiones_gym`
- `ejercicios_gym`
- `plantillas_gym`
- `plantilla_ejercicios_gym`
- `sesiones_running`
- `sensaciones_diarias`
- `frases_motivacionales`

## Seguridad

- RLS habilitado en todas las tablas de dominio.
- Politicas de acceso por `auth.uid()`.
- Frases predefinidas globales visibles por usuarios autenticados.
- Frases personalizadas manipulables solo por su propietario.

## Nota de implementacion

- La migracion define trigger `on_auth_user_created` para crear perfil al registrarse.
- La autenticacion completa (registro/login/logout con Supabase Auth) se termina en Bloque 3.
