#!/usr/bin/env Rscript
#
# build_stations.R  --  Build the unified rail-station list for the
# CrossTowner trip planner.
#
# The planner routes only between rail stations, so we need one canonical
# list of every Metra, CTA "L", and CrossTowner station, with the duplicates
# that occur where these three networks share a physical stop merged into a
# single record.
#
# Inputs  (public GTFS, committed under analysis/r5r_network_inputs/):
#   metra-gtfs.zip               -- 242 Metra stations (every stop is a station)
#   cta-gtfs.zip                 -- CTA feed; the 143 parent stations
#                                   (location_type = 1) are the "L" rail
#                                   stations (bus stops are location_type 0/blank)
#   crosstowner-xroutes-gtfs.zip -- the proposed scenario; we keep only the
#                                   stops that an X-route actually serves
#
# Output  (under planner/data/, served statically by GitHub Pages):
#   stations.json            -- one record per canonical station
#   station_dedup_report.csv -- every merge we made, for audit
#
# Dedup rule: cluster stops whose centres are within 150 m into one station,
# BY DISTANCE ONLY -- never by name. Two different "79th" stations sit on
# parallel South Side branches; a name-based merge would wrongly collapse
# them (this exact bug bit the scenario-GTFS build in 2026-07, see
# analysis/METHODOLOGY.md section 4.2). Distance-only is safe because real
# platforms that are the "same station" across networks are essentially
# coincident.
#
# Usage:  Rscript analysis/planner/build_stations.R
#         (run from the repo root; paths below are relative to it)

suppressMessages({
  library(data.table)
  library(jsonlite)
})

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
IN_DIR  <- "analysis/r5r_network_inputs"
OUT_DIR <- "planner/data"
dir.create(OUT_DIR, recursive = TRUE, showWarnings = FALSE)

# Read one .txt table straight out of a GTFS zip without unpacking to disk.
read_gtfs <- function(zip, file) {
  con <- unz(zip, file)
  on.exit(close(con))
  fread(text = readLines(con), colClasses = "character")
}

# Great-circle distance in metres between two lon/lat points (Haversine).
haversine_m <- function(lat1, lon1, lat2, lon2) {
  R <- 6371000
  to_rad <- pi / 180
  dlat <- (lat2 - lat1) * to_rad
  dlon <- (lon2 - lon1) * to_rad
  a <- sin(dlat / 2)^2 +
       cos(lat1 * to_rad) * cos(lat2 * to_rad) * sin(dlon / 2)^2
  2 * R * asin(pmin(1, sqrt(a)))
}

# ---------------------------------------------------------------------------
# 1. Load each network's stations into a common shape
#    (network, src_id, name, lat, lon, wheelchair)
# ---------------------------------------------------------------------------

# --- Metra: every stop is a station ---------------------------------------
metra_stops <- read_gtfs(file.path(IN_DIR, "metra-gtfs.zip"), "stops.txt")
metra <- data.table(
  network    = "metra",
  src_id     = metra_stops$stop_id,
  name       = metra_stops$stop_name,
  lat        = as.numeric(metra_stops$stop_lat),
  lon        = as.numeric(metra_stops$stop_lon),
  wheelchair = suppressWarnings(as.integer(metra_stops$wheelchair_boarding))
)

# --- CTA "L": the location_type = 1 parent stations are the rail stations --
cta_stops <- read_gtfs(file.path(IN_DIR, "cta-gtfs.zip"), "stops.txt")
cta_rail  <- cta_stops[location_type == "1"]
cta <- data.table(
  network    = "cta_rail",
  src_id     = cta_rail$stop_id,
  name       = cta_rail$stop_name,
  lat        = as.numeric(cta_rail$stop_lat),
  lon        = as.numeric(cta_rail$stop_lon),
  wheelchair = suppressWarnings(as.integer(cta_rail$wheelchair_boarding))
)

# --- CrossTowner: only stops an X-route actually serves --------------------
xr_stops <- read_gtfs(file.path(IN_DIR, "crosstowner-xroutes-gtfs.zip"), "stops.txt")
xr_times <- read_gtfs(file.path(IN_DIR, "crosstowner-xroutes-gtfs.zip"), "stop_times.txt")
served   <- unique(xr_times$stop_id)
xr_srv   <- xr_stops[stop_id %in% served]
xr <- data.table(
  network    = "crosstowner",
  src_id     = xr_srv$stop_id,
  name       = xr_srv$stop_name,
  lat        = as.numeric(xr_srv$stop_lat),
  lon        = as.numeric(xr_srv$stop_lon),
  wheelchair = if ("wheelchair_boarding" %in% names(xr_srv))
                 suppressWarnings(as.integer(xr_srv$wheelchair_boarding)) else NA_integer_
)

# --- Red Line Extension: the CTA project under construction. Its stations
#     are NOT in CTA's published feed yet, so we add them from our scenario
#     feed. The existing 95th/Dan Ryan terminal will dedup-merge with the
#     published CTA 95th; the four new stations (103rd, 111th, Michigan/116th,
#     130th) are future-only (exists_today = false). -----------------------
rle_stops <- read_gtfs(file.path(IN_DIR, "redline-extension-gtfs.zip"), "stops.txt")
rle <- data.table(
  network    = "rle",
  src_id     = rle_stops$stop_id,
  name       = rle_stops$stop_name,
  lat        = as.numeric(rle_stops$stop_lat),
  lon        = as.numeric(rle_stops$stop_lon),
  wheelchair = NA_integer_
)

