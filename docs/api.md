# REST API Specification - UNKNOWN

The UNKNOWN backend provides a versioned REST API mounted under `/api/v1`.

Interactive OpenAPI / Swagger documentation is available at:
`http://localhost:4000/api/docs`

---

## 1. Standard Response Envelope

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-31T08:30:00.000Z",
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "error": {
    "statusCode": 400,
    "error": "Bad Request",
    "details": ["title must be at least 2 characters"]
  },
  "meta": {
    "timestamp": "2026-10-31T08:30:00.000Z",
    "path": "/api/v1/records"
  }
}
```

---

## 2. Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | Register user and initialize organization | No |
| POST | `/api/v1/auth/login` | Login with email and password | No |
| POST | `/api/v1/auth/refresh` | Refresh access token using rotated token | No (Cookie / Body) |
| POST | `/api/v1/auth/logout` | Revoke session and refresh tokens | Yes |
| POST | `/api/v1/auth/forgot-password` | Request password reset token link | No |
| POST | `/api/v1/auth/reset-password` | Reset password using verified token | No |
| GET | `/api/v1/auth/verify-email` | Verify account email address | No |
| GET | `/api/v1/auth/me` | Get current user identity & tenant context | Yes |

---

## 3. Generic Records (CRUD) Endpoints

| Method | Endpoint | Description | Permission Required |
|---|---|---|---|
| GET | `/api/v1/records` | List records with pagination, filtering, search | `records:read` |
| GET | `/api/v1/records/:id` | Get single record details | `records:read` |
| POST | `/api/v1/records` | Create new tenant-scoped record | `records:create` |
| PATCH | `/api/v1/records/:id` | Update existing record | `records:update` |
| DELETE | `/api/v1/records/:id` | Delete record | `records:delete` |
| POST | `/api/v1/records/bulk-delete` | Bulk delete records by IDs | `records:delete` |

---

## 4. Organization & Member Endpoints

| Method | Endpoint | Description | Permission Required |
|---|---|---|---|
| GET | `/api/v1/organizations/current` | Get current organization details | `org:read` |
| PATCH | `/api/v1/organizations/settings` | Update workspace settings | `settings:update` |
| GET | `/api/v1/organizations/members` | List members in organization | `members:read` |
| POST | `/api/v1/organizations/members/invite`| Invite new member | `members:invite` |
| PATCH | `/api/v1/organizations/members/:id/role`| Update member role | `members:update` |
| DELETE | `/api/v1/organizations/members/:id`| Remove member from workspace | `members:remove` |

---

## 5. Roles & Permissions Endpoints

| Method | Endpoint | Description | Permission Required |
|---|---|---|---|
| GET | `/api/v1/roles` | List system and custom roles | `roles:manage` |
| GET | `/api/v1/roles/permissions-matrix`| Get all available permissions | `roles:manage` |
| POST | `/api/v1/roles` | Create custom role | `roles:manage` |
| PATCH | `/api/v1/roles/:id` | Update custom role | `roles:manage` |
| DELETE | `/api/v1/roles/:id` | Delete custom role | `roles:manage` |

---

## 6. Dashboard, Notifications & Audit Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/v1/dashboard/summary` | Aggregated stats, metrics, charts | Yes |
| GET | `/api/v1/notifications` | List user & workspace notifications | Yes |
| PATCH | `/api/v1/notifications/:id/read` | Mark notification as read | Yes |
| POST | `/api/v1/notifications/read-all`| Mark all notifications as read | Yes |
| DELETE | `/api/v1/notifications/:id` | Delete notification | Yes |
| GET | `/api/v1/activity` | List audit activity timeline | `audit:read` |
