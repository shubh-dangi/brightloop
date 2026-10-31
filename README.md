# Subpulse — Enterprise Subscription Management & Recurring Billing Platform

Subpulse is a modern, enterprise-grade subscription lifecycle and recurring billing management platform engineered for SaaS businesses.

Built on **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **NestJS LTS**, **Prisma ORM**, and **PostgreSQL**, Subpulse provides an end-to-end commercial operating system spanning product catalogs, variant pricing, quotes, subscriptions, automated invoicing, tax computation, discounts, and revenue analytics (MRR, ARR, and cash realization).

---

## ⚡ Technology Stack

### Frontend (`apps/web`)
- **React 19 & Vite** (Strictly NO Next.js)
- **TypeScript Strict Mode**
- **Tailwind CSS v4** with centralized design tokens & CSS variables
- **Radix UI Primitives & shadcn/ui patterns**
- **Lucide React** enterprise icon set
- **Zustand** client state management (Auth, Tenant Context, Theme, Density)
- **TanStack Query** server state management & caching
- **React Hook Form & Zod** declarative form validation
- **TanStack Table** for sortable, paginated enterprise data presentation
- **Recharts** responsive analytics & growth charts
- **cmdk** command palette shortcut (`Ctrl + K`)
- **Sonner** rich toast notifications

### Backend (`apps/api`)
- **NestJS LTS** with modular Domain-Driven Design
- **REST Architecture** with versioning prefix (`/api/v1`)
- **Swagger / OpenAPI** documentation (`/api/docs`)
- **Prisma ORM** with PostgreSQL provider
- **Argon2id** cryptographic password hashing
- **Passport JWT** access tokens & refresh token rotation
- **Multi-Tenant Authorization (`TenantGuard`)** deriving active workspace from memberships
- **Role-Based Access Control (`RolesGuard` & `PermissionsGuard`)**
- **Helmet, CORS, Throttler rate-limiting**
- **Realtime Gateway** (Socket.IO integration module)
- **AWS S3 Presigned URL** file storage architecture
- **Resend** transactional email architecture
- **Standardized API Envelope** & Global Exception Filter

### Infrastructure & Monorepo
- **Turborepo** build orchestration
- **pnpm Workspaces** package management
- **Docker Compose** manifests for PostgreSQL 16 and Redis 7
- **GitHub Actions** CI pipeline

---

## 📂 Project Structure

```
Subpulse/
├── apps/
│   ├── web/                     # React 19 + Vite Frontend Application
│   │   ├── src/
│   │   │   ├── components/      # UI primitives, layout shell, feedback, dialogs
│   │   │   ├── hooks/           # Reusable React hooks
│   │   │   ├── lib/             # Utility helpers
│   │   │   ├── pages/
│   │   │   │   ├── auth/        # Login, Signup, Forgot/Reset Password, Verify, 403
│   │   │   │   ├── dashboard/   # Dashboard with KPIs, Charts & Quick Actions
│   │   │   │   ├── notifications/# Notifications with Read/Unread filters
│   │   │   │   ├── activity/    # Activity audit timeline
│   │   │   │   ├── profile/     # User profile & Password change
│   │   │   │   ├── preferences/ # Themes, density, regional settings
│   │   │   │   ├── settings/    # General, Team members, Roles & Permissions
│   │   │   │   ├── management/  # Generic CRUD list, detail, create, edit, delete
│   │   │   │   └── system/      # 404, 500, Offline, Maintenance
│   │   │   ├── routes/          # Declarative React Router setup with guards
│   │   │   ├── services/        # Axios API client with token refresh interceptors
│   │   │   └── stores/          # Zustand auth and theme state stores
│   │   └── vite.config.ts
│   │
│   └── api/                     # NestJS Backend Application
│       ├── prisma/              # Prisma schema & seed script
│       ├── src/
│       │   ├── common/          # Guards, Filters, Interceptors, Decorators
│       │   ├── config/          # Environment configuration
│       │   ├── database/        # Prisma service & module
│       │   └── modules/         # Auth, Users, Orgs, Roles, Records, Notifications, etc.
│       └── test/                # Unit & Multi-tenant integration tests
│
├── packages/
│   ├── contracts/               # Shared DTOs, Zod schemas, enums, API types
│   └── config/                  # Shared tsconfig base
│
├── infra/
│   └── docker/                  # Docker Compose manifests
├── docs/                        # Architecture, Database, API, Setup documentation
├── NAME.md                      # Product Name & Brand Identity Specification
├── THEME.md                     # Complete Enterprise UI/UX Design System Specification
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have **Node.js LTS** (v20+ or v22+) and **pnpm** installed:
```bash
node -v
pnpm -v
```

### 2. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```

### 3. Install Dependencies & Build
Install all workspace dependencies:
```bash
pnpm install
pnpm db:generate
```

### 4. Database Setup (Docker)
Start the PostgreSQL and Redis containers:
```bash
pnpm docker:up
pnpm db:migrate
pnpm db:seed
```

### 5. Start Development
Launch both frontend and backend concurrently:
```bash
pnpm dev
```
- **Web App**: `http://localhost:5173`
- **REST API**: `http://localhost:4000/api/v1`
- **Swagger Docs**: `http://localhost:4000/api/docs`

---

## 👥 Default Demo Credentials

The database seed provides three pre-configured accounts:

| Role | Email | Password |
|---|---|---|
| **Owner** | `owner@subpulse.local` | `Password123!` |
| **Admin** | `admin@subpulse.local` | `Password123!` |
| **Member** | `member@subpulse.local` | `Password123!` |

*(The login screen also features 1-click demo credential filler buttons for rapid testing)*

---

## 🛠️ Root Scripts Reference

| Command | Action |
|---|---|
| `pnpm dev` | Run all applications in watch mode via Turborepo |
| `pnpm dev:web` | Run the React 19 + Vite frontend only |
| `pnpm dev:api` | Run the NestJS backend only |
| `pnpm build` | Run production builds across all packages |
| `pnpm typecheck` | Run TypeScript strict checks across the monorepo |
| `pnpm test` | Run all Vitest suites across backend and frontend |
| `pnpm db:generate` | Generate Prisma client bindings |
| `pnpm db:migrate` | Apply Prisma schema migrations |
| `pnpm db:seed` | Seed initial database state & demo records |
| `pnpm docker:up` | Start PostgreSQL & Redis via Docker Compose |
| `pnpm docker:down` | Stop Docker Compose containers |

---

## 📄 License
MIT License.
