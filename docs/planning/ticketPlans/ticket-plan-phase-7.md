# Ticket Plan: Phase 7 — Frontend: Branding & UI Strategy

**Purpose:** Gather client brand assets, select a component library, define design tokens and frontend conventions, and produce `docs/planning/ui-strategy.md` as the authoritative reference for all subsequent frontend phases.
**Total tickets:** 5
**Status: LOCKED**

| Ticket | Title | GitHub Issue |
|--------|-------|-------------- |
| 1 | Gather client brand assets from WizardsTowerCorp | #55 |
| 2 | Select and document component library | #56 |
| 3 | Define design token set | #57 |
| 4 | Define frontend structural and coding conventions | #58 |
| 5 | Produce and publish the UI strategy document | #59 |

---

## Ticket 1 of 5 -- #55

**Title:** Gather client brand assets from WizardsTowerCorp

> **[EXTERNAL INPUT REQUIRED]** — This ticket cannot be started until brand assets are received from or explicitly delegated by the WizardsTowerCorp product owner. It must be handled manually before any downstream tickets begin.

**Description:**
Collect all brand material from WizardsTowerCorp needed to define the QuestReserve visual identity. This is the first blocker for all frontend phases — no design tokens, component library selection, or scaffold work can proceed until this ticket is complete.

**Acceptance Criteria:**
- [ ] Primary and secondary colour palette received as hex codes or linked Figma/brand guide source
- [ ] Typography preference confirmed: preferred typeface(s)/font stack, or explicit delegation to the QuestReserve team to choose
- [ ] Logo files received in SVG format (or client has confirmed an alternative format is acceptable)
- [ ] Aesthetic direction confirmed: e.g., dark/fantasy theme, professional SaaS, or specific reference apps cited
- [ ] Any existing style guide, brand guidelines PDF, or Figma design file shared or explicitly confirmed as non-existent
- [ ] All of the above documented in a written summary committed to `docs/planning/brand-assets-summary.md`

**Dependencies:** None — this is the root blocker for the phase.

---

## Ticket 2 of 5 -- #56

**Title:** Select and document component library

> **[EXTERNAL INPUT REQUIRED]** — Final selection requires client sign-off on the design direction established in Ticket 1. This ticket cannot begin until Ticket 1 is complete.

**Description:**
Evaluate candidate component libraries against the confirmed brand direction and accessibility requirements, then document the decision. The chosen library determines the theming approach used in Ticket 3 and the scaffold implementation in Phase 8.

**Acceptance Criteria:**
- [ ] The following candidates are evaluated against the confirmed brand direction: shadcn/ui, Radix UI (primitives only), Mantine, Chakra UI v3
- [ ] Evaluation considers: theming flexibility for the client palette, WCAG 2.1 AA accessibility compliance, bundle size and Vite tree-shaking support, and active maintenance status
- [ ] A single library is selected and the decision is documented with explicit rationale addressing each evaluation criterion
- [ ] The selected library version is pinned in the decision document
- [ ] Client or project lead has signed off on the selection
- [ ] Decision recorded in `docs/planning/ui-strategy.md` (or as a draft section pending Step 5)

**Dependencies:** Ticket 1 — brand direction must be confirmed before the evaluation is meaningful.

---

## Ticket 3 of 5 -- #57

**Title:** Define design token set

**Description:**
Using the confirmed brand palette (Ticket 1) and the chosen component library's theming format (Ticket 2), define the full design token set. These tokens are the direct source for `tailwind.config.ts` or the theme config file that will be created in Phase 8 (Frontend Scaffold).

**Acceptance Criteria:**
- [ ] Colour tokens defined: primary, secondary, accent, background, surface, text, error, warning, success, muted — all mapped to the confirmed client palette
- [ ] Typography tokens defined: heading font family, body font family, base font size scale, line height scale, font weight variants
- [ ] Spacing tokens defined: base unit and scale (4px base recommended)
- [ ] Border radius tokens defined: default, medium, large, pill
- [ ] Shadow tokens defined: card, dropdown, modal
- [ ] Breakpoint tokens defined: mobile, tablet, desktop thresholds
- [ ] All tokens expressed in the format required by the chosen component library (CSS custom properties for shadcn/ui + Tailwind; theme config object for Mantine/Chakra)
- [ ] Token table recorded in `docs/planning/ui-strategy.md` (or as a draft section pending Ticket 5)

**Dependencies:** Ticket 1 (colour palette), Ticket 2 (token format determined by library choice).

---

## Ticket 4 of 5 -- #58

**Title:** Define frontend structural and coding conventions

**Description:**
Document the frontend conventions that all phases (8–12) must follow, derived from the spec-defined folder structure (`api / components / contexts / hooks / layouts / pages / routes / utils`). This ticket can proceed in parallel with Ticket 3 once Ticket 2 is confirmed.

**Acceptance Criteria:**
- [ ] File naming convention documented: PascalCase for components, camelCase for hooks and utilities
- [ ] Component co-location rule documented: page-specific components under `pages/<PageName>/`; shared components under `components/`
- [ ] API layer pattern documented: all backend calls isolated in `src/api/`; no direct fetch/axios calls from components or hooks
- [ ] Auth context shape documented: `AuthContext` holds `{ user, token, role, login, logout }`; role-scoped layouts (`CustomerLayout`, `ProviderLayout`, `AdminLayout`) consume this context
- [ ] Hook pattern documented: data-fetching logic isolated in `src/hooks/`; hooks own loading/error state; components receive data via hook return values
- [ ] Route protection pattern documented: role-gated routes wrap role-scoped layouts; unauthenticated access redirects to the relevant login page
- [ ] TypeScript strictness policy documented: `strict: true` in `tsconfig.json`; `any` usage requires an explicit disable comment with explanation
- [ ] Error display convention documented: specifies which layout types use component-level error boundaries vs. inline error states
- [ ] Conventions recorded in `docs/planning/ui-strategy.md` (or as a draft section pending Ticket 5)

**Dependencies:** Ticket 2 — component library must be confirmed before conventions referencing it can be finalised.

---

## Ticket 5 of 5 -- #59

**Title:** Produce and publish the UI strategy document

**Description:**
Consolidate the outputs of Tickets 1–4 into the single authoritative reference document at `docs/planning/ui-strategy.md`. This document is the gate that unlocks Phase 8 (Frontend Scaffold) — Phase 8 must not begin until this ticket is complete and the document is approved.

**Acceptance Criteria:**
- [ ] `docs/planning/ui-strategy.md` exists and contains all five required sections: Brand Overview, Component Library, Design Tokens, Frontend Conventions, Phase 8 Checklist
- [ ] Brand Overview section references the confirmed palette, typefaces, logo asset locations, and aesthetic direction from Ticket 1
- [ ] Component Library section names the chosen library, pins the version, and states the rationale from Ticket 2
- [ ] Design Tokens section contains the full token table from Ticket 3 in the correct format for the chosen library
- [ ] Frontend Conventions section contains all conventions from Ticket 4
- [ ] Phase 8 Checklist section lists the specific items Phase 8 must implement to be consistent with this document (e.g., apply token file, install and configure chosen library, implement `AuthContext` with the documented shape, create the three role-scoped layouts)
- [ ] Document reviewed and approved by project lead before Phase 8 planning begins

**Dependencies:** Tickets 1, 2, 3, and 4 — all sections must be complete before this ticket can be closed.
