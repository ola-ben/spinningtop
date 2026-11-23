-- Service bookings (requests for a quote). No sign-in needed to book.
-- Run once in Supabase > SQL Editor. Safe to run again.

create sequence if not exists public.booking_number_seq start 1001;

create table if not exists public.bookings (
  id             text primary key default ('BK-' || nextval('public.booking_number_seq')),
  user_id        uuid references auth.users (id) on delete set null,   -- set when signed in
  full_name      text not null,
  phone          text not null,
  email          text not null,
  area           text not null,
  services       text[] not null,       -- service ids
  service_names  text[] not null,       -- names at the time of booking
  logistics      text not null check (logistics in ('pickup_delivery', 'drop_off', 'either')),
  outlet         text not null default '',        -- drop-off outlet, e.g. 'Oluyole, Ibadan'
  notes          text not null default '',
  photos         text[] not null default '{}',   -- paths in the booking-photos bucket
  status         text not null default 'New'
                   check (status in ('New', 'Contacted', 'Quoted', 'Scheduled', 'In progress', 'Completed', 'Cancelled')),
  admin_note     text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Added later: which outlet the customer will drop off at.
alter table public.bookings add column if not exists outlet text not null default '';

create index if not exists bookings_created_idx on public.bookings (created_at desc);
create index if not exists bookings_user_idx on public.bookings (user_id);
create index if not exists bookings_email_idx on public.bookings (lower(email), created_at desc);

create table if not exists public.booking_status_history (
  id          bigserial primary key,
  booking_id  text not null references public.bookings (id) on delete cascade,
  status      text not null,
  note        text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists booking_history_idx on public.booking_status_history (booking_id, created_at);

-- Row Level Security: customers see their own bookings; the team sees all
-- when their role has orders.view (Team & roles).
-- Bookings are only created through create_booking() below.
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;

drop policy if exists "bookings: own or admin read" on public.bookings;
create policy "bookings: own or admin read" on public.bookings
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.admin_can('orders.view')));

drop policy if exists "booking history: own or admin read" on public.booking_status_history;
create policy "booking history: own or admin read" on public.booking_status_history
  for select to authenticated
  using (exists (select 1 from public.bookings b
                 where b.id = booking_id and (b.user_id = (select auth.uid()) or (select public.admin_can('orders.view')))));

grant select on public.bookings, public.booking_status_history to authenticated;

-- Submit a booking request. Works for visitors and signed-in customers.
drop function if exists public.create_booking(text, text, text, text, text[], text, text, text[]);
create or replace function public.create_booking(
  p_full_name text,
  p_phone     text,
  p_email     text,
  p_area      text,
  p_services  text[],
  p_logistics text,
  p_notes     text default '',
  p_photos    text[] default '{}',
  p_outlet    text default ''
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_ids   text[];
  v_names text[];
  new_id  text;
begin
  if length(trim(coalesce(p_full_name, ''))) < 2 then raise exception 'Enter your full name.'; end if;
  -- Nigerian mobile numbers only (same rule as the booking form).
  if regexp_replace(coalesce(p_phone, ''), '[\s-]', '', 'g') !~ '^(\+?234|0)[789][01][0-9]{8}$' then
    raise exception 'Enter a valid Nigerian phone number, e.g. 0803 123 4567.';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Enter a valid email address.'; end if;
  if length(trim(coalesce(p_area, ''))) < 2 then raise exception 'Enter your location or area.'; end if;
  if p_logistics not in ('pickup_delivery', 'drop_off', 'either') then raise exception 'Choose a pickup or drop-off option.'; end if;
  -- Drop-off: which outlet (same names as the website's Visit us section).
  if p_logistics = 'drop_off' and coalesce(p_outlet, '') not in ('Oluyole, Ibadan', 'Dominion University') then
    raise exception 'Choose the outlet you will drop off at.';
  end if;
  if length(coalesce(p_notes, '')) > 2000 then raise exception 'Notes are too long (2,000 characters max).'; end if;
  if coalesce(array_length(p_photos, 1), 0) > 4 then raise exception 'Upload up to 4 photos.'; end if;
  if exists (select 1 from unnest(coalesce(p_photos, '{}')) p where p !~ '^pending/[0-9a-f-]{36}/[A-Za-z0-9._-]{1,120}$') then
    raise exception 'Photo upload failed. Please try again.';
  end if;

  -- Only real services, in the order they were picked.
  select array_agg(s.id order by x.ord), array_agg(s.name order by x.ord)
    into v_ids, v_names
    from unnest(p_services) with ordinality as x(id, ord)
    join public.services s on s.id = x.id;
  if coalesce(array_length(v_ids, 1), 0) = 0 then raise exception 'Choose at least one service.'; end if;

  -- Light spam guard: max 5 requests per email per hour.
  if (select count(*) from public.bookings
      where lower(email) = v_email and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many requests. Please try again later or call us.';
  end if;

  insert into public.bookings (user_id, full_name, phone, email, area, services, service_names, logistics, outlet, notes, photos)
  values ((select auth.uid()), trim(p_full_name), trim(p_phone), v_email, trim(p_area), v_ids, v_names,
          p_logistics, case when p_logistics = 'drop_off' then p_outlet else '' end,
          trim(coalesce(p_notes, '')), coalesce(p_photos, '{}'))
  returning id into new_id;

  insert into public.booking_status_history (booking_id, status, note)
  values (new_id, 'New', 'Booking request sent from the website');

  return new_id;
end;
$$;

revoke all on function public.create_booking(text, text, text, text, text[], text, text, text[], text) from public;
grant execute on function public.create_booking(text, text, text, text, text[], text, text, text[], text) to anon, authenticated;

-- Private bucket for booking photos: anyone may upload (images, 10 MB max),
-- only the team (orders.view) may view them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('booking-photos', 'booking-photos', false, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do update
  set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "booking photos: anyone uploads" on storage.objects;
create policy "booking photos: anyone uploads" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'booking-photos' and (storage.foldername(name))[1] = 'pending');

drop policy if exists "booking photos: admin reads" on storage.objects;
create policy "booking photos: admin reads" on storage.objects
  for select to authenticated
  using (bucket_id = 'booking-photos' and (select public.admin_can('orders.view')));
