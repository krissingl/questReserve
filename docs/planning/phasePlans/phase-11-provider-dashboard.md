# Phase 11: Frontend — Provider Dashboard

_Created: 2026-05-17 | Status: DRAFT_

## Goal

Build a fully functional provider dashboard where an authenticated Provider can create and manage their BookingLocations and TimeSlots, upload a cover image for each location, and view the upcoming bookings across all of their locations.

## Context

Phase 10.4 (Location Images & Browse UI Redesign) delivered the backend image upload endpoint (`POST /api/provider/locations/:id/image`, multipart, returns `{ image_url }`) and declared it stable for Phase 11 to consume. The Phase 4 backend established the complete provider API surface:

- `POST /api/provider/locations` — create a location
- `GET /api/provider/locations` — list provider's locations
- `GET /api/provider/locations/:id` — single location
- `PATCH /api/provider/locations/:id` — update a location
- `POST /api/provider/locations/:locationId/slots` — create a time slot
- `GET /api/provider/locations/:locationId/slots` — list slots for a location
- `PATCH /api/provider/slots/:id` — update a time slot
- `DELETE /api/provider/slots/:id` — delete a time slot
- `GET /api/provider/bookings` — provider's upcoming bookings (read-only)
- `POST /api/provider/locations/:id/image` — upload cover image (Phase 10.4)

The frontend has `ProviderLayout` (established in Phase 8) with protected routes requiring a Provider JWT. The `api / hooks / components / pages` pattern is established by Phases 8–10. No provider-facing pages exist yet beyond the login/register forms from Phase 9. The shared Axios client in `src/api/client.ts` attaches the auth token automatically.

Revenue reporting (US-DO-07) is deferred — no payment schema exists. Analytics (US-DO-09) are Post-MVP. This phase delivers location management, time slot management, image upload, and the booking view only.

---

## Steps

### Step 1: Create the provider API module

Create `questreserve-frontend/src/api/provider.api.ts` as the single source of all HTTP calls made from the provider dashboard. This file must not be shared with the customer API module — provider and customer API surfaces are intentionally separate.

Initial exports:

**Locations**
- `getMyLocations()` → `GET /api/provider/locations`
- `getMyLocationById(id: number)` → `GET /api/provider/locations/:id`
- `createLocation(data: CreateLocationPayload)` → `POST /api/provider/locations`
- `updateLocation(id: number, data: UpdateLocationPayload)` → `PATCH /api/provider/locations/:id`
- `uploadLocationImage(id: number, file: File)` → `POST /api/provider/locations/:id/image` (multipart/form-data)

**Time Slots**
- `getSlotsByLocation(locationId: number)` → `GET /api/provider/locations/:locationId/slots`
- `createSlot(locationId: number, data: CreateSlotPayload)` → `POST /api/provider/locations/:locationId/slots`
- `updateSlot(slotId: number, data: UpdateSlotPayload)` → `PATCH /api/provider/slots/:id`
- `deleteSlot(slotId: number)` → `DELETE /api/provider/slots/:id`

**Bookings**
- `getMyBookings()` → `GET /api/provider/bookings`

All payload types (`CreateLocationPayload`, `UpdateLocationPayload`, `CreateSlotPayload`, `UpdateSlotPayload`) must be explicitly typed — no `any`. Domain response types (`BookingLocation`, `TimeSlot`, `Booking`) must match the spec's domain model. The `uploadLocationImage` function must build a `FormData` object and set the `Content-Type` header to `multipart/form-data`.

**Files created:**
- `questreserve-frontend/src/api/provider.api.ts`

---

### Step 2: Define custom hooks for provider data fetching

Create hooks in `questreserve-frontend/src/hooks/` that wrap the `provider.api.ts` calls with loading and error state, following the same `{ data, isLoading, error }` pattern established by `useBookingLocations` and `useMyBookings` in Phase 10.

Hooks to create:
- `useMyLocations()` — calls `getMyLocations`, returns `{ data, isLoading, error }`
- `useMyLocation(id: number)` — calls `getMyLocationById`, returns `{ data, isLoading, error }`
- `useSlotsByLocation(locationId: number)` — calls `getSlotsByLocation`, returns `{ data, isLoading, error }`
- `useMyProviderBookings()` — calls `getMyBookings`, returns `{ data, isLoading, error }`

Mutation operations (create, update, delete, image upload) do not need dedicated hooks — they are called directly from form submit handlers in the page components. Each hook manages its own `useState`/`useEffect` cycle. No external data-fetching library is introduced.

**Files created:**
- `questreserve-frontend/src/hooks/useMyLocations.ts`
- `questreserve-frontend/src/hooks/useMyLocation.ts`
- `questreserve-frontend/src/hooks/useSlotsByLocation.ts`
- `questreserve-frontend/src/hooks/useMyProviderBookings.ts`

---

### Step 3: Build the Provider Dashboard home page

Create `questreserve-frontend/src/pages/ProviderDashboard/ProviderDashboard.tsx`, rendered at `/provider/dashboard` within `ProviderLayout`. This is the landing page after provider login.

