# Ticket Plan: Phase 6.5 — Backend Consolidation

**Purpose:** Consolidate the completed backend (Phases 1–6) before frontend development begins: conduct a best-practices code review, apply fixes, standardize error responses, document the full API contract, write a local environment and testing guide, replace the placeholder seed with rich realistic data, and produce a developer setup README.
**Total tickets:** 7
**Status: DRAFT**

---

## Ticket 1 of 7

**Title:** Conduct backend code review for Phases 1–6

**Description:**
Read every file under `questreserve-backend/src/` and produce a structured findings document at `docs/planning/review/backend-code-review-p1-p6.md`. No code is changed in this ticket. All fixes are handled in Ticket 2.

**Acceptance Criteria:**
- [ ] `docs/planning/review/backend-code-review-p1-p6.md` exists
- [ ] Findings are grouped into three severity tiers: **Must Fix**, **Should Fix**, **Informational**
- [ ] Each finding states the file path, the specific issue, and a recommended resolution
- [ ] Architecture coherence is reviewed: HTTP logic must not appear in services, DB queries must not escape repositories, business logic must not appear in route handlers
- [ ] TypeScript quality is reviewed: non-null assertions (`req.user!`), loose `unknown` casts, missing return types, inconsistent use of interfaces vs inline types
- [ ] Repository pattern consistency is reviewed: `BookingRepository.findBookedByTimeSlots` and `findByTimeSlot` assessed against the `BaseRepository<T>` pattern; the direct-Knex usage in `AdminService` and `ProviderService.getBookings()` is documented as a known exception and assessed for unification
- [ ] Auth and authorization coverage is reviewed: every route requiring authentication is confirmed to have both `authenticate` and `requireRole` applied; the three intentionally public customer routes are noted; any other routes missing auth are flagged
- [ ] Error handling completeness is reviewed: every route handler is confirmed to pass unexpected errors to `next(err)`; any handler that swallows errors silently is flagged
- [ ] `password_hash` exposure is reviewed: `AdminService.listProviders()`, `getProvider()`, and `setProviderStatus()` are flagged as Must Fix; all other service methods returning user entities are assessed for the same issue
- [ ] Spec alignment is reviewed: any functionality present in code but not covered by a user story is flagged; any user story not addressed by code is noted (explicitly deferred stretch-goal items are acceptable omissions)
- [ ] The following known minor issues are documented: `validateRequiredStrings` defined identically in `src/api/provider/index.ts` and `src/api/customer/index.ts`; the `src/api/protected/` scaffolding route; the `'Ollo, Backend?'` root handler in `src/app/index.ts`
- [ ] The `src/api/protected/` scaffolding route is classified as **Informational** (deferred to stretch goals per the roadmap) — not Must Fix or Should Fix

---

## Ticket 2 of 7

**Title:** Apply Must Fix and Should Fix code review findings

**Description:**
Implement all Must Fix and Should Fix findings produced in Ticket 1. Three fixes are known at planning time and must be included regardless of additional findings: strip `password_hash` from all user entity responses, deduplicate `validateRequiredStrings` into a shared utility, and add `delete` to `BaseRepository<T>`. Any additional Must Fix or Should Fix findings from Ticket 1 are also addressed here.

**Acceptance Criteria:**
- [ ] All Must Fix findings from `docs/planning/review/backend-code-review-p1-p6.md` are resolved in code
- [ ] All Should Fix findings from `docs/planning/review/backend-code-review-p1-p6.md` are resolved in code
- [ ] `password_hash` is omitted from all service method return values that return `Provider`, `EndUser`, or `AdminUser` rows — applied consistently across `AdminService`, `AuthService`, and any other service identified in Ticket 1's review
- [ ] `validateRequiredStrings` is extracted to `src/utils/validation.ts` and imported from both `src/api/provider/index.ts` and `src/api/customer/index.ts`; the `validateBody` function in `src/api/auth/index.ts` (which includes a 72-character password length check) is assessed and either unified or kept separate with a comment documenting the reason
- [ ] `delete(id: string): Promise<void>` is declared on `BaseRepository<T>` as an abstract method and implemented on `BookingLocationRepository`, `TimeSlotRepository`, and `BookingRepository`
- [ ] Informational findings (including removal of `src/api/protected/`) are **not** addressed in this ticket
- [ ] No new domain features, endpoints, or migrations are introduced

**Dependencies:** Ticket 1 — findings document must exist before fixes can be applied

