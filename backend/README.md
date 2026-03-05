# Entraidance Backend API

[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-ea2845)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Production-003b57)](https://www.sqlite.org/)

Backend API REST de la plateforme Entraidance — Gestion des missions, offres, contributions et matching intelligent.

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation

```bash
npm install
```

### Configuration Environnement

Copier le fichier d'exemple :
```bash
cp .env.example .env
```

**Variables obligatoires** :
```env
# JWT
JWT_SECRET=your-secret-key-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Facebook OAuth (optionnel)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3001/auth/facebook/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_PATH=./gr_attitude.sqlite
DB_TYPE=better-sqlite3

# Sentry (optionnel)
SENTRY_DSN=your-sentry-dsn
```

Voir [docs/auth.md](../docs/auth.md) pour configurer OAuth Google/Facebook.

---

## 🏃 Lancer le Serveur

### Mode développement
```bash
npm run start:dev
```
API disponible sur http://localhost:3001

### Mode production
```bash
npm run build
npm run start:prod
```

---

## 🧪 Tests

### Tests E2E
```bash
npm run test:e2e
```

**73/73 tests passants** ✅
- Authentication (register, login, OAuth)
- JWT lifecycle (validation, expiration, persistence)
- Missions CRUD (create, list, filter, update, delete, close)
- Offers CRUD
- Contributions CRUD
- Matching algorithm
- Health check

### Tests Unitaires
```bash
npm run test
```

**8/8 tests passants** ✅
- Matching service (7 tests)
- App controller (1 test)

### Coverage
```bash
npm run test:cov
```

---

## 📊 Seeding de Données Démo

### Générer des données de test
```bash
curl -X POST http://localhost:3001/seed
```

Crée :
- 5 utilisateurs démo
- 6 missions variées
- 4 offres de services
- 4 contributions

### Supprimer les données démo
```bash
curl -X POST http://localhost:3001/seed/clear
```

Voir [SEEDING.md](./SEEDING.md) pour plus de détails.

---

## 📁 Structure du Projet

```
backend/
├── src/
│   ├── auth/                # Authentication (JWT + OAuth)
│   ├── users/               # User management & profile
│   ├── missions/            # Missions CRUD & filters
│   ├── offers/              # Offers CRUD & filters
│   ├── contributions/       # Contributions on missions
│   ├── matching/            # Matching algorithm V2.1
│   ├── notifications/       # Notifications system
│   ├── seed/                # Seeding API
│   ├── common/              # Shared entities, DTOs, guards
│   ├── database/            # TypeORM config & migrations
│   └── main.ts              # App entry point
├── test/                    # E2E tests
├── SEEDING.md               # Seeding guide
├── RATE_LIMITING.md         # Rate limiting strategy
├── MATCHING.md              # Matching algorithm doc
├── WEBSOCKET.md             # WebSocket real-time doc
├── ANALYTICS.md             # Sentry monitoring
└── MIGRATIONS.md            # TypeORM migrations guide
```

---

## 🔑 Fonctionnalités Principales

### Authentication
- Email/password (bcrypt)
- OAuth Google
- OAuth Facebook
- JWT tokens (7 days expiration)

### Missions
- CRUD complet (create, read, update, delete, close)
- Filtres avancés (category, urgency, status, tags, search, geo)
- Pagination
- Contributions tracking
- Auto-expiration (30 jours)

### Offers
- CRUD complet (create, read, update, delete, close)
- Filtres (category, offerType, tags, search, geo)
- Corrélations avec missions (matching)

### Matching V2.1
Algorithme de matching intelligent (7 facteurs + skills bonus) :
- Category match (30 pts)
- Help type match (15 pts)
- Geographic distance (20 pts)
- Skills match (15 pts)
- Tag overlap (10 pts)
- Urgency priority (5 pts)
- Creator premium status (5 pts)
- **Bonus skills** : +10 pts si compétences exactes

Score total : 0-100

Voir [MATCHING.md](./MATCHING.md) pour détails complets.

### Notifications
- Real-time via WebSocket (Socket.io)
- Stockage en DB
- Types : contribution, match, mission update
- Mark as read

Voir [WEBSOCKET.md](./WEBSOCKET.md) pour configuration WebSocket.

### Rate Limiting
Protection anti-abuse via `@nestjs/throttler` :
- Global : 60 req/min
- Auth endpoints : 5 req/min
- Seeding : 3 req/min

Voir [RATE_LIMITING.md](./RATE_LIMITING.md) pour stratégie complète.

### Monitoring
- Sentry error tracking
- Performance monitoring
- Session replay

Voir [ANALYTICS.md](./ANALYTICS.md) pour configuration Sentry.

---

## 🗄️ Base de Données

### Production
- **SQLite** (fichier `gr_attitude.sqlite`)
- TypeORM avec migrations (`synchronize: false`, `migrationsRun: true`)

### Développement
- SQLite local
- `synchronize: true` (auto-sync schema)

### Schéma
Voir [docs/database.md](../docs/database.md) pour le schéma complet des tables.

### Migrations
```bash
# Générer une migration
npm run migration:generate -- src/database/migrations/MigrationName

# Exécuter les migrations
npm run migration:run

# Annuler la dernière migration
npm run migration:revert
```

Voir [MIGRATIONS.md](./MIGRATIONS.md) pour guide complet.

---

## 🔐 Sécurité

- **Helmet** : Headers HTTP sécurisés
- **bcrypt** : Hash des mots de passe (10 rounds)
- **JWT** : Tokens signés (7 jours)
- **Rate Limiting** : Protection anti-spam
- **CORS** : Restriction au frontend uniquement
- **Validation** : class-validator sur tous les DTOs
- **Guards** : JwtAuthGuard sur routes protégées

---

## 📦 Déploiement

### Render.com (Production)
Le backend est auto-déployé sur Render à chaque push sur `master`.

**URL** : https://entraidance-api.onrender.com

**Configuration** :
- Auto-deploy depuis GitHub (fork `caracole-ai/entraidance`)
- Build command : `cd backend && npm install && npm run build`
- Start command : `cd backend && npm run start:prod`
- Health check : `GET /health`

**Variables d'environnement** :
Toutes les variables `.env` doivent être configurées dans Render Dashboard.

---

## 📚 Documentation Complémentaire

### Backend
- [SEEDING.md](./SEEDING.md) — Guide de seeding
- [RATE_LIMITING.md](./RATE_LIMITING.md) — Stratégie rate limiting
- [MATCHING.md](./MATCHING.md) — Algorithme matching
- [WEBSOCKET.md](./WEBSOCKET.md) — WebSocket real-time
- [ANALYTICS.md](./ANALYTICS.md) — Monitoring Sentry
- [MIGRATIONS.md](./MIGRATIONS.md) — TypeORM migrations
- [PERFORMANCE.md](./PERFORMANCE.md) — Optimisations performance

### Architecture Globale
- [docs/api-endpoints.md](../docs/api-endpoints.md) — Liste des endpoints
- [docs/database.md](../docs/database.md) — Schéma BDD
- [docs/auth.md](../docs/auth.md) — Configuration OAuth
- [docs/architecture.md](../docs/architecture.md) — Architecture système

---

## 🐛 Debugging

### Logs
```bash
# Mode dev (verbose)
npm run start:dev

# Mode prod (minimal)
npm run start:prod
```

### Sentry
Les erreurs sont automatiquement trackées dans Sentry (si `SENTRY_DSN` configuré).

### SQLite
```bash
# Inspecter la DB
sqlite3 gr_attitude.sqlite

# Lister les tables
.tables

# Compter les users
SELECT COUNT(*) FROM users;
```

---

## 🤝 Contribution

Ce backend suit les principes NestJS :
- **Modules** : Organisation par feature (auth, users, missions, etc.)
- **Controllers** : Routes API
- **Services** : Logique métier
- **Entities** : Modèles TypeORM
- **DTOs** : Validation des inputs (class-validator)
- **Guards** : Authentification JWT
- **Decorators** : `@CurrentUser()` pour extraire le user du JWT

**Conventions** :
- `snake_case` pour les noms de colonnes DB
- `camelCase` pour les propriétés TypeScript
- `PascalCase` pour les classes/interfaces
- Toujours valider les inputs avec DTOs
- Toujours utiliser `@CurrentUser()` pour les routes protégées
- Toujours retourner 204 pour les DELETE

---

## 📄 License

Projet privé — Tous droits réservés.

---

**Dernière mise à jour** : 2026-03-01  
**Version** : Production-Ready (SQLite + Migrations + Tests E2E)  
**Auteur** : Équipe Entraidance
