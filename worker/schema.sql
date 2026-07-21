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
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at   TEXT NOT NULL,
  message      TEXT NOT NULL,
  email        TEXT,
  trip         TEXT,
  user_agent   TEXT,
  addressed_at TEXT,   -- when the feedback was acted on (NULL = still open)
  resolution   TEXT    -- how it was addressed (commit / note)
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
  cid          TEXT,      -- anonymous random client id (localStorage UUID),
                          -- to estimate distinct visitors and trips-per-person
  source       TEXT,      -- how the trip was initiated: predefined | permalink | search
  result       TEXT,      -- ok | no_route | out_of_county | geocode_notfound | geocode_error
  transfers_today    INTEGER,  -- transfers on the "today" trip (0 = one-seat)
  transfers_scenario INTEGER,  -- transfers on the "with CrossTowner" trip
  x_route      TEXT,      -- CrossTowner tunnel routes used, e.g. "X5" or "X1,X3"
  ttoken       TEXT,      -- random per-trip token, matched by a later share event
  shared       INTEGER,   -- 1 if the user copied this trip's share link
  device       TEXT,      -- coarse device class: mobile | tablet | desktop
  ref_host     TEXT,      -- referring host on landing, or 'direct' / 'internal'
  utm_source   TEXT,      -- campaign tags from the landing URL (?utm_*)
  utm_medium   TEXT,
  utm_campaign TEXT
  -- "Trip made possible" is derivable: result='ok' AND today_min IS NULL
  --   AND scenario_min IS NOT NULL.
);
