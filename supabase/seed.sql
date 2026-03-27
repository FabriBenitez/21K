insert into public.frases_motivacionales (frase, contexto, es_predefinida, activa)
select v.frase, v.contexto::public.contexto_frase, true, true
from (
  values
    ('Un entrenamiento mas cuenta. La constancia gana.', 'general'),
    ('No busques perfeccion, busca repetir el habito.', 'general'),
    ('Hoy no hace falta volar, hace falta salir.', 'running'),
    ('El fondo largo se corre con piernas y con cabeza.', 'running'),
    ('Cada repeticion construye confianza para el 21K.', 'gym'),
    ('La tecnica de hoy es la velocidad de manana.', 'gym'),
    ('Este logro es una prueba de que vas por buen camino.', 'logro'),
    ('Descansar tambien es entrenar inteligentemente.', 'descanso')
) as v(frase, contexto)
where not exists (
  select 1
  from public.frases_motivacionales fm
  where fm.frase = v.frase
    and fm.contexto = v.contexto::public.contexto_frase
    and fm.es_predefinida = true
);
