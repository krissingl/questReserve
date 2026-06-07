# Ticket Plan: Phase 11.6 — Reviews & Branding Cleanup

**Purpose:** Implement a three-way interaction-gated review system and perform a structured branding and styling cleanup across all three portals.
**Total tickets:** 10
**Prefix:** P11.6:
**Status: LOCKED**

---

## Ticket 1 of 10

**Title:** P11.6:Implement review table migration and ReviewRepository

**Description:**
Create a Knex migration for the `review` table and implement `ReviewRepository` with the four query methods required by the review API. The table uses a flat polymorphic design for reviewer and target, with `booking_id` as the sole interaction gate. A composite unique constraint on `(reviewer_id, target_id, target_type, booking_id)` prevents duplicate reviews.

**Acceptance Criteria:**
- [ ] A new Knex migration creates the `review` table with columns: `id` (uuid, PK, default `gen_random_uuid()`), `reviewer_id` (uuid, not null), `reviewer_type` (text, not null, check: `'provider'` or `'customer'`), `target_id` (uuid, not null), `target_type` (text, not null, check: `'provider'`, `'customer'`, or `'location'`), `booking_id` (uuid, not null, FK to `booking.id`), `rating` (integer, not null, check: `>= 1` and `<= 5`), `body` (text, nullable), `created_at` (timestamptz, not null, default `now()`)
- [ ] A composite unique constraint exists on `(reviewer_id, target_id, target_type, booking_id)`
- [ ] `ReviewRepository` is created at `questreserve-backend/src/repositories/review.repository.ts`
- [ ] `ReviewRepository` implements: `create(data)`, `findByTarget(targetId, targetType)`, `findByBookingAndReviewer(bookingId, reviewerId, reviewerType)`, and `findAverageRating(targetId, targetType)`
- [ ] `findByTarget` returns results ordered by `created_at` descending
- [ ] `findAverageRating` returns both the average rating value and the review count
- [ ] The migration runs without error against the existing database schema

---

## Ticket 2 of 10

**Title:** P11.6:Implement ReviewService and review API endpoints

**Description:**
Create `ReviewService` implementing interaction gating, duplicate prevention, and reviewer-type enforcement. Expose two endpoints: `POST /api/reviews` (authenticated, create a review) and `GET /api/reviews?targetId=&targetType=` (public, list reviews for a target with average rating). Register both on an `/api/reviews` router.

**Acceptance Criteria:**
- [ ] `ReviewService` is created at `questreserve-backend/src/services/review.service.ts`
- [ ] Before creating a review, the service verifies that the booking referenced by `booking_id` exists and that the authenticated user was a party to it (the customer who made it or the provider who owns its location); fails with `403` if not
- [ ] The service calls `ReviewRepository.findByBookingAndReviewer` before insert; if a review already exists, it returns `409 Conflict`
- [ ] Target type rule is enforced: a `provider` reviewer may only target `customer`; a `customer` reviewer may only target `provider` or `location`; any other combination returns `400`
- [ ] `POST /api/reviews` requires authentication, accepts `{ targetId, targetType, bookingId, rating, body? }`, resolves `reviewerId` and `reviewerType` from the auth token, and returns the created review with status `201`
- [ ] `GET /api/reviews?targetId=:id&targetType=:type` requires no authentication and returns `{ reviews: [...], averageRating: number, count: number }`
- [ ] Both endpoints are registered on an `/api/reviews` router following the Phase 4 controller/router pattern
- [ ] No edit or delete endpoints are created

**Dependencies:** #— Ticket 1 (ReviewRepository must exist)

---

## Ticket 3 of 10

**Title:** P11.6:Build ReviewForm component

**Description:**
Create a generic, reusable `ReviewForm` component driven entirely by props. It renders a 1–5 star rating selector (no third-party library — SVG or Unicode stars with Spell Gold tokens), an optional textarea, and a "Submit Review" button. The component handles Zod validation, calls `POST /api/reviews`, and surfaces inline success and error states including a specific message for `409` responses.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/components/ReviewForm/ReviewForm.tsx` exists and accepts props: `bookingId: string`, `targetId: string`, `targetType: 'provider' | 'customer' | 'location'`, `onSuccess?: () => void`
- [ ] The component renders a 1–5 star rating selector; active stars use the Spell Gold design token; inactive stars use a muted tone; no third-party rating library is used
- [ ] An optional textarea is present with placeholder "Share your experience…"
- [ ] Zod validation on submit: rating is required (1–5); body is optional with a maximum of 1000 characters; inline errors are shown for violations before any API call is made
- [ ] On submit, `POST /api/reviews` is called with `{ targetId, targetType, bookingId, rating, body }`
- [ ] On success, inline feedback "Review submitted — thank you!" is shown and `onSuccess` is called if provided
- [ ] If the server returns `409`, the inline message "You have already reviewed this" is shown
- [ ] On any other failure, the server error message is shown inline
- [ ] The component contains no logic specific to provider, customer, or location context — it is generic and prop-driven
- [ ] Design tokens are consistent with the Phase 7/8 design system

**Dependencies:** #— Ticket 2 (backend endpoint must exist)

---

## Ticket 4 of 10

**Title:** P11.6:Build ReviewList component

**Description:**
Create a generic, reusable `ReviewList` component that fetches and displays all reviews for a given target. It shows the aggregate average rating and count at the top, then renders individual review cards anonymously (no reviewer name or ID shown). Add `getReviews(targetId, targetType)` to the public API module.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/components/ReviewList/ReviewList.tsx` exists and accepts props: `targetId: string`, `targetType: 'provider' | 'customer' | 'location'`
- [ ] On mount, the component calls `GET /api/reviews?targetId=:id&targetType=:type`
- [ ] The average rating (numeric value and star display) and review count are rendered at the top of the list
- [ ] Each review card shows: star rating, body text (if present), and `created_at` formatted as a human-readable date (e.g. "June 3, 2026")
- [ ] Reviewer name and ID are not shown — reviews are anonymous to the viewer
- [ ] A loading state renders while the fetch is in progress
- [ ] "No reviews yet" is shown when the list is empty
- [ ] `getReviews(targetId, targetType)` is added to the public/guest API module (`guest.api.ts` or `public.api.ts`) — not to `provider.api.ts` or `customer.api.ts`
- [ ] Design tokens are consistent with the Phase 7/8 design system

