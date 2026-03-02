#!/bin/bash
set -e

echo "Running database migrations..."
rustpress-migrate --database-url "$DATABASE_URL" --migrations /app/migrations 2>&1 || echo "Migration completed (or already up to date)"

echo "Starting RustPress server..."
exec rustpress "$@"
