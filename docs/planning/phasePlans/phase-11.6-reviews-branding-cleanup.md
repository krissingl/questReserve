# Phase 11.6: Reviews & Branding Cleanup

_Created: 2026-06-06 | Status: DRAFT_

## Goal

Implement a three-way review system gated by interaction history, and perform a structured audit and cleanup of visual consistency across the customer, provider, and guest portals.

## Context

Phase 11.5 (Profiles & Communication) is complete. It delivered: the polished provider My Account page, the public provider profile page at `/providers/:providerId/profile` (guest layout), the provider customer profile view at `/provider/customers/:customerId` (provider layout), the `AvatarIcon` component, customer name enrichment on the Provider Bookings page, and the booking-scoped messaging backend and provider-side `MessageThread` UI.

The surfaces this phase extends:

- **`ProviderCustomerProfile.tsx`** — where a provider views a customer's booking history at their locations. This is the entry point for the "provider reviews a customer" flow.
- **`PublicProviderProfile.tsx`** — the public-facing provider profile page (guest layout, accessible to guests and authenticated customers). This is the entry point for the "customer reviews a provider" flow.
- **Location detail pages** — the customer and guest location detail pages (`/customer/locations/:id` and `/locations/:id`). These are the entry points for the "customer reviews a location" flow.

The Phase 11.5 messaging backend established the `message` table. Reviews introduce a new `review` table — a separate concern from messages.

Existing backend patterns in use:
- Repository/service/controller pattern (Phases 4–6).
- Public routes (no `authenticate` middleware) — established in Phase 10.2 and extended in Phase 11.5 Step 5 (`GET /api/providers/:id/public`).
- Provider-authenticated routes — `authenticate` + `requireRole('provider')`.
- Customer-authenticated routes — `authenticate` + `requireRole('customer')`.

The "Booking Reviews" item has been in the stretch goals of `mvp-implementation-phases.md` since the start of the project. This phase promotes it into MVP scope with a narrower, interaction-gated design.

---

## Steps

### Step 1: Backend — review table migration and ReviewRepository

Create a Knex migration for the `review` table:

```
review
  id            uuid primary key default gen_random_uuid()
  reviewer_id   uuid not null
  reviewer_type text not null check (reviewer_type in ('provider', 'customer'))
  target_id     uuid not null
  target_type   text not null check (target_type in ('provider', 'customer', 'location'))
  booking_id    uuid not null references booking(id)
  rating        integer not null check (rating >= 1 and rating <= 5)
  body          text
  created_at    timestamptz not null default now()
```

Design decisions:
- `reviewer_id` / `reviewer_type` identify who is leaving the review. `target_id` / `target_type` identify what is being reviewed. This is a flat polymorphic design — no FK enforcement at the DB level for the polymorphic columns, validated at the service layer.
- `booking_id` is required for all reviews. It is the sole basis for the "interaction gating" check: a review can only exist if the booking exists and the reviewer was a party to it.
- `body` is optional — a star rating without text is valid.
- A composite unique constraint on `(reviewer_id, target_id, target_type, booking_id)` prevents a reviewer from leaving duplicate reviews for the same target on the same booking.

Create `ReviewRepository` at `questreserve-backend/src/repositories/review.repository.ts` with the following methods:

- `create(data)` — insert a review record and return it.
- `findByTarget(targetId, targetType)` — return all reviews for a given target (e.g. all reviews of a provider, all reviews of a location), ordered by `created_at` descending.
- `findByBookingAndReviewer(bookingId, reviewerId, reviewerType)` — check whether a review already exists for this booking+reviewer combination (used for duplicate guard).
- `findAverageRating(targetId, targetType)` — return the average rating and review count for a target.

**Files created:**
- `questreserve-backend/migrations/` (new migration for `review` table)
- `questreserve-backend/src/repositories/review.repository.ts`

---

### Step 2: Backend — ReviewService and review API endpoints

Create `ReviewService` at `questreserve-backend/src/services/review.service.ts`. It must implement the following business rules:

