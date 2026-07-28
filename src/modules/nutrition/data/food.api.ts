import { clienteSupabase as supabase } from '@/src/shared/integrations/supabase/cliente-supabase';
import { obtenerFechaIsoActual } from '@/src/shared/utils/fechas';

export interface FoodLog {
  id: string;
  user_id: string;
  fecha: string;
  descripcion: string;
  calorias_estimadas: number;
  carbohidratos_estimados: number;
  proteinas_estimadas: number;
  created_at: string;
}

export async function addFoodLog(
  descripcion: string, 
  calorias_estimadas: number,
  carbohidratos_estimados: number,
  proteinas_estimadas: number
): Promise<FoodLog> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('food_logs')
    .insert([
      {
        user_id: user.user.id,
        descripcion,
        calorias_estimadas,
        carbohidratos_estimados,
        proteinas_estimadas,
        fecha: obtenerFechaIsoActual(),
      }
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getFoodLogsByDateRange(startDate: string, endDate: string): Promise<FoodLog[]> {
  const { data, error } = await supabase
    .from('food_logs')
    .select('*')
    .gte('fecha', startDate)
    .lte('fecha', endDate)
    .order('fecha', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
