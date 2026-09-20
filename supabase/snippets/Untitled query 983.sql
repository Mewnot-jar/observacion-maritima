update public.profiles
set role = 'moderator'
where id = (select id from auth.users where email = 'martinardiles.a@gmail.com');