---

## Ticket 3 of 7

**Title:** Audit error response shape across all route handlers

**Description:**
Read every error-producing site across all routers and middleware and produce a written audit document at `docs/planning/review/error-response-audit.md`. If any handler deviates from the confirmed shape, a code fix is applied in the same ticket. The confirmed shape becomes the authoritative contract for Ticket 4's API documentation.

**Acceptance Criteria:**
- [ ] `docs/planning/review/error-response-audit.md` exists
- [ ] The document records the response shape used at every error site across: `src/middleware/index.ts` (`authenticate` 401, `requireRole` 403, `errorHandler` 500), `src/api/auth/index.ts` (`handleAuthError` — 400, 401, 403, 409), `src/api/provider/index.ts` (`handleProviderError` — 400, 404), `src/api/customer/index.ts` (`handleCustomerError` — 400, 403, 404, 409), `src/api/admin/index.ts` (`handleAdminError` — 400, 404)
- [ ] The document confirms or contradicts a uniform `{ "error": "<message string>" }` shape across all sites
- [ ] The document notes that `handleProviderError` mapping both `LocationNotFoundError` and `LocationOwnershipError` to HTTP 404 with `"Not found"` is intentional (no resource enumeration)
- [ ] The document records whether `BookingOwnershipError` mapping to HTTP 403 with a descriptive message in the customer router is confirmed as correct and intentional
- [ ] If any deviation from the uniform shape is found, a corresponding code fix is applied and noted in the document
- [ ] If the shape is already uniform, the document explicitly states this as the confirmed contract for frontend development

**Dependencies:** Ticket 2 — audit must reflect corrected code, not pre-fix state

---

## Ticket 4 of 7

**Title:** Write API contract documentation

**Description:**
Produce `docs/api/api-contract.md` as the complete API reference for all endpoints in the backend as of Phase 6. This document is the primary reference for frontend development starting in Phase 8 and must reflect the corrected response shapes after Ticket 2 (no `password_hash` in user entity responses) and the confirmed error shape from Ticket 3.

**Acceptance Criteria:**
- [ ] `docs/api/api-contract.md` exists
- [ ] The document is organized into one section per router group: health (1 endpoint), auth (5 endpoints), provider (8 endpoints), customer (6 endpoints), admin (4 endpoints)
- [ ] Each endpoint entry includes: method and path, auth requirement (none or Bearer token + role), request body fields (name, type, required/optional, constraints), query parameters (name, type, valid values), success response (HTTP status code and response body shape with field names and types), error responses (each possible HTTP status code, the condition that triggers it, and the `{ "error": "..." }` message or description)
- [ ] Response body shapes for success responses match the TypeScript interfaces in `src/types/index.ts` and exclude `password_hash` from all user entity responses
- [ ] `GET /api/protected/me` is documented as a deprecated internal scaffolding endpoint with a note that it is not a production feature
- [ ] The three intentionally public customer routes (`GET /api/customer/locations`, `GET /api/customer/locations/:id`, `GET /api/customer/locations/:id/slots`) are documented with auth requirement: none

**Dependencies:** Ticket 3 — error shape must be confirmed before it can be documented as the authoritative contract

---

## Ticket 5 of 7

**Title:** Rewrite DB seed with rich realistic data

**Description:**
Rewrite `src/db/seeds/001_core_init.ts` to replace the placeholder seed with frontend-QA-ready data fitting the dungeon/escape-room theme. Also update `src/db/knexfile.ts` to configure the `seeds` directory so `npx knex seed:run` works without a manual path argument.

**Acceptance Criteria:**
- [ ] `src/db/seeds/001_core_init.ts` is fully rewritten; no placeholder strings such as `"hashed_pw"` remain
- [ ] `src/db/knexfile.ts` includes a `seeds` directory configuration for the `development` environment
- [ ] 6 providers exist with distinct `organization_name` values, distinct `plan` values covering `FREE`, `STANDARD`, and `PREMIUM`, and thematic fantasy names
- [ ] Exactly 1 of the 6 providers has `status: 'SUSPENDED'`
- [ ] At least 6 booking locations exist (at least 1 per provider); collectively they cover all 4 `Difficulty` values: `EASY`, `MEDIUM`, `HARD`, `LEGENDARY`
- [ ] At least 1 provider has more than one booking location, with distinct names and descriptions
- [ ] Each location has a realistic cancellation policy string (e.g., "No refunds within 24 hours of the raid")
- [ ] Time slots are spread across multiple future dates and varied times — not clustered in a single hour window
- [ ] 8 end users exist covering all three `EndUserRole` values: `REGULAR`, `PREMIERE`, `CORPORATE`
- [ ] At least 6 bookings exist: at minimum 2 with `status: 'CANCELLED'` and at least 4 with `status: 'BOOKED'`, spread across multiple users and multiple locations
- [ ] All passwords are hashed with `bcryptjs` at `SALT_ROUNDS = 10`; all seed accounts are loginable with the shared password `Password1!`
- [ ] At least one admin user, one provider, and one end user have known fixed UUIDs hardcoded in the seed (to enable stable curl examples in Ticket 6)

