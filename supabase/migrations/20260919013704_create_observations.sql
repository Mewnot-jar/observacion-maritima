create type public.confidence_level as enum (
  'segura', 'bastante_segura', 'no_segura'
);

create table public.observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  species_id uuid references public.species(id),

  observed_at timestamptz not null, 
  location geography(point, 4326) not null, 
  location_name text,  

  individual_count text check (individual_count in ('1','2-5','6-20','+20')),
  behavior text,
  confidence_level public.confidence_level not null default 'segura',
  conditions jsonb, 
  notes text,

  is_alert boolean not null default false,     
  is_hidden boolean not null default false,   
  is_verified boolean not null default false, 

  created_at timestamptz not null default now()
);

create index observations_location_idx on public.observations using gist (location);

alter table public.observations enable row level security;

create policy "El público ve observaciones no ocultas"
  on public.observations for select
  using (not is_hidden or public.is_moderator());

create policy "Usuarios autenticados crean sus propias observaciones"
  on public.observations for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario edita sus propias observaciones"
  on public.observations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Moderadores editan cualquier observación"
  on public.observations for update
  using (public.is_moderator());

create policy "Cada usuario elimina sus propias observaciones"
  on public.observations for delete
  using (auth.uid() = user_id or public.is_moderator());