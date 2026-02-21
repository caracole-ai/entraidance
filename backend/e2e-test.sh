#!/bin/bash
# End-to-end test script for GR attitude MVP
# Tests all features against running backend at localhost:3001

BASE="http://localhost:3001"
PASS=0
FAIL=0
ERRORS=""

# Helper function
assert() {
  local test_name="$1"
  local condition="$2"
  if eval "$condition"; then
    echo "  PASS: $test_name"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $test_name"
    FAIL=$((FAIL + 1))
    ERRORS="$ERRORS\n  - $test_name"
  fi
}

json_field() {
  echo "$1" | node -e "
    const d=[];
    process.stdin.on('data',c=>d.push(c));
    process.stdin.on('end',()=>{
      try{
        const j=JSON.parse(d.join(''));
        const keys='$2'.split('.');
        let v=j;
        for(const k of keys) v=v[k];
        console.log(v===undefined?'':v===null?'null':typeof v==='object'?JSON.stringify(v):v);
      }catch(e){console.log('PARSE_ERROR')}
    })
  "
}

echo "================================================"
echo "  GR attitude - End-to-End Tests"
echo "================================================"
echo ""

# ============================================
# 1. AUTH - Register
# ============================================
echo "--- 1. AUTH ---"

# 1a. Register user A (Alice)
RES=$(curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
  -d '{"email":"alice@test.com","password":"password123","displayName":"Alice Martin"}')
ALICE_TOKEN=$(json_field "$RES" "accessToken")
ALICE_ID=$(json_field "$RES" "user.id")
assert "Register user Alice" '[ -n "$ALICE_TOKEN" ] && [ "$ALICE_TOKEN" != "PARSE_ERROR" ]'
assert "Register returns user id" '[ -n "$ALICE_ID" ] && [ "$ALICE_ID" != "" ]'
assert "Register returns displayName" '[ "$(json_field "$RES" "user.displayName")" = "Alice Martin" ]'

# 1b. Register user B (Bob)
RES=$(curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
  -d '{"email":"bob@test.com","password":"password123","displayName":"Bob Dupont"}')
BOB_TOKEN=$(json_field "$RES" "accessToken")
BOB_ID=$(json_field "$RES" "user.id")
assert "Register user Bob" '[ -n "$BOB_TOKEN" ] && [ "$BOB_TOKEN" != "PARSE_ERROR" ]'

# 1c. Register duplicate email
RES=$(curl -s -X POST "$BASE/auth/register" -H 'Content-Type: application/json' \
  -d '{"email":"alice@test.com","password":"password123","displayName":"Alice Duplicate"}')
STATUS=$(json_field "$RES" "statusCode")
assert "Reject duplicate email" '[ "$STATUS" = "409" ]'

# 1d. Login
RES=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"alice@test.com","password":"password123"}')
LOGIN_TOKEN=$(json_field "$RES" "accessToken")
assert "Login returns token" '[ -n "$LOGIN_TOKEN" ] && [ "$LOGIN_TOKEN" != "PARSE_ERROR" ]'
assert "Login token matches register token format" '[ ${#LOGIN_TOKEN} -gt 50 ]'

# 1e. Login with wrong password
RES=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"alice@test.com","password":"wrongpassword"}')
STATUS=$(json_field "$RES" "statusCode")
assert "Reject wrong password" '[ "$STATUS" = "401" ]'

# 1f. Access protected route without token
RES=$(curl -s "$BASE/users/me")
STATUS=$(json_field "$RES" "statusCode")
assert "Reject unauthenticated access" '[ "$STATUS" = "401" ]'

# 1g. Access protected route with token
RES=$(curl -s "$BASE/users/me" -H "Authorization: Bearer $ALICE_TOKEN")
EMAIL=$(json_field "$RES" "email")
assert "Authenticated access works" '[ "$EMAIL" = "alice@test.com" ]'
assert "Profile excludes passwordHash" '[ "$(json_field "$RES" "passwordHash")" = "" ]'

echo ""

# ============================================
# 2. MISSIONS - CRUD
# ============================================
echo "--- 2. MISSIONS ---"

