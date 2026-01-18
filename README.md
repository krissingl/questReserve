# Quest Reserve

## Problem Statement
Current dungeon raid booking systems deprecated and not built to scale. Client wishes to create a new app that can be used to organize and collect data on regional dungeon raid bookings. App will allow dungeon owners to manage their bookings, establish rulesets for their clients, and track analytics and potential dungeon marketing.
Would like to have an MVP deployed before the start of the busy season to maximize profits and protect stakeholder interests.
### Potential Users
* WizardsTowerCorp Employees (Client)
    * Admin level access and dashboard feature for tracking booking analytics and managing marketing for dungeon owner clients.
* Dungeon Owner Providers
    * Admin level for their own portal access to manage their bookings, establish rulesets for their clients, and track analytics. Potential dungeon marketing may be a feature they can purchase separately. Payment managed through the site.
* Adventure Parties Customers
    * Can browser available Dungeon reservations and schedules and book their party for a raid. Can view and manage their bookings through a login portal.

**Quest Reserve is WIP**

## MVP Features

### Adventure Parties (End Users)

- Browse BookingLocations by date, location, difficulty, and features.
- View detailed BookingLocation info (description, difficulty, cancellation policy, features).
- Real-time availability and booking of TimeSlots.
- Payment processing (COMPLETE / PENDING / FAILED).
- Account creation and booking history management.
- Cancel or reschedule bookings according to BookingLocation rules.

### Dungeon Owners (Providers)

- Create and manage BookingLocations.
- Define TimeSlots for availability.
- Define dynamic rules (BookingLocationRule) per location.
- View bookings and basic revenue reporting.

### WizardsTowerCorp Client Users (Admin Users)

- Manage Organization accounts (onboard, suspend, assist).
- Monitor platform-wide booking activity.
- Platform / System Responsibilities
- Multi-tenancy with isolated Organization data.
- Strong consistency for bookings (avoid double-booking).
- Idempotent payment processing.
- Logging, metrics, and observability for core services.

## Stretch / Post-MVP Features

### Adventure Parties

- AI assistant for recommendations and rule guidance.

### Organization Users

- Advanced analytics (booking trends, occupancy rates).
- Opt-in marketing features for BookingLocations.

### WizardsTowerCorp Admins

- Aggregated analytics (regional demand, high/low-performing locations).
- Global configuration of fees, commissions, default rules.
- Audit logs for critical actions.

### Platform / System

- More complex rules or conditional logic for BookingLocationRules (seasonal rules, special events).
- Additional payment workflows (refunds, deposits).

## Data Model Evolution

This MVP implements a reduced subset of the full data model.

Planned (not yet implemented):
- Customer accounts & authentication
- Payment processing
- Booking rules engine
- Feature flagging per booking location
- Subscription plan enforcement

The schema is intentionally designed to evolve without breaking changes.

## Usage

```
WIP
```
