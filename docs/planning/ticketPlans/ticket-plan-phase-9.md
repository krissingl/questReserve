# Ticket Plan: Phase 9 — Frontend Auth Views

**Purpose:** Implement Customer and Provider login/register pages wired to the real backend auth API, and resolve the AuthContext hydration gap that breaks deep-links on page reload.
**Total tickets:** 9
**Status: DRAFT**

---

## Ticket 1 of 9

**Title:** Add `isLoading` hydration state to AuthContext

**Description:**
`AuthContext` currently initialises `token` as `null`, causing layout guards to redirect to `/login` before any persistence check can run. Extend `AuthContextValue` with `isLoading:boolean`, restore persisted auth state on mount, and update all three role-scoped layouts to suspend redirect logic while `isLoading` is `true`.

**Acceptance Criteria:**
- [ ] `AuthContextValue` includes `isLoading: boolean`
- [ ] On mount, `AuthContext` reads a persisted token from `localStorage`, validates it, and restores `user`, `token`, and `role` if valid; sets `isLoading: false` when the check is complete
- [ ] `isLoading` is `true` during the mount check and `false` afterward
- [ ] `CustomerLayout`, `ProviderLayout`, and `AdminLayout` render `null` (or a neutral loading state) while `isLoading` is `true` — no redirect fires during hydration
- [ ] After `isLoading` is `false`, existing redirect behaviour is unchanged
- [ ] A deep-link to `/customer/bookings` (unauthenticated) still redirects to `/login` after hydration completes
- [ ] A deep-link to `/customer/bookings` while authenticated (token in `localStorage`) loads the protected page correctly without a `/login` redirect

---

## Ticket 2 of 9

**Title:** Implement real auth API calls in `auth.api.ts`

**Description:**
Replace the Phase 8 stub in `src/api/auth.api.ts` with typed implementations of all five backend auth endpoints. Update `AuthContext.login` to call the correct API function based on user type.

**Acceptance Criteria:**
- [ ] `auth.api.ts` exports: `loginEndUser`, `registerEndUser`, `loginProvider`, `registerProvider`, `loginAdmin`
- [ ] `loginEndUser` calls `POST /api/auth/end-user/login`; `registerEndUser` calls `POST /api/auth/end-user/register`
- [ ] `loginProvider` calls `POST /api/auth/provider/login`; `registerProvider` calls `POST /api/auth/provider/register`
- [ ] `loginAdmin` calls `POST /api/auth/admin/login`
- [ ] All functions use the shared `client.ts` Axios instance — no direct `axios` imports in `auth.api.ts`
- [ ] All return types are explicitly typed (no `any`)
- [ ] `AuthContext.login` is updated to accept a `role` parameter or separate login functions exist per role — the context does not call a hardcoded endpoint

**Dependencies:** #65 (Phase 8 — folder structure), #67 (Phase 8 — API client layer)

---

## Ticket 3 of 9

**Title:** Install form libraries and define auth Zod schemas

**Description:**
Install `react-hook-form` and `zod` (deferred from Phase 8). Define Zod validation schemas for login and registration forms. These schemas are the single source of validation truth consumed by all four auth pages.

**Acceptance Criteria:**
- [ ] `react-hook-form` and `zod` are installed and present in `package.json`
- [ ] `@hookform/resolvers` is installed to support `zodResolver`
- [ ] A `loginSchema` is defined: `email` (valid email format), `password` (non-empty string, minimum 8 characters)
- [ ] A `registerSchema` is defined: `email`, `password`, `displayName` (non-empty string); all fields required
- [ ] A `providerRegisterSchema` extends `registerSchema` with `organizationName` as an optional string field
- [ ] Schemas are co-located with the pages that first use them (or in `src/utils/schemas/` if used by two or more pages — follow Section 4.2 of `ui-strategy.md`)
- [ ] `npm run build` and `npm run lint` pass with zero errors after installation

**Dependencies:** #61 (Phase 8 — project initialisation)

---

## Ticket 4 of 9

**Title:** Build the Customer Login page

**Description:**
Create the Customer login page at `/customer/login`. Wires `react-hook-form` + `loginSchema` to `AuthContext.login`. On success, redirects to `/customer`. Displays field-level and API errors per the error display conventions in Section 4.8 of `ui-strategy.md`.

**Acceptance Criteria:**
- [ ] `src/pages/CustomerLogin/CustomerLogin.tsx` exists and is rendered at the route `/customer/login`
- [ ] Form fields: email, password; both validated via `loginSchema` using `react-hook-form` + `zodResolver`
- [ ] Field-level validation errors render inline below the relevant input
- [ ] On valid submission, calls `AuthContext.login` with the customer role
- [ ] On success, redirects to `/customer`
- [ ] API errors (e.g. 401 wrong credentials) are displayed as an alert banner on the form — not as a browser alert or console log
- [ ] Page title uses the `font-heading` (Cinzel) token; form is contained in a `bg-surface` card
- [ ] Submit button uses the `--primary` colour token and shows a disabled/loading state during submission
- [ ] The page includes a navigation link to the Customer register page
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** Ticket 2, Ticket 3

---

## Ticket 5 of 9

**Title:** Build the Customer Register page

