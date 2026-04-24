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
Status : NOT STARTED

Full filtering implementation for the browse locations view, covering both guest and authenticated customer flows. Includes filter UI controls (difficulty, rules, and other relevant fields) and any supporting backend query changes needed to power them.

## Phase 10.4: Frontend — Location Images & Browse UI Redesign
Status : NOT STARTED

Two tightly coupled deliverables treated as one phase:

**Location Images** — Promote from Stretch Goal into MVP. Backend: provider image upload and storage strategy. Frontend: image gallery display on location detail and browse views. Seed: capture open-source images for existing seed locations.

**Browse UI Redesign** — Redesign the browse locations view from a grid of cards to a split-panel layout: list of locations on the left, expanded preview of the focused location on the right. The UI redesign is not meaningful without richer location data; the image gallery provides that context.

## Phase 11: Frontend — Provider Dashboard
Status : NOT STARTED

Manage locations, timeslots, view bookings and revenue.

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

