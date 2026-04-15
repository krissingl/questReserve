# Ticket Plan: Phase 10 — Customer Portal

**Purpose:** Resolve five Phase 9 carry-over defects, build the customer API and data hooks, and deliver the three core customer portal pages (Browse Locations, Location Detail, My Bookings).
**Total tickets:** 13
**Prefix:** P10:
**Status: LOCKED**

---

## Ticket 1 of 13

**Title:** P10: Remove default Vite favicon

**Description:**
The default Vite/React favicon is still present in `questreserve-frontend/public/`. Remove it and replace it with a blank placeholder or a project-appropriate icon so the browser tab does not display the Vite logo.

**Acceptance Criteria:**
- [ ] The default Vite `favicon.ico` or `favicon.svg` is removed from `public/`
- [ ] A replacement favicon (blank placeholder or project icon) is present in `public/`
- [ ] The browser tab does not display the Vite logo when the app is running
- [ ] No other files in `public/` are modified

---

## Ticket 2 of 13

**Title:** P10: Add password show/hide toggle and confirm-password field to registration forms

**Description:**
Update `CustomerRegister` and `ProviderRegister` to add a show/hide password toggle (eye icon button switching `input type` between `password` and `text`) and a confirm-password field with a Zod refinement enforcing `password === confirmPassword`. Inline validation error renders below the confirm field. Shared logic may be extracted if both pages use it.

**Acceptance Criteria:**
- [ ] Both `CustomerRegister` and `ProviderRegister` have a show/hide password toggle on the password field
- [ ] Clicking the toggle switches `input type` between `password` and `text`
- [ ] Both forms include a confirm-password field
- [ ] The Zod schema for each form includes a refinement that rejects submissions where `confirmPassword !== password`
- [ ] An inline validation error renders below the confirm-password field when the passwords do not match
- [ ] `npm run lint` and `npm run build` pass with zero errors

---

## Ticket 3 of 13

**Title:** P10: Fix AlreadyAuthRedirect blocking cross-role navigation

**Description:**
`AlreadyAuthRedirect` currently redirects any authenticated user away from all public auth pages, including those belonging to a different role. Fix the guard so it only blocks access to the login/register page that matches the currently authenticated role, allowing a logged-in Customer to reach `/provider/login` and vice versa.

**Acceptance Criteria:**
- [ ] A logged-in Customer can navigate to `/provider/login` without being redirected away
- [ ] A logged-in Provider can navigate to `/customer/login` without being redirected away
- [ ] A logged-in Customer navigating to `/customer/login` is still redirected to `/customer`
- [ ] A logged-in Provider navigating to `/provider/login` is still redirected to `/provider`
- [ ] Unauthenticated users are unaffected — all auth pages remain accessible
- [ ] `npm run lint` and `npm run build` pass with zero errors

---

## Ticket 4 of 13

**Title:** P10: Clear session on cross-role auth link click

**Description:**
When a user navigates from one role's auth page to another role's login or register page, any existing auth session must be cleared before the destination page loads. Implement a utility or navigation helper invoked at link-click time that resets `AuthContext` state and clears `localStorage`, ensuring the destination auth page starts with a clean state.

**Acceptance Criteria:**
- [ ] Clicking a link from `/customer/login` to `/provider/login` (or any cross-role auth navigation) clears `AuthContext` user, token, and role
- [ ] `localStorage` auth data is cleared before the destination page renders
- [ ] The destination auth page initialises with no pre-filled or carried-over auth state
- [ ] The session clear utility is invoked at link-click time, not on the destination page mount
- [ ] Same-role navigation (e.g. Customer login to Customer register) is unaffected
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 3 issue number> — AlreadyAuthRedirect fix must be in place before cross-role navigation can be tested end-to-end

---

## Ticket 5 of 13

**Title:** P10: Fix login landing page button labels

**Description:**
Update the `/login` landing page so that button and link labels clearly communicate their destination (e.g. "Log in as a Customer", "Log in as a Provider"). Apply any other minor copy or layout corrections identified during Phase 9 review. No structural changes to the route or component tree are made in this ticket.

**Acceptance Criteria:**
- [ ] The `/login` landing page has distinct labels that unambiguously identify each destination role (Customer vs. Provider)
- [ ] No button or link label is generic or misleading (e.g. "Login", "Click here")
- [ ] Any additional copy or layout corrections from Phase 9 review are applied
- [ ] The route `/login` and the component tree are unchanged
- [ ] `npm run lint` and `npm run build` pass with zero errors