The page must:
- Call `useMyLocations` and display a summary list of the provider's BookingLocations. Each entry shows: location name, difficulty badge, and a "Manage" link to `/provider/locations/:id`.
- Show an "Add Location" button that navigates to `/provider/locations/new`.
- Show a loading state while `isLoading` is `true`.
- Show an empty state (e.g. "You haven't added any dungeon locations yet") if the list is empty.
- Show an error state if the fetch fails.
- Apply design tokens consistent with the Phase 7/8 design system (Obsidian background, surface cards, Spell Gold accents, Cinzel for headings).

**Files created:**
- `questreserve-frontend/src/pages/ProviderDashboard/ProviderDashboard.tsx`

---

### Step 4: Build the Location Form (create and edit)

Create a reusable `LocationForm` component used by both the create and edit flows. The form covers all user-editable `BookingLocation` fields defined in the spec: name, description, difficulty (select: `EASY`, `MEDIUM`, `HARD`, `LEGENDARY`), and cancellation policy (textarea).

On submit, the form calls the relevant `provider.api.ts` function (`createLocation` or `updateLocation`) and redirects to `/provider/locations/:id` on success. Inline validation errors must render per-field (Zod schema validation on submit is acceptable; no real-time validation required in this phase).

Create two pages that use `LocationForm`:

- `ProviderLocationNew` at `/provider/locations/new` — initialises the form empty, calls `createLocation` on submit.
- `ProviderLocationEdit` at `/provider/locations/:id/edit` — calls `useMyLocation(id)` to populate initial values, calls `updateLocation` on submit.

Both pages live within `ProviderLayout` and are protected by the Provider auth guard.

**Files created:**
- `questreserve-frontend/src/components/LocationForm/LocationForm.tsx`
- `questreserve-frontend/src/pages/ProviderLocationNew/ProviderLocationNew.tsx`
- `questreserve-frontend/src/pages/ProviderLocationEdit/ProviderLocationEdit.tsx`

---

### Step 5: Build the Location Detail page (provider view)

Create `questreserve-frontend/src/pages/ProviderLocationDetail/ProviderLocationDetail.tsx`, rendered at `/provider/locations/:id` within `ProviderLayout`.

The page must:
- Call `useMyLocation(id)` and display the full location record: name, description, difficulty, cancellation policy, and cover image (if `image_url` is non-null, using the same 16:9 `object-fit: cover` pattern established in Phase 10.4; if null, show a styled placeholder).
- Provide an "Edit Location" link to `/provider/locations/:id/edit`.
- Provide an image upload section: a file input (`accept="image/jpeg,image/png,image/webp"`) and an "Upload Cover Image" button. On submit, call `uploadLocationImage(id, file)` from `provider.api.ts`. On success, refetch or locally update the displayed `image_url`. Show an inline error message if the upload fails (including the `400`/`403` cases from the backend).
- Include a "Time Slots" section below the location details — rendered by the `TimeSlotManager` component introduced in Step 6 (pass `locationId` as a prop).
- Include a back link to `/provider/dashboard`.

**Files created:**
- `questreserve-frontend/src/pages/ProviderLocationDetail/ProviderLocationDetail.tsx`

---

### Step 6: Build the TimeSlot Manager component

Create `questreserve-frontend/src/components/TimeSlotManager/TimeSlotManager.tsx`. This component is embedded inside `ProviderLocationDetail` (Step 5) and is responsible for the full TimeSlot management lifecycle for a single location.

Props: `locationId: number`

The component must:
- Call `useSlotsByLocation(locationId)` and render the list of existing time slots. Each entry shows: start time, end time, and a "Delete" button.
- Provide an inline "Add Time Slot" form with two datetime-local inputs (`start_time`, `end_time`). On submit, call `createSlot(locationId, data)`. On success, refetch or append the new slot to the list.
- Each slot's "Delete" button calls `deleteSlot(slotId)` with a confirmation prompt (native `window.confirm` is acceptable — a modal is not required in this phase). On success, remove the slot from the list.
- Show a loading state while `isLoading` is `true`.
- Show an empty state if no slots exist for the location.
- Show an inline error message if any operation fails.

Time slot editing (`PATCH /api/provider/slots/:id`) is not required in this phase — add and delete are sufficient for MVP. Deferring edit reduces UI complexity; providers can delete and recreate a slot to change its time.

**Files created:**
- `questreserve-frontend/src/components/TimeSlotManager/TimeSlotManager.tsx`

---

### Step 7: Build the Provider Bookings page

Create `questreserve-frontend/src/pages/ProviderBookings/ProviderBookings.tsx`, rendered at `/provider/bookings` within `ProviderLayout`.

The page must:
- Call `useMyProviderBookings` and render a list of bookings across all of the provider's locations. Each entry shows: location name, time slot start/end time, booking status (`BOOKED` or `CANCELLED`), and — if available from the API response — the end user's name or identifier.
- Show a loading state while `isLoading` is `true`.
- Show an empty state if there are no bookings.
- Show an error state if the fetch fails.
- Apply design tokens consistent with the Phase 7/8 design system.
- No provider-side booking management actions (approve, cancel on behalf of customer) are in scope for this phase. This page is read-only.

