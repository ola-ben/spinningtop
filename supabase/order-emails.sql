-- Phase 5: order emails.
-- When an order is paid (Paystack) or its status changes in the admin, Supabase posts
-- the order to https://www.spinningtop.ng/api/order-mail.php, which emails the
-- customer from noreply@spinningtop.ng.
--
-- Run once in Supabase > SQL Editor. Safe to run again.
-- Needs payments.sql first (it adds the payment columns used below).
-- The secret below must match $config['secret'] in order-mail-config.php.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_order_email()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  payload jsonb;
begin
  -- Online (Paystack) orders: the first email goes out once payment is confirmed,
  -- not when the unpaid order is created. After that, send on every status change.
  if tg_op = 'INSERT' then
    if new.payment_method = 'paystack' and new.payment_status <> 'paid' then
      return null;
    end if;
  elsif new.status is not distinct from old.status
        and not (new.payment_method = 'paystack' and new.payment_status = 'paid' and old.payment_status is distinct from 'paid') then
    return null;
  end if;

  select jsonb_build_object(
    'id', o.id,
    'status', o.status,
    'customer_name', o.customer_name,
    'email', o.email,
    'phone', o.phone,
    'customer_note', o.customer_note,
    'fulfilment', o.fulfilment,
    'outlet', o.outlet,
    'delivery_address', o.delivery_address,
    'payment_status', o.payment_status,
    'payment_reference', o.payment_reference,
    'subtotal', o.subtotal,
    'delivery_courier', o.delivery_courier,
    'delivery_area', o.delivery_area,
    'delivery_fee', o.delivery_fee,
    'note', coalesce((select h.note from order_status_history h
                      where h.order_id = o.id order by h.created_at desc, h.id desc limit 1), ''),
    'items', coalesce((select jsonb_agg(jsonb_build_object(
                          'name', i.name, 'size', i.size, 'qty', i.qty, 'unit_price', i.unit_price)
                        order by i.id)
                       from order_items i where i.order_id = o.id), '[]'::jsonb)
  )
  into payload
  from orders o
  where o.id = new.id;

  if payload is null or coalesce(payload->>'email', '') = '' then
    return null;
  end if;

  perform net.http_post(
    url     := 'https://www.spinningtop.ng/api/order-mail.php',
    body    := payload,
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'X-Order-Mail-Secret', '1583453f919db1fc3138a32c130e9b344c10548891b894f3')
  );
  return null;
end;
$$;

revoke all on function public.notify_order_email() from public, anon, authenticated;

-- Deferred so it fires at commit, after place_order has added the items.
drop trigger if exists order_email_trigger on public.orders;
create constraint trigger order_email_trigger
  after insert or update of status, payment_status on public.orders
  deferrable initially deferred
  for each row execute function public.notify_order_email();
