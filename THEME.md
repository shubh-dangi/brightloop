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

### 2.1 Dark Mode — Primary Default Canvas

| Design Token | CSS Variable | Hex Value | Semantic Role | WCAG Contrast |
| :--- | :--- | :--- | :--- | :--- |
| **Main Background** | `--background` | `#101827` | Midnight Navy primary application canvas | — |
| **Secondary Background** | `--background-secondary` | `#131F31` | Nested sections, sidebars | — |
| **Subtle Background** | `--background-subtle` | `#16243A` | Ambient fills, recessed panels | — |
| **Sidebar Background** | `--sidebar` | `#131F31` | Left navigation chrome | — |
| **Topbar Background** | `--topbar` | `#152238` | Fixed header and breadcrumb bar | — |
| **Card Surface** | `--card` | `#1B2B42` | Primary container, tables, stat cards | — |
| **Elevated Surface** | `--surface-elevated` | `#243852` | Modal chrome, popovers, dropdowns | — |
| **Hover Surface** | `--surface-hover` | `#293F5B` | Interactive table row and card hover | — |
| **Active / Selected** | `--surface-active` | `#263F66` | Selected table row, active nav item | — |
| **Primary Text** | `--foreground` | `#F1F6FF` | High-contrast headings and primary metrics | **14.8:1** (AAA) |
| **Secondary Text** | `--muted-foreground` | `#B4C4D8` | Labels, table headers, descriptions | **8.2:1** (AAA) |
| **Muted Text** | `--muted-text` | `#8396AF` | Tertiary captions, timestamps | **5.1:1** (AA) |
| **Disabled Text** | `--disabled` | `#61748C` | Inactive controls and unselected options | **3.2:1** |
| **Default Border** | `--border` | `#2D415B` | Crisp 1px structural dividing lines | 3.5:1 |
| **Strong Border** | `--strong-border` | `#405A78` | Emphasized card boundaries, active inputs | 5.2:1 |
| **Divider** | `--divider` | `#263A53` | Subtle list and section separators | — |

#### Frost Blue Dark Accents
| Token | CSS Variable | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `--primary` | `#75A5FF` | Primary button, active link, badge |
| **Primary Hover** | `--primary-hover` | `#91B7FF` | Button and interactive hover state |
| **Primary Active** | `--primary-active` | `#A9C7FF` | Pressed / clicked interactive state |
| **Accent Soft** | `--primary-soft` | `#263F66` | Pill backgrounds, active navigation |
| **Accent Subtle** | `--primary-subtle`| `#1B2E4A` | Subtle table row highlight |
| **Accent Foreground** | `--primary-foreground` | `#101827` | High-contrast text on Frost Blue |
| **Focus Ring** | `--ring` | `#75A5FF` | Keyboard focus ring |

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
| **Success** | `#34D399` | `#123B32` | `#0F9D72` | `#E8F8F1` | Paid invoices, active subscriptions |
| **Warning** | `#FBBF24` | `#44351A` | `#B7791F` | `#FFF5DF` | Quotation draft, renewal pending |
| **Danger / Destructive** | `#FB7185` | `#472630` | `#DC4C55` | `#FFF0F1` | Overdue invoice, cancelled contract |
| **Information** | `#60A5FA` | `#1C3555` | `#2879D8` | `#EAF3FF` | Webhook events, system logs |
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
