# Ticket Plan: Phase 11 — Frontend Provider Dashboard

**Purpose:** Build the full provider dashboard UI — location management, time slot management, cover image upload, and a read-only bookings view — on top of the stable Phase 4/10.4 backend API surface.
**Total tickets:** 10
**Prefix:** P11:
**Status: LOCKED**

---

## Ticket 1 of 10

**Title:** P11:Create provider API module

**Description:**
Create `questreserve-frontend/src/api/provider.api.ts` as the single source of all HTTP calls made from the provider dashboard. This file must not share functions with the customer API module. Covers all location, time slot, image upload, and bookings endpoints.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/api/provider.api.ts` exists and exports `getMyLocations`, `getMyLocationById`, `createLocation`, `updateLocation`, and `uploadLocationImage`
- [ ] The file exports `getSlotsByLocation`, `createSlot`, `updateSlot`, `deleteSlot`, and `getMyBookings`
- [ ] All payload types (`CreateLocationPayload`, `UpdateLocationPayload`, `CreateSlotPayload`, `UpdateSlotPayload`) are explicitly typed — no `any`
- [ ] `uploadLocationImage` builds a `FormData` object and sets `Content-Type` to `multipart/form-data`
- [ ] Domain response types (`BookingLocation`, `TimeSlot`, `Booking`) match the spec's domain model
- [ ] The shared Axios client from `src/api/client.ts` is used for all calls — no new Axios instance is created
- [ ] No functions from this file are re-exported from or merged into the customer API module

---

## Ticket 2 of 10

**Title:** P11:Define provider data-fetching hooks

**Description:**
Create four hooks in `questreserve-frontend/src/hooks/` that wrap `provider.api.ts` calls with `{ data, isLoading, error }` state, following the same pattern established by `useBookingLocations` and `useMyBookings` in Phase 10. Mutation operations do not get dedicated hooks.

**Acceptance Criteria:**
- [ ] `useMyLocations.ts` exists and returns `{ data: BookingLocation[], isLoading: boolean, error: string | null }`
- [ ] `useMyLocation.ts` accepts an `id: number` parameter and returns `{ data: BookingLocation | null, isLoading: boolean, error: string | null }`
- [ ] `useSlotsByLocation.ts` accepts a `locationId: number` parameter and returns `{ data: TimeSlot[], isLoading: boolean, error: string | null }`
- [ ] `useMyProviderBookings.ts` exists and returns `{ data: Booking[], isLoading: boolean, error: string | null }`
- [ ] Each hook manages its own `useState`/`useEffect` cycle — no external data-fetching library is introduced
- [ ] No TypeScript compilation errors are introduced

**Dependencies:** #— Ticket 1 (hooks call functions from `provider.api.ts`)

---

## Ticket 3 of 10

**Title:** P11:Build Provider Dashboard home page

**Description:**
Create `questreserve-frontend/src/pages/ProviderDashboard/ProviderDashboard.tsx`, rendered at `/provider/dashboard` within `ProviderLayout`. This is the landing page after provider login and displays the provider's location list.

**Acceptance Criteria:**
- [ ] The page calls `useMyLocations` and renders a list of the provider's `BookingLocation` entries
- [ ] Each list entry shows the location name, a difficulty badge, and a "Manage" link to `/provider/locations/:id`
- [ ] An "Add Location" button is present and navigates to `/provider/locations/new`
- [ ] A loading state is rendered while `isLoading` is `true`
- [ ] An empty state (e.g. "You haven't added any dungeon locations yet") renders when the list is empty
- [ ] An error state renders if the fetch fails
- [ ] Design tokens are consistent with the Phase 7/8 design system: Obsidian background, surface cards, Spell Gold accents, Cinzel for headings

**Dependencies:** #— Ticket 2 (page consumes `useMyLocations`)

---

## Ticket 4 of 10

**Title:** P11:Build LocationForm component and create/edit pages

**Description:**
Create a reusable `LocationForm` component covering all user-editable `BookingLocation` fields (name, description, difficulty, cancellation policy). Wire it into two pages: `ProviderLocationNew` at `/provider/locations/new` and `ProviderLocationEdit` at `/provider/locations/:id/edit`.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/components/LocationForm/LocationForm.tsx` exists with fields for name, description, difficulty (select: `EASY`, `MEDIUM`, `HARD`, `LEGENDARY`), and cancellation policy (textarea)
- [ ] Inline per-field validation errors render on submit (Zod schema or equivalent); no real-time validation is required
- [ ] `ProviderLocationNew.tsx` initialises the form empty and calls `createLocation` on submit; on success redirects to `/provider/locations/:id`
- [ ] `ProviderLocationEdit.tsx` calls `useMyLocation(id)` to pre-populate the form and calls `updateLocation` on submit; on success redirects to `/provider/locations/:id`
- [ ] Both pages are rendered within `ProviderLayout` and are protected by the Provider auth guard
- [ ] `LocationForm` is not placed in a shared cross-domain component directory

