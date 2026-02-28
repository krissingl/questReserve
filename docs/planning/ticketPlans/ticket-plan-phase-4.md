# Ticket Plan: Phase 4 — Provider Domain

**Purpose:** Build the complete provider-facing backend with full CRUD for BookingLocations and TimeSlots scoped to the authenticated provider, and a read-only booking view across the provider's locations. Delivers the first concrete repository implementations following the BaseRepository pattern.
**Total tickets:** 5
**Status: LOCKED** — This plan is complete and approved. The agent must not add, remove, reorder, or infer any ticket beyond what is listed below.

---

## Ticket 1 of 5

**Title:** P4:Implement BookingLocation repository

**Description:**
Create `src/repositories/` and implement `BookingLocationRepository` extending `BaseRepository<BookingLocation>`. This is the first concrete repository implementation in the project and establishes the `src/repositories/` directory as the home for all future implementations.

**Acceptance Criteria:**
- [ ] `src/repositories/` directory created
- [ ] `BookingLocationRepository` implemented in `src/repositories/` extending `BaseRepository<BookingLocation>`
- [ ] All base interface methods (`findById`, `findAll`, `create`, `update`) are implemented
- [ ] `findAllByProvider(providerId: string)` method added beyond the base interface, returning all locations for a given provider
- [ ] Knex instance is injected via constructor, not imported directly

---

## Ticket 2 of 5

**Title:** P4:Implement TimeSlot repository

**Description:**
Implement `TimeSlotRepository` in `src/repositories/` extending `BaseRepository<TimeSlot>`. Adds `findAllByLocation` to support the provider's slot listing use case. Provider ownership is not enforced at the repository layer.

**Acceptance Criteria:**
- [ ] `TimeSlotRepository` implemented in `src/repositories/` extending `BaseRepository<TimeSlot>`
- [ ] All base interface methods (`findById`, `findAll`, `create`, `update`) are implemented
- [ ] `findAllByLocation(locationId: string)` method added beyond the base interface, returning all slots for a given location
- [ ] Knex instance is injected via constructor, not imported directly
- [ ] No provider ownership checks exist in the repository — that responsibility belongs to the service layer

---

## Ticket 3 of 5

**Title:** P4:Implement provider service

**Description:**
Create `src/services/provider.service.ts` following the constructor-injection pattern established by `AuthService`. Handles all BookingLocation and TimeSlot business logic scoped to the authenticated provider, including ownership verification before any TimeSlot write.

**Acceptance Criteria:**
- [ ] `src/services/provider.service.ts` exists
- [ ] `BookingLocationRepository` and `TimeSlotRepository` are injected via constructor
- [ ] All BookingLocation CRUD operations are scoped to the `providerId` passed from the JWT payload
- [ ] All TimeSlot CRUD operations are scoped to locations owned by the authenticated provider
- [ ] Service verifies location ownership before any TimeSlot write operation
- [ ] Typed errors are thrown for not-found and ownership violation cases
- [ ] No HTTP-layer logic (no access to `req` or `res`) exists in the service

---

## Ticket 4 of 5

**Title:** P4:Add provider API routes for locations and time slots

**Description:**
Create `src/api/provider/` and register it on the root API router. Exposes full CRUD for BookingLocations and TimeSlots. All routes are protected by `authenticate + requireRole('provider')` and all handlers validate required body fields before calling the service.

**Acceptance Criteria:**
- [ ] `src/api/provider/` directory and router created and mounted on the root API router
- [ ] All routes protected by `authenticate` + `requireRole('provider')` middleware
- [ ] `POST /api/provider/locations` creates a new BookingLocation
- [ ] `GET /api/provider/locations` returns all locations for the authenticated provider
- [ ] `GET /api/provider/locations/:id` returns a single location by ID
- [ ] `PATCH /api/provider/locations/:id` updates individual fields on a location
- [ ] `POST /api/provider/locations/:locationId/slots` creates a new TimeSlot under the given location
- [ ] `GET /api/provider/locations/:locationId/slots` returns all slots for the given location
- [ ] `PATCH /api/provider/slots/:id` updates individual fields on a time slot
- [ ] `DELETE /api/provider/slots/:id` deletes a time slot
- [ ] All handlers validate required body fields and return `400` if validation fails
- [ ] All business logic is delegated to the provider service; controllers handle HTTP only

---

## Ticket 5 of 5

**Title:** P4:Add provider booking view

**Description:**
Add a read-only `GET /api/provider/bookings` endpoint that returns all bookings across the authenticated provider's locations. The query joins across `booking → time_slot → booking_location` filtered by `provider_id` and runs via Knex directly in the service — no `BookingRepository` is needed in this phase.

**Acceptance Criteria:**
- [ ] `GET /api/provider/bookings` endpoint exists and is protected by `authenticate + requireRole('provider')`
- [ ] Returns all bookings associated with the authenticated provider's locations
- [ ] Query joins `booking`, `time_slot`, and `booking_location` tables and filters by `provider_id`
- [ ] Join query is executed via Knex directly in the provider service — no separate `BookingRepository` is created
- [ ] No booking write endpoints are added in this ticket
- [ ] Response is scoped strictly to the authenticated provider — no cross-provider data is returned
