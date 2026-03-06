# Admin Panel

> Internal moderation panel for managing users, needs, offers, and contributions.
> Intended for project administrators only. Completely separate from the public-facing user authentication.

## Architecture

### Backend (`backend/src/admin/`)

```
admin.module.ts                 -- NestJS module, registers JWT, TypeORM entities, controllers, providers
admin-auth.controller.ts        -- POST /admin/login (public)
admin-auth.service.ts           -- Validates credentials, signs admin JWT
admin.guard.ts                  -- AdminGuard: reads admin_token cookie, verifies JWT
admin-moderation.controller.ts  -- CRUD endpoints for users/needs/offers/contributions/stats (guarded)
admin-moderation.service.ts     -- TypeORM queries for listing and deleting entities
```

`AdminModule` is self-contained: it imports its own `JwtModule.register()` with a dedicated secret (`ADMIN_JWT_SECRET`), separate from the user-facing `JwtModule` used by `AuthModule`.

### Frontend (`frontend/src/app/admin/`)

```
page.tsx              -- Redirect to /admin/login
layout.tsx            -- Sidebar layout with nav + logout button
login/page.tsx        -- Login form
dashboard/page.tsx    -- Stats overview (card grid with counts)
users/page.tsx        -- Users table with delete
needs/page.tsx        -- Needs (missions) table with delete
offers/page.tsx       -- Offers table with delete
contributions/page.tsx -- Contributions table with delete
```

All pages (except login) check `sessionStorage.admin_logged_in` on mount and redirect to `/admin/login` if absent. API calls use `credentials: 'include'` so the browser sends the `admin_token` cookie automatically. On 401 responses, pages clear sessionStorage and redirect to login.

## Authentication Flow

1. Admin submits username + password to `POST /admin/login`.
2. `AdminAuthService.login()` checks credentials (currently hardcoded).
3. On success, a JWT is signed with payload `{ sub: "admin", role: "admin" }` and `ADMIN_JWT_SECRET`.
4. The controller sets an `admin_token` cookie: `httpOnly`, `sameSite: strict`, `maxAge: 8h`.
5. Response body is `{ message: "ok" }`.
6. Frontend stores `admin_logged_in = "true"` in `sessionStorage` (UI-only flag, not a security mechanism).
7. Subsequent API calls include the cookie automatically (`credentials: 'include'`).
8. `AdminGuard` extracts `admin_token` from the `Cookie` header, verifies the JWT, and allows or denies access.

```
Browser                       Backend
  |-- POST /admin/login ------->|
  |   { username, password }    |  AdminAuthService.login()
  |<-- Set-Cookie: admin_token -|  JWT signed with ADMIN_JWT_SECRET
  |                             |
  |-- GET /admin/users -------->|
  |   Cookie: admin_token       |  AdminGuard.canActivate() -> verify JWT
  |<-- 200 [...users] ---------|
```

## API Reference

All endpoints are prefixed with `/admin`. Moderation endpoints require the `admin_token` cookie (enforced by `AdminGuard`).

### Authentication

| Method | Path | Auth | Request Body | Response |
|--------|------|------|--------------|----------|
| POST | `/admin/login` | No | `{ "username": string, "password": string }` | `{ "message": "ok" }` + `Set-Cookie: admin_token` |

On failure: `401 Unauthorized` with `{ "message": "Invalid credentials" }`.

