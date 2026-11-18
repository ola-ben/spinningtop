-- Spinning Top — Phase 3: orders + order tracking (no online payment yet).
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- Needs schema.sql, admin-access.sql and customers.sql first.
--
-- How it works
--   • A signed-in customer places an order with place_order(). Prices and stock
--     are taken from the products table INSIDE the database — what the browser
--     sends is only product ids and quantities, so nobody can change prices.
--   • Customers can read only their own orders. Admins can read all orders and
--     change status with admin_set_order_status() (every change is logged).
--   • Payment is "pay on pickup / delivery" for now; Paystack comes in Phase 4.

-- ───────────────────────── tables ─────────────────────────
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id                text primary key default ('ST-' || nextval('public.order_number_seq')),
  user_id           uuid references auth.users (id) on delete set null,
  customer_name     text not null default '',
  email             text not null default '',
  phone             text not null default '',
  fulfilment        text not null default 'pickup' check (fulfilment in ('pickup', 'delivery')),
  outlet            text not null default '',      -- pickup outlet, e.g. 'Oluyole, Ibadan'
  delivery_address  text not null default '',
  customer_note     text not null default '',
  status            text not null default 'Received'
                      check (status in ('Received', 'Processing', 'Ready for pickup', 'Out for delivery', 'Delivered', 'Cancelled')),
  payment_status    text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  payment_method    text not null default 'pay_on_collection',
  subtotal          integer not null default 0 check (subtotal >= 0),   -- naira
  channel           text not null default 'Website' check (channel in ('Website', 'WhatsApp', 'Walk-in', 'Phone')),
  admin_note        text not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status, created_at desc);

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id          bigserial primary key,
  order_id    text not null references public.orders (id) on delete cascade,
  product_id  text,                    -- kept even if the product is later deleted
  name        text not null,
  size        text not null default '',
  image_url   text,
  unit_price  integer not null check (unit_price >= 0),
  qty         integer not null check (qty between 1 and 99)
);

create index if not exists order_items_order_idx on public.order_items (order_id);

create table if not exists public.order_status_history (
  id          bigserial primary key,
  order_id    text not null references public.orders (id) on delete cascade,
  status      text not null,
  note        text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists order_history_order_idx on public.order_status_history (order_id, created_at);

-- ───────────────────────── row level security ─────────────────────────
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

drop policy if exists "Customers read their own orders" on public.orders;
create policy "Customers read their own orders"
  on public.orders for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Admins read all orders" on public.orders;
create policy "Admins read all orders"
  on public.orders for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins edit orders" on public.orders;
create policy "Admins edit orders"
  on public.orders for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Read items of visible orders" on public.order_items;
create policy "Read items of visible orders"
  on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id
                 and (o.user_id = (select auth.uid()) or (select public.is_admin()))));

drop policy if exists "Read history of visible orders" on public.order_status_history;
create policy "Read history of visible orders"
  on public.order_status_history for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id
                 and (o.user_id = (select auth.uid()) or (select public.is_admin()))));

-- Reads go through these policies; all writes go through the functions below.
grant select on public.orders, public.order_items, public.order_status_history to authenticated;
grant update (admin_note) on public.orders to authenticated;   -- admins only (policy above)

