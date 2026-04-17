# Phase 10.2: Guest Access

_Created: 2026-04-16 | Status: DRAFT_

## Goal

Allow unauthenticated (guest) users to browse booking locations and view location detail pages without logging in. Introduce a universal `HeaderNav` component across all portals, retire the `CustomerLayout` sidebar, and add a minimal About page stub. End-to-end verification of the guest booking redirect flow from Phase 10.1 is the final deliverable.

## Context

Phase 10.1 (Booking Flow) is complete. The frontend has: `BrowseLocations` and `LocationDetail` pages with full booking flow logic, the guest redirect on "Reserve" (navigates to `/customer/login?redirect=&slot=`), and `CustomerLayout` with a sidebar carrying logo, navigation links, Settings, and Log Out. Both pages currently live under the `CustomerLayout` auth guard — they require an authenticated customer session. The Phase 10.1 guest redirect path was implemented but marked "not fully testable until Phase 10.2 opens a public route to Location Detail."

The backend is already ready: `GET /api/customer/locations`, `GET /api/customer/locations/:id`, and `GET /api/customer/locations/:id/slots` are all registered on the `publicRouter` within `questreserve-backend/src/api/customer/index.ts` — no `authenticate` or `requireRole` middleware is applied to these three routes. No backend changes are required.

An open TODO from the sessions log captures the product owner's intent for this phase: "Build a top-level header navigation component for the customer portal. The header should have the QuestReserve logo in the upper left. Navigation links should include: About, Browse Adventures, and other relevant links TBD. The sidebar nav would either be retired or restructured once the header nav is in place."

## Scope summary

Three tightly coupled deliverables:

1. **Public routes and guest layout** — `/locations` and `/locations/:id` become accessible without authentication, wrapped in a new `GuestLayout` (or a thin shell). The existing `BrowseLocations` and `LocationDetail` page components are reused as-is.
2. **Universal `HeaderNav` component** — replaces the `CustomerLayout` sidebar; rendered across all portals (guest, customer, provider, admin).
3. **About page stub** — `src/pages/About/About.tsx` registered at `/about` as a public route.

**End-to-end guest booking flow verification** closes the phase.

---

## Steps

### Step 1: Backend verification — confirm public endpoints require no auth

Before any frontend work begins, verify manually that the three public backend endpoints are reachable without an auth token.

Issue `curl` requests (or use a REST client) against the running local backend:

- `GET /api/customer/locations` — expect `200` with location array, no `Authorization` header.
- `GET /api/customer/locations/:id` — expect `200` with a single location object.
- `GET /api/customer/locations/:id/slots` — expect `200` with a slots array.

Confirm that the `publicRouter` in `questreserve-backend/src/api/customer/index.ts` mounts these routes before `protectedRouter` and that no `authenticate` middleware wraps the outer `customerRouter` in `questreserve-backend/src/api/index.ts`.

**Files inspected (no changes expected):**
- `questreserve-backend/src/api/customer/index.ts`
- `questreserve-backend/src/api/index.ts`

**Dependencies:** None. Can be done in parallel with Step 2 planning work.

**Risk:** If the outer `app.ts` or `index.ts` applies a global `authenticate` middleware before the `/customer` router is mounted, the public routes would still be blocked. Verify at the app entry point as well. If a problem is found, the fix is to move the global auth guard to only the protected sub-routers — document the change here before proceeding.

---

### Step 2: Add public routes to the router — `/locations`, `/locations/:id`, and `/about`

Register three new top-level public routes in `src/routes/index.tsx`, outside of any auth-guarded layout. These routes use the existing page components directly and are wrapped in the new `GuestLayout` (created in Step 3). Because Step 3 is a dependency, scaffold the route entries first using a temporary `<div>` wrapper or a placeholder `GuestLayout` import, then replace once Step 3 is complete.

New route entries:

```
/locations          → BrowseLocations  (public, GuestLayout)
/locations/:id      → LocationDetail   (public, GuestLayout)
/about              → About            (public, GuestLayout)
```

**Files changed:**
- `src/routes/index.tsx` — add three route entries; import `GuestLayout` and `About`.

**Dependencies:** Step 3 must be merged (or stubbed) before this step is closed. `About` page is created in Step 4.

