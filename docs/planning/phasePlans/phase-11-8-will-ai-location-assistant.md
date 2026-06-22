# Phase 11.8: "Will" AI Location Assistant (Will-o'-the-Wisp)

_Created: 2026-06-15 | Updated: 2026-06-21 | Status: REWORKED_

## Goal

Introduce Will, a conversational assistant styled as a will-o'-the-wisp, that accepts a customer's natural language description of what they're looking for and translates it into filter selections on the Browse Locations page. Will bridges the gap between the rich filter schema introduced in Phase 11.7 and customers who don't know how to navigate it — turning "a spooky underground cave for 4–6 players, nothing too deadly" into snapped filter state the customer can see and adjust.

**Architecture decision (2026-06-21):** The original implementation used a Claude API backend approach (POST /api/ai/location-filter, Anthropic client module). This was reworked to a fully client-side keyword/rule matching approach. No Claude API dependency, no backend AI route, no ANTHROPIC_API_KEY required.

## Context

Phase 11.7 (Expanded Location Rulesets & Provider Survey) is a hard prerequisite for this phase. The customer-facing filter schema it established — the URL parameter names, enum values, and filter logic — is what Will's keyword output must map to. **The canonical filter schema is defined by the live codebase.** The `LocationFilters` interface in `questreserve-frontend/src/types/domain.ts` and the `readFiltersFromParams` function in `BrowseLocations.tsx` are the authoritative sources.

**Authoritative filter schema (from live code as of 2026-06-21):**

| URL param | Type | Values / notes |
|---|---|---|
| `difficulties` | `Difficulty[]` | Comma-separated; `EASY`, `MEDIUM`, `HARD`, `LEGENDARY` (uppercase) |
| `levelRangeMin` | `number` | Positive integer |
| `levelRangeMax` | `number` | Positive integer |
| `runTimeMax` | `number` | Positive integer (minutes) |
| `setting` | `LocationSetting` | `interior` or `exterior` (no `both` value) |
| `landscapeType` | `LandscapeType` | `tundra`, `forest`, `desert`, `cave`, `coastal`, `volcanic`, `urban`, `plains`, `mountain`, `swamp` |
| `toneTags` | `ToneTag[]` | Comma-separated; `horror`, `heroic`, `comedic`, `mystery`, `political` |
| `partySizeMin` | `number` | Positive integer |
| `partySizeMax` | `number` | Positive integer |

---

## Architecture: Client-Side Keyword Matching

Will operates entirely in the browser. No network call is made when a user submits a query. The matching logic lives in `questreserve-frontend/src/utils/willMatcher.ts` and exports a pure function `matchFilters(input: string): Partial<LocationFilters>`.

**How it works:**

1. The input string is lowercased.
2. Keyword tables are checked for matches against the input:
   - Landscape/terrain keywords map to `landscapeType`
   - Tone keywords map to entries in `toneTags` (multiple matches allowed)
   - Difficulty keywords map to entries in `difficulties` (multiple matches allowed)
   - Setting keywords map to `setting`
   - Numeric patterns (party of N, N players, level N, etc.) extract `partySizeMin/Max` and `levelRangeMin/Max`
   - Run-time phrases map to `runTimeMax` (minutes)
3. Only matched fields are included in the output — unmatched fields are omitted entirely.
4. The function is pure: no side effects, no API calls.

**Canned prompts** (`CANNED_PROMPTS` array in `willMatcher.ts`) provide 5–6 pre-built filter objects with Will-flavored labels. Clicking a chip in the WillOrb panel populates the textarea and immediately applies those filters.

**Will's in-character responses** are generated locally based on what filters were matched. No LLM is involved.

---

## Steps

### Step 1: Backend — Claude API client module (REMOVED)

~~Create a backend module that wraps calls to the Claude API.~~

**Status: Removed.** The `questreserve-backend/src/ai/` module (claude.client.ts, will.prompt.ts, types.ts) has been deleted. No Claude API dependency exists in the codebase.

---

### Step 2: Backend — Will's system prompt and filter-mapping logic (REMOVED)

~~Define Will's personality and output contract in a dedicated module.~~

