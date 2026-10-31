# Brightloop — Enterprise Security Architecture & Security Policy

## 1. Security Overview

Brightloop is designed with **Security by Design** and **Defense in Depth** principles. As a multi-tenant Subscription Management and Billing platform handling sensitive customer financial records, recurring subscriptions, and payment data, Brightloop implements strict cryptographic controls, granular RBAC, multi-tenant database isolation, and OWASP Top 10 mitigations.

---

## 2. Threat Modeling & Trust Boundaries

```
[ Public Internet ]
        │
   TLS 1.3 / HTTPS
        ▼
[ Reverse Proxy / Cloudflare / Vercel Edge ]
  - DDoS Mitigation & WAF
  - Strict-Transport-Security (HSTS: 1 Year + Preload)
        │
        ▼
[ NestJS API Gateway ]
  - Helmet Security Headers (CSP, Referrer-Policy, Anti-MIME-Sniffing)
  - Global Rate Limiting (ThrottlerGuard: 100 req/min global, 5 req/min auth)
  - Strict Whitelisted CORS (Zero wildcards with credentials)
  - Global ValidationPipe (whitelist: true, forbidNonWhitelisted: true)
        │
  Authentication & Tenant Context Guards
  - JwtAuthGuard (Argon2id / RS256 / HS256 verification)
  - TenantGuard (Multi-tenant org isolation via x-organization-id)
  - RolesGuard (OWNER > ADMIN > MEMBER/Staff > VIEWER > CUSTOMER)
  - PermissionsGuard (Granular permission evaluation)
        │
        ▼
[ Domain Services & Business Logic Layer ]
  - Customer IDOR Prevention (Automatic user-email to customerId constraint)
  - Sensitive Data Masking (Cost price masked to null for Staff/Viewer/Customer)
  - Financial Concurrency Control (Prisma transactions with row lock verification)
        │
        ▼
[ PostgreSQL Database (Multi-Tenant Relational Storage) ]
  - Mandatory TLS Connection (`sslmode=require`)
  - Compound Foreign Keys & Cascading Deletes
  - Activity Audit Ledger (Immutable audit logs for compliance)
```

---

## 3. Authentication & Credential Architecture

### Argon2id Password Hashing
Brightloop exclusively utilizes **Argon2id** (the winner of the Password Hashing Competition) to resist GPU/ASIC brute-force attacks:
- **Algorithm**: `argon2.argon2id`
- **Memory Cost**: 65,536 KiB (64 MB)
- **Time Cost**: 3 iterations
- **Parallelism**: 1 thread

### Refresh Token Rotation & Reuse Detection
- Refresh tokens are stored strictly as **SHA-256 cryptographic hashes** in the database (`tokenHash`).
- Delivered via secure, `httpOnly: true`, `sameSite: 'lax'`, `secure: true` cookies on the `/api/v1/auth/refresh` path.
- Upon token refresh, the existing token is atomically invalidated and a new pair is issued.
- **Replay/Reuse Detection**: If a previously revoked refresh token is presented, the system triggers security alert protocols and **revokes all active sessions** for that user account immediately.

### Password Reset Token Protection
- Tokens are generated using high-entropy CSPRNG: `crypto.randomBytes(32).toString('hex')`.
- Reset tokens are **hashed with SHA-256 before storage** in the database.
- Tokens expire within 1 hour and are single-use.
- Plaintext reset tokens are **never** logged to server stdout or monitoring streams.

---

## 4. Role-Based Access Control (RBAC) & Portal Isolation

Brightloop enforces 5 distinct system roles across organizations:

| Role | Scope & Permissions | Cost Price Visibility | Financial Reports |
| :--- | :--- | :---: | :---: |
| **OWNER** | Full tenant administration, billing governance, member removal | Allowed | Allowed |
| **ADMIN** | Member management, plan creation, invoices, discounts | Allowed | Allowed |
| **MEMBER (Staff)** | Operational quoting, subscription lifecycle, payment recording | **Masked (null)** | Blocked |
| **VIEWER** | Read-only workspace inspection | **Masked (null)** | Blocked |
| **CUSTOMER** | Self-service Customer Portal (own subscriptions/invoices only) | **Masked (null)** | Blocked |

### Cost Price Masking
To protect company margins and proprietary cost structures:
- In `ProductsService.findAll` and `ProductsService.findOne`, `costPrice` is dynamically stripped (`null`) unless the caller possesses `ADMIN` or `OWNER` privileges.
- Internal sales and support staff (MEMBER/VIEWER) can view catalog items, sales prices, and variants, but cannot inspect backend procurement costs.

### Customer Portal Isolation (IDOR Protection)
- When a caller is authenticated under the `CUSTOMER` role, all domain services (`SubscriptionsService`, `InvoicesService`, `QuotationsService`, `PaymentsService`, `CustomersService`) automatically resolve the caller's email and enforce an atomic SQL filter:
  `where: { customerId: currentCustomer.id }`
- Any attempt to query another customer's ID returns a 404 `NotFoundException`, preventing cross-customer enumeration and Insecure Direct Object References (IDOR).

---

## 5. Financial Data & Concurrency Integrity

1. **Transactional Payment Allocation**:
   All payment recording occurs within `prisma.$transaction`. The invoice record is locked and verified inside the transaction to verify the latest balance before applying payment.
2. **Anti-Overpayment Guard**:
   Payments exceeding the current `outstandingAmount` are rejected with `400 BadRequestException`.
3. **Double-Conversion Protection**:
   Quotation-to-subscription conversion atomically checks that the quotation status is not already `CONFIRMED` and verifies that no existing subscription is linked to the quotation ID.

---

## 6. OWASP Top 10 Mitigation Matrix

| OWASP Vulnerability | Brightloop Mitigation Strategy |
| :--- | :--- |
| **A01: Broken Access Control** | `TenantGuard`, `RolesGuard`, `PermissionsGuard`, and Customer IDOR isolation on all endpoints. |
| **A02: Cryptographic Failures** | Argon2id for passwords; SHA-256 for refresh & reset tokens; TLS 1.3 enforced for DB and Web. |
| **A03: Injection** | Parameterized queries exclusively via Prisma ORM; strict class-validator DTO validation. |
| **A04: Insecure Design** | Anti-overpayment checks, transaction concurrency locks, cost-price masking by design. |
| **A05: Security Misconfiguration** | Helmet security headers; HSTS with 1-year max-age; production error message masking. |
| **A06: Vulnerable Dependencies** | Automated dependency audits via `pnpm audit` and lockfile integrity. |
| **A07: Identification & Auth Failures** | ThrottlerGuard brute-force protection (5 req/min on auth); generic error responses ("Invalid email or password"). |
| **A08: Software & Data Integrity** | Single-use password tokens; refresh token rotation with automated reuse detection. |
| **A09: Logging & Monitoring Failures** | Structured audit logging via `ActivityLog` table; sanitized HTTP interceptors omitting credentials. |
| **A10: Server-Side Request Forgery** | External webhook requests and storage uploads restricted to signed URLs and approved domains. |

---

## 7. Incident Response & Vulnerability Disclosure

To report a suspected security vulnerability in Brightloop:
1. Email: `security@brightloop.local`
2. PGP Key: Available upon request.
3. Please allow 48 hours for an acknowledgment before disclosure.
4. Security advisories will be published alongside patched releases.
