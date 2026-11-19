-- Link guest bookings to customer accounts by email.
-- When someone creates an account, any bookings they sent earlier as a guest
-- (same email) become theirs. Also links existing accounts once, now.
-- Run once in Supabase > SQL Editor (after bookings.sql). Safe to run again.

create or replace function public.link_guest_bookings()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.email, '') <> '' then
    update public.bookings
       set user_id = new.id
     where user_id is null
       and lower(email) = lower(new.email);
  end if;
  return new;
end;
$$;

revoke all on function public.link_guest_bookings() from public, anon, authenticated;

drop trigger if exists on_auth_user_link_bookings on auth.users;
create trigger on_auth_user_link_bookings
  after insert or update of email on auth.users
  for each row execute function public.link_guest_bookings();

-- One-time: link bookings already sent by people who have an account.
update public.bookings b
   set user_id = u.id
  from auth.users u
 where b.user_id is null
   and lower(b.email) = lower(u.email);
