# Phase 12: Frontend — Admin Panel

_Created: 2026-06-21 | Status: DRAFT_

## Goal

Deliver a fully functional admin portal within the existing `AdminLayout`, covering provider management (list, detail, status changes), platform-wide booking activity, and admin user management (SUPERUSER-only account creation). This phase also adds the sole remaining backend endpoint needed to support it: `POST /api/auth/admin/register` and a supporting `GET /api/admin/me` to expose the logged-in admin's role to the frontend.

## Context

All backend admin domain endpoints were completed in Phase 6:
- `GET /api/admin/providers` — list all providers with status
- `GET /api/admin/providers/:id` — get single provider detail
- `PATCH /api/admin/providers/:id/status` — set provider status (`ACTIVE` | `SUSPENDED`)
- `GET /api/admin/bookings` — platform-wide booking activity

The `AdminLayout` was scaffolded in Phase 8 (`questreserve-frontend/src/layouts/AdminLayout.tsx`) and is fully functional — it guards for `role === 'admin'` and redirects unauthenticated visitors to `/login`. It renders `HeaderNav` and `SiteFooter` around an `<Outlet />`.

The `AdminHome` page (`questreserve-frontend/src/pages/AdminHome.tsx`) is a stub returning placeholder text. It is the only admin page that exists.

**There is no admin login page.** The `/admin` route subtree is reachable only by authenticated admins. An unauthenticated user hitting `/admin` is redirected by `AdminLayout` to `/login` — the shared role-selection page — which has no path to admin login. `loginAdmin` exists in `auth.api.ts` and `POST /api/auth/admin/login` works on the backend, but there is no dedicated `AdminLogin` page or `/admin/login` route yet.

**The JWT does not carry `AdminRole`.** The token payload encodes only `sub` (admin user ID) and `type: 'admin'`. The frontend cannot distinguish a `SUPERUSER` from a `PLATFORM_ADMIN` or `CLIENT_SUCCESS` admin without a backend call. A `GET /api/admin/me` endpoint is required to allow the UI to conditionally render the User Management section.

**`ProviderStatus` PATCH accepts only `ACTIVE` and `SUSPENDED`.** The backend's `VALID_PROVIDER_STATUSES` array does not include `PENDING`. New providers arrive with `PENDING` status from the DB default but the status-change UI should only offer `ACTIVE` and `SUSPENDED` as targets. The list view should display `PENDING` as a badge but the action dropdown should not allow setting it.

The `AuthContext` stores `role: UserRole` (`'customer' | 'provider' | 'admin'`) — no admin sub-role. A separate `adminRole` state (derived from the `/admin/me` response) should be held in the admin pages, not in `AuthContext`, to avoid coupling the shared auth layer to admin-specific concerns.

Phases 9 and 11 established the login page and provider dashboard patterns this phase follows. The `ProviderLogin` page (`questreserve-frontend/src/pages/ProviderLogin/ProviderLogin.tsx`) and its form patterns (react-hook-form, zod resolver, `loginSchema`, `extractLoginError`) are the direct model for `AdminLogin`.

## Steps

### Step 1: Backend — GET /api/admin/me

Add a `GET /admin/me` route to `questreserve-backend/src/api/admin/index.ts`. The route is protected by the existing `authenticate + requireRole('admin')` middleware already applied to the entire admin router.

The handler queries `admin_user` by `req.user.sub` and returns a safe admin profile (no `password_hash`). Response shape:

```
{
  id: string
  first_name: string
  last_name: string
  email: string
  role: AdminRole   // 'PLATFORM_ADMIN' | 'CLIENT_SUCCESS' | 'SUPERUSER'
  created_at: string
  updated_at: string
}
```

**Files changed:**
- `questreserve-backend/src/api/admin/index.ts` — add `GET /me` handler (inline, no new service method needed for a simple profile fetch)

**Dependencies:** None — all middleware and DB access patterns exist.

---

### Step 2: Backend — POST /api/auth/admin/register (SUPERUSER only)

