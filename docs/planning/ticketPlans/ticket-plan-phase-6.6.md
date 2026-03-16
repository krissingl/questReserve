# Ticket Plan: Phase 6.6 — Automated Testing

**Purpose:** Introduce the project's first automated test suite: Jest/ts-jest configuration, a `ProviderRepository` refactor to enable `AdminService` unit testing, shared integration test utilities, unit tests for all four services, and integration tests for the booking and availability workflows.
**Total tickets:** 10
**Status: LOCKED**

---

## Ticket 1 of 10

**Title:** P6.6: Configure Jest and ts-jest

**Description:**
Install `jest`, `ts-jest`, and `@types/jest` as dev dependencies and add a Jest configuration at the `questreserve-backend/` root. The goal of this ticket is a working test runner with zero test files — confirming wiring before any tests are written.

**Acceptance Criteria:**
- [ ] `jest`, `ts-jest`, and `@types/jest` are listed as dev dependencies in `questreserve-backend/package.json`
- [ ] A Jest configuration exists (either `jest.config.ts` at the `questreserve-backend/` root or a `jest` block in `package.json`) that sets the test runner to `ts-jest`, sets `testEnvironment` to `node`, and points test discovery at `src/**/*.test.ts`
- [ ] The Jest config sets `NODE_ENV=test` so Knex picks up the `test` environment from `knexfile.ts` when integration tests run
- [ ] `npx jest --listTests` runs without error and returns an empty list

---

## Ticket 2 of 10

**Title:** P6.6: Extract ProviderRepository from AdminService

**Description:**
Create `src/repositories/provider.repository.ts` as a concrete repository extending `BaseRepository<Provider>` and refactor `AdminService` to accept it via constructor injection. This is a structural refactor only — no behavior changes — and is the prerequisite for unit testing `AdminService` in Ticket 7.

**Acceptance Criteria:**
- [ ] `src/repositories/provider.repository.ts` exists, extends `BaseRepository<Provider>`, and implements `findAll(): Promise<Provider[]>`, `findById(id: string): Promise<Provider | null>`, and `updateStatus(id: string, status: ProviderStatus): Promise<Provider | null>`
- [ ] `findById` satisfies the abstract declaration on `BaseRepository<T>` without a separate override
- [ ] `updateStatus` returns the full `Provider` row (including `password_hash`) so the service layer strips it as it already does
- [ ] `AdminService` constructor accepts a `ProviderRepository` alongside the `Knex` instance; the three inline Knex queries for `listProviders`, `getProvider`, and `setProviderStatus` are replaced with calls to the new repository
- [ ] `getPlatformBookings` is not moved — it remains a service-level Knex query
- [ ] The `admin` router instantiation is updated to inject a `ProviderRepository` instance
- [ ] All existing admin API behaviors are unchanged (verified manually or by the integration tests that follow in Ticket 9)

---

## Ticket 3 of 10

**Title:** P6.6: Implement shared test utilities in `src/tests/index.ts`

**Description:**
Populate the existing empty stub at `src/tests/index.ts` with the helpers all integration test suites will import: a test Knex instance, migration lifecycle helpers, and factory functions for seeding minimal valid rows.

**Acceptance Criteria:**
- [ ] `src/tests/index.ts` exports `getTestKnex()` returning a Knex instance connected to the `test` environment from `knexfile.ts`
- [ ] `src/tests/index.ts` exports `runMigrations(knex)` (calls `knex.migrate.latest()`) and `rollbackMigrations(knex)` (calls `knex.migrate.rollback({ all: true })`)
- [ ] `src/tests/index.ts` exports `createTestEndUser(knex, overrides?)`, `createTestProvider(knex, overrides?)`, `createTestLocation(knex, providerId, overrides?)`, and `createTestSlot(knex, locationId, overrides?)` — each inserts a minimal valid row and returns the inserted entity
- [ ] Factory functions do not import or run `001_core_init.ts`
- [ ] The utilities compile under `ts-jest` without type errors

**Dependencies:** Ticket 1 — Jest/ts-jest must be configured before these utilities can be validated against the runner

---

## Ticket 4 of 10

**Title:** P6.6: Write unit tests for CustomerService

