# Ticket Plan: Phase 11.8 — "Will" AI Location Assistant (Will-o'-the-Wisp)

**Purpose:** Add Will, a Claude-powered conversational assistant styled as a will-o'-the-wisp, that translates natural language location requests into snapped filter selections on the Browse Locations page.
**Total tickets:** 8
**Prefix:** P11.8:
**Status: LOCKED**

---

## Ticket 1 of 8

**Title:** P11.8:Implement Claude API client module on the backend

**Description:**
Create `questreserve-backend/src/ai/claude.client.ts`, a thin, reusable module that wraps calls to Anthropic's Messages API. The module reads `ANTHROPIC_API_KEY` from `process.env`, posts to `https://api.anthropic.com/v1/messages`, and returns the text content of the first response message. The API key must never be exposed to the frontend. Document `ANTHROPIC_API_KEY` in `.env.example` or the equivalent reference file.

**Acceptance Criteria:**
- [ ] `questreserve-backend/src/ai/claude.client.ts` exists and exports a `callClaude({ system, user, model })` function (or equivalent signature)
- [ ] `ANTHROPIC_API_KEY` is read from `process.env` inside the module; it is not accepted as a parameter and never logged
- [ ] The function uses `claude-sonnet-4-6` as the default model (implementer verifies the current recommended slug against Anthropic docs at implementation time)
- [ ] A successful call returns the string text content of the first response message
- [ ] A non-2xx response, network error, or malformed response throws a typed error that includes the Anthropic response body in its detail
- [ ] `ANTHROPIC_API_KEY` is documented in `.env.example` (or equivalent) with a placeholder value and a note that it is required for Will to function
- [ ] The frontend build has no access to this environment variable

---

## Ticket 2 of 8

**Title:** P11.8:Implement Will's system prompt and filter-mapping parser

**Description:**
Create `questreserve-backend/src/ai/will.prompt.ts` containing Will's system prompt string and a `parseWillResponse` function, and `questreserve-backend/src/ai/types.ts` containing the shared `WillResponse` and `LocationFilterParams` types. The system prompt establishes Will as a mysterious, whimsical spirit guide who always responds with short in-character prose followed by a structured JSON block mapping to the Phase 11.7 filter schema. `parseWillResponse` extracts the prose and JSON from the raw model output; if no valid JSON block is found it returns empty filters.

**Acceptance Criteria:**
- [ ] `questreserve-backend/src/ai/will.prompt.ts` exists and exports the system prompt string and `parseWillResponse(rawText: string): WillResponse`
- [ ] `questreserve-backend/src/ai/types.ts` exists and exports `WillResponse` (`{ message: string; filters: LocationFilterParams }`) and `LocationFilterParams`
- [ ] `LocationFilterParams` keys exactly match the Phase 11.7 filter schema: `difficulty`, `levelRangeMin`, `levelRangeMax`, `partySizeMin`, `partySizeMax`, `setting`, `landscapeType`, `toneTag`, `runTimeMax` — all optional
- [ ] The system prompt instructs the model to omit any key it cannot confidently infer (no null or empty-string values)
- [ ] The system prompt instructs the model to place the JSON block at the end of its response
- [ ] The system prompt includes the exact allowed enum values for `difficulty`, `setting`, `landscapeType`, and `toneTag` (implementer confirms `difficulty` values against the existing DB column constraint before finalizing)
- [ ] `parseWillResponse` correctly extracts Will's prose and the JSON block when a valid JSON block is present
- [ ] `parseWillResponse` returns `{ message: rawText, filters: {} }` when no valid JSON block is found
- [ ] The module compiles without TypeScript errors

**Dependencies:** Ticket 1 — the Claude client must exist before this module is integrated into the endpoint in Ticket 3

---

## Ticket 3 of 8

**Title:** P11.8:Implement POST /ai/location-filter endpoint and register ai router

**Description:**
Create `questreserve-backend/src/api/ai/ai.controller.ts` and `questreserve-backend/src/api/ai/ai.router.ts`, and register the new router on the root API router at `/ai`. The endpoint accepts a natural language message, calls the Claude API via the client from Ticket 1, parses the response via the module from Ticket 2, and returns Will's prose and filter object. If the Claude API call fails for any reason, the endpoint returns a graceful 200 with Will's in-character fallback message and empty filters — never a 5xx.