**Dependencies:** #— Ticket 2 (edit page consumes `useMyLocation`)

---

## Ticket 5 of 10

**Title:** P11:Build Provider Location Detail page

**Description:**
Create `questreserve-frontend/src/pages/ProviderLocationDetail/ProviderLocationDetail.tsx` at `/provider/locations/:id`. The page displays the full location record, an image upload section, a time slot section (delegated to `TimeSlotManager`), and navigation links.

**Acceptance Criteria:**
- [ ] The page calls `useMyLocation(id)` and displays name, description, difficulty, cancellation policy, and cover image
- [ ] When `image_url` is non-null the cover image renders at 16:9 with `object-fit: cover`, consistent with the Phase 10.4 pattern
- [ ] When `image_url` is null a styled layout-stable placeholder renders at the same dimensions
- [ ] An image upload section is present: a file input (`accept="image/jpeg,image/png,image/webp"`) and an "Upload Cover Image" button
- [ ] On upload success, `uploadLocationImage` is called and the displayed `image_url` is updated (refetch or local state update) without a full page reload
- [ ] An inline error message renders if the upload fails, including for `400` and `403` responses from the backend
- [ ] A `TimeSlotManager` component is rendered below the location details and receives `locationId` as its only prop
- [ ] An "Edit Location" link navigates to `/provider/locations/:id/edit`
- [ ] A back link to `/provider/dashboard` is present

**Dependencies:** #— Ticket 2 (consumes `useMyLocation`), #— Ticket 6 (embeds `TimeSlotManager`)

---

## Ticket 6 of 10

**Title:** P11:Build TimeSlotManager component

**Description:**
Create `questreserve-frontend/src/components/TimeSlotManager/TimeSlotManager.tsx`. This self-contained component handles the full add/delete lifecycle for time slots belonging to a single location. It is embedded in `ProviderLocationDetail` via a `locationId` prop.

**Acceptance Criteria:**
- [ ] The component accepts `locationId: number` as its only prop
- [ ] It calls `useSlotsByLocation(locationId)` and renders the list of existing slots, each showing start time, end time, and a "Delete" button
- [ ] An inline "Add Time Slot" form with `datetime-local` inputs for `start_time` and `end_time` is present; on submit it calls `createSlot(locationId, data)` and the new slot appears in the list on success
- [ ] Each "Delete" button calls `deleteSlot(slotId)` after a `window.confirm` prompt; on success the slot is removed from the list
- [ ] A loading state renders while `isLoading` is `true`
- [ ] An empty state renders when no slots exist for the location
- [ ] An inline error message renders if any operation (fetch, create, or delete) fails
- [ ] Time slot editing (`PATCH /api/provider/slots/:id`) is not implemented — the UI offers add and delete only

**Dependencies:** #— Ticket 2 (consumes `useSlotsByLocation`)

---

## Ticket 7 of 10

**Title:** P11:Build Provider Bookings page

**Description:**
Create `questreserve-frontend/src/pages/ProviderBookings/ProviderBookings.tsx` at `/provider/bookings`. This read-only page lists all upcoming bookings across the provider's locations.