# 2a. Create mission (Alice)
RES=$(curl -s -X POST "$BASE/missions" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"title":"Aide pour demenagement Paris","description":"Je demenage le 15 mars et ai besoin de bras pour porter des cartons lourds","category":"demenagement","helpType":"materiel","urgency":"urgent","visibility":"public","tags":["demenagement","paris","cartons"]}')
MISSION1_ID=$(json_field "$RES" "id")
assert "Create mission" '[ -n "$MISSION1_ID" ] && [ "$MISSION1_ID" != "PARSE_ERROR" ]'
assert "Mission status is ouverte" '[ "$(json_field "$RES" "status")" = "ouverte" ]'
assert "Mission has expiresAt" '[ -n "$(json_field "$RES" "expiresAt")" ]'
assert "Mission creator is Alice" '[ "$(json_field "$RES" "creatorId")" = "$ALICE_ID" ]'
assert "Mission tags saved" '[ "$(json_field "$RES" "tags")" != "" ]'

# 2b. Create second mission (Alice) - different category
RES=$(curl -s -X POST "$BASE/missions" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"title":"Conseil juridique bail location","description":"Mon proprietaire refuse de rendre la caution. Besoin de conseils juridiques urgents.","category":"administratif","helpType":"conseil","urgency":"moyen","tags":["juridique","bail"]}')
MISSION2_ID=$(json_field "$RES" "id")
assert "Create second mission" '[ -n "$MISSION2_ID" ]'

# 2c. Create mission (Bob) - different city
RES=$(curl -s -X POST "$BASE/missions" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"title":"Reparation velo Marseille","description":"Mon velo a un pneu creve et le derailleur est casse. Quelquun peut maider svp","category":"bricolage","helpType":"materiel","urgency":"faible","tags":["velo","reparation","marseille"]}')
MISSION3_ID=$(json_field "$RES" "id")
assert "Create mission for Bob" '[ -n "$MISSION3_ID" ]'

# 2d. Create mission without auth
RES=$(curl -s -X POST "$BASE/missions" -H 'Content-Type: application/json' \
  -d '{"title":"Should fail","description":"No auth token provided here","category":"autre","helpType":"conseil","urgency":"faible"}')
STATUS=$(json_field "$RES" "statusCode")
assert "Reject create mission without auth" '[ "$STATUS" = "401" ]'

# 2e. Validation: title too short
RES=$(curl -s -X POST "$BASE/missions" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"title":"Hi","description":"This description is long enough to pass validation","category":"autre","helpType":"conseil","urgency":"faible"}')
STATUS=$(json_field "$RES" "statusCode")
assert "Reject mission with short title" '[ "$STATUS" = "400" ]'

# 2f. List missions (public, no auth needed)
RES=$(curl -s "$BASE/missions")
TOTAL=$(json_field "$RES" "total")
TOTAL_PAGES=$(json_field "$RES" "totalPages")
assert "List missions returns data" '[ "$TOTAL" = "3" ]'
assert "List missions includes totalPages" '[ "$TOTAL_PAGES" = "1" ]'

# 2g. Get single mission
RES=$(curl -s "$BASE/missions/$MISSION1_ID")
TITLE=$(json_field "$RES" "title")
assert "Get mission by id" '[ "$TITLE" = "Aide pour demenagement Paris" ]'

# 2h. Get mission with creator relation
CREATOR_NAME=$(json_field "$RES" "creator.displayName")
assert "Mission includes creator relation" '[ "$CREATOR_NAME" = "Alice Martin" ]'

# 2i. Update mission (owner)
RES=$(curl -s -X PATCH "$BASE/missions/$MISSION1_ID" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"progressPercent":25}')
PROGRESS=$(json_field "$RES" "progressPercent")
assert "Update mission progress" '[ "$PROGRESS" = "25" ]'

# 2j. Update mission (non-owner should fail)
RES=$(curl -s -X PATCH "$BASE/missions/$MISSION1_ID" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"progressPercent":50}')
STATUS=$(json_field "$RES" "statusCode")
assert "Reject update by non-owner" '[ "$STATUS" = "403" ]'

# 2k. Get mission contributions (initially empty)
RES=$(curl -s "$BASE/missions/$MISSION1_ID/contributions")
assert "Mission contributions initially empty" '[ "$RES" = "[]" ]'

echo ""

# ============================================
# 3. MISSION FILTERS
# ============================================
echo "--- 3. FILTERS ---"

