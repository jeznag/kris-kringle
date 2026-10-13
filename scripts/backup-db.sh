#!/usr/bin/env bash
# Exports the production D1 database to a dated, gzipped SQL dump and checks it restores.
# Dumps hold family data and account IDs (which grant access), so they go outside the repo:
# copies under data/ are lost whenever a worktree is removed.
#
#   npm run db:backup                      # writes to ~/Backups/kris-kringle
#   KRIS_KRINGLE_BACKUP_DIR=/elsewhere npm run db:backup
set -euo pipefail

DATABASE_NAME=kris-kringle
BACKUP_DIR="${KRIS_KRINGLE_BACKUP_DIR:-$HOME/Backups/kris-kringle}"
DUMP_PATH="$BACKUP_DIR/$DATABASE_NAME-$(date +%Y-%m-%d-%H%M%S).sql"

mkdir -p "$BACKUP_DIR"
umask 077
npx wrangler d1 export "$DATABASE_NAME" --remote --output "$DUMP_PATH"

restore_check_dir=$(mktemp -d)
trap 'rm -rf "$restore_check_dir"' EXIT
sqlite3 "$restore_check_dir/restore-check.db" < "$DUMP_PATH"
sqlite3 "$restore_check_dir/restore-check.db" \
  "SELECT 'accounts', COUNT(*) FROM accounts
   UNION ALL SELECT 'family_members', COUNT(*) FROM family_members
   UNION ALL SELECT 'gift_exchanges', COUNT(*) FROM gift_exchanges;"

gzip -9 "$DUMP_PATH"
echo "Backup written to $DUMP_PATH.gz"