**Dependencies:** #— Ticket 2 (backend endpoint must exist)

---

## Ticket 5 of 10

**Title:** P11.6:Embed review feature on Provider Customer Profile page

**Description:**
Add `ReviewList` and `ReviewForm` to `ProviderCustomerProfile.tsx` so a provider can review a customer they have hosted. `ReviewList` shows all existing reviews of the customer. `ReviewForm` is rendered for the provider to submit their own review, with `bookingId` inferred from the customer's booking history at this provider's locations. Add `submitReview` to `provider.api.ts`.

**Acceptance Criteria:**
- [ ] `ReviewList` is embedded on `ProviderCustomerProfile.tsx` with `targetType: 'customer'` and `targetId` set to the customer's ID, showing all existing reviews of that customer
- [ ] `ReviewForm` is embedded below `ReviewList` with `targetType: 'customer'`, `targetId` set to the customer's ID, and `bookingId` set to the most recent `BOOKED`-status booking between this provider and the customer; the implementer documents whether a dropdown is used instead for the multi-booking case
- [ ] `submitReview(payload)` is added to `provider.api.ts` and is used by the embedded `ReviewForm`
- [ ] On `ReviewForm` success, `ReviewList` refreshes to show the new review (via `onSuccess` callback or equivalent refetch)
- [ ] The review section is placed below the booking history section
- [ ] Design tokens are consistent with the Phase 7/8 design system

**Dependencies:** #— Ticket 3 (ReviewForm), #— Ticket 4 (ReviewList)

---

## Ticket 6 of 10

**Title:** P11.6:Embed review feature on Public Provider Profile page

**Description:**
Add `ReviewList` and a conditionally rendered `ReviewForm` to `PublicProviderProfile.tsx`. `ReviewList` is visible to all visitors. `ReviewForm` is rendered only for authenticated customers who have an eligible booking at one of this provider's locations — determined by fetching the customer's booking history client-side. Unauthenticated guests see a "Sign in to leave a review" prompt instead of the form. Add `submitReview` to `customer.api.ts`.

**Acceptance Criteria:**
- [ ] `ReviewList` is embedded on `PublicProviderProfile.tsx` with `targetType: 'provider'` and `targetId` set to the provider's ID, visible to all visitors (guests and authenticated customers)
- [ ] For authenticated customers: `GET /api/customer/bookings` is called to find an eligible booking at one of this provider's locations; if found, `ReviewForm` is rendered with `targetType: 'provider'`, `targetId` set to the provider's ID, and `bookingId` set to the most recent eligible `BOOKED`-status booking
- [ ] If no eligible booking is found for the authenticated customer, the message "Book an adventure with this provider to leave a review." is shown in place of the form
- [ ] For unauthenticated guests, the prompt "Sign in to leave a review" is shown in place of the form
- [ ] `submitReview(payload)` is added to `customer.api.ts` and is used by the embedded `ReviewForm`
- [ ] On `ReviewForm` success, `ReviewList` refreshes to show the new review
- [ ] Design tokens are consistent with the Phase 7/8 design system

**Dependencies:** #— Ticket 3 (ReviewForm), #— Ticket 4 (ReviewList)

---

## Ticket 7 of 10

**Title:** P11.6:Embed review feature on location detail pages

**Description:**
Add `ReviewList` and a conditionally rendered `ReviewForm` to the customer location detail page (`/customer/locations/:id`). Add `ReviewList` only (read-only) to the guest location detail page (`/locations/:id`). The customer `ReviewForm` is rendered only when the authenticated customer has a booking at this specific location. Confirm the exact file names of both pages before implementing.