Add `POST /auth/admin/register` to `questreserve-backend/src/api/auth/index.ts`. This endpoint is protected: `authenticate` + `requireRole('admin')` middleware are applied at the route level. An additional SUPERUSER check is enforced at the service layer — if the caller's `AdminRole` is not `SUPERUSER`, the service throws a `ForbiddenError` (403).

**Request body:**
```
{
  first_name: string   // required
  last_name: string    // required
  email: string        // required
  password: string     // required, min 8 chars, max 72 chars
  role: AdminRole      // required; 'PLATFORM_ADMIN' | 'CLIENT_SUCCESS' | 'SUPERUSER'
}
```

**Response:** `201 { token: string }` — consistent with existing register endpoints, though the frontend will not auto-login the new admin (the caller is already authenticated). The token response is acceptable as confirmation of account creation; alternatively the response can return `{ id, email, role }`. Either is acceptable; document the choice in the implementation.

**Service layer (`AuthService`):**
- Add `registerAdmin(callerId: string, input: RegisterAdminInput): Promise<AdminResult>` to `auth.service.ts`.
- Fetch the calling admin's `AdminRole` from `admin_user` by `callerId`. If role is not `SUPERUSER`, throw `ForbiddenError`.
- Check for duplicate email. Hash password. Insert row with provided `role`.
- Return safe result (no password_hash).

**Error handling in the route handler:**
- `ForbiddenError` → 403
- `DuplicateAccountError` → 409 (reuse existing)
- Validation failure → 400

**Files changed:**
- `questreserve-backend/src/api/auth/index.ts` — add `POST /admin/register` route with inline `authenticate + requireRole('admin')`
- `questreserve-backend/src/services/auth.service.ts` — add `registerAdmin` method and `ForbiddenError` class

**Dependencies:** Step 1 establishes the pattern for fetching admin profile by ID; this step reuses the same query.

---

### Step 3: Frontend — AdminLogin page and route

Create `questreserve-frontend/src/pages/AdminLogin/AdminLogin.tsx`. Follow the exact form pattern of `ProviderLogin`: react-hook-form, `zodResolver(loginSchema)`, `useAuth().login(email, password, 'admin')`, navigate to `/admin` on success, display API error via `extractLoginError`.

The page is standalone (no layout wrapper) — identical to `CustomerLogin` and `ProviderLogin`.

Add a route `/admin/login` to `questreserve-frontend/src/routes/index.tsx`, wrapped in `AlreadyAuthRedirect` with `pageRole="admin"`. Update `AdminLayout`'s redirect-if-unauthenticated target from `/login` to `/admin/login`.

There is no admin registration link — admins are created by SUPERUSERs from within the portal.

**Files created:**
- `questreserve-frontend/src/pages/AdminLogin/AdminLogin.tsx`

**Files changed:**
- `questreserve-frontend/src/routes/index.tsx` — add `/admin/login` route; import `AdminLogin`
- `questreserve-frontend/src/layouts/AdminLayout.tsx` — change unauthenticated redirect target from `/login` to `/admin/login`

**Dependencies:** None. Uses existing `loginAdmin` from `auth.api.ts`, existing auth schemas.

---

### Step 4: Frontend — admin API module

Create `questreserve-frontend/src/api/admin.api.ts`. This module encapsulates all admin-domain API calls, following the same pattern as `provider.api.ts` (typed functions, `apiClient` import, explicit return types).

**Functions to implement:**

```
getAdminMe(): Promise<AdminProfile>
listProviders(): Promise<AdminProvider[]>
getProvider(id: string): Promise<AdminProvider>
setProviderStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<AdminProvider>
getPlatformBookings(): Promise<AdminBookingView[]>
registerAdminUser(input: RegisterAdminInput): Promise<void>
```

**Types to define in this file (or a co-located `admin.types.ts`):**

