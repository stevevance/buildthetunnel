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

-- Planned-trip log, for ranking the most-searched trips. Stores only the
-- boarding/alighting *station* names (not the address the user typed) plus the
-- two travel times, so no exact location is retained.
CREATE TABLE IF NOT EXISTS trips (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at   TEXT NOT NULL,
  origin       TEXT,      -- boarding station name
  destination  TEXT,      -- alighting station name
  slice        TEXT,      -- departure slice id (e.g. "0800")
  today_min    INTEGER,   -- "today" total travel time, minutes
  scenario_min INTEGER,   -- "with CrossTowner" total travel time, minutes
  cid          TEXT       -- anonymous random client id (localStorage UUID),
                          -- to estimate distinct visitors and trips-per-person
);
