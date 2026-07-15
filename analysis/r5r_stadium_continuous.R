# Continuous accessibility metrics for the six venues, replacing the lumpy
# cumulative-at-cutoff counts. For each venue we compute, over every block group
# (home->venue travel time, routed out to 90 min):
#   1) Gravity access score  A = sum_i pop_i * exp(-tt_i / beta)      [people-equiv]
#      with a 30-minute half-life (beta = 30/ln2). Smooth: every minute saved
#      anywhere counts, so it doesn't hide sub-cutoff improvements.
#   2) Population-weighted mean travel time among residents within 90 min [minutes]
# Reported for baseline ("today") and the 78 Red Line infill scenario, so the
# station's true effect on EVERY venue is visible (not just where a cutoff flips).
options(java.parameters = "-Xmx12G")
Sys.setenv(JAVA_HOME = "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home")
library(r5r); library(data.table)
sp <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/f5bb1ab6-a48c-48f9-aaea-e4546a6de112/scratchpad"

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

ttm_of <- function(nd){
  r5 <- build_network(nd)
  m <- travel_time_matrix(r5, origins=origins, destinations=dest,
        mode=c("TRANSIT","WALK"), departure_datetime=dep, time_window=60,
        percentiles=50, max_trip_duration=90, max_walk_time=20, walk_speed=4.43,
        progress=FALSE)
  r5r::stop_r5(); gc(); m <- as.data.table(m)
  setnames(m, grep("travel_time", names(m), value=TRUE)[1], "tt"); m
}
base <- ttm_of("/Users/stevevance/Sites/BuildTheTunnel/analysis/networks/today")
sc78 <- ttm_of("/Users/stevevance/Sites/BuildTheTunnel/analysis/networks/scenario_78station")

BETA <- 30/log(2)  # 30-minute half-life
score <- function(m, label){
  m <- merge(m, bg[, .(from_id=id, pop)], by="from_id")
  s <- m[, .(gravity = sum(pop*exp(-tt/BETA)),
             popwt_mean_tt = sum(pop*tt)/sum(pop),
             pop_reachable_90 = sum(pop)), by=to_id]
  setnames(s, c("gravity","popwt_mean_tt","pop_reachable_90"),
              paste0(c("gravity_","meantt_","pop90_"), label)); s
}
b <- score(base, "base"); s <- score(sc78, "s78")
cmp <- merge(b, s, by="to_id")
cmp[, gravity_pct := round(100*(gravity_s78-gravity_base)/gravity_base, 2)]
cmp[, meantt_delta := round(meantt_s78 - meantt_base, 2)]
cmp[, `:=`(gravity_base=round(gravity_base), gravity_s78=round(gravity_s78),
           meantt_base=round(meantt_base,1), meantt_s78=round(meantt_s78,1))]

setorder(cmp, -gravity_base)
fwrite(cmp, file.path(sp,"stadium_continuous.csv"))
cat("\n=== Gravity accessibility (30-min half-life) & pop-weighted mean travel time ===\n")
cat("Ranked by baseline gravity score (higher = more people, weighted, can reach it):\n")
print(cmp[, .(to_id, gravity_base, meantt_base, pop90_base=round(pop90_base))])
cat("\n=== Effect of the 78 Red Line infill station (continuous) ===\n")
print(cmp[order(-gravity_pct), .(to_id, gravity_base, gravity_s78, gravity_pct, meantt_base, meantt_s78, meantt_delta)])
cat("\ndone\n")
