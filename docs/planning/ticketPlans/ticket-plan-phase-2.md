# Ticket Plan: Phase 2 — Backend Foundation

**Purpose:** Establish a clean, well-structured Express backend with proper separation of concerns, middleware, routing foundation, TypeScript domain types, and repository pattern.
**Total tickets:** 6
**Status: LOCKED** — This plan is complete and approved. The agent must not add, remove, reorder, or infer any ticket beyond what is listed below.

---

## Ticket 1 of 6

**Title:** Rename backend stub files from .tsx to .ts

**Description:**
All module stub files in `questreserve-backend/src/` use the `.tsx` extension, which is incorrect for a Node.js backend with no JSX. Rename each to `.ts` to reflect correct file types.

**Acceptance Criteria:**
- [ ] `src/api/index.tsx` renamed to `src/api/index.ts`
- [ ] `src/app/index.tsx` renamed to `src/app/index.ts`
- [ ] `src/infrastructure/index.tsx` renamed to `src/infrastructure/index.ts`
- [ ] `src/middleware/index.tsx` renamed to `src/middleware/index.ts`
- [ ] `src/tests/index.tsx` renamed to `src/tests/index.ts`
- [ ] `src/utils/index.tsx` renamed to `src/utils/index.ts`
- [ ] No `.tsx` files remain in the backend `src/` directory

---

## Ticket 2 of 6

**Title:** Separate Express app creation from server entrypoint

**Description:**
`src/index.ts` currently handles DB check, Express setup, and server start all in one place. Extract app creation into `src/app/index.ts` so the entrypoint is lean and the app is independently importable (e.g. for testing).

**Acceptance Criteria:**
- [ ] `src/app/index.ts` exports a configured Express app instance
- [ ] `src/index.ts` is responsible only for the DB sanity check and calling `app.listen`
- [ ] Server starts and responds to `GET /` as before

---

## Ticket 3 of 6

**Title:** Implement middleware layer in src/middleware

**Description:**
Populate `src/middleware/` with the three foundational middleware items currently missing or inline: JSON body parsing, a global error handler, and a Morgan request logger. All three are applied in the app module.

**Acceptance Criteria:**
- [ ] JSON body parsing middleware defined in `src/middleware/` and applied in the app
- [ ] Global error handler defined in `src/middleware/` and registered as the last middleware in the app (Express 5 compatible)
- [ ] Morgan request logger defined in `src/middleware/` and applied in the app
- [ ] `src/index.ts` no longer contains any inline middleware setup

---

## Ticket 4 of 6

**Title:** Establish root API router in src/api

**Description:**
Create a root router in `src/api/index.ts` and mount it in the app module. This is the single mounting point through which all future domain routers (provider, customer, admin) will be registered.

**Acceptance Criteria:**
- [ ] `src/api/index.ts` exports an Express router
- [ ] Root router is mounted in the app module (e.g. under `/api`)
- [ ] A placeholder route (e.g. `GET /api/health`) responds successfully to confirm the router is wired
- [ ] No domain-specific routes are added in this ticket

---

## Ticket 5 of 6

**Title:** Define TypeScript interfaces for all domain models

**Description:**
Create `src/types/index.ts` with TypeScript interfaces for all 6 domain models, derived directly from the existing Knex migration schema. These types will be referenced across services, repositories, and controllers throughout the project.

**Acceptance Criteria:**
- [ ] Interfaces defined for: `AdminUser`, `Provider`, `EndUser`, `BookingLocation`, `TimeSlot`, `Booking`
- [ ] All fields match the migration schema exactly (names, nullability, enum values)
- [ ] Enum values represented as TypeScript union types or enums
- [ ] File is located at `src/types/index.ts`

---

## Ticket 6 of 6

**Title:** Define base repository interface in src/infrastructure

**Description:**
Establish a lightweight Knex-based repository interface in `src/infrastructure/` that all future domain repositories will implement. Sets the pattern without over-abstracting — just enough to enforce consistency across data access layers.

**Acceptance Criteria:**
- [ ] A base repository interface or abstract class is defined in `src/infrastructure/index.ts`
- [ ] Interface reflects the standard operations domain repositories will need (e.g. findById, findAll, create, update)
- [ ] Knex instance is injected, not imported directly, to support future testability
- [ ] No concrete domain repositories are implemented in this ticket
