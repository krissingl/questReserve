# Phase 6.6: Automated Testing

_Created: 2026-03-10 | Status: DRAFT_

## Goal

Introduce the project's first automated test suite: unit tests for `CustomerService`, `ProviderService`, `AuthService`, and `AdminService`, and integration tests for the booking and availability workflows against a real `questreserve_test` database. This phase closes the gap left by Phases 1–6, where no tests were ever written.

## Context

Phases 1–6 and Phase 6.5 (Backend Consolidation) are complete. The following stable modules are the input to this phase:

- `src/services/customer.service.ts` — `CustomerService` with typed errors: `SlotNotFoundError`, `SlotUnavailableError`, `BookingNotFoundError`, `BookingOwnershipError`, `BookingAlreadyCancelledError`
- `src/services/provider.service.ts` — `ProviderService` with typed errors: `LocationNotFoundError`, `LocationOwnershipError`, `SlotNotFoundError`
- `src/services/auth.service.ts` — `AuthService` (Knex-dependent) with typed errors: `InvalidCredentialsError`, `DuplicateAccountError`, `SuspendedAccountError`
- `src/services/admin.service.ts` — `AdminService` (Knex-dependent) with typed error: `ProviderNotFoundError`. Currently queries the `provider` table directly for `listProviders`, `getProvider`, and `setProviderStatus` rather than through a repository. `getPlatformBookings` is a multi-table join and intentionally stays as a service-level query.
- `src/repositories/` — `BookingLocationRepository`, `TimeSlotRepository`, `BookingRepository`; all are concrete classes that can be mocked in unit tests
- `src/db/knexfile.ts` — `test` environment already defined, pointing to the `questreserve_test` local database
- `src/tests/index.ts` — empty stub; the intended home for shared test setup utilities (knex test instance, factory functions, teardown helpers)
- `questreserve-backend/README.md` — developer setup guide produced in Phase 6.5; already documents `createdb questreserve_test`

Code review fixes from Phase 6.5 Step 2 are assumed applied — in particular, `delete` is declared on `BaseRepository<T>` and `password_hash` is stripped from all service responses.

The comment in `admin.service.ts` (line 13–17) explicitly flags `listProviders`, `getProvider`, and `setProviderStatus` as candidates for a `ProviderRepository` refactor. That refactor is the prerequisite for unit testing `AdminService` and is the first step of this phase.

## Steps

### Step 1: Configure Jest and ts-jest

Install `jest`, `ts-jest`, and `@types/jest` as dev dependencies. Add a `jest.config.ts` (or equivalent config block in `package.json`) at the `questreserve-backend/` root that:

- Sets the test runner to `ts-jest` so TypeScript files are compiled without a separate build step
- Configures `testEnvironment` to `node`
- Points test discovery at `src/**/*.test.ts`
- Sets `NODE_ENV=test` so Knex picks up the `test` environment from `knexfile.ts` in integration tests

No test files are written in this step. The goal is a green `npx jest --listTests` output (empty list) confirming the runner is wired correctly.

### Step 2: Extract ProviderRepository from AdminService

Create `src/repositories/provider.repository.ts` as a concrete repository extending `BaseRepository<Provider>`. Implement the three single-table methods currently inlined in `AdminService`:

- `findAll(): Promise<Provider[]>` — replaces the `listProviders` Knex query
- `findById(id: string): Promise<Provider | null>` — replaces the `getProvider` Knex query (note: `BaseRepository` already declares `findById`; confirm the concrete implementation satisfies it)
- `updateStatus(id: string, status: ProviderStatus): Promise<Provider | null>` — replaces the `setProviderStatus` Knex query, returning the full `Provider` row (including `password_hash`) so the service layer can strip it as it already does

Refactor `AdminService` to accept a `ProviderRepository` in its constructor alongside the `Knex` instance. Replace the three inline Knex queries with calls to the new repository. `getPlatformBookings` is a multi-table join and is not moved — it stays as a service-level Knex query.

The `admin` router instantiation must be updated to inject the new `ProviderRepository`. No behavior change is expected; this is a structural refactor only.

### Step 3: Implement Shared Test Utilities in `src/tests/index.ts`

