#!/usr/bin/env Rscript
#
# merge_median_into_legs.R -- Replace the single-departure travel TIME in the
# leg shards with the 30-minute-window MEDIAN, keeping the leg detail.
#
# Why: a station-to-station matrix computed at a single 8:00 departure gives
# fragile "wait" times -- e.g. you "just miss" the 8:00 train at your local
# station (16-min wait) while an adjacent station catches that same train two
# minutes later (1-min wait). Combined with the client's access walk, that made
# the planner recommend boarding a station 14 min away over the one at your feet.
# The median over a 30-minute window represents a *typical* trip leaving around
# 8:00 (≈ half-headway wait at every station), which is robust to that artifact
# and correctly favours the nearer station.
#
# This keeps the leg detail (board/alight stations, ride times) from the
# detailed single-departure run and only overwrites `m` (the headline/selection
# time) with the median. Fast: expanded_travel_time_matrix per origin (~0.5s).
#
# Usage:  Rscript analysis/merge_median_into_legs.R   (both networks, 0800)

options(java.parameters = "-Xmx12G")
suppressMessages({library(r5r); library(data.table); library(jsonlite)})

STATIONS <- "planner/data/stations.json"
NET_DIR  <- "analysis/networks"
OUT_ROOT <- "planner/data/matrix"
NETS  <- c(today="today", scenario="scenario_rle")
SLICE <- "0800"; DEP <- "2026-07-07 08:00:00"
WALK_SPEED <- 4.43; MAX_WALK <- 20; MAX_TRIP <- 180; TIME_WINDOW <- 30

st  <- as.data.table(fromJSON(STATIONS))
pts <- data.frame(id=st$id, lat=st$lat, lon=st$lon)

for (nl in names(NETS)) {
  net <- build_network(file.path(NET_DIR, NETS[[nl]]))
  dep <- as.POSIXct(DEP, tz="America/Chicago")
  dir_out <- file.path(OUT_ROOT, nl, SLICE)
  cat(sprintf("== %s: median-merge over %d origins ==\n", nl, nrow(pts)))
  t0 <- Sys.time(); updated <- 0L
  for (i in seq_len(nrow(pts))) {
    oid <- pts$id[i]
    shard <- file.path(dir_out, paste0(oid, ".json"))
    if (!file.exists(shard)) next
    m <- as.data.table(expanded_travel_time_matrix(net, origins=pts[i,], destinations=pts,
        mode=c("TRANSIT","WALK"), departure_datetime=dep, time_window=TIME_WINDOW,
        max_walk_time=MAX_WALK, walk_speed=WALK_SPEED, max_trip_duration=MAX_TRIP,
        progress=FALSE))
    tc <- grep("travel_time|total_time", names(m), value=TRUE)[1]; setnames(m, tc, "tt")
    med <- m[!is.na(tt), .(m = as.integer(round(median(tt)))), by=to_id]
    medmap <- setNames(med$m, med$to_id)
    cell <- fromJSON(shard, simplifyVector=FALSE)          # keep legs as-is
    for (did in names(cell)) {
      mv <- medmap[did]                                     # single-bracket: NA if absent
      if (!is.na(mv)) cell[[did]]$m <- as.integer(mv)
    }
    write_json(cell, shard, auto_unbox=TRUE)
    updated <- updated + 1L
    if (i %% 100 == 0) cat(sprintf("  %d/%d (%.1f min)\n", i, nrow(pts),
        as.numeric(difftime(Sys.time(), t0, units="mins"))))
  }
  r5r::stop_r5(); gc()
  cat(sprintf("== %s: updated %d shards in %.1f min ==\n", nl, updated,
      as.numeric(difftime(Sys.time(), t0, units="mins"))))
}
# Manifest: note the time model.
mpath <- file.path(OUT_ROOT, "manifest.json")
if (file.exists(mpath)) { mm <- fromJSON(mpath)
  mm$detail <- "median-time + routes + legs (8am, 30-min window)"
  write_json(mm, mpath, auto_unbox=TRUE, pretty=TRUE) }
cat("median merge complete.\n")
