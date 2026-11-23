-- Spinning Top — admin access for the static (no Node.js) site.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to run again.
--
-- The website talks to Supabase from the browser with the publishable key.
-- These rules decide what each visitor may do:
--   • everyone ............ read published products/services + site settings
--   • the team ............ what their role allows (Team & roles in the admin):
--                           products, services, photos, site settings, …
-- A team member is a Supabase Auth user listed in public.admins. Owners can do
-- everything; everyone else gets the permissions ticked on their role.
-- Customers who sign up on the website are NOT team members.

-- ───────────────────────── admins ─────────────────────────
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Roles the owner creates in the admin (Team & roles), each with ticked permissions.
create table if not exists public.admin_roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  permissions text[] not null default '{}',
  created_at  timestamptz not null default now()
);
create unique index if not exists admin_roles_name_idx on public.admin_roles (lower(name));
alter table public.admin_roles enable row level security;   -- read/changed only through functions

-- Each team member is an Owner (everything) or has one role.
alter table public.admins add column if not exists is_owner boolean not null default false;
alter table public.admins add column if not exists role_id uuid references public.admin_roles (id) on delete restrict;
-- Admins from before roles existed keep full access.
update public.admins set is_owner = true where role_id is null and not is_owner;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'admins_owner_or_role') then
    alter table public.admins add constraint admins_owner_or_role check (is_owner or role_id is not null);
  end if;
end $$;

-- Signed-in users may check whether THEY are an admin (nothing else).
drop policy if exists "Users can see their own admin row" on public.admins;
create policy "Users can see their own admin row"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Make admin@spinningtop.ng the Owner. Add workers later in the admin:
-- Team & roles → Add worker (see team-roles.sql).
insert into public.admins (user_id, email, is_owner)
select id, email, true from auth.users where email = 'admin@spinningtop.ng'
on conflict (user_id) do nothing;

-- True when the signed-in user is on the team (may open the admin at all).
-- SECURITY DEFINER so it can read public.admins regardless of the caller's own permissions.
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

-- True when the signed-in team member may do this (Owner, or ticked on their role).
-- Permission names are listed in team-roles.sql (e.g. 'products.edit').
create or replace function public.admin_can(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins a
    left join public.admin_roles r on r.id = a.role_id
    where a.user_id = (select auth.uid())
      and (a.is_owner or p_permission = any (r.permissions))
  );
$$;

revoke all on function public.admin_can(text) from public;
grant execute on function public.admin_can(text) to anon, authenticated;

-- ───────────────────────── products & services ─────────────────────────
-- The team also sees drafts; adding, editing and deleting need the matching permission.
drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
  on public.products for select to authenticated using ((select public.admin_can('products.view')));

drop policy if exists "Admins can add products" on public.products;
create policy "Admins can add products"
  on public.products for insert to authenticated with check ((select public.admin_can('products.edit')));

drop policy if exists "Admins can edit products" on public.products;
create policy "Admins can edit products"
  on public.products for update to authenticated
  using ((select public.admin_can('products.edit'))) with check ((select public.admin_can('products.edit')));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete to authenticated using ((select public.admin_can('products.delete')));

drop policy if exists "Admins can read all services" on public.services;
create policy "Admins can read all services"
  on public.services for select to authenticated using ((select public.admin_can('services.view')));

drop policy if exists "Admins can add services" on public.services;
create policy "Admins can add services"
  on public.services for insert to authenticated with check ((select public.admin_can('services.edit')));

drop policy if exists "Admins can edit services" on public.services;
create policy "Admins can edit services"
  on public.services for update to authenticated
  using ((select public.admin_can('services.edit'))) with check ((select public.admin_can('services.edit')));

drop policy if exists "Admins can delete services" on public.services;
create policy "Admins can delete services"
  on public.services for delete to authenticated using ((select public.admin_can('services.delete')));

grant select on public.admins to authenticated;
grant insert, update, delete on public.products, public.services to authenticated;

-- ───────────────────────── photos (bucket "catalogue") ─────────────────────────
-- Anyone who may edit products or services may manage their photos.
drop policy if exists "Admins can upload catalogue images" on storage.objects;
create policy "Admins can upload catalogue images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'catalogue' and ((select public.admin_can('products.edit')) or (select public.admin_can('services.edit'))));

drop policy if exists "Admins can update catalogue images" on storage.objects;
create policy "Admins can update catalogue images"
  on storage.objects for update to authenticated
  using (bucket_id = 'catalogue' and ((select public.admin_can('products.edit')) or (select public.admin_can('services.edit'))));

drop policy if exists "Admins can delete catalogue images" on storage.objects;
create policy "Admins can delete catalogue images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'catalogue' and ((select public.admin_can('products.edit')) or (select public.admin_can('services.edit'))));

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
  using ((select public.admin_can('settings.manage'))) with check ((select public.admin_can('settings.manage')));

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
