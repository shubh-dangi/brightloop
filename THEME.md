# Design System and UI Theme — Subpulse

## 1. Design Philosophy

The Subpulse design system is built upon four fundamental principles tailored for enterprise financial software:

1. **Information Density with Absolute Clarity**: Financial operators, revenue managers, and executive leadership require high visibility across complex records (subscriptions, invoices, prorations, tax rates). The interface delivers high data density without feeling congested through meticulous typographic scale, clean horizontal alignment, and whitespace calibration.
2. **Deterministic Feedback & Precision**: In billing and revenue management, ambiguous interactions lead to catastrophic financial anxiety. Every system state (saving, draft, confirmed, pending webhook, payment settlement, failed payment) is represented with unambiguous, high-contrast, dual-channel indicators (icon + semantic text).
3. **Calm, High-End Utility**: Taking inspiration from the functional minimalism of *Linear*, the financial authority of *Stripe*, and the typographical restraint of *Vercel*, Subpulse rejects decorative excess, arbitrary neon gradients, and unnecessary animations. The interface recedes into the background, ensuring data is always the hero.
4. **Resilient Dual-Mode Parity**: Light and dark themes are not afterthoughts or automated inversions. Each mode is independently calibrated for luminance balance, text contrast (WCAG 2.2 AA compliance), and optimal chart readability during long operational shifts.

---

## 2. Visual Direction

- **Aesthetic**: Modern, minimal, architectural, typography-driven enterprise SaaS.
- **Surfaces**: Distinct tiered elevation surfaces utilizing crisp 1px borders (`hsl(var(--border))`) and subtle ambient shadows rather than harsh drop shadows or glassmorphic blur effects.
- **Geometry**: Subtle rounded corners (standard `6px` to `8px` radius) providing a modern feel while preserving the rectangular discipline necessary for high-density tabular ledgers.
- **Color Discipline**: A disciplined monochrome foundation (slate/zinc) accentuated by a signature Electric Indigo / Cobalt brand accent, with strictly reserved semantic colors for financial statuses.
- **Typography**: Precision neo-grotesque sans-serif with monospace tabular numerals for every numeric value (currency, quantities, dates, invoice numbers).

---

## 3. Brand Color Palette

The Subpulse brand palette is grounded in a deep obsidian foundation, neutral structural slates, and a vibrant, authoritative indigo/cobalt primary spectrum.

| Swatch Name | Token | HEX | Light Theme Role | Dark Theme Role | Contrast Ratio vs Background |
|---|---|---|---|---|---|
| **Obsidian** | `--color-slate-950` | `#090A0F` | High-emphasis text / Dark badges | Root background / Base canvas | 16.8:1 (Light) / N/A |
| **Midnight Navy** | `--color-slate-900` | `#0F172A` | Primary headings | Card & dialog surfaces | 14.2:1 (Light) / 1.4:1 (Dark) |
| **Slate Gray** | `--color-slate-600` | `#475569` | Secondary / muted text | Muted borders & icons | 5.8:1 (Light) / 4.6:1 (Dark) |
| **Cool Zinc** | `--color-slate-200` | `#E2E8F0` | Structural borders & dividers | Muted foreground text | 1.3:1 (Light) / 10.5:1 (Dark) |
| **Pure Snow** | `--color-slate-50` | `#F8FAFC` | Root application background | Primary high-emphasis text | N/A (Light) / 17.5:1 (Dark) |
| **Electric Cobalt** | `--color-brand-600` | `#2563EB` | Primary brand action / Links | Interactive focus / Hover highlights | 4.8:1 (Light) / 6.2:1 (Dark) |
| **Royal Indigo** | `--color-brand-700` | `#1D4ED8` | Primary button hover state | Active selection accent | 6.5:1 (Light) / 5.1:1 (Dark) |
| **Vibrant Indigo** | `--color-brand-500` | `#3B82F6` | Focus rings / Accent glows | Primary button fill | 3.5:1 (Light) / 7.8:1 (Dark) |

---

## 4. Semantic Color Tokens

Colors are exposed to the UI via CSS custom properties mapped to semantic responsibilities. Direct hardcoded HEX values are prohibited in component code.

