-- Spinning Top — Team & roles: the owner creates roles, ticks what each role
-- may do, and adds workers by email.
-- Run in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- Needs admin-access.sql first (it creates admin_roles and admin_can()).
--
-- How a worker gets in
--   1. The owner adds their email + a role on Team & roles (an invite).
--   2. The worker opens /admin/login → "First time or forgot password?",
--      enters that email, types the 6-digit code from their inbox and picks
--      a password. claim_admin_invite() then puts them on the team.
--   Removing a worker takes their access away at once.
--
-- Permissions a role can have (the ticks on the Team & roles screen):
--   orders.view      see product orders + service bookings
--   orders.update    change status and notes
--   orders.cancel    cancel orders / bookings
--   orders.payment   mark orders paid / refunded
--   customers.view   see the customer list
--   products.view / products.edit / products.delete
--   services.view / services.edit / services.delete
--   reviews.view, vouchers.view, messages.view, academy.view
--   dashboard.sales  see sales totals on the dashboard
--   settings.manage  shop on/off, delivery areas and site settings
-- Owners can do everything, and only owners manage the team.

-- ───────────────────────── invites ─────────────────────────
create table if not exists public.admin_invites (
  email       text primary key,                       -- lower-case
  role_id     uuid references public.admin_roles (id) on delete restrict,
  is_owner    boolean not null default false,
  invited_at  timestamptz not null default now(),
  constraint admin_invites_owner_or_role check (is_owner or role_id is not null)
);
alter table public.admin_invites enable row level security;   -- only through the functions below

-- ───────────────────────── helpers ─────────────────────────
create or replace function public.admin_is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()) and is_owner);
$$;

create or replace function public.admin_permission_list()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array[
    'orders.view', 'orders.update', 'orders.cancel', 'orders.payment',
    'customers.view',
    'products.view', 'products.edit', 'products.delete',
    'services.view', 'services.edit', 'services.delete',
    'reviews.view', 'vouchers.view', 'messages.view', 'academy.view',
    'dashboard.sales', 'settings.manage'
  ]::text[];
$$;

-- ───────────────────────── what can I do? (every team member) ─────────────────────────
-- { "is_owner": true/false, "role": "Front desk", "permissions": [...] } or null.
create or replace function public.admin_my_access()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
           'is_owner', a.is_owner,
           'role', case when a.is_owner then 'Owner' else r.name end,
           'permissions', to_jsonb(case when a.is_owner then public.admin_permission_list() else coalesce(r.permissions, '{}') end)
         )
  from public.admins a
  left join public.admin_roles r on r.id = a.role_id
  where a.user_id = (select auth.uid());
$$;

-- ───────────────────────── join the team (worker, after the email code) ─────────────────────────
-- Returns true when the signed-in user is (now) on the team.
create or replace function public.claim_admin_invite()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid     uuid := (select auth.uid());
  v_email text;
  inv     public.admin_invites%rowtype;
begin
  if uid is null then return false; end if;
  -- Only a confirmed email counts (the 6-digit code confirms it).
  select lower(email) into v_email from auth.users where id = uid and email_confirmed_at is not null;
  if v_email is not null then
    select * into inv from public.admin_invites where email = v_email;
    if found then
      insert into public.admins (user_id, email, is_owner, role_id)
      values (uid, v_email, inv.is_owner, case when inv.is_owner then null else inv.role_id end)
      on conflict (user_id) do update set is_owner = excluded.is_owner, role_id = excluded.role_id;
      delete from public.admin_invites where email = v_email;
    end if;
  end if;
  return exists (select 1 from public.admins where user_id = uid);
end;
$$;

