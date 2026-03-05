# Authentication

> Voir aussi: [api-endpoints.md](./api-endpoints.md) pour les routes, [deployment.md](./deployment.md) pour JWT_SECRET config

## Flow

```
1. Register/Login → POST /auth/register ou /auth/login
2. Response: { accessToken: "eyJ...", user: { id, email, displayName, ... } }
3. Frontend stocke accessToken dans localStorage
4. Chaque requete API → header Authorization: Bearer <token>
5. Backend: JwtStrategy extrait payload → request.user = { id, email }
6. Controllers: @CurrentUser() decorator lit request.user
```

## Backend Implementation

### Strategies (Passport)

**LocalStrategy** (`backend/src/auth/strategies/local.strategy.ts`)
- Field: `email` (pas `username`)
- Appelle `authService.validateUser(email, password)`
- bcrypt.compare pour verifier le mot de passe
- Utilise uniquement pour `POST /auth/login`

**JwtStrategy** (`backend/src/auth/strategies/jwt.strategy.ts`)
- Extrait JWT du header Authorization (Bearer)
- Secret: `configService.get('JWT_SECRET', 'dev-secret-key')`
- Payload: `{ sub: userId, email }` → retourne `{ id: sub, email }`

### Guards

**JwtAuthGuard** (`backend/src/common/guards/jwt-auth.guard.ts`)
- `extends AuthGuard('jwt')`
- Utilise sur toutes les routes protegees (POST/PATCH/DELETE + profil + notifications + matching)

**LocalAuthGuard** (`backend/src/common/guards/local-auth.guard.ts`)
- `extends AuthGuard('local')`
- Utilise uniquement sur `POST /auth/login`

### Decorator

**@CurrentUser()** (`backend/src/common/decorators/current-user.decorator.ts`)
- `createParamDecorator` → extrait `request.user`
- Type retourne: `{ id: string, email: string }`

### Service Auth

**AuthService** (`backend/src/auth/auth.service.ts`)
- `register(dto)`: check email unique → bcrypt hash (10 rounds) → create user → sign JWT
- `login(user)`: sign JWT → return token + user
- `validateUser(email, password)`: findByEmail → bcrypt.compare → return user or null
- `sanitizeUser(user)`: exclut `passwordHash` de la response

### Token Format

```json
{
  "sub": "uuid-user-id",
  "email": "user@example.com",
  "iat": 1708000000,
  "exp": 1708604800
}
```

Expiration: `JWT_EXPIRES_IN` env var, default `7d`

## Frontend Implementation

### Token Storage (`frontend/src/lib/auth.ts`)
- `getToken()`: lit localStorage (safe check `typeof window`)
- `setToken(token)`: ecrit localStorage
- `removeToken()`: supprime localStorage
- `isAuthenticated()`: `!!getToken()`

### AuthProvider (`frontend/src/providers/auth-provider.tsx`)
- Context: `{ user, isAuthenticated, isLoading, login, register, logout }`
- Au mount: si token existe → appelle `authApi.getMe()` pour restaurer la session
- Si token invalide → removeToken silencieusement
- `login(creds)` → `authApi.login()` → setToken + set user
- `register(creds)` → `authApi.register()` → setToken + set user
- `logout()` → removeToken + clear user

### API Client (`frontend/src/lib/api.ts`)
- `fetchApi()` ajoute automatiquement `Authorization: Bearer <token>` si token present
- Pas de refresh token (MVP)

## Routes protegees (JWT required)

- POST/PATCH `/missions/*`
- POST `/missions/:id/close`
- POST `/missions/:missionId/contributions`
- PATCH/DELETE `/contributions/:id`
- POST/PATCH `/offers/*`
- POST `/offers/:id/close`
- GET `/users/me`, PATCH `/users/me`
- GET `/users/me/missions`, `/users/me/contributions`, `/users/me/stats`
- GET/PATCH `/users/me/notifications/*`
- GET `/matching/suggestions`

## Routes publiques (pas de JWT)

- POST `/auth/register`, POST `/auth/login`
- GET `/auth/google`, GET `/auth/google/callback`
- GET `/auth/facebook`, GET `/auth/facebook/callback`
- GET `/missions`, GET `/missions/:id`
- GET `/missions/:id/contributions`, GET `/missions/:id/correlations`
- GET `/offers`, GET `/offers/:id`
- GET `/offers/:id/correlations`

## OAuth (Google & Facebook)

### Flow

```
1. Frontend: lien <a href="API_URL/auth/google"> (ou /auth/facebook)
2. Backend: GoogleAuthGuard redirige vers Google consent screen
3. Google redirige vers GET /auth/google/callback avec code
4. Backend: GoogleStrategy validate() → findOrCreateOAuthUser()
5. Backend redirige vers FRONTEND_URL/callback?token=JWT
6. Frontend: page /callback lit le token → loginWithToken() → redirect /missions
```

