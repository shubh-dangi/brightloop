# Design System and UI Theme — Brightloop (Linear-Inspired)

## 1. Design Philosophy & Direction

Brightloop adheres to a minimalist, high-precision SaaS aesthetic directly inspired by **Linear's design philosophy**, combined with enterprise financial accuracy and modern React 19 architecture:

1. **Information Density with Absolute Clarity**: Financial and subscription operators require high visibility across accounts, plans, MRR, invoices, and ledger events. Brightloop uses compact padding, tight typography, tabular numbers, and crisp 1px borders to present maximum relevant data without cognitive clutter.
2. **Linear Visual Discipline**:
   - Primary default theme is **Dark Theme**, calibrated with deep warm charcoal surfaces (`#111113`, `#171719`, `#1C1C1F`).
   - Light theme is equally refined with clean, low-glare neutral surfaces (`#F7F7F8`, `#FFFFFF`, `#F0F0F2`).
   - Signature Linear accent: Modern Indigo/Purple (`#8B7CF6` dark / `#6D5CE7` light) with subdued background highlights.
3. **Dual-Channel Deterministic Feedback**: Status indicators (Active, Inactive, Draft, Past Due, Paid) combine subtle pill badges, monochromatic icons, and tabular metadata to eliminate ambiguity.
4. **Typographic Restraint**: Clean neo-grotesque hierarchy (Inter) paired with monospace tabular figures (JetBrains Mono) for financial metrics, timestamps, IDs, and code tokens.

---

## 2. Official Color Palette System

The application strictly implements the following calibrated tokens across both Dark (Default) and Light modes:

### 2.1 Dark Theme — Primary Default

| Element | Token / Variable | Hex Value | Role |
|---|---|---|---|
| **Main Background** | `--background` | `#111113` | Deep warm charcoal base canvas |
| **Sidebar Surface** | `--sidebar` | `#171719` | Navigational surface and chrome panels |
| **Card Surface** | `--card` | `#1C1C1F` | Primary data cards, tables, containers |
| **Elevated Surface** | `--popover` | `#242428` | Dialogs, tooltips, dropdown menus |
| **Primary Text** | `--foreground` | `#F5F5F5` | Headings, high-emphasis metrics |
| **Secondary Text** | `--muted-foreground`| `#92929B` | Labels, captions, secondary details |
| **Border** | `--border` | `#303036` | Crisp 1px structural dividing lines |
| **Primary Accent** | `--primary` | `#8B7CF6` | Linear signature active accent |
| **Accent Hover** | `--primary-hover` | `#7969E8` | Interactive button and link hover |
| **Accent Soft** | `--primary-soft` | `#29243D` | Active sidebar pills, selected badges |

### 2.2 Light Theme

| Element | Token / Variable | Hex Value | Role |
|---|---|---|---|
| **Main Background** | `--background` | `#F7F7F8` | Low-glare off-white canvas |
| **Sidebar Surface** | `--sidebar` | `#FFFFFF` | Navigational container |
| **Card Surface** | `--card` | `#FFFFFF` | Clean paper card surfaces |
| **Elevated Surface** | `--popover` | `#F0F0F2` | Elevated dropdown and modal menus |
| **Primary Text** | `--foreground` | `#222226` | High-contrast charcoal text |
| **Secondary Text** | `--muted-foreground`| `#777780` | Muted neutral typography |
| **Border** | `--border` | `#E6E6E9` | Crisp neutral dividing lines |
| **Primary Accent** | `--primary` | `#6D5CE7` | High-contrast indigo primary |
| **Accent Hover** | `--primary-hover` | `#5C4BD0` | Button hover state |
| **Accent Soft** | `--primary-soft` | `#EFEDFC` | Active navigation pill background |

### 2.3 Semantic Status Palette

Semantic colors use muted, desaturated tones matching Linear's non-distracting palette:

| Semantic State | Dark Mode Value | Light Mode Value | Usage in Brightloop |
|---|---|---|---|
| **Success** | `#22C55E` / `rgba(34,197,94,0.15)` | `#16A34A` / `rgba(22,163,74,0.12)` | Active subscription, settled invoice, healthy DB |
| **Warning** | `#F59E0B` / `rgba(245,158,11,0.15)` | `#D97706` / `rgba(217,119,6,0.12)` | Draft record, renewal notice, scheduled maintenance |
| **Destructive** | `#EF4444` / `rgba(239,68,68,0.15)` | `#DC2626` / `rgba(220,38,38,0.12)` | Critical priority, past-due invoice, delete actions |
| **Info / Tech** | `#8B7CF6` / `rgba(139,124,246,0.15)` | `#6D5CE7` / `rgba(109,92,231,0.12)` | Infrastructure specs, system roles, webhook events |
| **Neutral** | `#71717A` / `rgba(113,113,122,0.15)` | `#64748B` / `rgba(100,116,139,0.12)` | Archived entities, viewer scopes, inactive flags |