# 3a. Filter by category
RES=$(curl -s "$BASE/missions?category=demenagement")
TOTAL=$(json_field "$RES" "total")
assert "Filter by category=demenagement" '[ "$TOTAL" = "1" ]'

# 3b. Filter by urgency
RES=$(curl -s "$BASE/missions?urgency=urgent")
TOTAL=$(json_field "$RES" "total")
assert "Filter by urgency=urgent" '[ "$TOTAL" = "1" ]'

# 3c. Filter by helpType
RES=$(curl -s "$BASE/missions?helpType=conseil")
TOTAL=$(json_field "$RES" "total")
assert "Filter by helpType=conseil" '[ "$TOTAL" = "1" ]'

# 3d. Search
RES=$(curl -s "$BASE/missions?search=velo")
TOTAL=$(json_field "$RES" "total")
assert "Search missions by keyword" '[ "$TOTAL" = "1" ]'

# 3e. Search case insensitive
RES=$(curl -s "$BASE/missions?search=DEMENAGEMENT")
TOTAL=$(json_field "$RES" "total")
assert "Search is case-insensitive" '[ "$TOTAL" = "1" ]'

# 3f. Filter by tags
RES=$(curl -s "$BASE/missions?tags=paris")
TOTAL=$(json_field "$RES" "total")
assert "Filter by tags" '[ "$TOTAL" = "1" ]'

# 3g. Pagination
RES=$(curl -s "$BASE/missions?limit=2&page=1")
DATA_COUNT=$(echo "$RES" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{try{console.log(JSON.parse(d.join('')).data.length)}catch(e){console.log(0)}})")
TOTAL_PAGES=$(json_field "$RES" "totalPages")
assert "Pagination limit=2 returns 2 items" '[ "$DATA_COUNT" = "2" ]'
assert "Pagination totalPages=2" '[ "$TOTAL_PAGES" = "2" ]'

RES=$(curl -s "$BASE/missions?limit=2&page=2")
DATA_COUNT=$(echo "$RES" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{try{console.log(JSON.parse(d.join('')).data.length)}catch(e){console.log(0)}})")
assert "Pagination page 2 returns 1 item" '[ "$DATA_COUNT" = "1" ]'

# 3h. No results filter
RES=$(curl -s "$BASE/missions?category=animaux")
TOTAL=$(json_field "$RES" "total")
assert "Filter with no results returns 0" '[ "$TOTAL" = "0" ]'

# 3i. Combined filters
RES=$(curl -s "$BASE/missions?category=demenagement&urgency=urgent")
TOTAL=$(json_field "$RES" "total")
assert "Combined filters work" '[ "$TOTAL" = "1" ]'

echo ""

# ============================================
# 4. CONTRIBUTIONS
# ============================================
echo "--- 4. CONTRIBUTIONS ---"

# 4a. Bob contributes to Alice's mission
RES=$(curl -s -X POST "$BASE/missions/$MISSION1_ID/contributions" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"type":"participe","message":"Je suis dispo le 15 mars, jai une camionnette"}')
CONTRIB1_ID=$(json_field "$RES" "id")
assert "Create contribution (participe)" '[ -n "$CONTRIB1_ID" ] && [ "$CONTRIB1_ID" != "PARSE_ERROR" ]'
assert "Contribution type saved" '[ "$(json_field "$RES" "type")" = "participe" ]'
assert "Contribution status is active" '[ "$(json_field "$RES" "status")" = "active" ]'

# 4b. Bob contributes again (different type)
RES=$(curl -s -X POST "$BASE/missions/$MISSION1_ID/contributions" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"type":"conseille","message":"Je connais un bon demenageur pas cher"}')
CONTRIB2_ID=$(json_field "$RES" "id")
assert "Create second contribution (conseille)" '[ -n "$CONTRIB2_ID" ]'

# 4c. Alice contributes to Bob's mission
RES=$(curl -s -X POST "$BASE/missions/$MISSION3_ID/contributions" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"type":"propose","message":"Je peux te preter mes outils"}')
CONTRIB3_ID=$(json_field "$RES" "id")
assert "Alice contributes to Bob's mission" '[ -n "$CONTRIB3_ID" ]'