**Decision point for product owner:** The existing customer-scoped routes `/customer/locations` and `/customer/locations/:id` remain in the router under `CustomerLayout`. Authenticated customers hitting the old paths continue to work. Internal links within the customer portal (e.g. "Back to Locations" in `LocationDetail`, booking card links in `MyBookings`) should be updated to point to the new `/locations` and `/locations/:id` paths so that all users share a single canonical URL for these pages. Confirm this is the desired behaviour before Step 6 (link update sweep).

---

### Step 3: Create `GuestLayout`

Create `src/layouts/GuestLayout.tsx`. This layout is a minimal shell — it renders `HeaderNav` (Step 5) above the page content with no auth guard.

Structure:

```
<div>
  <HeaderNav />       ← full-width top bar (Step 5)
  <main>
    <Outlet />
  </main>
</div>
```

No redirect logic. No sidebar. No auth context reads beyond what `HeaderNav` itself performs internally.

**Files created:**
- `src/layouts/GuestLayout.tsx`

**Dependencies:** `HeaderNav` (Step 5). Use a placeholder `{/* HeaderNav */}` comment until Step 5 is complete if steps are implemented serially.

---

### Step 4: Create the About page stub

Create `src/pages/About/About.tsx`. This is a minimal stub page — no functional content, just a heading and placeholder body text.

Content requirements:
- Page heading: "About QuestReserve" (using `--font-heading` token, `--foreground` colour).
- One or two sentences of placeholder copy (e.g. "QuestReserve is the booking platform for dungeon raid adventures. More details coming soon.").
- Styled consistently with other portal pages (Obsidian background, surface card, standard spacing).

Register the route in Step 2.

**Files created:**
- `src/pages/About/About.tsx`

**Dependencies:** None — can be done independently of all other steps.

---

### Step 5: Build `HeaderNav`

Create `src/components/HeaderNav/HeaderNav.tsx`. This is the primary deliverable of the phase. The component reads from `AuthContext` to determine which nav links and logo destination to render.

#### Logo behaviour

The logo (`logo-primary-white-gold.svg`, already imported in `CustomerLayout`) is always visible in the upper-left. The logo is wrapped in a `Link` whose `to` destination is context-sensitive:

| Auth state | Logo destination |
|---|---|
| Guest (no token) | `/locations` |
| Authenticated customer | `/customer` |
| Authenticated provider | `/provider` |
| Authenticated admin | `/admin` |

#### Nav links by role

| User | Links |
|---|---|
| Guest | Browse Adventures (→ `/locations`), About (→ `/about`), Login (→ `/login`) |
| Customer | Browse Adventures (→ `/locations`), About (→ `/about`), My Bookings (→ `/customer/bookings`), Settings (→ `/customer/settings`), Log Out |
| Provider | About (→ `/about`), Dashboard (→ `/provider`), Log Out |
| Admin | About (→ `/about`), Dashboard (→ `/admin`), Log Out |

"Log Out" is a button that calls `AuthContext.logout` and then navigates to `/login`.

#### Styling

- Full-width horizontal bar pinned to the top of the viewport.
- Obsidian (`--background`) background, consistent with the existing sidebar.
- Logo at `height: 40px` (same as current sidebar value).
- Nav links use `--foreground` colour at rest, `--accent` on active/hover — same token pattern as the current sidebar `NavLink` styles.
- Use `NavLink` from `react-router-dom` for links that support active state.
- No mobile hamburger menu in this phase — horizontal overflow is acceptable for MVP.

#### Implementation notes

- Read `token` and `role` from `useAuth()`. If `!token`, treat as guest. If `token` and `role === 'customer'`, render customer links. Etc.
- The `logout` function and navigation to `/login` after logout are already available from `useAuth()` (see `CustomerLayout` for the existing pattern).
- Logo asset: `import logoLockup from '@/assets/logo-primary-white-gold.svg'` — same import already used in `CustomerLayout`.

**Files created:**
- `src/components/HeaderNav/HeaderNav.tsx`

**Dependencies:** `AuthContext` (already exists). Step 5 is a prerequisite for Steps 3, 7, 8, and 9.

---

### Step 6: Retire the `CustomerLayout` sidebar — refactor to auth-guarded shell

Replace the sidebar `<nav>` in `CustomerLayout.tsx` with a call to `HeaderNav`. The layout becomes a thin auth guard that renders `HeaderNav` above the outlet.

Before:
```
<div className="flex min-h-screen">
  <nav className="flex w-56 ..."> ... </nav>
  <div className="flex-1" style={{ backgroundColor: 'rgb(var(--surface))' }}>
    <Outlet />
  </div>
</div>
```