---

## 3. Typography Architecture

- **Primary Font Family**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace Font Family**: `JetBrains Mono, "SFMono-Regular", Consolas, Menlo, monospace`
- **Tabular Numerals**: Numerical values (metrics, currency, quantities, dates, IDs) use `.font-mono, [data-tabular-num]` with `font-feature-settings: "tnum" on, "zero" on`.

### Typographic Scale

| Role | Font Size | Line Height | Tracking | Weight |
|---|---|---|---|---|
| **Page Header Title** | `1.25rem` (20px) | `1.5rem` (24px) | `-0.025em` | `600` (SemiBold) |
| **Section / Card Title** | `0.875rem` (14px) | `1.25rem` (20px) | `-0.015em` | `600` (SemiBold) |
| **Body Primary** | `0.8125rem` (13px) | `1.25rem` (20px) | `0` | `400` / `500` |
| **Compact / Table Body** | `0.75rem` (12px) | `1.125rem` (18px) | `0` | `400` / `500` |
| **Ledger / Table Header**| `0.625rem` (10px) | `1rem` (16px) | `0.05em` | `500` (Mono, Uppercase) |
| **Badges & Micro-tags** | `0.6875rem` (11px) | `1rem` (16px) | `0` | `500` (Mono) |

---

## 4. Layout & Spacing Scale

Brightloop replaces bulky admin margins with Linear's compact hierarchy:

- **Sidebar Width**: `w-60` (240px) desktop sidebar with `#171719` background.
- **Header Height**: `h-14` (56px) compact header with breadcrumbs, command palette pill (`⌘K`), and profile trigger.
- **Card Radius**: Subtle `rounded-lg` (8px radius) with crisp 1px borders (`border-border/80`).
- **Interactive Heights**:
  - Buttons (`size="sm"`): `h-8 px-3 text-xs`
  - Inputs & Selects: `h-8.5 px-3 text-xs`
  - Table Rows: `py-2.5 px-3.5` compact density
- **Scrollbars**: Linear-style ultra-thin scrollbars (`scrollbar-width: thin` with muted track and `#303036` thumb).

---

## 5. Component Standards

### 5.1 Buttons (`Button`)
- Minimalist 1px borders, subtle hover transitions.
- Standard button: `h-8 px-3 text-xs font-medium rounded-md`.
- Ghost buttons on table rows and action menus: `h-7 w-7 text-xs`.

### 5.2 Cards (`Card`)
- Flat surfaces (`#1C1C1F` dark, `#FFFFFF` light) without excessive elevation shadows.
- Subtle border hover highlight: `hover:border-primary/40 transition-colors`.

### 5.3 Badges (`Badge`)
- Monospace font (`JetBrains Mono`), uppercase tracking: `text-[10px] font-mono px-2 py-0.5 rounded border`.
- Subtle tinted backgrounds matching status severity.

### 5.4 Data Tables & Ledgers
- Precision monospace headers with uppercase tracking: `text-[10px] uppercase font-mono tracking-wider text-muted-foreground/80`.
- Hover row state: `hover:bg-muted/30 dark:hover:bg-[#242428]/40`.
- Integrated footer with tabular page counters and compact navigation icons.

### 5.5 Charts & Analytics
- Area charts utilize Linear primary gradient (`#8B7CF6` to transparent) with subtle `3 3` dashed grid lines.
- Tooltips render on elevated `#1C1C1F` surfaces with 1px `#303036` borders and tabular monospace numbers.

---

## 6. Verification and Compliance

- **Framework**: React 19 + Vite + TypeScript + Tailwind CSS v4.
- **Contrast**: WCAG 2.2 AA compliant across all primary and secondary text nodes.
- **Anti-FOUC**: Inline script on `<head>` detects theme preference immediately prior to rendering, preventing flash of white.
- **Testing**: Zero type errors (`pnpm typecheck`), all unit tests passing (`pnpm test`), and production build optimized (`pnpm build`).
