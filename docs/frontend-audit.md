# Momnt frontend audit

Snapshot of `main` at commit `327dbe8` (booking form route). Read-only analysis, no source files changed.
Purpose: plan the Supabase backend against what the UI actually renders.

---

## 1. Route list

Route groups in parentheses do not appear in the URL.

### Public (`app/(public)`, layout: `PublicHeader` + `PublicFooter`)

| URL | File | Status |
| :--- | :--- | :--- |
| `/` | `app/(public)/page.tsx` | Built |
| `/photographers` | `app/(public)/photographers/page.tsx` | Built |
| `/photographers/[id]` | `app/(public)/photographers/[id]/page.tsx` + `PhotographerProfileClient.tsx` | Built |
| `/book/[photographerId]` | `app/(public)/book/[photographerId]/page.tsx` + `BookingFormClient.tsx` | Built |
| `/design-system` | `app/(public)/design-system/page.tsx` | Internal showcase, not a product page |

### Auth (`app/(auth)`, layout: `AuthSplitShell`)

| URL | File | Status |
| :--- | :--- | :--- |
| `/sign-in` | `app/(auth)/sign-in/page.tsx` | Built |
| `/sign-up` | `app/(auth)/sign-up/page.tsx` | Built |

### Client (`app/(client)`, layout: `PortalLayout`, nav `CLIENT_NAV_ITEMS`)

| URL | File | Status |
| :--- | :--- | :--- |
| `/client` | `app/(client)/client/page.tsx` | Built (overview) |

### Photographer (`app/(photographer)`, nav `PHOTOGRAPHER_NAV_ITEMS`)

| URL | File | Status |
| :--- | :--- | :--- |
| `/photographer` | `app/(photographer)/photographer/page.tsx` | Built (overview) |

### Vendor (`app/(vendor)`, nav `VENDOR_NAV_ITEMS`)

| URL | File | Status |
| :--- | :--- | :--- |
| `/vendor` | `app/(vendor)/vendor/page.tsx` | Built (overview) |

### Admin (`app/(admin)`, nav `ADMIN_NAV_ITEMS`)

| URL | File | Status |
| :--- | :--- | :--- |
| `/admin` | `app/(admin)/admin/page.tsx` | Built (verification queue) |

### Linked but not built (currently 404)

Linked from `nav-config.ts`, `PublicHeader`, `PublicFooter` or page buttons:

| Portal | Dead links |
| :--- | :--- |
| Public | `/gigs`, `/academy`, `/vendors` |
| Client | `/client/bookings`, `/client/gigs`, `/client/galleries`, `/client/messages`, `/client/academy` |
| Photographer | `/photographer/calendar`, `/photographer/requests`, `/photographer/projects`, `/photographer/gigs`, `/photographer/bids`, `/photographer/academy` |
| Vendor | `/vendor/quote-requests`, `/vendor/orders`, `/vendor/calendar`, `/vendor/reviews` |
| Admin | `/admin/users`, `/admin/bookings`, `/admin/gigs`, `/admin/courses`, `/admin/reports` |

Total: 11 built product pages (plus `/design-system`), 23 linked pages missing.

---

## 2. Page-by-page: data source and forms

Legend: **Mock** = imported from `/lib/mock`. **Hardcoded** = literal values inside the JSX or component state.

### `/` Home
- **Data:** Hardcoded. Three `PhotoPlaceholder` tiles with literal captions, static copy.
- **Form: search** (`role="search"`)

  | Field | Element | Default | Notes |
  | :--- | :--- | :--- | :--- |
  | `city` | text input | `"Karachi"` | free text |
  | `event` | text input | `"Mehndi"` | free text |
  | `date` | text input | `""` | free text, not a date picker |

  Submit runs `router.push("/client")` and ignores the values. It should go to `/photographers?city=&event=&date=`.
- All four "ways to use" links go to `/client` or `/vendor`, not to the matching public pages.

