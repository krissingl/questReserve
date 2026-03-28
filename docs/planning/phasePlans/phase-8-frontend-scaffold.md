# Phase 8: Frontend — Scaffold

_Created: 2026-03-28 | Status: DRAFT_

## Goal

Initialise the `questreserve-frontend/` React application and implement the structural skeleton that all subsequent frontend phases (9–12) will build on: project setup, design token application, folder structure, `AuthContext`, role-scoped layouts with route guards, the API client layer, and tooling configuration.

## Context

Phases 1–6 are complete. The backend exposes auth, provider, customer, and admin endpoints. Phase 7 (Frontend Branding & UI Strategy) is complete — `docs/planning/ui-strategy.md` is the authoritative reference for all decisions in this phase. The Phase 8 checklist in Section 5 of that document defines the deliverables. No `questreserve-frontend/` directory exists yet. The spec defines the frontend as React 19 + TypeScript + Vite with the folder structure `api / components / contexts / hooks / layouts / pages / routes / utils`. Component library is **shadcn/ui**; styling is **Tailwind CSS**; HTTP client is **Axios**; routing is **React Router v7**.

## Steps

### Step 1: Initialise the Vite project and configure TypeScript

Create the `questreserve-frontend/` directory at the monorepo root. Initialise a Vite + React + TypeScript project. Set `"strict": true` in `tsconfig.json`. This step produces a compiling, running (but otherwise empty) app as the baseline for all subsequent steps.

### Step 2: Install and configure Tailwind CSS and shadcn/ui

Install Tailwind CSS and configure it for a shadcn/ui-compatible setup (PostCSS, `tailwind.config.ts`, `content` paths). Run `shadcn@latest init` to generate `components/ui/`, `lib/utils.ts`, and the default `globals.css`. The shadcn/ui CLI writes the default CSS custom property scaffold that Step 3 will replace.

### Step 3: Apply design tokens

Replace the generated `globals.css` CSS custom properties with the full token set from Section 3 of `docs/planning/ui-strategy.md`: colour tokens (Section 3.1), typography tokens (Section 3.3), spacing tokens (Section 3.4), border radius tokens (Section 3.5), and shadow tokens (Section 3.6). Register the `--surface` token in `tailwind.config.ts` under `theme.extend.colors` so `bg-surface` and related utilities work (Section 5.2 of the UI strategy). Add Google Fonts imports for `Cinzel` and `Uncial Antiqua`. Set `class="dark"` on `<html>` in `index.html` to activate dark mode by default.

### Step 4: Create the folder structure

Create all required top-level directories under `src/`: `api/`, `components/`, `contexts/`, `hooks/`, `layouts/`, `pages/`, `routes/`, `utils/`. Directories that have no content in this phase (e.g., `hooks/`, `utils/`) receive a `.gitkeep` file. This establishes the spec-defined structure that all subsequent phases will populate.

### Step 5: Implement AuthContext

Create `src/contexts/AuthContext.tsx` implementing the exact shape from Section 4.4 of `docs/planning/ui-strategy.md`: `{ user, token, role, login, logout }`. The `AuthUser` interface, `UserRole` type, and `AuthContextValue` interface are defined as documented. `login` calls `auth.api.ts` (stub implementation is acceptable in this phase — the real implementation is delivered in Phase 9). `logout` clears state, removes the token from storage, and redirects to `/login`. Provide `AuthContext` at the application root, above the router.

### Step 6: Implement role-scoped layouts and routing

Create `src/layouts/CustomerLayout.tsx`, `ProviderLayout.tsx`, and `AdminLayout.tsx` as stub layouts with the route guard logic from Section 4.6 of `docs/planning/ui-strategy.md`: redirect to `/login` if unauthenticated; redirect to the correct role root if the authenticated role does not match the layout. Configure React Router v7 in `src/routes/` with nested routes: `/customer/*` wrapped by `CustomerLayout`, `/provider/*` wrapped by `ProviderLayout`, `/admin/*` wrapped by `AdminLayout`. Public routes (`/`, `/login`) are accessible without authentication. Placeholder page components in `src/pages/` are sufficient at this stage.

### Step 7: Implement the API client layer

Create `src/api/client.ts` as a configured Axios instance with: `baseURL` from `import.meta.env.VITE_API_URL`, a request interceptor that injects the `Authorization: Bearer <token>` header from `AuthContext`, and a response interceptor that clears auth state and redirects to `/login` on a 401 response. Create `src/api/auth.api.ts` as a stub module to demonstrate the pattern and serve as the target for the `login` function in `AuthContext`. All API modules follow the file naming convention from Section 4.1 of the UI strategy (`*.api.ts`).

### Step 8: Configure ESLint, Prettier, and lint rules

Configure ESLint with `@typescript-eslint/recommended`. Enable `@typescript-eslint/no-explicit-any` as `error`. Configure Prettier and integrate it with ESLint. Add an ESLint `no-restricted-imports` rule to flag direct `axios` or `fetch` imports outside `src/api/`. All scaffold files must pass lint and type-check with zero errors.

### Step 9: Smoke test

Verify the scaffold is functional end-to-end without writing additional source code. The smoke test confirms: the app boots in development (`npm run dev`) without console errors; navigating to `/customer` while unauthenticated redirects to `/login`; dark mode tokens are visually active (Obsidian background, Arcane Violet primary colour visible); at least one shadcn/ui component (e.g., `<Button>`) renders correctly with the custom theme applied.

## Notes

- The Phase 8 checklist in `docs/planning/ui-strategy.md` Section 5 is the authoritative deliverable list for this phase. All checklist items must be satisfied before Phase 8 is considered complete.
- Token storage security: `docs/planning/ui-strategy.md` Section 4.3 notes that `localStorage` token storage is vulnerable to XSS and is an interim pattern only. Phase 8 must not ship `localStorage` as the permanent token storage solution — in-memory (React state) storage is the target. If this is deferred, it must be an explicit tracked item for Phase 9.
- Light theme: the light theme override block in the token set (Section 3.1 of the UI strategy) is not a Phase 8 deliverable. Include the `.light` block as a commented-out scaffold in `globals.css` but do not implement a theme switcher.
- `react-hook-form`, `zod`, and `date-fns` are deferred to first-use phases (Phase 9 for forms, Phase 10 for date formatting). Do not install these libraries in Phase 8.
- Payment-related UI is Post-MVP per the spec. No payment UI, routes, or layout work belongs in this phase.
- Step 5 (AuthContext) and Step 6 (layouts/routing) are tightly coupled — implement them together if the implementer finds it cleaner. They are separated here for ticket tracking purposes.
- Phase 9 (Frontend Auth Views) depends on this phase being complete before login/register page implementation can begin.
