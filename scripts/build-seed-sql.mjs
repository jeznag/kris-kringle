#!/usr/bin/env node
/**
 * Builds D1 seed SQL from the legacy Heroku Postgres backup, plus optional extra
 * gift-exchange history (e.g. years that only survived in a Google Doc).
 *
 * Usage:
 *   pg_restore --data-only --no-owner -f data/backup-data.sql "<backup>.sql"
 *   node scripts/build-seed-sql.mjs data/backup-data.sql [data/history-2025.json ...] > data/seed.sql
 *   npx wrangler d1 execute kris-kringle --remote --file data/seed.sql
 *
 * Extra history files are JSON arrays of gift_exchanges rows (same column names as the table).
 * Output goes in /data, which is gitignored: it contains account IDs, which grant access.
 */
import { readFileSync } from 'node:fs';

const TABLE_COLUMNS = {
  accounts: ['id', 'account_name', 'account_id', 'email', 'created_at', 'updated_at'],
  family_members: [
    'id', 'account_id', 'name', 'partner', 'family_member_type', 'parent_id',
    'participating_this_year', 'created_at', 'updated_at',
  ],
  gift_exchanges: [
    'id', 'account_id', 'xmas_year', 'giver_name', 'receiver_name', 'giver_type', 'receiver_type',
    'social_distance', 'giver_id', 'receiver_id', 'created_at', 'updated_at',
  ],
};

const COPY_HEADER = /^COPY "public"\."(\w+)" \(([^)]*)\) FROM stdin;$/;
const COPY_TERMINATOR = '\\.';
const COPY_NULL = '\\N';
const COPY_ESCAPES = { t: '\t', n: '\n', r: '\r', '\\': '\\' };

function unescapeCopyValue(value) {
  if (value === COPY_NULL) return null;
  return value.replace(/\\(.)/g, (_, character) => COPY_ESCAPES[character] ?? character);
}

/** Parses pg_restore's plain-text COPY blocks into { table: [rowObject, ...] }. */
function parseCopyBlocks(sql) {
  const tables = {};
  let currentTable = null;
  let currentColumns = [];
  for (const line of sql.split('\n')) {
    const header = line.match(COPY_HEADER);
    if (header) {
      currentTable = header[1];
      currentColumns = header[2].split(', ').map((column) => column.replaceAll('"', ''));
      tables[currentTable] = [];
      continue;
    }
    if (!currentTable) continue;
    if (line === COPY_TERMINATOR) {
      currentTable = null;
      continue;
    }
    const values = line.split('\t').map(unescapeCopyValue);
    tables[currentTable].push(Object.fromEntries(currentColumns.map((column, index) => [column, values[index]])));
  }
  return tables;
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replaceAll("'", "''")}'`;
}

function insertStatement(table, row) {
  const columns = TABLE_COLUMNS[table].filter((column) => row[column] !== undefined);
  const values = columns.map((column) => sqlLiteral(row[column]));
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

const [backupPath, ...historyPaths] = process.argv.slice(2);
if (!backupPath) {
  console.error('Usage: node scripts/build-seed-sql.mjs <pg_restore-output.sql> [history.json ...]');
  process.exit(1);
}

const tables = parseCopyBlocks(readFileSync(backupPath, 'utf8'));
const extraExchanges = historyPaths.flatMap((path) => JSON.parse(readFileSync(path, 'utf8')));

const statements = [
  ...(tables.accounts ?? []).map((row) => insertStatement('accounts', row)),
  ...(tables.family_members ?? []).map((row) => insertStatement('family_members', row)),
  ...(tables.gift_exchanges ?? []).map((row) => insertStatement('gift_exchanges', row)),
  ...extraExchanges.map((row) => insertStatement('gift_exchanges', row)),
];
process.stdout.write(`${statements.join('\n')}\n`);
