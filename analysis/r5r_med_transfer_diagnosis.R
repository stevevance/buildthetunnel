# Diagnose why the Metra Electric -> UP-N option for South Shore (71st/Exchange)
# -> Braeside is slow at midday: is it (a) sparse MED South Chicago headways or
# (b) the Millennium -> Ogilvie downtown transfer walk?
# Prints every itinerary option leg-by-leg, plus the isolated transfer walk.
# Run from analysis/ after: bash assemble_networks.sh
options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)

net <- build_network("networks/today")
dep <- as.POSIXct("2026-07-07 10:00:00", tz = "America/Chicago")  # midday Tue

o  <- data.frame(id = "71st-exchange", lat = 41.7660, lon = -87.5658)  # MED South Chicago
d  <- data.frame(id = "braeside",      lat = 42.1527778, lon = -87.7725)  # UP-N

cat("===== All itinerary options: 71st/Exchange -> Braeside (today, 10:00) =====\n")
it <- detailed_itineraries(net, origins = o, destinations = d,
      mode = c("TRANSIT","WALK"), departure_datetime = dep,
      max_walk_time = 40, walk_speed = 4.43, max_trip_duration = 240,
      shortest_path = FALSE, progress = FALSE)
dt <- as.data.table(it)
cat("columns:", paste(names(dt), collapse=", "), "\n\n")
keep <- intersect(c("option","segment","mode","route","departure_time",
                    "segment_duration","wait","total_duration","distance"), names(dt))
print(dt[, ..keep])

# Isolate the Millennium -> Ogilvie transfer as a pure walk
cat("\n===== Millennium Station -> Ogilvie (OTC): walk only =====\n")
mo <- detailed_itineraries(net,
      origins      = data.frame(id="millennium", lat=41.8841667, lon=-87.6230556),
      destinations = data.frame(id="otc",        lat=41.8822222, lon=-87.6405556),
      mode = "WALK", departure_datetime = dep, walk_speed = 4.43,
      max_walk_time = 40, shortest_path = TRUE, progress = FALSE)
md <- as.data.table(mo)
cat("walk minutes Millennium->OTC:", round(sum(md$segment_duration)), "\n")
r5r::stop_r5()
