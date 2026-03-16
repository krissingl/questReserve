<p align="center">
  <img src="assets\qrrlogo.gif" alt="QUEST RESERVE LOGO" width="800">
</p>

---

**QuestReserve** is a custom booking and reservation platform built for [WizardsTowerCorp](https://wizardstowercorp.com) - a company managing a network of dungeon raid experiences for adventure parties of all kinds.

We designed and delivered QuestReserve end-to-end: from data architecture and business logic to a polished, role-aware web interface. The result is a platform that handles the full booking lifecycle, keeps each stakeholder in their lane, and runs reliably without friction.

## What It Does

QuestReserve connects three types of users across a single, unified platform:

| Role | Who They Are | What They Do |
|---|---|---|
| **Platform Admin** | WizardsTowerCorp staff | Oversee providers, manage the platform, and monitor activity |
| **Provider** | Dungeon owners | List their locations, manage time slots, and track bookings |
| **End User** | Adventure parties | Browse dungeons, check availability, and book raids |

Each role sees only what's relevant to them - no noise, no overlap.

## What We Built

- A **provider management system** that lets dungeon owners control their listings, schedules, and booking visibility
- A **real-time availability engine** that prevents double-bookings and surfaces accurate slot data to end users
- A **role-based access layer** so admins, providers, and guests each get a tailored experience with appropriate permissions
- A **clean, maintainable codebase** - built to be handed off, extended, and operated with confidence

## Why QuestReserve

Booking platforms are a solved problem - until they aren't. Off-the-shelf tools often mean compromises: rigid workflows, vendor lock-in, or features that don't map to your domain.

QuestReserve was built from scratch around WizardsTowerCorp's actual business model. That means the rules, the roles, and the data structures reflect how they actually operate - not a generic approximation.

If your business has a unique booking flow, specialized user types, or specific operational constraints, a custom platform built to your domain will always outperform a generic SaaS tool adapted to fit.

## Technical Notes

For implementation details, see the dedicated README files:

- [`questreserve-backend/README.md`](questreserve-backend/README.md) - API design, data model, backend architecture
- [`questreserve-frontend/README.md`](questreserve-frontend/README.md) - UI architecture, component structure, local dev

*Built with care by someone that takes boring infrastructure seriously.*
