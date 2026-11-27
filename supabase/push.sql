-- Spinning Top — push notifications for the team (new bookings, paid orders).
-- Run in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- Needs admin-access.sql and team-roles.sql first.
--
-- How it works
--   • A team member taps "Enable notifications" in the admin; their browser
--     gives us a push address for that device, saved here.
--   • When a booking comes in or an order is paid, the order-mail.php mailer on
--     cPanel also sends a push to every saved device whose owner may see
--     orders & bookings (role permission "orders.view", or Owner).
--   The shared secret below must match $config['secret'] in order-mail-config.php.

create table if not exists public.push_subscriptions (
  id          bigserial primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  user_agent  text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;   -- only through the functions below

-- Save this device for the signed-in team member.
create or replace function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text, p_user_agent text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.admin_can('orders.view') then
    raise exception 'Your role doesn''t include orders and bookings, so there is nothing to notify you about.';
  end if;
  if coalesce(p_endpoint, '') !~ '^https://' or length(p_endpoint) > 1000 then raise exception 'Invalid push address.'; end if;
  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values ((select auth.uid()), p_endpoint, left(coalesce(p_p256dh, ''), 200), left(coalesce(p_auth, ''), 100), left(coalesce(p_user_agent, ''), 300))
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, user_agent = excluded.user_agent;
end;
$$;

-- Turn notifications off for this device.
create or replace function public.push_unsubscribe(p_endpoint text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.push_subscriptions where endpoint = p_endpoint and user_id = (select auth.uid());
$$;

-- Devices to notify (cPanel only): owners, and members whose role has orders.view.
create or replace function public.push_targets(p_secret text)
returns table (endpoint text, p256dh text, auth text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.payments_secret_ok(p_secret) then raise exception 'Forbidden'; end if;
  return query
    select s.endpoint, s.p256dh, s.auth
      from public.push_subscriptions s
      join public.admins a on a.user_id = s.user_id
      left join public.admin_roles r on r.id = a.role_id
     where a.is_owner or 'orders.view' = any (r.permissions);
end;
$$;

-- Remove a device the push service says no longer exists (cPanel only).
create or replace function public.push_forget(p_secret text, p_endpoint text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.payments_secret_ok(p_secret) then raise exception 'Forbidden'; end if;
  delete from public.push_subscriptions where endpoint = p_endpoint;
end;
$$;

revoke all on function public.push_subscribe(text, text, text, text) from public, anon;
revoke all on function public.push_unsubscribe(text) from public, anon;
revoke all on function public.push_targets(text) from public;
revoke all on function public.push_forget(text, text) from public;
grant execute on function public.push_subscribe(text, text, text, text) to authenticated;
grant execute on function public.push_unsubscribe(text) to authenticated;
-- cPanel calls these with the publishable key; the shared secret protects them.
grant execute on function public.push_targets(text) to anon, authenticated;
grant execute on function public.push_forget(text, text) to anon, authenticated;
