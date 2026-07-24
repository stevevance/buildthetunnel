# Map the O'Hare transit LABOR SHED and how CrossTowner expands it: block groups
# from which an O'Hare rail gateway is reachable within 60 min by transit+walk,
# today (base) vs the extra ones added by the CrossTowner + Red Line Extension
# scenario. This is the visual of "the applicant pool an O'Hare employer can reach."
suppressPackageStartupMessages({library(sf); library(data.table); library(ggplot2)})
SP  <- "/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/0dcac289-c6a5-450b-8cca-bd186b4c4593/scratchpad"
OUT <- "/Users/stevevance/Sites/BuildTheTunnel/analysis/results"
CUT <- 60

tt <- fread(file.path(OUT,"ohare_labor_shed_bg.csv"), colClasses=list(character="GEOID"))
bg <- st_read(file.path(SP,"tl_2020_17_bg.shp"), quiet=TRUE)
metro <- c("031","043","089","093","097","111","197")
CRS <- 3435   # NAD83 / Illinois East (ftUS) — the local Chicago standard
bg <- st_transform(bg[bg$COUNTYFP %in% metro, c("GEOID","geometry")], CRS)
bg <- merge(bg, tt[, .(GEOID, today, scenario)], by="GEOID", all.x=TRUE)

bg$cls <- "beyond"
bg$cls[!is.na(bg$scenario) & bg$scenario<=CUT] <- "added"   # reachable in scenario
bg$cls[!is.na(bg$today)    & bg$today   <=CUT] <- "today"    # reachable today (overrides)
bg$cls <- factor(bg$cls, levels=c("today","added","beyond"))

cty <- aggregate(bg["GEOID"], by=list(substr(bg$GEOID,1,5)), FUN=function(x) x[1])
ccas <- st_transform(st_read(file.path(SP,"chicago_cca.geojson"), quiet=TRUE), CRS)
op <- st_coordinates(st_transform(st_sfc(st_point(c(-87.9042,41.9777)), crs=4326), CRS))
ox <- op[1]; oy <- op[2]
# crop to the labor shed itself (today + added), padded, so the added band is
# legible instead of squashed against a full-metro view of empty grey. Note: this
# frames roughly the ≤60-min reach, so the Far South Side (beyond 60 min even in
# the scenario) sits outside the frame.
cb <- st_bbox(bg[!is.na(bg$cls) & bg$cls!="beyond", ]); pad <- 6000

pal <- c(today="#1e6091", added="#f4a300", beyond="#eef1f2")
p <- ggplot() +
  geom_sf(data=bg, aes(fill=cls), color="white", linewidth=0.02) +
  geom_sf(data=cty, fill=NA, color="grey55", linewidth=0.3) +
  geom_sf(data=ccas, fill=NA, color="#111", linewidth=0.28) +
  geom_point(aes(x=ox, y=oy), shape=23, fill="#e63946",
             color="white", size=3.4, stroke=0.7) +
  annotate("text", x=ox, y=oy+9000, label="O'Hare",
           fontface="bold", size=3.2, color="#e63946") +
  scale_fill_manual(values=pal, name=NULL,
      labels=c(today="Within 60 min of O'Hare by transit today",
               added="Added by CrossTowner + Red Line Extension",
               beyond="Beyond 60 min"), drop=FALSE) +
  coord_sf(xlim=c(cb["xmin"]-pad,cb["xmax"]+pad), ylim=c(cb["ymin"]-pad,cb["ymax"]+pad), crs=CRS, expand=FALSE) +
  labs(title="CrossTowner widens O'Hare's transit labor shed",
       subtitle="Neighborhoods from which a worker can reach an O'Hare rail gateway in ≤60 min by transit,\nweekday 8 AM. CrossTowner + the Red Line Extension add ~48,500 employed residents to the pool.",
       caption="Routing: r5r / Conveyal R5 over CTA + Metra + Pace (today) and + CrossTowner X-routes + Red Line Extension (scenario). 2020 Census block groups.") +
  theme_void(base_size=12) +
  theme(legend.position=c(0.18,0.13),
        legend.background=element_rect(fill="white", color="grey80"),
        legend.key.size=unit(12,"pt"), legend.text=element_text(size=8.5),
        plot.title=element_text(face="bold", size=16),
        plot.subtitle=element_text(size=9.5, color="grey30"),
        plot.caption=element_text(size=7, color="grey45"))
outpng <- file.path(OUT,"ohare_labor_shed_map.png")
ggsave(outpng, p, width=8.5, height=9.5, dpi=150, bg="white")
cat("wrote", outpng, "\n")
cat(sprintf("today<=60 BGs: %d  | added: %d\n",
    sum(bg$cls=="today",na.rm=TRUE), sum(bg$cls=="added",na.rm=TRUE)))
