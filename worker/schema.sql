-- D1 schema for the CrossTowner planner's advocacy email list.
-- One row per address; re-submissions are ignored (email is the primary key).
CREATE TABLE IF NOT EXISTS emails (
  email      TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  source     TEXT,
  user_agent TEXT
);