**Interaction gating (all review types):** Before creating a review, the service must verify that the booking referenced by `booking_id` exists and that the reviewer was a party to it (either the customer who made the booking, or the provider who owns the booking's location). Fail with `403` if the reviewer was not a party.

**Duplicate guard:** Call `ReviewRepository.findByBookingAndReviewer`. If a review already exists for this `(bookingId, reviewerId, reviewerType)`, return `409 Conflict`.

**Target type rules** (enforced at the service layer):
- A `provider` reviewer may only target a `customer` (`target_type: 'customer'`).
- A `customer` reviewer may only target a `provider` (`target_type: 'provider'`) or a `location` (`target_type: 'location'`).
- Any other combination is rejected with `400`.

Create the following endpoints and register them on an `/api/reviews` router:

- `POST /api/reviews` — Create a review. Requires authentication (provider or customer). Body: `{ targetId, targetType, bookingId, rating, body? }`. The service resolves `reviewerId` and `reviewerType` from the auth token. Returns the created review (`201`).
- `GET /api/reviews?targetId=:id&targetType=:type` — List all reviews for a target. No authentication required (publicly readable). Returns `{ reviews: [...], averageRating: number, count: number }`.

No edit or delete endpoints for MVP — reviews are immutable once submitted.

**Files created:**
- `questreserve-backend/src/services/review.service.ts`
- `questreserve-backend/src/api/reviews/` (controller + router)

---

### Step 3: Frontend — ReviewForm component

Create a reusable `ReviewForm` component at `questreserve-frontend/src/components/ReviewForm/ReviewForm.tsx`.

Props:
- `bookingId: string`
- `targetId: string`
- `targetType: 'provider' | 'customer' | 'location'`
- `onSuccess?: () => void`

The component renders:
- A 1–5 star rating selector (five clickable/tappable star icons; active stars use Spell Gold, inactive stars use a muted tone). No third-party rating library — render with SVG or Unicode stars styled with design tokens.
- An optional textarea for a written review (placeholder: "Share your experience…").
- A "Submit Review" button.

Validation (Zod): rating is required and must be 1–5. Body is optional with a maximum of 1000 characters.

On submit, call `POST /api/reviews`. On success, show inline feedback ("Review submitted — thank you!") and call `onSuccess` if provided. On failure, show the server error inline. If the server returns `409`, show "You have already reviewed this" rather than a generic error.

Add `submitReview(payload)` to the appropriate API module (see per-step notes in Steps 4–6 for which module each context uses).

The component must not contain any logic that is specific to provider, customer, or location context — it is generic and driven entirely by props.

**Files created:**
- `questreserve-frontend/src/components/ReviewForm/ReviewForm.tsx`

---

### Step 4: Frontend — ReviewList component

Create a reusable `ReviewList` component at `questreserve-frontend/src/components/ReviewList/ReviewList.tsx`.

Props:
- `targetId: string`
- `targetType: 'provider' | 'customer' | 'location'`

The component:
- Calls `GET /api/reviews?targetId=:id&targetType=:type` on mount.
- Renders the average rating (numeric + star display) and review count at the top.
- Renders each review as a card: star rating, body (if present), and `created_at` formatted as a human-readable date (e.g. "June 3, 2026"). Do not show the reviewer's name or ID — reviews are anonymous to the viewer for MVP.
- Shows a loading state while fetching.
- Shows "No reviews yet" when the list is empty.
- Applies design tokens consistent with the Phase 7/8 design system.

`getReviews(targetId, targetType)` is added to the appropriate public API module (`guest.api.ts` or `public.api.ts` from Phase 10.2, since `GET /api/reviews` requires no auth).

**Files created:**
- `questreserve-frontend/src/components/ReviewList/ReviewList.tsx`

---

### Step 5: Frontend — provider reviews a customer

Embed `ReviewForm` and `ReviewList` on `ProviderCustomerProfile.tsx` (established in Phase 11.5 Step 8). The provider can leave a review for a specific customer, gated by having a booking with that customer.

**Placement:** Below the booking history and above (or below) the `MessageThread`. Display `ReviewList` (showing any existing reviews of this customer from any provider — the list is public-read, so other providers' reviews will appear). Below the list, display `ReviewForm` for the provider to submit their own review.

**Booking selection for gating:** The provider must select (or the page must infer) which booking to associate with the review. If the customer has multiple bookings with this provider, render a dropdown or use the most recent `BOOKED` status booking automatically — document which is implemented.

**API call:** `submitReview` is called from `provider.api.ts`. Add `submitReview` to `provider.api.ts` for use in this context.

**Files changed:**
- `questreserve-frontend/src/pages/ProviderCustomerProfile/ProviderCustomerProfile.tsx`
- `questreserve-frontend/src/api/provider.api.ts` (add `submitReview`)

---

### Step 6: Frontend — customer reviews a provider

Embed `ReviewForm` and `ReviewList` on `PublicProviderProfile.tsx` (established in Phase 11.5 Step 6). The review section is visible to all visitors but the `ReviewForm` is only rendered for authenticated customers who have at least one completed booking at one of this provider's locations.

**Authentication gate:** On the frontend, conditionally render `ReviewForm` only when the user is authenticated as a customer. Unauthenticated guests see `ReviewList` only, with a prompt: "Sign in to leave a review." The backend enforces the booking interaction gate regardless.

**Booking selection:** The `bookingId` passed to `ReviewForm` must be a booking the customer made at one of this provider's locations. Fetch the customer's bookings (`GET /api/customer/bookings`) client-side to find an eligible booking for this provider. If no eligible booking exists, show "Book an adventure with this provider to leave a review." instead of the form. If multiple eligible bookings exist, use the most recent `BOOKED` status booking.

**API calls:** `getReviews` is called from the public API module (no auth). `submitReview` is called from the customer API module — add `submitReview` to `customer.api.ts` for this context.

**Files changed:**
- `questreserve-frontend/src/pages/PublicProviderProfile/PublicProviderProfile.tsx`
- `questreserve-frontend/src/api/customer.api.ts` (add `submitReview`)

---

### Step 7: Frontend — customer reviews a location

Embed `ReviewForm` and `ReviewList` on the customer location detail page (`/customer/locations/:id`). Apply the same pattern as Step 6: `ReviewList` is visible to all authenticated customers on the detail page; `ReviewForm` is only rendered for customers who have a booking at this specific location.

**Booking gate:** Check the customer's booking history (`GET /api/customer/bookings`) for a booking whose `location_id` matches the current location. If found, render `ReviewForm` with that `bookingId`. If not found, show "Book this adventure to leave a review." The backend enforces the gate — the frontend gate is UX-only.

**Guest location detail page** (`/locations/:id`): Embed `ReviewList` only (read-only, no auth). Do not render `ReviewForm` on the guest route.

`getReviews` is already available from the public API module (added in Step 4). `submitReview` is already on `customer.api.ts` (added in Step 6).

**Files changed:**
- `questreserve-frontend/src/pages/` — customer location detail page (confirm file name from codebase)
- `questreserve-frontend/src/pages/` — guest location detail page (confirm file name from codebase)

---

### Step 8: Branding & Styling Audit

Conduct a structured visual audit of all three portals (customer, provider, guest) and produce an itemised list of inconsistencies and improvements. This step produces no source code — it produces a written findings list that drives Step 9.

Audit scope:

- **Typography consistency** — Are font families, weights, and sizes consistent across headings, body text, labels, and badges? Are Cinzel and the body font applied according to the Phase 7 UI strategy?
- **Color token usage** — Are Obsidian, Spell Gold, and surface card colors applied consistently? Are there any components using hardcoded hex values instead of CSS custom properties?
- **Button and form styling** — Are primary, secondary, and destructive button styles uniform? Are input fields, textareas, and selects styled consistently?
- **Card and surface consistency** — Do location cards, booking cards, and profile sections use the same surface card pattern?
- **Badge and status indicator consistency** — Do difficulty badges, status badges (`ACTIVE`, `SUSPENDED`, `BOOKED`, `CANCELLED`), and plan badges use the same visual language?
- **Spacing and padding** — Are section spacing and internal card padding consistent across pages?
- **Loading and empty states** — Do all async-data pages have a loading indicator and an empty/error state, and are they styled consistently?
- **Responsive layout** — Are all pages usable at mobile widths without horizontal overflow?

The findings list from this audit is the sole input to Step 9.

---

### Step 9: Branding & Styling Cleanup implementation

Implement the fixes identified in Step 8's audit. Changes are grouped by portal for clarity but may be batched into fewer commits as the implementer sees fit. Each fix must reference a specific finding from the Step 8 audit.

This step does not introduce new features or new components. Existing components and pages are restyled only. No layout restructuring unless a specific audit finding requires it.

Document any item identified in the audit but explicitly deferred (with the reason for deferral) so future phases have a clear record.

**Files changed:** varies — determined by Step 8 audit findings. Expected files include component-level CSS modules, global token files, and layout files across customer, provider, and guest portals.

---

### Step 10: End-to-end verification

Verify all Phase 11.6 deliverables against a running backend with seeded data. No new source code is written in this step. Any failures must be fixed before the phase is closed.

**Test paths:**

1. **Review schema** — Confirm the `review` table exists with all columns and constraints. Confirm the unique constraint on `(reviewer_id, target_id, target_type, booking_id)` blocks duplicate submissions.
2. **Provider reviews a customer** — Log in as a provider. Navigate to a customer profile page for a customer who has a booking at this provider's location. Submit a 4-star review. Confirm the review appears in `ReviewList`. Attempt to submit a second review for the same booking — confirm `409` is shown.
3. **Customer reviews a provider** — Log in as a customer who has a booking at a provider's location. Navigate to that provider's public profile page. Confirm `ReviewForm` is rendered. Submit a 5-star review with body text. Confirm it appears in `ReviewList` with the correct rating and date. Confirm the average rating is updated.
4. **Customer reviews a location** — Navigate to the detail page for a location the customer has booked. Confirm `ReviewForm` is rendered. Submit a 3-star review. Confirm it appears in `ReviewList`.
5. **Interaction gate enforcement** — As a customer, attempt to submit a review (via direct API call) for a location they have never booked. Confirm the backend returns `403`.
6. **Unauthenticated guest** — Navigate to the public provider profile page without logging in. Confirm `ReviewList` is visible. Confirm `ReviewForm` is not rendered. Confirm the "Sign in to leave a review" prompt is shown.
7. **Guest location detail** — Navigate to `/locations/:id` without logging in. Confirm `ReviewList` is visible. Confirm `ReviewForm` is not rendered.
8. **Duplicate guard** — Attempt to submit two reviews for the same `(bookingId, reviewerId, reviewerType)` combination via the API. Confirm the second call returns `409`.
9. **Branding consistency** — Spot-check at least five pages across the three portals (customer, provider, guest). Confirm typography, color tokens, button styles, and badge styles are visually consistent. Confirm no pages have horizontal overflow on a mobile viewport.

---

## Notes

- **Review immutability.** Reviews have no edit or delete endpoints for MVP. This is intentional — the integrity of the review system depends on reviews being permanent. A future post-MVP phase can introduce moderation tooling (admin delete, flag-for-review) if needed.
- **Reviewer anonymity.** `ReviewList` does not display the reviewer's name or ID. This is a deliberate MVP privacy decision. The `reviewer_id` is stored in the DB and can be surfaced by a future admin moderation feature.
- **`reviewer_type` constraint on who can review whom.** A provider may only review customers; a customer may only review providers or locations. This is enforced at the service layer. The DB schema does not prevent cross-type reviews on its own.
- **`booking_id` as the interaction gate.** The `booking_id` column on `review` serves two purposes: (1) it is the proof of interaction used to gate review creation, and (2) it prevents a reviewer from submitting multiple reviews for the same booking+target combination via the unique constraint. This design avoids a separate "eligible to review" lookup table.
- **`body` field character limit.** 1000 characters enforced by the frontend Zod schema. No DB-level constraint for MVP — a future migration can add `check (char_length(body) <= 1000)` if needed.
- **Booking selection UX (Steps 5 and 6).** When a customer has multiple bookings at a provider's locations, the frontend uses the most recent `BOOKED`-status booking as the `bookingId` for the review. This heuristic is documented here so the implementer does not need to make it ad hoc. For Step 5 (provider reviews customer), the same heuristic applies. If the implementer determines a dropdown is significantly better UX for the multi-booking case, either approach is acceptable — document which was implemented.
- **`submitReview` in two API modules.** Steps 5 and 6 add `submitReview` to `provider.api.ts` and `customer.api.ts` respectively. These are separate functions in separate modules — the call is identical but the module separation is intentional (provider and customer API surfaces do not share a module, per the convention established in Phase 11 Step 1).
- **Guest location detail page — confirm file name.** The guest and customer location detail pages were established in Phases 10.2 and 10.4. Before implementing Step 7, confirm the exact file paths of both pages by inspecting the frontend `pages/` directory.
- **Branding cleanup scope.** Step 9 is intentionally open-ended — it is driven by the Step 8 audit findings. The implementer documents what was fixed and what was deferred. "More visually interesting" (from the phase scope brief) is interpreted as: improve visual hierarchy, ensure consistent use of design tokens, and remove any stray plaintext or unstyled sections — not a full redesign.
- **Phase 12 (Admin Panel) is unaffected.** The review system has no dependency on the admin panel and Phase 12 can proceed independently once Phase 11.5 is closed.
- **Deferred: customer-side messaging UI.** Phase 11.5 deferred the customer-facing messaging surface (a customer viewing and sending messages about their own booking). That deferral is still in effect — Phase 11.6 does not include it.
