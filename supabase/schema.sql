-- Spinning Top — Supabase schema for products (/shop) and services (/services).
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Then run seed.sql to load the current catalogue.
--
-- Security model:
--   • Visitors (anon/publishable key) can only READ published rows.
--   • Adding/editing/deleting is done by the site's server (cPanel Node.js app)
--     with the SECRET / service_role key, which bypasses RLS.
--     Never put that key in browser code.

-- ───────────────────────── helpers ─────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ───────────────────────── products ─────────────────────────
create table if not exists public.products (
  id               text primary key,               -- slug used in /shop/[id], e.g. 'liquid-detergent-2l'
  name             text        not null,
  category         text        not null,           -- e.g. 'Detergents', 'Fabric care'
  size             text        not null default '',-- e.g. '2 litres', 'Pack of 5'
  description      text        not null default '',
  usage            text        not null default '',
  caution          text,                            -- safety / storage note (optional)
  price            integer     not null check (price >= 0),           -- naira
  compare_at_price integer     check (compare_at_price is null or compare_at_price >= 0),
  in_stock         boolean     not null default true,
  status           text        not null default 'published'
                     check (status in ('draft', 'published')),
  image_url        text,                            -- /images/... or a Supabase Storage public URL
  image_credit     text,
  image_position   text,                            -- CSS object-position, e.g. 'center 30%'
  sort_order       integer     not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint products_id_slug check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists products_status_sort_idx on public.products (status, sort_order);
create index if not exists products_category_idx    on public.products (category);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ───────────────────────── services ─────────────────────────
create table if not exists public.services (
  id             text primary key,                  -- slug used in /services/[id], e.g. 'laundry'
  icon           text        not null default 'laundry', -- ServiceIcon name: laundry, cleaning, tailor, shoe, upholstery, janitorial, pest …
  name           text        not null,
  category       text        not null check (category in ('Garment care', 'Home care')),
  summary        text        not null default '',
  includes       text[]      not null default '{}', -- bullet list, e.g. {'Sorting','Washing'}
  note           text        not null default '',   -- "Good to know"
  status         text        not null default 'published'
                   check (status in ('draft', 'published')),
  image_url      text,
  image_credit   text,
  image_position text,
  sort_order     integer     not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint services_id_slug check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists services_status_sort_idx on public.services (status, sort_order);

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ───────────────────────── row level security ─────────────────────────
alter table public.products enable row level security;
alter table public.services enable row level security;

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
  on public.products for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Public can read published services" on public.services;
create policy "Public can read published services"
  on public.services for select
  to anon, authenticated
  using (status = 'published');

-- No insert/update/delete policies on purpose: only the service_role key
-- (used server-side by the admin) can write.

-- Table permissions. Newer Supabase projects don't grant these automatically,
-- which shows up as "permission denied for table products".
grant usage on schema public to anon, authenticated, service_role;
grant select on public.products, public.services to anon, authenticated;
grant select, insert, update, delete on public.products, public.services to service_role;

-- ───────────────────────── image storage ─────────────────────────
-- Public bucket for product & service photos (max 5 MB, images only).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalogue', 'catalogue', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can view images in the bucket; uploads go through the server
-- with the service_role key, so no insert policy is needed.
drop policy if exists "Public can view catalogue images" on storage.objects;
create policy "Public can view catalogue images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'catalogue');
