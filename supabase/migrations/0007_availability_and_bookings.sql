-- 0007_availability_and_bookings.sql
-- Phase 6: Availability calendar, double-booking prevention, counter-proposal
-- fields, and booking status transition enforcement.
--
-- Features:
--   1. Bookings extra columns:
--        - price               integer (PKR, set from server package price)
--        - deposit_amount      integer (PKR, 25% server-calculated deposit)
--        - proposed_date       date (optional counter-proposal from photographer)
--        - proposed_package_id uuid (optional counter-proposal package from photographer)
--        - proposal_note       text (optional note explaining the counter-proposal or decline)
--   2. Double-booking prevention:
--        - Partial unique index `bookings_one_committed_per_photographer_date`
--          on (photographer_id, event_date) where status in
--          ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed')
--          and photographer_id is not null.
--   3. Automatic availability sync:
--        - Accepting a booking (or inserting a committed booking) checks that
--          the date is not marked 'booked' or 'unavailable' by another booking
--          or manual block, and automatically upserts `availability` with
--          status = 'booked'.
--        - Cancelling an accepted/deposit_paid booking frees the `availability`
--          row back to 'available' if no other committed booking holds that date.
--        - Photographers cannot overwrite a 'booked' availability row while a
--          committed booking exists on that date.
--   4. Booking status transitions & counter-proposals:
--        - Valid transitions enforced in `public.enforce_booking_update()`
--          (mirroring `lib/booking/transitions.ts`).
--        - Photographer can propose another date or package while a booking is
--          in 'requested', and client can accept the proposal (updating
--          event_date / package_id / price / deposit_amount / duration_hours).

-- ---------------------------------------------------------------------------
-- 1. Extend public.bookings with server-verified pricing & counter-proposals
-- ---------------------------------------------------------------------------

alter table public.bookings
  add column if not exists price               integer check (price is null or price >= 0),
  add column if not exists deposit_amount      integer check (deposit_amount is null or deposit_amount >= 0),
  add column if not exists proposed_date       date,
  add column if not exists proposed_package_id uuid references public.packages (id) on delete set null,
  add column if not exists proposal_note       text;

-- Backfill price and deposit_amount on existing bookings from package or budget
update public.bookings b
   set price = coalesce(
         b.price,
         (select p.price from public.packages p where p.id = b.package_id),
         b.budget,
         0
       ),
       deposit_amount = coalesce(
         b.deposit_amount,
         round((coalesce(
           (select p.price from public.packages p where p.id = b.package_id),
           b.budget,
           0
         ) * 0.25) / 1000.0)::integer * 1000
       )
 where b.price is null or b.deposit_amount is null;

-- ---------------------------------------------------------------------------
-- 2. Double-booking constraint (at most one committed booking per photographer per date)
-- ---------------------------------------------------------------------------

create unique index if not exists bookings_one_committed_per_photographer_date
  on public.bookings (photographer_id, event_date)
  where photographer_id is not null
    and status in ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed');

-- ---------------------------------------------------------------------------
-- 3. Protect booked availability days from manual overwrite while a committed
--    booking exists on that date
-- ---------------------------------------------------------------------------

create or replace function public.protect_booked_availability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_photographer uuid := coalesce(new.photographer_id, old.photographer_id);
  target_date         date := coalesce(new.date, old.date);
  has_committed       boolean;
begin
  select exists (
    select 1
      from public.bookings b
     where b.photographer_id = target_photographer
       and b.event_date = target_date
       and b.status in ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed')
  ) into has_committed;

  if tg_op = 'DELETE' then
    if has_committed then
      raise exception 'This date has an active booking and cannot be cleared from your calendar'
        using errcode = '23505';
    end if;
    return old;
  end if;

  if has_committed and new.status <> 'booked' then
    raise exception 'This date has an active booking and must remain marked as booked'
      using errcode = '23505';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_booked_availability() from public, anon, authenticated;

drop trigger if exists protect_booked_availability on public.availability;
create trigger protect_booked_availability
  before insert or update or delete on public.availability
  for each row execute function public.protect_booked_availability();

