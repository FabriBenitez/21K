begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'tipo_running'
      and n.nspname = 'public'
  ) then
    create type public.tipo_running as enum (
      'rodaje_suave',
      'series',
      'fondo_largo',
      'tempo',
      'recuperacion'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'contexto_frase'
      and n.nspname = 'public'
  ) then
    create type public.contexto_frase as enum ('general', 'running', 'gym', 'logro', 'descanso');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nombre_mostrado text not null default 'Corredor 21K',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nombre_mostrado)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre_mostrado', 'Corredor 21K')
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

insert into public.profiles (id, email, nombre_mostrado)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'nombre_mostrado', 'Corredor 21K')
from auth.users u
on conflict (id) do nothing;

create table if not exists public.objetivos_21k (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  fecha_objetivo date not null,
  distancia_objetivo_km numeric(4, 1) not null default 21.1 check (distancia_objetivo_km > 0),
  ritmo_objetivo_seg_km integer check (ritmo_objetivo_seg_km is null or ritmo_objetivo_seg_km > 0),
  notas text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sesiones_gym (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  fecha_sesion date not null,
  notas text,
  sesion_duplicada_desde uuid references public.sesiones_gym (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ejercicios_gym (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid not null references public.sesiones_gym (id) on delete cascade,
  nombre_ejercicio text not null,
  series integer not null check (series > 0 and series <= 50),
  repeticiones integer not null check (repeticiones > 0 and repeticiones <= 500),
  peso_kg numeric(6, 2) not null default 0 check (peso_kg >= 0 and peso_kg <= 1500),
  orden integer not null default 1 check (orden > 0),
  notas text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (sesion_id, orden)
);

create table if not exists public.plantillas_gym (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre_plantilla text not null,
  descripcion text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.plantilla_ejercicios_gym (
  id uuid primary key default gen_random_uuid(),
  plantilla_id uuid not null references public.plantillas_gym (id) on delete cascade,
  nombre_ejercicio text not null,
  series integer not null check (series > 0 and series <= 50),
  repeticiones integer not null check (repeticiones > 0 and repeticiones <= 500),
  peso_kg numeric(6, 2) not null default 0 check (peso_kg >= 0 and peso_kg <= 1500),
  orden integer not null default 1 check (orden > 0),
  notas text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (plantilla_id, orden)
);

create table if not exists public.sesiones_running (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  fecha_sesion date not null,
  distancia_km numeric(6, 2) not null check (distancia_km > 0 and distancia_km <= 200),
  duracion_segundos integer not null check (duracion_segundos > 0 and duracion_segundos <= 86400),
  tipo public.tipo_running not null,
  ritmo_promedio_seg_km integer generated always as (
    round((duracion_segundos::numeric / distancia_km))
  ) stored,
  esfuerzo_percibido integer check (esfuerzo_percibido is null or esfuerzo_percibido between 1 and 10),
  notas text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check ((duracion_segundos::numeric / distancia_km) between 120 and 1200)
);

create table if not exists public.sensaciones_diarias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  fecha date not null,
  sensacion integer not null check (sensacion between 1 and 5),
  notas text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, fecha)
);

create table if not exists public.frases_motivacionales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  frase text not null check (char_length(trim(frase)) >= 3),
  contexto public.contexto_frase not null default 'general',
  es_predefinida boolean not null default false,
  activa boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (es_predefinida = true and user_id is null)
    or (es_predefinida = false and user_id is not null)
  )
);

create unique index if not exists uq_plantillas_gym_user_nombre
  on public.plantillas_gym (user_id, lower(nombre_plantilla));

create index if not exists idx_objetivos_21k_user
  on public.objetivos_21k (user_id);

create index if not exists idx_sesiones_gym_user_fecha
  on public.sesiones_gym (user_id, fecha_sesion desc);

create index if not exists idx_ejercicios_gym_sesion
  on public.ejercicios_gym (sesion_id, orden);

create index if not exists idx_plantillas_gym_user
  on public.plantillas_gym (user_id);

create index if not exists idx_plantilla_ejercicios_gym_plantilla
  on public.plantilla_ejercicios_gym (plantilla_id, orden);

create index if not exists idx_sesiones_running_user_fecha
  on public.sesiones_running (user_id, fecha_sesion desc);

create index if not exists idx_sesiones_running_user_tipo
  on public.sesiones_running (user_id, tipo);

create index if not exists idx_sensaciones_diarias_user_fecha
  on public.sensaciones_diarias (user_id, fecha desc);