Populate the existing empty stub at `src/tests/index.ts` with the shared helpers that all integration test suites will import:

- **`getTestKnex()`** — returns a Knex instance connected to the `test` environment from `knexfile.ts`
- **`runMigrations(knex)`** — calls `knex.migrate.latest()`; called in integration suite `beforeAll`
- **`rollbackMigrations(knex)`** — calls `knex.migrate.rollback({ all: true })`; called in integration suite `afterAll`
- **Factory functions** — `createTestEndUser(knex, overrides?)`, `createTestProvider(knex, overrides?)`, `createTestLocation(knex, providerId, overrides?)`, `createTestSlot(knex, locationId, overrides?)` — insert minimal valid rows and return the inserted entity

Integration tests seed only what they need via these factories. They do not import or run `001_core_init.ts`.

### Step 4: Unit Tests — `CustomerService`

Create `src/services/customer.service.test.ts`. All repository dependencies are replaced with Jest mock objects — no database is involved.

Methods and cases:

- **`browseLocations`**: returns all locations when no difficulty filter; returns filtered subset when difficulty is provided
- **`getAvailableSlots`**: returns only slots not present in booked bookings; applies date filter correctly when provided; returns empty array when no slots exist for the location; returns empty array when the date string is invalid
- **`createBooking`**: happy path returns a new `Booking`; throws `SlotNotFoundError` when slot does not exist; throws `SlotUnavailableError` when a `BOOKED` booking already exists for the slot
- **`cancelBooking`**: happy path returns updated booking with `status: CANCELLED`; throws `BookingNotFoundError` when booking does not exist; throws `BookingOwnershipError` when `end_user_id` does not match the caller; throws `BookingAlreadyCancelledError` when booking is already `CANCELLED`

### Step 5: Unit Tests — `ProviderService`

Create `src/services/provider.service.test.ts`. `BookingLocationRepository`, `TimeSlotRepository`, and the `Knex` instance are all replaced with Jest mocks.

Methods and cases:

- **`createLocation`**: happy path delegates to `locationRepo.create` and returns the result
- **`getLocation`**: throws `LocationNotFoundError` when location does not exist; throws `LocationOwnershipError` when location belongs to a different provider; returns location on success
- **`updateLocation`**: throws `LocationNotFoundError` / `LocationOwnershipError` via `assertLocationOwnership`; returns updated location on success
- **`createSlot`**: throws when ownership check fails; delegates to `slotRepo.create` on success
- **`getSlots`**: ownership check gates the slot list query; returns slot list on success
- **`updateSlot`**: throws `SlotNotFoundError` when slot does not exist; throws `LocationOwnershipError` when slot belongs to a location owned by a different provider; returns updated slot on success
- **`deleteSlot`**: throws on ownership failure; calls `slotRepo.delete` on success

### Step 6: Unit Tests — `AuthService`

Create `src/services/auth.service.test.ts`. `AuthService` takes a `Knex` instance directly, so the mock is a Knex query builder stub. `bcrypt.compare` and `bcrypt.hash` are mocked via `jest.mock('bcryptjs')` to keep tests fast and deterministic. `signToken` from `src/utils/jwt.ts` is mocked to return a predictable string.

Methods and cases:

- **`registerEndUser`**: throws `DuplicateAccountError` when a user with the same email exists; returns `{ token }` on success
- **`registerProvider`**: throws `DuplicateAccountError` on duplicate email; returns `{ token }` on success
- **`loginEndUser`**: throws `InvalidCredentialsError` when email not found; throws `InvalidCredentialsError` when password does not match; returns `{ token }` on success
- **`loginProvider`**: throws `InvalidCredentialsError` when email not found; throws `InvalidCredentialsError` on password mismatch; throws `SuspendedAccountError` when provider `status` is `SUSPENDED`; returns `{ token }` on success
- **`loginAdmin`**: throws `InvalidCredentialsError` when email not found; throws `InvalidCredentialsError` on password mismatch; returns `{ token }` on success

### Step 7: Unit Tests — `AdminService`

