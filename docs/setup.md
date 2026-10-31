# Setup & Installation Guide - Brightloop

This guide walks you through setting up and running the Brightloop SaaS Starter Kit on your development environment.

---

## 1. Prerequisites

- **Node.js**: v20+ or v22+ LTS (`node -v`)
- **Package Manager**: pnpm v9+ or v12+ (`pnpm -v`)
- **Git**: Installed and available in PATH
- **Docker & Docker Compose** (Optional for local PostgreSQL)

---

## 2. Initial Setup

1. **Clone or locate the repository:**
   ```bash
   cd %USERPROFILE%\Desktop\Brightloop
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Generate Prisma client:**
   ```bash
   pnpm db:generate
   ```

---

## 3. Database & Infrastructure

### Option A: Using Docker Compose
Start PostgreSQL with healthchecks:
```bash
docker compose up -d
```

Apply migrations and seed initial data:
```bash
pnpm db:migrate
pnpm db:seed
```

### Option B: Using an Existing PostgreSQL Instance
Update `DATABASE_URL` in your `.env`:
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/brightloop_db?schema=public
```
Then run:
```bash
pnpm db:migrate
pnpm db:seed
```

---

## 4. Running the Applications

### Run full monorepo concurrently
```bash
pnpm dev
```

### Run frontend only
```bash
pnpm dev:web
# Available at http://localhost:5173
```

### Run backend only
```bash
pnpm dev:api
# API available at http://localhost:4000/api/v1
# Swagger docs at http://localhost:4000/api/docs
```

---

## 5. Default Demo Credentials

The database seed provides three pre-configured accounts:

| Role | Email | Password |
|---|---|---|
| **Owner** | `owner@brightloop.local` | `Password123!` |
| **Admin** | `admin@brightloop.local` | `Password123!` |
| **Member** | `member@brightloop.local` | `Password123!` |

*(The login screen also includes convenient one-click credential filler buttons for rapid testing)*

---

## 6. Testing & Quality Verification

Run all test suites across the monorepo:
```bash
pnpm test
```

Run TypeScript compiler check across all packages:
```bash
pnpm typecheck
```

Run production builds:
```bash
pnpm build
```
