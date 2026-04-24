# Phase 10.3: Location Filtering

_Created: 2026-04-23 | Status: DRAFT_

## Goal

Add difficulty filtering to the Browse Locations page. Filtering is pushed into the database query — not applied in the UI after a full fetch. Filter state is reflected in the URL so it is bookmarkable and survives a page refresh.

## Context

Phase 10.2 (Guest Access) is complete. `BrowseLocations` is a public page at `/locations`, wrapped in `GuestLayout` with `HeaderNav`. The `/customer/locations` route aliases were removed before this phase began. The `getBookingLocations` function in `src/api/customer.api.ts` already accepts an optional `filters?: { difficulty?: string }` parameter (stubbed in Phase 10 Step 6) — the API layer plumbing exists; it has never been exercised with a real backend query.

On the backend, `BookingLocation` has a `difficulty` column with enum values `EASY`, `MEDIUM`, `HARD`, `LEGENDARY` (spec domain model). The existing `GET /api/customer/locations` endpoint returns all locations with no filtering today.

## Steps

### Step 1: Add difficulty filtering to the backend repository and service

Extend the backend query path to accept and apply a `difficulty` filter parameter.

In `questreserve-backend/src/repositories/`, update the `BookingLocationRepository` (or equivalent) to accept an optional `difficulty` filter in its `findAll` (or equivalent list) method. When `difficulty` is provided, add a `.where('difficulty', difficulty)` clause to the Knex query. When absent, the query returns all locations unchanged.

In `questreserve-backend/src/services/`, update the corresponding service method to read `difficulty` from its input and pass it through to the repository.

In `questreserve-backend/src/api/customer/`, update the controller that handles `GET /api/customer/locations` to read `difficulty` from `req.query` and pass it to the service. Validate that the value, if present, is one of the four allowed enum values (`EASY`, `MEDIUM`, `HARD`, `LEGENDARY`); reject any other value with a `400` response.

**Files changed:**
- `questreserve-backend/src/repositories/<BookingLocationRepository>.ts`
- `questreserve-backend/src/services/<BookingLocationService>.ts` (or equivalent)
- `questreserve-backend/src/api/customer/<locations controller>.ts`

**Note:** Confirm exact file names against the current backend structure before implementing — the repository and service file names follow the pattern established in Phase 4/5.

---

### Step 2: Build the `LocationFilterBar` controlled component

Create `src/components/LocationFilterBar/LocationFilterBar.tsx`. This is a controlled component — it receives its current value and an `onChange` callback as props; it owns no filter state internally.

Props interface:

```
interface LocationFilterBarProps {
  difficulty: string;        // '' means "no filter / show all"
  onChange: (difficulty: string) => void;
}
```

The component renders a row of buttons or a `<select>` element for the four difficulty values: `EASY`, `MEDIUM`, `HARD`, `LEGENDARY`, plus an "All" option that sets `difficulty` to `''`. The active selection is visually indicated using design tokens consistent with Phase 7/8 conventions (`--accent` or `--primary` for the selected state, `--foreground` at rest).

No internal `useState`. All state lives in the parent (`BrowseLocations`).

**Files created:**
- `src/components/LocationFilterBar/LocationFilterBar.tsx`

**Dependencies:** None — can be built independently of other steps.

---

### Step 3: Wire URL sync and filtering into `BrowseLocations`

Update `src/pages/BrowseLocations/BrowseLocations.tsx` to:

1. **Read filter state from the URL.** Use `useSearchParams` from `react-router-dom` to read the `difficulty` query parameter on mount (e.g. `?difficulty=HARD`). This value is the single source of truth for the current filter selection.

2. **Write filter state to the URL.** When the user changes the filter selection via `LocationFilterBar`, call `setSearchParams` to update `?difficulty=<value>` in the URL. When the user selects "All", remove the `difficulty` param entirely (do not leave `?difficulty=` in the URL).

3. **Pass filter state to the data hook.** Pass the current `difficulty` value (read from URL params) to `useBookingLocations(filters)` so the hook fetches only matching records from the backend.

