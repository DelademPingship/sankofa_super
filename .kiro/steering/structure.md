# Project Structure

## Repository Layout

```
.
├── sankofa_backend/       # Django REST API
├── sankofa_app/           # Flutter mobile app
├── sankofa_admin/         # React admin console
├── sankofa_frontend/      # React web app
├── sankofa_admin_old/     # Legacy admin (deprecated)
├── docker-compose.local.yml
├── docker-compose.coolify.yml
├── .env.local.example
├── .env.production.example
└── IMPLEMENTATIONS.md     # Feature roadmap and acceptance criteria
```

## Backend Structure (sankofa_backend/)

```
sankofa_backend/
├── core/                  # Project configuration
│   ├── settings/
│   │   ├── base.py       # Shared settings
│   │   ├── local.py      # Development overrides
│   │   └── production.py # Production overrides
│   ├── urls.py           # Root URL configuration
│   ├── asgi.py           # ASGI entry (WebSocket support)
│   ├── wsgi.py           # WSGI entry
│   └── celery.py         # Celery configuration
├── apps/                  # Django apps (domain-driven)
│   ├── accounts/         # User model, auth, KYC
│   ├── groups/           # Susu groups, membership, invites
│   ├── savings/          # Personal savings goals, contributions
│   ├── transactions/     # Transaction history, wallet operations
│   ├── disputes/         # Support tickets, knowledge base
│   ├── notifications/    # Push notifications, in-app alerts
│   ├── admin_api/        # Admin-specific endpoints
│   └── common/           # Shared utilities, storage backends
├── media/                # User uploads (KYC documents)
├── sent_emails/          # Email logs (local development)
├── requirements.txt      # Production dependencies
├── requirements-dev.txt  # Development dependencies
├── manage.py
└── Dockerfile
```

### App Structure Pattern

Each Django app follows this structure:

```
apps/<app_name>/
├── models.py             # Database models
├── serializers.py        # DRF serializers
├── views.py              # API views/viewsets
├── urls.py               # URL routing
├── services.py           # Business logic (optional)
├── admin.py              # Django admin configuration
├── signals.py            # Django signals (optional)
├── tests/                # Test suite
│   ├── test_models.py
│   ├── test_views.py
│   └── test_services.py
└── migrations/           # Database migrations
```

## Mobile App Structure (sankofa_app/)

```
sankofa_app/
├── lib/
│   ├── main.dart         # App entry point
│   ├── theme.dart        # Material theme configuration
│   ├── config/           # App configuration
│   ├── models/           # Data models (User, Group, Transaction, etc.)
│   ├── services/         # API clients (auth, groups, savings, etc.)
│   ├── screens/          # Full-page views
│   ├── widgets/          # Reusable UI components
│   ├── ui/components/    # Shared UI elements
│   ├── controllers/      # State management
│   ├── utils/            # Helpers (formatters, transitions)
│   └── data/             # Static data (process flows)
├── assets/
│   ├── images/           # App images
│   ├── icons/            # App icons
│   └── data/             # JSON data files
├── pubspec.yaml          # Dependencies
└── android/ios/web/      # Platform-specific code
```

## Admin Console Structure (sankofa_admin/)

```
sankofa_admin/
├── src/
│   ├── App.tsx           # Root component with routing
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles
│   ├── components/
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── layout/       # Layout components (sidebar, header)
│   │   └── ui/           # shadcn/ui components (buttons, forms, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities
│   │   ├── api.ts        # API client
│   │   ├── auth.tsx      # Auth context/hooks
│   │   ├── types.ts      # TypeScript types
│   │   ├── utils.ts      # Helper functions
│   │   └── mockData.ts   # Mock data for development
│   └── pages/            # Page components
│       ├── Dashboard.tsx
│       ├── Users.tsx
│       ├── Groups.tsx
│       ├── Transactions.tsx
│       ├── Cashflow.tsx
│       ├── Disputes.tsx
│       ├── Analytics.tsx
│       ├── Settings.tsx
│       └── Login.tsx
├── public/               # Static assets
├── components.json       # shadcn/ui configuration
├── tailwind.config.ts    # Tailwind configuration
├── vite.config.ts        # Vite configuration
├── package.json
└── Dockerfile
```

## Web App Structure (sankofa_frontend/)

```
sankofa_frontend/
├── src/
│   ├── App.tsx           # Root component with routing
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles
│   ├── lib/              # Core utilities
│   │   ├── config.ts     # Environment configuration
│   │   ├── apiClient.ts  # HTTP client with auth
│   │   ├── apiException.ts
│   │   ├── caseConverter.ts  # snake_case ↔ camelCase
│   │   ├── ghanaPhone.ts     # Phone formatting
│   │   └── types.ts      # TypeScript interfaces
│   ├── services/         # API service layer
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── groupService.ts
│   │   ├── savingsService.ts
│   │   ├── transactionService.ts
│   │   ├── walletService.ts
│   │   └── notificationService.ts
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── providers/        # Theme provider
│   ├── components/       # Reusable components
│   │   ├── ProtectedRoute.tsx
│   │   ├── PrimaryButton.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── AppNav.tsx
│   │   └── WalletModal.tsx
│   └── routes/           # Page components
│       ├── Landing.tsx
│       ├── auth/         # Auth flows
│       ├── onboarding/   # Onboarding wizard
│       └── app/          # Authenticated app
├── assets/               # Static assets
├── tailwind.config.ts    # Tailwind configuration
├── vite.config.ts        # Vite configuration
├── package.json
└── Dockerfile
```

## Key Conventions

### Backend
- Use Django app structure for domain separation
- Business logic in `services.py`, not views
- All API endpoints under `/api/` prefix
- Admin endpoints under `/api/admin/`
- WebSocket endpoints under `/ws/`
- Tests mirror source structure in `tests/` subdirectory

### Frontend (React)
- Components in PascalCase files
- Services export functions, not classes
- API client handles auth token injection and refresh
- Case conversion utilities handle snake_case ↔ camelCase
- Protected routes wrap authenticated pages
- Context providers at app root

### Mobile (Flutter)
- Screens are full-page widgets in `screens/`
- Reusable widgets in `widgets/` or `ui/components/`
- Services handle API communication
- Models use factory constructors for JSON parsing
- Theme defined centrally in `theme.dart`
