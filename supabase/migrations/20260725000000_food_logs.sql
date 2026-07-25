-- Crear tabla de registro de comidas
CREATE TABLE IF NOT EXISTS public.food_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    descripcion TEXT NOT NULL,
    calorias_estimadas INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;

-- Politicas para que cada usuario vea y maneje solo sus comidas
CREATE POLICY "Users can view their own food logs."
    ON public.food_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food logs."
    ON public.food_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food logs."
    ON public.food_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food logs."
    ON public.food_logs FOR DELETE
    USING (auth.uid() = user_id);

-- Indice para busquedas por fecha y usuario
CREATE INDEX IF NOT EXISTS food_logs_user_id_fecha_idx ON public.food_logs(user_id, fecha);
