# Database Schema

> Voir aussi: [enums-types.md](./enums-types.md) pour les valeurs d'enums, [business-logic.md](./business-logic.md) pour les regles metier

## Relations Overview

```
User 1──∞ Mission (creatorId)
User 1──∞ Contribution (userId)
User 1──∞ Offer (creatorId)
User 1──∞ Notification (userId)
Mission 1──∞ Contribution (missionId)
Mission 1──∞ Correlation (missionId)
Offer 1──∞ Correlation (offerId)
```

## User

File: `backend/src/users/entities/user.entity.ts`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| passwordHash | VARCHAR(255) | NOT NULL |
| displayName | VARCHAR(100) | NOT NULL |
| avatarUrl | TEXT | nullable |
| locationLat | FLOAT | nullable |
| locationLng | FLOAT | nullable |
| isPremium | BOOLEAN | default: false |
| createdAt | TIMESTAMP | auto |
| updatedAt | TIMESTAMP | auto-updated |

Relations: missions[], contributions[], offers[], notifications[]

## Mission

File: `backend/src/missions/entities/mission.entity.ts`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| creatorId | UUID | FK → User, NOT NULL |
| title | VARCHAR(120) | NOT NULL |
| description | TEXT | NOT NULL |
| category | VARCHAR | MissionCategory enum |
| helpType | VARCHAR | HelpType enum |
| urgency | VARCHAR | Urgency enum |
| visibility | VARCHAR | default: 'public' |
| locationLat | FLOAT | nullable |
| locationLng | FLOAT | nullable |
| locationRadiusKm | INT | default: 10 |
| status | VARCHAR | default: 'ouverte' |
| progressPercent | INT | default: 0, range 0-100 |
| tags | simple-array | default: [] |
| createdAt | TIMESTAMP | auto |
| expiresAt | TIMESTAMP | set to now+30d on create |
| closedAt | TIMESTAMP | nullable, set on close |
| closureFeedback | TEXT | nullable |
| closureThanks | TEXT | nullable |

Relations: creator (User), contributions[], correlations[]

## Contribution

File: `backend/src/contributions/entities/contribution.entity.ts`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User, NOT NULL |
| missionId | UUID | FK → Mission, NOT NULL |
| type | VARCHAR | ContributionType enum |
| message | TEXT | nullable |
| status | VARCHAR | default: 'active' |
| createdAt | TIMESTAMP | auto |

**UNIQUE constraint**: (userId, missionId, type)
Relations: user (User), mission (Mission)

## Offer

File: `backend/src/offers/entities/offer.entity.ts`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| creatorId | UUID | FK → User, NOT NULL |
| title | VARCHAR(120) | NOT NULL |
| description | TEXT | NOT NULL |
| category | VARCHAR | MissionCategory enum |
| offerType | VARCHAR | OfferType enum |
| visibility | VARCHAR | default: 'public' |
| locationLat | FLOAT | nullable |
| locationLng | FLOAT | nullable |
| locationRadiusKm | INT | default: 10 |
| status | VARCHAR | default: 'ouverte' |
| tags | simple-array | default: [] |
| availability | TEXT | nullable |
| createdAt | TIMESTAMP | auto |
| expiresAt | TIMESTAMP | set to now+30d on create |
| closedAt | TIMESTAMP | nullable |

Relations: creator (User), correlations[]

## Correlation

File: `backend/src/correlations/entities/correlation.entity.ts`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| missionId | UUID | FK → Mission, NOT NULL |
| offerId | UUID | FK → Offer, NOT NULL |
| score | FLOAT | matching score (0-100) |
| createdAt | TIMESTAMP | auto |

**UNIQUE constraint**: (missionId, offerId)
Relations: mission (Mission), offer (Offer)

## Notification

File: `backend/src/notifications/entities/notification.entity.ts`

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, auto-generated |
| userId | UUID | FK → User, NOT NULL |
| type | VARCHAR | NotificationType enum |
| title | VARCHAR(200) | NOT NULL |
| body | TEXT | nullable |
| referenceType | VARCHAR | ReferenceType enum, nullable |
| referenceId | VARCHAR | UUID string, nullable |
| isRead | BOOLEAN | default: false |
| createdAt | TIMESTAMP | auto |

Relations: user (User)

## Notes

- TypeORM `synchronize: true` → schema auto-créé au démarrage
- Tags stockés en `simple-array` (virgule-separated dans SQLite)
- Geo queries : calcul de distance en mémoire (pas de PostGIS)
- DB file : `backend/gr_attitude.sqlite` (dev et prod)
- Prod path : `/opt/entraidance/backend/gr_attitude.sqlite`
- Backup : `cp gr_attitude.sqlite gr_attitude.sqlite.bak`
