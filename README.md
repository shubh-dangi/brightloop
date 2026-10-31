# Brightloop — Enterprise Subscription Management & Recurring Billing Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square&logo=turborepo)](https://brightloop-chi.vercel.app)
[![Tests Passing](https://img.shields.io/badge/tests-66%20passed%20(100%25)-success?style=flat-square&logo=vitest)](https://brightloop-chi.vercel.app)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.x%20Strict-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![NestJS LTS](https://img.shields.io/badge/NestJS-10%20LTS-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Brightloop** is an enterprise-grade commercial operating system and subscription lifecycle engine engineered for modern SaaS, recurring revenue, and B2B digital commerce. Built for high-frequency billing, multi-tier pricing, automated tax computation, sales quotation workflows, and live MRR/ARR realization.

**Live Production Web Client:** [https://brightloop-chi.vercel.app](https://brightloop-chi.vercel.app)  
**API Documentation (Swagger):** `https://brightloop-api.railway.app/api/docs` *(or `http://localhost:4000/api/docs` in local dev)*

---

## 📑 Table of Contents

- [1. Executive System Overview](#1-executive-system-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Dual Theme Design System](#3-dual-theme-design-system)
- [4. Technology Stack & Rationale](#4-technology-stack--rationale)
- [5. Core Business Workflows](#5-core-business-workflows)
- [6. Complete Domain Feature Matrix](#6-complete-domain-feature-matrix)
- [7. Role-Based Access Control (RBAC) Matrix](#7-role-based-access-control-rbac-matrix)
- [8. Entity-Relationship Data Model](#8-entity-relationship-data-model)
- [9. REST API Catalog](#9-rest-api-catalog)
- [10. Error Handling & Resilience UX](#10-error-handling--resilience-ux)
- [11. Quick Start & Local Setup](#11-quick-start--local-setup)
- [12. Seed Demo Accounts](#12-seed-demo-accounts)
- [13. Environment Variables Reference](#13-environment-variables-reference)
- [14. Testing & Verification Suite](#14-testing--verification-suite)
- [15. Deployment Guide](#15-deployment-guide)
- [16. Repository Structure](#16-repository-structure)
- [17. Contributing & License](#17-contributing--license)

---

## 1. Executive System Overview

Brightloop solves the complexity of recurring billing, variable invoicing, and subscription renewals. Unlike basic billing tools, Brightloop provides a unified ledger architecture that connects sales proposals (Quotations), contract agreements (Subscriptions), financial ledgers (Invoices), and multi-method receipts (Payments) in a single synchronized database schema.

### Core Capabilities:
- **Product & Multi-Variant Catalog**: Track base subscription products, recurring add-ons, and physical/service line items with separate selling and cost prices.
- **Sales Quotations & Proposals**: Issue structured sales quotes with validity periods (`validDays`), automatic discount calculation, tax rules, and 1-click subscription conversion.
- **Automated Recurring Billing Engine**: Supports Monthly, Yearly, Weekly, and Daily billing frequencies with automatic prorations, pauses, and renewals.
- **Invoice & Tax Compliance**: Automated invoice generation with Net terms, Indian Rupee (`₹`) normalization, GST/VAT percentage calculation, and payment reconciliation.
- **Real-Time Analytics**: Live dashboards for Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), ARPU, Active Subscriber Count, and Churn rate.
- **Enterprise Multi-Tenancy & RBAC**: Strict workspace isolation (`x-organization-id`) with role-based policies for Owner, Admin, Staff, and Customer users.

---

## 2. System Architecture

```mermaid
graph TD
    subgraph ClientLayer ["Client Layer (Web Application)"]
        Browser["Modern Web Browser"]
        Landing["Marketing Landing Page"]
        AuthApp["Authentication & Onboarding"]
        AppShell["Workspace Shell (Linear UI)"]
        PortalApp["Customer Self-Service Portal"]
    end

    subgraph GatewayLayer ["Network & Edge Gateway Layer"]
        VercelCDN["Vercel Global Edge Network"]
        ViteDevServer["Vite 6 Dev Proxy (/api/v1)"]
        RateLimiter["NestJS Throttler Rate Limiter"]
        SecurityHeaders["Helmet & Strict CORS Policy"]
    end

    subgraph ServiceLayer ["Application Backend (NestJS LTS)"]
        AuthModule["Auth & JWT Rotation Module"]
        TenantGuard["Multi-Tenant Isolation Guard"]
        RolesGuard["RBAC Authorization Guard"]
        BillingEngine["Recurring Billing & Proration Engine"]
        InvoiceEngine["Invoice & Tax Calculation Service"]
        PaymentReconciler["Payment Reconciler & Ledger"]
        AnalyticsService["MRR / ARR Metric Service"]
    end

    subgraph DataLayer ["Data & Storage Layer"]
        PrismaORM["Prisma 6.x ORM Engine"]
        PostgresDB[(PostgreSQL 16 Primary DB)]
        RedisCache[(Redis 7 In-Memory Cache)]
        S3Storage["AWS S3 / Presigned Document Store"]
    end

    Browser --> VercelCDN
    VercelCDN --> Landing
    VercelCDN --> AuthApp
    VercelCDN --> AppShell
    VercelCDN --> PortalApp

    AppShell --> ViteDevServer
    ViteDevServer --> RateLimiter
    RateLimiter --> SecurityHeaders
    SecurityHeaders --> TenantGuard
    TenantGuard --> RolesGuard

    RolesGuard --> AuthModule
    RolesGuard --> BillingEngine
    RolesGuard --> InvoiceEngine
    RolesGuard --> PaymentReconciler
    RolesGuard --> AnalyticsService

    BillingEngine --> PrismaORM
    InvoiceEngine --> PrismaORM
    PaymentReconciler --> PrismaORM
    AnalyticsService --> PrismaORM

    PrismaORM --> PostgresDB
    AuthModule --> RedisCache
    InvoiceEngine --> S3Storage
```

---

## 3. Dual Theme Design System

Brightloop is designed with an enterprise **Dual-Theme Design System**, meticulously calibrated for high operational density, reduced eye strain, and pixel-precise contrast:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  LIGHT MODE: Icy Blue Canvas                DARK MODE: Midnight Navy Canvas  │
│  Main Canvas:   #F4F8FF                     Main Canvas:   #101827           │
│  Cards/Modals:  #FFFFFF                     Cards/Modals:  #1B2B42           │
│  Primary CTA:   #356FF6 (Royal Blue)        Primary CTA:   #75A5FF (Frost)   │
│  Text Primary:  #111827 (Dark Navy)         Text Primary:  #F1F6FF (Crisp)   │
│  Border:        #E1EAF6                     Border:        #2D415B           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Global Theme Switcher Placement:
A unified `<ThemeSwitcher />` component is embedded across **100% of application pages**:
1. **Marketing Landing Page** (`/`): Right side of the sticky navbar and inside the mobile navigation drawer.
2. **Authentication Views** (`/login`, `/signup`, `/forgot-password`, `/reset-password`): Top-right corner in `AuthLayout.tsx`.
3. **Application Shell** (`Header.tsx`): Persistent topbar across Admin, Staff, and Customer workspaces.
4. **Settings & Preferences** (`/preferences`): Interactive theme mode selector cards with instant live preview.
5. **System & Error Pages** (`/404`, `/500`, `/403`, `/503`, `/offline`): Top-right corner for accessible comfort under failure states.

### Zero-FOUC Architecture:
Themes are persisted in `localStorage('brightloop-theme')`. An inline pre-render script in `index.html` resolves the active mode (`light`, `dark`, or dynamic OS preference `system`) before the initial DOM paint, guaranteeing zero flash of unstyled content.

---

## 4. Technology Stack & Rationale

| Layer | Technology | Version | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | 19.0.0 | Latest concurrent rendering features, native actions, and optimal client performance. |
| **Build Tooling** | **Vite** | 6.x | Lightning-fast HMR and optimized Rollup tree-shaking for enterprise bundle sizes. |
| **Strict Constraint** | **NO Next.js** | — | Explicitly architectural requirement: Client-Side Single Page Application (SPA) with pure REST API backend separation. |
| **Styling Engine** | **Tailwind CSS** | 4.x | CSS variable tokens, unified design system, zero runtime overhead. |
| **Component Primitives**| **Radix UI** | Latest | Unstyled, accessible (WAI-ARIA compliant) headless dialogs, dropdowns, and tabs. |
| **Client State** | **Zustand** | 5.x | Ultra-lightweight store for Auth session, tenant context, and theme mode without boilerplate. |
| **Server State** | **TanStack Query** | 5.x | Intelligent cache management, background query revalidation, and optimistic updates. |
| **Icons** | **Lucide React** | Latest | Crisp, uniform SVG enterprise iconography. |
| **Form Management** | **React Hook Form + Zod** | Latest | High-performance uncontrolled inputs with type-safe schema validation contracts. |
| **Backend Framework** | **NestJS LTS** | 10.x | Enterprise modular TypeScript architecture with dependency injection and OpenAPI generator. |
| **Database ORM** | **Prisma** | 6.x | Type-safe query engine, automated migration management, and relational integrity. |
| **Database Engine** | **PostgreSQL** | 16 | Relational consistency, ACID transactions, JSONB indexing, and multi-tenant schema isolation. |
| **Monorepo Engine** | **Turborepo** | 2.x | High-speed pipeline caching and parallel build orchestration. |

---

## 5. Core Business Workflows

### 5.1 Sales Quote to Active Subscription & Invoice Flow

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Sales / Staff
    actor Customer as Customer
    participant API as Brightloop API
    participant DB as PostgreSQL DB
    participant Billing as Billing Engine

    Staff->>API: POST /api/v1/quotations (Draft Quote)
    API->>DB: INSERT into quotations (DRAFT)
    Staff->>API: POST /api/v1/quotations/:id/confirm
    API->>DB: UPDATE quotation (CONFIRMED)
    API-->>Customer: Notification / Quote Delivery
    Customer->>API: Customer Accepts Quote
    Staff->>API: POST /api/v1/quotations/:id/convert-to-subscription
    API->>DB: INSERT into subscriptions (ACTIVE)
    API->>Billing: Trigger Immediate Cycle Invoicing
    Billing->>DB: INSERT into invoices (status: CONFIRMED, due: Net 30)
    API-->>Staff: Return Created Subscription & Invoice #INV-2026-001
```

### 5.2 Invoice Payment & Cash Realization Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer / Payer
    participant Webhook as Payment Gateway (Razorpay/Stripe)
    participant API as Brightloop Webhook API
    participant DB as PostgreSQL DB

    Customer->>Webhook: Complete Online Payment (₹4,999)
    Webhook->>API: POST /api/v1/webhooks/payment (signed signature)
    API->>API: Verify HMAC Signature
    API->>DB: INSERT into payments (paymentReference: PAY-9821)
    API->>DB: UPDATE invoices SET paidAmount = totalAmount, status = 'PAID'
    API->>DB: UPDATE subscriptions SET status = 'ACTIVE', expiryDate = nextCycle
    API->>DB: INSERT into activity_logs (Action: PAYMENT_RECEIVED)
    API-->>Webhook: 200 OK (Processed)
```

---

## 6. Complete Domain Feature Matrix

### 📦 1. Product & Catalog Management
- Multi-tier product creation (Software, Add-on, Professional Services).
- Variant support (e.g., custom branding, dedicated IP, volume tiering) with independent price adjustments.
- Dual-tier price tracking: Public `salesPrice` and role-restricted `costPrice` (cost price is masked from Staff role to preserve corporate confidentiality).
- Association with flexible recurring plans.

### 📝 2. Sales Proposals & Quotations
- Professional quote number generator (`QT-2026-0001`).
- Line item builder with quantity, unit rate, tax rates, and discount application.
- Expiration tracking with `validDays` (e.g., 15-day validity with visual countdown badge).
- 1-Click conversion into an active Recurring Subscription.

### 🔄 3. Subscriptions Engine
- Flexible billing intervals: **Monthly**, **Yearly**, **Weekly**, and **Daily**.
- Lifecycle state machine: `DRAFT` ➔ `QUOTATION` ➔ `CONFIRMED` ➔ `ACTIVE` ➔ `PAUSED` ➔ `CLOSED`.
- Immediate manual actions: Pause Subscription, Resume Subscription, and Cancel Subscription with mandatory confirmation dialogs.
- Automatic next billing date calculator based on billing frequency.

### 🧾 4. Automated Invoicing & Ledger
- Auto-generated sequential invoice numbering (`INV-2026-0001`).
- Payment terms calculation (`Immediate`, `Net 15`, `Net 30`, `Net 60`).
- Tax compliance: Configurable tax rules (Standard GST 18%, VAT, etc.) calculated per item line.
- Outstanding balance and partial payment tracking (`totalAmount`, `paidAmount`, `outstandingAmount`).
- Lifecycle state transitions: `DRAFT` ➔ `CONFIRMED` ➔ `PAID` ➔ `CANCELLED`.

### 💳 5. Payment Recording & Reconciliation
- Manual payment entry for Bank Transfer, Check, Cash, and Card.
- Automatic allocation to outstanding invoice balance.
- Immutable audit log tracking user who recorded payment (`recordedById`).
- Real-time webhook listener for automated gateway reconciliation.

### 👥 6. Customer Portal & Self-Service
- Dedicated customer portal view for client accounts.
- View real-time active subscriptions, historical invoices, and downloaded PDF receipts.
- Update billing contact information and addresses.

### 📊 7. Revenue Intelligence & Analytics
- **Monthly Recurring Revenue (MRR)**: Normalizes annual, quarterly, and monthly plans to single monthly run rate.
- **Annual Recurring Revenue (ARR)**: Real-time projection (`MRR × 12`).
- **Cash Realization vs Invoiced Total**: Track actual collections against receivables.
- **Active Subscriber Count & Retention**: Churn monitoring and subscriber growth trends.
- Tabular figures (`tabular-nums`) with Indian Rupee (`₹`) symbol formatting across all monetary views.

---

## 7. Role-Based Access Control (RBAC) Matrix

Brightloop enforces strict RBAC across 4 distinct organizational roles. The backend verifies permissions via `@RequirePermissions()` decorators while the frontend dynamically gates UI actions using `<RoleGuard>`:

| Module / Action | Owner | Admin | Staff (Member) | Customer (Portal) |
| :--- | :---: | :---: | :---: | :---: |
| **Workspace Settings & Billing** | ✅ Full | ✅ Read/Write | ❌ Denied | ❌ Denied |
| **Manage Team Members & Invite** | ✅ Full | ✅ Full | ❌ Denied | ❌ Denied |
| **Create & Edit Roles/Permissions**| ✅ Full | ❌ Denied | ❌ Denied | ❌ Denied |
| **View Financial Reports (MRR/ARR)**| ✅ Full | ✅ Full | ❌ Denied | ❌ Denied |
| **View Product Catalog & Prices** | ✅ Full | ✅ Full | ✅ Full | ✅ Published Only |
| **View Product `costPrice`** | ✅ Full | ✅ Full | ❌ **Masked** | ❌ **Masked** |
| **Create & Update Products** | ✅ Full | ✅ Full | ❌ Denied | ❌ Denied |
| **Create & Send Quotations** | ✅ Full | ✅ Full | ✅ Full | ❌ Denied |
| **Approve / Confirm Quotations** | ✅ Full | ✅ Full | ❌ Denied | ✅ Self-Approve |
| **Convert Quote to Subscription** | ✅ Full | ✅ Full | ✅ Full | ❌ Denied |
| **View Subscriptions List** | ✅ Full | ✅ Full | ✅ Full | ✅ Own Subscriptions |
| **Pause / Resume Subscriptions** | ✅ Full | ✅ Full | ❌ Denied | ❌ Denied |
| **Cancel Subscriptions** | ✅ Full | ✅ Full | ❌ Denied | ❌ Denied |
| **Generate Invoices** | ✅ Full | ✅ Full | ✅ Full | ❌ Denied |
| **View Invoices** | ✅ Full | ✅ Full | ✅ Full | ✅ Own Invoices |
| **Record Customer Payments** | ✅ Full | ✅ Full | ✅ Full | ❌ Denied |
| **View Audit Logs & Timeline** | ✅ Full | ✅ Full | ❌ Denied | ❌ Denied |
| **Personal Profile & Preferences**| ✅ Full | ✅ Full | ✅ Full | ✅ Full |

---

## 8. Entity-Relationship Data Model

```mermaid
erDiagram
    ORGANIZATION ||--o{ ORGANIZATION_MEMBER : has
    ORGANIZATION ||--o{ ROLE : defines
    ORGANIZATION ||--o{ CUSTOMER : owns
    ORGANIZATION ||--o{ PRODUCT : catalogs
    ORGANIZATION ||--o{ PLAN : configures
    ORGANIZATION ||--o{ QUOTATION : creates
    ORGANIZATION ||--o{ SUBSCRIPTION : manages
    ORGANIZATION ||--o{ INVOICE : issues
    ORGANIZATION ||--o{ PAYMENT : reconciles

    USER ||--o{ ORGANIZATION_MEMBER : joins
    USER ||--o{ REFRESH_TOKEN : authenticates
    ROLE ||--o{ ROLE_PERMISSION : contains
    PERMISSION ||--o{ ROLE_PERMISSION : grants
    ORGANIZATION_MEMBER }o--|| ROLE : assigned

    CUSTOMER ||--o{ QUOTATION : receives
    CUSTOMER ||--o{ SUBSCRIPTION : subscribes
    CUSTOMER ||--o{ INVOICE : billed
    CUSTOMER ||--o{ PAYMENT : pays

    PRODUCT ||--o{ PRODUCT_VARIANT : has
    PRODUCT ||--o{ PLAN : offered_in
    PRODUCT ||--o{ QUOTATION_LINE : items
    PRODUCT ||--o{ SUBSCRIPTION_LINE : items

    PLAN ||--o{ SUBSCRIPTION : governs
    QUOTATION ||--o{ QUOTATION_LINE : includes
    QUOTATION ||--o{ SUBSCRIPTION : converts_to

    SUBSCRIPTION ||--o{ SUBSCRIPTION_LINE : contains
    SUBSCRIPTION ||--o{ INVOICE : generates

    INVOICE ||--o{ INVOICE_LINE : items
    INVOICE ||--o{ PAYMENT : receives
```

---

## 9. REST API Catalog

All endpoints are versioned under `/api/v1` and return standardized envelopes:
```typescript
{
  "success": boolean,
  "message": string,
  "data": T | null,
  "meta"?: { "timestamp": string, "path": string }
}
```

### Authentication & User Identity
- `POST /api/v1/auth/register` — Register new organization and owner account
- `POST /api/v1/auth/login` — Sign in with email & password (returns JWT and httpOnly refresh cookie)
- `POST /api/v1/auth/refresh` — Rotate refresh token and issue new access token
- `POST /api/v1/auth/logout` — Revoke active refresh token session
- `POST /api/v1/auth/forgot-password` — Issue password reset token link
- `POST /api/v1/auth/reset-password` — Verify token and update user password
- `GET /api/v1/auth/me` — Retrieve active user identity and tenant memberships

### Subscriptions & Contracts
- `GET /api/v1/subscriptions` — List subscriptions (filterable by customer, status, plan)
- `GET /api/v1/subscriptions/:id` — Retrieve subscription contract details with itemized lines
- `POST /api/v1/subscriptions` — Create subscription contract
- `PATCH /api/v1/subscriptions/:id` — Modify terms or billing plan
- `POST /api/v1/subscriptions/:id/pause` — Temporarily halt recurring cycle
- `POST /api/v1/subscriptions/:id/resume` — Re-activate paused contract
- `POST /api/v1/subscriptions/:id/close` — Terminate subscription with cancellation reason

### Invoices & Financial Ledgers
- `GET /api/v1/invoices` — List invoices with payment status, due dates, and totals
- `GET /api/v1/invoices/:id` — Retrieve invoice breakdown, taxes, and recorded payments
- `POST /api/v1/invoices` — Create manual or ad-hoc invoice
- `POST /api/v1/invoices/:id/confirm` — Finalize draft invoice and dispatch to customer
- `POST /api/v1/invoices/:id/payments` — Record offline or manual payment receipt

### Quotations & Sales Proposals
- `GET /api/v1/quotations` — List sales quotes with validity periods
- `GET /api/v1/quotations/:id` — Detailed quotation proposal view
- `POST /api/v1/quotations` — Create quotation with line items
- `POST /api/v1/quotations/:id/confirm` — Approve proposal
- `POST /api/v1/quotations/:id/convert-to-subscription` — 1-Click conversion to recurring subscription

### Products & Plans
- `GET /api/v1/products` — List products (returns `costPrice` only for Admin/Owner)
- `GET /api/v1/products/:id` — Product detail with variants and active plans
- `POST /api/v1/products` — Create new product
- `PATCH /api/v1/products/:id` — Update pricing, variants, and catalog details
- `DELETE /api/v1/products/:id` — Soft-delete or archive product

---

## 10. Error Handling & Resilience UX

Brightloop strictly forbids technical data leaks (e.g. database stack traces or SQL failures in UI):
- **Centralized Error Parsing (`parseApiError`)**: Transforms raw status codes (400, 401, 403, 404, 409, 422, 429, 500) into human-reassuring messages.
- **Field-Level Inline Validation (`<FieldError />`)**: Renders inline field feedback with `role="alert"` and `aria-live="polite"`. Form inputs are **never wiped out** upon failed submission.
- **Destructive Confirmation (`<ConfirmDialog />`)**: Mandatory confirmation modal prior to deleting entities, canceling subscriptions, or processing refunds.
- **Global Error Boundary (`<ErrorBoundary />`)**: Recovers gracefully from unexpected client errors with "Try Again", "Reload Window", and "Dashboard" fallback options.
- **Offline Resilience (`<OfflineBanner />`)**: Dynamic status banner warning when connectivity is lost, with instant confirmation toast upon reconnection.

---

## 11. Quick Start & Local Setup

### 1. Prerequisites
Ensure your local development environment has:
- **Node.js**: `v20.x` or `v22.x LTS`
- **pnpm**: `v9.x` or higher (`corepack enable pnpm`)
- **Docker & Docker Compose**: (for local PostgreSQL & Redis)

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-org/brightloop.git
cd brightloop

# Install monorepo dependencies
pnpm install
```

### 3. Configure Environment Variables
Copy the pre-configured template:
```bash
cp .env.example .env
```

### 4. Start Infrastructure (PostgreSQL & Redis)
```bash
# Spin up Docker containers
pnpm docker:up

# Generate Prisma client bindings
pnpm db:generate

# Apply database migrations
pnpm db:migrate

# Seed demo records and test accounts
pnpm db:seed
```

### 5. Launch Development Servers
```bash
pnpm dev
```
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **REST API Server**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 12. Seed Demo Accounts

The database seed provisions four standard accounts for testing role hierarchies. The login page features **1-click quick-fill buttons** for instant sign-in:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@brightloop.local` | `Password123!` | Complete organizational authority |
| **Admin** | `admin@brightloop.local` | `Password123!` | Full operations, catalog & billing management |
| **Staff (Member)** | `member@brightloop.local` | `Password123!` | Customer service, quotes, subscriptions (`costPrice` masked) |
| **Customer** | `alex@acmecorp.com` | `Customer123!` | Self-service portal (own invoices & subscriptions only) |

---

## 13. Environment Variables Reference

| Variable | Required | Default in Local | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `test`, `production`) |
| `PORT` | Yes | `4000` | Backend API HTTP server port |
| `DATABASE_URL` | Yes | `postgresql://brightloop:brightloop_secret@localhost:5432/brightloop?schema=public` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | `brightloop-super-secret-jwt-key...` | Cryptographic secret for signing access tokens |
| `JWT_REFRESH_SECRET`| Yes | `brightloop-super-secret-refresh-key...`| Secret for refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Lifetime of short-lived JWT token |
| `JWT_REFRESH_EXPIRES_IN`| No | `7d` | Lifetime of persistent refresh token |
| `CORS_ORIGIN` | Yes | `http://localhost:5173` | Allowed frontend origin for strict CORS |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL for session store |
| `APP_URL` | Yes | `http://localhost:5173` | Frontend application base URL |
| `API_URL` | Yes | `http://localhost:4000` | Backend application base URL |
| `VITE_API_URL` | No | `/api/v1` | Frontend API client base URL |

---

## 14. Testing & Verification Suite

All tests across frontend and backend are automated and validated through Vitest and Jest:

```bash
# Run all monorepo test suites concurrently
pnpm test

# Run frontend tests only (Web application)
pnpm --filter @brightloop/web test

# Run backend tests only (API services & RBAC guards)
pnpm --filter @brightloop/api test

# Run strict TypeScript typecheck across monorepo
pnpm typecheck

# Run production build verification
pnpm build
```

### Genuine Test Results Verification:
- **Web Frontend**: `34 passed (34)` across navigation, forms, domain workflows, auth, and routing guards.
- **Backend API**: `32 passed (32)` across authorization guards, multi-tenancy filters, and contract schemas.
- **Total Monorepo**: **66 tests passed (0 failures, 0 skipped)**.

---

## 15. Deployment Guide

### Frontend Deployment (Vercel)
The web client is configured for Vercel deployment with zero-configuration SPA rewrites (`vercel.json`):
1. Import repository into Vercel.
2. Root Directory: `apps/web`.
3. Framework Preset: `Vite`.
4. Build Command: `pnpm run build`.
5. Output Directory: `dist`.
6. Configure `VITE_API_URL` to point to production backend.

### Backend Deployment (Docker / Railway / Render)
```dockerfile
# Multi-stage production Docker build
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm turbo
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@brightloop/api...

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
```

---

## 16. Repository Structure

```
brightloop/
├── apps/
│   ├── web/                           # React 19 + Vite Frontend SPA (NO Next.js)
│   │   ├── src/
│   │   │   ├── components/            # UI primitives, layout shell, feedback, dialogs
│   │   │   │   ├── auth/              # AuthLayout, BrandingPanel, AuthErrorMessage
│   │   │   │   ├── common/            # ErrorBoundary, FieldError, ConfirmDialog, OfflineBanner
│   │   │   │   ├── feedback/          # EmptyState, ErrorState, MetricCard
│   │   │   │   ├── layout/            # Header, Sidebar, AppShell, ThemeSwitcher
│   │   │   │   └── ui/                # Radix UI primitives (Button, Dialog, DropdownMenu)
│   │   │   ├── pages/
│   │   │   │   ├── auth/              # Login, Signup, Forgot/Reset Password, 403
│   │   │   │   ├── dashboard/         # Executive KPIs, MRR/ARR Charts, Quick Actions
│   │   │   │   ├── landing/           # Public SaaS marketing landing page
│   │   │   │   ├── products/          # Product catalog & pricing tier list/detail
│   │   │   │   ├── quotations/        # Quotation builder & subscription conversion
│   │   │   │   ├── subscriptions/     # Subscription contract list, detail & lifecycle
│   │   │   │   ├── invoices/          # Automated invoice list & payment settlement
│   │   │   │   ├── customers/         # Customer ledger & contact directory
│   │   │   │   ├── preferences/       # Appearance, ThemeSwitcher & Density controls
│   │   │   │   └── system/            # 404, 500, Offline, Maintenance
│   │   │   ├── routes/                # ProtectedRoute, RoleGuard & Declarative router
│   │   │   ├── services/              # Axios client with automatic JWT refresh
│   │   │   ├── stores/                # Zustand stores (Auth, Theme, Density)
│   │   │   └── styles/                # globals.css with dual-theme design tokens
│   │   └── vite.config.ts
│   │
│   └── api/                           # NestJS LTS Backend Application
│       ├── prisma/
│       │   ├── schema.prisma          # Comprehensive 20+ model relational schema
│       │   └── seed.ts                # Seeding script with demo accounts & catalogs
│       ├── src/
│       │   ├── common/                # TenantGuard, RolesGuard, HttpExceptionFilter
│       │   ├── config/                # Environment validation & configuration
│       │   ├── database/              # PrismaClient service & lifecycle
│       │   └── modules/               # Auth, Users, Orgs, Quotes, Subscriptions, Invoices
│       └── test/                      # Unit & Multi-tenant integration tests
│
├── packages/
│   ├── contracts/                     # Shared Zod schemas, DTOs & TypeScript interfaces
│   └── config/                        # Shared tsconfig base
│
├── docs/                              # Comprehensive audit reports & architecture docs
│   ├── BRIGHTLOOP_DUAL_THEME_REPORT.md
│   ├── BRIGHTLOOP_ERROR_HANDLING_UX_REPORT.md
│   ├── BRIGHTLOOP_FINAL_QA_REPORT.md
│   └── README_DOCUMENTATION_AUDIT.md
│
├── infra/
│   └── docker/                        # Docker Compose manifests (Postgres 16 & Redis 7)
├── THEME.md                           # Dual-Theme Frost Blue × Midnight Dark specification
├── NAME.md                            # Brand identity & product naming guide
├── turbo.json                         # Turborepo build orchestration
├── pnpm-workspace.yaml                # Monorepo workspace configuration
└── package.json                       # Monorepo root scripts
```

---

## 17. Contributing & License

### Development Workflow
1. Fork and create a feature branch (`git checkout -b feature/quote-pdf-export`).
2. Adhere strictly to the **Linear-inspired design system** documented in `THEME.md`.
3. Verify all tests and typechecks pass (`pnpm typecheck && pnpm test`).
4. Submit a Pull Request with evidence-based verification screenshots.

### License
This project is open-source software licensed under the [MIT License](LICENSE).  
Copyright © 2026 Brightloop. All rights reserved.