**Status: Removed.** The system prompt and parseWillResponse logic have been removed along with the ai/ module. Filter mapping is now handled client-side in `willMatcher.ts`.

---

### Step 3: Backend — POST /ai/location-filter endpoint (REMOVED)

~~Create the `ai` router and implement the `POST /ai/location-filter` endpoint.~~

**Status: Removed.** The `questreserve-backend/src/api/ai/` directory (ai.router.ts, ai.controller.ts) has been deleted and the AI router has been unregistered from the root API router.

---

### Step 4: Frontend — Will API module and types (REMOVED)

~~Add a client-side API function and shared TypeScript types to call `POST /ai/location-filter`.~~

**Status: Removed.** `questreserve-frontend/src/api/will.api.ts` and `questreserve-frontend/src/types/will.types.ts` have been deleted. No network call is made for Will queries.

---

### Step 5: Frontend — Client-side keyword matcher

Create `questreserve-frontend/src/utils/willMatcher.ts` exporting:
- `matchFilters(input: string): Partial<LocationFilters>` — pure keyword matching function
- `CANNED_PROMPTS: Array<{ label: string; filters: Partial<LocationFilters> }>` — 5–6 pre-built filter sets with Will-flavored labels

**Keyword coverage:**
- Landscape: cave/underground/cavern, forest/woods/jungle, desert/sand/arid, mountain/alpine/peak, swamp/marsh/bog, coastal/ocean/sea/beach, volcanic/lava/magma, tundra/arctic/frozen/icy, urban/city/town, plains/grassland/meadow/field
- Tone (multi-match): spooky/scary/eerie/creepy/haunted/horror → horror; heroic/epic/legendary/glorious → heroic; funny/comedic/silly/lighthearted → comedic; mystery/mysterious/investigative → mystery; political/intrigue/court/noble → political
- Difficulty (multi-match): easy/beginner/simple/starter → EASY; medium/moderate/average → MEDIUM; hard/difficult/challenging/tough → HARD; deadly/lethal/extreme/brutal/punishing → LEGENDARY
- Setting: indoor/inside/interior/enclosed → interior; outdoor/outside/exterior/open air/open-air → exterior
- Party size: "party of N", "N players", "N to M", "solo", "group of N", etc.
- Level range: "level N", "level N-M", "lvl N to M", "experienced/veteran" → min 10; "novice/beginner" → min 1
- Run time: quick/short/1 hour → runTimeMax 60; half day/3-4 hours → runTimeMax 240; full day/long/6+ hours → runTimeMax 480

**Note on tone keyword "legendary":** The word "legendary" maps to `heroic` tone (not LEGENDARY difficulty) when no other difficulty context is present. The keyword "legendary" in difficulty context (deadly/extreme/punishing) maps to LEGENDARY difficulty. The matcher uses the full phrase context — "legendary difficulty" → LEGENDARY difficulty, standalone "legendary/glorious/epic" → heroic tone.

**Files created:**
- `questreserve-frontend/src/utils/willMatcher.ts`

---

### Step 6: Frontend — Will orb UI and chat panel

Build the floating Will orb button and expandable chat panel as a self-contained component.

**Component: `WillOrb`**

