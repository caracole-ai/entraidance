# Enums & Shared Types

> Source of truth: `shared/src/constants/enums.ts` + `shared/src/types/`
> Utilise par: backend (entities, DTOs) et frontend (types.ts mirrors these)

## Enums

### MissionStatus
| Value | Description |
|-------|------------|
| `ouverte` | Mission ouverte, accepte des contributions |
| `en_cours` | Mission en cours de resolution |
| `resolue` | Mission fermee par le creator |
| `expiree` | Mission expiree automatiquement (J+30) |

### HelpType
| Value | Description | OfferTypes compatibles |
|-------|------------|----------------------|
| `financiere` | Aide financiere | don |
| `conseil` | Conseil / expertise | competence |
| `materiel` | Pret / don materiel | materiel |
| `relation` | Mise en relation | service, ecoute |

### Urgency
| Value | Description | UI Color |
|-------|------------|----------|
| `faible` | Pas urgent | emerald (vert) |
| `moyen` | Urgent moyen | amber (orange) |
| `urgent` | Tres urgent | red (rouge) |

### Visibility
| Value | Description |
|-------|------------|
| `public` | Visible par tous |
| `groupe` | Visible par le groupe uniquement |
| `prive` | Visible par le creator uniquement |

### MissionCategory
| Value | Label FR |
|-------|---------|
| `demenagement` | Demenagement |
| `bricolage` | Bricolage |
| `numerique` | Numerique |
| `administratif` | Administratif |
| `garde_enfants` | Garde d'enfants |
| `transport` | Transport |
| `ecoute` | Ecoute |
| `emploi` | Emploi |
| `alimentation` | Alimentation |
| `animaux` | Animaux |
| `education` | Education |
| `autre` | Autre |

### ContributionType
| Value | Description | UI Color | Icon |
|-------|------------|----------|------|
| `participe` | Participe activement | blue-600 | HandHelping |
| `propose` | Propose une solution | purple-600 | Lightbulb |
| `finance` | Soutien financier | emerald-600 | Coins |
| `conseille` | Donne un conseil | amber-600 | MessageCircle |

### ContributionStatus
| Value | Description |
|-------|------------|
| `active` | Contribution en cours |
| `terminee` | Contribution terminee |
| `annulee` | Contribution annulee (soft delete) |

### OfferType
| Value | Description | UI Color |
|-------|------------|----------|
| `don` | Don (argent, biens) | blue |
| `competence` | Competence / expertise | purple |
| `materiel` | Materiel a preter/donner | orange |
| `service` | Service a rendre | green |
| `ecoute` | Ecoute / soutien moral | pink |

### OfferStatus
| Value | Description |
|-------|------------|
| `ouverte` | Offre active |
| `en_cours` | Offre en cours d'utilisation |
| `cloturee` | Offre fermee par le creator |
| `expiree` | Offre expiree automatiquement |

### NotificationType
| Value | Declencheur |
|-------|------------|
| `new_contribution` | Nouvelle contribution sur une mission |
| `mission_closed` | Mission fermee par son creator |
| `mission_expiring` | Mission expire dans 5 jours (cron J+25) |
| `mission_expired` | Mission expiree (cron J+30) |
| `correlation_found` | Correlation trouvee (pas implemente) |
| `thanks_received` | Remerciement recu lors de la fermeture |

### ReferenceType
| Value | Description |
|-------|------------|
| `mission` | Reference une mission |
| `offer` | Reference une offre |
| `contribution` | Reference une contribution |

## Shared Interfaces

Fichiers: `shared/src/types/*.ts`

### IUser
`{ id, email, displayName, avatarUrl?, locationLat?, locationLng?, isPremium, createdAt, updatedAt }`

### IMission
`{ id, creatorId, title, description, category, helpType, urgency, visibility, locationLat?, locationLng?, locationRadiusKm, status, progressPercent, tags[], createdAt, expiresAt, closedAt?, closureFeedback?, closureThanks?, creator?, contributionCount? }`

### IContribution
`{ id, userId, missionId, type, message?, status, createdAt, user?, mission? }`

### IOffer
`{ id, creatorId, title, description, category, offerType, visibility, locationLat?, locationLng?, locationRadiusKm, status, tags[], availability?, createdAt, expiresAt, closedAt?, creator? }`

### ICorrelation
`{ id, missionId, offerId, score, createdAt, mission?, offer? }`

### INotification
`{ id, userId, type, title, body?, referenceType?, referenceId?, isRead, createdAt }`

### IAuthResponse
`{ accessToken, user: IUser }`

### IPaginatedResponse<T>
`{ data: T[], total, page, limit, totalPages }`

### IUserStats
`{ missionsCreated, missionsResolved, contributionsGiven, offersCreated }`

## Frontend Label Maps

File: `frontend/src/lib/types.ts`

Constantes pour afficher les enums en francais dans l'UI:
- `CATEGORY_LABELS` → MissionCategory → string FR
- `URGENCY_LABELS` → Urgency → string FR
- `HELP_TYPE_LABELS` → HelpType → string FR
- `CONTRIBUTION_TYPE_LABELS` → ContributionType → string FR
- `OFFER_TYPE_LABELS` → OfferType → string FR
- `VISIBILITY_LABELS` → Visibility → string FR