### `/photographers` Search
- **Data:** Mock, `MOCK_PHOTOGRAPHERS`. Filtering and sorting run in the browser (`useMemo`).
- **Form: filters** (sidebar on desktop, `Dialog` on mobile, same controls)

  | Field | Element | Options |
  | :--- | :--- | :--- |
  | `verifiedOnly` | checkbox | default `true` |
  | `city` | select | all, Karachi, Lahore, Islamabad (hardcoded) |
  | `eventType` | select | all, Weddings, Portraits, Editorial, Corporate, Traditional events (matched against `specialisations`) |
  | `style` | select | all, Documentary, Natural light, Classic, Fine art, Editorial, Cinematic |
  | `budget` | select | all, `under_75k`, `75k_150k`, `above_150k` (compared with the cheapest package price) |
  | `role` | select | all, photographer, videographer |
  | `availableDate` | text input | substring match on `nextFree`, e.g. "14 Dec" |
  | `sortBy` | select | rating, price_asc, price_desc, newest (newest sorts by `id` string) |

- **Compare:** checkbox on each card, max 3, bottom bar. The "Compare N photographers" button calls `onClick={() => {}}`, so the compare view doesn't exist yet.
- `onBook={() => {}}` on each card does nothing. It should link to `/book/[id]`.
- Empty state exists. No loading or error state.

### `/photographers/[id]` Profile
- **Data:** Mixed.
  - Name, verified, city and specialisations come from `MOCK_PHOTOGRAPHERS`. The `page.tsx` server component looks them up by id and falls back to the first photographer.
  - **Hardcoded:**
    - The packages list (2 Sara Khan packages from `SAMPLE_PRICES`, ids `"mehndi"`/`"wedding"`). It ignores `photographer.packages`.
    - All 4 portfolio tiles. They ignore `photographer.portfolio`.
    - Booked dates `[4,5,11,12,19,26]` and the month "December 2026".
    - All 3 reviews (text, name, area, month).
- **Form-like controls:** package radio group (`PackageRow`) and date selection (`MonthCalendar`, a day number).
- "Request this date" goes to `/client?book=…&date=14-Dec&package=…`. It should go to `/book/[id]`.
- `generateStaticParams` is built from mock ids. Remove it, or make the page dynamic, once the data is real.

### `/book/[photographerId]` Booking form
- **Data:** The photographer comes from `MOCK_PHOTOGRAPHERS`, falling back to the first one. Packages come from `photographer.packages`.
- **Form: booking request** (`noValidate`, client-side validation only)

  | Field | Element | Default | Validation |
  | :--- | :--- | :--- | :--- |
  | `event` | select | `"Mehndi"` | required. Options: Mehndi, Barat, Walima, Nikah, Portrait session, Corporate event |
  | `date` | text input | query `date`, else `nextFree` | required, free text |
  | `startTime` | text input | `"6:00 pm"` | required, free text |
  | `guests` | number input | `"250"` | required, >= 1 |
  | `venue` | text input | `"Clifton, Karachi"` | required |
  | `notes` | textarea | `""` | optional ("Anything we should know") |
  | `packageId` | radio group (`PackageRow`) | query `package`, else the first package | required |

- **Derived on the client:** `deposit = round(price * 0.25 / 1000) * 1000`. This must move to the server (agent rule 6).
- Submit is simulated with `setTimeout(800)`, then a confirmation view with a `Stepper` (Requested → Accepted → Deposit → Delivered).
- Cancellation copy has a `[CONFIRM RULES]` placeholder.
- Missing booking-form fields compared with the feature list: `duration`, `budget`, a real `requirements` field (`notes` covers it).

### `/sign-in`
- **Data:** none.
- **Form: sign in**

  | Field | Element | Validation |
  | :--- | :--- | :--- |
  | `email` | email input | contains `@` and `.` |
  | `password` | password input | required |

- "Forgot password?" button: uses the email field and shows a simulated "reset email dispatched" banner.
- Submit always goes to `/client`, whatever the role. Needs a role-based redirect.

### `/sign-up`
- **Data:** hardcoded role options.
- **Form: create account**

  | Field | Element | Validation |
  | :--- | :--- | :--- |
  | `role` | custom radio group | `client` (client or agency), `photographer` (photographer or mentor), `vendor` (vendor or location owner) |
  | `email` | email input | contains `@` and `.` |
  | `password` | password input | >= 8 chars |

