-- 0001_core_schema.sql
-- Momnt core schema (FYP-I): accounts, photographer profiles, portfolio,
-- packages, availability, gigs and bids, bookings, verification, reviews,
-- notifications.
--
-- Conventions
--   * uuid primary keys, created_at and updated_at on every table.
--   * Money is stored as whole PKR in integer columns.
--   * A photographer is identified by their profiles.id everywhere
--     (photographer_profiles.profile_id), so "photographer_id = auth.uid()"
--     works directly in RLS policies.
--   * RLS is enabled on every table here. With no policies yet, every table
--     is deny-all for anon and authenticated. Explicit policies come in the
--     next migration.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.user_role as enum (
  'client', 'agency', 'photographer', 'vendor', 'admin'
);

create type public.verification_status as enum (
  'pending', 'under_review', 'verified', 'rejected'
);

create type public.booking_status as enum (
  'requested', 'accepted', 'deposit_paid', 'shoot_done',
  'delivered', 'completed', 'rejected', 'cancelled'
);

create type public.gig_status as enum (
  'open', 'closed', 'awarded', 'expired'
);

create type public.bid_status as enum (
  'submitted', 'shortlisted', 'awarded', 'rejected'
);

create type public.availability_status as enum (
  'available', 'booked', 'unavailable'
);

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  role          public.user_role not null default 'client',
  full_name     text,
  phone         text,
  city          text,
  avatar_url    text,
  business_name text,  -- agency accounts only
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_city_idx on public.profiles (city);

-- ---------------------------------------------------------------------------
-- photographer_profiles (1:1 with profiles, role = photographer)
-- ---------------------------------------------------------------------------

