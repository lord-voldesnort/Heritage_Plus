#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
ARCHIVE="$BACKUP_DIR/heritage_plus_${STAMP}.dump"

pg_dump --format=custom --no-owner --file="$ARCHIVE" "$DATABASE_URL"
sha256sum "$ARCHIVE" > "$ARCHIVE.sha256"
pg_restore --list "$ARCHIVE" > "$ARCHIVE.manifest"
find "$BACKUP_DIR" -type f -mtime "+$RETENTION_DAYS" -delete
printf 'Backup created and manifest verified: %s\n' "$ARCHIVE"
