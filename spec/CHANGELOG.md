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
