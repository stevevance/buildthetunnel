# Where do O'Hare workers actually live? Census LEHD LODES v8.4 (2023) extraction.
#
# 1. Define O'Hare's WORKPLACE blocks = 2020 census blocks whose centroid falls
#    inside Chicago community area #76 ("O'Hare"), which is the airport footprint
#    plus its small residential pocket. The whole airport is in the O'Hare CCA.
# 2. From the LODES Origin-Destination files (primary jobs, JT01), keep every
#    job whose WORK block is an O'Hare block, and aggregate by HOME block.
#    - main file = worker lives in Illinois; aux file = worker lives out of state.
# 3. Join home blocks to the LODES crosswalk (county, municipality, ZCTA, block
#    lat/lon) to describe and map the residential geography.
#
# Output: total O'Hare workers, home-geography breakdowns, and a block-level
# home table with lat/lon for mapping. This is the map "nobody has published."
suppressPackageStartupMessages({library(sf); library(data.table)})
SP  <- "/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/0dcac289-c6a5-450b-8cca-bd186b4c4593/scratchpad"
OUT <- "/Users/stevevance/Sites/BuildTheTunnel/analysis/results"
gz  <- function(f) fread(cmd = paste("gzcat", shQuote(file.path(SP, f))),
                         colClasses = list(character = c("w_geocode","h_geocode","tabblk2020")))

# --- 1. O'Hare workplace blocks ----------------------------------------------
cca <- st_read(file.path(SP,"chicago_cca.geojson"), quiet=TRUE)
ohare <- st_transform(cca[cca$community=="OHARE", ], 4326)
bb <- st_as_sfc(st_bbox(ohare))                     # push a spatial filter to the read
blkzip <- file.path(SP, "tl_2020_17_tabblock20.shp")
blk <- st_read(blkzip, wkt_filter = st_as_text(bb), quiet=TRUE)  # only blocks near O'Hare
blk <- st_transform(blk[, c("GEOID20","POP20","geometry")], 4326)
inside <- st_within(st_point_on_surface(blk), ohare, sparse=FALSE)[,1]
# Airport-only: on-airfield blocks = inside CCA #76 AND zero residents (POP20==0),
# which drops the small adjacent residential pocket so "O'Hare workers" means people
# working ON the airport, not local retail/hotel jobs in the residential sliver.
wblocks <- blk$GEOID20[inside & as.integer(blk$POP20)==0]
cat(sprintf("O'Hare airfield workplace blocks: %d (of %d in bbox)\n", length(wblocks), nrow(blk)))
wset <- unique(wblocks)

# --- 2. LODES OD: jobs whose WORK block is O'Hare, aggregated by HOME block ----
pull <- function(f){ d <- gz(f); d[w_geocode %chin% wset, .(jobs=sum(S000)), by=h_geocode] }
main <- pull("il_od_main_JT01_2023.csv.gz")   # home in IL
aux  <- pull("il_od_aux_JT01_2023.csv.gz")    # home out of state
home <- rbind(main, aux)[, .(jobs=sum(jobs)), by=h_geocode]
total <- home[, sum(jobs)]
cat(sprintf("O'Hare workers (LODES 2023, primary jobs): %s\n", format(total, big.mark=",")))
cat(sprintf("  live in Illinois: %s   |   out of state: %s\n",
            format(main[,sum(jobs)], big.mark=","), format(aux[,sum(jobs)], big.mark=",")))

# --- 3. Join crosswalk (county / place / zcta / block lat-lon) ----------------
xw <- fread(cmd = paste("gzcat", shQuote(file.path(SP,"il_xwalk.csv.gz"))),
            colClasses = list(character = "tabblk2020"),
            select = c("tabblk2020","cty","ctyname","trct","zcta","zctaname",
                       "stplc","stplcname","blklatdd","blklondd"))
h <- merge(home, xw, by.x="h_geocode", by.y="tabblk2020", all.x=TRUE)
# out-of-state homes won't match the IL crosswalk -> label by state FIPS
h[is.na(ctyname), ctyname := paste0("[out of state ", substr(h_geocode,1,2), "]")]
h[is.na(stplcname) | stplcname=="", stplcname := ctyname]
fwrite(h, file.path(OUT,"ohare_worker_homes_block.csv"))

pct <- function(x) sprintf("%.1f%%", 100*x/total)

# Chicago vs suburban Cook vs collar counties vs rest of IL vs out of state
collar <- c("17043","17089","17093","17097","17111","17197")
h[, region := fifelse(stplcname=="Chicago","Chicago",
               fifelse(cty=="17031","Suburban Cook",
                fifelse(cty %chin% collar,"Collar county (DuPage/Kane/Kendall/Lake/McHenry/Will)",
                 fifelse(substr(h_geocode,1,2)=="17","Rest of Illinois","Out of state"))))]
reg <- h[, .(workers=sum(jobs)), by=region][order(-workers)][, share:=pct(workers)]

cat("\n=== Where O'Hare workers live — region ===\n"); print(reg, row.names=FALSE)

cnty <- h[, .(workers=sum(jobs)), by=.(cty, ctyname)][order(-workers)][1:12][, share:=pct(workers)]
cat("\n=== Top home counties ===\n"); print(cnty[, .(ctyname, workers, share)], row.names=FALSE)

plc <- h[stplcname!="" & !grepl("out of state", stplcname),
         .(workers=sum(jobs)), by=stplcname][order(-workers)][1:20][, share:=pct(workers)]
cat("\n=== Top home municipalities ===\n"); print(plc, row.names=FALSE)

zc <- h[!is.na(zcta) & zcta!="", .(workers=sum(jobs)), by=.(zcta,zctaname)][order(-workers)][1:15][, share:=pct(workers)]
cat("\n=== Top home ZIP areas (ZCTA) ===\n"); print(zc[, .(zctaname, workers, share)], row.names=FALSE)

# tract rollup for mapping (with pop-weighted-ish centroid = mean of block latlon)
h[, trctid := substr(h_geocode,1,11)]
trk <- h[substr(h_geocode,1,2)=="17" & !is.na(blklatdd),
         .(workers=sum(jobs),
           lat=weighted.mean(blklatdd, jobs), lon=weighted.mean(blklondd, jobs)),
         by=trctid][order(-workers)]
fwrite(trk, file.path(OUT,"ohare_worker_homes_tract.csv"))
cat(sprintf("\nIL home tracts with >=1 O'Hare worker: %d\n", nrow(trk)))

saveRDS(list(reg=reg, cnty=cnty, plc=plc, zc=zc, total=total,
             in_il=main[,sum(jobs)], oos=aux[,sum(jobs)], nwblocks=length(wset)),
        file.path(OUT,".ohare_worker_homes.rds"))
cat("\nwrote results/ohare_worker_homes_block.csv, _tract.csv\ndone\n")