After:
```
<div>
  <HeaderNav />
  <div style={{ backgroundColor: 'rgb(var(--surface))' }}>
    <Outlet />
  </div>
</div>
```

The auth guard logic (`if (isLoading) return null`, `if (!token || role === null) return <Navigate …>`, `if (role !== 'customer') return <Navigate …>`) is preserved unchanged.

The logo import in `CustomerLayout.tsx` is removed — `HeaderNav` owns the logo.

**Files changed:**
- `src/layouts/CustomerLayout.tsx`

**Dependencies:** Step 5 (`HeaderNav` must exist).

---

### Step 7: Wire `HeaderNav` into `ProviderLayout` and `AdminLayout`

Add `HeaderNav` to `ProviderLayout` and `AdminLayout`. These layouts currently return `<Outlet />` directly with no wrapping shell. Wrap them to include `HeaderNav` above the outlet.

`ProviderLayout` after:
```
<div>
  <HeaderNav />
  <Outlet />
</div>
```

`AdminLayout` after:
```
<div>
  <HeaderNav />
  <Outlet />
</div>
```

Auth guard logic is preserved unchanged in both. No sidebar is added — provider and admin sidebars are deferred to Phases 11 and 12 respectively.

**Files changed:**
- `src/layouts/ProviderLayout.tsx`
- `src/layouts/AdminLayout.tsx`

**Dependencies:** Step 5 (`HeaderNav` must exist).

---

### Step 8: Internal link audit — update hardcoded `/customer/locations` paths

Now that `/locations` and `/locations/:id` are the canonical public paths, update all internal links that previously pointed at the customer-scoped paths. The goal is consistency: every part of the app should navigate to the shared public pages, not the now-redundant customer-scoped copies.

Known locations to update:

- `src/pages/BrowseLocations/BrowseLocations.tsx` — card `Link` targets `to={'/customer/locations/${location.id}'}` → update to `to={'/locations/${location.id}'}`.
- `src/pages/LocationDetail/LocationDetail.tsx` — "Back to Locations" link at `/customer/locations` → update to `/locations`. Guest redirect on Reserve also uses `/customer/locations/:id` as the `redirect` param — update to `/locations/:id`.
- `src/pages/MyBookings/MyBookings.tsx` — booking card links to `/customer/locations/:booking_location_id` → update to `/locations/:booking_location_id`.
- `src/pages/CustomerHome.tsx` — any links to `/customer/locations` in the booking summary → update to `/locations`.

Search for any remaining `/customer/locations` strings in `src/` to catch stragglers.

The `/customer/locations` and `/customer/locations/:id` routes in the router may be left in place for this phase as redirect aliases (they do no harm under `CustomerLayout`), or removed if the product owner prefers a clean cut. Flag this as a decision — see Risks section.

**Files changed:**
- `src/pages/BrowseLocations/BrowseLocations.tsx`
- `src/pages/LocationDetail/LocationDetail.tsx`
- `src/pages/MyBookings/MyBookings.tsx`
- `src/pages/CustomerHome.tsx` (if applicable)

**Dependencies:** Steps 2 and 3 (public routes must exist before internal links point to them).

---

### Step 9: Guest booking redirect flow — end-to-end verification

Verify the complete guest → login → return flow implemented in Phase 10.1, which was deferred for testability until this phase opened a public Location Detail route.

**Test path:**

1. Open `/locations` as an unauthenticated user — confirm Browse Locations renders with no auth prompt.
2. Click a location card — confirm `/locations/:id` loads with location detail and available slots.
3. Click "Reserve" on a time slot — confirm redirect fires to `/customer/login?redirect=/locations/:id&slot=:slotId`.
4. Log in as a customer — confirm post-login navigation returns to `/locations/:id` with the slot pre-selected and the confirmation step active.
5. Confirm the booking — confirm redirect to `/customer/payment` with location name and slot times in route state.
6. Verify that `HeaderNav` renders correctly on `/locations`, `/locations/:id`, `/about`, `/customer/*`, `/provider`, and `/admin` in all auth states.

No source code changes are expected in this step. Any failures discovered must be investigated and fixed — document them as defects and resolve before closing the phase.

**Dependencies:** All previous steps must be complete.

---

## Notes

