# How many people would reach each of the X1's film stations at least 10 minutes faster with CrossTowner?
#
# For every 2020 Census block group in the six-county region (population-weighted centroids), the transit+walk
# travel time to each station's location at 8 AM on a weekday: today (present-day CTA + Metra + Pace) and with
# CrossTowner (the same network plus the X-route GTFS; no Red Line Extension, so the difference is the tunnel's).
# Median over a 30-minute departure window, 120-minute cap. A block group counts as "10+ minutes faster" if its
# CrossTowner time is at least 10 minutes shorter than today's, including block groups that can't reach the
# station within the cap today but can with CrossTowner.
#
# Writes analysis/data/station_faster_access.csv (one row per station) for the alderpersons' cut of the cab-ride film.
options(java.parameters = "-Xmx12G")
Sys.setenv(JAVA_HOME = "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home")
library(r5r); library(data.table)

root <- "/Users/stevevance/Sites/BuildTheTunnel/analysis"
bg <- fread(file.path(root, "data/census/CenPop2020_Mean_BG17.txt"), colClasses = "character", encoding = "UTF-8")
setnames(bg, c("st", "co", "tr", "bg", "pop", "lat", "lon"))
bg[, `:=`(id = paste0(st, co, tr, bg), pop = as.numeric(pop), lat = as.numeric(lat), lon = as.numeric(lon))]
# the six counties of the planner: Cook, DuPage, Kane, Lake, McHenry, Will
bg <- bg[co %in% c("031", "043", "089", "097", "111", "197") & pop > 0]
origins <- bg[, .(id, lon, lat)]

# station locations from the CrossTowner GTFS
stops <- fread(file.path(root, "crosstowner_xroutes_gtfs/stops.txt"))
ids <- c("crosstownerstation-18th-soldier-field", "crosstownerstation-roosevelt", "crosstownerstation-taylor-clinton",
         "crosstownerstation-union-station", "crosstownerstation-randolph-clinton", "crosstownerstation-chicago-halsted-bally-s")
dest <- stops[stop_id %in% ids, .(id = stop_name, lon = stop_lon, lat = stop_lat)]

dep <- as.POSIXct("2026-07-14 08:00:00", tz = "America/Chicago")   # a Tuesday, as the planner's 8 AM slice
run <- function(net) {
  r5 <- build_network(file.path(root, "networks", net))
  ttm <- travel_time_matrix(r5, origins = origins, destinations = dest, mode = c("TRANSIT", "WALK"),
                            departure_datetime = dep, time_window = 30, percentiles = 50,
                            max_trip_duration = 120, max_walk_time = 20, walk_speed = 4.43, progress = TRUE)
  r5r::stop_r5(r5); gc()
  ttm <- as.data.table(ttm)
  setnames(ttm, grep("travel_time", names(ttm), value = TRUE)[1], "tt")
  ttm[, .(from_id, to_id, tt)]
}
today <- run("today"); with_ct <- run("scenario")

grid <- CJ(from_id = origins$id, to_id = dest$id)
grid <- merge(grid, today[, .(from_id, to_id, today = tt)], by = c("from_id", "to_id"), all.x = TRUE)
grid <- merge(grid, with_ct[, .(from_id, to_id, ct = tt)], by = c("from_id", "to_id"), all.x = TRUE)
grid <- merge(grid, bg[, .(from_id = id, pop)], by = "from_id")
grid[, faster := !is.na(ct) & (is.na(today) | today - ct >= 10)]
res <- grid[, .(people_10min_faster = round(sum(pop[faster])),
                block_groups = sum(faster),
                median_minutes_saved = as.numeric(median((today - ct)[faster & !is.na(today)])),
                reach_60_today = round(sum(pop[!is.na(today) & today <= 60])),
                reach_60_ct = round(sum(pop[!is.na(ct) & ct <= 60]))), by = to_id]
# and once for each group of stations: people 10+ minutes faster to at least one of them (no double counting)
any_of <- function(label, which) {
  g <- grid[to_id %in% which, .(faster = any(faster), pop = pop[1]), by = from_id]
  data.table(to_id = label, people_10min_faster = round(sum(g$pop[g$faster])), block_groups = sum(g$faster),
             median_minutes_saved = NA_real_, reach_60_today = NA_real_, reach_60_ct = NA_real_)
}
tunnel <- setdiff(dest$id, "18th (Soldier Field)")
res <- rbind(res, any_of("Any of the five tunnel stations", tunnel), any_of("Any of the six stops in the film", dest$id))
fwrite(res, file.path(root, "data/station_faster_access.csv"))
fwrite(grid, file.path(root, "data/station_faster_access_bg.csv"))          # every block group and station, both times
print(res)
