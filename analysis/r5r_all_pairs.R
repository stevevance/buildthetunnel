# All-pairs station-to-station travel times, today vs the X-routes scenario.
# Finds the trips that improve the most. Excludes pairs that are adjacent
# stops on any scenario trip pattern (>= 1 station in between required).
options(java.parameters = "-Xmx12G")
library(r5r)
library(data.table)

sp <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/6e0b7613-ef07-4179-a534-a79296ea074e/scratchpad"
gtfs <- "/Users/stevevance/Sites/BuildTheTunnel/analysis/crosstowner_xroutes_gtfs"
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")

stops <- fread(file.path(gtfs, "stops.txt"))
pts <- stops[, .(id = stop_id, lon = stop_lon, lat = stop_lat)]
cat(nrow(pts), "stations\n")

# Adjacent-stop pairs (consecutive stop_sequence on any trip), unordered
st <- fread(file.path(gtfs, "stop_times.txt"))
setorder(st, trip_id, stop_sequence)
st[, nxt := shift(stop_id, -1), by = trip_id]
adj <- unique(st[!is.na(nxt), .(a = pmin(stop_id, nxt), b = pmax(stop_id, nxt))])
cat(nrow(adj), "adjacent pairs to exclude\n")

ttm_on <- function(folder, label) {
  net <- build_network(file.path(sp, folder))
  m <- travel_time_matrix(net, origins = pts, destinations = pts,
                          mode = c("TRANSIT", "WALK"),
                          departure_datetime = dep, time_window = 30,
                          max_walk_time = 20, max_trip_duration = 180,
                          progress = FALSE)
  setnames(m, "travel_time_p50", label)
  rm(net); r5r::stop_r5(); gc()
  m
}

base <- ttm_on("r5r_data", "min_today")
scen <- ttm_on("r5r_data_xroutes", "min_future")
m <- merge(base, scen, by = c("from_id", "to_id"), all = TRUE)
m <- m[from_id != to_id]
m[, key_a := pmin(from_id, to_id)][, key_b := pmax(from_id, to_id)]
m <- m[!adj, on = c(key_a = "a", key_b = "b")][, c("key_a", "key_b") := NULL]
m[, saved := min_today - min_future]

names_map <- stops[, .(stop_id, stop_name)]
m <- merge(m, names_map, by.x = "from_id", by.y = "stop_id")
setnames(m, "stop_name", "from_name")
m <- merge(m, names_map, by.x = "to_id", by.y = "stop_id")
setnames(m, "stop_name", "to_name")

fwrite(m, file.path(sp, "all_pairs_today_vs_future.csv"))
cat("pairs evaluated:", nrow(m), "\n")
cat("pairs unreachable today (<=180 min) but reachable in scenario:",
    m[is.na(min_today) & !is.na(min_future), .N], "\n\n")
cat("== Top 25 by minutes saved (both reachable) ==\n")
top <- m[!is.na(saved)][order(-saved)][1:25,
        .(from_name, to_name, min_today, min_future, saved)]
print(top, nrows = 25)
cat("\n== Top 10 newly connected (unreachable today) ==\n")
print(m[is.na(min_today) & !is.na(min_future)][order(min_future)][1:10,
      .(from_name, to_name, min_future)])
