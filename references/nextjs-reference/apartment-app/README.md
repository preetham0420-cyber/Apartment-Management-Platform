# Apartment Management Application

Development baseline for the Apartment Management Application. This repository contains the responsive frontend prototype that will be used as the reference implementation for future backend, database, authentication, authorization, and production-integration work.


## Reference UI Notice

This repository is a reference frontend baseline, not the final product architecture. The final Apartment Management platform is intended to use:

- a React Native / Expo mobile application for resident owners and tenants on Android and iOS;
- a web administration console for the authorized Super Admin / property owner;
- a Node.js / Express API service; and
- a separate development/staging database and production database.

The current Next.js UI should be reviewed for workflows, layout ideas, terminology and feature coverage. It may be refactored or selectively reused for the Super Admin web console. Mobile screens should be implemented as native React Native screens rather than embedding the web UI in a WebView.

## Current Scope

The current codebase is frontend-focused and uses demonstration data. It includes views and workflows for:

- Dashboard and community overview
- Residents and homes
- Rental management
- Maintenance requests
- Payments and accounts
- Visitors and gate operations
- CCTV and security
- Amenities
- Chat and messages
- Notices and meetings
- Staff and vendors
- Documents and reports
- Role-based UI views for Administrator, Committee Member, Owner, Tenant, Security, Maintenance, and Service Vendor

`lib/api.ts` provides the service boundary intended for future backend integration. The current implementation uses mock responses.

## Technology

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4 / project CSS
- Node.js 22.13 or newer

## Local Development

### Prerequisites

Install Node.js 22.13 or newer.

### Setup

```bash
npm ci
npm run dev
```

Open:

```text
http://localhost:3000
```

To make the development server available to other devices on the same local network:

```bash
npm run dev:network
```

Then use the computer's local network address with port `4173`.

## Quality Checks

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Or run all checks together:

```bash
npm run check
```

## Backend Integration

The next development phase should replace the mock implementation in `lib/api.ts` with calls to the approved backend API. A local backend can be used during development; a public domain is not required.

Copy `.env.example` to `.env.local` when a backend API is introduced and update the local API address as required.

Example:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

Do not commit `.env.local`, production credentials, database passwords, API keys, access tokens, certificates, customer data, or production backups.

## Repository Rules

- Use feature branches for development work.
- Do not commit directly to the protected production branch when branch protection is enabled.
- Submit changes through Pull Requests for review.
- Keep commits small and descriptive.
- Do not commit generated build folders or `node_modules`.
- Do not commit secrets or production data.

## Data Notice

All records currently present in this frontend are demonstration/mock records and must not be treated as production data. Production data should only be introduced through approved backend services and authorized environments.

## Recommended Branching

```text
main
  -> develop
       -> feature/<feature-name>
       -> bugfix/<issue-name>
```

## Project Status

Frontend development baseline. Backend and database integration are separate development phases.
