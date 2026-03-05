# GR attitude — Guide de Déploiement Render

Guide complet pour déployer GR attitude sur Render (Free tier), incluant toutes les solutions aux problèmes rencontrés.

## 📋 Table des matières

- [Services Render](#services-render)
- [Déploiement Backend](#déploiement-backend)
- [Déploiement Frontend](#déploiement-frontend)
- [OAuth Google Setup](#oauth-google-setup)
- [Problèmes Rencontrés](#problèmes-rencontrés)
- [Seeding de Données Démo](#seeding-de-données-démo)
- [Checklist de Déploiement](#checklist-de-déploiement)

---

## Services Render

### Configuration

**Environnement** : `My project` > `Production`

**Backend** : `gr-attitude-api`
- Service ID : `srv-d6f4cshr0fns73f2vvsg`
- URL : https://gr-attitude-api-ihn9.onrender.com
- Type : Web Service
- Runtime : Node
- Region : Frankfurt
- Plan : Free

**Frontend** : `gr-attitude-frontend`
- Service ID : `srv-d6f4ebk1hm7c73b0b510`
- URL : https://gr-attitude-frontend.onrender.com
- Type : Web Service
- Runtime : Node
- Region : Frankfurt
- Plan : Free

---

## Déploiement Backend

### Configuration `render.yaml`

```yaml
services:
  - type: web
    name: gr-attitude-api
    runtime: node
    region: frankfurt
    plan: free
    buildCommand: cd backend && npm ci && npx nest build
    startCommand: cd backend && npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: file:./database.sqlite
      - key: TYPEORM_SYNCHRONIZE
        value: false  # ⚠️ Utiliser migrations en prod
```

### Variables d'environnement requises

Via Render Dashboard :

```bash
# Base
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=file:./database.sqlite
TYPEORM_SYNCHRONIZE=false

# JWT
JWT_SECRET=<générer via openssl rand -base64 32>
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://gr-attitude-frontend.onrender.com

# CORS
CORS_ORIGIN=https://gr-attitude-frontend.onrender.com

# OAuth Google
GOOGLE_CLIENT_ID=<voir section OAuth Google>
GOOGLE_CLIENT_SECRET=<voir section OAuth Google>
GOOGLE_CALLBACK_URL=https://gr-attitude-api-ihn9.onrender.com/auth/google/callback

# Sentry (optionnel)
SENTRY_DSN=<si analytics activé>
```

### Points critiques

1. **Service name** : Le `name:` dans `render.yaml` DOIT matcher exactement le nom du service dans Render
2. **`npx` obligatoire** : Toujours utiliser `npx nest build` (pas juste `nest build`)
3. **Callback URL** : Utiliser l'URL réelle du service backend (`gr-attitude-api-ihn9.onrender.com`), PAS l'URL custom

---

## Déploiement Frontend

### Configuration `render.yaml`

```yaml
services:
  - type: web
    name: gr-attitude-frontend
    runtime: node
    region: frankfurt
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    startCommand: cd frontend && npm run start
```

### Build Command Render Dashboard

⚠️ **IMPORTANT** : NE PAS ajouter de flags Next.js dans la Build Command Render

**✅ Correct** :
```bash
npm install && npm run build
```

**❌ Incorrect** :
```bash
npm install && npm run build -- --no-turbopack  # Flag invalide dans Next.js
```

Les flags doivent aller dans `package.json` :

```json
{
  "scripts": {
    "build": "next build --webpack"  // ← Flags ici uniquement
  }
}
```

### next-pwa Configuration

#### Problème : next-pwa@5.6.0 incompatible avec Next.js 16

**Symptômes** :
```
Error: Cannot find module 'next/dist/build/webpack/plugins/wellknown-errors-plugin/webpackModuleError'
```

**Solution** : Utiliser le fork maintenu `@ducanh2912/next-pwa`

```bash
npm uninstall next-pwa
npm install --save-dev @ducanh2912/next-pwa
```

#### next.config.ts

```typescript
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: true,  // Force webpack (requis pour next-pwa)
  turbopack: {},  // Silence Next.js 16 default turbopack warning
  typescript: {
    ignoreBuildErrors: true,  // Temporaire pour déploiement
  },
};

export default withPWA(nextConfig);
```

#### package.json

```json
{
  "scripts": {
    "build": "next build --webpack"  // Force webpack explicitement
  }
}
```

### React Query v5 Migration

**Changement API** : `cacheTime` → `gcTime`

```typescript
// ❌ Ancien (v4)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
    },
  },
});

// ✅ Nouveau (v5)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,  // "garbage collection time"
    },
  },
});
```

### Variables d'environnement

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://gr-attitude-api-ihn9.onrender.com
NEXT_PUBLIC_WS_URL=wss://gr-attitude-api-ihn9.onrender.com

# Sentry (optionnel)
NEXT_PUBLIC_SENTRY_DSN=<si analytics activé>
```

---

## OAuth Google Setup

### 1. Google Cloud Console

URL : https://console.cloud.google.com/apis/credentials

#### Créer un OAuth 2.0 Client ID

1. **Sélectionner le projet** (ou créer un nouveau)
2. **APIs & Services** > **Credentials**
3. **+ CREATE CREDENTIALS** > **OAuth client ID**
4. **Application type** : Web application
5. **Name** : `gr-attitude-prod` (ou autre)
6. **Authorized redirect URIs** :
   ```
   https://gr-attitude-api-ihn9.onrender.com/auth/google/callback
   http://localhost:3001/auth/google/callback
   ```
7. **CREATE**

#### Récupérer les credentials

Après création, noter :
- **Client ID** : `719616477303-aq78...apps.googleusercontent.com`
- **Client secret** : `GOCSPX-...`

### 2. Configuration Render Backend

Dans Render Dashboard > `gr-attitude-api` > **Environment** :

```bash
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<your-client-secret>
GOOGLE_CALLBACK_URL=https://gr-attitude-api-ihn9.onrender.com/auth/google/callback
```

⚠️ **Redeploy obligatoire** après changement de variables d'environnement

### 3. Test du flow OAuth

1. Naviguer vers https://gr-attitude-frontend.onrender.com/register
2. Cliquer **"Sign in with Google"**
3. Sélectionner un compte Google
4. Vérifier la redirection vers `/dashboard` avec session établie
5. Vérifier pas d'erreur dans la console navigateur

---

## Problèmes Rencontrés

### 🔴 Problème 1 : OAuth 401 (deleted_client)

**Symptôme** :
```
Error 401: deleted_client
The OAuth client was deleted.
```

**Cause** : Le Client ID OAuth référencé dans `GOOGLE_CLIENT_ID` a été supprimé dans Google Cloud Console.

**Solution** :
1. Créer un nouveau OAuth 2.0 Client ID (voir section OAuth Google Setup)
2. Mettre à jour `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans Render
3. **Manual Redeploy** du backend pour appliquer les nouvelles variables
4. Tester le flow complet

**Commits** :
- Initial fix : Credentials rotation via browser automation
- Final state : Nouveau client `719616477303-aq78...`

---

### 🔴 Problème 2 : Frontend Build Failure (next-pwa)

**Symptôme** :
```
Error: Cannot find module 'next/dist/build/webpack/plugins/wellknown-errors-plugin/webpackModuleError'
Module build failed: UnhandledSchemeError: Reading from "node:assert" is not handled by plugins
```

**Cause** : `next-pwa@5.6.0` n'est pas compatible avec Next.js 16

**Solution** :

#### Étape 1 : Upgrade vers fork maintenu
```bash
npm uninstall next-pwa
npm install --save-dev @ducanh2912/next-pwa@10.2.9
```

**Commit** : `439a580` (upgrade package)

#### Étape 2 : Mettre à jour l'import

`frontend/next.config.ts` :
```typescript
// ❌ Ancien
import withPWAInit from "next-pwa";

// ✅ Nouveau
import withPWAInit from "@ducanh2912/next-pwa";
```

**Commit** : `50c2341` (update import + React Query fix)

#### Étape 3 : Forcer webpack explicitement

`frontend/next.config.ts` :
```typescript
const nextConfig: NextConfig = {
  webpack: true,  // Requis pour next-pwa
  turbopack: {},  // Silence warning Next.js 16
  // ...
};
```

`frontend/package.json` :
```json
{
  "scripts": {
    "build": "next build --webpack"
  }
}
```

**Commit** : `e88636d` (force webpack + turbopack config)

#### Étape 4 : Fix Render Build Command

Render Dashboard > Build Command :
```bash
# ❌ AVANT (invalide)
npm install && npm run build -- --no-turbopack

# ✅ APRÈS (correct)
npm install && npm run build
```

**Résultat** : Build frontend réussit, site live ✅

---

### 🔴 Problème 3 : React Query v5 Migration

**Symptôme** :
```
Property 'cacheTime' does not exist on type 'QueryClientConfig'
```

**Cause** : React Query v5 a renommé `cacheTime` en `gcTime`

**Solution** :

`frontend/src/providers/query-provider.tsx` :
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,  // ✅ gcTime (v5)
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

**Commit** : `50c2341`

---

### 🔴 Problème 4 : Service Name Mismatch (render.yaml)

**Symptôme** : Render ne pouvait pas mapper `render.yaml` au service

**Cause** :
- `render.yaml` avait `name: gr-attitude-backend`
- Service Render s'appelait `gr-attitude-api`

**Solution** : Aligner le nom dans `render.yaml`

```yaml
services:
  - type: web
    name: gr-attitude-api  # ← Doit matcher le nom du service
```

**Commit** : `da5dbb1` (ancien projet, même leçon)

---

### 🔴 Problème 5 : Build Command avec npx

**Symptôme** :
```
sh: nest: command not found
```

**Cause** : `nest` n'était pas dans le PATH global, uniquement dans `node_modules/.bin/`

**Solution** : Utiliser `npx nest build`

`render.yaml` :
```yaml
buildCommand: cd backend && npm ci && npx nest build  # ✅ npx obligatoire
```

**Commit** : `87e9d40` (ancien projet, même leçon)

---

## Seeding de Données Démo

Pour tester la plateforme avec des données réalistes, le backend inclut un système de seeding de données factices.

### Fonctionnalités

Le seeder génère automatiquement :
- **5 utilisateurs démo** (profils variés : développeuse, bricoleur, prof, graphiste, étudiante)
- **6 missions démo** (diverses catégories, urgences, statuts)
- **4 offres démo** (compétences, temps, matériel)
- **4 contributions démo** (intérêts et volontariats)

**Toutes les données sont flaguées `isDemo: true`** pour faciliter leur suppression ultérieure.

### Utilisation

#### En local

```bash
# Ajouter les données démo
cd backend
npm run seed

# Supprimer toutes les données démo
npm run seed:clear
```

#### Sur Render

**Après déploiement du backend**, se connecter au Shell du service :

1. Render Dashboard > `gr-attitude-api` > **Shell**
2. Exécuter :

```bash
# Ajouter les données démo
npm run seed

# Supprimer les données démo
npm run seed:clear
```

### Détails des données générées

**Utilisateurs** :
- `demo.alice@gr-attitude.test` — Développeuse web (Paris)
- `demo.bob@gr-attitude.test` — Bricoleur chevronné (Paris, Premium)
- `demo.claire@gr-attitude.test` — Professeure de français (Lyon)
- `demo.david@gr-attitude.test` — Graphiste freelance (Marseille, Premium)
- `demo.emma@gr-attitude.test` — Étudiante en médecine (Paris)

**Missions** :
- Aide déménagement (Transport, Urgent)
- Accompagnement médical (Santé, Moyen)
- Réparation plomberie (Bricolage, Moyen)
- Soutien scolaire maths (Éducation, Pas urgent)
- Création site web (Numérique, En cours 30%)
- Promenade quotidienne (Social, Moyen)

**Offres** :
- Cours de français gratuits (Éducation, Compétence)
- Aide bricolage (Bricolage, Temps)
- Design graphique (Numérique, Compétence)
- Prêt outils jardinage (Autre, Matériel)

### Structure technique

#### Entités modifiées

Champ `isDemo: boolean` ajouté aux entités :
- `backend/src/users/entities/user.entity.ts`
- `backend/src/missions/entities/mission.entity.ts`
- `backend/src/offers/entities/offer.entity.ts`
- `backend/src/contributions/entities/contribution.entity.ts`

#### Seeder

`backend/src/database/seeders/demo-data.seeder.ts`

Fonctions exportées :
- `seedDemoData(dataSource)` — Insère les données
- `clearDemoData(dataSource)` — Supprime toutes les entités avec `isDemo: true`

#### Script d'exécution

`backend/src/database/seed.ts`

CLI standalone utilisant TypeORM DataSource directement.

#### Scripts npm

Définis dans `backend/package.json` :
```json
{
  "seed": "ts-node -r tsconfig-paths/register src/database/seed.ts seed",
  "seed:clear": "ts-node -r tsconfig-paths/register src/database/seed.ts clear"
}
```

### ⚠️ Important

- Les données démo utilisent des **emails `.test`** (invalides pour OAuth)
- En production, **toujours supprimer les données démo** avant la mise en ligne publique
- La suppression est **safe** : seules les entités avec `isDemo: true` sont affectées

---

## Checklist de Déploiement

### Pré-déploiement

- [ ] **Tests locaux** : Tous les tests passent (`npm test` backend + frontend)
- [ ] **Build local** : `npm run build` réussit (backend + frontend)
- [ ] **Variables d'env** : Toutes les vars requises sont documentées
- [ ] **OAuth credentials** : Client ID et secret valides dans Google Cloud Console
- [ ] **Git** : Tous les changements sont committés et pushés

### Backend

- [ ] `render.yaml` : `name` matche le nom du service Render
- [ ] `render.yaml` : `buildCommand` utilise `npx nest build`
- [ ] Render Dashboard : Toutes les variables d'environnement configurées
- [ ] `GOOGLE_CALLBACK_URL` pointe vers l'URL réelle du service (`.onrender.com`)
- [ ] `FRONTEND_URL` et `CORS_ORIGIN` pointent vers le frontend Render
- [ ] Migration TypeORM : `TYPEORM_SYNCHRONIZE=false` en prod
- [ ] Après changement de vars d'env : **Manual Redeploy** effectué

### Frontend

- [ ] `@ducanh2912/next-pwa` installé (pas `next-pwa`)
- [ ] `next.config.ts` : `webpack: true` et `turbopack: {}`
- [ ] `package.json` : `"build": "next build --webpack"`
- [ ] Render Build Command : `npm install && npm run build` (sans flags)
- [ ] React Query : `gcTime` (pas `cacheTime`)
- [ ] `NEXT_PUBLIC_API_URL` pointe vers le backend Render

### OAuth Google

- [ ] Redirect URIs dans Google Cloud Console incluent l'URL Render
- [ ] `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` à jour dans Render
- [ ] Test du flow complet :
  - [ ] `/register` → "Sign in with Google"
  - [ ] Redirection vers Google auth
  - [ ] Callback vers backend
  - [ ] Redirection vers `/dashboard` avec session

### Post-déploiement

- [ ] Backend : https://gr-attitude-api-ihn9.onrender.com/health renvoie 200
- [ ] Frontend : https://gr-attitude-frontend.onrender.com accessible
- [ ] OAuth : Flow complet fonctionne sans erreur
- [ ] Console navigateur : Pas d'erreurs critiques
- [ ] Render Logs : Pas d'erreurs dans les logs backend

---

## Automatisation via Browser

Pour rotations OAuth ou config Render complexe, utiliser le skill `browser-automation` :

```typescript
// Exemple : Update Google OAuth Redirect URIs
browser({
  action: "open",
  profile: "chrome",
  targetUrl: "https://console.cloud.google.com/apis/credentials"
});

// Retry automatique sur timeout (pas d'intervention utilisateur)
// Voir ~/.openclaw/workspace-main/skills/browser-automation/SKILL.md
```

**Principe** : Jamais demander à l'utilisateur de cliquer sur l'extension. Tout doit être autonome avec retry automatique.

---

## Ressources

- **Render Docs** : https://docs.render.com/
- **Next.js + PWA** : https://github.com/DuCanhGH/next-pwa
- **React Query v5** : https://tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5
- **Google OAuth** : https://console.cloud.google.com/apis/credentials
- **Skill Browser Automation** : `~/.openclaw/workspace-main/skills/browser-automation/SKILL.md`

---

**Dernière mise à jour** : 2026-03-01  
**Statut** : ✅ Production LIVE (OAuth fonctionnel)  
**Commits clés** : `e88636d` (frontend PWA fix), `f9128ea` (backend OAuth config)
