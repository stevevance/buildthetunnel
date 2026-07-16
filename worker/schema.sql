-- D1 schema for the CrossTowner planner's advocacy email list.
-- One row per address; re-submissions are ignored (email is the primary key).
CREATE TABLE IF NOT EXISTS emails (
  email      TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  source     TEXT,
  user_agent TEXT
);

-- Feedback submissions. `trip` captures the trip the user was viewing (its share
-- params) so a comment has context; `email` is optional for follow-up.
CREATE TABLE IF NOT EXISTS feedback (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  message    TEXT NOT NULL,
  email      TEXT,
  trip       TEXT,
  user_agent TEXT
);
