# Phase 11.7: Expanded Location Rulesets & Provider Survey

_Created: 2026-06-15 | Status: DRAFT_

## Goal

Introduce a rich location metadata system that lets providers describe their dungeon/adventure location in fine-grained detail across six categories: core specs, environment, restrictions, tone & content, run logistics, and amenities/loot. Expose these fields to customers as an expanded filter UI on the Browse Locations page. Filter state persists in URL params, consistent with the pattern established in Phase 10.3.

## Context

Phase 11.6 (Reviews & Branding Cleanup) is complete. The codebase stands at:

- **Backend:** Full CRUD for `booking_location` via `BookingLocationRepository`, `ProviderService`, and `GET /api/customer/locations` (public). The Phase 10.3 filter extension added a `difficulty` query-parameter filter to `GET /api/customer/locations` — that pattern is the direct predecessor to the multi-field filter system this phase introduces. The repository accepts an optional `filters` object; the service passes it through; the controller reads from `req.query`.
- **Frontend — Provider:** `LocationForm` (Phase 11 Step 4) covers the original `BookingLocation` fields (name, description, difficulty, cancellation policy). `ProviderLocationNew` and `ProviderLocationEdit` use `LocationForm` and live at `/provider/locations/new` and `/provider/locations/:id/edit`. These pages are replaced/extended by the multi-step survey in this phase.
- **Frontend — Customer:** `LocationFilterBar` (Phase 10.3) is a controlled component driven by URL params via `useSearchParams`. `BrowseLocations` (Phase 10.4 redesign) is a split-panel page: location list on the left, expanded preview on the right. Filter state (currently `difficulty` only) flows from URL → `useBookingLocations(filters)` → `GET /api/customer/locations?difficulty=X`.
- **Phase 11.8 dependency:** The Will AI assistant (Phase 11.8) depends on the filter schema defined in this phase. The JSON filter object Will produces must map exactly to the query parameters established here. No 11.8 work is in scope here, but the filter parameter names chosen in this phase are API-stable from 11.8's perspective.

The `booking_location` table currently has: `id`, `provider_id`, `name`, `description`, `difficulty`, `rules`, `cancellation_policy`, `image_url`, `is_active`. All new ruleset fields are additions to this table via a Knex migration.

---

## Steps

### Step 1: Backend — Knex migration for expanded location fields

Add all new ruleset columns to the `booking_location` table in a single Knex migration. All new columns are nullable (all fields are optional except `party_size_min`, `party_size_max`, and `level_range_min`/`level_range_max`, which have application-layer defaults but may be null in the DB for backward compatibility with existing seed records).

**Core specs columns:**
- `party_size_min` integer
- `party_size_max` integer
- `level_range_min` integer
- `level_range_max` integer

**Environment columns:**
- `landscape_type` text (enum enforced at service layer: `tundra`, `forest`, `desert`, `cave`, `coastal`, `volcanic`, `urban`, `plains`, `mountain`, `swamp`)
- `setting` text (enum: `interior`, `exterior`, `both`)
- `environment_tags` text array (specialty tags: `lava`, `haunted`, `aerial`, `underwater`, `frozen`, `toxic`, `astral`)

**Restrictions columns:**
- `magic_restrictions` text array (values: `antimagic`, `wild_magic`, `divine_restricted`, `arcane_restricted`, `none`)
- `class_restrictions` text array (free-form tag list, e.g. `["wizard", "rogue"]`; empty array = no restrictions)
- `race_restrictions` text array (free-form tag list; empty array = no restrictions)
- `faction_restrictions` text array (free-form tag list; empty array = no restrictions)
- `party_composition_tags` text array (composition rules, e.g. `["no_all_melee", "healer_required"]`)
- `physical_access` text array (values: `vertical_traversal`, `water_traversal`, `narrow_passages`, `darkness`)
- `mount_permitted` boolean default false
- `familiar_permitted` boolean default false
- `solo_permitted` boolean default false
- `booking_type` text (enum: `concurrent`, `exclusive`; default `concurrent`)

