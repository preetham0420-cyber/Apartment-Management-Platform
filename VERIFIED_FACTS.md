# Apartment Management Platform (AMP-DEV-001)
# Verified Facts, Forensic Findings & Audit Baseline

**Document Code:** AMP-DEV-001-FACTS  
**Date of Audit:** October 7, 2026  
**Auditor / Tooling:** Live Network Socket Inspection, Local Code Analysis, Git Forensic History  
**Scope:** `apps/api` (:4000), `apps/admin-web` (:3000), `apps/mobile` (:8081), `packages/shared`, `database`  

---

## 1. Passwords & Authentication Verification

### 1.1 Live Login Verification Matrix (`POST http://localhost:4000/api/auth/login`)

Every account was tested live against the running API with both password candidates:

| Account Email | Assigned Role | Allocated Unit | Tested Password | Live HTTP Status | Outcome / Verification Result |
| :--- | :--- | :--- | :--- | :---: | :--- |
| `admin@community.local` | `SUPER_ADMIN` | Platform Management | `Admin@12345` | **200 OK** | ✅ **SUCCESS** (Valid JWT issued) |
| `admin@community.local` | `SUPER_ADMIN` | Platform Management | `Password123!` | **401 Unauthorized** | ❌ Rejection: "Invalid email or password." |
| `preetham@community.local` | `RESIDENT_TENANT` | Tower A — Flat 402 | `Tenant1@12345` | **200 OK** | ✅ **SUCCESS** (Valid JWT issued) |
| `preetham@community.local` | `RESIDENT_TENANT` | Tower A — Flat 402 | `Password123!` | **401 Unauthorized** | ❌ Rejection: "Invalid email or password." |
| `ananya.sharma@community.local` | `RESIDENT_TENANT` | Tower A — Flat 101 | `Tenant2@12345` | **200 OK** | ✅ **SUCCESS** (Valid JWT issued) |
| `ananya.sharma@community.local` | `RESIDENT_TENANT` | Tower A — Flat 101 | `Password123!` | **401 Unauthorized** | ❌ Rejection: "Invalid email or password." |
| `rahul.verma@community.local` | `RESIDENT_TENANT` | Tower B — Flat 304 | `Tenant3@12345` | **200 OK** | ✅ **SUCCESS** (Valid JWT issued) |
| `rahul.verma@community.local` | `RESIDENT_TENANT` | Tower B — Flat 304 | `Password123!` | **401 Unauthorized** | ❌ Rejection: "Invalid email or password." |
| `vikramaditya@community.local` | `RESIDENT_OWNER` | Tower B — Flat 205 | `Owner@12345` | **200 OK** | ✅ **SUCCESS** (Valid JWT issued) |
| `vikramaditya@community.local` | `RESIDENT_OWNER` | Tower B — Flat 205 | `Password123!` | **401 Unauthorized** | ❌ Rejection: "Invalid email or password." |

### 1.2 Source Authority Analysis
* **Authoritative / Correct Sources:**
  - `database/seeds/001_initial_users_and_properties.sql` (Lines 41–52)
  - `apps/api/src/repositories/user.repository.ts` (Lines 20–70)
  - `scratch/run_internal_pentest_suite.cjs` (Lines 53–67)
  - `scratch/day5_security_audit.cjs` (Lines 44, 63)
  - `scratch/day6_verification_suite.cjs` (Lines 117, 227)
  - `scratch/core_features_audit.cjs` (Lines 81, 88)
  - `README.md` (Section 9)
* **Outdated / Incorrect Source:**
  - `docs/FINAL_DOCUMENTATION_EVIDENCE_SUMMARY.md` previously recorded `Password123!` in Section 3 (lines 109–113) from an early Day 1 placeholder. This has now been updated to match the real bcrypt-hashed passwords.

---

## 2. Secrets Audit & Repository Visibility Recommendation

### 2.1 Working Tree & Git History Secrets Inspection
* **Git Commit History Search:**
  - `git log -p -S "JWT_ACCESS_SECRET"`: Only configuration templates and fallback development strings (`"dev_provisional_jwt_secret_min_32_characters_long_for_security"`) were committed in `apps/api/src/config/jwt.ts`.
  - `git log --all --full-history -- "**/.*env*"`: Confirmed that **only `.env.example` template files** have ever been committed across all branches and commits. Zero production `.env` files exist in git history.
  - Private key pattern search (`BEGIN PRIVATE KEY`, `BEGIN RSA PRIVATE KEY`): **Zero private keys found.**
