#!/usr/bin/env Rscript
#
# precompute_matrix.R  --  Precompute the station-to-station travel-time
# matrix for the CrossTowner trip planner (times only; leg detail is a
# separate, much slower batch in precompute_legs.R).
#
# For every combination of network x departure-time slice we run one
# all-pairs travel_time_matrix over the unified station list, then shard the
# result per origin station so the static site fetches only the row it needs.
#
#   networks : today (published CTA/Metra/Pace) and scenario (adds X1-X6)
#   slices   : weekday 08:00, 12:00, 18:00
#
# The matrix is DIRECTIONAL (A->B != B->A because of timetables), so we keep
# the full N x N -- the planner's "swap directions" button is just a reverse
# lookup.
#
# Routing parameters match the rest of the project, EXCEPT the walk cap, which
# is tightened to 20 minutes here (see analysis/METHODOLOGY.md):
#   walk_speed      = 4.43 km/h  (2.75 mph)
#   max_walk_time   = 20 min     (access, egress, and transfer walking)
#   time_window     = 30 min, percentile 50 (median over the window, stable)
#   max_trip_duration = 180 min
#
# Inputs : planner/data/stations.json  (from build_stations.R)
#          analysis/networks/<network>/ (from assemble_networks.sh)
# Output : planner/data/matrix/<network>/<slice>/<origin_id>.json
#              = { dest_id: minutes, ... }   (only reachable dests)
#          planner/data/matrix/manifest.json
#
# Usage  : Rscript analysis/planner/precompute_matrix.R
#          (run from the repo root, after: bash analysis/assemble_networks.sh)

options(java.parameters = "-Xmx12G")   # must precede library(r5r)
suppressMessages({
  library(r5r)
  library(data.table)
  library(jsonlite)
})

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
STATIONS <- "planner/data/stations.json"
NET_DIR  <- "analysis/networks"
OUT_ROOT <- "planner/data/matrix"

# Output label -> routing-network folder under analysis/networks/.
# The "scenario" (future) column routes on scenario_rle, which layers BOTH the
# CrossTowner X-routes AND the under-construction Red Line Extension on top of
# today's service -- so the four new RLE stations are reachable in the future.
NETWORKS <- c(today = "today", scenario = "scenario_rle")
# slice label -> clock time on a representative weekday (Tuesday)
SLICES <- c(
  "0800" = "2026-07-07 08:00:00",
  "1200" = "2026-07-07 12:00:00",
  "1800" = "2026-07-07 18:00:00"
)

WALK_SPEED    <- 4.43   # km/h == 2.75 mph
MAX_WALK      <- 20     # minutes
TIME_WINDOW   <- 30     # minutes
MAX_TRIP      <- 180    # minutes

# ---------------------------------------------------------------------------
# Load the station list as routing points (id, lat, lon).
# ---------------------------------------------------------------------------
stations <- as.data.table(fromJSON(STATIONS))
points   <- data.frame(id = stations$id, lat = stations$lat, lon = stations$lon)
cat(sprintf("Routing %d stations x %d stations, %d networks x %d slices\n",
            nrow(points), nrow(points), length(NETWORKS), length(SLICES)))

dir.create(OUT_ROOT, recursive = TRUE, showWarnings = FALSE)

# ---------------------------------------------------------------------------
# Run one matrix and shard it per origin.
# ---------------------------------------------------------------------------
run_one <- function(net_label, net_folder, slice_label, slice_time) {
  net <- build_network(file.path(NET_DIR, net_folder))
  dep <- as.POSIXct(slice_time, tz = "America/Chicago")

  # (a) Median travel time over a 30-minute window -- the stable headline number.
  m <- travel_time_matrix(
    net, origins = points, destinations = points,
    mode = c("TRANSIT", "WALK"), departure_datetime = dep,
    time_window = TIME_WINDOW, percentiles = 50,
    max_walk_time = MAX_WALK, walk_speed = WALK_SPEED,
    max_trip_duration = MAX_TRIP, progress = FALSE)
  mt <- as.data.table(m)
  setnames(mt, grep("travel_time", names(mt), value = TRUE)[1], "min")
  mt <- mt[!is.na(min)]

  # (b) Route sequence at a single representative departure -- gives the line
  #     names to board and the number of transfers. time_window = 1 keeps this
  #     cheap (a 30-minute window OOMs, storing a path per departure minute).
  e <- expanded_travel_time_matrix(
    net, origins = points, destinations = points,
    mode = c("TRANSIT", "WALK"), departure_datetime = dep, time_window = 1,
    max_walk_time = MAX_WALK, walk_speed = WALK_SPEED,
    max_trip_duration = MAX_TRIP, progress = FALSE)
  et <- as.data.table(e)[!is.na(routes), .(routes = routes[1]),
                         by = .(from_id, to_id)]

  r5r::stop_r5(); gc()

  # Attach the route string to each reachable pair (some may lack one).
  dt <- merge(mt[, .(from_id, to_id, min)], et,
              by = c("from_id", "to_id"), all.x = TRUE)

  out_dir <- file.path(OUT_ROOT, net_label, slice_label)
  dir.create(out_dir, recursive = TRUE, showWarnings = FALSE)

  # One compact JSON object per origin: { dest_id: { m: minutes, r: "ME|X1" } }.
  # r is the pipe-separated route sequence ("[WALK]" for walk-only); the client
  # labels the first token as the boarding line and derives transfers.
  for (oid in unique(dt$from_id)) {
    row <- dt[from_id == oid]
    obj <- setNames(
      lapply(seq_len(nrow(row)), function(i) {
        cell <- list(m = as.integer(round(row$min[i])))
        if (!is.na(row$routes[i])) cell$r <- row$routes[i]
        cell
      }), row$to_id)
    write_json(obj, file.path(out_dir, paste0(oid, ".json")), auto_unbox = TRUE)
  }
  cat(sprintf("  %-9s %s : %d reachable pairs, %d origin shards (net=%s)\n",
              net_label, slice_label, nrow(dt), length(unique(dt$from_id)),
              net_folder))
  nrow(dt)
}

# ---------------------------------------------------------------------------
# Drive all combinations.
# ---------------------------------------------------------------------------
total_pairs <- 0L
for (net_label in names(NETWORKS)) {
  for (i in seq_along(SLICES)) {
    total_pairs <- total_pairs +
      run_one(net_label, NETWORKS[[net_label]], names(SLICES)[i], SLICES[[i]])
  }
}

# ---------------------------------------------------------------------------
# Manifest for the frontend (and for cache-busting on rebuild).
# ---------------------------------------------------------------------------
manifest <- list(
  generated_at   = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
  networks       = names(NETWORKS),
  scenario_note  = "scenario = today + CrossTowner X-routes + Red Line Extension",
  slices         = names(SLICES),
  slice_times    = unname(SLICES),
  station_count  = nrow(points),
  walk_speed_kmh = WALK_SPEED,
  max_walk_min   = MAX_WALK,
  detail         = "times+routes"  # median time + boarding-route sequence
)
write_json(manifest, file.path(OUT_ROOT, "manifest.json"),
           auto_unbox = TRUE, pretty = TRUE)

cat(sprintf("Done. %d total reachable pairs across all combos. Manifest written.\n",
            total_pairs))
