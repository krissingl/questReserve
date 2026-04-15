# Phase 10: Customer Portal

_Created: 2026-04-09 | Status: DRAFT_

## Goal

Deliver a functional customer portal where an authenticated EndUser can browse BookingLocations, view location details, and see their booking history. This phase also closes five carry-over defects and UX gaps from Phase 9 before new portal work begins.

## Context

Phase 9 (Auth Views) is complete. The frontend has: working Customer and Provider login/register flows wired to the real backend auth API, `AuthContext` with `isLoading` hydration state, role-scoped layouts with route guards, and a `/login` landing page. The `CustomerLayout` exists but its portal pages are empty stubs. The backend exposes the booking domain from Phases 4–5: `GET /api/booking-locations`, `GET /api/booking-locations/:id`, and `GET /api/end-user/bookings` (or equivalent endpoints established in Phase 5). Five issues carried over from Phase 9 review must be resolved before portal screens are built.

## Steps

### Step 1: Remove default Vite favicon

Remove the default Vite/React `favicon.ico` (or `favicon.svg`) from `questreserve-frontend/public/`. Replace it with either a blank placeholder or a project-appropriate icon so the browser tab does not display the Vite logo in production. No other changes to `public/` are required in this step.

### Step 2: Password UX improvements on registration forms

Update `CustomerRegister` and `ProviderRegister` pages (built in Phase 9) to add:
1. A show/hide password toggle on the password field — an eye icon button that switches `input type` between `password` and `text`.
2. A confirm-password field with a matching Zod refinement (`password === confirmPassword`). Inline validation error renders below the confirm field.

These changes apply to both registration pages. Shared logic (the toggle hook or the refined schema) may be extracted if both pages use it.

### Step 3: Fix AlreadyAuthRedirect blocking cross-role navigation

`AlreadyAuthRedirect` currently redirects any authenticated user away from public auth pages (e.g. `/provider/login`). This breaks the case where a logged-in Customer wants to switch to a Provider account — they cannot reach `/provider/login`. Fix the guard to allow navigation to a role's own login page from a different role's authenticated session (i.e. only block access to the login page that matches the currently authenticated role, or clear state and allow the navigation).

### Step 4: Clear session on cross-role auth link click

When a user navigates from one role's login page to another role's login or register page (e.g. from `/customer/login` to `/provider/login`), any existing auth session must be cleared before the destination page loads. Implement this as a utility or navigation helper called at link-click time, ensuring `AuthContext` is reset and `localStorage` is cleared so the destination auth page starts with a clean state.

### Step 5: Fix login landing page button labels

The `/login` landing page built in Phase 9 has button or link labels that do not accurately describe the destination. Update the labels to clearly communicate their intent (e.g. "Log in as a Customer", "Log in as a Provider"). Apply any other minor copy or layout corrections identified during Phase 9 review. No structural changes to the route or component tree.

### Step 6: Create the customer API module

Create `questreserve-frontend/src/api/customer.api.ts`. This module is the single source of all HTTP calls made from the customer portal. Initial exports:
- `getBookingLocations(filters?: { difficulty?: string })` → `GET /api/booking-locations`
- `getBookingLocationById(id: number)` → `GET /api/booking-locations/:id`
- `getMyBookings()` → `GET /api/end-user/bookings` (authenticated; uses the shared `client.ts` Axios instance which attaches the auth token)

All return types must be explicitly typed using the domain types from `PROJECT_SPEC.md` (`BookingLocation`, `Booking`). No `any`.

### Step 7: Define custom hooks for customer data fetching

Create custom React hooks in `questreserve-frontend/src/hooks/` that wrap the `customer.api.ts` calls with loading and error state:
- `useBookingLocations(filters?)` — calls `getBookingLocations`, returns `{ data, isLoading, error }`
- `useBookingLocation(id)` — calls `getBookingLocationById`, returns `{ data, isLoading, error }`
- `useMyBookings()` — calls `getMyBookings`, returns `{ data, isLoading, error }`

Each hook manages its own `useState`/`useEffect` cycle. No external data-fetching library is introduced in this phase.

