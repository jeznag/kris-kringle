# Kris Kringle Generator

Generates kris kringle matches based on the following business rules.
* 1. Kids shouldn't buy for parents, partners shouldn't buy for each other
* 2. People shouldn't buy for the same person they bought for the previous year
* 3. No recursive gift giving allowed
* 4. Financial situation should be respected so that young adults don't have to buy too many gifts
* 5. Any left over people should be assigned to a leftover pool
* 6. Nobody sits out (more givers than kids) two years running unless it's unavoidable

Matching runs in the browser (`public/js/algorithm.js`). "Social distance" is the number of family steps between two people: parent↔child and partner↔partner are one step each, and everyone at the top of the tree is a sibling via the family root. So siblings are 2, first cousins 4, a first cousin's partner 5. Each draw starts by requiring cousins or further and relaxes only if nothing fits, and the best of 100 draws (most total distance, fewest repeat years off) wins. Clicking a match's distance shows the path between the two people.

## Stack

A Cloudflare Worker (`src/`) serves the pages and a small JSON API backed by a D1 (SQLite) database; the frontend in `public/` is served as static assets.

Anyone with an account's ID can view it at `/kris_kringle?account_id=<id>`. Adding `&admin` asks for the account's admin password (PBKDF2-hashed, attempts rate-limited) and starts a 30-day session cookie; every write to the API requires that session. Accounts created before admin passwords existed can be given one with:

```bash
node --experimental-strip-types scripts/hash-admin-password.mjs   # prompts for the password, prints a hash
npx wrangler d1 execute kris-kringle --remote \
  --command "UPDATE accounts SET admin_password_hash = '<hash>' WHERE account_id = '<account id>'"
```

## Development

```bash
npm install
npm run db:migrate:local
npm run dev          # http://localhost:8787
npm test             # algorithm unit tests (node:test)
npm run typecheck
```

## Deploying

```bash
npm run db:migrate:remote
npm run deploy
```

## Importing history

`scripts/build-seed-sql.mjs` converts the legacy Heroku Postgres backup (plus any extra history as JSON) into SQL for D1. Keep its inputs and output in `data/`, which is gitignored because account IDs grant access.

```bash
pg_restore --data-only --no-owner -f data/backup-data.sql "<backup>.sql"
node scripts/build-seed-sql.mjs data/backup-data.sql data/history-2025.json > data/seed.sql
npx wrangler d1 execute kris-kringle --remote --file data/seed.sql
```