```typescript
export type AdminRole = 'PLATFORM_ADMIN' | 'CLIENT_SUCCESS' | 'SUPERUSER'
export type ProviderStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING'

export interface AdminProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: AdminRole
  created_at: string
  updated_at: string
}

export interface AdminProvider {
  id: string
  first_name: string
  last_name: string
  email: string
  organization_name: string | null
  plan: 'FREE' | 'STANDARD' | 'PREMIUM'
  status: ProviderStatus
  created_at: string
  updated_at: string
}

export interface AdminBookingView {
  id: string
  time_slot_id: string
  end_user_id: string
  status: 'BOOKED' | 'CANCELLED'
  created_at: string
  updated_at: string
  start_time: string
  end_time: string
  booking_location_id: string
  location_name: string
  provider_id: string
  provider_name: string
}

export interface RegisterAdminInput {
  first_name: string
  last_name: string
  email: string
  password: string
  role: AdminRole
}
```

**Files created:**
- `questreserve-frontend/src/api/admin.api.ts`

**Dependencies:** Step 1 and Step 2 must be complete (endpoints exist before the module is needed by pages).

---

### Step 5: Frontend — Admin sidebar navigation

`AdminLayout` currently renders only `HeaderNav` (the shared site header) and `SiteFooter`. The admin portal requires a role-specific sidebar (or equivalent persistent nav) linking to the admin sections. This mirrors how `ProviderLayout` provides portal-scoped navigation.

Implement an `AdminSidebar` component. Nav items:
- Dashboard (`/admin`)
- Providers (`/admin/providers`)
- Bookings (`/admin/bookings`)
- Admin Users (`/admin/users`) — visible to all admins but actions within that page are SUPERUSER-gated

The sidebar does not need to hide the Admin Users item based on role — the page itself handles access control. Showing the item to all admin roles and displaying an access-denied state on the page is acceptable. Do not add client-side role checks that mirror server-side enforcement.

Update `AdminLayout` to render `AdminSidebar` inside its main content area, with the `<Outlet />` taking the remaining space. Follow the layout pattern established by `ProviderLayout`.

**Files created:**
- `questreserve-frontend/src/components/AdminSidebar/AdminSidebar.tsx`

**Files changed:**
- `questreserve-frontend/src/layouts/AdminLayout.tsx` — import and render `AdminSidebar` alongside `<Outlet />`

**Dependencies:** Step 3 (login exists so manual testing of the layout is possible).

---

### Step 6: Frontend — AdminHome (Dashboard) page

Replace the stub `AdminHome` with a real landing page. This is not a data-heavy dashboard — it is a welcome/orientation page that surfaces quick-access links to the three admin sections. It may optionally show a stat count (total providers, total bookings) fetched from the existing list endpoints, but this is not required.

If stats are included: fetch `listProviders()` and `getPlatformBookings()` in parallel using the admin API module. Display counts as summary cards. Display loading and error states.

If stats are deferred: the page is a styled landing with links to each section. This is the simpler starting point and is acceptable for MVP.

**Files changed:**
- `questreserve-frontend/src/pages/AdminHome.tsx` — replace stub content

**Dependencies:** Step 4 (admin API module), Step 5 (sidebar nav context).

---

### Step 7: Frontend — Provider Management list page

Create `questreserve-frontend/src/pages/AdminProviders/AdminProviders.tsx`. This page lists all providers fetched via `listProviders()`.

**Table columns:** Name (first + last), Organization (or "—"), Email, Plan badge, Status badge, "View" link → `/admin/providers/:id`.

**Status badges:** `PENDING` (amber/neutral), `ACTIVE` (green), `SUSPENDED` (red). Use existing design token colors from the CSS variable system (`--warning`, `--success`, `--destructive` or equivalent).

**Behavior:** Fetch on mount. Show loading state. Show empty state if no providers. No pagination required for MVP (list is not expected to be large).

Add the `/admin/providers` route to the admin subtree in `routes/index.tsx`.

**Files created:**
- `questreserve-frontend/src/pages/AdminProviders/AdminProviders.tsx`

