CREATE TABLE IF NOT EXISTS admin_users (
 email TEXT PRIMARY KEY COLLATE NOCASE,
 google_sub TEXT UNIQUE,
 role TEXT NOT NULL CHECK(role IN ('owner','editor')),
 created_at INTEGER NOT NULL,
 CHECK((role='owner' AND email='hd@haodao.org') OR (role='editor' AND email!='hd@haodao.org'))
);
INSERT OR IGNORE INTO admin_users(email,role,created_at) VALUES('hd@haodao.org','owner',unixepoch());
CREATE TABLE IF NOT EXISTS admin_sessions (
 token_hash TEXT PRIMARY KEY, csrf TEXT NOT NULL,
 email TEXT NOT NULL REFERENCES admin_users(email) ON DELETE CASCADE,
 google_sub TEXT NOT NULL, expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_sessions_email ON admin_sessions(email);
CREATE TABLE IF NOT EXISTS admin_challenges(token_hash TEXT PRIMARY KEY,nonce TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TRIGGER IF NOT EXISTS protect_admin_owner_delete BEFORE DELETE ON admin_users WHEN OLD.role='owner' BEGIN SELECT RAISE(ABORT,'Owner cannot be removed'); END;
CREATE TRIGGER IF NOT EXISTS protect_admin_owner_update BEFORE UPDATE OF email,role ON admin_users WHEN OLD.role='owner' BEGIN SELECT RAISE(ABORT,'Owner cannot be changed'); END;
