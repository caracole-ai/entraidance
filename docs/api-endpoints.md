# API Endpoints

> Voir aussi: [auth.md](./auth.md) pour le flow JWT, [dtos.md](./dtos.md) pour les bodies detailles, [business-logic.md](./business-logic.md) pour les regles metier

Base URL: `http://localhost:3001` (dev) / `https://gr-attitude-api.onrender.com` (prod)

## Auth

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/auth/register` | - | `{ email, password, displayName }` | `{ accessToken, user }` |
| POST | `/auth/login` | - | `{ email, password }` | `{ accessToken, user }` |
| POST | `/auth/change-password` | JWT | `{ currentPassword?, newPassword }` | `{ message }` |
| GET | `/auth/google` | - | - | Redirect → Google consent |
| GET | `/auth/google/callback` | - | - | Redirect → frontend with JWT |
| GET | `/auth/facebook` | - | - | Redirect → Facebook login |
| GET | `/auth/facebook/callback` | - | - | Redirect → frontend with JWT |

## Users / Profile

| Method | Path | Auth | Body/Query | Response |
|--------|------|------|------------|----------|
| GET | `/users/me` | JWT | - | User (sans passwordHash) |
| PATCH | `/users/me` | JWT | `{ displayName?, avatarUrl? }` | User |
| DELETE | `/users/me` | JWT | - | `{ message }` (account deletion) |
| GET | `/users/me/export` | JWT | - | User data export (GDPR) |
| PATCH | `/users/me/profile` | JWT | UpdateProfileDto | User + profileCompletion |
| GET | `/users/me/profile-completion` | JWT | - | `{ profileCompletion: number }` |
| GET | `/users/me/missions` | JWT | - | Mission[] |
| GET | `/users/me/contributions` | JWT | - | Contribution[] (with mission) |
| GET | `/users/me/stats` | JWT | - | `{ missionsCreated, missionsResolved, contributionsGiven, offersCreated }` |

## Missions

| Method | Path | Auth | Body/Query | Response |
|--------|------|------|------------|----------|
| GET | `/missions` | - | Query: category, helpType, urgency, status, tags, search, lat, lng, radiusKm, page, limit | `{ data: Mission[], total, page, limit, totalPages }` |
| GET | `/missions/search` | - | Query: SearchMissionsDto | `{ data: Mission[], total, page, limit, totalPages }` |
| POST | `/missions` | JWT | CreateMissionDto | Mission |
| GET | `/missions/:id` | - | - | Mission (with creator, contributions) |
| PATCH | `/missions/:id` | JWT | UpdateMissionDto | Mission (creator only) |
| DELETE | `/missions/:id` | JWT | - | 204 No Content (creator only) |
| POST | `/missions/:id/close` | JWT | `{ closureFeedback?, closureThanks? }` | Mission (creator only) |
| GET | `/missions/:id/contributions` | - | - | Contribution[] |
| GET | `/missions/:id/correlations` | - | - | Correlation[] (score DESC) |

## Contributions

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/missions/:missionId/contributions` | JWT | `{ type, message? }` | Contribution |
| PATCH | `/contributions/:id` | JWT | `{ message? }` | Contribution (owner only) |
| DELETE | `/contributions/:id` | JWT | - | void (owner only, soft-delete → status ANNULEE) |

## Offers

| Method | Path | Auth | Body/Query | Response |
|--------|------|------|------------|----------|
| GET | `/offers` | - | Query: category, offerType, search, tags, lat, lng, radiusKm, page, limit | `{ data: Offer[], total, page, limit, totalPages }` |
| POST | `/offers` | JWT | CreateOfferDto | Offer |
| GET | `/offers/:id` | - | - | Offer (with creator) |
| PATCH | `/offers/:id` | JWT | UpdateOfferDto | Offer (creator only) |
| DELETE | `/offers/:id` | JWT | - | 204 No Content (creator only) |
| POST | `/offers/:id/close` | JWT | - | Offer (creator only) |
| GET | `/offers/:id/correlations` | - | - | Correlation[] (score DESC) |

## Notifications

| Method | Path | Auth | Body/Query | Response |
|--------|------|------|------------|----------|
| GET | `/users/me/notifications` | JWT | Query: page?, limit? | `{ data: Notification[], total, page, limit }` |
| GET | `/users/me/notifications/unread-count` | JWT | - | `{ count: number }` |
| PATCH | `/users/me/notifications/:id` | JWT | `{ isRead?: boolean }` | Notification (owner only) |

## Matching

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/matching/suggestions` | JWT | `Array<{ mission, offer?, score }>` (top 20) |

## Seeding

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/seed/status` | - | - | Seed status information |
| POST | `/seed` | - | - | `{ message, counts: { users, missions, offers, contributions } }` |
| POST | `/seed/clear` | - | - | `{ message, deletedCounts }` |
| POST | `/seed/sync-schema` | - | - | `{ message }` |

## Error Response Format

Toutes les erreurs suivent ce format (via HttpExceptionFilter global):

```json
{
  "statusCode": 400,
  "message": "Error description",
  "timestamp": "2026-02-21T10:00:00.000Z"
}
```

Codes courants: 400 (validation), 401 (non authentifie), 403 (pas le owner), 404 (not found), 409 (conflit email)

## Pagination

Endpoints pagines (`/missions`, `/offers`, `/users/me/notifications`):

- Query params: `page` (default 1), `limit` (default 20)
- Response: `{ data: T[], total, page, limit, totalPages }`
- `totalPages = Math.ceil(total / limit)`
