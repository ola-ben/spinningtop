-- Spinning Top — product reviews.
-- Run in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
-- Needs admin-access.sql, team-roles.sql and orders.sql first.
--
-- How it works
--   • A customer can rate each product from their own DELIVERED orders, once
--     per order (My account → Pending Reviews).
--   • New reviews are "Pending". They show on the product page only after a team
--     member whose role has "reviews.view" publishes them (Admin → Reviews).
--   • The public only sees the rating, the title, the text, the reviewer's FIRST
--     name and the date. Order numbers, emails and user ids stay private.

create table if not exists public.product_reviews (
  id            bigserial primary key,
  order_id      text not null references public.orders (id) on delete cascade,
  product_id    text not null,
  user_id       uuid references auth.users (id) on delete set null,
  customer_name text not null default '',
  rating        smallint not null check (rating between 1 and 5),
  title         text not null default '' check (length(title) <= 120),
  body          text not null default '' check (length(body) <= 2000),
  status        text not null default 'Pending' check (status in ('Pending', 'Published', 'Hidden')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (order_id, product_id)
);

create index if not exists product_reviews_product_idx on public.product_reviews (product_id, status, created_at desc);
create index if not exists product_reviews_status_idx on public.product_reviews (status, created_at desc);

drop trigger if exists product_reviews_set_updated_at on public.product_reviews;
create trigger product_reviews_set_updated_at
  before update on public.product_reviews
  for each row execute function public.set_updated_at();

alter table public.product_reviews enable row level security;

drop policy if exists "Customers read own reviews" on public.product_reviews;
create policy "Customers read own reviews"
  on public.product_reviews for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Team reads reviews" on public.product_reviews;
create policy "Team reads reviews"
  on public.product_reviews for select to authenticated
  using ((select public.admin_can('reviews.view')));

drop policy if exists "Team moderates reviews" on public.product_reviews;
create policy "Team moderates reviews"
  on public.product_reviews for update to authenticated
  using ((select public.admin_can('reviews.view'))) with check ((select public.admin_can('reviews.view')));

drop policy if exists "Team deletes reviews" on public.product_reviews;
create policy "Team deletes reviews"
  on public.product_reviews for delete to authenticated
  using ((select public.admin_can('reviews.view')));

-- Customers never write to the table directly — only through submit_review().
revoke all on public.product_reviews from anon, authenticated;
grant select on public.product_reviews to authenticated;
grant update (status), delete on public.product_reviews to authenticated;

-- ───────────────────────── customer: write a review ─────────────────────────
create or replace function public.submit_review(
  p_order_id   text,
  p_product_id text,
  p_rating     integer,
  p_title      text default '',
  p_body       text default ''
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_order public.orders%rowtype;
  v_id    bigint;
begin
  if v_uid is null then raise exception 'Please sign in to leave a review.'; end if;
  if p_rating is null or p_rating not between 1 and 5 then raise exception 'Choose 1 to 5 stars.'; end if;

  select * into v_order from public.orders where id = p_order_id and user_id = v_uid;
  if not found then raise exception 'Order not found.'; end if;
  if v_order.status <> 'Delivered' then raise exception 'You can review products once your order is delivered.'; end if;
  if not exists (select 1 from public.order_items where order_id = p_order_id and product_id = p_product_id) then
    raise exception 'That product isn''t on this order.';
  end if;
  if exists (select 1 from public.product_reviews where order_id = p_order_id and product_id = p_product_id) then
    raise exception 'You''ve already reviewed this product for this order.';
  end if;

  insert into public.product_reviews (order_id, product_id, user_id, customer_name, rating, title, body)
  values (
    p_order_id, p_product_id, v_uid,
    left(trim(v_order.customer_name), 80),
    p_rating,
    left(trim(coalesce(p_title, '')), 120),
    left(trim(coalesce(p_body, '')), 2000)
  )
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.submit_review(text, text, integer, text, text) from public;
grant execute on function public.submit_review(text, text, integer, text, text) to authenticated;

-- ───────────────────────── public: published reviews of a product ─────────────────────────
create or replace function public.product_reviews_public(p_product_id text)
returns table (id bigint, rating smallint, title text, body text, reviewer text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.rating, r.title, r.body,
         coalesce(nullif(split_part(trim(r.customer_name), ' ', 1), ''), 'Customer') as reviewer,
         r.created_at
  from public.product_reviews r
  where r.product_id = p_product_id and r.status = 'Published'
  order by r.created_at desc
  limit 100;
$$;

revoke all on function public.product_reviews_public(text) from public;
grant execute on function public.product_reviews_public(text) to anon, authenticated;
