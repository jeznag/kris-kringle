# Kris Kringle Generator

Generates kris kringle matches based on the following business rules.
* 1. Kids shouldn't buy for parents, partners shouldn't buy for each other
* 2. People shouldn't buy for the same person they bought for the previous year
* 3. No recursive gift giving allowed
* 4. Financial situation should be respected so that young adults don't have to buy too many gifts
* 5. Any left over people should be assigned to a leftover pool

Uses a very inefficient (though slightly better now there's caching) graph searching approach to find matches based on social distance. The matching runs in the browser (`public/js/algorithm.js`).

## Stack

A Cloudflare Worker (`src/`) serves the pages and a small JSON API backed by a D1 (SQLite) database; the frontend in `public/` is served as static assets. An account's ID in the URL is its only credential: `/kris_kringle?account_id=<id>` is the family view and adding `&admin` enables editing.

## Development

```bash
npm install
npm run db:migrate:local
npm run dev          # http://localhost:8787
npm test             # algorithm tests
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
