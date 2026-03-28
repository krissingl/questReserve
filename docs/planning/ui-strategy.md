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

All tokens are expressed as CSS custom properties. This is the format required by shadcn/ui + Tailwind CSS. The `:root` block below defines the dark theme values (dark mode is primary). A light theme override block is included for completeness but is not a Phase 8 deliverable.

Token values are sourced directly from `docs/style-reference.md` and the client palette in `docs/planning/brand-assets-summary.md`.

### 3.1 Colour Tokens

shadcn/ui uses a specific set of semantic variable names that drive its component defaults. The mapping below aligns those names with the client palette.

```css
/* globals.css — dark mode (primary theme) */
:root {
  /* ---- Backgrounds ---- */
  --background:        11 15 26;      /* Obsidian      #0B0F1A  — main app background */
  --surface:           18 24 38;      /* Surface Dark  #121826  — cards, panels, elevated surfaces */

  /* ---- Foreground / Text ---- */
  --foreground:        255 255 255;   /* White                  — primary text on dark bg */
  --muted-foreground:  167 179 194;   /* Mist Grey     #A7B3C2  — secondary text, placeholders */

  /* ---- Brand / Primary ---- */
  --primary:           91 42 134;     /* Arcane Violet  #5B2A86 */
  --primary-foreground: 255 255 255;  /* White                  — text on primary bg */

  /* ---- Accent ---- */
  --accent:            212 175 55;    /* Spell Gold     #D4AF37 */
  --accent-foreground: 11 15 26;      /* Obsidian               — text on accent bg */

  /* ---- Secondary / Interactive ---- */
  --secondary:         46 111 149;    /* Runic Blue     #2E6F95 */
  --secondary-foreground: 255 255 255;

  /* ---- Muted ---- */
  --muted:             18 24 38;      /* Surface Dark   #121826 — muted backgrounds */
  --muted-foreground:  167 179 194;   /* Mist Grey      #A7B3C2 */

  /* ---- Card ---- */
  --card:              18 24 38;      /* Surface Dark   #121826 */
  --card-foreground:   255 255 255;

  /* ---- Popover ---- */
  --popover:           18 24 38;
  --popover-foreground: 255 255 255;

  /* ---- Border / Input / Ring ---- */
  --border:            167 179 194;   /* Mist Grey      #A7B3C2 */
  --input:             167 179 194;
  --ring:              91 42 134;     /* Arcane Violet  #5B2A86 — focus rings */

  /* ---- Semantic states ---- */
  --destructive:       214 69 69;     /* Curse Red      #D64545 — error states */
  --destructive-foreground: 255 255 255;
  --warning:           162 62 72;     /* Ember Red      #A23E48 — warnings, danger */
  --warning-foreground: 255 255 255;
  --success:           59 165 93;     /* Enchanted Green #3BA55D */
  --success-foreground: 255 255 255;
}

/* Light theme override — not a Phase 8 deliverable; reserved for future use */
.light {
  --background:        255 255 255;
  --surface:           245 245 245;
  --foreground:        11 15 26;
  --muted-foreground:  100 116 139;
  --primary:           91 42 134;
  --primary-foreground: 255 255 255;
  --accent:            212 175 55;
  --accent-foreground: 11 15 26;
}
```

> **Note on format:** shadcn/ui + Tailwind expect CSS colour variables as space-separated RGB channels (no `rgb()` wrapper), so Tailwind can apply opacity modifiers like `bg-primary/50`. The hex codes are shown as comments for reference only.

### 3.2 Colour Token Reference Table