create index if not exists idx_frases_motivacionales_user_contexto
  on public.frases_motivacionales (user_id, contexto);

create index if not exists idx_frases_motivacionales_predefinidas
  on public.frases_motivacionales (contexto)
  where es_predefinida = true and activa = true;

drop trigger if exists trg_set_updated_at_profiles on public.profiles;
create trigger trg_set_updated_at_profiles
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_objetivos_21k on public.objetivos_21k;
create trigger trg_set_updated_at_objetivos_21k
before update on public.objetivos_21k
for each row execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_sesiones_gym on public.sesiones_gym;
create trigger trg_set_updated_at_sesiones_gym
before update on public.sesiones_gym
for each row execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_ejercicios_gym on public.ejercicios_gym;
create trigger trg_set_updated_at_ejercicios_gym
before update on public.ejercicios_gym
for each row execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_plantillas_gym on public.plantillas_gym;
create trigger trg_set_updated_at_plantillas_gym
before update on public.plantillas_gym
for each row execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_plantilla_ejercicios_gym on public.plantilla_ejercicios_gym;
create trigger trg_set_updated_at_plantilla_ejercicios_gym
before update on public.plantilla_ejercicios_gym
for each row execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_sesiones_running on public.sesiones_running;
create trigger trg_set_updated_at_sesiones_running
before update on public.sesiones_running
for each row execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_sensaciones_diarias on public.sensaciones_diarias;
create trigger trg_set_updated_at_sensaciones_diarias
before update on public.sensaciones_diarias
for each row execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_frases_motivacionales on public.frases_motivacionales;
create trigger trg_set_updated_at_frases_motivacionales
before update on public.frases_motivacionales
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.objetivos_21k enable row level security;
alter table public.sesiones_gym enable row level security;
alter table public.ejercicios_gym enable row level security;
alter table public.plantillas_gym enable row level security;
alter table public.plantilla_ejercicios_gym enable row level security;
alter table public.sesiones_running enable row level security;
alter table public.sensaciones_diarias enable row level security;
alter table public.frases_motivacionales enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists objetivos_21k_select_own on public.objetivos_21k;
create policy objetivos_21k_select_own
  on public.objetivos_21k
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists objetivos_21k_insert_own on public.objetivos_21k;
create policy objetivos_21k_insert_own
  on public.objetivos_21k
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists objetivos_21k_update_own on public.objetivos_21k;
create policy objetivos_21k_update_own
  on public.objetivos_21k
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists objetivos_21k_delete_own on public.objetivos_21k;
create policy objetivos_21k_delete_own
  on public.objetivos_21k
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists sesiones_gym_select_own on public.sesiones_gym;
create policy sesiones_gym_select_own
  on public.sesiones_gym
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists sesiones_gym_insert_own on public.sesiones_gym;
create policy sesiones_gym_insert_own
  on public.sesiones_gym
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists sesiones_gym_update_own on public.sesiones_gym;
create policy sesiones_gym_update_own
  on public.sesiones_gym
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists sesiones_gym_delete_own on public.sesiones_gym;
create policy sesiones_gym_delete_own
  on public.sesiones_gym
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists ejercicios_gym_select_owner_session on public.ejercicios_gym;
create policy ejercicios_gym_select_owner_session
  on public.ejercicios_gym
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.sesiones_gym sg
      where sg.id = ejercicios_gym.sesion_id
        and sg.user_id = auth.uid()
    )
  );

drop policy if exists ejercicios_gym_insert_owner_session on public.ejercicios_gym;
create policy ejercicios_gym_insert_owner_session
  on public.ejercicios_gym
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.sesiones_gym sg
      where sg.id = ejercicios_gym.sesion_id
        and sg.user_id = auth.uid()
    )
  );

drop policy if exists ejercicios_gym_update_owner_session on public.ejercicios_gym;
create policy ejercicios_gym_update_owner_session
  on public.ejercicios_gym
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.sesiones_gym sg
      where sg.id = ejercicios_gym.sesion_id
        and sg.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.sesiones_gym sg
      where sg.id = ejercicios_gym.sesion_id
        and sg.user_id = auth.uid()
    )
  );

drop policy if exists ejercicios_gym_delete_owner_session on public.ejercicios_gym;
create policy ejercicios_gym_delete_owner_session
  on public.ejercicios_gym
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.sesiones_gym sg
      where sg.id = ejercicios_gym.sesion_id
        and sg.user_id = auth.uid()
    )
  );

