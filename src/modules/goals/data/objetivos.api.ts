import { clienteSupabase } from '@/src/shared/integrations/supabase/cliente-supabase';
import { obtenerUsuarioAutenticadoId } from '@/src/shared/integrations/supabase/usuario-auth';

export interface Objetivo21k {
  id: string;
  fechaObjetivo: string;
  distanciaObjetivoKm: number;
  ritmoObjetivoSegKm?: number;
  notas?: string;
}

interface FilaObjetivo21k {
  id: string;
  fecha_objetivo: string;
  distancia_objetivo_km: number;
  ritmo_objetivo_seg_km: number | null;
  notas: string | null;
}

function mapearObjetivo(fila: FilaObjetivo21k): Objetivo21k {
  return {
    id: fila.id,
    fechaObjetivo: fila.fecha_objetivo,
    distanciaObjetivoKm: Number(fila.distancia_objetivo_km),
    ritmoObjetivoSegKm: fila.ritmo_objetivo_seg_km ?? undefined,
    notas: fila.notas ?? undefined,
  };
}

function normalizarNotas(notas?: string) {
  const valor = notas?.trim();
  return valor && valor.length > 0 ? valor : null;
}

export async function obtenerObjetivo21k(): Promise<Objetivo21k | null> {
  const { data, error } = await clienteSupabase
    .from('objetivos_21k')
    .select('id, fecha_objetivo, distancia_objetivo_km, ritmo_objetivo_seg_km, notas')
    .maybeSingle();

  if (error) {
    throw new Error(`No pudimos obtener tu objetivo 21K: ${error.message}`);
  }

  return data ? mapearObjetivo(data as FilaObjetivo21k) : null;
}

export async function guardarObjetivo21k(entrada: {
  fechaObjetivo: string;
  distanciaObjetivoKm?: number;
  ritmoObjetivoSegKm?: number;
  notas?: string;
}): Promise<Objetivo21k> {
  const userId = await obtenerUsuarioAutenticadoId();

  const { data, error } = await clienteSupabase
    .from('objetivos_21k')
    .upsert(
      {
        user_id: userId,
        fecha_objetivo: entrada.fechaObjetivo,
        distancia_objetivo_km: entrada.distanciaObjetivoKm ?? 21.1,
        ritmo_objetivo_seg_km: entrada.ritmoObjetivoSegKm ?? null,
        notas: normalizarNotas(entrada.notas),
      },
      { onConflict: 'user_id' }
    )
    .select('id, fecha_objetivo, distancia_objetivo_km, ritmo_objetivo_seg_km, notas')
    .single();

  if (error) {
    throw new Error(`No pudimos guardar tu objetivo 21K: ${error.message}`);
  }

  return mapearObjetivo(data as FilaObjetivo21k);
}
