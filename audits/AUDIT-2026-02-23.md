# Audit Projet GR-attitude
**Date** : 2026-02-23  
**Auditeur** : Winston 🏗️ (Architecte logiciel)  
**Périmètre** : Architecture technique, état du code, recommandations  

---

## 📊 Vue d'ensemble

**GR-attitude** est une plateforme sociale d'entraide structurée transformant les besoins et propositions d'aide en système de "ticketing humain". Le projet vise à structurer l'intention d'entraide en actions concrètes mesurables.

### Statut actuel
✅ **Phase : Développement actif (Prototype fonctionnel)**

Contrairement à ce qu'indique `CLAUDE.md` (qui mentionne "planning/specification phase"), le projet dispose d'une **base de code complète et fonctionnelle**.

---

## 🏗️ Architecture technique

### Stack confirmée

#### Backend
- **Framework** : NestJS 11.0.1
- **Langage** : TypeScript 5
- **Base de données** : SQLite (better-sqlite3 12.6.2) avec TypeORM 11.0.0
- **Auth** : Passport (JWT + OAuth2 Google/Facebook)
- **Sécurité** : bcrypt 6.0.0, Helmet 8.1.0, Throttler 6.5.0
- **Tâches planifiées** : @nestjs/schedule 6.1.1

#### Frontend
- **Framework** : Next.js 16.1.6 + React 19.2.3
- **Langage** : TypeScript 5
- **State management** : TanStack React Query 5.90.21
- **UI** : Radix UI + Tailwind CSS 4 + shadcn/ui
- **Icônes** : Lucide React
- **Thèmes** : next-themes 0.4.6

#### Infrastructure
- **Conteneurisation** : Docker Compose
- **Déploiement** : Configuration Render.yaml présente
- **Scripts** : `dev.sh` pour lancement rapide

---

## 📁 Structure du projet

```
gr-attitude/
├── backend/               # API NestJS
│   ├── src/
│   │   ├── auth/         # Authentification (JWT, OAuth)
│   │   ├── missions/     # Gestion des besoins
│   │   ├── offers/       # Gestion des offres
│   │   ├── contributions/ # Engagement utilisateur
│   │   ├── correlations/ # Matching Missions ↔ Offres
│   │   ├── matching/     # Algorithme de corrélation
│   │   ├── notifications/
│   │   ├── users/
│   │   ├── crons/        # Tâches planifiées
│   │   ├── seeds/        # Données de test
│   │   └── config/       # Configuration app
│   └── dist/             # Build TypeScript
│
├── frontend/             # Interface Next.js
│   ├── src/
│   │   ├── app/          # App Router Next.js 16
│   │   │   ├── (auth)/   # Pages auth (login, register)
│   │   │   ├── missions/ # Pages missions
│   │   │   ├── offers/   # Pages offres
│   │   │   ├── notifications/
│   │   │   └── profile/
│   │   ├── hooks/        # 15+ hooks React Query
│   │   └── lib/          # Utils (api, auth, types)
│   └── node_modules/
│
├── shared/               # Types partagés (à confirmer si utilisé)
├── docs/                 # Documentation technique détaillée (12 fichiers .md)
├── PRD.md                # Product Requirements Document (607+ lignes)
├── CLAUDE.md             # Guide pour l'assistant (⚠️ obsolète)
└── docker-compose.yml    # Orchestration locale
```

### Comptage code source
- **Backend** : 65 fichiers TypeScript (sans node_modules)
- **Frontend** : 60 fichiers TypeScript/TSX (sans node_modules)
- **Entités/DTOs** : ~20 fichiers de modèles de données

---

## ✅ Points forts

### 1. Architecture solide
- ✅ Séparation claire frontend/backend
- ✅ TypeScript strict sur toute la stack
- ✅ NestJS : architecture modulaire avec injection de dépendances
- ✅ Next.js 16 App Router : routing moderne et performant

### 2. Documentation exhaustive
- ✅ PRD de 607+ lignes : vision produit, MVP, taxonomie, API endpoints
- ✅ `/docs` avec 12 fichiers structurés :
  - Architecture
  - Endpoints API
  - Logique métier
  - DTOs
  - Auth strategy
  - Frontend components/hooks/pages
  - Déploiement