all_stops <- rbindlist(list(metra, cta, xr, rle), use.names = TRUE)
cat(sprintf("Loaded: %d Metra + %d CTA-L + %d CrossTowner + %d RLE = %d raw stops\n",
            nrow(metra), nrow(cta), nrow(xr), nrow(rle), nrow(all_stops)))

# ---------------------------------------------------------------------------
# 2. Dedup within 150 m (distance only), greedy single pass.
#    We prefer a real (Metra/CTA) station as the cluster representative and
#    use its coordinates/name, because CrossTowner coordinates are derived
#    from the real platforms anyway.
# ---------------------------------------------------------------------------
MERGE_M <- 150

# Order so a real (existing) station is most likely to seed each cluster;
# CrossTowner and RLE (both future) rank last.
network_rank <- c(metra = 1, cta_rail = 2, crosstowner = 3, rle = 4)
all_stops[, rank := network_rank[network]]
setorder(all_stops, rank)
all_stops[, assigned := FALSE]
all_stops[, cluster  := NA_integer_]

merges <- list()          # audit rows for station_dedup_report.csv
next_cluster <- 0L
for (i in seq_len(nrow(all_stops))) {
  if (all_stops$assigned[i]) next
  next_cluster <- next_cluster + 1L
  # Distance from this seed to every not-yet-assigned stop.
  d <- haversine_m(all_stops$lat[i], all_stops$lon[i],
                   all_stops$lat, all_stops$lon)
  hit <- which(!all_stops$assigned & d <= MERGE_M)
  all_stops$assigned[hit] <- TRUE
  all_stops$cluster[hit]  <- next_cluster
  if (length(hit) > 1) {
    merges[[length(merges) + 1]] <- data.table(
      cluster = next_cluster,
      members = paste(sprintf("%s:%s", all_stops$network[hit],
                              all_stops$name[hit]), collapse = " | "),
      max_m   = round(max(d[hit]))
    )
  }
}

# ---------------------------------------------------------------------------
# 3. Collapse each cluster to one canonical station.
# ---------------------------------------------------------------------------
canon <- all_stops[, {
  # Representative = the top-ranked (most "real") member.
  rep_i <- which.min(rank)
  list(
    name           = name[rep_i],
    lat            = lat[rep_i],
    lon            = lon[rep_i],
    on_metra       = any(network == "metra"),
    on_cta_rail    = any(network == "cta_rail"),
    on_crosstowner = any(network == "crosstowner"),
    on_rle         = any(network == "rle"),
    # wheelchair: 1 if any member is accessible, else the representative's value
    wheelchair     = { w <- wheelchair[!is.na(wheelchair)]
                       if (length(w)) as.integer(any(w == 1)) else NA_integer_ }
  )
}, by = cluster]

# exists_today = reachable on today's network (Metra or CTA rail). CrossTowner-
# only infill stations are false; the frontend will snap trips near them to the
# nearest real stop on the "today" network via the street graph.
canon[, exists_today := on_metra | on_cta_rail]

# Stable id = slug(name) + short hash of rounded coords, so re-runs keep ids.
slugify <- function(x) {
  x <- tolower(x)
  x <- gsub("[^a-z0-9]+", "-", x)
  gsub("(^-|-$)", "", x)
}
coord_hash <- function(lat, lon) {
  # 4-char hash of the coordinate string; enough to disambiguate same-named
  # stations on parallel lines.
  substr(sprintf("%x", sapply(sprintf("%.4f,%.4f", lat, lon),
                              function(s) sum(utf8ToInt(s) * seq_along(utf8ToInt(s))))),
         1, 4)
}
canon[, id := paste0(slugify(name), "-", coord_hash(lat, lon))]
# Guard against any residual id collision.
if (anyDuplicated(canon$id)) canon[, id := paste0(id, "-", .I)]

setorder(canon, name)
cat(sprintf("Deduped to %d canonical stations (%d merges)\n",
            nrow(canon), length(merges)))
cat(sprintf("  on_metra=%d  on_cta_rail=%d  on_crosstowner=%d  on_rle=%d  exists_today=%d\n",
            sum(canon$on_metra), sum(canon$on_cta_rail),
            sum(canon$on_crosstowner), sum(canon$on_rle), sum(canon$exists_today)))

# ---------------------------------------------------------------------------
# 4. Write outputs.
# ---------------------------------------------------------------------------
out <- canon[, .(
  id, name,
  lat = round(lat, 6), lon = round(lon, 6),
  on_metra, on_cta_rail, on_crosstowner, on_rle, exists_today,
  wheelchair
)]
write_json(out, file.path(OUT_DIR, "stations.json"),
           dataframe = "rows", auto_unbox = TRUE, pretty = FALSE)

if (length(merges)) {
  fwrite(rbindlist(merges), file.path(OUT_DIR, "station_dedup_report.csv"))
}

cat(sprintf("Wrote %s (%d stations) and the dedup report.\n",
            file.path(OUT_DIR, "stations.json"), nrow(out)))
