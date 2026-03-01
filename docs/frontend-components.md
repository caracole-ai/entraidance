# Frontend Components

> Voir aussi: [frontend-pages.md](./frontend-pages.md) pour l'utilisation dans les pages, [frontend-hooks.md](./frontend-hooks.md) pour les hooks

## Layout Components

Dir: `frontend/src/components/layout/`

### Header
- File: `Header.tsx`
- Sticky top, z-50, backdrop-blur, border-b
- Desktop: logo + nav (Accueil, Missions, Offres) + auth section
- Mobile: logo + hamburger (MobileNav)
- Auth section:
  - Authentifie: NotificationBell + Avatar dropdown (Profil, Deconnexion)
  - Non authentifie: boutons Connexion / Inscription
- Responsive breakpoint: `md:` (768px)

### Footer
- File: `Footer.tsx`
- Copyright dynamique + "GR attitude. Tous droits reserves."

### MobileNav
- File: `MobileNav.tsx`
- Sheet (panneau lateral droit, 72 units)
- Liens: Accueil, Missions, Offres + Separator + auth conditionnel
- Se ferme au clic sur un lien

### NotificationBell
- File: `NotificationBell.tsx`
- Hook: `useUnreadCount()` (polling 30s)
- Icone Bell + badge rouge (count, "9+" si >9)
- Toggle: ouvre/ferme NotificationDropdown
- Click-outside: ferme le dropdown (useRef + useEffect)

### NotificationDropdown
- File: `NotificationDropdown.tsx`
- Props: `{ onClose: () => void }`
- Hooks: `useNotifications()`, `useMarkNotificationRead()`
- Affiche les 5 notifications les plus recentes
- Chaque notif: blue dot (unread) + title + body + timeAgo
- Click: mark as read
- Footer: lien "Voir toutes les notifications" → `/notifications`
- Position: absolute right-0 top-full, w-80, z-50

## Mission Components

Dir: `frontend/src/components/missions/`

### MissionCard
- File: `MissionCard.tsx`
- Props: `{ mission: IMission }`
- Lien vers `/missions/[id]`
- Contenu: badge category + badge urgency (colore) + title + description (truncated) + MissionProgress + creator + timeAgo
- Urgency colors: faible=emerald, moyen=amber, urgent=red

### MissionProgress
- File: `MissionProgress.tsx`
- Props: `{ percent: number }`
- Barre Progress (shadcn) + label pourcentage

### ContributionButtons
- File: `ContributionButtons.tsx`
- Props: `{ missionId: string }`
- Hook: `useCreateContribution()`
- 4 boutons en grille 2x2:
  - PARTICIPE: HandHelping, blue-600
  - PROPOSE: Lightbulb, purple-600
  - FINANCE: Coins, emerald-600
  - CONSEILLE: MessageCircle, amber-600
- Click: ouvre Dialog avec textarea message optionnel
- Submit: mutation create contribution + toast success

### CloseMissionDialog
- File: `CloseMissionDialog.tsx`
- Props: `{ missionId: string }`
- Hook: `useCloseMission()`
- Multi-step dialog (4 steps):
  1. Confirmation ("Cloturer cette mission?")
  2. Feedback (textarea optionnel)
  3. Thanks (textarea optionnel pour remerciements aux contributeurs)
  4. Success (checkmark emerald + "Mission resolue!")
- Trigger: bouton "Marquer comme resolue" (outline, full width)

### EditMissionDialog
- File: `EditMissionDialog.tsx`
- Props: `{ mission: IMission }`
- Hook: `useUpdateMission()` mutation → `missionsApi.update()`
- Fields: title, description, category, helpType, urgency, visibility, location, tags
- Validation: title + description required
- On success: invalidate queries + toast + close dialog
- Trigger: button "Modifier" (outline, Pencil icon)

## Offer Components

Dir: `frontend/src/components/offers/`

### OfferCard
- File: `OfferCard.tsx`
- Props: `{ offer: IOffer }`
- Lien vers `/offers/[id]`
- Badge offerType (colore) + badge category + title + description + creator + timeAgo
- OfferType colors: don=blue, competence=purple, materiel=orange, service=green, ecoute=pink

### EditOfferDialog
- File: `EditOfferDialog.tsx`
- Props: `{ offer: IOffer }`
- Hook: `useUpdateOffer()` mutation → `offersApi.update()`
- Fields: title, description, offerType, category (optional), availability, visibility, location, tags
- Validation: title + description required
- On success: invalidate queries + toast + close dialog
- Trigger: button "Modifier" (outline, Pencil icon)

## UI Components (shadcn/ui)

Dir: `frontend/src/components/ui/`

Tous generes par shadcn CLI (Radix + Tailwind):

| Component | Usage principal |
|-----------|----------------|
| Avatar | Header, profil, contributions |
| Badge | Categories, urgence, types, statuts |
| Button | CTAs, actions (variants: default, secondary, destructive, outline, ghost) |
| Card | MissionCard, OfferCard, sections de pages |
| Dialog | ContributionButtons, CloseMissionDialog |
| DropdownMenu | Avatar menu (Header) |
| Input | Formulaires, recherche |
| Label | Formulaires |
| Progress | MissionProgress barre |
| Select | Filtres (category, urgency, helpType, offerType) |
| Separator | Divisions visuelles |
| Sheet | MobileNav (panneau lateral) |
| Sonner/Toaster | Notifications toast (succes, erreur) |
| Tabs | Profile page (missions/offres) |
| Textarea | Message contribution, description, feedback |

## Helper Functions

### timeAgo(dateStr)
- Utilise dans: MissionCard, OfferCard, NotificationDropdown, mission/offer detail pages
- Retourne: "A l'instant", "Il y a X min", "Il y a Xh", "Il y a Xj", "Il y a X mois"
- Definie localement dans chaque fichier qui l'utilise (pas de shared util)

### daysUntil(dateStr)
- Utilise dans: mission detail page
- Retourne: nombre de jours restants avant expiration