**Files changed:**
- `questreserve-frontend/src/routes/index.tsx` — add `/admin/providers` child route under the admin subtree

**Dependencies:** Step 4 (admin API module), Step 5 (layout in place for visual verification).

---

### Step 8: Frontend — Provider detail and status management page

Create `questreserve-frontend/src/pages/AdminProviderDetail/AdminProviderDetail.tsx`. Reached via `/admin/providers/:id`.

**Display:** Provider's full profile fields — name, email, organization name, plan, current status, account created date.

**Status change action:** A control (select dropdown or button group) offering `ACTIVE` and `SUSPENDED` as options. `PENDING` is not a valid target for `PATCH /admin/providers/:id/status` and must not appear as an option. On confirmation, call `setProviderStatus(id, newStatus)`. Show success feedback inline. Show error feedback inline. Disable the control while the request is in-flight.

**Back link:** Returns to `/admin/providers`.

Add the `/admin/providers/:id` route to `routes/index.tsx`.

**Files created:**
- `questreserve-frontend/src/pages/AdminProviderDetail/AdminProviderDetail.tsx`

**Files changed:**
- `questreserve-frontend/src/routes/index.tsx` — add `/admin/providers/:id` child route

**Dependencies:** Step 7 (providers list exists; this is the detail view linked from it).

---

### Step 9: Frontend — Platform Bookings page

Create `questreserve-frontend/src/pages/AdminBookings/AdminBookings.tsx`. Reached via `/admin/bookings`.

**Table columns:** Booking ID (truncated), Location Name, Provider Name, Start Time, End Time, Status badge (`BOOKED` / `CANCELLED`), Created At.

**Behavior:** Fetch all bookings via `getPlatformBookings()` on mount. Display in reverse chronological order by `created_at`. Show loading state. Show empty state. No actions — this is a read-only activity view per spec (Admin can "view platform-wide booking activity"; no booking management by admin is in scope).

Add the `/admin/bookings` route to `routes/index.tsx`.

**Files created:**
- `questreserve-frontend/src/pages/AdminBookings/AdminBookings.tsx`

**Files changed:**
- `questreserve-frontend/src/routes/index.tsx` — add `/admin/bookings` child route

**Dependencies:** Step 4 (admin API module).

---

### Step 10: Frontend — Admin User Management page

Create `questreserve-frontend/src/pages/AdminUsers/AdminUsers.tsx`. Reached via `/admin/users`.

**On mount:** Call `getAdminMe()`. Store the result in local state as `adminProfile`. If the logged-in admin is not `SUPERUSER`, render an access-denied message ("This section is restricted to Superusers.") and nothing else. Do not redirect — allow the admin to navigate away via the sidebar.

**If SUPERUSER:** Render a "Create Admin Account" form with fields:
- First Name (required)
- Last Name (required)
- Email (required)
- Password (required, min 8 chars)
- Role (select: `PLATFORM_ADMIN` | `CLIENT_SUCCESS` | `SUPERUSER`)

Use react-hook-form with a zod schema defined in `src/utils/schemas/` (follow the pattern of existing auth schemas). On submit, call `registerAdminUser(input)`. Show success confirmation inline ("Admin account created for [email]."). Show error feedback for 409 (duplicate email) and other failures. Clear the form on success.

Note: There is no admin user list endpoint (`GET /api/admin/users`) in Phase 12 scope. The page is create-only. Listing existing admin accounts is deferred (see Out of Scope below).

Add the `/admin/users` route to `routes/index.tsx`.

**Files created:**
- `questreserve-frontend/src/pages/AdminUsers/AdminUsers.tsx`

**Files changed:**
- `questreserve-frontend/src/routes/index.tsx` — add `/admin/users` child route
- `questreserve-frontend/src/utils/schemas/` — add admin user creation schema (e.g., `admin.schemas.ts`)

**Dependencies:** Step 1 (`GET /admin/me`), Step 2 (`POST /auth/admin/register`), Step 4 (admin API module).

---

