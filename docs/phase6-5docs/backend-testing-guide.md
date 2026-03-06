# Backend Testing Guide

_QuestReserve — Backend Environment Setup_

This guide gets a local backend environment to a running state with seed data. It assumes you know what you want to test and just need the environment working.

For the full environment variable reference, see `questreserve-backend/README.md`.

---

## Prerequisites

- **Node.js** v18 or later (v24 used in development)
- **PostgreSQL** v14 or later (v18 used in development)
- A terminal with access to `psql` and `createdb`

---

## Install

```bash
cd questreserve-backend
npm install
```

---

## Environment Configuration

Create a `.env` file at the **repo root** (not inside `questreserve-backend/`):

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=<your pg user>
POSTGRES_PASSWORD=<your pg password>
POSTGRES_DB=questreserve
JWT_SECRET=any-local-dev-secret
JWT_EXPIRY_SECONDS=86400
```

`JWT_EXPIRY_SECONDS` is optional and defaults to 86400 (24 hours).

---

## Database Setup

Run each command from the `questreserve-backend/` directory. Expected output is shown after each command.

**1. Create the database**

```bash
createdb questreserve
```

No output on success.

**2. Run migrations**

```bash
npx knex --knexfile src/db/knexfile.ts migrate:latest
```

Expected output:
```
Using environment: development
Batch 1 run: 2 migrations
```

**3. Run the seed**

```bash
npx knex --knexfile src/db/knexfile.ts seed:run
```

Expected output:
```
Using environment: development
Ran 1 seed files
```

The seed bcrypt-hashes all passwords at `SALT_ROUNDS = 10`. This takes a few seconds — that is normal.

---

## Start the Server

```bash
npm run dev
```

Expected output:
```
Establishing DB connection...
DB connection successful.
Server is running on http://localhost:3001
```

[SCREENSHOT OPPORTUNITY: Terminal showing the three startup lines above with no errors — useful for the onboarding README or portfolio docs.]

Confirm the server is up:

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{ "status": "ok" }
```

---

## Smoke Checks

The following examples use fixed UUIDs hardcoded in the seed. They work against any database seeded from `001_core_init.ts`.

**Health check**

```bash
curl http://localhost:3001/api/health
```

**Log in as the seed platform admin**

Admin email: `elminster@archmages.net`, password: `Password1!`

```bash
curl -s -X POST http://localhost:3001/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"elminster@archmages.net","password":"Password1!"}' | cat
```

Expected: `{ "token": "<jwt>" }`

**Fetch the provider list (admin-authenticated)**

Paste the token from the login response in place of `<token>`:

```bash
curl -s http://localhost:3001/api/admin/providers \
  -H "Authorization: Bearer <token>" | cat
```

Expected: JSON array of 6 provider objects (no `password_hash` field).

**Fetch locations as a public (unauthenticated) customer**

```bash
curl http://localhost:3001/api/customer/locations
```

Expected: JSON array of 8 booking location objects.

**Log in as the seed end user and view booking history**

End user email: `laios.touden@yohaa.com` (fixed UUID: `33333333-3333-3333-3333-333333333333`), password: `Password1!`

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/end-user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"laios.touden@yohaa.com","password":"Password1!"}' | \
  node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token));")

curl -s http://localhost:3001/api/customer/bookings \
  -H "Authorization: Bearer $TOKEN" | cat
```

Expected: JSON array containing one booking for Laios (Ravenloft Great Hall slot, status `BOOKED`).

---

## Common Failure Modes

**Server fails to start: `DB sanity check failed`**
- PostgreSQL is not running. Start the service: `pg_ctl start` or equivalent for your OS.
- The `.env` credentials are wrong. Verify `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`.

**Migration fails: `relation already exists`**
- The DB has already been migrated. Either drop and recreate it, or run `npx knex migrate:rollback --all` before re-migrating.

**`seed:run` fails: `connect ECONNREFUSED`**
- PostgreSQL is not running, or the `.env` is not being picked up. Confirm the `.env` is at the repo root.

**Seed accounts not found / login returns 401**
- The seed may not have run, or was run against a different database. Re-run `npx knex seed:run`. Note that re-running the seed on a non-empty database will fail with a unique-constraint error — truncate the tables first or recreate the DB.

**Token expires quickly**
- `JWT_EXPIRY_SECONDS` defaults to 86400 (24 hours). If you set it too low in `.env`, tokens expire quickly. Set it to `86400` for local development.

**Wrong Node version**
- Run `node --version`. If the output is below v18, install a supported version via nvm or the Node.js installer.

---

## Advisory: Automated Testing Strategy

No test files exist yet. When automated tests are introduced, the recommended approach is:

**Unit tests** — `CustomerService`, `ProviderService`, `AuthService`
- Mock all repository dependencies with jest mock functions.
- Test each typed error case (`SlotUnavailableError`, `BookingOwnershipError`, etc.) and each happy path.

**Integration tests** — use the `test` Knex environment
- The `test` environment in `knexfile.ts` connects to `questreserve_test` (a separate DB).
- Each test suite runs `knex migrate:latest` before tests and `knex migrate:rollback --all` after.
- Seed only the data each test needs — avoid relying on `001_core_init.ts` in integration tests.

**Test runner** — Jest with `ts-jest`
- Consistent with the project's TypeScript stack.
- `ts-jest` handles TypeScript compilation without a separate build step.

**Setup utilities** — `src/tests/index.ts`
- Currently an empty stub from the Phase 2 backend foundation.
- Intended home for shared test helpers: knex instance setup, factory functions, teardown utilities.
