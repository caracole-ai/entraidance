# Guide Complet de Déploiement - Entraidance

Ce guide permet de reproduire le déploiement complet de A à Z.

## 📋 Prérequis

- Compte Hostinger avec :
  - VPS KVM 1+ (2GB RAM minimum)
  - Domaines configurés
  - Token API généré
- Accès SSH local (clé ed25519)
- Git installé localement

## 🚀 Déploiement Étape par Étape

### 1. Préparation VPS (15 min)

#### 1.1 Connexion initiale

```bash
# Générer clé SSH si nécessaire
ssh-keygen -t ed25519 -C "votre-email@example.com" -f ~/.ssh/id_ed25519 -N ""

# Ajouter la clé au VPS via Hostinger Panel
cat ~/.ssh/id_ed25519.pub
# Copier dans : https://hpanel.hostinger.com/vps/{vps_id}/settings
```

#### 1.2 Installation des dépendances

```bash
ssh root@{VPS_IP}

# Mise à jour système
apt update && apt upgrade -y

# Docker
apt install -y docker.io docker-compose

# Node.js LTS
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs

# PM2
npm install -g pm2

# Build tools (pour better-sqlite3)
apt install -y build-essential python3

# Nginx
apt install -y nginx

# Certbot
apt install -y certbot python3-certbot-nginx

# Vérification
docker --version
node --version
npm --version
pm2 --version
nginx -v
certbot --version
```

#### 1.3 Configuration firewall

```bash
# UFW (si utilisé)
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

### 2. Déploiement Application (20 min)

#### 2.1 Clone du repo

```bash
cd /opt
git clone https://github.com/caracole-ai/entraidance.git
cd entraidance
```

#### 2.2 Configuration environnement

```bash
# Générer JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Créer .env.production
cat > .env.production << EOF
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="file:/app/backend/prisma/prod.db"

# JWT
JWT_SECRET="$JWT_SECRET"

# OAuth Google (récupérer depuis Google Cloud Console)
GOOGLE_CLIENT_ID="votre-client-id"
GOOGLE_CLIENT_SECRET="votre-client-secret"
GOOGLE_CALLBACK_URL="https://entraidance.com/api/auth/google/callback"

# Frontend URL
FRONTEND_URL="https://entraidance.com"
EOF

# Copier dans chaque sous-dossier
cp .env.production backend/.env
cp .env.production frontend/.env
```

#### 2.3 Build Backend

```bash
cd /opt/entraidance/backend
npm install
npm run build

# Vérifier le build
ls -la dist/
```

#### 2.4 Build Frontend

```bash
cd /opt/entraidance/frontend
npm install
npm run build

# Vérifier le build
ls -la .next/
```

#### 2.5 Lancement avec PM2

```bash
# Backend
cd /opt/entraidance/backend
pm2 start npm --name backend -- run start:prod

# Frontend (IMPORTANT: spécifier le port)
cd /opt/entraidance/frontend
PORT=3001 pm2 start npm --name frontend --update-env -- run start

# Vérifier
pm2 list
pm2 logs --lines 50