**Dependencies:** Ticket 2 — seed is written against the fixed codebase state

---

## Ticket 6 of 7

**Title:** Write local environment and testing guide

**Description:**
Produce `docs/planning/testing/backend-testing-guide.md` for a developer who needs to get a local backend environment running in order to test their work. The guide removes setup friction — it does not prescribe what to test. Smoke-check curl examples must reference the known fixed UUIDs from the seed written in Ticket 5.

**Acceptance Criteria:**
- [ ] `docs/planning/testing/backend-testing-guide.md` exists
- [ ] Prerequisites section lists required Node.js version, PostgreSQL version, and any other required tooling
- [ ] Install section covers `npm install` from `questreserve-backend/`
- [ ] Environment configuration section lists all required `.env` variables with descriptions and points to `questreserve-backend/README.md` for the full variable list
- [ ] Database setup section provides exact commands for: create the database, `npx knex migrate:latest`, `npx knex seed:run`; each command is accompanied by its expected output so the developer can confirm success
- [ ] Start the server section gives the exact start command from `package.json` and shows the expected `GET /api/health` response
- [ ] Smoke check section contains 2–3 copy-paste curl examples using known fixed UUIDs from the Ticket 5 seed (e.g., health check, log in as the seed admin user, fetch the provider list)
- [ ] Common failure modes section covers: wrong Node version, Postgres not running, missing `.env` variable, migration run on a dirty DB, seed accounts not found
- [ ] Advisory automated testing section documents the recommended approach: unit tests for `CustomerService`, `ProviderService`, `AuthService` with mocked repositories; integration tests using the `test` Knex environment (`questreserve_test` DB); Jest with `ts-jest` as the test runner; a note that `src/tests/index.ts` is the intended home for test setup utilities
- [ ] No test files are created or modified in this ticket

**Dependencies:** Ticket 5 — smoke-check curl examples require known fixed UUIDs from the seed; Ticket 7 — environment configuration section points to the README for the full variable list

---

## Ticket 7 of 7

**Title:** Write developer setup README

**Description:**
Write `questreserve-backend/README.md` as the canonical onboarding document for a new contributor or portfolio reviewer approaching the project cold. Must be accurate enough that a developer following it from scratch can reach a running server with seed data in under 15 minutes.

**Acceptance Criteria:**
- [ ] `questreserve-backend/README.md` exists
- [ ] Project overview section describes what QuestReserve is, what the backend does, and lists the tech stack: Node.js, Express 5, TypeScript, Knex, PostgreSQL, JWT
- [ ] Prerequisites section lists required Node.js version, PostgreSQL version, and recommended tooling
- [ ] Clone and install section provides step-by-step instructions: `git clone`, `cd questreserve-backend`, `npm install`
- [ ] Environment configuration section lists every required `.env` variable with description and example value: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`, `JWT_EXPIRY_SECONDS` (optional, defaults noted)
- [ ] Database setup section covers: `createdb questreserve`, `npx knex migrate:latest`, `npx knex seed:run`; includes a note about the `questreserve_test` DB for future test runs
- [ ] Run the server section gives the exact start command from `package.json` and confirms the server is up via `GET /api/health`
- [ ] Seed accounts section contains a table of all seed users with: email, password (`Password1!`), user type, role/plan, and status — including the suspended provider
- [ ] API overview section provides a table of route groups (auth, provider, customer, admin) with a pointer to `docs/api/api-contract.md` for full documentation
- [ ] Project structure section contains an annotated directory tree of `questreserve-backend/src/` explaining the purpose of each top-level folder

**Dependencies:** Ticket 5 — seed accounts table requires knowledge of all seed users, their emails, roles, and the suspended provider
