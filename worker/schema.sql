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
  utm_campaign TEXT,
  -- Failure diagnostics (result='no_route' only), to map unmet demand:
  fail_reason  TEXT,      -- origin_no_station | dest_no_station | both_no_station (coverage gaps)
                          --   | route_data_missing (a station's precomputed times failed to load — a data/fetch bug)
                          --   | pair_unreachable (data loaded but no connecting path — rare)
  origin_walk_min INTEGER, -- walk minutes to the nearest station at the origin (may exceed the walk cap)
  dest_walk_min   INTEGER, -- walk minutes to the nearest station at the destination
  origin_typed TEXT,      -- the place the user typed at the origin — failed searches ONLY
  dest_typed   TEXT,      -- the place the user typed at the destination — failed searches ONLY
  origin_lat   REAL,      -- geocoded origin coordinates — failed searches ONLY
  origin_lon   REAL,
  dest_lat     REAL,      -- geocoded destination coordinates — failed searches ONLY
  dest_lon     REAL
  -- On a no_route row, origin/destination hold the NEAREST station name to each
  -- end (not a boarded station) so coverage gaps localize to real places; the
  -- *_typed and *_lat/*_lon columns keep the raw place and its coordinates so
  -- unmet demand shows and maps where people wanted to go. A successful trip
  -- stores none of these — stations only, never the typed place or coordinates.
  -- "Trip made possible" is derivable: result='ok' AND today_min IS NULL
  --   AND scenario_min IS NOT NULL.
);
