# Changelog

## [2026-02-17 12:00] — First-pass spec update from docs review
- Triggered by: session/2026-02-17_002_docs-review-spec-draft.md
- Changed: Full spec rewrite based on /docs review and migration reconciliation.
  - Vision: added WizardsTowerCorp as client, three user type summary
  - Domain Model: replaced incorrect entity names (Venue/Room/Guest) with actual
    entities (AdminUser/Provider/EndUser/BookingLocation/TimeSlot/Booking);
    added enums from migration; added BookingLocationRule as Post-MVP
  - Architecture: resolved all TBD items — Express.js, React 19 + TypeScript + Vite,
    PostgreSQL; added modular monolith pattern detail; added User Roles & Access section
  - Feature Roadmap: populated MVP and Post-MVP from user stories; payment processing
    moved to Post-MVP (not in migration schema); location and features filtering
    moved to Post-MVP (not in migration schema)
  - Open Questions: replaced resolved questions with three new schema-gap questions
    (payment, location, features)
  - Constraints: corrected multi-tenancy (now IN scope); updated to reflect current reality

## [2026-02-17 00:00] — Initial spec creation
- Triggered by: bootstrap (user direct)
- Changed: Created PROJECT_SPEC.md with initial structure — Vision, Domain Model,
  Architecture (Backend/Frontend/Database), API Contracts, Feature Roadmap,
  Open Questions, and Constraints & Non-Goals. Content is sparse and marked
  as DRAFT; open questions capture what is not yet known.

## [2026-03-01 00:00] — Rename service layer directory: application → services
- Triggered by: session/2026-02-28_011_phase-3-tickets.md | user direct (2026-03-01)
- Changed: Architecture > Backend — updated the modular monolith pattern description.
  Previously read `api / application / infrastructure / middleware / utils`; now reads
  `api / services / repositories / infrastructure / middleware / utils`. The inline bullet
  describing business-rule handling was updated from the generic "Services handle business
  rules only" to explicitly name `src/services/` as the directory. This reflects a user
  preference applied during Phase 3 implementation: the service layer directory was renamed
  from `src/application/` to `src/services/`.

## [2026-03-01 00:01] — Document src/repositories/ directory; narrow src/infrastructure/ scope
- Triggered by: session/2026-02-28_011_phase-3-tickets.md | user direct (2026-03-01)
- Changed: Architecture > Backend — added two new bullet points to the pattern description.
  `src/repositories/` is now documented as the home for all concrete repository
  implementations, introduced in Phase 4. `src/infrastructure/` is narrowed: previously it
  was described as a general-purpose infrastructure layer; it is now explicitly limited to
  `BaseRepository` and DB connection concerns only. This reflects the Phase 4 directory
  structure decision to separate concrete repos from infrastructure plumbing.

## [2026-03-01 00:02] — Defer revenue reporting from MVP to stretch goals
- Triggered by: session/2026-02-28_011_phase-3-tickets.md | user direct (2026-03-01)
- Changed: Three locations updated to reflect that provider revenue reporting is out of MVP
  scope because no payment schema exists.
  1. Architecture > Backend timestamp and Status tag updated (timestamp-only change, covered
     by the paired write rule).
  2. User Roles & Access > Provider — removed "and basic revenue reporting" from the sentence
     describing what providers can view; replaced with a parenthetical noting deferral to
     stretch goals.
  3. Feature Roadmap > MVP — removed "Provider: view upcoming bookings and basic revenue
     reporting"; replaced with "Provider: view upcoming bookings" (reporting stripped).
  4. Feature Roadmap > Post-MVP / Stretch — added new entry at the top of the list:
     "Revenue reporting for providers (booking revenue summaries, earnings dashboards) —
     deferred from MVP; no payment schema exists; see US-DO-07 and US-DO-09."