### 3. Fonctionnalités clés implémentées
- ✅ **Système d'auth complet** : JWT + OAuth Google/Facebook
- ✅ **Modules métier** : Missions, Offers, Contributions, Correlations
- ✅ **Matching** : Algorithme de corrélation automatique
- ✅ **Notifications**
- ✅ **Crons** : Tâches planifiées (expiration, rappels)
- ✅ **Seeding** : Données de test pour développement

### 4. Hooks React Query structurés
```
useAuth, useProfile, useMissions, useMission, useOffers, 
useOffer, useContributions, useNotifications, useUnreadCount, 
useUserStats, useCreateMission, useCreateOffer, useCreateContribution,
useCloseMission, useMarkNotificationRead
```
→ Architecture data layer propre et réutilisable

### 5. Sécurité prise en compte
- ✅ Helmet (headers HTTP sécurisés)
- ✅ Throttler (rate limiting)
- ✅ bcrypt pour hash des mots de passe
- ✅ Validation des inputs (class-validator, class-transformer)

---

## ⚠️ Points d'attention & recommandations

### 1. **Décalage PRD ↔ Implémentation**

**Constat** :  
Le PRD mentionne **PostgreSQL + PostGIS** pour la géolocalisation, mais le code utilise **SQLite**.

**Impact** :  
SQLite n'a pas de support natif pour les requêtes géospatiales avancées (GEOGRAPHY, ST_Distance, GIST indexes).

**Recommandation** :  
- **Court terme** : Si géolocalisation simple (rayon), SQLite peut suffire avec calculs haversine en JS
- **Moyen terme** : Migrer vers PostgreSQL + PostGIS **avant la production** pour :
  - Requêtes géospatiales optimisées
  - Scalabilité (concurrence)
  - Support des indexes GIN/GIST

**Action** : Décider du périmètre géolocalisation MVP et planifier migration si nécessaire.

---

### 2. **CLAUDE.md obsolète**

**Constat** :  
Le fichier indique "no implemented code yet" alors que le projet a 125+ fichiers de code.

**Impact** :  
Confusion pour les nouveaux contributeurs ou assistants IA.

**Recommandation** :  
Mettre à jour `CLAUDE.md` avec :
- État réel du projet (prototype fonctionnel)
- Stack réellement utilisée (SQLite, pas PostgreSQL)
- Instructions de lancement (`npm run dev`, `docker-compose up`)

**Action** : Synchroniser la doc avec la réalité du code.

---

### 3. **Variables d'environnement sensibles**

**Constat** :  
`.env.example` contient des placeholders pour OAuth (Google, Facebook) mais `.env` est ignoré (bon).

**Impact** :  
Risque de leak si `.env` est committé par erreur.

**Recommandation** :  
- ✅ Vérifier `.gitignore` : `.env` bien présent
- ⚠️ Ajouter pre-commit hook pour bloquer les secrets
- 📋 Documenter setup OAuth dans `docs/auth.md` ou README

**Action** : Ajouter checklist setup OAuth dans la doc.

---

### 4. **Tests unitaires/e2e absents**

**Constat** :  
- Backend : `test/app.e2e-spec.ts` présent (scaffold Jest)
- Frontend : Pas de configuration de test visible

**Impact** :  
Difficulté à garantir la non-régression lors de refactors.

**Recommandation** :  
Priorité **POST-MVP** :
1. Tests e2e backend (au moins les flows critiques : auth, création Mission, matching)
2. Tests unitaires sur la logique métier (matching, correlations)
3. Tests frontend (Vitest + Testing Library) sur composants critiques

**Action** : Planifier phase de testabilité après validation MVP utilisateur.

---

### 5. **Déploiement et CI/CD**

**Constat** :  
- `render.yaml` présent → cible Render.com
- Pas de CI/CD visible (GitHub Actions, GitLab CI)

**Impact** :  
Déploiement manuel, risque d'oubli de migration DB, d'env vars, etc.

**Recommandation** :  
Ajouter pipeline CI/CD minimaliste :
```yaml
# .github/workflows/deploy.yml
- lint backend + frontend
- build backend + frontend
- deploy to Render (auto on main push)
```

**Action** : Créer workflow GitHub Actions basique.

---

### 6. **Shared folder sous-utilisé ?**

**Constat** :  
Dossier `/shared` présent mais contenu non audité.

**Impact potentiel** :  
Duplication de types entre frontend/backend si non synchronisés.

