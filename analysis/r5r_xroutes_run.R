# X-routes scenario (Scott's scheduled GTFS): isochrones + jobs from
# Taylor/Clinton, plus a routed Arlington Heights -> Hyde Park itinerary.
options(java.parameters = "-Xmx12G")
library(r5r)
library(data.table)
library(sf)

sp <- "."  # assemble the r5r data folders (GTFS zips + streets pbf) here; see METHODOLOGY.md

net <- build_network(file.path(sp, "r5r_data_xroutes"))

dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")
origin <- data.frame(id = "taylor-clinton", lon = -87.6407847, lat = 41.8697799)

iso <- isochrone(net, origins = origin, mode = c("TRANSIT", "WALK"),
                 departure_datetime = dep, cutoffs = c(30, 45, 60),
                 max_walk_time = 15, time_window = 30, progress = FALSE)
st_write(iso, file.path(sp, "r5r_taylor_clinton_isochrones_xroutes.geojson"),
         delete_dsn = TRUE, quiet = TRUE)

iso_base <- st_read(file.path(sp, "r5r_taylor_clinton_isochrones.geojson"), quiet = TRUE)
jobs <- fread(file.path(sp, "lodes_wac_blocks.csv"))
stopifnot(nrow(jobs) > 90000)
jobs_sf <- st_as_sf(jobs, coords = c("lon", "lat"), crs = 4326)

sum_jobs <- function(isox, label) {
  rbindlist(lapply(seq_len(nrow(isox)), function(i) {
    hit <- jobs_sf[st_within(jobs_sf, isox[i, ], sparse = FALSE), ]
    data.table(scenario = label, minutes = isox$isochrone[i],
               jobs_total = sum(hit$c000), jobs_lowinc = sum(hit$ce01),
               jobs_midinc = sum(hit$ce02), jobs_highinc = sum(hit$ce03))
  }))
}
res <- rbind(sum_jobs(iso_base, "baseline"), sum_jobs(iso, "xroutes"))
setorder(res, minutes, scenario)
print(res)
wide <- dcast(res, minutes ~ scenario, value.var = "jobs_total")
wide[, gained := xroutes - baseline]
wide[, pct := round(100 * gained / baseline, 1)]
print(wide)
fwrite(res, file.path(sp, "xroutes_jobs_comparison.csv"))

# Routed one-seat check: Arlington Heights Metra station -> Hyde Park
ah <- data.frame(id = "arlington-heights", lon = -87.9836111, lat = 42.0841667)
hp <- data.frame(id = "hyde-park-55th", lon = -87.5875, lat = 41.7933333)
it <- detailed_itineraries(net, origins = ah, destinations = hp,
                           mode = c("TRANSIT", "WALK"), departure_datetime = dep,
                           max_walk_time = 20, shortest_path = FALSE, progress = FALSE)
print(as.data.table(it)[, .(option, departure_time, total_duration, segment,
                            mode, route, segment_duration, wait)])
areas <- data.frame(minutes = iso$isochrone,
  sq_mi = round(as.numeric(st_area(st_transform(iso, 3435))) / 27878400, 1))
print(areas)
cat("done\n")
