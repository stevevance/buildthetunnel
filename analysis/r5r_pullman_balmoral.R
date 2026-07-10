options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)
sp <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/6e0b7613-ef07-4179-a534-a79296ea074e/scratchpad"
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")
o <- data.frame(id="pullman", lon=-87.610474, lat=41.692751)   # 111th (Pullman) ME
d <- data.frame(id="rosemont-balmoral", lon=-87.873759, lat=41.976019)  # X5 station
for (f in c("r5r_data","r5r_data_xroutes")) {
  net <- build_network(file.path(sp, f))
  it <- detailed_itineraries(net, origins=o, destinations=d, mode=c("TRANSIT","WALK"),
        departure_datetime=dep, max_walk_time=25, max_trip_duration=180, walk_speed=4.43,
        shortest_path=FALSE, progress=FALSE)
  dt <- as.data.table(it)
  lab <- if (f=="r5r_data") "today" else "scenario"
  fwrite(dt[, .(option, departure_time, total_duration, segment, mode, route, segment_duration, wait)],
         file.path(sp, paste0("pullman_balmoral_", lab, ".csv")))
  rm(net); r5r::stop_r5(); gc()
}
cat("done\n")
