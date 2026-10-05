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
