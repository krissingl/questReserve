# Ticket Plan: Phase 5 — Customer & Admin Domains

**Purpose:** Build the complete customer-facing and admin-facing backends in one phase. Introduces a provider status migration for account suspension, BookingRepository for booking data access, CustomerService and customer API routes for browsing/booking/cancellation, and AdminService and admin API routes for platform-wide provider management and booking activity.
**Total tickets:** 6
**Status: LOCKED** — This plan is complete and approved. The agent must not add, remove, reorder, or infer any ticket beyond what is listed below.

---

## Ticket 1 of 6

**Title:** P5:Add provider status migration

**Description:**
Add a `status` column to the `provider` table (enum: `ACTIVE | SUSPENDED`, default `ACTIVE`) and update the domain type and auth service to enforce suspension. This is a non-breaking migration — all existing providers default to `ACTIVE`.

**Acceptance Criteria:**
- [ ] Migration adds a `status` column to the `provider` table with type enum `ACTIVE | SUSPENDED` and default `ACTIVE`
- [ ] All existing providers remain `ACTIVE` after the migration runs — no data loss
- [ ] `ProviderStatus` enum (`ACTIVE | SUSPENDED`) is added to `src/types/index.ts`
- [ ] `Provider` type in `src/types/index.ts` includes `status: ProviderStatus`
- [ ] `AuthService.loginProvider()` checks provider status after password validation
- [ ] A suspended provider receives a typed `SuspendedAccountError` from the service
- [ ] The auth route layer maps `SuspendedAccountError` to HTTP 403
- [ ] Status is checked after password validation — account existence is not revealed before credentials are confirmed

---

## Ticket 2 of 6

**Title:** P5:Implement BookingRepository

**Description:**
Implement `BookingRepository` in `src/repositories/` extending `BaseRepository<Booking>`. Adds two methods beyond the base interface to support booking history and real-time slot availability checking.

**Acceptance Criteria:**
- [ ] `BookingRepository` implemented in `src/repositories/` extending `BaseRepository<Booking>`
- [ ] All base interface methods (`findById`, `findAll`, `create`, `update`) are implemented
- [ ] `findAllByEndUser(endUserId: string)` method added, returning all bookings for a given end user
- [ ] `findByTimeSlot(timeSlotId: string)` method added, returning the active (`BOOKED`) booking for a slot if one exists
- [ ] Knex instance is injected via constructor, not imported directly

---

## Ticket 3 of 6

**Title:** P5:Implement customer service

**Description:**
Create `src/services/customer.service.ts` to handle all customer-facing business logic: browsing locations, checking slot availability, creating bookings, viewing booking history, and cancelling bookings. Follows the constructor-injection pattern established in prior phases.

**Acceptance Criteria:**
- [ ] `src/services/customer.service.ts` exists
- [ ] `BookingLocationRepository`, `TimeSlotRepository`, and `BookingRepository` are injected via constructor
- [ ] Browse locations returns all BookingLocations, optionally filtered by `difficulty`
- [ ] Location detail returns a single BookingLocation by ID
- [ ] Slot availability returns available TimeSlots for a location (optionally filtered by date); a slot is available if `findByTimeSlot` returns no result for it
- [ ] Create booking verifies the slot exists and is available, then creates a `Booking` record with status `BOOKED`
- [ ] Booking history returns all bookings for the authenticated end user
- [ ] Cancel booking verifies the booking exists, belongs to the end user, and is currently `BOOKED`; updates status to `CANCELLED`
- [ ] Typed errors thrown: `SlotNotFoundError`, `SlotUnavailableError`, `BookingNotFoundError`, `BookingOwnershipError`, `BookingAlreadyCancelledError`
- [ ] No HTTP-layer logic (no access to `req` or `res`) exists in the service

---

## Ticket 4 of 6

**Title:** P5:Add customer API routes

**Description:**
Create `src/api/customer/` and register it on the root API router. Exposes public browsing routes and authenticated booking routes for end users. Business logic is delegated entirely to `CustomerService`.

**Acceptance Criteria:**
- [ ] `src/api/customer/` directory and router created and mounted on the root API router
- [ ] `GET /api/customer/locations` returns all BookingLocations; optional `?difficulty=` query param validated against the `Difficulty` enum
- [ ] `GET /api/customer/locations/:id` returns a single BookingLocation
- [ ] `GET /api/customer/locations/:id/slots` returns available TimeSlots for a location; optional `?date=` query param (ISO date string) filters by start date
- [ ] `POST /api/customer/bookings` creates a booking; body: `{ time_slot_id }`; protected by `authenticate + requireRole('end_user')`
- [ ] `GET /api/customer/bookings` returns booking history for the authenticated end user; protected by `authenticate + requireRole('end_user')`
- [ ] `DELETE /api/customer/bookings/:id` cancels a booking; protected by `authenticate + requireRole('end_user')`
- [ ] Public routes require no authentication
- [ ] All authenticated handlers validate required body fields and return `400` if validation fails
- [ ] All business logic is delegated to the customer service; controllers handle HTTP only

---

## Ticket 5 of 6

**Title:** P5:Implement admin service

**Description:**
Create `src/services/admin.service.ts` to handle platform-wide provider management and booking activity. Receives `Knex` directly for the cross-provider booking activity join query, following the pattern established in `ProviderService.getBookings()`.

**Acceptance Criteria:**
- [ ] `src/services/admin.service.ts` exists
- [ ] `Knex` instance is injected via constructor
- [ ] List providers returns all providers including their `status` field
- [ ] Get provider returns a single provider by ID; throws `ProviderNotFoundError` if not found
- [ ] Set provider status updates a provider's `status` to `ACTIVE` or `SUSPENDED`; throws `ProviderNotFoundError` if provider not found
- [ ] Platform booking activity returns all bookings across all providers via a join on `booking → time_slot → booking_location → provider`
- [ ] Typed error thrown: `ProviderNotFoundError`
- [ ] No HTTP-layer logic (no access to `req` or `res`) exists in the service

---

## Ticket 6 of 6

**Title:** P5:Add admin API routes

**Description:**
Create `src/api/admin/` and register it on the root API router. Exposes provider management and platform-wide booking activity endpoints. All routes are protected by `authenticate + requireRole('admin')`.

**Acceptance Criteria:**
- [ ] `src/api/admin/` directory and router created and mounted on the root API router
- [ ] All routes protected by `authenticate + requireRole('admin')` middleware
- [ ] `GET /api/admin/providers` returns all providers
- [ ] `GET /api/admin/providers/:id` returns a single provider
- [ ] `PATCH /api/admin/providers/:id/status` updates provider status; body: `{ status: 'ACTIVE' | 'SUSPENDED' }`
- [ ] `GET /api/admin/bookings` returns platform-wide booking activity across all providers
- [ ] All handlers validate required body fields and return `400` if validation fails
- [ ] All business logic is delegated to the admin service; controllers handle HTTP only