**Tone & content columns:**
- `tone_tags` text array (values: `horror`, `heroic`, `comedic`, `mystery`, `political`)
- `gore_level` integer (0–3; 0 = none, 1 = mild, 2 = moderate, 3 = graphic)
- `non_lethal_mode` boolean default false
- `permadeath_risk` boolean default false
- `primary_focus` text (enum: `combat`, `puzzle`, `roleplay`, `mixed`)
- `boss_encounter` boolean default false
- `pvp_permitted` boolean default false
- `scouting_permitted` boolean default false

**Run logistics columns:**
- `run_time_minutes` integer (estimated run time)
- `reset_time_hours` integer (dungeon reset time)
- `time_limit_minutes` integer (time limit per run; null = no limit)

**Amenities & loot columns:**
- `has_safe_room` boolean default false
- `has_merchant` boolean default false
- `equipment_provided` boolean default false
- `guide_provided` boolean default false
- `loot_type` text (enum: `guaranteed`, `random`, `none`)
- `boss_loot` boolean default false
- `unique_item_chance` boolean default false

**Files created:**
- `questreserve-backend/migrations/<timestamp>_expand_booking_location_rulesets.ts`

---

### Step 2: Backend — Update BookingLocationRepository and types

Extend the `BookingLocation` domain type (TypeScript interface) to include all new fields from Step 1. Update `BookingLocationRepository`:

- `findAll(filters?)` — extend the optional `filters` parameter to accept the priority filter fields used by the customer browse endpoint: `levelRangeMin`, `levelRangeMax`, `runTimeMax`, `setting`, `landscapeType`, `toneTag`, `partySizeMin`, `partySizeMax`. Each filter, when present, adds a `.where()` or `.whereBetween()` clause to the Knex query. Existing `difficulty` filter is preserved unchanged.
- `findById(id)` — no change required; the SELECT already returns all columns (`*`).
- `create(data)` and `update(id, data)` — the payload types are widened to accept the new fields. No structural change to the methods themselves — Knex's `insert`/`update` already handles arbitrary column maps.

The secondary filters (access requirements, amenities, class/race/faction restrictions) are not applied as DB-level filters in this phase — they are metadata displayed on the location detail page only. Filtering by array columns adds query complexity that is not warranted for MVP. Document this deferral explicitly in the Notes section.

**Filter parameter mapping (query string → Knex clause):**

| Query param | Knex clause |
|---|---|
| `levelRangeMin` | `.where('level_range_max', '>=', value)` |
| `levelRangeMax` | `.where('level_range_min', '<=', value)` |
| `runTimeMax` | `.where('run_time_minutes', '<=', value)` |
| `setting` | `.where('setting', value)` |
| `landscapeType` | `.where('landscape_type', value)` |
| `toneTag` | `.whereRaw('? = ANY(tone_tags)', [value])` |
| `partySizeMin` | `.where('party_size_max', '>=', value)` |
| `partySizeMax` | `.where('party_size_min', '<=', value)` |
| `difficulty` | `.where('difficulty', value)` (existing) |

**Files changed:**
- `questreserve-backend/src/repositories/booking-location.repository.ts` (confirm exact file name)
- `questreserve-backend/src/types/` or domain model file containing `BookingLocation` interface

---

### Step 3: Backend — Update customer service and controller for expanded filters

Extend the customer service method that calls `findAll` to pass the new filter fields through from the controller. Extend the `GET /api/customer/locations` controller to:

- Read each priority filter from `req.query`: `levelRangeMin`, `levelRangeMax`, `runTimeMax`, `setting`, `landscapeType`, `toneTag`, `partySizeMin`, `partySizeMax`.
- Validate enum-constrained values server-side: `setting` must be one of `interior`, `exterior`, `both`; `landscapeType` must be one of the ten allowed values from Step 1; `toneTag` must be one of the five tone values. Return `400` for invalid enum values. Numeric parameters (`levelRangeMin`, `levelRangeMax`, `runTimeMax`, `partySizeMin`, `partySizeMax`) must be parseable as positive integers; return `400` if not.
- Pass validated filter values to the service, which passes them to the repository.

Update the provider-facing controller for `POST /api/provider/locations` and `PATCH /api/provider/locations/:id` to accept and persist all new fields from the survey. No new validation complexity is needed here — fields are optional and stored as-is.

