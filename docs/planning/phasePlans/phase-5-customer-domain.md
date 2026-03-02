# Phase 5: Backend — Customer & Admin Domains

_Created: 2026-03-01 | Status: DRAFT_

## Goal

Build the complete customer-facing and admin-facing backends in one phase. Customer domain: browsing and filtering BookingLocations, real-time slot availability, booking creation, booking history, and cancellation. Admin domain: platform-wide provider management (including suspension) and a global booking activity view. Also introduces a `status` column on the `provider` table to enable the suspension feature and set the project up for future account lifecycle work.

## Context

Phase 4 (Provider Domain) is complete. `BookingLocationRepository`, `TimeSlotRepository`, and `ProviderService` are in place. EndUser and Provider registration and login are implemented via `AuthService` in Phase 3. The `booking` table exists with status `BOOKED | CANCELLED`. No customer or admin routes exist. The `src/repositories/` and `src/services/` patterns are established. The `provider` table currently has no status field — this phase adds one to support account suspension.

Phase 6 (Admin Domain) is folded into this phase. The admin domain is lightweight enough to implement alongside the customer domain without overloading the phase, and `BookingRepository` introduced here is immediately available for the admin booking activity view.

## Steps

### Step 1: Provider Status Migration

Add a `status` column to the `provider` table:
- Type: enum, values `ACTIVE | SUSPENDED`, default `ACTIVE`
- All existing providers default to `ACTIVE` — non-breaking migration

Update the `Provider` type in `src/types/index.ts` to include `status: ProviderStatus`.

Update `AuthService.loginProvider()` to check provider status after credential validation. A `SUSPENDED` provider receives a new typed `SuspendedAccountError`, mapped to HTTP 403 at the auth route layer. Status is checked after password validation — the existence of the account is not revealed to the caller before credentials are confirmed.

### Step 2: BookingRepository

Implement `BookingRepository` in `src/repositories/` extending `BaseRepository<Booking>`.

Add the following beyond the base interface:
- `findAllByEndUser(endUserId: string)` — returns all bookings for a given end user, used for booking history
- `findByTimeSlot(timeSlotId: string)` — returns the active (`BOOKED`) booking for a slot if one exists, used for real-time availability checking

### Step 3: CustomerService

Create `src/services/customer.service.ts`. Receives `BookingLocationRepository`, `TimeSlotRepository`, and `BookingRepository` via constructor injection, matching the established pattern.

Responsibilities:
- **Browse locations** — return all BookingLocations, optionally filtered by `difficulty`
- **Location detail** — return a single BookingLocation by ID
- **Slot availability** — return available TimeSlots for a location, optionally filtered by date; a slot is available if `findByTimeSlot` returns no result for it
- **Create booking** — verify the slot exists and is available, then create a `Booking` record with status `BOOKED`
- **Booking history** — return all bookings for the authenticated end user
- **Cancel booking** — verify the booking exists, belongs to the end user, and is currently `BOOKED`; update status to `CANCELLED`

Typed errors: `SlotNotFoundError`, `SlotUnavailableError`, `BookingNotFoundError`, `BookingOwnershipError`, `BookingAlreadyCancelledError`

No HTTP logic in the service.

### Step 4: Customer API Routes

Create `src/api/customer/` and register it on the root API router. Routes are split between public (no auth) and authenticated (`authenticate + requireRole('end_user')`).

**Public routes (no auth required):**
- `GET /api/customer/locations` — list all BookingLocations; optional `?difficulty=` query param (validated against `Difficulty` enum)
- `GET /api/customer/locations/:id` — view a single BookingLocation
- `GET /api/customer/locations/:id/slots` — view available TimeSlots for a location; optional `?date=` query param (ISO date string, filters slots whose `start_time` falls on that date)

**Authenticated routes (`authenticate + requireRole('end_user')`):**
- `POST /api/customer/bookings` — create a booking; body: `{ time_slot_id }`
- `GET /api/customer/bookings` — booking history for the authenticated end user
- `DELETE /api/customer/bookings/:id` — cancel a booking (sets status to `CANCELLED`)

All authenticated handlers validate required body fields before calling the service. Business logic delegated entirely to `CustomerService`.

### Step 5: AdminService

Create `src/services/admin.service.ts`. Receives `Knex` directly for the platform booking activity join query, following the pattern established in `ProviderService.getBookings()`.

Responsibilities:
- **List providers** — return all providers including their status
- **Get provider** — return a single provider by ID; throw `ProviderNotFoundError` if not found
- **Set provider status** — update a provider's `status` to `ACTIVE` or `SUSPENDED`; throw `ProviderNotFoundError` if provider not found
- **Platform booking activity** — return all bookings across all providers; joins `booking → time_slot → booking_location → provider`

Typed errors: `ProviderNotFoundError`

No HTTP logic in the service.

### Step 6: Admin API Routes

Create `src/api/admin/` and register it on the root API router. All routes protected by `authenticate + requireRole('admin')`.

- `GET /api/admin/providers` — list all providers
- `GET /api/admin/providers/:id` — view a single provider
- `PATCH /api/admin/providers/:id/status` — update provider status; body: `{ status: 'ACTIVE' | 'SUSPENDED' }`
- `GET /api/admin/bookings` — platform-wide booking activity across all providers

All handlers validate required body fields before calling the service. Business logic delegated entirely to `AdminService`.

## Notes

- `ProviderStatus` enum (`ACTIVE | SUSPENDED`) is introduced in Step 1 and added to `src/types/index.ts` alongside the existing domain types
- Status is checked in `AuthService.loginProvider()` after password validation — a suspended account is not revealed until credentials are confirmed, avoiding account enumeration
- Browse and slot availability routes are public — customers can explore locations before registering
- Cancellation is a status update to `CANCELLED`, not a hard delete — preserves the booking record for audit trail
- Slot availability is determined at query time: available = no existing `BOOKED` booking for that slot ID
- Admin booking activity spans all providers — no `provider_id` scoping, unlike the provider booking view
- Phase 4's provider booking view used a raw Knex join; now that `BookingRepository` exists, a future `CHORE:` ticket may refactor it to use the repository
- `GET /api/protected/me` scaffolding route (added in Phase 3) remains as-is; replacement with real per-type user-fetch endpoints is tracked in stretch goals
