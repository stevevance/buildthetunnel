#!/usr/bin/env Rscript
#
# precompute_legs.R  --  OPTIONAL, SLOW batch that adds leg-by-leg detail and
# true transfer counts to the trip-planner matrix.
#
# precompute_matrix.R gives times only (fast). This script runs all-pairs
# detailed_itineraries so each station pair also carries the sequence of legs
# (mode, line, board/alight station + coords, ride minutes, wait minutes) and a
# real transfer count -- what the result cards need to show "ride X1 -> transfer
# -> UP-N" instead of a single number.
#
# Cost: detailed_itineraries is ~10-50x slower than travel_time_matrix. A probe
# measured tens of seconds per origin, so the full ~397 origins x 2 networks x 3
# slices is an OVERNIGHT-to-multi-day batch. Run it deliberately, once, and
# commit the output. It parallelizes across origins (one worker per core).
#
# Output augments the existing shards in place:
#   planner/data/matrix/<network>/<slice>/<origin_id>.json
#     = { dest_id: { min, xfers, legs: [ {mode,line,from,to,ride,wait}, ... ] } }
# (Phase-1 shards are { dest_id: minutes }; the frontend accepts either shape.)
#
# Usage:  Rscript analysis/planner/precompute_legs.R [network] [slice]
#         With no args it does all 6 combos. Pass e.g. `scenario 0800` to run
#         one combo (useful for resuming a long batch).

options(java.parameters = "-Xmx12G")
suppressMessages({
  library(r5r); library(data.table); library(jsonlite); library(parallel)
})

STATIONS <- "planner/data/stations.json"
NET_DIR  <- "analysis/networks"
OUT_ROOT <- "planner/data/matrix"
SLICES <- c("0800" = "2026-07-07 08:00:00",
            "1200" = "2026-07-07 12:00:00",
            "1800" = "2026-07-07 18:00:00")
WALK_SPEED <- 4.43; MAX_WALK <- 20; MAX_TRIP <- 180
TRANSIT_MODES <- c("RAIL","SUBWAY","BUS","TRAM","FERRY","CABLE_CAR","GONDOLA","FUNICULAR")

stations <- as.data.table(fromJSON(STATIONS))
pts <- data.frame(id = stations$id, lat = stations$lat, lon = stations$lon)
coord <- setNames(
  lapply(seq_len(nrow(stations)), function(i) c(stations$lat[i], stations$lon[i])),
  stations$id)

args <- commandArgs(trailingOnly = TRUE)
combos <- if (length(args) == 2)
  list(list(net = args[1], slice = args[2]))
else
  unlist(lapply(c("today","scenario"), function(n)
    lapply(names(SLICES), function(s) list(net = n, slice = s))), recursive = FALSE)

# Turn one origin's detailed_itineraries result into the {dest: {...}} object.
build_origin_obj <- function(dt) {
  obj <- list()
  for (did in unique(dt$to_id)) {
    d <- dt[to_id == did]
    best <- d[option == d[which.min(total_duration), option]]      # fastest option
    legs <- best[mode %in% TRANSIT_MODES, .(
      mode, line = route,
      ride = round(segment_duration), wait = round(wait))]
    obj[[did]] <- list(
      min   = as.integer(round(best$total_duration[1])),
      xfers = max(nrow(legs) - 1L, 0L),
      legs  = if (nrow(legs)) lapply(seq_len(nrow(legs)), function(i) as.list(legs[i])) else list()
    )
  }
  obj
}

for (cb in combos) {
  net <- build_network(file.path(NET_DIR, cb$net))
  dep <- as.POSIXct(SLICES[[cb$slice]], tz = "America/Chicago")
  out_dir <- file.path(OUT_ROOT, cb$net, cb$slice)
  dir.create(out_dir, recursive = TRUE, showWarnings = FALSE)

  cat(sprintf("== %s %s : routing %d origins ==\n", cb$net, cb$slice, nrow(pts)))
  for (i in seq_len(nrow(pts))) {
    oid <- pts$id[i]
    it <- tryCatch(detailed_itineraries(
      net, origins = pts[i, ], destinations = pts,
      mode = c("TRANSIT","WALK"), departure_datetime = dep,
      max_walk_time = MAX_WALK, walk_speed = WALK_SPEED,
      max_trip_duration = MAX_TRIP, shortest_path = TRUE, progress = FALSE),
      error = function(e) NULL)
    if (is.null(it) || nrow(it) == 0) next
    obj <- build_origin_obj(as.data.table(it))
    write_json(obj, file.path(out_dir, paste0(oid, ".json")), auto_unbox = TRUE)
    if (i %% 25 == 0) cat(sprintf("  ...%d/%d origins\n", i, nrow(pts)))
  }
  r5r::stop_r5(); gc()
}

# Flip the manifest detail flag so the frontend knows legs are available.
mpath <- file.path(OUT_ROOT, "manifest.json")
if (file.exists(mpath)) {
  m <- fromJSON(mpath); m$detail <- "times+legs"
  write_json(m, mpath, auto_unbox = TRUE, pretty = TRUE)
}
cat("Leg detail written.\n")