* **Working Tree File Inspection:**
  - `.env.example` in repository root contains **strictly sanitized placeholders**:
    - `DB_USER=app_user`
    - `DB_PASSWORD=your_secure_password_here`
    - `JWT_ACCESS_SECRET=your_provisional_jwt_access_secret_min_32_chars`
    - `JWT_REFRESH_SECRET=your_provisional_jwt_refresh_secret_min_32_chars`
  - `apps/mobile/.env` exists locally but is strictly excluded by `.gitignore` (`git status --porcelain` is clean). Its contents are limited to local LAN endpoints (`EXPO_PUBLIC_API_URL=http://172.20.10.2:4000/api`).

### 2.2 Public vs. Private Repository Recommendation
* **Recommendation:** **Keep the repository PUBLIC (or convert to PRIVATE based on organizational IP policy, but NOT due to credential exposure).**
* **Technical Justification:**
  1. **No Sensitive Leaks:** A thorough forensic sweep of the working tree and commit tree confirmed zero production credentials, private certificates, cloud API keys, or live customer PII.
  2. **Synthetic Data Hygiene:** All seeded passwords (`Admin@12345`, `Tenant1@12345`, etc.) are explicitly prefixed, non-production test vectors mapped to dummy phone numbers (`+91 98765 43210`) and fictional addresses.
  3. **Showcase Value:** As an academic or portfolio demonstration of full-stack engineering, OWASP security hardening, and monorepo architecture, a public repository demonstrates transparent engineering excellence.
  4. **Production Deployment Caveat:** If this codebase is transitioned to an actual production condominium deployment, production configuration must inject real secrets via environment variables/secrets manager, and demo seed scripts must be omitted.

---

## 3. Active vs. Schema Role Analysis

### 3.1 Roles in Database Schema & Shared Contracts
The database DDL migration (`database/migrations/001_roles_users_properties_units.sql`), seed file (`001_initial_users_and_properties.sql`), and shared TypeScript enum (`packages/shared/src/types/roles.ts`) define **7 roles**:
1. `SUPER_ADMIN`
2. `COMMITTEE_MEMBER`
3. `RESIDENT_OWNER`
4. `RESIDENT_TENANT`
5. `SECURITY_GUARD`
6. `MAINTENANCE_STAFF`
7. `SERVICE_VENDOR`

### 3.2 Actively Implemented & Enforced Roles
In the current project milestone (AMP-DEV-001):
* **Actively Implemented (3 Roles):**
  - `SUPER_ADMIN`: Actively enforced on `/api/admin/*` via `requireRole("SUPER_ADMIN")`. Serviced by Next.js Admin Web Console (`http://localhost:3000`).
  - `RESIDENT_TENANT`: Actively enforced on `/api/tenant/*`, `/api/resident/*`, and `/api/visitors`. Serviced by React Native Mobile App (`http://localhost:8081`).
  - `RESIDENT_OWNER`: Actively enforced with access to confidential `OWNERS_ONLY` documents (AGM minutes, financial audits) on `/api/documents`. Serviced by React Native Mobile App.
* **Defined for Planned/Future Milestones (4 Roles):**
  - `SECURITY_GUARD`, `MAINTENANCE_STAFF`, `COMMITTEE_MEMBER`, `SERVICE_VENDOR` exist in the SQL `roles` lookup table and TypeScript types, but have **zero seed accounts** and **zero dedicated client UIs** in the current milestone.

---

## 4. Rate-Limiting Empirical Verification (RATE-P01)

### 4.1 Rate Limiting Architecture & Configuration
* **Middleware File:** `apps/api/src/middleware/rate-limit.middleware.ts`
* **Sliding Window:** `5 minutes` (`300,000 ms`, auto-pruned via unreferenced 5-minute interval).
* **Threshold (Max Attempts):**
  - Default development mode: `200 attempts`
  - Production mode (`process.env.NODE_ENV === "production"` or request header `x-rate-limit-mode: "production"`): **`10 attempts`**
* **Limiter Keying:** Per IP address and endpoint: `${req.baseUrl}${req.path}:${clientIp}`.
* **Headers Emitted:**
  - `X-RateLimit-Limit: 10`
  - `X-RateLimit-Remaining: [count]` (decrements from 9 down to 0)
  - `Retry-After: [seconds]` (emitted on HTTP 429)

### 4.2 Raw Empirical Test Execution

#### Run 1: Bounded 15-Request Burst from a Fresh / Clean Limiter State
The API was reloaded to clear in-memory state. 15 sequential requests were dispatched to `POST /api/auth/login` with `x-rate-limit-mode: production`:

```text
Req # 1 -> Status: HTTP 401 | Remaining: 9 | Retry-After: N/A
Req # 2 -> Status: HTTP 401 | Remaining: 8 | Retry-After: N/A
Req # 3 -> Status: HTTP 401 | Remaining: 7 | Retry-After: N/A
Req # 4 -> Status: HTTP 401 | Remaining: 6 | Retry-After: N/A
Req # 5 -> Status: HTTP 401 | Remaining: 5 | Retry-After: N/A
Req # 6 -> Status: HTTP 401 | Remaining: 4 | Retry-After: N/A
Req # 7 -> Status: HTTP 401 | Remaining: 3 | Retry-After: N/A
Req # 8 -> Status: HTTP 401 | Remaining: 2 | Retry-After: N/A
Req # 9 -> Status: HTTP 401 | Remaining: 1 | Retry-After: N/A
Req #10 -> Status: HTTP 401 | Remaining: 0 | Retry-After: N/A
Req #11 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req #12 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req #13 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req #14 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req #15 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
```

#### Run 2: Immediate Re-Run (Persistent Locked-Out State)
Executed immediately following Run 1 without restarting the API server:

```text
Req # 1 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req # 2 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req # 3 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req # 4 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req # 5 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req # 6 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req # 7 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req # 8 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req # 9 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req #10 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req #11 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req #12 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req #13 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req #14 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
Req #15 -> Status: HTTP 429 | Remaining: 0 | Retry-After: 300
```

### 4.3 Conclusion on RATE-P01 Results
* In a clean baseline run, the result is: **Requests 1–10 = HTTP 401, Requests 11–15 = HTTP 429**.
* In a sequential re-run (or where preceding unauthenticated probing has already occurred from that IP), the result is: **15/15 = HTTP 429**.
* Both runs demonstrate that rate limiting is functioning as intended.

---

## 5. Security Probe Payload Strings

Below are the exact plain-text payload strings used across the automated test suites and Postman interactive probes:

### 5.1 Cross-Site Scripting (XSS) Payloads
1. **Login Password XSS Probe** (`scratch/day5_security_audit.cjs`, Test 5):
   ```text
   <script>alert("xss")</script><img src=x onerror=alert(1)>
   ```
2. **Visitor Name XSS Probe** (`scratch/run_internal_pentest_suite.cjs`, Test XSS-01 & Postman `XSS-P01`):
   ```text
   <script>alert("xss")</script>TestGuest
   ```
3. **Maintenance Ticket Title HTML Probe** (`scratch/run_internal_pentest_suite.cjs`, Test XSS-02):
   ```text
   <img src=x onerror=alert(1)> Faucet Leak
   ```
4. **Maintenance Ticket Comment SVG Probe** (`scratch/run_internal_pentest_suite.cjs`, Test XSS-03):
   ```text
   <svg onload=alert(document.cookie)> Harmless comment test
   ```

### 5.2 SQL Injection (SQLi) Payloads
1. **Classic Auth Bypass Probe** (`scratch/day5_security_audit.cjs`, Test 4, `scratch/run_internal_pentest_suite.cjs`, Test SQLI-01, Postman `SQLI-P01`):
   - Email: `' OR '1'='1' --`
   - Password: `' OR '1'='1' --`
2. **Password Field SQL Comment Probe** (`scratch/run_internal_pentest_suite.cjs`, Test SQLI-02):
   - Password: `Password123!' OR 1=1#`
3. **Query Parameter Boolean Probe** (`scratch/run_internal_pentest_suite.cjs`, Test SQLI-03):
   - URL: `/api/admin/residents?search=%27%20OR%201%3D1%20--`
   - Decoded Query String: `' OR 1=1 --`
4. **URL Path Parameter UNION SELECT Probe** (`scratch/run_internal_pentest_suite.cjs`, Test SQLI-04):
   - URL: `/api/admin/units/%27%20UNION%20SELECT%201%2C2%2C3%20--/household`
   - Decoded Injected Fragment: `' UNION SELECT 1,2,3 --`

### 5.3 Mass Assignment / Parameter Tampering Payload
1. **Visitor Endpoint Injected Keys** (`scratch/run_internal_pentest_suite.cjs`, Test INPUT-04 & Postman `INPV-P04`):
   ```json
   {
     "visitorName": "Harmless Guest",
     "visitorPhone": "9876543210",
     "expectedArrival": "2026-10-06T18:00:00.000Z",
     "injectedRole": "SUPER_ADMIN",
     "isAdminPrivilege": true
   }
   ```
