# Ticket Plan: Phase 10.1 — Booking Flow

**Purpose:** Resolve all Phase 10 carry-over defects and enhancements, then deliver the complete customer booking journey: TimeSlot availability on Location Detail, booking creation (authenticated path), guest redirect with intent preservation, payment stub, and booking cancellation on My Bookings.
**Total tickets:** 13
**Prefix:** P10.1:
**Status: DRAFT**

---

## Ticket 1 of 13

**Title:** P10.1: NITPICK — Update BrowseLocations card background token

**Description:**
In `src/pages/BrowseLocations/BrowseLocations.tsx`, update the location card `backgroundColor` to a slightly lighter surface token so cards are visually distinct from the page background. No structural or layout changes are made in this ticket.

**Acceptance Criteria:**
- [ ] Location cards in `BrowseLocations.tsx` use a surface token that is visually distinct from the page background
- [ ] The change uses an existing design token — no new CSS variables are introduced
- [ ] No other files in `BrowseLocations/` are modified
- [ ] `npm run lint` and `npm run build` pass with zero errors

---

## Ticket 2 of 13

**Title:** P10.1: BUG — Replace CustomerHome static booking stub with live summary

**Description:**
In `src/pages/CustomerHome.tsx`, replace the static "Your bookings will appear here" paragraph with a live booking summary. Import and call `useMyBookings`. Render a short summary list (the two most recent bookings by `created_at`), a loading state, and an empty state. No new API call is needed — `getMyBookings` already exists.

**Acceptance Criteria:**
- [ ] The static stub paragraph is removed from `CustomerHome.tsx`
- [ ] `useMyBookings` is imported and called in `CustomerHome`
- [ ] Up to two next upcoming bookings are rendered in the summary (non-cancelled, future `slot_start_time`, sorted soonest-first)
- [ ] A loading state is shown while `isLoading` is `true`
- [ ] An empty state is shown when the user has no upcoming bookings
- [ ] `npm run lint` and `npm run build` pass with zero errors

---

## Ticket 3 of 13

**Title:** P10.1: BUG — Enrich GET /api/customer/bookings response (backend)

**Description:**
`GET /api/customer/bookings` currently returns raw `Booking` rows containing only `time_slot_id`. Extend `CustomerService.getBookingHistory` to join or enrich the result with `location_name` (from `booking_location`), `booking_location_id`, `slot_start_time`, and `slot_end_time` (from `time_slot`). Add a new `BookingRepository.findAllByEndUserEnriched` method using a Knex join. Define an `EnrichedBooking` type in backend `src/types/index.ts`. Update the controller to return the enriched shape.

**Acceptance Criteria:**
- [ ] `GET /api/customer/bookings` response includes `location_name`, `booking_location_id`, `slot_start_time`, and `slot_end_time` on each booking object
- [ ] `BookingRepository.findAllByEndUserEnriched` exists and uses a Knex join — no N+1 queries
- [ ] `EnrichedBooking` is defined in backend `src/types/index.ts`
- [ ] The controller returns `EnrichedBooking[]` — no `any` in the response type
- [ ] The base `Booking` type is not mutated; it remains used by `POST` and `DELETE` endpoints
- [ ] `npm run lint` and `npm run build` pass with zero errors

---

## Ticket 4 of 13

**Title:** P10.1: BUG — Update MyBookings display and add EXPIRED status (frontend)

**Description:**
Depends on Ticket 3. In `src/pages/MyBookings/MyBookings.tsx`:
- Replace the raw `booking.id` "Booking ID" display with `booking.location_name` as the card heading, linked to `/customer/locations/:booking_location_id`.
- Replace the raw `booking.time_slot_id` "Time Slot" display with formatted `slot_start_time` and `slot_end_time`.
- Add EXPIRED display logic: if `booking.status === 'BOOKED'` and `new Date(booking.slot_start_time) < new Date()`, render "EXPIRED" in the status badge instead of "BOOKED".
- Update the `Booking` interface in `src/types/domain.ts` to `EnrichedBooking` with the four new fields.
- Update `getMyBookings` in `customer.api.ts` to return the new enriched type.

