# Phase 11.8: "Will" AI Location Assistant (Will-o'-the-Wisp)

_Created: 2026-06-15 | Status: DRAFT_

## Goal

Introduce Will, a conversational AI assistant styled as a will-o'-the-wisp, that accepts a customer's natural language description of what they're looking for and translates it into filter selections on the Browse Locations page. Will bridges the gap between the rich filter schema introduced in Phase 11.7 and customers who don't know how to navigate it — turning "a spooky underground cave for 4–6 players, nothing too deadly" into snapped filter state the customer can see and adjust.

## Context

Phase 11.7 (Expanded Location Rulesets & Provider Survey) is a hard prerequisite for this phase. The customer-facing filter schema it established — the query parameter names, enum values, and filter logic — is what Will's structured JSON output must map to. The canonical filter parameter mapping is defined in the Phase 11.7 phase plan (Step 2, filter parameter table). Those names are API-stable and must not be changed after 11.7 ships.

The codebase this phase builds on:

- **Backend:** `GET /api/customer/locations` now accepts `levelRangeMin`, `levelRangeMax`, `runTimeMax`, `setting`, `landscapeType`, `toneTag`, `partySizeMin`, `partySizeMax`, and `difficulty` as query parameters, validated at the controller and applied at the repository via Knex clauses.
- **Frontend:** `BrowseLocations` is a split-panel page driven by `useSearchParams`. `LocationFilterPanel` is a controlled component that reads from and writes to URL params. `useBookingLocations` passes all filter fields to `customer.api.ts`, which serializes them into the Axios `params` object.
- **No AI infrastructure exists yet.** There is no `POST /ai/location-filter` endpoint, no Claude API integration, and no Will UI of any kind. This phase builds all of it.

**User-dependent asset prerequisite:** Visual assets for Will — an orb illustration and glow/animation style direction — are a user-deliverable that is required for final visual polish. This phase begins with placeholder CSS styling (a glowing pulsing circle) and proceeds to completion with that placeholder. Final polish (replacing the placeholder with approved visuals) is blocked until the user provides or approves assets. This is called out explicitly in Step 5 below.

---

## Steps

### Step 1: Backend — Claude API client module

Create a backend module that wraps calls to the Claude API. This module is responsible for constructing the HTTP request to Anthropic's API, injecting the API key from environment variables, and returning the raw model response. It is not Will-specific — it is a thin, reusable client.

**What it does:**
- Reads `ANTHROPIC_API_KEY` from `process.env`. The key is never passed to the frontend.
- Exports a single function, e.g. `callClaude({ system, user, model })`, that posts to `https://api.anthropic.com/v1/messages`.
- Uses the `claude-sonnet-4-6` model (or the most capable model available at implementation time — implementer should verify the current recommended model slug in the Anthropic docs).
- Returns the text content of the first response message.
- Throws a typed error if the API call fails (non-2xx, network error, or malformed response), with the Anthropic response body included in the error detail.

**Files created:**
- `questreserve-backend/src/ai/claude.client.ts`

**Dependencies:** None. This step can begin immediately.

---

### Step 2: Backend — Will's system prompt and filter-mapping logic

Define Will's personality and output contract in a dedicated module. This is the prompt engineering step — it shapes what Will says and what JSON structure Will produces.

**System prompt content:**
- Establishes Will as a mysterious, whimsical spirit guide — not a chatbot. Instructs the model to respond in character with short, flavored prose (1–3 sentences), followed by a structured JSON block.
- Instructs the model that its response must always contain a JSON object (fenced or inline, consistent) with keys that map to the Phase 11.7 filter schema. The JSON must use exactly these keys (all optional):
  - `difficulty` — string: one of `easy`, `medium`, `hard`, `deadly`
  - `levelRangeMin` — integer
  - `levelRangeMax` — integer
  - `partySizeMin` — integer
  - `partySizeMax` — integer
  - `setting` — string: one of `interior`, `exterior`, `both`
  - `landscapeType` — string: one of `tundra`, `forest`, `desert`, `cave`, `coastal`, `volcanic`, `urban`, `plains`, `mountain`, `swamp`
  - `toneTag` — string: one of `horror`, `heroic`, `comedic`, `mystery`, `political`
  - `runTimeMax` — integer (minutes)
