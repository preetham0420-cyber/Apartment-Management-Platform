# Apartment Management Platform

A cross-platform solution for apartment and residential community operations, featuring a native mobile app for residents, a web console for administrative management, and a backend REST API.

## Project Structure

- **`apps/mobile`**: Resident/Tenant mobile application built with React Native & Expo (TypeScript).
- **`apps/admin-web`**: Super Admin web console built with Next.js (TypeScript).
- **`apps/api`**: Backend REST API service built with Node.js 22 & Express 5 (TypeScript).
- **`packages/shared`**: Shared TypeScript contracts, DTOs, and provisional user roles.
- **`database/`**: Versioned database migrations and seed scripts.
- **`docs/`**: Technical documentation, architecture guides, and execution notes.
- **`references/`**: Preserved reference implementation packages (Android WebView reference & Next.js prototype).

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Build Shared Contracts:**
   ```bash
   npm run build:shared
   ```

3. **Run Backend API:**
   ```bash
   npm run dev:api
   ```
   Server runs on `http://localhost:4000`. Health check: `http://localhost:4000/api/health`.

4. **Run Super Admin Web:**
   ```bash
   npm run dev:admin
   ```
   Web console runs on `http://localhost:3000`.

5. **Run Resident Mobile App:**
   ```bash
   npm run dev:mobile
   ```
   Scan the generated terminal QR code with **Expo Go** on an Android or iOS device.

## Day 1 Architecture & Status
See [docs/DAY1_STATUS.md](docs/DAY1_STATUS.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete details.
