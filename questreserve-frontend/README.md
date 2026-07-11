# QuestReserve — Frontend

The React single-page application for QuestReserve — the customer, provider, and admin portals in one app, each behind its own role-scoped layout.

For the product tour, screenshots, and the overall architecture, see the [root README](../README.md). This document covers running and working on the frontend.

**Tech stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router 7 · React Hook Form + Zod · Axios

## Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later (bundled with Node.js)
- A running **QuestReserve backend** — see [`../questreserve-backend/README.md`](../questreserve-backend/README.md)

## Install

```bash
cd questreserve-frontend
npm install
```

## Environment Configuration

Copy the example file and adjust as needed:

```bash
cp .env.example .env.local
```

The only required variable is the backend API base URL. It must include the `/api` path prefix, with no trailing slash:

```
VITE_API_URL=http://localhost:3001/api
```

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the QuestReserve backend API, **including `/api`** | `http://localhost:3001/api` |

> The backend defaults to port `3001` and mounts all routes under `/api`. If you change the backend port, update this value to match.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server (default `http://localhost:5173`) |
| `npm run build` | Type-check (`tsc -b`) and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

## Run

```bash
npm run dev
```

Then open `http://localhost:5173`. With the backend running and seeded, log in with any seed account (all use password `Password1!`; see the [backend README](../questreserve-backend/README.md#seed-accounts) for the full list) to explore the customer, provider, and admin portals.

## Project Structure

```
src/
  api/          Axios API client (client.ts) + one module per domain
                (auth, customer, provider, admin, guest, messages, reviews).
  assets/       Static assets bundled by Vite.
  components/   Reusable presentational and composite components.
  constants/    Shared constants (e.g. difficulty colours, filter options).
  contexts/     React context providers (AuthContext — token + current user).
  hooks/        Data-fetching and stateful logic hooks (kept out of components).
  layouts/      Role-scoped shells: CustomerLayout, ProviderLayout, AdminLayout,
                GuestLayout, plus auth redirects.
  lib/          Low-level shared utilities.
  pages/        Route-level views, grouped by feature.
  routes/       Route definitions and access guards.
  types/        Shared TypeScript domain types (mirrors the backend model).
  utils/        Pure helpers (filter serialization, Will's keyword matcher, etc.).
```

## Architecture Notes

- **Role-scoped layouts.** Each user type gets its own layout shell (`CustomerLayout`, `ProviderLayout`, `AdminLayout`), so navigation and chrome stay tailored per role; `GuestLayout` covers unauthenticated browsing.
- **API isolated in `/api`.** All network calls live in typed client modules — components never call `axios` directly. A shared `client.ts` attaches the auth token and redirects to login on a `401`.
- **Data fetching isolated in `/hooks`.** Components stay declarative; fetching, loading, and error state live in hooks.
- **Forms validated with React Hook Form + Zod.** Schemas define the contract; the resolver enforces it before submit.
