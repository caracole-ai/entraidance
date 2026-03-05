# WebSocket Real-time Notifications

Entraidance uses **Socket.io** for real-time bidirectional communication between backend and frontend.

---

## Overview

**Use cases**:
- Notify users about new mission-offer matches
- Alert contributors when missions are closed
- Show thanks messages in real-time
- Notify mission creators about new contributions
- Instant updates without polling

**Technology**: Socket.io (with JWT authentication)

---

## Connection Flow

### 1. Client Connection (Frontend)

```typescript
import { connectSocket } from '@/lib/socket';

// Connect with JWT token
const token = localStorage.getItem('token');
const socket = connectSocket(token);

// Listen to events
socket.on('match:new', (data) => {
  console.log('New match!', data);
});
```

### 2. Server Authentication (Backend)

When a client connects:
1. Extract JWT token from `handshake.auth.token`
2. Verify token with `JwtService`
3. Extract `userId` from payload
4. Track socket in `userSockets` map
5. If invalid: disconnect client

**Code**: `backend/src/events/events.gateway.ts`

---

## Events

### Backend → Frontend (Server-sent)

| Event | Data | Trigger |
|-------|------|---------|
| `match:new` | `{ type, missionId, offerId, score, mission }` | New mission-offer match found |
| `mission:created` | `{ type, missionId, missionTitle }` | User created a mission |
| `mission:closed` | `{ type, missionId, missionTitle, closureThanks }` | Mission resolved |
| `contribution:new` | `{ type, missionId, missionTitle, contributionType, message }` | New contribution on user's mission |
| `thanks:received` | `{ type, missionId, missionTitle, message }` | Mission creator sent thanks |

### Frontend → Backend (Client-sent)

| Event | Data | Response |
|-------|------|----------|
| `ping` | (none) | `{ event: 'pong', data: 'pong' }` |

**Future events**:
- `typing:start` / `typing:stop` (for chat)
- `presence:online` / `presence:offline` (user status)

---

## Backend Implementation

### EventsGateway

**File**: `backend/src/events/events.gateway.ts`

**Key methods**:
- `handleConnection(client)` — Authenticate and track user
- `handleDisconnect(client)` — Clean up user's sockets
- `sendToUser(userId, event, data)` — Send event to all user's connected devices
- `broadcast(event, data)` — Send to all connected clients

**Example usage in services**:

```typescript
// MissionsService
this.eventsGateway.sendToUser(mission.creatorId, 'mission:closed', {
  type: 'mission_closed',
  missionId: id,
  missionTitle: mission.title,
  closureThanks: dto.closureThanks,
});
```

### Module Integration

**EventsModule exports** `EventsGateway` for use in other modules:

```typescript
// missions.module.ts
imports: [
  forwardRef(() => EventsModule),
],
```

**Services inject** EventsGateway:

```typescript
constructor(
  @Inject(forwardRef(() => EventsGateway))
  private readonly eventsGateway: EventsGateway,
) {}
```

---

## Frontend Implementation

### Socket Hooks

**File**: `frontend/src/hooks/useSocket.ts`

#### `useSocket()`
Access socket instance and methods.

```typescript
const { socket, connected, on, off, emit } = useSocket();
```

#### `useSocketEvent(event, callback, deps)`
Listen to a specific event (auto-cleanup on unmount).

```typescript
useSocketEvent('match:new', (data) => {
  console.log('New match:', data);
}, []);
```

#### `useSocketAuth(token)`
Auto-connect when token is available, disconnect when logged out.

```typescript
const { token } = useAuth();
useSocketAuth(token);
```

### SocketProvider

**File**: `frontend/src/providers/socket-provider.tsx`

Automatically listens to all real-time events and:
- Shows toast notifications
- Invalidates React Query caches
- Refreshes relevant data

**Usage** (in `layout.tsx`):

```typescript
<AuthProvider>
  <SocketProvider>
    {children}
  </SocketProvider>
</AuthProvider>
```