**Acceptance Criteria:**
- [ ] `POST /ai/location-filter` accepts a JSON body `{ message: string }`
- [ ] A missing `message` field returns `400`
- [ ] A `message` field exceeding 500 characters returns `400`
- [ ] A valid request calls `callClaude` with Will's system prompt and the customer message as the user turn, then calls `parseWillResponse` on the result
- [ ] A successful response returns `200` with body `{ message: string, filters: LocationFilterParams }`
- [ ] Any Claude API failure (network error, invalid key, quota exceeded, etc.) is caught and returns `200` with body `{ message: "The mist grows thick... I've lost the thread. Speak to me again, traveler.", filters: {} }` — this is the exact canonical fallback copy
- [ ] The endpoint requires no authentication middleware — it is publicly accessible to guests and customers
- [ ] The `ai` router is mounted on the root API router at `/ai` so the endpoint is reachable at `POST /ai/location-filter`

**Dependencies:** Tickets 1 and 2

---

## Ticket 4 of 8

**Title:** P11.8:Add frontend Will API module and shared types

**Description:**
Create `questreserve-frontend/src/api/will.api.ts` with a single exported function `askWill(message: string): Promise<WillApiResponse>` that calls `POST /ai/location-filter`. Create the accompanying type definitions in the frontend's types directory. The implementation uses the existing Axios instance (or fetch pattern) matching `customer.api.ts`.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/api/will.api.ts` exists and exports `askWill(message: string): Promise<WillApiResponse>`
- [ ] `WillApiResponse` is typed as `{ message: string; filters: LocationFilterParams }` with `LocationFilterParams` keys matching the backend contract from Ticket 2
- [ ] Type definitions are placed in the frontend's existing types directory (consistent with the pattern used by `customer.api.ts` and adjacent modules)
- [ ] `askWill` uses the same Axios instance or fetch pattern as `customer.api.ts` — no new HTTP client is introduced
- [ ] The frontend compiles without TypeScript errors after these additions
- [ ] No `any` types are introduced

**Dependencies:** Ticket 3 — endpoint must exist for live integration; types may be drafted in parallel against the agreed contract

---

## Ticket 5 of 8

**Title:** P11.8:Build WillOrb floating button and chat panel component with placeholder styling

**Description:**
Create `questreserve-frontend/src/components/WillOrb/WillOrb.tsx` and its co-located CSS module. The component renders as a fixed-position floating orb in the bottom-right corner of the viewport. Clicking it expands a small chat panel containing a text input, a Send button, a response display area, a Clear button, and a close button. All styling uses placeholder CSS (a glowing pulsing circle using `box-shadow` and `opacity` keyframe animation with design tokens from the Phase 7/8 system). The component is marked with a comment indicating where visual assets replace the placeholder when the user delivers approved assets.

**USER-DEPENDENT ASSET NOTE:** Final visual polish is blocked until the user provides or approves orb illustration and animation style direction. The placeholder is fully functional and ships as-is.

**Acceptance Criteria:**
- [ ] `questreserve-frontend/src/components/WillOrb/WillOrb.tsx` exists and renders without errors
- [ ] A co-located CSS file (`.module.css` or equivalent per project convention) exists alongside the component
- [ ] The orb renders at `position: fixed` in the bottom-right corner of the viewport and does not affect page layout
- [ ] The orb has a CSS keyframe pulse animation using only `box-shadow` and `opacity` (no JavaScript animation libraries)
- [ ] The glow color uses a design token from the Phase 7/8 system (e.g. Spell Gold or equivalent — no hardcoded hex values)
- [ ] Clicking the orb expands a chat panel above it
- [ ] The chat panel contains: a Will avatar/orb placeholder (smaller glowing circle), a text input with placeholder "Describe your quest, traveler…", a Send button, a response display area, a Clear button, and a × close button
- [ ] Clicking × collapses the panel back to the orb without clearing applied filters
- [ ] While a request is in flight, the input and Send button are disabled and a loading state is indicated (faster pulse or inline indicator)
- [ ] The component file includes a comment marking the location where placeholder styling is replaced by approved visual assets
- [ ] The frontend compiles without TypeScript errors

**Dependencies:** Ticket 4 — the `askWill` function must be importable (a stub is sufficient to build the component in parallel)

---

## Ticket 6 of 8

**Title:** P11.8:Wire Will's filter response into URL params on the BrowseLocations page

