#!/usr/bin/env bash
# Start backend + frontend in parallel. Ctrl+C kills both.

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  echo ""
  echo "[dev] Shutting down..."
  kill $BE_PID $FE_PID 2>/dev/null
  wait $BE_PID $FE_PID 2>/dev/null
  echo "[dev] Done."
}
trap cleanup EXIT INT TERM

echo "[dev] Starting backend on :3001..."
cd "$ROOT_DIR/backend" && npm run start:dev &
BE_PID=$!

echo "[dev] Starting frontend on :3000..."
cd "$ROOT_DIR/frontend" && npm run dev &
FE_PID=$!

wait
