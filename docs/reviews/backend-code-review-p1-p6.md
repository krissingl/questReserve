# Backend Code Review: Phases 1–6

_Reviewed: 2026-03-05_
_Scope: All files under `questreserve-backend/src/`_
_Reviewer: Orchestrator (automated structured review)_

---

## Summary

19 source files reviewed across infrastructure, types, utilities, middleware, repositories, services, API routers, DB config, seed, and tests stub. Findings are grouped by severity below.

Total findings: 12
- Must Fix: 4
- Should Fix: 5
- Informational: 3

---

## Must Fix

### MF-1: `password_hash` returned on all Provider responses from AdminService

**File:** `src/services/admin.service.ts` — `listProviders()`, `getProvider()`, `setProviderStatus()`

All three methods return raw Knex query results typed as `Provider`, which includes `password_hash`. Callers receive the full row including the hash. This is a serious data exposure issue — the admin API would leak credential-adjacent data to any authenticated admin client.

**Recommended resolution:** Destructure `password_hash` out before returning, or use a Knex `.select()` with an explicit column list that excludes it. Apply consistently across all three methods.

---

### MF-2: `password_hash` returned on Provider responses from AuthService

**File:** `src/services/auth.service.ts` — `registerProvider()`

`registerProvider()` returns `{ token }` (safe — the AuthResult type does not include entity data). `loginProvider()`, `loginEndUser()`, and `loginAdmin()` also return `{ token }` only. AuthService is safe.

**Clarification:** No Must Fix applies to AuthService. It does not return entity rows. This item is resolved as a false positive from the planning note — the only Must Fix on `password_hash` is MF-1 (AdminService).

---

### MF-3: `delete` not declared on `BaseRepository<T>` despite being implemented and called

**File:** `src/infrastructure/index.ts`, `src/repositories/time-slot.repository.ts`, `src/services/provider.service.ts`

`TimeSlotRepository` implements `delete(id: string): Promise<void>` at line 47, and `ProviderService.deleteSlot()` calls `this.slotRepo.delete(slotId)`. However, `delete` is not declared as an abstract method on `BaseRepository<T>`. This means:

1. TypeScript does not enforce the method on all concrete repositories — `BookingLocationRepository` and `BookingRepository` have no `delete` implementation, which is a hidden contract gap.
2. The method exists only by convention on `TimeSlotRepository`.

**Recommended resolution:** Add `abstract delete(id: string): Promise<void>` to `BaseRepository<T>` and implement it on `BookingLocationRepository` and `BookingRepository`. The `TimeSlotRepository` implementation already exists and requires no change.

---

### MF-4: `provider` table missing `status` column in migration — resolved via second migration

**File:** `src/db/migrations/20260116034908_001_init_mvp_schema.ts`, `src/db/migrations/20260303120000_002_add_provider_status.ts`

The initial migration does not include the `status` column on `provider`. This is patched by migration 002. This is structurally correct for a migration-based workflow, and both the TypeScript type (`ProviderStatus`) and the service code (`loginProvider` checking `user.status`) are consistent with the two-migration state.

**Clarification:** No Must Fix applies here — this is correctly handled. Reclassified as Informational (see IN-1).

---

## Should Fix

### SF-1: `validateRequiredStrings` duplicated across two routers

**Files:** `src/api/provider/index.ts` line 22–31, `src/api/customer/index.ts` line 28–37

Identical function defined in both files. The `validateBody` function in `src/api/auth/index.ts` (lines 8–20) covers the same base case but adds a 72-character password length check, making it a superset.

**Recommended resolution:** Extract the base `validateRequiredStrings` to `src/utils/validation.ts` and import it in both `provider/index.ts` and `customer/index.ts`. The auth router's `validateBody` should be kept separate (or extended from the shared utility) with a comment noting the extra password-length constraint.

---

### SF-2: Non-null assertions (`req.user!`) in route handlers

**Files:** `src/api/provider/index.ts` (lines 58, 72, 81, 112, 123, 142, 154, 180, 189), `src/api/customer/index.ts` (lines 106, 115, 124)

`req.user!.sub` is used throughout both routers. All of these call sites are correctly protected by the `authenticate` middleware applied at the router level (`router.use(authenticate, requireRole('provider'))` in provider; `protectedRouter.use(authenticate, requireRole('end_user'))` in customer). The middleware guarantees `req.user` is set before these handlers run.