**Acceptance Criteria:**
- [ ] The page calls `useMyProviderBookings` and renders a list of bookings
- [ ] Each booking entry shows location name, time slot start and end time, and booking status (`BOOKED` or `CANCELLED`)
- [ ] If the API response includes an end user's name or identifier, it is displayed per booking entry
- [ ] A loading state renders while `isLoading` is `true`
- [ ] An empty state renders when there are no bookings
- [ ] An error state renders if the fetch fails
- [ ] No booking management actions (approve, cancel on behalf of customer) are present — the page is strictly read-only
- [ ] Design tokens are consistent with the Phase 7/8 design system

**Dependencies:** #— Ticket 2 (consumes `useMyProviderBookings`)

---

## Ticket 8 of 10

**Title:** P11:Register all provider dashboard routes

**Description:**
Update the frontend route configuration to register the five new provider dashboard routes inside the existing `ProviderLayout` route guard, and confirm the post-login redirect from `ProviderLogin` lands on `/provider/dashboard`.

**Acceptance Criteria:**
- [ ] `/provider/dashboard` is registered and renders `ProviderDashboard`
- [ ] `/provider/locations/new` is registered and renders `ProviderLocationNew`
- [ ] `/provider/locations/:id` is registered and renders `ProviderLocationDetail`
- [ ] `/provider/locations/:id/edit` is registered and renders `ProviderLocationEdit`
- [ ] `/provider/bookings` is registered and renders `ProviderBookings`
- [ ] All five routes are nested inside the `ProviderLayout` auth guard; unauthenticated access redirects to `/login` or `/provider/login`
- [ ] `ProviderLogin` redirects to `/provider/dashboard` on successful authentication (updated if it previously pointed to a stub route)

**Dependencies:** #— Tickets 3–7 (pages must exist before route registration is meaningful)

---

## Ticket 9 of 10

**Title:** P11:Add navigation bar to ProviderLayout

**Description:**
Update `ProviderLayout.tsx` to include a navigation bar or sidebar with links to My Locations, My Bookings, and a Logout action. The nav must appear on all provider dashboard pages without per-page implementation.

**Acceptance Criteria:**
- [ ] `ProviderLayout.tsx` includes a nav bar or sidebar with links to `/provider/dashboard` (My Locations) and `/provider/bookings` (My Bookings)
- [ ] A Logout action calls `AuthContext.logout` and redirects to `/login`
- [ ] Active or hovered nav links use the Spell Gold design token; any nav heading uses the Cinzel font
- [ ] The nav background uses the Obsidian design token
- [ ] The nav renders consistently on all provider dashboard pages without per-page wiring
- [ ] `ProviderLayout` applies the same auth guard pattern used by `CustomerLayout`

**Dependencies:** #— Ticket 8 (routes must be registered for nav links to resolve correctly)

---

## Ticket 10 of 10

**Title:** P11:Verify end-to-end provider dashboard flow

**Description:**
Run a structured end-to-end verification of the complete Phase 11 feature set against a running backend with seeded data. No new source code is written in this step. Any failures discovered must be fixed before the phase is closed.

**Acceptance Criteria:**
- [ ] Logging in as a provider redirects to `/provider/dashboard` and the seeded location list renders
- [ ] Clicking "Add Location" renders the create form; filling all fields and submitting produces a new location visible on the dashboard
- [ ] Clicking "Manage" on a location renders the detail page with name, description, difficulty, cancellation policy, and cover image (or placeholder)
- [ ] Clicking "Edit Location" renders a pre-populated form; updating a field and submitting reflects the change on the detail page
- [ ] Adding a time slot in the Time Slots section causes it to appear in the list; deleting it (after the confirm prompt) removes it from the list
- [ ] Uploading a valid image on the detail page renders it at 16:9; uploading a non-image file shows an inline error
- [ ] Navigating to `/provider/bookings` renders seeded bookings with location name, time range, and status
- [ ] Logging out redirects to `/login`; navigating back to `/provider/dashboard` redirects to the provider login rather than rendering the page
- [ ] All provider routes redirect unauthenticated requests with no flash of protected content

**Dependencies:** #— Tickets 1–9 (all implementation tickets must be complete before verification)