**Acceptance Criteria:**
- [ ] Each booking card heading displays `location_name` linked to `/customer/locations/:booking_location_id`
- [ ] Each booking card displays formatted `slot_start_time` and `slot_end_time` in place of the raw time slot ID
- [ ] Bookings with `status === 'BOOKED'` and a past `slot_start_time` display "EXPIRED" in the status badge
- [ ] `EnrichedBooking` is defined in `src/types/domain.ts` with `location_name`, `booking_location_id`, `slot_start_time`, and `slot_end_time`
- [ ] `getMyBookings` in `customer.api.ts` is typed to return `EnrichedBooking[]`
- [ ] The base `Booking` type is not mutated
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 3 issue number> — enriched backend response must exist before the frontend can consume it

---

## Ticket 5 of 13

**Title:** P10.1: ENHANCEMENT — Add Settings/Profile link to CustomerLayout sidebar

**Description:**
In `src/layouts/CustomerLayout.tsx`, add a Settings nav link above the Log Out button pointing to `/customer/settings`. Create `src/pages/CustomerSettings/CustomerSettings.tsx` as a stub page with a "Settings" heading and a password reset placeholder section (no functional password reset). Register the route in `src/routes/index.tsx` under the `CustomerLayout` children.

**Acceptance Criteria:**
- [ ] A "Settings" nav link is present in the `CustomerLayout` sidebar above the Log Out button
- [ ] The link navigates to `/customer/settings`
- [ ] `CustomerSettings.tsx` exists at `src/pages/CustomerSettings/CustomerSettings.tsx`
- [ ] The page renders a "Settings" heading and a password reset placeholder section
- [ ] The route `/customer/settings` is registered under `CustomerLayout` in `src/routes/index.tsx`
- [ ] `npm run lint` and `npm run build` pass with zero errors

---

## Ticket 6 of 13

**Title:** P10.1: TODO — Integrate client logo assets

**Description:**
Assets are in `assets/qr_logos/`. Confirm exact filenames before implementing. Three placements:
1. Login landing page (`src/pages/LoginPage.tsx`): replace any plain text or placeholder with the full logo lockup asset.
2. Customer portal sidebar (`src/layouts/CustomerLayout.tsx`): replace the plain "QuestReserve" text span with the appropriate portal variant logo asset.
3. Browser tab favicon (`questreserve-frontend/public/`): replace the current "QR" SVG placeholder with the icon-only logo asset.

**Acceptance Criteria:**
- [ ] Exact asset filenames are confirmed from `assets/qr_logos/` before any source file is modified
- [ ] The login landing page (`/login`) displays the full logo lockup asset
- [ ] The `CustomerLayout` sidebar displays the portal variant logo asset in place of the plain text span
- [ ] The browser tab favicon is replaced with the icon-only logo asset
- [ ] No broken image references exist (all asset paths resolve correctly)
- [ ] `npm run lint` and `npm run build` pass with zero errors

---

## Ticket 7 of 13

**Title:** P10.1: Add TimeSlot availability display to Location Detail

**Description:**
Extend `LocationDetail.tsx` to fetch and render available TimeSlots below the location details panel. This step is read-only display only — no booking action yet. Add `getAvailableSlots(locationId: string): Promise<TimeSlot[]>` to `customer.api.ts` calling `GET /api/customer/locations/:id/slots`. Add a `useAvailableSlots(locationId)` hook in `src/hooks/`. Add a `TimeSlot` interface to `src/types/domain.ts` with `id`, `booking_location_id`, `start_time`, `end_time`, `created_at`, `updated_at`. Render an "Available Times" section with formatted slot rows and inert "Reserve" buttons (to be wired in Ticket 8).

**Acceptance Criteria:**
- [ ] `getAvailableSlots(locationId)` exists in `customer.api.ts` and calls `GET /api/customer/locations/:id/slots`
- [ ] `useAvailableSlots(locationId)` exists in `src/hooks/` and returns `{ data, isLoading, error }`
- [ ] `TimeSlot` interface is defined in `src/types/domain.ts` with all six fields
- [ ] `LocationDetail.tsx` renders an "Available Times" section below the cancellation policy
- [ ] Each slot shows formatted `start_time` and `end_time`
- [ ] Each slot row includes a "Reserve" button that is present but takes no action
- [ ] The slot list has independent loading and empty states from the location loading state
- [ ] `npm run lint` and `npm run build` pass with zero errors

