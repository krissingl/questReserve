# Phase 2: Backend Foundation

_Created: 2026-02-24 | Status: DRAFT_

## Goal

Establish a clean, well-structured Express backend following best practices — proper separation of concerns, middleware layer, routing foundation, TypeScript domain types, and repository pattern. No speculative utilities or premature abstractions.

## Context

Phase 1 (DB Migrations) is complete. The backend has a functional entry point and DB connection, but all module folders are empty stubs. File extensions are incorrectly set to `.tsx` throughout.

## Steps

### Step 1: Fix File Extensions
Rename all backend stub files from `.tsx` to `.ts`. Backend has no JSX — using `.tsx` is incorrect.

Files to rename:
- `src/api/index.tsx` → `src/api/index.ts`
- `src/app/index.tsx` → `src/app/index.ts`
- `src/infrastructure/index.tsx` → `src/infrastructure/index.ts`
- `src/middleware/index.tsx` → `src/middleware/index.ts`
- `src/tests/index.tsx` → `src/tests/index.ts`
- `src/utils/index.tsx` → `src/utils/index.ts`

### Step 2: App/Server Separation
Extract Express app creation out of `src/index.ts` into `src/app/index.ts`.
`src/index.ts` becomes a lean entrypoint responsible only for: DB sanity check and calling `app.listen`.

### Step 3: Middleware Layer
Populate `src/middleware/` with:
- JSON body parsing (move from `index.ts`)
- Global error handler (Express 5 async-compatible)
- Morgan request logger

### Step 4: Root API Router
Establish `src/api/index.ts` as the root router, mounted in the app module.
Domain-specific routers (provider, customer, admin) will plug into this in later phases.

### Step 5: Domain Type Definitions
Create `src/types/index.ts` with TypeScript interfaces for all 6 domain models, derived directly from the migration schema:
`AdminUser`, `Provider`, `EndUser`, `BookingLocation`, `TimeSlot`, `Booking`

### Step 6: Repository Pattern
Define a lightweight Knex-based repository interface in `src/infrastructure/`.
Establishes the pattern all domain repositories will follow — no heavy base class, just the interface/convention.

## Notes

- Express 5 handles async errors natively — no async wrapper utility needed
- Response shape consistency enforced by convention, not a formatter utility
- `src/utils/` populated on demand in later phases, not pre-built here