- Fixed-position floating element, bottom-right corner (`position: fixed; bottom: 2rem; right: 2rem; z-index: 100`).
- **Collapsed state:** Glowing circular button with CSS pulse animation (`@keyframes`), using `--accent` CSS property. Diameter ~56px.
- **Expanded state:** Chat panel above the orb anchor. Contains:
  - Header row with Will's name and close button
  - Response display area (Will's in-character prose, local — no network call)
  - 5–6 canned prompt chips (small clickable buttons) — clicking populates textarea and immediately applies filters
  - `<textarea>` input ("Describe your quest, traveler…")
  - "Ask Will" submit button (or Enter key)
  - "Clear" button

**Behavior:**
- Canned chip click: populates textarea with chip label, immediately runs `matchFilters` and applies filters to URL params, shows Will's in-character response.
- Free text submit: runs `matchFilters(input)` locally (no network call), applies matched filters to URL, shows in-character confirmation.
  - Filters matched: "I sense the [terrain/tone description]… I've set your path."
  - No filters matched: "The mist swirls without direction… try describing the peril or terrain you seek."
- No loading state (response is instant).
- Clear button: clears URL params, response text, and input.
- Panel dismiss (×): does not clear filters.

**USER-DEPENDENT ASSET FLAG:** Final visual polish (replacing placeholder circle) is blocked until user provides or approves visual assets. `// ASSET: replace with approved orb illustration` marks the swap point.

**Files created/changed:**
- `questreserve-frontend/src/components/WillOrb/WillOrb.tsx`
- `questreserve-frontend/src/components/WillOrb/WillOrb.module.css` (if split out from inline styles)

---

### Step 7: Frontend — Mount WillOrb on BrowseLocations page

`WillOrb` is already mounted on BrowseLocations from the initial implementation. No additional work required if the component is in place.

**Files changed:**
- `questreserve-frontend/src/pages/BrowseLocations/BrowseLocations.tsx` (already done)

---

### Step 8: End-to-end verification

Verify the complete Phase 11.8 feature set with the keyword-matching approach. No Claude API or ANTHROPIC_API_KEY is needed.

**Test paths:**

1. **Orb appearance** — Navigate to Browse Locations. Confirm the glowing orb is visible bottom-right. Confirm pulse animation is running. Confirm no console errors.
2. **Orb open/close** — Click orb. Panel expands. Click ×. Panel collapses. Filters in URL are unaffected.
3. **Canned chips visible** — Open panel. Confirm 5–6 canned prompt chips appear above the textarea.
4. **Chip click** — Click a chip. Confirm textarea is populated with chip label. Confirm URL updates with chip's filters. Confirm `FilterPanelDrawer` reflects those values.
5. **Free text — match** — Type "a spooky underground cave". Submit. Confirm URL updates with `landscapeType=cave&toneTags=horror`. Confirm Will's in-character response appears.
6. **Free text — no match** — Type "xyzzy". Submit. Confirm Will's "mist swirls" response. Confirm no filters applied.
7. **Multi-value tone** — Type "heroic horror adventure". Confirm `toneTags=heroic,horror` in URL.
8. **Multi-value difficulty** — Type "hard and deadly". Confirm `difficulties=HARD,LEGENDARY` in URL.
9. **Party size extraction** — Type "party of 4 to 6". Confirm `partySizeMin=4&partySizeMax=6`.
10. **Level range extraction** — Type "level 5 to 10". Confirm `levelRangeMin=5&levelRangeMax=10`.
11. **Clear button** — After filters applied, click Clear. Confirm URL params cleared. Confirm list shows all results.
12. **No network call** — Open DevTools Network tab. Submit a query. Confirm no request is made to `/api/ai/location-filter` or any Anthropic endpoint.
13. **Guest path** — Confirm Will works for unauthenticated guests (no 401, no redirect).

---

## Notes

- **No backend AI route.** The `/api/ai/location-filter` endpoint has been removed. The backend `src/ai/` module has been deleted. No ANTHROPIC_API_KEY is needed for Will to function.
- **Instant responses.** Because matching is local, Will's response is synchronous — no loading state needed.
- **Filter schema is live codebase.** Authoritative source remains `LocationFilters` in `domain.ts` and `readFiltersFromParams` in `BrowseLocations.tsx`.
- **`setting` has no `both` value.** Only `interior` and `exterior` are valid.
- **Single-turn design.** Each submission is independent. No conversation history.
- **`filtersToParams` is in `src/utils/filters.ts`.** Both `BrowseLocations` and `WillOrb` import from there.
- **Visual asset placeholder.** Placeholder orb (glowing CSS circle) ships as MVP. Asset swap is post-user-delivery.
- **Canned prompts are static.** `CANNED_PROMPTS` is a compile-time constant in `willMatcher.ts`.

## Out of Scope

- **Multi-turn conversation.** Each submission is a fresh, independent match.
- **Final visual assets.** Blocked on user delivery.
- **NLP/AI matching.** Will uses deterministic keyword tables only. No probabilistic or learned matching.
- **Array-column filtering via Will.** Will cannot filter by magic restrictions, class restrictions, physical access, etc.
- **Will on pages other than Browse Locations.**
- **Saved Will sessions or history.**
- **Multi-language support.**
