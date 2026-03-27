# Configuracion de Supabase

## Variables de entorno

Crear `.env.local` en la raiz del proyecto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_PUBLIC_KEY
SUPABASE_PROJECT_REF=TU_PROJECT_REF
SUPABASE_ACCESS_TOKEN=TU_PERSONAL_ACCESS_TOKEN
```

## Donde obtener cada valor

1. `EXPO_PUBLIC_SUPABASE_URL`
- Supabase: `Project Settings > API > Project URL`
- Ejemplo: `https://abcdefghijklmno.supabase.co`

2. `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Supabase: `Project Settings > API > Project API keys > anon public`
- Es la clave publica para cliente.

3. `SUPABASE_PROJECT_REF`
- Supabase: `Project Settings > General > Reference ID`
- Tambien aparece en la URL del dashboard del proyecto.

4. `SUPABASE_ACCESS_TOKEN`
- Supabase (cuenta personal): `Account Settings > Access Tokens`
- Crear token nuevo para uso local (ejemplo: `codex-local-dev`).
- El valor se muestra una sola vez al crearlo. Si no lo copiaste, crea uno nuevo.

## Seguridad

- `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` pueden vivir en cliente.
- Nunca exponer `service_role` en la app de React Native.
- El token personal (`SUPABASE_ACCESS_TOKEN`) solo se usa para tareas de administracion/migraciones.
