# Business Logic

> Voir aussi: [api-endpoints.md](./api-endpoints.md) pour les routes, [database.md](./database.md) pour le schema, [enums-types.md](./enums-types.md) pour les valeurs

## Mission Lifecycle

```
ouverte → en_cours → resolue
                  ↘ expiree (auto J+30)
```

### Creation
- `POST /missions` → status `ouverte`, expiresAt = now + 30 jours
- Tags default: []
- Creator = authenticated user

### Update
- `PATCH /missions/:id` → creator only (ForbiddenException sinon)
- Peut changer: title, description, category, helpType, urgency, visibility, status, progressPercent, location, tags

### Close (Resolution)
- `POST /missions/:id/close` → creator only
- Sets: status = `resolue`, closedAt = now
- Optional: closureFeedback (retour d'experience), closureThanks (remerciement)
- Side effects:
  1. Notif `MISSION_CLOSED` a TOUS les contributeurs ACTIVE
  2. Si closureThanks fourni → notif `THANKS_RECEIVED` a chaque contributeur

### Expiration (Cron)
- File: `backend/src/crons/mission-expiration.cron.ts`
- Schedule: chaque jour a minuit (EVERY_DAY_AT_MIDNIGHT)
- **handleExpiration()**: missions ouvertes avec expiresAt < now → status `expiree` + notif `MISSION_EXPIRED` au creator
- **handleReminder()**: missions ouvertes avec expiresAt entre J+5 et J+6 → notif `MISSION_EXPIRING` au creator

## Contributions

### Engagement
- `POST /missions/:missionId/contributions` avec `{ type, message? }`
- Types: `participe`, `propose`, `finance`, `conseille`
- Contrainte UNIQUE: (userId, missionId, type) → un user ne peut contribuer qu'une fois par type par mission
- Side effect: notif `NEW_CONTRIBUTION` au creator de la mission

### Update
- `PATCH /contributions/:id` → owner only
- Peut changer: `message`

### Disengage
- `DELETE /contributions/:id` → owner only
- Soft delete: status passe a `annulee` (pas de suppression physique)

## Offers

### Creation
- `POST /offers` → status `ouverte`, expiresAt = now + 30 jours

### Close
- `POST /offers/:id/close` → creator only
- Sets: status = `cloturee`, closedAt = now
- Pas de notifications (contrairement aux missions)

## Matching Algorithm

File: `backend/src/matching/matching.service.ts`

### Score Calculation (max 100)

4 facteurs ponderes:

| Facteur | Poids | Calcul |
|---------|-------|--------|
| Tags overlap | 30 | 30 * (tags communs / total tags mission) |
| Category match | 25 | +25 si mission.category === offer.category |
| HelpType mapping | 25 | +25 si offerType compatible (voir mapping) |
| Geographic proximity | 20 | 20 * (1 - distance/maxRadius), si dans le rayon |

### HelpType → OfferType Mapping

| HelpType | OfferTypes compatibles |
|----------|----------------------|
| financiere | don |
| conseil | competence |
| materiel | materiel |
| relation | service, ecoute |

### Seuil minimum: score >= 10 pour creer une correlation

### Suggestions (`GET /matching/suggestions`)
- Prend les offres OUVERTE du user
- Compare avec toutes les missions OUVERTE (sauf les siennes)
- Deduplique, trie par score DESC
- Retourne top 20

### Correlation Storage
- Entity Correlation: (missionId, offerId, score)
- UNIQUE constraint: une seule correlation par paire mission-offer
- Accessible via GET `/missions/:id/correlations` et GET `/offers/:id/correlations`

## Notifications

### Types et declencheurs

| Type | Declencheur | Destinataire | Body |
|------|------------|--------------|------|
| NEW_CONTRIBUTION | Nouvelle contribution | Creator de la mission | "X a contribue a votre mission Y" |
| MISSION_CLOSED | Mission fermee | Tous contributeurs ACTIVE | closureThanks ou null |
| THANKS_RECEIVED | Fermeture avec remerciement | Contributeurs ACTIVE | closureThanks |
| MISSION_EXPIRING | J+25 (cron) | Creator | "Votre mission expire dans 5 jours" |
| MISSION_EXPIRED | J+30 (cron) | Creator | "Votre mission a expire" |
| CORRELATION_FOUND | (pas implemente) | - | - |

### Lecture
- `GET /users/me/notifications` → pagine, DESC par createdAt
- `GET /users/me/notifications/unread-count` → `{ count }`
- Frontend: polling toutes les 30s pour le badge

### Mark as read
- `PATCH /users/me/notifications/:id` → sets isRead = true
- Le service hardcode `isRead: true` (le DTO body est optionnel)

## Ownership Rules

| Action | Qui peut | Exception |
|--------|----------|-----------|
| Update mission | Creator only | 403 Forbidden |
| Close mission | Creator only | 403 Forbidden |
| Update contribution | Contributor only | 403 Forbidden |
| Delete contribution | Contributor only | 403 Forbidden |
| Update offer | Creator only | 403 Forbidden |
| Close offer | Creator only | 403 Forbidden |
| Mark notif read | Recipient only | 403 Forbidden |

## Pagination

Tous les endpoints listes:
- Default: page=1, limit=20
- Response: `{ data, total, page, limit, totalPages }`
- `totalPages = Math.ceil(total / limit)`
