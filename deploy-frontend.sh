#!/bin/bash
# Deploy frontend to Hostinger VPS

set -e

VPS="root@187.124.32.100"
REMOTE_DIR="/opt/entraidance"

echo "🚀 Deploying Frontend to Hostinger VPS..."

# Push local changes first
if [[ -n $(git status --porcelain) ]]; then
  echo "📦 Committing changes..."
  git add -A
  git commit -m "deploy: frontend $(date +%Y-%m-%d-%H%M)"
fi
git push origin main

# Deploy on VPS
echo "⬆️  Deploying on VPS..."
ssh $VPS << 'EOF'
  cd /opt/entraidance
  git pull origin main
  cd frontend
  npm install --production
  npm run build
  pm2 restart frontend
  echo ""
  pm2 logs frontend --lines 5 --nostream
EOF

echo ""
echo "✅ Frontend deployed!"
echo "🌐 https://entraidance.com"
