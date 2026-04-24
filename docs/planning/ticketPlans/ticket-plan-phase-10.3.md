# Ticket Plan: Phase 10.3 — Location Filtering

**Purpose:** Add difficulty filtering to the Browse Locations page, pushed to the database layer, with filter state reflected in the URL for bookmarkability and refresh survival.
**Total tickets:** 5
**Prefix:** P10.3:
**Status: LOCKED**

---

## Ticket 1 of 5

**Title:** P10.3: Add difficulty filter to the backend repository, service, and controller

**Description:**
Extend the `GET /api/customer/locations` query path to accept and apply an optional `difficulty` filter. The repository applies a `WHERE difficulty = ?` clause when the parameter is present. The service passes it through. The controller reads it from `req.query` and rejects any value that is not one of the four allowed enum values with a `400` response.

**Acceptance Criteria:**
- [ ] The `BookingLocationRepository` list method accepts an optional `difficulty` parameter and adds a `.where('difficulty', difficulty)` clause to the Knex query when it is present; when absent the query returns all locations unchanged
- [ ] The corresponding service method reads `difficulty` from its input and passes it to the repository unchanged
- [ ] The controller handling `GET /api/customer/locations` reads `difficulty` from `req.query` and passes it to the service
- [ ] The controller rejects any `difficulty` value not in `['EASY', 'MEDIUM', 'HARD', 'LEGENDARY']` with a `400` response and does not call the service
- [ ] `GET /api/customer/locations` with no `difficulty` param returns all locations with `200`
- [ ] `GET /api/customer/locations?difficulty=HARD` returns only locations where `difficulty = 'HARD'` with `200`
- [ ] `GET /api/customer/locations?difficulty=EXTREME` returns `400`

---

## Ticket 2 of 5

**Title:** P10.3: Build the `LocationFilterBar` controlled component

**Description:**
Create `src/components/LocationFilterBar/LocationFilterBar.tsx` as a controlled component that renders difficulty filter options. The component owns no state — the parent supplies the current value and an `onChange` callback. This component can be built independently of all other tickets in this phase.

**Acceptance Criteria:**
- [ ] `src/components/LocationFilterBar/LocationFilterBar.tsx` exists and accepts `difficulty: string` and `onChange: (difficulty: string) => void` as props
- [ ] The component renders an "All" option and one option for each of `EASY`, `MEDIUM`, `HARD`, and `LEGENDARY` — exactly these five options, no others
- [ ] Selecting "All" calls `onChange` with an empty string `''`
- [ ] Selecting a difficulty value calls `onChange` with that value exactly (e.g. `'HARD'`)
- [ ] The currently active selection is visually indicated using design tokens consistent with Phase 7/8 conventions (`--accent` or `--primary` for selected, `--foreground` at rest)
- [ ] The component contains no `useState` — all state is managed by the parent via props
- [ ] `npm run lint` and `npm run build` pass with zero new errors

---

## Ticket 3 of 5

**Title:** P10.3: Verify `getBookingLocations` serialises the difficulty filter as a query parameter

**Description:**
Confirm that `getBookingLocations` in `src/api/customer.api.ts` passes the `difficulty` filter value to the backend as a URL query parameter (e.g. `?difficulty=HARD`). The Phase 10 stub preserved the `filters?: { difficulty?: string }` parameter signature. If the Axios call already passes `params: { difficulty }`, verify and close with no changes. If it is missing or stubbed, add it.

**Acceptance Criteria:**
- [ ] `getBookingLocations` in `src/api/customer.api.ts` passes the `difficulty` value from its `filters` argument to the Axios call as a query parameter
- [ ] When `difficulty` is `''` or `undefined`, no `difficulty` query parameter is sent in the request (the backend receives an unfiltered request)
- [ ] When `difficulty` is `'HARD'`, the outgoing request URL includes `?difficulty=HARD`
- [ ] `npm run lint` and `npm run build` pass with zero new errors

**Dependencies:** #<Ticket 1 issue number> — the backend endpoint must accept the parameter before the serialisation can be verified end-to-end

---

## Ticket 4 of 5

**Title:** P10.3: Wire URL sync and `LocationFilterBar` into `BrowseLocations`

**Description:**
Update `src/pages/BrowseLocations/BrowseLocations.tsx` to read and write filter state via `useSearchParams`, pass the URL-derived `difficulty` value to `useBookingLocations`, and render `LocationFilterBar` above the location card list. The URL is the sole source of truth for filter state — no separate `useState` for difficulty is introduced.

**Acceptance Criteria:**
- [ ] `BrowseLocations` reads `difficulty` from `useSearchParams` on mount and on every URL change
- [ ] Selecting a difficulty in `LocationFilterBar` calls `setSearchParams` to update `?difficulty=<value>` in the URL
- [ ] Selecting "All" in `LocationFilterBar` removes the `difficulty` param from the URL entirely (no `?difficulty=` remains)
- [ ] The `difficulty` value read from `useSearchParams` is passed to `useBookingLocations` so only matching records are fetched from the backend
- [ ] `<LocationFilterBar difficulty={difficulty} onChange={handleFilterChange} />` is rendered above the location card list
- [ ] The `useBookingLocations` hook re-fetches when the `difficulty` value changes; if the `useEffect` dependency array does not already include the filters argument, it is updated
- [ ] No `useState` for `difficulty` is added to `BrowseLocations` — `useSearchParams` is the only source of truth
- [ ] `npm run lint` and `npm run build` pass with zero new errors

**Dependencies:** #<Ticket 2 issue number> — `LocationFilterBar` must exist before `BrowseLocations` can import and render it; #<Ticket 3 issue number> — the API call must serialise the filter before the hook can be exercised end-to-end

---

## Ticket 5 of 5

**Title:** P10.3: End-to-end verification of the difficulty filter flow

**Description:**
Verify the complete filter flow against a running backend. No new source code is written. Any failures discovered must be investigated and fixed before this ticket is closed.

**Acceptance Criteria:**
- [ ] Navigating to `/locations` with no query params loads all locations and `LocationFilterBar` shows "All" as the active selection
- [ ] Selecting "HARD" in `LocationFilterBar` updates the URL to `?difficulty=HARD` and the location list updates to show only HARD locations
- [ ] Selecting "All" removes `?difficulty=` from the URL entirely and all locations return
- [ ] Navigating directly to `/locations?difficulty=LEGENDARY` loads only LEGENDARY locations and `LocationFilterBar` reflects "LEGENDARY" as the active selection
- [ ] Refreshing the page at `/locations?difficulty=MEDIUM` preserves the filter — only MEDIUM locations are loaded and `LocationFilterBar` reflects "MEDIUM" as the active selection
- [ ] Navigating to `/locations?difficulty=EXTREME` results in a `400` response from the backend and a graceful error state in the UI (no blank screen, no unhandled rejection)
- [ ] `npm run lint` and `npm run build` pass with zero new errors

**Dependencies:** #<Ticket 4 issue number> — all prior steps must be complete before end-to-end verification can begin
