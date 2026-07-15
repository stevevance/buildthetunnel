#!/usr/bin/env Rscript
#
# precompute_expanded.R -- Rebuild the trip-planner matrix using
# expanded_travel_time_matrix, which is the right tool for this job:
#
#  * It samples EVERY departure minute across a 30-minute window, so it reliably
#    catches services that run every 30 min (the CrossTowner X-routes). A single
#    departure (time_window=1) misses them most of the time.
#  * It returns, per departure, both the total time AND the route sequence, so
#    the displayed TIME and ROUTE come from the same data -- fixing the old bug
#    where the time was from travel_time_matrix and the label from a different
#    call (which showed "M Line" on a trip that actually rides the X5).
#  * Per-origin it is tiny/fast (~0.5 s/origin), so a full rebuild of all
#    networks x slices is minutes, not hours. (All-pairs at once OOMs; we loop
#    per origin.)
#
# Selection per origin->dest:
#   - group the 30 departures by their route string; each group's time = median.
#   - baseline = the fastest group's median time.
#   - X-PREFERENCE (scenario only): among groups that use a CrossTowner X-route
#     AND whose median is within PREFER_TOL minutes of the baseline, pick the
#     fastest. Otherwise pick the fastest group overall.
#   - store { m: chosen median minutes, r: "X5|330", x: transfers }.
#
# Output overwrites the frontend shards: planner/data/matrix/<net>/<slice>/<oid>.json
#
# Usage:  Rscript analysis/precompute_expanded.R [network] [slice]
#         (no args = all networks x all slices)

options(java.parameters = "-Xmx12G")
suppressMessages({library(r5r); library(data.table); library(jsonlite)})

STATIONS <- "planner/data/stations.json"
NET_DIR  <- "analysis/networks"
OUT_ROOT <- "planner/data/matrix"
NETS <- c(today="today", scenario="scenario_rle")   # scenario = today + X-routes + RLE
SLICES <- c("0800"="2026-07-07 08:00:00","1200"="2026-07-07 12:00:00",
            "1800"="2026-07-07 18:00:00")
WALK_SPEED <- 4.43; MAX_WALK <- 20; MAX_TRIP <- 180
TIME_WINDOW <- 30
PREFER_TOL  <- 12          # an X-route trip may be up to this many min slower and still win

st  <- as.data.table(fromJSON(STATIONS))
pts <- data.frame(id=st$id, lat=st$lat, lon=st$lon)

args <- commandArgs(trailingOnly=TRUE)
combos <- if (length(args)==2) {
  list(list(nl=args[1], sl=args[2]))
} else {
  unlist(lapply(names(NETS), function(n) lapply(names(SLICES),
         function(s) list(nl=n, sl=s))), recursive=FALSE)
}

# Clean a route string: drop "[WALK]"/blank tokens, return transit sequence + count.
clean_routes <- function(r) {
  toks <- strsplit(r, "|", fixed=TRUE)[[1]]
  toks <- toks[toks != "" & toks != "[WALK]" & toks != "WALK"]
  list(seq = paste(toks, collapse="|"), n = length(toks))
}
has_x <- function(r) grepl("(^|\\|)X[1-6]($|\\|)", r)

for (cb in combos) {
  net <- build_network(file.path(NET_DIR, NETS[[cb$nl]]))
  dep <- as.POSIXct(SLICES[[cb$sl]], tz="America/Chicago")
  prefer_x <- (cb$nl == "scenario")
  out_dir <- file.path(OUT_ROOT, cb$nl, cb$sl)
  dir.create(out_dir, recursive=TRUE, showWarnings=FALSE)
  cat(sprintf("== %s %s (prefer_x=%s): %d origins ==\n", cb$nl, cb$sl, prefer_x, nrow(pts)))
  t0 <- Sys.time()
  for (i in seq_len(nrow(pts))) {
    m <- tryCatch(expanded_travel_time_matrix(net, origins=pts[i,], destinations=pts,
        mode=c("TRANSIT","WALK"), departure_datetime=dep, time_window=TIME_WINDOW,
        max_walk_time=MAX_WALK, walk_speed=WALK_SPEED, max_trip_duration=MAX_TRIP,
        progress=FALSE), error=function(e) NULL)
    if (is.null(m)) next
    dt <- as.data.table(m)
    tcol <- grep("travel_time|total_time", names(dt), value=TRUE)[1]
    setnames(dt, tcol, "tt")
    dt <- dt[!is.na(tt) & to_id != from_id]
    if (!nrow(dt)) next
    obj <- list()
    for (did in unique(dt$to_id)) {
      d <- dt[to_id==did]
      # group departures by route string
      g <- d[, .(med=as.numeric(median(tt)), n=.N), by=routes]
      g[, isx := has_x(routes)]
      baseline <- min(g$med)
      xcand <- g[isx==TRUE & med <= baseline + PREFER_TOL]
      chosen <- if (prefer_x && nrow(xcand)) xcand[order(med)][1] else g[order(med)][1]
      cr <- clean_routes(chosen$routes)
      cell <- list(m = as.integer(round(chosen$med)))
      if (nzchar(cr$seq)) { cell$r <- cr$seq; cell$x <- max(cr$n - 1L, 0L) }
      obj[[did]] <- cell
    }
    write_json(obj, file.path(out_dir, paste0(pts$id[i], ".json")), auto_unbox=TRUE)
    if (i %% 100 == 0) cat(sprintf("  %d/%d (%.1f min)\n", i, nrow(pts),
        as.numeric(difftime(Sys.time(),t0,units="mins"))))
  }
  r5r::stop_r5(); gc()
  cat(sprintf("== done %s %s in %.1f min ==\n", cb$nl, cb$sl,
      as.numeric(difftime(Sys.time(),t0,units="mins"))))
}
# Refresh manifest detail flag.
mpath <- file.path(OUT_ROOT, "manifest.json")
if (file.exists(mpath)) { mm <- fromJSON(mpath); mm$detail <- "times+routes (expanded, X-preferred)"
  write_json(mm, mpath, auto_unbox=TRUE, pretty=TRUE) }
cat("expanded precompute complete.\n")
