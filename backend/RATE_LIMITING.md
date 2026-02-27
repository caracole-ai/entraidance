# Rate Limiting Strategy

GR-attitude uses **NestJS Throttler** to protect API endpoints from abuse and ensure fair resource allocation.

## Configuration

**Global limits** (defined in `app.module.ts`):
- **short**: 20 requests / 60s (1 minute)
- **long**: 100 requests / 600s (10 minutes)

Endpoints can override these defaults with the `@Throttle()` decorator.

---

## Endpoint Limits

### Authentication (`/auth`)

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| `POST /auth/register` | 5 | 60s | Prevent mass account creation |
| `POST /auth/login` | 5 | 60s | Mitigate brute-force attacks |
| `POST /auth/change-password` | Inherited (20/60s) | | |
| `GET /auth/google/*` | No limit | | OAuth flow needs flexibility |

### Missions (`/missions`)

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| `GET /missions` | 60 | 60s | Normal browsing pattern |
| `POST /missions` | 10 | 60s | Prevent mission spam |
| `GET /missions/:id` | Inherited (20/60s) | | |
| `PATCH /missions/:id` | 20 | 60s | Normal edit frequency |
| `POST /missions/:id/close` | 10 | 60s | Prevent abuse |
| `GET /missions/:id/contributions` | Inherited (20/60s) | | |
| `GET /missions/:id/correlations` | Inherited (20/60s) | | |

### Offers (`/offers`)

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| `GET /offers` | 60 | 60s | Normal browsing pattern |
| `POST /offers` | 10 | 60s | Prevent offer spam |
| `GET /offers/:id` | Inherited (20/60s) | | |
| `PATCH /offers/:id` | 20 | 60s | Normal edit frequency |
| `POST /offers/:id/close` | 10 | 60s | Prevent abuse |
| `GET /offers/:id/correlations` | Inherited (20/60s) | | |

### Matching (`/matching`)

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| `GET /matching/suggestions` | 30 | 60s | Resource-intensive query |

### Users (`/users`)

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| All endpoints | Inherited (20/60s) | | Protected by JWT, low risk |

### Notifications (`/users/me/notifications`)

| Endpoint | Limit | Window | Reason |
|----------|-------|--------|--------|
| All endpoints | Inherited (20/60s) | | Read-heavy, low write volume |

---

## Response Headers

When rate limited, the API returns:

**Status**: `429 Too Many Requests`

**Headers** (may include):
- `X-RateLimit-Limit`: Max requests allowed
- `X-RateLimit-Remaining`: Requests left in window
- `X-RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds to wait before retrying

**Body**:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "timestamp": "2026-02-27T15:30:00.000Z",
  "path": "/missions"
}
```

---

## Frontend Cache Strategy

**TanStack Query** is configured to reduce API calls:

```typescript
{
  staleTime: 5 * 60 * 1000,        // 5 min - data stays fresh
  cacheTime: 10 * 60 * 1000,       // 10 min - keep in memory
  retry: 2,                         // Retry twice on errors
  refetchOnWindowFocus: false,      // Don't refetch on tab focus
  refetchOnReconnect: true,         // Refetch when online
  refetchOnMount: 'always',         // Always refetch on mount
}
```

**Benefits**:
- Reduces duplicate API calls (5-minute fresh data window)
- Keeps data cached for 10 minutes (instant navigation)
- Doesn't spam API when user switches tabs
- Auto-refetches when internet reconnects

---

## Testing Rate Limits

### Manual Test (CLI)

```bash
# Test missions list limit (60/min)
for i in {1..65}; do 
  curl -s -o /dev/null -w "%{http_code} " http://localhost:3001/missions
done

# Expected: First 60 return 200, then 429
```

### E2E Tests

See `backend/test/e2e/rate-limiting.e2e-spec.ts`

---

## Monitoring

**Logs** (backend):
- Throttler logs are visible in console (debug mode)
- 429 responses are logged by `HttpExceptionFilter`

**Metrics** (future):
- Prometheus metrics for rate-limited requests
- Sentry error tracking for 429 patterns

---

## Adjusting Limits

**To change a limit**, edit the `@Throttle()` decorator:

```typescript
@Throttle({ short: { limit: 100, ttl: 60000 } }) // 100 requests/min
@Get()
findAll() { ... }
```

**To add a new strategy** (e.g., "burst"), edit `app.module.ts`:

```typescript
ThrottlerModule.forRoot({
  throttlers: [
    { name: 'short', ttl: 60000, limit: 20 },
    { name: 'long', ttl: 600000, limit: 100 },
    { name: 'burst', ttl: 10000, limit: 50 }, // NEW
  ],
})
```

---

## Best Practices

✅ **DO**:
- Adjust limits based on endpoint usage patterns
- Test limits in staging before production
- Monitor 429 error rates
- Document limit rationale

❌ **DON'T**:
- Remove rate limiting entirely (security risk)
- Set limits too low (bad UX)
- Ignore 429 patterns (may indicate abuse or bugs)

---

## Further Reading

- [NestJS Throttler Docs](https://docs.nestjs.com/security/rate-limiting)
- [TanStack Query Caching](https://tanstack.com/query/v5/docs/react/guides/caching)
