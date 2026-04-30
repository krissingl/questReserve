# Phase 10.4: Location Images & Browse UI Redesign

_Created: 2026-04-29 | Status: DRAFT_

## Goal

Promote location images from Stretch Goal to MVP scope, implementing backend upload and storage, frontend gallery display on both the browse and detail views, and a redesigned browse layout that replaces the current card grid with a split-panel view — a location list on the left and an expanded location preview on the right.

## Context

Phase 10.3 (Location Filtering) is complete or in its final stages. `BrowseLocations` is a public page at `/locations` wrapped in `GuestLayout` with `HeaderNav`. It renders a grid of location cards fetched via `useBookingLocations` and filtered by `difficulty` via URL search params. `LocationDetail` at `/locations/:id` renders the full location record (name, description, difficulty, cancellation policy) plus the TimeSlot availability list and the Phase 10.1 booking flow.

The `BookingLocation` domain model has no image-related columns today. The spec's domain model defines `BookingLocation` with name, description, difficulty, and cancellation policy. Images were classified as a Stretch Goal and are explicitly promoted to MVP in Phase 10.4 by the roadmap (`mvp-implementation-phases.md`).

The browse redesign is described in the roadmap as not meaningful without richer location data — the image gallery is the precondition that gives the preview panel something substantive to display.

Backend file storage strategy must be decided before implementation begins. The backend follows the repository/service/controller pattern established in Phases 4–5. The frontend follows the `api / hooks / components / pages` pattern established in Phases 8–10.

---

## Steps

### Step 1: Backend — decide and document the image storage strategy

Before any implementation, choose the image storage mechanism and document it as a decision in this phase plan.

**Two options to evaluate:**

- **Option A — Filesystem + static serving.** Store uploaded files in a `questreserve-backend/uploads/` directory. Serve the directory as static files via Express `express.static`. Simple, zero cloud cost, no external dependency. Drawback: files are local to the server; does not survive a full redeploy without a persistent volume.
- **Option B — Cloud object storage (e.g. AWS S3, Cloudflare R2).** Upload files to a bucket, store the public URL in the database. Durable, CDN-friendly, production-grade. Drawback: requires credentials and an external account, adds complexity for local dev.

**Decision for MVP scope:** Use Option A (filesystem + static serving) for the MVP implementation. Cloud object storage is Post-MVP. This is consistent with the spec's constraint that payment and infrastructure complexity is deferred until the relevant schemas and services are scoped.

**Files that will be created/changed as a result:**
- `questreserve-backend/uploads/` directory (gitignored)
- `questreserve-backend/.gitignore` — add `uploads/`
- `questreserve-backend/src/app.ts` — add `express.static('uploads')` mount at `/uploads`

**Dependencies:** None. This is a design decision step; no code is changed until Step 2.

---

### Step 2: Backend — database migration to add `image_url` to `booking_location`

Add an `image_url` column to the `booking_location` table. This is a nullable `VARCHAR` storing the relative URL path (e.g. `/uploads/location-images/crystal-cavern.jpg`) for the currently active cover image. Supporting multiple images per location is deferred to Post-MVP — the single `image_url` column is sufficient to power the browse preview and detail gallery for the MVP.

Create a new Knex migration in `questreserve-backend/src/db/migrations/`. The migration adds `image_url` as a nullable string column and is reversible (the `down` function drops the column).

Update the `BookingLocation` TypeScript type/interface (in `questreserve-backend/src/types/` or wherever the domain types are defined, following the pattern from Phases 4–5) to include `image_url: string | null`.

**Files created/changed:**
- `questreserve-backend/src/db/migrations/<timestamp>_add_image_url_to_booking_location.ts` (new migration)
- The `BookingLocation` type definition file (update to add `image_url`)

**Dependencies:** Step 1 (storage strategy must be decided — the column stores the URL path format matching that strategy).

---

### Step 3: Backend — image upload endpoint for providers

Add a `POST /api/provider/locations/:id/image` endpoint that accepts a multipart form upload, writes the file to `uploads/location-images/`, and saves the resulting URL path in the `booking_location.image_url` column for the specified location.

Use `multer` as the multipart middleware. Configure `multer` with disk storage targeting `uploads/location-images/`. Set a file size limit (e.g. 5 MB) and restrict accepted MIME types to `image/jpeg`, `image/png`, and `image/webp` — reject other types with a `400` response.

The endpoint must enforce provider ownership: a provider may only upload an image to a location they own. Fetch the location by `:id`, verify `provider_id` matches `req.user.id` (the authenticated provider from the JWT), and return `403` if there is a mismatch.

On success, return `200` with `{ image_url: '/uploads/location-images/<filename>' }`.

