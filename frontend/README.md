# Entraidance Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-000000)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)](https://tailwindcss.com/)

Interface utilisateur de la plateforme Entraidance — Application web responsive et PWA.

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Backend API lancé (http://localhost:3001)

### Installation

```bash
npm install
```

### Configuration Environnement

Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Production (Render) :**
```env
NEXT_PUBLIC_API_URL=https://entraidance-api.onrender.com
```

---

## 🏃 Lancer l'Application

### Mode développement
```bash
npm run dev
```
App disponible sur http://localhost:3000

### Mode production
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

---

## 📱 Progressive Web App (PWA)

L'application est **installable** comme une app native :

- **Service Worker** : Cache des assets statiques
- **Manifest** : Icônes et configuration app
- **Offline** : Page de fallback si pas de connexion
- **Mobile optimized** : Touch-friendly, responsive

**Installation** :
1. Visiter le site sur mobile ou Chrome desktop
2. Cliquer sur "Installer l'application" (prompt navigateur)
3. L'app s'ajoute à l'écran d'accueil

Voir [PWA.md](./PWA.md) pour la configuration complète.

---

## 📱 Mobile Optimization

- **Responsive design** : Single-column sur mobile, grid sur desktop
- **Touch-friendly** : Boutons 44x44px minimum
- **Performance** : Lazy loading, code splitting
- **Lighthouse** : Score 90+ sur Performance/Accessibility

Voir [MOBILE.md](./MOBILE.md) pour les optimisations détaillées.

---

## 📁 Structure du Projet

```
frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Groupe de routes auth (login, register)
│   ├── missions/            # Pages missions (list, detail, create)
│   ├── offers/              # Pages offers
│   ├── profile/             # Page profil
│   ├── page.tsx             # Home
│   └── layout.tsx           # Layout global
├── components/              # Composants React
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Header, Footer, Navigation
│   └── missions/            # MissionCard, MissionForm, etc.
├── hooks/                   # React hooks (useAuth, useMissions, etc.)
├── lib/                     # Utilities
│   ├── api.ts               # Axios client
│   ├── queryClient.ts       # React Query config
│   └── utils.ts             # Helpers
├── public/                  # Assets statiques
│   ├── icons/               # PWA icons
│   └── manifest.json        # PWA manifest
├── types/                   # TypeScript types
├── MOBILE.md                # Mobile optimization guide
├── PWA.md                   # PWA setup guide
└── ERROR_HANDLING.md        # Error handling strategy
```

---

## 🎨 Stack Technique

### Framework
- **Next.js 16.1.6** : App Router, Server Components, Streaming
- **React 19.2.3** : UI library

### State Management
- **TanStack React Query 5.90.21** : Server state, cache, optimistic updates
- **React Context** : Auth state
- 15+ custom hooks

### Styling
- **Tailwind CSS 4** : Utility-first CSS
- **shadcn/ui** : Composants Radix UI + Tailwind
- **Radix UI** : Primitives accessibles
- **Lucide Icons** : Icônes

### Validation
- **Zod** : Validation de formulaires
- **React Hook Form** : Gestion formulaires

### Real-time
- **Socket.io Client** : WebSocket notifications

### Monitoring
- **Sentry** : Error tracking + Session replay

---

## 🔑 Fonctionnalités Principales

### Authentication
- Login/Register (email + password)
- OAuth Google (redirect flow)
- OAuth Facebook (redirect flow)
- JWT stocké en localStorage
- Auto-refresh token
- Protected routes

### Missions
- **Liste** : Filtres (category, urgency, status, search, sort)
- **Détail** : Info complète, contributions, correlations
- **Création** : Wizard multi-étapes avec validation
- **Modification** : Owner uniquement
- **Suppression** : Owner uniquement
- **Clôture** : Feedback + remerciements

### Offers
- Liste avec filtres
- Détail
- Création/Modification/Suppression
- Corrélations avec missions

### Profile
- Modification displayName, avatarUrl
- Skills & interests
- Préférences de matching
- Statistiques personnelles

### Notifications
- Real-time via WebSocket
- Toast notifications
- Badge compteur non-lues
- Mark as read

### Search & Filters
- Full-text search
- Category, urgency, status
- Tags
- Sort (date, urgency, popularity)

---

## 🧩 Composants Principaux

### Layout
- `Header` : Navigation, auth status, notifications bell
- `Footer` : Liens légaux
- `Navigation` : Menu mobile responsive

### Missions
- `MissionCard` : Carte mission (liste)
- `MissionDetail` : Vue complète mission
- `MissionForm` : Wizard création/édition
- `MissionFilters` : Barre de filtres
- `ContributionButton` : Bouton participation

### UI (shadcn/ui)
- `Button` : Bouton stylisé
- `Card` : Container
- `Badge` : Tags
- `Input`, `Textarea` : Champs formulaire
- `Dialog` : Modals
- `Toast` : Notifications

---

## 🎣 Hooks Personnalisés

### Auth
- `useAuth()` : User state, login, logout, register
- `useRequireAuth()` : Redirect si non authentifié

### Missions
- `useMissions()` : Liste missions avec filtres
- `useMission(id)` : Détail mission
- `useCreateMission()` : Mutation création
- `useUpdateMission()` : Mutation update
- `useDeleteMission()` : Mutation suppression
- `useCloseMission()` : Mutation clôture

### Offers
- `useOffers()` : Liste offers
- `useOffer(id)` : Détail offer
- `useCreateOffer()` : Mutation création

### Notifications
- `useNotifications()` : Liste notifications
- `useUnreadCount()` : Compteur non-lues
- `useMarkAsRead()` : Mutation mark as read

### WebSocket
- `useSocket()` : Connexion Socket.io, listeners

---

## 🔄 React Query Configuration

**Cache strategy** :
- `staleTime: 5 minutes` : Données considérées fraîches 5 min
- `cacheTime: 10 minutes` : Données en cache 10 min
- `refetchOnWindowFocus: true` : Re-fetch au retour focus
- `retry: 1` : 1 seule retry en cas d'erreur

**Optimistic updates** :
- Contributions : Ajout instantané, rollback si échec
- Missions : Update locale immédiate

---

## 🌐 Real-time (WebSocket)

### Connexion Auto
Le hook `useSocket()` se connecte automatiquement si l'utilisateur est authentifié.

### Events Supportés
- `notification` : Nouvelle notification → Toast + cache invalidation
- `mission:update` : Mission modifiée → Invalidation cache
- `contribution:new` : Nouvelle contribution → Invalidation cache

Voir [backend/WEBSOCKET.md](../backend/WEBSOCKET.md) pour configuration côté serveur.

---

## 🐛 Error Handling

### Stratégie
- **Sentry** : Toutes les erreurs sont trackées
- **Toast** : Erreurs affichées à l'utilisateur
- **Fallback UI** : Error boundaries React
- **Retry** : React Query retry automatique (1x)

Voir [ERROR_HANDLING.md](./ERROR_HANDLING.md) pour détails complets.

---

## 📦 Déploiement

### Render.com (Production)
Le frontend est auto-déployé sur Render à chaque push sur `master`.

**URL** : https://entraidance-frontend.onrender.com

**Configuration** :
- Auto-deploy depuis GitHub (fork `caracole-ai/entraidance`)
- Build command : `cd frontend && npm install && npm run build`
- Start command : `cd frontend && npm run start`
- Environment : `NEXT_PUBLIC_API_URL=https://entraidance-api.onrender.com`

---

## 🧪 Tests

### À venir
- **Vitest** : Tests unitaires composants
- **Testing Library** : Tests d'intégration
- **Playwright** : Tests E2E

---

## 🚀 Performance

### Optimizations
- **Code splitting** : Routes lazy-loadées
- **Image optimization** : `next/image`
- **Font optimization** : `next/font` (Geist)
- **Static Generation** : Pages statiques quand possible
- **Caching** : React Query + Service Worker

### Lighthouse Scores
- Performance : 90+
- Accessibility : 95+
- Best Practices : 100
- SEO : 90+
- PWA : 100

---

## 🤝 Contribution

**Conventions** :
- `camelCase` pour variables/fonctions
- `PascalCase` pour composants/types
- `kebab-case` pour fichiers
- Toujours utiliser `useQuery`/`useMutation` de React Query
- Toujours valider les formulaires avec Zod
- Toujours gérer les états loading/error

**Ajout d'un nouveau composant** :
```bash
npx shadcn@latest add <component-name>
```

---

## 📚 Documentation Complémentaire

### Frontend
- [MOBILE.md](./MOBILE.md) — Optimisations mobile
- [PWA.md](./PWA.md) — Configuration PWA
- [ERROR_HANDLING.md](./ERROR_HANDLING.md) — Gestion erreurs

### Architecture Globale
- [docs/api-endpoints.md](../docs/api-endpoints.md) — API endpoints
- [docs/frontend-components.md](../docs/frontend-components.md) — Liste composants
- [docs/frontend-hooks.md](../docs/frontend-hooks.md) — Liste hooks
- [docs/frontend-pages.md](../docs/frontend-pages.md) — Structure pages

---

## 📄 License

Projet privé — Tous droits réservés.

---

**Dernière mise à jour** : 2026-03-01  
**Version** : Production-Ready & PWA-Enabled (Next.js 16)  
**Auteur** : Équipe Entraidance
