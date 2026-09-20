insert into storage.buckets (id, name, public)
values ('observation-photos', 'observation-photos', true)
on conflict (id) do nothing;