**Files changed:**
- `questreserve-backend/src/api/customer/` — locations controller (confirm exact file name)
- `questreserve-backend/src/services/` — customer service (confirm exact file name)
- `questreserve-backend/src/api/provider/` — locations controller (confirm exact file name)

---

### Step 4: Backend — Update seed data for expanded fields

Update existing seed location records to populate a representative subset of the new ruleset fields. Not all fields need values in all seed records — the goal is enough variety to exercise the filter UI during development and end-to-end testing. At minimum, each seed location should have: `party_size_min`, `party_size_max`, `level_range_min`, `level_range_max`, `landscape_type`, `setting`, `tone_tags`, `primary_focus`, `run_time_minutes`, and `loot_type`.

**Files changed:**
- `questreserve-backend/seeds/` (seed files for `booking_location` records)

---

### Step 5: Frontend — Extend provider API module and location types

Update the `BookingLocation` TypeScript type in the frontend to include all new fields. Update `provider.api.ts`:

- Extend `CreateLocationPayload` and `UpdateLocationPayload` to include all new ruleset fields (all optional except `party_size_min`, `party_size_max`, `level_range_min`, `level_range_max` which remain optional at the API layer but are required by the survey UI in Step 6).
- No new API functions are needed — `createLocation` and `updateLocation` already POST/PATCH the payload object.

**Files changed:**
- `questreserve-frontend/src/api/provider.api.ts`
- `questreserve-frontend/src/types/` or equivalent location type file (confirm path from codebase)

---

### Step 6: Frontend — Multi-step provider survey UI

Replace the single-page `LocationForm` with a multi-step survey component `LocationSurvey`. The existing `ProviderLocationNew` and `ProviderLocationEdit` pages swap `LocationForm` for `LocationSurvey`.

**Survey structure (six steps):**

**Step A — Core Info** (existing fields + core specs)
- Name (required), Description (required), Difficulty (required select), Cancellation Policy (textarea)
- Party Size Min / Max (number inputs), Level Range Min / Max (number inputs)

**Step B — Environment**
- Landscape Type (select with all ten values), Setting (radio: Interior / Exterior / Both)
- Environment Tags (checkbox group: lava, haunted, aerial, underwater, frozen, toxic, astral)

**Step C — Restrictions & Access**
- Magic Restrictions (checkbox group)
- Class / Race / Faction Restrictions (free-text tag inputs — comma-separated, stored as arrays)
- Party Composition Tags (free-text tag input)
- Physical Access Requirements (checkbox group)
- Mount Permitted, Familiar Permitted, Solo Permitted (boolean toggles)
- Booking Type (radio: Concurrent / Exclusive)

**Step D — Tone & Content**
- Tone Tags (checkbox group), Gore Level (radio: None / Mild / Moderate / Graphic)
- Non-Lethal Mode, Permadeath Risk, Boss Encounter, PvP Permitted, Scouting Permitted (boolean toggles)
- Primary Focus (radio: Combat / Puzzle / Roleplay / Mixed)

**Step E — Run Logistics**
- Estimated Run Time (number input, minutes), Reset Time (number input, hours), Time Limit Per Run (number input, minutes; blank = no limit)

**Step F — Amenities & Loot**
- Has Safe Room, Has Merchant, Equipment Provided, Guide/GM Provided (boolean toggles)
- Loot Type (radio: Guaranteed / Random / None), Boss Loot (boolean), Unique Item Chance (boolean)

**Component behavior:**
- A progress indicator shows which step the provider is on (e.g. "Step 2 of 6").
- "Back" and "Next" buttons navigate between steps. "Next" validates only the current step's required fields before advancing.
- On the final step, a "Publish Location" (or "Save Changes") button submits the full payload.
- All steps after Step A are optional — the provider may skip any step by clicking "Next" without filling in fields. Only Name, Description, and Difficulty (Step A) are required to submit.
- The survey state is held in a single `useState` object in the parent page component. The survey component receives `formState` and `onChange` as props — it is controlled.
- On edit (`ProviderLocationEdit`), the survey is pre-populated from the `useMyLocation(id)` data.

**Files created:**
- `questreserve-frontend/src/components/LocationSurvey/LocationSurvey.tsx`

