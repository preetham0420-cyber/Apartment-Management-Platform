# Apartment Management Platform - Project Handoff

## Purpose of this repository

The current Next.js interface is a reference UI for the Apartment Management project. It demonstrates intended modules, information hierarchy, visual language and sample workflows. It is not the final cross-platform implementation.

## Target product channels

- **Android and iOS mobile application:** for resident owners and tenants.
- **Web administration console:** restricted to the authorized Super Admin / property owner.
- **Backend API:** shared by the mobile application and the administration console.
- **Database:** isolated development, staging and production databases. The recommended Hostinger-native production path uses MySQL. An approved external PostgreSQL service can be used if PostgreSQL is required.

## Recommended repository structure

```text
apps/
  mobile/       # React Native + Expo
  admin-web/    # Next.js administration console
  api/          # Node.js + Express API
packages/
  shared/       # Shared TypeScript types / validation contracts
database/
  migrations/
  seeds/
docs/
reference-ui/   # Current UI reference during migration, if retained separately
```

The existing UI may initially remain at the repository root while the new application structure is introduced. Avoid deleting reference screens until the approved replacement exists.

## Local reference UI

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Data and secrets

All bundled records are demonstration data. Never commit real resident records, passwords, database credentials, Hostinger credentials, API keys, Apple/Google signing credentials or production backups.

Use `.env.example` for configuration names and keep actual `.env*` files outside source control.

## Branching

```text
main
  -> develop
       -> feature/<name>
       -> bugfix/<name>
```

Create Pull Requests for review. Do not push unreviewed feature work directly to `main`.
