# Deployment

> Voir aussi: [architecture.md](./architecture.md) pour la stack

## Render (Production)

Config: `render.yaml` a la racine du monorepo.

### Services

**gr-attitude-api** (Backend)
- Runtime: Node.js, Plan: free
- Root: `backend/`
- Build: `npm install && npm run build`
- Start: `node dist/main`
- Env vars:
  - `NODE_ENV=production`
  - `DB_TYPE=postgres`
  - `DATABASE_URL` (auto from Render DB)
  - `JWT_SECRET` (auto-generated)
  - `CORS_ORIGIN=https://gr-attitude-web.onrender.com`

**gr-attitude-web** (Frontend)
- Runtime: Node.js, Plan: free
- Root: `frontend/`
- Build: `npm install && npm run build`
- Start: `npm run start`
- Env vars:
  - `NODE_ENV=production`
  - `NEXT_PUBLIC_API_URL=https://gr-attitude-api.onrender.com`

**gr-attitude-db** (Database)
- PostgreSQL, Plan: free
- Database: `gr_attitude`, User: `gr_user`

### Deploy Trigger

Auto-deploy on push to `master` branch (GitHub integration).
Manual: Render dashboard → "Manual Deploy" → "Deploy latest commit".

## Docker Compose (Local Dev)

File: `docker-compose.yml`

```
postgres:  postgis/postgis:16-3.4  →  port 5432
redis:     redis:7-alpine          →  port 6379
```

Credentials: `gr_user` / `gr_password` / `gr_attitude`
Volumes: `pgdata`, `redisdata`

## Environment Variables

File: `.env.example` (copier vers `.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_USERNAME | gr_user | DB username |
| DB_PASSWORD | gr_password | DB password |
| DB_DATABASE | gr_attitude | DB name |
| DB_TYPE | (empty=sqlite) | `postgres` pour PostgreSQL |
| DATABASE_URL | (none) | Render connection string (overrides individual vars) |
| REDIS_HOST | localhost | Redis host |
| REDIS_PORT | 6379 | Redis port |
| JWT_SECRET | dev-secret-key | JWT signing secret |
| JWT_EXPIRES_IN | 7d | Token expiration |
| BACKEND_PORT | 3001 | Backend listen port |
| PORT | (none) | Overrides BACKEND_PORT (used by Render) |
| FRONTEND_URL | http://localhost:3000 | For CORS |
| CORS_ORIGIN | (none) | Overrides FRONTEND_URL for CORS |
| NEXT_PUBLIC_API_URL | http://localhost:3001 | Frontend API base URL |

## Database Config Logic

File: `backend/src/config/database.config.ts`

```
if DB_TYPE === 'postgres':
  if DATABASE_URL → parse connection string
  else → use individual DB_HOST/PORT/USERNAME/PASSWORD/DATABASE
  PostGIS geo queries available
else:
  SQLite with better-sqlite3
  File: ./gr_attitude.sqlite
  Geo queries skipped
```

## Seed Data

```bash
cd backend && npm run seed
```

Creates: 5 users (password: `password123`), 10 missions, 5 contributions, 3 offers.
Idempotent: skips if users already exist.
