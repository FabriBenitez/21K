begin;

create table if not exists public.rutinas_gym_semanales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 1 and 7),
  notas text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, dia_semana)
);

create table if not exists public.rutina_gym_semanal_ejercicios (
  id uuid primary key default gen_random_uuid(),
  rutina_id uuid not null references public.rutinas_gym_semanales (id) on delete cascade,
  nombre_ejercicio text not null,
  series integer not null check (series > 0 and series <= 50),
  repeticiones integer not null check (repeticiones > 0 and repeticiones <= 500),
  peso_kg numeric(6, 2) not null default 0 check (peso_kg >= 0 and peso_kg <= 1500),
  orden integer not null default 1 check (orden > 0),
  notas text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (rutina_id, orden)
);

create table if not exists public.rutinas_running_semanales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 1 and 7),
  tipo public.tipo_running not null,
  detalle text,
  distancia_objetivo_km numeric(6, 2) check (
    distancia_objetivo_km is null
    or (distancia_objetivo_km > 0 and distancia_objetivo_km <= 200)
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, dia_semana)
);

create index if not exists idx_rutinas_gym_semanales_user_dia
  on public.rutinas_gym_semanales (user_id, dia_semana);

create index if not exists idx_rutina_gym_semanal_ejercicios_rutina
  on public.rutina_gym_semanal_ejercicios (rutina_id, orden);

create index if not exists idx_rutinas_running_semanales_user_dia
  on public.rutinas_running_semanales (user_id, dia_semana);

drop trigger if exists trg_set_updated_at_rutinas_gym_semanales on public.rutinas_gym_semanales;
create trigger trg_set_updated_at_rutinas_gym_semanales
before update on public.rutinas_gym_semanales
for each row execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_rutina_gym_semanal_ejercicios on public.rutina_gym_semanal_ejercicios;
create trigger trg_set_updated_at_rutina_gym_semanal_ejercicios
before update on public.rutina_gym_semanal_ejercicios
for each row execute function public.set_updated_at();

drop trigger if exists trg_set_updated_at_rutinas_running_semanales on public.rutinas_running_semanales;
create trigger trg_set_updated_at_rutinas_running_semanales
before update on public.rutinas_running_semanales
for each row execute function public.set_updated_at();

alter table public.rutinas_gym_semanales enable row level security;
alter table public.rutina_gym_semanal_ejercicios enable row level security;
alter table public.rutinas_running_semanales enable row level security;

drop policy if exists rutinas_gym_semanales_select_own on public.rutinas_gym_semanales;
create policy rutinas_gym_semanales_select_own
  on public.rutinas_gym_semanales
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists rutinas_gym_semanales_insert_own on public.rutinas_gym_semanales;
create policy rutinas_gym_semanales_insert_own
  on public.rutinas_gym_semanales
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists rutinas_gym_semanales_update_own on public.rutinas_gym_semanales;
create policy rutinas_gym_semanales_update_own
  on public.rutinas_gym_semanales
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists rutinas_gym_semanales_delete_own on public.rutinas_gym_semanales;
create policy rutinas_gym_semanales_delete_own
  on public.rutinas_gym_semanales
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists rutina_gym_semanal_ejercicios_select_owner_routine on public.rutina_gym_semanal_ejercicios;
create policy rutina_gym_semanal_ejercicios_select_owner_routine
  on public.rutina_gym_semanal_ejercicios
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.rutinas_gym_semanales rgs
      where rgs.id = rutina_gym_semanal_ejercicios.rutina_id
        and rgs.user_id = auth.uid()
    )
  );

drop policy if exists rutina_gym_semanal_ejercicios_insert_owner_routine on public.rutina_gym_semanal_ejercicios;
create policy rutina_gym_semanal_ejercicios_insert_owner_routine
  on public.rutina_gym_semanal_ejercicios
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.rutinas_gym_semanales rgs
      where rgs.id = rutina_gym_semanal_ejercicios.rutina_id
        and rgs.user_id = auth.uid()
    )
  );

drop policy if exists rutina_gym_semanal_ejercicios_update_owner_routine on public.rutina_gym_semanal_ejercicios;
create policy rutina_gym_semanal_ejercicios_update_owner_routine
  on public.rutina_gym_semanal_ejercicios
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.rutinas_gym_semanales rgs
      where rgs.id = rutina_gym_semanal_ejercicios.rutina_id
        and rgs.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.rutinas_gym_semanales rgs
      where rgs.id = rutina_gym_semanal_ejercicios.rutina_id
        and rgs.user_id = auth.uid()
    )
  );

drop policy if exists rutina_gym_semanal_ejercicios_delete_owner_routine on public.rutina_gym_semanal_ejercicios;
create policy rutina_gym_semanal_ejercicios_delete_owner_routine
  on public.rutina_gym_semanal_ejercicios
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.rutinas_gym_semanales rgs
      where rgs.id = rutina_gym_semanal_ejercicios.rutina_id
        and rgs.user_id = auth.uid()
    )
  );

drop policy if exists rutinas_running_semanales_select_own on public.rutinas_running_semanales;
create policy rutinas_running_semanales_select_own
  on public.rutinas_running_semanales
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists rutinas_running_semanales_insert_own on public.rutinas_running_semanales;
create policy rutinas_running_semanales_insert_own
  on public.rutinas_running_semanales
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists rutinas_running_semanales_update_own on public.rutinas_running_semanales;
create policy rutinas_running_semanales_update_own
  on public.rutinas_running_semanales
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists rutinas_running_semanales_delete_own on public.rutinas_running_semanales;
create policy rutinas_running_semanales_delete_own
  on public.rutinas_running_semanales
  for delete
  to authenticated
  using (auth.uid() = user_id);

grant select, insert, update, delete on public.rutinas_gym_semanales to authenticated;
grant select, insert, update, delete on public.rutina_gym_semanal_ejercicios to authenticated;
grant select, insert, update, delete on public.rutinas_running_semanales to authenticated;

commit;
