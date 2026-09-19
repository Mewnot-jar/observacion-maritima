insert into public.species (common_name, scientific_name, category)
values ('Pelícano peruano', 'Pelecanus thagus', 'ave')
returning id;

insert into public.observations (
  user_id, species_id, observed_at, location, location_name,
  individual_count, confidence_level
) values (
  '659516e3-8a0a-4bd9-83b6-34d5f5503550',
  '27b07a12-dafb-43a1-9474-7caa008c55a5',
  now(),
  ST_SetSRID(ST_MakePoint(-70.152, -20.220), 4326)::geography,
  'Playa Cavancha',
  '2-5',
  'segura'
);
