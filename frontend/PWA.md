# Progressive Web App (PWA) Setup

Entraidance is configured as a Progressive Web App for improved mobile experience.

---

## Features

✅ **Implemented**:
- Manifest.json (installable on home screen)
- Service Worker (automatic via next-pwa)
- Offline page (basic)
- App icons (192x192, 512x512)

⏳ **Future**:
- Offline mode (cache missions, offers)
- Background sync (queue actions when offline)
- Push notifications (WebSocket fallback)
- Update prompts (new version available)

---

## Installation

### iOS (Safari)

1. Open https://entraidance-frontend.onrender.com in Safari
2. Tap the **Share** button (bottom center)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add** (top right)

**Result**: App icon on home screen, launches in full-screen mode (no Safari UI)

### Android (Chrome)

1. Open https://entraidance-frontend.onrender.com in Chrome
2. Tap the **three-dot menu** (top right)
3. Tap **Add to Home screen** or **Install app**
4. Tap **Install**

**Result**: App icon in app drawer, launches like a native app

---

## Manifest Configuration

**File**: `public/manifest.json`

**Key fields**:
```json
{
  "name": "Entraidance - Plateforme d'entraide",
  "short_name": "Entraidance",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192" },
    { "src": "/icon-512x512.png", "sizes": "512x512" }
  ]
}
```

**Display modes**:
- `standalone` — Full-screen, hides browser UI (current)
- `minimal-ui` — Minimal browser UI (back button only)
- `fullscreen` — True full-screen (no status bar)
- `browser` — Regular browser (not PWA-like)

---

## Service Worker

**Library**: `next-pwa` (wraps Workbox)

**Configuration** (`next.config.ts`):
```typescript
withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})
```

**Behavior**:
- **Auto-registration**: Service Worker registers on first visit
- **Skip waiting**: New SW activates immediately (no manual refresh)
- **Dev mode**: Disabled (no caching during development)

**Generated files**:
- `public/sw.js` — Service Worker script
- `public/workbox-*.js` — Workbox runtime

---

## Icons

**Sizes required**:
- **192x192**: Minimum for Android
- **512x512**: High-res for splash screens

**Format**: PNG (not JPEG or SVG)

**Purpose**:
- `any` — Standard icon
- `maskable` — Safe zone for adaptive icons (Android)

**Current icons**: Placeholder (TODO: Replace with branded icons)

**Tool**: Use https://realfavicongenerator.net/ to generate all sizes

---

## Offline Support

### Current Behavior

**Online**: Full functionality  
**Offline**: Shows cached pages (if visited before)

**Cached by default**:
- Static assets (CSS, JS, fonts)
- App shell (HTML layout)
- Images (lazy-loaded)

**Not cached**:
- API responses (missions, offers)
- User-generated content

### Future Offline Mode

**Planned**:
1. **Cache-first strategy** for missions/offers (stale-while-revalidate)
2. **Background sync** for creating missions while offline
3. **Offline indicator** (show banner when offline)
4. **Queue mutations** (send when back online)

**Implementation**: Custom Service Worker with Workbox strategies

---

## App Shell Architecture

**Concept**: Cache the app "shell" (layout, nav) for instant load

**Cached**:
- Header, navigation, footer
- CSS, fonts, core JS

**Dynamic** (fetched on each visit):
- Mission data
- User profile
- Notifications

**Result**: Sub-second load time on repeat visits

---

## Update Mechanism

### Automatic Updates

**Behavior**:
1. User visits app
2. SW checks for new version
3. If found: downloads in background
4. Activates on next visit (or refresh)

**User notification**: Not yet implemented (future)

### Manual Update Prompt

**Future**:
```tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    toast({
      title: 'Nouvelle version disponible',
      action: <Button onClick={() => window.location.reload()}>Mettre à jour</Button>
    });
  });
}
```

---

## Testing

### Lighthouse PWA Audit

**Steps**:
1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select **Progressive Web App**
4. Click **Analyze page load**

**Target score**: 90+ / 100

**Checklist**:
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Uses HTTPS (production only)
- ✅ Configured for a custom splash screen
- ✅ Sets a theme color

### Manual Testing

**Chrome DevTools**:
1. Application tab → Service Workers
2. Check "Offline" to simulate offline mode
3. Reload page → Should show cached version

**Real devices**:
1. Install app on home screen
2. Turn on airplane mode
3. Launch app → Should load (if visited before)

---

## Performance Metrics

**Target** (PWA-specific):
- **Time to Interactive (TTI)**: <3.5s (mobile)
- **First Contentful Paint (FCP)**: <1.5s
- **Speed Index**: <4s

**Service Worker impact**:
- **First visit**: ~100ms slower (SW registration)
- **Repeat visits**: ~500ms faster (cached assets)

---

## Security

### HTTPS Required

**PWA requirement**: Service Workers only work on HTTPS (or localhost)

**Production**: Render.com provides HTTPS by default ✅

**Local dev**: `http://localhost` works (exemption)

### Scope

**SW scope**: `/` (entire site)

**Security**: SW can only intercept requests within its scope

---

## Browser Support

**Full PWA support**:
- Chrome 87+ (Android, Windows, macOS)
- Edge 87+ (Windows)
- Safari 11.1+ (iOS, macOS) — partial support

**iOS limitations**:
- No background sync
- No push notifications (Safari limitation)
- Max 50MB cache storage
- Purged after 7 days of non-use

**Fallback**: PWA features gracefully degrade (app still works without them)

---

## Debugging

### Service Worker Issues

**Check registration**:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registered:', reg);
});
```

**Unregister** (dev only):
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
```

**Chrome DevTools**:
- Application → Service Workers → Unregister / Update / Skip waiting

### Cache Issues

**Clear cache** (Chrome DevTools):
- Application → Storage → Clear site data

**Check what's cached**:
- Application → Cache Storage → workbox-precache-*

---

## Deployment

### Build PWA

```bash
cd frontend
npm run build
```

**Generates**:
- `public/sw.js` — Service Worker
- `public/workbox-*.js` — Workbox runtime
- `.next/` build output

### Render Configuration

**No special config needed** — PWA files served from `public/`

**Verification**: Visit `/manifest.json` in production

---

## Future Enhancements

### Background Sync

**Use case**: Create mission while offline, sync when back online

**API**: Background Sync API (Chrome only)
```javascript
navigator.serviceWorker.ready.then(reg => {
  reg.sync.register('sync-missions');
});
```

### Push Notifications

**Use case**: Notify user of new matches, contributions

**Limitation**: iOS Safari doesn't support Web Push (use WebSocket instead)

**Fallback**: WebSocket notifications (already implemented)

### Share Target

**Use case**: Share links/text to Entraidance from other apps

**Manifest**:
```json
"share_target": {
  "action": "/share",
  "params": { "title": "title", "text": "text", "url": "url" }
}
```

---

## Best Practices

✅ **DO**:
- Keep SW cache size <50MB (iOS limit)
- Update SW on every deploy (next-pwa does this)
- Test on real iOS devices (most restrictive)
- Provide offline fallback for critical pages
- Show update prompts (don't force reload)

❌ **DON'T**:
- Cache user-specific data (privacy risk)
- Rely on background sync (iOS doesn't support it)
- Cache too aggressively (users get stale data)
- Block UI on SW updates

---

## See Also

- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [`MOBILE.md`](./MOBILE.md) — Mobile optimization guide
