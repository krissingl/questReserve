# Phase 4: Backend — Provider Domain

_Created: 2026-02-28 | Status: DRAFT_

## Goal

Build the complete provider-facing backend: full CRUD for BookingLocations and TimeSlots scoped to the authenticated provider, and a read-only view of bookings across the provider's locations. Delivers the first concrete repository implementations following the `BaseRepository` pattern established in Phase 2.

## Context

Phase 3 (Authentication) is complete. JWTs are issued and verified, `authenticate` and `requireRole` middleware are in place, and the `src/services/` pattern is established via `AuthService`. No domain routes exist yet. `BaseRepository<T>` is defined in `src/infrastructure/` but no concrete implementations have been written. A dedicated `src/repositories/` directory will be introduced here to hold all concrete implementations.

## Steps

### Step 1: BookingLocation Repository

Create `src/repositories/` and implement `BookingLocationRepository` extending `BaseRepository<BookingLocation>`.

Add `findAllByProvider(providerId: string)` beyond the base interface to support the provider listing use case. All queries are inherently provider-scoped through this method and `findById`.

### Step 2: TimeSlot Repository

Implement `TimeSlotRepository` in `src/repositories/` extending `BaseRepository<TimeSlot>`.

Add `findAllByLocation(locationId: string)` beyond the base interface. Provider ownership is not enforced at the repository layer — that is the service layer's responsibility.

### Step 3: Provider Service

Create `src/services/provider.service.ts`. Receives repository instances via constructor injection, matching the pattern established by `AuthService`.

Responsibilities:
- BookingLocation CRUD scoped to the authenticated provider's ID from the JWT payload
- TimeSlot CRUD scoped to locations owned by the authenticated provider
- Verify location ownership before any TimeSlot write — throw typed errors for not-found and ownership violations
- No HTTP logic in the service

### Step 4: Provider API Routes — Locations and Slots

Create `src/api/provider/` and register it on the root API router. All routes protected by `authenticate + requireRole('provider')`.

Location routes:
- `POST /api/provider/locations`
- `GET /api/provider/locations`
- `GET /api/provider/locations/:id`
- `PATCH /api/provider/locations/:id`

Time slot routes (nested under location for creation and listing; flat for single-resource operations):
- `POST /api/provider/locations/:locationId/slots`
- `GET /api/provider/locations/:locationId/slots`
- `PATCH /api/provider/slots/:id`
- `DELETE /api/provider/slots/:id`

All handlers validate required body fields before calling the service.

### Step 5: Provider Booking View

Add a read-only booking view scoped to the authenticated provider's locations. Queries join across `booking → time_slot → booking_location` filtering by `provider_id`. No `BookingRepository` is needed yet — the join query runs via Knex directly in the service.

- `GET /api/provider/bookings`

No Booking writes in this phase — that belongs to Phase 5 (Customer Domain).

## Notes

- `src/repositories/` is introduced here as the home for all concrete repository implementations; `src/infrastructure/` retains only `BaseRepository` and DB connection concerns
- Provider data isolation is enforced at the service layer — service methods receive `providerId` from `req.user.sub` and scope all queries accordingly
- `PATCH` is used over `PUT` for updates — providers update individual fields, not full resource replacements
- Revenue reporting deferred to stretch goals — no payment schema exists yet (see `mvp-implementation-phases.md`)
- Phase 5 will implement full `BookingRepository`, booking creation, and cancellation
