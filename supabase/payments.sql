-- Spinning Top — online payments with Paystack.
-- Run in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- Needs orders.sql and delivery.sql first. Run order-emails.sql again afterwards
-- so emails go out when an order is PAID (not when it's first placed).
--
-- How it works
--   1. Checkout places the order (unpaid) and sends the customer to Paystack.
--      The amount comes from this database, never from the browser.
--   2. public/api/paystack.php (cPanel) checks the payment with Paystack using
--      the secret key, then calls payment_confirm() below. Paystack's webhook
--      (public/api/paystack-webhook.php) does the same as a back-up.
--   3. Unpaid online orders are cancelled automatically after 1 hour (pg_cron).
--      A payment that still arrives later re-opens the order.
--   The secret below must match $config['secret'] in order-mail-config.php
--   (the same shared secret the order emails use).

-- ───────────────────────── order columns ─────────────────────────
alter table public.orders add column if not exists payment_reference text not null default '';
alter table public.orders add column if not exists paid_at           timestamptz;
alter table public.orders add column if not exists paid_amount       integer;        -- naira, as confirmed by Paystack
alter table public.orders add column if not exists auto_cancelled_at timestamptz;    -- set when cancelled for not paying in time

-- New website orders are paid online with Paystack.
alter table public.orders alter column payment_method set default 'paystack';

-- ───────────────────────── shared secret check ─────────────────────────
create or replace function public.payments_secret_ok(p_secret text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(p_secret, '') = '1583453f919db1fc3138a32c130e9b344c10548891b894f3';
$$;
revoke all on function public.payments_secret_ok(text) from public, anon, authenticated;

-- ───────────────────────── order details for starting a payment (cPanel only) ─────────────────────────
create or replace function public.payment_order_details(p_secret text, p_order_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  o public.orders%rowtype;
begin
  if not public.payments_secret_ok(p_secret) then raise exception 'Forbidden'; end if;
  select * into o from public.orders where id = p_order_id;
  if not found then return null; end if;
  return jsonb_build_object(
    'id', o.id,
    'email', o.email,
    'customer_name', o.customer_name,
    'phone', o.phone,
    'status', o.status,
    'payment_status', o.payment_status,
    'total', o.subtotal + o.delivery_fee
  );
end;
$$;

-- ───────────────────────── confirm a payment (cPanel only) ─────────────────────────
-- p_amount_kobo is the amount Paystack says was paid. Returns { ok, message, ... }.
create or replace function public.payment_confirm(p_secret text, p_order_id text, p_reference text, p_amount_kobo bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  o        public.orders%rowtype;
  v_total  integer;
  reopened boolean := false;
begin
  if not public.payments_secret_ok(p_secret) then raise exception 'Forbidden'; end if;

  select * into o from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'message', 'Order not found');
  end if;
  if o.payment_status = 'paid' then
    return jsonb_build_object('ok', true, 'already', true, 'status', o.status);
  end if;

  v_total := o.subtotal + o.delivery_fee;
  if coalesce(p_amount_kobo, 0) < v_total::bigint * 100 then
    insert into public.order_status_history (order_id, status, note)
    values (o.id, o.status, 'Payment amount did not match the order total (reference ' || left(coalesce(p_reference, ''), 80) || '). Please check Paystack.');
    return jsonb_build_object('ok', false, 'message', 'Amount does not match the order total');
  end if;

  -- Cancelled only because payment was late → re-open it.
  reopened := o.status = 'Cancelled' and o.auto_cancelled_at is not null;

  update public.orders
     set payment_status    = 'paid',
         paid_at           = now(),
         paid_amount       = (p_amount_kobo / 100)::integer,
         payment_reference = left(coalesce(p_reference, ''), 120),
         status            = case when reopened then 'Received' else status end,
         auto_cancelled_at = case when reopened then null else auto_cancelled_at end
   where id = o.id;

  insert into public.order_status_history (order_id, status, note)
  values (o.id, case when reopened then 'Received' else o.status end,
          case when reopened then 'Payment received online. Order re-opened.' else 'Payment received online' end);

  return jsonb_build_object('ok', true, 'status', case when reopened then 'Received' else o.status end, 'reopened', reopened);
end;
$$;

revoke all on function public.payment_order_details(text, text) from public;
revoke all on function public.payment_confirm(text, text, text, bigint) from public;
-- cPanel calls these with the publishable key (role anon); the shared secret protects them.
grant execute on function public.payment_order_details(text, text) to anon, authenticated;
grant execute on function public.payment_confirm(text, text, text, bigint) to anon, authenticated;

-- ───────────────────────── cancel unpaid orders after 1 hour ─────────────────────────
create or replace function public.cancel_unpaid_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  n integer := 0;
begin
  for r in
    select id from public.orders
     where payment_method = 'paystack'
       and payment_status = 'unpaid'
       and status = 'Received'
       and created_at < now() - interval '1 hour'
     for update skip locked
  loop
    update public.orders set status = 'Cancelled', auto_cancelled_at = now() where id = r.id;
    insert into public.order_status_history (order_id, status, note)
    values (r.id, 'Cancelled', 'Cancelled automatically because payment wasn''t completed within 1 hour.');
    n := n + 1;
  end loop;
  return n;
end;
$$;
revoke all on function public.cancel_unpaid_orders() from public, anon, authenticated;

-- Run it every 10 minutes (Supabase's built-in scheduler).
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'cancel-unpaid-orders';
select cron.schedule('cancel-unpaid-orders', '*/10 * * * *', 'select public.cancel_unpaid_orders()');
