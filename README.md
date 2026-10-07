# Apartment Management Platform (AMP-DEV-001)

A full-stack, enterprise-grade apartment and residential community management platform featuring a high-performance Express 5 REST API, a Next.js Super Admin Web console, a native React Native / Expo mobile application for residents and owners, and a MySQL 8.0+ persistence layer.

---

## 1. Project Overview

The Apartment Management Platform (AMP) provides comprehensive automation for modern residential communities, managing property configurations, resident onboarding, flat occupancy, maintenance ticketing, visitor pass security, recurring dues and billing, shared amenity bookings, community documents, and compliance audit logs.

### Key Highlights
- **Strict Role-Based Access Control (RBAC):** Server-side authorization separating Super Admins, Resident Owners, Resident Tenants, Security Guards, and Maintenance Staff.
- **Defensive Security & IDOR Guard:** Resource ownership enforcement ensuring residents cannot access, inspect, or modify another unit's dues, vehicles, household members, or maintenance tickets.
- **Multi-Tenant Resident Support:** Multiple deterministic resident accounts (Preetham, Ananya Sharma, Rahul Verma) and resident owners (Vikramaditya) mapped to distinct flats.
- **Zero-Trust Input Validation:** Runtime Zod boundary schemas with strict property enforcement across all API endpoints.
- **Security Hardening:** Hardware keystore mobile token persistence (`expo-secure-store`), magic-bytes file verification (JPEG/PNG/PDF), sliding window rate limiting, and security HTTP headers.

---

## 2. System Architecture

The platform is structured as an npm workspaces monorepo:

```mermaid
graph TD
    subgraph Client Channels
        Mobile["Resident Mobile App<br/>(React Native / Expo 57)<br/>Port: 8081"]
        AdminWeb["Super Admin Web Console<br/>(Next.js 16 / React 19)<br/>Port: 3000"]
    end

    subgraph Shared Contracts
        SharedPkg["@apartment/shared<br/>(TypeScript Contracts, Enums & Zod Schemas)"]
    end

    subgraph Backend Services
        API["REST API Service<br/>(Node.js 22 / Express 5)<br/>Port: 4000"]
    end

    subgraph Persistence Layer
        DB[("MySQL 8.0+ Database<br/>(Versioned Migrations & Seeds)")]
    end

    Mobile -->|REST / JSON (JWT Auth)| API
    AdminWeb -->|REST / JSON (JWT Auth)| API
    Mobile -.->|Imports DTOs & Contracts| SharedPkg
    AdminWeb -.->|Imports DTOs & Contracts| SharedPkg
    API -.->|Imports DTOs & Schemas| SharedPkg
    API -->|Connection Pool (mysql2)| DB
```

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Monorepo** | npm Workspaces, TypeScript 5.7+ |
| **Backend REST API** | Node.js 22 LTS, Express 5.0, Zod, bcryptjs, jsonwebtoken, multer, mysql2 |
| **Super Admin Web** | Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS design system |
| **Resident Mobile App** | React Native 0.86, Expo SDK 57, TypeScript, Expo Secure Store, Expo Vector Icons |
| **Shared Contracts** | TypeScript definitions, API envelopes, domain models, RBAC enums |
| **Persistence** | MySQL 8.0+ with versioned DDL migrations and seed scripts |

---

## 4. Repository Structure

```text
apartment-management-platform/
├── apps/
│   ├── admin-web/              # Next.js Super Admin Web Console
│   │   ├── app/                # Next.js App Router (layout, page)
│   │   ├── components/         # Modular management components
│   │   └── package.json
│   ├── api/                    # Node.js 22 / Express 5 REST API
│   │   ├── src/
│   │   │   ├── config/         # Database connection pool & env config
│   │   │   ├── controllers/    # Request handlers & response formatting
│   │   │   ├── middleware/     # Auth, RBAC, Rate-limiting, Zod validation
│   │   │   ├── repositories/   # Parameterized SQL & dev fallback seeds
│   │   │   ├── routes/         # REST API route registrations
│   │   │   └── services/       # Business logic & resource ownership checks
│   │   └── package.json
│   └── mobile/                 # React Native / Expo Resident Application
│       ├── src/
│       │   ├── components/     # Reusable native UI components
│       │   ├── navigation/     # Tab and stack navigation
│       │   ├── screens/        # Home, Services, Profile, More screens
│       │   └── services/       # API client with SecureStore token persistence
│       └── package.json
├── packages/
│   └── shared/                 # Shared TypeScript models, DTOs & schemas
├── database/
│   ├── migrations/             # 001, 002, 003 DDL schema migrations
│   └── seeds/                  # 001, 002, 003 deterministic demo seeds
├── docs/                       # Comprehensive documentation suite
├── scratch/                    # Automated verification test suites
├── .env.example                # Sanitized environment configuration template
└── package.json                # Monorepo root scripts & configuration
```

