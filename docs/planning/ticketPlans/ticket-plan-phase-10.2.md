# Ticket Plan: Phase 10.2 — Guest Access

**Purpose:** Open public routes to Browse Locations and Location Detail, introduce a universal `HeaderNav` across all portals, retire the `CustomerLayout` sidebar, add an About page stub, and verify the end-to-end guest booking redirect flow from Phase 10.1.
**Total tickets:** 9
**Prefix:** P10.2:
**Status: LOCKED** — This plan is complete and approved. The agent must not add, remove, reorder, or infer any ticket beyond what is listed below.

---

## Ticket 1 of 9

**Title:** P10.2: Verify public backend endpoints require no auth token

**Description:**
Before any frontend work begins, confirm that `GET /api/customer/locations`, `GET /api/customer/locations/:id`, and `GET /api/customer/locations/:id/slots` are all reachable without an `Authorization` header. Inspect the backend source to confirm no global `authenticate` middleware wraps the `/customer` prefix at the app level. No code changes are expected.

**Acceptance Criteria:**
- [ ] `GET /api/customer/locations` returns `200` with a location array when called without an `Authorization` header
- [ ] `GET /api/customer/locations/:id` returns `200` with a single location object when called without an `Authorization` header
- [ ] `GET /api/customer/locations/:id/slots` returns `200` with a slots array when called without an `Authorization` header
- [ ] `questreserve-backend/src/api/customer/index.ts` is confirmed to mount these three routes on `publicRouter` before `protectedRouter`
- [ ] `questreserve-backend/src/api/index.ts` and the backend app entry point are confirmed to apply no global `authenticate` middleware to the `/customer` prefix
- [ ] If an unexpected global auth guard is found, the issue is documented and a fix is applied and committed before this ticket is closed

---

## Ticket 2 of 9

**Title:** P10.2: Add public routes for `/locations`, `/locations/:id`, and `/about`

**Description:**
Register three new top-level public routes in `src/routes/index.tsx` — `/locations`, `/locations/:id`, and `/about` — outside any auth-guarded layout wrapper. These routes reuse the existing `BrowseLocations` and `LocationDetail` page components and the new `GuestLayout` (Ticket 3) and `About` page (Ticket 4). Until those are merged, scaffold the entries with a temporary placeholder wrapper so the router compiles.

**Acceptance Criteria:**
- [ ] `/locations` is registered in `src/routes/index.tsx` as a public route rendering `BrowseLocations` inside `GuestLayout`
- [ ] `/locations/:id` is registered in `src/routes/index.tsx` as a public route rendering `LocationDetail` inside `GuestLayout`
- [ ] `/about` is registered in `src/routes/index.tsx` as a public route rendering `About` inside `GuestLayout`
- [ ] All three routes are accessible without an authenticated session (no redirect to login occurs)
- [ ] Existing `/customer/locations` and `/customer/locations/:id` routes under `CustomerLayout` remain in place and continue to work for authenticated customers
- [ ] `npm run lint` and `npm run build` pass with zero new errors

**Dependencies:** #<Ticket 3 issue number> — `GuestLayout` must exist (or be stubbed) before the route entries can compile; #<Ticket 4 issue number> — `About` page must exist before its route entry can compile

---

## Ticket 3 of 9

**Title:** P10.2: Create `GuestLayout`

**Description:**
Create `src/layouts/GuestLayout.tsx` as a minimal public shell that renders `HeaderNav` above the page outlet with no auth guard and no sidebar. This layout is the wrapper for all public routes introduced in Ticket 2.

**Acceptance Criteria:**
- [ ] `src/layouts/GuestLayout.tsx` exists and renders `HeaderNav` above a `<main>` element that contains `<Outlet />`
- [ ] No auth guard, redirect logic, or `AuthContext` role checks are present in `GuestLayout` itself
- [ ] No sidebar is rendered
- [ ] Navigating to `/locations` as an unauthenticated user renders the layout without any login redirect
- [ ] `npm run lint` and `npm run build` pass with zero new errors

**Dependencies:** #<Ticket 5 issue number> — `HeaderNav` must exist before `GuestLayout` can import it (use a placeholder comment until Ticket 5 is merged)

