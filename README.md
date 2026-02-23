# GR attitude 🤝

**Plateforme sociale d'entraide structurée** — Un réseau social orienté action pour organiser les demandes d'aide (Missions) et les offres d'aide (Offres).

> *« Trouvez des solutions, Soyez la solution. Tout simplement. »*

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Docker (optionnel)

### Installation

```bash
# 1. Installer les dépendances
npm install --prefix backend
npm install --prefix frontend
npm install --prefix shared

# 2. Configurer l'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos credentials OAuth (Google/Facebook)

# 3. Lancer le projet
./dev.sh
```

Accès :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001

---

## 📚 Documentation

- **[PRD.md](./PRD.md)** — Spécifications produit complètes (607+ lignes)
- **[CLAUDE.md](./CLAUDE.md)** — Guide technique pour développeurs
- **[docs/](./docs)** — Documentation technique détaillée
  - [architecture.md](./docs/architecture.md) — Architecture système
  - [api-endpoints.md](./docs/api-endpoints.md) — Endpoints API
  - [auth.md](./docs/auth.md) — Configuration OAuth
  - [database.md](./docs/database.md) — Schéma base de données
  - Et 8 autres fichiers techniques...
- **[AUDIT-WINSTON-2026-02-23.md](./AUDIT-WINSTON-2026-02-23.md)** — Audit architecture + recommandations

---

## 🏗️ Stack technique

### Backend
- **Framework** : NestJS 11.0.1
- **Langage** : TypeScript 5
- **Base de données** : SQLite (MVP) → PostgreSQL + PostGIS (production)
- **Auth** : Passport (JWT + OAuth2 Google/Facebook)
- **Sécurité** : bcrypt, Helmet, Throttler

### Frontend
- **Framework** : Next.js 16.1.6 + React 19.2.3
- **Langage** : TypeScript 5
- **State** : TanStack React Query 5.90.21
- **UI** : Radix UI + Tailwind CSS 4 + shadcn/ui

### Infrastructure
- **Conteneurisation** : Docker Compose
- **Déploiement** : Render.com (config présente)
- **CI/CD** : À venir (GitHub Actions recommandé)

---

## 📁 Structure du projet

```
gr-attitude/
├── backend/          # API NestJS (TypeScript)
├── frontend/         # Interface Next.js (React 19)
├── shared/           # Types TypeScript partagés
├── docs/             # Documentation technique
├── PRD.md            # Product Requirements Document
├── CLAUDE.md         # Guide développeur
└── docker-compose.yml
```

---

## 🔑 Configuration OAuth (obligatoire)

### Google OAuth
1. Console : https://console.cloud.google.com/
2. Créer credentials OAuth 2.0
3. Ajouter à `backend/.env` :
   ```env
   GOOGLE_CLIENT_ID=your-id
   GOOGLE_CLIENT_SECRET=your-secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
   ```

### Facebook OAuth
1. Console : https://developers.facebook.com/
2. Créer une App
3. Ajouter à `backend/.env` :
   ```env
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-secret
   FACEBOOK_CALLBACK_URL=http://localhost:3001/auth/facebook/callback
   ```

Voir [docs/auth.md](./docs/auth.md) pour instructions détaillées.

---

## 🧪 Développement

### Backend (NestJS)

```bash
cd backend

# Dev avec hot reload
npm run start:dev

# Build production
npm run build
npm run start:prod

# Seeding base de données
npm run seed

# Tests (à venir)
npm run test
```

### Frontend (Next.js)

```bash
cd frontend

# Dev avec hot reload
npm run dev

# Build production
npm run build
npm run start

# Linting
npm run lint
```

---

## 📊 État du projet

**Phase actuelle** : ✅ **Prototype fonctionnel MVP**

### Backend ✅
- [x] Auth (JWT + OAuth Google/Facebook)
- [x] CRUD Missions
- [x] CRUD Offers
- [x] Contributions (4 types d'engagement)
- [x] Matching algorithm (corrélation Missions ↔ Offres)
- [x] Notifications
- [x] Crons (expiration, rappels)
- [ ] Tests e2e
- [ ] CI/CD

### Frontend ✅
- [x] Pages auth (login, register)
- [x] Pages missions (liste, détail, création)
- [x] Pages offers
- [x] Profile utilisateur
- [x] Notifications
- [x] 15+ hooks React Query
- [ ] Tests (Vitest)
- [ ] Responsive mobile optimisé

### Infrastructure
- [x] Docker Compose local
- [x] Config Render.com
- [ ] CI/CD GitHub Actions
- [ ] Monitoring (Prometheus/Grafana)

---

## 🎯 Roadmap

### MVP (En cours)
1. ✅ Fonctionnalités de base (Missions, Offres, Matching)
2. ⏳ Tests e2e critiques (auth, CRUD, matching)
3. ⏳ CI/CD GitHub Actions
4. ⏳ Documentation OAuth complète

### Post-MVP
1. Migration PostgreSQL + PostGIS (géolocalisation avancée)
2. Caching Redis (sessions, matching)
3. Monitoring & métriques
4. App mobile (React Native ou Flutter)

---

## 🤝 Contribution

Ce projet suit les principes :
- **Simplicité radicale** — friction minimale
- **Responsabilisation bilatérale** — demandeur ET aidant acteurs
- **Pas de gamification toxique** — stats privées uniquement
- **Pas d'humiliation** — respect des demandeurs
- **Action > scroll** — ce n'est pas un feed social

Voir [PRD.md](./PRD.md) pour philosophie produit complète.

---

## 📄 License

Projet privé — Tous droits réservés.

---

## 🆘 Support

1. **Documentation technique** : [docs/](./docs)
2. **Spécifications produit** : [PRD.md](./PRD.md)
3. **Audit architecture** : [AUDIT-WINSTON-2026-02-23.md](./AUDIT-WINSTON-2026-02-23.md)
4. **Guide développeur** : [CLAUDE.md](./CLAUDE.md)

---

**Dernière mise à jour** : 2026-02-23  
**Auteur** : Équipe GR attitude
