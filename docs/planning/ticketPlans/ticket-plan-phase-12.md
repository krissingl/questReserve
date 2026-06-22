# Ticket Plan: Phase 12 — Frontend Admin Panel

**Purpose:** Deliver a fully functional admin portal covering provider management, platform-wide booking activity, and SUPERUSER-only admin account creation, along with the two backend endpoints required to support it.
**Total tickets:** 11
**Prefix:** P12:
**Status: LOCKED**

---

## Ticket 1 of 11

**Title:** P12:Implement GET /api/admin/me endpoint

**Description:**
Add a `GET /me` route to `questreserve-backend/src/api/admin/index.ts`. The route is protected by the existing `authenticate + requireRole('admin')` middleware already applied to the admin router. The handler queries `admin_user` by `req.user.sub` and returns a safe admin profile excluding `password_hash`.

**Acceptance Criteria:**
- [ ] `GET /api/admin/me` is reachable at that path and protected by the existing admin router middleware
- [ ] The response shape is `{ id, first_name, last_name, email, role, created_at, updated_at }` — no `password_hash` field is present
- [ ] `role` reflects the admin's `AdminRole` value (`PLATFORM_ADMIN`, `CLIENT_SUCCESS`, or `SUPERUSER`)
- [ ] An unauthenticated request returns `401`
- [ ] A request authenticated as a non-admin role returns `403`
- [ ] No new service method is introduced — the handler queries `admin_user` inline using existing DB access patterns

**Dependencies:** None

---

## Ticket 2 of 11

**Title:** P12:Implement POST /api/auth/admin/register endpoint (SUPERUSER only)

**Description:**
Add `POST /auth/admin/register` to `questreserve-backend/src/api/auth/index.ts`. The route applies `authenticate + requireRole('admin')` middleware at the route level. A `registerAdmin(callerId, input)` method is added to `AuthService`; it checks the caller's `AdminRole` from the DB, throws `ForbiddenError` (403) if not `SUPERUSER`, checks for duplicate email, hashes the password, and inserts the new admin row. The response shape and error handling follow existing register endpoint conventions.

**Acceptance Criteria:**
- [ ] `POST /api/auth/admin/register` is reachable at that path
- [ ] The endpoint is protected by `authenticate + requireRole('admin')` middleware
- [ ] A caller with `AdminRole` of `PLATFORM_ADMIN` or `CLIENT_SUCCESS` receives `403`
- [ ] A `SUPERUSER` caller can successfully create a new admin account with `first_name`, `last_name`, `email`, `password`, and `role` in the request body
- [ ] `role` must be one of `PLATFORM_ADMIN`, `CLIENT_SUCCESS`, `SUPERUSER`; an invalid value returns `400`
- [ ] `password` must be between 8 and 72 characters; a value outside this range returns `400`
- [ ] A duplicate `email` returns `409`
- [ ] A successful request returns `201` with either `{ token: string }` or `{ id, email, role }` — the choice is documented in the implementation
- [ ] `password_hash` is never returned in any response
- [ ] `registerAdmin` is added to `auth.service.ts` and `ForbiddenError` is defined there or in the shared error types

**Dependencies:** Ticket 1 — `registerAdmin` reuses the same pattern for fetching admin profile by ID

---

## Ticket 3 of 11

**Title:** P12:Create AdminLogin page and /admin/login route

**Description:**
Create `questreserve-frontend/src/pages/AdminLogin/AdminLogin.tsx` following the exact pattern of `ProviderLogin`: react-hook-form, `zodResolver(loginSchema)`, `useAuth().login(email, password, 'admin')`, navigate to `/admin` on success, display API errors via `extractLoginError`. Add the `/admin/login` route to `routes/index.tsx` wrapped in `AlreadyAuthRedirect` with `pageRole="admin"`. Update `AdminLayout`'s unauthenticated redirect target from `/login` to `/admin/login`.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/pages/AdminLogin/AdminLogin.tsx` exists and renders a login form
- [ ] The form uses react-hook-form with `zodResolver(loginSchema)` — no new schema is created
- [ ] Submitting valid admin credentials calls `useAuth().login(email, password, 'admin')` and navigates to `/admin` on success
- [ ] An invalid credentials response surfaces an error message via `extractLoginError`
- [ ] `/admin/login` is registered as a route in `routes/index.tsx` and wrapped in `AlreadyAuthRedirect` with `pageRole="admin"`
- [ ] `AdminLayout` redirects unauthenticated visitors to `/admin/login` (not `/login`)
- [ ] The page renders with no layout wrapper — identical in structure to `CustomerLogin` and `ProviderLogin`
- [ ] No admin registration link is present on the page
- [ ] The frontend compiles without TypeScript errors

