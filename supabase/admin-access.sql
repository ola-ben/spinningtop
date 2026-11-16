-- Spinning Top — admin access for the static (no Node.js) site.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to run again.
--
-- The website talks to Supabase from the browser with the publishable key.
-- These rules decide what each visitor may do:
--   • everyone ............ read published products/services + site settings
--   • admins only ......... add/edit/delete products & services, upload photos,
--                           change site settings
-- An "admin" is a Supabase Auth user listed in public.admins.
-- Customers who sign up later (order tracking) are NOT admins.

-- ───────────────────────── admins ─────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Signed-in users may check whether THEY are an admin (nothing else).
drop policy if exists "Users can see their own admin row" on public.admins;
create policy "Users can see their own admin row"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Make admin@spinningtop.ng an admin. To add another admin later:
-- create the user in Authentication → Users, then run this line with their email.
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'admin@spinningtop.ng'
on conflict (user_id) do nothing;

-- True when the signed-in user is an admin. SECURITY DEFINER so it can read
-- public.admins regardless of the caller's own permissions.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ───────────────────────── products & services ─────────────────────────
-- Admins also see drafts, and can write.
drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
  on public.products for select to authenticated using ((select public.is_admin()));

drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products"
  on public.products for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products"
  on public.products for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete to authenticated using ((select public.is_admin()));

drop policy if exists "Admins can read all services" on public.services;
create policy "Admins can read all services"
  on public.services for select to authenticated using ((select public.is_admin()));

drop policy if exists "Admins can add services" on public.services;
create policy "Admins can add services"
  on public.services for insert to authenticated with check ((select public.is_admin()));

drop policy if exists "Admins can edit services" on public.services;
create policy "Admins can edit services"
  on public.services for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Admins can delete services" on public.services;
create policy "Admins can delete services"
  on public.services for delete to authenticated using ((select public.is_admin()));

grant select on public.admins to authenticated;
grant insert, update, delete on public.products, public.services to authenticated;

-- ───────────────────────── photos (bucket "catalogue") ─────────────────────────
drop policy if exists "Admins can upload catalogue images" on storage.objects;
create policy "Admins can upload catalogue images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'catalogue' and (select public.is_admin()));

drop policy if exists "Admins can update catalogue images" on storage.objects;
create policy "Admins can update catalogue images"
  on storage.objects for update to authenticated
  using (bucket_id = 'catalogue' and (select public.is_admin()));

drop policy if exists "Admins can delete catalogue images" on storage.objects;
create policy "Admins can delete catalogue images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'catalogue' and (select public.is_admin()));

-- ───────────────────────── site settings (shop on/off) ─────────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Anyone can read site settings" on public.site_settings;
create policy "Anyone can read site settings"
  on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "Admins can change site settings" on public.site_settings;
create policy "Admins can change site settings"
  on public.site_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Shop starts ON (products visible on /shop), as on the current site.
insert into public.site_settings (key, value)
values ('shop', '{"showProducts": true}')
on conflict (key) do nothing;
