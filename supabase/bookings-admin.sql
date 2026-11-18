-- Admin actions for service bookings (run after bookings.sql).
-- Run once in Supabase > SQL Editor. Safe to run again.

create or replace function public.admin_set_booking_status(p_booking_id text, p_status text, p_note text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  if p_status not in ('New', 'Contacted', 'Quoted', 'Scheduled', 'In progress', 'Completed', 'Cancelled') then
    raise exception 'Unknown status.';
  end if;
  update public.bookings set status = p_status, updated_at = now() where id = p_booking_id;
  if not found then raise exception 'Booking not found.'; end if;
  insert into public.booking_status_history (booking_id, status, note)
  values (p_booking_id, p_status, coalesce(trim(p_note), ''));
end;
$$;

create or replace function public.admin_set_booking_note(p_booking_id text, p_note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  update public.bookings set admin_note = coalesce(p_note, ''), updated_at = now() where id = p_booking_id;
end;
$$;

revoke all on function public.admin_set_booking_status(text, text, text) from public, anon;
revoke all on function public.admin_set_booking_note(text, text) from public, anon;
grant execute on function public.admin_set_booking_status(text, text, text) to authenticated;
grant execute on function public.admin_set_booking_note(text, text) to authenticated;