### Moderation (all require `admin_token` cookie)

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/admin/users` | List all users | `[{ id, email, displayName, createdAt }]` |
| DELETE | `/admin/users/:id` | Delete a user | `{ "deleted": true }` |
| GET | `/admin/needs` | List all needs (missions) | `[{ id, title, category, status, creatorId, createdAt }]` |
| DELETE | `/admin/needs/:id` | Delete a need | `{ "deleted": true }` |
| GET | `/admin/offers` | List all offers | `[{ id, title, category, offerType, status, creatorId, createdAt }]` |
| DELETE | `/admin/offers/:id` | Delete an offer | `{ "deleted": true }` |
| GET | `/admin/contributions` | List all contributions | `[{ id, userId, missionId, type, status, createdAt }]` |
| DELETE | `/admin/contributions/:id` | Delete a contribution | `{ "deleted": true }` |
| GET | `/admin/stats` | Aggregate counts | `{ "users": number, "missions": number, "offers": number, "contributions": number }` |

All moderation endpoints return `401 Unauthorized` if the cookie is missing or the JWT is invalid/expired.

## Frontend Pages

| Route | Page | Purpose |
|-------|------|---------|
| `/admin` | `page.tsx` | Redirects to `/admin/login` |
| `/admin/login` | `login/page.tsx` | Username/password form, calls `POST /admin/login` |
| `/admin/dashboard` | `dashboard/page.tsx` | Displays stat cards (users, needs, offers, contributions counts) linking to detail pages |
| `/admin/users` | `users/page.tsx` | Table of all users with delete button |
| `/admin/needs` | `needs/page.tsx` | Table of all needs with delete button |
| `/admin/offers` | `offers/page.tsx` | Table of all offers with delete button |
| `/admin/contributions` | `contributions/page.tsx` | Table of all contributions with delete button |

The layout (`layout.tsx`) renders a sidebar with navigation links and a logout button. The login page renders without the sidebar.

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ADMIN_JWT_SECRET` | `admin-secret-key` | Secret used to sign and verify admin JWTs. **Must be changed in production.** |

The JWT is configured in `AdminModule` via `JwtModule.register()` with `expiresIn: '8h'`.

### Credentials

Admin credentials are currently hardcoded in `AdminAuthService.login()` (`admin-auth.service.ts:12`). To change them, modify the `if` check in that method. Consider moving credentials to environment variables for production use.

## Adding a New Entity to the Admin Panel

Example: adding a "Reports" entity.

### 1. Backend Service

In `admin-moderation.service.ts`:

```typescript
// Add the repository injection
@InjectRepository(Report)
private readonly reportRepo: Repository<Report>,

// Add methods
getReports() {
  return this.reportRepo.find({
    select: ['id', 'reason', 'status', 'createdAt'],
  });
}

deleteReport(id: string) {
  return this.reportRepo.delete(id);
}
```

### 2. Backend Controller

In `admin-moderation.controller.ts`:

```typescript
@Get('reports')
getReports() {
  return this.moderationService.getReports();
}

@Delete('reports/:id')
async deleteReport(@Param('id') id: string) {
  await this.moderationService.deleteReport(id);
  return { deleted: true };
}
```

### 3. Backend Module

In `admin.module.ts`, add the entity to `TypeOrmModule.forFeature([..., Report])`.

### 4. Update Stats (optional)

In `admin-moderation.service.ts`, add the count to `getStats()`:

```typescript
const [users, missions, offers, contributions, reports] = await Promise.all([
  ...existing counts...,
  this.reportRepo.count(),
]);
return { users, missions, offers, contributions, reports };
```

### 5. Frontend Page

Create `frontend/src/app/admin/reports/page.tsx` following the pattern of existing pages (e.g., `needs/page.tsx`):
- Define an interface for the entity
- Fetch from `GET /admin/reports` with `credentials: 'include'`
- Render a table with a delete button per row
- Handle 401 redirects to login

### 6. Frontend Navigation

In `frontend/src/app/admin/layout.tsx`, add an entry to `NAV_ITEMS`:

```typescript
{ href: '/admin/reports', label: 'Reports', icon: Flag },
```

## Security Notes

- **Separate JWT**: The admin panel uses its own `JwtModule` registration with `ADMIN_JWT_SECRET`, completely independent from the user-facing JWT (`JWT_SECRET`). An admin token cannot authenticate as a regular user and vice versa.
- **httpOnly cookie**: The `admin_token` cookie is set with `httpOnly: true`, preventing JavaScript from reading it. This mitigates XSS-based token theft. The cookie is also `sameSite: 'strict'`, preventing CSRF in modern browsers.
- **sessionStorage flag**: The `admin_logged_in` value in sessionStorage is a UI convenience flag only. It controls client-side redirects but provides no security -- the real auth check happens server-side via `AdminGuard`.
- **No RBAC**: There is currently a single admin role with full access to all entities. The guard checks JWT validity but not specific permissions.
- **Hardcoded credentials**: Admin username and password are hardcoded in source code. For production, these should be moved to environment variables or a database with hashed passwords.
- **Token expiry**: Admin JWTs expire after 8 hours. The cookie `maxAge` matches this duration.