-- ───────────────────────── team list (owners) ─────────────────────────
create or replace function public.admin_team()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.admin_is_owner() then raise exception 'Only the owner can manage the team.'; end if;
  return jsonb_build_object(
    'roles', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', r.id, 'name', r.name, 'permissions', to_jsonb(r.permissions),
               'members', (select count(*) from public.admins a where a.role_id = r.id)
                        + (select count(*) from public.admin_invites i where i.role_id = r.id))
             order by lower(r.name))
      from public.admin_roles r), '[]'::jsonb),
    'members', coalesce((
      select jsonb_agg(jsonb_build_object(
               'user_id', a.user_id, 'email', a.email, 'name', coalesce(p.full_name, ''),
               'is_owner', a.is_owner, 'role_id', a.role_id, 'role', case when a.is_owner then 'Owner' else r.name end,
               'added_at', a.created_at, 'last_sign_in_at', u.last_sign_in_at,
               'is_me', a.user_id = (select auth.uid()))
             order by a.is_owner desc, a.created_at)
      from public.admins a
      left join public.admin_roles r on r.id = a.role_id
      left join public.profiles p on p.id = a.user_id
      left join auth.users u on u.id = a.user_id), '[]'::jsonb),
    'invites', coalesce((
      select jsonb_agg(jsonb_build_object(
               'email', i.email, 'is_owner', i.is_owner, 'role_id', i.role_id,
               'role', case when i.is_owner then 'Owner' else r.name end, 'invited_at', i.invited_at)
             order by i.invited_at desc)
      from public.admin_invites i
      left join public.admin_roles r on r.id = i.role_id), '[]'::jsonb)
  );
end;
$$;

-- ───────────────────────── roles (owners) ─────────────────────────
-- Create (p_id null) or update a role. Returns its id.
create or replace function public.admin_save_role(p_id uuid, p_name text, p_permissions text[])
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name  text := trim(coalesce(p_name, ''));
  v_perms text[];
  v_id    uuid;
begin
  if not public.admin_is_owner() then raise exception 'Only the owner can manage roles.'; end if;
  if length(v_name) < 2 or length(v_name) > 40 then raise exception 'Give the role a name (2–40 characters).'; end if;
  if lower(v_name) = 'owner' then raise exception '"Owner" is built in. Choose another name.'; end if;
  if exists (select 1 from public.admin_roles where lower(name) = lower(v_name) and id is distinct from p_id) then
    raise exception 'There''s already a role called "%".', v_name;
  end if;

  -- Keep only real permissions; editing/cancelling something includes seeing it.
  select coalesce(array_agg(distinct x), '{}') into v_perms
    from unnest(coalesce(p_permissions, '{}')) x
   where x = any (public.admin_permission_list());
  if v_perms && array['orders.update', 'orders.cancel', 'orders.payment'] then v_perms := array_append(v_perms, 'orders.view'); end if;
  if v_perms && array['products.edit', 'products.delete'] then v_perms := array_append(v_perms, 'products.view'); end if;
  if v_perms && array['services.edit', 'services.delete'] then v_perms := array_append(v_perms, 'services.view'); end if;
  select array_agg(distinct x order by x) into v_perms from unnest(v_perms) x;

  if p_id is null then
    insert into public.admin_roles (name, permissions) values (v_name, coalesce(v_perms, '{}')) returning id into v_id;
  else
    update public.admin_roles set name = v_name, permissions = coalesce(v_perms, '{}') where id = p_id returning id into v_id;
    if v_id is null then raise exception 'Role not found.'; end if;
  end if;
  return v_id;
end;
$$;

