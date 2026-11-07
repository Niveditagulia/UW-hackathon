CREATE TABLE IF NOT EXISTS local_accounts (
 id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('resident','staff')), salt TEXT NOT NULL,
 password_hash TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
 window_start INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS local_sessions (
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES local_accounts(id), expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS local_session_user ON local_sessions(user_id);