- Missing compared with the feature list: no **name**, no **agency** choice or business name or contact person, no phone, no terms checkbox.
- Submit is simulated, then redirects by role.

### `/client` Client overview
- **Data:** Mock. Uses `MOCK_BOOKINGS[0]` and `MOCK_GIGS[0]`.
- **Hardcoded:** "Deposit paid" chip (doesn't read `depositPaid`), "Message Sara" button label.
- Forms: none. Links go to `/gigs`, `/client/messages`, `/client/bookings`, `/client/gigs`.

### `/photographer` Photographer overview
- **Data:** Mock. Uses `MOCK_PHOTOGRAPHERS[0]` as the "logged-in" photographer, and `MOCK_BOOKINGS` filtered by status `requested` or `deposit`.
- **Hardcoded:** the verification banner text always says "Verified member". It should switch on `status`.
- Bookings are not filtered by photographer.
- Forms: none.

### `/vendor` Vendor overview
- **Data:** Mock. Uses `MOCK_QUOTES` (all of them) and `MOCK_LOCATIONS[0]`.
- The quote rows show `vendorName`. From the vendor's own point of view this should be the **client** name. The `Quote` type has no client field.
- Forms: none.

### `/admin` Verification queue
- **Data:** Mock. `MOCK_PHOTOGRAPHERS` filtered by `status` (`pending` or `under_review`, and `verified`).
- **Hardcoded:** the flags line ("EXIF metadata: Verified", "Portfolio duplicate scan: 0 matches", "ID document: Clear"), "Target SLA: 48 hours", and the "Under review" chip for every row.
- "Request info" and "Approve verification" buttons have no handlers. There's no reject action and no reason field.
- Only photographers are listed, not vendors.

### Shared layouts
- `PortalLayout`: "Sign out" is just a link to `/sign-in`. No user name or avatar shown. No role guard.
- `PublicHeader`: always shows "Sign in", even when the user is logged in.

---

## 3. Components that need real data

Inferred props, plus the domain shape each should be fed from. Existing types in `lib/types/index.ts` are referenced where they fit.

### Session / current user (new, needed by every portal)
```ts
interface CurrentUser {
  id: string;                 // auth.users.id
  email: string;
  role: "client" | "agency" | "photographer" | "vendor" | "admin";
  fullName: string;
  avatarUrl?: string;
  verificationStatus?: VerificationStatus; // photographer / vendor only
}
```
Consumers: `PortalLayout` (sign out, name), `PublicHeader` (sign in vs portal link), all portal pages (replace `MOCK_*[0]`).

### `PhotographerCard` (`components/patterns`)
```ts
interface PhotographerCardData {
  id: string;
  name: string;
  avatarSrc?: string;
  verified: boolean;
  city: string;
  specialisations: string[];  // joined for display
  startingPrice: number;      // MIN(packages.price), compute in SQL
  nextFreeDate?: string;      // ISO date, first date with no booking or block
  portfolioPreview: PortfolioItem[]; // first 3
  rating: number;             // AVG(reviews), needed for sort
  createdAt: string;          // needed for "newest" sort
}
```

### Photographer search page
```ts
interface PhotographerSearchParams {
  verifiedOnly?: boolean;
  city?: string;
  eventType?: string;
  style?: string;
  budget?: "under_75k" | "75k_150k" | "above_150k";
  role?: "photographer" | "videographer";
  availableDate?: string;     // ISO date
  sort?: "rating" | "price_asc" | "price_desc" | "newest";
}
// returns PhotographerCardData[]
```

### `PhotographerProfileClient`
Needs the full `Photographer` plus reviews and availability:
```ts
interface PhotographerProfile extends Photographer {
  reviews: Review[];
  availability: { month: string; year: number; bookedDates: string[] }; // ISO dates
}
interface Review {
  id: string;
  bookingId: string;
  authorName: string;
  authorArea?: string;        // "Clifton, Karachi"
  body: string;
  ratingOverall: number;
  ratingCommunication?: number;
  ratingProfessionalism?: number;
  ratingQuality?: number;
  ratingTimeliness?: number;
  createdAt: string;
  photographerReply?: string;
}
```

### `PackageRow` (`components/patterns`)
`{ name: string; detail: string; price: number; selected?: boolean }`, fed from `Package` (`lib/types`). `detail` is formatted from `hours`, `photographers`, `editedPhotos` and `deliveryTime`.

### `MonthCalendar` (`components/patterns`)
Takes `month: string`, `year`, `daysCount`, `firstDayOffset` and `bookedDates: number[]` (day-of-month numbers). Backend should return ISO dates. A small adapter turns them into day numbers, so the component stays unchanged.

### `BookingFormClient`
Input: `Photographer` (needs `id`, `name`, `verified`, `replyTime`, `nextFree`, `packages[]` with real `id`).
Output payload for a server action:
```ts
interface CreateBookingInput {
  photographerId: string;
  packageId: string;
  eventType: string;
  eventDate: string;          // ISO date (the UI currently sends free text)
  startTime: string;          // "18:00" (the UI currently sends "6:00 pm")
  guests: number;
  venue: string;
  notes?: string;
}
// server returns { bookingId, depositAmount, status: "requested" }
```

### `Stepper` (`components/ui`)
`{ steps: string[]; currentStep: number }`. Map `BookingStatus` to an index on the server or in a helper.

### Portal overview cards
- **Client:** `Booking` (needs `photographerName`, `depositPaid`, `package`) and `Gig` with `bids.length`.
- **Photographer:** `Booking[]` filtered by `photographer_id = me` and status, plus `CurrentUser.verificationStatus` for the banner.
- **Vendor:** `Quote` needs `clientName` and `requestedAt`. Also `Location`.
- **Admin queue:**
  ```ts
  interface VerificationQueueItem {
    submissionId: string;
    subjectType: "photographer" | "vendor" | "mentor" | "location";
    subjectId: string;
    name: string;
    city: string;
    specialisations: string[];
    bio?: string;
    status: VerificationStatus;
    submittedAt: string;
    flags: { kind: "exif" | "duplicate" | "id_document"; result: string; severity: "ok" | "warn" | "fail" }[];
  }
  ```

### `PhotoPlaceholder` / `PhotoGrid`
Currently they take `tone` and a caption. Once uploads exist, add an `src` (signed Storage URL). Until then `portfolio_items` can store `tone` and caption fields so the UI keeps working.

### Type gaps found in `lib/types`
- `Gig` has no `status` and no `clientId`. The README lists `open | reviewing | awarded | closed`.
- `Bid` has no `status`, `message`, `gigId` or `createdAt`.
- `Booking` has no `clientId`, `createdAt`, `endTime`/`duration`, `budget`, or deposit amount.
- `Quote` has no `clientId` or `clientName`.
- `Photographer` has no `userId`, `createdAt`, `socialLinks` or `experienceYears`.
- **Event vocabulary differs between screens:** search uses "Weddings / Portraits…" and booking uses "Mehndi / Barat…". The proposal spells them "Baraat / Nikkah". Pick one list for the database.

---

## 4. Missing pages compared with FYP-I

| FYP-I feature | What exists | Missing pages / pieces |
| :--- | :--- | :--- |
| **Accounts and roles** | `/sign-in`, `/sign-up` (UI only) | Real auth. Agency fields at sign-up. Email verification page (`/verify-email` or callback route). Password reset page (`/reset-password`). Account settings (`/client/settings`, `/photographer/settings`, `/vendor/settings`). Role-guarded portals. Account deletion. |
| **Profiles and portfolio** | Public profile (partly hardcoded) | Photographer profile editor (bio, city, specialisations, styles, social links). Portfolio upload and manage page. Client profile page. |
| **Packages** | Shown on profile and booking form | Package create / edit / delete page for photographers (e.g. `/photographer/packages`). The profile must render real `packages`. |
| **Search and filters** | `/photographers` (client-side filter) | Server-side filtering. Compare view for up to 3 photographers (button is a no-op). Home search wired to `/photographers` with query params. Real date picker. |
| **Availability calendar** | Read-only `MonthCalendar` on the profile | `/photographer/calendar` (mark unavailable, see booked days, change month). Month navigation on the public profile. |
| **Booking flow** | `/book/[id]` form (simulated submit) | `/client/bookings` list and detail. `/photographer/requests` (accept / reject / propose another date or package). Status updates through `deposit` (mock) → `shoot_done` → `delivered` → `completed`. Cancellation rules text. Email notifications. |
| **Verification and admin review** | `/admin` queue card (static) | Photographer (and vendor) verification submission page: CNIC upload, phone, portfolio 10–20, social links, experience. Verification status banner driven by real status. Admin review detail page (`/admin/verifications/[id]`) with documents, portfolio, flags, approve / reject with reason / request info. `/admin/users`. Status emails. |
| **Gig board with bidding and award** | Nothing (only mock data and a client overview card) | Public / photographer gig board (`/gigs`, `/photographer/gigs`). Post a gig form (`/client/gigs/new`). Gig detail. Place a bid form (one per photographer, verified only). `/photographer/bids`. `/client/gigs` with a bid compare view (design exists: "Compare bids"). Shortlist and award (creates a booking, notifies others). Auto-expiry. `/admin/gigs`. |

Designed in `design-reference/` but not coded yet (relevant to FYP-I): Gig posting, Compare bids, Photographer dashboard (fuller version), Verification review, Project page and Messages (FYP-II).

---

## 5. Proposed database tables (FYP-I first)

Derived from what the UI renders, plus the minimum the FYP-I flow needs. Every table gets RLS. `id uuid pk default gen_random_uuid()` and `created_at timestamptz default now()` are implied on every table and not repeated.

### Enums
```sql
user_role            : client | agency | photographer | vendor | admin
verification_status  : pending | under_review | verified | rejected
booking_status       : requested | accepted | deposit | shoot_done | delivered | completed | cancelled | declined
gig_status           : open | reviewing | awarded | closed | expired
bid_status           : submitted | shortlisted | awarded | declined | withdrawn
professional_role    : photographer | videographer | both
payment_status       : pending | paid | failed | cancelled
```
`cancelled` and `declined` are added to `booking_status` because the feature list has accept, reject and cancellation. The UI types don't have them yet.

### `profiles` (1:1 with `auth.users`)
| Column | Type | Source in UI |
| :--- | :--- | :--- |
| `id` | uuid pk → `auth.users.id` | |
| `role` | `user_role` | sign-up role picker |
| `full_name` | text | names shown everywhere (not collected at sign-up yet) |
| `email` | text | sign-up |
| `phone` | text null | verification |
| `city` | text null | |
| `avatar_url` | text null | `Avatar` |
| `business_name` | text null | agency accounts |
| `contact_person` | text null | agency accounts |
| `updated_at` | timestamptz | |

### `photographers`
| Column | Type | Source in UI |
| :--- | :--- | :--- |
| `user_id` | uuid unique → `profiles.id` | |
| `display_name` | text | `name` |
| `slug` | text unique | URL `/photographers/[id]` |
| `city` | text | card, filter |
| `bio` | text | admin queue, profile |
| `specialisations` | text[] | card, filter "Event type" |
| `styles` | text[] | filter "Style" |
| `professional_role` | `professional_role` | filter "Professional" |
| `experience_years` | int null | verification |
| `social_links` | jsonb | verification |
| `reply_time_label` | text | "within the hour" (later computed) |
| `verification_status` | `verification_status` default `pending` | badge, admin queue |
| `verified_at` | timestamptz null | |
| `is_mentor` | bool default false | sign-up "photographer or mentor" |

Computed in a view (`photographer_cards`), not stored: `rating` (avg reviews), `starting_price` (min package price), `next_free_date`, `review_count`.

### `packages`
| Column | Type | Source in UI |
| :--- | :--- | :--- |
| `photographer_id` | uuid → `photographers.id` | |
| `name` | text | `PackageRow.name` |
| `hours` | int | detail line |
| `crew_count` | int | `photographers` |
| `edited_photos` | int | detail line |
| `delivery_time` | text | "3 weeks" |
| `price_pkr` | int | price |
| `add_ons` | jsonb null | feature list |
| `is_active` | bool default true | admin "packages active" |
| `sort_order` | int | |

### `portfolio_items`
| Column | Type | Source in UI |
| :--- | :--- | :--- |
| `photographer_id` | uuid → `photographers.id` | |
| `storage_path` | text null | future real image |
| `caption` | text | `caption` |
| `number` | text | camera caption "No. 014" |
| `event` | text | camera caption |
| `aperture` | text | camera caption |
| `aspect` | text | `aspect` |
| `tone` | text | placeholder tone (until real images) |
| `phash` | text null | duplicate check (FYP-II) |
| `exif` | jsonb null | verification signal |
| `sort_order` | int | |

### `availability_blocks`
Days the photographer marks as unavailable. Booked days come from `bookings`.
| Column | Type |
| :--- | :--- |
| `photographer_id` | uuid → `photographers.id` |
| `date` | date |
| `reason` | text null |
| unique (`photographer_id`, `date`) | |

### `bookings`
| Column | Type | Source in UI |
| :--- | :--- | :--- |
| `client_id` | uuid → `profiles.id` | `clientName` |
| `photographer_id` | uuid → `photographers.id` | |
| `package_id` | uuid → `packages.id` | package radio |
| `gig_id` | uuid null → `gigs.id` | set when awarded from a gig |
| `event_type` | text | event select |
| `event_date` | date | date |
| `start_time` | time | start time |
| `duration_hours` | int null | feature list |
| `guests` | int | guests |
| `venue` | text | venue |
| `notes` | text null | "Anything we should know" |
| `budget_pkr` | int null | feature list |
| `package_snapshot` | jsonb | name, hours, crew, edited, price at the time of booking |
| `price_pkr` | int | server-set from the package |
| `deposit_pkr` | int | server-calculated (25%, rounded) |
| `status` | `booking_status` default `requested` | `Stepper` |
| `proposed_date` | date null | "propose another date" |
| `proposed_package_id` | uuid null | "propose another package" |
| `decline_reason` | text null | |
| `updated_at` | timestamptz | |

### `booking_events` (status history and audit)
| Column | Type |
| :--- | :--- |
| `booking_id` | uuid → `bookings.id` |
| `actor_id` | uuid → `profiles.id` |
| `from_status` / `to_status` | `booking_status` |
| `note` | text null |

### `payments` (mock)
| Column | Type |
| :--- | :--- |
| `booking_id` | uuid → `bookings.id` |
| `kind` | text (`deposit` / `balance`) |
| `amount_pkr` | int (server-calculated) |
| `status` | `payment_status` |
| `paid_at` | timestamptz null |

### `reviews`
| Column | Type | Source in UI |
| :--- | :--- | :--- |
| `booking_id` | uuid unique → `bookings.id` | only after `completed` |
| `photographer_id` | uuid → `photographers.id` | |
| `author_id` | uuid → `profiles.id` | name on the review |
| `body` | text | review text |
| `rating_communication` / `rating_professionalism` / `rating_quality` / `rating_timeliness` | smallint 1–5 | feature list |
| `rating_overall` | numeric generated | card rating |
| `photographer_reply` | text null | feature list |

### `verification_submissions`
| Column | Type | Source in UI |
| :--- | :--- | :--- |
| `subject_type` | text (`photographer` / `vendor` / `mentor` / `location`) | admin queue |
| `subject_id` | uuid | |
| `user_id` | uuid → `profiles.id` | |
| `status` | `verification_status` | chip |
| `experience_years` | int null | |
| `social_links` | jsonb | |
| `submitted_at` | timestamptz | SLA |
| `reviewed_by` | uuid null → `profiles.id` (admin) | |
| `reviewed_at` | timestamptz null | |
| `decision_reason` | text null | reject with reason |
| `info_request` | text null | "Request info" |

### `verification_documents`
| Column | Type |
| :--- | :--- |
| `submission_id` | uuid → `verification_submissions.id` |
| `kind` | text (`cnic_front` / `cnic_back` / `portfolio` / `other`) |
| `storage_path` | text (private bucket) |

### `verification_flags`
| Column | Type | Source in UI |
| :--- | :--- | :--- |
| `submission_id` | uuid → `verification_submissions.id` | |
| `kind` | text (`exif` / `duplicate` / `id_document`) | flags line in admin card |
| `severity` | text (`ok` / `warn` / `fail`) | |
| `detail` | text | "0 matches", "Verified" |
| `matched_item_id` | uuid null → `portfolio_items.id` | duplicate check |

### `gigs`
| Column | Type | Source in UI / mock |
| :--- | :--- | :--- |
| `client_id` | uuid → `profiles.id` | `clientName` |
| `title` | text | title |
| `event_type` | text | `eventType` |
| `city` | text | city |
| `event_date` | date | date |
| `hours` | int | hours |
| `budget_min_pkr` / `budget_max_pkr` | int | `budgetFrom` / `budgetTo` |
| `description` | text | description |
| `reference_images` | text[] (storage paths) | feature list |
| `bid_deadline` | timestamptz | `bidDeadline` |
| `status` | `gig_status` default `open` | README mapping |
| `awarded_bid_id` | uuid null → `bids.id` | award |

### `bids`
| Column | Type | Source in UI / mock |
| :--- | :--- | :--- |
| `gig_id` | uuid → `gigs.id` | |
| `photographer_id` | uuid → `photographers.id` | |
| `price_pkr` | int | price |
| `message` | text | feature list |
| `package_id` | uuid null → `packages.id` | feature list |
| `portfolio_item_ids` | uuid[] | feature list |
| `is_available` | bool | `availability` "Free" (server-checked) |
| `status` | `bid_status` default `submitted` | |
| unique (`gig_id`, `photographer_id`) | | one bid per photographer |

RLS note: photographers can read only their own bids. The gig owner can read all bids on their gig.

### `notifications`
| Column | Type |
| :--- | :--- |
| `user_id` | uuid → `profiles.id` |
| `kind` | text (`booking_requested`, `booking_answered`, `verification_status`, `new_bid`, `bid_awarded`, …) |
| `payload` | jsonb |
| `read_at` | timestamptz null |
| `emailed_at` | timestamptz null |

### FYP-II tables (already mocked in UI, sketch only)
- `vendors` (`user_id`, `name`, `category`, `city`, `description`, `verification_status`)
- `quotes` (`vendor_id`, `client_id`, `booking_id` null, `status quote_status`, `valid_until`, `notes`, `total_pkr`)
- `quote_line_items` (`quote_id`, `label`, `price_pkr`)
- `locations` (`owner_id`, `name`, `area`, `city`, `capacity`, `fees jsonb`, `rules text[]`, `contact_note`, `verified`)
- `message_threads`, `messages`
- `academy_courses`, `academy_lessons`, `academy_workshops`, `enrollments`
- `shot_list_items`
- `galleries`, `gallery_images`, `share_links`

### Storage buckets
| Bucket | Access |
| :--- | :--- |
| `avatars` | public read, owner write |
| `portfolio` | public read for verified photographers, owner write |
| `verification-docs` | private. Owner insert, admin read only. |
| `gig-references` | gig owner and bidding photographers read |

---

## Quick wins to note for the frontend owner (no action taken)

1. The profile page ignores `photographer.packages`, `portfolio` and reviews, and hardcodes Sara Khan data.
2. "Request this date" and the card "Book this date" don't link to `/book/[id]`.
3. The home search ignores its inputs and goes to `/client`.
4. Date and time fields are free text. The backend needs ISO dates and times.
5. Sign-up collects no name and no agency details.
6. Portal pages use `MOCK_*[0]` as the logged-in user.
7. The client calculates the deposit. The server must recalculate it.