**Description:**
Add filter application logic inside `WillOrb` so that when `askWill` resolves, Will's returned `filters` object is written into the URL as search params via `useSearchParams`'s `setSearchParams`. Each submission replaces all current filter params with Will's new set (no additive behavior). The Clear button calls `setSearchParams({})` to remove all filter params. If `filters` is empty (fallback or no inference), all current filter params are also cleared. No new hooks or state management are introduced beyond `useSearchParams`.

**Acceptance Criteria:**
- [ ] After a successful `askWill` call, each key in the returned `filters` object is set as a URL search param using `setSearchParams`
- [ ] All pre-existing filter params are cleared before Will's new params are applied (Will's response is always a fresh filter state, never additive)
- [ ] If `filters` is `{}` (empty object), `setSearchParams` is called with no Will-sourced params and all existing filter params are removed
- [ ] The Clear button in the `WillOrb` panel calls `setSearchParams({})`, removing all filter params from the URL
- [ ] `LocationFilterPanel` reflects Will's applied filter values immediately after the URL update (no page reload required)
- [ ] The location list in `BrowseLocations` updates automatically to show results matching Will's filters (driven by the existing `useBookingLocations` → URL param pipeline)
- [ ] Panel dismissal (clicking ×) does not clear applied filters — only the Clear button does
- [ ] No new React state, context, or custom hooks beyond `useSearchParams` are introduced for this filter-wiring logic

**Dependencies:** Tickets 4 and 5

---

## Ticket 7 of 8

**Title:** P11.8:Mount WillOrb on the BrowseLocations page

**Description:**
Import and render `<WillOrb />` inside `BrowseLocations.tsx`. Because `WillOrb` is `position: fixed`, it requires no layout changes. Verify that Will is accessible to both guest and authenticated customer users of the Browse Locations page.

**Acceptance Criteria:**
- [ ] `<WillOrb />` is rendered inside `BrowseLocations.tsx`
- [ ] The orb appears on the Browse Locations page when accessed as a guest (unauthenticated)
- [ ] The orb appears on the Browse Locations page when accessed as an authenticated customer
- [ ] The orb does not appear on any other page
- [ ] No layout shift occurs on the Browse Locations page after adding the component (it is positioned fixed)
- [ ] The frontend compiles without TypeScript errors after the import

**Dependencies:** Tickets 5 and 6

---

## Ticket 8 of 8

**Title:** P11.8:End-to-end verification of Will AI assistant

**Description:**
Verify the complete Phase 11.8 feature set against a running backend with `ANTHROPIC_API_KEY` configured. No source code changes are made in this ticket. All failures discovered must be fixed as separate commits before the phase is closed.

**Acceptance Criteria:**
- [ ] `POST /ai/location-filter` with a valid message body returns `200` with Will's in-character prose and a `filters` object whose keys match the Phase 11.7 filter schema
- [ ] `POST /ai/location-filter` with a missing `message` field returns `400`
- [ ] `POST /ai/location-filter` with a `message` exceeding 500 characters returns `400`
- [ ] `POST /ai/location-filter` with an invalid API key configured returns `200` with Will's canonical fallback prose (`"The mist grows thick... I've lost the thread. Speak to me again, traveler."`) and `filters: {}`
- [ ] The glowing orb is visible in the bottom-right corner of the Browse Locations page for both guest and authenticated customer views, with the pulse animation running and no console errors
- [ ] Clicking the orb opens the chat panel; clicking × closes it without clearing filters
- [ ] Submitting a natural language request (e.g. "a spooky underground cave for 4–6 players") displays Will's prose in the panel and snaps the inferred filter params into the URL (e.g. `landscapeType=cave&toneTag=horror`); `LocationFilterPanel` reflects those values; the location list updates to show only matching results
- [ ] The input and Send button are disabled while a request is in flight
- [ ] When the Claude API call fails (simulated), Will's fallback prose appears in the panel and no filter params are added to the URL
- [ ] Clicking Clear after Will applies filters removes all filter params from the URL, the location list returns all results, and Will's response text is cleared from the panel
- [ ] Manually adjusting a filter in `LocationFilterPanel` after Will sets filters updates the URL correctly; the orb panel remains open
- [ ] The `ANTHROPIC_API_KEY` value does not appear in any frontend bundle, browser network request, or browser console output

**Dependencies:** Tickets 1–7 — all prior work must be complete

---
