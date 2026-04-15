# Phase 10.1: Booking Flow

_Created: 2026-04-14 | Status: DRAFT_

## Goal

Close all open TODOs and defects carried over from Phase 10, then deliver the complete customer booking journey: TimeSlot availability on the Location Detail page, booking creation with both guest and authenticated paths, and booking cancellation on My Bookings.

## Context

Phase 10 (Customer Portal) is complete. The frontend has: `BrowseLocations`, `LocationDetail`, and `MyBookings` pages behind the `CustomerLayout` auth guard; `customer.api.ts` with `getBookingLocations`, `getBookingLocationById`, and `getMyBookings`; and `useBookingLocations`, `useBookingLocation`, and `useMyBookings` hooks. The backend exposes `GET /api/customer/locations/:id/slots`, `POST /api/customer/bookings`, `DELETE /api/customer/bookings/:id`, and `GET /api/customer/bookings` — all operational from Phase 5. Six defects and one enhancement were deferred from Phase 10 and must be resolved before booking flow work begins. Two backend gaps must be closed to support the enriched booking view: `GET /api/customer/bookings` currently returns raw `Booking` rows with only `time_slot_id` and no location or time slot data; the `Booking` frontend type and `getMyBookings` API function will need updating once the enriched shape is defined.

## Steps

### Step 1: TODO clean-up block

Resolve all open carry-over items before any booking flow work begins.

**1a — NITPICK: BrowseLocations card background**
In `src/pages/BrowseLocations/BrowseLocations.tsx`, update the location card `backgroundColor` to a slightly lighter surface token so cards are visually distinct from the page background.

**1b — BUG: CustomerHome dashboard static stub**
In `src/pages/CustomerHome.tsx`, replace the static "Your bookings will appear here" paragraph with a live booking summary. Import and call `useMyBookings`. Render a short summary list (e.g. the two most recent bookings by `created_at`), a loading state, and an empty state. No new API call is needed — `getMyBookings` already exists.

**1c — BUG: Enriched booking response (backend)**
`GET /api/customer/bookings` currently returns raw `Booking` rows containing only `time_slot_id`. Extend `CustomerService.getBookingHistory` to join or enrich the result with: `location_name` (from `booking_location`), `booking_location_id`, `slot_start_time`, and `slot_end_time` (from `time_slot`). The enrichment should be done in the service layer. For efficiency, a new `BookingRepository.findAllByEndUserEnriched` method using a Knex join is preferable. Define an `EnrichedBooking` type in the backend `src/types/index.ts`. Update the controller to return this enriched shape.

**1d/1e — BUG: MyBookings display and EXPIRED status (frontend — combined)**
Depends on 1c. In `src/pages/MyBookings/MyBookings.tsx`:
- Replace the raw `booking.id` "Booking ID" display with `booking.location_name` as the card heading, linked to `/customer/locations/:booking_location_id`.
- Replace the raw `booking.time_slot_id` "Time Slot" display with formatted `slot_start_time` and `slot_end_time`.
- Add EXPIRED display logic: if `booking.status === 'BOOKED'` and `new Date(booking.slot_start_time) < new Date()`, render "EXPIRED" in the status badge instead of "BOOKED".
- Update the `Booking` interface in `src/types/domain.ts` to `EnrichedBooking` with `location_name: string`, `booking_location_id: string`, `slot_start_time: string`, `slot_end_time: string`.
- Update `getMyBookings` in `customer.api.ts` to return the new enriched type.

**1f — ENHANCEMENT: Settings/Profile link in CustomerLayout sidebar**
In `src/layouts/CustomerLayout.tsx`, add a Settings nav link above the Log Out button pointing to `/customer/settings`. Create `src/pages/CustomerSettings/CustomerSettings.tsx` as a stub page (heading "Settings" and a password reset placeholder section — no functional password reset yet). Register the route in `src/routes/index.tsx` under the `CustomerLayout` children.

**1g — TODO: Integrate client logo assets**
Assets are in `assets/qr_logos/`. Three placements:
- Login landing page (`src/pages/LoginPage.tsx`): replace any plain text or placeholder with the full logo lockup asset.
- Customer portal sidebar (`src/layouts/CustomerLayout.tsx`): replace the plain "QuestReserve" text span with the appropriate portal variant logo asset.
- Browser tab favicon (`questreserve-frontend/public/`): replace the current "QR" SVG placeholder with the icon-only logo asset.
Confirm exact asset filenames from `assets/qr_logos/` before implementing.

---

### Step 2: TimeSlot availability on Location Detail

Extend `LocationDetail.tsx` to fetch and render available TimeSlots below the location details panel. This step is read-only display only — no booking action yet.

Add `getAvailableSlots(locationId: string): Promise<TimeSlot[]>` to `customer.api.ts` calling `GET /api/customer/locations/:id/slots`. Add a `useAvailableSlots(locationId)` hook following the existing pattern in `src/hooks/`. Add a `TimeSlot` interface to `src/types/domain.ts` with `id`, `booking_location_id`, `start_time`, `end_time`, `created_at`, `updated_at`.