**Dependencies:** None

---

## Ticket 4 of 11

**Title:** P12:Create frontend admin API module and types

**Description:**
Create `questreserve-frontend/src/api/admin.api.ts` encapsulating all admin-domain API calls, following the pattern of `provider.api.ts`. Define all required types either in this file or a co-located `admin.types.ts`. Implement the six typed functions: `getAdminMe`, `listProviders`, `getProvider`, `setProviderStatus`, `getPlatformBookings`, and `registerAdminUser`.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/api/admin.api.ts` exists and exports all six functions with explicit return types
- [ ] `getAdminMe(): Promise<AdminProfile>` calls `GET /api/admin/me`
- [ ] `listProviders(): Promise<AdminProvider[]>` calls `GET /api/admin/providers`
- [ ] `getProvider(id: string): Promise<AdminProvider>` calls `GET /api/admin/providers/:id`
- [ ] `setProviderStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<AdminProvider>` calls `PATCH /api/admin/providers/:id/status`
- [ ] `getPlatformBookings(): Promise<AdminBookingView[]>` calls `GET /api/admin/bookings`
- [ ] `registerAdminUser(input: RegisterAdminInput): Promise<void>` calls `POST /api/auth/admin/register`
- [ ] `AdminRole`, `ProviderStatus`, `AdminProfile`, `AdminProvider`, `AdminBookingView`, and `RegisterAdminInput` types are defined and exported per the shapes specified in the phase plan
- [ ] All functions use the same Axios instance or fetch pattern as `provider.api.ts` — no new HTTP client is introduced
- [ ] No `any` types are introduced
- [ ] The frontend compiles without TypeScript errors

**Dependencies:** Tickets 1 and 2 — endpoints must exist before live integration; types may be drafted in parallel against the agreed contract

---

## Ticket 5 of 11

**Title:** P12:Implement AdminSidebar component and integrate it into AdminLayout

**Description:**
Create `questreserve-frontend/src/components/AdminSidebar/AdminSidebar.tsx` with nav links to `/admin`, `/admin/providers`, `/admin/bookings`, and `/admin/users`. Update `AdminLayout` to render `AdminSidebar` alongside `<Outlet />` inside the main content area, following the layout pattern established by `ProviderLayout`. The Admin Users nav item is visible to all admin roles; access control is handled at the page level, not in the sidebar.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/components/AdminSidebar/AdminSidebar.tsx` exists and renders without errors
- [ ] The sidebar contains nav links to exactly four destinations: `/admin` (Dashboard), `/admin/providers` (Providers), `/admin/bookings` (Bookings), `/admin/users` (Admin Users)
- [ ] All four links are visible regardless of the logged-in admin's role
- [ ] `AdminLayout` imports and renders `AdminSidebar` alongside `<Outlet />` inside the main content area
- [ ] The layout structure follows the pattern of `ProviderLayout`
- [ ] The frontend compiles without TypeScript errors

**Dependencies:** Ticket 3 — login page exists, enabling manual testing of the layout

---

## Ticket 6 of 11

**Title:** P12:Implement AdminHome dashboard page

