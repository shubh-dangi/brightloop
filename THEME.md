# Brightloop Dual-Theme Design System & Theme Specification
## Theme: Frost Blue × Midnight Dark (with Icy Blue Light Canvas)
### Visual Inspiration: High-Density Nexora SaaS Aesthetics • Linear Precision

---

## 1. Product Identity & Design Philosophy

**Brightloop** is an enterprise-grade Subscription Management & Recurring Billing platform. Its visual identity balances financial precision, operational density, and modern SaaS aesthetics.

### Key Tenets:
1. **Calibrated Dual Theme**:
   - **Dark Mode (Default)**: Midnight navy foundation (`#101827`, `#131F31`) with elevated card surfaces (`#1B2B42`) and vibrant frost blue highlights (`#75A5FF`). Minimizes eye fatigue during extended operational work while preserving high contrast for metrics, ledger items, and audit logs.
   - **Light Mode**: Low-glare icy-blue canvas (`#F4F8FF`, `#EDF4FF`) with clean white paper surfaces (`#FFFFFF`) and royal blue primary actions (`#356FF6`).
2. **Global Accessibility**: A high-visibility theme switcher is accessible on **every single page** (public landing, authentication, dashboard headers, management tables, settings, and error boundaries).
3. **Zero-Flash Theme Bootstrapping**: Stored in `localStorage('brightloop-theme')` with immediate pre-render anti-FOUC script evaluation in `index.html`.
4. **Information Density with Absolute Clarity**: Compact typography, tabular numbers (`font-variant-numeric: tabular-nums`), crisp structural borders, and structured card surfaces present maximum relevant data without cognitive clutter.
5. **Soft Fluid Motion**: Micro-interactions and transitions are subtle, fast, and purposeful (`100–260ms`), respecting `prefers-reduced-motion`.

---

## 2. Official Dual-Theme Color Palette

### 2.1 Dark Mode — Primary Default Canvas (Mirrored with Light Mode)

| Design Token | CSS Variable | Hex Value | Semantic Role | WCAG Contrast |
| :--- | :--- | :--- | :--- | :--- |
| **Main Background** | `--background` | `#0B111E` | Deep Midnight Navy canvas (inverting Light `#F4F8FF`) | — |
| **Secondary Background** | `--background-secondary` | `#0E1626` | Nested sections, sidebars (inverting `#EDF4FF`) | — |
| **Subtle Background** | `--background-subtle` | `#111B2E` | Ambient fills, recessed panels (inverting `#F8FAFF`) | — |
| **Sidebar Background** | `--sidebar` | `#0E1626` | Left navigation chrome (inverting `#FFFFFF`) | — |
| **Topbar Background** | `--topbar` | `#0E1626` | Fixed header and breadcrumb bar (inverting `#FFFFFF`) | — |
| **Card Surface** | `--card` | `#131F33` | Crisp elevated navy card surface (inverting `#FFFFFF`) | — |
| **Elevated Surface** | `--surface-elevated` | `#18263E` | Modal chrome, popovers, dropdowns | — |
| **Hover Surface** | `--surface-hover` | `#192841` | Interactive table row and card hover (inverting `#F5F8FF`) | — |
| **Active / Selected** | `--surface-active` | `#1D3150` | Selected table row, active nav item (inverting `#EAF1FF`) | — |
| **Primary Text** | `--foreground` | `#F8FAFC` | Crisp pure white headings and metrics (inverting `#111827`) | **16.2:1** (AAA) |
| **Secondary Text** | `--muted-foreground` | `#94A3B8` | Labels, table headers, descriptions (inverting `#526178`) | **8.5:1** (AAA) |
| **Muted Text** | `--muted-text` | `#64748B` | Tertiary captions, timestamps (inverting `#8290A5`) | **5.4:1** (AA) |
| **Disabled Text** | `--disabled` | `#475569` | Inactive controls and unselected options | 3.5:1 |
| **Default Border** | `--border` | `#1C2D44` | Crisp 1px structural dividing lines (inverting `#E1EAF6`) | 3.6:1 |
| **Strong Border** | `--strong-border` | `#2B4263` | Emphasized card boundaries, active inputs (inverting `#CEDCED`) | 5.3:1 |
| **Divider** | `--divider` | `#162438` | Subtle list and section separators (inverting `#EAF0F8`) | — |

#### Royal Blue Dark Accents (Direct Mirror of Light Mode Royal Blue)
| Token | CSS Variable | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `--primary` | `#3B82F6` | Primary button, active link, badge (mirrors `#356FF6`) |
| **Primary Hover** | `--primary-hover` | `#2563EB` | Button and interactive hover state |
| **Primary Active** | `--primary-active` | `#1D4ED8` | Pressed / clicked interactive state |
| **Accent Soft** | `--primary-soft` | `#172B4D` | Royal blue badge & pill background (mirrors `#E8F0FF`) |
| **Accent Subtle** | `--primary-subtle`| `#101E36` | Subtle table row highlight |
| **Accent Foreground** | `--primary-foreground` | `#FFFFFF` | Crisp white text on button (mirrors Light Mode `#FFFFFF`!) |
| **Focus Ring** | `--ring` | `#3B82F6` | Keyboard focus ring |

---

### 2.2 Light Mode — Secondary Calibrated Canvas

