# Error Handling Guide — Frontend

Entraidance implements comprehensive error handling at multiple levels:

## Architecture

```
┌─────────────────────────────────────┐
│   ErrorBoundary (Component-level)   │ ← Catches React render errors
├─────────────────────────────────────┤
│   error.tsx (Global error page)     │ ← Catches Next.js route errors
├─────────────────────────────────────┤
│   not-found.tsx (404 page)          │ ← Custom 404 page
├─────────────────────────────────────┤
│   API Error Handling (TanStack Query) │ ← Network/API errors → Toasts
└─────────────────────────────────────┘
```

---

## 1. ErrorBoundary Component

**Location:** `src/components/ErrorBoundary.tsx`

**Usage:**

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

**Features:**
- Catches JavaScript errors in React component tree
- Displays user-friendly error UI
- Logs errors to console (ready for Sentry integration)
- Reset button to recover without full page reload
- Custom fallback support

**Example with custom fallback:**

```tsx
<ErrorBoundary fallback={<div>Oops! Une erreur s'est produite.</div>}>
  <ComplexComponent />
</ErrorBoundary>
```

---

## 2. Global Error Page (`error.tsx`)

**Location:** `src/app/error.tsx`

**When it triggers:**
- Unhandled errors in Server Components
- Unhandled errors in Client Components (outside ErrorBoundary)
- Next.js route-level errors

**Features:**
- Automatically displayed by Next.js App Router
- Shows error message + optional digest (error ID)
- Reset button to retry rendering
- Link back to homepage

**Example error:**

```tsx
// This triggers the global error page
async function fetchData() {
  throw new Error('Database connection failed');
}
```

---

## 3. 404 Not Found Page

**Location:** `src/app/not-found.tsx`

**When it triggers:**
- User navigates to non-existent route
- `notFound()` called explicitly in Server Component

**Features:**
- Custom styled 404 page
- Links to homepage + missions list
- Consistent branding

**Trigger manually:**

```tsx
import { notFound } from 'next/navigation';

export default async function MissionPage({ params }: { params: { id: string } }) {
  const mission = await fetchMission(params.id);
  
  if (!mission) {
    notFound(); // ← Triggers custom 404 page
  }
  
  return <MissionDetail mission={mission} />;
}
```

---

## 4. API Error Handling (TanStack Query)

**Pattern:**

```tsx
const { data, error, isError } = useQuery({
  queryKey: ['missions'],
  queryFn: fetchMissions,
});

if (isError) {
  toast.error(error.message || 'Erreur lors du chargement');
}
```

**Standard API error response (from backend):**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["Email is required", "Password too short"],
  "timestamp": "2026-02-27T12:00:00.000Z",
  "path": "/auth/register"
}
```

**Handling in frontend:**

```tsx
import { toast } from 'sonner';

async function handleLogin(email: string, password: string) {
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      
      // Display validation errors
      if (error.errors) {
        error.errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error(error.message || 'Erreur de connexion');
      }
      return;
    }

    const data = await res.json();
    // Success
  } catch (err) {
    toast.error('Erreur réseau');
  }
}
```

---

## 5. Toast Notifications (Sonner)

**Global setup (already configured):**

```tsx
// src/app/layout.tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

**Usage:**

```tsx
import { toast } from 'sonner';

// Success
toast.success('Mission créée avec succès');

// Error
toast.error('Impossible de créer la mission');

// Warning
toast.warning('Session expirée, veuillez vous reconnecter');

// Info
toast.info('Nouvelle mise à jour disponible');
```

---

## 6. HTTP Status Codes

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| 200 | OK | Display data |
| 201 | Created | Show success toast + redirect |
| 400 | Bad Request | Show validation errors |
| 401 | Unauthorized | Redirect to /login + clear token |
| 403 | Forbidden | Show "Access denied" message |
| 404 | Not Found | Show not-found page or empty state |
| 500 | Internal Server Error | Show error page or toast |

---

## 7. Best Practices

### DO ✅

- **Use ErrorBoundary for UI-critical sections**
  ```tsx
  <ErrorBoundary>
    <MissionWizard />
  </ErrorBoundary>
  ```

- **Display user-friendly messages**
  ```tsx
  toast.error('Impossible de charger les missions. Réessayez plus tard.');
  ```

- **Log errors for debugging**
  ```tsx
  console.error('API call failed:', error);
  // TODO: Send to Sentry in production
  ```

- **Handle 401 globally**
  ```tsx
  if (response.status === 401) {
    localStorage.removeItem('token');
    router.push('/login');
  }
  ```

### DON'T ❌

- **Don't expose technical details to users**
  ```tsx
  // ❌ Bad
  toast.error(error.stack);
  
  // ✅ Good
  toast.error('Une erreur est survenue');
  ```

- **Don't ignore errors silently**
  ```tsx
  // ❌ Bad
  try {
    await api.call();
  } catch {}
  
  // ✅ Good
  try {
    await api.call();
  } catch (err) {
    console.error(err);
    toast.error('Échec de l'opération');
  }
  ```

- **Don't block UI on non-critical errors**
  ```tsx
  // ❌ Bad: Full-screen error for analytics failure
  throw new Error('Analytics failed');
  
  // ✅ Good: Log silently, continue
  console.warn('Analytics failed:', err);
  ```

---

## 8. Monitoring (Future)

**Planned integrations:**

- **Sentry** — automatic error reporting
  ```tsx
  Sentry.captureException(error);
  ```

- **Error tracking dashboard** — analyze common errors
- **User feedback widget** — "Report a problem"

---

## 9. Testing

**Manual testing:**

1. **404 page:** Navigate to `/random-nonexistent-route`
2. **Error page:** Throw error in a component
   ```tsx
   if (Math.random() > 0.5) throw new Error('Test error');
   ```
3. **API error:** Disconnect backend, try creating a mission
4. **401 handling:** Use expired JWT, access protected route

**Automated (future):**

```bash
npm run test:e2e -- error-handling
```

---

## Summary

| Error Type | Handled By | User Sees |
|------------|------------|-----------|
| React render error | ErrorBoundary | Error card with reset |
| Next.js route error | error.tsx | Error page |
| 404 route | not-found.tsx | Custom 404 page |
| API 4xx/5xx | TanStack Query + toast | Toast notification |
| Network failure | try/catch | Toast: "Erreur réseau" |

All errors are logged → ready for Sentry integration in production.
