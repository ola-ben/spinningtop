-- Run this once if you ran schema.sql before these lines were added to it.
-- Fixes "permission denied for table products / services".
-- Visitors can still only see published rows (Row Level Security in schema.sql).

grant usage on schema public to anon, authenticated, service_role;
grant select on public.products, public.services to anon, authenticated;
grant select, insert, update, delete on public.products, public.services to service_role;