### Step 8: Build the Browse Locations page

Create `src/pages/BrowseLocations/BrowseLocations.tsx`, rendered at `/customer/locations` within `CustomerLayout`. The page must:
- Call `useBookingLocations` and render a list of `BookingLocation` cards showing: name, difficulty badge, and description excerpt.
- Show a loading state while `isLoading` is `true`.
- Show an error state if the fetch fails.
- Each card links to `/customer/locations/:id` (Location Detail page).
- Apply design tokens consistent with Phase 7/8 conventions (`bg-surface` cards, `font-heading` for location names, difficulty badge styled with `--primary` or a difficulty-specific colour).
- Difficulty filter is deferred to a later phase — no filter UI in this step.

### Step 9: Build the Location Detail page

Create `src/pages/LocationDetail/LocationDetail.tsx`, rendered at `/customer/locations/:id` within `CustomerLayout`. The page must:
- Read the `:id` param from the URL and call `useBookingLocation(id)`.
- Display: location name, full description, difficulty, cancellation policy.
- Show a loading state while `isLoading` is `true`.
- Show an error state (including 404) if the fetch fails.
- Include a back link to `/customer/locations`.
- TimeSlot listing and booking creation are deferred to a later phase — no booking UI in this step.
- Apply design tokens consistent with Phase 7/8 conventions.

### Step 10: Build the My Bookings page

Create `src/pages/MyBookings/MyBookings.tsx`, rendered at `/customer/bookings` within `CustomerLayout`. The page must:
- Call `useMyBookings` and render a list of the authenticated EndUser's bookings showing: location name, time slot start/end time, and booking status (`BOOKED` or `CANCELLED`).
- Show a loading state while `isLoading` is `true`.
- Show an empty state if the user has no bookings.
- Show an error state if the fetch fails.
- Booking cancellation is deferred to a later phase — no cancel action in this step.
- Apply design tokens consistent with Phase 7/8 conventions.

### Step 11: Register customer portal routes

Update `src/routes/` to register the three new customer portal routes inside the existing `CustomerLayout` route guard:
- `/customer/locations` → `BrowseLocations`
- `/customer/locations/:id` → `LocationDetail`
- `/customer/bookings` → `MyBookings`

Verify that all three routes are protected by the `CustomerLayout` auth guard (unauthenticated access redirects to `/login`).

### Step 12: Customer portal navigation

Update `CustomerLayout` to include a navigation bar (or sidebar) with links to the three portal pages:
- Locations (`/customer/locations`)
- My Bookings (`/customer/bookings`)
- Logout action (calls `AuthContext.logout` and redirects to `/login`)

Apply design tokens: Obsidian background for the nav, Spell Gold for active/hover link states, Cinzel for any nav heading. The nav must be visible on all three customer portal pages without requiring per-page implementation.

### Step 13: End-to-end smoke test

Verify the full customer portal flow against a running backend. No new source code is written in this step. Any failures discovered must be fixed before this ticket is closed.

## Notes

- **Carry-over items (Steps 1–5):** These are defects and UX gaps identified during Phase 9 review. They must be completed before portal page work begins so the auth base is stable.
- **Backend endpoint names:** The exact endpoint paths for `GET /api/booking-locations` and `GET /api/end-user/bookings` should be confirmed against Phase 5 backend output before Step 6 is implemented.
- **TimeSlot booking and cancellation:** Both are explicitly deferred from this phase. Location Detail (Step 9) and My Bookings (Step 10) deliver read-only views only.
- **Difficulty filter on Browse Locations:** Deferred to a later phase per the spec's MVP feature list ordering. The `getBookingLocations` function accepts an optional filter param to avoid a breaking API change when the filter UI is added.
- **No external data-fetching library:** `react-query`, `swr`, or similar are not introduced in this phase. Custom hooks with `useState`/`useEffect` are sufficient for the three MVP read calls.
- **`AlreadyAuthRedirect` fix (Step 3) and session clear (Step 4):** These two steps are tightly related. Implement Step 3 first; Step 4 builds on the same guard/navigation flow.