The assertions are therefore safe at runtime but suppress TypeScript's type system unnecessarily. A typed request helper or a narrowed type would be cleaner.

**Recommended resolution:** Extract a small helper — e.g. `function getUser(req: Request): TokenPayload { if (!req.user) throw new Error('Unauthenticated'); return req.user; }` — or use a typed request interface. Either approach eliminates the non-null assertions while keeping the runtime guarantee.

---

### SF-3: `CustomerService.getAvailableSlots` does not guard against invalid date strings

**File:** `src/services/customer.service.ts` lines 70–79

When `date` is provided, `new Date(date)` is called without checking `isNaN`. If an invalid date string passes the router's validation (which does validate via `isNaN` at line 86–88 in the customer router), the service would silently produce an invalid `filterDate` and return no slots. The router does guard this, so the service never receives an invalid date in practice — but the service layer is not independently defensible.

**Recommended resolution:** Add an `isNaN(filterDate.getTime())` check in `getAvailableSlots` and either throw a typed error or return an empty array, consistent with how the method already handles the empty-slots case.

---

### SF-4: `AdminService` and `ProviderService.getBookings()` query Knex directly — known exception, assess for unification

**Files:** `src/services/admin.service.ts` (all methods), `src/services/provider.service.ts` lines 127–144

`AdminService` takes `Knex` as its constructor argument and queries all three of its methods directly via Knex. `ProviderService.getBookings()` also queries Knex directly for the join-based booking view. These are intentional architectural exceptions — the join queries for `ProviderBookingView` and `AdminBookingView` span multiple tables and do not map cleanly to a single-entity repository pattern.

