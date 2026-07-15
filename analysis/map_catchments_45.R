# Map the 45-minute transit+walk catchment (population that can reach the venue
# in <=45 min, home->venue) for all six venues, as a 6-panel small-multiple.
# Baseline = present-day CTA+Metra+Pace ("today"). On the 78 panel, the extra
# block groups reachable only once the Red Line infill station is added are
# overlaid in a second colour.
options(java.parameters = "-Xmx12G")
Sys.setenv(JAVA_HOME = "/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home")
suppressPackageStartupMessages({library(r5r); library(data.table); library(sf); library(ggplot2)})
sp <- "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/f5bb1ab6-a48c-48f9-aaea-e4546a6de112/scratchpad"

# --- origins (block group pop-weighted centroids) & venues --------------------
bg <- fread(file.path(sp, "CenPop2020_BG17.txt"))
setnames(bg, c("STATEFP","COUNTYFP","TRACTCE","BLKGRPCE","POPULATION","LATITUDE","LONGITUDE"),
             c("st","co","tr","bg","pop","lat","lon"))
bg[, id := sprintf("%02d%03d%06d%01d", st, co, tr, bg)]
bg[, `:=`(lat=as.numeric(lat), lon=as.numeric(lon), pop=as.numeric(pop))]
bg <- bg[lon >= -88.45 & lon <= -87.5 & lat >= 41.4 & lat <= 42.45 & pop > 0]
origins <- bg[, .(id, lon, lat)]
# Destinations are pedestrian ENTRANCES (OSM entrance=* nodes), not building
# centroids -- the centroid of a big stadium snaps to a far street edge and
# inflates every egress walk (this is what wrongly made Soldier Field look like
# a transit desert). Soldier Field uses OSM node 7161257723 (user-provided);
# the rest use mapped entrance nodes; Rate Field has none mapped, so the 35th St
# main gate is used.
# Pedestrian entrances (OSM nodes), verified to sit on each venue's footprint:
#   Soldier Field  node 7161257723 (entrance=yes)
#   Wrigley Field  node 11757731204 (Gate 3, CD Peacock Premier Entrance)
#   Rate Field     node 11926993379 (Gate 4)
#   United Center  entrance=yes node; Wintrust Arena entrance=yes node
#   The 78         entrance=main node on the site
dest <- data.table(
  id  = c("The 78 (Fire stadium)","Soldier Field","Wrigley Field",
          "Rate Field (Sox)","United Center","Wintrust Arena"),
  lat = c( 41.85904,  41.860879,  41.9475418,  41.8306202,  41.88124,  41.85259),
  lon = c(-87.63237, -87.616559, -87.6565032, -87.6350068, -87.67421, -87.62029))
dep <- as.POSIXct("2026-07-14 12:00:00", tz = "America/Chicago")

ttm_of <- function(nd){
  r5 <- build_network(nd)
  m <- travel_time_matrix(r5, origins=origins, destinations=dest,
        mode=c("TRANSIT","WALK"), departure_datetime=dep, time_window=60,
        percentiles=50, max_trip_duration=60, max_walk_time=20, walk_speed=4.43,
        progress=FALSE)
  r5r::stop_r5(); gc(); m <- as.data.table(m)
  setnames(m, grep("travel_time", names(m), value=TRUE)[1], "tt"); m
}
# Cache the travel-time matrices keyed on the venue points, so style-only
# re-runs (labels, panel size, colours) skip the ~4-minute routing. Delete
# results/.catchment_ttm_cache.rds (or change a venue coord) to force a re-route.
ttm_cache <- "analysis/results/.catchment_ttm_cache.rds"
dest_key  <- paste(dest$id, dest$lat, dest$lon, collapse="|")
if (file.exists(ttm_cache) && identical(readRDS(ttm_cache)$key, dest_key)) {
  cc <- readRDS(ttm_cache); base <- cc$base; sc78 <- cc$sc78
  cat("loaded cached travel-time matrices (venue points unchanged)\n")
} else {
  base <- ttm_of("/Users/stevevance/Sites/BuildTheTunnel/analysis/networks/today")
  sc78 <- ttm_of("/Users/stevevance/Sites/BuildTheTunnel/analysis/networks/scenario_78station")
  saveRDS(list(key=dest_key, base=base, sc78=sc78), ttm_cache)
}

