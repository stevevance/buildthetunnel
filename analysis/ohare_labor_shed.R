# O'Hare labor shed: how many metro residents can reach an O'Hare transit
# gateway within 45/60/75 min by transit+walk, TODAY vs the CrossTowner SCENARIO
# (today + CrossTowner X-routes + Red Line Extension). This is the "how big is
# the applicant pool an O'Hare employer can draw on by transit" measure.
#
# Arrival points are the two O'Hare rail gateways the planner itself uses:
#   O'Hare (Blue Line CTA terminal)   41.9777, -87.9042  (CTA today)
#   O'Hare Transfer (Metra/CrossTowner) 41.9950, -87.8806 (Metra today; +X-routes in scenario)
# Each origin is scored by the FASTER of the two gateways (min travel time),
# matching the planner's candidate-station logic. The airport people-mover (ATS)
# is deliberately NOT modeled here: this measures "can a worker get TO O'Hare by
# transit," the gateway, not the last mile to a specific terminal.
#
# Weight = total 2020 population (Census block-group pop-weighted centroids).
# Population is a transparent proxy for labor pool; see note at end re: refining
# to employed-resident counts (LODES RAC).
options(java.parameters = "-Xmx12G")
Sys.setenv(JAVA_HOME = "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home")
suppressPackageStartupMessages({library(r5r); library(data.table)})

SP  <- "/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/0dcac289-c6a5-450b-8cca-bd186b4c4593/scratchpad"
OUT <- "/Users/stevevance/Sites/BuildTheTunnel/analysis/results"
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")
CUTOFFS <- c(45, 60, 75)

# --- origins: 7-county CMAP metro block-group population centroids ------------
bg <- fread(file.path(SP, "CenPop2020_Mean_BG17.txt"))
setnames(bg, c("STATEFP","COUNTYFP","TRACTCE","BLKGRPCE","POPULATION","LATITUDE","LONGITUDE"),
             c("st","co","tr","bg","pop","lat","lon"))
bg[, GEOID := sprintf("%02d%03d%06d%01d", st, co, as.integer(tr), bg)]
bg[, `:=`(lat=as.numeric(lat), lon=as.numeric(lon), pop=as.numeric(pop))]
metro <- c(31,43,89,93,97,111,197)   # Cook, DuPage, Kane, Kendall, Lake, McHenry, Will
bg <- bg[co %in% metro & pop > 0]
origins <- bg[, .(id=GEOID, lon, lat)]
cat(sprintf("origins: %d block groups, %s residents (7-county metro)\n",
            nrow(bg), format(sum(bg$pop), big.mark=",")))

# --- destinations: the two O'Hare rail gateways ------------------------------
dest <- data.table(
  id  = c("blue_ohare","ohare_transfer"),
  lat = c(41.9777, 41.9950),
  lon = c(-87.9042, -87.8806))

tt_min_to_ohare <- function(netdir, label) {
  r5 <- build_network(netdir)
  m <- travel_time_matrix(r5, origins=origins, destinations=dest,
        mode=c("TRANSIT","WALK"), departure_datetime=dep, time_window=30,
        percentiles=50, max_trip_duration=90, max_walk_time=20, walk_speed=4.43,
        progress=FALSE)
  r5r::stop_r5(); gc()
  m <- as.data.table(m)
  ttcol <- grep("travel_time", names(m), value=TRUE)[1]
  # best (min) time across the two gateways, per origin block group
  best <- m[, .(tt = min(get(ttcol), na.rm=TRUE)), by=from_id]
  best[is.infinite(tt), tt := NA_real_]
  setnames(best, "from_id", "GEOID"); best[, net := label]; best
}

today <- tt_min_to_ohare("/Users/stevevance/Sites/BuildTheTunnel/analysis/networks/today", "today")
scen  <- tt_min_to_ohare("/Users/stevevance/Sites/BuildTheTunnel/analysis/networks/scenario_rle", "scenario")

# --- combine & summarize ------------------------------------------------------
tt <- merge(bg[, .(GEOID, pop)],
            dcast(rbind(today, scen), GEOID ~ net, value.var="tt"),
            by="GEOID", all.x=TRUE)
fwrite(tt, file.path(OUT, "ohare_labor_shed_bg.csv"))

total_pop <- sum(bg$pop)
summ <- rbindlist(lapply(CUTOFFS, function(k){
  t_pop <- tt[!is.na(today)    & today    <= k, sum(pop)]
  s_pop <- tt[!is.na(scenario) & scenario <= k, sum(pop)]
  t_bg  <- tt[!is.na(today)    & today    <= k, .N]
  s_bg  <- tt[!is.na(scenario) & scenario <= k, .N]
  data.table(cutoff_min=k,
             today_pop=t_pop, scenario_pop=s_pop,
             gained_pop=s_pop-t_pop, pct_gain=round(100*(s_pop-t_pop)/t_pop,1),
             today_bg=t_bg, scenario_bg=s_bg)
}))
fwrite(summ, file.path(OUT, "ohare_labor_shed_summary.csv"))

cat("\n==================  O'HARE TRANSIT LABOR SHED  ==================\n")
cat(sprintf("Metro residents who can reach an O'Hare rail gateway by transit,\n"))
cat(sprintf("weekday 8 AM, within each time budget.  (metro total = %s)\n\n",
            format(total_pop, big.mark=",")))
for (i in seq_len(nrow(summ))) with(summ[i], {
  cat(sprintf("  <= %d min:  today %s  ->  scenario %s   (+%s, %+.1f%%)\n",
      cutoff_min, format(today_pop, big.mark=","), format(scenario_pop, big.mark=","),
      format(gained_pop, big.mark=","), pct_gain))
})
cat("\nwrote:\n  ", file.path(OUT,"ohare_labor_shed_summary.csv"), "\n  ",
    file.path(OUT,"ohare_labor_shed_bg.csv"), "\n")
cat("done\n")