- **Step order:** Steps 1 and 4 are fully independent and can proceed in parallel. Step 5 (`HeaderNav`) is the critical-path dependency — Steps 3, 6, 7, and 9 all block on it. Step 8 blocks on Step 2. The recommended sequence is: 1 → 4 → 5 → 2 → 3 → 6 → 7 → 8 → 9.
- **Backend is already public:** All three location endpoints (`/api/customer/locations`, `/api/customer/locations/:id`, `/api/customer/locations/:id/slots`) are on the `publicRouter` in the backend. No backend changes are needed unless Step 1 verification reveals an unexpected global auth guard at the app level.
- **`BrowseLocations` and `LocationDetail` are reused as-is:** The page components themselves have no auth-specific logic that would break under a public route. `LocationDetail` already reads `AuthContext.token` for the Reserve action — it works correctly for both guests and authenticated users. No page component changes are required beyond the internal link updates in Step 8.
- **Logo asset:** `logo-primary-white-gold.svg` is the single asset in `src/assets/` (alongside `react.svg`). `HeaderNav` imports it the same way `CustomerLayout` currently does.
- **`CustomerLayout` sidebar nav items mapped to `HeaderNav`:** The existing sidebar has: Dashboard (→ `/customer`), Locations (→ `/customer/locations`), My Bookings (→ `/customer/bookings`), Settings (→ `/customer/settings`), Log Out. In `HeaderNav` the customer links become: Browse Adventures (→ `/locations`), About (→ `/about`), My Bookings (→ `/customer/bookings`), Settings (→ `/customer/settings`), Log Out. Dashboard is omitted from the top nav — the logo click serves as the dashboard home link for authenticated users. This is consistent with common SaaS header patterns.
- **No mobile responsive nav in this phase:** A hamburger/drawer menu is Post-MVP. A horizontal nav bar with possible overflow is acceptable for MVP screen sizes.
- **`/customer/locations` route retention:** The existing `/customer/locations` and `/customer/locations/:id` routes under `CustomerLayout` could be kept as convenience aliases or removed to avoid route duplication. Recommend keeping them temporarily in this phase and removing them in Phase 10.3 once filtering work confirms all entry points have been updated — see Risks.
- **Phase 10.3 dependency:** The filtering work in Phase 10.3 (Browse Locations filter UI) applies to the same `BrowseLocations` page. This phase leaves the page structure unchanged; Phase 10.3 adds the filter controls on top of it.

---

## Risks and decisions to flag

1. **Global auth middleware at app level (Step 1).** The backend `src/api/customer/index.ts` correctly places location endpoints on `publicRouter`. However, if `app.ts` or the main Express entry point wraps the entire `/api/customer` prefix in an `authenticate` call, the public routes would still require auth. Step 1 must confirm this is not the case. Probability: low based on code read, but verify explicitly.

2. **Duplicate routes: `/customer/locations` vs `/locations`.** After this phase there will be two paths to `BrowseLocations` (under `CustomerLayout` and under `GuestLayout`). This is intentional short-term, but creates a risk that future work (e.g. Phase 10.3 filter state, deep-linking) diverges between them. Product owner should decide whether to remove the `/customer/locations` alias in this phase or Phase 10.3. Recommendation: keep both in 10.2, remove the old paths in 10.3.

3. **`CustomerLogin` redirect destination after login.** The Phase 10.1 guest redirect sends the user to `/customer/login?redirect=/locations/:id&slot=:slotId`. After this phase, the redirect target is `/locations/:id` (a public route). `CustomerLogin` reads the `redirect` param and navigates there post-login. Verify that `CustomerLogin`'s post-login `navigate(redirect)` call works for a path outside the `/customer` prefix — this should work without change since `useNavigate` is not constrained to a prefix, but confirm in Step 9.

4. **`HeaderNav` height and layout shift.** Adding a persistent top bar changes the visual layout for all portals. Customer pages currently fill the full viewport height alongside the sidebar; after the switch to a top bar, page content will sit below the header. Verify that the `CustomerHome`, `BrowseLocations`, `LocationDetail`, `MyBookings`, and `CustomerSettings` pages do not have height-dependent styles that break under the new layout. Minor spacing adjustments may be needed.

5. **Provider and admin portal disruption.** `ProviderLayout` and `AdminLayout` currently return a bare `<Outlet />`. Adding `HeaderNav` above them is low-risk but introduces a visible change to those portals without prior design work for those views. Since provider and admin portal content is currently a single stub home page each, this is acceptable for MVP. Flag to the product owner that provider and admin nav will be visually incomplete until Phases 11 and 12.