**Files changed:**
- `questreserve-frontend/src/pages/ProviderLocationNew/ProviderLocationNew.tsx`
- `questreserve-frontend/src/pages/ProviderLocationEdit/ProviderLocationEdit.tsx`

---

### Step 7: Frontend — Expanded customer filter UI

Replace `LocationFilterBar` (Phase 10.3, difficulty only) with a new `LocationFilterPanel` component that exposes the priority filters defined for MVP. The panel is a controlled component driven entirely by URL params (same `useSearchParams` pattern as Phase 10.3).

**Priority filters (displayed prominently, always visible):**
- Level Range: two number inputs (min, max) — maps to `levelRangeMin` / `levelRangeMax` URL params
- Run Time (max): number input (minutes) — maps to `runTimeMax` URL param
- Setting: radio group (Any / Interior / Exterior / Both) — maps to `setting` URL param
- Landscape Type: select — maps to `landscapeType` URL param
- Tone: checkbox group (Horror / Heroic / Comedic / Mystery / Political) — maps to `toneTag` URL param (single value per the backend filter; if multiple tones are checked, apply only the first or use a "last selected wins" approach and document it)
- Party Size: two number inputs (min, max) — maps to `partySizeMin` / `partySizeMax` URL params
- Difficulty: existing filter, preserved — maps to `difficulty` URL param

**Secondary filters (collapsed behind a "More Filters" toggle):**
- Access Requirements (display-only on location cards; not wired to backend filter in this phase — deferred, see Notes)
- Amenities (display-only; deferred)

**"Clear All Filters" button:** Removes all filter params from the URL.

`BrowseLocations.tsx` is updated to:
1. Read all priority filter params from `useSearchParams`.
2. Pass all params to `useBookingLocations(filters)`.
3. Render `LocationFilterPanel` instead of `LocationFilterBar`.

`useBookingLocations` hook is updated to pass all filter fields to `getBookingLocations` in `customer.api.ts`. `getBookingLocations` serialises them all into the Axios `params` object for the `GET /api/customer/locations` request.

**Files created:**
- `questreserve-frontend/src/components/LocationFilterPanel/LocationFilterPanel.tsx`

**Files changed:**
- `questreserve-frontend/src/pages/BrowseLocations/BrowseLocations.tsx`
- `questreserve-frontend/src/hooks/useBookingLocations.ts`
- `questreserve-frontend/src/api/customer.api.ts`

---

### Step 8: Frontend — Display expanded ruleset on location detail pages

Update the customer and guest location detail pages to display the new ruleset fields. Group fields by category (matching the survey step grouping) with clear section headers. Fields that are null or empty are omitted from the display — do not render empty sections.

**Suggested display sections:**
- **Core Specs:** Party Size, Level Range
- **Environment:** Landscape, Setting, Environment Tags
- **Restrictions:** Magic, Class/Race/Faction restrictions, Physical Access, Mount/Familiar/Solo, Booking Type
- **Tone & Content:** Tone Tags, Gore Level, Non-Lethal/Permadeath/Boss/PvP/Scouting flags
- **Run Logistics:** Run Time, Reset Time, Time Limit
- **Amenities & Loot:** Amenities flags, Loot Type, Boss Loot, Unique Item Chance

Display uses design tokens consistent with the Phase 7/8 design system. Boolean flags are displayed as badge-style chips (e.g. "Mount Permitted", "Permadeath Risk") using Spell Gold or a warning tone as appropriate.

**Files changed:**
- Customer location detail page (confirm exact file path from codebase)
- Guest location detail page (confirm exact file path from codebase)

---

### Step 9: End-to-end verification

Verify the full Phase 11.7 feature set against a running backend with updated seed data. No new source code is written in this step.

**Test paths:**

