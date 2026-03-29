# Phase 9: Frontend — Auth Views

_Created: 2026-03-28 | Status: DRAFT_

## Goal

Implement login and registration pages for Customer (EndUser) and Provider user types, wire them to the real backend auth API through `AuthContext`, and address the `isLoading` hydration gap in `AuthContext` that currently causes protected deep-links to redirect to `/login` on page reload.

## Context

Phase 8 (Frontend Scaffold) is complete. The application has: an Axios API client in `src/api/client.ts`, a stub `auth.api.ts`, an `AuthContext` with `{ user, token, role, login, logout }` shape backed by in-memory state, role-scoped layouts with route guards, React Router v7 nested routes, and the full design token set applied. `react-hook-form` and `zod` were explicitly deferred to Phase 9 (first use in forms). The backend exposes five auth endpoints from Phase 3: `POST /api/auth/end-user/register`, `POST /api/auth/end-user/login`, `POST /api/auth/provider/register`, `POST /api/auth/provider/login`, and `POST /api/auth/admin/login`. Admin has no self-registration endpoint — admin accounts are seeded directly.
Phase 9 closes the gap between the Phase 8 scaffold and a working auth flow.

**Tech debt from Phase 8 review:** `AuthContext` has no hydration state. On page reload, `token` initialises as `null` before any persistence check runs, so the layout guards immediately redirect to `/login`. Deep-links to protected routes are lost. This must be resolved before the login/register pages can be considered functional.

## Steps

### Step 1: Add `isLoading` hydration state to AuthContext

Extend `AuthContextValue` to include `isLoading: boolean`. On mount, `AuthContext` must check for a persisted token (e.g. `localStorage` or `sessionStorage`) and restore `user`,`token`, and `role` before setting `isLoading` to `false`. The three role-scoped layouts must suspend their redirect logic while `isLoading` is `true` — rendering `null` or a loading indicator instead of navigating — so that deep-links to protected routes are preserved on page reload.

Token persistence decision: Phase 8 established that `localStorage` is the interim storage mechanism and must not be shipped as permanent. For Phase 9, `localStorage` remains
interim — restore from it on mount, but keep the in-memory token as the runtime source of truth (the `client.ts` interceptor reads from `AuthContext` state, not `localStorage`). A note to revisit token storage security is carried forward.

### Step 2: Implement `auth.api.ts` with real backend calls

Replace the Phase 8 stub in `src/api/auth.api.ts` with real implementations of all five backend auth endpoints:
- `loginEndUser(email, password)` → `POST /api/auth/end-user/login`
- `registerEndUser(email, password, displayName)` → `POST /api/auth/end-user/register`
- `loginProvider(email, password)` → `POST /api/auth/provider/login`
- `registerProvider(email, password, displayName, organizationName?)` → `POST /api/auth/provider/register`
- `loginAdmin(email, password)` → `POST /api/auth/admin/login`

Each function uses the shared `client.ts` Axios instance. Return types must be typed. The `AuthContext` `login` function must be updated to call the appropriate API function based on the role being authenticated.

### Step 3: Define Zod schemas and install form libraries

Install `react-hook-form` and `zod` (deferred from Phase 8). Define Zod validation schemas for each form: `loginSchema` (email + password) and `registerSchema` (email + password + displayName, with Provider-specific `organizationName` optional field). These schemas live in a shared location (`src/utils/schemas/auth.schemas.ts` or co-located with the page — prefer co-location if not reused elsewhere per Section 4.2 of `ui-strategy.md`). Wire `react-hook-form` with `zodResolver` for type-safe form state.

### Step 4: Build the Customer Login page

Create `src/pages/CustomerLogin/CustomerLogin.tsx`. This is the page rendered at the public route `/login` (or a role-specific `/customer/login` if routing supports it — see Notes).
The page must:
- Use the `loginSchema` Zod schema via `react-hook-form` + `zodResolver`
- Call `AuthContext.login` on valid submission, which in turn calls `loginEndUser` from `auth.api.ts`
- Display field-level validation errors inline below each field (per Section 4.8 error convention)
- Display API error messages (wrong credentials) as an alert banner on the form
- Redirect to `/customer` on successful login
- Show a link to the Customer registration page
- Apply design tokens: `bg-surface` card container, `font-heading` (Cinzel) for the page title, `--destructive` for error states, `--primary` for the submit button