-- ───────────────────────── place an order (customers) ─────────────────────────
-- items: [{"product_id": "liquid-detergent-2l", "qty": 2}, ...]
-- Returns the new order id, e.g. 'ST-1001'.
drop function if exists public.place_order(jsonb, text, text, text, text, text, text);
create or replace function public.place_order(
  p_items            jsonb,
  p_fulfilment       text,
  p_outlet           text,
  p_delivery_address text,
  p_phone            text,
  p_customer_name    text,
  p_customer_note    text default ''
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid       uuid := (select auth.uid());
  new_id    text;
  line      jsonb;
  prod      public.products%rowtype;
  q         integer;
  total     integer := 0;
  n_lines   integer := 0;
begin
  if uid is null then
    raise exception 'Please sign in to place an order.';
  end if;
  if p_fulfilment not in ('pickup', 'delivery') then
    raise exception 'Choose pickup or delivery.';
  end if;
  if p_fulfilment = 'pickup' and coalesce(trim(p_outlet), '') = '' then
    raise exception 'Choose a pickup outlet.';
  end if;
  if p_fulfilment = 'delivery' and coalesce(trim(p_delivery_address), '') = '' then
    raise exception 'Enter a delivery address.';
  end if;
  if coalesce(trim(p_phone), '') = '' then
    raise exception 'Enter a phone number so we can reach you.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Too many different items in one order.';
  end if;

  insert into public.orders (user_id, customer_name, email, phone, fulfilment, outlet, delivery_address, customer_note)
  values (
    uid,
    left(coalesce(trim(p_customer_name), ''), 120),
    coalesce((select email from auth.users where id = uid), ''),
    left(trim(p_phone), 40),
    p_fulfilment,
    case when p_fulfilment = 'pickup' then left(trim(p_outlet), 120) else '' end,
    case when p_fulfilment = 'delivery' then left(trim(p_delivery_address), 500) else '' end,
    left(coalesce(trim(p_customer_note), ''), 1000)
  )
  returning id into new_id;

  for line in select * from jsonb_array_elements(p_items) loop
    q := coalesce((line ->> 'qty')::integer, 0);
    if q < 1 or q > 99 then
      raise exception 'Invalid quantity.';
    end if;
    select * into prod from public.products
      where id = (line ->> 'product_id') and status = 'published';
    if not found then
      raise exception 'A product in your cart is no longer available. Please refresh and try again.';
    end if;
    if not prod.in_stock then
      raise exception '% is out of stock. Remove it from your cart to continue.', prod.name;
    end if;
    insert into public.order_items (order_id, product_id, name, size, image_url, unit_price, qty)
    values (new_id, prod.id, prod.name, prod.size, prod.image_url, prod.price, q);
    total := total + prod.price * q;
    n_lines := n_lines + 1;
  end loop;

  update public.orders set subtotal = total where id = new_id;
  insert into public.order_status_history (order_id, status, note) values (new_id, 'Received', 'Order placed on the website');

  -- Save phone/address to the customer's profile if they hadn't added them yet.
  update public.profiles
     set phone = case when coalesce(phone, '') = '' then left(trim(p_phone), 40) else phone end,
         address = case when coalesce(address, '') = '' and p_fulfilment = 'delivery'
                        then left(trim(p_delivery_address), 500) else address end
   where id = uid;

  return new_id;
end;
$$;

revoke all on function public.place_order(jsonb, text, text, text, text, text, text) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text, text, text, text) to authenticated;

-- ───────────────────────── cancel (customers, before work starts) ─────────────────────────
drop function if exists public.cancel_my_order(text);
create or replace function public.cancel_my_order(p_order_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.orders set status = 'Cancelled'
   where id = p_order_id and user_id = (select auth.uid()) and status = 'Received';
  if not found then
    raise exception 'This order can no longer be cancelled online. Please call or WhatsApp us.';
  end if;
  insert into public.order_status_history (order_id, status, note)
  values (p_order_id, 'Cancelled', 'Cancelled by the customer');
end;
$$;

revoke all on function public.cancel_my_order(text) from public, anon;
grant execute on function public.cancel_my_order(text) to authenticated;

-- ───────────────────────── change status (admins) ─────────────────────────
drop function if exists public.admin_set_order_status(text, text, text);
create or replace function public.admin_set_order_status(p_order_id text, p_status text, p_note text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Not allowed';
  end if;
  if p_status not in ('Received', 'Processing', 'Ready for pickup', 'Out for delivery', 'Delivered', 'Cancelled') then
    raise exception 'Unknown status';
  end if;
  update public.orders set status = p_status where id = p_order_id;
  if not found then
    raise exception 'Order not found';
  end if;
  insert into public.order_status_history (order_id, status, note)
  values (p_order_id, p_status, left(coalesce(p_note, ''), 500));
end;
$$;

revoke all on function public.admin_set_order_status(text, text, text) from public, anon;
grant execute on function public.admin_set_order_status(text, text, text) to authenticated;

-- ───────────────────────── mark paid (admins, until Paystack) ─────────────────────────
drop function if exists public.admin_set_payment_status(text, text);
create or replace function public.admin_set_payment_status(p_order_id text, p_payment_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'Not allowed';
  end if;
  if p_payment_status not in ('unpaid', 'paid', 'refunded') then
    raise exception 'Unknown payment status';
  end if;
  update public.orders set payment_status = p_payment_status where id = p_order_id;
  if not found then
    raise exception 'Order not found';
  end if;
end;
$$;

revoke all on function public.admin_set_payment_status(text, text) from public, anon;
grant execute on function public.admin_set_payment_status(text, text) to authenticated;
