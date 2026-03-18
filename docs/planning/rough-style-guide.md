# QuestReserve — Style Guide

**Version:** 0.1
**Status:** Initial Foundation
**Last Updated:** 2026-03-17

---

## 1. Design Principles

### 1.1 Function First

All UI decisions must prioritize clarity, accessibility, and speed of interaction over visual flair.

### 1.2 Subtle Fantasy

Magical elements should enhance the interface—not distract. Avoid excessive ornamentation.

### 1.3 Consistency Over Novelty

Patterns should be predictable across the application (especially for scheduling and booking flows).

---

## 2. Color Usage

### 2.1 Background Layers

* **Base Background:** `#0B0F1A` (Obsidian)
* **Surface / Cards:** `#121826`
* **Elevated Surface (hover/modals):** Slightly lighter than surface (`#161D2E` recommended)

### 2.2 Text

* **Primary Text:** `#FFFFFF`
* **Secondary Text:** `#A7B3C2`
* **Disabled Text:** `#6B7280`

### 2.3 Brand & Interaction

* **Primary Action:** `#5B2A86` (Arcane Violet)
* **Primary Hover:** `#6D33A3`
* **Accent Highlight:** `#D4AF37` (Spell Gold)

### 2.4 States

* **Success:** `#3BA55D`
* **Error:** `#D64545`
* **Warning:** `#A23E48`
* **Info:** `#2E6F95`

---

## 3. Typography Scale

### Font Families

* **Body:** Inter
* **Headings:** Cinzel

### Type Scale

| Role       | Size | Weight | Usage           |
| ---------- | ---- | ------ | --------------- |
| H1         | 32px | 600    | Page titles     |
| H2         | 24px | 600    | Section headers |
| H3         | 20px | 500    | Card titles     |
| Body Large | 16px | 400    | Default text    |
| Body Small | 14px | 400    | Secondary info  |
| Caption    | 12px | 400    | Metadata        |

### Rules

* Avoid Cinzel in dense UI blocks
* Maintain 1.5 line height for readability

---

## 4. Spacing System

Use a **4px base unit scale**

| Token | Value |
| ----- | ----- |
| xs    | 4px   |
| sm    | 8px   |
| md    | 16px  |
| lg    | 24px  |
| xl    | 32px  |
| 2xl   | 48px  |

---

## 5. Core Components

---

### 5.1 Buttons

#### Primary Button

* Background: Arcane Violet `#5B2A86`
* Text: White
* Border Radius: 8px
* Padding: `8px 16px`

**States**

* Hover: lighten + subtle glow
* Active: slightly darker
* Disabled: muted grey background

---

#### Secondary Button

* Background: transparent
* Border: 1px solid `#2E6F95`
* Text: `#2E6F95`

---

#### Danger Button

* Background: `#A23E48`
* Used for destructive actions

---

### 5.2 Cards (Dungeon Listings)

* Background: `#121826`
* Border Radius: 12px
* Padding: 16px
* Shadow: subtle (low opacity)

**Content Structure**

1. Image (top)
2. Dungeon Name (H3)
3. Location / Region
4. Difficulty Indicator
5. Party Size Range
6. CTA (View / Book)

---

### 5.3 Inputs

#### Text Input

* Background: `#0B0F1A`
* Border: 1px solid `#2E6F95`
* Radius: 8px
* Padding: 8px

**States**

* Focus: violet border + glow
* Error: red border

---

### 5.4 Tags / Badges

Used for:

* Difficulty (Easy / Medium / Deadly)
* Status (Available / Full)

**Style**

* Rounded pill (999px radius)
* Small font (12–14px)

**Examples**

* Easy → Green
* Deadly → Ember Red
* Elite → Gold accent

---

### 5.5 Navigation

#### Top Nav

* Background: `#121826`
* Height: 64px
* Logo left, actions right

#### Sidebar (optional)

* Dark background
* Active item highlighted in violet

---

## 6. Interaction Patterns

### Hover Behavior

* Slight elevation (shadow increase)
* Subtle glow using brand color

### Transitions

* Duration: 150–250ms
* Easing: ease-in-out

### Feedback

* All actions must provide immediate visual confirmation
* Loading states required for booking actions

---

## 7. Iconography

### Style

* Line icons (Feather / Heroicons style)
* Consistent stroke width

### Thematic Additions

* Optional subtle fantasy icons (swords, shields, runes)
* Must remain minimal and readable

---

## 8. Layout Guidelines

### Max Width

* 1200px for main content

### Grid

* 12-column grid system

### Dungeon Listing Grid

* Desktop: 3–4 columns
* Tablet: 2 columns
* Mobile: 1 column

---

## 9. Accessibility

* Minimum contrast ratio: WCAG AA
* Focus states must be visible
* Avoid color-only indicators (use icons + labels)

---

## 10. Future Extensions

* Light mode variant (optional)
* Animation system (magical effects)
* Expanded component library (modals, calendars, etc.)

---
