# Two worker-centric analyses, reusing the per-block-group transit times to the
# O'Hare gateways already computed in ohare_labor_shed.R (today vs scenario).
#
# PART 1 — Labor shed weighted by WORKERS (not total population). Weight each
#   block group by its employed-resident count (LODES RAC C000) and count how
#   many workers can reach an O'Hare gateway within 45/60/75 min, today vs the
#   CrossTowner scenario. "How many more potential employees are in reach."
#
# PART 2 — For the ACTUAL ~50k O'Hare workers (at their real LODES home blocks),
#   how much faster is their transit trip to O'Hare under the scenario? Trip-time
#   reduction = (today - scenario)/today. Distribution + cumulative "N workers
#   get a >=X% faster trip", plus minutes saved.
suppressPackageStartupMessages({library(data.table)})
SP  <- "/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/0dcac289-c6a5-450b-8cca-bd186b4c4593/scratchpad"
OUT <- "/Users/stevevance/Sites/BuildTheTunnel/analysis/results"

# per-BG min transit time (minutes) to the nearer O'Hare gateway, today & scenario
tt <- fread(file.path(OUT,"ohare_labor_shed_bg.csv"), colClasses=list(character="GEOID"))
# NA = not reachable within the 90-min routing cap on that network

# ---- employed residents per block group (LODES RAC C000) --------------------
rac <- fread(cmd=paste("gzcat", shQuote(file.path(SP,"il_rac_S000_JT01_2023.csv.gz"))),
             colClasses=list(character="h_geocode"), select=c("h_geocode","C000"))
rac[, GEOID := substr(h_geocode,1,12)]
racbg <- rac[, .(workers_res = sum(C000)), by=GEOID]      # employed residents per BG
tt <- merge(tt, racbg, by="GEOID", all.x=TRUE)
tt[is.na(workers_res), workers_res := 0]

# ================= PART 1: worker-weighted labor shed =========================
CUT <- c(45,60,75); base <- tt[, sum(workers_res)]
p1 <- rbindlist(lapply(CUT, function(k){
  t <- tt[!is.na(today)    & today    <=k, sum(workers_res)]
  s <- tt[!is.na(scenario) & scenario <=k, sum(workers_res)]
  data.table(cutoff=k, today_workers=t, scenario_workers=s,
             gained=s-t, pct=round(100*(s-t)/t,1))
}))
fwrite(p1, file.path(OUT,"ohare_labor_shed_workers.csv"))
cat("=========  PART 1: O'HARE LABOR SHED, weighted by employed residents  =========\n")
cat(sprintf("(metro employed residents total = %s)\n\n", format(base, big.mark=",")))
for(i in 1:nrow(p1)) with(p1[i], cat(sprintf(
  "  <= %d min:  today %s workers  ->  scenario %s   (+%s, %+.1f%%)\n",
  cutoff, format(today_workers,big.mark=","), format(scenario_workers,big.mark=","),
  format(gained,big.mark=","), pct)))

# ================= PART 2: benefit to the ACTUAL O'Hare workforce ==============
oh <- fread(file.path(OUT,"ohare_worker_homes_block.csv"), colClasses=list(character="h_geocode"))
oh[, GEOID := substr(h_geocode,1,12)]
ohbg <- oh[, .(w = sum(jobs)), by=GEOID]                  # O'Hare workers per home BG
TOT <- ohbg[, sum(w)]                                     # = 49,935 (incl out-of-state)

m <- merge(ohbg, tt[, .(GEOID, today, scenario)], by="GEOID", all.x=TRUE)
# classify each home BG's transit trip to O'Hare
m[, status := fcase(
    is.na(today) & is.na(scenario),                 "no_transit_either",   # incl. out-of-state / far
     is.na(today) & !is.na(scenario),                "newly_enabled",       # no <=90 trip today, yes in scenario
    !is.na(today) &  is.na(scenario),                "lost",                # (routing noise; expect ~0)
    default =                                        "both")]
m[status=="both", `:=`(saved = today - scenario,
                       redpct = 100*(today - scenario)/today)]
m[status=="both" & redpct < 0, redpct := 0]              # clamp routing noise to "no improvement"
m[status=="both" & saved  < 0, saved  := 0]

wsum <- function(cond) m[cond, sum(w)]
inmetro <- m[status!="no_transit_either", sum(w)]

cat("\n\n=========  PART 2: trip-time benefit to the ACTUAL ~50k O'Hare workers  =========\n")
cat(sprintf("Total O'Hare workers: %s.  With a modeled transit trip (<=90 min) today or in scenario: %s (%.0f%%).\n",
    format(TOT,big.mark=","), format(inmetro,big.mark=","), 100*inmetro/TOT))
cat(sprintf("No <=90-min transit trip either way (mostly far suburbs / out-of-state): %s (%.0f%%).\n",
    format(wsum(m$status=="no_transit_either"),big.mark=","), 100*wsum(m$status=="no_transit_either")/TOT))
cat(sprintf("Newly ENABLED (no usable transit today -> a <=90-min trip appears in scenario): %s\n",
    format(wsum(m$status=="newly_enabled"),big.mark=",")))

# distribution of % trip-time reduction among 'both' workers
b <- m[status=="both"]
brks <- c(-Inf,0.0001,10,20,30,40,Inf)
labs <- c("no change (0%)","0–10% faster","10–20% faster","20–30% faster","30–40% faster","40%+ faster")
b[, bucket := cut(redpct, breaks=brks, labels=labs, right=FALSE)]
dist <- b[, .(workers=sum(w)), by=bucket][order(bucket)]
dist[, share_of_commuters := sprintf("%.1f%%", 100*workers/sum(dist$workers))]
cat("\n-- Distribution of transit trip-time reduction (workers with a transit trip today) --\n")
print(dist, row.names=FALSE)

# cumulative: how many workers see AT LEAST X% faster
cat("\n-- Cumulative: workers whose transit trip to O'Hare is at least X% faster --\n")
for(x in c(5,10,20,30,40,50)){
  n <- b[redpct>=x, sum(w)]
  cat(sprintf("  >= %2d%% faster: %6s workers  (%.1f%% of transit commuters; %.1f%% of all workers)\n",
      x, format(n,big.mark=","), 100*n/sum(dist$workers), 100*n/TOT))
}

# minutes saved distribution
mbrks <- c(-Inf,0.5,5,10,20,30,Inf)
mlabs <- c("0 min","1–5 min","5–10 min","10–20 min","20–30 min","30+ min")
b[, mbucket := cut(saved, breaks=mbrks, labels=mlabs, right=FALSE)]
md <- b[, .(workers=sum(w)), by=mbucket][order(mbucket)][, share:=sprintf("%.1f%%",100*workers/sum(workers))]
cat("\n-- Distribution of minutes saved each way (transit commuters) --\n"); print(md, row.names=FALSE)

wmed <- function(x,w){ o<-order(x); x<-x[o]; w<-w[o]; x[which(cumsum(w) >= sum(w)/2)[1]] }
cat(sprintf("\nAmong transit commuters: median trip-time reduction %.1f%%, mean %.1f%%; median minutes saved %.1f.\n",
    wmed(b$redpct,b$w), b[, weighted.mean(redpct,w)], wmed(b$saved,b$w)))
fwrite(m, file.path(OUT,"ohare_worker_benefit_bg.csv"))
fwrite(dist, file.path(OUT,"ohare_worker_speedup_dist.csv"))
cat("\nwrote ohare_labor_shed_workers.csv, ohare_worker_benefit_bg.csv, ohare_worker_speedup_dist.csv\ndone\n")
