#!/bin/bash

# Rate Limiting Test Script
# Tests various endpoints to ensure rate limits are correctly applied

set -e

API_URL="${API_URL:-http://localhost:3001}"
BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
RESET="\033[0m"

echo -e "${BOLD}Rate Limiting Test Suite${RESET}"
echo "Testing against: $API_URL"
echo ""

# Test 1: GET /missions (limit: 60/min)
echo -e "${BOLD}Test 1: GET /missions (limit: 60/min)${RESET}"
echo "Sending 65 requests..."
RESULTS=$(for i in {1..65}; do 
  curl -s -o /dev/null -w "%{http_code} " "$API_URL/missions"
done)

SUCCESS_COUNT=$(echo "$RESULTS" | grep -o "200" | wc -l | xargs)
RATE_LIMITED_COUNT=$(echo "$RESULTS" | grep -o "429" | wc -l | xargs)

echo "Results: $SUCCESS_COUNT success, $RATE_LIMITED_COUNT rate-limited"

if [ "$SUCCESS_COUNT" -eq 60 ] && [ "$RATE_LIMITED_COUNT" -eq 5 ]; then
  echo -e "${GREEN}✓ PASS${RESET}: First 60 succeeded, last 5 rate-limited"
else
  echo -e "${RED}✗ FAIL${RESET}: Expected 60 success + 5 rate-limited"
  echo "Got: $SUCCESS_COUNT success + $RATE_LIMITED_COUNT rate-limited"
fi

echo ""

# Wait for rate limit to reset
echo -e "${YELLOW}Waiting 60s for rate limit to reset...${RESET}"
sleep 60

# Test 2: POST /auth/register (limit: 5/min)
echo -e "${BOLD}Test 2: POST /auth/register (limit: 5/min)${RESET}"
echo "Sending 7 registration requests..."

TIMESTAMP=$(date +%s)
REGISTER_RESULTS=""

for i in {1..7}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test-rate-$TIMESTAMP-$i@example.com\",\"password\":\"Test1234!\",\"displayName\":\"Test User\"}")
  REGISTER_RESULTS="$REGISTER_RESULTS $STATUS"
done

# Filter out 201 (success) and 400 (validation errors - email already exists)
NON_RATE_LIMITED=$(echo "$REGISTER_RESULTS" | grep -oE "(201|400)" | wc -l | xargs)
RATE_LIMITED=$(echo "$REGISTER_RESULTS" | grep -o "429" | wc -l | xargs)

echo "Results: $NON_RATE_LIMITED non-rate-limited, $RATE_LIMITED rate-limited"

if [ "$NON_RATE_LIMITED" -le 5 ] && [ "$RATE_LIMITED" -ge 2 ]; then
  echo -e "${GREEN}✓ PASS${RESET}: Rate limiting working (≤5 allowed, rest blocked)"
else
  echo -e "${YELLOW}⚠ PARTIAL${RESET}: Check if rate limit is being applied"
  echo "Expected: ≤5 non-rate-limited + ≥2 rate-limited"
fi

echo ""

# Test 3: Check response format on 429
echo -e "${BOLD}Test 3: Response format on 429${RESET}"

# Hit limit first
for i in {1..61}; do 
  curl -s -o /dev/null "$API_URL/missions" > /dev/null 2>&1
done

# Get 429 response
RESPONSE=$(curl -s "$API_URL/missions")
STATUS_CODE=$(echo "$RESPONSE" | jq -r '.statusCode // empty')
MESSAGE=$(echo "$RESPONSE" | jq -r '.message // empty')
TIMESTAMP=$(echo "$RESPONSE" | jq -r '.timestamp // empty')

if [ "$STATUS_CODE" = "429" ] && [ -n "$MESSAGE" ] && [ -n "$TIMESTAMP" ]; then
  echo -e "${GREEN}✓ PASS${RESET}: 429 response has correct format"
  echo "  statusCode: $STATUS_CODE"
  echo "  message: $MESSAGE"
  echo "  timestamp: $TIMESTAMP"
else
  echo -e "${RED}✗ FAIL${RESET}: Invalid 429 response format"
  echo "Response: $RESPONSE"
fi

echo ""
echo -e "${BOLD}Test suite complete${RESET}"
