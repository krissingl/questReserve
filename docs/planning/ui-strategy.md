# QuestReserve — UI Strategy

**Status:** Draft — in progress (Phase 7)
**Last updated:** 2026-03-28
**Source of truth for styling:** `docs/style-reference.md`

This document is the authoritative reference for all frontend implementation decisions. Phase 8 (Frontend Scaffold) must not begin until this document is marked **Approved** by the project lead.

---

## Section 1 — Brand Overview

See `docs/style-reference.md` for the locked colour palette, typography stacks, and aesthetic direction. See `docs/planning/brand-assets-summary.md` for the full client brief from WizardsTowerCorp.

**Summary:**

- **Theme:** Dark fantasy + modern SaaS hybrid. Dark mode first. High contrast. Glowing accents.
- **Primary background:** Obsidian `#0B0F1A`
- **Primary brand colour:** Arcane Violet `#5B2A86`
- **Accent:** Spell Gold `#D4AF37`
- **Body font:** `"Inter", "Segoe UI", system-ui, sans-serif`
- **Heading font:** `"Cinzel", "Times New Roman", serif`
- **Accent font:** `"Uncial Antiqua"` — logos and rare decorative headings only
- **Logo assets:** No finalised files provided. QuestReserve team is authorised to design and propose. Tower motif + magical elements required; must work in monochrome; SVG preferred.
- **Client constraint (verbatim):** _"This is not a game UI. It is a professional service used by dungeon owners. Flavor should enhance — not obstruct — usability."_

---

## Section 2 — Component Library

### Decision

**Selected library: shadcn/ui**

Version pin: **shadcn/ui 2.x** (current stable as of 2026-03-28, using the `canary` CLI or `shadcn@latest`)

### Evaluation

The following candidates were evaluated against the confirmed brand direction:

| Criterion | shadcn/ui | Radix UI (primitives only) | Mantine | Chakra UI v3 |
|---|---|---|---|---|
| **Theming flexibility** | Excellent — CSS custom properties map directly to the client palette; no theme provider wrapping required | No built-in theming; full custom CSS required | Good — theme config object; requires overriding default token names | Good — semantic token system; more opinionated defaults |
| **WCAG 2.1 AA accessibility** | Inherited from Radix UI primitives (keyboard nav, ARIA roles, focus management) | Excellent — this is Radix's primary value proposition | Good — built-in ARIA; some components require manual review | Good — built-in ARIA; some components require manual review |
| **Bundle size / Vite tree-shaking** | Excellent — components are generated as source files in the project; zero runtime npm dependency; only what is used is bundled | Excellent — install per-primitive only | Moderate — full package is ~50 kB gzipped; manual tree-shaking required | Moderate — improved in v3 but still ships a runtime provider |
| **Active maintenance** | Active — Vercel-backed; regular releases; large community | Active — shadcn/ui depends on it, ensuring continued maintenance | Active — well-maintained solo project with corporate backing | Active — v3 is a ground-up rewrite; recovering momentum |
| **Dark mode support** | Via `class="dark"` on `<html>` — exact requirement for this project's dark-first approach | Manual — must build own theme switch | Built-in `ColorSchemeProvider` | Built-in `ColorModeProvider` |
| **Fit with client palette** | Direct: CSS custom properties match token names one-for-one | Manual CSS required but fully flexible | Requires remapping Mantine token names to client palette | Requires remapping Chakra semantic token names |

### Rationale

shadcn/ui is the clear selection for this project for four reasons:

1. **Zero runtime dependency.** Components are copied into the project as source files. The bundle contains only the components used, with no shadcn runtime overhead. This is optimal for a Vite build with tree-shaking.
2. **CSS custom properties theming.** The client palette tokens (defined in Section 3) map directly to shadcn/ui's expected CSS variable names. No abstraction layer or name remapping is required.
3. **Radix UI accessibility baseline.** Keyboard navigation, ARIA roles, and focus management are inherited from Radix primitives — satisfying WCAG 2.1 AA without per-component manual work.
4. **Dark mode via class attribute.** Applying `class="dark"` to `<html>` activates the dark theme. This is the simplest possible dark-first implementation and requires no extra provider.

Radix UI primitives alone were considered as a fallback for maximum control, but the styling overhead would be significant with no benefit for this project's scope. Mantine and Chakra UI v3 were both viable but require more effort to map the client palette and carry a larger runtime footprint.

### Supporting Library Stack

The following libraries were selected alongside shadcn/ui to complete the frontend stack:

| Library | Version | Purpose |
|---|---|---|
| React Router | v7 | Routing — nested routes, data loading, role-scoped layouts |
| React Context | (built-in) | State management — Auth context + one context per role scope |
| React Hook Form | latest stable | Form handling — uncontrolled performance |
| Zod | latest stable | Schema validation — reuses backend schemas |
| Axios | latest stable | HTTP client — interceptors for auth token injection and 401 handling |
| date-fns | latest stable | Date/time — booking slot display and formatting |

No Redux or Zustand. Server state is handled at the API layer; a global state library is out of scope for this project.

---

## Section 3 — Design Tokens

_To be added — Ticket #57_

---

## Section 4 — Frontend Conventions

_To be added — Ticket #58_

---

## Section 5 — Phase 8 Checklist

_To be added — Ticket #59_
