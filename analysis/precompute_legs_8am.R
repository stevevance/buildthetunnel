#!/usr/bin/env Rscript
#
# precompute_legs_8am.R -- Rebuild the trip-planner matrix WITH leg-by-leg
# detail (board/alight stations, ride + wait per leg), for a single weekday
# 8:00 AM departure.
#
# Why single-departure: detailed_itineraries (the only routing that yields
# per-leg geometry, hence station names) is far too slow to sweep a 30-minute
# window over all pairs (~9 hr/network). A single departure at 8:00 -- "the
# first/best trip if you leave at 8:00", waiting for the next train included --
# is one itinerary per pair, which is workable, and it's the intuitive number.
# Only the 8:00 slice is built (per request); 12:00/18:00 are dropped.
#
# For each origin->dest we take all Pareto options at the 8:00 departure, apply
# the CrossTowner X-route preference (scenario only: among options within
# PREFER_TOL min of fastest, pick the one using X-routes most), then read the
# chosen itinerary's transit legs. Each leg's board/alight station is the
# nearest station to that segment's first/last geometry coordinate.
#
# Output cell: { m, r, x, legs: [ {mode, line, from, to, ride, wait}, ... ] },
# with walking kept as its own leg: { mode:"WALK", ride }.
#
# Usage:  Rscript analysis/precompute_legs_8am.R [network]   (default: both)
#   LEGS_ORIGINS=3 LEGS_OUT=/tmp/m Rscript ...   (smoke test: first N origins
#   into an alternate output root, leaving planner/data/matrix untouched)

options(java.parameters = "-Xmx12G")
suppressMessages({library(r5r); library(data.table); library(jsonlite); library(sf)})

STATIONS <- "planner/data/stations.json"
NET_DIR  <- "analysis/networks"
OUT_ROOT <- Sys.getenv("LEGS_OUT", "planner/data/matrix")
N_ORIGINS <- suppressWarnings(as.integer(Sys.getenv("LEGS_ORIGINS", "")))
RESUME <- nzchar(Sys.getenv("LEGS_RESUME"))   # skip origins already written (restart a killed run)
NETS  <- c(today="today", scenario="scenario_rle")
SLICE <- "0800"; DEP <- "2026-07-07 08:00:00"
WALK_SPEED <- 4.43; MAX_WALK <- 20; MAX_TRIP <- 180; PREFER_TOL <- 12
TRANSIT <- c("RAIL","SUBWAY","BUS","TRAM","FERRY","CABLE_CAR","GONDOLA","FUNICULAR")
is_x <- function(r) grepl("^X[1-6]$", r)

st  <- as.data.table(fromJSON(STATIONS))
pts <- data.frame(id=st$id, lat=st$lat, lon=st$lon)
slat <- st$lat; slon <- st$lon; sname <- st$name
# Nearest station to a lon/lat (squared metric with deg->km scaling; fine for snapping).
nearest <- function(lat, lon) sname[which.min((slat-lat)^2*12321 + (slon-lon)^2*7225)]

args <- commandArgs(trailingOnly=TRUE)
nets_to_do <- if (length(args) >= 1) args[1] else names(NETS)