---

## Ticket 6 of 13

**Title:** P10: Create the customer API module

**Description:**
Create `questreserve-frontend/src/api/customer.api.ts` as the single source of all HTTP calls from the customer portal. Export `getBookingLocations`, `getBookingLocationById`, and `getMyBookings`, each explicitly typed using the `BookingLocation` and `Booking` domain types from the spec. All calls use the shared `client.ts` Axios instance.

**Acceptance Criteria:**
- [ ] `customer.api.ts` exists at `questreserve-frontend/src/api/customer.api.ts`
- [ ] `getBookingLocations(filters?: { difficulty?: string })` calls `GET /api/booking-locations`
- [ ] `getBookingLocationById(id: number)` calls `GET /api/booking-locations/:id`
- [ ] `getMyBookings()` calls `GET /api/end-user/bookings` and uses the shared `client.ts` Axios instance (auth token is attached automatically)
- [ ] All return types are explicitly typed using `BookingLocation` and `Booking` domain types — no `any`
- [ ] No direct `axios` imports appear in `customer.api.ts`
- [ ] `npm run lint` and `npm run build` pass with zero errors

---

## Ticket 7 of 13

**Title:** P10: Define custom hooks for customer data fetching

**Description:**
Create three custom React hooks in `questreserve-frontend/src/hooks/` that wrap the `customer.api.ts` calls with `useState`/`useEffect`-based loading and error state: `useBookingLocations`, `useBookingLocation`, and `useMyBookings`. No external data-fetching library is introduced.

**Acceptance Criteria:**
- [ ] `useBookingLocations(filters?)` calls `getBookingLocations` and returns `{ data, isLoading, error }`
- [ ] `useBookingLocation(id)` calls `getBookingLocationById` and returns `{ data, isLoading, error }`
- [ ] `useMyBookings()` calls `getMyBookings` and returns `{ data, isLoading, error }`
- [ ] Each hook manages its own `useState`/`useEffect` cycle — no external library (`react-query`, `swr`, etc.) is used
- [ ] `isLoading` is `true` while the request is in flight and `false` after it resolves or rejects
- [ ] `error` is populated on a failed request; `data` is `null` or `undefined` in that case
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 6 issue number> — customer API module must exist before hooks can import from it

---

## Ticket 8 of 13

**Title:** P10: Build the Browse Locations page

**Description:**
Create `src/pages/BrowseLocations/BrowseLocations.tsx`, rendered at `/customer/locations` within `CustomerLayout`. The page calls `useBookingLocations` and renders a list of `BookingLocation` cards (name, difficulty badge, description excerpt) with loading and error states. Each card links to `/customer/locations/:id`.

**Acceptance Criteria:**
- [ ] `BrowseLocations.tsx` exists and renders at `/customer/locations`
- [ ] The page calls `useBookingLocations` and renders a card per returned `BookingLocation`
- [ ] Each card displays: location name, difficulty badge, and a description excerpt
- [ ] Each card links to `/customer/locations/:id` with the correct `id`
- [ ] A loading state is shown while `isLoading` is `true`
- [ ] An error state is shown if the fetch fails
- [ ] Cards use `bg-surface` background; location names use `font-heading`; difficulty badge uses `--primary` or a difficulty-specific colour consistent with Phase 7/8 design tokens
- [ ] No difficulty filter UI is present (deferred)
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 7 issue number> — `useBookingLocations` hook must exist

---

## Ticket 9 of 13

**Title:** P10: Build the Location Detail page

**Description:**
Create `src/pages/LocationDetail/LocationDetail.tsx`, rendered at `/customer/locations/:id` within `CustomerLayout`. The page reads the `:id` URL param, calls `useBookingLocation(id)`, and displays the location's name, full description, difficulty, and cancellation policy. TimeSlot listing and booking creation are deferred.

**Acceptance Criteria:**
- [ ] `LocationDetail.tsx` exists and renders at `/customer/locations/:id`
- [ ] The `:id` param is read from the URL and passed to `useBookingLocation`
- [ ] The page displays: location name, full description, difficulty, and cancellation policy
- [ ] A loading state is shown while `isLoading` is `true`
- [ ] An error state is shown if the fetch fails, including when the location is not found (404)
- [ ] A back link to `/customer/locations` is present
- [ ] No TimeSlot listing or booking creation UI is present (deferred)
- [ ] Design tokens are consistent with Phase 7/8 conventions
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 7 issue number> — `useBookingLocation` hook must exist

---

## Ticket 10 of 13

