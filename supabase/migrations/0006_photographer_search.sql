-- 0006_photographer_search.sql
-- Fast photographer directory view and RPC functions for /photographers search
-- and side-by-side comparison (up to 3 photographers).
--
-- Features supported in SQL:
--   * Filters:
--       - city (case-insensitive match on profiles.city)
--       - event_type (matched against photographer_profiles.specializations)
--       - style (matched against photographer_profiles.styles)
--       - min_budget and max_budget (compared against starting_price = MIN(packages.price))
--       - role ('photographer' => is_videographer = false, 'videographer' => is_videographer = true)
--       - available_date (no booked/unavailable availability row and no active booking on that date)
--       - verified_only (default true => verification_status = 'verified')
--   * Sort:
--       - 'price_asc'  (lowest starting_price first)
--       - 'price_desc' (highest starting_price first)
--       - 'rating'     (highest average review rating first, then review_count)
--       - 'newest'     (most recently created photographer profile first)
--   * Pagination:
--       - default 12 per page, returns total_count via window function in one round-trip
--   * Comparison:
--       - get_photographers_for_compare(p_ids uuid[]) loads up to 3 photographers in selection order

-- ---------------------------------------------------------------------------
-- 1. Supporting indexes for fast search, aggregation and date availability
-- ---------------------------------------------------------------------------

create index if not exists profiles_city_lower_idx
  on public.profiles (lower(city));

create index if not exists photographer_profiles_is_videographer_idx
  on public.photographer_profiles (is_videographer);

create index if not exists photographer_profiles_status_created_idx
  on public.photographer_profiles (verification_status, created_at desc);

create index if not exists packages_photographer_price_idx
  on public.packages (photographer_id, price asc);

create index if not exists availability_photographer_date_status_idx
  on public.availability (photographer_id, date, status);

-- ---------------------------------------------------------------------------
-- 2. View: public.photographer_search_cards
--    Aggregates safe public profile fields, lowest package price, package list,
--    review stats, first 3 portfolio frames, and next available date.
--    Never exposes private columns (phone, CNIC paths, etc.).
-- ---------------------------------------------------------------------------

create or replace view public.photographer_search_cards
with (security_invoker = false, security_barrier = true)
as
select
  pp.profile_id as id,
  coalesce(nullif(trim(p.full_name), ''), 'Momnt photographer') as full_name,
  coalesce(nullif(trim(p.city), ''), 'Pakistan') as city,
  p.avatar_url,
  pp.bio,
  pp.specializations,
  pp.styles,
  pp.years_experience,
  pp.is_videographer,
  pp.verification_status,
  (pp.verification_status = 'verified') as is_verified,
  pkg_stats.starting_price,
  coalesce(pkg_stats.package_count, 0)::integer as package_count,
  coalesce(pkg_stats.packages_json, '[]'::jsonb) as packages,
  coalesce(rev_stats.rating, 0)::numeric(3,1) as rating,
  coalesce(rev_stats.review_count, 0)::integer as review_count,
  coalesce(port_preview.items_json, '[]'::jsonb) as portfolio_preview,
  next_free.next_free_date,
  pp.created_at
from public.photographer_profiles pp
join public.profiles p
  on p.id = pp.profile_id
left join lateral (
  select
    min(pk.price)::integer as starting_price,
    count(*)::integer as package_count,
    jsonb_agg(
      jsonb_build_object(
        'id', pk.id,
        'name', pk.name,
        'price', pk.price,
        'hours', pk.hours,
        'num_photographers', pk.num_photographers,
        'edited_photos', pk.edited_photos,
        'delivery_days', pk.delivery_days,
        'addons', pk.addons
      )
      order by pk.price asc, pk.created_at asc
    ) as packages_json
  from public.packages pk
  where pk.photographer_id = pp.profile_id
) pkg_stats on true
left join lateral (
  select
    round(avg(r.rating)::numeric, 1) as rating,
    count(*)::integer as review_count
  from public.reviews r
  where r.photographer_id = pp.profile_id
) rev_stats on true
left join lateral (
  select
    jsonb_agg(
      jsonb_build_object(
        'id', sub.id,
        'storage_path', sub.storage_path,
        'caption', sub.caption,
        'sort_order', sub.sort_order
      )
      order by sub.sort_order asc, sub.created_at asc
    ) as items_json
  from (
    select pi.id, pi.storage_path, pi.caption, pi.sort_order, pi.created_at
    from public.portfolio_images pi
    where pi.photographer_id = pp.profile_id
    order by pi.sort_order asc, pi.created_at asc
    limit 3
  ) sub
) port_preview on true
left join lateral (
  select d::date as next_free_date
  from generate_series(current_date, current_date + interval '60 days', interval '1 day') as d
  where not exists (
    select 1
    from public.availability a
    where a.photographer_id = pp.profile_id
      and a.date = d::date
      and a.status in ('booked', 'unavailable')
  )
  and not exists (
    select 1
    from public.bookings b
    where b.photographer_id = pp.profile_id
      and b.event_date = d::date
      and b.status in ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed')
  )
  order by d asc
  limit 1
) next_free on true
where p.role = 'photographer'
  and pp.verification_status in ('verified', 'under_review', 'pending');