### Step 11: End-to-end verification

Walk through every admin flow manually against a running local stack.

**Admin login:**
1. Navigate to `/admin` while unauthenticated. Confirm redirect to `/admin/login`.
2. Submit invalid credentials. Confirm error message is displayed.
3. Submit valid admin credentials. Confirm redirect to `/admin`.
4. Reload the page. Confirm session persists (token in localStorage).
5. Logout (if logout control is accessible from admin layout). Confirm redirect to `/admin/login`.

**Provider Management:**
6. Navigate to `/admin/providers`. Confirm all seeded providers appear with correct status badges.
7. Click "View" on a provider. Confirm detail page loads with correct data.
8. Change a provider's status from `ACTIVE` to `SUSPENDED`. Confirm badge updates. Confirm backend reflects the change (re-fetch or refresh page).
9. Confirm `PENDING` is not offered as a status option in the change control.

**Platform Bookings:**
10. Navigate to `/admin/bookings`. Confirm all seeded bookings appear with location name, provider name, status, and times.
11. Confirm no edit or cancel actions are present.

**Admin User Management — non-SUPERUSER:**
12. Log in as a `PLATFORM_ADMIN` or `CLIENT_SUCCESS` admin. Navigate to `/admin/users`. Confirm access-denied message is shown.

**Admin User Management — SUPERUSER:**
13. Log in as a `SUPERUSER`. Navigate to `/admin/users`. Confirm the create form is shown.
14. Submit the form with a unique email and valid inputs. Confirm success message.
15. Submit again with the same email. Confirm 409 error is surfaced.
16. Attempt to log in with the newly created admin credentials (via `/admin/login`). Confirm login succeeds and redirects to `/admin`.

**Sidebar navigation:**
17. Confirm all four sidebar links (`/admin`, `/admin/providers`, `/admin/bookings`, `/admin/users`) are present and navigate correctly.
18. Confirm `AdminLayout` is not accessible to non-admin roles (test with a provider token via direct navigation).

---

## Notes

- **JWT carries no `AdminRole`.** The frontend cannot read sub-role from the token. `GET /api/admin/me` is the only source of admin role for the UI. Do not embed `AdminRole` in the JWT — the token format is shared infrastructure and changing it is out of scope.
- **`PENDING` is display-only in status changes.** The PATCH endpoint rejects `PENDING` as a target value. The status badge on the list and detail pages must show it; the change control must not offer it.
- **SUPERUSER check is dual-layered.** The backend enforces it at the service layer (`registerAdmin` checks caller's role). The frontend enforces it in the UI to avoid a confusing 403 from an invisible form. Both layers are required — the frontend check is UX, not security.
- **No auto-login after admin register.** The `POST /auth/admin/register` endpoint returns a token consistent with other register endpoints, but the admin creating the account is already authenticated. The frontend should treat the response as confirmation and not replace the current session.
- **Admin Users list is deferred.** `GET /api/admin/users` does not exist and is not added in this phase. The Admin Users page is create-only. A future phase can add listing and deactivation.
- **`AdminLayout` redirect target changes.** Changing the unauthenticated redirect from `/login` to `/admin/login` (Step 3) is necessary for a clean admin auth flow. The shared `/login` page serves customers and providers only.
- **Sidebar nav scope.** The Admin Users nav item is shown to all admin roles; access control is enforced on the page itself. This is consistent with how the spec describes admin role distinctions — they are operational tiers, not used for broad route hiding.
- **Out of scope for Phase 12:**
  - `GET /api/admin/users` (list existing admin accounts)
  - Admin account deactivation or password reset
  - Booking cancellation or modification by admin
  - Payment data or financial reporting (no payment schema exists; Post-MVP per spec)
  - Analytics beyond the raw booking list (aggregated demand, occupancy — Post-MVP per spec)
  - Provider plan changes (FREE → STANDARD → PREMIUM) — no endpoint exists; deferred
  - Admin global configuration (fees, commissions, default policies) — Post-MVP per spec
