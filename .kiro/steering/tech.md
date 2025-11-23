# Technology Stack

## Backend (sankofa_backend)

**Framework**: Django 5.1 + Django REST Framework 3.15

**Key Libraries**:
- `djangorestframework-simplejwt` - JWT authentication
- `channels` + `channels-redis` - WebSocket support for real-time updates
- `celery` + `redis` - Background task processing
- `psycopg2-binary` - PostgreSQL adapter
- `Pillow` - Image processing for KYC documents
- `whitenoise` - Static file serving

**Database**: PostgreSQL (production), SQLite (testing)

**Architecture**:
- App-based structure: `accounts`, `groups`, `savings`, `transactions`, `disputes`, `notifications`, `admin_api`, `common`
- Custom User model with Ghana phone numbers as primary credential
- JWT access/refresh tokens for authentication
- Environment-specific settings in `core/settings/` (base, local, production)

### Common Commands

```bash
# Backend development
cd sankofa_backend
python manage.py runserver
python manage.py migrate
python manage.py test
python manage.py createsuperuser

# Run with SQLite for testing
DJANGO_DB_ENGINE=sqlite python manage.py test

# Celery workers
celery -A core worker -l info
celery -A core beat -l info

# Run full stack locally
docker compose -f docker-compose.local.yml up --build
```

## Mobile App (sankofa_app)

**Framework**: Flutter 3.6+ with Dart

**Key Packages**:
- `http` - API client
- `shared_preferences` - Local storage for tokens
- `google_fonts` - Typography
- `image_picker` - KYC document capture
- `flutter_contacts` - Contact picker for group invites
- `flutter_multi_formatter` - Ghana phone formatting
- `intl` - Date/currency formatting

### Common Commands

```bash
cd sankofa_app
flutter pub get
flutter run
flutter build apk
flutter build ios
flutter test
```

## Admin Console (sankofa_admin)

**Framework**: React 18 + TypeScript + Vite

**Key Libraries**:
- `react-router-dom` - Routing
- `@tanstack/react-query` - Data fetching/caching
- `@radix-ui/*` - Headless UI components
- `tailwindcss` - Styling
- `recharts` - Analytics charts
- `react-hook-form` + `zod` - Form validation
- `lucide-react` - Icons

### Common Commands

```bash
cd sankofa_admin
npm install
npm run dev          # Development server on :5173
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
```

## Web App (sankofa_frontend)

**Framework**: React 18 + TypeScript + Vite

**Key Libraries**:
- `react-router-dom` - Routing
- `@headlessui/react` - UI components
- `@heroicons/react` - Icons
- `@tanstack/react-table` - Data tables
- `tailwindcss` - Styling

### Common Commands

```bash
cd sankofa_frontend
npm install
npm run dev          # Development server on :5174
npm run build        # Production build
npm run preview      # Preview production build
```

## Infrastructure

**Local Development**: Docker Compose orchestrates PostgreSQL, Redis, Django, Celery, and frontend dev servers

**Production**: Coolify deployment with dynamic port assignment

**Environment Variables**:
- `.env.local.example` - Local development template
- `.env.production.example` - Production configuration template
- Each client has its own `.env` for API base URLs

## API Conventions

- **Authentication**: JWT Bearer tokens in `Authorization` header
- **Case Convention**: Backend uses snake_case, clients expect camelCase (conversion handled by client utilities)
- **Pagination**: Standard DRF pagination with `count`, `next`, `previous`, `results`
- **Error Format**: `{"detail": "error message"}` or `{"field": ["error"]}`
- **WebSocket**: `/ws/groups/<group_id>/?token=<jwt>` for real-time group updates
