# Phase 6.5: Backend Consolidation

_Created: 2026-03-03 | Status: DRAFT_

## Goal

Consolidate the completed backend (Phases 1–6) before frontend development begins: conduct a best-practices code review, standardize error response shapes, document the full API contract, write a backend testing guide, replace placeholder seed data with rich realistic data, and produce a developer setup README.

## Context

Phases 1–6 are complete. The following modules exist and are considered stable input to this phase:

- `src/middleware/index.ts` — `authenticate`, `requireRole`, `requestLogger`, `errorHandler`
- `src/infrastructure/index.ts` — `BaseRepository<T>` abstract class
- `src/types/index.ts` — all 6 domain types plus `ProviderBookingView` and `AdminBookingView` view types
- `src/utils/jwt.ts` — `signToken`, `verifyToken`
- `src/services/` — `AuthService`, `ProviderService`, `CustomerService`, `AdminService`
- `src/repositories/` — `BookingLocationRepository`, `TimeSlotRepository`, `BookingRepository`
- `src/api/` — routers for `auth`, `protected`, `provider`, `customer`, `admin`
- `src/db/seeds/001_core_init.ts` — placeholder seed with unhashed passwords, generic location names, no `CANCELLED` bookings, no all-difficulty coverage, and a single location per provider
- `src/db/knexfile.ts` — `development` and `test` environments defined; no `seeds` directory configured
- No `README` exists at the repo root or backend root

Phase 7 (Frontend — Branding & UI Strategy) has not started. This phase must complete before Phase 8 (Frontend — Scaffold) so that the frontend API client layer is built against a documented, stable contract.

This phase produces no new domain features. All output is either documentation artifacts (markdown files), code changes (error standardization, seed script rewrite, review fixes), or a review report.

## Steps

### Step 1: Full Backend Code Review

Conduct a structured best-practices review of all backend code written in Phases 1–6. The reviewer reads every file in `src/` and produces a written findings document at `docs/planning/review/backend-code-review-p1-p6.md`.

The review must cover:

- **Architecture coherence** — does each layer (router, service, repository) respect its responsibility boundary? Look for HTTP logic leaking into services, DB queries escaping repositories, or business logic in route handlers.
- **TypeScript quality** — non-null assertions (`req.user!`), loose `unknown` casts, missing return types, inconsistent use of interfaces vs inline types.
- **Repository pattern consistency** — `BaseRepository<T>` declares `findById`, `findAll`, `create`, `update`. Concrete repos add domain-specific finders. Check whether `BookingRepository.findBookedByTimeSlots` and `findByTimeSlot` are consistent with the established pattern. Note that `AdminService` and `ProviderService.getBookings()` both query Knex directly rather than through a repository — document this as a known exception and assess whether it should be unified.
- **Auth and authorization gaps** — confirm every route requiring authentication has both `authenticate` and `requireRole` applied. Note that `GET /api/customer/locations`, `GET /api/customer/locations/:id`, and `GET /api/customer/locations/:id/slots` are intentionally public; flag any other routes that may be missing auth.
- **Error handling completeness** — confirm every route handler passes unexpected errors to `next(err)` for the global `errorHandler` to handle. Flag any routes that swallow errors silently.
- **`password_hash` exposure** — `AdminService.listProviders()`, `getProvider()`, and `setProviderStatus()` return full `Provider` rows from Knex including `password_hash`. Assess all service methods that return user entities for the same issue. Flag as Must Fix.
- **Spec alignment** — flag any functionality present in code but not covered by a user story, and any user story the code does not address (noting items explicitly deferred to stretch goals are acceptable omissions).
- **Minor issues** — the `validateRequiredStrings` helper is defined identically in both `src/api/provider/index.ts` and `src/api/customer/index.ts`; the `src/api/protected/` scaffolding route tracked in stretch goals; the `'Ollo, Backend?'` root handler in `src/app/index.ts`.

The findings document groups findings by severity: **Must Fix**, **Should Fix**, and **Informational**. Each finding states the file, the issue, and a recommended resolution. No code is written in this step — findings only. Code fixes are addressed in Step 2.

Artifact: `docs/planning/review/backend-code-review-p1-p6.md`

### Step 2: Apply Code Review Fixes

Implement all Must Fix and Should Fix findings from Step 1. This is a code-change step.

Expected fixes based on known issues identified during planning:

- **Strip `password_hash` from user entity responses** — all service methods that return `Provider`, `EndUser`, or `AdminUser` rows must omit `password_hash` before returning. Apply consistently across `AdminService`, `AuthService`, and any other service returning user records.
- **Deduplicate `validateRequiredStrings`** — extract to `src/utils/validation.ts` and import from both `src/api/provider/index.ts` and `src/api/customer/index.ts`. The version in `src/api/auth/index.ts` (`validateBody`) has an additional 72-character password length check — assess whether to unify or keep separate.
- **Add `delete` to `BaseRepository<T>`** — `ProviderService.deleteSlot()` calls `this.slotRepo.delete(slotId)` but `delete` is not declared on `BaseRepository<T>` nor confirmed implemented on all concrete repos. Add `delete(id: string): Promise<void>` to the abstract class and implement it on all three concrete repositories.
- **Any additional Must/Should Fix findings** surfaced by the review in Step 1.

