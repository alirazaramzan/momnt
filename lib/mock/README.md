# Momnt Mock Data & Database Schema Mapping

This directory provides presentational fixtures and sample price constants for the Momnt platform. Screens import from `/lib/mock` until database connections are established.

## Centralized Sample Prices

All prices are defined in [`prices.ts`](file:///c:/Users/alira/OneDrive/Documents/momnt/lib/mock/prices.ts). Every value is explicitly commented as mock sample data in PKR. To adjust platform pricing tiers, edit only `prices.ts`.

---

## Entity to Database Table Mapping

| Domain Type | Future Database Table | Primary Key | Foreign Keys / Relationships | Status Enum Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Photographer` | `photographers` | `id` (uuid) | `user_id` &rarr; `users.id` | `'pending'`, `'under_review'`, `'verified'`, `'rejected'` | Verified professional profiles, specialties, rating, response metrics. |
| `Package` | `packages` | `id` (uuid) | `photographer_id` &rarr; `photographers.id` | N/A | Photographer service packages with hours, crew count, photo counts, and sample price. |
| `PortfolioItem` | `portfolio_items` | `id` (uuid) | `photographer_id` &rarr; `photographers.id` | N/A | Portfolio media placeholders with aspect ratios, tone gradients, and captions. |
| `Booking` | `bookings` | `id` (uuid) | `photographer_id` &rarr; `photographers.id`<br>`client_id` &rarr; `users.id`<br>`package_id` &rarr; `packages.id` | `'requested'`, `'accepted'`, `'deposit'`, `'shoot_done'`, `'delivered'`, `'completed'` | Booking agreement lifecycle, date, venue, guest count, and deposit payment status. |
| `Gig` | `gigs` | `id` (uuid) | `client_id` &rarr; `users.id` | `'open'`, `'reviewing'`, `'awarded'`, `'closed'` | Marketplace gig listings posted by clients with date, city, and budget range. |
| `Bid` | `bids` | `id` (uuid) | `gig_id` &rarr; `gigs.id`<br>`photographer_id` &rarr; `photographers.id` | `'submitted'`, `'shortlisted'`, `'awarded'`, `'declined'` | Bids submitted by photographers with availability and price proposal. |
| `MessageThread` | `message_threads` | `id` (uuid) | `participant_a` &rarr; `users.id`<br>`participant_b` &rarr; `users.id`<br>`booking_id` &rarr; `bookings.id` (opt) | N/A | Direct message conversation channels between clients, photographers, and vendors. |
| `Message` | `messages` | `id` (uuid) | `thread_id` &rarr; `message_threads.id`<br>`sender_id` &rarr; `users.id` | N/A | Individual chat messages with text content, timestamps, and optional attachments. |
| `Vendor` | `vendors` | `id` (uuid) | `user_id` &rarr; `users.id` | `'pending'`, `'under_review'`, `'verified'`, `'rejected'` | Print labs, album binders, and equipment vendors. |
| `Quote` | `quotes` | `id` (uuid) | `vendor_id` &rarr; `vendors.id`<br>`booking_id` &rarr; `bookings.id`<br>`client_id` &rarr; `users.id` | `'quoted'`, `'accepted'`, `'in_progress'`, `'delivered'` | Formal vendor quotation containing itemized print/delivery line items and totals. |
| `Location` | `locations` | `id` (uuid) | `owner_id` &rarr; `users.id` | `'active'`, `'unlisted'` | Verified photo studios and rental locations with slot fees and rules. |
| `Course` | `academy_courses` | `id` (uuid) | `instructor_id` &rarr; `photographers.id` | `'draft'`, `'published'`, `'archived'` | Academy educational courses with lesson sequences and certificate rewards. |
| `Lesson` | `academy_lessons` | `id` (uuid) | `course_id` &rarr; `academy_courses.id` | N/A | Individual video or reading lessons within a course curriculum. |
| `Workshop` | `academy_workshops` | `id` (uuid) | `instructor_id` &rarr; `photographers.id` | `'upcoming'`, `'live'`, `'completed'` | Live interactive workshops with seat limits, registration fees, and live status. |
| `ShotListItem` | `shot_list_items` | `id` (uuid) | `booking_id` &rarr; `bookings.id` | N/A (`done`: boolean) | Pre-event checklist items categorized by group (`essential`, `details`, `candid`, `creative`). |

---

## Privacy & Safety Compliance

- No real individuals, real telephone numbers, or government ID numbers (e.g. CNIC) are included.
- All sample people (Sara Khan, Omar Siddiqui, Hira Anwar, Sara and Ahmed) and businesses (Print House, The Rooftop Studio) are fictionalized placeholders matching the project reference documents.