**Description:**
Create `src/services/customer.service.test.ts` covering all four public methods of `CustomerService`. All repository dependencies are replaced with Jest mock objects — no database is involved.

**Acceptance Criteria:**
- [ ] `src/services/customer.service.test.ts` exists and all tests pass
- [ ] `browseLocations`: returns all locations when no difficulty filter is applied; returns a filtered subset when a difficulty value is provided
- [ ] `getAvailableSlots`: returns only slots not present in booked bookings; applies a date filter correctly when one is provided; returns an empty array when no slots exist for the location; returns an empty array when the date string is invalid
- [ ] `createBooking`: happy path returns a new `Booking`; throws `SlotNotFoundError` when the slot does not exist; throws `SlotUnavailableError` when a `BOOKED` booking already exists for the slot
- [ ] `cancelBooking`: happy path returns the updated booking with `status: CANCELLED`; throws `BookingNotFoundError` when the booking does not exist; throws `BookingOwnershipError` when `end_user_id` does not match the caller; throws `BookingAlreadyCancelledError` when the booking is already `CANCELLED`

**Dependencies:** Ticket 1 — Jest config must exist before test files can run

---

## Ticket 5 of 10

**Title:** P6.6: Write unit tests for ProviderService

**Description:**
Create `src/services/provider.service.test.ts` covering all public methods of `ProviderService`. `BookingLocationRepository`, `TimeSlotRepository`, and the `Knex` instance are all replaced with Jest mocks.

**Acceptance Criteria:**
- [ ] `src/services/provider.service.test.ts` exists and all tests pass
- [ ] `createLocation`: happy path delegates to `locationRepo.create` and returns the result
- [ ] `getLocation`: throws `LocationNotFoundError` when the location does not exist; throws `LocationOwnershipError` when the location belongs to a different provider; returns the location on success
- [ ] `updateLocation`: throws `LocationNotFoundError` or `LocationOwnershipError` via `assertLocationOwnership`; returns the updated location on success
- [ ] `createSlot`: throws when the ownership check fails; delegates to `slotRepo.create` on success
- [ ] `getSlots`: the ownership check gates the slot list query; returns the slot list on success
- [ ] `updateSlot`: throws `SlotNotFoundError` when the slot does not exist; throws `LocationOwnershipError` when the slot belongs to a location owned by a different provider; returns the updated slot on success
- [ ] `deleteSlot`: throws on ownership failure; calls `slotRepo.delete` on success

**Dependencies:** Ticket 1 — Jest config must exist before test files can run

---

## Ticket 6 of 10

**Title:** P6.6: Write unit tests for AuthService

**Description:**
Create `src/services/auth.service.test.ts` covering all five public methods of `AuthService`. The `Knex` instance is stubbed via a query builder mock, `bcryptjs` is mocked via `jest.mock('bcryptjs')`, and `signToken` from `src/utils/jwt.ts` is mocked to return a predictable string.

**Acceptance Criteria:**
- [ ] `src/services/auth.service.test.ts` exists and all tests pass
- [ ] `registerEndUser`: throws `DuplicateAccountError` when a user with the same email already exists; returns `{ token }` on success
- [ ] `registerProvider`: throws `DuplicateAccountError` on duplicate email; returns `{ token }` on success
- [ ] `loginEndUser`: throws `InvalidCredentialsError` when the email is not found; throws `InvalidCredentialsError` when the password does not match; returns `{ token }` on success
- [ ] `loginProvider`: throws `InvalidCredentialsError` when the email is not found; throws `InvalidCredentialsError` on password mismatch; throws `SuspendedAccountError` when the provider `status` is `SUSPENDED`; returns `{ token }` on success
- [ ] `loginAdmin`: throws `InvalidCredentialsError` when the email is not found; throws `InvalidCredentialsError` on password mismatch; returns `{ token }` on success

**Dependencies:** Ticket 1 — Jest config must exist before test files can run

---

## Ticket 7 of 10

**Title:** P6.6: Write unit tests for AdminService

**Description:**
Create `src/services/admin.service.test.ts` covering all four public methods of `AdminService` after the Step 2 refactor. `ProviderRepository` is replaced with a Jest mock; the `Knex` instance is mocked only for the `getPlatformBookings` path.