# reachable-<=45 block group ids per venue (baseline)
base45 <- base[tt<=45, .(GEOID=from_id, venue=to_id)]
# extra ids reachable only with the 78 station (78 venue only)
b78 <- base[to_id=="The 78 (Fire stadium)" & tt<=45, from_id]
s78 <- sc78[to_id=="The 78 (Fire stadium)" & tt<=45, from_id]
extra78 <- setdiff(s78, b78)
cat("78 baseline<=45 BGs:", length(b78), " with-station:", length(s78),
    " gained:", length(extra78), "\n")

# --- geometry: TIGER block groups, 7-county metro ----------------------------
bgsf <- st_read(file.path(sp,"tiger_bg","tl_2020_17_bg.shp"), quiet=TRUE)
metro <- c("031","043","089","093","097","111","197")
# Keep ALAND (land area, sq m) so we can report catchment square mileage.
bgsf <- bgsf[bgsf$COUNTYFP %in% metro, c("GEOID","ALAND","geometry")]
bgsf <- st_transform(bgsf, 4326)

# --- per-venue population reached + catchment land area (panel labels) --------
# Population = summed 2020 pop of every block group in the <=45-min catchment.
# Area = summed ALAND (converted to square miles) of those same block groups.
bgpop  <- bg[, .(GEOID=id, pop)]
bgarea <- as.data.table(st_drop_geometry(bgsf))[, .(GEOID, aland_sqm=as.numeric(ALAND))]
venstat <- base45[, .(GEOID, venue)]
venstat <- merge(venstat, bgpop,  by="GEOID", all.x=TRUE)
venstat <- merge(venstat, bgarea, by="GEOID", all.x=TRUE)
venlab <- venstat[, .(pop = sum(pop, na.rm=TRUE),
                      sqmi = sum(aland_sqm, na.rm=TRUE) / 2589988.11), by=venue]
setnames(venlab, "venue", "id")
venlab[, label := sprintf("%s\n%.2fM people · %.0f sq mi", id, pop/1e6, sqmi)]
setorder(venlab, id)
cat("\n=== 45-minute catchment, population reached + land area ===\n")
print(venlab[match(dest$id, id), .(id, pop, sqmi=round(sqmi))])

# --- the 78 Red Line infill station: how much does it add to the catchment? ---
infill <- merge(data.table(GEOID=extra78), bgpop,  by="GEOID", all.x=TRUE)
infill <- merge(infill, bgarea, by="GEOID", all.x=TRUE)
base78_pop  <- venlab[id=="The 78 (Fire stadium)", pop]
base78_sqmi <- venlab[id=="The 78 (Fire stadium)", sqmi]
add_pop  <- sum(infill$pop, na.rm=TRUE)
add_sqmi <- sum(infill$aland_sqm, na.rm=TRUE) / 2589988.11
cat(sprintf("\n=== The 78 Red Line infill station adds ===\n  +%s people (%+.1f%%), +%.1f sq mi (%+.1f%%), across %d block groups\n",
    format(add_pop, big.mark=","), 100*add_pop/base78_pop,
    add_sqmi, 100*add_sqmi/base78_sqmi, nrow(infill)))

# background land (dissolved metro) for context / shoreline
land <- st_union(bgsf)

# build a long sf: one row per (venue, BG-in-catchment)
panels <- rbindlist(lapply(dest$id, function(v){
  ids <- base45[venue==v, GEOID]
  data.table(GEOID=ids, venue=v, layer="baseline")
}))
# add the 78 gained BGs as their own layer on the 78 panel
panels <- rbind(panels, data.table(GEOID=extra78, venue="The 78 (Fire stadium)",
                                    layer="with_infill_station"))
panels <- merge(panels, bgsf, by="GEOID"); panels <- st_as_sf(panels)
panels$venue <- factor(panels$venue, levels=dest$id)

# Facet strip labels carrying population reached + catchment square mileage.
lab_vec <- setNames(venlab$label, venlab$id)[dest$id]
panels$venue    <- factor(panels$venue, levels=dest$id, labels=lab_vec)
venpts <- st_as_sf(dest, coords=c("lon","lat"), crs=4326)
venpts$venue <- factor(venpts$id, levels=dest$id, labels=lab_vec)
landdf <- st_sf(geometry=land)

