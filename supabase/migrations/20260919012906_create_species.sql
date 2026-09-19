create type public.species_category as enum(
    'ave', 'mamifero_marino', 'pez', 'invertebrado', 'alga_flora', 'otro'
);

create table public.species (
    id uuid primary key default gen_random_uuid(),
    common_name text not null,
    scientific_name text,
    category public.species_category not null,
    description text,
    reference_image_url text,
    created_at timestamptz not null default now()
);

alter table public.species enable row level security;

create policy "El catalogo de especies es publico"
    on public.species for select 
    using (true);

create policy "Solo moderadores administran el catalogo"
    on public.species for all
    using (public.is_moderator())
    with check (public.is_moderator());

