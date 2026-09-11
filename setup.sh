#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

command -v node >/dev/null 2>&1 || { echo "Node.js 22+ is required: https://nodejs.org/"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required."; exit 1; }

node_version="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$node_version" -lt 20 ]; then
  echo "Node.js 20+ is required; detected $(node --version)."
  exit 1
fi

[ -f .env ] || cp .env.example .env
[ -f server/.env ] || cp server/.env.example server/.env

if grep -q '^SESSION_SECRET=$' server/.env 2>/dev/null; then
  secret="$(node -e 'console.log(require("crypto").randomBytes(48).toString("base64"))')"
  sed -i "s#^SESSION_SECRET=.*#SESSION_SECRET=$secret#" server/.env
fi

echo "Installing frontend dependencies..."
npm ci

echo "Installing backend dependencies..."
(cd server && npm ci)

echo
if grep -q '^DATABASE_URL=$' server/.env 2>/dev/null; then
  echo "Setup is complete, but DATABASE_URL is still empty."
  echo "Edit server/.env and set DATABASE_URL to a PostgreSQL + PostGIS connection string."
  echo "Then run: cd server && npm run migrate && npm run seed && npm run seed:users"
else
  echo "Database URL detected. Applying schema and seed data..."
  (cd server && npm run migrate && npm run seed)
fi

echo
echo "Ready. Start the backend in one terminal:"
echo "  cd server && npm run dev"
echo
echo "Start the frontend in another terminal:"
echo "  npm run dev"
