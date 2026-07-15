#!/usr/bin/env Rscript
#
# precompute_detailed.R -- Rebuild the trip-planner matrix from full
# detailed_itineraries, which fixes two things the fast expanded-matrix build
# got wrong:
#
#  (1) LABEL/TIME CONSISTENCY. The old build took the trip TIME from
#      travel_time_matrix (median over a 30-min window) but the ROUTE LABEL
#      from a separate expanded_travel_time_matrix (a single departure minute).
#      Those two can pick different paths, so a trip could show 99 min but be
#      labelled with the wrong line (e.g. "BNSF" when the 99-min path rides the
#      X5). Here the time and the route come from the SAME chosen itinerary.
#
#  (2) X-ROUTE PREFERENCE. Among all itinerary options within PREFER_TOL minutes
#      of the fastest, we pick the one that spends the most time on a CrossTowner
#      X-route (tiebreak: fewest transfers, then fastest). So a one- or two-seat
#      CrossTowner ride wins over a marginally-faster all-bus trip. Applied only
#      to the scenario network (today has no X-routes). If no near-fastest option
#      uses an X-route, the plain fastest option is kept.
#
# Output shards match the frontend contract: web/data (planner/data) matrix
# shards of { dest_id: { m: minutes, r: "X5|330", x: xfers } }.
#
# Usage:  Rscript analysis/precompute_detailed.R [network] [slice]
#   e.g.  Rscript analysis/precompute_detailed.R scenario 0800
#         (no args = all networks x all slices)

options(java.parameters = "-Xmx12G")
suppressMessages({library(r5r); library(data.table); library(jsonlite)})

STATIONS <- "planner/data/stations.json"
NET_DIR  <- "analysis/networks"
OUT_ROOT <- "planner/data/matrix"
# Output label -> routing folder. scenario = today + X-routes + Red Line Ext.
NETS <- c(today="today", scenario="scenario_rle")
SLICES <- c("0800"="2026-07-07 08:00:00","1200"="2026-07-07 12:00:00",
            "1800"="2026-07-07 18:00:00")
WALK_SPEED <- 4.43; MAX_WALK <- 20; MAX_TRIP <- 180
# Single-departure window: detailed_itineraries with shortest_path=FALSE over a
# 30-min window computes every Pareto option for EVERY departure minute x every
# destination -- far too slow at 401x401. A 1-minute window gives the option set
# at one representative departure (enough to re-rank for the X-route preference)
# ~20-30x faster. Time and route then both come from that same chosen option.
TIME_WINDOW <- 1
PREFER_TOL  <- 12          # minutes; how much longer an X-route trip may be and still win
TRANSIT <- c("RAIL","SUBWAY","BUS","TRAM","FERRY","CABLE_CAR","GONDOLA","FUNICULAR")
is_xroute <- function(r) grepl("^X[1-6]$", r)

st  <- as.data.table(fromJSON(STATIONS))
pts <- data.frame(id=st$id, lat=st$lat, lon=st$lon)

args <- commandArgs(trailingOnly=TRUE)
combos <- if (length(args)==2) {
  list(list(nl=args[1], sl=args[2]))
} else {
  unlist(lapply(names(NETS), function(n) lapply(names(SLICES),
         function(s) list(nl=n, sl=s))), recursive=FALSE)
}

# Choose the best itinerary for one origin->dest option set, honouring the
# X-route preference on the scenario network.
choose_option <- function(d, prefer_x) {
  best <- d[, .(total=total_duration[1]), by=option]
  fastest <- min(best$total)
  legs_by_opt <- d[mode %in% TRANSIT, .(
      xmin = sum(segment_duration[is_xroute(route)]),
      nrides = .N,
      routes = paste(route, collapse="|")), by=option]
  cand <- merge(best, legs_by_opt, by="option", all.x=TRUE)
  cand[is.na(routes), `:=`(routes="", xmin=0, nrides=0)]
  if (prefer_x) {
    near <- cand[total <= fastest + PREFER_TOL & xmin > 0]
    if (nrow(near)) {
      setorder(near, -xmin, nrides, total)   # most X-time, then fewest rides, then fastest
      return(near[1])
    }
  }
  setorder(cand, total)
  cand[1]
}

for (cb in combos) {
  net <- build_network(file.path(NET_DIR, NETS[[cb$nl]]))
  dep <- as.POSIXct(SLICES[[cb$sl]], tz="America/Chicago")
  prefer_x <- (cb$nl == "scenario")
  out_dir <- file.path(OUT_ROOT, cb$nl, cb$sl)
  dir.create(out_dir, recursive=TRUE, showWarnings=FALSE)
  cat(sprintf("== %s %s (prefer_x=%s): %d origins ==\n", cb$nl, cb$sl, prefer_x, nrow(pts)))
  t0 <- Sys.time()
  for (i in seq_len(nrow(pts))) {
    it <- tryCatch(detailed_itineraries(net, origins=pts[i,], destinations=pts,
        mode=c("TRANSIT","WALK"), departure_datetime=dep, time_window=TIME_WINDOW,
        max_walk_time=MAX_WALK, walk_speed=WALK_SPEED, max_trip_duration=MAX_TRIP,
        shortest_path=FALSE, progress=FALSE), error=function(e) NULL)
    if (is.null(it) || nrow(it)==0) next
    dt <- as.data.table(it)
    obj <- list()
    for (did in unique(dt$to_id)) {
      ch <- choose_option(dt[to_id==did], prefer_x)
      cell <- list(m = as.integer(round(ch$total)))
      if (nzchar(ch$routes)) { cell$r <- ch$routes; cell$x <- max(ch$nrides-1L,0L) }
      obj[[did]] <- cell
    }
    write_json(obj, file.path(out_dir, paste0(pts$id[i], ".json")), auto_unbox=TRUE)
    if (i %% 25 == 0) {
      el <- as.numeric(difftime(Sys.time(), t0, units="mins"))
      cat(sprintf("  %d/%d origins  (%.1f min elapsed, ~%.0f min total)\n",
          i, nrow(pts), el, el/i*nrow(pts)))
    }
  }
  r5r::stop_r5(); gc()
  cat(sprintf("== done %s %s in %.1f min ==\n", cb$nl, cb$sl,
      as.numeric(difftime(Sys.time(), t0, units="mins"))))
}
cat("detailed precompute complete.\n")