# --- real hydrography from the Cityscape m_waterways_chicago_hydro layer ------
hydro  <- st_make_valid(st_read(file.path(sp,"hydro.geojson"), quiet=TRUE))
water  <- hydro[hydro$name %in% c("LAKE MICHIGAN","WOLF LAKE"), ]
rivers <- hydro[grepl("RIVER|CANAL|CHANNEL", hydro$name), ]

# --- CTA Red & Green line geometries from view_places (ctaline-*-all) --------
# The CTA GTFS in r5r_network_inputs has no shapes.txt, so the line geometry is
# exported from the authoritative Cityscape view_places layer to
# results/cta_red_green_lines.geojson. Layers carry no `venue` column, so ggplot
# replicates them into every facet panel.
ctalines <- st_read("analysis/results/cta_red_green_lines.geojson", quiet=TRUE)
cta_red   <- ctalines[grepl("Red",   ctalines$line), ]
cta_green <- ctalines[grepl("Green", ctalines$line), ]

# --- plot --------------------------------------------------------------------
# Frame = the extent that actually holds the catchments, so nothing clips.
# Use robust quantiles of block-group centroids to ignore a handful of far-flung
# Metra outliers, then pad slightly. (Previously a fixed frame clipped Rate
# Field's southern reach.)
cent <- st_coordinates(st_centroid(st_geometry(panels)))
qx <- quantile(cent[,1], c(0.004, 0.996)); qy <- quantile(cent[,2], c(0.004, 0.996))
xlim <- c(qx[1]-0.01, qx[2]+0.01); ylim <- c(qy[1]-0.01, qy[2]+0.01)
cat(sprintf("frame: lon[%.3f,%.3f] lat[%.3f,%.3f]\n", xlim[1],xlim[2],ylim[1],ylim[2]))
# Draw order: land (grey) -> catchments -> real lake polygon on top (masks the
# coastal block-group overhang into the water) -> rivers -> venue points.
p <- ggplot() +
  geom_sf(data=landdf, fill="grey90", color=NA) +
  geom_sf(data=panels[panels$layer=="baseline",], aes(fill=layer), color=NA) +
  geom_sf(data=panels[panels$layer=="with_infill_station",], aes(fill=layer), color=NA) +
  geom_sf(data=water,  fill="#cfe6f2", color=NA) +
  geom_sf(data=rivers, fill="#cfe6f2", color="#cfe6f2", linewidth=0.15) +
  # CTA Red & Green lines on every panel (drawn over the catchment fill).
  geom_sf(data=cta_red,   color="#C60C30", linewidth=0.45) +
  geom_sf(data=cta_green, color="#009B3A", linewidth=0.45) +
  geom_sf(data=venpts, shape=21, fill="black", color="white", size=2.4, stroke=0.6) +
  facet_wrap(~venue, ncol=3) +
  scale_fill_manual(values=c(baseline="#2166ac", with_infill_station="#f4a300"),
        labels=c(baseline="Reachable ≤45 min (today)",
                 with_infill_station="Added by 78 Red Line infill station"),
        name=NULL) +
  coord_sf(xlim=xlim, ylim=ylim, expand=FALSE) +
  labs(title="45-minute transit + walk catchment of six Chicago venues",
       subtitle=paste0("Block groups from which the venue is reachable in ≤45 min by ",
                       "transit+walk (weekday midday).\nGrey = land; blue = Lake Michigan; ",
                       "CTA Red & Green lines shown."),
       caption="Routing: r5r/R5 on present-day CTA+Metra+Pace. Population geometry: 2020 Census block groups (TIGER). ★ = venue.") +
  theme_void(base_size=12) +
  theme(legend.position="bottom",
        strip.text=element_text(face="bold", size=9.5, lineheight=0.95, margin=margin(4,0,4,0)),
        plot.title=element_text(face="bold", size=15),
        plot.subtitle=element_text(size=9, color="grey30"),
        plot.caption=element_text(size=7, color="grey45"),
        panel.spacing=unit(6,"pt"))
outpng <- "/Users/stevevance/Sites/BuildTheTunnel/analysis/results/venue_catchments_45min.png"
ggsave(outpng, p, width=17, height=9.5, dpi=150, bg="white")
cat("wrote", outpng, "\n")