---

## Ticket 4 of 9

**Title:** P10.2: Create the About page stub

**Description:**
Create `src/pages/About/About.tsx` as a minimal stub page with a heading and placeholder body copy. The page uses existing design tokens and is styled consistently with other portal pages. No functional content is required in this phase.

**Acceptance Criteria:**
- [ ] `src/pages/About/About.tsx` exists and renders a page heading of "About QuestReserve" using the `--font-heading` token and `--foreground` colour
- [ ] The page renders one or two sentences of placeholder body copy below the heading
- [ ] The page background uses the Obsidian (`--background`) token and a surface card with standard spacing, consistent with other portal pages
- [ ] No new CSS variables are introduced
- [ ] `npm run lint` and `npm run build` pass with zero new errors

---

## Ticket 5 of 9

**Title:** P10.2: Build `HeaderNav`

**Description:**
Create `src/components/HeaderNav/HeaderNav.tsx`. The component reads `token` and `role` from `useAuth()` and renders a full-width top bar with a context-sensitive logo link and role-scoped navigation links. This is the critical-path deliverable of the phase — Steps 3, 6, 7, and 9 all depend on it.

**Acceptance Criteria:**
- [ ] `src/components/HeaderNav/HeaderNav.tsx` exists and renders a full-width horizontal bar pinned to the top of the viewport
- [ ] The bar uses the `--background` (Obsidian) token as its background colour
- [ ] The logo (`logo-primary-white-gold.svg`) is always visible at the left at `height: 40px` and is wrapped in a `Link`
- [ ] Logo `Link` destination is `/locations` for guests, `/customer` for authenticated customers, `/provider` for providers, and `/admin` for admins
- [ ] Guest users (no token) see nav links: Browse Adventures (→ `/locations`), About (→ `/about`), Login (→ `/login`)
- [ ] Authenticated customers see nav links: Browse Adventures (→ `/locations`), About (→ `/about`), My Bookings (→ `/customer/bookings`), Settings (→ `/customer/settings`), Log Out
- [ ] Authenticated providers see nav links: About (→ `/about`), Dashboard (→ `/provider`), Log Out
- [ ] Authenticated admins see nav links: About (→ `/about`), Dashboard (→ `/admin`), Log Out
- [ ] "Log Out" calls `AuthContext.logout` and then navigates to `/login`
- [ ] Nav links use `NavLink` from `react-router-dom` with `--foreground` colour at rest and `--accent` on active/hover
- [ ] No mobile hamburger menu is present (horizontal layout only)
- [ ] `npm run lint` and `npm run build` pass with zero new errors

---

## Ticket 6 of 9

**Title:** P10.2: Refactor `CustomerLayout` to use `HeaderNav` — retire sidebar

**Description:**
Replace the sidebar `<nav>` in `src/layouts/CustomerLayout.tsx` with a call to `<HeaderNav />`. The layout becomes a thin auth-guarded shell with `HeaderNav` above the outlet. All existing auth guard logic is preserved unchanged. The logo import is removed from `CustomerLayout` since `HeaderNav` now owns it.

**Acceptance Criteria:**
- [ ] The sidebar `<nav>` element and all its contents are removed from `CustomerLayout.tsx`
- [ ] `<HeaderNav />` is rendered at the top of `CustomerLayout`'s return, above the outlet wrapper
- [ ] The auth guard logic (`isLoading` check, token/role redirect) is unchanged
- [ ] The logo import (`logo-primary-white-gold.svg`) is removed from `CustomerLayout.tsx`
- [ ] Navigating to `/customer` as an authenticated customer renders `HeaderNav` with customer links and no sidebar
- [ ] Navigating to `/customer` as an unauthenticated user still redirects to `/login`
- [ ] `npm run lint` and `npm run build` pass with zero new errors

**Dependencies:** #<Ticket 5 issue number> — `HeaderNav` must exist before `CustomerLayout` can import it

---

## Ticket 7 of 9

**Title:** P10.2: Wire `HeaderNav` into `ProviderLayout` and `AdminLayout`

