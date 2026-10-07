PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS events (
 id TEXT PRIMARY KEY,title TEXT NOT NULL,kind TEXT NOT NULL,start_date TEXT NOT NULL,end_date TEXT NOT NULL,
 time_text TEXT NOT NULL DEFAULT '',start_time TEXT NOT NULL DEFAULT '',end_time TEXT NOT NULL DEFAULT '',
 mode TEXT NOT NULL,region TEXT NOT NULL DEFAULT '',location TEXT NOT NULL DEFAULT '',description TEXT NOT NULL,
 poster TEXT NOT NULL DEFAULT '',photos TEXT NOT NULL DEFAULT '[]',registration_url TEXT NOT NULL DEFAULT '',
 revision INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_kind_end ON events(kind,end_date);
CREATE TABLE IF NOT EXISTS registrations (
 id TEXT PRIMARY KEY,request_id TEXT UNIQUE NOT NULL,event_id TEXT REFERENCES events(id),name TEXT NOT NULL,
 phone TEXT NOT NULL,line_id TEXT NOT NULL,city TEXT NOT NULL,status TEXT NOT NULL DEFAULT '待聯繫',
 created_at TEXT NOT NULL,sheet_state TEXT NOT NULL DEFAULT 'pending',sheet_error TEXT NOT NULL DEFAULT '',sheet_synced_at INTEGER
);
CREATE INDEX IF NOT EXISTS registrations_created ON registrations(created_at DESC);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS rate_limits(bucket TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);

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