---

## Security

### Authentication

- **JWT-based**: Client sends token in `auth.token` during handshake
- **Validation**: Server verifies signature and expiration
- **Rejection**: Invalid/expired tokens → immediate disconnect

### Authorization

- **User-specific events**: `sendToUser()` only sends to authenticated user's sockets
- **No cross-user access**: User A cannot receive User B's notifications

### Rate Limiting

**Not yet implemented** for WebSocket events (future enhancement).

**Recommended**:
- Limit events per user per minute
- Throttle broadcast events

---

## Testing

### Manual Test (Browser Console)

1. Open frontend in browser
2. Login as a user
3. Open DevTools Console
4. Run:
   ```javascript
   const socket = io('http://localhost:3001', {
     auth: { token: localStorage.getItem('token') }
   });
   
   socket.on('connect', () => console.log('Connected:', socket.id));
   socket.on('match:new', (data) => console.log('Match!', data));
   socket.emit('ping');
   ```

### E2E Tests

**Not yet implemented**.

**Planned**:
- Connect/disconnect flow
- Event delivery (match, contribution, etc.)
- Reconnection after disconnect
- Multi-device support (same user, multiple sockets)

---

## Monitoring

### Logs

**Backend**:
```
[WebSocket] Client abc123 connected (user: user-123)
[WebSocket] Sent "match:new" to user user-123 (2 socket(s))
[WebSocket] Client abc123 disconnected
```

**Frontend** (console):
```
[WebSocket] Connected: abc123
[WebSocket] Disconnected: transport close
```

### Metrics (Future)

- Active connections count
- Events sent/received per minute
- Reconnection rate
- Average latency

---

## Performance

### Scalability

**Current**: Single-server, in-memory socket tracking  
**Limitations**: ~10,000 concurrent connections

**For horizontal scaling** (multiple backend servers):
- Use **Redis Adapter** for Socket.io
- Share socket state across servers
- Broadcast events cluster-wide

**Setup** (future):
```typescript
import { RedisAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(new RedisAdapter(pubClient, subClient));
```

### Reconnection

**Client-side**:
- Auto-reconnect enabled
- Max attempts: 5
- Delay: 1 second

**Server-side**:
- Stateless (JWT validates on each connection)
- No session persistence needed

---

## Troubleshooting

### Client won't connect

**Check**:
1. Backend running on correct port (3001)?
2. CORS configured for frontend origin?
3. Token valid (not expired)?
4. Network accessible (no firewall blocking WebSocket)?

**Debug**:
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### Events not received

**Check**:
1. Socket connected? (`socket.connected === true`)
2. Event name correct? (case-sensitive)
3. User logged in? (token required)
4. Backend emitting to correct `userId`?

**Debug**:
```typescript
// Backend
this.logger.debug(`Sending to user ${userId}: ${event}`);

// Frontend
socket.onAny((event, data) => {
  console.log('Received:', event, data);
});
```

### Multiple connections from same user

**Expected behavior**: One user can have multiple sockets (e.g., multiple browser tabs).

**How it works**:
- `userSockets` map stores `userId → Set<socketId>`
- `sendToUser()` emits to all sockets in set
- Disconnect removes socket from set

---

## Future Enhancements

### Planned
- [ ] **Typing indicators** (for future chat feature)
- [ ] **Presence status** (online/offline/away)
- [ ] **Read receipts** (mark notifications as seen)
- [ ] **Push notifications** (PWA integration)

### Considered
- [ ] **Redis adapter** (for horizontal scaling)
- [ ] **Rate limiting** (per-user event throttling)
- [ ] **Binary messages** (for file transfers)
- [ ] **Rooms/channels** (group-based events)

---

## See Also

- [`RATE_LIMITING.md`](./RATE_LIMITING.md) — API rate limits
- [`MATCHING.md`](./MATCHING.md) — Matching algorithm
- [Socket.io Documentation](https://socket.io/docs/v4/)
