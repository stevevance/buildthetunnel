# Jobs reachable within 45 and 60 minutes of 59th St (University of Chicago), today vs the CrossTowner scenario:
# the Hyde Park to Rogers Park cab ride's ending (brag-output/2026-11-24-cab-ride-hyde-rogers). The same method as
# r5r_jobs_access.R: LODES 2023 workplace jobs by block (WAC, all jobs), 8 AM, a 30-minute window, walk 20 min max.
#
#   export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
#   Rscript analysis/r5r_jobs_59th.R <lodes-dir>
#
# <lodes-dir> holds il_wac_S000_JT00_2023.csv.gz and il_xwalk.csv.gz, from
# https://lehd.ces.census.gov/data/lodes/LODES8/il/ . Jobs are counted in the six counties the networks cover.
options(java.parameters = "-Xmx12G")
library(r5r); library(data.table)
args <- commandArgs(trailingOnly = TRUE)
lodes <- args[1]
repo <- normalizePath(file.path(dirname(sub("--file=", "", grep("--file=", commandArgs(), value = TRUE))), ".."))
dep <- as.POSIXct("2026-07-07 08:00:00", tz = "America/Chicago")

wac <- fread(cmd = paste("zcat <", shQuote(file.path(lodes, "il_wac_S000_JT00_2023.csv.gz"))), select = c("w_geocode", "C000"),
             colClasses = list(character = "w_geocode"))
xw <- fread(cmd = paste("zcat <", shQuote(file.path(lodes, "il_xwalk.csv.gz"))), select = c("tabblk2020", "cty", "blklatdd", "blklondd"),
            colClasses = list(character = c("tabblk2020", "cty")))
xw <- xw[substr(cty, 3, 5) %in% c("031", "043", "089", "097", "111", "197")]
dest <- merge(wac, xw, by.x = "w_geocode", by.y = "tabblk2020")[, .(id = w_geocode, lon = blklondd, lat = blklatdd, jobs = C000)]
cat(nrow(dest), "job blocks,", sum(dest$jobs), "jobs\n")

origins <- data.table(id = "59th St (University of Chicago)", lon = -87.58863, lat = 41.788049)
acc_on <- function(folder, label) {
  net <- build_network(file.path(repo, "analysis", "networks", folder))
  a <- accessibility(net, origins = origins, destinations = dest, opportunities_colnames = "jobs",
        mode = c("TRANSIT", "WALK"), departure_datetime = dep, time_window = 30,
        decay_function = "step", cutoffs = c(45, 60), max_walk_time = 20, walk_speed = 4.43, progress = FALSE)
  a <- as.data.table(a); a[, net := label]
  rm(net); r5r::stop_r5(); gc(); a
}
res <- rbind(acc_on("today", "today"), acc_on("scenario", "scenario"))
fwrite(res, file.path(repo, "analysis", "results", "jobs_access_59th.csv"))
w <- dcast(res, id + cutoff ~ net, value.var = "accessibility")
w[, gained := scenario - today][, pct := round(100 * gained / today, 1)]
print(w)
cat("done\n")
