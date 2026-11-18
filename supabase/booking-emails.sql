-- Phase E: booking emails.
-- When a booking is sent, or its status changes in the admin, Supabase posts
-- it to https://www.spinningtop.ng/api/order-mail.php (same mailer as orders),
-- which emails the customer and, for new bookings, admin@spinningtop.ng.
--
-- Run once in Supabase > SQL Editor (after bookings.sql). Safe to run again.
-- The secret must match $config['secret'] in order-mail-config.php.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_booking_email()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  payload jsonb;
begin
  if tg_op = 'UPDATE' and new.status is not distinct from old.status then
    return null;
  end if;

  select jsonb_build_object(
    'type', 'booking',
    'id', b.id,
    'status', b.status,
    'customer_name', b.full_name,
    'email', b.email,
    'phone', b.phone,
    'area', b.area,
    'services', to_jsonb(b.service_names),
    'logistics', b.logistics,
    'customer_note', b.notes,
    'photo_count', coalesce(array_length(b.photos, 1), 0),
    'note', coalesce((select h.note from booking_status_history h
                      where h.booking_id = b.id order by h.created_at desc, h.id desc limit 1), '')
  )
  into payload
  from bookings b
  where b.id = new.id;

  if payload is null then
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

revoke all on function public.notify_booking_email() from public, anon, authenticated;

drop trigger if exists booking_email_trigger on public.bookings;
create constraint trigger booking_email_trigger
  after insert or update of status on public.bookings
  deferrable initially deferred
  for each row execute function public.notify_booking_email();
