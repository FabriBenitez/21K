import { clienteSupabase } from '@/src/shared/integrations/supabase/cliente-supabase';
import { obtenerUsuarioAutenticadoId } from '@/src/shared/integrations/supabase/usuario-auth';

export interface SensacionDiaria {
  id: string;
  fecha: string;
  sensacion: number;
  notas?: string;
}

interface FilaSensacionDiaria {
  id: string;
  fecha: string;
  sensacion: number;
  notas: string | null;
}

function mapearSensacion(fila: FilaSensacionDiaria): SensacionDiaria {
  return {
    id: fila.id,
    fecha: fila.fecha,
    sensacion: fila.sensacion,
    notas: fila.notas ?? undefined,
  };
}

function normalizarNotas(notas?: string) {
  const valor = notas?.trim();
  return valor && valor.length > 0 ? valor : null;
}

export async function listarSensacionesPorRango(
  fechaDesde: string,
  fechaHasta: string
): Promise<SensacionDiaria[]> {
  const { data, error } = await clienteSupabase
    .from('sensaciones_diarias')
    .select('id, fecha, sensacion, notas')
    .gte('fecha', fechaDesde)
    .lte('fecha', fechaHasta)
    .order('fecha', { ascending: true });

  if (error) {
    throw new Error(`No pudimos listar sensaciones diarias: ${error.message}`);
  }

  return ((data ?? []) as FilaSensacionDiaria[]).map(mapearSensacion);
}

export async function guardarSensacionDia(entrada: {
  fecha: string;
  sensacion: number;
  notas?: string;
}): Promise<SensacionDiaria> {
  const userId = await obtenerUsuarioAutenticadoId();

  if (entrada.sensacion < 1 || entrada.sensacion > 5) {
    throw new Error('La sensacion debe estar entre 1 y 5.');
  }

  const { data, error } = await clienteSupabase
    .from('sensaciones_diarias')
    .upsert(
      {
        user_id: userId,
        fecha: entrada.fecha,
        sensacion: entrada.sensacion,
        notas: normalizarNotas(entrada.notas),
      },
      { onConflict: 'user_id,fecha' }
    )
    .select('id, fecha, sensacion, notas')
    .single();

  if (error) {
    throw new Error(`No pudimos guardar la sensacion diaria: ${error.message}`);
  }

  return mapearSensacion(data as FilaSensacionDiaria);
}