### 4.1 Structural Tokens
- `--background`: Base application viewport canvas.
- `--foreground`: Primary high-contrast body and heading text.
- `--card`: Surface background for cards, tables, and metric containers.
- `--card-foreground`: Text rendered on top of card surfaces.
- `--popover`: Elevated surface for dropdowns, tooltips, dialogs, and command palettes.
- `--popover-foreground`: Text rendered on popover surfaces.
- `--border`: Standard 1px perimeter border for cards, inputs, and dividers.
- `--input`: Border color for interactive form fields.
- `--ring`: High-visibility focus ring for keyboard navigation.

### 4.2 Brand Action Tokens
- `--primary`: Primary call-to-action button fill, active tab indicators, and brand highlights.
- `--primary-foreground`: Text rendered on primary surfaces (always maximum contrast white or slate-950).
- `--secondary`: Subdued action buttons, secondary badges, and active state highlights.
- `--secondary-foreground`: Text rendered on secondary surfaces.
- `--accent`: Subtle hover backgrounds on list items, table rows, and ghost buttons.
- `--accent-foreground`: Text rendered on accented hover surfaces.

### 4.3 Semantic Alert Tokens
- `--success`: Positive financial transactions, active subscriptions, confirmed invoices.
- `--success-foreground`: Text on success solid fills.
- `--warning`: Scheduled renewals, overdue warnings, expiring discounts.
- `--warning-foreground`: Text on warning solid fills.
- `--destructive`: Cancelled contracts, failed payments, destructive deletion dialogs.
- `--destructive-foreground`: Text on destructive solid fills.
- `--info`: System notifications, quotation drafts, informational badges.
- `--info-foreground`: Text on info solid fills.

### 4.4 Business Status Palette

Every business status in Subpulse maps to an exact semantic token, background tint, text shade, and border tone.

#### A. Subscription Lifecycle Statuses
| Status | Token Name | Badge Background | Badge Text | Border Tone | Business Meaning |
|---|---|---|---|---|---|
| **Draft** | `--status-sub-draft` | `rgba(148, 163, 184, 0.12)` | `#475569` (Dark: `#94A3B8`) | `#CBD5E1` | Subscription model is being configured; no billing scheduled. |
| **Quotation** | `--status-sub-quote` | `rgba(59, 130, 246, 0.12)` | `#1D4ED8` (Dark: `#60A5FA`) | `#93C5FD` | Formal commercial quote dispatched to customer; pending signature. |
| **Confirmed** | `--status-sub-conf` | `rgba(16, 185, 129, 0.12)` | `#047857` (Dark: `#34D399`) | `#6EE7B7` | Quote approved by customer; ready for initial cycle activation. |
| **Active** | `--status-sub-active` | `rgba(16, 185, 129, 0.18)` | `#065F46` (Dark: `#10B981`) | `#34D399` | Live subscription actively generating recurring invoices and access. |
| **Paused** | `--status-sub-paused` | `rgba(245, 158, 11, 0.14)` | `#B45309` (Dark: `#FBBF24`) | `#FCD34D` | Temporarily suspended billing; customer retains or pauses access. |
| **Closed** | `--status-sub-closed` | `rgba(100, 116, 139, 0.14)` | `#334155` (Dark: `#CBD5E1`) | `#94A3B8` | Gracefully terminated subscription at conclusion of billing cycle. |
| **Expired** | `--status-sub-exp` | `rgba(239, 68, 68, 0.12)` | `#B91C1C` (Dark: `#F87171`) | `#FCA5A5` | Terminated due to payment default, term completion, or non-renewal. |

#### B. Invoice Lifecycle Statuses
| Status | Token Name | Badge Background | Badge Text | Border Tone | Business Meaning |
|---|---|---|---|---|---|
| **Draft** | `--status-inv-draft` | `rgba(148, 163, 184, 0.12)` | `#475569` (Dark: `#94A3B8`) | `#CBD5E1` | Open line items under calculation; not finalized or sent. |
| **Confirmed** | `--status-inv-conf` | `rgba(59, 130, 246, 0.12)` | `#1D4ED8` (Dark: `#60A5FA`) | `#93C5FD` | Finalized invoice posted to ledger; dispatched to subscriber. |
| **Paid** | `--status-inv-paid` | `rgba(16, 185, 129, 0.18)` | `#065F46` (Dark: `#10B981`) | `#34D399` | Full payment balance settled and reconciled against transaction. |
| **Overdue** | `--status-inv-due` | `rgba(239, 68, 68, 0.15)` | `#B91C1C` (Dark: `#F87171`) | `#FCA5A5` | Payment terms past due; automatic dunning workflows triggered. |
| **Cancelled** | `--status-inv-void` | `rgba(100, 116, 139, 0.14)` | `#334155` (Dark: `#CBD5E1`) | `#94A3B8` | Voided or credited invoice; removed from accounts receivable. |