| Token | RGB Channels | Hex | Semantic Role |
|---|---|---|---|
| `--background` | `11 15 26` | `#0B0F1A` | Main app background |
| `--surface` / `--card` / `--muted` | `18 24 38` | `#121826` | Cards, panels, elevated surfaces |
| `--foreground` | `255 255 255` | `#FFFFFF` | Primary text |
| `--muted-foreground` | `167 179 194` | `#A7B3C2` | Secondary text, placeholders, borders |
| `--primary` | `91 42 134` | `#5B2A86` | Primary brand — Arcane Violet |
| `--primary-foreground` | `255 255 255` | `#FFFFFF` | Text on primary background |
| `--accent` | `212 175 55` | `#D4AF37` | Accent highlights, glowing effects — Spell Gold |
| `--accent-foreground` | `11 15 26` | `#0B0F1A` | Text on accent background |
| `--secondary` | `46 111 149` | `#2E6F95` | Interactive elements, links — Runic Blue |
| `--secondary-foreground` | `255 255 255` | `#FFFFFF` | Text on secondary background |
| `--border` / `--input` | `167 179 194` | `#A7B3C2` | Borders, input outlines |
| `--ring` | `91 42 134` | `#5B2A86` | Focus rings |
| `--destructive` | `214 69 69` | `#D64545` | Error states — Curse Red |
| `--warning` | `162 62 72` | `#A23E48` | Warnings, danger — Ember Red |
| `--success` | `59 165 93` | `#3BA55D` | Success states — Enchanted Green |

### 3.3 Typography Tokens

```css
/* globals.css — continued */
:root {
  /* ---- Font families ---- */
  --font-body:     "Inter", "Segoe UI", system-ui, sans-serif;
  --font-heading:  "Cinzel", "Times New Roman", serif;
  --font-accent:   "Uncial Antiqua";          /* logos and rare decorative headings only */

  /* ---- Base font size scale (rem, 16px base) ---- */
  --text-xs:    0.75rem;   /* 12px */
  --text-sm:    0.875rem;  /* 14px */
  --text-base:  1rem;      /* 16px */
  --text-lg:    1.125rem;  /* 18px */
  --text-xl:    1.25rem;   /* 20px */
  --text-2xl:   1.5rem;    /* 24px */
  --text-3xl:   1.875rem;  /* 30px */
  --text-4xl:   2.25rem;   /* 36px */

  /* ---- Line height scale ---- */
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  /* ---- Font weight variants ---- */
  --weight-regular:   400;
  --weight-medium:    500;
  --weight-semibold:  600;
  --weight-bold:      700;
}
```

| Token | Value | Usage |
|---|---|---|
| `--font-body` | Inter / Segoe UI / system-ui | All body copy, labels, nav, form fields |
| `--font-heading` | Cinzel / Times New Roman | Page titles, section headings, brand moments |
| `--font-accent` | Uncial Antiqua | Logos and rare decorative headings only — never functional text |
| `--text-base` | `1rem` / 16px | Default body size |
| `--leading-normal` | `1.5` | Default line height for body copy |
| `--weight-regular` | `400` | Body text |
| `--weight-semibold` | `600` | Subheadings, labels, nav items |
| `--weight-bold` | `700` | Headings, CTAs |

### 3.4 Spacing Tokens

Base unit: **4px**. Scale follows Tailwind's default 4px grid.

```css
:root {
  --space-1:   0.25rem;   /* 4px  */
  --space-2:   0.5rem;    /* 8px  */
  --space-3:   0.75rem;   /* 12px */
  --space-4:   1rem;      /* 16px */
  --space-5:   1.25rem;   /* 20px */
  --space-6:   1.5rem;    /* 24px */
  --space-8:   2rem;      /* 32px */
  --space-10:  2.5rem;    /* 40px */
  --space-12:  3rem;      /* 48px */
  --space-16:  4rem;      /* 64px */
  --space-20:  5rem;      /* 80px */
  --space-24:  6rem;      /* 96px */
}
```

> **Implementation note:** In practice, Tailwind utility classes (`p-4`, `mt-6`, etc.) are used directly. The CSS custom properties above are the canonical reference. Do not override Tailwind's spacing scale in `tailwind.config.ts` — use these tokens to document intent only.

### 3.5 Border Radius Tokens

```css
:root {
  --radius-default:  0.375rem;   /* 6px  — inputs, buttons */
  --radius-md:       0.5rem;     /* 8px  — cards, panels */
  --radius-lg:       0.75rem;    /* 12px — modals, drawers */
  --radius-pill:     9999px;     /* fully rounded — tags, badges */
}
```

shadcn/ui reads `--radius` as its single base radius variable. Set `--radius: 0.5rem` in the theme to align with `--radius-md` as the default.