4. **Render `LocationFilterBar`.** Mount `<LocationFilterBar difficulty={difficulty} onChange={handleFilterChange} />` above the location card list. Pass the URL-derived value as `difficulty` and a handler that calls `setSearchParams` as `onChange`.

The `useBookingLocations` hook must re-fetch when the filter value changes. Confirm that the existing hook's `useEffect` dependency array includes the filters argument — update it if not.

**Files changed:**
- `src/pages/BrowseLocations/BrowseLocations.tsx`
- `src/hooks/useBookingLocations.ts` (if dependency array fix is needed)

**Dependencies:** Step 1 (backend must filter before the frontend wires it in), Step 2 (`LocationFilterBar` must exist).

---

### Step 4: Update the frontend API call to pass the difficulty filter

Confirm that `getBookingLocations` in `src/api/customer.api.ts` serialises the `difficulty` filter into the `GET /api/customer/locations` request as a query parameter (e.g. `?difficulty=HARD`). If the parameter is already wired through via Axios `params`, verify it and close this step with no changes. If it is stubbed or missing, add `params: { difficulty }` to the Axios call.

This step is deliberately small — the Phase 10 Step 6 note explicitly preserved the filter parameter stub for this purpose.

**Files changed (if needed):**
- `src/api/customer.api.ts`

**Dependencies:** Step 1 (backend endpoint must accept the parameter before this can be verified end-to-end).

---

### Step 5: End-to-end verification

Verify the complete filter flow against a running backend. No source code changes are expected.

**Test path:**

1. Open `/locations` — confirm all locations load with no filter applied.
2. Select "HARD" in `LocationFilterBar` — confirm the URL updates to `?difficulty=HARD` and only HARD locations are returned.
3. Select "All" — confirm the `difficulty` param is removed from the URL and all locations return.
4. Navigate directly to `/locations?difficulty=LEGENDARY` — confirm the filter is applied on load and `LocationFilterBar` reflects the correct active selection.
5. Refresh the page with `?difficulty=MEDIUM` in the URL — confirm the filter survives the refresh.
6. Confirm that an invalid difficulty value in the URL (e.g. `?difficulty=EXTREME`) results in a `400` from the backend and a graceful error state in the UI (not a blank screen or unhandled rejection).

Any failures discovered must be investigated and fixed before closing the phase. Document defects found here.

**Dependencies:** All previous steps complete.

---

## Notes

- **Filtering is DB-level, not UI-level.** The backend query applies the `WHERE difficulty = ?` clause. The frontend never fetches all locations and filters client-side. This is consistent with the spec's intent that `getBookingLocations` accept filters (Phase 10 Step 6 note).
- **URL as source of truth.** `useSearchParams` drives the filter state. There is no separate `useState` for the selected difficulty in `BrowseLocations`. This ensures bookmarkability and refresh survival without extra synchronisation logic.
- **`LocationFilterBar` is a controlled component.** It has no internal state. The parent owns state (via URL params). This keeps the component simple and testable.
- **`/customer/locations` routes already removed.** These were removed before this phase began. No route cleanup work is needed here.
- **Step order.** Step 1 (backend) and Step 2 (component) are independent and can proceed in parallel. Step 3 depends on both. Step 4 can be done alongside Step 3. Step 5 closes the phase.
- **Difficulty enum values.** The four valid values are `EASY`, `MEDIUM`, `HARD`, `LEGENDARY` per the spec domain model. The backend `400` guard and the `LocationFilterBar` option list must both use exactly these four values — no other values are valid.
- **No date filtering in this phase.** The spec's MVP feature list references filtering by date and difficulty. Date filtering is deferred — the filter UI introduced here is difficulty-only. The `LocationFilterBar` component should not pre-build date filter UI.
- **Phase 10.4 dependency.** If a future phase adds date filtering, `LocationFilterBar` will be extended. The controlled-component pattern chosen here makes that extension straightforward — the parent adds another URL param and passes another prop.