#### C. Payment Transaction Statuses
| Status | Token Name | Badge Background | Badge Text | Border Tone | Business Meaning |
|---|---|---|---|---|---|
| **Pending** | `--status-pay-pend` | `rgba(245, 158, 11, 0.14)` | `#B45309` (Dark: `#FBBF24`) | `#FCD34D` | Webhook dispatched; awaiting gateway settlement confirmation. |
| **Completed** | `--status-pay-done` | `rgba(16, 185, 129, 0.18)` | `#065F46` (Dark: `#10B981`) | `#34D399` | Funds successfully captured and confirmed by gateway. |
| **Failed** | `--status-pay-fail` | `rgba(239, 68, 68, 0.15)` | `#B91C1C` (Dark: `#F87171`) | `#FCA5A5` | Card declined, insufficient funds, or gateway timeout error. |
| **Refunded** | `--status-pay-ref` | `rgba(147, 51, 234, 0.14)` | `#6B21A8` (Dark: `#C084FC`) | `#D8B4FE` | Transaction balance credited back to original payment instrument. |

#### D. Discount & Promotion Statuses
| Status | Token Name | Badge Background | Badge Text | Border Tone | Business Meaning |
|---|---|---|---|---|---|
| **Active** | `--status-disc-act` | `rgba(16, 185, 129, 0.15)` | `#047857` (Dark: `#34D399`) | `#6EE7B7` | Coupon code or volume rule actively applicable to subscriptions. |
| **Scheduled** | `--status-disc-sch` | `rgba(59, 130, 246, 0.12)` | `#1D4ED8` (Dark: `#60A5FA`) | `#93C5FD` | Configured for automatic promotional activation at a future timestamp. |
| **Expired** | `--status-disc-exp` | `rgba(100, 116, 139, 0.14)` | `#475569` (Dark: `#94A3B8`) | `#CBD5E1` | Past validity date range; cannot be applied to new subscriptions. |
| **Exhausted** | `--status-disc-exh` | `rgba(245, 158, 11, 0.14)` | `#B45309` (Dark: `#FBBF24`) | `#FCD34D` | Maximum customer redemption usage count reached. |

---

## 5. Light Theme

The Light Theme provides high clarity, crisp structural boundaries, and comfortable readability for daytime office environments.

```css
:root {
  --background: 210 40% 98%;           /* #F8FAFC (Slate 50) */
  --foreground: 222 47% 11%;           /* #0F172A (Slate 900) */
  
  --card: 0 0% 100%;                   /* #FFFFFF (Pure White) */
  --card-foreground: 222 47% 11%;      /* #0F172A */
  
  --popover: 0 0% 100%;                /* #FFFFFF */
  --popover-foreground: 222 47% 11%;   /* #0F172A */
  
  --primary: 221 83% 53%;              /* #2563EB (Cobalt 600) */
  --primary-foreground: 210 40% 98%;   /* #F8FAFC */
  
  --secondary: 214 32% 91%;            /* #E2E8F0 (Slate 200) */
  --secondary-foreground: 222 47% 11%; /* #0F172A */
  
  --muted: 210 40% 96.1%;              /* #F1F5F9 (Slate 100) */
  --muted-foreground: 215 16% 47%;     /* #64748B (Slate 500) */
  
  --accent: 214 32% 93%;               /* #E2E8F0 */
  --accent-foreground: 222 47% 11%;    /* #0F172A */
  
  --destructive: 0 84% 60%;            /* #EF4444 (Red 500) */
  --destructive-foreground: 210 40% 98%;
  
  --border: 214 32% 88%;               /* #CBD5E1 (Slate 300) */
  --input: 214 32% 88%;                /* #CBD5E1 */
  --ring: 221 83% 53%;                 /* #2563EB */
  
  --radius: 0.5rem;                    /* 8px standard */
}
```

---

## 6. Dark Theme

