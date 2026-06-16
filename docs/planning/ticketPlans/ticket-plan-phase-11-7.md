# Ticket Plan: Phase 11.7 — Expanded Location Rulesets & Provider Survey

**Purpose:** Add a rich ruleset metadata system to booking locations, with a multi-step provider survey UI and an expanded customer filter panel backed by URL-persistent query parameters.
**Total tickets:** 9
**Prefix:** P11.7:
**Status: LOCKED** — This plan is complete and approved. The agent must not add, remove, reorder, or infer any ticket beyond what is listed below.

---

## Ticket 1 of 9

**Title:** P11.7:Add Knex migration for expanded booking_location ruleset columns

**Description:**
Create a single Knex migration that adds all new ruleset columns to the `booking_location` table across six categories: core specs (party size, level range), environment (landscape type, setting, environment tags), restrictions (magic, class/race/faction, composition, physical access, mount/familiar/solo, booking type), tone and content (tone tags, gore level, non-lethal mode, permadeath risk, primary focus, boss encounter, PvP, scouting), run logistics (run time, reset time, time limit), and amenities and loot (safe room, merchant, equipment, guide, loot type, boss loot, unique item chance). All new columns are nullable to preserve backward compatibility with existing rows.

**Acceptance Criteria:**
- [ ] A single migration file exists under `questreserve-backend/migrations/` for these additions
- [ ] All 30+ new columns are present in the migration's `up` function with the correct types (integer, boolean, text, or text array via `specificType`)
- [ ] Boolean columns have a default of `false`; all other new columns are nullable with no default
- [ ] The migration's `down` function drops all added columns
- [ ] Running `knex migrate:latest` against a development database succeeds without errors
- [ ] Existing `booking_location` rows remain intact after the migration runs (all new columns are null)

---

## Ticket 2 of 9

**Title:** P11.7:Extend BookingLocation domain type and repository with new fields and filters

**Description:**
Update the `BookingLocation` TypeScript interface to include all fields added in the migration. Extend `BookingLocationRepository.findAll()` to accept and apply the eight priority filter parameters defined in the phase plan: `levelRangeMin`, `levelRangeMax`, `runTimeMax`, `setting`, `landscapeType`, `toneTag`, `partySizeMin`, `partySizeMax`. Widen `create` and `update` payload types to accept all new fields. The existing `difficulty` filter is preserved unchanged.

**Acceptance Criteria:**
- [ ] `BookingLocation` TypeScript interface includes all columns added in Ticket 1
- [ ] `findAll(filters?)` applies `level_range_max >= levelRangeMin` when `levelRangeMin` is provided
- [ ] `findAll(filters?)` applies `level_range_min <= levelRangeMax` when `levelRangeMax` is provided
- [ ] `findAll(filters?)` applies `run_time_minutes <= runTimeMax` when `runTimeMax` is provided
- [ ] `findAll(filters?)` applies `WHERE setting = ?` when `setting` is provided
- [ ] `findAll(filters?)` applies `WHERE landscape_type = ?` when `landscapeType` is provided
- [ ] `findAll(filters?)` applies `whereRaw('? = ANY(tone_tags)', [value])` when `toneTag` is provided
- [ ] `findAll(filters?)` applies party-size overlap logic (`party_size_max >= partySizeMin` and `party_size_min <= partySizeMax`) when respective params are provided
- [ ] `findAll` with no new filters returns all locations (backward-compatible)
- [ ] `create` and `update` accept all new fields without TypeScript errors

**Dependencies:** Ticket 1 — migration must exist before repository types can be updated

---

## Ticket 3 of 9

**Title:** P11.7:Extend customer locations endpoint with expanded filter query parameters

**Description:**
Update the `GET /api/customer/locations` controller to read and validate the eight new priority filter parameters from `req.query`, then pass them through the service to the repository. Also update the `POST /api/provider/locations` and `PATCH /api/provider/locations/:id` controllers to accept and persist all new ruleset fields from the survey payload.

**Acceptance Criteria:**
- [ ] `GET /api/customer/locations` reads `levelRangeMin`, `levelRangeMax`, `runTimeMax`, `setting`, `landscapeType`, `toneTag`, `partySizeMin`, `partySizeMax` from `req.query`
- [ ] `setting` is validated against `['interior', 'exterior', 'both']`; invalid values return `400`
- [ ] `landscapeType` is validated against the ten allowed values from the migration; invalid values return `400`
- [ ] `toneTag` is validated against `['horror', 'heroic', 'comedic', 'mystery', 'political']`; invalid values return `400`
- [ ] Numeric filter params are parsed as positive integers; non-integer or negative values return `400`
- [ ] Validated filter values are passed to the service and then to `findAll`; filtered queries return only matching locations
- [ ] `POST /api/provider/locations` and `PATCH /api/provider/locations/:id` accept all new ruleset fields in the request body and persist them to the database
- [ ] The existing `difficulty` filter on `GET /api/customer/locations` continues to work correctly

