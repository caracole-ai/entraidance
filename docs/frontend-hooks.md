# Frontend Hooks

> Voir aussi: [api-endpoints.md](./api-endpoints.md) pour les routes API, [frontend-pages.md](./frontend-pages.md) pour l'utilisation

Tous les hooks sont dans `frontend/src/hooks/`. Tous utilisent TanStack React Query v5.

## Query Hooks (lecture)

| Hook | Query Key | API Call | Return Type | Options |
|------|-----------|----------|-------------|---------|
| `useMissions(filters?)` | `['missions', filters]` | GET `/missions?...` | `IPaginatedResponse<IMission>` | - |
| `useMission(id)` | `['mission', id]` | GET `/missions/:id` | `IMission` | enabled: !!id |
| `useContributions(missionId)` | `['contributions', missionId]` | GET `/missions/:id/contributions` | `IContribution[]` | enabled: !!missionId |
| `useOffers(filters?)` | `['offers', filters]` | GET `/offers?...` | `IPaginatedResponse<IOffer>` | - |
| `useOffer(id)` | `['offer', id]` | GET `/offers/:id` | `IOffer` | enabled: !!id |
| `useNotifications()` | `['notifications']` | GET `/users/me/notifications` | `INotification[]` | extrait .data |
| `useUnreadCount()` | `['notifications', 'unread-count']` | GET `/users/me/notifications/unread-count` | `{ count: number }` | refetchInterval: 30s |
| `useProfile()` | `['profile']` | GET `/users/me` | `IUser` | - |
| `useUserStats()` | `['user-stats']` | GET `/users/me/stats` | `IUserStats` | - |

## Mutation Hooks (ecriture)

| Hook | API Call | Invalidates |
|------|----------|-------------|
| `useCreateMission()` | POST `/missions` | `['missions']` |
| `useCreateContribution()` | POST `/missions/:missionId/contributions` | `['contributions', missionId]`, `['mission', missionId]` |
| `useCloseMission()` | POST `/missions/:id/close` | `['mission', id]`, `['missions']` |
| `useCreateOffer()` | POST `/offers` | `['offers']` |
| `useMarkNotificationRead()` | PATCH `/users/me/notifications/:id` | `['notifications']` |

## Context Hook

| Hook | Source | Returns |
|------|--------|---------|
| `useAuth()` | AuthContext | `{ user, isAuthenticated, isLoading, login, register, logout, loginWithToken }` |

## WebSocket Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useSocket()` | useSocket.ts | Returns `{ socket, connected, on, off, emit }` |
| `useSocketEvent(event, callback, deps)` | useSocket.ts | Listen to a specific socket event (auto cleanup on unmount) |
| `useSocketAuth(token)` | useSocket.ts | Connect/disconnect socket based on auth token |

## API Client Namespaces

File: `frontend/src/lib/api.ts`

| Namespace | Methods |
|-----------|---------|
| `authApi` | login, register, getMe |
| `missionsApi` | list, get, create, update, delete, close, getContributions, getCorrelations |
| `contributionsApi` | create, update, delete |
| `offersApi` | list, get, create, update, delete, close, getCorrelations |
| `notificationsApi` | list, getUnreadCount, markRead |
| `matchingApi` | getSuggestions |
| `profileApi` | getMe, updateMe |
| `statsApi` | get |

## Query Client Config

File: `frontend/src/providers/query-provider.tsx`

```
staleTime: 60_000  (60s avant re-fetch)
retry: 1           (1 retry en cas d'echec)
```

## Notes

- `notificationsApi.list()` retourne `{ data, total, page, limit }` mais le hook extrait `.data` → le hook retourne `INotification[]` directement
- `useUnreadCount` est le seul hook avec polling (30s) pour le badge de notification
- Mutations invalidate les query keys pertinentes pour refresh automatique
- Pas de optimistic updates (MVP simple)