The Dark Theme utilizes carefully tiered midnight surfaces (`#0B0F19`, `#111827`, `#1F2937`) rather than high-strain pitch black (`#000000`). This preserves visual depth and delivers exceptional chart and table contrast.

```css
.dark {
  --background: 222 47% 6%;            /* #0B0F19 (Deep Obsidian) */
  --foreground: 210 40% 98%;           /* #F8FAFC (Slate 50) */
  
  --card: 222 47% 9%;                  /* #0F172A (Slate 900) */
  --card-foreground: 210 40% 98%;      /* #F8FAFC */
  
  --popover: 222 47% 11%;              /* #1E293B (Slate 800) */
  --popover-foreground: 210 40% 98%;   /* #F8FAFC */
  
  --primary: 217 91% 60%;              /* #3B82F6 (Blue 500) */
  --primary-foreground: 222 47% 6%;    /* #0B0F19 */
  
  --secondary: 217 33% 17%;            /* #1E293B (Slate 800) */
  --secondary-foreground: 210 40% 98%; /* #F8FAFC */
  
  --muted: 217 33% 14%;                /* #161F30 (Muted Surface) */
  --muted-foreground: 215 20% 65%;     /* #94A3B8 (Slate 400) */
  
  --accent: 217 33% 16%;               /* #1E293B */
  --accent-foreground: 210 40% 98%;    /* #F8FAFC */
  
  --destructive: 0 72% 51%;            /* #DC2626 (Red 600) */
  --destructive-foreground: 210 40% 98%;
  
  --border: 217 33% 18%;               /* #1E293B */
  --input: 217 33% 18%;                /* #1E293B */
  --ring: 217 91% 60%;                 /* #3B82F6 */
}
```

### Theme Transition & Preference Handling
- **Default Theme**: Follows the user's OS preference (`prefers-color-scheme`) on initial load.
- **Persistence**: Explicit user choices are stored in `localStorage` under `subpulse-theme` (`'light' | 'dark' | 'system'`).
- **Transition**: Smooth `150ms ease-out` transition applied exclusively to `background-color`, `border-color`, and `color` properties. Avoid universal wildcard transitions (`* { transition: all }`) to prevent layout lag.

---

## 7. Typography System

The typography system is engineered for unambiguous financial readability.

- **Primary Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `sans-serif`
- **Monospace & Financial Numeric Stack**: `JetBrains Mono`, `SFMono-Regular`, `Menlo`, `Monaco`, `Consolas`, `monospace`
- **Tabular Numerals**: Every financial value (currency amounts, quantities, MRR, ARR, invoice numbers, tax percentages) MUST specify `font-variant-numeric: tabular-nums` or the utility class `tabular-nums`.

### Type Scale

| Level | Size | Weight | Line Height | Tracking | Application |
|---|---|---|---|---|---|
| **Display** | 32px (2.0rem) | Bold (700) | 1.2 | -0.025em | Main dashboard ARR/MRR aggregates, billing hero statements |
| **H1** | 24px (1.5rem) | SemiBold (600) | 1.25 | -0.02em | Top-level page headers (e.g., "Subscription Directory") |
| **H2** | 20px (1.25rem) | SemiBold (600) | 1.3 | -0.015em | Major module sections, modal titles, sheet headers |
| **H3** | 16px (1.0rem) | SemiBold (600) | 1.4 | -0.01em | Card headers, table group section titles |
| **H4** | 14px (0.875rem) | Medium (500) | 1.4 | -0.005em | Form section dividers, sub-widget headers |
| **Body Large** | 16px (1.0rem) | Regular (400) | 1.5 | 0 | Long-form customer notes, terms & conditions |
| **Body** | 14px (0.875rem) | Regular (400) | 1.5 | 0 | Default body text, data table content, form labels |
| **Body Small** | 13px (0.8125rem) | Regular (400) | 1.45 | 0 | Table secondary meta, help texts, timestamp subheadings |
| **Caption** | 12px (0.75rem) | Regular (400) | 1.4 | +0.01em | Field helper text, breadcrumbs, badge text |
| **Label** | 12px (0.75rem) | Medium (500) | 1.3 | +0.02em | Form field labels, table headers (`<th>`) |
| **Overline** | 11px (0.6875rem) | SemiBold (600) | 1.2 | +0.05em | Uppercase sidebar section labels, KPI categories |