---

## Ticket 8 of 13

**Title:** P10.1: Wire booking creation — authenticated customer path

**Description:**
Wire the "Reserve" button from Ticket 7 to create a booking for an authenticated customer. Add `createBooking(timeSlotId: string): Promise<Booking>` to `customer.api.ts` calling `POST /api/customer/bookings` with `{ time_slot_id }`. Add a `useCreateBooking` hook exposing `{ createBooking, isLoading, error }`. In `LocationDetail.tsx`, clicking "Reserve" triggers an inline confirmation step. On confirm, call `createBooking`. On success, redirect to `/customer/payment` with location and slot info as route state. On `409 Conflict`, show an inline error and do not navigate. This path applies only to authenticated customers — guest handling is Ticket 9.

**Acceptance Criteria:**
- [ ] `createBooking(timeSlotId)` exists in `customer.api.ts` and calls `POST /api/customer/bookings`
- [ ] `useCreateBooking` exists in `src/hooks/` and exposes `{ createBooking, isLoading, error }`
- [ ] Clicking "Reserve" on a slot shows an inline confirmation step with the formatted date/time
- [ ] Confirming calls `createBooking` and redirects to `/customer/payment` on success
- [ ] A `409 Conflict` response shows an inline error message and does not navigate
- [ ] Location and slot info are passed as route state to `/customer/payment`
- [ ] The confirmation step includes a "Cancel" action that dismisses it without making an API call
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 7 issue number> — slot display and inert "Reserve" buttons must exist

---

## Ticket 9 of 13

**Title:** P10.1: Implement guest path — redirect with intent preservation

**Description:**
When an unauthenticated user clicks "Reserve" on the Location Detail page, redirect them to `/customer/login` with the intended location and time slot encoded in the URL (e.g. `?redirect=/customer/locations/:id&slot=:slotId`). After login, `CustomerLogin` must read `redirect` and `slot` query params from `useSearchParams` and navigate back to the location detail page with the slot pre-selected. In `LocationDetail.tsx`, on mount, if a `slot` query param is present and the user is authenticated, auto-trigger the confirmation step for that slot. No backend changes are required.

**Note:** This step can be implemented in Phase 10.1 but is not fully testable until Phase 10.2 opens a public (unauthenticated) route to Location Detail. The redirect logic should be implemented and ready to activate in 10.2.

**Acceptance Criteria:**
- [ ] In `LocationDetail.tsx`, clicking "Reserve" when unauthenticated navigates to `/customer/login?redirect=...&slot=...`
- [ ] `CustomerLogin` reads `redirect` and `slot` query params after a successful login and navigates back to the original location detail URL
- [ ] On mount, if a `slot` query param is present and the user is authenticated, `LocationDetail.tsx` auto-triggers the inline confirmation step for that slot
- [ ] Authenticated users are unaffected — "Reserve" proceeds directly to the confirmation step
- [ ] No backend changes are made in this ticket
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 8 issue number> — booking confirmation step must exist before auto-trigger can be wired

---

## Ticket 10 of 13

**Title:** P10.1: Create payment stub page

**Description:**
Create `src/pages/PaymentStub/PaymentStub.tsx` rendered at `/customer/payment`. This is an "Under Construction" placeholder shown after a successful booking confirmation. The page must display: a success confirmation that the reservation was received, the location name and time slot (from route state), and a note that payment processing is coming soon. Register the route under `CustomerLayout` in `src/routes/index.tsx`. No payment domain model, schema migration, or API endpoint is introduced.

**Acceptance Criteria:**
- [ ] `PaymentStub.tsx` exists at `src/pages/PaymentStub/PaymentStub.tsx`
- [ ] The page renders at `/customer/payment` under the `CustomerLayout` auth guard
- [ ] The page displays a success confirmation message, location name, time slot, and a "payment coming soon" notice
- [ ] Location name and time slot are read from React Router route state (populated by the redirect in Ticket 8)
- [ ] No payment-related API calls, schema migrations, or domain models are introduced
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 8 issue number> — route state is populated by the booking creation redirect

---

## Ticket 11 of 13

**Title:** P10.1: Add booking cancellation to My Bookings

