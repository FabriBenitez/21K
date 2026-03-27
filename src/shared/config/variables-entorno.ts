function obtenerSupabaseUrl() {
  const valor = process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!valor) {
    throw new Error('Falta la variable de entorno obligatoria: EXPO_PUBLIC_SUPABASE_URL.');
  }

  return valor;
}

function obtenerSupabaseAnonKey() {
  const valor = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!valor) {
    throw new Error('Falta la variable de entorno obligatoria: EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return valor;
}

export const variablesEntorno = {
  supabaseUrl: obtenerSupabaseUrl(),
  supabaseAnonKey: obtenerSupabaseAnonKey(),
} as const;