**Dependencies:** Ticket 2 — repository filter logic must exist before the controller can wire it in

---

## Ticket 4 of 9

**Title:** P11.7:Update seed data with representative expanded ruleset values

**Description:**
Update existing `booking_location` seed records to populate a representative subset of the new ruleset fields. The goal is sufficient variety across seed locations to exercise every priority filter during development and end-to-end testing. Each seed location must have at minimum: `party_size_min`, `party_size_max`, `level_range_min`, `level_range_max`, `landscape_type`, `setting`, `tone_tags`, `primary_focus`, `run_time_minutes`, and `loot_type`.

**Acceptance Criteria:**
- [ ] All existing seed `booking_location` records are updated with meaningful ruleset values (not all null)
- [ ] Each seed location has at minimum the ten required fields listed above populated
- [ ] Seed locations collectively cover all landscape type values and all setting values (so filter tests can find at least one result for each)
- [ ] Seed locations collectively cover all five tone tag values across the set
- [ ] Seed data remains coherent with each location's existing name and thematic description
- [ ] Running `knex seed:run` after the migration succeeds without errors

**Dependencies:** Ticket 1 — migration must add columns before seed data can populate them

---

## Ticket 5 of 9

**Title:** P11.7:Extend frontend BookingLocation type and provider API module for new fields

**Description:**
Update the `BookingLocation` TypeScript type in the frontend to match the expanded backend interface. Extend `CreateLocationPayload` and `UpdateLocationPayload` in `provider.api.ts` to include all new ruleset fields as optional properties. No new API functions are needed — `createLocation` and `updateLocation` already POST/PATCH the payload object.

**Acceptance Criteria:**
- [ ] The frontend `BookingLocation` type includes all new fields from the migration
- [ ] `CreateLocationPayload` and `UpdateLocationPayload` in `provider.api.ts` include all new fields as optional properties with correct TypeScript types (number, boolean, string, or string array)
- [ ] No `any` types are introduced
- [ ] The frontend compiles without TypeScript errors after the type changes

**Dependencies:** Ticket 3 — backend endpoints must accept new fields before the frontend payload types are finalized

---

## Ticket 6 of 9

**Title:** P11.7:Build multi-step LocationSurvey component and replace LocationForm in provider pages

**Description:**
Create `LocationSurvey`, a controlled, six-step survey component that replaces the single-page `LocationForm` on the provider create and edit flows. The survey groups all location fields into six steps: Core Info, Environment, Restrictions & Access, Tone & Content, Run Logistics, and Amenities & Loot. Survey state is held in the parent page component (`ProviderLocationNew` / `ProviderLocationEdit`) and passed down as controlled props. Only Step A fields (Name, Description, Difficulty) are required; all other steps may be skipped. `LocationForm` is deleted after the swap is complete.

**Acceptance Criteria:**
- [ ] `LocationSurvey` component exists at `questreserve-frontend/src/components/LocationSurvey/LocationSurvey.tsx`
- [ ] The component renders six named steps matching the phase plan's Step A through Step F field groupings
- [ ] A progress indicator displays the current step number (e.g. "Step 2 of 6")
- [ ] "Back" and "Next" navigation buttons work correctly; "Next" on Step A validates that Name, Description, and Difficulty are non-empty before advancing
- [ ] "Next" on Steps B–F advances without requiring any field to be filled
- [ ] The final step displays a "Publish Location" (create flow) or "Save Changes" (edit flow) button
- [ ] Submitting calls `createLocation` or `updateLocation` from `provider.api.ts` with the full payload and redirects to `/provider/locations/:id` on success
- [ ] `ProviderLocationNew` and `ProviderLocationEdit` use `LocationSurvey` instead of `LocationForm`
- [ ] On `ProviderLocationEdit`, all survey steps are pre-populated with the existing location values from `useMyLocation(id)`
- [ ] The old `LocationForm` component file is deleted
- [ ] The survey applies design tokens consistent with the Phase 7/8 design system

**Dependencies:** Ticket 5 — frontend types and payload types must be updated before the survey can build and submit the full payload

---

## Ticket 7 of 9

**Title:** P11.7:Build LocationFilterPanel component and replace LocationFilterBar in BrowseLocations

