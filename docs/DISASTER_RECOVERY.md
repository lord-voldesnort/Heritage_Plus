# Disaster Recovery

## Backup policy

The production database must be backed up with `scripts/backup-postgres.sh` on a schedule appropriate to the deployment. The script creates a PostgreSQL custom-format dump, a SHA-256 checksum, and a `pg_restore --list` manifest. The default retention period is fourteen days and can be changed with `BACKUP_RETENTION_DAYS`.

Binary evidence is stored separately from relational metadata. A production deployment must use a durable S3-compatible bucket or equivalent persistent volume for evidence files. Local disk storage is suitable only for development or a deliberately configured single-host deployment.

## Restore procedure

Create an isolated PostgreSQL/PostGIS database and restore a dump without modifying the primary database:

```bash
createdb heritage_plus_restore_check
pg_restore --clean --if-exists --no-owner \
  --dbname="$RESTORE_DATABASE_URL" \
  backups/heritage_plus_YYYYMMDDTHHMMSSZ.dump
psql "$RESTORE_DATABASE_URL" -c 'SELECT COUNT(*) FROM sites;'
psql "$RESTORE_DATABASE_URL" -c 'SELECT COUNT(*) FROM observation_records;'
psql "$RESTORE_DATABASE_URL" -c 'SELECT postgis_full_version();'
```

Verify the checksum before restore:

```bash
sha256sum --check backups/heritage_plus_YYYYMMDDTHHMMSSZ.dump.sha256
```

A restore is considered verified only when the checksum, catalog counts, PostGIS extension, and application readiness check all pass. The repository contains the procedure and backup script, but a live restore cannot be claimed from this sandbox because no PostgreSQL service is available.

## Recovery risks

The recovery point objective depends on the backup schedule. The recovery time objective depends on the database host, object-storage availability, and deployment automation. Evidence files must be restored from the same object-storage retention point as the relational backup; otherwise metadata may reference unavailable objects.
