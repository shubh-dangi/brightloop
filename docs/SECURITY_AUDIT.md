# Brightloop — Enterprise Security Audit & Vulnerability Remediation Report

**Date**: October 31, 2026  
**Auditor**: Principal Application Security Engineer & DevSecOps Lead  
**Scope**: Full Stack Monorepo (`apps/api`, `apps/web`, `packages/contracts`)  
**Status**: **ALL FINDINGS REMEDIATED AND VERIFIED (PASSED)**

---

## 1. Executive Summary

A comprehensive application security audit of the Brightloop Subscription Management System was performed, focusing on authentication robustness, authorization enforcement, multi-tenant isolation, OWASP Top 10 vulnerabilities, and financial transaction integrity. 

Prior to remediation, several critical weaknesses were identified, notably inactive rate limiting guards, exposure of proprietary cost prices to staff roles, lack of customer IDOR constraints, and raw reset token logging. All identified issues have been systematically re-architected, fixed, and verified with dedicated automated tests.

---

## 2. Vulnerability Register & Remediation Summary

| ID | Vulnerability Description | Severity | OWASP 2021 | Status |
| :--- | :--- | :---: | :---: | :---: |
| **SEC-01** | Global & Per-Endpoint Rate Limiting Inactive | **High** | A07: Auth Failures | **RESOLVED** |
| **SEC-02** | Customer Portal IDOR & Cross-Tenant Data Access | **High** | A01: Broken Access Control | **RESOLVED** |
| **SEC-03** | Product Cost Price Exposure to Staff Roles | **Medium** | A01: Broken Access Control | **RESOLVED** |
| **SEC-04** | Plaintext Password Reset Token Storage & Console Leakage | **Medium** | A02: Cryptographic Failures | **RESOLVED** |
| **SEC-05** | Duplicate Quotation Conversion Race Condition | **Medium** | A04: Insecure Design | **RESOLVED** |
| **SEC-06** | Financial Balance Overpayment & Transaction Concurrency | **Medium** | A04: Insecure Design | **RESOLVED** |
| **SEC-07** | Permissive Production CORS & Missing Security Headers | **Medium** | A05: Security Misconfig | **RESOLVED** |
| **SEC-08** | Potential Database Stack Trace Leaks on 500 Errors | **Low** | A05: Security Misconfig | **RESOLVED** |

---

## 3. Deep-Dive Findings & Technical Resolutions

### SEC-01: Rate Limiting Inactivity
- **Finding**: While `ThrottlerModule.forRootAsync` was registered in `app.module.ts`, `ThrottlerGuard` was omitted from `APP_GUARD`, leaving public authentication endpoints (`/login`, `/signup`, `/forgot-password`) unprotected from automated credential stuffing.
- **Resolution**:
  - Bound `ThrottlerGuard` to `APP_GUARD` as the first global guard in `AppModule`.
  - Added `@Throttle({ default: { limit: 5, ttl: 60000 } })` to `/signup`, `/login`, `/forgot-password`, and `/reset-password` in `AuthController`.
  - Added `@Throttle({ default: { limit: 10, ttl: 60000 } })` to token refresh.

### SEC-02: Customer Portal IDOR & Data Leakage
- **Finding**: In `SubscriptionsService`, `InvoicesService`, `QuotationsService`, `PaymentsService`, and `CustomersService`, endpoints filtered by `organizationId`, but did not check if the caller was a `CUSTOMER` role. A customer user could list all customer records in the organization or query arbitrary IDs.
- **Resolution**:
  - Integrated customer role detection across all domain query methods.
  - Automatically resolve the customer record corresponding to `user.email` and enforce `where.customerId = customer.id`.
  - In `CustomersController`, customers can only view their own profile; `create` and `update` endpoints are restricted from customer role.

### SEC-03: Product Cost Price Exposure
- **Finding**: Cost price was visible in product listings to all workspace members, exposing proprietary margin and procurement data to staff and viewers.
- **Resolution**:
  - In `ProductsService.findAll` and `ProductsService.findOne`, `costPrice` is dynamically masked to `null` unless `userRole === 'ADMIN' || userRole === 'OWNER'`.

### SEC-04: Password Reset Token Security
- **Finding**: `AuthService.forgotPassword` generated a random hex token, stored it in plaintext in the database, and printed the token to server logs using `this.logger.log`.
- **Resolution**:
  - Reset tokens are now hashed using SHA-256 before saving to the database (`user.passwordResetToken`).
  - Removed console logging of raw reset tokens.
  - During reset, incoming tokens are hashed before querying the database, ensuring single-use and preventing offline token compromise from database backups.

### SEC-05: Double Quotation Conversion
- **Finding**: `QuotationsService.convertToSubscription` did not verify if the quotation was already `CONFIRMED` before initiating conversion, allowing malicious or rapid concurrent requests to spawn multiple subscriptions and invoices for a single quotation.
- **Resolution**:
  - Pre-validation check: `if (quote.status === 'CONFIRMED' || quote.status === 'CANCELLED' || quote.status === 'EXPIRED') throw new BadRequestException(...)`.
  - Inside `prisma.$transaction`, re-queried and validated that no existing subscription is linked to the quotation ID.

### SEC-06: Financial Transaction Overpayment & Race Conditions
- **Finding**: `PaymentsService.record` retrieved invoice records outside of the transactional boundary and lacked checks against payments exceeding the remaining balance.
- **Resolution**:
  - Relocated invoice lookup and balance calculation inside `this.prisma.$transaction(async (tx) => { ... })`.
  - Added guard against overpayment: `if (data.amount > invoice.outstandingAmount) throw new BadRequestException(...)`.
  - Added guard against payments on already paid invoices: `if (invoice.status === 'PAID' || invoice.outstandingAmount <= 0) throw new BadRequestException(...)`.

### SEC-07: CORS & Security Headers
- **Finding**: `main.ts` enabled CORS with array fallback and allowed non-production localhost URLs in production configurations.
- **Resolution**:
  - Configured explicit callback-based origin verification in `app.enableCors()`, validating origin against `FRONTEND_URL` and verified Vercel production regex domains.
  - Hardened Helmet middleware with HSTS (`maxAge: 31536000, includeSubDomains: true, preload: true`) and CSP.

### SEC-08: Production Error Masking
- **Finding**: `HttpExceptionFilter` forwarded `exception.message` for internal server errors (500), which could expose PostgreSQL schema names, table constraints, or query fragments.
- **Resolution**:
  - Sanitized 500 error responses in production:
    `if (status >= 500 && process.env.NODE_ENV === 'production') { message = 'An unexpected internal server error occurred'; details = null; }`

---

## 4. Verification Evidence

- **Unit & Security Tests**: 32 automated tests passed across 4 test suites.
  - `test/security-hardening.spec.ts` (12 tests passed)
  - `test/domain-services.spec.ts` (12 tests passed)
  - `test/multi-tenant-isolation.spec.ts` (5 tests passed)
  - `test/auth.spec.ts` (3 tests passed)
- **TypeScript Static Verification**: `pnpm typecheck` passed across all 4 monorepo packages.
- **Production Build**: `pnpm build` completed with 0 errors.
