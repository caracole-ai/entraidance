# Matching Algorithm V2

Entraidance uses a **weighted scoring algorithm** to match missions with offers, helping users find the most relevant opportunities to help.

---

## Overview

The matching engine computes a **score (0-100)** for each mission-offer pair based on multiple factors:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Tag overlap** | 25 | Shared tags between mission and offer |
| **Category match** | 20 | Mission and offer in same category |
| **Help type mapping** | 20 | Offer type matches mission need |
| **Geographic proximity** | 20 | Distance within acceptable radius |
| **Urgency bonus** | 10 | Urgent missions get priority |
| **Timing match** | 5 | Missions expiring soon get boost |

**Total**: 100 points max

---

## Scoring Breakdown

### 1. Tag Overlap (25 points)

**How it works**:
- Compares mission tags with offer tags
- Score = `25 × (overlap count / mission tag count)`

**Example**:
```typescript
Mission tags: ['demenagement', 'transport', 'camion']
Offer tags:   ['demenagement', 'camion', 'aide']

Overlap: 2/3 tags match
Score: 25 × (2/3) = 16.67 points
```

---

### 2. Category Match (20 points)

**How it works**:
- Direct category comparison
- 20 points if categories match, 0 otherwise

**Example**:
```typescript
Mission category: DEMENAGEMENT
Offer category:   DEMENAGEMENT

Score: 20 points ✅
```

---

### 3. Help Type Mapping (20 points)

**How it works**:
- Maps mission `helpType` to compatible `offerType`s
- 20 points if offer type matches

**Mapping table**:

| Mission Help Type | Compatible Offer Types |
|------------------|----------------------|
| `FINANCIERE` | `DON` |
| `CONSEIL` | `COMPETENCE` |
| `MATERIEL` | `MATERIEL` |
| `RELATION` | `SERVICE`, `ECOUTE` |

**Example**:
```typescript
Mission helpType: MATERIEL
Offer offerType:  MATERIEL

Score: 20 points ✅
```

---

### 4. Geographic Proximity (20 points)

**How it works**:
- Uses **Haversine formula** to compute distance in kilometers
- Checks if distance is within acceptable radius
- Score = `20 × (1 - distance / maxRadius)`

**Example**:
```typescript
Mission location: Paris (48.8566, 2.3522)
Offer location:   Paris 15e (48.8422, 2.2945)
Mission radius:   10 km
Offer radius:     10 km

Distance: ~3.5 km
Max radius: max(10, 10) = 10 km
Score: 20 × (1 - 3.5/10) = 13 points
```

**No location data**:
- If either mission or offer lacks coordinates: 0 points

---

### 5. Urgency Bonus (10 points) **NEW in V2**

**How it works**:
- Boosts urgent missions to get faster matches

**Scoring**:
- `Urgency.URGENT` → +10 points
- `Urgency.MOYEN` → +5 points
- `Urgency.FAIBLE` → +0 points

**Example**:
```typescript
Mission urgency: URGENT

Score: +10 points
```

---

### 6. Timing Match (5 points) **NEW in V2**

**How it works**:
- Missions expiring soon get higher priority
- Encourages quick responses

**Scoring**:
- Expires within **7 days** → +5 points
- Expires within **30 days** → +3 points
- Expired or far future → +0 points

**Example**:
```typescript
Mission expiresAt: 2026-03-03 (5 days from now)

Score: +5 points (within 7 days)
```

---

## Minimum Score Threshold

**Threshold**: 10 points

Matches scoring **< 10** are **not returned** to users. This filters out low-relevance suggestions.

---

## Example Calculation

### Scenario
- **Mission**: Déménagement, urgent, tags: `['demenagement', 'transport']`, expires in 5 days
- **Offer**: Déménagement, tags: `['demenagement']`, same city

### Scoring

| Factor | Points | Reason |
|--------|--------|--------|
| Tag overlap | 12.5 | 1/2 tags match → 25 × 0.5 |
| Category match | 20 | Both DEMENAGEMENT |
| Help type | 20 | MATERIEL → MATERIEL |
| Location | 18 | 2 km apart, 10 km radius → 20 × (1 - 2/10) |
| Urgency | 10 | URGENT |
| Timing | 5 | Expires in 5 days |

**Total Score**: **85.5 / 100** ✅

---

## API Endpoints

### Get User Suggestions

```http
GET /matching/suggestions
Authorization: Bearer <token>
```

**Response**:
```json
[
  {
    "mission": { ... },
    "offer": { ... },
    "score": 85.5
  },
  ...
]
```

**Behavior**:
1. Finds all user's open offers
2. Scores each open mission against each offer
3. Filters scores < 10
4. Sorts by score (descending)
5. Returns top 20 matches

---

## Rate Limiting

**Endpoint**: `GET /matching/suggestions`  
**Limit**: 30 requests / minute

See [`RATE_LIMITING.md`](./RATE_LIMITING.md) for details.

---

## Performance

### Benchmarks

**Test**: 100 offers × 1000 missions = 100,000 comparisons

- **Avg time**: ~200ms
- **Database queries**: 2 (offers + missions)
- **In-memory scoring**: 100,000 iterations

**Optimization**: Scoring happens in-memory (fast). Database queries are batched.

### Scalability

**Current limits**:
- Works well for < 10,000 missions and < 1,000 offers
- Beyond that: consider caching, pagination, or background workers

**Future improvements**:
- Cache correlation results (TTL: 10 min)
- Incremental matching (only new missions/offers)
- Background job for bulk correlation

---

## Testing

### Unit Tests

```bash
npm test -- matching.service.spec.ts
```

**Coverage**: 8 tests
- Base score computation
- Urgency bonus
- Timing bonus
- Score threshold filtering
- Geographic distance
- User suggestion sorting

### Manual Testing

1. Create a user with an offer
2. Create missions with varying urgency/timing
3. Call `GET /matching/suggestions`
4. Verify scores and ordering

---

## Future Enhancements

### Planned (V3)
- [ ] **User preferences**: Weight factors based on user settings
- [ ] **Historical success rate**: Boost users with good contribution history
- [ ] **Skill matching**: Fine-grained competence matching
- [ ] **Machine learning**: Learn from accepted/rejected matches

### Considered
- [ ] **Collaborative filtering**: "Users like you also helped with..."
- [ ] **Real-time updates**: WebSocket notifications for new matches
- [ ] **Match explanation**: Show why a match scored high

---

## FAQs

### Why is my match score low?

Check:
- **Tags**: Do mission and offer share tags?
- **Category**: Same category?
- **Location**: Are they within acceptable radius?
- **Help type**: Does offer type match mission need?

### Can I adjust scoring weights?

**Current**: Weights are hardcoded in `matching.service.ts`

**Future**: User-configurable weights (planned for V3)

### Why don't I see any suggestions?

Possible reasons:
1. **No open offers**: Create an offer first
2. **Low scores**: All matches < 10 threshold
3. **All missions are yours**: Can't match your own missions

---

## Implementation

**File**: `backend/src/matching/matching.service.ts`

**Key methods**:
- `computeScore(mission, offer)` — Calculates weighted score
- `getSuggestionsForUser(userId)` — Returns personalized matches
- `correlateMission(missionId)` — Finds all offers for a mission

**Dependencies**:
- TypeORM (database queries)
- Haversine formula (geographic distance)

---

## See Also

- [`RATE_LIMITING.md`](./RATE_LIMITING.md) — API rate limits
- [`ERROR_HANDLING.md`](./ERROR_HANDLING.md) — Error response formats
- [`MIGRATIONS.md`](./MIGRATIONS.md) — Database schema
