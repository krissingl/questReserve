# QuestReserve Backend

QuestReserve is a booking platform for dungeon-themed escape room experiences. Providers list locations and time slots; customers browse and book; admins manage the platform. This repository contains the REST API backend.

**Tech stack:** Node.js, Express 5, TypeScript, Knex, PostgreSQL, JWT

---

## Prerequisites

- **Node.js** v18 or later
- **PostgreSQL** v14 or later
- **npm** v9 or later (bundled with Node.js)
- A terminal with access to `psql` and `createdb`

---

## Clone and Install

```bash
git clone <repo-url>
cd questreserve-backend
npm install
```

---

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

---

## Database Setup

Run the following from the `questreserve-backend/` directory:

```bash
createdb questreserve
npx knex --knexfile src/db/knexfile.ts migrate:latest
npx knex --knexfile src/db/knexfile.ts seed:run
```

The seed bcrypt-hashes all passwords at `SALT_ROUNDS = 10`. Expect a few seconds of processing during seed execution.

For test runs, create the test database separately:

```bash
createdb questreserve_test
```

The `test` Knex environment in `knexfile.ts` points to `questreserve_test` automatically.

---

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

---

## Seed Accounts

All seed accounts share the password: `Password1!`

### Admin Users

| Email | Role | Status |
|---|---|---|
| `elminster@archmages.net` | `PLATFORM_ADMIN` | Active |
| `morwena@archmages.net` | `CLIENT_SUCCESS` | Active |
| `sylas.dorne@archmages.net` | `SUPERUSER` | Active |

### Providers

| Email | Organization | Plan | Status |
|---|---|---|---|
| `typeO@barovia.gov` | Barovia Experiences | PREMIUM | Active |
| `madmage@undermtn.com` | Undermountain Corp | STANDARD | Active |
| `smaug@erebor.co` | _(none)_ | FREE | Active |
| `vecna@whisperedtombs.net` | Whispered Tombs LLC | STANDARD | Active |
| `mord@greyhawk-adventures.com` | Greyhawk Adventures | FREE | Active |
| `iuz@doomgrinder.com` | Doomgrinder Thrills | PREMIUM | **Suspended** |

### End Users

| Email | Role | Status |
|---|---|---|
| `laios.touden@yohaa.com` | `REGULAR` | Active |
| `underhill111@aoi.com` | `REGULAR` | Active |
| `geralt_riv@witcherscorp.com` | `REGULAR` | Active |
| `ciri.cintra@witcherscorp.com` | `PREMIERE` | Active |
| `vin@ashmountcorp.com` | `PREMIERE` | Active |
| `kvothe@chronicler.net` | `PREMIERE` | Active |
| `liriel.baenre@menzoberranzan.net` | `CORPORATE` | Active |
| `raistlin@towers-of-high-sorcery.com` | `CORPORATE` | Active |

---

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

---

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
  tests/         Empty stub — intended home for test setup utilities when testing is introduced.
  types/         Shared TypeScript interfaces and type aliases for all domain entities.
  utils/         jwt.ts (sign/verify), validation.ts (shared input validation helper).
  index.ts       Entry point — DB sanity check and server start.
```
