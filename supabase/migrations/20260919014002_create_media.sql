create type public.media_type as enum ('image', 'video');

create table public.media (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  storage_path text not null, 
  media_type public.media_type not null default 'image',
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;

create policy "Media visible si la observación es visible"
  on public.media for select
  using (
    exists (
      select 1 from public.observations o
      where o.id = media.observation_id
        and (not o.is_hidden or public.is_moderator())
    )
  );

create policy "Solo el dueño de la observación sube su media"
  on public.media for insert
  with check (
    exists (
      select 1 from public.observations o
      where o.id = media.observation_id
        and o.user_id = auth.uid()
    )
  );