---

## 8. Spacing Scale

The spacing scale is based on a strict `4px` base grid.

```
4px   (space-1)  : Minimum padding, icon-text gap, badge internal padding
8px   (space-2)  : Form field horizontal gap, button icon offset, inline tags
12px  (space-3)  : Input vertical padding, compact table cell padding, dropdown item padding
16px  (space-4)  : Standard card padding, form field vertical stack gap
20px  (space-5)  : Section header bottom margin, modal internal padding
24px  (space-6)  : Grid gap between dashboard KPI cards, table card padding
32px  (space-8)  : Large container padding, page header bottom separator margin
48px  (space-12) : Major page layout sections, empty state container padding
64px  (space-16) : Maximum vertical separation between distinct business domains
```

---

## 9. Layout and Grid

### Viewport Breakpoints
- **Mobile (sm)**: `< 640px` (Single-column stacked layouts; off-canvas navigation drawer)
- **Tablet (md)**: `640px – 1023px` (Dual-column metric cards; condensed table columns)
- **Standard Desktop (lg)**: `1024px – 1439px` (Full persistent sidebar; 3-column dashboard widgets)
- **Wide Desktop (xl)**: `≥ 1440px` (4-column metric grids; full extended tabular data columns)

### Architectural Dimensions
- **Sidebar Width (Expanded)**: `256px` (`16rem`)
- **Sidebar Width (Collapsed)**: `64px` (`4rem`)
- **Header Height**: `64px` (`4rem`)
- **Max Content Width**: `1440px` (`90rem`), centered with `mx-auto`
- **Page Horizontal Padding**: `16px` on mobile, `24px` on tablet, `32px` on desktop
- **Page Vertical Padding**: `24px` to `32px`

---

## 10. Border Radius and Elevation

### Radius Tokens
- `--radius-sm`: `4px` (`0.25rem`) — Micro tags, inline code badges, tooltips
- `--radius-md`: `6px` (`0.375rem`) — Form inputs, select dropdowns, table row hover highlights
- `--radius-lg`: `8px` (`0.5rem`) — Standard buttons, dropdown menus, cards, command palettes
- `--radius-xl`: `12px` (`0.75rem`) — Dialogs, slide-over sheets, dashboard widget panels
- `--radius-full`: `9999px` — Avatars, pill badges, status indicator dots

