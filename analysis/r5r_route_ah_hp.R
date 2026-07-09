# Route Arlington Heights -> Hyde Park on BOTH networks with R5:
# baseline (today's CTA+Metra+Pace) and X-routes scenario.
options(java.parameters = "-Xmx12G")
library(r5r)
library(data.table)

sp <- "."  # assemble the r5r data folders (GTFS zips + streets pbf) here; see METHODOLOGY.md
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")
ah <- data.frame(id = "arlington-heights", lon = -87.9836111, lat = 42.0841667)
hp <- data.frame(id = "hyde-park-55th", lon = -87.5875, lat = 41.7933333)

route_on <- function(folder, label) {
  net <- build_network(file.path(sp, folder))
  it <- detailed_itineraries(net, origins = ah, destinations = hp,
                             mode = c("TRANSIT", "WALK"),
                             departure_datetime = dep,
                             max_walk_time = 20,
                             shortest_path = FALSE, progress = FALSE)
  dt <- as.data.table(it)
  dt[, network := label]
  print(dt[, .(network, option, departure_time, total_duration, segment,
               mode, route, segment_duration, wait, distance)])
  fwrite(dt[, .(network, option, departure_time, total_duration, segment,
                mode, route, segment_duration, wait, distance)],
         file.path(sp, paste0("ah_hp_", label, ".csv")))
  rm(net); r5r::stop_r5(); gc()
}

route_on("r5r_data", "baseline")
route_on("r5r_data_xroutes", "xroutes")
cat("done\n")
