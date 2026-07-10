options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)
sp <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/6e0b7613-ef07-4179-a534-a79296ea074e/scratchpad"
net <- build_network(file.path(sp, "r5r_data"))
it <- detailed_itineraries(net,
  origins=data.frame(id="davis", lon=-87.684631, lat=42.047763),
  destinations=data.frame(id="59th", lon=-87.58863, lat=41.788049),
  mode=c("TRANSIT","WALK"), departure_datetime=as.POSIXct("2026-07-07 08:00:00", tz="America/Chicago"),
  max_walk_time=20, max_trip_duration=180, shortest_path=FALSE, progress=FALSE)
dt <- as.data.table(it)
fwrite(dt[, .(option, departure_time, total_duration, segment, mode, route, segment_duration, wait)],
       file.path(sp, "davis59_baseline.csv"))
