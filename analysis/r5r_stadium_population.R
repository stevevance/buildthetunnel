# Population living within 30 / 45 / 60 minutes of a transit+walk trip TO each
# of six Chicago sports venues, using the present-day "today" network
# (CTA + Metra + Pace + street PBF) already built under analysis/networks/today.
#
# Direction: origins = residential block groups, destination = each venue, so the
# travel time is home -> venue (the correct direction for "who can reach the
# venue"). Population = 2020 Census block-group counts placed at each block
# group's population-weighted center of population (Census "Centers of
# Population" file), which is a better residential anchor than a geometric
# centroid.
options(java.parameters = "-Xmx12G")
Sys.setenv(JAVA_HOME = "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home")
library(r5r); library(data.table)

sp  <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/f5bb1ab6-a48c-48f9-aaea-e4546a6de112/scratchpad"
net_dir <- "/Users/stevevance/Sites/BuildTheTunnel/analysis/networks/today"

# --- population origins: IL block-group centers of population -----------------
bg <- fread(file.path(sp, "CenPop2020_BG17.txt"))
setnames(bg, c("STATEFP","COUNTYFP","TRACTCE","BLKGRPCE","POPULATION","LATITUDE","LONGITUDE"),
             c("st","co","tr","bg","pop","lat","lon"))
bg[, id := sprintf("%02d%03d%06d%01d", st, co, tr, bg)]
bg[, `:=`(lat = as.numeric(lat), lon = as.numeric(lon), pop = as.numeric(pop))]

# Clip to the routing network's street bbox (-88.45,41.4 : -87.5,42.45). Block
# groups outside it have no street network for access/egress and can't route.
bg <- bg[lon >= -88.45 & lon <= -87.5 & lat >= 41.4 & lat <= 42.45 & pop > 0]
origins <- bg[, .(id, lon, lat)]
cat(sprintf("Origins (block groups in bbox): %d, total pop %s\n",
            nrow(origins), format(sum(bg$pop), big.mark=",")))

# --- venue destinations ------------------------------------------------------
dest <- data.table(
  id  = c("The 78 (Fire stadium)","Soldier Field","Wrigley Field",
          "Rate Field (Sox)","United Center","Wintrust Arena"),
  lon = c(-87.6325, -87.6167, -87.6564, -87.6338, -87.6742, -87.6205),
  lat = c( 41.8595,  41.8623,  41.9475,  41.8300,  41.8807,  41.8527))

# --- routing -----------------------------------------------------------------
# Weekday midday: full base CTA/Metra-midday/Pace service, not skewed by a
# single peak. 60-minute departure window, median (p50) travel time.
dep <- as.POSIXct("2026-07-14 12:00:00", tz = "America/Chicago")
r5 <- build_network(net_dir)

ttm <- travel_time_matrix(r5, origins = origins, destinations = dest,
        mode = c("TRANSIT","WALK"), departure_datetime = dep,
        time_window = 60, percentiles = 50,
        max_trip_duration = 60, max_walk_time = 20, walk_speed = 4.43,
        progress = TRUE)
r5r::stop_r5(); gc()

ttm <- as.data.table(ttm)
# r5r may name the time column travel_time_p50 (with percentiles) or travel_time.
tcol <- grep("travel_time", names(ttm), value = TRUE)[1]
setnames(ttm, tcol, "tt")
ttm <- merge(ttm, bg[, .(from_id = id, pop)], by = "from_id")

# --- population reachable within each cutoff, per venue ----------------------
res <- ttm[, .(
  pop30 = sum(pop[tt <= 30]),
  pop45 = sum(pop[tt <= 45]),
  pop60 = sum(pop[tt <= 60])
), by = to_id]
setorder(res, -pop45)
res[, `:=`(pop30 = round(pop30), pop45 = round(pop45), pop60 = round(pop60))]

fwrite(res, file.path(sp, "stadium_population_access.csv"))
cat("\n=== Population within N minutes (transit+walk, home->venue) ===\n")
print(res)
cat("\nRanked by 30-min:\n");  print(res[order(-pop30), .(to_id, pop30)])
cat("\nRanked by 45-min:\n");  print(res[order(-pop45), .(to_id, pop45)])
cat("\nRanked by 60-min:\n");  print(res[order(-pop60), .(to_id, pop60)])
cat("done\n")
