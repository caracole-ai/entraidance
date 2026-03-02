# Frontend Pages

> Voir aussi: [frontend-hooks.md](./frontend-hooks.md), [frontend-components.md](./frontend-components.md)

## Routes Map

| Route | Page | Auth requise | Description |
|-------|------|-------------|-------------|
| `/` | Home | Non | Hero + comment ça marche + 6 missions récentes |
| `/login` | Login | Non | Formulaire email/password |
| `/register` | Register | Non | Formulaire inscription |
| `/missions` | Missions Feed | Non | Liste filtrable + pagination |
| `/missions/new` | Create Mission | Oui (modal auth) | Formulaire wizard 4 étapes |
| `/missions/[id]` | Mission Detail | Non (UI conditionnelle) | Détail + contributions |
| `/offers` | Offers Feed | Non | Liste filtrable + pagination |
| `/offers/new` | Create Offer | Oui (modal auth) | Formulaire wizard 3 étapes |
| `/offers/[id]` | Offer Detail | Non (UI conditionnelle) | Détail + corrélations |
| `/profile` | User Profile | Oui (UI conditionnelle) | Stats + mes missions/offres |
| `/profile/edit` | Edit Profile | Oui (implicite) | Bio, skills, interests, etc. |
| `/notifications` | Notifications | Oui (implicite) | Liste complète notifications |
| `/callback` | OAuth Callback | Non | Redirection OAuth |
| `/faq` | FAQ | Non | Foire aux questions |

## Page Details

### `/` (Home)
- Hero: alternance typo Nunito + Playfair italic, gradient text, blobs décoratifs violet
- Section "Comment ça marche" : 3 étapes avec icônes SVG et numéros gradient
- Missions récentes: grille 6 MissionCards
- CTA footer: "Rejoignez la communauté"

### `/missions/new`
- **FormWizard** 4 étapes avec stepper en pills glassmorphism
- Step 1: Description (title + description) — ValidatedInput
- Step 2: Classification — **BadgeSelector** (catégorie avec emoji, type d'aide, urgence avec couleurs)
- Step 3: Visibilité — **ToggleSwitch** (🌍 Public / 👥 Groupe / 🔒 Privé) + tags
- Step 4: Confirmation — preview avec badges
- **AuthRequiredModal** si user non connecté au submit
- Submit: gradient button + shimmer

### `/missions/[id]`
- Header gradient coloré par catégorie avec CategoryIcon
- Badges: catégorie, urgence (avec dot coloré), helpType
- Sous-titre Playfair italic: "X personnes solidaires" ou "En attente de solidarité…"
- **Pas de barre de progression** — supprimée volontairement
- ContributionButtons: 4 boutons gradient avec glow + emoji
- Actions créateur: Modifier, Clôturer, Supprimer
- Liste contributions

### `/offers/new`
- **FormWizard** 3 étapes
- Step 1: Description + disponibilité — ValidatedInput
- Step 2: Classification — **BadgeSelector** (type d'offre, catégorie) + **ToggleSwitch** (visibilité) + tags
- Step 3: Confirmation
- **AuthRequiredModal** si user non connecté au submit

### `/offers/[id]`
- Header gradient coloré par catégorie
- Badges: offerType, category, status
- Missions corrélées avec score

### `/faq`
- Accordion 4 sections avec emoji et fonds colorés
- Sections: 💡 Général, 🎯 Missions & Offres, 🔮 IA & Matching, 🔐 Compte & Sécurité

## Layout

File: `app/layout.tsx`

```
<QueryProvider>
  <AuthProvider>
    <SocketProvider>
      <Header />
      <main>{page}</main>
      <Footer />
      <Toaster />
    </SocketProvider>
  </AuthProvider>
</QueryProvider>
```

Fonts: **Nunito** (display) + **Inter** (sans) + **Playfair Display** (elegant)

## Auth Protection Pattern

- Pas de middleware Next.js — protection côté client
- Pages création (missions/offers/new): **AuthRequiredModal** au submit si non connecté
- Profile: message "Connectez-vous" si pas authentifié
- Login/Register: redirect vers `/missions` après auth
