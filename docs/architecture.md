# Architecture

> Voir aussi: [deployment.md](./deployment.md) pour config prod, [database.md](./database.md) pour schema DB

## Monorepo Structure

```
manolo/
├── shared/           TypeScript enums + interfaces (source of truth)
│   └── src/
│       ├── constants/enums.ts
│       └── types/ (user, mission, offer, contribution, correlation, notification, auth)
├── backend/          NestJS API (port 3001)
│   └── src/
│       ├── auth/           Register, login, JWT
│       ├── users/          Profile, stats, my missions
│       ├── missions/       CRUD + close + contributions + correlations
│       ├── contributions/  Engage, update, disengage
│       ├── offers/         CRUD + close + correlations
│       ├── correlations/   Entity + service (no controller)
│       ├── matching/       Algorithm: tags + geo + category + helpType
│       ├── notifications/  CRUD + mark read + unread count
│       ├── crons/          Mission expiration (J+30) + reminder (J+25)
│       ├── common/         Guards, decorators, filters
│       ├── config/         Database + Redis config
│       └── seeds/          Demo data (5 users, 10 missions, 5 contribs, 3 offers)
└── frontend/         Next.js 16 App Router (port 3000)
    └── src/
        ├── app/            Pages (missions, offers, profile, notifications, auth)
        ├── components/     Layout (Header, Footer, MobileNav, NotificationBell) + Metier
        ├── hooks/          React Query hooks (1 hook = 1 API call)
        ├── lib/            api.ts (client), types.ts, auth.ts (token mgmt)
        └── providers/      AuthProvider (JWT context), QueryProvider (React Query)
```

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Backend framework | NestJS | 11.0.1 |
| ORM | TypeORM | 0.3.28 |
| DB production | PostgreSQL + PostGIS | 16-3.4 |
| DB dev local | SQLite (better-sqlite3) | 12.6.2 |
| Cache | Redis | 7 |
| Auth | Passport + JWT + bcrypt | |
| Frontend framework | Next.js (App Router) | 16.1.6 |
| React | React | 19.2.3 |
| UI library | shadcn/ui (Radix + Tailwind) | |
| State management | TanStack React Query | 5.90.21 |
| CSS | Tailwind CSS | 4 |
| Icons | Lucide React | |
| Toasts | Sonner | |
| Language | TypeScript | 5.7.3 |

## Ports & URLs

| Service | Dev | Prod (Render) |
|---------|-----|----------------|
| Backend API | http://localhost:3001 | https://gr-attitude-api.onrender.com |
| Frontend | http://localhost:3000 | https://gr-attitude-web.onrender.com |
| PostgreSQL | localhost:5432 | Render managed DB |
| Redis | localhost:6379 | N/A (not used in prod yet) |

## Data Flow

```
Browser → Next.js (CSR) → fetch(API_URL) → NestJS → TypeORM → PostgreSQL/SQLite
                              ↓
                        Bearer JWT token
                        (localStorage)
```

- Frontend = pure client-side rendering (no SSR auth)
- API = REST JSON, no GraphQL
- Auth = JWT in localStorage, sent via Authorization header
- Notifications = polling every 30s (no WebSocket)

## Key Design Decisions

- `synchronize: true` en dev (auto-schema, no migrations for MVP)
- PostGIS queries only when `DB_TYPE=postgres` (SQLite fallback skips geo)
- Global ValidationPipe: `whitelist: true, transform: true`
- Global HttpExceptionFilter: consistent `{ statusCode, message, timestamp }`
- UI in French, no i18n
- Private stats only (no public leaderboards)
- Missions expire at J+30 with J+25 reminder (cron daily midnight)