revoke all on public.photographer_search_cards from public;
grant select on public.photographer_search_cards to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. RPC: public.search_photographers
--    Executes server-side filtering, sorting and pagination (default 12/page).
-- ---------------------------------------------------------------------------

create or replace function public.search_photographers(
  p_city            text    default null,
  p_event_type      text    default null,
  p_style           text    default null,
  p_min_budget      integer default null,
  p_max_budget      integer default null,
  p_role            text    default null,
  p_available_date  date    default null,
  p_verified_only   boolean default true,
  p_sort            text    default 'rating',
  p_page            integer default 1,
  p_page_size       integer default 12
)
returns table (
  id                  uuid,
  full_name           text,
  city                text,
  avatar_url          text,
  bio                 text,
  specializations     text[],
  styles              text[],
  years_experience    integer,
  is_videographer     boolean,
  verification_status public.verification_status,
  is_verified         boolean,
  starting_price      integer,
  package_count       integer,
  packages            jsonb,
  rating              numeric,
  review_count        integer,
  portfolio_preview   jsonb,
  next_free_date      date,
  created_at          timestamptz,
  total_count         bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id,
    c.full_name,
    c.city,
    c.avatar_url,
    c.bio,
    c.specializations,
    c.styles,
    c.years_experience,
    c.is_videographer,
    c.verification_status,
    c.is_verified,
    c.starting_price,
    c.package_count,
    c.packages,
    c.rating,
    c.review_count,
    c.portfolio_preview,
    c.next_free_date,
    c.created_at,
    count(*) over() as total_count
  from public.photographer_search_cards c
  where
    -- 1. Verified filter (default on)
    (not coalesce(p_verified_only, true) or c.verification_status = 'verified')
    -- 2. City filter
    and (
      p_city is null
      or trim(p_city) = ''
      or lower(trim(p_city)) = 'all'
      or lower(c.city) = lower(trim(p_city))
    )
    -- 3. Event type (specializations) filter
    and (
      p_event_type is null
      or trim(p_event_type) = ''
      or lower(trim(p_event_type)) = 'all'
      or exists (
        select 1
        from unnest(c.specializations) as s
        where lower(s) = lower(trim(p_event_type))
      )
    )
    -- 4. Style filter
    and (
      p_style is null
      or trim(p_style) = ''
      or lower(trim(p_style)) = 'all'
      or exists (
        select 1
        from unnest(c.styles) as st
        where lower(st) = lower(trim(p_style))
      )
    )
    -- 5. Min & max budget filter (based on lowest package price)
    and (
      p_min_budget is null
      or (c.starting_price is not null and c.starting_price >= p_min_budget)
    )
    and (
      p_max_budget is null
      or (c.starting_price is not null and c.starting_price <= p_max_budget)
    )
    -- 6. Photographer or videographer role filter
    and (
      p_role is null
      or trim(p_role) = ''
      or lower(trim(p_role)) = 'all'
      or (lower(trim(p_role)) = 'videographer' and c.is_videographer = true)
      or (lower(trim(p_role)) = 'photographer' and c.is_videographer = false)
    )
    -- 7. Available on a given date filter
    and (
      p_available_date is null
      or (
        not exists (
          select 1
          from public.availability a
          where a.photographer_id = c.id
            and a.date = p_available_date
            and a.status in ('booked', 'unavailable')
        )
        and not exists (
          select 1
          from public.bookings b
          where b.photographer_id = c.id
            and b.event_date = p_available_date
            and b.status in ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed')
        )
      )
    )
  order by
    case when p_sort = 'price_asc'  then c.starting_price end asc  nulls last,
    case when p_sort = 'price_desc' then c.starting_price end desc nulls last,
    case when p_sort = 'newest'     then c.created_at     end desc nulls last,
    case when p_sort not in ('price_asc', 'price_desc', 'newest') or p_sort is null then c.rating end desc nulls last,
    case when p_sort not in ('price_asc', 'price_desc', 'newest') or p_sort is null then c.review_count end desc nulls last,
    c.rating desc nulls last,
    c.starting_price asc nulls last,
    c.id asc
  limit greatest(1, least(coalesce(p_page_size, 12), 50))
  offset (greatest(1, coalesce(p_page, 1)) - 1) * greatest(1, least(coalesce(p_page_size, 12), 50));
$$;

revoke all on function public.search_photographers(text, text, text, integer, integer, text, date, boolean, text, integer, integer) from public;
grant execute on function public.search_photographers(text, text, text, integer, integer, text, date, boolean, text, integer, integer) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4. RPC: public.get_photographers_for_compare
--    Loads up to 3 photographers by ID for the comparison view, preserving the
--    caller's selection order.
-- ---------------------------------------------------------------------------

create or replace function public.get_photographers_for_compare(
  p_ids uuid[]
)
returns setof public.photographer_search_cards
language sql
stable
security definer
set search_path = ''
as $$
  select c.*
  from unnest(coalesce(p_ids[1:3], '{}'::uuid[])) with ordinality as u(id, ord)
  join public.photographer_search_cards c on c.id = u.id
  order by u.ord asc;
$$;

revoke all on function public.get_photographers_for_compare(uuid[]) from public;
grant execute on function public.get_photographers_for_compare(uuid[]) to anon, authenticated, service_role;