-- ---------------------------------------------------------------------------
-- 4. Enforce booking transitions, counter-proposals, and availability checks
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
  pkg_record  record;
begin
  -- 1. Parties to a booking never change, except that a deleted account
  --    becomes NULL (ON DELETE SET NULL from 0005). API users cannot change parties.
  if (new.client_id is distinct from old.client_id
      and (is_api_user or old.client_id is null or new.client_id is not null))
     or (new.photographer_id is distinct from old.photographer_id
      and (is_api_user or old.photographer_id is null or new.photographer_id is not null)) then
    raise exception 'The client and photographer on a booking cannot change'
      using errcode = '42501';
  end if;

  -- 2. Immutable core booking columns for API users (except when a client
  --    accepts a photographer's counter-proposal while status = 'requested').
  if is_api_user then
    if (to_jsonb(new) - array[
          'status',
          'updated_at',
          'proposed_date',
          'proposed_package_id',
          'proposal_note',
          'event_date',
          'package_id',
          'price',
          'deposit_amount',
          'duration_hours'
        ])
       is distinct from
       (to_jsonb(old) - array[
          'status',
          'updated_at',
          'proposed_date',
          'proposed_package_id',
          'proposal_note',
          'event_date',
          'package_id',
          'price',
          'deposit_amount',
          'duration_hours'
        ]) then
      raise exception 'Only the booking status or counter-proposal can be changed'
        using errcode = '42501';
    end if;

    -- Counter-proposal changes while status stays 'requested'
    if new.status = old.status then
      if old.status <> 'requested' then
        raise exception 'Counter-proposals can only be made while a booking is requested'
          using errcode = '42501';
      end if;

      if uid = old.photographer_id then
        -- Photographer sets or updates proposed_date, proposed_package_id, proposal_note
        if new.event_date is distinct from old.event_date
           or new.package_id is distinct from old.package_id
           or new.price is distinct from old.price
           or new.deposit_amount is distinct from old.deposit_amount
           or new.duration_hours is distinct from old.duration_hours then
          raise exception 'Photographers can propose a new date or package, not overwrite the client request directly'
            using errcode = '42501';
        end if;

        if new.proposed_package_id is not null and not exists (
          select 1 from public.packages p
           where p.id = new.proposed_package_id
             and p.photographer_id = old.photographer_id
        ) then
          raise exception 'You can only propose one of your own packages'
            using errcode = '42501';
        end if;

        if new.proposed_date is not null and exists (
          select 1 from public.bookings b
           where b.id <> old.id
             and b.photographer_id = old.photographer_id
             and b.event_date = new.proposed_date
             and b.status in ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed')
        ) then
          raise exception 'You already have a confirmed booking on the proposed date'
            using errcode = '23505';
        end if;

      elsif uid = old.client_id then
        -- Client accepts the photographer's counter-proposal (applying proposed_date / proposed_package_id)
        if old.proposed_date is null and old.proposed_package_id is null then
          raise exception 'There is no counter-proposal to accept on this booking'
            using errcode = '42501';
        end if;

        if new.event_date is distinct from coalesce(old.proposed_date, old.event_date)
           or new.package_id is distinct from coalesce(old.proposed_package_id, old.package_id) then
          raise exception 'You can only apply the date and package proposed by the photographer'
            using errcode = '42501';
        end if;

        -- Recalculate price, deposit_amount and duration_hours from the package on the server
        if new.package_id is not null then
          select p.price, p.hours into pkg_record
            from public.packages p
           where p.id = new.package_id
             and p.photographer_id = old.photographer_id;

          if found then
            new.price := pkg_record.price;
            new.deposit_amount := round((pkg_record.price * 0.25) / 1000.0)::integer * 1000;
            new.duration_hours := pkg_record.hours;
          end if;
        end if;

        new.proposed_date := null;
        new.proposed_package_id := null;
        new.proposal_note := null;
      else
        raise exception 'You cannot modify this booking'
          using errcode = '42501';
      end if;
    end if;
  end if;

  -- 3. Status transition enforcement (applies to API users and service_role alike)
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

    -- When status changes, core details (event_date, package_id, price) must not change simultaneously
    if is_api_user and (
      new.event_date is distinct from old.event_date
      or new.package_id is distinct from old.package_id
      or new.price is distinct from old.price
      or new.deposit_amount is distinct from old.deposit_amount
    ) then
      raise exception 'Booking date and package cannot be changed while updating status'
        using errcode = '42501';
    end if;

    -- When moving to 'accepted', verify the date is not already booked and clear any pending proposal
    if new.status = 'accepted' and old.photographer_id is not null then
      if exists (
        select 1
          from public.bookings b
         where b.id <> old.id
           and b.photographer_id = old.photographer_id
           and b.event_date = new.event_date
           and b.status in ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed')
      ) then
        raise exception 'This date is already booked for another shoot'
          using errcode = '23505';
      end if;

      new.proposed_date := null;
      new.proposed_package_id := null;
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. Server-side defaults on INSERT into bookings (price, deposit, availability check)
-- ---------------------------------------------------------------------------

create or replace function public.prepare_booking_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pkg_record record;
begin
  -- Verify photographer is verified
  if new.photographer_id is not null and not public.is_verified_photographer(new.photographer_id) then
    raise exception 'Bookings can only be requested with a verified photographer'
      using errcode = '42501';
  end if;

  -- When inserting a new booking request, check that the date is not already
  -- booked or marked unavailable by the photographer
  if new.status in ('requested', 'accepted', 'deposit_paid') and new.photographer_id is not null then
    if exists (
      select 1
        from public.availability a
       where a.photographer_id = new.photographer_id
         and a.date = new.event_date
         and a.status in ('booked', 'unavailable')
    ) or exists (
      select 1
        from public.bookings b
       where b.photographer_id = new.photographer_id
         and b.event_date = new.event_date
         and b.status in ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed')
    ) then
      raise exception 'This date is no longer available on the photographer''s calendar'
        using errcode = '23505';
    end if;
  end if;

  -- Always derive price, deposit_amount, and default duration_hours from the package on the server
  if new.package_id is not null then
    select p.price, p.hours, p.photographer_id
      into pkg_record
      from public.packages p
     where p.id = new.package_id;

    if not found or pkg_record.photographer_id is distinct from new.photographer_id then
      raise exception 'Selected package does not belong to this photographer'
        using errcode = '22023';
    end if;

    new.price := pkg_record.price;
    new.deposit_amount := round((pkg_record.price * 0.25) / 1000.0)::integer * 1000;
    if new.duration_hours is null then
      new.duration_hours := pkg_record.hours;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.prepare_booking_insert() from public, anon, authenticated;

drop trigger if exists prepare_booking_insert on public.bookings;
create trigger prepare_booking_insert
  before insert on public.bookings
  for each row execute function public.prepare_booking_insert();

-- ---------------------------------------------------------------------------
-- 6. Sync availability table when a booking is accepted or cancelled
-- ---------------------------------------------------------------------------

create or replace function public.sync_availability_on_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.photographer_id is null then
    return new;
  end if;

  -- When a booking enters a committed state, mark the date as 'booked' in availability
  if new.status in ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed') then
    insert into public.availability (photographer_id, date, status)
    values (new.photographer_id, new.event_date, 'booked')
    on conflict (photographer_id, date)
    do update set status = 'booked', updated_at = now();
  end if;

  -- When a previously committed booking is cancelled, release the date to 'available'
  -- if no other committed booking exists on that date
  if tg_op = 'UPDATE'
     and old.status in ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed')
     and new.status in ('cancelled', 'rejected') then
    if not exists (
      select 1
        from public.bookings b
       where b.id <> new.id
         and b.photographer_id = new.photographer_id
         and b.event_date = new.event_date
         and b.status in ('accepted', 'deposit_paid', 'shoot_done', 'delivered', 'completed')
    ) then
      update public.availability
         set status = 'available',
             updated_at = now()
       where photographer_id = new.photographer_id
         and date = new.event_date
         and status = 'booked';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.sync_availability_on_booking() from public, anon, authenticated;

drop trigger if exists sync_availability_on_booking on public.bookings;
create trigger sync_availability_on_booking
  after insert or update of status, event_date on public.bookings
  for each row execute function public.sync_availability_on_booking();