---

## 5. Prerequisites

- **Node.js:** `v22.x` (LTS recommended)
- **npm:** `v10.x` or newer
- **MySQL:** `v8.0` or newer (Optional: API includes transparent development seeds if MySQL is offline)
- **Mobile Testing:** Physical Android/iOS device with **Expo Go** or any modern web browser

---

## 6. Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/preetham0420-cyber/Apartment-Management-Platform.git
   cd Apartment-Management-Platform
   ```

2. **Install Monorepo Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

4. **Build Shared Contracts:**
   ```bash
   npm run build:shared
   ```

---

## 7. Database Setup (Optional for Live MySQL)

If running against a live MySQL 8.0+ server:

1. Create the database:
   ```sql
   CREATE DATABASE apartment_management_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Run migrations in order:
   ```bash
   mysql -u root -p apartment_management_dev < database/migrations/001_roles_users_properties_units.sql
   mysql -u root -p apartment_management_dev < database/migrations/002_core_features.sql
   mysql -u root -p apartment_management_dev < database/migrations/003_extended_features.sql
   ```
3. Seed development accounts and properties:
   ```bash
   mysql -u root -p apartment_management_dev < database/seeds/001_initial_users_and_properties.sql
   mysql -u root -p apartment_management_dev < database/seeds/002_core_features.sql
   mysql -u root -p apartment_management_dev < database/seeds/003_extended_features.sql
   ```

*(Note: If MySQL is not running locally, the API automatically operates using deterministic in-memory development seeds with identical schema and credentials).*

---

## 8. Running the Application

### Start API Server
```bash
npm run dev:api
```
- Endpoint: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

### Start Super Admin Web Console
```bash
npm run dev:admin
```
- URL: `http://localhost:3000`

### Start Resident Mobile App
```bash
npm run dev:mobile
```
- Metro bundler: `http://localhost:8081`
- Press `w` to open in your desktop web browser, or scan the terminal QR code with **Expo Go** on iOS/Android.

---

## 9. Seed & Demo Accounts

All demo accounts are pre-configured with secure bcrypt-hashed passwords and deterministic roles:

| Persona | Role | Flat / Scope | Target Portal / Client | Email Address | Password | Key Permissions & Features |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `SUPER_ADMIN` | Platform & Society Governance | **Admin Web** (`http://localhost:3000`) | `admin@community.local` | `Admin@12345` | Full administrative control, all 12 modules, financial ledger, resident onboarding, audit logs. |
| **Preetham** | `RESIDENT_TENANT` | Tower A — Flat 402 (Floor 4, 3BHK) | **Mobile App** (`http://localhost:8081`) | `preetham@community.local` | `Tenant1@12345` | Primary tenant account: visitor gate passes, dues ledger (₹4,850), maintenance tickets, amenity reservations. |
| **Ananya Sharma** | `RESIDENT_TENANT` | Tower A — Flat 101 (Floor 1, 2BHK) | **Mobile App** (`http://localhost:8081`) | `ananya.sharma@community.local` | `Tenant2@12345` | Secondary tenant account: multi-tenant isolation verification, flat 101 lease agreement, independent dues. |
| **Rahul Verma** | `RESIDENT_TENANT` | Tower B — Flat 304 (Floor 3, 2BHK) | **Mobile App** (`http://localhost:8081`) | `rahul.verma@community.local` | `Tenant3@12345` | Tertiary tenant account: Tower B isolation, multi-block society directory verification. |
| **Vikramaditya** | `RESIDENT_OWNER` | Tower B — Flat 205 (Floor 2, 3BHK) | **Mobile App** (`http://localhost:8081`) | `vikramaditya@community.local` | `Owner@12345` | Resident owner account: flat freehold deed, exclusive access to confidential `OWNERS_ONLY` compliance records (AGM Minutes, Financial Audits). |

> [!NOTE]
> All accounts enforce strict server-side authentication and role-based access control. Legacy placeholder accounts (`tenant@community.local`, `owner@community.local`) have been intentionally migrated and return `401 Unauthorized`. Only the 5 verified accounts above are active.

---

## 10. Main Application Flows

