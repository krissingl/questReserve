# QuestReserve: Definition of Done
The project is considered Done when all sections below are satisfied.
“Stretch” items explicitly do not block Done status.

## Architecture & Codebase Integrity

### Backend
- [ ] Modular monolith structure exists and is consistently followed:
  - api / application / infrastructure / middleware / utils
- [ ] No business logic inside controllers
- [ ] No SQL inside controllers or services
- [ ] Repositories handle only data access
- [ ] Services handle only business rules
- [ ] All enums/constants defined centrally and reused
- [ ] No circular dependencies

### Frontend
- [ ] React + TypeScript used throughout
- [ ] API calls isolated in /api
- [ ] Data fetching logic isolated in hooks
- [ ] Layouts wrap role-specific pages cleanly
- [ ] Components are presentational where possible

## Data Model & Persistence
- [ ] Database schema matches approved migration exactly
- [ ] All foreign keys enforced
- [ ] All seed data runs without error
- [ ] Seed data demonstrates:
  - [ ] At least 1 Admin user (each type)
  - [ ] At least 2 Providers
  - [ ] At least 3 End Users
  - [ ] Multiple booking locations
  - [ ] Multiple time slots
  - [ ] Past and future bookings
- [ ] Indexes exist on all foreign key columns
- [ ] No orphaned records possible

## User Roles & Access Boundaries
### Admin Users (WizardsTowerCorp)
- [ ] Can authenticate successfully
- [ ] Can view platform-level data (stubbed or real)
- [ ] Cannot book venues
- [ ] Cannot own booking locations

### Providers (Dungeon Owners)
- [ ] Can authenticate successfully
- [ ] Can view their own booking locations
- [ ] Can view bookings tied to their locations
- [ ] Cannot view other providers’ data
- [ ] Cannot access platform admin routes

### End Users (Adventure Parties)
- [ ] Can authenticate successfully
- [ ] Can browse available booking locations
- [ ] Can view time slot availability
- [ ] Can view their own booking history
- [ ] Cannot manage venues or providers

## API Contracts & Behavior
All MVP endpoints implemented and reachable
All endpoints return consistent JSON shapes
Read endpoints return empty arrays instead of errors
Invalid IDs return 404
Server errors return standardized error objects
No sensitive fields (password hashes) exposed
Pagination-ready response structures where applicable
Minimum API Surface:

Providers dashboard endpoint

Venue list + detail endpoints

Time slot availability endpoint

End user booking history endpoint

5. Business Logic Rules (MVP Scope)

Bookings reference valid time slots and end users

Cancelled bookings excluded from availability

Past vs future bookings correctly identified

Time slots ordered chronologically

Availability excludes already-booked slots

No double-booking possible at read level

6. Authentication & Security (MVP-Level)

JWT-based authentication implemented

Tokens include user ID and user type

Auth middleware protects role-specific routes

Passwords stored as hashes

Auth failures return 401/403 appropriately

No secrets committed to repo

7. Validation & Stability

App boots cleanly with no runtime errors

API smoke-tested via Postman or similar

Common edge cases tested manually:

Empty datasets

Invalid IDs

Cancelled bookings

Centralized error handling exists

Logging present for dev debugging

Automated tests are encouraged but not required for Done status.

8. Frontend MVP Experience

End User Experience

Can browse booking locations

Can view venue details

Can see available time slots

Can view booking history

Provider Experience

Can view provider dashboard

Can view owned booking locations

Can see upcoming bookings

Admin Experience

Can access admin layout

Can view stubbed analytics or provider list

9. Documentation & Portfolio Readiness

README includes:

Project overview

Tech stack

Architecture explanation

Setup instructions

Folder structure documented

Key design decisions explained briefly

Known limitations clearly listed

Project can be demoed locally in <10 minutes

10. Scope Control (Explicit Non-Requirements)

The following do NOT block Done:

Payments

Marketing features

Advanced analytics

Background jobs

Feature flag system

Full admin tooling

Stretch Goals (Optional)

Soft-delete bookings

Booking cancellation endpoint

Admin impersonation of providers

Availability calculation utility

Basic analytics aggregation