2. **Login Endpoint Injected Keys** (`scratch/day6_verification_suite.cjs`, Test 3):
   ```json
   {
     "email": "preetham@community.local",
     "password": "Tenant1@12345",
     "role": "SUPER_ADMIN",
     "isElevated": true,
     "privileges": ["ALL"]
   }
   ```

---

## 6. Consistency Sweep Findings & Applied Fixes

### 6.1 Test Count Hierarchy
The various test counts across the documentation reflect distinct scopes:
* **258 Tests:** Canonical automated project test suite across all 8 test files (`scratch/*.cjs`), executed on October 5, 2026.
  - `verify_all_4_accounts.cjs`: 34
  - `core_features_audit.cjs`: 26
  - `admin_endpoints_audit.cjs`: 28
  - `tenant2_tenant3_verification.cjs`: 50
  - `community_services_verification.cjs`: 37
  - `amp_phase_verification.cjs`: 49
  - `day6_verification_suite.cjs`: 19
  - `day5_security_audit.cjs`: 15
  - **Sum:** 34 + 26 + 28 + 50 + 37 + 49 + 19 + 15 = **258**
* **56 Tests:** Comprehensive automated penetration test suite (`scratch/run_internal_pentest_suite.cjs`) recorded in `docs/PENETRATION_TEST_REPORT.md`.
* **65 Tests:** Consolidated practical security baseline documented in `docs/PENETRATION_TESTING_SECURITY_ASSESSMENT_RECORD.md` and `docs/PRACTICAL_PENETRATION_TEST_PLAN.md`:
  - Postman Interactive Tests: 10
  - PowerShell Defensive Headers: 6
  - PowerShell Rate-Limit Burst: 15
  - Automated Security Suite (`day5`): 15
  - Integration & RBAC Suite (`day6`): 19
  - **Sum:** 10 + 6 + 15 + 15 + 19 = **65**
* **34 Tests:** Either Suite 1 (`verify_all_4_accounts.cjs` = 34) or the sum of Day 5 security audit (15) + Day 6 validation suite (19) = 34.

### 6.2 Commit Hash Audit Trail
* `105903e`: Security hardening remediation (SEC-FIND-01, SEC-FIND-02, SEC-FIND-03).
* `e8ed20d`: Flow 3 amenity booking conflict status alignment to HTTP 400 Bad Request.
* `d4680f5`: Page-aware search implementation across admin web and mobile apps.
* `f4d12d9`: Practical execution evidence and step-by-step logs in `docs/PRACTICAL_PENETRATION_TEST_PLAN.md`.
* `68af4e6`: Formal supplementary Penetration Testing & Security Assessment Record (`AMP-DEV-001-PTR`).
* `4e40ccc`: Update README with demo accounts, portals, and documentation index.

### 6.3 Discrepancies Corrected in Repository Working Tree
1. **Passwords in `docs/FINAL_DOCUMENTATION_EVIDENCE_SUMMARY.md`:** Corrected from `Password123!` to the actual working passwords (`Admin@12345`, `Tenant1@12345`, `Tenant2@12345`, `Tenant3@12345`, `Owner@12345`).
2. **Roles in `README.md` (Key Highlights):** Clarified that active RBAC enforces `SUPER_ADMIN`, `RESIDENT_OWNER`, and `RESIDENT_TENANT`, while `SECURITY_GUARD`, `MAINTENANCE_STAFF`, and `COMMITTEE_MEMBER` are schema definitions for future milestones.
3. **Credentials Warning in `README.md` (Section 9):** Added warning callout: `"Synthetic development credentials only. Never reuse in production. Rotate or remove before any deployment."`
4. **Rate Limit Documentation in `docs/PENETRATION_TESTING_SECURITY_ASSESSMENT_RECORD.md` & `docs/PRACTICAL_PENETRATION_TEST_PLAN.md`:** Updated to describe both the clean-state transition (1–10 = 401, 11–15 = 429) and the sequential re-run lockout (15/15 = 429).

---

## 7. Items Outside Automated Scope / Unverified

1. **Third-Party Payment Gateways (Razorpay/Stripe):** The dues ledger uses administrative recording endpoints (`POST /api/dues/:id/record-payment`). Live third-party webhook verification was out of scope.
2. **APNs / FCM Native Push Notifications:** Push notifications operate via in-app inbox endpoints (`/api/resident/notifications`) rather than live Apple or Google push servers (which require paid developer team credentials).
3. **Hardware Biometric Keystores on Physical Rooted Devices:** While `expo-secure-store` is implemented in the mobile code, hardware tamper verification (e.g., Frida SSL unpinning) was out of scope for this backend/web-focused evaluation.
