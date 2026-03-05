# Déploiement VPS Production — Entraidance

**Dernière mise à jour** : 2026-03-05
**VPS** : Hostinger KVM 1 (Debian 12)
**IP** : 187.124.32.100
**Domaines** : entraidance.com, .org, .fr, .cloud (+ www)

---

## Stack

| Composant | Version | Détails |
|-----------|---------|---------|
| OS | Debian 12 | 6.1.0-43-amd64 |
| Node.js | v24.14.0 | via nodesource LTS |
| PM2 | v6.0.14 | Process manager |
| Nginx | v1.22.1 | Reverse proxy + SSL |
| Certbot | v2.1.0 | Let's Encrypt auto-renewal |
| Backend | NestJS 11 | Port 3000 |
| Frontend | Next.js 16 | Port 3001 |
| DB | SQLite | TypeORM, fichier local |

## Structure fichiers VPS

```
/opt/entraidance/
├── backend/
│   ├── dist/                  # Build NestJS compilé
│   ├── gr_attitude.sqlite     # Base de données SQLite
│   ├── .env                   # Variables d'environnement prod
│   ├── node_modules/
│   └── package.json
├── frontend/
│   ├── .next/                 # Build Next.js
│   ├── .env                   # Variables d'environnement prod
│   ├── node_modules/
│   └── package.json
└── .env.production            # Config partagée (référence)
```

---

## Variables d'environnement

### Backend (`/opt/entraidance/backend/.env`)

```bash
NODE_ENV=production
PORT=3000

# Database (SQLite, chemin relatif au dossier backend)
DATABASE_URL="file:./gr_attitude.sqlite"

# JWT
JWT_SECRET="<généré avec openssl rand -hex 32>"

# OAuth Google
GOOGLE_CLIENT_ID="<voir Google Cloud Console>"
GOOGLE_CLIENT_SECRET="<voir Google Cloud Console>"
GOOGLE_CALLBACK_URL="https://entraidance.com/api/auth/google/callback"

# Frontend
FRONTEND_URL="https://entraidance.com"

# CORS (tous les domaines, root + www)
CORS_ORIGIN=https://entraidance.com,https://www.entraidance.com,https://entraidance.org,https://www.entraidance.org,https://entraidance.fr,https://www.entraidance.fr,https://entraidance.cloud,https://www.entraidance.cloud
```

### Frontend (`/opt/entraidance/frontend/.env`)

```bash
NEXT_PUBLIC_API_URL=https://entraidance.com/api
```

> ⚠️ **NEXT_PUBLIC_** vars sont incluses au **BUILD TIME**. Tout changement nécessite un rebuild (`npm run build`), pas juste un restart PM2.

---

## Nginx (`/etc/nginx/sites-available/entraidance`)

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name entraidance.com www.entraidance.com entraidance.org www.entraidance.org
                entraidance.fr www.entraidance.fr entraidance.cloud www.entraidance.cloud;
    return 301 https://$host$request_uri;
}