**Acceptance Criteria:**
- [ ] `ReviewList` is embedded on the customer location detail page with `targetType: 'location'` and `targetId` set to the location's ID
- [ ] `ReviewList` is embedded on the guest location detail page with `targetType: 'location'` and `targetId` set to the location's ID
- [ ] On the customer location detail page, `GET /api/customer/bookings` is checked for a booking whose location matches the current location; if found, `ReviewForm` is rendered with `targetType: 'location'`, `targetId` set to the location's ID, and the matching `bookingId`
- [ ] If the customer has no booking at this location, the message "Book this adventure to leave a review." is shown in place of the form
- [ ] `ReviewForm` is not rendered on the guest location detail page under any circumstances
- [ ] `submitReview` from `customer.api.ts` (added in Ticket 6) is used — no duplicate function is created
- [ ] `getReviews` from the public API module (added in Ticket 4) is used for both pages — no duplicate function is created
- [ ] On `ReviewForm` success, `ReviewList` refreshes to show the new review
- [ ] Design tokens are consistent with the Phase 7/8 design system

**Dependencies:** #— Ticket 3 (ReviewForm), #— Ticket 4 (ReviewList), #— Ticket 6 (submitReview added to customer.api.ts)

---

## Ticket 8 of 10

**Title:** P11.6:Conduct branding and styling audit across all three portals

**Description:**
Perform a structured visual audit of the customer, provider, and guest portals against the Phase 7/8 design system. Produce an itemised findings list covering typography, color token usage, button and form styling, card and surface consistency, badge and status indicator consistency, spacing and padding, loading and empty states, and responsive layout. This ticket produces no source code — the findings list is the sole deliverable and the sole input to the cleanup ticket.

**Acceptance Criteria:**
- [ ] The audit covers all three portals: customer (`/customer/*`), provider (`/provider/*`), and guest (`/locations/*`, `/providers/*`)
- [ ] Findings are recorded as an itemised list, each identifying the specific page or component, the nature of the inconsistency, and the expected correct state per the Phase 7/8 design system
- [ ] The audit covers all eight scope areas: typography, color token usage, button and form styling, card and surface consistency, badge and status indicator consistency, spacing and padding, loading and empty states, and responsive layout
- [ ] Any finding identified but explicitly deferred is listed separately with the reason for deferral
- [ ] The findings list is recorded in a format the implementer can reference directly during Ticket 9 (e.g. a comment in the relevant file, a notes document, or a structured list in the ticket itself)

---

## Ticket 9 of 10

**Title:** P11.6:Implement branding and styling cleanup from audit findings

**Description:**
Apply all non-deferred fixes identified in the Ticket 8 audit. Changes are limited to restyling existing components and pages — no new features, no new components, no layout restructuring unless a specific audit finding requires it. Each fix references its corresponding audit finding. Deferred items are documented.

**Acceptance Criteria:**
- [ ] Every non-deferred finding from the Ticket 8 audit has a corresponding fix applied
- [ ] Each fix is traceable to a specific audit finding — the implementer documents which finding each change addresses
- [ ] No new features or new components are introduced in this ticket
- [ ] No hardcoded hex values are introduced — all color changes use CSS custom properties from the Phase 7/8 design token set
- [ ] All pages affected by changes remain functional (no regressions to layout, navigation, or interactive elements)
- [ ] Any finding that was deferred in Ticket 8 remains explicitly deferred — it is not silently skipped
- [ ] The deferred items list is accessible for future phases to pick up

**Dependencies:** #— Ticket 8 (audit findings must be complete before implementation begins)

---

## Ticket 10 of 10

**Title:** P11.6:Verify end-to-end Phase 11.6 feature set

**Description:**
Run a structured end-to-end verification of all Phase 11.6 deliverables against a running backend with seeded data. No new source code is written in this step. Any failures discovered must be fixed before the phase is closed.

**Acceptance Criteria:**
- [ ] Review schema: the `review` table exists with all required columns and constraints; the unique constraint on `(reviewer_id, target_id, target_type, booking_id)` blocks duplicate submissions at the DB level
- [ ] Provider reviews a customer: a provider can submit a review for a customer with a booking at their location; the review appears in `ReviewList`; a second submission for the same booking returns a `409` message in the UI
- [ ] Customer reviews a provider: an authenticated customer with an eligible booking sees `ReviewForm` on the public provider profile page; submitting a review updates `ReviewList` with the correct rating, body, and date; the average rating reflects the new submission
- [ ] Customer reviews a location: an authenticated customer with a booking at a location sees `ReviewForm` on the customer location detail page; submitting a review updates `ReviewList`
- [ ] Interaction gate enforcement: a direct API call to `POST /api/reviews` for a location the customer has never booked returns `403`
- [ ] Unauthenticated guest on public provider profile: `ReviewList` is visible; `ReviewForm` is not rendered; "Sign in to leave a review" prompt is shown
- [ ] Guest location detail page: `ReviewList` is visible; `ReviewForm` is not rendered
- [ ] Duplicate guard: submitting two reviews for the same `(bookingId, reviewerId, reviewerType)` via the API returns `409` on the second call
- [ ] Branding consistency: at least five pages across the three portals are spot-checked; typography, color tokens, button styles, and badge styles are visually consistent; no pages exhibit horizontal overflow on a mobile viewport

**Dependencies:** #— Tickets 1–9 (all implementation tickets must be complete before verification)
