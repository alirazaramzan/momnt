# Auth test checklist

Manual checks for role-based route protection. Run against `npm run dev` with a Supabase project that has all migrations applied.

How it works: [proxy.ts](../proxy.ts) guards every portal URL. Pages and server actions check again with [lib/auth/requireRole.ts](../lib/auth/requireRole.ts). Portal ownership is defined once in `PORTAL_ROLES` in [lib/auth/roles.ts](../lib/auth/roles.ts).

## Setup

Create one confirmed account per role. Sign-up sets the role. Admin is set by hand in the SQL editor.

| Account | Role | How to create |
| --- | --- | --- |
| client@test.momnt | client | Sign up as client |
| agency@test.momnt | agency | Sign up as agency |
| photo@test.momnt | photographer | Sign up as photographer |
| vendor@test.momnt | vendor | Sign up as vendor |
| admin@test.momnt | admin | Sign up, then `update public.profiles set role = 'admin' where id = '<uuid>';` |

Use a private window per account, or sign out between rows.

## 1. Role against portal

Open each URL while signed in as the row's role. Also try one deep link per portal (for example `/photographer/calendar`) to confirm sub-paths behave the same.

Expected: ✅ = page loads. Otherwise the browser lands on the path shown.

| Signed in as | `/client` | `/photographer` | `/vendor` | `/admin` |
| --- | --- | --- | --- | --- |
| Signed out | `/sign-in?next=%2Fclient` | `/sign-in?next=%2Fphotographer` | `/sign-in?next=%2Fvendor` | `/sign-in?next=%2Fadmin` |
| client | ✅ | `/client` | `/client` | `/client` |
| agency | ✅ | `/client` | `/client` | `/client` |
| photographer | `/photographer` | ✅ | `/photographer` | `/photographer` |
| vendor | `/vendor` | `/vendor` | ✅ | `/vendor` |
| admin | `/admin` | `/admin` | `/admin` | ✅ |
| Signed in, no `profiles` row | `/` | `/` | `/` | `/` |

- [ ] Signed out row
- [ ] client row
- [ ] agency row
- [ ] photographer row
- [ ] vendor row
- [ ] admin row
- [ ] No-profile row (delete the `profiles` row of a throwaway account in the SQL editor)

## 2. Return URL after sign-in

- [ ] Signed out, open `/photographer/calendar?month=12`. Lands on `/sign-in?next=%2Fphotographer%2Fcalendar%3Fmonth%3D12`.
- [ ] Sign in as photographer. Lands on `/photographer/calendar?month=12`.
- [ ] Signed out, open `/admin/users`, then sign in as client. Lands on `/client`, not `/admin/users`.
- [ ] Open `/sign-in?next=https://example.com` and sign in. Lands on your own dashboard.
- [ ] Open `/sign-in?next=//example.com` and sign in. Lands on your own dashboard.
- [ ] Open `/sign-in?next=/photographers` (public page) and sign in as any role. Lands on `/photographers`.
- [ ] Open `/sign-in` with no `next` and sign in. Lands on your own dashboard.

## 3. Public pages stay public

Signed out, each page loads with no redirect:

- [ ] `/`
- [ ] `/photographers`
- [ ] `/photographers/<id>`
- [ ] `/book/<photographerId>`
- [ ] `/sign-in`, `/sign-up`, `/reset-password`
- [ ] `/api/health`
- [ ] `/clientele` or any path that only starts with a portal name is not treated as a portal (404, not a sign-in redirect)

## 4. Photographer verification banner

Signed in as photographer, open `/photographer`. Change state in the SQL editor (the `protect_verification_status` trigger allows the SQL editor), then reload.

| State | How to set | Expected banner |
| --- | --- | --- |
| No profile row | `delete from public.photographer_profiles where profile_id = '<uuid>';` | "Your photographer profile is not set up yet…" brass border |
| pending | insert or update the row with `verification_status = 'pending'` | "Verification pending…" brass border |
| under_review | `update public.photographer_profiles set verification_status = 'under_review' where profile_id = '<uuid>';` | "Your documents are under review…" brass border |
| verified | same, `'verified'` | "Verified member…" brass border |
| rejected | same, `'rejected'` | "Verification was not approved…" alert border |
| Read fails | Temporarily stop Supabase or block the network in DevTools after the page shell loads | "We could not load your verification status…" alert border |

- [ ] Every state renders its banner and the rest of the page still renders
- [ ] A mist skeleton shows briefly before the banner streams in
- [ ] No state causes an error page or console error

## 5. Session edges

- [ ] Sign out from a portal. Lands on `/sign-in`. Pressing Back then reloading redirects to `/sign-in?next=…`.
- [ ] Change a user's role in the SQL editor while they are signed in. Their next portal request follows the new role.
- [ ] Expired session (clear `sb-*` cookies in DevTools) on a portal page. Reload goes to `/sign-in?next=…`.

