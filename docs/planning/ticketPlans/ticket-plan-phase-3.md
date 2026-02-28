# Ticket Plan: Phase 3 — Authentication

**Purpose:** Implement end-to-end JWT authentication for all three user types, introduce the service layer, establish password hashing conventions, protect routes via reusable auth middleware, and scaffold role-scoped route guards.
**Total tickets:** 6
**Status: LOCKED** — This plan is complete and approved. The agent must not add, remove, reorder, or infer any ticket beyond what is listed below.

---

## Ticket 1 of 6

**Title:** P3:Install auth dependencies

**Description:**
Add the packages required for JWT authentication and password hashing: `jsonwebtoken`, `bcryptjs`, and their corresponding TypeScript type packages. These are prerequisites for all subsequent Phase 3 work.

**Acceptance Criteria:**
- [ ] `jsonwebtoken` added to production dependencies in `package.json`
- [ ] `bcryptjs` added to production dependencies in `package.json`
- [ ] `@types/jsonwebtoken` added to dev dependencies in `package.json`
- [ ] `@types/bcryptjs` added to dev dependencies in `package.json`
- [ ] All packages are importable without TypeScript errors

---

## Ticket 2 of 6

**Title:** P3:Add JWT utility functions

**Description:**
Create `src/utils/jwt.ts` with `signToken` and `verifyToken` functions. These utilities centralize all JWT signing and verification logic so that no other module directly calls `jsonwebtoken` methods.

**Acceptance Criteria:**
- [ ] `src/utils/jwt.ts` exists and exports `signToken` and `verifyToken`
- [ ] `signToken(payload)` signs a JWT using the app secret and expiry from `.env`
- [ ] `verifyToken(token)` verifies and decodes a JWT; returns the decoded payload or throws on invalid/expired tokens
- [ ] Token payload shape is typed as `{ sub: string, type: 'admin' | 'provider' | 'end_user' }`
- [ ] JWT secret and expiry are read from `.env` — not hardcoded

---

## Ticket 3 of 6

**Title:** P3:Implement authenticate and requireRole middleware

**Description:**
Add two middleware items to `src/middleware/`: `authenticate` for Bearer token extraction and verification, and `requireRole` as a middleware factory for role-scoped access control. These are the reusable guards applied to all protected routes going forward.

**Acceptance Criteria:**
- [ ] `authenticate` middleware defined in `src/middleware/` and extracts the Bearer token from the `Authorization` header
- [ ] `authenticate` calls `verifyToken` and attaches the decoded payload to `req`
- [ ] `authenticate` responds with `401` if the token is missing or invalid
- [ ] `requireRole(...roles)` middleware factory defined in `src/middleware/`
- [ ] `requireRole` checks the `type` field on the attached payload against the allowed roles
- [ ] `requireRole` responds with `403` if the role does not match any of the allowed roles

---

## Ticket 4 of 6

**Title:** P3:Implement auth service

**Description:**
Create `src/services/auth.service.ts` to handle all authentication business logic: password hashing on registration, password comparison on login, and JWT issuance. This is the first use of `src/services/` and establishes the pattern all future services will follow.

**Acceptance Criteria:**
- [ ] `src/services/auth.service.ts` exists
- [ ] Registration logic hashes passwords using `bcryptjs` before storing
- [ ] Login logic compares the submitted password against the stored hash using `bcryptjs`
- [ ] Successful login issues a JWT via the `signToken` utility
- [ ] Typed errors are thrown for invalid credentials (wrong password, user not found)
- [ ] Typed errors are thrown for duplicate accounts on registration
- [ ] No HTTP-layer logic (no access to `req` or `res`) exists in the service

---

## Ticket 5 of 6

**Title:** P3:Add auth endpoints for EndUser, Provider, and AdminUser

**Description:**
Create `src/api/auth/` and register it on the root API router. Exposes registration and login endpoints for EndUser and Provider, and a login-only endpoint for AdminUser. AdminUser has no public registration endpoint — the initial admin account is created via seed or direct DB insertion.

**Acceptance Criteria:**
- [ ] `src/api/auth/` directory and router created and mounted on the root API router
- [ ] `POST /api/auth/end-user/register` creates a new EndUser account and returns a token
- [ ] `POST /api/auth/end-user/login` authenticates an EndUser and returns a token
- [ ] `POST /api/auth/provider/register` creates a new Provider account and returns a token
- [ ] `POST /api/auth/provider/login` authenticates a Provider and returns a token
- [ ] `POST /api/auth/admin/login` authenticates an AdminUser and returns a token
- [ ] No `POST /api/auth/admin/register` endpoint exists
- [ ] All credential and token logic is delegated to the auth service; controllers handle HTTP only

---

## Ticket 6 of 6

**Title:** P3:Add protected route scaffolding to demonstrate auth middleware

**Description:**
Add a protected placeholder route `GET /api/protected/me` that applies the full `authenticate` + `requireRole` middleware chain. This route is scaffolding only — it confirms the auth system is wired end-to-end and is not a domain feature.

**Acceptance Criteria:**
- [ ] `GET /api/protected/me` route exists and returns the decoded token payload
- [ ] Route is protected by `authenticate` middleware — responds `401` without a valid token
- [ ] Route demonstrates `requireRole` usage — responds `403` for a token with an unauthorized role
- [ ] Route is clearly marked as scaffolding (e.g. comment in code) and contains no domain business logic