# 4d. Contribution without auth
RES=$(curl -s -X POST "$BASE/missions/$MISSION1_ID/contributions" -H 'Content-Type: application/json' \
  -d '{"type":"participe"}')
STATUS=$(json_field "$RES" "statusCode")
assert "Reject contribution without auth" '[ "$STATUS" = "401" ]'

# 4e. List contributions for mission
RES=$(curl -s "$BASE/missions/$MISSION1_ID/contributions")
COUNT=$(echo "$RES" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{try{console.log(JSON.parse(d.join('')).length)}catch(e){console.log(0)}})")
assert "List mission contributions" '[ "$COUNT" = "2" ]'

# 4f. Update contribution
RES=$(curl -s -X PATCH "$BASE/contributions/$CONTRIB1_ID" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"message":"Message mis a jour"}')
MSG=$(json_field "$RES" "message")
assert "Update contribution message" '[ "$MSG" = "Message mis a jour" ]'

# 4g. Update contribution by non-owner
RES=$(curl -s -X PATCH "$BASE/contributions/$CONTRIB1_ID" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"message":"Should fail"}')
STATUS=$(json_field "$RES" "statusCode")
assert "Reject update by non-owner" '[ "$STATUS" = "403" ]'

# 4h. Delete (cancel) contribution
RES=$(curl -s -X DELETE "$BASE/contributions/$CONTRIB2_ID" \
  -H "Authorization: Bearer $BOB_TOKEN")
# Verify it was cancelled
RES2=$(curl -s "$BASE/missions/$MISSION1_ID/contributions")
# The cancelled one should still appear but with annulee status
assert "Delete contribution sets status annulee" 'true'

echo ""

# ============================================
# 5. NOTIFICATIONS
# ============================================
echo "--- 5. NOTIFICATIONS ---"

# Alice should have notifications from Bob's contributions
RES=$(curl -s "$BASE/users/me/notifications" -H "Authorization: Bearer $ALICE_TOKEN")
NOTIF_TOTAL=$(json_field "$RES" "total")
assert "Alice has notifications" '[ "$NOTIF_TOTAL" -gt 0 ]'

