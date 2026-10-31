-- 0003_storage.sql
-- Storage buckets and storage.objects policies.
--
-- Folder conventions (the first folder in the object path is the key):
--   portfolio          {photographer_user_id}/{file}   e.g. 3f2c.../no-014.jpg
--   verification-docs  {user_id}/{file}                e.g. 3f2c.../cnic-front.jpg
--   gig-references     {gig_id}/{file}                 e.g. 9a1b.../ref-1.webp
--
-- storage.objects already has RLS enabled by Supabase. Without a policy,
-- an action is denied, so anything not allowed below is blocked.
-- Updating an existing file (upsert) needs select, insert and update
-- policies together, which is why owners also get a select policy.

-- ---------------------------------------------------------------------------
-- 1. Buckets: 5 MB limit, JPEG, PNG and WebP only.
--    ON CONFLICT keeps this migration safe if a bucket was already created
--    by hand in the dashboard: it is brought in line with these settings.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portfolio',         'portfolio',         true,  5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('verification-docs', 'verification-docs', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('gig-references',    'gig-references',    false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 2. Helper: does the signed-in user own the gig named by the first folder?
--    Compares as text, so a path that is not a valid uuid simply returns
--    false instead of raising a cast error. SECURITY DEFINER so it reads
--    gigs without RLS (same pattern as the helpers in 0002).
-- ---------------------------------------------------------------------------

create or replace function public.owns_gig_folder(p_object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.gigs g
    where g.id::text = (storage.foldername(p_object_name))[1]
      and g.client_id = (select auth.uid())
  );
$$;

-- ---------------------------------------------------------------------------
-- 3. portfolio (public bucket)
--    Public read: the bucket is public, so files are served by their public
--    URL to anyone, without a policy. There is deliberately no public SELECT
--    policy: that would also let anyone LIST every photographer's folder.
--    Writes: only a user with role photographer, and only inside the folder
--    named with their own user id.
-- ---------------------------------------------------------------------------

-- Owners can list and read their own folder through the API (needed for
-- the portfolio manager and for upsert).
create policy "portfolio: owners read their own folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Photographers upload only into {their user id}/.
create policy "portfolio: photographers upload to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.current_user_role() = 'photographer'
  );

-- Photographers replace files only in their own folder, and cannot move a
-- file into someone else's folder.
create policy "portfolio: photographers update their own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.current_user_role() = 'photographer'
  );

-- Photographers delete only their own files.
create policy "portfolio: photographers delete their own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'portfolio'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ---------------------------------------------------------------------------
-- 4. verification-docs (PRIVATE bucket, CNIC scans)
--    Files are only reachable through signed URLs or authenticated
--    downloads, both of which go through these policies.
-- ---------------------------------------------------------------------------

-- Owners read their own documents.
create policy "verification-docs: owners read their own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Admins read every document (verification review).
create policy "verification-docs: admins read all"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'verification-docs'
    and public.is_admin()
  );

-- Owners upload only into {their user id}/.
create policy "verification-docs: owners upload to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'verification-docs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- No update or delete policies: once submitted, a document cannot be
-- replaced or removed by the user, so the admin reviews what was sent.
-- Upload each document under a new file name.

-- ---------------------------------------------------------------------------
-- 5. gig-references (private bucket)
-- ---------------------------------------------------------------------------

-- The gig owner reads their own references. Verified photographers read
-- references so they can prepare a bid.
create policy "gig-references: gig owner and verified photographers read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'gig-references'
    and (
      public.owns_gig_folder(name)
      or public.is_verified_photographer((select auth.uid()))
    )
  );

-- Only the gig owner uploads, into {gig id}/ of a gig they own.
create policy "gig-references: gig owner uploads"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gig-references'
    and public.owns_gig_folder(name)
  );

-- Only the gig owner replaces files, and cannot move them to another gig.
create policy "gig-references: gig owner updates"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'gig-references'
    and public.owns_gig_folder(name)
  )
  with check (
    bucket_id = 'gig-references'
    and public.owns_gig_folder(name)
  );

-- Only the gig owner deletes files.
create policy "gig-references: gig owner deletes"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gig-references'
    and public.owns_gig_folder(name)
  );