- Instructs the model that if a field cannot be inferred from the customer's request, it must be omitted from the JSON — never emit null or empty string for a field that is uncertain.
- Instructs the model to end the response with the JSON block so it can be reliably extracted.

**Filter parsing logic:**
- Export a function `parseWillResponse(rawText: string): WillResponse` that extracts Will's prose and the JSON block from the raw model output.
- Returns `{ message: string, filters: LocationFilterParams }` where `LocationFilterParams` matches the keys above.
- If no valid JSON block is found, returns `{ message: rawText, filters: {} }` — the empty filters case is handled gracefully in Step 3.

**Files created:**
- `questreserve-backend/src/ai/will.prompt.ts` (system prompt string and `parseWillResponse` function)
- `questreserve-backend/src/ai/types.ts` (shared types: `WillResponse`, `LocationFilterParams`)

**Dependencies:** Step 1 (Claude client must exist before the prompt module is integrated in Step 3).

---

### Step 3: Backend — POST /ai/location-filter endpoint

Create the `ai` router and implement the `POST /ai/location-filter` endpoint that orchestrates the Claude call and returns Will's response to the frontend.

**What it does:**
- Accepts a JSON request body: `{ message: string }` where `message` is the customer's natural language input.
- Validates that `message` is a non-empty string (no longer than 500 characters); returns `400` if not.
- Calls `callClaude` with Will's system prompt and the customer's message as the user turn.
- Calls `parseWillResponse` on the model output.
- Returns a `200` response body: `{ message: string, filters: LocationFilterParams }`.
- If the Claude API call throws (network failure, quota error, API key invalid, etc.), catches the error and returns a `200` response with a graceful fallback: `{ message: "The mist grows thick... I've lost the thread. Speak to me again, traveler.", filters: {} }`. This is the canonical fallback copy — Will never returns a 5xx to the customer UI.
- The endpoint is public (no `authenticate` middleware required — guests and customers both have access to Will).

**Router registration:**
- Create `questreserve-backend/src/api/ai/ai.router.ts` and register it on the root API router at `/ai`.

**Files created:**
- `questreserve-backend/src/api/ai/ai.router.ts`
- `questreserve-backend/src/api/ai/ai.controller.ts`

**Files changed:**
- Root API router (wherever `/api/customer`, `/api/provider`, etc. are mounted — confirm exact file path from codebase)

**Dependencies:** Steps 1 and 2.

---

### Step 4: Frontend — Will API module and types

Add a client-side API function and the shared TypeScript types needed to call `POST /ai/location-filter` from the frontend.

**What it does:**
- Creates `will.api.ts` in the frontend API directory with a single exported function `askWill(message: string): Promise<WillApiResponse>`.
- `WillApiResponse` is typed as `{ message: string; filters: LocationFilterParams }` where `LocationFilterParams` uses the same keys as the backend types (these should be co-located or imported from a shared types file in the frontend — confirm pattern from existing `customer.api.ts`).
- Uses the existing Axios instance (or fetch setup, matching the pattern in `customer.api.ts`) for the request.

