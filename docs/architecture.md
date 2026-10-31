# Architecture Overview - Brightloop SaaS Starter Kit

Brightloop is an enterprise-grade, multi-tenant SaaS Starter Kit designed to serve as a reusable, scalable, production-oriented foundation for modern B2B/B2C SaaS products.

---

## 1. Monorepo Organization

The project is structured as a Turborepo-managed monorepo with `pnpm` workspaces:

```
Brightloop/
├── apps/
│   ├── web/          # React 19 + Vite + TypeScript + Tailwind v4 + Radix UI
│   └── api/          # NestJS LTS + TypeScript + Prisma + PostgreSQL
├── packages/
│   ├── contracts/    # Shared DTOs, schemas, enums, API request/response types
│   └── config/       # Shared TypeScript compiler options and tooling configurations
├── infra/
│   ├── docker/       # Docker Compose manifests for PostgreSQL
│   └── ci/           # GitHub Actions CI workflow
├── docs/             # Comprehensive documentation
├── .github/          # CI/CD workflows
├── turbo.json        # Turborepo task graph
└── pnpm-workspace.yaml
```

---

## 2. Frontend Architecture (`apps/web`)

### Core Stack
- **Framework & Runtime**: React 19 with Vite (Strictly NO Next.js)
- **Routing**: React Router v7 with declarative route guards and hierarchical layouts
- **Design System**: Tailwind CSS v4, shadcn/ui patterns, Radix UI primitives, Lucide React icons
- **State Management**:
  - `Zustand` for client state (authentication, tenant context, theme mode, density)
  - `TanStack Query` for server state caching and synchronization
- **Forms & Validation**: React Hook Form coupled with Zod schema resolution
- **Data Presentation**: TanStack Table for sortable, paginated tables; Recharts for responsive analytics

### AppShell Layout
The application features a responsive AppShell consisting of:
- **Collapsible Sidebar**: Grouped navigation with role-aware visibility and icon tooltips
- **Global Header**: Breadcrumb trail, global keyboard shortcut search (`Ctrl + K`), notification popovers, theme toggles, and user profile management
- **Command Palette (`cmdk`)**: Quick keyboard navigation across all application views
- **Mobile Drawer**: Responsive off-canvas navigation for tablet and mobile viewports

---

## 3. Backend Architecture (`apps/api`)

### Core Stack
- **Framework**: NestJS LTS on Node.js LTS
- **Language**: TypeScript with strict mode
- **Architecture**: Modular Domain-Driven Design (Controllers, Services, DTOs, Guards, Interceptors)
- **Database Layer**: Prisma ORM with PostgreSQL provider
- **Security**: Argon2id password hashing, Passport JWT, Refresh token rotation, Helmet, CORS, Throttler rate-limiting
- **Documentation**: Auto-generated Swagger / OpenAPI at `/api/docs`

### Request & Response Lifecycle
Every API request travels through a standardized pipeline:
1. **Helmet Middleware**: Enforces secure HTTP response headers
2. **Global Prefix**: Mounts all REST endpoints under `/api/v1`
3. **Global ValidationPipe**: Whitelists and automatically transforms incoming payloads against class-validator DTOs
4. **JwtAuthGuard**: Validates Authorization Bearer tokens or HttpOnly cookies (bypasses `@Public()` routes)
5. **TenantGuard**: Validates and derives the active organization context from authorized user memberships
6. **RolesGuard & PermissionsGuard**: Enforces RBAC permissions before executing controller handlers
7. **TransformInterceptor**: Wraps successful responses in a standard API envelope:
   ```json
   {
     "success": true,
     "message": "Operation completed successfully",
     "data": { ... },
     "meta": { "timestamp": "...", "pagination": { ... } }
   }
   ```
8. **HttpExceptionFilter**: Catches all errors, sanitizes internal traces, and returns consistent error structures.

---

## 4. Multi-Tenancy Architecture

Multi-tenancy is enforced at the database and application levels:
- Every tenant-owned record is scoped to its `organizationId`.
- The active organization context is **never** accepted blindly from client input.
- `TenantGuard` verifies that the authenticated user possesses an `ACTIVE` membership in the requested organization.
- Queries, mutations, and bulk operations in `RecordsService` strictly append `organizationId: currentTenant.id` to database operations.
- Dedicated automated integration tests (`test/multi-tenant-isolation.spec.ts`) verify that users from Tenant A cannot read, update, or delete Tenant B's data.

---

## 5. Role-Based Access Control (RBAC)

Default system roles:
- **OWNER**: Full administrative and deletion rights across the workspace
- **ADMIN**: Manages workspace members, settings, and records
- **MEMBER**: Full CRUD over workspace records and collaboration tools
- **VIEWER**: Read-only access across workspace records

Custom roles can be created through the Roles & Permissions interface with granular privilege toggles across Organization, Members, Roles, Records, Settings, and Audit modules.