**Title:** P10: Build the My Bookings page

**Description:**
Create `src/pages/MyBookings/MyBookings.tsx`, rendered at `/customer/bookings` within `CustomerLayout`. The page calls `useMyBookings` and renders the authenticated user's bookings (location name, time slot start/end time, booking status) with loading, empty, and error states. Booking cancellation is deferred.

**Acceptance Criteria:**
- [ ] `MyBookings.tsx` exists and renders at `/customer/bookings`
- [ ] The page calls `useMyBookings` and renders a row or card per booking
- [ ] Each booking entry displays: location name, time slot start time, time slot end time, and booking status (`BOOKED` or `CANCELLED`)
- [ ] A loading state is shown while `isLoading` is `true`
- [ ] An empty state is shown when the user has no bookings
- [ ] An error state is shown if the fetch fails
- [ ] No booking cancellation UI is present (deferred)
- [ ] Design tokens are consistent with Phase 7/8 conventions
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 7 issue number> — `useMyBookings` hook must exist

---

## Ticket 11 of 13

**Title:** P10: Register customer portal routes

**Description:**
Update `src/routes/` to register the three new customer portal routes inside the existing `CustomerLayout` route guard: `/customer/locations`, `/customer/locations/:id`, and `/customer/bookings`. Verify that unauthenticated access to any of these routes redirects to `/login`.

**Acceptance Criteria:**
- [ ] `/customer/locations` renders `BrowseLocations` and is protected by the `CustomerLayout` auth guard
- [ ] `/customer/locations/:id` renders `LocationDetail` and is protected by the `CustomerLayout` auth guard
- [ ] `/customer/bookings` renders `MyBookings` and is protected by the `CustomerLayout` auth guard
- [ ] Navigating to any of the three routes while unauthenticated redirects to `/login`
- [ ] Navigating to any of the three routes while authenticated as a customer loads the correct page
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 8 issue number>, #<Ticket 9 issue number>, #<Ticket 10 issue number> — all three page components must exist before routes can be registered

---

## Ticket 12 of 13

**Title:** P10: Add customer portal navigation to CustomerLayout

**Description:**
Update `CustomerLayout` to include a navigation bar or sidebar with links to Locations (`/customer/locations`), My Bookings (`/customer/bookings`), and a logout action that calls `AuthContext.logout` and redirects to `/login`. Apply Phase 7/8 design tokens: Obsidian background, Spell Gold for active/hover link states, Cinzel for any nav heading.

**Acceptance Criteria:**
- [ ] `CustomerLayout` renders a nav bar or sidebar visible on all three portal pages without per-page implementation
- [ ] The nav includes a link to `/customer/locations` labelled "Locations" (or equivalent)
- [ ] The nav includes a link to `/customer/bookings` labelled "My Bookings" (or equivalent)
- [ ] The nav includes a logout action that calls `AuthContext.logout` and redirects to `/login`
- [ ] Nav background uses the Obsidian design token
- [ ] Active and hover link states use the Spell Gold design token
- [ ] Any nav heading uses the Cinzel (`font-heading`) token
- [ ] `npm run lint` and `npm run build` pass with zero errors

**Dependencies:** #<Ticket 11 issue number> — routes must be registered before nav links can be verified end-to-end

---

## Ticket 13 of 13

**Title:** P10: End-to-end smoke test of the customer portal

**Description:**
Verify the full customer portal flow against a running backend. No new source code is written in this step. Any failures discovered must be fixed before this ticket is closed.

**Acceptance Criteria:**
- [ ] An authenticated customer can navigate to `/customer/locations` and sees a list of `BookingLocation` cards
- [ ] Clicking a location card navigates to `/customer/locations/:id` and displays the correct location details
- [ ] The back link on the Location Detail page returns the user to `/customer/locations`
- [ ] An authenticated customer can navigate to `/customer/bookings` and sees their bookings (or an empty state if none exist)
- [ ] Unauthenticated access to `/customer/locations`, `/customer/locations/:id`, and `/customer/bookings` redirects to `/login`
- [ ] The customer nav bar is visible on all three portal pages
- [ ] The logout action clears auth state and redirects to `/login`
- [ ] A logged-in Customer can reach `/provider/login` without being blocked by `AlreadyAuthRedirect`
- [ ] Cross-role navigation clears the existing session before the destination auth page loads
- [ ] `npm run lint` and `npm run build` both pass with zero errors

**Dependencies:** #<Ticket 12 issue number> — all portal pages, routes, and nav must be complete