# HTTPS
server {
    listen 443 ssl;
    server_name entraidance.com www.entraidance.com entraidance.org www.entraidance.org
                entraidance.fr www.entraidance.fr entraidance.cloud www.entraidance.cloud;

    ssl_certificate /etc/letsencrypt/live/entraidance.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/entraidance.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # API : strip /api/ prefix avant proxy vers backend
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

> ⚠️ **Rewrite obligatoire** : Le backend NestJS expose `/missions`, `/auth/...` etc. sans prefix `/api`. Nginx strip le prefix avec `rewrite ^/api/(.*)$ /$1 break;`.

---

## PM2

### Commandes courantes

```bash
pm2 list                    # État des process
pm2 logs backend --lines 50 # Logs backend
pm2 logs frontend --lines 50
pm2 monit                   # Monitoring temps réel
```

### Démarrage / Restart

```bash
# ⚠️ TOUJOURS utiliser --update-env pour recharger les variables
# Sans ça, PM2 garde les anciennes vars en cache

# Backend
cd /opt/entraidance/backend
pm2 delete backend
pm2 start npm --name backend --update-env -- run start:prod

# Frontend
cd /opt/entraidance/frontend
pm2 delete frontend
PORT=3001 pm2 start npm --name frontend --update-env -- run start
```

### Persistence (auto-restart au reboot)

```bash
pm2 save
pm2 startup
# Copier et exécuter la commande retournée
```

---

## Base de données

### Fichier

```
/opt/entraidance/backend/gr_attitude.sqlite
```

### Seed (données démo)

```bash
cd /opt/entraidance/backend
npm run seed         # Ajouter 5 users + 6 missions + 4 offers
npm run seed:clear   # Supprimer les données démo (isDemo: true)
```

### Backup

```bash
cp /opt/entraidance/backend/gr_attitude.sqlite /opt/entraidance/backend/gr_attitude.sqlite.bak
```

### Reset complet

```bash
cd /opt/entraidance/backend
rm -f gr_attitude.sqlite*
pm2 restart backend   # TypeORM synchronize recrée le schema
npm run seed          # Re-seed
```

> ⚠️ Le seed a été corrigé le 2026-03-05 : `name`→`displayName`, `picture`→`avatarUrl`, `tags: []`, `expiresAt: new Date(...)`, champs `category`/`offerType`/`availability` obligatoires pour les offers.

---

## SSL (Let's Encrypt)

### Certificat unique SAN (8 domaines)

```bash
certbot --nginx --non-interactive --agree-tos --email contact@entraidance.com \
  -d entraidance.com -d www.entraidance.com \
  -d entraidance.org -d www.entraidance.org \
  -d entraidance.fr -d www.entraidance.fr \
  -d entraidance.cloud -d www.entraidance.cloud \
  --redirect
```

### Auto-renouvellement

```bash
systemctl status certbot.timer   # Vérifier que le timer est actif
certbot renew --dry-run          # Test
```

---

## DNS (Hostinger)

Pour **chaque domaine** (entraidance.com, .org, .fr, .cloud), configurer dans Hostinger Panel → DNS :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | @ | 187.124.32.100 | 14400 |
| A | www | 187.124.32.100 | 14400 |

Vérification :
```bash
for d in entraidance.com entraidance.org entraidance.fr entraidance.cloud; do
  echo "=== $d ===" && dig +short $d && dig +short www.$d
done
```

---

## OAuth Google

### Configuration actuelle

- **Project** : `entraidance-457111`
- **Client** : `Entraidance Web Client`
- **Client ID** : `719616477303-aq78j8gvrn6jpj1c5ts90eh9a6sohc4d.apps.googleusercontent.com`

### Redirect URIs requises

Dans Google Cloud Console → APIs → Credentials → Entraidance Web Client :

```
https://entraidance.com/api/auth/google/callback
http://localhost:3001/auth/google/callback
```

### Rotation credentials

1. Google Cloud Console : créer nouveau OAuth 2.0 Client ID
2. Update `.env` backend : `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
3. `pm2 delete backend && pm2 start npm --name backend --update-env -- run start:prod`
4. Tester flow : `/login` → Google → callback → dashboard

---

## Déploiement nouvelle version

```bash
ssh root@187.124.32.100
cd /opt/entraidance
git pull origin main

# Backend
cd backend && npm install && npm run build && pm2 restart backend

# Frontend (rebuild obligatoire si NEXT_PUBLIC_* changé)
cd ../frontend && npm install && npm run build && pm2 restart frontend

# Vérifier
pm2 logs --lines 20
curl -s https://entraidance.com/api/missions | head -c 100
```

---

## Troubleshooting

### 1. Missions ne s'affichent pas (loading infini)

**Causes possibles** (vérifier dans l'ordre) :

1. **DB vide** → `npm run seed` dans `/opt/entraidance/backend`
2. **NEXT_PUBLIC_API_URL manquant** → Vérifier `/opt/entraidance/frontend/.env`, rebuild si changé
3. **CORS bloqué** → Console browser montre `ERR_FAILED` → Ajouter le domaine dans `CORS_ORIGIN` du backend
4. **Nginx rewrite manquant** → API retourne 404 → Vérifier `rewrite ^/api/(.*)$` dans config Nginx

### 2. OAuth redirect_uri_mismatch

Le redirect URI `https://entraidance.com/api/auth/google/callback` doit être enregistré dans Google Cloud Console (voir section OAuth).

### 3. PM2 ne prend pas les nouvelles vars d'env

**TOUJOURS** utiliser `pm2 delete <name>` + `pm2 start ... --update-env`. Un simple `pm2 restart` garde les anciennes vars.

### 4. Backend ne démarre pas

```bash
pm2 logs backend --lines 100
cd /opt/entraidance/backend
npm run build   # Vérifier erreurs TypeScript
```

Erreur connue : `HelpType.AUTRE` manquant dans `matching.service.ts` → ajouter `[HelpType.AUTRE]: []`.

### 5. Frontend port conflit

```bash
pm2 delete frontend
cd /opt/entraidance/frontend
PORT=3001 pm2 start npm --name frontend --update-env -- run start
```

### 6. SSL échec

```bash
dig +short entraidance.com   # Doit retourner 187.124.32.100
certbot renew --dry-run
nginx -t
```

---

## Monitoring

```bash
htop                              # CPU/RAM
df -h                             # Disk
pm2 monit                         # Process
tail -f /var/log/nginx/error.log  # Nginx errors
pm2 logs --lines 50               # App logs
```

### Health check rapide

```bash
curl -sf https://entraidance.com > /dev/null && echo "✅ Frontend" || echo "❌ Frontend"
curl -sf https://entraidance.com/api/missions > /dev/null && echo "✅ API" || echo "❌ API"
```

---

## Sécurité (recommandé)

```bash
apt install -y fail2ban unattended-upgrades
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable
```

---

**Déployé le** : 2026-03-05 par Cloclo 🔧
