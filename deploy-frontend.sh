#!/bin/bash
# Deploy frontend to Render (auto-deploy on push)

set -e

cd "$(dirname "$0")"

echo "🚀 Deploying Frontend to Render..."

# Check for uncommitted changes in frontend
if [[ -n $(git status frontend/ --porcelain) ]]; then
  echo "📦 Committing frontend changes..."
  git add frontend/
  git commit -m "deploy: frontend $(date +%Y-%m-%d-%H%M)"
fi

# Push to trigger auto-deploy
echo "⬆️  Pushing to origin/main..."
git push origin main

echo ""
echo "✅ Frontend deployment triggered!"
echo ""
echo "📊 Monitor deployment:"
echo "   https://dashboard.render.com/web/srv-d6f4ebk1hm7c73b0b510"
echo ""
echo "🌐 Production URL:"
echo "   https://entraidance-frontend.onrender.com"
echo ""
echo "⏳ Free tier cold start: ~30-60s on first request"