**Description:**
Wrap `ProviderLayout` and `AdminLayout` to include `<HeaderNav />` above the outlet. Both layouts currently return a bare `<Outlet />`. The auth guard logic in each is preserved unchanged. No sidebar is added — provider and admin sidebars are deferred to Phases 11 and 12.

**Acceptance Criteria:**
- [ ] `ProviderLayout.tsx` renders `<HeaderNav />` above `<Outlet />` inside a wrapping `<div>`
- [ ] `AdminLayout.tsx` renders `<HeaderNav />` above `<Outlet />` inside a wrapping `<div>`
- [ ] Auth guard logic is unchanged in both layouts
- [ ] Navigating to `/provider` as an authenticated provider renders `HeaderNav` with provider links
- [ ] Navigating to `/admin` as an authenticated admin renders `HeaderNav` with admin links
- [ ] Navigating to either route while unauthenticated still redirects to `/login`
- [ ] `npm run lint` and `npm run build` pass with zero new errors

**Dependencies:** #<Ticket 5 issue number> — `HeaderNav` must exist before either layout can import it

---

## Ticket 8 of 9

**Title:** P10.2: Update internal links from `/customer/locations` to `/locations`

**Description:**
Now that `/locations` and `/locations/:id` are the canonical public paths, update all internal hardcoded links in the frontend that previously pointed at `/customer/locations`. This ensures consistent deep-linking across all user types and prevents future divergence when Phase 10.3 adds filter state to the Browse Locations page.

**Acceptance Criteria:**
- [ ] In `BrowseLocations.tsx`, location card `Link` targets are updated from `/customer/locations/:id` to `/locations/:id`
- [ ] In `LocationDetail.tsx`, the "Back to Locations" link is updated from `/customer/locations` to `/locations`
- [ ] In `LocationDetail.tsx`, the guest redirect `redirect` query param is updated from `/customer/locations/:id` to `/locations/:id`
- [ ] In `MyBookings.tsx`, booking card links to `/customer/locations/:booking_location_id` are updated to `/locations/:booking_location_id`
- [ ] `CustomerHome.tsx` is inspected and any links to `/customer/locations` are updated to `/locations`
- [ ] A search of all files under `src/` for the string `/customer/locations` returns no remaining hardcoded navigation links (route definitions and comments excepted)
- [ ] `npm run lint` and `npm run build` pass with zero new errors

**Dependencies:** #<Ticket 2 issue number> — public `/locations` and `/locations/:id` routes must exist before internal links can safely point to them

---

## Ticket 9 of 9

**Title:** P10.2: Verify end-to-end guest booking redirect flow

**Description:**
Verify the complete guest → login → return flow that was implemented in Phase 10.1 but deferred until this phase opened a public Location Detail route. No new source code is written. Any failures discovered must be investigated, fixed, and documented before this ticket is closed.

**Acceptance Criteria:**
- [ ] Navigating to `/locations` without an auth session renders `BrowseLocations` with no login prompt or redirect
- [ ] Clicking a location card from `/locations` navigates to `/locations/:id` and renders location detail and available time slots
- [ ] Clicking "Reserve" on a time slot when unauthenticated fires a redirect to `/customer/login?redirect=/locations/:id&slot=:slotId`
- [ ] Logging in as a customer from that redirect navigates back to `/locations/:id` with the correct slot pre-selected and the inline confirmation step active
- [ ] Confirming the booking from the pre-selected confirmation step redirects to `/customer/payment` with location name and slot times in route state
- [ ] `HeaderNav` renders with guest links on `/locations`, `/locations/:id`, and `/about` when unauthenticated
- [ ] `HeaderNav` renders with customer links on `/customer/*` routes when authenticated as a customer
- [ ] `HeaderNav` renders with provider links on `/provider` when authenticated as a provider
- [ ] `HeaderNav` renders with admin links on `/admin` when authenticated as an admin
- [ ] `npm run lint` and `npm run build` pass with zero new errors

**Dependencies:** #<Ticket 8 issue number> — all public routes, layouts, link updates, and `HeaderNav` integrations must be complete
