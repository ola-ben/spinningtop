-- Spinning Top — let the admin see customers (name, email, phone, sign-up date).
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- Needs customers.sql to have been run first.
--
-- Customer emails live in Supabase's private auth.users table, which the website
-- can't read. This copies each customer's email into public.profiles (kept in sync
-- automatically), so the admin's Customers screen can show it.
-- Customers still only see their own profile, and can't change their email copy.
-- The team sees customers when their role has "customers.view" (Team & roles).

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select to authenticated
  using ((select public.admin_can('customers.view')));

alter table public.profiles add column if not exists email text not null default '';

-- Fill in emails for everyone who already has an account.
update public.profiles p
set email = coalesce(u.email, '')
from auth.users u
where u.id = p.id and p.email is distinct from coalesce(u.email, '');

-- New sign-ups: store name AND email.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), coalesce(new.email, ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

-- If someone's login email changes, update the copy.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();

-- Customers may edit only these columns of their own profile (not the email copy).
revoke update on public.profiles from authenticated;
grant update (full_name, phone, address, newsletter) on public.profiles to authenticated;
revoke insert on public.profiles from authenticated;
grant insert (id, full_name) on public.profiles to authenticated;

-- Newest customers first on the admin screen.
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- Customer list for the admin (newest first). Admin accounts are left out.
-- Returns nothing unless the caller's role has customers.view.
create or replace function public.admin_list_customers()
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  address text,
  newsletter text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.full_name, p.email, p.phone, p.address, p.newsletter, p.created_at, u.last_sign_in_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where (select public.admin_can('customers.view'))
    and not exists (select 1 from public.admins a where a.user_id = p.id)
  order by p.created_at desc;
$$;

revoke all on function public.admin_list_customers() from public, anon;
grant execute on function public.admin_list_customers() to authenticated;