| Token | Value | Usage |
|---|---|---|
| `--radius-default` | `0.375rem` | Inputs, buttons |
| `--radius-md` | `0.5rem` | Cards, panels (shadcn/ui `--radius` base) |
| `--radius-lg` | `0.75rem` | Modals, drawers |
| `--radius-pill` | `9999px` | Tags, badges, fully rounded elements |

### 3.6 Shadow Tokens

```css
:root {
  --shadow-card:
    0 1px 3px rgb(0 0 0 / 0.4),
    0 1px 2px rgb(0 0 0 / 0.24);

  --shadow-dropdown:
    0 4px 6px rgb(0 0 0 / 0.4),
    0 2px 4px rgb(0 0 0 / 0.3);

  --shadow-modal:
    0 20px 25px rgb(0 0 0 / 0.5),
    0 10px 10px rgb(0 0 0 / 0.3);

  /* Glow variant for interactive accent elements */
  --shadow-glow-accent:
    0 0 12px rgb(212 175 55 / 0.4);  /* Spell Gold glow */

  --shadow-glow-primary:
    0 0 12px rgb(91 42 134 / 0.5);   /* Arcane Violet glow */
}
```

| Token | Usage |
|---|---|
| `--shadow-card` | Elevated cards and panels |
| `--shadow-dropdown` | Dropdown menus, popovers |
| `--shadow-modal` | Modal overlays, dialogs |
| `--shadow-glow-accent` | Spell Gold glow on highlighted/active elements |
| `--shadow-glow-primary` | Arcane Violet glow on focus or brand moments |

### 3.7 Breakpoint Tokens

These are Tailwind breakpoint thresholds. They are not CSS custom properties — they are configured in `tailwind.config.ts`.

| Token | Breakpoint | Min Width |
|---|---|---|
| `mobile` | Default (no prefix) | 0px |
| `sm` | Tablet portrait | 640px |
| `md` | Tablet landscape | 768px |
| `lg` | Desktop | 1024px |
| `xl` | Wide desktop | 1280px |
| `2xl` | Ultra-wide | 1536px |

Tailwind's default breakpoints are used unchanged. Do not override in `tailwind.config.ts` unless a ticket explicitly requires it.

---

## Section 4 — Frontend Conventions

These conventions apply to all frontend phases (8–12). Any deviation requires an explicit ticket and a note in the relevant phase plan.

### 4.1 File Naming

| Item type | Convention | Example |
|---|---|---|
| React components | PascalCase | `BookingCard.tsx`, `ProviderLayout.tsx` |
| Hooks | camelCase, prefixed `use` | `useBookings.ts`, `useAuth.ts` |
| Utility functions | camelCase | `formatDate.ts`, `buildQueryString.ts` |
| API modules | camelCase | `bookings.api.ts`, `auth.api.ts` |
| Context files | PascalCase, suffixed `Context` | `AuthContext.tsx`, `CustomerContext.tsx` |
| Route files | camelCase or PascalCase matching the route segment | `index.tsx`, `BookingDetail.tsx` |
| Style files | kebab-case | `globals.css`, `booking-card.module.css` |

### 4.2 Component Co-location

```
src/
  components/          # Shared components — used by two or more pages or layouts
  pages/
    BookingDetail/
      BookingDetail.tsx        # Page component
      BookingStatusBadge.tsx   # Page-specific component — lives here, not in components/
      useBookingDetail.ts      # Page-specific hook — lives here
  layouts/
    CustomerLayout.tsx
    ProviderLayout.tsx
    AdminLayout.tsx
```

**Rule:** A component used by only one page lives under `pages/<PageName>/`. A component used by two or more pages (or a layout) moves to `components/`. Do not pre-emptively move components to `components/` in anticipation of reuse.

### 4.3 API Layer Pattern

All backend calls are isolated in `src/api/`. Components and hooks **must not** import `axios` directly or call `fetch` directly.

```
src/
  api/
    client.ts          # Axios instance — interceptors, base URL, auth token injection
    bookings.api.ts    # All /bookings endpoints
    auth.api.ts        # All /auth endpoints
    dungeons.api.ts    # All /dungeons endpoints
    providers.api.ts   # All /providers endpoints
```