**Description:**
Replace the stub content in `questreserve-frontend/src/pages/AdminHome.tsx` with a real landing page. At minimum the page renders a welcome/orientation view with links to the three admin sections. Optionally, fetch `listProviders()` and `getPlatformBookings()` in parallel to display summary stat counts — this is acceptable but not required. If stats are included, display loading and error states.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/pages/AdminHome.tsx` no longer renders placeholder stub text
- [ ] The page renders orientation content with navigable links (or cards) pointing to `/admin/providers`, `/admin/bookings`, and `/admin/users`
- [ ] If summary stats are implemented: `listProviders()` and `getPlatformBookings()` are called in parallel; loading state is shown while requests are in flight; error state is shown if either request fails
- [ ] If summary stats are omitted: the page is a styled landing with links only — this is acceptable
- [ ] The frontend compiles without TypeScript errors

**Dependencies:** Ticket 4 (admin API module), Ticket 5 (sidebar nav in place for visual verification)

---

## Ticket 7 of 11

**Title:** P12:Implement AdminProviders list page

**Description:**
Create `questreserve-frontend/src/pages/AdminProviders/AdminProviders.tsx`. The page fetches all providers via `listProviders()` on mount and renders them in a table. Add the `/admin/providers` child route to the admin subtree in `routes/index.tsx`.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/pages/AdminProviders/AdminProviders.tsx` exists and renders without errors
- [ ] The table includes columns for: Name (first + last), Organization (or "—" if null), Email, Plan badge, Status badge, and a "View" link to `/admin/providers/:id`
- [ ] Status badges use design token colors: `PENDING` (amber/neutral), `ACTIVE` (green), `SUSPENDED` (red) — no hardcoded hex values
- [ ] A loading state is displayed while the fetch is in progress
- [ ] An empty state is displayed if no providers are returned
- [ ] `/admin/providers` is registered as a child route under the admin subtree in `routes/index.tsx`
- [ ] The frontend compiles without TypeScript errors

**Dependencies:** Ticket 4 (admin API module), Ticket 5 (layout in place for visual verification)

---

## Ticket 8 of 11

**Title:** P12:Implement AdminProviderDetail page with status management

**Description:**
Create `questreserve-frontend/src/pages/AdminProviderDetail/AdminProviderDetail.tsx`. Reached via `/admin/providers/:id`. The page displays the provider's full profile and exposes a status-change control offering only `ACTIVE` and `SUSPENDED` as targets. `PENDING` is never an option in the control. Add the `/admin/providers/:id` child route to `routes/index.tsx`.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/pages/AdminProviderDetail/AdminProviderDetail.tsx` exists and renders without errors
- [ ] The page displays: name, email, organization name, plan, current status, and account created date
- [ ] A status-change control (select or button group) offers exactly `ACTIVE` and `SUSPENDED` — `PENDING` is not present as an option
- [ ] Selecting a new status calls `setProviderStatus(id, newStatus)` on confirmation
- [ ] The control is disabled while the PATCH request is in flight
- [ ] Success feedback is displayed inline after a status change
- [ ] Error feedback is displayed inline if the request fails
- [ ] A back link returns the user to `/admin/providers`
- [ ] `/admin/providers/:id` is registered as a child route under the admin subtree in `routes/index.tsx`
- [ ] The frontend compiles without TypeScript errors

**Dependencies:** Ticket 7 — the providers list exists and links to this detail view

---

## Ticket 9 of 11

**Title:** P12:Implement AdminBookings platform activity page

