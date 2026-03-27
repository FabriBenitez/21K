# Bloque 9 - Frases Motivacionales

## Objetivo

Usar frases predefinidas y personalizadas para reforzar motivacion durante la preparacion 21K.

## Implementado

1. Modelo de datos:
- Tabla: `frases_motivacionales`.
- Contextos soportados:
  - `general`
  - `running`
  - `gym`
  - `logro`
  - `descanso`
- Seed inicial en `supabase/seed.sql`.

2. API de frases:
- Archivo: `src/modules/motivation/data/frases.api.ts`.
- Funciones:
  - listar frases activas
  - crear frase personalizada
  - obtener frase contextual

3. Frases personalizadas desde perfil:
- Archivo: `src/modules/profile/ui/pantalla-perfil.tsx`.
- Permite crear frase + elegir contexto.
- Lista frases activas (predefinidas y propias).

4. Uso contextual en dashboard:
- Archivo: `src/modules/dashboard/ui/pantalla-dashboard.tsx`.
- Seleccion de contexto por actividad/descanso/logro para mostrar frase del dia.

## Validacion

- `npm run lint`: OK
- `npx tsc --noEmit`: OK