| Design Token | CSS Variable | Hex Value | Semantic Role | WCAG Contrast |
| :--- | :--- | :--- | :--- | :--- |
| **Main Background** | `--background` | `#F4F8FF` | Icy Blue clean canvas | — |
| **Secondary Background** | `--background-secondary` | `#EDF4FF` | Filter panels, inner containers | — |
| **Subtle Background** | `--background-subtle` | `#F8FAFF` | Soft highlighted cards | — |
| **Sidebar Background** | `--sidebar` | `#FFFFFF` | Crisp white navigational surface | — |
| **Topbar Background** | `--topbar` | `#FFFFFF` | Clean white fixed header | — |
| **Card Surface** | `--card` | `#FFFFFF` | Clean paper card surfaces | — |
| **Elevated Surface** | `--surface-elevated` | `#FFFFFF` | Modals, dropdown popovers | — |
| **Hover Surface** | `--surface-hover` | `#F5F8FF` | Hover state for lists and cards | — |
| **Active / Selected** | `--surface-active` | `#EAF1FF` | Active selection pill, row highlight | — |
| **Primary Text** | `--foreground` | `#111827` | High-contrast dark navy typography | **16.1:1** (AAA) |
| **Secondary Text** | `--muted-foreground` | `#526178` | Medium contrast metadata, subheaders | **6.4:1** (AA) |
| **Muted Text** | `--muted-text` | `#8290A5` | Low contrast timestamps, helpers | **4.6:1** (AA) |
| **Disabled Text** | `--disabled` | `#AAB5C4` | Disabled form controls | 3.0:1 |
| **Default Border** | `--border` | `#E1EAF6` | Subtle blue-grey structural dividing lines | 3.2:1 |
| **Strong Border** | `--strong-border` | `#CEDCED` | High-emphasis container borders | 4.8:1 |
| **Divider** | `--divider` | `#EAF0F8` | List dividers | — |

#### Royal Blue Light Accents
| Token | CSS Variable | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `--primary` | `#356FF6` | Royal blue high-contrast CTA |
| **Primary Hover** | `--primary-hover` | `#285DE0` | Button hover state |
| **Primary Active** | `--primary-active` | `#204FC7` | Pressed button state |
| **Accent Soft** | `--primary-soft` | `#E8F0FF` | Active nav pill background |
| **Accent Subtle** | `--primary-subtle`| `#F0F6FF` | Soft hover tint |
| **Accent Foreground** | `--primary-foreground` | `#FFFFFF` | Crisp white text on primary button |
| **Focus Ring** | `--ring` | `#356FF6` | Keyboard focus ring |

---

### 2.3 Semantic Status System

Semantic colors provide unambiguous lifecycle and operational indicators across both themes:

| Semantic State | Dark Theme Value | Dark Soft Background | Light Theme Value | Light Soft Background | Usage in Brightloop |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Success** | `#10B981` | `#082F22` | `#0F9D72` | `#E8F8F1` | Paid invoices, active subscriptions |
| **Warning** | `#F59E0B` | `#362407` | `#B7791F` | `#FFF5DF` | Quotation draft, renewal pending |
| **Danger / Destructive** | `#F43F5E` | `#38121B` | `#DC4C55` | `#FFF0F1` | Overdue invoice, cancelled contract |
| **Information** | `#38BDF8` | `#0C2B45` | `#2879D8` | `#EAF3FF` | Webhook events, system logs |
| **Neutral** | `#94A3B8` | `#1E293B` | `#6B7280` | `#F3F4F6` | Paused subscription, archived records |

---

## 3. Global Theme Switcher Specification

### Placement & Availability
The unified `<ThemeSwitcher />` is globally available across all application views:
1. **Public Marketing**: Fixed top navigation bar on desktop & inside mobile drawer (`Navbar.tsx`).
2. **Authentication Flow**: Top-right corner on `/login`, `/signup`, `/forgot-password`, `/reset-password` (`AuthLayout.tsx`).
3. **Application Shell**: Top header bar on all authenticated routes (`Header.tsx`).
4. **Settings & Preferences**: Dedicated interactive theme card with instant preview (`PreferencesPage.tsx`).
5. **System & Error Pages**: Top-right corner on `/404`, `/500`, `/403`, `/503`, and `/offline` pages.

### Modes Supported
1. **Light Mode**: Forces icy-blue canvas and royal blue accents.
2. **Dark Mode (Default)**: Forces midnight navy canvas and frost blue accents.
3. **System Mode**: Dynamically synchronizes with the user's OS preference (`prefers-color-scheme: dark`) with real-time listener.

---

## 4. Typography & Radius Standards

### Typography
- **Primary Font**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Tabular Mono**: `JetBrains Mono, "SFMono-Regular", Consolas, monospace`
- **Financial Rule**: All currency (`₹`), metrics, invoice numbers, timestamps, and rates use `tabular-nums` for strict column alignment.

### Radius Scale
- **Small Controls / Tags**: `6px` (`--radius-sm`, `rounded-sm`)
- **Inputs & Buttons**: `8px` (`--radius-md`, `rounded-md`)
- **Cards & Data Tables**: `10px` (`--radius-lg`, `rounded-lg`)
- **Dialogs & Larger Modals**: `12px` (`--radius-xl`, `rounded-xl`)

---

## 5. Motion & Animation System

- **Fast**: `100–140ms` (hover feedback, checkboxes, micro-interactions)
- **Normal**: `180–240ms` (tab switches, dropdown menus, dialogs)
- **Page Transitions**: `260ms` with soft 8px vertical offset.
- **Accessibility**: When `prefers-reduced-motion` is active, all transforms are disabled and page transitions use direct opacity switches.
