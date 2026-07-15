# Cheltenham (79th, MED South Chicago branch) -> the CrossTowner-served
# stations among the top-25 Metra alighting stations (2018 survey), excluding
# only today's four downtown terminals (Union, Ogilvie, LaSalle, Millennium).
# Destinations read from results/cheltenham_onnet_dests.csv (built by the
# coordinate-based network-membership filter).
# Which are >60 min today, and which drop under 60 with the X-routes?
# Weekday 8:00 AM, median over a 30-min window, 2.75 mph walk.
# Run from analysis/ after: bash assemble_networks.sh
options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)

o <- data.frame(id = "cheltenham", lat = 41.752233, lon = -87.552538)
d <- fread("results/cheltenham_onnet_dests.csv")
dests <- data.frame(id = d$station, lat = d$lat, lon = d$lon)

dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")  # Tuesday

run <- function(net_name) {
  net <- build_network(file.path("networks", net_name))
  m <- travel_time_matrix(net, origins = o, destinations = dests,
        mode = c("TRANSIT","WALK"), departure_datetime = dep,
        time_window = 30, percentiles = 50, max_walk_time = 30,
        walk_speed = 4.43, max_trip_duration = 180, progress = FALSE)
  r5r::stop_r5(); gc(); as.data.table(m)
}

today <- run("today"); scen <- run("scenario")
setnames(today, grep("travel_time", names(today), value=TRUE)[1], "today_min")
setnames(scen,  grep("travel_time", names(scen),  value=TRUE)[1], "scen_min")
out <- merge(today[, .(to_id, today_min)], scen[, .(to_id, scen_min)], by="to_id", all=TRUE)
setnames(out, "to_id", "station")
out <- merge(out, d[, .(station, alightings_2018)], by="station", all.x=TRUE)
out[, delta := scen_min - today_min]
out[, over60_today := ifelse(is.na(today_min) | today_min > 60, "YES", "no")]
out[, under60_scen := ifelse(!is.na(scen_min) & scen_min <= 60, "YES", "no")]
setorder(out, -alightings_2018)
fwrite(out, "results/cheltenham_top25_onnet.csv")
print(out[, .(station, alightings_2018, today_min, scen_min, delta, over60_today, under60_scen)])
cat("\n>60 today AND <=60 with CrossTowner:\n")
print(out[over60_today=="YES" & under60_scen=="YES", .(station, today_min, scen_min)])