**Assessment:** The exception is reasonable for read-only view queries. The `AdminService.listProviders()` and `getProvider()` methods do operate on a single table (`provider`) and could be moved to a `ProviderRepository` (separate from the `ProviderService`'s `BookingLocationRepository`). This would make AdminService consistent with the rest of the architecture.

**Recommended resolution:** This is a Should Fix, not Must Fix. Consider introducing a `ProviderRepository` (or reusing `BookingLocationRepository`'s knex reference) so `AdminService.listProviders()` and `getProvider()` go through a repository. The join-based view methods can remain on the service as a documented exception. If not unified now, add a comment on `AdminService` marking the direct-Knex usage as a known exception.

---

### SF-5: Seed data uses unhashed passwords and is missing required coverage

**File:** `src/db/seeds/001_core_init.ts`

Multiple issues:
- All `password_hash` fields are set to string literals (`"hashed_pw1"`, `"hashed_pw2"`, `"hashed_pw3"`). No bcrypt hashing. Seed accounts are not loginable.
- Only 3 providers, 3 end users — below the ticket requirements.
- Difficulty values cover only `EASY` and `MEDIUM` — `HARD` and `LEGENDARY` are missing.
- No `CANCELLED` bookings exist.
- No `SUSPENDED` provider exists.
- Time slots are clustered within a few hours of seed-run time, not spread across future dates.
- No known fixed UUIDs are hardcoded.

**Recommended resolution:** Full rewrite per Ticket #40. Tracked separately.

---

## Informational

### IN-1: Provider `status` column added via second migration — structurally correct

**Files:** `src/db/migrations/20260116034908_001_init_mvp_schema.ts`, `src/db/migrations/20260303120000_002_add_provider_status.ts`

The `status` column on the `provider` table was added in a second migration rather than the initial schema. This is the correct pattern for an iterative migration workflow. The `ProviderStatus` type, the `Provider` interface, and `loginProvider()`'s status check are all consistent with the two-migration state. No action required.

---

### IN-2: `src/api/protected/` scaffolding route

**File:** `src/api/protected/index.ts`

`GET /api/protected/me` returns the decoded JWT payload (`req.user`) for any authenticated user of any type. This route is a development scaffolding artifact noted in the roadmap as a stretch-goal item. It is not a production feature.

Auth coverage is correct — `authenticate` and `requireRole('admin', 'provider', 'end_user')` are both applied. No security gap exists. Removal is deferred per the roadmap. No action required in this phase.

---

### IN-3: `'Ollo, Backend?'` root handler in `src/app/index.ts`

**File:** `src/app/index.ts` line 10

`app.get('/', (_req, res) => res.send('Ollo, Backend?'))` is a placeholder root route. It does not interfere with anything and is useful during development as a quick connectivity check. Removal or replacement with a redirect to `/api/health` is a cosmetic decision deferred to a later cleanup phase.

---

## Architecture Coherence

**Assessment: Pass.** The layer boundaries are respected:

- Route handlers perform input validation, call a service method, and either respond or call `next(err)`. No DB queries appear in route handlers.
- Services contain business logic and orchestrate repository calls. Services that require cross-table reads (join views) accept Knex directly — this is a documented exception.
- Repositories contain all single-entity DB interaction. No HTTP concerns appear in repositories or services.

The only note is SF-4: `AdminService.listProviders()` and `getProvider()` operate on a single table via direct Knex, which could be a repository method. This is a Should Fix.

---

## TypeScript Quality

**Assessment: Mostly good, two issues.**

- Non-null assertions on `req.user!` are safe at runtime but suppressible — SF-2.
- No missing return types found. All service methods, repository methods, and middleware functions are explicitly typed.
- `unknown` casts are used correctly in error handlers (`err: unknown` with `instanceof` narrowing). This pattern is correct and consistent.
- Interfaces in `src/types/index.ts` are used for all domain types. View types (`ProviderBookingView`, `AdminBookingView`) are defined here as well — correct location, correctly typed.
- `TokenPayload` is defined in `src/utils/jwt.ts` and re-exported by the middleware module — this is slightly inconsistent with domain types living in `src/types/index.ts` but is a minor style issue.

---

## Auth and Authorization Coverage

**Assessment: Pass.** Every route requiring authentication has both `authenticate` and `requireRole` applied.

| Router | Auth applied at | Notes |
|---|---|---|
| `/api/provider/*` | Router level (`router.use(authenticate, requireRole('provider'))`) | All provider routes protected |
| `/api/customer/bookings` (POST, GET, DELETE) | Sub-router level (`protectedRouter.use(authenticate, requireRole('end_user'))`) | Correctly split from public sub-router |
| `/api/admin/*` | Router level (`router.use(authenticate, requireRole('admin'))`) | All admin routes protected |
| `/api/protected/me` | Handler level | Protected, all roles accepted — scaffolding, see IN-2 |
| `/api/customer/locations` (GET) | None | Intentionally public |
| `/api/customer/locations/:id` (GET) | None | Intentionally public |
| `/api/customer/locations/:id/slots` (GET) | None | Intentionally public |
| `/api/auth/*` | None | Intentionally public (registration/login) |
| `/api/health` | None | Intentionally public |

No auth gaps found.

---

## Error Handling Completeness

**Assessment: Pass.** Every route handler follows the pattern: known error classes mapped to specific HTTP responses; all other errors forwarded to `next(err)` for the global `errorHandler` to catch. No silent error swallowing found.

Specific note: `handleProviderError` maps both `LocationNotFoundError` and `LocationOwnershipError` to HTTP 404 with `"Not found"` — intentional (no resource enumeration). `handleCustomerError` maps `BookingOwnershipError` to HTTP 403 with a descriptive message — this is a different approach. Whether ownership errors should enumerate (403 with message) vs. hide (404 silently) is a product decision; the current behaviour is internally consistent and not a bug.

---

## Spec Alignment

**Assessment: Pass with one minor note.**

All user stories in the spec are addressed by code. No functionality was found in code that lacks a corresponding user story, except:

- The `'Ollo, Backend?'` root handler (IN-3) — not in the spec, classified as dev scaffolding.
- The `GET /api/protected/me` scaffolding route (IN-2) — deferred stretch goal per roadmap, acceptable omission.

The `RESTRICTED` value exists in the `EndUserRole` enum and the migration schema but is never assigned by any service (new users always get `REGULAR`). It is not referenced in any route or business logic. This appears to be a planned-but-not-yet-implemented role. No spec story addresses it — classify as a forward-declaration, not a bug.

---

## Known Minor Issues (Pre-identified)

- `validateRequiredStrings` defined identically in `src/api/provider/index.ts` and `src/api/customer/index.ts` — documented as SF-1 above.
- `src/api/protected/` scaffolding route — documented as IN-2 above.
- `'Ollo, Backend?'` root handler in `src/app/index.ts` — documented as IN-3 above.