**Recommandation** :  
- Vérifier contenu `/shared`
- Si types partagés : utiliser exports depuis `/shared` dans les 2 stacks
- Sinon : supprimer le dossier pour éviter confusion

**Action** : Audit du dossier `/shared` + décision sur stratégie de partage de types.

---

### 7. **Performance et scalabilité**

**Constat** :  
SQLite = monothreading, pas de connexions concurrentes.

**Impact** :  
Limite à ~100 requêtes/sec en lecture, beaucoup moins en écriture.

**Recommandation** :  
- ✅ OK pour MVP et tests
- ⚠️ Prévoir migration PostgreSQL avant mise en production
- 📋 Activer monitoring (ex: Prometheus + Grafana) pour identifier goulots

**Action** : Ajouter métriques de performance dans roadmap post-MVP.

---

## 🎯 Recommandations prioritaires

### Priorité 1 (Urgent)
1. ✅ **Mettre à jour `CLAUDE.md`** → refléter l'état réel du projet
2. ✅ **Vérifier `.gitignore`** → sécurité des secrets
3. ✅ **Documenter setup OAuth** → faciliter onboarding dev

### Priorité 2 (Important)
4. 📋 **Décider stratégie DB** → SQLite vs PostgreSQL pour production
5. 📋 **Auditer `/shared`** → clarifier partage de types
6. 📋 **Créer README.md à la racine** → instructions de lancement rapide

### Priorité 3 (Post-MVP)
7. 🧪 **Ajouter tests e2e** → sécuriser flows critiques
8. 🚀 **Setup CI/CD** → automatiser déploiement
9. 📊 **Monitoring** → métriques de performance

---

## 📋 Checklist validation MVP

### Backend
- [x] Auth (JWT + OAuth)
- [x] CRUD Missions
- [x] CRUD Offers
- [x] Contributions
- [x] Matching algorithm
- [x] Notifications
- [ ] Tests e2e flows critiques
- [ ] Rate limiting configuré

### Frontend
- [x] Pages auth
- [x] Pages missions (liste, détail, création)
- [x] Pages offers
- [x] Hooks React Query
- [ ] Gestion erreurs API (toasts, retry)
- [ ] Responsive mobile

### Infrastructure
- [x] Docker Compose local
- [x] Config Render
- [ ] Variables d'env documentées
- [ ] CI/CD pipeline

### Documentation
- [x] PRD complet
- [x] Docs techniques (/docs)
- [ ] README.md à jour
- [ ] Guide contribution

---

## 💡 Opportunités d'amélioration

### Architecture
- Considérer **micro-frontend** si croissance rapide (modules autonomes)
- Ajouter **GraphQL** sur une partie de l'API pour réduire overfetching
- Implémenter **CQRS** sur le matching si performances insuffisantes

### DevEx (Expérience développeur)
- **Turborepo** ou **Nx** pour monorepo optimisé (cache, build incrémental)
- **Storybook** pour composants UI isolés
- **Prettier + ESLint** partagés (si pas déjà fait)

### Produit
- **Notifications push** (web + mobile) via Firebase Cloud Messaging
- **Recherche full-text** sur missions/offres (Meilisearch ou Algolia)
- **Analytics** utilisateur (Mixpanel, Amplitude) pour mesurer impact

---

## 🏁 Conclusion

### Bilan global : **Positif ✅**

Le projet **GR-attitude** dispose d'une base technique solide :
- Architecture modulaire et scalable
- Stack moderne et éprouvée (NestJS + Next.js 16)
- Documentation exhaustive
- Fonctionnalités MVP implémentées

### Axes d'amélioration principaux :
1. **Synchroniser la documentation** avec l'état réel du code
2. **Clarifier la stratégie base de données** (SQLite → PostgreSQL)
3. **Renforcer la testabilité** (post-MVP)
4. **Automatiser le déploiement** (CI/CD)

### Prochaines étapes recommandées :
1. ✅ Valider le MVP avec utilisateurs tests
2. 📋 Itérer sur feedback utilisateur
3. 🧪 Ajouter tests critiques
4. 🚀 Préparer production (PostgreSQL + CI/CD + monitoring)

---

**Rapport généré par Winston 🏗️**  
Architecte logiciel — OpenClaw AI Team  
Contact : via Mattermost #gr-attitude
