-- Mirrors the columns of the legacy Rails/Postgres schema so the frontend's JSON
-- contract is unchanged. Text columns stay text (e.g. participating_this_year is
-- the string 'true'/'false') because the client compares against those strings.

CREATE TABLE accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_name TEXT,
  account_id TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE family_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL,
  name TEXT,
  partner TEXT,
  family_member_type TEXT,
  parent_id TEXT,
  participating_this_year TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX family_members_account_id ON family_members (account_id);

CREATE TABLE gift_exchanges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id TEXT NOT NULL,
  xmas_year TEXT NOT NULL,
  giver_name TEXT,
  receiver_name TEXT,
  giver_type TEXT,
  receiver_type TEXT,
  social_distance TEXT,
  giver_id INTEGER,
  receiver_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX gift_exchanges_account_id_xmas_year ON gift_exchanges (account_id, xmas_year);