**Description:**
Create the Customer registration page at `/customer/register`. Collects email, password, and display name. On successful registration, logs the user in and redirects to `/customer`.

**Acceptance Criteria:**
- [ ] `src/pages/CustomerRegister/CustomerRegister.tsx` exists and is rendered at the route `/customer/register`
- [ ] Form fields: email, password, displayName; all validated via `registerSchema`
- [ ] Field-level validation errors render inline below the relevant input
- [ ] On valid submission, calls `registerEndUser` from `auth.api.ts`
- [ ] On successful registration, the user is logged in automatically (using the token from the register response if the backend returns one, or via a subsequent `loginEndUser` call if it does not)
- [ ] On successful login, redirects to `/customer`
- [ ] API errors (e.g. 409 duplicate email) are displayed as an alert banner on the form
- [ ] Visual conventions match the Customer login page (surface card, Cinzel heading, primary submit button)
- [ ] The page includes a navigation link back to the Customer login page
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** Ticket 2, Ticket 3

---

## Ticket 6 of 9

**Title:** Build the Provider Login page

**Description:**
Create the Provider login page at `/provider/login`. Identical structure to the Customer login page (Ticket 4), calling `loginProvider` from `auth.api.ts`. Redirects to `/provider` on success.

**Acceptance Criteria:**
- [ ] `src/pages/ProviderLogin/ProviderLogin.tsx` exists and is rendered at the route `/provider/login`
- [ ] Form fields: email, password; both validated via `loginSchema`
- [ ] Field-level validation errors render inline below the relevant input
- [ ] On valid submission, calls `AuthContext.login` with the provider role
- [ ] On success, redirects to `/provider`
- [ ] API errors displayed as an alert banner on the form
- [ ] Visual conventions match the Customer login page (surface card, Cinzel heading, primary submit button)
- [ ] The page includes a navigation link to the Provider register page
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** Ticket 2, Ticket 3

---

## Ticket 7 of 9

**Title:** Build the Provider Register page

**Description:**
Create the Provider registration page at `/provider/register`. Extends the Customer register form with an optional `Organization Name` field, calling `registerProvider` from `auth.api.ts`. Auto-logs in on success and redirects to `/provider`.

**Acceptance Criteria:**
- [ ] `src/pages/ProviderRegister/ProviderRegister.tsx` exists and is rendered at the route `/provider/register`
- [ ] Form fields: email, password, displayName (required), organizationName (optional); validated via `providerRegisterSchema`
- [ ] `organizationName` field is clearly labelled as optional in the UI
- [ ] Field-level validation errors render inline below the relevant input
- [ ] On valid submission, calls `registerProvider` from `auth.api.ts`
- [ ] On successful registration, the user is logged in automatically (same pattern as Ticket 5)
- [ ] On successful login, redirects to `/provider`
- [ ] API errors displayed as an alert banner on the form
- [ ] Visual conventions match the Customer pages (surface card, Cinzel heading, primary submit button)
- [ ] The page includes a navigation link back to the Provider login page
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** Ticket 2, Ticket 3

---

## Ticket 8 of 9

**Title:** Register auth routes and add login landing page

**Description:**
Update `src/routes/` to register all Phase 9 auth pages as public routes. Add a `/login` landing page that presents "Log in as Customer" and "Log in as Provider" options, replacing the Phase 8 placeholder. Verify layout guard hydration behaviour with the `isLoading` fix in place.

**Acceptance Criteria:**
- [ ] The following routes are registered and publicly accessible (no auth guard): `/customer/login`, `/customer/register`, `/provider/login`, `/provider/register`, `/login`
- [ ] `/login` renders a landing page with clear navigation links to `/customer/login` and `/provider/login`
- [ ] The `/login` landing page applies design tokens: Obsidian background, Cinzel heading, Spell Gold accent on links or CTA buttons
- [ ] Navigating to `/customer` while unauthenticated redirects to `/login` (after hydration completes)
- [ ] Navigating to `/customer` while authenticated as a customer loads the customer portal without a redirect loop
- [ ] Navigating to `/provider/login` while authenticated as a provider redirects to `/provider`
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** Ticket 1, Ticket 4, Ticket 5, Ticket 6, Ticket 7

---

## Ticket 9 of 9

**Title:** Smoke test Phase 9 auth flows end-to-end

**Description:**
Verify all auth flows against a running backend. No new source code is written in this step. Any failures discovered must be fixed before this ticket is closed.

**Acceptance Criteria:**
- [ ] A new Customer account can be registered via `/customer/register` and the user lands on `/customer` after registration
- [ ] A returning Customer can log in via `/customer/login` and lands on `/customer`
- [ ] A new Provider account can be registered via `/provider/register` and the user lands on `/provider`
- [ ] A returning Provider can log in via `/provider/login` and lands on `/provider`
- [ ] Submitting incorrect credentials on any login form displays an error banner — does not crash or show a blank screen
- [ ] Reloading the browser while logged in as a customer lands on `/customer` — not `/login`
- [ ] Reloading the browser while logged in as a provider lands on `/provider` — not `/login`
- [ ] Logging out from any role clears auth state and redirects to `/login`
- [ ] `npm run lint` and `npm run build` both pass with zero errors

**Dependencies:** Tickets 1–8