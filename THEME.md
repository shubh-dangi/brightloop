# Brightloop Design System & Theme Specification
## Theme: Frost Blue × Midnight Dark
### Motion System: Soft Fluid • Modern • Minimal • Lightweight

---

## 1. Product Identity & Design Philosophy

**Brightloop** is an enterprise-grade Subscription Management & Recurring Billing platform. Its visual identity balances financial precision, operational density, and modern SaaS aesthetics.

### Key Tenets:
1. **Midnight Dark Foundation**: Dark mode is the primary, calibrated default canvas (`#0B1220`). It minimizes eye fatigue during extended operational work while preserving high contrast for metrics, ledger items, and audit logs.
2. **Frost Blue High-Precision Accent**: The signature accent (`#A5D8FF` in dark mode, `#398CCB` in light mode) is reserved for primary actions, active navigation indicators, key focus rings, and high-priority interactive states.
3. **Information Density with Absolute Clarity**: Compact typography, tabular numbers (`font-variant-numeric: tabular-nums`), crisp structural borders, and structured card surfaces present maximum relevant data without cognitive clutter.
4. **Soft Fluid Motion**: Micro-interactions and transitions are subtle, fast, and purposeful (`200–280ms`), respecting `prefers-reduced-motion` and optimizing for performance.

---

## 2. Official Color Palette

### 2.1 Dark Theme — Primary Default Canvas

| Design Token | CSS Variable | Hex Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| **Main Background** | `--background` | `#0B1220` | Primary application canvas |
| **Sidebar Background** | `--sidebar` | `#111C2D` | Navigation surface and left chrome |
| **Topbar Background** | `--topbar` | `#0F1929` | Fixed header and breadcrumb bar |
| **Card Surface** | `--card` | `#17263A` | Primary container, tables, stat cards |
| **Elevated Surface** | `--surface-elevated` | `#22344A` | Secondary panels, modal chrome, badges |
| **Hover Surface** | `--surface-hover` | `#263B52` | Interactive table row and card hover |
| **Active Surface** | `--surface-active` | `#1D3A55` | Selected items, active filters |
| **Primary Text** | `--foreground` | `#EAF4FF` | High-contrast headings and primary metrics |
| **Secondary Text** | `--muted-foreground` | `#A7B9CC` | Labels, table headers, descriptions |
| **Muted Text** | `--muted-text` | `#778BA3` | Tertiary captions, subtle metadata |
| **Disabled Text** | `--disabled` | `#52657B` | Inactive controls and unselected options |
| **Default Border** | `--border` | `#2A3C52` | Crisp 1px structural dividing lines |
| **Strong Border** | `--strong-border` | `#3A506A` | Emphasized card boundaries, active inputs |
| **Divider** | `--divider` | `#26384D` | Subtle list and section separators |

#### Frost Blue Dark Accents

| Token | CSS Variable | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `--primary` | `#A5D8FF` | Primary button, active link, badge |
| **Primary Hover** | `--primary-hover` | `#75BFFF` | Button and interactive hover state |
| **Primary Active** | `--primary-active` | `#60A5E8` | Pressed / clicked interactive state |
| **Accent Soft** | `--primary-soft` | `#1D3A55` | Pill backgrounds, active navigation |
| **Accent Subtle** | `--primary-subtle`| `#152D45` | Subtle table row highlight |
| **Accent Foreground** | `--primary-foreground` | `#0B1220` | High-contrast text on Frost Blue |
| **Focus Ring** | `--ring` | `#75BFFF` | Keyboard focus ring |

---

### 2.2 Light Theme — Secondary Mode

| Design Token | CSS Variable | Hex Value | Semantic Role |
| :--- | :--- | :--- | :--- |
| **Main Background** | `--background` | `#F5F9FD` | Low-glare cool canvas |
| **Sidebar Background** | `--sidebar` | `#FFFFFF` | Crisp white navigational surface |
| **Topbar Background** | `--topbar` | `#FFFFFF` | Clean white header |
| **Card Surface** | `--card` | `#FFFFFF` | Clean paper card surfaces |
| **Elevated Surface** | `--surface-elevated` | `#EAF2F9` | Secondary panels, badges |
| **Hover Surface** | `--surface-hover` | `#F0F6FC` | Hover state for lists and cards |
| **Active Surface** | `--surface-active` | `#E1F0FC` | Active selection pill |
| **Primary Text** | `--foreground` | `#172536` | High-contrast dark blue text |
| **Secondary Text** | `--muted-foreground` | `#526579` | Medium contrast metadata |
| **Muted Text** | `--muted-text` | `#718096` | Low contrast timestamps, helpers |
| **Disabled Text** | `--disabled` | `#A0AEC0` | Disabled form controls |
| **Default Border** | `--border` | `#DCE7F0` | Clean structural dividing lines |
| **Strong Border** | `--strong-border` | `#C6D7E6` | High-emphasis container borders |
| **Divider** | `--divider` | `#E5EDF5` | List dividers |

