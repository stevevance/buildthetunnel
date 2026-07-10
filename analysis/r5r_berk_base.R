options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)
sp <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/6e0b7613-ef07-4179-a534-a79296ea074e/scratchpad"
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")
o <- data.frame(id="berkeley", lon=-87.915301, lat=41.896048)
d <- data.frame(id="auburn79", lon=-87.639446, lat=41.750814)
net <- build_network(file.path(sp, "r5r_data"))
it <- detailed_itineraries(net, origins=o, destinations=d, mode=c("TRANSIT","WALK"),
        departure_datetime=dep, max_walk_time=20, max_trip_duration=240,
        shortest_path=FALSE, progress=FALSE)
dt <- as.data.table(it)
fwrite(dt[, .(option, departure_time, total_duration, segment, mode, route, segment_duration, wait)],
       file.path(sp, "berk_auburn_baseline20.csv"))
print(dt[, .(option, departure_time, total_duration, segment, mode, route, segment_duration, wait)])
