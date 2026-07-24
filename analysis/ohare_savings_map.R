# Travel-time-SAVINGS map: how many minutes CrossTowner + the Red Line Extension
# cut from the transit trip to an O'Hare gateway, per block group, with the
# scenario's 45/60/75-minute reach drawn as nested "bands" (isochrone rings).
# This shows what the 60-min catchment map hides: broad time savings across the
# South and West Sides even where the trip stays above 60 minutes.
suppressPackageStartupMessages({library(sf); library(data.table); library(ggplot2)})
SP  <- "/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/0dcac289-c6a5-450b-8cca-bd186b4c4593/scratchpad"
OUT <- "/Users/stevevance/Sites/BuildTheTunnel/analysis/results"

tt <- fread(file.path(OUT,"ohare_labor_shed_bg.csv"), colClasses=list(character="GEOID"))
# employed residents per BG (for the caption stat)
rac <- fread(cmd=paste("gzcat", shQuote(file.path(SP,"il_rac_S000_JT01_2023.csv.gz"))),
             colClasses=list(character="h_geocode"), select=c("h_geocode","C000"))
rac[, GEOID := substr(h_geocode,1,12)]
tt <- merge(tt, rac[, .(wres=sum(C000)), by=GEOID], by="GEOID", all.x=TRUE)
tt[is.na(wres), wres:=0]

# savings (minutes) where both networks reach within the 90-min routing cap;
# "newly" = no <=90 trip today but <=75 in scenario
tt[, saved := today - scenario]
tt[, cls := fcase(
    is.na(today) & !is.na(scenario) & scenario<=75, "new",
    !is.na(saved) & saved>=15, "s15",
    !is.na(saved) & saved>=10, "s10",
    !is.na(saved) & saved>=5,  "s5",
    !is.na(saved) & saved>=1,  "s1",
    !is.na(saved),             "s0",
    default=NA_character_)]

# caption stat: employed residents getting a >=5-min faster O'Hare trip
r5 <- tt[cls %in% c("s5","s10","s15"), sum(wres)]
rnew <- tt[cls=="new", sum(wres)]
cat(sprintf("employed residents >=5 min faster: %s ; newly reachable(<=75): %s\n",
    format(r5,big.mark=","), format(rnew,big.mark=",")))

CRS <- 3435   # NAD83 / Illinois East (ftUS) — the local Chicago standard
bg <- st_read(file.path(SP,"tl_2020_17_bg.shp"), quiet=TRUE)
metro <- c("031","043","089","093","097","111","197")
bg <- st_transform(bg[bg$COUNTYFP %in% metro, c("GEOID","geometry")], CRS)
bg <- merge(bg, tt[, .(GEOID, scenario, cls)], by="GEOID", all.x=TRUE)
ccas <- st_transform(st_read(file.path(SP,"chicago_cca.geojson"), quiet=TRUE), CRS)

# nested scenario reach bands (dissolved) -> ring outlines
band <- function(k) st_union(bg[!is.na(bg$scenario) & bg$scenario<=k, ])
b45 <- st_sf(band="≤45 min", geometry=st_boundary(band(45)))
b60 <- st_sf(band="≤60 min", geometry=st_boundary(band(60)))
b75 <- st_sf(band="≤75 min", geometry=st_boundary(band(75)))
bands <- rbind(b45,b60,b75); bands$band <- factor(bands$band, levels=c("≤45 min","≤60 min","≤75 min"))

# focus extent = the ≤75-min scenario reach, padded (feet)
fb <- st_bbox(band(75)); pad <- 4000
xlim <- c(fb["xmin"]-pad, fb["xmax"]+pad); ylim <- c(fb["ymin"]-pad, fb["ymax"]+pad)

op <- st_coordinates(st_transform(st_sfc(st_point(c(-87.9042,41.9777)), crs=4326), CRS))
ox <- op[1]; oy <- op[2]
lv <- c("s0","s1","s5","s10","s15","new")
bg$cls <- factor(bg$cls, levels=lv)
pal <- c(s0="#eef1f2", s1="#cfe8c9", s5="#8fd08a", s10="#3fa85a", s15="#0b7a3b", new="#6a3d9a")
labs <- c(s0="No change", s1="1–4 min faster", s5="5–9 min faster",
          s10="10–14 min faster", s15="15+ min faster", new="Newly reachable (≤75 min)")

p <- ggplot() +
  geom_sf(data=bg[!is.na(bg$cls),], aes(fill=cls), color="white", linewidth=0.02) +
  geom_sf(data=ccas, fill=NA, color="#333", linewidth=0.22) +
  geom_sf(data=bands, aes(color=band), fill=NA, linewidth=0.55) +
  geom_point(aes(x=ox, y=oy), shape=23, fill="#e63946",
             color="white", size=3.6, stroke=0.8) +
  annotate("text", x=ox, y=oy+6500, label="O'Hare",
           fontface="bold", size=3.3, color="#e63946") +
  scale_fill_manual(values=pal, labels=labs, name="Minutes CrossTowner cuts\nfrom the O'Hare trip", drop=FALSE) +
  scale_color_manual(values=c("≤45 min"="#08306b","≤60 min"="#2171b5","≤75 min"="#6baed6"),
                     name="Scenario reach (bands)") +
  coord_sf(xlim=xlim, ylim=ylim, crs=CRS, expand=FALSE) +
  guides(fill=guide_legend(order=1), color=guide_legend(order=2, override.aes=list(fill=NA))) +
  labs(title="Where CrossTowner speeds up the trip to O'Hare",
       subtitle="Travel-time saved per neighborhood on the transit trip to an O'Hare gateway (today − scenario),\nweekday 8 AM. Rings mark how far the 45-, 60-, and 75-minute scenario commute reaches.",
       caption="Routing: r5r / Conveyal R5 over CTA + Metra + Pace (today) vs. + CrossTowner X-routes + Red Line Extension. 2020 Census block groups.") +
  theme_void(base_size=12) +
  theme(legend.position="right", legend.box="vertical",
        legend.title=element_text(size=8.5, face="bold"), legend.text=element_text(size=8),
        legend.key.size=unit(12,"pt"),
        plot.title=element_text(face="bold", size=15.5),
        plot.subtitle=element_text(size=9, color="grey30"),
        plot.caption=element_text(size=6.7, color="grey45"))
outpng <- file.path(OUT,"ohare_savings_map.png")
ggsave(outpng, p, width=9.5, height=8.5, dpi=150, bg="white")
cat("wrote", outpng, "\n")
print(tt[!is.na(cls), .(BGs=.N, emp_res=sum(wres)), by=cls][order(match(cls,lv))])