create table public.photographer_profiles (
  profile_id          uuid primary key references public.profiles (id) on delete cascade,
  bio                 text,
  specializations     text[] not null default '{}',
  styles              text[] not null default '{}',
  social_links        jsonb  not null default '{}'::jsonb,
  years_experience    integer check (years_experience is null or years_experience between 0 and 80),
  is_videographer     boolean not null default false,
  verification_status public.verification_status not null default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index photographer_profiles_verification_status_idx
  on public.photographer_profiles (verification_status);
-- Event type and style filters on /photographers use array containment.
create index photographer_profiles_specializations_idx
  on public.photographer_profiles using gin (specializations);
create index photographer_profiles_styles_idx
  on public.photographer_profiles using gin (styles);

-- ---------------------------------------------------------------------------
-- portfolio_images
-- ---------------------------------------------------------------------------

create table public.portfolio_images (
  id              uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.photographer_profiles (profile_id) on delete cascade,
  storage_path    text not null,
  caption         text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index portfolio_images_photographer_id_idx
  on public.portfolio_images (photographer_id, sort_order);

-- ---------------------------------------------------------------------------
-- packages
-- ---------------------------------------------------------------------------

create table public.packages (
  id                uuid primary key default gen_random_uuid(),
  photographer_id   uuid not null references public.photographer_profiles (profile_id) on delete cascade,
  name              text not null,
  price             integer not null check (price >= 0),           -- PKR
  hours             integer not null check (hours > 0),
  num_photographers integer not null default 1 check (num_photographers >= 1),
  edited_photos     integer not null default 0 check (edited_photos >= 0),
  delivery_days     integer not null check (delivery_days > 0),
  addons            jsonb   not null default '[]'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index packages_photographer_id_idx on public.packages (photographer_id);
create index packages_price_idx on public.packages (price);

-- ---------------------------------------------------------------------------
-- availability (one row per photographer per day)
-- ---------------------------------------------------------------------------

create table public.availability (
  id              uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.photographer_profiles (profile_id) on delete cascade,
  date            date not null,
  status          public.availability_status not null default 'available',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (photographer_id, date)
);

create index availability_date_status_idx on public.availability (date, status);

-- ---------------------------------------------------------------------------
-- gigs (client posts a job, photographers bid)
-- ---------------------------------------------------------------------------

create table public.gigs (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.profiles (id) on delete restrict,
  title        text not null,
  event_type   text not null,
  event_date   date not null,
  city         text not null,
  hours        integer check (hours is null or hours > 0),
  budget_min   integer check (budget_min is null or budget_min >= 0),  -- PKR
  budget_max   integer check (budget_max is null or budget_max >= 0),  -- PKR
  description  text,
  bid_deadline timestamptz not null,
  status       public.gig_status not null default 'open',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint gigs_budget_range_chk
    check (budget_min is null or budget_max is null or budget_min <= budget_max)
);

create index gigs_client_id_idx  on public.gigs (client_id);
create index gigs_city_idx       on public.gigs (city);
create index gigs_event_type_idx on public.gigs (event_type);
create index gigs_event_date_idx on public.gigs (event_date);
create index gigs_status_idx     on public.gigs (status, bid_deadline);

-- ---------------------------------------------------------------------------
-- bids (one per photographer per gig)
-- ---------------------------------------------------------------------------

create table public.bids (
  id              uuid primary key default gen_random_uuid(),
  gig_id          uuid not null references public.gigs (id) on delete cascade,
  photographer_id uuid not null references public.photographer_profiles (profile_id) on delete cascade,
  price           integer not null check (price >= 0),  -- PKR
  message         text,
  package_id      uuid references public.packages (id) on delete set null,
  status          public.bid_status not null default 'submitted',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint bids_gig_photographer_key unique (gig_id, photographer_id)
);

create index bids_photographer_id_idx on public.bids (photographer_id);
create index bids_status_idx          on public.bids (status);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------

create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.profiles (id) on delete restrict,
  photographer_id uuid not null references public.photographer_profiles (profile_id) on delete restrict,
  package_id      uuid references public.packages (id) on delete set null,
  event_type      text not null,
  event_date      date not null,
  start_time      time,
  location        text not null,
  duration_hours  integer check (duration_hours is null or duration_hours > 0),
  guests          integer check (guests is null or guests >= 1),
  budget          integer check (budget is null or budget >= 0),  -- PKR
  requirements    text,
  status          public.booking_status not null default 'requested',
  source_gig_id   uuid references public.gigs (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint bookings_not_self_chk check (client_id <> photographer_id)
);

create index bookings_client_id_idx       on public.bookings (client_id);
create index bookings_photographer_id_idx on public.bookings (photographer_id, event_date);
create index bookings_event_date_idx      on public.bookings (event_date);
create index bookings_status_idx          on public.bookings (status);
create index bookings_source_gig_id_idx   on public.bookings (source_gig_id);

-- ---------------------------------------------------------------------------
-- verification_requests (CNIC paths point to the private storage bucket)
-- ---------------------------------------------------------------------------

create table public.verification_requests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  role_requested  public.user_role not null
                    check (role_requested in ('photographer', 'vendor')),
  cnic_front_path text,
  cnic_back_path  text,
  status          public.verification_status not null default 'pending',
  admin_note      text,
  reviewed_by     uuid references public.profiles (id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index verification_requests_user_id_idx on public.verification_requests (user_id);
create index verification_requests_status_idx  on public.verification_requests (status, created_at);
-- At most one open request per user.
create unique index verification_requests_one_open_per_user
  on public.verification_requests (user_id)
  where status in ('pending', 'under_review');

-- ---------------------------------------------------------------------------
-- reviews (table only for now, one per booking)
-- ---------------------------------------------------------------------------

create table public.reviews (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null unique references public.bookings (id) on delete cascade,
  reviewer_id     uuid not null references public.profiles (id) on delete cascade,
  photographer_id uuid not null references public.photographer_profiles (profile_id) on delete cascade,
  rating          smallint not null check (rating between 1 and 5),
  comment         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index reviews_photographer_id_idx on public.reviews (photographer_id);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null,
  payload    jsonb not null default '{}'::jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx  on public.notifications (user_id) where read_at is null;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.photographer_profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.portfolio_images
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.packages
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.availability
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.gigs
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.bids
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.verification_requests
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.notifications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- New auth user -> profiles row
-- Role comes from raw_user_meta_data.role. Only the four self-service roles
-- are accepted. 'admin' (or anything unknown or missing) becomes 'client'.
-- Admin accounts are promoted manually with the service role.
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text := lower(trim(coalesce(new.raw_user_meta_data ->> 'role', '')));
  safe_role      public.user_role;
begin
  if requested_role in ('client', 'agency', 'photographer', 'vendor') then
    safe_role := requested_role::public.user_role;
  else
    safe_role := 'client';
  end if;

  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    safe_role,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), '')
  );

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security: on for every table (deny-all until policies are added)
-- ---------------------------------------------------------------------------

alter table public.profiles              enable row level security;
alter table public.photographer_profiles enable row level security;
alter table public.portfolio_images      enable row level security;
alter table public.packages              enable row level security;
alter table public.availability          enable row level security;
alter table public.gigs                  enable row level security;
alter table public.bids                  enable row level security;
alter table public.bookings              enable row level security;
alter table public.verification_requests enable row level security;
alter table public.reviews               enable row level security;
alter table public.notifications         enable row level security;