Do not address Informational findings in this step. The `src/api/protected/` scaffolding route removal is explicitly deferred to stretch goals per the roadmap and is Informational only.

Artifact: code changes across `src/`

### Step 3: Error Response Standardization Audit

Audit every route handler across all four routers and the global error handler to confirm a single consistent error response shape. Produce a written audit document.

Current observed shape: `{ "error": "<message string>" }` for all 4xx and 5xx responses. Confirm or contradict this across all handlers:

- `src/middleware/index.ts` — `authenticate` (401), `requireRole` (403), `errorHandler` (500)
- `src/api/auth/index.ts` — `handleAuthError` (400, 401, 403, 409)
- `src/api/provider/index.ts` — `handleProviderError` (400, 404)
- `src/api/customer/index.ts` — `handleCustomerError` (400, 403, 404, 409)
- `src/api/admin/index.ts` — `handleAdminError` (400, 404)

Note that `handleProviderError` maps both `LocationNotFoundError` and `LocationOwnershipError` to HTTP 404 with message `"Not found"` — this is intentional (no resource enumeration). Confirm whether the same principle is applied consistently in the customer router (`BookingOwnershipError` maps to 403 with a descriptive message — confirm this is correct and intentional).

The audit document records the shape used at every error site and confirms uniformity or flags deviations. If any deviation is found, a fix is included in this step as a code change. If the shape is already uniform, the document serves as the confirmation record for frontend development.

The confirmed shape is the contract the frontend will rely on and is referenced in Step 4.

Artifact: `docs/planning/review/error-response-audit.md`

### Step 4: API Contract Documentation

Produce a complete API reference document at `docs/api/api-contract.md` covering every endpoint in the backend as of Phase 6. This document is the primary reference for frontend development starting in Phase 8.

Document structure: one section per router group. Each endpoint entry includes:

- **Method + path**
- **Auth requirement** (none / Bearer token + role)
- **Request body** — field name, type, required/optional, constraints
- **Query parameters** — field name, type, valid values
- **Success response** — HTTP status code and response body shape (field names and types)
- **Error responses** — each possible HTTP status code, the condition that triggers it, and the `{ "error": "..." }` message or description

Endpoint groups to document:
1. `GET /api/health`
2. Auth — 5 endpoints (end-user register/login, provider register/login, admin login)
3. Provider — 8 endpoints (locations CRUD, slots CRUD, bookings view)
4. Customer — 6 endpoints (3 public browse/availability, 3 authenticated booking lifecycle)
5. Admin — 4 endpoints (provider management, platform bookings)

Response body shapes for success responses must match the TypeScript interfaces in `src/types/index.ts`, reflecting the corrected state after Step 2 (i.e., `password_hash` excluded from all user entity responses). The `src/api/protected/` scaffolding route (`GET /api/protected/me`) must appear as a deprecated internal endpoint with a note that it is not a production feature.

This document must be accurate at the time of Phase 7 completion, as it is referenced by Phase 8 (Frontend — Scaffold) when building the API client layer.

Artifact: `docs/api/api-contract.md`

### Step 5: Local Environment Setup Guide

Produce a document at `docs/planning/testing/backend-testing-guide.md` targeting a developer who knows what they want to test but is blocked getting a local environment into a working state. The document assumes intent — the reader arrives with a goal — and removes the friction between them and a running server with seed data.

The document is not a test plan and does not prescribe what to test. It covers:

1. **Prerequisites** — required Node.js version, PostgreSQL version, and any other tooling needed before starting
2. **Install** — `npm install` from `questreserve-backend/`
3. **Environment configuration** — which `.env` variables are required, where the file goes, and a minimal working example (pointer to the full variable list in the README)
4. **Database setup** — create the database, run `npx knex migrate:latest`, run `npx knex seed:run`; include the exact commands with their expected output so the developer can confirm each step succeeded
5. **Start the server** — the exact start command from `package.json`; confirm the server is up via `GET /api/health` and show the expected response
6. **Smoke check** — 2–3 copy-paste curl examples using known fixed UUIDs from the seed (e.g., fetch the health endpoint, log in as a seed admin user, fetch the provider list) so the developer can immediately confirm the environment is responding correctly before doing their own work
7. **Common failure modes** — brief troubleshooting notes for the most likely blockers: wrong Node version, Postgres not running, missing `.env` variable, migration already run on a dirty DB, seed accounts not found

**Automated testing strategy (advisory — no test files written in this phase):**

Include a short section documenting the recommended approach when automated tests are introduced:
- Unit tests: `CustomerService`, `ProviderService`, `AuthService` — mock repositories and Knex; test each typed error case and each happy path
- Integration tests: use the `test` Knex environment (already defined in `knexfile.ts` with `questreserve_test` DB) — run against a real test DB with migrate/seed/teardown lifecycle
- Recommend Jest with `ts-jest` as the test runner, consistent with the project's TypeScript stack
- Note that `src/tests/index.ts` is currently an empty stub from Phase 2 and is the intended home for test setup utilities

