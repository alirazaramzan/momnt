-- 0002_rls.sql
-- Row Level Security for every table created in 0001_core_schema.sql.
--
-- How to read this file
--   * Policies decide WHICH ROWS a user can see or touch.
--   * Some rules depend on the old value of a row (for example "you cannot
--     change your own role" or "bookings must follow the status flow").
--     Policies cannot see the old row, so those rules live in BEFORE UPDATE
--     triggers, defined next to the table they guard.
--   * "API user" below means a request made with the anon key or a user JWT
--     (Postgres roles anon / authenticated). Server code using the service
--     role key, and the SQL editor (postgres), are trusted and skip the
--     per-user checks. The booking status flow is enforced for everyone.
--   * auth.uid() is wrapped as (select auth.uid()) so Postgres evaluates it
--     once per query instead of once per row.

-- ---------------------------------------------------------------------------
-- 1. Make sure RLS is on for every table (already done in 0001; repeating it
--    is harmless and keeps this file self-contained).
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

-- ---------------------------------------------------------------------------
-- 2. Helper functions
--    SECURITY DEFINER so they read tables without triggering RLS again.
--    This avoids infinite recursion (gigs policy -> bids -> gigs ...) and
--    keeps policies short. Each helper only returns a boolean or the
--    caller's own role, so nothing private leaks through them.
-- ---------------------------------------------------------------------------

-- True when the signed-in user has role = admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- The signed-in user's role, or null when signed out.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

-- True when the given user is a photographer with verification_status = verified.
create or replace function public.is_verified_photographer(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.photographer_profiles
    where profile_id = p_user_id and verification_status = 'verified'
  );
$$;

-- True when the signed-in user posted the given gig.
create or replace function public.owns_gig(p_gig_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.gigs
    where id = p_gig_id and client_id = (select auth.uid())
  );
$$;

-- True when the signed-in user has placed a bid on the given gig.
create or replace function public.has_bid_on_gig(p_gig_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.bids
    where gig_id = p_gig_id and photographer_id = (select auth.uid())
  );
$$;

-- True when the gig is open and its bid deadline has not passed.
create or replace function public.gig_open_for_bids(p_gig_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.gigs
    where id = p_gig_id and status = 'open' and bid_deadline > now()
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. profiles
-- ---------------------------------------------------------------------------

-- Read your own full row (including phone).
create policy "profiles: users read their own row"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

-- Admins read every profile (verification queue, /admin/users).
create policy "profiles: admins read all rows"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- Update only your own row. The id cannot be changed to someone else's.
-- Changing role is blocked by the trigger below.
create policy "profiles: users update their own row"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- No insert policy: rows are created by the handle_new_user trigger.
-- No delete policy: rows are removed when the auth user is deleted.

-- Users cannot change their own role (for example to admin). Only the
-- service role or the SQL editor can change a role.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and current_user in ('anon', 'authenticated') then
    raise exception 'You cannot change your own role'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- Basic public fields of photographer and vendor profiles, for any signed-in
-- user. RLS works on rows, not columns, so a policy on profiles would expose
-- phone as well. This view returns only safe columns. It runs with the view
-- owner's rights (security_invoker = false), so it bypasses the row policies
-- above; the WHERE clause is the access rule.
-- The other party on a booking is also included, so a photographer can see
-- the name of the client who booked them.
create view public.profiles_public
with (security_invoker = false, security_barrier = true)
as
select p.id, p.role, p.full_name, p.city, p.avatar_url, p.business_name, p.created_at
from public.profiles p
where (select auth.uid()) is not null
  and (
    p.role in ('photographer', 'vendor')
    or exists (
      select 1 from public.bookings b
      where (b.client_id = p.id and b.photographer_id = (select auth.uid()))
         or (b.photographer_id = p.id and b.client_id = (select auth.uid()))
    )
  );

revoke all on public.profiles_public from public, anon;
grant select on public.profiles_public to authenticated;

-- ---------------------------------------------------------------------------
-- 4. photographer_profiles
-- ---------------------------------------------------------------------------

-- Anyone (signed in or not) can read verified photographers.
-- Owners always see their own profile, even while pending or rejected.
-- Admins see every profile so they can review it.
create policy "photographer_profiles: public reads verified, owner and admin read all"
  on public.photographer_profiles for select
  to anon, authenticated
  using (
    verification_status = 'verified'
    or profile_id = (select auth.uid())
    or public.is_admin()
  );

-- A user with role photographer creates their own profile. It must start as
-- pending, so no one can create themselves as verified.
create policy "photographer_profiles: photographers create their own, as pending"
  on public.photographer_profiles for insert
  to authenticated
  with check (
    profile_id = (select auth.uid())
    and public.current_user_role() = 'photographer'
    and verification_status = 'pending'
  );

-- Owners edit their own profile. verification_status is protected by the
-- trigger below.
create policy "photographer_profiles: owners update their own"
  on public.photographer_profiles for update
  to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- Owners delete their own profile. Bookings reference it with ON DELETE
-- RESTRICT, so this fails while bookings exist.
create policy "photographer_profiles: owners delete their own"
  on public.photographer_profiles for delete
  to authenticated
  using (profile_id = (select auth.uid()));

-- Only admins (through the verification_requests flow), the service role or
-- the SQL editor can change verification_status.
create or replace function public.protect_verification_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.verification_status is distinct from old.verification_status
     and current_user in ('anon', 'authenticated') then
    raise exception 'Verification status is set by an admin'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger protect_verification_status
  before update on public.photographer_profiles
  for each row execute function public.protect_verification_status();

-- ---------------------------------------------------------------------------
-- 5. portfolio_images
-- ---------------------------------------------------------------------------

-- Anyone can see the portfolio of a verified photographer. Owners see their
-- own images at any status. Admins see all of them for verification review.
create policy "portfolio_images: public reads verified, owner and admin read all"
  on public.portfolio_images for select
  to anon, authenticated
  using (
    public.is_verified_photographer(photographer_id)
    or photographer_id = (select auth.uid())
    or public.is_admin()
  );

-- Owners add, edit and remove only their own images.
create policy "portfolio_images: owners insert their own"
  on public.portfolio_images for insert
  to authenticated
  with check (photographer_id = (select auth.uid()));

create policy "portfolio_images: owners update their own"
  on public.portfolio_images for update
  to authenticated
  using (photographer_id = (select auth.uid()))
  with check (photographer_id = (select auth.uid()));

create policy "portfolio_images: owners delete their own"
  on public.portfolio_images for delete
  to authenticated
  using (photographer_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 6. packages
-- ---------------------------------------------------------------------------

-- Same rule as the portfolio: public for verified photographers, owner and
-- admin always.
create policy "packages: public reads verified, owner and admin read all"
  on public.packages for select
  to anon, authenticated
  using (
    public.is_verified_photographer(photographer_id)
    or photographer_id = (select auth.uid())
    or public.is_admin()
  );

-- Owners create, edit and delete only their own packages.
create policy "packages: owners insert their own"
  on public.packages for insert
  to authenticated
  with check (photographer_id = (select auth.uid()));

create policy "packages: owners update their own"
  on public.packages for update
  to authenticated
  using (photographer_id = (select auth.uid()))
  with check (photographer_id = (select auth.uid()));

create policy "packages: owners delete their own"
  on public.packages for delete
  to authenticated
  using (photographer_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 7. availability
-- ---------------------------------------------------------------------------

-- Anyone can read availability (the calendar on public profiles).
create policy "availability: public read"
  on public.availability for select
  to anon, authenticated
  using (true);

-- Only the photographer writes their own calendar.
create policy "availability: owners insert their own"
  on public.availability for insert
  to authenticated
  with check (photographer_id = (select auth.uid()));

create policy "availability: owners update their own"
  on public.availability for update
  to authenticated
  using (photographer_id = (select auth.uid()))
  with check (photographer_id = (select auth.uid()));

create policy "availability: owners delete their own"
  on public.availability for delete
  to authenticated
  using (photographer_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- 8. bookings
-- ---------------------------------------------------------------------------

-- Only the client and the photographer on a booking can see it, plus admins.
-- A client never sees another client's bookings.
create policy "bookings: participants and admins read"
  on public.bookings for select
  to authenticated
  using (
    client_id = (select auth.uid())
    or photographer_id = (select auth.uid())
    or public.is_admin()
  );

-- Clients and agencies create booking requests for themselves:
--   * always as status requested;
--   * only with a verified photographer;
--   * the package must belong to that photographer;
--   * source_gig_id must be empty (bookings from an awarded gig are created
--     by the server award action, not by the browser).
create policy "bookings: clients create requests"
  on public.bookings for insert
  to authenticated
  with check (
    client_id = (select auth.uid())
    and public.current_user_role() in ('client', 'agency')
    and status = 'requested'
    and source_gig_id is null
    and package_id is not null
    and public.is_verified_photographer(photographer_id)
    and exists (
      select 1 from public.packages p
      where p.id = package_id
        and p.photographer_id = bookings.photographer_id
    )
  );

-- Either participant may update the row. What they may change is decided
-- by the trigger below (status only, following the allowed flow).
create policy "bookings: participants update"
  on public.bookings for update
  to authenticated
  using (
    client_id = (select auth.uid())
    or photographer_id = (select auth.uid())
  )
  with check (
    client_id = (select auth.uid())
    or photographer_id = (select auth.uid())
  );

-- No delete policy: bookings are cancelled, never deleted.

-- Allowed status flow (who may make each move, for API users):
--   requested    -> accepted      photographer
--   requested    -> rejected      photographer
--   requested    -> cancelled     client
--   accepted     -> deposit_paid  client (mock payment)
--   accepted     -> cancelled     client or photographer
--   deposit_paid -> shoot_done    photographer
--   deposit_paid -> cancelled     client or photographer
--   shoot_done   -> delivered     photographer
--   delivered    -> completed     client
-- rejected, cancelled and completed are final.
-- API users may change only the status column. The flow itself applies to
-- everyone, including the service role.
create or replace function public.enforce_booking_update()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  is_api_user boolean := current_user in ('anon', 'authenticated');
  uid         uuid    := (select auth.uid());
  transition  text    := old.status::text || '>' || new.status::text;
  allowed_by  text[];
begin
  -- Parties to a booking never change.
  if new.client_id is distinct from old.client_id
     or new.photographer_id is distinct from old.photographer_id then
    raise exception 'The client and photographer on a booking cannot change'
      using errcode = '42501';
  end if;

  -- API users can only change the status.
  if is_api_user
     and (to_jsonb(new) - array['status', 'updated_at'])
         is distinct from (to_jsonb(old) - array['status', 'updated_at']) then
    raise exception 'Only the booking status can be changed'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    allowed_by := case transition
      when 'requested>accepted'        then array['photographer']
      when 'requested>rejected'        then array['photographer']
      when 'requested>cancelled'       then array['client']
      when 'accepted>deposit_paid'     then array['client']
      when 'accepted>cancelled'        then array['client', 'photographer']
      when 'deposit_paid>shoot_done'   then array['photographer']
      when 'deposit_paid>cancelled'    then array['client', 'photographer']
      when 'shoot_done>delivered'      then array['photographer']
      when 'delivered>completed'       then array['client']
      else null
    end;

    if allowed_by is null then
      raise exception 'A booking cannot move from % to %', old.status, new.status
        using errcode = '22023';
    end if;

    if is_api_user and not (
      (uid = old.photographer_id and 'photographer' = any (allowed_by))
      or (uid = old.client_id and 'client' = any (allowed_by))
    ) then
      raise exception 'You cannot move this booking from % to %', old.status, new.status
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

create trigger enforce_booking_update
  before update on public.bookings
  for each row execute function public.enforce_booking_update();

-- ---------------------------------------------------------------------------
-- 9. verification_requests
-- ---------------------------------------------------------------------------

-- Owners read their own requests. Admins read all of them (the queue).
create policy "verification_requests: owners and admins read"
  on public.verification_requests for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_admin()
  );

-- Owners submit a request for their own account:
--   * the requested role must match their account role;
--   * it starts as pending with no review fields filled in.
-- The unique index from 0001 allows one open request per user.
create policy "verification_requests: owners submit their own"
  on public.verification_requests for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and role_requested = public.current_user_role()
    and status = 'pending'
    and admin_note is null
    and reviewed_by is null
    and reviewed_at is null
  );

-- Only admins update a request (status, admin_note).
create policy "verification_requests: admins update"
  on public.verification_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- No delete policy.

-- When the status changes, record who reviewed it and when.
create or replace function public.stamp_verification_review()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.reviewed_at := now();
    new.reviewed_by := coalesce((select auth.uid()), new.reviewed_by);
  end if;
  return new;
end;
$$;

create trigger stamp_verification_review
  before update on public.verification_requests
  for each row execute function public.stamp_verification_review();

-- Copy the decision onto photographer_profiles.verification_status, so the
-- admin updates one place. SECURITY DEFINER so it passes the
-- protect_verification_status trigger (the admin action is the trusted path).
create or replace function public.sync_photographer_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status
     and new.role_requested = 'photographer' then
    update public.photographer_profiles
       set verification_status = new.status
     where profile_id = new.user_id;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_photographer_verification() from public, anon, authenticated;

create trigger sync_photographer_verification
  after update on public.verification_requests
  for each row execute function public.sync_photographer_verification();

-- ---------------------------------------------------------------------------
-- 10. gigs
-- ---------------------------------------------------------------------------

-- Verified photographers read open gigs. The owner always reads their own
-- gigs. A photographer who bid keeps seeing that gig after it closes (for
-- their bids page). Admins read all gigs.
create policy "gigs: verified photographers read open, owner, bidders and admins"
  on public.gigs for select
  to authenticated
  using (
    (status = 'open' and public.is_verified_photographer((select auth.uid())))
    or client_id = (select auth.uid())
    or public.has_bid_on_gig(id)
    or public.is_admin()
  );

-- Clients and agencies post gigs for themselves, always as open.
create policy "gigs: clients create their own"
  on public.gigs for insert
  to authenticated
  with check (
    client_id = (select auth.uid())
    and public.current_user_role() in ('client', 'agency')
    and status = 'open'
  );

-- Owners edit their own gigs. Status rules are in the trigger below.
create policy "gigs: owners update their own"
  on public.gigs for update
  to authenticated
  using (client_id = (select auth.uid()))
  with check (client_id = (select auth.uid()));

-- No delete policy: owners close a gig instead.

-- API users can only close an open gig. Awarding (which also creates a
-- booking) and expiry are done by server code.
create or replace function public.enforce_gig_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated')
     and new.status is distinct from old.status
     and not (old.status = 'open' and new.status = 'closed') then
    raise exception 'You can close an open gig. Awarding and expiry are handled by Momnt'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger enforce_gig_update
  before update on public.gigs
  for each row execute function public.enforce_gig_update();

-- ---------------------------------------------------------------------------
-- 11. bids
-- ---------------------------------------------------------------------------

-- A photographer sees only their own bids. The gig owner sees every bid on
-- their gig. No photographer can read another photographer's bid, because
-- neither condition is true for them. Admins read all bids.
create policy "bids: own bids, gig owner and admins read"
  on public.bids for select
  to authenticated
  using (
    photographer_id = (select auth.uid())
    or public.owns_gig(gig_id)
    or public.is_admin()
  );

-- Only verified photographers bid, for themselves, while the gig is open and
-- before its deadline. A bid starts as submitted. An attached package must
-- be their own. One bid per gig is enforced by the unique constraint.
create policy "bids: verified photographers bid on open gigs"
  on public.bids for insert
  to authenticated
  with check (
    photographer_id = (select auth.uid())
    and public.is_verified_photographer((select auth.uid()))
    and status = 'submitted'
    and public.gig_open_for_bids(gig_id)
    and (
      package_id is null
      or exists (
        select 1 from public.packages p
        where p.id = package_id and p.photographer_id = (select auth.uid())
      )
    )
  );

-- The bidder may edit their bid, and the gig owner may change its status.
-- What each one may change is decided by the trigger below.
create policy "bids: bidder and gig owner update"
  on public.bids for update
  to authenticated
  using (
    photographer_id = (select auth.uid())
    or public.owns_gig(gig_id)
  )
  with check (
    photographer_id = (select auth.uid())
    or public.owns_gig(gig_id)
  );

-- No delete policy.

-- Bidder: may edit price, message and package while the gig is open, never
--   the status.
-- Gig owner: may only change status, to shortlisted or rejected. Awarding
--   is done by server code, because it also creates the booking.
create or replace function public.enforce_bid_update()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if new.gig_id is distinct from old.gig_id
     or new.photographer_id is distinct from old.photographer_id then
    raise exception 'A bid cannot move to another gig or photographer'
      using errcode = '42501';
  end if;

  if current_user not in ('anon', 'authenticated') then
    return new;
  end if;

  if uid = old.photographer_id then
    if new.status is distinct from old.status then
      raise exception 'Only the gig owner can change a bid status'
        using errcode = '42501';
    end if;
    if not public.gig_open_for_bids(old.gig_id) then
      raise exception 'Bidding on this gig has closed'
        using errcode = '42501';
    end if;
    if new.package_id is not null and not exists (
      select 1 from public.packages p
      where p.id = new.package_id and p.photographer_id = uid
    ) then
      raise exception 'You can only attach your own package'
        using errcode = '42501';
    end if;
  elsif public.owns_gig(old.gig_id) then
    if (to_jsonb(new) - array['status', 'updated_at'])
       is distinct from (to_jsonb(old) - array['status', 'updated_at']) then
      raise exception 'Gig owners can only change the bid status'
        using errcode = '42501';
    end if;
    if new.status is distinct from old.status
       and not (old.status in ('submitted', 'shortlisted')
                and new.status in ('shortlisted', 'rejected')) then
      raise exception 'You can shortlist or reject a bid. Use the award action to award it'
        using errcode = '42501';
    end if;
  else
    raise exception 'You cannot change this bid'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger enforce_bid_update
  before update on public.bids
  for each row execute function public.enforce_bid_update();

-- ---------------------------------------------------------------------------
-- 12. reviews (table only for now)
-- ---------------------------------------------------------------------------

-- Reviews are public, like on the profile page. There are no write policies
-- yet, so no one can create reviews through the API until the reviews
-- feature adds them.
create policy "reviews: public read"
  on public.reviews for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 13. notifications
-- ---------------------------------------------------------------------------

-- Users read only their own notifications.
create policy "notifications: users read their own"
  on public.notifications for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Users update only their own notifications. The column grant below limits
-- them to read_at (marking as read), so they cannot rewrite the content.
create policy "notifications: users update their own"
  on public.notifications for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- No insert or delete policies: notifications are created by server code
-- (service role) or by database triggers.
