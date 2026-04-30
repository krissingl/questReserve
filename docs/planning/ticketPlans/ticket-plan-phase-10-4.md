# Ticket Plan: Phase 10.4 — Location Images & Browse UI Redesign

**Purpose:** Add image storage and upload infrastructure to the backend, surface images in the frontend detail and browse views, and redesign the browse page from a card grid to a split-panel layout.
**Total tickets:** 9
**Prefix:** P10.4:
**Status: LOCKED** — This plan is complete and approved. The agent must not add, remove, reorder, or infer any ticket beyond what is listed below.

---

## Ticket 1 of 9

**Title:** P10.4:Document image storage strategy and configure static file serving

**Description:**
Confirm the MVP image storage decision (Option A — filesystem + static serving via Express), add `uploads/` to the backend `.gitignore`, and mount `express.static('uploads')` at `/uploads` in `app.ts`. This is the prerequisite infrastructure decision and configuration that all subsequent image steps depend on.

**Acceptance Criteria:**
- [ ] `questreserve-backend/.gitignore` includes an `uploads/` entry
- [ ] `questreserve-backend/src/app.ts` mounts `express.static('uploads')` at the `/uploads` path
- [ ] A request to `/uploads/<filename>` for a file that exists in the `uploads/` directory returns the file with a `200` response
- [ ] The `uploads/` directory is not tracked by git

---

## Ticket 2 of 9

**Title:** P10.4:Add image_url column to booking_location via Knex migration

**Description:**
Create a reversible Knex migration that adds a nullable `image_url` VARCHAR column to the `booking_location` table. Update the `BookingLocation` TypeScript domain type to include `image_url: string | null`. This column stores the relative URL path of the location's cover image and is the data foundation for all image-related features in this phase.

**Acceptance Criteria:**
- [ ] A new migration file exists at `questreserve-backend/src/db/migrations/<timestamp>_add_image_url_to_booking_location.ts`
- [ ] Running `knex migrate:latest` adds a nullable `image_url` column to `booking_location`
- [ ] Running `knex migrate:rollback` removes the column without error
- [ ] The `BookingLocation` TypeScript interface/type includes `image_url: string | null`

**Dependencies:** No upstream ticket dependency — Step 1 is a design decision; the migration can be authored in parallel once the URL path format is established.

---

## Ticket 3 of 9

**Title:** P10.4:Implement provider image upload endpoint with multer

**Description:**
Add a `POST /api/provider/locations/:id/image` endpoint that accepts a multipart file upload, writes it to `uploads/location-images/`, enforces provider ownership, and persists the resulting URL path to `booking_location.image_url`. Implement the full stack: repository `updateImageUrl` method, service `setLocationImage` method, and controller handler. Add `multer` as a backend dependency.

**Acceptance Criteria:**
- [ ] `multer` is added to `questreserve-backend/package.json` and installs without conflict with Express v5
- [ ] `POST /api/provider/locations/:id/image` with a valid JPEG, PNG, or WebP file from the owning provider returns `200` with `{ image_url: '/uploads/location-images/<filename>' }`
- [ ] The returned `image_url` path is written to the `booking_location` row for the given `:id`
- [ ] Uploading a file with an unsupported MIME type (e.g. `text/plain`) returns `400`
- [ ] A provider attempting to upload to a location they do not own receives `403`
- [ ] Files larger than 5 MB are rejected with a `400` response
- [ ] `BookingLocationRepository` has an `updateImageUrl(locationId, url)` method
- [ ] `BookingLocationService` has a `setLocationImage(providerId, locationId, url)` method

---

## Ticket 4 of 9

**Title:** P10.4:Verify image_url is included in public location API responses

**Description:**
Confirm that `GET /api/customer/locations` and `GET /api/customer/locations/:id` include `image_url` in their response payloads. If the repository uses an explicit column select list, add `image_url` to it. Update any shared TypeScript response types that exclude the field.

**Acceptance Criteria:**
- [ ] `GET /api/customer/locations` response objects include an `image_url` field (string or null)
- [ ] `GET /api/customer/locations/:id` response object includes an `image_url` field (string or null)
- [ ] The TypeScript response types for both endpoints include `image_url: string | null`
- [ ] No existing fields are missing from the responses after any repository changes

---

## Ticket 5 of 9

**Title:** P10.4:Seed development locations with cover images

**Description:**
Update the development seed file to associate one appropriately licensed open-source image with each seed `BookingLocation`. Images must be placed in `uploads/location-images/` and their relative paths written into the `image_url` column. The seed file must include comments citing the source URL for each image so any developer can re-populate the directory locally.

**Acceptance Criteria:**
- [ ] Each seed `BookingLocation` row has a non-null `image_url` pointing to a file in `uploads/location-images/`
- [ ] The seed file includes a comment for each image with its source URL
- [ ] Running the seed against a migrated database populates `image_url` for all seed locations without error
- [ ] Seeded images are thematically appropriate (dungeon, cave, or fantasy adventure settings)
- [ ] The seed images are not committed to the repository (`uploads/` remains gitignored)

