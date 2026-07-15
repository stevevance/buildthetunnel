#!/usr/bin/env Rscript
#
# pedestrian_barrier_scan.R -- Find likely OSM pedestrian-network barriers near
# rail stations (and the six venues) by comparing R5's actual walking distance
# between nearby points to the straight-line distance. A high "detour ratio"
# (network / crow-flies) means the walk network forces a long way around --
# usually a missing crossing, a foot=no way, or a disconnected path, exactly
# like the Soldier Field <-> 18th St case.
#
# Method: one all-pairs WALK travel_time_matrix over all station + venue points;
# for every ordered pair whose straight-line distance is short (<= NEAR_M),
# flag it if the actual walk is much longer than the ~1.3x a normal street grid
# would give, or if the point is unreachable on foot despite being close.
#
# Output: results/pedestrian_barriers.csv (ranked), with an OSM link to each
# suspect midpoint so they're one click from editing.
#
# Usage: Rscript analysis/pedestrian_barrier_scan.R   (from repo root)

options(java.parameters = "-Xmx12G")
suppressMessages({library(r5r); library(data.table); library(jsonlite)})

NETWORK <- "analysis/networks/today_sfpatch"  # patched network (SF fix applied)
NEAR_M    <- 1200   # only judge pairs within this straight-line distance
RATIO_MIN <- 2.0    # detour ratio above this = suspect
MPM       <- 73.8   # metres/min walking at 2.75 mph (4.43 km/h)

# --- point set: all rail stations + the six venues ---------------------------
st <- as.data.table(fromJSON("planner/data/stations.json"))
venues <- data.table(
  id  = c("VENUE:The 78","VENUE:Soldier Field","VENUE:Wrigley Field",
          "VENUE:Rate Field","VENUE:United Center","VENUE:Wintrust Arena"),
  lat = c(41.8595,41.8623,41.9475,41.8300,41.8807,41.8527),
  lon = c(-87.6325,-87.6167,-87.6564,-87.6338,-87.6742,-87.6205))
pts <- rbind(st[, .(id, name, lat, lon)],
             venues[, .(id, name=id, lat, lon)], fill=TRUE)
P <- data.frame(id=pts$id, lat=pts$lat, lon=pts$lon)

# --- all-pairs WALK times ----------------------------------------------------
net <- build_network(NETWORK)
m <- travel_time_matrix(net, origins=P, destinations=P, mode="WALK",
     departure_datetime=as.POSIXct("2026-07-14 12:00:00", tz="America/Chicago"),
     max_trip_duration=60, max_walk_time=60, walk_speed=4.43, progress=FALSE)
r5r::stop_r5(); gc()
m <- as.data.table(m); setnames(m, grep("travel_time",names(m),value=TRUE)[1], "walk_min")

# --- crow-flies distance + detour ratio for near pairs -----------------------
haversine <- function(la1,lo1,la2,lo2){
  R<-6371000; r<-pi/180
  a<-sin((la2-la1)*r/2)^2+cos(la1*r)*cos(la2*r)*sin((lo2-lo1)*r/2)^2
  2*R*asin(pmin(1,sqrt(a)))
}
coord <- setNames(pts$lat, pts$id); coordlon <- setNames(pts$lon, pts$id)
nm    <- setNames(pts$name, pts$id)
m <- m[from_id != to_id]
m[, crow_m := haversine(coord[from_id], coordlon[from_id],
                        coord[to_id],   coordlon[to_id])]
near <- m[crow_m <= NEAR_M]
near[, exp_min := crow_m / MPM]                       # ideal straight walk
near[, ratio := walk_min / exp_min]                    # >1.3 is normal grid
# Two flavours of suspect: big detour, or unreachable-though-close.
near[, suspect := (!is.na(ratio) & ratio >= RATIO_MIN & walk_min - exp_min >= 5) |
                  (is.na(walk_min) & crow_m <= 700)]

sus <- near[suspect == TRUE]
# De-dupe A<->B to one row (keep the worse direction).
sus[, key := paste(pmin(from_id,to_id), pmax(from_id,to_id))]
setorder(sus, -ratio, na.last=TRUE)
sus <- sus[!duplicated(key)]

# Midpoint + OSM edit link for each suspect (one click to fix).
sus[, mid_lat := (coord[from_id]+coord[to_id])/2]
sus[, mid_lon := (coordlon[from_id]+coordlon[to_id])/2]
sus[, osm_edit := sprintf("https://www.openstreetmap.org/edit#map=18/%.5f/%.5f",
                          mid_lat, mid_lon)]
out <- sus[, .(from=nm[from_id], to=nm[to_id],
               crow_m=round(crow_m), walk_min=round(walk_min,1),
               detour_ratio=round(ratio,1), mid_lat=round(mid_lat,5),
               mid_lon=round(mid_lon,5), osm_edit)]
fwrite(out, "analysis/results/pedestrian_barriers.csv")
cat(sprintf("\n%d suspect barrier pairs (ratio>=%.1f within %dm). Top 25:\n",
            nrow(out), RATIO_MIN, NEAR_M))
print(head(out[, .(from, to, crow_m, walk_min, detour_ratio)], 25))
cat("\nFull list + OSM edit links: analysis/results/pedestrian_barriers.csv\n")
