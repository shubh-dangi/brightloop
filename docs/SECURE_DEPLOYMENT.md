# Brightloop — Secure Production Deployment & DevSecOps Guide

This guide outlines mandatory pre-flight checklists, operational guidelines, and environment configurations for deploying Brightloop to production environments.

---

## 1. Pre-Deployment Security Checklist

- [ ] **Node Environment**: `NODE_ENV=production` is set across all runtime containers and processes.
- [ ] **Secrets Generation**: All JWT secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) are generated via cryptographically secure random generators (minimum 256 bits):
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- [ ] **Database Connection Security**: PostgreSQL URL includes `?sslmode=require`. Plaintext connections are blocked.
- [ ] **CORS Configuration**: `FRONTEND_URL` is configured to the exact production domain (e.g., `https://brightloop-chi.vercel.app`). No localhost or wildcard origins in production.
- [ ] **Rate Limiting Verification**: `THROTTLE_TTL=60` and `THROTTLE_LIMIT=100` are configured.
- [ ] **Cookies**: Ensure HTTPS is terminated at load balancer/reverse proxy with `X-Forwarded-Proto: https` forwarded so `secure: true` cookies function correctly.
- [ ] **Database Migrations**: Execute `prisma migrate deploy` (never `prisma db push` or `prisma migrate reset` in production).

---

## 2. Docker & Container Hardening

When containerizing the NestJS API:

1. **Non-Root Execution**:
   Run the Node process under an unprivileged user (e.g., `node` user), not `root`.
   ```dockerfile
   USER node
   ```
2. **Minimal Base Image**:
   Use `node:22-alpine` or distroless images to minimize attack surface and OS vulnerabilities.
3. **Read-Only Root Filesystem**:
   Configure container runtime with `--read-only` root filesystem where possible, using tmpfs for `/tmp`.
4. **Dropped Capabilities**:
   Drop all default Linux capabilities except `NET_BIND_SERVICE`.

---

## 3. Database Hardening & Network Isolation

- **VPC Peering / Private Subnet**: Place the PostgreSQL instance in a private subnet inaccessible directly from the public Internet.
- **Connection Pooling**: Use PgBouncer or Supabase / AWS RDS Proxy for connection pooling to prevent connection exhaustion under high traffic.
- **Least Privilege Database User**: The database user used by Prisma should only have permissions on the `brightloop_db` database and `public` schema, without `SUPERUSER` privileges.
- **Automated Backups**: Configure point-in-time recovery (PITR) with daily encrypted snapshots stored in an isolated bucket.

---

## 4. Reverse Proxy & Edge Security (Cloudflare / Vercel / Nginx)

1. **TLS Configuration**: Enforce TLS 1.3 as default, minimum TLS 1.2.
2. **HSTS Enforcement**:
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   ```
3. **Web Application Firewall (WAF)**:
   - Enable Cloudflare Managed Rules for OWASP Core Ruleset.
   - Configure rate limiting rules at the edge for `/api/v1/auth/*` endpoints (e.g., 20 requests per minute per IP).
4. **DDoS Protection**:
   Enable automated bot mitigation and SYN flood protection.

---

## 5. Monitoring, Alerting & Audit Logging

- **Audit Ledger Retention**: Maintain `ActivityLog` table entries for at least 365 days to comply with financial auditing regulations (SOC 2 / ISO 27001).
- **Security Alert Triggers**:
  - Alert on repeated 401/403 bursts from the same IP (possible brute force).
  - Alert on token reuse notifications logged by `AuthService.refreshTokens`.
  - Alert on database connection pool saturation.
- **Error Tracking**: Mask sensitive fields (passwords, tokens, customer PII) before forwarding error reports to Sentry or OpenTelemetry collectors.
