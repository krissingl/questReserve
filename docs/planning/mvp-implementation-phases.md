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
Status : STARTED

Login/register pages for each user type.

## Phase 10: Frontend — Customer Portal
Status : NOT STARTED

Browse, book, manage bookings.

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

All users should be able to add a profile picture and save it to their account. Providers should be able to add images to their booking locations for advertising and clarification reasons.

### Booking Reviews

EndUsers should be able to leave reviews after booking a location and experience. Explore internal system for Providers to review EndUsers also - did they follow rules, were they honest about party size, ect.