### Strategies Passport

**GoogleStrategy** (`backend/src/auth/strategies/google.strategy.ts`)
- Extends `PassportStrategy(Strategy, 'google')`
- Config via env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- Scope: `['email', 'profile']`
- `validate()` → `authService.findOrCreateOAuthUser()`

**FacebookStrategy** (`backend/src/auth/strategies/facebook.strategy.ts`)
- Extends `PassportStrategy(Strategy, 'facebook')`
- Config via env: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`, `FACEBOOK_CALLBACK_URL`
- Scope: `['email']`, profileFields: `['id', 'emails', 'name', 'displayName', 'photos']`
- `validate()` → `authService.findOrCreateOAuthUser()`, erreur si pas d'email

### Guards OAuth

- `GoogleAuthGuard` → `AuthGuard('google')`
- `FacebookAuthGuard` → `AuthGuard('facebook')`

### Filtre d'erreur OAuth

`OAuthExceptionFilter` (`backend/src/common/filters/oauth-exception.filter.ts`)
- Attrape les erreurs sur les callbacks OAuth
- Redirige vers `FRONTEND_URL/callback?error=message`

### Endpoints

| Method | Path | Rôle |
|--------|------|------|
| GET | `/auth/google` | Redirige vers Google consent |
| GET | `/auth/google/callback` | Callback → redirige frontend avec JWT |
| GET | `/auth/facebook` | Redirige vers Facebook login |
| GET | `/auth/facebook/callback` | Callback → redirige frontend avec JWT |

### Gestion des comptes lies

`AuthService.findOrCreateOAuthUser()` :
1. Cherche par `(provider, providerId)` → trouvé = login direct
2. Sinon cherche par email → trouvé = lie le provider OAuth au compte existant
3. Sinon = crée un nouveau user (sans password, `passwordHash: null`)

### Entity User — champs OAuth

- `oauthProvider`: `varchar(50)`, nullable — `'google'` | `'facebook'` | `null`
- `oauthProviderId`: `varchar(255)`, nullable — l'ID utilisateur chez le provider
- `passwordHash`: devenu nullable (null pour les comptes OAuth-only)

### Variables d'environnement

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3001/auth/facebook/callback

FRONTEND_URL=http://localhost:3000
```

### Frontend

