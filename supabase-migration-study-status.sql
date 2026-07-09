alter table public.studies
add column if not exists status text not null default 'active';

update public.studies
set status = 'active'
where status is null;
