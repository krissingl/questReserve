# Phase 3: Authentication

_Created: 2026-02-26 | Status: DRAFT_

## Goal

Implement end-to-end JWT authentication for all three user types — EndUser, Provider, and AdminUser. Introduce the service layer (`src/application/`), establish password hashing conventions, protect routes via reusable auth middleware, and scaffold role-scoped route guards.

## Context

Phase 2 (Backend Foundation) is complete. The Express app is properly structured with middleware, a root API router, domain type definitions, and a base repository pattern. No authentication exists yet — all routes are currently open. The `src/application/` directory (service layer) has not been used yet; this phase introduces it.

## Steps

### Step 1: Install Auth Dependencies

Add the two packages required for authentication:
- `jsonwebtoken` — sign and verify JWTs
- `bcryptjs` — hash and compare passwords (pure JS, no native compilation)
- `@types/jsonwebtoken`, `@types/bcryptjs` — TypeScript types

### Step 2: JWT Utilities

Create `src/utils/jwt.ts` with two functions:
- `signToken(payload)` — signs a JWT with the app secret and a configured expiry
- `verifyToken(token)` — verifies and decodes a JWT; returns the payload or throws

Token payload shape: `{ sub: string, type: 'admin' | 'provider' | 'end_user' }`

JWT secret and expiry read from `.env`.

### Step 3: Auth Middleware

Add to `src/middleware/`:
- `authenticate` — extracts the Bearer token from the `Authorization` header, verifies it via `verifyToken`, and attaches the decoded payload to `req`. Responds 401 if missing or invalid.
- `requireRole(...roles)` — middleware factory that checks the `type` field on the attached payload against the allowed roles. Responds 403 if the role does not match.

### Step 4: Auth Service Layer

Introduce `src/application/` with `src/application/auth.service.ts`.

The auth service handles the business logic for login and registration:
- Hash passwords on register using `bcryptjs`
- Compare passwords on login
- Issue tokens via the JWT utility
- Throw typed errors on invalid credentials or duplicate accounts

This is the first use of `src/application/` — it establishes the pattern all future services follow.

### Step 5: Auth Endpoints

Create `src/api/auth/` and register it on the root API router.

Endpoints:
- `POST /api/auth/end-user/register` — create an EndUser account
- `POST /api/auth/end-user/login` — authenticate and return a token
- `POST /api/auth/provider/register` — create a Provider account
- `POST /api/auth/provider/login` — authenticate and return a token
- `POST /api/auth/admin/login` — authenticate an AdminUser and return a token

AdminUser has no public registration endpoint in this phase — the initial admin account is created via seed or direct DB insertion.

### Step 6: Protected Route Scaffolding

Add a protected placeholder route to demonstrate the auth middleware chain in action:
- `GET /api/protected/me` — returns the decoded token payload; requires `authenticate`

Apply `authenticate` + `requireRole` to demonstrate role-scoped access. This route is scaffolding only — it is not a domain feature.

## Notes

- `bcryptjs` chosen over `bcrypt` to avoid native module compilation; acceptable for MVP scale
- Admin accounts are not publicly registerable in MVP — initial account created via seed or direct DB insertion
- `src/application/` introduced here for the first time; the auth service pattern is the template for all future services (provider, booking, etc.)
- Token payload carries `type` rather than a full role field — role-level granularity is enforced at the service layer, not in the token
- Controllers in `src/api/auth/` handle HTTP only; all credential and token logic lives in the auth service