Create `src/services/admin.service.test.ts`. After the Step 2 refactor, `AdminService` accepts a `ProviderRepository` and a `Knex` instance. `ProviderRepository` is replaced with a Jest mock. The `Knex` instance is mocked only for the `getPlatformBookings` path.

Methods and cases:

- **`listProviders`**: delegates to `providerRepo.findAll` and returns results with `password_hash` stripped
- **`getProvider`**: throws `ProviderNotFoundError` when `providerRepo.findById` returns null; returns provider with `password_hash` stripped on success
- **`setProviderStatus`**: throws `ProviderNotFoundError` when `providerRepo.updateStatus` returns null; returns updated provider with `password_hash` stripped on success
- **`getPlatformBookings`**: mock Knex returns a shaped row; confirms the returned array is typed as `AdminBookingView[]`

### Step 8: Integration Tests — `CustomerService` Booking Workflow

Create `src/services/customer.service.integration.test.ts`. Runs against the real `questreserve_test` database using helpers from Step 3.

Lifecycle:
- `beforeAll`: call `runMigrations`, then use factory functions to seed one provider, one location, and two time slots
- `afterAll`: call `rollbackMigrations`

Cases:
- **`createBooking` happy path**: books a slot; confirms returned booking has `status: BOOKED` and correct `time_slot_id`
- **`createBooking` slot unavailable**: books a slot, then attempts to book the same slot again — expects `SlotUnavailableError`
- **`getAvailableSlots`**: after booking one of two slots, confirms only the unbooked slot appears in the result
- **`cancelBooking` happy path**: creates then cancels a booking; confirms `status: CANCELLED` in the returned row
- **`cancelBooking` ownership**: creates a booking as one end user, attempts cancel as a different end user — expects `BookingOwnershipError`

### Step 9: Integration Tests — `ProviderService` Location and Slot Ownership

Create `src/services/provider.service.integration.test.ts`. Runs against `questreserve_test`.

Lifecycle:
- `beforeAll`: call `runMigrations`, seed two providers and one location owned by provider A
- `afterAll`: call `rollbackMigrations`

Cases:
- **`createLocation`**: creates a location; confirms it is returned by `getLocations` for the owning provider and absent from `getLocations` for provider B
- **`getLocation` ownership**: provider B attempts to fetch provider A's location — expects `LocationOwnershipError`
- **`createSlot` / `deleteSlot`**: creates a slot, then deletes it; confirms the slot list is empty after deletion
- **`updateSlot` ownership**: provider B attempts to update a slot on provider A's location — expects `LocationOwnershipError`

### Step 10: Update Developer Setup Guide

Update `questreserve-backend/README.md` to document the additional steps required to run the automated test suite beyond what is already covered (the `questreserve_test` database creation is already documented).

Content to add:

- How to install test dependencies (`npm install` already covers this, but note that `jest` and `ts-jest` are dev dependencies)
- The command to run all tests (`npx jest` or the equivalent `npm` script from `package.json`)
- That integration tests require `questreserve_test` to exist and be empty before the first run — migrations are applied and rolled back automatically by the test suite
- That `NODE_ENV=test` is set automatically by the Jest config and does not need to be set manually

## Notes

- Steps 4–7 (unit tests) are independent of each other and of Steps 8–9, but all depend on Step 1 (Jest config). Steps 4–7 can be implemented in parallel after Step 1 is done.
- Steps 8–9 (integration tests) depend on Step 3 (shared utilities). Step 3 can begin in parallel with Steps 4–7.
- Step 2 (`ProviderRepository` extraction) must complete before Step 7 (`AdminService` unit tests). It should also complete before Steps 8–9 so that the integration test environment reflects the refactored service signatures.
- Integration tests must not share database state across files. Each integration test file runs `migrate.latest` / `migrate.rollback` independently.
- `AdminService.getPlatformBookings` is not covered by an integration test in this phase. It is a read-only join query with no typed error paths. Deferring its integration test is acceptable; the unit test in Step 7 confirms the return type contract.
- The `ProviderRepository` introduced in Step 2 follows the same pattern as the existing three concrete repositories in `src/repositories/`. It extends `BaseRepository<Provider>` and lives in `src/repositories/provider.repository.ts`.