### Step 5: Build the Customer Register page

Create `src/pages/CustomerRegister/CustomerRegister.tsx` at the route `/customer/register` (public). The page must:
- Use the `registerSchema` Zod schema (email, password, displayName)
- Call `registerEndUser` from `auth.api.ts` directly, then log the user in automatically (call `loginEndUser` with the same credentials and pass the result to `AuthContext`)
- Display field-level validation errors inline
- Display API errors (e.g. duplicate email) as an alert banner
- Redirect to `/customer` on successful registration and login
- Show a link back to the Customer login page
- Apply the same visual conventions as the login page

### Step 6: Build the Provider Login page

Create `src/pages/ProviderLogin/ProviderLogin.tsx` at the public route `/provider/login`. Structure and conventions are identical to the Customer login page (Step 4), calling `loginProvider` from `auth.api.ts`. Redirects to `/provider` on success.

### Step 7: Build the Provider Register page

Create `src/pages/ProviderRegister/ProviderRegister.tsx` at the public route `/provider/register`. Identical structure to the Customer register page (Step 5) with one addition: an optional `Organization Name` field wired to the `organizationName` field in `registerProvider`. Calls `registerProvider` then auto-logs in via `loginProvider`. Redirects to `/provider` on success.

### Step 8: Add auth routes to the router

Update `src/routes/` to register the new public auth routes:
- `/login` → `CustomerLogin` (default login, or a role-picker landing — see Notes)
- `/customer/register` → `CustomerRegister`
- `/provider/login` → `ProviderLogin`
- `/provider/register` → `ProviderRegister`

All four routes are public (no auth guard). Verify that the existing layout guards in `CustomerLayout`, `ProviderLayout`, and `AdminLayout` now correctly suspend redirects during `isLoading` (from Step 1).

### Step 9: Smoke test auth flows end-to-end

Verify all auth flows against a running backend. No new source code is written in this step.

## Notes

- **Admin login page:** Admin has no self-registration. An Admin login page (at `/admin/login`) is excluded from this phase — Admin portal work begins in Phase 12. Admin auth is unblocked at the backend but the frontend view is deferred to that phase.
- **`/login` route ambiguity:** The Phase 8 scaffold defines a single `/login` public route. With two registerable user types, a decision is needed: a single login page with a role selector, or separate `/customer/login` and `/provider/login` pages with a landing at `/`. Recommendation: use separate role-specific login pages and redirect `/login` to a simple landing page with "Log in as Customer" / "Log in as Provider" options. This avoids role-selector UX complexity and aligns with the three-portal architecture. If the team prefers a unified login, this step must be adjusted accordingly — flag before implementation begins.
- **Token persistence:** `localStorage` is confirmed interim in Phase 8. Phase 9 restores from `localStorage` on mount for hydration continuity but does not change the runtime storage mechanism. A future phase should revisit `httpOnly` cookie storage or session-scoped storage.
- **`organizationName` on Provider register:** The `Provider` domain model defines `organization_name` as optional. The register form exposes it as an optional field — do not make it required.
- **Auto-login after registration:** Registering and then immediately logging in with the same credentials is two round-trips. If the backend returns a token on `POST/api/auth/*/register`, use that token directly instead of making a second login call. Confirm the backend response shape before implementing.
- **Shared form components:** `LoginForm` and `RegisterForm` layouts will be visually similar across Customer and Provider. Do not pre-emptively extract a shared component until the second use is being built (Step 6/7) — at that point, if the structure is identical, move shared elements to `src/components/` per Section 4.2 of `ui-strategy.md`.
- **`react-hook-form` and `zod` were deferred from Phase 8** (noted in phase-8-frontend-scaffold.md). Install them at the start of this phase.