**Description:**
Add a Cancel button to each booking card in `MyBookings.tsx` for bookings where `status === 'BOOKED'` and `slot_start_time` is in the future (not EXPIRED). Add `cancelBooking(bookingId: string): Promise<void>` to `customer.api.ts` calling `DELETE /api/customer/bookings/:id`. Add a `useCancelBooking` hook exposing `{ cancelBooking, isLoading, error }`. Clicking Cancel shows an inline confirmation. On confirm, call `cancelBooking`. On success, re-fetch the booking list. On error, show an inline error message. No backend changes are required — `DELETE /api/customer/bookings/:id` is already implemented.

**Acceptance Criteria:**
- [ ] `cancelBooking(bookingId)` exists in `customer.api.ts` and calls `DELETE /api/customer/bookings/:id`
- [ ] `useCancelBooking` exists in `src/hooks/` and exposes `{ cancelBooking, isLoading, error }`
- [ ] A Cancel button appears on booking cards where `status === 'BOOKED'` and `slot_start_time` is in the future
- [ ] EXPIRED bookings (past `slot_start_time`) do not show a Cancel button
- [ ] Clicking Cancel shows an inline confirmation before calling the API
- [ ] On success, the booking list is re-fetched and the card updates in place
- [ ] On error, an inline error message is shown
- [ ] No backend changes are made in this ticket
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 4 issue number> — `EnrichedBooking` with `slot_start_time` must exist before cancellation guard logic can be implemented

---

## Ticket 12 of 13

**Title:** P10.1: Register new Phase 10.1 routes

**Description:**
Update `src/routes/index.tsx` to register all new routes introduced in Phase 10.1 under the `CustomerLayout` children: `/customer/settings` (if not done in Ticket 5), and `/customer/payment`. Verify that unauthenticated access to any new route redirects to `/login`.

**Acceptance Criteria:**
- [ ] `/customer/settings` renders `CustomerSettings` and is protected by the `CustomerLayout` auth guard
- [ ] `/customer/payment` renders `PaymentStub` and is protected by the `CustomerLayout` auth guard
- [ ] Navigating to either route while unauthenticated redirects to `/login`
- [ ] Navigating to either route while authenticated as a customer loads the correct page
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 5 issue number>, #<Ticket 10 issue number> — `CustomerSettings` and `PaymentStub` pages must exist

---

## Ticket 13 of 13

**Title:** P10.1: End-to-end smoke test of the booking flow

**Description:**
Verify the full booking flow end-to-end against a running backend. No new source code is written in this step. Any failures discovered must be fixed before this ticket is closed.

Test paths:
- Authenticated customer: Browse → Location Detail → reserve a slot → confirm → payment stub
- Cancel a booking from My Bookings
- EXPIRED display for past bookings
- Enriched My Bookings display (location name, formatted times)
- Guest path (Ticket 9): verify the redirect to login with `redirect` and `slot` params fires correctly when a non-authenticated state is simulated; note that full end-to-end guest flow is pending Phase 10.2
- CustomerHome live booking summary

**Acceptance Criteria:**
- [ ] An authenticated customer can browse locations, open a location detail page, and see available time slots
- [ ] Clicking "Reserve" and confirming creates a booking and redirects to the payment stub page
- [ ] The payment stub displays the location name and time slot from route state
- [ ] A `409 Conflict` response shows an inline error on Location Detail and does not navigate
- [ ] My Bookings displays `location_name` (linked), formatted `slot_start_time`/`slot_end_time`, and correct status badges
- [ ] Past bookings with `status === 'BOOKED'` display "EXPIRED" and do not show a Cancel button
- [ ] Future `BOOKED` bookings show a Cancel button; confirming cancellation updates the card in place
- [ ] CustomerHome renders a live booking summary (up to two most recent bookings or an empty state)
- [ ] Clicking "Reserve" when not authenticated redirects to `/customer/login?redirect=...&slot=...`
- [ ] The Settings nav link and stub page render correctly
- [ ] Logo assets appear on the login landing page, sidebar, and browser tab
- [ ] `npm run lint` and `npm run build` both pass with zero errors

**Dependencies:** #<Ticket 12 issue number> — all pages, routes, hooks, and API functions must be complete
