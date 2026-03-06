#!/bin/bash
# Deploy both backend and frontend to Render

set -e

cd "$(dirname "$0")"

echo "🚀 Deploying Entraidance to Render..."

# Commit all changes
if [[ -n $(git status --porcelain) ]]; then
  echo "📦 Committing all changes..."
  git add -A
  git commit -m "deploy: full $(date +%Y-%m-%d-%H%M)"
fi

# Push to trigger auto-deploy
echo "⬆️  Pushing to origin/main..."
git push origin main

echo ""
echo "✅ Deployment triggered for both services!"
echo ""
echo "📊 Monitor deployments:"
echo "   Backend:  https://dashboard.render.com/web/srv-d6f4cshr0fns73f2vvsg"
echo "   Frontend: https://dashboard.render.com/web/srv-d6f4ebk1hm7c73b0b510"
echo ""
echo "🌐 Production URLs:"
echo "   API:      https://entraidance-api-ihn9.onrender.com"
echo "   App:      https://entraidance-frontend.onrender.com"
echo ""
echo "⏳ Free tier: deployments take 2-5 min, cold start ~30-60s"
