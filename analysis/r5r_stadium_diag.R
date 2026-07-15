# Diagnostic: recompute full travel-time matrices for baseline (today) and the
# 78-infill scenario, then diff them per venue to see exactly which block groups
# changed travel time and which crossed the 30/45/60-min thresholds. Explains why
# some venues' reachable population moves and others don't.
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

run <- function(nd){
  r5 <- build_network(nd)
  m <- travel_time_matrix(r5, origins=origins, destinations=dest,
        mode=c("TRANSIT","WALK"), departure_datetime=dep, time_window=60,
        percentiles=50, max_trip_duration=60, max_walk_time=20, walk_speed=4.43,
        progress=TRUE)
  r5r::stop_r5(); gc(); as.data.table(m)
}
b <- run("/Users/stevevance/Sites/BuildTheTunnel/analysis/networks/today")
s <- run("/Users/stevevance/Sites/BuildTheTunnel/analysis/networks/scenario_78station")
tc <- grep("travel_time", names(b), value=TRUE)[1]
setnames(b, tc, "tt_base"); setnames(s, tc, "tt_78")

# Full outer join so we also see OD pairs reachable in only one scenario.
m <- merge(b, s, by=c("from_id","to_id"), all=TRUE)
m <- merge(m, bg[, .(from_id=id, pop, lat, lon)], by="from_id")
# Unreachable (NA) within 60 -> treat as 999 so threshold logic works.
m[is.na(tt_base), tt_base := 999L]; m[is.na(tt_78), tt_78 := 999L]
m[, chg := tt_78 - tt_base]

cat("\n=== Per-venue: block groups whose travel time changed ===\n")
for (v in dest$id){
  d <- m[to_id==v & chg!=0]
  cat(sprintf("\n%s: %d block groups changed (pop %s). improved=%d worsened=%d\n",
      v, nrow(d), format(sum(d$pop),big.mark=","),
      nrow(d[chg<0]), nrow(d[chg>0])))
  for (thr in c(30,45,60)){
    crossed_in  <- m[to_id==v & tt_base>thr & tt_78<=thr]
    crossed_out <- m[to_id==v & tt_base<=thr & tt_78>thr]
    if (nrow(crossed_in)+nrow(crossed_out) > 0)
      cat(sprintf("   %d-min: +%d BG / +%s pop entered; -%d BG / -%s pop left\n",
          thr, nrow(crossed_in), format(sum(crossed_in$pop),big.mark=","),
          nrow(crossed_out), format(sum(crossed_out$pop),big.mark=",")))
  }
  # show the changed BGs closest to the new station (1500 S Clark 41.8619,-87.6308)
  if (nrow(d)>0){
    d[, dkm := 111*sqrt((lat-41.861854)^2 + ((lon+87.630796)*cos(41.86*pi/180))^2)]
    setorder(d, dkm)
    cat("   nearest changed BGs (km from new station | base->78 min | pop):\n")
    print(head(d[, .(from_id, dkm=round(dkm,2), tt_base, tt_78, pop)], 6))
  }
}
cat("\ndone\n")
