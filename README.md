# Entraidance 🤝

**Plateforme sociale d'entraide structurée** — Un réseau social orienté action pour organiser les demandes d'aide (Missions) et les offres d'aide (Offres).

> *« Trouvez des solutions, Soyez la solution. Tout simplement. »*

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation

```bash
# 1. Installer les dépendances
npm install --prefix backend
npm install --prefix frontend

# 2. Configurer l'environnement
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos credentials OAuth (Google/Facebook)

# 3. Lancer le projet
./dev.sh
```

Accès :
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3001

---

## 🏗️ Stack technique

### Backend
- **Framework** : NestJS 11
- **Langage** : TypeScript 5
- **Base de données** : SQLite + TypeORM
- **Auth** : Passport (JWT + OAuth2 Google/Facebook)
- **Real-time** : Socket.io (WebSocket notifications)
- **Matching** : Algorithme V2.1 (7 facteurs + skills)

### Frontend
- **Framework** : Next.js 16 + React 19
- **Langage** : TypeScript 5
- **State** : TanStack React Query
- **UI** : Radix UI + Tailwind CSS + shadcn/ui

### Infrastructure
- **Hébergement** : VPS Hostinger
- **Reverse proxy** : Nginx
- **Process manager** : PM2
- **SSL** : Certbot/Let's Encrypt

---

## 📁 Structure du projet

```
entraidance/
├── backend/          # API NestJS (TypeScript)
├── frontend/         # Interface Next.js (React 19)
├── docs/             # Documentation technique
└── PRD.md            # Product Requirements Document
```

---

## 🔑 Configuration OAuth

### Google OAuth
1. Console : https://console.cloud.google.com/
2. Créer credentials OAuth 2.0
3. Ajouter à `backend/.env` :
   ```env
   GOOGLE_CLIENT_ID=your-id
   GOOGLE_CLIENT_SECRET=your-secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
   ```

---

## 🧪 Développement

### Backend (NestJS)

```bash
cd backend
npm run start:dev    # Dev avec hot reload
npm run build        # Build production
npm run seed         # Seeding base de données
```

### Frontend (Next.js)

```bash
cd frontend
npm run dev          # Dev avec hot reload
npm run build        # Build production
npm run lint         # Linting
```

---

## 🤝 Philosophie

Ce projet suit les principes :
- **Simplicité radicale** — friction minimale
- **Responsabilisation bilatérale** — demandeur ET aidant acteurs
- **Action > scroll** — ce n'est pas un feed social

---

## 📄 License

Projet privé — Tous droits réservés.

---

**Dernière mise à jour** : 2026-03-05  
**Auteur** : Équipe Entraidance
