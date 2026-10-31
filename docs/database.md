# Database Schema & Multi-Tenant Design - UNKNOWN

The UNKNOWN Starter Kit uses PostgreSQL with Prisma ORM.

---

## 1. Entity Relationship Overview

```
User (1) ────────< OrganizationMember >──────── (1) Organization
  │                       │                              │
  ├─ UserPreference (1)   └─ Role (1)                    ├─ OrganizationSetting (1)
  ├─ RefreshToken (*)          │                         ├─ GenericRecord (*)
  └─ ActivityLog (*)           └─ RolePermission (*)     ├─ Notification (*)
                                     │                   └─ ActivityLog (*)
                               Permission (1)
```

---

## 2. Core Models

### `User`
Stores user identity, credentials, and verification state.
- `id`: UUID Primary Key
- `email`: Unique email address (lowercased)
- `passwordHash`: Argon2id hashed string
- `name`: Display name
- `avatarUrl`: Optional avatar image URL
- `isEmailVerified`: Boolean flag

### `Organization`
The tenant boundary. All workspace records and members belong to an organization.
- `id`: UUID Primary Key
- `name`: Workspace name
- `slug`: Unique human-readable URL slug

### `OrganizationMember`
Maps users to organizations with assigned roles.
- `id`: UUID Primary Key
- `organizationId`: Foreign key to `Organization`
- `userId`: Foreign key to `User`
- `roleId`: Foreign key to `Role`
- `status`: Enum (`ACTIVE`, `INVITED`, `SUSPENDED`)
- Composite unique index on `[organizationId, userId]`

### `Role` & `Permission`
Fine-grained RBAC implementation.
- `Role`: System template roles (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`) or custom tenant-scoped roles.
- `Permission`: Distinct keys such as `records:create`, `members:invite`, `settings:update`.
- `RolePermission`: Many-to-many join table between roles and permissions.

### `GenericRecord`
Neutral multi-tenant SaaS items illustrating complete CRUD capabilities.
- `id`: UUID Primary Key
- `organizationId`: Scoped tenant key with index
- `title`: Item name
- `description`: Optional text
- `status`: Enum (`ACTIVE`, `DRAFT`, `ARCHIVED`)
- `priority`: Enum (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `category`: Classification tag
- `tags`: String array of tags
- `metadata`: Flexible JSON document
- `createdById`: Foreign key to `User`

### `Notification`
System alerts, security notifications, and status announcements.
- `type`: Enum (`INFO`, `SUCCESS`, `WARNING`, `SECURITY`, `SYSTEM`)
- `isRead`: Read state flag
- `link`: Optional target URL

### `ActivityLog`
Immutable audit log recording user and system actions.
- `action`: Event key (e.g., `record:created`, `member:invited`)
- `entity`: Target model name
- `entityId`: Optional entity UUID
- `details`: JSON payload of audit metadata

---

## 3. Database Indexes

- `generic_records([organizationId, status])`
- `generic_records([organizationId, category])`
- `generic_records([organizationId, createdAt])`
- `notifications([organizationId, userId, isRead])`
- `activity_logs([organizationId, createdAt])`
- `organization_members([userId])`
- `organization_members([organizationId])`

---

## 4. Migrations & Seeding

Commands:
- `pnpm db:generate`: Regenerate Prisma Client
- `pnpm db:migrate`: Push schema changes to database
- `pnpm db:seed`: Seed permissions, default roles, demo workspace, users, records, notifications, and logs.
