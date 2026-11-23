-- Spinning Top — delivery areas and prices (courier: Holt).
-- Run in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- Needs admin-access.sql and orders.sql first; run orders.sql AGAIN after this
-- file so place_order() charges the delivery fee.
--
-- How it works
--   • The admin adds areas + prices on Admin → Delivery (team members whose
--     role has "delivery.manage" — the "Delivery" tick on Team & roles).
--   • At checkout, a customer choosing delivery picks an area; the fee is
--     taken from this table INSIDE the database (place_order), never the browser.
--   • Kwik is shown as "coming soon" until their API is connected.

-- ───────────────────────── areas ─────────────────────────
create table if not exists public.delivery_zones (
  id          uuid primary key default gen_random_uuid(),
  courier     text not null default 'holt' check (courier in ('holt')),
  area        text not null check (length(trim(area)) between 2 and 80),
  price       integer not null check (price >= 0),          -- naira
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index if not exists delivery_zones_area_idx on public.delivery_zones (courier, lower(area));

drop trigger if exists delivery_zones_set_updated_at on public.delivery_zones;
create trigger delivery_zones_set_updated_at
  before update on public.delivery_zones
  for each row execute function public.set_updated_at();

alter table public.delivery_zones enable row level security;

drop policy if exists "Anyone reads active delivery areas" on public.delivery_zones;
create policy "Anyone reads active delivery areas"
  on public.delivery_zones for select to anon, authenticated
  using (active);

drop policy if exists "Team reads all delivery areas" on public.delivery_zones;
create policy "Team reads all delivery areas"
  on public.delivery_zones for select to authenticated
  using ((select public.admin_can('delivery.manage')));

drop policy if exists "Team manages delivery areas" on public.delivery_zones;
create policy "Team manages delivery areas"
  on public.delivery_zones for all to authenticated
  using ((select public.admin_can('delivery.manage'))) with check ((select public.admin_can('delivery.manage')));

grant select on public.delivery_zones to anon, authenticated;
grant insert, update, delete on public.delivery_zones to authenticated;

-- Starting areas (only added once, when there are no Holt areas yet).
insert into public.delivery_zones (courier, area, price, sort_order)
select 'holt', v.area, 500, v.ord
from (values ('Bodija', 1), ('Akobo', 2), ('Ring Road', 3), ('Challenge', 4), ('Mokola', 5)) as v(area, ord)
where not exists (select 1 from public.delivery_zones where courier = 'holt');

-- ───────────────────────── orders: delivery details ─────────────────────────
alter table public.orders add column if not exists delivery_courier text not null default '';
alter table public.orders add column if not exists delivery_area    text not null default '';
alter table public.orders add column if not exists delivery_fee     integer not null default 0;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_delivery_fee_check') then
    alter table public.orders add constraint orders_delivery_fee_check check (delivery_fee >= 0);
  end if;
end $$;
