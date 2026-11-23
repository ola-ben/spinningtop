-- Spinning Top — Phase 1: customer accounts.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- Needs schema.sql and admin-access.sql to have been run first.
--
-- Customers sign up with Supabase Auth (email + password). Each customer gets a
-- row in public.profiles (name, phone, delivery address, newsletter choice).
-- Rules: a customer can see and change ONLY their own profile. Admins can read
-- all profiles (for the Customers screen later). Customers are never admins.

-- ───────────────────────── profiles ─────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  phone       text not null default '',
  address     text not null default '',          -- default delivery address
  newsletter  text not null default 'weekly'
                check (newsletter in ('daily', 'weekly', 'none')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop policy if exists "Customers can read their own profile" on public.profiles;
create policy "Customers can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Customers can create their own profile" on public.profiles;
create policy "Customers can create their own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "Customers can update their own profile" on public.profiles;
create policy "Customers can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- The team's read access ("customers.view") is set in customers-admin.sql.

grant select, insert, update on public.profiles to authenticated;

-- ───────────────────────── new sign-ups get a profile ─────────────────────────
-- Copies the name typed on the sign-up form (stored by Supabase as full_name).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles for anyone who signed up before this file was run.
insert into public.profiles (id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', '') from auth.users
on conflict (id) do nothing;

-- ───────────────────────── close account ─────────────────────────
-- Lets a signed-in customer delete their own account (profile goes with it).
-- Admin accounts can't be closed this way.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Not signed in';
  end if;
  if exists (select 1 from public.admins where user_id = (select auth.uid())) then
    raise exception 'Admin accounts can''t be closed here';
  end if;
  delete from auth.users where id = (select auth.uid());
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
