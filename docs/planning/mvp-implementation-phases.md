# QuestReserve — MVP Implementation Phases

_Created: 2026-02-24 | Status: DRAFT_

This document captures the agreed high-level implementation sequence for the QuestReserve MVP.
Each phase is a logical unit of work. Steps within each phase are defined separately.

---

## Phase 1: Database Migrations — ✅ COMPLETE

All 6 MVP tables defined and migrated via Knex:
`admin_user`, `provider`, `end_user`, `booking_location`, `time_slot`, `booking`

---

## Phase 2: Backend Foundation

Properly structure the Express app (move logic out of `index.ts` into the `app` module), populate empty module stubs, establish middleware layer (error handling, logging, JSON parsing), define base patterns (repository pattern, service layer conventions).

---

## Phase 3: Authentication

JWT middleware, login/register endpoints for all three user types, protected route scaffolding.

---

## Phase 4: Backend — Provider Domain

BookingLocation and TimeSlot CRUD, provider-scoped booking view, basic revenue reporting endpoint.

---

## Phase 5: Backend — Customer Domain

EndUser registration, browse/filter BookingLocations, TimeSlot availability, Booking creation, booking history, cancellation.

---

## Phase 6: Backend — Admin Domain

Provider account management, platform-wide booking activity view.

---

## Phase 7: Frontend — Branding & UI Strategy

Gather client branding/style guide, produce a UI strategy document covering design system, component library choice, color/type tokens. Reference document for all subsequent frontend phases.

---

## Phase 8: Frontend — Scaffold

React app structure, routing, role-scoped layouts (`CustomerLayout`, `ProviderLayout`, `AdminLayout`), auth context, API client layer.

---

## Phase 9: Frontend — Auth Views

Login/register pages for each user type.

---

## Phase 10: Frontend — Customer Portal

Browse, book, manage bookings.

---

## Phase 11: Frontend — Provider Dashboard

Manage locations, timeslots, view bookings and revenue.

---

## Phase 12: Frontend — Admin Panel

Provider management, platform activity view.

---

## Stretch Goals

### Admin User Creation Endpoint

Add `POST /api/auth/admin/register`, protected by `authenticate` + `requireRole('admin')` with an additional `SUPERUSER` role check at the service layer. Only a logged-in `SUPERUSER` may create new AdminUser accounts.

This is a prerequisite for the Admin Portal (Phase 6) to be fully self-managed by WizardsTowerCorp staff without direct DB access. The `SUPERUSER` role is already defined in the `AdminUser` domain model. Should be implemented as the first addition when Admin Portal work begins.

### Replace Scaffolded `/api/protected/me` with Real User-Fetch Endpoints

`GET /api/protected/me` was added in Phase 3 as scaffolding to validate the auth middleware chain. It returns the raw token payload and lives in `src/api/protected/`. It is not a production feature.

When domain routes are built out (Phases 4–6), this route should be replaced with real identity endpoints per user type (e.g. `GET /api/end-users/me`, `GET /api/providers/me`) that fetch the full user record from the database. The `src/api/protected/` directory and its scaffolding route should be removed at that point.
