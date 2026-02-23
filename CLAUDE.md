# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GR attitude** is a structured mutual aid platform — an action-oriented social network for organizing help requests (Missions) and help offers (Offres). The platform transforms needs into structured "tickets" that can be tracked from creation to resolution.

**Current Status**: ✅ **Active Development** — Functional prototype with backend API and frontend UI.

## Core Concepts

- **Mission**: A structured help request with fields for title, description, category, help_type (financière/conseil/matériel/relation), urgency, location, and status (ouverte → en_cours → résolue/expirée)
- **Offre**: A help offer that auto-correlates with matching Missions
- **Contribution**: User engagement on a Mission (types: participe/propose/finance/conseille)
- **Matching**: Algorithm correlating Missions ↔ Offres based on tags, geography, help type, and recency

## Implemented Technology Stack

### Backend (NestJS)
- **Framework**: NestJS 11.0.1
- **Language**: TypeScript 5
- **Database**: SQLite (better-sqlite3 12.6.2) with TypeORM 11.0.0
  - ⚠️ **Note**: PRD mentions PostgreSQL + PostGIS, but current implementation uses SQLite for MVP
- **Auth**: Passport (JWT + OAuth2 Google/Facebook), bcrypt 6.0.0
- **Security**: Helmet 8.1.0, Throttler 6.5.0
- **Scheduled Tasks**: @nestjs/schedule 6.1.1

### Frontend (Next.js)
- **Framework**: Next.js 16.1.6 + React 19.2.3
- **Language**: TypeScript 5
- **State Management**: TanStack React Query 5.90.21
- **UI**: Radix UI + Tailwind CSS 4 + shadcn/ui
- **Icons**: Lucide React
- **Themes**: next-themes 0.4.6

### Shared Types
- Located in `/shared` directory
- Shared TypeScript types/interfaces between frontend and backend

### Infrastructure
- **Containerization**: Docker Compose (docker-compose.yml)
- **Deployment**: Render.com (render.yaml configured)
- **Development**: `dev.sh` script for quick start

## Project Structure

```
gr-attitude/
├── backend/               # NestJS API
│   ├── src/
│   │   ├── auth/         # JWT + OAuth2 (Google/Facebook)
│   │   ├── missions/     # Mission CRUD + business logic
│   │   ├── offers/       # Offer CRUD
│   │   ├── contributions/# User engagement
│   │   ├── correlations/ # Matching engine
│   │   ├── matching/     # Correlation algorithm
│   │   ├── notifications/
│   │   ├── users/
│   │   ├── crons/        # Scheduled tasks (expiration, reminders)
│   │   └── seeds/        # Test data
│   └── dist/             # Compiled TypeScript
│
├── frontend/             # Next.js App Router
│   ├── src/
│   │   ├── app/          # Next.js 16 App Router
│   │   │   ├── (auth)/   # Auth pages (login, register)
│   │   │   ├── missions/ # Mission pages
│   │   │   ├── offers/   # Offer pages
│   │   │   ├── notifications/
│   │   │   └── profile/
│   │   ├── hooks/        # 15+ React Query hooks
│   │   └── lib/          # Utils (api, auth, types)
│   └── node_modules/
│
├── shared/               # Shared TypeScript types
├── docs/                 # Technical documentation (12 files)
├── PRD.md                # Product Requirements Document (607+ lines)
└── docker-compose.yml    # Local orchestration
```

## Key Files

- **Backend entry**: `backend/src/main.ts`
- **Frontend entry**: `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`
- **Environment**: 
  - Backend: `backend/.env` (see `.env.example`)
  - Frontend: `frontend/.env.local`
- **Types**: `shared/src/`

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional, for PostgreSQL/Redis)

### Quick Start

```bash
# 1. Clone and install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../shared && npm install

# 2. Setup environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your OAuth credentials

# 3. Run development servers
# Option A: Using dev script
./dev.sh

# Option B: Manual
cd backend && npm run start:dev    # http://localhost:3001
cd frontend && npm run dev          # http://localhost:3000
```

### Database

Current: **SQLite** (local file-based database)
- Dev DB: `backend/dev.db` (created automatically)
- Seeding: `npm run seed` in backend/

Future (Production): **PostgreSQL + PostGIS** recommended for geospatial queries and scalability.

### OAuth Setup

Configure Google and Facebook OAuth in `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3001/auth/facebook/callback
```

See `docs/auth.md` for detailed setup instructions.

## API Structure

Full endpoint specification in PRD (§11.4) and `docs/api-endpoints.md`.

Main resource groups:
- `/auth/*` - Authentication (JWT, OAuth2, RGPD account deletion)
- `/missions/*` - Mission CRUD, closure, contributions, correlations
- `/offers/*` - Offer CRUD and correlations
- `/contributions/*` - User engagement
- `/notifications/*` - User notifications
- `/users/me/*` - Profile, stats, notifications

## Testing

⚠️ **Current Status**: No tests implemented yet.

**Recommended** (Post-MVP):
- Backend: Jest + Supertest for e2e API tests
- Frontend: Vitest + Testing Library
- Focus: Auth flows, Mission CRUD, Matching algorithm

## CI/CD

⚠️ **Current Status**: No CI/CD pipeline.

**Recommended**: GitHub Actions workflow for:
- Lint (backend + frontend)
- Build verification
- Auto-deploy to Render on `main` push

## Architecture Decisions

### Current (MVP)
- SQLite for rapid prototyping
- Monorepo with separate backend/frontend/shared
- JWT + OAuth2 for authentication
- React Query for client state management

### Future Considerations (Production)
- **Database**: Migrate to PostgreSQL + PostGIS for geospatial queries and concurrency
- **Caching**: Add Redis for sessions and matching cache
- **Storage**: S3 or similar for user-uploaded images
- **Monitoring**: Add Prometheus/Grafana for performance metrics

## Product Principles

- **Radical simplicity** — minimal friction to publish a need
- **Bilateral responsibility** — both requester and helper are actors
- **Transparency** — immutable history, visible progress
- **Non-toxic gamification** — private stats only, no public leaderboards
- **No humiliation** of help-seekers
- **Action over scroll** — this is not a social feed

## MVP Priorities (in order)

1. ✅ Mission creation with guided form
2. ✅ 4-type engagement system on Missions
3. ✅ Simple correlation (tags + geography)
4. ✅ Closure workflow with notifications
5. ✅ Exploration feed with filters
6. ✅ Offer creation
7. ✅ User profile + history

## Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (configured)
- **Linting**: ESLint (NestJS + Next.js configs)
- **Naming**: 
  - Components: PascalCase
  - Functions/variables: camelCase
  - Files: kebab-case for pages, PascalCase for components

## Documentation

- **Technical docs**: `/docs` directory (12 files covering architecture, API, DTOs, etc.)
- **Product spec**: `PRD.md` (comprehensive product requirements)
- **Audit**: `AUDIT-WINSTON-2026-02-23.md` (architecture review and recommendations)

## Support

For questions or issues:
1. Check `docs/` for technical documentation
2. Review `PRD.md` for product specifications
3. Consult `AUDIT-WINSTON-2026-02-23.md` for architecture insights
