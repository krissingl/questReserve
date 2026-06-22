# QuestReserve — MVP Implementation Phases

_Created: 2026-02-24 | Status: DRAFT_

This document captures the agreed high-level implementation sequence for the QuestReserve MVP.
Each phase is a logical unit of work. Steps within each phase are defined separately.

## Phase 1: Database Migrations
Status : ✅ COMPLETE

Provider account management, platform-wide booking activity view.

All 6 MVP tables defined and migrated via Knex:
`admin_user`, `provider`, `end_user`, `booking_location`, `time_slot`, `booking`

## Phase 2: Backend Foundation
Status : ✅ COMPLETE

Properly structure the Express app (move logic out of `index.ts` into the `app` module), populate empty module stubs, establish middleware layer (error handling, logging, JSON parsing), define base patterns (repository pattern, service layer conventions).

## Phase 3: Authentication
Status : ✅ COMPLETE

JWT middleware, login/register endpoints for all three user types, protected route scaffolding.

## Phase 4: Backend — Provider Domain
Status : ✅ COMPLETE

BookingLocation and TimeSlot CRUD, provider-scoped booking view, basic revenue reporting endpoint.

## Phase 5: Backend — Customer Domain
Status : ✅ COMPLETE

EndUser registration, browse/filter BookingLocations, TimeSlot availability, Booking creation, booking history, cancellation.

## Phase 6: Backend — Admin Domain
Status : ✅ COMPLETE

Provider account management, platform-wide booking activity view.

## Phase 6.5: Backend Review
Status : ✅ COMPLETE

Review work completed on backend against plans and spec. Formalize error handling. Create Backend Documentation.

## Phase 7: Frontend — Branding & UI Strategy
Status : ✅ COMPLETE

Gather client branding/style guide, produce a UI strategy document covering design system, component library choice, color/type tokens. Reference document for all subsequent frontend phases.

## Phase 8: Frontend — Scaffold
Status : ✅ COMPLETE

React app structure, routing, role-scoped layouts (`CustomerLayout`, `ProviderLayout`, `AdminLayout`), auth context, API client layer.

## Phase 9: Frontend — Auth Views
Status : ✅ COMPLETE

Login/register pages for each user type.

## Phase 10: Frontend — Customer Portal
Status : ✅ COMPLETE

Browse, book, manage bookings.

## Phase 10.1: Frontend — Booking Flow
Status : ✅ COMPLETE

The core customer booking journey, deferred from Phase 10. Full scope:

- TimeSlot availability listing on the Location Detail page
- Booking creation flow — customer selects a time slot and confirms a reservation
- Guest path — a guest clicking "Reserve" is redirected to customer login with their intended location and time slot preserved; after login they are returned to the reservation flow
- Authenticated customer path — proceeds through reservation to an "Under Construction" payment page (payment is Post-MVP)
- Booking cancellation action on the My Bookings page (also deferred from Phase 10)

## Phase 10.2: Frontend — Guest Access
Status : ✅ COMPLETE

Unauthenticated location browsing. Allow guests to browse and view booking locations without signing in. Requires dedicated routes, a guest layout, and any supporting backend endpoint changes to expose location data publicly.

## Phase 10.3: Frontend — Location Filtering
Status : ✅ COMPLETE

Full filtering implementation for the browse locations view, covering both guest and authenticated customer flows. Includes filter UI controls (difficulty, rules, and other relevant fields) and any supporting backend query changes needed to power them.

## Phase 10.4: Frontend — Location Images & Browse UI Redesign
Status : ✅ COMPLETE

Two tightly coupled deliverables treated as one phase:

**Location Images** — Promote from Stretch Goal into MVP. Backend: provider image upload and storage strategy. Frontend: image gallery display on location detail and browse views. Seed: capture open-source images for existing seed locations.

**Browse UI Redesign** — Redesign the browse locations view from a grid of cards to a split-panel layout: list of locations on the left, expanded preview of the focused location on the right. The UI redesign is not meaningful without richer location data; the image gallery provides that context.

## Phase 11: Frontend — Provider Dashboard
Status : ✅ COMPLETE

Manage locations, timeslots, view bookings and revenue.

## Phase 11.5: Frontend — Profile Pages
Status : ✅ COMPLETE

Add both customer and provider pages as well as messaging capabilities based by booking and profile images.

## Phase 11.6: Reviews & Branding Cleanup
Status : ✅ COMPLETE

Two workstreams planned for this phase:

**Reviews** — Pull reviews out of stretch goals and implement as a dedicated feature. Three review types: (1) Provider reviews a customer — accessible only to providers on the customer's profile page; (2) Customer reviews a provider — accessible on the provider's public profile page; (3) Customer reviews a location — accessible on the location/adventure detail page. All reviews gated by interaction history: a customer cannot review a location they have not booked, a provider cannot review a customer they have not hosted.

**Branding & Styling Cleanup** — Audit and improve visual consistency across the app. Make styling more uniform and visually interesting throughout the customer, provider, and guest portals.

## Phase 11.7: Expanded Location Rulesets & Provider Survey
Status : In Progress

