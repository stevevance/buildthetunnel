# 71st/Exchange (Metra Electric South Shore) -> Chicago Botanic Garden, today
# vs the CrossTowner scenario. Midday (10:00) departure, since the Botanic
# Garden is a leisure destination. Run from analysis/ after:
#   bash assemble_networks.sh
options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)
sp <- "networks"
dep <- as.POSIXct("2026-07-07 10:00:00", tz = "America/Chicago")
o <- data.frame(id = "71st-exchange",  lon = -87.5658, lat = 41.7660)  # MED South Shore
d <- data.frame(id = "botanic-garden", lon = -87.7887, lat = 42.1489)  # Chicago Botanic Garden
for (net_name in c("today", "scenario")) {
  net <- build_network(file.path(sp, net_name))
  it <- detailed_itineraries(net, origins = o, destinations = d,
        mode = c("TRANSIT", "WALK"), departure_datetime = dep,
        max_walk_time = 30, max_trip_duration = 240, walk_speed = 4.43,
        shortest_path = FALSE, progress = FALSE)
  dt <- as.data.table(it)
  fwrite(dt[, .(option, departure_time, total_duration, segment, mode, route,
                segment_duration, wait)],
         file.path("results", paste0("botanic_", net_name, ".csv")))
  rm(net); r5r::stop_r5(); gc()
}
cat("done\n")
