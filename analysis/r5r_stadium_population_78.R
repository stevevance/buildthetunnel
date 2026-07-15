# Scenario: same present-day CTA+Metra+Pace network, but with a Red Line infill
# station added at 1500 S Clark St (the 78), inserted between Roosevelt and
# Cermak-Chinatown on every Red Line trip (distance-interpolated times; built by
# build_cta_78station_gtfs.py). Re-measures population within 30/45/60 min of
# each venue and compares to the baseline "today" run.
options(java.parameters = "-Xmx12G")
Sys.setenv(JAVA_HOME = "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home")
library(r5r); library(data.table)

sp  <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/f5bb1ab6-a48c-48f9-aaea-e4546a6de112/scratchpad"
net_dir <- "/Users/stevevance/Sites/BuildTheTunnel/analysis/networks/scenario_78station"

bg <- fread(file.path(sp, "CenPop2020_BG17.txt"))
setnames(bg, c("STATEFP","COUNTYFP","TRACTCE","BLKGRPCE","POPULATION","LATITUDE","LONGITUDE"),
             c("st","co","tr","bg","pop","lat","lon"))
bg[, id := sprintf("%02d%03d%06d%01d", st, co, tr, bg)]
bg[, `:=`(lat=as.numeric(lat), lon=as.numeric(lon), pop=as.numeric(pop))]
bg <- bg[lon >= -88.45 & lon <= -87.5 & lat >= 41.4 & lat <= 42.45 & pop > 0]
origins <- bg[, .(id, lon, lat)]

dest <- data.table(
  id  = c("The 78 (Fire stadium)","Soldier Field","Wrigley Field",
          "Rate Field (Sox)","United Center","Wintrust Arena"),
  lon = c(-87.6325, -87.6167, -87.6564, -87.6338, -87.6742, -87.6205),
  lat = c( 41.8595,  41.8623,  41.9475,  41.8300,  41.8807,  41.8527))

dep <- as.POSIXct("2026-07-14 12:00:00", tz = "America/Chicago")
r5 <- build_network(net_dir)
ttm <- travel_time_matrix(r5, origins=origins, destinations=dest,
        mode=c("TRANSIT","WALK"), departure_datetime=dep,
        time_window=60, percentiles=50,
        max_trip_duration=60, max_walk_time=20, walk_speed=4.43, progress=TRUE)
r5r::stop_r5(); gc()

ttm <- as.data.table(ttm)
tcol <- grep("travel_time", names(ttm), value=TRUE)[1]; setnames(ttm, tcol, "tt")
ttm <- merge(ttm, bg[, .(from_id=id, pop)], by="from_id")
res <- ttm[, .(pop30=round(sum(pop[tt<=30])), pop45=round(sum(pop[tt<=45])),
               pop60=round(sum(pop[tt<=60]))), by=to_id]
fwrite(res, file.path(sp, "stadium_population_access_78.csv"))

base <- fread(file.path(sp, "stadium_population_access.csv"))
cmp <- merge(base, res, by="to_id", suffixes=c("_base","_78"))
for (m in c("30","45","60"))
  cmp[[paste0("d",m)]] <- cmp[[paste0("pop",m,"_78")]] - cmp[[paste0("pop",m,"_base")]]
setorder(cmp, -pop45_78)
cat("\n=== Baseline vs. 78-infill-station: population within N min ===\n")
print(cmp[, .(to_id, pop30_base, pop30_78, d30, pop45_base, pop45_78, d45,
              pop60_base, pop60_78, d60)])
cat("\n78 stadium change:\n")
print(cmp[to_id=="The 78 (Fire stadium)",
          .(to_id, d30, d45, d60,
            pct30=round(100*d30/pop30_base,1),
            pct45=round(100*d45/pop45_base,1),
            pct60=round(100*d60/pop60_base,1))])
cat("done\n")
