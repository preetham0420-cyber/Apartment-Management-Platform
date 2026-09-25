# Repository Structure Reference

## Root Layout

```text
apartment-management-platform/
├── apps/
│   ├── mobile/                                            # Resident Mobile Application (Expo / React Native)
│   │   ├── src/
│   │   │   ├── screens/                                   # Native screen components
│   │   │   ├── components/                                # Reusable UI components
│   │   │   └── theme/                                     # Theme tokens (colors, typography, metrics)
│   │   ├── assets/                                        # Mobile images and splash assets
│   │   ├── app.json                                       # Expo manifest configuration
│   │   ├── App.tsx                                        # Native mobile application root
│   │   ├── package.json                                   # Mobile dependencies
│   │   ├── tsconfig.json                                  # TypeScript configuration
│   │   └── .env.example                                   # Mobile environment template
│   │
│   ├── admin-web/                                         # Super Admin Web Console (Next.js)
│   │   ├── app/
│   │   │   ├── layout.tsx                                 # Root web layout
│   │   │   ├── page.tsx                                   # Admin home dashboard page
│   │   │   └── globals.css                                # Design system & tokens
│   │   ├── components/                                    # Admin layout components & widgets
│   │   ├── public/                                        # Static web assets
│   │   ├── next.config.ts                                 # Next.js bundler config
│   │   ├── package.json                                   # Next.js dependencies
│   │   ├── tsconfig.json                                  # TypeScript configuration
│   │   └── .env.example                                   # Admin web environment template
│   │
│   └── api/                                               # Backend REST API (Express 5 / Node 22)
│       ├── src/
│       │   ├── config/                                    # Environment config loader
│       │   ├── routes/                                    # Express routing definitions
│       │   ├── controllers/                               # Request/response controllers
│       │   ├── services/                                  # Business logic services
│       │   ├── repositories/                              # Data access & persistence logic
│       │   ├── middleware/                                # CORS, error handler, not-found middleware
│       │   └── index.ts                                   # Express server entry point
│       ├── package.json                                   # Express 5 dependencies
│       ├── tsconfig.json                                  # TypeScript configuration
│       └── .env.example                                   # API environment template
│
├── packages/
│   └── shared/                                            # Shared TypeScript Contracts & Schemas
│       ├── src/
│       │   ├── types/
│       │   │   ├── roles.ts                               # Provisional user roles (pending confirmation)
│       │   │   └── api.ts                                 # Standard API response/error contracts
│       │   └── index.ts                                   # Barrel export
│       ├── package.json                                   # Package metadata
│       └── tsconfig.json                                  # TypeScript configuration
│
├── database/
│   ├── migrations/                                        # Versioned SQL migrations (schema init in Day 3)
│   │   └── .gitkeep
│   └── seeds/                                             # Development seed scripts
│       └── .gitkeep
│
├── docs/                                                  # Central Platform Documentation
│   ├── ARCHITECTURE.md                                    # Monorepo architecture & component boundaries
│   ├── REPOSITORY_STRUCTURE.md                            # Detailed directory reference
│   ├── DEVELOPMENT_GUIDE.md                               # Setup, run commands & Expo Go testing
│   └── DAY1_STATUS.md                                     # Day 1 milestone verification & audit
│
├── references/                                            # Preserved Reference Packages (Read-Only)
│   ├── android-reference/                                 # Clean Android APK source & assets/index.html
│   ├── apk-package/                                       # Reference APK file & delivery instructions
│   └── nextjs-reference/                                  # Next.js reference prototype
│
├── package.json                                           # Root package.json defining npm workspaces
├── tsconfig.base.json                                     # Shared base TypeScript compiler options
├── .gitignore                                             # Monorepo git exclusion rules
└── README.md                                              # Project overview & quick start
```