**`client.ts` responsibilities:**
- Creates a single Axios instance with `baseURL` set from `import.meta.env.VITE_API_URL`
- Request interceptor: reads `token` from `AuthContext` (or `localStorage` as fallback) and injects `Authorization: Bearer <token>` header
- Response interceptor: catches 401 responses, clears auth state, and redirects to `/login`

**Enforcement:** ESLint import rules must flag direct `axios` or `fetch` usage outside `src/api/`. This lint rule is a Phase 8 scaffold deliverable.

### 4.4 Auth Context Shape

The `AuthContext` is the single source of truth for authentication state across the application.

```typescript
// src/contexts/AuthContext.tsx

interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

type UserRole = "customer" | "provider" | "admin";

interface AuthContextValue {
  user:    AuthUser | null;
  token:   string | null;
  role:    UserRole | null;
  login:   (email: string, password: string) => Promise<void>;
  logout:  () => void;
}
```

- `AuthContext` is provided at the root of the application (above the router).
- Role-scoped layouts (`CustomerLayout`, `ProviderLayout`, `AdminLayout`) consume `AuthContext` to verify the current role.
- `login` calls `auth.api.ts`, stores the token, and sets `user` and `role` on success.
- `logout` clears `user`, `token`, and `role`, removes the token from storage, and redirects to `/login`.

### 4.5 Hook Pattern

Data-fetching logic is isolated in `src/hooks/` (or co-located under the relevant page — see Section 4.2).

**Rules:**
- Hooks own `loading`, `error`, and `data` state. Components receive these via the hook's return value.
- Hooks call API functions from `src/api/` — never `axios` or `fetch` directly.
- Hooks do not render JSX.
- Hooks do not navigate (no `useNavigate` calls inside data-fetching hooks). Navigation side effects belong in the component.

```typescript
// Example shape
function useBookings(filters: BookingFilters) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => { /* fetch via bookings.api.ts */ }, [filters]);

  return { bookings, loading, error };
}
```

### 4.6 Route Protection Pattern

Routes are protected at the layout level. The three role-scoped layouts act as guards.

```
/                   → public (marketing or redirect)
/login              → public
/customer/*         → CustomerLayout (requires role === "customer")
/provider/*         → ProviderLayout (requires role === "provider")
/admin/*            → AdminLayout   (requires role === "admin")
```

**Guard behaviour:**
- If `token` is `null` (unauthenticated): redirect to the relevant login page (`/login`).
- If `token` exists but `role` does not match the layout: redirect to the correct role's root (`/customer`, `/provider`, or `/admin`) or show a 403 page.
- Redirects are implemented inside the layout component using `<Navigate>` from React Router — not inside individual page components.

```typescript
// Example guard inside CustomerLayout.tsx
const { token, role } = useAuth();
if (!token)             return <Navigate to="/login" replace />;
if (role !== "customer") return <Navigate to={`/${role}`} replace />;
```

### 4.7 TypeScript Strictness Policy

- `tsconfig.json` must include `"strict": true`. This enables `strictNullChecks`, `noImplicitAny`, and all other strict checks.
- Usage of `any` is prohibited without an explicit disable comment that explains why `any` is necessary:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawPayload = response.data as any; // third-party SDK returns untyped shape
```

- `unknown` is preferred over `any` for error catch blocks and untyped external data.
- Type assertions (`as SomeType`) must be used only when the shape is genuinely known at that point in the code. Do not use type assertions to silence compiler errors.

### 4.8 Error Display Convention

| Layout / Context | Error handling approach |
|---|---|
| Full-page routes (e.g., `/customer/bookings`) | React Error Boundary at the layout level catches unhandled errors and renders a full-page error UI |
| Data-fetching within a page section | Inline error state returned from the hook, rendered inline in the component (e.g., an alert banner below the section heading) |
| Forms | Field-level validation errors from React Hook Form + Zod, displayed inline below each field |
| Global / network errors (401, 503) | Interceptor in `client.ts` handles these centrally — redirect or toast notification as appropriate |

**Rule:** Do not use Error Boundaries inside individual form components or small UI widgets — reserve them for layout-level and page-level boundaries. Inline error states (loading/error from hooks) are the correct pattern for component-level failures.

---

## Section 5 — Phase 8 Checklist

_To be added — Ticket #59_
