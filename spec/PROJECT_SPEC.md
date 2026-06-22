# QuestReserve — Project Spec
_Last updated: 2026-03-01 | Status: DRAFT_

## Vision
QuestReserve is a reservation and booking platform for escape room experiences
("dungeon raids"), built for WizardsTowerCorp to serve their network of dungeon
owner clients and end users (adventure parties). It replaces a deprecated booking
system and is designed to scale across multiple venue operators as isolated tenants.

The platform serves three user types:
- **Customers (Adventure Parties)** — browse, book, and manage dungeon reservations
- **Providers (Dungeon Owners)** — manage their venues, schedules, and booking revenue
- **Admins (WizardsTowerCorp Staff)** — manage the platform, providers, and analytics

## Domain Model

- **AdminUser** — WizardsTowerCorp platform staff.
  Roles: `PLATFORM_ADMIN`, `CLIENT_SUCCESS`, `SUPERUSER`

- **Provider** — A dungeon owner / organization with one or more BookingLocations.
  Plan tiers: `FREE`, `STANDARD`, `PREMIUM`. `organization_name` is optional —
  a provider may be an individual or a named organization.

- **EndUser** — A customer (adventure party leader) who books raids.
  Roles: `REGULAR`, `PREMIERE`, `CORPORATE`, `RESTRICTED`

- **BookingLocation** — A bookable dungeon experience owned by a Provider.
  Difficulty: `EASY`, `MEDIUM`, `HARD`, `LEGENDARY`.
  Has a name, description, and cancellation policy (plain text string).
  Carries all ruleset metadata as direct columns (see extended definition below).

- **TimeSlot** — A specific available window within a BookingLocation
  (`start_time`, `end_time`). Belongs to one BookingLocation.

- **Booking** — A reservation of a TimeSlot by an EndUser.
  Status: `BOOKED`, `CANCELLED`

- **Review** — A rating and optional written review left by one party about another
  following a completed booking. `reviewer_type`: `provider` | `customer`.
  `target_type`: `provider` | `customer` | `location`. Rating: integer 1–5.
  One review per reviewer per booking. Providers may review customers; customers
  may review providers or locations.

- **BookingLocation** (extended) — Ruleset metadata is stored as columns directly
  on the `booking_location` table rather than a separate entity. Fields include:
  party size limits, level range, landscape type, setting, environment and tone
  tags, restrictions (magic, class, race, faction, party composition, physical
  access), permission flags (mount, familiar, solo), booking type, gore level,
  content flags (permadeath, PvP, boss encounter, non-lethal, scouting),
  primary focus (integer −5 to +5, puzzle-to-combat scale), run/reset/time-limit
  minutes, amenity flags (safe room, merchant, equipment, guide), loot type, and
  loot flags (boss loot, unique item chance).

## Architecture

### Backend
- Runtime: Node.js
- Framework: Express.js (v5)
- Language: TypeScript
- Database access: Knex.js
- Pattern: Modular monolith — `api / services / repositories / infrastructure / middleware / utils`
  - Controllers handle HTTP only (no business logic)
  - Services (`src/services/`) handle business rules only
  - Repositories (`src/repositories/`) contain all concrete repository implementations; introduced in Phase 4
  - `src/infrastructure/` is narrowed to `BaseRepository` and DB connection concerns only
- Location: `questreserve-backend/`

### Frontend
- Framework: React 19 + TypeScript
- Build tool: Vite
- Structure: `api / components / contexts / hooks / layouts / pages / routes / utils`
  - Role-scoped layouts: CustomerLayout, ProviderLayout, AdminLayout
  - API calls isolated in `/api`
  - Data fetching logic isolated in `/hooks`
- Location: `questreserve-frontend/`

### Database
- Engine: PostgreSQL
- Migrations: Knex.js migration system
- Connection: `.env`-driven configuration
- Multi-tenant: Provider data isolated by `provider_id` on BookingLocation

## User Roles & Access

### Admin (WizardsTowerCorp)
- Can authenticate and access admin layout
- Can manage Provider accounts (onboard, suspend, assist)
- Can view platform-wide booking activity
- Cannot book venues or own BookingLocations

### Provider (Dungeon Owner)
- Can authenticate and access provider dashboard
- Can create and manage their own BookingLocations and TimeSlots
- Can view bookings tied to their locations (revenue reporting deferred — see stretch goals)
- Cannot view other providers' data or access admin routes

### Customer (EndUser)
- Can authenticate and access customer portal
- Can browse BookingLocations by date and difficulty
- Can view real-time TimeSlot availability and make bookings
- Can view and manage their own booking history
- Cannot manage venues or provider data

## Feature Roadmap

### MVP
- Browse and filter BookingLocations by date and difficulty
- View BookingLocation details (name, description, difficulty, cancellation policy)
- Real-time TimeSlot availability
- Book a TimeSlot (Booking creation)
- Customer account creation and booking history
- Cancel bookings (status → CANCELLED)
- Provider: create and manage BookingLocations and TimeSlots
- Provider: view upcoming bookings
- Admin: manage Provider accounts
- Admin: view platform-wide booking activity
- Reviews: customers can review providers and locations after a booking; providers can review customers; average ratings displayed on browse and detail pages

### Post-MVP / Stretch
- Revenue reporting for providers (booking revenue summaries, earnings dashboards) — deferred from MVP; no payment schema exists; see US-DO-07 and US-DO-09
- Payment processing (COMPLETE / PENDING / FAILED)
- Location / geographic filtering of BookingLocations
- BookingLocation features field and feature-based filtering
- AI assistant for dungeon recommendations and rule guidance
- Advanced analytics (booking trends, occupancy rates)
- Provider opt-in marketing features
- Admin aggregated analytics (regional demand)
- Admin global configuration (fees, commissions, default policies)
- Audit logs for critical actions
- Dynamic ruleset variants (seasonal, special events) — the static ruleset fields are already in place; dynamic per-event overrides remain Post-MVP
- Refunds, deposits, and additional payment workflows

## API Contracts

_(No contracts defined yet. To be filled in as endpoints are designed.)_

Minimum MVP surface:
- Provider dashboard endpoint
- BookingLocation list + detail endpoints
- TimeSlot availability endpoint
- EndUser booking history endpoint

## Open Questions

- **Payment processing:** listed as MVP in client brief but not yet reflected in
  the database schema. When should the payment model be added?
- **Location / geographic data:** client brief references browsing by location but
  no location field exists on `booking_location`. Needs schema decision.
- **BookingLocation features:** referenced in docs as a browsable attribute but
  not in the current schema. Needs schema decision.

## Constraints & Non-Goals

- Multi-tenancy is IN scope — Provider data isolated by `provider_id`
- Payment processing is Post-MVP until schema is defined
- Dynamic BookingLocationRule enforcement (per-event overrides, seasonal rules) is Post-MVP; static ruleset fields are stored on BookingLocation and displayed in the UI
- Marketing features are Post-MVP
- Advanced analytics are Post-MVP
- Automated tests encouraged but not required for Done status
