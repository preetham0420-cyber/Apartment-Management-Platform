# Apartment Management Platform: Testing & Verification Guide

This document records the testing strategy, test suites, execution commands, and verified results for the Apartment Management Platform (AMP-DEV-001).

---

## 1. Test Suite Summary & Results

A total of **7 automated test suites** covering **224 distinct checks** were executed against the live platform:

| Test Suite | Purpose / Scope | Total Checks | Passed | Failed | Success Rate |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `scratch/core_features_audit.cjs` | Core functional verticals (Home, Profile, Visitors, Maintenance, Dues, Amenities, Admin) | 26 | 26 | 0 | 100% |
| `scratch/admin_endpoints_audit.cjs` | Admin Web console endpoints, live KPIs, status toggling, and RBAC rejection | 28 | 28 | 0 | 100% |
| `scratch/tenant2_tenant3_verification.cjs` | Multi-resident accounts (Tenant 2, Tenant 3), login, IDOR guards, and unit isolation | 50 | 50 | 0 | 100% |
| `scratch/community_services_verification.cjs` | Community services: Amenities booking, conflict prevention, directory, lease, CCTV desk, circulars | 37 | 37 | 0 | 100% |
| `scratch/amp_phase_verification.cjs` | Master Phase 1 through 10 functional verification suite | 49 | 49 | 0 | 100% |
| `scratch/day6_verification_suite.cjs` | Zod boundary validation, IDOR unit checks, role hierarchy | 19 | 19 | 0 | 100% |
| `scratch/day5_security_audit.cjs` | Security hardening: JWT, XSS, SQLi, CORS, headers, anti-enumeration, rate limiting | 15 | 13 | 2* | 86.7% |
| **TOTALS** | **Comprehensive Regression Suite** | **224** | **222** | **2\*** | **99.1%** |

*\*Note on Day 5 Security Audit Discrepancies (Documented under Known Limitations):*
1. **Test 12 (Error Sanitization)**: Test expected an unauthenticated GET `/api/unmapped-route-test` to return `404 Not Found`. However, the API security gateway requires authentication on all `/api/*` routes, returning `401 Unauthorized`.
2. **Test 15 (Rate Limiting)**: Test expected 12 login attempts to trigger `429 Too Many Requests`. In development mode (`NODE_ENV !== "production"`), the rate limiter window allows 200 attempts to prevent blocking automated testing suites (production limit is 10 attempts).

---

## 2. Execution Commands

From the monorepo root directory:

```bash
# 1. Core Feature Verification
node scratch/core_features_audit.cjs

# 2. Super Admin Endpoints & Modules Audit
node scratch/admin_endpoints_audit.cjs

# 3. Multi-Tenant Accounts & RBAC Isolation Suite
node scratch/tenant2_tenant3_verification.cjs

# 4. Community Services & Amenity Booking Suite
node scratch/community_services_verification.cjs

# 5. Master Phase 1-10 Verification Suite
node scratch/amp_phase_verification.cjs

# 6. Zod Boundaries & IDOR Security Suite
node scratch/day6_verification_suite.cjs

# 7. Day 5 Security Hardening Suite
node scratch/day5_security_audit.cjs
```

---

## 3. TypeScript Typecheck & Build Validation

All workspaces were compiled and typechecked without errors:

| Workspace | Typecheck Command | Result | Build Command | Result |
| :--- | :--- | :---: | :--- | :---: |
| `@apartment/shared` | `npm run typecheck --workspace=@apartment/shared` | `PASS (0 errors)` | `npm run build:shared` | `PASS (0 errors)` |
| `@apartment/api` | `npm run typecheck --workspace=@apartment/api` | `PASS (0 errors)` | `npm run build --workspace=@apartment/api` | `PASS (0 errors)` |
| `@apartment/admin-web` | `npm run typecheck --workspace=@apartment/admin-web` | `PASS (0 errors)` | `npm run build --workspace=@apartment/admin-web` | `PASS (Turbopack: 3/3 static pages)` |
| `@apartment/mobile` | `npm run typecheck --workspace=@apartment/mobile` | `PASS (0 errors)` | Metro Bundler (`expo start`) | `PASS (Ready on :8081)` |

---

## 4. End-to-End Manual Verification Flows

### Flow 1: Resident / Tenant Workflow
1. Navigate to `http://localhost:8081` on browser or open Expo Go.
2. Sign in with `preetham@community.local` (`Tenant1@12345`).
3. Verify Home screen displays Flat 402, Parking Slot `P-A-402`, and active dues.
4. Open **More** tab -> **Amenities Booking**:
   - Select **Clubhouse Banquet Hall**.
   - Pick date and time slot.
   - Tap **Confirm Reservation**. Verify slot is booked and appears in Resident Bookings list.
   - Tap **Cancel Booking**. Verify slot is released.
5. Open **More** -> **Residents Directory**: Verify list of residents with own flat highlighted.
6. Open **More** -> **Lease Agreement**: Confirm agreement number `LEASE-GH-TWR-A-402`.
7. Open **More** -> **CCTV & Security**: Verify operational gate status and intercom lines.

### Flow 2: Multi-Tenant Resident Verification
1. Sign in with `ananya.sharma@community.local` (`Tenant2@12345`).
2. Verify assigned flat is **Flat 101** (Tower A).
3. Confirm personal dues, lease agreement, and household members are strictly scoped to Unit 101.
4. Sign in with `rahul.verma@community.local` (`Tenant3@12345`).
5. Verify assigned flat is **Flat 304** (Tower B).

### Flow 3: Resident Owner Workflow
1. Sign in with `vikramaditya@community.local` (`Owner@12345`).
2. Verify assigned flat is **Flat 205** (Tower B, Fl 2).
3. Open **Documents & Bylaws**: Verify access to `OWNERS_ONLY` statutory documents (AGM minutes, audits).
4. Verify direct URL or API calls to Super Admin endpoints return `403 Forbidden`.

### Flow 4: Super Admin Workflow
1. Navigate to `http://localhost:3000`.
2. Sign in with `admin@community.local` (`Admin@12345`).
3. Verify executive dashboard displays live KPIs.
4. Go to **Units & Residential Inventory**:
   - Verify all 5 flats are listed with synchronized emails:
     - Flat 402: `preetham@community.local` (`OCCUPIED`)
     - Flat 101: `ananya.sharma@community.local` (`OCCUPIED`)
     - Flat 205: `vikramaditya@community.local` (`OCCUPIED`)
     - Flat 304: `rahul.verma@community.local` (`OCCUPIED`)
     - Flat 501: Unassigned (`UNDER_MAINTENANCE`)
5. Go to **Residents & Onboarding**: Verify resident list and pending applicant approval queue.
6. Go to **Notice Publisher**: Compose a notice with `URGENT` priority; verify instant broadcast.
7. Go to **Compliance & Audit Logs**: Verify search and filter by actor/action.

---

## 5. Known Testing Limitations

1. **Browser Automation Drivers**: Headless browser automation (e.g. Playwright) in Windows environment may experience system display-server constraints; full verification was accomplished via automated Node.js API regression suites and live interactive browser testing at `http://localhost:3000` and `http://localhost:8081`.
2. **Push Notifications**: Verified via in-app notification inbox API and database polling; physical APNs / FCM delivery requires cloud developer credentials.
3. **Payment Settlements**: Payment transactions use verified recording flows (`/api/dues/:id/record-payment`) rather than live third-party bank webhooks.
