# QuestReserve Style Reference

**Status:** Locked
**Last updated:** 2026-03-28
**Source:** Client brief (WizardsTowerCorp, ticket #55) + team library decisions (ticket #56)

This document is the authoritative styling brief for QuestReserve's frontend. It is the input for design token definitions (#57), coding conventions (#58), and the UI strategy document (#59). Do not derive styling decisions from any other source.

---

## Colour Palette

Dark mode first. High contrast. Glowing accents.

| Token Name | Hex | Semantic Role |
|---|---|---|
| Obsidian | `#0B0F1A` | Main background |
| Surface Dark | `#121826` | Cards, panels, elevated surfaces |
| Arcane Violet | `#5B2A86` | Primary brand colour |
| Spell Gold | `#D4AF37` | Accent, highlights, glowing effects |
| Runic Blue | `#2E6F95` | Interactive elements, links |
| Mist Grey | `#A7B3C2` | Muted text, borders, dividers |
| Enchanted Green | `#3BA55D` | Success states |
| Ember Red | `#A23E48` | Warnings, danger |
| Curse Red | `#D64545` | Error states |

---

## Typography

| Role | Stack | Usage Rules |
|---|---|---|
| UI / Body | `"Inter", "Segoe UI", system-ui, sans-serif` | All body copy, labels, navigation, form fields. Must remain highly readable at all sizes. |
| Headings / Branding | `"Cinzel", "Times New Roman", serif` | Page titles, section headings, prominent brand moments. |
| Accent | `"Uncial Antiqua"` | Logos and rare decorative headings only. Use sparingly — never for functional text. |

---

## Library Selections

### Component Library — shadcn/ui
- Generates component source files into the project (no runtime npm dependency)
- Theming via CSS custom properties — maps directly to the colour tokens above
- Built on Radix UI primitives: keyboard navigation, ARIA roles, and focus management are inherited
- Dark mode via `class="dark"` on `<html>`

### Routing — React Router v7
- Supports nested routes and data loading natively
- Required for role-scoped layouts (Customer, Provider, Admin)

### State Management — React Context only
- Auth context + one context per role scope (Customer, Provider, Admin)
- No Redux or Zustand — server state is handled at the API layer; a global state library is out of scope

### Form Handling — React Hook Form + Zod
- React Hook Form for uncontrolled performance
- Zod for schema validation — reuses the same schemas defined in the backend

### HTTP Client — Axios
- Interceptors centralise auth token injection and 401 handling across all role-scoped API calls

### Date / Time — date-fns
- Lightweight and tree-shakeable
- Used for booking slot display and date formatting

---

## Aesthetic Direction

**Theme:** Dark fantasy + modern SaaS hybrid. Clean, functional booking-platform layouts with subtle magical effects (glows, gradients, particles where appropriate).

**Tone weightings (client-specified):**

| Quality | Weight |
|---|---|
| Functional | High |
| Elegant | High |
| Mysterious | Medium |
| Playful | Low |

**Client constraint (verbatim):**
> "This is not a game UI. It is a professional service used by dungeon owners. Flavor should enhance — not obstruct — usability."

This constraint takes precedence in any design trade-off where aesthetics conflict with clarity or usability.
