# Apartment Management Platform: Security Architecture & Hardening

**Compliance**: OWASP Top 10 API Security Baseline  
**Audience**: Security Engineers, Platform Architects, and Compliance Officers

---

## 1. Authentication & Session Management

- **Password Storage**: Passwords are never stored in plaintext. They are hashed using `bcrypt` with cost factor 10.
- **Signed Tokens**: Sessions use JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`).
- **Token Claims**: Contains `userId`, `email`, and `role`. Password hashes and sensitive internal metadata are strictly excluded.
- **Mobile Hardware Storage**: On mobile, JWT tokens are stored using `expo-secure-store`, backed by Android Keystore (AES-256) and iOS Keychain Services.
- **Constant-Time Rejection & Anti-Enumeration**: Both invalid email and invalid password queries return a unified HTTP 401 error (`"Invalid email or password"`) to prevent account enumeration.

---

## 2. Server-Side Role-Based Access Control (RBAC)

Authorization is strictly enforced on the server within `apps/api/src/middleware/auth.middleware.ts`:

```typescript
export function requireRole(...allowedRoles: ProvisionalUserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(`Access forbidden: Role '${req.user?.role}' is not authorized to access this resource.`));
    }
    next();
  };
}
```

### Hierarchy & Role Isolation:
- `SUPER_ADMIN`: Full administrative control across all properties, units, finances, documents, and audit logs.
- `RESIDENT_OWNER`: Access to personal unit, household, vehicles, gate passes, maintenance, amenities, and owner-only statutory documents (`OWNERS_ONLY`). Prohibited from Super Admin APIs (HTTP 403 Forbidden).
- `RESIDENT_TENANT`: Access to personal tenancy, household, vehicles, gate passes, maintenance, amenities, and public documents (`ALL_RESIDENTS`). Strictly shielded from `OWNERS_ONLY` and `ADMIN_ONLY` documents, and prohibited from Super Admin APIs (HTTP 403 Forbidden).

---

## 3. Resource Ownership & Insecure Direct Object Reference (IDOR) Defense

Even when authenticated, users cannot access or mutate resources outside their assigned unit:

1. **Household Members**: A resident can only view, add, or delete household members whose `unit_id` matches their own assigned unit. Probing a neighbor's household member returns `HTTP 403 FORBIDDEN`.
2. **Vehicles**: A resident can only delete vehicles registered under their own user/unit ID.
3. **Tenancy & Unit Self-Inspection**: `GET /api/tenant/unit/:unitId` checks that `req.user.id` has an active assignment for `:unitId`. Accessing another unit ID is rejected with `HTTP 403 FORBIDDEN`.
4. **Dues & Invoices**: Personal dues queries automatically filter by the authenticated resident's active `unit_id`.
5. **Amenity Bookings**: Residents can only cancel their own personal reservations.

---

## 4. Input Boundary Validation (Zod)

All HTTP inputs (body, query, route parameters) are validated against strict Zod schemas before hitting business logic.
- **Strict Keys**: Unknown or injected fields (e.g. attempting to pass `role: "SUPER_ADMIN"` or `isElevated: true` during registration) are rejected with `HTTP 400 VALIDATION_ERROR`.
- **Length & Format Bounds**:
  - Email: RFC-compliant email string.
  - Passwords: 8 to 128 characters (mitigating Bcrypt CPU exhaustion Denial-of-Service attacks).
  - IDs & UUIDs: String length capped at 64 characters to prevent query buffer overflows.

---

## 5. Rate Limiting & Brute-Force Defense

An in-memory sliding window rate limiter protects sensitive authentication routes (`/api/auth/login`, `/api/auth/register`):
- **Window**: 5 minutes sliding window.
- **Limits**:
  - **Production (`NODE_ENV=production`)**: 10 attempts per IP address. Exceeding triggers `HTTP 429 Too Many Requests` with a `Retry-After` header.
  - **Development (`NODE_ENV=development`)**: 200 attempts per IP address to facilitate automated regression testing.
- **Memory Management**: Expired IP records are swept every 5 minutes using unreferenced interval timers.

---

## 6. HTTP Defensive Headers & Anti-Fingerprinting

Configured in `apps/api/src/index.ts`:
- **`X-Content-Type-Options: nosniff`**: Prevents MIME-type sniffing attacks.
- **`X-Frame-Options: DENY`**: Mitigates Clickjacking by prohibiting iframe embedding.
- **`X-XSS-Protection: 0`**: Disables buggy legacy browser XSS filters in favor of modern Content-Security policies.
- **`X-Powered-By` Header Removal**: Explicitly disabled (`app.disable("x-powered-by")`) to eliminate backend server fingerprinting.

---

## 7. Cross-Origin Resource Sharing (CORS) Policy

CORS origins are strictly whitelisted via `process.env.CORS_ORIGINS`:
- Permitted local origins: `http://localhost:3000` (Admin Web) and `http://localhost:8081` (Mobile Expo Web).
- Any unapproved cross-origin request is rejected by the server before processing.

---

## 8. File Upload & Magic-Byte Signature Verification

Maintenance ticket photo attachments (`/api/maintenance/:id/attachments`) enforce strict security checks:
1. **Size Limit**: Capped at 5 MB per file.
2. **Filename & Path Traversal Defense**: Original filenames are stripped and sanitized to prevent directory traversal attacks (`../../`).
3. **Magic-Byte Inspection**: Rather than relying on easily-spoofed file extensions or client-sent MIME headers, the API inspects the binary header bytes of the buffer:
   - **PNG**: First 4 bytes must be `89 50 4E 47` (`.PNG`).
   - **JPEG**: First 3 bytes must be `FF D8 FF`.
   - **PDF**: First 4 bytes must be `25 50 44 46` (`%PDF`).
   - Shell scripts, executable binaries, and mismatched signatures are rejected with `HTTP 400 BAD_REQUEST`.

---

## 9. Sensitive Data Redaction & Audit Logging

- **Zero Hash Leakage**: Password hashes and secret keys are never included in API responses or serialized user profiles.
- **Audit Trail**: High-privilege administrative actions (property updates, status changes, notice broadcasts) are permanently recorded in `audit_logs` capturing actor ID, action type, IP address, user agent, and timestamp.
