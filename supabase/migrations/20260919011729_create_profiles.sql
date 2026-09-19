create type public.user_role as enum ('user', 'moderator');

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    avatar_url text,
    role public.user_role not null default 'user',
    created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, display_name)
    values (new.id, new.raw_user_meta_data ->> 'display_name');
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer set search_path = public
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'moderator'
    );
$$;

alter table public.profiles enable row level security;

create policy "Los perfiles son visibles por todos"
    on public.profiles for select
    using (true);

create policy "Cada usuario edita su propio perfil"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);