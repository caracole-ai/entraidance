#!/bin/bash
# Deploy backend to Render (auto-deploy on push)

set -e

cd "$(dirname "$0")"

echo "🚀 Deploying Backend to Render..."

# Check for uncommitted changes in backend
if [[ -n $(git status backend/ --porcelain) ]]; then
  echo "📦 Committing backend changes..."
  git add backend/
  git commit -m "deploy: backend $(date +%Y-%m-%d-%H%M)"
fi

# Push to trigger auto-deploy
echo "⬆️  Pushing to origin/main..."
git push origin main

echo ""
echo "✅ Backend deployment triggered!"
echo ""
echo "📊 Monitor deployment:"
echo "   https://dashboard.render.com/web/srv-d6f4cshr0fns73f2vvsg"
echo ""
echo "🌐 Production URL:"
echo "   https://entraidance-api-ihn9.onrender.com"
echo ""
echo "⏳ Free tier cold start: ~30-60s on first request"
