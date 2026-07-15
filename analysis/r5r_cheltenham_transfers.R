# Transfer counts for Cheltenham -> the 11 CrossTowner-served top-25 alighting
# stations, today vs scenario. detailed_itineraries gives per-leg detail;
# transfers = (number of transit legs) - 1 on the fastest 8:00 AM itinerary.
# Run from analysis/ after: bash assemble_networks.sh
options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)

o <- data.frame(id = "cheltenham", lat = 41.752233, lon = -87.552538)
d <- fread("results/cheltenham_onnet_dests.csv")
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")

# transit modes r5r reports (everything that is not walking is a ride)
transit_modes <- c("RAIL","SUBWAY","BUS","TRAM","FERRY","CABLE_CAR","GONDOLA","FUNICULAR")

count_transfers <- function(net, dest) {
  it <- tryCatch(
    detailed_itineraries(net,
      origins = o,
      destinations = data.frame(id = dest$station, lat = dest$lat, lon = dest$lon),
      mode = c("TRANSIT","WALK"), departure_datetime = dep,
      max_walk_time = 30, walk_speed = 4.43, max_trip_duration = 180,
      shortest_path = FALSE, progress = FALSE),
    error = function(e) NULL)
  if (is.null(it) || nrow(it) == 0) return(list(transfers = NA, minutes = NA))
  dt <- as.data.table(it)
  # pick the fastest option (min total_duration)
  best <- dt[option == dt[which.min(total_duration), option]]
  ntransit <- best[mode %in% transit_modes, .N]
  list(transfers = max(ntransit - 1, 0), minutes = round(best$total_duration[1]))
}

run <- function(net_name) {
  net <- build_network(file.path("networks", net_name))
  res <- rbindlist(lapply(seq_len(nrow(d)), function(i) {
    r <- count_transfers(net, d[i]); data.table(station = d$station[i],
      transfers = r$transfers, minutes = r$minutes)
  }))
  r5r::stop_r5(); gc(); res
}

today <- run("today");    setnames(today, c("station","transfers_today","min_today"))
scen  <- run("scenario"); setnames(scen,  c("station","transfers_x","min_x"))
out <- merge(today, scen, by = "station")
out <- merge(out, d[, .(station, alightings_2018)], by = "station")
setorder(out, -alightings_2018)
fwrite(out, "results/cheltenham_transfers.csv")
print(out)
