# GitHub Actions CI/CD

GR-attitude uses **GitHub Actions** for continuous integration and deployment.

---

## Workflow Overview

**File**: `.github/workflows/ci.yml`

**Triggers**:
- Push to `master` or `main` branch
- Pull requests to `master` or `main`

**Jobs**:
1. **backend-test** — Backend linting, build, unit tests, E2E tests
2. **frontend-test** — Frontend linting, build
3. **deploy-backend** — Auto-deploy to Render (master only)
4. **deploy-frontend** — Auto-deploy to Render (master only)

---

## Backend Tests

**Steps**:
1. Checkout code
2. Setup Node.js 22
3. Install dependencies (`npm ci`)
4. Lint code (`npm run lint`)
5. Build (`npm run build`)
6. Run unit tests (`npm test`)
7. Run E2E tests (`npm run test:e2e`)

**Environment**:
- `NODE_ENV=test`
- `DATABASE_PATH=:memory:` (SQLite in-memory)
- `JWT_SECRET=test-secret-key`

**Result**: ✅ Pass if all tests succeed

---

## Frontend Tests

**Steps**:
1. Checkout code
2. Setup Node.js 22
3. Install dependencies (`npm ci`)
4. Lint code (`npm run lint`)
5. Build (`npm run build`)

**Environment**:
- `NEXT_PUBLIC_API_URL=http://localhost:3001`

**Result**: ✅ Pass if build succeeds

---

## Auto-Deployment

**Condition**: Only on `push` to `master` branch (not PRs)

**Secrets required** (GitHub repo settings → Secrets):
- `RENDER_DEPLOY_HOOK_BACKEND` — Render backend deploy webhook URL
- `RENDER_DEPLOY_HOOK_FRONTEND` — Render frontend deploy webhook URL

**How to get Render deploy hooks**:
1. Go to Render dashboard
2. Select service (backend or frontend)
3. Settings → Deploy Hook → Create
4. Copy URL
5. Add to GitHub: Repo → Settings → Secrets and variables → Actions → New secret

**Deployment flow**:
```
Push to master → Tests pass → Render deploy triggered → App redeploys
```

---

## Status Badge

Add to `README.md`:
```markdown
![CI/CD](https://github.com/joechipjoechip/gr-attitude/actions/workflows/ci.yml/badge.svg)
```

---

## Local Testing (simulate CI)

### Backend
```bash
cd backend
npm ci
npm run lint
npm run build
npm test
npm run test:e2e
```

### Frontend
```bash
cd frontend
npm ci
npm run lint
npm run build
```

---

## Troubleshooting

### Tests fail in CI but pass locally

**Check**:
1. Node version (CI uses 22, local may differ)
2. Environment variables (CI uses test values)
3. Database state (CI uses in-memory SQLite)
4. Dependencies (CI uses `npm ci`, not `npm install`)

**Debug**:
- Check GitHub Actions logs: Repo → Actions → Failed workflow → Click job → Expand steps

### Deploy hooks not working

**Check**:
1. Secrets configured in GitHub?
2. Render deploy hook URL correct?
3. Render service active (not paused)?

**Manual deploy**:
- Render dashboard → Service → Deploy latest commit

---

## Best Practices

✅ **DO**:
- Run tests locally before pushing
- Keep workflows fast (<5 min)
- Use `npm ci` (not `npm install`) for reproducibility
- Add status badge to README

❌ **DON'T**:
- Commit failing tests
- Skip linting errors
- Deploy without tests passing
- Hardcode secrets in workflow files

---

## Future Enhancements

- [ ] **Code coverage** reporting (Codecov)
- [ ] **Performance budgets** (Lighthouse CI)
- [ ] **Security scanning** (Snyk, npm audit)
- [ ] **Preview deploys** for PRs (Render preview environments)
- [ ] **Slack notifications** on deploy success/failure

---

## See Also

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Render Deploy Hooks](https://render.com/docs/deploy-hooks)
- [`backend/README.md`](../backend/README.md) — Testing guide
