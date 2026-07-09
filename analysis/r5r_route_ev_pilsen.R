# Route Evanston Main St -> Halsted/18th (Pilsen) on both networks.
options(java.parameters = "-Xmx12G")
library(r5r)
library(data.table)

sp <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/6e0b7613-ef07-4179-a534-a79296ea074e/scratchpad"
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")
ev <- data.frame(id = "evanston-main", lon = -87.680254, lat = 42.033421)
pi <- data.frame(id = "halsted-pilsen", lon = -87.647038, lat = 41.860420)

route_on <- function(folder, label) {
  net <- build_network(file.path(sp, folder))
  it <- detailed_itineraries(net, origins = ev, destinations = pi,
                             mode = c("TRANSIT", "WALK"),
                             departure_datetime = dep,
                             max_walk_time = 20,
                             shortest_path = FALSE, progress = FALSE)
  dt <- as.data.table(it)
  dt[, network := label]
  print(dt[, .(network, option, departure_time, total_duration, segment,
               mode, route, segment_duration, wait)])
  fwrite(dt[, .(network, option, departure_time, total_duration, segment,
                mode, route, segment_duration, wait)],
         file.path(sp, paste0("ev_pilsen_", label, ".csv")))
  rm(net); r5r::stop_r5(); gc()
}

route_on("r5r_data", "baseline")
route_on("r5r_data_xroutes", "xroutes")
cat("done\n")
