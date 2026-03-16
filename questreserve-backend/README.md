# QuestReserve Backend

**QuestReserve** is a centralized booking platform commissioned by the regional wizard tower to help manage the flow of adventuring parties across independently operated dungeons. Dungeon owners (Providers) often struggle with scheduling, availability, and party management, and the tower requires a system that ensures orderly operations to prevent conflicts.

The platform supports three main roles:
* Providers - Dungeon owners who manage locations, availability, and bookings.
* EndUsers - Adventuring parties who browse dungeons and reserve time slots.
* Administrators - Staff at the tower who oversee operations and ensure platform integrity.

The backend implements a REST API to power these workflows, providing:
* CRUD operations for Providers, EndUsers, and bookings
* Availability and scheduling management
* Role-based access control
* Multi-tenant support for dungeon operations

While the scenario is framed in a fantastical context, the system is designed with professional, enterprise-grade practices to ensure reliability, scalability, and maintainability.

**Tech stack:** Node.js, Express 5, TypeScript, Knex, PostgreSQL, JWT

## Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** v14 or later
- **npm** v9 or later (bundled with Node.js)
- A terminal with access to `psql` and `createdb`

## Clone and Install

```bash
git clone <repo-url>
cd questreserve-backend
npm install
```

## Environment Configuration

Create a `.env` file at the **repository root** (one level above `questreserve-backend/`):

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=<your pg username>
POSTGRES_PASSWORD=<your pg password>
POSTGRES_DB=questreserve
JWT_SECRET=<any string in development; use a strong secret in production>
JWT_EXPIRY_SECONDS=86400
```

| Variable | Description | Example |
|---|---|---|
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_USER` | PostgreSQL username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `secret` |
| `POSTGRES_DB` | Database name | `questreserve` |
| `JWT_SECRET` | Signing secret for JWT tokens | `dev-secret-change-in-prod` |
| `JWT_EXPIRY_SECONDS` | Token lifetime in seconds (optional) | `86400` (24 hours, default) |

## Database Setup

Run the following from the `questreserve-backend/` directory:

If the database doesn't exist yet, create it first:

```bash
createdb questreserve
```

> If the database already exists, skip this step — `createdb` will error on duplicates.
> If your PostgreSQL user requires authentication, use `createdb -U <your-pg-username> questreserve`.

Then run migrations and seeds:

```bash
npx knex --knexfile src/db/knexfile.ts migrate:latest
npx knex --knexfile src/db/knexfile.ts seed:run
```

The seed bcrypt-hashes all passwords at `SALT_ROUNDS = 10`. Expect a few seconds of processing during seed execution.


## Automated Testing

### Test database setup

The test suite uses a separate PostgreSQL database (`questreserve_test`). Create it once if it does not already exist:

```bash
createdb questreserve_test
```

> If the test database already exists, skip this step.
> If your PostgreSQL user requires authentication, use `createdb -U <your-pg-username> questreserve_test`.

Migrations are run and rolled back automatically by the integration test suite — no manual migration step is needed for testing.

### Running the tests

All commands should be run from the `questreserve-backend/` directory.

**Run the full test suite (unit + integration):**

```bash
npm test
```

**Run a specific test file:**

```bash
npx jest <filename-pattern>
# Examples:
npx jest auth.service.test
npx jest customer.service.integration.test
```

**Run all unit tests (no DB required):**

```bash
npx jest --testPathPatterns="(?<!integration)\.test\.ts$"
```

**Run all integration tests only:**

```bash
npx jest --testPathPatterns="integration\.test\.ts$"
```

### Test types

| Type | File pattern | Requires DB |
|---|---|---|
| Unit | `*.test.ts` (excludes integration files) | No — uses in-memory mocks |
| Integration | `*.integration.test.ts` | Yes — connects to `questreserve_test` |

### What is tested

| Service | Unit test file | Integration test file |
|---|---|---|
| AuthService | `auth.service.test.ts` | — |
| CustomerService | `customer.service.test.ts` | `customer.service.integration.test.ts` |
| ProviderService | `provider.service.test.ts` | `provider.service.integration.test.ts` |
| AdminService | `admin.service.test.ts` | — |