**Files created:**
- `questreserve-frontend/src/api/will.api.ts`
- `questreserve-frontend/src/types/will.types.ts` (or equivalent, matching the frontend's existing types directory convention)

**Dependencies:** Step 3 (endpoint must exist for integration, though frontend types can be drafted in parallel against the agreed contract).

---

### Step 5: Frontend — Will orb UI and chat panel (placeholder styling)

Build the floating Will orb button and expandable chat panel as a self-contained component. This step uses placeholder CSS styling — a glowing pulsing circle — because final visual assets have not yet been provided by the user.

**USER-DEPENDENT ASSET FLAG:** Final visual polish (replacing the placeholder circle with an approved orb illustration and any asset-driven glow references) is blocked until the user provides or approves visual assets. The component is built to completion with placeholder styling and marked with a code comment noting where the asset swap occurs.

**Component: `WillOrb`**

- Renders as a fixed-position floating button in the bottom-right corner of the viewport (e.g. `position: fixed; bottom: 2rem; right: 2rem`).
- Default state: a circular glowing element with a CSS pulse animation (keyframe animation cycling opacity and box-shadow scale). Uses Spell Gold or a luminescent equivalent from the Phase 7/8 design token system as the glow color. The orb is visually distinct and recognizable as a character element, not a generic action button.
- Click state: the orb expands to reveal a small chat panel overlaid above it (or the orb transitions to a header element of the panel).
- The panel contains:
  - Will's avatar/orb representation at the top (placeholder: the same glowing circle, smaller)
  - A text input area labeled with Will's voice (e.g., placeholder text: "Describe your quest, traveler…")
  - A "Send" button (or Enter key) to submit the message
  - A response area below the input that shows Will's in-character prose reply
  - A "Clear" button that resets the input, clears the response, and removes all Will-applied filter params from the URL
  - A close button (×) to collapse the panel back to the orb

**Behavior:**
- Single-turn: customer types a message and submits. Will responds with prose. Filters snap into place in the URL (handled in Step 6). The customer can then adjust filters manually via `LocationFilterPanel` as normal.
- While awaiting response: the orb pulses faster (CSS animation speed change) or a loading indicator appears in the panel. The input and Send button are disabled.
- On error / fallback response: Will's fallback message is displayed in the response area. No filters are applied.
- Panel dismissal does not clear applied filters — only the explicit "Clear" button does.

**CSS animation:** A keyframe pulse using `box-shadow` and `opacity` only. No JavaScript animation libraries. No external animation dependencies. The animation is defined in a co-located CSS module (`.module.css`) or styled-component, matching the pattern used elsewhere in the frontend.

**Files created:**
- `questreserve-frontend/src/components/WillOrb/WillOrb.tsx`
- `questreserve-frontend/src/components/WillOrb/WillOrb.module.css` (or equivalent per project styling convention)

**Dependencies:** Step 4 (API module must be importable). This step can be built in parallel with Step 4 using a stub for `askWill`.

---

### Step 6: Frontend — Filter application logic (Will → URL params)

Wire Will's response into the existing URL-param-driven filter system so that when Will returns a `filters` object, those filters snap into place in the URL, causing `LocationFilterPanel` and `useBookingLocations` to react automatically.

**What it does:**
- Inside `WillOrb` (or in a hook it calls), after `askWill` resolves successfully, iterates the returned `filters` object and sets each key as a URL search param using `useSearchParams`'s `setSearchParams`.
- Clears any previously set filter params before applying Will's new set (so Will's response always represents a fresh filter state, not additive to existing manual selections).
- If `filters` is empty (fallback case or Will inferred nothing), `setSearchParams` is called with no Will-sourced params — existing manual filters are also cleared to avoid stale state.
- The "Clear" button in the `WillOrb` panel calls `setSearchParams({})` to remove all filter params from the URL, resetting both Will-applied and manually-applied filters.
- No new hooks or state management beyond `useSearchParams` are introduced — the filter state lives entirely in the URL, consistent with Phase 11.7.

**Files changed:**
- `questreserve-frontend/src/components/WillOrb/WillOrb.tsx` (primary location for this logic)

**Dependencies:** Steps 4 and 5. Step 7 (mounting Will on `BrowseLocations`) is also required before this can be exercised end-to-end, but the filter-wiring logic itself lives inside `WillOrb`.

---

### Step 7: Frontend — Mount WillOrb on BrowseLocations page

Add `WillOrb` to the `BrowseLocations` page so it appears for all visitors to the browse view (guests and authenticated customers alike).

**What it does:**
- Imports and renders `<WillOrb />` inside `BrowseLocations.tsx`.
- `WillOrb` is positioned fixed, so it does not affect the page layout.
- No props are required — `WillOrb` reads and writes URL params internally.
- Will is visible and usable on both the guest and authenticated customer versions of the Browse Locations page (if these share the same `BrowseLocations` component, this is automatic; if not, confirm both render paths).

**Files changed:**
- `questreserve-frontend/src/pages/BrowseLocations/BrowseLocations.tsx`

**Dependencies:** Steps 5 and 6.

---

### Step 8: End-to-end verification

Verify the complete Phase 11.8 feature set against a running backend with the Anthropic API key configured. No new source code is written in this step. All failures discovered must be fixed (as separate commits) before the phase is closed.

**Test paths:**