### 1. Resident / Tenant Flow (`http://localhost:8081`)
1. **Login:** Authenticate as `preetham@community.local`, `ananya.sharma@community.local`, or `rahul.verma@community.local`.
2. **Home Screen:** View flat details, assigned parking bay, outstanding dues banner, quick visitor passes, and maintenance status.
3. **Community Services:**
   - **Amenities Booking:** Browse facilities (Clubhouse Banquet Hall, Swimming Pool, Tennis Court), check real-time availability schedule, reserve slots with conflict prevention, and cancel bookings.
   - **Household Members:** Add family members/roommates with IDOR-protected self-service CRUD.
   - **Vehicles & Parking:** Register four-wheelers and two-wheelers with EV flag.
   - **Residents Directory:** Search community members and identify own flat.
   - **Lease Agreement:** View verified tenancy lease agreement numbers and validity.
   - **CCTV & Gate Security:** Check gate status, guard contacts, and intercom lines.
   - **Payments & Dues:** Review maintenance dues invoices and payment history.
   - **Gate Passes:** Generate dynamic 6-digit visitor passes for delivery and guests.
   - **Maintenance Requests:** Submit tickets with descriptions, priority, and defect photos.
   - **Notices & Circulars:** Read official administrative announcements.

### 2. Resident Owner Flow (`http://localhost:8081`)
1. **Login:** Authenticate as `vikramaditya@community.local`.
2. **Owner-Specific Permissions:** Access flat ownership records, statutory owner compliance documents (`OWNERS_ONLY`), AGM meeting minutes, and financial audits.
3. **Administrative Isolation:** Strictly blocked with HTTP 403 Forbidden from accessing Super Admin endpoints.

### 3. Super Admin Flow (`http://localhost:3000`)
1. **Login:** Authenticate as `admin@community.local`.
2. **Executive Dashboard:** Live KPI cards for occupancy, dues collection, active visitors, maintenance tickets, and amenity reservations.
3. **Properties & Units:** Update society configuration (emergency contact, rules, payment instructions), manage unit occupancy (`OCCUPIED`, `VACANT`, `UNDER_MAINTENANCE`), and allocate parking slots.
4. **Residents & Onboarding:** Search directory, toggle resident account status, and review/approve self-registered applicants from the onboarding queue.
5. **Maintenance & Vendors:** Assign field staff, add internal comments, inspect defect attachments, and resolve tickets.
6. **Visitors & Gate Log:** Real-time visitor log with host verification and check-in/out toggles.
7. **Dues & Financial Ledger:** Track monthly collections and record offline payment settlements.
8. **Amenities Management:** Oversee reservations and cancel conflicting bookings.
9. **Notice Publisher:** Compose and broadcast prioritized notices (`LOW`, `NORMAL`, `URGENT`) directly to mobile inboxes.
10. **Compliance & Audit Logs:** Searchable, immutable audit trail capturing actor, IP, timestamp, and affected resources.
11. **Operational Reports:** Exportable analytics on financial collections, maintenance SLA, visitor traffic, and unit occupancy.

---

## 11. Verification & Testing

Run all automated verification test suites:

```bash
# Core features verification (26 checks)
node scratch/core_features_audit.cjs

# End-to-end admin endpoints audit (28 checks)
node scratch/admin_endpoints_audit.cjs

# Multi-tenant resident verification & IDOR isolation (50 checks)
node scratch/tenant2_tenant3_verification.cjs

# Community services & amenity booking suite (37 checks)
node scratch/community_services_verification.cjs

# Full Phase 1-10 platform verification (49 checks)
node scratch/amp_phase_verification.cjs

# Permissions, validation & IDOR boundaries (19 checks)
node scratch/day6_verification_suite.cjs

# Security hardening audit (15 checks)
node scratch/day5_security_audit.cjs
```

### Typecheck & Build Commands
```bash
# Typecheck all workspaces
npm run typecheck --workspaces --if-present

# Build individual workspaces
npm run build:shared
npm run build --workspace=@apartment/api
npm run build --workspace=@apartment/admin-web
```

---

## 12. Documentation Index

- [Architecture Specification](docs/ARCHITECTURE.md)
- [API Documentation & Envelopes](docs/API_DOCUMENTATION.md)
- [Database Schema & Migrations](docs/DATABASE.md)
- [Security Architecture & Hardening](docs/SECURITY.md)
- [Penetration Testing & Security Assessment Record (AMP-DEV-001-PTR)](docs/PENETRATION_TESTING_SECURITY_ASSESSMENT_RECORD.md)
- [Internal Penetration Test Report](docs/PENETRATION_TEST_REPORT.md)
- [Practical Penetration Test Plan & Evidence](docs/PRACTICAL_PENETRATION_TEST_PLAN.md)
- [Testing & Verification Guide](docs/TESTING.md)
- [Day-by-Day Development Log](docs/DAY_WISE_LOG.md)
- [Final Project Report (AMP-DEV-001)](docs/FINAL_PROJECT_REPORT.md)
- [Known Limitations & Next Sprint](docs/FINAL_PROJECT_REPORT.md#known-limitations)
