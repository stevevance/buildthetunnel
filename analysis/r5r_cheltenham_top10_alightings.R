# Travel time from Cheltenham (79th St, MED South Chicago branch) to the
# top-10 Metra alighting stations (2018 survey), EXCLUDING downtown Chicago
# terminals (Union Station, OTC, LaSalle, Millennium, Van Buren, McCormick
# Place). Question: which of the 10 are >60 min today, and which of those
# drop under 60 min with the CrossTowner X-routes?
# Weekday 8:00 AM, median over a 30-min departure window, 2.75 mph walk.
# Run from analysis/ after: bash assemble_networks.sh
options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)

o <- data.frame(id = "cheltenham", lat = 41.752233, lon = -87.552538)

# Top 10 alighting stations, 2018, downtown terminals removed.
dests <- data.frame(
  id  = c("Route 59","Naperville","Downers Grove Main St","Ravenswood",
          "Arlington Heights","Palatine","Elmhurst","80th Ave (Tinley Park)",
          "Davis St (Evanston)","Aurora"),
  lat = c(41.7777778, 41.7797222, 41.7952778, 41.9683333,
          42.0841667, 42.1130556, 41.8997222, 41.5644444,
          42.0480556, 41.7608333),
  lon = c(-88.2086111, -88.1455556, -88.0097222, -87.6744444,
          -87.9836111, -88.0483333, -87.9408333, -87.8094444,
          -87.6847222, -88.3083333))

dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")  # Tuesday

run <- function(net_name) {
  net <- build_network(file.path("networks", net_name))
  m <- travel_time_matrix(net, origins = o, destinations = dests,
        mode = c("TRANSIT","WALK"), departure_datetime = dep,
        time_window = 30, percentiles = 50, max_walk_time = 30,
        walk_speed = 4.43, max_trip_duration = 180, progress = FALSE)
  r5r::stop_r5(); rm(net); gc()
  as.data.table(m)
}

today <- run("today")
scen  <- run("scenario")
setnames(today, grep("travel_time", names(today), value = TRUE)[1], "today_min")
setnames(scen,  grep("travel_time", names(scen),  value = TRUE)[1], "scen_min")

out <- merge(today[, .(to_id, today_min)], scen[, .(to_id, scen_min)],
             by = "to_id", all = TRUE)
setnames(out, "to_id", "station")
out[, over60_today  := ifelse(is.na(today_min) | today_min > 60, "YES", "no")]
out[, under60_scen  := ifelse(!is.na(scen_min) & scen_min <= 60, "YES", "no")]
setorder(out, -today_min)
fwrite(out, "results/cheltenham_top10_alightings.csv")
print(out)
cat("\n>60 today AND <=60 with CrossTowner:\n")
print(out[over60_today == "YES" & under60_scen == "YES", .(station, today_min, scen_min)])