1. **Migration** — Confirm the migration runs cleanly. Confirm all new columns exist on `booking_location`. Confirm existing seed data rows are unaffected (all new columns are null for legacy rows).
2. **Provider survey (create)** — Log in as a provider. Navigate to "Add Location". Complete all six survey steps with varied data. Submit. Confirm the new location appears on the dashboard with the correct metadata.
3. **Provider survey (edit)** — Navigate to "Edit Location" for an existing location. Confirm all survey steps are pre-populated with existing values. Change a value on Step C and submit. Confirm the change is reflected on the location detail page.
4. **Filter — level range** — On Browse Locations, enter a level range. Confirm only locations within that range appear. Confirm the URL updates with `levelRangeMin` / `levelRangeMax`.
5. **Filter — run time** — Set a max run time of 60 minutes. Confirm only locations with `run_time_minutes <= 60` appear.
6. **Filter — setting** — Filter by "Interior". Confirm only interior locations appear.
7. **Filter — landscape** — Filter by "Cave". Confirm only cave locations appear.
8. **Filter — tone** — Select "Horror". Confirm only locations with `horror` in `tone_tags` appear.
9. **Filter — party size** — Enter a party size range. Confirm overlap logic works correctly (locations whose min–max range overlaps the requested range are returned).
10. **Filter — URL persistence** — Set multiple filters. Refresh the page. Confirm all filter values are re-applied from the URL.
11. **Clear All** — Click "Clear All Filters". Confirm all params are removed from the URL and all locations are returned.
12. **Location detail** — Navigate to a location with full ruleset data. Confirm all non-null fields are displayed in the correct category sections. Confirm null fields are not shown.
13. **Invalid filter values** — Attempt a direct API call with `setting=diagonal`. Confirm the backend returns `400`.

---

## Notes

- **Array-column filters deferred.** Filtering by array columns (`class_restrictions`, `race_restrictions`, `faction_restrictions`, `magic_restrictions`, `environment_tags`, `party_composition_tags`, `physical_access`) is not implemented as a backend query filter in this phase. These fields are displayed as metadata on location detail pages. Full array-column filtering is a Phase 11.8 or post-MVP enhancement — the Will AI assistant (Phase 11.8) will surface these indirectly via natural language rather than direct UI controls.
- **Tone tag filter — single value.** The customer filter UI supports selecting one tone tag at a time. Multi-tone filter (e.g. "show horror OR mystery") requires an `ANY(array)` style query that introduces complexity not warranted for MVP. If the implementer finds this unacceptable UX, a single `whereRaw('? = ANY(tone_tags)', [toneTag])` approach accommodates one value. Document which approach is shipped.
- **`LocationFilterBar` retirement.** The existing `LocationFilterBar` component from Phase 10.3 is superseded by `LocationFilterPanel`. `LocationFilterBar` should be deleted (not kept alongside) to avoid a dead component in the codebase.
- **Survey step validation.** Only Step A fields (Name, Description, Difficulty) are required for submission. "Next" on Steps B–F always succeeds — validation on these steps is UX guidance only (e.g. if `party_size_min` is entered, `party_size_max` should also be entered; warn but do not block).
- **Survey state management.** The full survey payload is held in a single state object in `ProviderLocationNew` / `ProviderLocationEdit`. The `LocationSurvey` component is controlled (receives state + onChange). This keeps the survey component stateless and testable.
- **`LocationForm` replacement.** The original `LocationForm` component from Phase 11 Step 4 is replaced by `LocationSurvey`. `LocationForm` should be deleted after `ProviderLocationNew` and `ProviderLocationEdit` are updated to use `LocationSurvey`. This avoids a stale component.
- **Filter parameter naming is API-stable.** The query parameter names defined in Step 3 (`levelRangeMin`, `levelRangeMax`, `runTimeMax`, `setting`, `landscapeType`, `toneTag`, `partySizeMin`, `partySizeMax`) are consumed by the Phase 11.8 Will AI assistant. Do not rename them post-11.7.
- **Step sequence.** Step 1 (migration) must precede all other steps. Steps 2 and 3 (backend) can proceed in parallel after Step 1. Step 4 (seeds) can proceed after Step 1. Step 5 (frontend types/API) can proceed after Steps 1–3 are functionally stable. Steps 6, 7, and 8 (frontend) can proceed in parallel after Step 5. Step 9 closes the phase and requires all prior steps complete.
- **Phase 11.8 unblocked by this phase.** Will's structured JSON output must map to the exact filter param schema established in Steps 2–3 and 7. Phase 11.8 planning should reference this document's filter parameter table (Step 2) as the canonical mapping.
