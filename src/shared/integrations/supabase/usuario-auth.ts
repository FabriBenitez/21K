import { clienteSupabase } from '@/src/shared/integrations/supabase/cliente-supabase';

export async function obtenerUsuarioAutenticadoId(): Promise<string> {
  const { data, error } = await clienteSupabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('No hay una sesion activa para esta operacion.');
  }

  return data.user.id;
}
