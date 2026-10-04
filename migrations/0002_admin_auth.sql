ALTER TABLE accounts ADD COLUMN admin_password_hash TEXT;

-- Only a SHA-256 of each session token is stored, so a leaked table can't be replayed as cookies.
CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX admin_sessions_account_id ON admin_sessions (account_id);