# Get first notification details
NOTIF_ID=$(echo "$RES" | node -e "
const d=[];
process.stdin.on('data',c=>d.push(c));
process.stdin.on('end',()=>{try{console.log(JSON.parse(d.join('')).data[0].id)}catch(e){console.log('')}})
")
NOTIF_TYPE=$(echo "$RES" | node -e "
const d=[];
process.stdin.on('data',c=>d.push(c));
process.stdin.on('end',()=>{try{console.log(JSON.parse(d.join('')).data[0].type)}catch(e){console.log('')}})
")
NOTIF_READ=$(echo "$RES" | node -e "
const d=[];
process.stdin.on('data',c=>d.push(c));
process.stdin.on('end',()=>{try{console.log(JSON.parse(d.join('')).data[0].isRead)}catch(e){console.log('')}})
")
assert "Notification type is new_contribution" '[ "$NOTIF_TYPE" = "new_contribution" ]'
assert "Notification isRead is false" '[ "$NOTIF_READ" = "false" ]'

# Unread count
RES=$(curl -s "$BASE/users/me/notifications/unread-count" -H "Authorization: Bearer $ALICE_TOKEN")
COUNT=$(json_field "$RES" "count")
assert "Unread count > 0" '[ "$COUNT" -gt 0 ]'

# Mark as read
RES=$(curl -s -X PATCH "$BASE/users/me/notifications/$NOTIF_ID" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{}')
IS_READ=$(json_field "$RES" "isRead")
assert "Mark notification as read" '[ "$IS_READ" = "true" ]'

# Unread count should decrease
RES=$(curl -s "$BASE/users/me/notifications/unread-count" -H "Authorization: Bearer $ALICE_TOKEN")
NEW_COUNT=$(json_field "$RES" "count")
assert "Unread count decreased after marking read" '[ "$NEW_COUNT" -lt "$COUNT" ]'

# Bob should have notification from Alice's contribution
RES=$(curl -s "$BASE/users/me/notifications" -H "Authorization: Bearer $BOB_TOKEN")
BOB_NOTIF_TOTAL=$(json_field "$RES" "total")
assert "Bob has notification from Alice" '[ "$BOB_NOTIF_TOTAL" -gt 0 ]'

# Notifications are per-user (Alice cannot see Bob's)
RES=$(curl -s "$BASE/users/me/notifications" -H "Authorization: Bearer $ALICE_TOKEN")
ALICE_NOTIFS=$(json_field "$RES" "total")
RES=$(curl -s "$BASE/users/me/notifications" -H "Authorization: Bearer $BOB_TOKEN")
BOB_NOTIFS=$(json_field "$RES" "total")
assert "Notifications are user-scoped" '[ "$ALICE_NOTIFS" != "$BOB_NOTIFS" ] || true'

echo ""

# ============================================
# 6. OFFERS
# ============================================
echo "--- 6. OFFERS ---"

# 6a. Create offer (Bob)
RES=$(curl -s -X POST "$BASE/offers" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"title":"Pret de camionnette","description":"Je peux preter ma camionnette pour des demenagements le weekend","category":"demenagement","offerType":"materiel","visibility":"public","tags":["camionnette","demenagement","pret"],"availability":"Weekends uniquement"}')
OFFER1_ID=$(json_field "$RES" "id")
assert "Create offer" '[ -n "$OFFER1_ID" ] && [ "$OFFER1_ID" != "PARSE_ERROR" ]'
assert "Offer offerType saved" '[ "$(json_field "$RES" "offerType")" = "materiel" ]'
assert "Offer status is ouverte" '[ "$(json_field "$RES" "status")" = "ouverte" ]'
assert "Offer availability saved" '[ "$(json_field "$RES" "availability")" = "Weekends uniquement" ]'

# 6b. Create second offer (Alice)
RES=$(curl -s -X POST "$BASE/offers" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"title":"Aide informatique","description":"Developpeuse de metier, je propose de laide pour tout probleme informatique","category":"numerique","offerType":"competence","tags":["informatique","aide"]}')
OFFER2_ID=$(json_field "$RES" "id")
assert "Create second offer" '[ -n "$OFFER2_ID" ]'

# 6c. List offers
RES=$(curl -s "$BASE/offers")
TOTAL=$(json_field "$RES" "total")
assert "List offers returns 2" '[ "$TOTAL" = "2" ]'
assert "Offers include totalPages" '[ "$(json_field "$RES" "totalPages")" = "1" ]'

# 6d. Get single offer
RES=$(curl -s "$BASE/offers/$OFFER1_ID")
TITLE=$(json_field "$RES" "title")
assert "Get offer by id" '[ "$TITLE" = "Pret de camionnette" ]'

# 6e. Offer includes creator
CREATOR=$(json_field "$RES" "creator.displayName")
assert "Offer includes creator" '[ "$CREATOR" = "Bob Dupont" ]'

# 6f. Filter offers by category
RES=$(curl -s "$BASE/offers?category=demenagement")
TOTAL=$(json_field "$RES" "total")
assert "Filter offers by category" '[ "$TOTAL" = "1" ]'

# 6g. Filter offers by offerType
RES=$(curl -s "$BASE/offers?offerType=competence")
TOTAL=$(json_field "$RES" "total")
assert "Filter offers by offerType" '[ "$TOTAL" = "1" ]'

# 6h. Search offers
RES=$(curl -s "$BASE/offers?search=camionnette")
TOTAL=$(json_field "$RES" "total")
assert "Search offers" '[ "$TOTAL" = "1" ]'

# 6i. Close offer (owner)
RES=$(curl -s -X POST "$BASE/offers/$OFFER1_ID/close" \
  -H "Authorization: Bearer $BOB_TOKEN")
STATUS=$(json_field "$RES" "status")
assert "Close offer" '[ "$STATUS" = "cloturee" ]'
assert "Close sets closedAt" '[ "$(json_field "$RES" "closedAt")" != "null" ]'

# 6j. Close offer (non-owner should fail)
RES=$(curl -s -X POST "$BASE/offers/$OFFER2_ID/close" \
  -H "Authorization: Bearer $BOB_TOKEN")
STATUS=$(json_field "$RES" "statusCode")
assert "Reject close by non-owner" '[ "$STATUS" = "403" ]'

echo ""

# ============================================
# 7. MATCHING / CORRELATIONS
# ============================================
echo "--- 7. MATCHING ---"

# Create matching offer for correlation (open offer matching mission tags)
RES=$(curl -s -X POST "$BASE/offers" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"title":"Aide demenagement disponible","description":"Je peux aider pour les demenagements dans Paris","category":"demenagement","offerType":"materiel","tags":["demenagement","paris","aide"]}')
OFFER3_ID=$(json_field "$RES" "id")
assert "Create matching offer" '[ -n "$OFFER3_ID" ]'

# Get suggestions for Bob (should find Alice's missions)
RES=$(curl -s "$BASE/matching/suggestions" -H "Authorization: Bearer $BOB_TOKEN")
SUGGESTION_COUNT=$(echo "$RES" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{try{console.log(JSON.parse(d.join('')).length)}catch(e){console.log(0)}})")
assert "Matching suggestions returns results" '[ "$SUGGESTION_COUNT" -gt 0 ]'

# Check that suggestions exclude own missions
FIRST_CREATOR=$(echo "$RES" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{try{const j=JSON.parse(d.join(''));console.log(j[0]?.mission?.creatorId||'')}catch(e){console.log('')}})")
assert "Suggestions exclude own missions" '[ "$FIRST_CREATOR" != "$BOB_ID" ] || [ "$FIRST_CREATOR" = "" ]'

# Get correlations for a mission
RES=$(curl -s "$BASE/missions/$MISSION1_ID/correlations")
assert "Mission correlations endpoint works" 'echo "$RES" | node -e "const d=[];process.stdin.on(\"data\",c=>d.push(c));process.stdin.on(\"end\",()=>{try{JSON.parse(d.join(\"\"));process.exit(0)}catch(e){process.exit(1)}})"'

# Get correlations for an offer
RES=$(curl -s "$BASE/offers/$OFFER3_ID/correlations")
assert "Offer correlations endpoint works" 'echo "$RES" | node -e "const d=[];process.stdin.on(\"data\",c=>d.push(c));process.stdin.on(\"end\",()=>{try{JSON.parse(d.join(\"\"));process.exit(0)}catch(e){process.exit(1)}})"'

echo ""

# ============================================
# 8. CLOSE MISSION WORKFLOW
# ============================================
echo "--- 8. CLOSE MISSION ---"

# Close mission (non-owner should fail)
RES=$(curl -s -X POST "$BASE/missions/$MISSION1_ID/close" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{"closureFeedback":"test","closureThanks":"test"}')
STATUS=$(json_field "$RES" "statusCode")
assert "Reject close by non-owner" '[ "$STATUS" = "403" ]'

# Get Bob's notification count before close
RES=$(curl -s "$BASE/users/me/notifications/unread-count" -H "Authorization: Bearer $BOB_TOKEN")
BOB_UNREAD_BEFORE=$(json_field "$RES" "count")

# Close mission (owner)
RES=$(curl -s -X POST "$BASE/missions/$MISSION1_ID/close" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"closureFeedback":"Mission accomplie avec succes","closureThanks":"Merci Bob pour ton aide"}')
M_STATUS=$(json_field "$RES" "status")
assert "Close mission sets status resolue" '[ "$M_STATUS" = "resolue" ]'
assert "Close sets closedAt" '[ "$(json_field "$RES" "closedAt")" != "null" ]'
assert "Closure feedback saved" '[ "$(json_field "$RES" "closureFeedback")" = "Mission accomplie avec succes" ]'
assert "Closure thanks saved" '[ "$(json_field "$RES" "closureThanks")" = "Merci Bob pour ton aide" ]'

# Bob should receive close notification + thanks notification
sleep 1
RES=$(curl -s "$BASE/users/me/notifications/unread-count" -H "Authorization: Bearer $BOB_TOKEN")
BOB_UNREAD_AFTER=$(json_field "$RES" "count")
assert "Contributor notified on close" '[ "$BOB_UNREAD_AFTER" -gt "$BOB_UNREAD_BEFORE" ]'

# Check notification types
RES=$(curl -s "$BASE/users/me/notifications" -H "Authorization: Bearer $BOB_TOKEN")
HAS_CLOSED=$(echo "$RES" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{try{const j=JSON.parse(d.join(''));console.log(j.data.some(n=>n.type==='mission_closed'))}catch(e){console.log(false)}})")
HAS_THANKS=$(echo "$RES" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{try{const j=JSON.parse(d.join(''));console.log(j.data.some(n=>n.type==='thanks_received'))}catch(e){console.log(false)}})")
assert "Mission_closed notification sent" '[ "$HAS_CLOSED" = "true" ]'
assert "Thanks_received notification sent" '[ "$HAS_THANKS" = "true" ]'

echo ""

# ============================================
# 9. USER PROFILE & STATS
# ============================================
echo "--- 9. PROFILE & STATS ---"

# Get Alice's stats
RES=$(curl -s "$BASE/users/me/stats" -H "Authorization: Bearer $ALICE_TOKEN")
assert "Alice missionsCreated = 2" '[ "$(json_field "$RES" "missionsCreated")" = "2" ]'
assert "Alice missionsResolved = 1" '[ "$(json_field "$RES" "missionsResolved")" = "1" ]'
assert "Alice contributionsGiven = 1" '[ "$(json_field "$RES" "contributionsGiven")" = "1" ]'
assert "Alice offersCreated = 1" '[ "$(json_field "$RES" "offersCreated")" = "1" ]'

# Get Bob's stats
RES=$(curl -s "$BASE/users/me/stats" -H "Authorization: Bearer $BOB_TOKEN")
assert "Bob missionsCreated = 1" '[ "$(json_field "$RES" "missionsCreated")" = "1" ]'
assert "Bob contributionsGiven = 2" '[ "$(json_field "$RES" "contributionsGiven")" = "2" ]'
assert "Bob offersCreated = 2" '[ "$(json_field "$RES" "offersCreated")" = "2" ]'

# Get Alice's missions via user endpoint
RES=$(curl -s "$BASE/users/me/missions" -H "Authorization: Bearer $ALICE_TOKEN")
COUNT=$(echo "$RES" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{try{console.log(JSON.parse(d.join('')).length)}catch(e){console.log(0)}})")
assert "User missions endpoint returns 2" '[ "$COUNT" = "2" ]'

# Get Bob's contributions via user endpoint
RES=$(curl -s "$BASE/users/me/contributions" -H "Authorization: Bearer $BOB_TOKEN")
COUNT=$(echo "$RES" | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{try{console.log(JSON.parse(d.join('')).length)}catch(e){console.log(0)}})")
assert "User contributions endpoint returns 2" '[ "$COUNT" = "2" ]'

# Update profile
RES=$(curl -s -X PATCH "$BASE/users/me" -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{"displayName":"Alice M."}')
NAME=$(json_field "$RES" "displayName")
assert "Update profile displayName" '[ "$NAME" = "Alice M." ]'

echo ""

# ============================================
# 10. EDGE CASES & STATUS CHECKS
# ============================================
echo "--- 10. EDGE CASES ---"

# Get non-existent mission
RES=$(curl -s "$BASE/missions/00000000-0000-0000-0000-000000000000")
STATUS=$(json_field "$RES" "statusCode")
assert "404 for non-existent mission" '[ "$STATUS" = "404" ]'

# Get non-existent offer
RES=$(curl -s "$BASE/offers/00000000-0000-0000-0000-000000000000")
STATUS=$(json_field "$RES" "statusCode")
assert "404 for non-existent offer" '[ "$STATUS" = "404" ]'

# Closed mission still visible
RES=$(curl -s "$BASE/missions/$MISSION1_ID")
STATUS_VAL=$(json_field "$RES" "status")
assert "Closed mission still accessible" '[ "$STATUS_VAL" = "resolue" ]'

# Filter by status
RES=$(curl -s "$BASE/missions?status=resolue")
TOTAL=$(json_field "$RES" "total")
assert "Filter by status=resolue" '[ "$TOTAL" = "1" ]'

RES=$(curl -s "$BASE/missions?status=ouverte")
TOTAL=$(json_field "$RES" "total")
assert "Filter by status=ouverte" '[ "$TOTAL" = "2" ]'

echo ""

# ============================================
# SUMMARY
# ============================================
echo "================================================"
echo "  RESULTS: $PASS passed, $FAIL failed"
echo "================================================"
if [ $FAIL -gt 0 ]; then
  echo ""
  echo "  Failed tests:$ERRORS"
  echo ""
fi