**Description:**
Create `questreserve-frontend/src/pages/AdminBookings/AdminBookings.tsx`. The page fetches all platform bookings via `getPlatformBookings()` on mount and displays them in reverse chronological order by `created_at`. This is a read-only view — no edit or cancel actions are present. Add the `/admin/bookings` child route to `routes/index.tsx`.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/pages/AdminBookings/AdminBookings.tsx` exists and renders without errors
- [ ] The table includes columns for: Booking ID (truncated), Location Name, Provider Name, Start Time, End Time, Status badge (`BOOKED` / `CANCELLED`), Created At
- [ ] Bookings are displayed in reverse chronological order by `created_at`
- [ ] A loading state is displayed while the fetch is in progress
- [ ] An empty state is displayed if no bookings are returned
- [ ] No edit, cancel, or any mutating action controls are present
- [ ] `/admin/bookings` is registered as a child route under the admin subtree in `routes/index.tsx`
- [ ] The frontend compiles without TypeScript errors

**Dependencies:** Ticket 4 (admin API module)

---

## Ticket 10 of 11

**Title:** P12:Implement AdminUsers page with SUPERUSER-gated create form

**Description:**
Create `questreserve-frontend/src/pages/AdminUsers/AdminUsers.tsx`. On mount, call `getAdminMe()` and store the result in local state. If the logged-in admin is not `SUPERUSER`, render an access-denied message and nothing else. If `SUPERUSER`, render a react-hook-form create form with a zod schema defined in `src/utils/schemas/admin.schemas.ts`. On submit, call `registerAdminUser(input)`, show success confirmation inline, and clear the form. Add the `/admin/users` child route to `routes/index.tsx`.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/pages/AdminUsers/AdminUsers.tsx` exists and renders without errors
- [ ] On mount, `getAdminMe()` is called and the result is stored in local component state — not in `AuthContext`
- [ ] A non-`SUPERUSER` admin sees the message "This section is restricted to Superusers." and no form
- [ ] A `SUPERUSER` admin sees a create form with fields: First Name, Last Name, Email, Password (min 8 chars), Role (select: `PLATFORM_ADMIN` | `CLIENT_SUCCESS` | `SUPERUSER`)
- [ ] The form uses react-hook-form with a zod schema exported from `questreserve-frontend/src/utils/schemas/admin.schemas.ts`
- [ ] Submitting a valid form calls `registerAdminUser(input)` and displays an inline success confirmation including the created email address
- [ ] The form is cleared on success
- [ ] A `409` response surfaces a "This email is already registered." error message inline
- [ ] Other submission failures surface a generic error message inline
- [ ] `/admin/users` is registered as a child route under the admin subtree in `routes/index.tsx`
- [ ] The session of the currently logged-in admin is not replaced after a successful account creation
- [ ] The frontend compiles without TypeScript errors

**Dependencies:** Ticket 1 (`GET /admin/me`), Ticket 2 (`POST /auth/admin/register`), Ticket 4 (admin API module)

---

## Ticket 11 of 11

**Title:** P12:End-to-end verification of admin panel

**Description:**
Walk through all admin flows manually against a running local stack. No source code changes are made in this ticket. All failures discovered must be fixed as separate commits before the phase is closed.

**Acceptance Criteria:**
- [ ] Navigating to `/admin` while unauthenticated redirects to `/admin/login`
- [ ] Submitting invalid credentials on `/admin/login` displays an error message
- [ ] Submitting valid admin credentials on `/admin/login` redirects to `/admin`
- [ ] Reloading `/admin` after login keeps the session active (token persisted in localStorage)
- [ ] All four sidebar links (`/admin`, `/admin/providers`, `/admin/bookings`, `/admin/users`) are present and navigate correctly
- [ ] `/admin/providers` displays all seeded providers with correct status badges (`PENDING`, `ACTIVE`, `SUSPENDED`)
- [ ] Clicking "View" on a provider loads the detail page with correct profile data
- [ ] Changing a provider's status from `ACTIVE` to `SUSPENDED` (or vice versa) updates the badge inline and is reflected on page refresh
- [ ] `PENDING` is not available as an option in the status change control
- [ ] `/admin/bookings` displays all seeded bookings with location name, provider name, times, and status badge; no mutating action controls are present
- [ ] Logging in as a `PLATFORM_ADMIN` or `CLIENT_SUCCESS` admin and navigating to `/admin/users` shows the access-denied message
- [ ] Logging in as a `SUPERUSER` and navigating to `/admin/users` shows the create form
- [ ] Submitting the create form with valid inputs shows a success message naming the created email
- [ ] Submitting the create form with a duplicate email shows a 409-specific error message
- [ ] A newly created admin account can authenticate via `/admin/login` and reach `/admin`
- [ ] Directly navigating to any `/admin/*` route with a provider or customer token is blocked by `AdminLayout`

**Dependencies:** Tickets 1–10 — all prior work must be complete

---
