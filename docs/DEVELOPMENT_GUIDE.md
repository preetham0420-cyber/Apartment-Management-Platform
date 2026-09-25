# Development & Execution Guide

## Prerequisites

- **Node.js:** `v22.x` (LTS recommended)
- **npm:** `v10.x` or newer
- **Mobile Testing:** Mobile device with **Expo Go** (Android / iOS) installed from Google Play Store or Apple App Store.

---

## 1. Quick Start Commands

From the monorepo root directory:

### Run Backend API
```bash
npm run dev:api
```
- Starts Express 5 API on: `http://localhost:4000`
- Health check verification: `http://localhost:4000/api/health`

### Run Super Admin Web
```bash
npm run dev:admin
```
- Starts Next.js development server on: `http://localhost:3000`

### Run Resident Mobile App
```bash
npm run dev:mobile
```
- Starts Expo Metro Bundler and outputs interactive terminal QR code.

---

## 2. Testing Mobile App with Expo Go

1. Install **Expo Go** on your physical mobile device:
   - [Google Play Store (Android)](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [Apple App Store (iOS)](https://apps.apple.com/app/expo-go/id982107779)
2. Ensure your computer and mobile phone are connected to the **same local Wi-Fi network**.
3. In the terminal, start the mobile application:
   ```bash
   npm run dev:mobile
   ```
4. **Android:** Open the Expo Go app and tap **Scan QR Code**. Scan the QR code displayed in your terminal.
5. **iOS:** Open the default Camera app, point it at the QR code in the terminal, and tap the prompt to open in Expo Go.
6. The native application will bundle and display the **Community Portal** screen without requiring an Android Studio emulator or macOS Xcode build.

---

## 3. Android Studio / Emulator Requirements

- Android Studio is **NOT required** for Day 1 development because the application runs seamlessly via Expo Go.
- If you prefer running inside an Android Studio Virtual Device (AVD):
  1. Launch Android Studio -> Virtual Device Manager -> Start an AVD.
  2. In your terminal, run:
     ```bash
     npm run dev:mobile
     ```
  3. Press `a` in the terminal to automatically connect and launch on the running Android emulator.