Integration tests cover the full booking workflow (create, cancel, re-book) and location/slot ownership enforcement against a live PostgreSQL schema.

### Notes

- Integration tests automatically run `migrate.latest` in `beforeAll` and `migrate.rollback --all` in `afterAll`. No manual cleanup is required between runs.
- Each test creates its own isolated data (unique UUIDs and email addresses) so tests do not interfere with each other even when run in parallel.
- The test environment is configured in `src/db/knexfile.ts` under the `test` key and always targets the `questreserve_test` database, never the development or production database.

## Run the Server

```bash
npm run dev
```

Expected output:

```
Establishing DB connection...
DB connection successful.
Server is running on http://localhost:3001
```

Confirm the server is up:

```bash
curl http://localhost:3001/api/health
# {"status":"ok"}
```

## Seed Accounts

All seed accounts share the password: `Password1!`

### Admin Users

| Email | Role | Status |
|---|---|---|
| `the_wizard@wiztower.com` | `PLATFORM_ADMIN` | Active |
| `gandalf_the_gray@wiztower.com` | `CLIENT_SUCCESS` | Active |
| `tom_bombadil@wiztower.com` | `SUPERUSER` | Active |

### Providers

| Email | Organization | Plan | Status |
|---|---|---|---|
| `typeO@barovia.gov` | Barovia Experiences | PREMIUM | Active |
| `madmage@undermtn.com` | Undermountain Corp | STANDARD | Active |
| `smaug@erebor.co` | _(none)_ | FREE | Active |
| `vecna@whisperedtombs.net` | Whispered Tombs LLC | STANDARD | Active |
| `dracula@castlevania.net` | Castlevania Experiences | PREMIUM | Active |
| `gohma@deku-tree.hyrule` | Ganon's Forces | PREMIUM | **Suspended** |

### End Users

| Email | Role | Status |
|---|---|---|
| `laios.touden@yohaa.com` | `REGULAR` | Active |
| `underhill111@aoi.com` | `REGULAR` | Active |
| `geralt_riv@witcherscorp.com` | `REGULAR` | Active |
| `ciri.cintra@witcherscorp.com` | `PREMIERE` | Active |
| `navi@kokiri-forest.hyrule` | `PREMIERE` | Active |
| `tatltale231@yohaa.com` | `PREMIERE` | Active |
| `trevor@belmont-order.net` | `CORPORATE` | Active |
| `alucard@castlevania.net` | `CORPORATE` | Active |

## API Overview

Full documentation: `docs/api/api-contract.md`

| Route group | Base path | Auth required |
|---|---|---|
| Health | `/api/health` | None |
| Auth | `/api/auth/` | None (login/register) |
| Provider | `/api/provider/` | Bearer token (provider) |
| Customer browse | `/api/customer/locations*` | None (public) |
| Customer booking | `/api/customer/bookings*` | Bearer token (end_user) |
| Admin | `/api/admin/` | Bearer token (admin) |

## Project Structure

```
src/
  api/           Route handlers — one subdirectory per router group.
                 Each subdirectory exports a Router instance.
  app/           Express application setup (middleware, router mounting).
  db/            Knex configuration, migrations, and seed files.
  github/        GitHub Issues API client (internal tooling, not part of the product API).
  infrastructure/  BaseRepository<T> abstract class.
  middleware/    authenticate, requireRole, requestLogger, errorHandler.
  repositories/  Concrete repository implementations (BookingLocation, TimeSlot, Booking).
  services/      Business logic layer (AuthService, ProviderService, CustomerService, AdminService).
  tests/         Shared test utilities: getTestKnex, runMigrations, rollbackMigrations, and factory helpers for seeding test data.
  types/         Shared TypeScript interfaces and type aliases for all domain entities.
  utils/         jwt.ts (sign/verify), validation.ts (shared input validation helper).
  index.ts       Entry point — DB sanity check and server start.
```
