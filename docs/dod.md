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

Demonstrate senior-level backend architecture

Clearly separate concerns across layers

Model real-world booking constraints cleanly

Remain deployable and demoable as an MVP

### Explicit Constraints

Modular monolith (not microservices)

MVP scope only — no overengineering

Readability and correctness over feature count

## Architecture Overview
### Backend

Stack: Node.js, TypeScript, Express, Knex, PostgreSQL

Style: Modular monolith with layered architecture

src/
├── api/              # Controllers & route handlers
├── application/      # Business logic (services / use cases)
├── infrastructure/   # Database access & external integrations
├── middleware/       # Auth, error handling, logging
├── utils/            # Shared helpers, enums, constants
├── tests/            # Unit & integration tests


### Key Principles

Controllers handle HTTP only

Services contain business rules

Repositories handle data access

No SQL in controllers or services

### Frontend

Stack: React, TypeScript

Style: Modular monolith with role-based layouts

src/
├── api/              # API client wrappers
├── components/       # Reusable UI components
├── hooks/            # Data-fetching and state logic
├── layouts/          # Role-based layout wrappers
├── pages/            # Route-level pages
├── contexts/         # Auth & feature flags
├── utils/            # Formatting & helpers

## User Roles & Capabilities
### Platform Admins (WizardsTowerCorp)

Platform-level access

Provider visibility

Analytics (stubbed or aggregated)

No booking or venue ownership

### Providers (Dungeon Owners)

Manage booking locations

View time slots and bookings

Access provider dashboard

Cannot view other providers’ data

### End Users (Adventure Parties)

Browse available dungeons

View time slot availability

Book and manage reservations

View booking history

## Data Model Overview

Core entities:

admin_user

provider

end_user

booking_location

time_slot

booking

Relationships:

Provider
  → BookingLocation
    → TimeSlot
      → Booking
        → EndUser


Design decisions:

Separate tables per user type (no polymorphic users)

Explicit foreign keys and cascading rules

Minimal booking model to preserve MVP scope

## API Overview (MVP)
### Providers

GET /api/providers/:id

GET /api/providers/:id/dashboard

### Booking Locations

GET /api/venues

GET /api/venues/:id

GET /api/venues/:id/timeslots

### End Users

GET /api/end-users/:id/bookings

### API Characteristics

Consistent JSON response shapes

Empty states return empty arrays

Invalid IDs return 404

Centralized error handling

## Authentication & Authorization

JWT-based authentication

Tokens include user ID and user type

Role-based route protection

Passwords stored as secure hashes

OAuth, refresh tokens, and MFA are intentionally out of scope for MVP.

## Business Rules (MVP)

Time slots cannot be double-booked

Cancelled bookings excluded from availability

Past and future bookings correctly separated

Availability calculated server-side

Chronological ordering enforced at query level

## Testing & Validation

Database migrations and seeds validated

API endpoints manually smoke-tested

Centralized error handling in place

Edge cases verified:

Empty datasets

Invalid IDs

Cancelled bookings

Automated tests are present where useful but not exhaustive by design.

## Local Development
Prerequisites

Node.js

PostgreSQL

npm or yarn

Setup
git clone <repo>
cd questreserve
npm install
npm run migrate
npm run seed
npm run dev


The application should be fully demoable locally in under 10 minutes.

## Known Limitations (By Design)

The following features are intentionally out of scope for this MVP:

Payments

Marketing tools

Background jobs

Advanced analytics

Feature flag infrastructure

Microservices architecture

## Potential Enhancements

Soft-delete bookings

Booking cancellation endpoint

Admin impersonation

Availability optimization

Analytics aggregation

## Why This Project Exists

This project exists to demonstrate:

Architectural judgment

Scope control

Data modeling clarity

Clean separation of concerns

It prioritizes finishing well over building endlessly.
