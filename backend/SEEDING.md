# Seeding de Données Démo

## Vue d'ensemble

Le backend expose une API de seeding (`POST /seed`) pour générer des données de démonstration marquées `isDemo: true`.

**Toutes les données démo peuvent être supprimées en une commande** via `POST /seed/clear`.

---

## Endpoints Disponibles

### POST /seed

Génère des données de démonstration :
- **5 utilisateurs** démo (avec emails `.test`)
- **6 missions** variées (urgentes, moyennes, faibles)
- **4 offres** de services
- **4 contributions** sur missions

**Utilisation en production (Render Shell) :**
```bash
curl -X POST http://localhost:3001/seed
```

**Utilisation en local :**
```bash
curl -X POST http://localhost:3001/seed
```

**Réponse attendue :**
```json
{
  "message": "Demo data seeded successfully",
  "counts": {
    "users": 5,
    "missions": 6,
    "offers": 4,
    "contributions": 4
  }
}
```

---

### POST /seed/clear

Supprime **uniquement** les données marquées `isDemo: true`.

**⚠️ Sécurité** : Les vraies données utilisateur ne sont **jamais** supprimées.

**Utilisation :**
```bash
curl -X POST http://localhost:3001/seed/clear
```

**Réponse attendue :**
```json
{
  "message": "Demo data cleared successfully",
  "deletedCounts": {
    "contributions": 4,
    "missions": 6,
    "offers": 4,
    "users": 5
  }
}
```

---

### POST /seed/sync-schema

Synchronise le schéma de la base de données (équivalent à TypeORM `synchronize: true`).

**⚠️ Danger** : Ne pas utiliser en production avec des données réelles.

**Utilisation :**
```bash
curl -X POST http://localhost:3001/seed/sync-schema
```

---

## Données Générées

Voir [docs/SEEDING_GUIDE.md](../docs/SEEDING_GUIDE.md) pour la liste complète des utilisateurs, missions et offres créés.

**Résumé** :
- 5 utilisateurs avec profils variés (développeuse, bricoleur, prof, graphiste, étudiante)
- 6 missions (déménagement, accompagnement médical, plomberie, soutien scolaire, site web, promenade)
- 4 offres (cours français, bricolage, design, prêt outils)
- 4 contributions (participations sur missions)

---

## Utilisation en Production (Render)

1. Render Dashboard → `gr-attitude-api` → **Shell**
2. Attendre la connexion au terminal
3. Exécuter :
   ```bash
   curl -X POST http://localhost:3001/seed
   ```
4. Vérifier les données sur le frontend : https://gr-attitude-frontend.onrender.com/missions

---

## Nettoyage Avant Mise en Production

**Avant de rendre le site public**, supprimer toutes les données démo :

```bash
curl -X POST http://localhost:3001/seed/clear
```

Vérifier que les compteurs sont à zéro :
```json
{
  "message": "Demo data cleared successfully",
  "deletedCounts": {
    "contributions": 0,
    "missions": 0,
    "offers": 0,
    "users": 0
  }
}
```

---

## Implémentation Technique

**Fichiers :**
- Controller : `backend/src/seed/seed.controller.ts`
- Service : `backend/src/seed/seed.service.ts`
- Module : `backend/src/seed/seed.module.ts`

**Champ `isDemo`** :
Ajouté à toutes les entités principales :
- `User.isDemo: boolean`
- `Mission.isDemo: boolean`
- `Offer.isDemo: boolean`
- `Contribution.isDemo: boolean`

**Sécurité** :
- Le `clear` utilise `{ isDemo: true }` comme filtre strict
- Pas de suppression possible des données réelles

---

## Notes

- Les utilisateurs démo utilisent des emails `.test` (invalides pour OAuth)
- Se connecter avec un vrai compte Google pour voir les données démo
- Le seeding est **idempotent** : peut être relancé plusieurs fois
- Si des données démo existent déjà, elles ne sont pas dupliquées
