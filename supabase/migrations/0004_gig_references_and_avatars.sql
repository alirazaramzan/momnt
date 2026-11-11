-- 0004_gig_references_and_avatars.sql
-- 1. gigs.reference_images: storage paths of the client's reference photos.
-- 2. avatars bucket and its storage.objects policies.

-- ---------------------------------------------------------------------------
-- 1. gigs.reference_images
--    Holds object paths inside the gig-references bucket, for example
--    '{gig_id}/ref-1.webp'. Not URLs: the bucket is private, so the app
--    creates signed URLs from these paths when it renders them.
-- ---------------------------------------------------------------------------

-- True when every path sits directly under '{folder}/'. An empty array is
-- valid. IMMUTABLE so it can be used in a CHECK constraint.
create or replace function public.paths_in_folder(p_paths text[], p_folder text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(bool_and(starts_with(path, p_folder || '/')), true)
  from unnest(p_paths) as path;
$$;

alter table public.gigs
  add column reference_images text[] not null default '{}';

-- At most 10 references per gig, and every path must be in this gig's own
-- folder, so a gig cannot point at another gig's files.
alter table public.gigs
  add constraint gigs_reference_images_max_chk
    check (cardinality(reference_images) <= 10),
  add constraint gigs_reference_images_folder_chk
    check (public.paths_in_folder(reference_images, id::text));

-- RLS: no new policy needed. The 0002 policies already let the gig owner
-- update their own gig, and let verified photographers, bidders and the
-- owner read it. Reading the files themselves is covered by the
-- gig-references policies in 0003.

-- ---------------------------------------------------------------------------
-- 2. avatars bucket (public)
--    Path: {user_id}/{file}, for example 3f2c.../avatar.webp
--    Every role has an avatar, so any signed-in user may write to their
--    own folder. profiles.avatar_url stores the path or public URL.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read happens through the public URL, without a policy. As with
-- portfolio, there is no public SELECT policy, so no one can list every
-- user's folder. Owners can list and read their own folder (needed for
-- upsert).
create policy "avatars: owners read their own folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Users upload only into {their user id}/.
create policy "avatars: owners upload to their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Users replace only their own avatar, and cannot move it into someone
-- else's folder.
create policy "avatars: owners update their own files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Users delete only their own avatar.
create policy "avatars: owners delete their own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

