# UI Redesign Brief - Page d'accueil Entraidance

## Objectif
Implémenter la nouvelle maquette UI de la page d'accueil selon `docs/ui-reference/code.html` et `docs/ui-reference/screen.png`.

## Référence
- **Maquette** : `docs/ui-reference/screen.png`
- **Code Tailwind** : `docs/ui-reference/code.html` (HTML statique à adapter en React/Next.js)

## Stack technique
- Next.js 16 (App Router)
- Tailwind CSS
- Framer Motion (animations)
- Composants existants dans `@/components/`

## Éléments à implémenter

### 1. Header (refaire `components/layout/Header.tsx`)
- Logo + nom "Entraidance" avec icône violet
- Nav: Accueil, Besoins, Offrir son aide, Blog
- Barre de recherche avec icône
- Bouton "Connexion" violet arrondi
- Style: sticky, blur backdrop, border subtle

### 2. Hero Section (dans `app/page.tsx`)
- Gradient mesh background (radial gradients)
- Titre: "Besoins d'" + "entraide" en script font
- Sous-titre
- 2 CTA: "Comment ça marche ?" (violet plein) + "Publier un besoin" (outline)

### 3. Filtres par catégorie
- Pills horizontaux: Tous (actif), Services, Éducation, Transport, Bricolage
- Couleurs par catégorie (voir code.html)
- Indicateur "Autour de moi: Lyon, FR" à droite

### 4. Grid de Cards "Besoins" (adapter `MissionCard.tsx`)
- Style "liquid-glass" : fond semi-transparent, blur, border subtile
- Illustration SVG flottante en haut à droite de chaque card
- Avatar + nom + distance + temps
- Titre + description
- Tag catégorie coloré en bas à gauche
- Bouton "Voir le besoin" en bas à droite
- Hover: translate-y + shadow

### 5. Footer (créer `components/layout/Footer.tsx`)
- 4 colonnes: Logo+desc, Plateforme, Communauté, Aide
- Copyright avec cœur

## Couleurs (tailwind.config)
```js
colors: {
  primary: "#8b5cf6",  // violet
  mint: "#6ee7b7",
  "soft-orange": "#fb923c", 
  sky: "#38bdf8"
}
```

## Fonts
- Display: "Public Sans" (déjà configuré?)
- Script: "Marck Script" pour "entraide"

## Classes CSS custom à créer (globals.css)
```css
.mesh-gradient { /* voir code.html */ }
.liquid-glass { /* voir code.html */ }
```

## Priorité
1. Hero + gradient mesh
2. Grid de cards avec nouveau style
3. Filtres catégories
4. Header redesign
5. Footer

## Notes
- Garder la compatibilité avec les hooks existants (`useMissions`)
- Les données viennent du backend (pas de mock statique)
- Responsive mobile-first
