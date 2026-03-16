# Phase 7: Frontend — Branding & UI Strategy

_Created: 2026-03-15 | Status: DRAFT_

## Goal

Gather all client branding inputs and produce a UI strategy document that defines the design system, component library, colour and typography tokens, and frontend conventions that every subsequent frontend phase will follow. This phase produces a reference document, not code.

## Context

Phases 1–6 are complete. The backend is fully implemented: auth, provider domain, customer domain, and admin domain. Phase 8 (Frontend Scaffold) cannot begin until the design system choices made in this phase are locked — component library selection, colour palette, and typography directly determine scaffold implementation decisions. No frontend directory (`questreserve-frontend/`) exists yet. The spec defines the frontend as React 19 + TypeScript + Vite with a folder structure of `api / components / contexts / hooks / layouts / pages / routes / utils`.

## Steps

### Step 1: Gather client brand assets

**[EXTERNAL INPUT REQUIRED]** — Brand assets needed from the client (WizardsTowerCorp) before this step can begin.

Contact: WizardsTowerCorp product owner or designated brand contact.

Required inputs:
- Primary and secondary colour palette (hex codes or Figma/brand guide source)
- Typography: preferred typeface(s) or font stack; if none specified, a recommendation is needed from the client before tokens are defined
- Logo files (SVG preferred) for use in the app header and auth pages
- Any existing style guide, brand guidelines PDF, or Figma design file
- Tone/aesthetic direction (e.g., dark theme, fantasy/dungeon aesthetic, professional SaaS, or specific reference apps)

This step is complete when the above assets are either confirmed received or the client has explicitly delegated the design decision to the QuestReserve team.

### Step 2: Select and confirm component library

**[EXTERNAL INPUT REQUIRED]** — Final selection requires client sign-off on the design direction (Step 1 output).

Evaluate the following candidate libraries against the confirmed brand direction:

| Candidate | Notes |
|---|---|
| shadcn/ui | Headless, fully customisable, no runtime dependency, pairs well with Tailwind CSS |
| Radix UI (primitives only) | Maximum flexibility; higher integration effort |
| Mantine | Opinionated defaults; faster to scaffold; less flexible for custom themes |
| Chakra UI v3 | Accessible defaults; familiar to React teams |

Decision criteria:
- Theming flexibility to accommodate the client brand palette
- Accessibility compliance (WCAG 2.1 AA minimum — three user types will use this app including potentially admin staff with accessibility needs)
- Bundle size and tree-shaking support (Vite build)
- Active maintenance status

Output: a single confirmed component library documented in the UI strategy document.

### Step 3: Define design tokens

Once brand assets (Step 1) and component library (Step 2) are confirmed, define the design token set that will be used across the frontend.

Tokens to define:
- **Colours:** primary, secondary, accent, background, surface, text, error, warning, success, muted — mapped to the client palette from Step 1
- **Typography:** font families (heading and body), base font size scale, line height, font weight variants
- **Spacing:** base spacing unit and scale (typically 4px base)
- **Border radius:** default, medium, large, pill
- **Shadows:** card, dropdown, modal
- **Breakpoints:** mobile, tablet, desktop thresholds

Tokens must be expressible in the format required by the chosen component library (e.g., CSS custom properties for shadcn/ui + Tailwind, or a theme config object for Mantine/Chakra).

Output: a tokens table in the UI strategy document. These tokens become the direct source for `tailwind.config.ts` or the theme file in Phase 8.

### Step 4: Define frontend conventions

Document the structural and coding conventions that all frontend phases will follow, derived from the spec's defined structure.

Conventions to define (informed by the spec's `api / components / contexts / hooks / layouts / pages / routes / utils` structure):

- **File naming:** PascalCase for components, camelCase for hooks and utilities
- **Component co-location rule:** page-specific components live inside `pages/<PageName>/` unless shared; shared components live in `components/`
- **API layer pattern:** all backend calls isolated in `src/api/`; no direct `fetch`/`axios` calls from components or hooks
- **Auth context shape:** `AuthContext` holds `{ user, token, role, login, logout }` — role-scoped layouts (`CustomerLayout`, `ProviderLayout`, `AdminLayout`) consume this context
- **Hook pattern:** data-fetching logic isolated in `src/hooks/`; hooks own loading/error state; components receive data via hook return values
- **Route protection pattern:** role-gated routes wrap role-scoped layouts; unauthenticated access redirects to the relevant login page
- **TypeScript strictness:** `strict: true` in `tsconfig.json`; no `any` without an explicit `// eslint-disable` comment explaining the exception
- **Error display convention:** component-level error boundaries vs. inline error states — specify which is preferred for each layout type

Output: a conventions section in the UI strategy document.

### Step 5: Produce the UI strategy document

Consolidate outputs from Steps 1–4 into a single reference document at `docs/planning/ui-strategy.md`.

Document structure:
1. Brand Overview — confirmed palette, typefaces, logo assets, aesthetic direction
2. Component Library — chosen library, rationale, version pinned
3. Design Tokens — full token table (colours, type, spacing, radius, shadows, breakpoints)
4. Frontend Conventions — naming, structure, API layer, auth context shape, hook pattern, route protection, TypeScript config
5. Phase 8 Checklist — specific items Phase 8 must implement to be consistent with this document

This document is the authoritative reference for Phases 8–12. Any deviation in later phases must be flagged and the UI strategy document updated before the deviation is merged.

## Notes

- This phase produces no source code — its sole output is `docs/planning/ui-strategy.md`
- Phase 8 (Frontend Scaffold) is blocked until Steps 1, 2, and 3 of this phase are complete — component library and token choices directly determine `tailwind.config.ts` or the theme file structure
- Steps 3 and 4 can proceed in parallel once Step 2 is confirmed
- Step 5 cannot begin until Steps 1–4 are complete
- The three role-scoped layouts (`CustomerLayout`, `ProviderLayout`, `AdminLayout`) are named in the spec and must be preserved in all convention decisions — do not rename them in the UI strategy
- Accessibility minimum: WCAG 2.1 AA — this is a constraint to apply when evaluating component libraries in Step 2, not a stretch goal
- Payment-related UI is Post-MVP per the spec; no payment UI conventions need to be defined in this phase
