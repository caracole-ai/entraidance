# Frontend Components

> Voir aussi: [frontend-pages.md](./frontend-pages.md) pour l'utilisation dans les pages, [frontend-hooks.md](./frontend-hooks.md) pour les hooks

## Design System

### Identité visuelle
- **Palette** : violet-indigo fumé (primary), rose-blush (secondary), sage pastel (accent)
- **Glassmorphism** : backdrop-blur + transparence sur cards, modals, inputs
- **CSS utilities** : `.glass-card`, `.gradient-glass`, `.gradient-subtle`, `.gradient-primary`, `.gradient-text-primary`
- **Typographies** :
  - **Nunito** (`.font-display`) — titres bold, énergie
  - **Playfair Display italic** (`.font-elegant`) — accents luxueux, mots-clés dans les titres
  - **Inter** (`.font-sans`) — corps de texte lisible
- Alternance typo dans les titres : ex. "La solidarité," (Nunito) + "*en action*" (Playfair + gradient)

## Layout Components

Dir: `frontend/src/components/layout/`

### Header
- File: `Header.tsx`
- Sticky top, z-50, backdrop-blur, border-b
- Desktop: logo + nav (Accueil, Missions, Offres, FAQ) + auth section
- Mobile: logo + hamburger (MobileNav)
- Auth section:
  - Authentifié: NotificationBell + Avatar dropdown (Profil, Déconnexion)
  - Non authentifié: boutons Connexion / Inscription
- Responsive breakpoint: `md:` (768px)

### Footer
- File: `Footer.tsx`
- Copyright dynamique + "Entraidance. Tous droits réservés."

### MobileNav
- File: `MobileNav.tsx`
- Sheet (panneau latéral droit, 72 units)
- Liens: Accueil, Missions, Offres, FAQ + Separator + auth conditionnel
- Se ferme au clic sur un lien

### NotificationBell / NotificationDropdown
- Polling 30s, badge rouge (count, "9+" si >9)
- Dropdown: 5 dernières notifications, mark as read, lien "Voir tout"

## Mission Components

Dir: `frontend/src/components/missions/`

### MissionCard
- File: `MissionCard.tsx`
- Props: `{ mission: IMission }`
- Lien vers `/missions/[id]`
- Contenu: CategoryIcon + badge category + badge urgency (coloré) + title + description (truncated) + creator + timeAgo
- Barre latérale colorée par catégorie
- Urgency colors: faible=emerald, moyen=amber, urgent=red
- Wrapped in ScaleOnHover animation

### ContributionButtons
- File: `ContributionButtons.tsx`
- Props: `{ missionId: string }`
- 4 boutons en grille 2x2 avec **gradients**, **glow au hover**, **shimmer**, **emoji** :
  - 🤝 PARTICIPE: gradient indigo-violet
  - 💡 PROPOSE: gradient violet-rose
  - 💰 FINANCE: gradient teal-emerald
  - 🧭 CONSEILLE: gradient gold-amber
- Click: ouvre Dialog glassmorphism avec textarea message optionnel
- Submit: mutation create contribution + toast success

### CloseMissionDialog / EditMissionDialog
- CloseMission: multi-step dialog (confirmation → feedback → thanks → success)
- EditMission: form dialog avec tous les champs éditables

## Offer Components

Dir: `frontend/src/components/offers/`

### OfferCard
- File: `OfferCard.tsx`
- Badge offerType (coloré) + badge category + title + description + creator + timeAgo

### EditOfferDialog
- Form dialog avec tous les champs éditables

## Form Components

Dir: `frontend/src/components/forms/`

### FormWizard
- File: `FormWizard.tsx`
- Step indicator en pills glassmorphism avec emoji (✍️🏷️👁️✨)
- Card en `.glass-card`
- Bouton submit gradient + shimmer
- Alternance typo dans le titre

### BadgeSelector
- File: `BadgeSelector.tsx`
- Remplace les `<Select>` dropdown
- Grille de badges cliquables avec emoji par option
- Badge sélectionné: scale-up + check ✓ + border primary
- Props génériques: `options`, `labels`, `icons`, `colors`, `columns`

### ToggleSwitch
- File: `ToggleSwitch.tsx`
- Remplace les `<Select>` pour choix binaires/ternaires (ex: visibilité)
- Indicateur coulissant animé
- Options avec emoji (🌍 Public / 👥 Groupe / 🔒 Privé)

### ValidatedInput
- File: `ValidatedInput.tsx`
- Input/Textarea avec validation min length, character counter, error state

### AuthRequiredModal
- File: `src/components/auth/AuthRequiredModal.tsx`
- Modal glassmorphism affichée quand un user non connecté essaye de créer une mission/offre
- CTA: "Créer un compte" (gradient) + "Se connecter" (outline)

## Animation Components

Dir: `frontend/src/components/ui/motion.tsx`

- **FadeIn** : fade + slide up avec delay configurable
- **StaggerContainer / StaggerItem** : animation en cascade
- **ScaleOnHover** : scale up on hover (utilisé sur MissionCard)

## Category Icons

Dir: `frontend/src/components/icons/CategoryIcon.tsx`

- SVG animés par catégorie de mission
- Couleurs associées par catégorie (`CATEGORY_COLORS`)

## UI Components (shadcn/ui)

Dir: `frontend/src/components/ui/`

Tous générés par shadcn CLI (Radix + Tailwind):

| Component | Usage principal |
|-----------|----------------|
| Avatar | Header, profil, contributions |
| Badge | Catégories, urgence, types, statuts |
| Button | CTAs, actions |
| Card | MissionCard, OfferCard, sections |
| Dialog | Contributions, modals, auth |
| Input | Formulaires, recherche |
| Select | Filtres dans les pages listes (category, urgency) |
| Sheet | MobileNav |
| Sonner/Toaster | Notifications toast |
| Tabs | Profile page |

## Helper Functions

### timeAgo(dateStr)
- Retourne: "A l'instant", "Il y a X min", "Il y a Xh", "Il y a Xj", "Il y a X mois"
- Définie localement dans chaque fichier

### daysUntil(dateStr)
- Nombre de jours restants avant expiration