In `LocationDetail.tsx`, below the cancellation policy section, render the slot list:
- An "Available Times" section heading.
- Each slot shows formatted `start_time` and `end_time`.
- A "Reserve" button on each slot (inert in this step — wired in Step 3).
- Loading and empty states for the slot list, independent of the location loading state.

---

### Step 3: Booking creation — authenticated customer path

Wire the "Reserve" button from Step 2 to create a booking for an authenticated customer.

Add `createBooking(timeSlotId: string): Promise<Booking>` to `customer.api.ts` calling `POST /api/customer/bookings` with `{ time_slot_id }`. Add a `useCreateBooking` hook exposing `{ createBooking, isLoading, error }`.

In `LocationDetail.tsx`, clicking "Reserve" triggers an inline confirmation step ("Confirm your reservation for [date/time]? [Confirm] [Cancel]"). On confirm, call `createBooking`. On success, redirect to `/customer/payment` (Step 5). On `409 Conflict` (slot unavailable), show an inline error message and do not navigate away.

This path applies only to authenticated customers. Guest handling is Step 4.

---

### Step 4: Guest path — redirect with intent preservation

**Note: This step can be implemented in Phase 10.1 but is not fully testable until Phase 10.2 opens a public (unauthenticated) route to Location Detail. Location Detail is currently behind the `CustomerLayout` auth guard. The redirect logic should be implemented and ready to activate in 10.2.**

When an unauthenticated user clicks "Reserve" on the Location Detail page, redirect them to `/customer/login` with the intended location and time slot encoded in the URL (e.g. `?redirect=/customer/locations/:id&slot=:slotId`).

After login, `CustomerLogin` must read `redirect` and `slot` query params from `useSearchParams` and navigate back to the location detail page with the slot pre-selected. In `LocationDetail.tsx`, on mount, if a `slot` query param is present and the user is authenticated, auto-trigger the confirmation step for that slot.

In `LocationDetail.tsx`: check `AuthContext.token` before the Reserve action. If not authenticated, navigate to `/customer/login?redirect=...&slot=...` instead of triggering the booking flow.

No backend changes are required for this step.

---

### Step 5: Payment stub page

Create `src/pages/PaymentStub/PaymentStub.tsx` rendered at `/customer/payment`. This is an "Under Construction" placeholder shown after a successful booking confirmation. The page must display: a success confirmation that the reservation was received, the location name and time slot, and a note that payment processing is coming soon. Register the route under `CustomerLayout` in `src/routes/index.tsx`. After `createBooking` succeeds in Step 3, redirect to `/customer/payment` carrying location and slot info as route state.

---

### Step 6: Booking cancellation on My Bookings

Add a Cancel button to each booking card in `MyBookings.tsx` for bookings where `status === 'BOOKED'` and `slot_start_time` is in the future (not EXPIRED). Add `cancelBooking(bookingId: string): Promise<void>` to `customer.api.ts` calling `DELETE /api/customer/bookings/:id`. Add a `useCancelBooking` hook exposing `{ cancelBooking, isLoading, error }`.

Clicking Cancel shows an inline confirmation. On confirm, call `cancelBooking`. On success, re-fetch the booking list and update the card in place. On error, show an inline error message.

No backend changes are required — `DELETE /api/customer/bookings/:id` is already implemented.

---

### Step 7: End-to-end smoke test

Verify the full booking flow end-to-end against a running backend. No new source code is written in this step. Test paths: authenticated customer reserve → confirm → payment stub; cancel a booking from My Bookings; EXPIRED display for past bookings; enriched My Bookings display. Guest path (Step 4) is marked as pending Phase 10.2 — verify the redirect logic fires correctly when a non-authenticated state is simulated. Any failures discovered must be fixed before this step is closed.

---

## Notes

- **Step 1 must be complete before Steps 2–7 begin.** The enriched booking backend change (1c) and the MyBookings frontend update (1d/1e) are the highest-priority items.
- **`EnrichedBooking` type strategy:** Introduce a distinct `EnrichedBooking` interface in both backend and frontend. Do not mutate the base `Booking` type, which is still used by `POST /api/customer/bookings` and `DELETE /api/customer/bookings/:id`.
- **Slot availability vs. booking conflict race condition:** `CustomerService.createBooking` already throws `SlotUnavailableError` (→ `409`) if a slot is concurrently booked. The confirmation step must handle this gracefully with a user-facing message.
- **Available slots endpoint already exists:** `GET /api/customer/locations/:id/slots` is implemented in the backend (Phase 5). No backend changes are needed for Step 2.
- **Cancellation guard:** Cancel is only shown for `BOOKED` slots where `slot_start_time` is in the future. EXPIRED bookings must not show a cancel button.
- **No payment schema changes:** The payment stub page (Step 5) is a UI-only placeholder. No payment domain model, schema migration, or API endpoint is introduced.
- **Logo asset filenames (Step 1g):** Implementer must confirm actual file names from `assets/qr_logos/` before referencing them in source.
- **Forgot Password:** Deferred to Stretch Goals. Not part of this phase.
- **Deferred to Phase 10.2:** Unauthenticated browsing and the fully testable guest booking path.
- **Deferred Post-MVP:** Actual payment processing, email delivery, `BookingLocationRules` enforcement.
