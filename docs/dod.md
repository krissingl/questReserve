# QuestReserve (WizardsTowerCorp)

A modular, role-based booking platform for managing dungeon raid reservations, built as a senior-level portfolio project emphasizing clean architecture, domain modeling, and scalable backend design.

## Project Overview

QuestReserve is a booking and management platform designed for WizardsTowerCorp, enabling dungeon owners to manage raid availability while allowing adventure parties to browse and book dungeon experiences.

The application supports three distinct user types:

- Platform Admins - WizardsTowerCorp employees providing customer success and platform oversight
- Providers - Dungeon owners who manage booking locations and schedules
- End Users - Adventure parties who browse, book, and manage dungeon raids

While the theme is playful, the architecture, data modeling, and code quality are intentionally professional and production-minded.

## Goals & Constraints
### Primary Goals
- Demonstrate senior-level backend architecture
- Clearly separate concerns across layers
- Model real-world booking constraints cleanly
- Remain deployable and demoable as an MVP
### Explicit Constraints
- Modular monolith (not microservices)
- MVP scope only — no overengineering
- Readability and correctness over feature count

## Architecture Overview
### Backend
- Stack: Node.js, TypeScript, Express, Knex, PostgreSQL
- Style: Modular monolith with layered architecture
```
src/
├── api/              # Controllers & route handlers
├── application/      # Business logic (services / use cases)
├── infrastructure/   # Database access & external integrations
├── middleware/       # Auth, error handling, logging
├── utils/            # Shared helpers, enums, constants
├── tests/            # Unit & integration tests
```

#### Key Principles
- Controllers handle HTTP only
- Services contain business rules
- Repositories handle data access
- No SQL in controllers or services
### Frontend
- Stack: React, TypeScript
- Style: Modular monolith with role-based layouts
```
src/
├── api/              # API client wrappers
├── components/       # Reusable UI components
├── hooks/            # Data-fetching and state logic
├── layouts/          # Role-based layout wrappers
├── pages/            # Route-level pages
├── contexts/         # Auth & feature flags
├── utils/            # Formatting & helpers
``` 

## User Roles & Capabilities
### Platform Admins (WizardsTowerCorp)
- Platform-level access
- Provider visibility
- Analytics (stubbed or aggregated)
- No booking or venue ownership
### Providers (Dungeon Owners)
- Manage booking locations
- View time slots and bookings
- Access provider dashboard
- Cannot view other providers’ data
### End Users (Adventure Parties)
- Browse available dungeons
- View time slot availability
- Book and manage reservations
- View booking history

## Data Model Overview
Core entities:
- ```admin_user```
- ```provider```
- ```end_user```
- ```booking_location```
- ```time_slot```
- ```booking```

Relationships:
```
Provider
  → BookingLocation
    → TimeSlot
      → Booking
        → EndUser
```

Design decisions:
- Separate tables per user type (no polymorphic users)
- Explicit foreign keys and cascading rules
- Minimal booking model to preserve MVP scope

## API Overview (MVP)
### Providers
- ```GET /api/providers/:id```
- ```GET /api/providers/:id/dashboard```

### Booking Locations
- ```GET /api/venues```
- ```GET /api/venues/:id```
- ```GET /api/venues/:id/timeslots```

### End Users
- ```GET /api/end-users/:id/bookings```

### API Characteristics
- Consistent JSON response shapes
- Empty states return empty arrays
- Invalid IDs return 404
- Centralized error handling

## Authentication & Authorization
- JWT-based authentication
- Tokens include user ID and user type
- Role-based route protection
- Passwords stored as secure hashes
- OAuth, refresh tokens, and MFA are intentionally out of scope for MVP.

## Business Rules (MVP)
- Time slots cannot be double-booked
- Cancelled bookings excluded from availability
- Past and future bookings correctly separated
- Availability calculated server-side
- Chronological ordering enforced at query level

## Testing & Validation
- Database migrations and seeds validated
- API endpoints manually smoke-tested
- Centralized error handling in place
- Edge cases verified:
  - Empty datasets
  - Invalid IDs
  - Cancelled bookings

Automated tests are present where useful but not exhaustive by design.

## Local Development
### Prerequisites
- Node.js
- PostgreSQL
- npm or yarn

### Setup
```
git clone <repo>
cd questreserve
npm install
npm run migrate
npm run seed
npm run dev
```
The application should be fully demoable locally in under 10 minutes.

## Known Limitations (By Design)
The following features are intentionally out of scope for this MVP:
- Payments
- Marketing tools
- Background jobs
- Advanced analytics
- Feature flag infrastructure
- Microservices architecture

## Potential Enhancements
- Soft-delete bookings
- Booking cancellation endpoint
- Admin impersonation
- Availability optimization
- Analytics aggregation

## Why This Project Exists
- This project exists to demonstrate:
  - Architectural judgment
  - Scope control
  - Data modeling clarity
  - Clean separation of concerns
It prioritizes finishing well over building endlessly.

The project is considered Done when all sections below are satisfied.
“Stretch” items explicitly do not block Done status.

1. Architecture & Codebase Integrity

Backend

Modular monolith structure exists and is consistently followed:

api / application / infrastructure / middleware / utils

No business logic inside controllers

No SQL inside controllers or services

Repositories handle only data access

Services handle only business rules

All enums/constants defined centrally and reused

No circular dependencies

Frontend

React + TypeScript used throughout

API calls isolated in /api

Data fetching logic isolated in hooks

Layouts wrap role-specific pages cleanly

Components are presentational where possible

2. Data Model & Persistence

Database schema matches approved migration exactly

All foreign keys enforced

All seed data runs without error

Seed data demonstrates:

At least 1 Admin user (each type)

At least 2 Providers

At least 3 End Users

Multiple booking locations

Multiple time slots

Past and future bookings

Indexes exist on all foreign key columns

No orphaned records possible

3. User Roles & Access Boundaries

Admin Users (WizardsTowerCorp)

Can authenticate successfully

Can view platform-level data (stubbed or real)

Cannot book venues

Cannot own booking locations

Providers (Dungeon Owners)

Can authenticate successfully

Can view their own booking locations

Can view bookings tied to their locations

Cannot view other providers’ data

Cannot access platform admin routes

End Users (Adventure Parties)

Can authenticate successfully

Can browse available booking locations

Can view time slot availability

Can view their own booking history

Cannot manage venues or providers

4. API Contracts & Behavior

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
