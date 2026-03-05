# GR attitude - Documentation technique

> Index optimise pour navigation rapide. Chaque fichier couvre un domaine unique.
> Lire ce fichier suffit pour savoir OU trouver l'info, puis ouvrir uniquement le fichier necessaire.

## Architecture & Infrastructure

| Fichier | Contenu | Quand le lire |
|---------|---------|---------------|
| [architecture.md](./architecture.md) | Monorepo structure, tech stack, ports, data flow | Vision globale, onboarding |
| [VPS-DEPLOYMENT.md](./VPS-DEPLOYMENT.md) | VPS Hostinger, Nginx, PM2, SSL, env vars | Deploiement, debug prod |
| [database.md](./database.md) | Entities, colonnes, relations, contraintes, indexes | Schema DB, requetes, migrations |

## Backend

| Fichier | Contenu | Quand le lire |
|---------|---------|---------------|
| [api-endpoints.md](./api-endpoints.md) | Tous les endpoints REST (method, path, auth, body, response) | Integration frontend-backend, debug API |
| [auth.md](./auth.md) | JWT flow, guards, strategies, decorators, token format | Problemes d'auth, ajout routes protegees |
| [business-logic.md](./business-logic.md) | Mission lifecycle, contributions, matching algo, notifications, crons | Regles metier, workflows, debug logique |
| [dtos.md](./dtos.md) | Tous les DTOs avec champs, validateurs, types | Validation errors, ajout champs, contrats API |

## Frontend

| Fichier | Contenu | Quand le lire |
|---------|---------|---------------|
| [frontend-pages.md](./frontend-pages.md) | Routes, pages, composants utilises, state | Modifier une page, ajouter une route |
| [frontend-hooks.md](./frontend-hooks.md) | React Query hooks, query keys, API calls, invalidation | Data fetching, cache, mutations |
| [frontend-components.md](./frontend-components.md) | Composants layout + metier, props, comportement | Modifier UI, ajouter composant |

## Shared

| Fichier | Contenu | Quand le lire |
|---------|---------|---------------|
| [enums-types.md](./enums-types.md) | Tous les enums + interfaces TypeScript partages | Ajouter un champ, nouveau statut, nouveau type |

## Liens entre fichiers

```
enums-types.md ──used by──> dtos.md, database.md, frontend-hooks.md
database.md ──shapes──> api-endpoints.md (response format)
api-endpoints.md ──consumed by──> frontend-hooks.md
frontend-hooks.md ──used in──> frontend-pages.md, frontend-components.md
auth.md ──protects──> api-endpoints.md (routes avec JwtAuthGuard)
business-logic.md ──implemented in──> api-endpoints.md (services layer)
VPS-DEPLOYMENT.md ──configures──> architecture.md (ports, env vars)
```

## Fichiers cle du code source

```
backend/src/app.module.ts          -- Wiring de tous les modules
backend/src/main.ts                -- Entry point (port, CORS, pipes, filters)
backend/src/config/database.config.ts -- Dual DB config (postgres/sqlite)
frontend/src/lib/api.ts            -- Client API central
frontend/src/lib/types.ts          -- Types frontend (mirrors shared/)
frontend/src/providers/auth-provider.tsx -- AuthContext (JWT localStorage)
frontend/src/app/layout.tsx        -- Root layout (providers, header, footer)
shared/src/constants/enums.ts      -- Source of truth pour tous les enums
```
