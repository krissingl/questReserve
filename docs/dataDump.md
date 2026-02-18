# Data Dump
Client: WizardsTowerCorp

Problem Statement: Current dungeon raid booking systems deprecated and not built to scale. Client wishes to create a new app that can be used to organize and collect data on regional dungeon raid bookings. App will allow dungeon owners to manage their bookings, establish rulesets for their clients, and track analytics and potential dungeon marketing. Would like to have an MVP deployed before the start of the busy season to maximize profits and protect stakeholder interests.

Potential Users:
- WizardsTowerCorp Employees: Admin level access and dashboard feature for tracking booking analytics and managing marketing for dungeon owner clients.
- Dungeon Owner Clients: Admin level for their own portal access to manage their bookings, establish rulesets for their clients, and track analytics. Potential dungeon marketing may be a feature they can purchase separately. Payment managed through the site.
- Adventure Parties: Can browser available Dungeon reservations and schedules and book their party for a raid. Can view and manage their bookings through a login portal.

## MVP Features:
Adventure Parties (End Users):
- Browse BookingLocations by date, location, difficulty, and features.
- View detailed BookingLocation info (description, difficulty, cancellation policy, features).
- Real-time availability and booking of TimeSlots.
- Payment processing (COMPLETE / PENDING / FAILED).
- Account creation and booking history management.
- Cancel or reschedule bookings according to BookingLocation rules.

Organization Users (Dungeon Owners):
- Create and manage BookingLocations.
- Define TimeSlots for availability.
- Define dynamic rules (BookingLocationRule) per location.
- View bookings and basic revenue reporting.

WizardsTowerCorp Admins (Platform Users):
- Manage Organization accounts (onboard, suspend, assist).
- Monitor platform-wide booking activity.

Platform / System Responsibilities:
- Multi-tenancy with isolated Organization data.
- Strong consistency for bookings (avoid double-booking).
- Idempotent payment processing.
- Logging, metrics, and observability for core services.

## Stretch / Post-MVP Features
Adventure Parties:
- AI assistant for recommendations and rule guidance.

Organization Users:
- Advanced analytics (booking trends, occupancy rates).
- Opt-in marketing features for BookingLocations.

WizardsTowerCorp Admins
- Aggregated analytics (regional demand, high/low-performing locations).
- Global configuration of fees, commissions, default rules.
- Audit logs for critical actions.

Platform / System
- More complex rules or conditional logic for BookingLocationRules (seasonal rules, special events).
- Additional payment workflows (refunds, deposits).

## Potential FE Architecture
/src

├── /api

│   ├── index.ts           # API client setup (base URL, auth headers)

│   ├── bookings.ts        # Fetch/create/manage bookings

│   ├── venues.ts          # Fetch/manage venues (formerly dungeons)

│   └── users.ts           # Auth, user info, profile data

│

├── /components

│   ├── /Cards

│   │   └── VenueCard.tsx  # Reusable card for displaying venue info

│   ├── /Tables

│   │   └── BookingTable.tsx

│   ├── /Modals

│   │   └── ConfirmModal.tsx

│   └── /Forms

│       └── BookingForm.tsx

│

├── /contexts

│   ├── AuthContext.tsx           # Tracks current user + role

│   └── FeatureFlagsContext.tsx   # Optional feature toggles

│

├── /hooks

│   ├── useBookings.ts            # Booking data fetching / state

│   ├── useVenues.ts              # Venue data fetching / filters

│   └── usePagination.ts

│

├── /layouts

│   ├── CustomerLayout.tsx        # Wraps customer pages

│   ├── ProviderLayout.tsx        # Wraps provider pages

│   └── AdminLayout.tsx           # Wraps admin pages

│

├── /pages

│   ├── /Customer                 # End users who book venues

│   │   ├── VenueList.tsx         # Browse venues

│   │   ├── VenueDetails.tsx      # Detailed info on one venue

│   │   └── BookingHistory.tsx    # Past & upcoming bookings

│   │

│   ├── /Provider                 # Venue owners / managers

│   │   ├── ProviderDashboard.tsx

│   │   ├── ManageVenues.tsx      # Create / edit venue listings

│   │   └── ProviderBookings.tsx  # Manage venue bookings

│   │

│   └── /Admin                    # Platform administrators

│       ├── AdminDashboard.tsx

│       ├── ManageProviders.tsx   # Manage venue owners

│       └── Analytics.tsx         # Platform-wide metrics

│

├── /routes

│   └── index.tsx                # Route definitions, guards

├── /styles

│   └── globals.css              # Global CSS / variables

├── /utils

│   ├── formatDate.ts

│   └── calculateAvailability.ts

└── index.tsx                     # App entry point

## Potential BE Architecture
/src

├── /api                 # API route handlers / controllers

│   ├── bookingsController.ts   # Handles booking-related HTTP requests

│   ├── venuesController.ts     # Handles venue management requests

│   ├── usersController.ts      # Handles auth, user profile requests

│   └── adminController.ts      # Admin-specific API endpoints

│

├── /application          # Application/business logic layer (use cases, services)

│   ├── bookingService.ts          # Booking domain logic (create, cancel, list)

│   ├── venueService.ts            # Venue domain logic (create, update, query)

│   ├── userService.ts             # User management and authentication

│   └── adminService.ts            # Admin-specific logic (manage providers, analytics)

│

├── /domain               # Core domain models & business rules

│   ├── Booking.ts               # Booking entity, business rules

│   ├── Venue.ts                 # Venue entity, validation rules

│   ├── User.ts                  # User entity, roles, permissions

│   └── enums.ts                 # Shared enums/constants (e.g., roles, booking statuses)

│

├── /infrastructure       # Database, external services, and infrastructure concerns

│   ├── db.ts                   # Database connection setup (Postgres)

│   ├── bookingRepository.ts    # Booking data persistence (SQL queries / ORM)

│   ├── venueRepository.ts      # Venue data persistence

│   ├── userRepository.ts       # User data persistence

│   ├── paymentGateway.ts       # Payment provider integration (mock or real)

│   └── logger.ts               # Logging utilities

│

├── /middleware           # Express middleware (auth, validation, error handling)

│   ├── authMiddleware.ts        # JWT token validation, role checks

│   ├── errorHandler.ts          # Centralized error handling

│   └── requestLogger.ts         # Request logging middleware

│

├── /config               # Configuration files and environment setup

│   ├── default.ts               # Default config values

│   ├── production.ts            # Production overrides

│   └── index.ts                 # Config loader

│

├── /utils                # Utility functions shared across layers

│   ├── dateUtils.ts

│   ├── validation.ts

│   └── idempotency.ts            # Helpers for payment idempotency, etc.

│

├── /jobs                 # Background jobs or scheduled tasks (optional)

│   └── analyticsJob.ts          # Example: daily analytics calculation

│

├── /tests                # Unit and integration tests

│   ├── booking.test.ts

│   ├── venue.test.ts

│   └── user.test.ts

│

├── app.ts                # Express app setup (routes + middleware)

├── server.ts             # Server bootstrap and listener

└── index.ts              # Entry point (may just import server.ts)