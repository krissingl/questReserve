# QuestReserve — Project Spec
_Last updated: 2026-02-17T00:00:00Z | Status: DRAFT_

## Vision
QuestReserve is a reservation and booking platform for escape rooms and similar
experience-based venues. It enables venue operators to manage room availability,
bookings, and guest experiences through a structured backend API and a frontend
consumer interface.

## Domain Model

_(To be elaborated as the project develops.)_

- **Venue** — an escape room operator with one or more rooms
- **Room** — a bookable experience unit within a venue
- **Booking** — a reservation of a room at a specific time by a guest party
- **Guest** — the person making the reservation

## Architecture

### Backend

- Runtime: Node.js
- Framework: _(TBD)_
- Database access: Knex.js
- Location: `questreserve-backend/`

### Frontend

- Location: `questreserve-frontend/`
- Framework: _(TBD)_

### Database

- Engine: _(TBD — PostgreSQL assumed)_
- Migrations: Knex.js migration system
- Connection: `.env`-driven configuration

## API Contracts

_(No contracts defined yet. To be filled in as endpoints are designed.)_

## Feature Roadmap

_(To be defined.)_

## Open Questions

- What framework is the backend using?
- What framework is the frontend using?
- What database engine is targeted for production?
- Are there existing migrations or schemas?

## Constraints & Non-Goals

- No multi-tenancy in the initial scope (single venue operator assumed)
- No payment processing in initial scope
