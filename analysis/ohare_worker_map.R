# Map: where O'Hare's ~50,000 workers live (LODES 2023). Tract choropleth of
# resident O'Hare workers across the 7-county metro, with the airport marked.
suppressPackageStartupMessages({library(sf); library(data.table); library(ggplot2)})
SP  <- "/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/0dcac289-c6a5-450b-8cca-bd186b4c4593/scratchpad"
OUT <- "/Users/stevevance/Sites/BuildTheTunnel/analysis/results"

TOTAL_ALL <- 48921L   # airport-only (on-airfield blocks); tracts below map IL residents only
trk <- fread(file.path(OUT,"ohare_worker_homes_tract.csv"), colClasses=list(character="trctid"))
CRS <- 3435   # NAD83 / Illinois East (ftUS) — the local Chicago standard
tr  <- st_read(file.path(SP,"tl_2020_17_tract.shp"), quiet=TRUE)
metro <- c("031","043","089","093","097","111","197")
tr <- st_transform(tr[tr$COUNTYFP %in% metro, c("GEOID","ALAND","geometry")], CRS)
tr <- merge(tr, trk[, .(GEOID=trctid, workers)], by="GEOID", all.x=TRUE)
tr$workers[is.na(tr$workers)] <- 0
tot <- sum(trk$workers)

# county outlines (dissolve tracts) for context
cty <- st_read(file.path(SP,"tl_2020_17_tract.shp"), quiet=TRUE)
cty <- st_transform(cty[cty$COUNTYFP %in% metro, ], CRS)
cty$cf <- cty$COUNTYFP
cty <- aggregate(cty["cf"], by=list(cty$COUNTYFP), FUN=function(x) x[1])

op <- st_coordinates(st_transform(st_sfc(st_point(c(-87.9042,41.9777)), crs=4326), CRS))
ox <- op[1]; oy <- op[2]
cb <- st_bbox(st_transform(st_as_sfc(st_bbox(c(xmin=-88.45,ymin=41.45,xmax=-87.5,ymax=42.5), crs=st_crs(4326))), CRS))
ccas <- st_transform(st_read(file.path(SP,"chicago_cca.geojson"), quiet=TRUE), CRS)

# Binned scale (workers per tract). Most tracts are small; a few near the airport
# and along the NW corridor are high. Bin for legibility.
brks <- c(-1, 0, 5, 15, 30, 60, 100, Inf)
labs <- c("0","1–5","6–15","16–30","31–60","61–100","100+")
tr$bin <- cut(tr$workers, breaks=brks, labels=labs)

pal <- c("0"="#f2f2f2","1–5"="#d9ed92","6–15"="#99d98c","16–30"="#52b69a",
         "31–60"="#168aad","61–100"="#1e6091","100+"="#0b3d5c")

p <- ggplot() +
  geom_sf(data=tr, aes(fill=bin), color="white", linewidth=0.03) +
  geom_sf(data=cty, fill=NA, color="grey55", linewidth=0.3) +
  geom_sf(data=ccas, fill=NA, color="#333", linewidth=0.18) +
  geom_point(aes(x=ox, y=oy), shape=23, fill="#e63946",
             color="white", size=3.4, stroke=0.7) +
  annotate("text", x=ox, y=oy+9000, label="O'Hare",
           fontface="bold", size=3.2, color="#e63946") +
  scale_fill_manual(values=pal, name="O'Hare workers\nliving in tract", drop=FALSE) +
  coord_sf(xlim=c(cb["xmin"],cb["xmax"]), ylim=c(cb["ymin"],cb["ymax"]), crs=CRS, expand=FALSE) +
  labs(title="Where O'Hare's workforce lives",
       subtitle=sprintf("%s workers employed at O'Hare, by home census tract (LEHD LODES 2023, primary jobs).\n30.7%% live in Chicago, 53.2%% in the suburbs/collar counties, 12.0%% out of state (Illinois residents mapped).", format(TOTAL_ALL, big.mark=",")),
       caption="Workplace = on-airfield (zero-resident) census blocks of Chicago community area #76 (O'Hare). Home geography from LODES OD (JT01). 7-county CMAP region shown.") +
  theme_void(base_size=12) +
  theme(legend.position=c(0.82,0.24),
        legend.background=element_rect(fill="white", color="grey80"),
        legend.key.size=unit(11,"pt"), legend.title=element_text(size=8.5, face="bold"),
        legend.text=element_text(size=8),
        plot.title=element_text(face="bold", size=16),
        plot.subtitle=element_text(size=9.5, color="grey30"),
        plot.caption=element_text(size=7, color="grey45"))
outpng <- file.path(OUT,"ohare_worker_residences_map.png")
ggsave(outpng, p, width=8.5, height=9.5, dpi=150, bg="white")
cat("wrote", outpng, "\n")
# quick check: how much of the workforce is inside the mapped metro tracts?
cat(sprintf("workers in mapped metro tracts: %s of %s IL-tract workers (%.1f%%)\n",
    format(sum(tr$workers), big.mark=","), format(tot, big.mark=","), 100*sum(tr$workers)/tot))
