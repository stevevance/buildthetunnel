options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)
sp <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/6e0b7613-ef07-4179-a534-a79296ea074e/scratchpad"
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")
WS <- 4.43  # km/h = 2.75 mph

pairs <- list(
 ah_hp    = list(o=c(-87.9836111,42.0841667), d=c(-87.5875,41.7933333)),
 ev_pil   = list(o=c(-87.680254,42.033421),   d=c(-87.647038,41.860420)),
 bev_oh   = list(o=c(-87.6672222,41.7213889), d=c(-87.904444,41.977800)),
 dg_oh    = list(o=c(-88.009758,41.795312),   d=c(-87.904444,41.977800)),
 nap_oh   = list(o=c(-88.1455556,41.7797222), d=c(-87.904444,41.977800)),
 berk_123 = list(o=c(-87.915301,41.896048),   d=c(-87.673645,41.669995)),
 nu_uc    = list(o=c(-87.684631,42.047763),   d=c(-87.58863,41.788049)),
 tinley_lb= list(o=c(-87.7827778,41.5758333), d=c(-87.8466667,42.2797222))
)
run <- function(folder, lab) {
  net <- build_network(file.path(sp, folder))
  for (nm in names(pairs)) {
    p <- pairs[[nm]]
    it <- detailed_itineraries(net,
      origins=data.frame(id="o",lon=p$o[1],lat=p$o[2]),
      destinations=data.frame(id="d",lon=p$d[1],lat=p$d[2]),
      mode=c("TRANSIT","WALK"), departure_datetime=dep,
      max_walk_time=25, max_trip_duration=240, walk_speed=WS,
      shortest_path=FALSE, progress=FALSE)
    dt <- as.data.table(it)
    fwrite(dt[, .(option, departure_time, total_duration, segment, mode, route, segment_duration, wait)],
           file.path(sp, sprintf("ws275_%s_%s.csv", nm, lab)))
  }
  rm(net); r5r::stop_r5(); gc()
}
run("r5r_data", "base")
run("r5r_data_xroutes", "xr")
cat("done\n")
