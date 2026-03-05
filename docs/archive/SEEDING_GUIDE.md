# Guide de Seeding des Données Démo

## 🎯 Objectif

Peupler la base de données de production avec des utilisateurs, missions, offres et contributions factices pour tester la plateforme.

**Toutes les données sont marquées `isDemo: true`** et peuvent être supprimées en une commande.

---

## 📊 Données Générées

### **5 Utilisateurs démo**

| Email | Nom | Profil | Localisation | Premium |
|-------|-----|--------|--------------|---------|
| `demo.alice@gr-attitude.test` | Alice Martin | Développeuse web (React, Node.js) | Paris | Non |
| `demo.bob@gr-attitude.test` | Bob Durand | Bricoleur chevronné | Paris | **Oui** |
| `demo.claire@gr-attitude.test` | Claire Dubois | Professeure de français | Lyon | Non |
| `demo.david@gr-attitude.test` | David Petit | Graphiste freelance | Marseille | **Oui** |
| `demo.emma@gr-attitude.test` | Emma Rousseau | Étudiante en médecine, cuisinière | Paris | Non |

### **6 Missions démo**

1. **Aide pour déménagement ce week-end** (Transport, Urgent) — 2 participations
2. **Recherche accompagnement pour rendez-vous médical** (Transport, Moyen)
3. **Besoin d'aide pour réparer un robinet qui fuit** (Bricolage, Moyen) — 1 participation
4. **Soutien scolaire en maths pour collégien** (Éducation, Faible)
5. **Aide pour créer un site web simple** (Numérique, Faible, En cours 30%) — 1 participation
6. **Recherche compagnie pour promenade quotidienne** (Écoute, Moyen)

### **4 Offres démo**

1. **Cours de français gratuits pour adultes** (Éducation, Compétence) — Lyon
2. **Aide au bricolage et petits travaux** (Bricolage, Compétence) — Paris
3. **Design graphique et retouche photo** (Numérique, Compétence) — Marseille
4. **Prêt d'outils de jardinage** (Autre, Matériel) — Paris

### **4 Contributions démo**

- 2 participations sur la mission "déménagement"
- 1 participation sur "plomberie"
- 1 participation sur "site web"

---

## 🚀 Déploiement sur Render

### Étape 1 : Attendre le déploiement backend

Render détecte automatiquement le push Git et lance le build.

**Vérifier le statut :**
1. Aller sur https://dashboard.render.com/web/srv-d6f4cshr0fns73f2vvsg
2. Attendre que le **dernier deploy** (commit `b57b0d4`) soit **Live** (~ 2-3 min)

### Étape 2 : Ouvrir le Shell Render

1. Render Dashboard → `gr-attitude-api` → **Shell** (onglet du haut)
2. Attendre que le terminal se connecte

### Étape 3 : Exécuter le seeding

Dans le Shell Render, taper :

```bash
npm run seed
```

**Output attendu :**
```
✅ Database connection established
🌱 Seeding demo data...
  → Creating demo users...
  ✅ Created 5 demo users
  → Creating demo missions...
  ✅ Created 6 demo missions
  → Creating demo offers...
  ✅ Created 4 demo offers
  → Creating demo contributions...
  ✅ Created 4 demo contributions
🎉 Demo data seeded successfully!
✅ Database connection closed
```

### Étape 4 : Vérifier sur le frontend

1. Aller sur https://gr-attitude-frontend.onrender.com
2. **Se connecter avec Google OAuth**
3. Naviguer vers `/missions` → **6 missions doivent apparaître**
4. Naviguer vers `/offers` (si page existe) → **4 offres doivent apparaître**

---

## 🧹 Suppression des Données Démo

**Quand tu veux nettoyer la base (avant lancement public) :**

1. Render Dashboard → `gr-attitude-api` → **Shell**
2. Exécuter :

```bash
npm run seed:clear
```

**Output attendu :**
```
🧹 Clearing demo data...
  ✅ Deleted 4 demo contributions
  ✅ Deleted 6 demo missions
  ✅ Deleted 4 demo offers
  ✅ Deleted 5 demo users
🎉 Demo data cleared successfully!
```

**⚠️ Sécurité :** Seules les entités avec `isDemo: true` sont supprimées. Les vrais utilisateurs et missions ne sont **jamais touchés**.

---

## 🔧 Utilisation Locale (Dev)

### Seeding

```bash
cd backend
npm run seed
```

### Suppression

```bash
npm run seed:clear
```

---

## 📝 Détails Techniques

### Structure des Données

**Champs `isDemo` ajoutés aux entités :**
- `User.isDemo: boolean`
- `Mission.isDemo: boolean`
- `Offer.isDemo: boolean`
- `Contribution.isDemo: boolean`

**Fichiers :**
- Seeder : `backend/src/database/seeders/demo-data.seeder.ts`
- Script CLI : `backend/src/database/seed.ts`
- Entités modifiées : `users`, `missions`, `offers`, `contributions`

### Emails Demo

Les utilisateurs démo utilisent le domaine `.test` (invalide pour OAuth). Ils ne peuvent **pas se connecter via Google**.

Pour tester l'app, **connecte-toi avec ton propre compte Google**, les données démo seront visibles pour tous les utilisateurs authentifiés.

---

## ✅ Checklist de Test

Après seeding, vérifie :

- [ ] 6 missions apparaissent sur `/missions`
- [ ] Les missions ont des créateurs avec avatars et noms
- [ ] Les tags sont affichés correctement
- [ ] Les contributions (👥 compteur) apparaissent sur les missions concernées
- [ ] Les offres apparaissent sur `/offers` (si page implémentée)
- [ ] Les localisations (Paris, Lyon, Marseille) sont correctes
- [ ] Les statuts "Ouverte" / "En cours" sont affichés
- [ ] La mission "site web" affiche "En cours 30%"

---

## 🐛 Dépannage

### Le seeding échoue avec "Database locked"

**Cause :** Le backend est en cours d'exécution et verrouille la DB.

**Solution :**
1. Attendre que le backend soit idle
2. Ou redémarrer le service backend (via Render Dashboard → Manual Deploy)
3. Relancer `npm run seed`

### Les données n'apparaissent pas sur le frontend

**Vérifications :**
1. Le seeding s'est bien terminé (voir logs Shell)
2. Le frontend est bien connecté au bon backend (`NEXT_PUBLIC_API_URL`)
3. L'utilisateur est bien authentifié (OAuth Google)
4. Faire un hard refresh du frontend (Cmd+Shift+R / Ctrl+Shift+F5)

### Emails `.test` non valides

**Normal !** Les utilisateurs démo ne peuvent pas se connecter. Utilise ton propre compte Google pour tester.

---

## 📌 Rappel

**Avant de mettre le site en production publique :**

```bash
npm run seed:clear
```

Cela supprime **toutes les données factices** en toute sécurité ! 🎯
