#!/bin/bash
# Deploy backend to Hostinger VPS

set -e

VPS="root@187.124.32.100"
REMOTE_DIR="/opt/entraidance"

echo "🚀 Deploying Backend to Hostinger VPS..."

# Push local changes first
if [[ -n $(git status --porcelain) ]]; then
  echo "📦 Committing changes..."
  git add -A
  git commit -m "deploy: backend $(date +%Y-%m-%d-%H%M)"
fi
git push origin main

# Deploy on VPS
echo "⬆️  Deploying on VPS..."
ssh $VPS << 'EOF'
  cd /opt/entraidance
  git pull origin main
  cd backend
  npm install
  npm run build || { echo "❌ Build failed!"; exit 1; }
  pm2 restart backend
  echo ""
  pm2 logs backend --lines 5 --nostream
EOF

echo ""
echo "✅ Backend deployed!"
echo "🌐 https://entraidance.com/api"
