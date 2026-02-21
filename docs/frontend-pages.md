# Frontend Pages

> Voir aussi: [frontend-hooks.md](./frontend-hooks.md) pour les hooks, [frontend-components.md](./frontend-components.md) pour les composants

## Routes Map

| Route | Page | Auth requise | Description |
|-------|------|-------------|-------------|
| `/` | Home | Non | Hero + 6 missions recentes |
| `/login` | Login | Non | Formulaire email/password |
| `/register` | Register | Non | Formulaire inscription |
| `/missions` | Missions Feed | Non | Liste filtrable + pagination |
| `/missions/new` | Create Mission | Oui (implicite) | Formulaire guide 4 etapes |
| `/missions/[id]` | Mission Detail | Non (UI conditionnelle) | Detail + contributions + close |
| `/offers` | Offers Feed | Non | Liste filtrable + pagination |
| `/offers/new` | Create Offer | Oui (implicite) | Formulaire guide 3 etapes |
| `/offers/[id]` | Offer Detail | Non (UI conditionnelle) | Detail + correlations + close |
| `/profile` | User Profile | Oui (UI conditionnelle) | Stats + mes missions/offres |
| `/notifications` | Notifications | Oui (implicite) | Liste complette notifications |

## Page Details

### `/` (Home)
- File: `app/page.tsx`
- Hook: `useMissions({ limit: 6 })`
- Affiche: Hero section + grille 6 MissionCards recentes
- CTAs: "Creer une Mission" → `/missions/new`, "Proposer une Offre" → `/offers/new`

### `/login`
- File: `app/(auth)/login/page.tsx`
- Hook: `useAuth()` → `login()`
- State local: email, password, isLoading
- On success: redirect `/missions`, toast success
- On error: toast error

### `/register`
- File: `app/(auth)/register/page.tsx`
- Hook: `useAuth()` → `register()`
- State local: displayName, email, password, isLoading
- On success: redirect `/missions`

### `/missions`
- File: `app/missions/page.tsx`
- Hook: `useMissions(filters)`
- State: filters (category, helpType, urgency, search, page)
- Filtres: 3 Select + 1 Input search
- Pagination: Previous/Next buttons, default limit=12
- Grille: MissionCard (responsive 1/2/3 colonnes)
- CTA: "Creer une Mission" → `/missions/new`

### `/missions/new`
- File: `app/missions/new/page.tsx`
- Hook: `useCreateMission()` mutation
- Steps (4):
  1. Description: title + description (textareas)
  2. Classification: category + helpType + urgency (selects)
  3. Visibility: visibility select + tags input (comma-separated)
  4. Confirmation: preview de tous les champs
- Validation: step 0 requiert title + description
- On submit: parse tags → mutate → redirect `/missions/[id]`

### `/missions/[id]`
- File: `app/missions/[id]/page.tsx`
- Hooks: `useMission(id)`, `useContributions(id)`, `useAuth()`
- Affiche:
  - Badges: category, urgency, helpType, status (si ferme)
  - Creator: avatar + displayName + timeAgo
  - Description (whitespace-pre-wrap)
  - Info: location, tags, jours avant expiration
  - MissionProgress (barre de progression)
  - ContributionButtons (si mission ouverte + user != creator)
  - CloseMissionDialog (si user = creator + mission ouverte)
  - Liste contributions: avatar + type badge + message + timeAgo

### `/offers`
- File: `app/offers/page.tsx`
- Hook: `useOffers(filters)`
- State: filters (category, offerType, search, page)
- Filtres: 2 Select + 1 Input search
- Grille: OfferCard, default limit=12

### `/offers/new`
- File: `app/offers/new/page.tsx`
- Hook: `useCreateOffer()` mutation
- Steps (3):
  1. Description: title + description + availability
  2. Classification: offerType + category + visibility + tags
  3. Confirmation: preview
- On submit: redirect `/offers/[id]`

### `/offers/[id]`
- File: `app/offers/[id]/page.tsx`
- Hooks: `useOffer(id)`, `useQuery(['correlations', id])`, `useAuth()`
- Affiche:
  - Badges: offerType (colore), category, status
  - Creator info
  - Description + availability (optionnel)
  - Info: location, tags
  - Close button (si creator + ouverte) → appelle `offersApi.close(id)` directement
  - Missions correlees: score badge + lien vers mission

### `/profile`
- File: `app/profile/page.tsx`
- Hooks: `useAuth()`, `useUserStats()`, `useMissions({ limit: 50 })`, `useOffers({ limit: 50 })`
- Affiche:
  - Avatar (large) + displayName + email
  - 4 stats cards: missionsCreated, missionsResolved, contributionsGiven, offersCreated
  - Tabs: "Missions" / "Offres"
  - Chaque tab: liste filtree par creatorId du user (cote client)

### `/notifications`
- File: `app/notifications/page.tsx`
- Hooks: `useNotifications()`, `useMarkNotificationRead()`
- Affiche: liste de cards avec blue dot (unread), title, body, timeAgo
- Click: mark as read si pas deja lu
- Empty state: icone Bell + "Aucune notification"

## Layout

File: `app/layout.tsx`

```
<QueryProvider>
  <AuthProvider>
    <Header />       ← sticky top, z-50, backdrop-blur
    <main>{page}</main>  ← flex-1
    <Footer />        ← border-t, copyright
    <Toaster />       ← Sonner toasts (bottom-right)
  </AuthProvider>
</QueryProvider>
```

Font: Geist (sans) + Geist Mono
Metadata: title "GR attitude"

## Auth Protection Pattern

Pas de middleware Next.js. Protection cote client:
- Pages conditionnelles: affichent contenu different selon `useAuth().isAuthenticated`
- Pas de redirect force (sauf login/register qui redirigent vers `/missions` apres auth)
- Profile page: message "Connectez-vous" si pas authentifie