### Elevation & Shadow Tokens
- **Surface Elevation 0 (Flat)**: Used for cards and table containers. Relies entirely on `1px solid var(--border)` without drop shadows.
- **Surface Elevation 1 (Hover)**: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`
- **Surface Elevation 2 (Dropdown / Popover)**: `0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)`
- **Surface Elevation 3 (Modal Dialog)**: `0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)`

---

## 11. Application Shell

The AppShell layout provides a consistent, unified framing across every page:

```
┌────────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (256px / 64px)       │  HEADER (Sticky, 64px)                 │
│  ┌─────────────────────────┐  ├────────────────────────────────────────┤
│  │ [Subpulse Logo]         │  │ Breadcrumbs  Search (Ctrl+K)   Theme   │
│  ├─────────────────────────┤  ├────────────────────────────────────────┤
│  │ OVERVIEW                │  │ PAGE HEADER                            │
│  │ • Dashboard             │  │ Title + Description + Primary Action   │
│  │ • Activity              │  ├────────────────────────────────────────┤
│  │                         │  │                                        │
│  │ BUSINESS                │  │                                        │
│  │ • Customers             │  │ MAIN CONTENT CANVAS                    │
│  │ • Products & Variants   │  │ (Max Width: 1440px)                    │
│  │ • Subscription Plans    │  │ Data Tables, Metric Cards, Forms       │
│  │ • Quotations            │  │                                        │
│  │ • Subscriptions         │  │                                        │
│  │                         │  │                                        │
│  │ FINANCE                 │  │                                        │
│  │ • Invoices              │  │                                        │
│  │ • Payments              │  │                                        │
│  │ • Taxes & Discounts     │  │                                        │
│  │ • Revenue Reports       │  │                                        │
│  ├─────────────────────────┤  │                                        │
│  │ [User Role Indicator]   │  │                                        │
│  └─────────────────────────┘  └────────────────────────────────────────┘
```

---

## 12. Navigation System

### Structure & Modules
Navigation items are grouped logically according to commercial responsibility:

1. **Overview**
   - **Dashboard**: High-level ARR/MRR metrics, active subscriber counts, cash collections, urgent alerts.
   - **Activity Timeline**: Tamper-evident chronological audit feed of all commercial operations.
2. **Business Operations**
   - **Customers**: Subscriber directory, account health, payment instruments, assigned billing contacts.
   - **Products**: SaaS modules, add-ons, physical SKUs, and variant attribute definitions.
   - **Subscription Plans**: Pricing tiers (Monthly, Annual, Usage Tiers, Free Trials).
   - **Quotations**: Draft commercial agreements, custom discount quotes, approval statuses.
   - **Subscriptions**: Active contract lifecycles, renewal dates, upgrades/downgrades, pause/resume.
3. **Finance & Billing**
   - **Invoices**: Generated billing statements, line item breakdowns, tax computation, due dates.
   - **Payments**: Gateway transaction logs, webhook settlement confirmations, refund audits.
   - **Taxes**: Jurisdiction-based tax rules, VAT/GST configurations, tax exemption certificates.
   - **Discounts**: Promotional coupons, volume discount tiers, validity windows.
   - **Revenue Reports**: Recognized revenue, cash collections, aging accounts receivable.
4. **Administration**
   - **Team Members**: Internal operator accounts, staff invitations, assignment status.
   - **Roles & Permissions**: Fine-grained RBAC matrix (Admin, Staff, Customer).
   - **System Settings**: Global currency, billing anchor dates, payment gateway keys, webhook endpoints.

### Role-Based Navigation Visibility
- **Admin**: Complete visibility across all 4 groups and all administrative settings.
- **Internal Staff**: Visibility over Overview, Business Operations, and Invoices/Payments. Settings and Role configuration are hidden.
- **Customer**: Restricted to dedicated Customer Portal view: "My Subscriptions", "My Invoices", "Payment Methods", and "Account Profile".

---

## 13. Component Design Standards

### 13.1 Buttons
- **Primary**: Background `var(--primary)`, text `var(--primary-foreground)`. Used for the single most important action per view (e.g., "Create Subscription", "Send Invoice").
- **Secondary**: Background `var(--secondary)`, text `var(--secondary-foreground)`. Used for supporting actions (e.g., "Export CSV", "Save as Draft").
- **Outline**: 1px border `var(--border)`, transparent background, hover `var(--accent)`. Standard button for filters and table headers.
- **Ghost**: Transparent background, hover `var(--accent)`. Used in table row action menus and icon buttons.
- **Destructive**: Background `var(--destructive)`, text `white`. Reserved strictly for irreversible actions (e.g., "Void Invoice", "Cancel Subscription").
- **Loading State**: Disables user interaction, retains button dimensions, and renders a centered inline spinner.

### 13.2 Form Inputs
- **Height**: Standard `36px` (`2.25rem`) for compact desktop precision; `40px` (`2.5rem`) on touch devices.
- **Border**: `1px solid var(--input)`.
- **Focus State**: `outline: none; box-shadow: 0 0 0 2px var(--ring)`.
- **Placeholder**: Color `var(--muted-foreground)`.
- **Error State**: Border `var(--destructive)`, subtle error text below input with an `AlertCircle` icon.

### 13.3 Badges
- **Shape**: Compact rounded rectangle (`4px` radius).
- **Height**: `22px`, font size `11px`, font weight `500`.
- **Variants**: Status-mapped (Draft, Active, Overdue, Paid, Cancelled, Warning, Success).

---

## 14. Business-Specific UI Patterns

### 14.1 Subscription Interface Pattern
- **Status Indicator**: Prominent badge with dot indicator reflecting current lifecycle state (Active, Paused, Expired).
- **Billing Frequency Pill**: Tabular label displaying cadence (`Monthly (1st)`, `Annual (Nov 1)`).
- **Next Billing Countdown**: Visual countdown alert showing days remaining until automated renewal and card charge.
- **Subscription Action Drawer**: Slide-over panel enabling one-click plan change, proration preview, discount addition, or paused billing schedule.

### 14.2 Invoice Interface Pattern
- **Header Summary**: Prominent invoice sequence number (`INV-2026-00412`), status badge, and issuance/due dates.
- **Line Item Ledger**: Detailed table itemizing Product Variant, Billing Interval, Base Quantity, Unit Price, Applied Discount, and Line Total.
- **Financial Reconciliation Block**:
  ```
  Subtotal:                $12,400.00
  Discount (EARLYBIRD10):   -$1,240.00
  Tax (NY State 8.875%):      +$989.98
  ────────────────────────────────────
  Total Due:               $12,149.98
  Amount Paid:             $12,149.98
  Balance Remaining:            $0.00 (PAID)
  ```

### 14.3 Financial Dashboard Pattern (ARR / MRR Integrity)
- **Strict Financial Separation**:
  - **MRR (Monthly Recurring Revenue)**: Normalized recurring subscription revenue only. Never includes one-time setup fees or consulting charges.
  - **ARR (Annual Recurring Revenue)**: Exactly `MRR × 12`.
  - **Cash Collected**: Gross settled payments captured during the period.
  - **Accounts Receivable (AR)**: Total confirmed invoice balance currently unpaid or overdue.

---

## 15. Data Table Standards

Tables represent the primary workspace for subscription operators.

- **Row Heights**: Standard row height `44px`; compact mode `36px`.
- **Header Formatting**: Uppercase `11px` bold text, tracking `+0.05em`, background `var(--muted)`, border-bottom `1px solid var(--border)`.
- **Hover State**: Entire row transitions to `var(--accent)/40` on mouse enter.
- **Selected State**: Row background highlights to `var(--primary)/10` with a persistent left border indicator.
- **Sorting Indicators**: Distinct Lucide `ArrowUpDown`, `ArrowUp`, or `ArrowDown` icons adjacent to column headers.
- **Numeric Alignment**: Text headers align left; currency, quantities, and dates MUST align right with `tabular-nums`.
- **Row Actions**: Pinned rightmost column containing a ghost dropdown button (`MoreHorizontal`) for quick contextual operations.

---

## 16. Forms and Validation

- **Layout**: Standard two-column responsive grid on desktop; single-column on mobile.
- **Required Fields**: Indicated with a subtle red asterisk (`*`).
- **Validation Execution**: Real-time validation triggered `onBlur`, with immediate feedback upon submission.
- **Unsaved Changes Shield**: Any form with modified dirty state prompts a confirmation warning if the user attempts to navigate away.
- **Currency Inputs**: Pre-fixed with localized currency symbol (`$`, `€`, `£`) with automatic thousands-separator formatting (`12,500.00`).

---

## 17. Dashboard and Analytics

- **Top KPI Cards**: 4-column summary metric cards highlighting:
  1. *Net Active MRR* (with month-over-month % delta indicator)
  2. *Active Paying Subscriptions*
  3. *Unpaid / Overdue Invoices* (with count and total dollar balance)
  4. *Net Cash Collected (MTD)*
- **Interactive Time Range Selector**: Segmented control enabling `30 Days`, `Quarter-to-Date`, `Year-to-Date`, or `Custom Range`.
- **Urgent Operational Queue**: Dedicated side panel alerting staff to expiring quotations, failed recurring payments requiring dunning, and unassigned customers.

---

## 18. Charts and Data Visualization

Integrated seamlessly using `Recharts`:

- **MRR / ARR Growth Trend**: Smooth `AreaChart` with subtle gradient fill (`opacity 0.25` fading to `0.0`).
- **Subscription Churn vs Expansion**: Segmented `BarChart` comparing expansion revenue against churned subscriptions.
- **Status Breakdown**: Concentric `PieChart` / Donut chart with clear percentage legends.
- **Chart Typography**: Axis labels styled with `11px` regular text in `var(--muted-foreground)`.
- **Tooltips**: Custom React portal tooltip styled matching `--popover` with tabular numerical breakdowns.
- **Grid Lines**: Ultra-subtle dashed grid lines with `10%` opacity (`rgba(148, 163, 184, 0.1)`).

---

## 19. Interaction and Motion

- **Motion Library**: `motion` (Framer Motion).
- **Core Principle**: Motion must feel physical, purposeful, and instantaneous. Animations are never decorative; they confirm state transitions.
- **Timing & Easing**:
  - Standard Micro-interactions (hover, toggle, button click): `150ms cubic-bezier(0.4, 0, 0.2, 1)`.
  - Sheet / Drawer slide-in: `250ms cubic-bezier(0.16, 1, 0.3, 1)`.
  - Dialog modal entrance: `200ms cubic-bezier(0.16, 1, 0.3, 1)` (Subtle scale from `0.97` to `1.0` with fade).
- **Reduced Motion Support**: Automatically disables all scale and positional motion when `prefers-reduced-motion: reduce` is detected.

---

## 20. Responsive Design

- **Desktop (≥ 1024px)**: Full multi-column dashboard, persistent navigation sidebar, full table columns.
- **Tablet (768px – 1023px)**: Sidebar collapses to 64px icon rail with hover tooltips; tables enable horizontal scroll; dashboard metric cards wrap to a 2×2 grid.
- **Mobile (< 768px)**:
  - Sidebar transitions to a slide-over mobile drawer triggered via the top header hamburger button.
  - Complex multi-column data tables convert into stacked card summaries with expand/collapse details.
  - Modals automatically render as bottom-anchored slide-up sheets for touch ergonomics.

---

## 21. Accessibility (WCAG 2.2 AA)

- **Contrast Ratios**: Minimum `4.5:1` contrast ratio for all standard body copy and data table cells; minimum `3:1` for large headings and badge containers.
- **Keyboard Navigation**: Complete tab-stop coverage across the entire application shell, data tables, modals, and dropdown menus.
- **Focus Rings**: High-visibility `2px solid var(--ring)` with `2px offset` clearly identifying active keyboard focus.
- **Screen Reader Announcements**: Form error messages and toast notifications utilize `aria-live="polite"` and `role="alert"`.
- **Status Redundancy**: Color is NEVER used as the sole indicator of status. Every badge and alert includes an explicit textual label and associated Lucide icon.

---

## 22. Design Token Architecture

Mapped directly into CSS Variables and compatible with Tailwind CSS v4:

```css
@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));
  
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

