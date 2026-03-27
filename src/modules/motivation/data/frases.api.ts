import { clienteSupabase } from '@/src/shared/integrations/supabase/cliente-supabase';
import { obtenerUsuarioAutenticadoId } from '@/src/shared/integrations/supabase/usuario-auth';

export type ContextoFrase = 'general' | 'running' | 'gym' | 'logro' | 'descanso';

export interface FraseMotivacional {
  id: string;
  frase: string;
  contexto: ContextoFrase;
  esPredefinida: boolean;
  activa: boolean;
}

interface FilaFraseMotivacional {
  id: string;
  frase: string;
  contexto: ContextoFrase;
  es_predefinida: boolean;
  activa: boolean;
}

function mapearFrase(fila: FilaFraseMotivacional): FraseMotivacional {
  return {
    id: fila.id,
    frase: fila.frase,
    contexto: fila.contexto,
    esPredefinida: fila.es_predefinida,
    activa: fila.activa,
  };
}

export async function listarFrasesMotivacionalesActivas(): Promise<FraseMotivacional[]> {
  const { data, error } = await clienteSupabase
    .from('frases_motivacionales')
    .select('id, frase, contexto, es_predefinida, activa')
    .eq('activa', true)
    .order('es_predefinida', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`No pudimos listar frases motivacionales: ${error.message}`);
  }

  return ((data ?? []) as FilaFraseMotivacional[]).map(mapearFrase);
}

export async function crearFraseMotivacionalPersonalizada(entrada: {
  frase: string;
  contexto: ContextoFrase;
}): Promise<FraseMotivacional> {
  const userId = await obtenerUsuarioAutenticadoId();
  const fraseLimpia = entrada.frase.trim();

  if (fraseLimpia.length < 3) {
    throw new Error('La frase debe tener al menos 3 caracteres.');
  }

  const { data, error } = await clienteSupabase
    .from('frases_motivacionales')
    .insert({
      user_id: userId,
      frase: fraseLimpia,
      contexto: entrada.contexto,
      es_predefinida: false,
      activa: true,
    })
    .select('id, frase, contexto, es_predefinida, activa')
    .single();

  if (error) {
    throw new Error(`No pudimos guardar la frase personalizada: ${error.message}`);
  }

  return mapearFrase(data as FilaFraseMotivacional);
}

export async function obtenerFraseMotivacionalContextual(
  contextoPreferido: ContextoFrase
): Promise<FraseMotivacional | null> {
  const frases = await listarFrasesMotivacionalesActivas();
  if (frases.length === 0) {
    return null;
  }

  const candidatas = frases.filter(
    (frase) => frase.contexto === contextoPreferido || frase.contexto === 'general'
  );
  const base = candidatas.length > 0 ? candidatas : frases;

  const indice = Math.floor(Math.random() * base.length);
  return base[indice] ?? null;
}
