#!/bin/bash
# Deploy both backend and frontend to Hostinger VPS

set -e

VPS="root@187.124.32.100"

echo "🚀 Deploying Entraidance to Hostinger VPS..."

# Push local changes first
if [[ -n $(git status --porcelain) ]]; then
  echo "📦 Committing changes..."
  git add -A
  git commit -m "deploy: full $(date +%Y-%m-%d-%H%M)"
fi
git push origin main

# Deploy on VPS
echo "⬆️  Deploying on VPS..."
ssh $VPS << 'EOF'
  cd /opt/entraidance
  git pull origin main
  
  echo "📦 Backend..."
  cd backend && npm install && npm run build || { echo "❌ Backend build failed!"; exit 1; }
  pm2 restart backend
  
  echo "📦 Frontend..."
  cd ../frontend && npm install && npm run build || { echo "❌ Frontend build failed!"; exit 1; }
  pm2 restart frontend
  
  echo ""
  echo "Status:"
  pm2 list
EOF

echo ""
echo "✅ Deployed!"
echo "🌐 https://entraidance.com"