---

## 23. UI Consistency Rules

All future frontend developers and contributors must strictly adhere to the following rules:

1. **Zero Raw Hex Colors**: Never write `#2563EB` or `rgba(...)` directly inside a React component. Always use semantic Tailwind tokens (`bg-primary`, `text-muted-foreground`, `border-border`).
2. **Tabular Numerals on All Finances**: Never display a price, balance, invoice ID, or percentage without applying the `tabular-nums` class.
3. **No Arbitrary Padding/Margins**: Only use values from the spacing scale (`p-2`, `p-4`, `p-6`, etc.). Do not use arbitrary values like `p-[17px]`.
4. **Single Button Primary Rule**: There must never be more than one primary button visible per container or modal view.
5. **No Icon Inconsistencies**: All icons must be imported exclusively from `lucide-react`. Do not mix with FontAwesome or other icon libraries.
6. **Accessible Status Badges**: A status badge must ALWAYS contain both an icon/dot and an explicit readable text string.
7. **Consistent Modals**: Every destructive deletion or cancellation action MUST use the standard confirmation dialog pattern with a red action button.

---

## 24. Developer Implementation Guidelines

When implementing frontend features in `apps/web`:

1. **Component Primitives**: First check `@/components/ui/` for existing primitives (`button`, `dialog`, `badge`, `input`, `select`, `card`). Do not create duplicate wrappers.
2. **Table Implementation**: Use `TanStack Table` (`@tanstack/react-table`) paired with `@/components/ui/` table layout components.
3. **Form Implementation**: Construct forms using `react-hook-form` with `@hookform/resolvers/zod` and schema models exported from `@subpulse/contracts`.
4. **State Segregation**: Keep global session and tenant preferences inside Zustand stores (`useAuthStore`, `useThemeStore`). Keep server entity caching inside TanStack Query hooks (`useQuery`, `useMutation`).

---

## 25. Future Design System Expansion

As Subpulse expands, the design system will seamlessly support:

- **Usage-Based Metering Widgets**: Real-time gauge bars and percentile thresholds for API call and seat consumption.
- **Visual Plan Builder**: Drag-and-drop plan variant matrix with pricing tier sliders.
- **Embedded Invoice PDF Generator**: Pixel-perfect printable CSS layouts formatted for international A4 and US-Letter paper standards.
- **Custom Customer Portal Themes**: Tenant-level custom accent color injection while retaining core accessibility and contrast boundaries.