**Acceptance Criteria:**
- [ ] `src/services/admin.service.test.ts` exists and all tests pass
- [ ] `listProviders`: delegates to `providerRepo.findAll` and returns results with `password_hash` stripped
- [ ] `getProvider`: throws `ProviderNotFoundError` when `providerRepo.findById` returns null; returns the provider with `password_hash` stripped on success
- [ ] `setProviderStatus`: throws `ProviderNotFoundError` when `providerRepo.updateStatus` returns null; returns the updated provider with `password_hash` stripped on success
- [ ] `getPlatformBookings`: mock Knex returns a shaped row; the returned array is typed as `AdminBookingView[]`

**Dependencies:** Ticket 2 — `ProviderRepository` must exist before `AdminService` can be constructed with it in tests

---

## Ticket 8 of 10

**Title:** P6.6: Write integration tests for CustomerService booking workflow

**Description:**
Create `src/services/customer.service.integration.test.ts` exercising the booking and availability workflow against the real `questreserve_test` database. Uses the shared utilities from Ticket 3.

**Acceptance Criteria:**
- [ ] `src/services/customer.service.integration.test.ts` exists and all tests pass against `questreserve_test`
- [ ] `beforeAll` calls `runMigrations` and seeds one provider, one location, and two time slots via factory functions
- [ ] `afterAll` calls `rollbackMigrations`
- [ ] `createBooking` happy path: books a slot; the returned booking has `status: BOOKED` and the correct `time_slot_id`
- [ ] `createBooking` slot unavailable: books a slot, then attempts to book the same slot again — expects `SlotUnavailableError`
- [ ] `getAvailableSlots`: after booking one of two slots, only the unbooked slot appears in the result
- [ ] `cancelBooking` happy path: creates then cancels a booking; the returned row has `status: CANCELLED`
- [ ] `cancelBooking` ownership: creates a booking as one end user, attempts cancel as a different end user — expects `BookingOwnershipError`
- [ ] This test file runs `migrate.latest` / `migrate.rollback` independently and does not share database state with any other integration test file

**Dependencies:** Ticket 3 — shared test utilities must exist; Ticket 2 — service signatures must reflect the refactored constructor

---

## Ticket 9 of 10

**Title:** P6.6: Write integration tests for ProviderService location and slot ownership

**Description:**
Create `src/services/provider.service.integration.test.ts` exercising location and slot ownership rules against the real `questreserve_test` database. Uses the shared utilities from Ticket 3.

**Acceptance Criteria:**
- [ ] `src/services/provider.service.integration.test.ts` exists and all tests pass against `questreserve_test`
- [ ] `beforeAll` calls `runMigrations` and seeds two providers and one location owned by provider A via factory functions
- [ ] `afterAll` calls `rollbackMigrations`
- [ ] `createLocation`: creates a location; it is returned by `getLocations` for the owning provider and absent from `getLocations` for provider B
- [ ] `getLocation` ownership: provider B attempts to fetch provider A's location — expects `LocationOwnershipError`
- [ ] `createSlot` / `deleteSlot`: creates a slot, then deletes it; the slot list is empty after deletion
- [ ] `updateSlot` ownership: provider B attempts to update a slot on provider A's location — expects `LocationOwnershipError`
- [ ] This test file runs `migrate.latest` / `migrate.rollback` independently and does not share database state with any other integration test file

**Dependencies:** Ticket 3 — shared test utilities must exist; Ticket 2 — service signatures must reflect the refactored constructor

---

## Ticket 10 of 10

**Title:** P6.6: Update developer setup README with automated testing instructions

**Description:**
Update `questreserve-backend/README.md` to document the steps required to run the automated test suite. The `questreserve_test` database creation is already documented; this ticket adds the test runner commands and their prerequisites.

**Acceptance Criteria:**
- [ ] `questreserve-backend/README.md` includes a section on automated testing
- [ ] The section notes that `jest` and `ts-jest` are installed as dev dependencies covered by `npm install`
- [ ] The section provides the exact command to run all tests (`npx jest` or the equivalent `npm` script defined in `package.json`)
- [ ] The section states that integration tests require `questreserve_test` to exist and be empty before the first run, and that migrations are applied and rolled back automatically by the test suite
- [ ] The section states that `NODE_ENV=test` is set automatically by the Jest config and does not need to be set manually