**Description:**
Create `LocationFilterPanel`, a controlled component that exposes all priority filters as URL-param-driven controls: level range, run time (max), setting, landscape type, tone, party size, and difficulty. A "Clear All Filters" button removes all filter params from the URL. The panel replaces `LocationFilterBar` in `BrowseLocations.tsx`; `BrowseLocations` is updated to read all filter params from `useSearchParams` and pass them to `useBookingLocations`. `useBookingLocations` and `customer.api.ts` are updated to serialize all new filter params into the API call. `LocationFilterBar` is deleted.

**Acceptance Criteria:**
- [ ] `LocationFilterPanel` exists at `questreserve-frontend/src/components/LocationFilterPanel/LocationFilterPanel.tsx`
- [ ] The component is controlled: it receives current filter values and an `onChange` callback; it holds no internal state
- [ ] All seven priority filters are rendered: level range (min/max number inputs), run time max (number input), setting (radio group), landscape type (select), tone (single-select radio or select mapped to `toneTag` param), party size (min/max number inputs), and difficulty (select, existing behavior preserved)
- [ ] "Clear All Filters" removes all filter params from the URL and the location list refreshes to show all results
- [ ] Filter values are serialized into URL params on change and read back correctly on page load and refresh
- [ ] `BrowseLocations.tsx` renders `LocationFilterPanel` instead of `LocationFilterBar`
- [ ] `useBookingLocations` passes all filter fields to `getBookingLocations` in `customer.api.ts`
- [ ] `getBookingLocations` serializes all filter params into the Axios `params` object
- [ ] `LocationFilterBar` component file is deleted
- [ ] Applying a filter produces visually correct results against the seed data from Ticket 4

**Dependencies:** Ticket 3 — backend must accept filter params; Ticket 4 — seed data must be varied enough to test filters

---

## Ticket 8 of 9

**Title:** P11.7:Display expanded ruleset metadata on customer and guest location detail pages

**Description:**
Update the customer location detail page and the guest location detail page to display all non-null ruleset fields from the expanded `BookingLocation` record. Fields are grouped into six labeled sections matching the survey step groupings. Empty or null sections are omitted. Boolean flags render as badge-style chips. Display uses design tokens consistent with the Phase 7/8 design system.

**Acceptance Criteria:**
- [ ] Customer location detail page displays ruleset data in six labeled sections: Core Specs, Environment, Restrictions, Tone & Content, Run Logistics, Amenities & Loot
- [ ] Guest location detail page displays the same six sections
- [ ] Sections with all-null values are not rendered (no empty section headers)
- [ ] Boolean flags (e.g. mount permitted, permadeath risk) are displayed as badge-style chips
- [ ] Array fields (environment tags, tone tags, magic restrictions, etc.) are displayed as comma-separated lists or chip groups
- [ ] All display uses CSS custom properties from the Phase 7/8 design system (no hardcoded hex values)
- [ ] A seed location with full ruleset data shows all six sections populated correctly
- [ ] A seed location with no ruleset data (all new fields null) shows no ruleset sections — only the original fields (name, description, difficulty, etc.) are displayed

**Dependencies:** Ticket 5 — frontend `BookingLocation` type must include new fields before detail pages can render them; Ticket 4 — seed data must be populated to verify display

---

## Ticket 9 of 9

**Title:** P11.7:End-to-end verification of expanded rulesets, survey, and filter panel

**Description:**
Verify the complete Phase 11.7 feature set against a running backend with migrated schema and updated seed data. No source code changes are made in this ticket. All failures discovered must be fixed (as separate commits) before the phase is closed.

**Acceptance Criteria:**
- [ ] Migration runs cleanly and all new columns exist on `booking_location`; existing rows are unaffected
- [ ] Provider can complete all six survey steps for a new location and see the saved metadata on the location detail page
- [ ] Provider can edit an existing location; all survey steps are pre-populated with current values; changes persist after submit
- [ ] Level range filter on Browse Locations returns only locations whose level range overlaps the entered range; URL updates with correct params
- [ ] Run time max filter returns only locations with `run_time_minutes` at or below the entered value
- [ ] Setting filter returns only locations matching the selected setting value
- [ ] Landscape type filter returns only locations with the selected landscape
- [ ] Tone tag filter returns only locations containing the selected tone in their `tone_tags` array
- [ ] Party size filter returns only locations whose party size range overlaps the entered range
- [ ] All active filter values survive a page refresh (read correctly from URL params on reload)
- [ ] "Clear All Filters" removes all filter params and returns the full unfiltered location list
- [ ] A `GET /api/customer/locations` call with `setting=diagonal` returns `400`
- [ ] Customer and guest location detail pages display all non-null ruleset fields for a fully seeded location, grouped correctly by section

**Dependencies:** Tickets 1–8 — all prior work must be complete

---