A rich location metadata system with a structured provider survey and expanded customer filters.

**Provider Side** — Multi-step survey UI when creating or editing a location. Providers fill out categorized fields covering:
- Party size min/max and recommended level range
- Landscape type (tundra, forest, desert, cave, coastal, volcanic, etc.) and setting (interior / exterior / both)
- Specialty environment tags (lava, haunted, aerial, underwater, etc.)
- Magic restrictions (antimagic zones, wild magic, divine/arcane restricted)
- Class, race, and faction restrictions; party composition rules (tag-based)
- Physical access requirements (vertical traversal, water traversal, narrow passages, darkness level)
- Mount/familiar permitted, solo runs permitted, concurrent parties vs. exclusive booking
- Tone tags (horror, heroic, comedic, mystery, political), gore/intensity level, non-lethal mode, permadeath risk
- Primary focus (combat / puzzle / roleplay / mixed), boss encounter present, PvP permitted, scouting permitted
- Estimated run time, dungeon reset time, time limit per run
- Amenities (safe room, on-site merchant, equipment provided, guide/GM provided)
- Loot (guaranteed vs. random, boss loot present, unique item chance)

Survey should feel guided — fields grouped by category with clear section headers, helpful prompts, and sensible defaults. All fields optional except party size and level range.

**Customer Side** — Expanded browse/filter UI exposing new fields as filterable options. Priority filters for MVP: level range, run time, setting, landscape, magic environment, tone, party size. Secondary filters: access requirements, amenities, restrictions. Filter state persists in URL params.

## Phase 11.8: "Will" AI Location Assistant (Will-o'-the-Wisp)
Status : NOT STARTED

A conversational AI helper for customers named Will, styled as a will-o'-the-wisp (glowing orb with soft pulse animation). Will takes a natural language request and translates it into filter selections on the browse page.

> **User-dependent prerequisite:** Visual assets for Will (orb illustration, glow/animation references) will need to be produced before or during this phase. Implementation can begin with placeholder styling, but final polish requires client-provided or user-approved assets.

**Core Behavior** — Customer describes what they want ("a spooky underground dungeon for a party of 4–6, nothing too deadly, we have a paladin"); Will parses the request and snaps the appropriate filters into place visibly so the customer can see and adjust.

**Will's Personality** — Mysterious, whimsical, and helpful. Short flavored responses ("I sense a damp cave with flickering torchlight suits your party…"). Should feel like a character, not a chatbot.

**UI/UX:**
- Floating orb button in the bottom corner of the Browse Locations page
- Expands into a small chat panel when clicked
- Soft glow and pulse animation (CSS only, no heavy libraries)
- Single-turn interaction: customer describes, Will responds and sets filters
- Will confirms what filters were applied in plain language
- Customer can clear Will's selections and start over

**Technical:**
- Claude API call on the backend (API key never exposed to frontend)
- Structured output: Will returns a JSON filter object mapping to the existing filter schema
- Backend endpoint: `POST /ai/location-filter`
- System prompt defines Will's personality and instructs structured JSON output
- Graceful fallback if AI call fails (Will says he lost the thread, try again)
- Depends on Phase 11.7 filter schema being finalized first

## Phase 12: Frontend — Admin Panel
Status : NOT STARTED

Provider management, platform activity view.

## Stretch Goals

### Admin User Creation Endpoint

Add `POST /api/auth/admin/register`, protected by `authenticate` + `requireRole('admin')` with an additional `SUPERUSER` role check at the service layer. Only a logged-in `SUPERUSER` may create new AdminUser accounts.

This is a prerequisite for the Admin Portal (Phase 6) to be fully self-managed by WizardsTowerCorp staff without direct DB access. The `SUPERUSER` role is already defined in the `AdminUser` domain model. Should be implemented as the first addition when Admin Portal work begins.

### Provider Revenue & Analytics Dashboard

US-DO-07 ("see revenue generated from bookings") and US-DO-09 ("view analytics on booking frequency and occupancy rates") require payment data that does not yet exist in the schema. Payment processing is explicitly Post-MVP per the spec constraints.

Once a payment model is introduced, implement a provider-facing reporting endpoint that surfaces: revenue per location, booking frequency trends, and occupancy rates. This fulfils both user stories and feeds the provider dashboard (Phase 11). US-DO-09 (analytics/trends) is Post-MVP/Stretch by its own classification and should be addressed after US-DO-07 is unblocked by the payment schema.

### Save Images

All users should be able to add a profile picture and save it to their account. Provider location images have been promoted to MVP scope (see Phase 10.3).

### Forgot Password / Password Reset

A "Forgot Password?" flow on the CustomerLogin and ProviderLogin pages. MVP scope: user enters their email and receives a reset link. Requires a backend password reset endpoint and email delivery infrastructure (SMTP, SendGrid, or equivalent). Deferred until email infrastructure is scoped and available.

### Booking Reviews

EndUsers should be able to leave reviews after booking a location and experience. Explore internal system for Providers to review EndUsers also - did they follow rules, were they honest about party size, ect.