---

## Ticket 6 of 9

**Title:** P10.4:Update frontend BookingLocation type to include image_url

**Description:**
Add `image_url: string | null` to the `BookingLocation` TypeScript interface in the frontend API layer (`src/api/customer.api.ts` or the shared types file). Verify that `useBookingLocations` and `useBookingLocation` (or equivalent hooks) pass the field through to consuming components without stripping it in a mapping step.

**Acceptance Criteria:**
- [ ] The frontend `BookingLocation` interface includes `image_url: string | null`
- [ ] `useBookingLocations` surfaces `image_url` on each location object returned to components
- [ ] `useBookingLocation` (single-location hook) surfaces `image_url` on the returned location object
- [ ] No TypeScript compilation errors are introduced by the type change

---

## Ticket 7 of 9

**Title:** P10.4:Add cover image display to LocationDetail page

**Description:**
Update `LocationDetail.tsx` to render the location's `image_url` as a hero image above the name and description. When `image_url` is null, render a layout-stable placeholder at the same aspect ratio. Image and placeholder must both use `object-fit: cover` at a fixed 16:9 or 3:2 ratio constrained to the detail card width, preventing layout shift regardless of image presence.

**Acceptance Criteria:**
- [ ] A location with a non-null `image_url` renders the image as a hero above the name and description
- [ ] A location with a null `image_url` renders a styled placeholder at the same fixed dimensions
- [ ] The image is constrained to the detail card width with a fixed aspect ratio (16:9 or 3:2) and `object-fit: cover`
- [ ] No cumulative layout shift (CLS) occurs when the image loads or when switching between locations with and without images
- [ ] The hero image styling is consistent with the Phase 7/8 design system tokens (Obsidian background, surface card)
- [ ] No multi-image carousel or gallery is present — one cover image per location only

---

## Ticket 8 of 9

**Title:** P10.4:Redesign BrowseLocations page to split-panel layout

**Description:**
Replace the card grid in `BrowseLocations.tsx` with a split-panel layout: a scrollable left list showing name, difficulty badge, and thumbnail per location, and an expanded right preview panel showing the full cover image, name, description, difficulty, and a "View & Book" button. Focus state (which location is previewed on the right) is managed with local `useState`. The `LocationFilterBar` from Phase 10.3 renders above the panel as a full-width bar.

**Acceptance Criteria:**
- [ ] The browse page renders a left panel (scrollable location list) and a right panel (location preview) instead of a card grid
- [ ] The left panel is a fixed width (approximately `280px` or `25%`) and the right panel fills the remaining width
- [ ] Both panels fill the viewport height below `HeaderNav` (`calc(100vh - <header height>)`) with `overflow-y: auto` on the left panel
- [ ] The first location in the list is focused (right panel populated) on initial load
- [ ] Clicking a left-panel entry updates the right panel preview without navigating away from the page
- [ ] The focused entry in the left panel is visually highlighted using the `--accent` design token
- [ ] Left-panel entries show a thumbnail of `image_url` (or a same-size placeholder if null)
- [ ] The right panel displays the full cover image at 16:9 with `object-fit: cover` (or a layout-stable placeholder if null)
- [ ] The right panel includes a "View & Book" button that navigates to `/locations/:id`
- [ ] The `LocationFilterBar` renders above the split panel and filtering updates the left list
- [ ] When the filtered list is empty, a full-width "No locations match this filter" state replaces the split panel
- [ ] Focus state is not persisted to the URL

---

## Ticket 9 of 9

**Title:** P10.4:Verify end-to-end image upload and browse redesign flow

**Description:**
Run a structured end-to-end verification of the complete Phase 10.4 feature set against a running backend with seeded data. Confirm all integration points — split-panel browse, image display, filtering, detail hero, upload endpoint validation, and placeholder stability — work correctly together. Investigate and resolve any failures before the phase is closed.

**Acceptance Criteria:**
- [ ] `/locations` renders the split-panel layout with seeded locations; first location is focused and its preview image displays in the right panel
- [ ] Clicking different left-list entries updates the right panel without page navigation
- [ ] Applying a difficulty filter updates the left list; the right panel resets to the first result or shows the empty state if no results match
- [ ] Clicking "View & Book" in the right panel navigates to `/locations/:id`
- [ ] The `LocationDetail` page renders the cover image above the location details
- [ ] A location with no `image_url` renders the placeholder at correct dimensions in both the split-panel thumbnail slot and the detail hero slot — no layout shift
- [ ] `POST /api/provider/locations/:id/image` with a valid image from the owning provider succeeds and the image appears in both browse and detail views
- [ ] Uploading an invalid MIME type (e.g. `.txt`) returns `400`
- [ ] Uploading to a location owned by a different provider returns `403`
