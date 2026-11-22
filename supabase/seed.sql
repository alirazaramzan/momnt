-- supabase/seed.sql
-- Momnt demo seed data (FYP-I): 15 photographers (Karachi, Lahore, Islamabad),
-- 5 clients, 1 agency, 1 admin, packages, availability, portfolio images,
-- fake CNIC verification requests, 10 gigs with bids, bookings and reviews.
-- All names, phones, CNIC paths and images are synthetic demo data.

begin;

-- 1. Auth users (password: MomntDemoPassword123!)
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0001-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"client","full_name":"Ahsan Raza"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0002-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'amina.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"client","full_name":"Amina Tariq"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0002-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hamza.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"client","full_name":"Hamza Qureshi"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0002-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sana.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"client","full_name":"Sana Mehmood"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0002-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'daniyal.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"client","full_name":"Daniyal Farooq"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0002-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mahnoor.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"client","full_name":"Mahnoor Javed"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0003-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'atelier.noor.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"agency","full_name":"Zeeshan Haider"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sara.khan.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Sara Khan"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'omar.siddiqui.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Omar Siddiqui"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'zainab.raza.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Zainab Raza"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kamran.baig.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Kamran Baig"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nadia.haroon.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Nadia Haroon"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'hira.anwar.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Hira Anwar"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bilal.shah.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Bilal Shah"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'faisal.butt.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Faisal Butt"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mehwish.lone.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Mehwish Lone"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'salman.virk.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Salman Virk"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tariq.malik.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Tariq Malik"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ayesha.khattak.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Ayesha Khattak"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'usman.gilani.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Usman Gilani"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rabia.abbasi.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Rabia Abbasi"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('d0000000-0004-4000-8000-000000000015', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'haris.afridi.demo@momnt.example', crypt('MomntDemoPassword123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"role":"photographer","full_name":"Haris Afridi"}'::jsonb, now(), now())
on conflict (id) do update set email = excluded.email, raw_user_meta_data = excluded.raw_user_meta_data;

-- 2. Profiles
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0001-4000-8000-000000000001', 'admin'::public.user_role, 'Ahsan Raza', '0300 0000001', 'Karachi', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0002-4000-8000-000000000001', 'client'::public.user_role, 'Amina Tariq', '0300 0000101', 'Karachi', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0002-4000-8000-000000000002', 'client'::public.user_role, 'Hamza Qureshi', '0300 0000102', 'Lahore', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0002-4000-8000-000000000003', 'client'::public.user_role, 'Sana Mehmood', '0300 0000103', 'Islamabad', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0002-4000-8000-000000000004', 'client'::public.user_role, 'Daniyal Farooq', '0300 0000104', 'Karachi', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0002-4000-8000-000000000005', 'client'::public.user_role, 'Mahnoor Javed', '0300 0000105', 'Lahore', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0003-4000-8000-000000000001', 'agency'::public.user_role, 'Zeeshan Haider', '0300 0000201', 'Karachi', 'Atelier Noor Events')
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000001', 'photographer'::public.user_role, 'Sara Khan', '0301 0000301', 'Karachi', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000002', 'photographer'::public.user_role, 'Omar Siddiqui', '0301 0000302', 'Karachi', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000003', 'photographer'::public.user_role, 'Zainab Raza', '0301 0000303', 'Karachi', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000004', 'photographer'::public.user_role, 'Kamran Baig', '0301 0000304', 'Karachi', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000005', 'photographer'::public.user_role, 'Nadia Haroon', '0301 0000305', 'Karachi', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000006', 'photographer'::public.user_role, 'Hira Anwar', '0301 0000306', 'Lahore', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000007', 'photographer'::public.user_role, 'Bilal Shah', '0301 0000307', 'Lahore', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000008', 'photographer'::public.user_role, 'Faisal Butt', '0301 0000308', 'Lahore', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000009', 'photographer'::public.user_role, 'Mehwish Lone', '0301 0000309', 'Lahore', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000010', 'photographer'::public.user_role, 'Salman Virk', '0301 0000310', 'Lahore', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000011', 'photographer'::public.user_role, 'Tariq Malik', '0301 0000311', 'Islamabad', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000012', 'photographer'::public.user_role, 'Ayesha Khattak', '0301 0000312', 'Islamabad', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000013', 'photographer'::public.user_role, 'Usman Gilani', '0301 0000313', 'Islamabad', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000014', 'photographer'::public.user_role, 'Rabia Abbasi', '0301 0000314', 'Islamabad', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;
insert into public.profiles (id, role, full_name, phone, city, business_name)
values ('d0000000-0004-4000-8000-000000000015', 'photographer'::public.user_role, 'Haris Afridi', '0301 0000315', 'Islamabad', null)
on conflict (id) do update set role = excluded.role, full_name = excluded.full_name, phone = excluded.phone, city = excluded.city, business_name = excluded.business_name;

-- 3. Photographer profiles, packages, availability, portfolio_images, verification_requests
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000001', 'Documentary wedding and portrait photographer based in Karachi. Working with available light and unhurried pacing.', array['Weddings', 'Portraits']::text[], array['Documentary', 'Natural light', 'Editorial']::text[], '{"instagram":"https://instagram.com/momnt.demo.1","website":"https://momnt.example/demo/1"}'::jsonb, 7, false, 'verified'::public.verification_status, '2026-10-01T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000101', 'd0000000-0004-4000-8000-000000000001', 'Portrait session', 45000, 2, 1, 45, 10, '[{"name":"Fine art print set","price":15000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000102', 'd0000000-0004-4000-8000-000000000001', 'Mehndi coverage', 120000, 6, 2, 250, 21, '[{"name":"Extra hour","price":18000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000103', 'd0000000-0004-4000-8000-000000000001', 'Full wedding', 240000, 12, 3, 500, 28, '[{"name":"Linen photo album","price":35000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000001', '2026-12-04'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000001', '2026-12-05'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000001', '2026-12-11'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000001', '2026-12-12'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000001', '2026-12-19'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000001', '2026-12-26'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000001', '2026-12-27'::date, 'unavailable') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000011', 'd0000000-0004-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000001/demo-frame-01.png', 'Mehndi entrance', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000012', 'd0000000-0004-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000001/demo-frame-02.png', 'Window light portrait', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000013', 'd0000000-0004-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000001/demo-frame-03.png', 'Rooftop golden hour', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000014', 'd0000000-0004-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000001/demo-frame-04.png', 'Stage preparations', 3)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000001', 'photographer', 'd0000000-0004-4000-8000-000000000001/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000001/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000002', 'Classic event photography across Karachi. Focused on key family moments and formal stage portraits.', array['Weddings', 'Traditional events']::text[], array['Classic', 'Documentary']::text[], '{"instagram":"https://instagram.com/momnt.demo.2","website":"https://momnt.example/demo/2"}'::jsonb, 9, false, 'verified'::public.verification_status, '2026-10-03T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000201', 'd0000000-0004-4000-8000-000000000002', 'Half day event', 85000, 5, 1, 200, 14, '[{"name":"Second shooter","price":25000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000202', 'd0000000-0004-4000-8000-000000000002', 'Full wedding', 180000, 10, 2, 400, 21, '[{"name":"Printed family album","price":30000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000002', '2026-12-06'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000002', '2026-12-13'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000002', '2026-12-14'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000002', '2026-12-20'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000002', '2026-12-21'::date, 'unavailable') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000021', 'd0000000-0004-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000002/demo-frame-01.png', 'Baraat arrivals', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000022', 'd0000000-0004-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000002/demo-frame-02.png', 'Stage family portrait', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000023', 'd0000000-0004-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000002/demo-frame-03.png', 'Courtyard arrival', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000002', 'photographer', 'd0000000-0004-4000-8000-000000000002/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000002/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000003', 'Editorial fashion and wedding documentarian capturing genuine interactions and quiet details on stills and motion.', array['Editorial', 'Portraits', 'Weddings']::text[], array['Editorial', 'Natural light']::text[], '{"instagram":"https://instagram.com/momnt.demo.3","website":"https://momnt.example/demo/3"}'::jsonb, 6, true, 'verified'::public.verification_status, '2026-10-05T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000301', 'd0000000-0004-4000-8000-000000000003', 'Intimate Nikah & short film', 95000, 4, 2, 160, 14, '[{"name":"Super-8 style reel","price":22000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000302', 'd0000000-0004-4000-8000-000000000003', 'Editorial wedding story', 210000, 10, 3, 380, 28, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000003', '2026-12-15'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000003', '2026-12-18'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000003', '2026-12-25'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000031', 'd0000000-0004-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000003/demo-frame-01.png', 'Morning light dupatta', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000032', 'd0000000-0004-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000003/demo-frame-02.png', 'Mirrored reflection', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000033', 'd0000000-0004-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000003/demo-frame-03.png', 'Evening candid conversation', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000003', 'photographer', 'd0000000-0004-4000-8000-000000000003/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000003/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000004', 'Corporate portrait and conference photographer working with executive teams and publications in Karachi.', array['Corporate', 'Portraits']::text[], array['Classic', 'Editorial']::text[], '{"instagram":"https://instagram.com/momnt.demo.4","website":"https://momnt.example/demo/4"}'::jsonb, 11, false, 'verified'::public.verification_status, '2026-10-07T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000401', 'd0000000-0004-4000-8000-000000000004', 'Executive headshot session', 40000, 2, 1, 25, 5, '[{"name":"On-site lighting setup","price":12000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000402', 'd0000000-0004-4000-8000-000000000004', 'Annual summit full day', 115000, 8, 2, 220, 7, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000004', '2026-12-10'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000004', '2026-12-17'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000004', '2026-12-24'::date, 'unavailable') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000041', 'd0000000-0004-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000004/demo-frame-01.png', 'Boardroom portrait', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000042', 'd0000000-0004-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000004/demo-frame-02.png', 'Keynote stage frame', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000043', 'd0000000-0004-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000004/demo-frame-03.png', 'Harbour office daylight', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000004', 'photographer', 'd0000000-0004-4000-8000-000000000004/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000004/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000005', 'Wedding filmmaker and director producing narrative multi-day wedding films across Karachi.', array['Weddings', 'Traditional events']::text[], array['Cinematic', 'Documentary']::text[], '{"instagram":"https://instagram.com/momnt.demo.5","website":"https://momnt.example/demo/5"}'::jsonb, 8, true, 'verified'::public.verification_status, '2026-10-09T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000501', 'd0000000-0004-4000-8000-000000000005', 'Mehndi highlight film', 165000, 6, 2, 60, 21, '[{"name":"Drone aerial unit","price":25000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000502', 'd0000000-0004-4000-8000-000000000005', 'Three-day wedding cinema', 340000, 18, 3, 150, 35, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000005', '2026-12-12'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000005', '2026-12-14'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000005', '2026-12-19'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000005', '2026-12-20'::date, 'unavailable') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000051', 'd0000000-0004-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000005/demo-frame-01.png', 'Dholki courtyard lanterns', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000052', 'd0000000-0004-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000005/demo-frame-02.png', 'Bridal procession frame', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000053', 'd0000000-0004-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000005/demo-frame-03.png', 'Coastal sunset couple reel', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000005', 'photographer', 'd0000000-0004-4000-8000-000000000005/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000005/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000006', 'Fine art wedding and editorial photographer working between Lahore heritage venues and private gardens.', array['Weddings', 'Editorial']::text[], array['Fine art', 'Natural light']::text[], '{"instagram":"https://instagram.com/momnt.demo.6","website":"https://momnt.example/demo/6"}'::jsonb, 6, false, 'verified'::public.verification_status, '2026-10-11T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000601', 'd0000000-0004-4000-8000-000000000006', 'Nikah & portraits', 70000, 4, 1, 180, 14, '[{"name":"Archival print box","price":20000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000602', 'd0000000-0004-4000-8000-000000000006', 'Full wedding celebration', 195000, 12, 2, 450, 28, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000006', '2026-12-05'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000006', '2026-12-19'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000006', '2026-12-22'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000006', '2026-12-23'::date, 'unavailable') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000061', 'd0000000-0004-4000-8000-000000000006', 'd0000000-0004-4000-8000-000000000006/demo-frame-01.png', 'Courtyard daylight', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000062', 'd0000000-0004-4000-8000-000000000006', 'd0000000-0004-4000-8000-000000000006/demo-frame-02.png', 'Heirloom jewelry detail', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000063', 'd0000000-0004-4000-8000-000000000006', 'd0000000-0004-4000-8000-000000000006/demo-frame-03.png', 'Bridal portrait by candlelight', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000006', 'd0000000-0004-4000-8000-000000000006', 'photographer', 'd0000000-0004-4000-8000-000000000006/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000006/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000007', 'Cinematographer and visual storyteller specializing in documentary wedding films and live cultural performances.', array['Weddings', 'Traditional events']::text[], array['Documentary', 'Cinematic']::text[], '{"instagram":"https://instagram.com/momnt.demo.7","website":"https://momnt.example/demo/7"}'::jsonb, 10, true, 'verified'::public.verification_status, '2026-10-13T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000701', 'd0000000-0004-4000-8000-000000000007', 'Cinematic wedding film', 160000, 8, 2, 40, 28, '[{"name":"Same-week teaser cut","price":30000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000702', 'd0000000-0004-4000-8000-000000000007', 'Two-day film & stills', 290000, 16, 3, 300, 35, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000007', '2026-12-14'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000007', '2026-12-16'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000007', '2026-12-24'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000071', 'd0000000-0004-4000-8000-000000000007', 'd0000000-0004-4000-8000-000000000007/demo-frame-01.png', 'Night entrance teaser', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000072', 'd0000000-0004-4000-8000-000000000007', 'd0000000-0004-4000-8000-000000000007/demo-frame-02.png', 'Shehnai performance', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000073', 'd0000000-0004-4000-8000-000000000007', 'd0000000-0004-4000-8000-000000000007/demo-frame-03.png', 'Stage dance frame', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000007', 'd0000000-0004-4000-8000-000000000007', 'photographer', 'd0000000-0004-4000-8000-000000000007/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000007/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000008', 'Experienced family wedding photographer covering traditional ceremonies across Lahore and Gulberg.', array['Weddings', 'Traditional events']::text[], array['Classic', 'Natural light']::text[], '{"instagram":"https://instagram.com/momnt.demo.8","website":"https://momnt.example/demo/8"}'::jsonb, 12, false, 'verified'::public.verification_status, '2026-10-15T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000801', 'd0000000-0004-4000-8000-000000000008', 'Barat & stage coverage', 90000, 6, 2, 260, 14, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000802', 'd0000000-0004-4000-8000-000000000008', 'Complete two-day wedding', 175000, 12, 3, 520, 21, '[{"name":"Two parent albums","price":28000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000008', '2026-12-07'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000008', '2026-12-14'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000008', '2026-12-21'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000008', '2026-12-28'::date, 'unavailable') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000081', 'd0000000-0004-4000-8000-000000000008', 'd0000000-0004-4000-8000-000000000008/demo-frame-01.png', 'Haveli courtyard welcome', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000082', 'd0000000-0004-4000-8000-000000000008', 'd0000000-0004-4000-8000-000000000008/demo-frame-02.png', 'Walima family group', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000083', 'd0000000-0004-4000-8000-000000000008', 'd0000000-0004-4000-8000-000000000008/demo-frame-03.png', 'Garden pavilion portrait', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000008', 'd0000000-0004-4000-8000-000000000008', 'photographer', 'd0000000-0004-4000-8000-000000000008/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000008/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000009', 'Studio and location portrait photographer working with bridal ateliers, designers and creative founders in Lahore.', array['Portraits', 'Editorial']::text[], array['Fine art', 'Editorial']::text[], '{"instagram":"https://instagram.com/momnt.demo.9","website":"https://momnt.example/demo/9"}'::jsonb, 5, false, 'verified'::public.verification_status, '2026-10-18T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000901', 'd0000000-0004-4000-8000-000000000009', 'Lookbook half day', 55000, 4, 1, 60, 7, '[{"name":"Studio backdrop kit","price":15000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000000902', 'd0000000-0004-4000-8000-000000000009', 'Campaign full day', 110000, 8, 2, 140, 10, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000009', '2026-12-09'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000009', '2026-12-18'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000091', 'd0000000-0004-4000-8000-000000000009', 'd0000000-0004-4000-8000-000000000009/demo-frame-01.png', 'Silk drape study', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000092', 'd0000000-0004-4000-8000-000000000009', 'd0000000-0004-4000-8000-000000000009/demo-frame-02.png', 'Terrace shadow portrait', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000093', 'd0000000-0004-4000-8000-000000000009', 'd0000000-0004-4000-8000-000000000009/demo-frame-03.png', 'Atelier fitting room', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000009', 'd0000000-0004-4000-8000-000000000009', 'photographer', 'd0000000-0004-4000-8000-000000000009/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000009/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000010', 'Corporate event and cultural videographer in Lahore. New member awaiting initial document verification.', array['Corporate', 'Traditional events']::text[], array['Documentary', 'Classic']::text[], '{"instagram":"https://instagram.com/momnt.demo.10","website":"https://momnt.example/demo/10"}'::jsonb, 3, true, 'pending'::public.verification_status, '2026-11-10T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001001', 'd0000000-0004-4000-8000-000000000010', 'Conference video & stills', 60000, 5, 1, 80, 10, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001002', 'd0000000-0004-4000-8000-000000000010', 'Corporate documentary day', 125000, 8, 2, 120, 14, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000010', '2026-12-11'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000101', 'd0000000-0004-4000-8000-000000000010', 'd0000000-0004-4000-8000-000000000010/demo-frame-01.png', 'Auditorium panel', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000102', 'd0000000-0004-4000-8000-000000000010', 'd0000000-0004-4000-8000-000000000010/demo-frame-02.png', 'Qawali night stage', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000103', 'd0000000-0004-4000-8000-000000000010', 'd0000000-0004-4000-8000-000000000010/demo-frame-03.png', 'Exhibition floor', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000010', 'd0000000-0004-4000-8000-000000000010', 'photographer', 'd0000000-0004-4000-8000-000000000010/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000010/cnic-back-demo.png', 'pending'::public.verification_status, null, null, null)
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000011', 'Commercial and environmental portrait photographer. Verification documents currently under review by Momnt team.', array['Portraits', 'Corporate']::text[], array['Documentary', 'Classic']::text[], '{"instagram":"https://instagram.com/momnt.demo.11","website":"https://momnt.example/demo/11"}'::jsonb, 4, false, 'under_review'::public.verification_status, '2026-11-08T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001101', 'd0000000-0004-4000-8000-000000000011', 'Executive portrait session', 50000, 3, 1, 30, 5, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001102', 'd0000000-0004-4000-8000-000000000011', 'Conference full day', 105000, 7, 2, 180, 7, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000011', '2026-12-15'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000111', 'd0000000-0004-4000-8000-000000000011', 'd0000000-0004-4000-8000-000000000011/demo-frame-01.png', 'Studio portrait', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000112', 'd0000000-0004-4000-8000-000000000011', 'd0000000-0004-4000-8000-000000000011/demo-frame-02.png', 'Executive boardroom', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000113', 'd0000000-0004-4000-8000-000000000011', 'd0000000-0004-4000-8000-000000000011/demo-frame-03.png', 'Workspace ambient', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000011', 'd0000000-0004-4000-8000-000000000011', 'photographer', 'd0000000-0004-4000-8000-000000000011/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000011/cnic-back-demo.png', 'under_review'::public.verification_status, null, null, null)
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000012', 'Natural light wedding and portrait photographer in Islamabad, known for calm outdoor sessions in the Margalla hills.', array['Weddings', 'Portraits']::text[], array['Natural light', 'Fine art']::text[], '{"instagram":"https://instagram.com/momnt.demo.12","website":"https://momnt.example/demo/12"}'::jsonb, 7, false, 'verified'::public.verification_status, '2026-10-20T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001201', 'd0000000-0004-4000-8000-000000000012', 'Margalla outdoor portraits', 48000, 3, 1, 50, 7, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001202', 'd0000000-0004-4000-8000-000000000012', 'Intimate Nikah day', 110000, 6, 2, 240, 14, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001203', 'd0000000-0004-4000-8000-000000000012', 'Full wedding story', 220000, 12, 3, 480, 28, '[{"name":"Handbound linen album","price":32000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000012', '2026-12-08'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000012', '2026-12-18'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000012', '2026-12-25'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000012', '2026-12-26'::date, 'unavailable') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000121', 'd0000000-0004-4000-8000-000000000012', 'd0000000-0004-4000-8000-000000000012/demo-frame-01.png', 'Margalla ridge dusk', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000122', 'd0000000-0004-4000-8000-000000000012', 'd0000000-0004-4000-8000-000000000012/demo-frame-02.png', 'Garden Nikah vows', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000123', 'd0000000-0004-4000-8000-000000000012', 'd0000000-0004-4000-8000-000000000012/demo-frame-03.png', 'Pine forest couple walk', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000012', 'd0000000-0004-4000-8000-000000000012', 'photographer', 'd0000000-0004-4000-8000-000000000012/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000012/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000013', 'Director of photography crafting cinematic wedding films and live event coverage across Islamabad and Northern Pakistan.', array['Weddings', 'Traditional events']::text[], array['Cinematic', 'Documentary']::text[], '{"instagram":"https://instagram.com/momnt.demo.13","website":"https://momnt.example/demo/13"}'::jsonb, 8, true, 'verified'::public.verification_status, '2026-10-22T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001301', 'd0000000-0004-4000-8000-000000000013', 'Walima film & stills', 155000, 7, 2, 150, 21, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001302', 'd0000000-0004-4000-8000-000000000013', 'Signature wedding cinema', 280000, 14, 3, 280, 30, '[{"name":"4K documentary cut","price":40000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000013', '2026-12-12'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000013', '2026-12-19'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000013', '2026-12-20'::date, 'unavailable') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000131', 'd0000000-0004-4000-8000-000000000013', 'd0000000-0004-4000-8000-000000000013/demo-frame-01.png', 'Lawn lantern reception', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000132', 'd0000000-0004-4000-8000-000000000013', 'd0000000-0004-4000-8000-000000000013/demo-frame-02.png', 'Hilltop vows frame', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000133', 'd0000000-0004-4000-8000-000000000013', 'd0000000-0004-4000-8000-000000000013/demo-frame-03.png', 'String quartet evening', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000013', 'd0000000-0004-4000-8000-000000000013', 'photographer', 'd0000000-0004-4000-8000-000000000013/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000013/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000014', 'Editorial portrait and fine art photographer working with independent brands, artists and publications in Islamabad.', array['Editorial', 'Portraits']::text[], array['Editorial', 'Fine art']::text[], '{"instagram":"https://instagram.com/momnt.demo.14","website":"https://momnt.example/demo/14"}'::jsonb, 5, false, 'verified'::public.verification_status, '2026-10-25T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001401', 'd0000000-0004-4000-8000-000000000014', 'Editorial portrait session', 65000, 3, 1, 45, 7, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001402', 'd0000000-0004-4000-8000-000000000014', 'Studio & outdoor lookbook', 130000, 7, 2, 130, 14, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000014', '2026-12-10'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000014', '2026-12-22'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000141', 'd0000000-0004-4000-8000-000000000014', 'd0000000-0004-4000-8000-000000000014/demo-frame-01.png', 'Concrete courtyard study', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000142', 'd0000000-0004-4000-8000-000000000014', 'd0000000-0004-4000-8000-000000000014/demo-frame-02.png', 'Winter sun profile', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000143', 'd0000000-0004-4000-8000-000000000014', 'd0000000-0004-4000-8000-000000000014/demo-frame-03.png', 'Ceramic studio portrait', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000014', 'd0000000-0004-4000-8000-000000000014', 'photographer', 'd0000000-0004-4000-8000-000000000014/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000014/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;
insert into public.photographer_profiles (profile_id, bio, specializations, styles, social_links, years_experience, is_videographer, verification_status, created_at)
values ('d0000000-0004-4000-8000-000000000015', 'Documentary and classic event photographer covering diplomatic receptions, corporate forums and weddings in Islamabad.', array['Corporate', 'Weddings']::text[], array['Classic', 'Documentary']::text[], '{"instagram":"https://instagram.com/momnt.demo.15","website":"https://momnt.example/demo/15"}'::jsonb, 9, false, 'verified'::public.verification_status, '2026-11-01T10:00:00Z'::timestamptz)
on conflict (profile_id) do update set bio = excluded.bio, specializations = excluded.specializations, styles = excluded.styles, social_links = excluded.social_links, years_experience = excluded.years_experience, is_videographer = excluded.is_videographer, verification_status = excluded.verification_status, created_at = excluded.created_at;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001501', 'd0000000-0004-4000-8000-000000000015', 'Diplomatic & summit event', 80000, 5, 1, 180, 5, '[{"name":"Same-evening press selects","price":20000}]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.packages (id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons)
values ('d0000000-0005-4000-8000-000000001502', 'd0000000-0004-4000-8000-000000000015', 'Full wedding coverage', 170000, 10, 2, 400, 21, '[]'::jsonb)
on conflict (id) do update set name = excluded.name, price = excluded.price, hours = excluded.hours, num_photographers = excluded.num_photographers, edited_photos = excluded.edited_photos, delivery_days = excluded.delivery_days, addons = excluded.addons;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000015', '2026-12-14'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.availability (photographer_id, date, status) values ('d0000000-0004-4000-8000-000000000015', '2026-12-23'::date, 'booked') on conflict (photographer_id, date) do update set status = excluded.status;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000151', 'd0000000-0004-4000-8000-000000000015', 'd0000000-0004-4000-8000-000000000015/demo-frame-01.png', 'Embassy garden reception', 0)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000152', 'd0000000-0004-4000-8000-000000000015', 'd0000000-0004-4000-8000-000000000015/demo-frame-02.png', 'Forum keynote address', 1)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.portfolio_images (id, photographer_id, storage_path, caption, sort_order)
values ('d0000000-0006-4000-8000-000000000153', 'd0000000-0004-4000-8000-000000000015', 'd0000000-0004-4000-8000-000000000015/demo-frame-03.png', 'Evening courtyard dinner', 2)
on conflict (id) do update set storage_path = excluded.storage_path, caption = excluded.caption, sort_order = excluded.sort_order;
insert into public.verification_requests (id, user_id, role_requested, cnic_front_path, cnic_back_path, status, admin_note, reviewed_by, reviewed_at)
values ('d0000000-0011-4000-8000-000000000015', 'd0000000-0004-4000-8000-000000000015', 'photographer', 'd0000000-0004-4000-8000-000000000015/cnic-front-demo.png', 'd0000000-0004-4000-8000-000000000015/cnic-back-demo.png', 'verified'::public.verification_status, 'Demo CNIC specimen verified.', 'd0000000-0001-4000-8000-000000000001', now())
on conflict (id) do update set status = excluded.status, cnic_front_path = excluded.cnic_front_path, cnic_back_path = excluded.cnic_back_path;

-- 4. Gigs (10) and Bids (20)
insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)
values ('d0000000-0007-4000-8000-000000000001', 'd0000000-0002-4000-8000-000000000001', 'Intimate rooftop Mehndi in Clifton', 'Weddings', '2026-12-16'::date, 'Karachi', 6, 100000, 140000, 'Looking for documentary coverage for 180 guests with natural warm lantern lighting.', '2026-12-10T23:59:59Z'::timestamptz, 'open'::public.gig_status)
on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;
insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)
values ('d0000000-0007-4000-8000-000000000002', 'd0000000-0002-4000-8000-000000000002', 'Two-day Barat & Walima in Gulberg', 'Weddings', '2026-12-20'::date, 'Lahore', 12, 170000, 230000, 'Family-focused coverage across two evenings with both candid and formal family group portraits.', '2026-12-12T23:59:59Z'::timestamptz, 'open'::public.gig_status)
on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;
insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)
values ('d0000000-0007-4000-8000-000000000003', 'd0000000-0002-4000-8000-000000000003', 'Outdoor Nikah ceremony in F-7', 'Weddings', '2026-12-19'::date, 'Islamabad', 5, 90000, 130000, 'Afternoon garden Nikah with 120 guests. Natural light portraits in the courtyard.', '2026-12-11T23:59:59Z'::timestamptz, 'open'::public.gig_status)
on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;
insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)
values ('d0000000-0007-4000-8000-000000000004', 'd0000000-0003-4000-8000-000000000001', 'Winter bridal lookbook campaign', 'Editorial', '2026-12-15'::date, 'Karachi', 8, 150000, 220000, 'Full-day heritage courtyard editorial shoot for a 14-piece bridal collection.', '2026-12-05T23:59:59Z'::timestamptz, 'awarded'::public.gig_status)
on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;
insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)
values ('d0000000-0007-4000-8000-000000000005', 'd0000000-0002-4000-8000-000000000004', 'Annual fintech leadership forum', 'Corporate', '2026-12-22'::date, 'Karachi', 7, 90000, 130000, 'Keynote speakers, panel discussions, and executive headshots during breakout sessions.', '2026-12-15T23:59:59Z'::timestamptz, 'open'::public.gig_status)
on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;
insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)
values ('d0000000-0007-4000-8000-000000000006', 'd0000000-0002-4000-8000-000000000005', 'Haveli Qawali & Dholki night', 'Traditional events', '2026-12-18'::date, 'Lahore', 5, 80000, 120000, 'Traditional evening gathering in old Lahore with live musicians.', '2026-12-10T23:59:59Z'::timestamptz, 'open'::public.gig_status)
on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;
insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)
values ('d0000000-0007-4000-8000-000000000007', 'd0000000-0002-4000-8000-000000000003', 'Founder & design team portraits', 'Portraits', '2026-12-17'::date, 'Islamabad', 3, 45000, 70000, 'Clean natural light portraits for a 12-person architecture studio.', '2026-12-09T23:59:59Z'::timestamptz, 'open'::public.gig_status)
on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;
insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)
values ('d0000000-0007-4000-8000-000000000008', 'd0000000-0003-4000-8000-000000000001', 'Three-day destination wedding film', 'Weddings', '2026-12-27'::date, 'Lahore', 16, 250000, 350000, 'Seeking a dedicated cinematography team for a three-day family wedding.', '2026-12-18T23:59:59Z'::timestamptz, 'open'::public.gig_status)
on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;
insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)
values ('d0000000-0007-4000-8000-000000000009', 'd0000000-0002-4000-8000-000000000001', 'Family graduation garden dinner', 'Portraits', '2026-12-23'::date, 'Karachi', 3, 40000, 60000, 'Relaxed evening family portraits at home in DHA.', '2026-12-14T23:59:59Z'::timestamptz, 'open'::public.gig_status)
on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;
insert into public.gigs (id, client_id, title, event_type, event_date, city, hours, budget_min, budget_max, description, bid_deadline, status)
values ('d0000000-0007-4000-8000-000000000010', 'd0000000-0002-4000-8000-000000000002', 'Autumn textile exhibition launch', 'Editorial', '2026-11-15'::date, 'Lahore', 4, 55000, 85000, 'Gallery opening and textile detail photography.', '2026-11-10T23:59:59Z'::timestamptz, 'closed'::public.gig_status)
on conflict (id) do update set title = excluded.title, status = excluded.status, bid_deadline = excluded.bid_deadline;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000001', 'd0000000-0007-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000001', 'd0000000-0005-4000-8000-000000000102', 120000, 'Available on 16 Dec. Includes two photographers and 250 edited frames.', 'shortlisted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000002', 'd0000000-0007-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000002', 'd0000000-0005-4000-8000-000000000201', 95000, 'Can cover the full 6-hour Mehndi with classic and candid coverage.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000003', 'd0000000-0007-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000005', 'd0000000-0005-4000-8000-000000000501', 140000, 'Happy to offer our Mehndi highlight film and stills package.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000004', 'd0000000-0007-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000006', 'd0000000-0005-4000-8000-000000000602', 195000, 'Two-photographer fine art coverage across both days in Gulberg.', 'shortlisted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000005', 'd0000000-0007-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000008', 'd0000000-0005-4000-8000-000000000802', 175000, '12 years covering Lahore weddings; includes 520 edited photos.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000006', 'd0000000-0007-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000012', 'd0000000-0005-4000-8000-000000001202', 110000, 'Love F-7 garden Nikahs. Free on 19 Dec with two photographers.', 'shortlisted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000007', 'd0000000-0007-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000015', 'd0000000-0005-4000-8000-000000001502', 125000, 'Available for full afternoon and evening ceremony coverage.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000008', 'd0000000-0007-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000003', 'd0000000-0005-4000-8000-000000000302', 195000, 'Full editorial crew with lighting assistant and motion snippets.', 'awarded'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000009', 'd0000000-0007-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000001', 'd0000000-0005-4000-8000-000000000103', 210000, 'Natural light editorial coverage with medium-format look.', 'rejected'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000010', 'd0000000-0007-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000004', 'd0000000-0005-4000-8000-000000000402', 115000, 'Two corporate photographers with fast 7-day turnaround.', 'shortlisted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000011', 'd0000000-0007-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000015', 'd0000000-0005-4000-8000-000000001501', 110000, 'Can travel to Karachi; includes same-evening press selects.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000012', 'd0000000-0007-4000-8000-000000000006', 'd0000000-0004-4000-8000-000000000007', 'd0000000-0005-4000-8000-000000000701', 120000, 'Experienced with low-light Qawali audio and multi-cam video.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000013', 'd0000000-0007-4000-8000-000000000006', 'd0000000-0004-4000-8000-000000000008', 'd0000000-0005-4000-8000-000000000801', 90000, 'Old Lahore haveli specialist; 6 hours coverage.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000014', 'd0000000-0007-4000-8000-000000000007', 'd0000000-0004-4000-8000-000000000014', 'd0000000-0005-4000-8000-000000001401', 65000, 'Editorial portrait session tailored for architecture studios.', 'shortlisted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000015', 'd0000000-0007-4000-8000-000000000007', 'd0000000-0004-4000-8000-000000000012', 'd0000000-0005-4000-8000-000000001201', 48000, 'Natural daylight portraits on location.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000016', 'd0000000-0007-4000-8000-000000000008', 'd0000000-0004-4000-8000-000000000007', 'd0000000-0005-4000-8000-000000000702', 290000, 'Three-person documentary film crew based in Lahore.', 'shortlisted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000017', 'd0000000-0007-4000-8000-000000000008', 'd0000000-0004-4000-8000-000000000013', 'd0000000-0005-4000-8000-000000001302', 280000, 'Available to travel from Islamabad with full 4K cinema rig.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000018', 'd0000000-0007-4000-8000-000000000009', 'd0000000-0004-4000-8000-000000000001', 'd0000000-0005-4000-8000-000000000101', 45000, '2-hour DHA home garden session, 45 edited photos in 10 days.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000019', 'd0000000-0007-4000-8000-000000000009', 'd0000000-0004-4000-8000-000000000004', 'd0000000-0005-4000-8000-000000000401', 42000, 'Portable soft lighting for evening garden family portraits.', 'submitted'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;
insert into public.bids (id, gig_id, photographer_id, package_id, price, message, status)
values ('d0000000-0008-4000-8000-000000000020', 'd0000000-0007-4000-8000-000000000010', 'd0000000-0004-4000-8000-000000000009', 'd0000000-0005-4000-8000-000000000901', 55000, 'Half-day lookbook and gallery coverage.', 'rejected'::public.bid_status)
on conflict (id) do update set price = excluded.price, message = excluded.message, status = excluded.status;

