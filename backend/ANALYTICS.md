# Analytics & Monitoring

Entraidance uses **Sentry** for error tracking, performance monitoring, and user analytics.

---

## Overview

**Tool**: Sentry.io (free tier: 5,000 events/month)

**Use cases**:
- Error tracking (exceptions, crashes)
- Performance monitoring (API response times)
- User session replay (frontend only)
- Custom event tracking (matching success, contributions, etc.)

---

## Setup

### 1. Create Sentry Project

1. Go to https://sentry.io/
2. Create account (free tier)
3. Create new project:
   - **Backend**: Node.js
   - **Frontend**: Next.js
4. Copy DSN from project settings

### 2. Backend Configuration

**Environment variables** (`.env` or Render):
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
NODE_ENV=production  # or development
```

**Integration**: Already configured in `src/main.ts`

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,  // 10% of transactions
  profilesSampleRate: 0.1, // 10% profiling
});
```

### 3. Frontend Configuration

**Environment variables** (`.env.local` or Vercel/Render):
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

**Integration**: Configured in `sentry.client.config.ts` and `sentry.server.config.ts`

---

## Features

### Error Tracking ✅

**Automatic capture**:
- Unhandled exceptions (backend + frontend)
- Promise rejections
- HTTP errors (500+)

**Manual capture**:
```typescript
// Backend
import * as Sentry from '@sentry/node';

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error, {
    extra: { userId, missionId },
  });
}

// Frontend
import * as Sentry from '@sentry/nextjs';

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error);
}
```

### Performance Monitoring ✅

**Backend**: Automatic transaction tracking for all HTTP requests

**Frontend**: Automatic page load times + navigation tracking

**Sample rate**: 10% in production (adjustable via `tracesSampleRate`)

### User Context ✅

**Set user** (after login):
```typescript
import { AnalyticsService } from './analytics.service';

// Backend
analyticsService.setUser(userId, email);

// Frontend
Sentry.setUser({ id: userId, email });
```

**Clear user** (on logout):
```typescript
analyticsService.clearUser();
Sentry.setUser(null);
```

### Custom Events (AnalyticsService)

**File**: `backend/src/common/services/analytics.service.ts`

**Usage**:
```typescript
// Track matching success
analyticsService.track('match:created', {
  missionId,
  offerId,
  score,
});

// Track contribution
analyticsService.track('contribution:created', {
  missionId,
  userId,
  type,
});
```

### Session Replay (Frontend Only) ✅

**Enabled**: User sessions are recorded and replayed in Sentry dashboard

**Privacy**:
- All text masked (`maskAllText: true`)
- All media blocked (`blockAllMedia: true`)
- Only errors trigger full replay (`replaysOnErrorSampleRate: 1.0`)

**Sample rate**: 10% of normal sessions, 100% on errors

---

## Metrics Tracked

### Automatic Metrics

**Backend**:
- HTTP request/response times
- Database query performance
- Error rates by endpoint
- Memory usage
- CPU profiling (10% sample)

**Frontend**:
- Page load times
- Navigation performance
- React component render times
- Network request times
- Error rates by page

### Custom Metrics (Future)

**Planned**:
- Matching success rate (% of missions that get matched)
- Contribution conversion rate (% of views → contributions)
- WebSocket connection count
- Average mission resolution time
- User retention rate

**Implementation**: Use `AnalyticsService.track()` to log events, then query Sentry dashboard.

---

## Dashboard & Alerts

### Sentry Dashboard

**URL**: https://sentry.io/organizations/your-org/issues/

**Views**:
- **Issues**: All errors grouped by type
- **Performance**: Transaction times, slow queries
- **Releases**: Track errors by deployment
- **User Feedback**: (optional) in-app feedback widget

### Alerts

**Setup**: Sentry → Alerts → Create Alert Rule

**Recommended alerts**:
1. **High error rate**: >10 errors/minute
2. **P95 latency spike**: API response time >2s
3. **New error type**: First occurrence of unknown error
4. **Performance degradation**: 50% slower than baseline

**Notification channels**:
- Email
- Slack (recommended)
- Discord
- PagerDuty (for critical apps)

---

## Testing

### Test Error Tracking

**Backend**:
```bash
curl http://localhost:3001/test-error
```

**Frontend**:
```javascript
throw new Error('Test error from frontend');
```

Check Sentry dashboard for captured errors.

### Test Performance Tracking

Make API requests and check **Performance** tab in Sentry dashboard.

---

## Environment-Specific Behavior

### Development

- **Sentry**: Enabled if `SENTRY_DSN` is set
- **Sample rate**: 100% (all transactions tracked)
- **Logging**: Console logs + Sentry

### Production

- **Sentry**: Always enabled (recommended)
- **Sample rate**: 10% (reduces quota usage)
- **Logging**: Only errors to Sentry

---

## Privacy & Compliance

### GDPR Compliance

**Data collected**:
- User ID (hashed)
- Email (optional, only if explicitly set)
- IP address (can be disabled)
- Session replay (text/media masked)

**Data retention**: 90 days (Sentry default, configurable)

**User rights**:
- **Access**: Users can request their error logs
- **Deletion**: Clear user context on account deletion

**Configuration** (if needed):
```typescript
Sentry.init({
  beforeSend(event) {
    // Strip sensitive data
    delete event.user?.email;
    delete event.request?.cookies;
    return event;
  },
});
```

---

## Costs

### Sentry Free Tier

- **Events**: 5,000/month
- **Performance**: 10,000 transactions/month
- **Session replays**: 50 replays/month
- **Retention**: 30 days

**Estimated usage** (1,000 daily active users):
- Errors: ~500/month (low error rate)
- Transactions: ~30,000/month (with 10% sampling → 3,000 counted)
- Replays: ~50/month (errors only)

**Verdict**: Free tier sufficient for MVP, may need paid plan at scale.

### Paid Plans

- **Team**: $26/month (50,000 events)
- **Business**: $80/month (500,000 events)

---

## Alternatives

**Other analytics/monitoring tools**:
- **LogRocket**: Session replay + error tracking (more expensive)
- **New Relic**: Full APM suite (enterprise-focused)
- **Datadog**: Infrastructure + APM (expensive)
- **Google Analytics**: Free, but no error tracking
- **Mixpanel**: Product analytics (events, funnels)

**Why Sentry**:
- ✅ Free tier generous
- ✅ Excellent Next.js + NestJS integration
- ✅ Session replay included
- ✅ Fast setup (<10 min)

---

## Troubleshooting

### Sentry not capturing errors

**Check**:
1. `SENTRY_DSN` env var set?
2. Sentry initialized before app starts?
3. Error actually thrown (not silently caught)?
4. Network accessible (firewall blocking Sentry API)?

**Debug**:
```typescript
Sentry.init({
  debug: true,  // Enable verbose logging
  ...
});
```

### Too many events (quota exceeded)

**Solutions**:
1. Increase sample rate: `tracesSampleRate: 0.05` (5%)
2. Filter noisy errors: use `beforeSend` hook
3. Upgrade to paid plan

---

## See Also

- [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [`WEBSOCKET.md`](./WEBSOCKET.md) — Real-time monitoring
- [`RATE_LIMITING.md`](./RATE_LIMITING.md) — API protection