Follow the established pattern from Phase 4: controller in `questreserve-backend/src/api/provider/`, service method in the `BookingLocationService`, repository update via an `updateImageUrl(locationId, url)` method in `BookingLocationRepository`.

**Files created/changed:**
- `questreserve-backend/src/api/provider/<locations controller>.ts` — add `POST /:id/image` handler
- `questreserve-backend/src/services/<BookingLocationService>.ts` — add `setLocationImage(providerId, locationId, url)` method
- `questreserve-backend/src/repositories/<BookingLocationRepository>.ts` — add `updateImageUrl(locationId, url)` method
- `questreserve-backend/src/api/provider/index.ts` — register the new route

**Dependencies:** Steps 1 and 2 (directory must exist, column must exist).

---

### Step 4: Backend — expose `image_url` on the public location endpoints

Ensure that `GET /api/customer/locations` and `GET /api/customer/locations/:id` include `image_url` in their response payloads. Because the column is now present in the `booking_location` table and the repository reads all columns (or a defined select list), verify that the field is not excluded from the serialised response.

If the repository uses a `SELECT *` style query, no change is needed — `image_url` will be returned automatically after the migration in Step 2 runs. If the repository uses an explicit column list, add `image_url` to it.

Similarly confirm that the TypeScript response types/interfaces returned from the service and controller include `image_url: string | null`. Update them if needed.

**Files changed (if needed):**
- `questreserve-backend/src/repositories/<BookingLocationRepository>.ts`
- Shared response type definitions (if separate from domain types)

**Dependencies:** Step 2 (migration must have run).

---

### Step 5: Seed — capture and attach images to seed locations

Update the development seed file(s) to associate one open-source image with each existing seed `BookingLocation`. Open-source images (Unsplash, Pexels, or locally sourced assets with appropriate licensing) must be placed in `uploads/location-images/` and their relative paths written into the `image_url` column via the seed.

Select images that are thematically appropriate — dungeon, cave, or fantasy adventure settings. The seed images are for development and demo use only; they are not committed to the repository (the `uploads/` directory is gitignored). Include a comment in the seed file pointing to the image source URLs so any developer can re-populate locally.

**Files changed:**
- `questreserve-backend/src/db/seeds/<locations seed file>.ts` — update seed rows to populate `image_url`

**Dependencies:** Steps 2 and 3 (column must exist; upload directory must exist). The images themselves are sourced and placed manually before running the seed.

---

### Step 6: Frontend — update API types and `getBookingLocations` / `getBookingLocation`

Update the `BookingLocation` TypeScript interface in the frontend API layer (`src/api/customer.api.ts` or a shared types file) to include `image_url: string | null`.

No change to the fetch logic is needed — `image_url` will now be present in the API response after Steps 2 and 4 are complete.

Confirm that `useBookingLocations` and any hook that calls `getBookingLocation` by ID surfaces the `image_url` field to the consuming component without losing it (i.e. it is not stripped in a mapping step).

**Files changed:**
- `src/api/customer.api.ts` (or the shared frontend types file) — add `image_url` to the interface
- Verify `src/hooks/useBookingLocations.ts` and `src/hooks/useBookingLocation.ts` (or equivalent) pass the field through

**Dependencies:** Step 4 (backend must return the field before end-to-end verification is meaningful, but the type change can be made independently).

---

### Step 7: Frontend — add image display to `LocationDetail`

Update `src/pages/LocationDetail/LocationDetail.tsx` to render the location's image when `image_url` is non-null. Display it as a prominent hero image above the name and description, or as a cover image at the top of the detail card — consistent with the Phase 7/8 design system tokens (Obsidian background, surface card).

Behaviour when `image_url` is null: render a styled placeholder (e.g. a dark rectangle with a dungeon icon or the QuestReserve logo mark) at the same aspect ratio, so the layout does not shift depending on whether an image is present.

Image sizing: constrain to a max width matching the detail card width, with a fixed aspect ratio of 16:9 or 3:2. Use `object-fit: cover` to prevent stretching.

Do not add a multi-image carousel or gallery in this phase — a single cover image per location is the MVP scope. The placeholder element should share the same dimensions so the transition from placeholder to image is layout-stable.

**Files changed:**
- `src/pages/LocationDetail/LocationDetail.tsx`

**Dependencies:** Step 6 (type must include `image_url`).

---

### Step 8: Frontend — build the split-panel `BrowseLocations` layout

Redesign `src/pages/BrowseLocations/BrowseLocations.tsx` from a card grid to a split-panel layout:

- **Left panel:** A scrollable list of location entries. Each entry shows the location name, difficulty badge, and a thumbnail of `image_url` (or a small placeholder if null). The entry for the currently focused location is visually highlighted (border or background change using `--accent` token).
- **Right panel:** An expanded preview of the focused location. Shows the full cover image (same display as Step 7's `LocationDetail` hero, 16:9, `object-fit: cover`), the location name, description, difficulty, and a "View & Book" button that navigates to `/locations/:id`.

**Focus behaviour:** On initial load, the first location in the list is focused. Clicking a list entry on the left updates the right panel to preview that location without navigating away from the browse page. Focus state is local to the component (`useState` for `focusedLocationId`).

**Layout:** Use a CSS flexbox or grid split. Left panel: fixed width (e.g. `280px` or `25%` of the page width). Right panel: fills remaining width. Both panels share the full viewport height below `HeaderNav` (use `calc(100vh - <header height>)` with `overflow-y: auto` on the left panel).

The `LocationFilterBar` (from Phase 10.3) is rendered above the split panel as a full-width bar, so filtering continues to work — the filtered result list feeds the left panel.

If the filtered result list is empty, render a full-width "No locations match this filter" state in place of the split panel.

**Files changed:**
- `src/pages/BrowseLocations/BrowseLocations.tsx`

**Dependencies:** Steps 6 and 7 (types must be updated; image display pattern is established in Step 7 before being reused here). `LocationFilterBar` from Phase 10.3 must be present.

---

### Step 9: End-to-end verification

Verify the complete image and browse redesign flow against a running backend with the seeded data from Step 5.

**Test path:**

1. Open `/locations` — confirm the split-panel layout renders with the seeded locations. Confirm the first location is focused and its preview image displays in the right panel.
2. Click different entries in the left list — confirm the right panel updates to the selected location without a page navigation.
3. Apply a difficulty filter — confirm the left list updates and the right panel resets to the first result (or shows the empty state if no results match).
4. Click "View & Book" in the right panel — confirm navigation to `/locations/:id`.
5. On the `LocationDetail` page, confirm the cover image renders above the location details.
6. Confirm that a location with no `image_url` renders the placeholder at the correct dimensions in both the browse split panel and the detail page — no layout shift.
7. As a provider, use the `POST /api/provider/locations/:id/image` endpoint (via REST client or a temporary test form) to upload an image for a location. Confirm the image appears in both the browse and detail views after upload.
8. Attempt an upload with an invalid MIME type (e.g. a `.txt` file) — confirm the backend returns `400`.
9. Attempt an upload to a location owned by a different provider — confirm the backend returns `403`.

Any failures must be investigated and resolved before the phase is closed.

**Dependencies:** All previous steps complete.

---

## Notes

- **Image storage is filesystem-only for MVP.** Cloud object storage (S3, R2, etc.) is explicitly Post-MVP. The `uploads/` directory is gitignored. Every developer must re-seed images locally. The seed file must include source URLs as comments so this is possible without guesswork.
- **Single `image_url` column, not a junction table.** Supporting multiple images per location (a gallery) is Post-MVP. The MVP column stores the cover image URL only. The "Save Images" stretch goal in the spec (`mvp-implementation-phases.md`) references user profile pictures — that is a separate feature from location images and is not addressed in this phase.
- **Split-panel focus state is local `useState`.** It does not go into the URL (unlike the difficulty filter). The focused location does not need to be bookmarkable — the "View & Book" link to `/locations/:id` is the canonical shareable URL for a specific location.
- **`LocationFilterBar` is reused unchanged from Phase 10.3.** No changes to that component are made in this phase. The filter bar sits above the new split panel and feeds the left list.
- **Placeholder image must be layout-stable.** Both the left thumbnail slot and the right hero image slot must render at fixed dimensions whether or not `image_url` is present. This prevents cumulative layout shift (CLS) on load.
- **Provider upload UI is Post-MVP.** The provider-facing image upload endpoint (Step 3) is backend infrastructure only. The provider dashboard frontend (Phase 11) is where the upload UI will be built. For Phase 10.4, the endpoint is verified via REST client or seed script — no upload form is built in this phase.
- **`multer` is a new backend dependency.** It must be added to `questreserve-backend/package.json`. Confirm it does not conflict with the existing Express v5 setup.
- **Step sequence.** Steps 1 → 2 → 3/4 (3 and 4 can run in parallel) → 5 → 6 → 7 → 8 → 9. Step 5 (seeding) can be done as soon as Steps 2 and 3 are complete and images are sourced. Step 6 is a prerequisite for Steps 7 and 8.
- **Phase 11 dependency.** The provider image upload endpoint built in Step 3 is the backend target for the upload form that will be built in Phase 11 (Provider Dashboard). The endpoint contract (`POST /api/provider/locations/:id/image`, multipart, returns `{ image_url }`)) should be considered stable once merged.