1. **Endpoint — valid request** — POST to `/ai/location-filter` with `{ "message": "a spooky underground cave for a party of 4 to 6, nothing too deadly" }`. Confirm the response body contains a `message` string (Will's in-character prose) and a `filters` object with at least `landscapeType: "cave"` and `toneTag: "horror"` (or similar inferred values). The exact JSON keys must match the Phase 11.7 filter schema.
2. **Endpoint — invalid body** — POST with no `message` field. Confirm `400` is returned. POST with `message` exceeding 500 characters. Confirm `400` is returned.
3. **Endpoint — graceful fallback** — Temporarily set an invalid API key and POST a valid request. Confirm the response is `200` with Will's fallback prose and `filters: {}`. Restore the valid key.
4. **Orb appearance** — Navigate to Browse Locations as a guest. Confirm the glowing orb is visible in the bottom-right corner. Confirm the pulse animation is running. Confirm no console errors.
5. **Orb open/close** — Click the orb. Confirm the chat panel expands. Click the × button. Confirm the panel collapses back to the orb.
6. **Full turn — filter snap** — Open the panel. Type "a spooky underground cave for 4–6 players". Submit. Confirm Will's response prose appears in the panel. Confirm the URL updates with the inferred filter params (e.g. `landscapeType=cave&toneTag=horror`). Confirm `LocationFilterPanel` reflects those values. Confirm the location list updates to show only matching results.
7. **Loading state** — Submit a message and confirm the orb/panel shows a loading state and the input is disabled while the request is in flight.
8. **Fallback UI** — Simulate a failed API call (can temporarily break the endpoint). Confirm Will's fallback message appears in the panel. Confirm no filters are applied to the URL.
9. **Clear button** — After Will applies filters, click "Clear". Confirm all filter params are removed from the URL. Confirm the location list returns to showing all results. Confirm Will's response text is cleared from the panel.
10. **Manual override** — After Will applies filters, manually change a filter value in `LocationFilterPanel`. Confirm the URL updates correctly. Confirm Will's panel remains open (dismissal is not triggered by manual filter changes).
11. **ANTHROPIC_API_KEY safety** — Confirm the API key is never present in any frontend bundle, network request from the browser, or console output. The key must only travel from the server's environment to Anthropic's API.

---

## Notes

- **Filter schema is Phase 11.7's responsibility.** Will's JSON output keys must exactly match the query parameter names from Phase 11.7. If any parameter name changes after 11.7 ships, both the system prompt in `will.prompt.ts` and the backend controller must be updated in lockstep.
- **Single-turn design.** Will is not a multi-turn chatbot. Each submission is an independent call — no conversation history is maintained. This keeps the implementation simple and avoids session/memory management complexity.
- **Graceful fallback is a 200, never a 5xx.** The customer UI must never see an error state caused by the AI backend. All Claude API failures are caught at the controller level and converted to Will's in-character fallback prose with empty filters.
- **Model slug.** The system prompt module specifies `claude-sonnet-4-6` as the default model. If a newer or more capable slug is available at implementation time, the implementer should verify and update the constant — this is a one-line change in `claude.client.ts` or a config constant.
- **API key environment variable.** `ANTHROPIC_API_KEY` must be added to the backend `.env` file and documented in any `.env.example` or equivalent reference file. The frontend must not have access to this variable.
- **Public endpoint.** `POST /ai/location-filter` is intentionally unauthenticated — guests can use Will without logging in. Rate limiting is a post-MVP concern.
- **Visual asset placeholder.** The placeholder orb (glowing CSS circle with pulse animation) is shipped and fully functional. When the user delivers approved visual assets, a targeted styling update replaces the placeholder — no structural component changes are needed.
- **Array-column fields not surfaced by Will.** The Phase 11.7 filter schema does not expose array-column filters (magic restrictions, class restrictions, physical access, etc.) as query parameters. Will's JSON output schema mirrors this: Will cannot filter by these fields. They are metadata-only on the detail page.
- **`difficulty` enum values.** The system prompt must list the exact `difficulty` enum values accepted by the backend. Confirm these values against the existing `booking_location.difficulty` column constraint before finalizing the prompt.
- **Step sequence.** Steps 1 and 2 (backend AI infrastructure) can proceed in parallel. Step 3 depends on Steps 1 and 2. Step 4 (frontend types/API) can be drafted in parallel against the agreed contract but requires Step 3 for live integration. Steps 5, 6, and 7 (frontend UI) can proceed after Step 4 is stubbed — Step 7 closes the loop. Step 8 requires all prior steps complete.