for (nl in nets_to_do) {
  net <- build_network(file.path(NET_DIR, NETS[[nl]]))
  dep <- as.POSIXct(DEP, tz="America/Chicago")
  prefer_x <- (nl == "scenario")
  out_dir <- file.path(OUT_ROOT, nl, SLICE)
  dir.create(out_dir, recursive=TRUE, showWarnings=FALSE)
  cat(sprintf("== %s %s legs (prefer_x=%s): %d origins ==\n", nl, SLICE, prefer_x, nrow(pts)))
  t0 <- Sys.time()
  n_do <- if (is.na(N_ORIGINS)) nrow(pts) else min(N_ORIGINS, nrow(pts))
  for (i in seq_len(n_do)) {
    shard <- file.path(out_dir, paste0(pts$id[i], ".json"))
    if (RESUME && file.exists(shard)) next
    it <- tryCatch(detailed_itineraries(net, origins=pts[i,], destinations=pts,
        mode=c("TRANSIT","WALK"), departure_datetime=dep, time_window=1,
        max_walk_time=MAX_WALK, walk_speed=WALK_SPEED, max_trip_duration=MAX_TRIP,
        shortest_path=FALSE, progress=FALSE), error=function(e) NULL)
    if (is.null(it) || nrow(it)==0) next
    geoms <- sf::st_geometry(it)
    dt <- as.data.table(sf::st_drop_geometry(it)); dt[, ridx := .I]
    obj <- list()
    for (did in unique(dt$to_id)) {
      d <- dt[to_id==did]
      # summarize each option: total time, X-route minutes, route sequence
      opts <- d[, .(total=total_duration[1]), by=option]
      summ <- d[mode %in% TRANSIT, .(xmin=sum(segment_duration[is_x(route)]),
                routes=paste(route, collapse="|"), nrides=.N), by=option]
      cand <- merge(opts, summ, by="option", all.x=TRUE)
      cand[is.na(routes), `:=`(routes="", xmin=0, nrides=0)]
      fastest <- min(cand$total)
      chosen <- if (prefer_x) {
        near <- cand[total <= fastest + PREFER_TOL & xmin > 0][order(-xmin, nrides, total)]
        if (nrow(near)) near$option[1] else cand[order(total)]$option[1]
      } else cand[order(total)]$option[1]
      # read the chosen option's transit legs (with board/alight stations)
      seg <- d[option==chosen]
      # Keep the WALK segments as legs of their own. `m` is the whole trip
      # between the two station points, so it already contains R5's walk to the
      # boarding stop, any transfer walk, and the walk off at the far end;
      # dropping them left the planner able to see that time but not say where
      # it went, and its own straight-line guess never added up to `m`.
      legs <- list(); nride <- 0L
      for (k in seq_len(nrow(seg))) {
        if (seg$mode[k] == "WALK") {
          w <- as.integer(round(seg$segment_duration[k]))
          if (w > 0) legs[[length(legs)+1]] <- list(mode="WALK", ride=w)
          next
        }
        if (!(seg$mode[k] %in% TRANSIT)) next
        co <- sf::st_coordinates(geoms[[seg$ridx[k]]])
        legs[[length(legs)+1]] <- list(
          mode = seg$mode[k], line = seg$route[k],
          from = nearest(co[1,2], co[1,1]),
          to   = nearest(co[nrow(co),2], co[nrow(co),1]),
          ride = as.integer(round(seg$segment_duration[k])),
          wait = as.integer(round(seg$wait[k])))
        nride <- nride + 1L
      }
      crow <- cand[option==chosen]
      cell <- list(m = as.integer(round(crow$total)))
      # x counts transfers between vehicles, so it stays a transit-leg count.
      if (nride) { cell$r <- crow$routes; cell$x <- max(nride-1L, 0L); cell$legs <- legs }
      obj[[did]] <- cell
    }
    write_json(obj, shard, auto_unbox=TRUE)
    if (i %% 50 == 0) cat(sprintf("  %d/%d (%.1f min)\n", i, nrow(pts),
        as.numeric(difftime(Sys.time(), t0, units="mins"))))
  }
  r5r::stop_r5(); gc()
  cat(sprintf("== done %s in %.1f min ==\n", nl, as.numeric(difftime(Sys.time(), t0, units="mins"))))
}
# Refresh manifest: single slice, legs available.
mpath <- file.path(OUT_ROOT, "manifest.json")
if (file.exists(mpath)) { mm <- fromJSON(mpath)
  mm$slices <- "0800"; mm$slice_times <- DEP; mm$detail <- "times+routes+legs (8am departure)"
  write_json(mm, mpath, auto_unbox=TRUE, pretty=TRUE) }
cat("legs precompute complete.\n")