- `SocialLoginButtons` component: affiche boutons Google/Facebook (liens `<a>` vers l'API)
- Page `/callback`: lit `?token=` ou `?error=` → `loginWithToken()` ou toast erreur
- `AuthProvider.loginWithToken(token)`: setToken → getMe → setUser

---

## 🔧 OAuth Configuration Guide

### Google OAuth Setup

#### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name (e.g., "Entraidance") → **Create**
4. Wait for project creation, then select it

#### Step 2: Enable Google+ API

1. In the navigation menu, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it → **Enable**

#### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type → **Create**
3. Fill in required fields:
   - **App name**: `Entraidance`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click **Save and Continue**
5. **Scopes**: Click **Add or Remove Scopes**
   - Select: `userinfo.email` and `userinfo.profile`
   - Click **Update** → **Save and Continue**
6. **Test users** (optional during dev): Add test emails → **Save and Continue**
7. Click **Back to Dashboard**

#### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Entraidance Web Client`
5. **Authorized redirect URIs** → Add:
   - Development: `http://localhost:3001/auth/google/callback`
   - Production: `https://your-backend.onrender.com/auth/google/callback`
6. Click **Create**
7. **Copy** the `Client ID` and `Client secret`

#### Step 5: Add to Environment Variables

In `backend/.env`:

```env
GOOGLE_CLIENT_ID=123456789012-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

In production (Render):
- Set the same variables with your production callback URL

---

### Facebook OAuth Setup

#### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** use case → **Next**
4. Enter app name (e.g., "Entraidance") → **Create App**
5. You may need to verify your account with security check

#### Step 2: Add Facebook Login Product

1. In your app dashboard, find **Products** → **Add Product**
2. Find **Facebook Login** → Click **Set Up**
3. Select **Web** platform
4. Enter site URL: `http://localhost:3000` (your frontend) → **Save** → **Continue**
5. Skip the quickstart steps

#### Step 3: Configure Facebook Login Settings

1. Go to **Products** → **Facebook Login** → **Settings**
2. **Valid OAuth Redirect URIs** → Add:
   - Development: `http://localhost:3001/auth/facebook/callback`
   - Production: `https://your-backend.onrender.com/auth/facebook/callback`
3. Click **Save Changes**

#### Step 4: Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy the **App ID**
3. Click **Show** next to **App Secret** → Copy it
4. **App Domains** (optional): Add `localhost` for dev, your domain for prod

#### Step 5: Add to Environment Variables

In `backend/.env`:

```env
FACEBOOK_APP_ID=123456789012345
FACEBOOK_APP_SECRET=abcdef0123456789abcdef0123456789
FACEBOOK_CALLBACK_URL=http://localhost:3001/auth/facebook/callback
```

In production (Render):
- Set the same variables with your production callback URL

#### Step 6: Make App Live (Production Only)

For development, the app works in "Development Mode" with test users only.

For production:
1. Go to **Settings** → **Basic**
2. Fill in all required fields (Privacy Policy URL, etc.)
3. Go to **App Review**
4. Toggle **Make [app name] public** → **Confirm**

---

## 🚨 Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- ✅ Check that `GOOGLE_CALLBACK_URL` exactly matches the URL in Google Cloud Console
- ✅ Include the full URL with protocol (`http://` or `https://`)
- ✅ Don't add trailing slashes unless configured in Google Console
- ✅ For localhost, use `http://localhost:3001` (not `127.0.0.1`)

**Error: "Access blocked: This app's request is invalid"**
- ✅ Make sure Google+ API is enabled in your project
- ✅ Check that required scopes (`email`, `profile`) are configured
- ✅ Verify OAuth consent screen is properly configured

**Error: "Invalid client"**
- ✅ Double-check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- ✅ Ensure no extra spaces or line breaks in `.env` values
- ✅ Restart backend after changing `.env`

**User sees "This app isn't verified"**
- During dev: Click **Advanced** → **Go to [app name] (unsafe)** (safe for your own app)
- For production: Submit app for Google verification (optional)

---

### Facebook OAuth Issues

**Error: "URL Blocked: This redirect failed"**
- ✅ Check that `FACEBOOK_CALLBACK_URL` is in the **Valid OAuth Redirect URIs** list
- ✅ Use exact URL (protocol, domain, path must match)
- ✅ Save changes in Facebook Developers and wait a few minutes

**Error: "App Not Set Up: This app is still in development mode"**
- ✅ For testing: Add your Facebook account to **App Roles** → **Test Users**
- ✅ Or invite yourself as a developer in **App Roles** → **Roles**
- For production: Make app public (see Step 6 above)

**Error: "Can't Load URL: The domain of this URL isn't included in the app's domains"**
- ✅ Add your frontend domain to **Settings** → **Basic** → **App Domains**
- For localhost: Add `localhost`

**No email returned by Facebook**
- ✅ User must grant email permission during login
- ✅ Check that `email` scope is requested in `FacebookStrategy`
- ✅ Some users don't have email associated with Facebook (rare)

---

### General OAuth Issues

**Error: "Cannot find module '@nestjs/passport'"**
- ✅ Run `npm install` in backend directory
- ✅ Check that `@nestjs/passport`, `passport-google-oauth20`, `passport-facebook` are in `package.json`

**Backend crashes on startup with OAuth errors**
- ✅ If OAuth env vars are missing, strategies will fail to initialize
- ✅ Add `.env.example` with placeholder values for reference
- ✅ Or conditionally register OAuth strategies only if env vars are set

**Callback works but token not sent to frontend**
- ✅ Check `FRONTEND_URL` env var is correct
- ✅ Frontend must have a `/callback` route that reads `?token=` from hash or query
- ✅ Check browser console for redirect errors

**JWT expires too quickly**
- ✅ Set `JWT_EXPIRES_IN` to a longer duration (e.g., `7d`, `30d`)
- Default is 7 days, which should be fine for MVP

**CORS errors on OAuth callback**
- ✅ Backend must allow `FRONTEND_URL` in CORS config
- ✅ Check `backend/src/main.ts` → `app.enableCors()`

---

## 🧪 Testing OAuth Locally

### Manual Testing Steps

1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser → `http://localhost:3000`
4. Click **Continue with Google** or **Continue with Facebook**
5. Should redirect to provider → consent screen
6. Accept permissions
7. Should redirect back to `/callback` with token
8. Should auto-login and redirect to `/missions`

### Automated Testing

OAuth flows are complex to test in e2e because they involve external providers. Current e2e tests (`backend/test/e2e/auth.e2e-spec.ts`) only verify:
- OAuth endpoints redirect properly (302)
- Redirect URLs contain expected domains

For full OAuth flow testing:
- Use integration tests with mocked provider responses
- Or use test credentials provided by Google/Facebook
- Or rely on manual testing during dev/staging

---

## 🔐 Security Best Practices

- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ Use strong `JWT_SECRET` in production (generate with `openssl rand -base64 32`)
- ✅ Rotate secrets periodically
- ✅ Use HTTPS in production (HTTP is fine for localhost dev)
- ✅ Validate redirect URIs strictly (already done by Google/Facebook)
- ✅ Keep OAuth libraries updated (`npm outdated`, `npm audit`)
- ✅ Consider adding refresh tokens for long-lived sessions (post-MVP)