create or replace function public.admin_delete_role(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.admin_is_owner() then raise exception 'Only the owner can manage roles.'; end if;
  if exists (select 1 from public.admins where role_id = p_id)
     or exists (select 1 from public.admin_invites where role_id = p_id) then
    raise exception 'Someone still has this role. Move them to another role first.';
  end if;
  delete from public.admin_roles where id = p_id;
end;
$$;

-- ───────────────────────── workers (owners) ─────────────────────────
-- Add a worker by email. They join when they first sign in with that email.
create or replace function public.admin_invite_member(p_email text, p_role_id uuid, p_owner boolean default false)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if not public.admin_is_owner() then raise exception 'Only the owner can add workers.'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Enter a valid email address.'; end if;
  if not coalesce(p_owner, false) and not exists (select 1 from public.admin_roles where id = p_role_id) then
    raise exception 'Choose a role.';
  end if;
  if exists (select 1 from public.admins where lower(email) = v_email) then
    raise exception 'This email is already on the team. Change their role in the list instead.';
  end if;
  insert into public.admin_invites (email, role_id, is_owner)
  values (v_email, case when coalesce(p_owner, false) then null else p_role_id end, coalesce(p_owner, false))
  on conflict (email) do update set role_id = excluded.role_id, is_owner = excluded.is_owner, invited_at = now();
end;
$$;

create or replace function public.admin_cancel_invite(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.admin_is_owner() then raise exception 'Only the owner can manage the team.'; end if;
  delete from public.admin_invites where email = lower(trim(coalesce(p_email, '')));
end;
$$;

-- Change a team member's role (or make them an Owner).
create or replace function public.admin_update_member(p_user_id uuid, p_role_id uuid, p_owner boolean default false)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.admin_is_owner() then raise exception 'Only the owner can manage the team.'; end if;
  if not coalesce(p_owner, false) then
    if not exists (select 1 from public.admin_roles where id = p_role_id) then raise exception 'Choose a role.'; end if;
    if exists (select 1 from public.admins where user_id = p_user_id and is_owner)
       and (select count(*) from public.admins where is_owner) <= 1 then
      raise exception 'There must always be at least one Owner.';
    end if;
  end if;
  update public.admins
     set is_owner = coalesce(p_owner, false),
         role_id = case when coalesce(p_owner, false) then null else p_role_id end
   where user_id = p_user_id;
  if not found then raise exception 'Team member not found.'; end if;
end;
$$;

-- Take away someone's admin access (their website account stays).
create or replace function public.admin_remove_member(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.admin_is_owner() then raise exception 'Only the owner can manage the team.'; end if;
  if p_user_id = (select auth.uid()) then raise exception 'You can''t remove yourself.'; end if;
  if exists (select 1 from public.admins where user_id = p_user_id and is_owner)
     and (select count(*) from public.admins where is_owner) <= 1 then
    raise exception 'There must always be at least one Owner.';
  end if;
  delete from public.admins where user_id = p_user_id;
end;
$$;

-- ───────────────────────── access ─────────────────────────
revoke all on function public.admin_is_owner() from public, anon;
revoke all on function public.admin_permission_list() from public, anon;
revoke all on function public.admin_my_access() from public, anon;
revoke all on function public.claim_admin_invite() from public, anon;
revoke all on function public.admin_team() from public, anon;
revoke all on function public.admin_save_role(uuid, text, text[]) from public, anon;
revoke all on function public.admin_delete_role(uuid) from public, anon;
revoke all on function public.admin_invite_member(text, uuid, boolean) from public, anon;
revoke all on function public.admin_cancel_invite(text) from public, anon;
revoke all on function public.admin_update_member(uuid, uuid, boolean) from public, anon;
revoke all on function public.admin_remove_member(uuid) from public, anon;

grant execute on function public.admin_is_owner() to authenticated;
grant execute on function public.admin_permission_list() to authenticated;
grant execute on function public.admin_my_access() to authenticated;
grant execute on function public.claim_admin_invite() to authenticated;
grant execute on function public.admin_team() to authenticated;
grant execute on function public.admin_save_role(uuid, text, text[]) to authenticated;
grant execute on function public.admin_delete_role(uuid) to authenticated;
grant execute on function public.admin_invite_member(text, uuid, boolean) to authenticated;
grant execute on function public.admin_cancel_invite(text) to authenticated;
grant execute on function public.admin_update_member(uuid, uuid, boolean) to authenticated;
grant execute on function public.admin_remove_member(uuid) to authenticated;
