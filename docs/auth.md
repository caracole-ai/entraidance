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