**Files created:**
- `questreserve-frontend/src/pages/ProviderBookings/ProviderBookings.tsx`

---

### Step 8: Register provider dashboard routes

Update `questreserve-frontend/src/routes/` to register all new provider dashboard routes inside the existing `ProviderLayout` route guard:

- `/provider/dashboard` → `ProviderDashboard`
- `/provider/locations/new` → `ProviderLocationNew`
- `/provider/locations/:id` → `ProviderLocationDetail`
- `/provider/locations/:id/edit` → `ProviderLocationEdit`
- `/provider/bookings` → `ProviderBookings`

Verify that all routes are protected by the `ProviderLayout` auth guard — unauthenticated access redirects to `/login` (or `/provider/login`). Confirm that the Provider login redirect destination is `/provider/dashboard` and update the post-login redirect in `ProviderLogin` if it currently points elsewhere.

**Files changed:**
- `questreserve-frontend/src/routes/` (route registration file)
- `questreserve-frontend/src/pages/ProviderLogin/ProviderLogin.tsx` (update redirect target if needed)

---

### Step 9: Provider dashboard navigation

Update `ProviderLayout` to include a navigation bar or sidebar with links to the dashboard sections:

- My Locations (`/provider/dashboard`)
- My Bookings (`/provider/bookings`)
- Logout action (calls `AuthContext.logout` and redirects to `/login`)

Apply design tokens: Obsidian background for the nav, Spell Gold for active/hover link states, Cinzel for any nav heading. The nav must be visible on all provider dashboard pages without per-page implementation. Confirm `ProviderLayout` applies the same auth guard pattern used by `CustomerLayout`.

**Files changed:**
- `questreserve-frontend/src/layouts/ProviderLayout/ProviderLayout.tsx`

---

### Step 10: End-to-end verification

Verify the full provider dashboard flow against a running backend with seeded data. No new source code is written in this step. Any failures discovered must be fixed before the phase is closed.

**Test path:**

1. Log in as a provider — confirm redirect to `/provider/dashboard`. Confirm the location list renders seeded locations.
2. Click "Add Location" — confirm the create form renders. Fill all fields and submit — confirm the new location appears on the dashboard.
3. Click "Manage" on a location — confirm the detail page renders with name, description, difficulty, cancellation policy, and cover image (or placeholder).
4. Click "Edit Location" — confirm the edit form is pre-populated with existing values. Update a field and submit — confirm the updated value is reflected on the detail page.
5. In the Time Slots section, add a new time slot — confirm it appears in the list. Delete it — confirm it is removed after the confirmation prompt.
6. Upload a cover image via the file input on the detail page — confirm the image renders at 16:9. Attempt to upload a non-image file — confirm an inline error is shown.
7. Navigate to My Bookings (`/provider/bookings`) — confirm bookings from seeded data are listed with location name, time range, and status.
8. Log out — confirm redirect to `/login` and that navigating back to `/provider/dashboard` redirects to the provider login rather than rendering the page.
9. Confirm that all provider routes return a redirect for unauthenticated requests (no flash of content).

---

## Notes

- **Revenue reporting is deferred.** US-DO-07 and US-DO-09 require a payment schema that does not exist. The "Provider Revenue & Analytics Dashboard" stretch goal in `mvp-implementation-phases.md` explicitly blocks this on payment model introduction. No revenue figures, earnings summaries, or occupancy trends are shown in this phase.
- **Time slot editing is deferred.** `PATCH /api/provider/slots/:id` exists on the backend but a slot edit form is not built in this phase. Delete-and-recreate is the MVP workflow. A slot edit UI can be added in a follow-up phase without structural changes.
- **Image upload UI is built here, not in Phase 10.4.** Phase 10.4 delivered the backend endpoint and explicitly deferred the frontend upload form to Phase 11. The endpoint contract (`POST /api/provider/locations/:id/image`, multipart, `{ image_url }` response) is considered stable.
- **`LocationForm` is provider-only.** It is not shared with the customer portal and is not placed in a shared `components/` directory unless the codebase already has a convention for cross-domain components. Keep it under a provider-scoped path.
- **`TimeSlotManager` is a self-contained component.** It manages its own data fetching via `useSlotsByLocation` and its own mutation calls. `ProviderLocationDetail` passes only `locationId` — it does not own the slot state.
- **Post-login redirect.** The provider login page (Phase 9) may redirect to a stub route. Step 8 must confirm the redirect lands on `/provider/dashboard` after this phase's routes are registered.
- **Step sequence.** Steps 1 → 2 (hooks depend on API module) → 3/4/5/7 (pages can be built in parallel once hooks exist) → 6 (TimeSlotManager used by Step 5's page; can be built in parallel with other pages) → 8 → 9 → 10. Steps 3–7 are all unblocked once Steps 1 and 2 are complete.
- **Phase 12 dependency.** The `AdminLayout` and admin panel routes (Phase 12) are structurally parallel to this phase. No cross-phase dependencies exist between Phase 11 and Phase 12.