# Sauvegarder la config PM2
pm2 save
pm2 startup
# Copier et exécuter la commande retournée
```

### 3. Configuration Nginx (10 min)

#### 3.1 Config initiale (HTTP seulement)

```bash
cat > /etc/nginx/sites-available/entraidance << 'EOF'
server {
    listen 80;
    server_name entraidance.com www.entraidance.com entraidance.org www.entraidance.org entraidance.fr www.entraidance.fr entraidance.cloud www.entraidance.cloud;

    location /api {
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
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/entraidance /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester et recharger
nginx -t
systemctl reload nginx
```

#### 3.2 Test accès HTTP

```bash
curl -I http://{VPS_IP}
# Doit retourner 200 OK
```

### 4. Configuration DNS (5 min)

#### 4.1 Enregistrements à créer

Pour **chaque domaine** (entraidance.com, .org, .fr, .cloud) :

Via Hostinger Panel → DNS / Serveurs de noms → Enregistrements DNS :

| Type | Nom | Pointe vers | TTL |
|------|-----|-------------|-----|
| A | @ | {VPS_IP} | 14400 |
| A | www | {VPS_IP} | 14400 |

#### 4.2 Vérification propagation

```bash
# Attendre 5-15 minutes puis tester
for domain in entraidance.com entraidance.org entraidance.fr entraidance.cloud; do
  echo "=== $domain ==="
  dig +short $domain
  dig +short www.$domain
done

# Tous doivent retourner {VPS_IP}
```

### 5. Installation SSL (10 min)

#### 5.1 Obtenir certificats

```bash
certbot --nginx --non-interactive --agree-tos --email contact@entraidance.com \
  -d entraidance.com -d www.entraidance.com \
  -d entraidance.org -d www.entraidance.org \
  -d entraidance.fr -d www.entraidance.fr \
  -d entraidance.cloud -d www.entraidance.cloud \
  --redirect
```

**Note** : Si erreur "Could not install certificate", c'est normal. Continuer étape 5.2.

#### 5.2 Config Nginx finale avec SSL

```bash
cat > /etc/nginx/sites-available/entraidance << 'EOF'
server {
    listen 80;
    server_name entraidance.com www.entraidance.com entraidance.org www.entraidance.org entraidance.fr www.entraidance.fr entraidance.cloud www.entraidance.cloud;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name entraidance.com www.entraidance.com entraidance.org www.entraidance.org entraidance.fr www.entraidance.fr entraidance.cloud www.entraidance.cloud;

    ssl_certificate /etc/letsencrypt/live/entraidance.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/entraidance.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location /api {
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
EOF

nginx -t
systemctl reload nginx
```

#### 5.3 Test HTTPS

```bash
for domain in entraidance.com www.entraidance.org entraidance.fr www.entraidance.cloud; do
  echo "=== https://$domain ==="
  curl -sI https://$domain | grep -E "^HTTP|^Server"
done

# Tous doivent retourner "HTTP/1.1 200 OK"
```

### 6. Vérification Finale (5 min)

#### 6.1 Checklist

- [ ] Backend répond : `curl http://localhost:3000/api`
- [ ] Frontend répond : `curl http://localhost:3001`
- [ ] Nginx fonctionne : `systemctl status nginx`
- [ ] PM2 process actifs : `pm2 list`
- [ ] SSL valide : `curl -I https://entraidance.com`
- [ ] Tous les domaines accessibles (8 au total)
- [ ] Redirection HTTP→HTTPS active
- [ ] Auto-renouvellement SSL : `systemctl status certbot.timer`

#### 6.2 Logs à vérifier

```bash
# PM2
pm2 logs --lines 50

# Nginx
tail -f /var/log/nginx/error.log

# Certbot
tail -f /var/log/letsencrypt/letsencrypt.log
```

## 🐛 Problèmes Courants & Solutions

### Backend ne démarre pas

**Symptôme** : PM2 redémarre en boucle

```bash
pm2 logs backend --lines 100
```

**Solutions** :
- Vérifier que le build existe : `ls /opt/entraidance/backend/dist/`
- Vérifier .env : `cat /opt/entraidance/backend/.env`
- Rebuild : `cd /opt/entraidance/backend && npm run build`

### Frontend erreur EADDRINUSE

**Symptôme** : `Error: listen EADDRINUSE: address already in use :::3000`

**Cause** : Frontend essaie d'utiliser le port 3000 déjà pris par backend

**Solution** :
```bash
pm2 delete frontend
cd /opt/entraidance/frontend
PORT=3001 pm2 start npm --name frontend --update-env -- run start
```

### TypeScript build error (better-sqlite3)

**Symptôme** : `gyp ERR! build error / not found: make`

**Solution** :
```bash
apt install -y build-essential python3
cd /opt/entraidance/backend
rm -rf node_modules
npm install
npm run build
```

### TypeScript HelpType.AUTRE manquant

**Symptôme** : `Property '[HelpType.AUTRE]' is missing in type`

**Solution** :
```bash
# Éditer backend/src/matching/matching.service.ts
# Ajouter dans le mapping :
#   [HelpType.AUTRE]: [],
```

### SSL échec "Could not install certificate"

**Cause** : Nginx config ne liste pas tous les domaines dans server_name

**Solution** : Utiliser la config Nginx complète de l'étape 5.2

### DNS ne propage pas

**Symptôme** : `dig +short entraidance.com` retourne vide

**Cause** : Name servers pas configurés sur Hostinger

**Solution** :
1. Vérifier : `whois entraidance.com | grep "Name Server"`
2. Si sur "dns-parking.com", changer via Hostinger Panel
3. Attendre 15-30 min pour propagation

## 🔄 Mise à Jour du Code

### Déploiement nouvelle version

```bash
ssh root@{VPS_IP}
cd /opt/entraidance

# Pull latest
git pull origin main

# Backend
cd backend
npm install
npm run build
pm2 restart backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart frontend

# Vérifier
pm2 logs --lines 50
```

### Rollback rapide

```bash
cd /opt/entraidance
git log --oneline -5  # Noter le commit
git checkout {commit_hash}

# Rebuild et restart
cd backend && npm run build && pm2 restart backend
cd ../frontend && npm run build && pm2 restart frontend
```

## 📊 Monitoring

### Métriques à surveiller

```bash
# Ressources VPS
htop
df -h

# Process PM2
pm2 monit

# Logs en temps réel
pm2 logs

# Nginx access
tail -f /var/log/nginx/access.log
```

### Health checks

```bash
# Script à exécuter périodiquement
#!/bin/bash
curl -sf https://entraidance.com > /dev/null && echo "✅ Site OK" || echo "❌ Site DOWN"
curl -sf https://entraidance.com/api > /dev/null && echo "✅ API OK" || echo "❌ API DOWN"
```

## 🔐 Sécurité

### Hardening recommandé

```bash
# Fail2ban
apt install -y fail2ban

# Mise à jour auto
apt install -y unattended-upgrades

# Firewall strict
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# SSH key-only (désactiver password auth)
# Éditer /etc/ssh/sshd_config :
# PasswordAuthentication no
# systemctl reload sshd
```

### Backup automatique

```bash
# Cron daily backup DB
cat > /opt/entraidance/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
cp /opt/entraidance/backend/prisma/prod.db /opt/entraidance/backups/prod.db.$DATE
find /opt/entraidance/backups -name "prod.db.*" -mtime +7 -delete
EOF

chmod +x /opt/entraidance/backup.sh
mkdir -p /opt/entraidance/backups

# Ajouter au crontab
echo "0 2 * * * /opt/entraidance/backup.sh" | crontab -
```

## 📝 Checklist Complète

Cocher au fur et à mesure :

### Préparation
- [ ] VPS créé et accessible
- [ ] Domaines achetés
- [ ] Token API Hostinger généré
- [ ] Clé SSH générée et ajoutée au VPS

### Installation
- [ ] Docker installé
- [ ] Node.js installé
- [ ] PM2 installé
- [ ] Build tools installés
- [ ] Nginx installé
- [ ] Certbot installé

### Application
- [ ] Repo cloné dans /opt/entraidance
- [ ] .env.production configuré
- [ ] Backend buildé
- [ ] Frontend buildé
- [ ] PM2 backend démarré sur port 3000
- [ ] PM2 frontend démarré sur port 3001
- [ ] PM2 save + startup

### Nginx
- [ ] Config créée dans sites-available
- [ ] Symlink dans sites-enabled
- [ ] Default site désactivé
- [ ] nginx -t OK
- [ ] Service rechargé

### DNS
- [ ] 8 enregistrements A créés (4 domaines × 2)
- [ ] Propagation vérifiée avec dig
- [ ] Tous domaines résolvent vers VPS IP

### SSL
- [ ] Certificat généré pour 8 domaines
- [ ] Config Nginx SSL complétée
- [ ] HTTPS fonctionnel sur tous domaines
- [ ] Redirect HTTP→HTTPS actif
- [ ] Auto-renewal timer actif

### Tests
- [ ] Backend répond sur localhost:3000
- [ ] Frontend répond sur localhost:3001
- [ ] Nginx proxy fonctionne
- [ ] 8 domaines HTTPS accessibles
- [ ] OAuth Google fonctionne
- [ ] DB initialisée

### Documentation
- [ ] VPS-DEPLOYMENT.md à jour
- [ ] DEPLOYMENT-GUIDE.md à jour
- [ ] Credentials sauvegardés (local sécurisé)
- [ ] Commit + push sur GitHub

## 🎯 Temps Total

- Préparation VPS : **15 min**
- Déploiement app : **20 min**
- Config Nginx : **10 min**
- DNS : **5 min** + 15 min propagation
- SSL : **10 min**
- Vérification : **5 min**

**Total : ~1h10** (hors attente DNS)

---

**Créé le** : 2026-03-05  
**Version** : 1.0  
**Auteur** : Cloclo 🔧