This document must be finalized after Step 6 (seed) so that the smoke-check curl examples reference real known UUIDs from the seed data.

Artifact: `docs/planning/testing/backend-testing-guide.md`

### Step 6: Rich DB Seed Data

Rewrite `src/db/seeds/001_core_init.ts` to replace the placeholder seed with realistic, frontend-QA-ready data fitting the dungeon/escape-room theme of QuestReserve. Also add a `seeds` directory configuration to `src/db/knexfile.ts` so `knex seed:run` works without a manual path argument.

Seed data requirements:

- **6 providers** with distinct `organization_name` values, distinct `plan` values (`FREE`, `STANDARD`, `PREMIUM`), and thematic fantasy names (existing names Smaug, Halaster, Strahd may be kept)
- **1 of the 6 providers must have `status: 'SUSPENDED'`** — to enable QA of the admin suspension flow and the suspended provider login 403 path
- **At least 1 booking location per provider** (6+ locations total) with distinct names, descriptions, and collectively covering all 4 `Difficulty` values (`EASY`, `MEDIUM`, `HARD`, `LEGENDARY`)
- **At least 1 provider with greater than one booking location** with distinct names and descriptions.
- **Realistic cancellation policies** per location (e.g., "No refunds within 24 hours of the raid", "Full refund if cancelled 7 or more days in advance")
- **Time slots spread across future dates** — slots at varied times across several future weeks, not clustered in a single hour window as in the current seed
- **8 end users** covering distinct `EndUserRole` values (`REGULAR`, `PREMIERE`, `CORPORATE`)
- **At least 6 bookings in mixed states** — at minimum 2 with `status: 'CANCELLED'` and at least 4 with `status: 'BOOKED'`, spread across multiple users and multiple locations
- **Hashed passwords** using `bcryptjs` with `SALT_ROUNDS = 10`, replacing all `"hashed_pw"` placeholder strings — all seed accounts should be loginable with a documented shared password (e.g., `Password1!`), recorded in the developer setup guide (Step 7)
- **Known fixed UUIDs** for at least one admin user, one provider, and one end user so that the testing guide (Step 5) can include hardcoded curl examples referencing real IDs

Artifact: `src/db/seeds/001_core_init.ts` (rewrite), `src/db/knexfile.ts` (add `seeds` directory config)

### Step 7: Developer Setup Guide

Write `questreserve-backend/README.md` as the canonical developer onboarding document for any new contributor or portfolio reviewer approaching the project cold.

Content sections:

1. **Project overview** — one paragraph: what QuestReserve is, what the backend does, tech stack (Node.js, Express 5, TypeScript, Knex, PostgreSQL, JWT)
2. **Prerequisites** — Node.js version, PostgreSQL version, recommended tooling
3. **Clone and install** — step-by-step: `git clone`, `cd questreserve-backend`, `npm install`
4. **Environment configuration** — list every required `.env` variable with description and example value:
   - `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
   - `JWT_SECRET` (arbitrary string in development; must be strong in production)
   - `JWT_EXPIRY_SECONDS` (optional, defaults to 86400)
5. **Database setup** — `createdb questreserve`, then `npx knex migrate:latest`, then `npx knex seed:run`; note the `test` environment DB `questreserve_test` for future test runs
6. **Run the server** — start command from `package.json`; confirm the server is up via `GET /api/health`
7. **Seed accounts** — table of all seed users with email, password (`Password1!`), user type, role/plan, and status (including the suspended provider)
8. **API overview** — brief table of route groups (auth, provider, customer, admin) with a pointer to `docs/api/api-contract.md` for full documentation
9. **Project structure** — annotated directory tree of `src/` explaining the purpose of each top-level folder

The guide must be accurate enough that a developer following it cold can reach a running server with seed data in under 15 minutes.

Artifact: `questreserve-backend/README.md`

## Notes

- Steps 1 and 2 (review and fixes) must complete before Step 3 (error audit) so the audit reflects corrected code, not the pre-fix state.
- Step 4 (API contract) depends on Step 3 (error audit) so that documented error response shapes are authoritative.
- Step 6 (seed) must complete before Step 5 (testing guide) is finalized, as the guide's seeding instructions and known-ID curl examples depend on the seed being written.
- Step 7 (README) depends on Step 6 (seed) for the seed accounts table and seed run instructions.
- `password_hash` is returned on all user entity rows directly from Knex in the current service implementations — this is a Must Fix to be caught in Step 1 and addressed in Step 2; Step 4's API contract documents the corrected response shapes.
- `delete` is not declared on `BaseRepository<T>` despite being called in `ProviderService.deleteSlot()` — this is a Must Fix for Step 2.
- No new domain features, endpoints, or migrations are introduced in this phase. The provider status migration (`002_add_provider_status`) was applied in Phase 5/6.
- The `src/api/protected/` scaffolding route (`GET /api/protected/me`) remains in place; removal is deferred to stretch goals per the roadmap and is Informational in the Step 1 review.
- All documentation artifacts go under `docs/` at the repo root. The README goes at `questreserve-backend/README.md`. No planning documents are placed under `src/`.
