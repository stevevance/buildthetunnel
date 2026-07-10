# Jobs accessible within 45 and 60 minutes from each trip's origin, today vs
# the CrossTowner scenario, using LODES WAC block-level employment.
options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)
sp <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/6e0b7613-ef07-4179-a534-a79296ea074e/scratchpad"
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")

# LODES job blocks -> destinations with 'jobs' opportunity
jobs <- fread(file.path(sp, "lodes_wac_blocks.csv"))
setnames(jobs, c("w_geocode","lon","lat","c000","ce01","ce02","ce03"),
         c("id","lon","lat","jobs","low","mid","high"), skip_absent=TRUE)
dest <- jobs[, .(id=as.character(id), lon, lat, jobs, low, mid, high)]

origins <- data.table(
  id = c("Arlington Heights","Evanston (Main St)","Beverly (95th)","Downers Grove",
         "Naperville","Berkeley","Evanston (Davis St)","Tinley Park"),
  lon= c(-87.9836111,-87.680254,-87.6672222,-88.009758,-88.1455556,-87.915301,-87.684631,-87.7827778),
  lat= c(42.0841667, 42.033421, 41.7213889, 41.795312, 41.7797222, 41.896048, 42.047763, 41.5758333))

acc_on <- function(folder, label) {
  net <- build_network(file.path(sp, folder))
  a <- accessibility(net, origins=origins, destinations=dest,
        opportunities_colnames=c("jobs","low","mid","high"),
        mode=c("TRANSIT","WALK"), departure_datetime=dep, time_window=30,
        decay_function="step", cutoffs=c(45,60), max_walk_time=20, walk_speed=4.43,
        progress=FALSE)
  a <- as.data.table(a); a[, net:=label]
  rm(net); r5r::stop_r5(); gc(); a
}
res <- rbind(acc_on("r5r_data","today"), acc_on("r5r_data_xroutes","scenario"))
fwrite(res, file.path(sp, "jobs_access_by_origin.csv"))

w <- dcast(res[opportunity=="jobs"], id + cutoff ~ net, value.var="accessibility")
w[, gained := scenario - today][, pct := round(100*gained/today,1)]
setorder(w, id, cutoff)
print(w)
cat("\n60-minute summary:\n")
print(w[cutoff==60, .(id, today, scenario, gained, pct)])
cat("done\n")
