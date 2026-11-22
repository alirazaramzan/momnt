-- 0005_account_deletion.sql
-- Lets a person delete their account without wiping the other party's
-- history.
--
-- Before this migration gigs.client_id, bookings.client_id and
-- bookings.photographer_id were NOT NULL with ON DELETE RESTRICT, so deleting
-- any user who ever posted a gig or had a booking failed. Reviews and bids
-- were ON DELETE CASCADE, so they vanished with either party.
--
-- After this migration:
--   * Those columns are nullable with ON DELETE SET NULL. A finished booking
--     stays in the other person's history, and the app shows the missing
--     party as "Deleted user".
--   * The booking and bid triggers allow exactly one change to who is on a
--     row: a party going from a value to NULL, and only when it comes from a
--     trusted role (the foreign key action, the service role, the SQL
--     editor). API users still cannot change parties at all.
--   * account_deletion_blockers() reports what stops a deletion, and a
--     BEFORE DELETE trigger on profiles enforces it for every path (app,
--     dashboard, SQL), so an active booking is never orphaned.

-- ---------------------------------------------------------------------------
-- 1. Parties become nullable, ON DELETE SET NULL
-- ---------------------------------------------------------------------------

alter table public.gigs
  alter column client_id drop not null,
  drop constraint gigs_client_id_fkey,
  add constraint gigs_client_id_fkey
    foreign key (client_id) references public.profiles (id) on delete set null;

alter table public.bookings
  alter column client_id drop not null,
  alter column photographer_id drop not null,
  drop constraint bookings_client_id_fkey,
  add constraint bookings_client_id_fkey
    foreign key (client_id) references public.profiles (id) on delete set null,
  drop constraint bookings_photographer_id_fkey,
  add constraint bookings_photographer_id_fkey
    foreign key (photographer_id) references public.photographer_profiles (profile_id) on delete set null;

-- Reviews stay on the photographer's record after the reviewer leaves, and
-- on the client's past booking after the photographer leaves.
alter table public.reviews
  alter column reviewer_id drop not null,
  alter column photographer_id drop not null,
  drop constraint reviews_reviewer_id_fkey,
  add constraint reviews_reviewer_id_fkey
    foreign key (reviewer_id) references public.profiles (id) on delete set null,
  drop constraint reviews_photographer_id_fkey,
  add constraint reviews_photographer_id_fkey
    foreign key (photographer_id) references public.photographer_profiles (profile_id) on delete set null;

-- Awarded bids stay on the client's gig. Pending bids are removed by the
-- delete-account action before the user is deleted.
alter table public.bids
  alter column photographer_id drop not null,
  drop constraint bids_photographer_id_fkey,
  add constraint bids_photographer_id_fkey
    foreign key (photographer_id) references public.photographer_profiles (profile_id) on delete set null;

-- ---------------------------------------------------------------------------
-- 2. Booking trigger: a party may only go from a value to NULL, and only
--    from a trusted role. Everything else is unchanged from 0002.
-- ---------------------------------------------------------------------------

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
  -- Parties to a booking never change, except that a deleted account
  -- becomes NULL (ON DELETE SET NULL). API users cannot do even that.
  if (new.client_id is distinct from old.client_id
      and (is_api_user or old.client_id is null or new.client_id is not null))
     or (new.photographer_id is distinct from old.photographer_id
      and (is_api_user or old.photographer_id is null or new.photographer_id is not null)) then
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

-- ---------------------------------------------------------------------------
-- 3. Bid trigger: same rule for photographer_id. Everything else is
--    unchanged from 0002.
-- ---------------------------------------------------------------------------

create or replace function public.enforce_bid_update()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
  is_api_user boolean := current_user in ('anon', 'authenticated');
begin
  if new.gig_id is distinct from old.gig_id
     or (new.photographer_id is distinct from old.photographer_id
         and (is_api_user or old.photographer_id is null or new.photographer_id is not null)) then
    raise exception 'A bid cannot move to another gig or photographer'
      using errcode = '42501';
  end if;

  if not is_api_user then
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

-- ---------------------------------------------------------------------------
-- 4. What blocks an account deletion
--    active_bookings:  bookings the user is on that are not finished
--                      (finished = completed, cancelled or rejected).
--    gigs_in_progress: the user's awarded gigs whose booking is not
--                      finished yet (or has not been created).
--    Server code only: execute is revoked from API users.
-- ---------------------------------------------------------------------------

create or replace function public.account_deletion_blockers(p_user_id uuid)
returns table (active_bookings integer, gigs_in_progress integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*)::integer
       from public.bookings b
      where (b.client_id = p_user_id or b.photographer_id = p_user_id)
        and b.status not in ('completed', 'cancelled', 'rejected')),
    (select count(*)::integer
       from public.gigs g
      where g.client_id = p_user_id
        and g.status = 'awarded'
        and not exists (
          select 1 from public.bookings b
           where b.source_gig_id = g.id
             and b.status in ('completed', 'cancelled', 'rejected')
        ));
$$;

revoke all on function public.account_deletion_blockers(uuid) from public, anon, authenticated;
grant execute on function public.account_deletion_blockers(uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 5. Guard: a profile (and so an auth user) cannot be deleted while it has
--    blockers. Runs for the app, the dashboard and the SQL editor alike.
--    SECURITY DEFINER so the auth admin role can call the helper above.
-- ---------------------------------------------------------------------------

create or replace function public.guard_profile_deletion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  blockers record;
begin
  select * into blockers from public.account_deletion_blockers(old.id);
  if blockers.active_bookings > 0 or blockers.gigs_in_progress > 0 then
    raise exception 'Finish or cancel your active bookings first'
      using errcode = 'P0001';
  end if;
  return old;
end;
$$;

revoke all on function public.guard_profile_deletion() from public, anon, authenticated;

create trigger guard_profile_deletion
  before delete on public.profiles
  for each row execute function public.guard_profile_deletion();