#### Frost Blue Light Accents

| Token | CSS Variable | Hex Value | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `--primary` | `#398CCB` | High-contrast Frost Blue for light theme |
| **Primary Hover** | `--primary-hover` | `#2879B7` | Button hover state |
| **Primary Active** | `--primary-active` | `#21699F` | Pressed button state |
| **Accent Soft** | `--primary-soft` | `#E4F2FC` | Active nav pill background |
| **Accent Subtle** | `--primary-subtle`| `#F0F7FD` | Hover tint |
| **Accent Foreground** | `--primary-foreground` | `#FFFFFF` | Text on active button |
| **Focus Ring** | `--ring` | `#398CCB` | Focus ring |

---

### 2.3 Semantic Status System

Semantic colors provide unambiguous lifecycle and operational indicators in both themes:

| Semantic State | Dark Theme Value | Dark Soft Background | Light Theme Value | Light Soft Background | Usage in Brightloop |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Success** | `#34D399` | `#123B34` | `#059669` | `#DDF8EE` | Paid invoices, active subscriptions |
| **Warning** | `#FBBF24` | `#453719` | `#B7791F` | `#FFF3CD` | Quotation draft, renewal pending |
| **Danger / Destructive** | `#FB7185` | `#451F2A` | `#E5484D` | `#FDE8E8` | Overdue invoice, cancelled contract |
| **Information** | `#60A5FA` | `#172F50` | `#2563EB` | `#E5F0FF` | Webhook events, system logs |
| **Neutral** | `#A7B9CC` | `#26384D` | `#64748B` | `#EDF2F7` | Paused subscription, archived records |

---

## 3. Data Visualization & Chart Palette

Charts use restrained, coordinated series colors calibrated for dark surfaces:

- **Primary Series (MRR / Revenue)**: `#A5D8FF` (Frost Blue) with vertical gradient fading to transparent.
- **Secondary Series (Growth / Active)**: `#60A5FA` (Soft Blue)
- **Tertiary Series (Realized Cash)**: `#34D399` (Emerald)
- **Warning Series (Pending Renewals)**: `#FBBF24` (Amber)
- **Danger Series (Overdue Balances)**: `#FB7185` (Coral Red)
- **Neutral Series (Inactive)**: `#8297AD`
- **Cartesian Grid Lines**: `#2A3C52` (Dark) / `#DCE7F0` (Light)
- **Axis Typography**: `#778BA3` (Dark) / `#718096` (Light), `fontSize: 11`

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

Brightloop adheres to a **Soft Fluid • Modern • Minimal** motion language. Motion is purposeful, lightweight, and hardware-accelerated (`transform` and `opacity` only).

### 5.1 Motion Timing Tokens
- **Instant**: `100ms` (checkboxes, micro toggles)
- **Fast**: `140ms` (hover feedback, tooltips)
- **Normal**: `180ms` (tab switches, dropdown menus)
- **Smooth**: `240ms` (modal entrances, dialog popups)
- **Page Transition**: `260ms` (route entrances)

### 5.2 Motion Easings
- **Standard**: `cubic-bezier(0.2, 0, 0, 1)`
- **Enter**: `cubic-bezier(0, 0, 0.2, 1)`
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)`

### 5.3 Page Navigation Transitions
Pages open smoothly with a soft fade and small 8px vertical offset:
```typescript
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } },
};
```

### 5.4 Accessibility (Reduced Motion)
When `prefers-reduced-motion: reduce` is detected:
- All transforms are disabled.
- Page entrances perform an instantaneous or simple opacity change.
- No content is delayed or animated without user preference.

---

## 6. Verification Checklist

- [x] All legacy purple/indigo accents replaced with official Frost Blue (`#A5D8FF` / `#398CCB`).
- [x] Hardcoded hex values purged in favor of semantic Tailwind theme tokens.
- [x] Seamless Dark (default) and Light theme switching via `useThemeStore`.
- [x] Accessible contrast meeting WCAG 2.2 AA (4.5:1 text, 3:1 UI elements).
- [x] Fluid page motion and active tab transitions using `motion/react`.
- [x] Currency globally normalized to the Indian Rupee symbol (`₹`).
- [x] Production build and test suite 100% passing.