drop policy if exists plantillas_gym_select_own on public.plantillas_gym;
create policy plantillas_gym_select_own
  on public.plantillas_gym
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists plantillas_gym_insert_own on public.plantillas_gym;
create policy plantillas_gym_insert_own
  on public.plantillas_gym
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists plantillas_gym_update_own on public.plantillas_gym;
create policy plantillas_gym_update_own
  on public.plantillas_gym
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists plantillas_gym_delete_own on public.plantillas_gym;
create policy plantillas_gym_delete_own
  on public.plantillas_gym
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists plantilla_ejercicios_gym_select_owner_template on public.plantilla_ejercicios_gym;
create policy plantilla_ejercicios_gym_select_owner_template
  on public.plantilla_ejercicios_gym
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.plantillas_gym pg
      where pg.id = plantilla_ejercicios_gym.plantilla_id
        and pg.user_id = auth.uid()
    )
  );

drop policy if exists plantilla_ejercicios_gym_insert_owner_template on public.plantilla_ejercicios_gym;
create policy plantilla_ejercicios_gym_insert_owner_template
  on public.plantilla_ejercicios_gym
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.plantillas_gym pg
      where pg.id = plantilla_ejercicios_gym.plantilla_id
        and pg.user_id = auth.uid()
    )
  );

drop policy if exists plantilla_ejercicios_gym_update_owner_template on public.plantilla_ejercicios_gym;
create policy plantilla_ejercicios_gym_update_owner_template
  on public.plantilla_ejercicios_gym
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.plantillas_gym pg
      where pg.id = plantilla_ejercicios_gym.plantilla_id
        and pg.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.plantillas_gym pg
      where pg.id = plantilla_ejercicios_gym.plantilla_id
        and pg.user_id = auth.uid()
    )
  );

drop policy if exists plantilla_ejercicios_gym_delete_owner_template on public.plantilla_ejercicios_gym;
create policy plantilla_ejercicios_gym_delete_owner_template
  on public.plantilla_ejercicios_gym
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.plantillas_gym pg
      where pg.id = plantilla_ejercicios_gym.plantilla_id
        and pg.user_id = auth.uid()
    )
  );

drop policy if exists sesiones_running_select_own on public.sesiones_running;
create policy sesiones_running_select_own
  on public.sesiones_running
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists sesiones_running_insert_own on public.sesiones_running;
create policy sesiones_running_insert_own
  on public.sesiones_running
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists sesiones_running_update_own on public.sesiones_running;
create policy sesiones_running_update_own
  on public.sesiones_running
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists sesiones_running_delete_own on public.sesiones_running;
create policy sesiones_running_delete_own
  on public.sesiones_running
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists sensaciones_diarias_select_own on public.sensaciones_diarias;
create policy sensaciones_diarias_select_own
  on public.sensaciones_diarias
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists sensaciones_diarias_insert_own on public.sensaciones_diarias;
create policy sensaciones_diarias_insert_own
  on public.sensaciones_diarias
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists sensaciones_diarias_update_own on public.sensaciones_diarias;
create policy sensaciones_diarias_update_own
  on public.sensaciones_diarias
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists sensaciones_diarias_delete_own on public.sensaciones_diarias;
create policy sensaciones_diarias_delete_own
  on public.sensaciones_diarias
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists frases_motivacionales_select_predefined_or_own on public.frases_motivacionales;
create policy frases_motivacionales_select_predefined_or_own
  on public.frases_motivacionales
  for select
  to authenticated
  using (es_predefinida = true or auth.uid() = user_id);

drop policy if exists frases_motivacionales_insert_own on public.frases_motivacionales;
create policy frases_motivacionales_insert_own
  on public.frases_motivacionales
  for insert
  to authenticated
  with check (auth.uid() = user_id and es_predefinida = false);

drop policy if exists frases_motivacionales_update_own on public.frases_motivacionales;
create policy frases_motivacionales_update_own
  on public.frases_motivacionales
  for update
  to authenticated
  using (auth.uid() = user_id and es_predefinida = false)
  with check (auth.uid() = user_id and es_predefinida = false);

drop policy if exists frases_motivacionales_delete_own on public.frases_motivacionales;
create policy frases_motivacionales_delete_own
  on public.frases_motivacionales
  for delete
  to authenticated
  using (auth.uid() = user_id and es_predefinida = false);

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
grant usage, select on sequences to authenticated;

commit;