-- 5. Bookings and Reviews
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000001', 'd0000000-0002-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000001', 'd0000000-0005-4000-8000-000000000102', 'Weddings', '2026-12-21'::date, '18:00:00'::time, 'Clifton Block 4, Karachi', 6, 220, 120000, 'Quiet documentary approach around the family stage.', 'requested'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000002', 'd0000000-0002-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000006', 'd0000000-0005-4000-8000-000000000601', 'Weddings', '2026-12-19'::date, '15:00:00'::time, 'Model Town, Lahore', 4, 140, 70000, 'Daylight courtyard Nikah portraits before sunset.', 'accepted'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000003', 'd0000000-0003-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000003', 'd0000000-0005-4000-8000-000000000302', 'Editorial', '2026-12-15'::date, '09:00:00'::time, 'PECHS Heritage House, Karachi', 10, 30, 195000, '14 bridal looks, stills plus vertical reels.', 'deposit_paid'::public.booking_status, 'd0000000-0007-4000-8000-000000000004')
on conflict (id) do nothing;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000004', 'd0000000-0002-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000012', 'd0000000-0005-4000-8000-000000001202', 'Weddings', '2026-11-18'::date, '13:00:00'::time, 'F-6/3 Garden, Islamabad', 6, 160, 110000, 'Outdoor afternoon reception.', 'shoot_done'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000005', 'd0000000-0002-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000002', 'd0000000-0005-4000-8000-000000000202', 'Weddings', '2026-11-12'::date, '19:00:00'::time, 'DHA Phase 8 Creek Club, Karachi', 10, 350, 180000, 'Full family group list provided.', 'delivered'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000006', 'd0000000-0002-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000001', 'd0000000-0005-4000-8000-000000000101', 'Corporate', '2026-12-05'::date, '17:00:00'::time, 'I.I. Chundrigar Road, Karachi', 2, 40, 45000, 'Evening partner portraits.', 'rejected'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000007', 'd0000000-0002-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000007', 'd0000000-0005-4000-8000-000000000701', 'Weddings', '2026-12-08'::date, '19:00:00'::time, 'Cantt, Lahore', 8, 280, 160000, 'Dates changed by venue.', 'cancelled'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000101', 'd0000000-0002-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000001', 'd0000000-0005-4000-8000-000000000101', 'Portraits', '2026-10-12'::date, '16:00:00'::time, 'Clifton, Karachi', 2, 6, 45000, 'Golden hour family portraits.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000001', 'd0000000-0009-4000-8000-000000000101', 'd0000000-0002-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000001', 5, 'Sara was quiet, unhurried, and captured moments our family will treasure for decades.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000102', 'd0000000-0002-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000002', 'd0000000-0005-4000-8000-000000000201', 'Traditional events', '2026-10-14'::date, '19:00:00'::time, 'PECHS, Karachi', 5, 200, 85000, 'Baraat family portraits.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000002', 'd0000000-0009-4000-8000-000000000102', 'd0000000-0002-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000002', 5, 'Omar organized every family group with patience and delivered ahead of schedule.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000103', 'd0000000-0002-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000003', 'd0000000-0005-4000-8000-000000000301', 'Weddings', '2026-10-16'::date, '15:00:00'::time, 'DHA Phase 6, Karachi', 4, 90, 95000, 'Intimate home Nikah.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000003', 'd0000000-0009-4000-8000-000000000103', 'd0000000-0002-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000003', 5, 'Zainab has an editorial eye for light and small candid exchanges.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000104', 'd0000000-0003-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000004', 'd0000000-0005-4000-8000-000000000402', 'Corporate', '2026-10-18'::date, '09:00:00'::time, 'Clifton Corporate Tower, Karachi', 8, 150, 115000, 'Annual summit.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000004', 'd0000000-0009-4000-8000-000000000104', 'd0000000-0003-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000004', 4, 'Clean executive portraits and punctual delivery for our press kit.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000105', 'd0000000-0002-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000005', 'd0000000-0005-4000-8000-000000000501', 'Weddings', '2026-10-20'::date, '19:30:00'::time, 'Karsaz Gardens, Karachi', 6, 250, 165000, 'Mehndi film.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000005', 'd0000000-0009-4000-8000-000000000105', 'd0000000-0002-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000005', 5, 'Nadia edited our Mehndi film with real warmth and crisp live sound.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000106', 'd0000000-0002-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000006', 'd0000000-0005-4000-8000-000000000601', 'Weddings', '2026-10-22'::date, '14:00:00'::time, 'Gulberg III, Lahore', 4, 110, 70000, 'Courtyard Nikah.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000006', 'd0000000-0009-4000-8000-000000000106', 'd0000000-0002-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000006', 5, 'Hira brings a calm presence and honest colour to every frame.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000107', 'd0000000-0002-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000007', 'd0000000-0005-4000-8000-000000000701', 'Weddings', '2026-10-24'::date, '20:00:00'::time, 'Bedian Road Farmhouse, Lahore', 8, 300, 160000, 'Baraat documentary film.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000007', 'd0000000-0009-4000-8000-000000000107', 'd0000000-0002-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000007', 5, 'Bilal captured the energy of the shehnai and dances without intrusive lighting.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000108', 'd0000000-0002-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000008', 'd0000000-0005-4000-8000-000000000801', 'Traditional events', '2026-10-26'::date, '19:00:00'::time, 'DHA Phase 5, Lahore', 6, 260, 90000, 'Barat stage & arrivals.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000008', 'd0000000-0009-4000-8000-000000000108', 'd0000000-0002-4000-8000-000000000005', 'd0000000-0004-4000-8000-000000000008', 4, 'Dependable team that knew how to manage a large Lahore gathering.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000109', 'd0000000-0002-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000009', 'd0000000-0005-4000-8000-000000000901', 'Editorial', '2026-10-28'::date, '10:00:00'::time, 'MM Alam Studio, Lahore', 4, 12, 55000, 'Winter shawl lookbook.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000009', 'd0000000-0009-4000-8000-000000000109', 'd0000000-0002-4000-8000-000000000002', 'd0000000-0004-4000-8000-000000000009', 5, 'Mehwish understood our textile textures immediately.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000110', 'd0000000-0002-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000012', 'd0000000-0005-4000-8000-000000001201', 'Portraits', '2026-10-30'::date, '16:00:00'::time, 'Trail 5 Overlook, Islamabad', 3, 4, 48000, 'Outdoor couple portraits.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000010', 'd0000000-0009-4000-8000-000000000110', 'd0000000-0002-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000012', 5, 'Ayesha picked the best late-afternoon light in the hills.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000111', 'd0000000-0002-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000013', 'd0000000-0005-4000-8000-000000001301', 'Weddings', '2026-11-02'::date, '18:30:00'::time, 'Serena Courtyard, Islamabad', 7, 240, 155000, 'Walima reception film.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000011', 'd0000000-0009-4000-8000-000000000111', 'd0000000-0002-4000-8000-000000000003', 'd0000000-0004-4000-8000-000000000013', 5, 'Usman delivered a beautifully paced Walima film and stills set.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000112', 'd0000000-0003-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000014', 'd0000000-0005-4000-8000-000000001401', 'Editorial', '2026-11-04'::date, '11:00:00'::time, 'E-7 Studio, Islamabad', 3, 8, 65000, 'Ceramics artisan profile.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000012', 'd0000000-0009-4000-8000-000000000112', 'd0000000-0003-4000-8000-000000000001', 'd0000000-0004-4000-8000-000000000014', 5, 'Rabia composed every frame with quiet precision.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;
insert into public.bookings (id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, status, source_gig_id)
values ('d0000000-0009-4000-8000-000000000113', 'd0000000-0002-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000015', 'd0000000-0005-4000-8000-000000001501', 'Corporate', '2026-11-06'::date, '18:00:00'::time, 'Diplomatic Enclave, Islamabad', 5, 120, 80000, 'Evening forum reception.', 'completed'::public.booking_status, null)
on conflict (id) do nothing;
insert into public.reviews (id, booking_id, reviewer_id, photographer_id, rating, comment)
values ('d0000000-0010-4000-8000-000000000013', 'd0000000-0009-4000-8000-000000000113', 'd0000000-0002-4000-8000-000000000004', 'd0000000-0004-4000-8000-000000000015', 4, 'Haris delivered press selects the same night as promised.')
on conflict (booking_id) do update set rating = excluded.rating, comment = excluded.comment;

commit;
