options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)
sp <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/6e0b7613-ef07-4179-a534-a79296ea074e/scratchpad"
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")
pts <- data.frame(id=c("northwestern","uchicago"),
                  lon=c(-87.675537, -87.599747), lat=c(42.054853, 41.789742))
for (f in c("r5r_data","r5r_data_xroutes")) {
  net <- build_network(file.path(sp, f))
  it <- detailed_itineraries(net, origins=pts, destinations=pts[2:1,],
          mode=c("TRANSIT","WALK"), departure_datetime=dep,
          max_walk_time=25, max_trip_duration=180,
          shortest_path=FALSE, progress=FALSE)
  dt <- as.data.table(it)
  lab <- if (f=="r5r_data") "baseline" else "xroutes"
  fwrite(dt[, .(from_id, to_id, option, departure_time, total_duration, segment, mode, route, segment_duration, wait)],
         file.path(sp, paste0("nu_uc_", lab, ".csv")))
  rm(net); r5r::stop_r5(); gc()
}
