# CrossTowner accessibility analysis: methodology and provenance

This document records, in reproducible detail, how the CrossTowner/CRCL transit
accessibility analysis was performed: every data source (with version and
checksum), every modeling assumption, every parameter, and every validation
check. It is written for a skeptical reader.

Analysis dates: 2026-07-06 through 2026-07-08.
Analyst: Steven Vance, with Claude Code.

## 1. Research questions

Given a new CrossTowner station on a new line added to the existing Metra
network (test case: **Taylor/Clinton**, a proposed station on the
Clinton-Roosevelt Connector Line tunnel):

1. How many more jobs become accessible to people commuting **to** the new
   station's area? (not yet computed; requires arrive-by matrices and/or
   LODES RAC)
2. How many more jobs become accessible to people commuting **away from** the
   new station? (computed; results in section 8)

"Accessible" is operationalized as the standard cumulative-opportunities
measure: jobs located within an N-minute door-to-door transit+walk travel time,
N = 30 / 45 / 60.

## 2. Software

| Component | Version | Role |
|---|---|---|
| r5r (R package, wraps Conveyal R5) | 2.4.0 | routing engine for all isochrones, travel times, itineraries |
| R | 4.5.1 (arm64) | analysis scripting |
| OpenJDK (Homebrew `openjdk@21`) | 21.0.11 | JVM for R5; `JAVA_HOME` must point at the Cellar `libexec/openjdk.jdk/Contents/Home` path |
| OpenTripPlanner | 2.5.0 (`otp-2.5.0-shaded.jar`, Maven Central) | independent cross-check of baseline isochrones (its Travel Time API was removed after ~2.5, so 2.7+ cannot be used for this) |
| Transitous (hosted MOTIS v2.10) | api.transitous.org, queried 2026-07-07 | live present-day itineraries for the trip-comparison map |
| osmium-tool | Homebrew, 2026-07-06 | OSM extract clipping/filtering |
| PostgreSQL/PostGIS | — | staging for proposal geometry, LODES, census blocks |

R5 heap: `options(java.parameters = "-Xmx12G")` set before `library(r5r)`.

## 3. Input data, with provenance

All routing inputs live in the r5r data folders; SHA-256 checksums recorded
2026-07-08.

### 3.1 Street network

- Source: Geofabrik `illinois-latest.osm.pbf`, downloaded 2026-07-06.
- Processing: `osmium extract --bbox -88.45,41.4,-87.5,42.45`, then
  `osmium tags-filter w/highway` (roads only; R5 uses streets solely for
  access/egress/transfer walking).
- Result: `chicago-streets.osm.pbf`, 54 MB,
  sha256 `0db7779d1659abe8e74c42f202988c1220810aaf5421d7032163eed5874b3846`.
- Coverage check for the runs in this document: every station served by the
  modeled X1-X6 routes lies inside this bbox (extremes: Palatine -88.05,
  Highland Park 42.19, Harvey 41.61, O'Hare Transfer -87.86), as does the
  entire 60-minute transit reach from the Taylor/Clinton origin.

**For future runs that model the full CrossTowner network:** the complete
network (all 25 lines / 294 stations, including the lettered
A-Z lines) spans **-88.618 to -86.293 longitude and 41.418 to 42.586
latitude** — Harvard, IL west to the South Shore Line's South Bend territory
in Indiana, and University Park south to Kenosha, Wisconsin. That exceeds any
Illinois-only extract. The standard going forward:

```bash
# Three-state extract, clipped to the network bbox + ~0.05 deg buffer
curl -O https://download.geofabrik.de/north-america/us/illinois-latest.osm.pbf
curl -O https://download.geofabrik.de/north-america/us/indiana-latest.osm.pbf
curl -O https://download.geofabrik.de/north-america/us/wisconsin-latest.osm.pbf
osmium merge illinois-latest.osm.pbf indiana-latest.osm.pbf wisconsin-latest.osm.pbf -o il-in-wi.osm.pbf
osmium extract --bbox -88.70,41.35,-86.20,42.65 il-in-wi.osm.pbf -o crosstowner-region.osm.pbf
osmium tags-filter crosstowner-region.osm.pbf w/highway -o crosstowner-streets.osm.pbf
```

Results in this document were produced with the smaller Illinois bbox above;
re-running them on the wider extract would not change them (the extra area is
beyond both the modeled routes and the isochrone cutoffs).

### 3.2 Transit feeds (existing service)

| Feed | Downloaded | Source URL | Feed validity | sha256 (as used) |
|---|---|---|---|---|
| CTA GTFS | 2026-07-06 | transitchicago.com/downloads/sch_data/google_transit.zip | calendar spans 2026-05-28 onward | `b1eb85b0...0825a8c79` (pre-filter) |
| Metra GTFS | 2026-07-06 | schedules.metrarail.com/gtfs/schedule.zip | service `C1` covers the analysis date with a full weekday schedule on all 11 routes | `f9554f52...6d3b0bd` (pre-filter) |
| Pace GTFS | 2026-07-06 | pacebus.com (route-timetable-data-services page, 2026-05 file) | 2026-05-31 to 2026-08-29 | `6fbf4a3b...6b75a3e5` (pre-filter) |

Modifications made to the real feeds, and why:

1. **`shapes.txt` removed** from CTA and Pace zips. Shapes are display-only
   geometry; R5 routes on stop coordinates and stop_times. Removal only
   reduces memory.
2. **Date-filtering (X-routes scenario runs only):** feeds were reduced to
   trips whose service is active on Tuesday 2026-07-07 (calendar +
   calendar_dates logic), because the full feeds stack multiple schedule
   periods (CTA: 94,420 trips total, 20,689 active on the date) and the
   combined network exceeded available JVM memory. This cannot change results
   for the analysis date: R5 would ignore non-active trips anyway. The
   filtered calendars mark every kept service as running all of 2026, so
   **these filtered feeds are only valid for queries on the analysis date**.

### 3.3 Analysis date validation

The routing date is **Tuesday 2026-07-07, departures 8:00-8:30 am**. Because a
GTFS feed can silently contain no service on a queried date, all three feeds
were explicitly checked:

- CTA: 51 services active (calendar), no calendar_dates removals.
- Metra: service `C1` active, carrying a complete weekday schedule
  (BNSF 97 trips, ME 134, RI 84, UP-NW 78, UP-N 71, all 11 routes staffed).
  Other Metra service IDs ended 2026-07-05 (summer schedule variants).
- Pace: 20 services active.

### 3.4 Proposed-service inputs

- **Station and line geometry:** digitized from Star:Line Chicago's
  CrossTowner vision (buildthetunnelchicago.org) via its Google My Maps KML
  export (25 lines, 294 station points). The extracts used by the GTFS
  generator ship in this repo: `data/ct_stations.tsv` (stations) and
  `data/xroute_lines.tsv` (X-route alignments).
- **Timetable:** "CrossTowner Schedules.xlsx" (Scott / Star:Line Chicago,
  received 2026-07-08; shared privately — kept in the untracked `private/`
  folder, available on request), sha256
  `1e33a9087638b602810de60d65ecea8d5cc4783f8b26b69e2ade2dff2ea0782e`.
  Worksheets used: "CRCL Plan - NB Skeleton", "CRCL Plan - SB Skeleton".
  The "2034sight" worksheets are not used.

## 4. The scenario GTFS (X1-X6), built from Scott's skeletons

Generator: `build_gtfs_from_skeletons.py` (this folder). Output:
`crosstowner_xroutes_gtfs/` and `crosstowner-xroutes-gtfs.zip`
(final sha256 `bb7032e289a3dab6664051e2883a4c333d787d0ab834f63c4d298f6a0789624a`).
Display-affecting additions made after the first builds: `feed_info.txt`,
`trip_headsign` (without headsigns both directions of a route display
identically in feed viewers, making interleaved bidirectional departures at
a shared stop look like an erratic headway), and `shapes.txt` (see 4.1).

Translation rules, exactly as implemented:

1. Each skeleton column = one trip pattern. Header = route. Cells = clock
   offsets within a repeating cycle. `--` (not on route) and `↓` (express
   pass) both produce **no stop_time**.
2. Stop sequence = cells sorted by time, which makes the sheet's
   branch-by-branch row order irrelevant.
3. Each route appears twice per direction per cycle (columns ~30 minutes
   apart) = 30-minute headways per route, 7.5 minutes combined on the
   Clybourn-67th trunk, matching the published vision.
4. The cycle is materialized hourly at anchors 05:00 through 21:00
   (17 cycles), i.e. service roughly 5 am to 11:30 pm. **408 trips,
   16,456 stop_times, 133 stops.**
5. **Included:** X1-X6 only. **Excluded:** the skeleton's UP-N and UP-NW
   columns (revised Metra locals) — the real Metra feed already supplies
   locals on those lines, and including both would double-count service.
   Consequence: on UP-N/UP-NW the scenario is *conservative in pattern* (the
   skeleton's locals make different stops) but *frequency-inflated* where
   Scott's plan would replace rather than supplement today's locals. The same
   caveat applies on every corridor X-routes share with today's Metra service
   (BNSF, RI, ME): the scenario models X-routes as **additions to** current
   service, not a restructuring of it.
6. Station name matching: normalized string match against `ct_stations.tsv`
   first, Metra `stops.txt` second; 133 of 142 names matched automatically;
   9 pinned manually in the generator's `ALIASES` dict (each is a
   cross-street naming variant, e.g. sheet "Western/Hubbard" = DB
   "Western/Kinzie"). Zero unmatched names in the final build.
7. Sanity check: for every trip, the great-circle distance between each pair
   of consecutive stops is computed; anything over 6 miles would be flagged.
   The final build produced **zero warnings**.
8. Simplification: all "Union Station" rows map to the single
   `crosstownerstation-union-station` point. Scott's plan distinguishes the
   tunnel platforms from Union Station Riverside (X5/X6); the points are
   ~600 ft apart, which is below the resolution that matters for
   30/45/60-minute regional accessibility.
9. Fares, vehicle capacity, and crowding are not modeled (GTFS has no fares
   in any of our feeds; R5 here measures time-based access only).

### 4.1 Route shapes and the KML pipeline

`shapes.txt` is generated from the X1-X6 alignments in Scott's Google My
Maps KML export ("CrossTowner Regional Rail - System Diagram.kml", shared
privately — kept in the untracked `private/` folder). `kml_to_inputs.py` extracts the alignments to
`data/xroute_lines.tsv` and also verifies every coordinate in
`data/ct_stations.tsv` against the KML's point placemarks — worst deviation
**0 ft**, so both generator inputs are provably the KML's own data. Each
trip's shape is the route alignment oriented to its direction of travel.
One splice: X3's drawn line ends at Des Plaines but the skeleton schedules
it through to Arlington Park (the KML calls this the event extension), so
X3's shape borrows the UP-NW segment from X2's alignment. Shapes are
display-only; routing uses stop coordinates and stop_times.

### 4.2 Station-matching correction (found via validation, 2026-07-08)

The first scheduled builds matched skeleton station names to coordinates by
a normalized string that DISCARDED parenthetical qualifiers. Chicago's
numbered streets repeat across parallel South Side rail lines, so 13
stations landed on the wrong line (e.g. X3/X4's "83rd (Avalon Park)" on the
ME main line was placed at "83rd Street" on the South Chicago branch ~2.4 mi
east; X6's Beverly branch stops landed on ME main / Rock Island stations
2-5 km away). The MobilityData validator's `stop_too_far_from_shape` check
exposed the error once shapes were added. Fix: full-name matching first
(parentheticals intact), remaining ambiguity resolved by distance to the
route's own alignment, every decision logged to `station_match_report.csv`
(all corrected stations sit 0.0 mi from their alignments), plus an
off-alignment (>0.5 mi) build check. Impact on results: the corrected
stations moved jobs-accessibility totals by well under 0.2% (see 8.1) and
did not change the Arlington Heights -> Hyde Park itinerary; the correction
mattered for feed integrity and mapping, not the headline numbers.

An earlier scenario feed (`deprecated/crosstowner_crcl_gtfs/`,
frequency-based 6-stop tunnel shuttle at 450 s headways) predates Scott's
timetable and is retained for comparison; the X-routes feed supersedes it.

## 5. Routing parameters (r5r)

Identical for baseline and scenario:

```r
mode = c("TRANSIT", "WALK")
departure_datetime = 2026-07-07 08:00 America/Chicago
time_window = 30          # departures sampled 8:00-8:30
cutoffs = c(30, 45, 60)   # minutes
max_walk_time = 15        # minutes each for access and egress
walk_speed = 4.43         # km/h = 2.75 mph (see 5.1)
percentile: r5r default (p50, the median across the departure window)
```

The scenario feed is schedule-based (exact stop_times), so no Monte Carlo
frequency draws are involved in the X-routes runs.

**Walking and transfer times are computed, not fed.** None of the feeds
supplies walk or transfer durations: CTA's `transfers.txt` (153 rows) only
declares recommended transfer stop-pairs with no `min_transfer_time` column,
and Metra, Pace, and the scenario feed have no `transfers.txt` or
`pathways.txt` at all. Every walking leg and transfer time in this analysis
is therefore computed by R5 over the OpenStreetMap street network.

### 5.1 Walking speed

We route at **2.75 mph (4.43 km/h)**, overriding r5r's slower default of
3.6 km/h (2.24 mph). The choice is grounded in the empirical literature on
adult walking speed:

| Reference | Speed |
|---|---|
| Bohannon 1997 (*Age and Ageing*), comfortable pace by age/sex | 2.84–3.27 mph |
| Murtagh et al. 2021 meta-analysis (13,609 participants), usual pace | 2.93 mph |
| MUTCD / FHWA pedestrian signal design speed | 2.68 mph (4.0 ft/s) |
| FHWA 15th-percentile (older adults) | 2.06 mph |
| r5r default (not used here) | 2.24 mph |

2.75 mph sits deliberately between the conservative traffic-engineering
design speed (which protects the slow tail of the population) and the
empirical usual-pace mean (~2.9 mph). It is a defensible "effective" speed
for a diverse public making real door-to-door trips: faster than r5r's
overly-slow default, but still below the healthy-adult gait mean, leaving
headroom for the real-world friction that gait-speed studies exclude
(waiting at crossing signals, stairs, concourses, wayfinding, crowding).
Earlier versions of these maps used r5r's 3.6 km/h default; all trip pages
were re-routed at 2.75 mph. Because today's itineraries contain more walking
than the CrossTowner's (out-of-station transfers vs. one-seat rides and
same-station changes), the faster speed slightly favors the status-quo
column — so the CrossTowner's advantages shown here are, if anything,
conservative.

## 6. Jobs data

- LEHD LODES Workplace Area Characteristics (WAC), Illinois, 2023,
  census-block level (lehd.ces.census.gov/data/); 92,112 blocks with jobs. Fields used: `c000`
  (total jobs), `ce01/ce02/ce03` (jobs paying <=$1,250 / $1,251-$3,333 /
  >$3,333 per month).
- Block geometry: 2020 Census TIGER/Line blocks, joined on
  `GEOID = w_geocode`; jobs assigned to **block centroids**.
- Method: point-in-polygon of block centroids against each isochrone band;
  sums per band. (Blocks are small enough in the urban core that centroid
  assignment error is negligible relative to a 30-minute isochrone.)
- Limitations: LODES covers unemployment-insurance-covered jobs (excludes
  most self-employment, some federal categories); Indiana jobs are absent
  (IL-only table), which understates 60-minute totals slightly toward the
  southeast; jobs are 2023 counts applied to a future network.

## 7. Validation and cross-checks performed

1. **Feed service-date check** (section 3.3) — guards against the classic
   empty-calendar error.
2. **Independent engine:** OTP 2.5.0, same feeds/OSM, same origin and date:
   30/45/60-minute areas of 6.0 / 31.7 / 111.1 sq mi vs r5r's
   7.9 / 38.0 / 102.5 — same shape and magnitude; differences reflect the
   engines' different default access/egress and area-tracing behavior.
3. **Live-network spot check:** Transitous (independent data pipeline —
   its own GTFS aggregation) routes Taylor/Clinton coordinates through the
   same downtown transfer points; its one-to-all reach (8,536 stops in 60
   min) is consistent with the r5r isochrone. Caveat discovered: Transitous
   includes Amtrak (Hiawatha tagged REGIONAL_RAIL, inseparable from Metra by
   mode filter), one reason hosted APIs were rejected for the main analysis.
4. **Trip-level check of the scenario feed:** X2 southbound 08:00-cycle trip
   reads Palatine 8:04 → Arlington Heights 8:10 → Randolph/Clinton 8:52 (sic,
   see stop_times) → Taylor/Clinton 8:55 → 55th-56th-57th 9:10 — matching
   Scott's skeleton exactly (60 minutes Arlington Heights → Hyde Park,
   one seat).
5. **Geographic contiguity check:** the consecutive-stop distance test in the
   generator (zero flags).
6. **MobilityData canonical GTFS validator, v8.0.1:** the scenario feed
   validates with **zero errors**; remaining warnings are intentional or
   cosmetic — `mixed_case_recommended_field` (11: numeric station names like
   "55th-56th-57th" contain no uppercase letters) and
   `stop_too_far_from_shape` (10: the single Union Station point sits 166 m
   from the drawn alignments, per the section 4 simplification; 35th/Lou
   Jones is 143 m from an alignment chord). This same check at its loudest
   (48 instances, up to 12 km) is what exposed the station-matching bug in
   section 4.2 — the warning class earned its keep. Note for anyone re-validating: compress nothing by hand —
   a macOS Finder "Compress" zip nests the files in a subfolder and produces
   spurious structural errors (`invalid_input_files_in_subfolder`,
   `missing_required_file`); validate the generator's own flat zip.
7. **Independent routing of the scenario:** R5's `detailed_itineraries()`
   over the scenario network — with no knowledge of the skeleton beyond the
   generated GTFS — planned Arlington Heights → Hyde Park as a one-seat X2
   ride matching Scott's timetable (section 8.2).

### 7.1 Tools for checking this feed yourself

Anyone who wants to verify or explore the scenario GTFS can use these three
tools (no account needed for any of them):

1. **MobilityData GTFS Validator** — https://gtfs-validator.mobilitydata.org/
   The transit industry's canonical spec validator (also available as a
   [CLI jar](https://github.com/MobilityData/gtfs-validator) and from R via
   `gtfstools::validate_gtfs()`). Upload `crosstowner-xroutes-gtfs.zip` as-is;
   it produces a shareable HTML/JSON report. This feed validates with zero
   errors under v8.0.1. Do not re-zip the files by hand first — a macOS
   Finder "Compress" zip nests everything in a subfolder and produces
   spurious structural errors.
2. **TransitLens GTFS Viewer** — https://transit-lens.com/gtfs-viewer/
   In-browser feed explorer: drop the zip on the page and browse the routes
   on a map, the stop tables, and the service calendar. Processing happens
   locally in the browser (the feed is not uploaded anywhere). The fastest
   way to eyeball whether the X-route alignments and station locations look
   right.
3. **gtfs-viz** — https://github.com/gabrielAHN/gtfs-viz
   Command-line toolkit that imports a feed into DuckDB for SQL-level
   inspection (query any table, audit pathfinding between stops, edit and
   export back to GTFS) plus a browser map dashboard. The right tool for
   deeper questions the first two can't answer, e.g. "list every trip
   serving Taylor/Clinton between 8 and 9 am."

## 8. Results

### 8.1 Jobs reachable from Taylor/Clinton (question 2)

Baseline = CTA + Metra + Pace as published. Tuesday 8:00-8:30 am departures,
median travel time, jobs at 2023 LODES block centroids.

**Scenario A — frequency-based CRCL tunnel shuttle** (pre-timetable,
6 stations, 7.5-minute headways; retained for reference):

| Cutoff | Baseline jobs | With shuttle | Gained | % |
|---|---|---|---|---|
| 30 min | 650,997 | 844,016 | +193,019 | +29.6% |
| 45 min | 995,779 | 1,114,987 | +119,208 | +12.0% |
| 60 min | 1,231,953 | 1,323,155 | +91,202 | +7.4% |

Isochrone areas: 7.9 → 14.0 / 38.0 → 66.4 / 102.5 → 145.0 sq mi.
By earnings band at 30 min: low +45%, mid +43%, high +26%.

**Scenario B — scheduled X1-X6 routes (Scott's timetable), the headline
numbers:**

| Cutoff | Baseline jobs | With X-routes | Gained | % |
|---|---|---|---|---|
| 30 min | 650,997 | 886,308 | +235,311 | **+36.1%** |
| 45 min | 995,779 | 1,215,150 | +219,371 | **+22.0%** |
| 60 min | 1,231,953 | 1,493,189 | +261,236 | **+21.2%** |

(Numbers are from the corrected-stations feed; the pre-correction build's
totals differed by under 0.15% — see 4.2.)

By earnings band (gain at each cutoff, low / mid / high):
30 min +58% / +55% / +30%; 45 min +37% / +39% / +16%;
60 min +35% / +35% / +15%. Proportional gains are consistently largest for
jobs paying <=$1,250/month.

Isochrone areas: 7.9 → 18.5 (30 min), 38.0 → 93.0 (45 min),
102.5 → 200.8 sq mi (60 min) — the 60-minute reach roughly doubles, because
the through-routes extend the isochrone along every connected branch
(UP-NW, UP-N, BNSF, RI, ME) instead of ending at downtown terminals.
Raw outputs: `xroutes_jobs_comparison.csv`,
`r5r_taylor_clinton_isochrones_xroutes.geojson` (scenario),
`r5r_taylor_clinton_isochrones.geojson` (baseline).

### 8.2 Trip comparison (Arlington Heights → Hyde Park)

- Today, routed by R5 on the published feeds (dep window 8:00 am; R5 boards
  the 8:06 UP-NW): **77.1 minutes door-to-door, 2 transfers** — UP-NW to
  Ogilvie 8:46; walk + CTA #124 + walk to Millennium; the 9:03 ME to
  55th-56th-57th at 9:21; 17 minutes spent between trains. Cross-check: an
  independent Transitous/MOTIS query returned 77 minutes with the identical
  structure and the same 9:03 ME departure, differing only in the downtown
  bus (J14 vs #124) — two engines, two data pipelines, same answer.
- CrossTowner X2 per Scott's timetable: Arlington Heights 8:10 →
  55th-56th-57th 9:10, 60 minutes, one seat.
- Independently routed by R5 over the scenario network
  (`detailed_itineraries()`, same door-to-door endpoints as the Transitous
  query): best option is the one-seat X2 at **62.3 minutes door-to-door**
  (0.4 min walk + 1.6 min wait + 60.0 min ride + 0.3 min walk); second
  option is a one-seat X3 at 62.4 minutes. Door-to-door saving vs today:
  ~15 minutes and both transfers.
- Published map: https://claude.ai/code/artifact/6238e609-8f12-4b1a-b425-825ef6ab61fb
  (source: `crosstowner-trip-map.html`, this folder).

## 9. Known limitations (read before quoting numbers)

1. **Additive scenario.** X-routes are layered on top of today's Metra
   service rather than replacing/restructuring it (section 4.5). Gains on
   corridors where Scott's plan restructures locals may differ.
2. **Single origin.** Results are for one station (Taylor/Clinton); they are
   not network-wide averages.
3. **Median travel time.** p50 over a 30-minute departure window; a rider's
   worst-case is worse, best-case better.
4. **Jobs vintage/coverage.** 2023 LODES, Illinois only, UI-covered jobs.
5. **No fares, capacity, or reliability modeling.**
6. **Tunnel runtimes are the proposal's own.** Star:Line publishes no tunnel
   running times; Scott's skeleton embeds his assumptions (documented in the
   xlsx "Assumptions" sheet: e.g. current-schedule runtimes on existing
   lines, 2-minute spacing on new segments).
7. **Walk access capped at 15 minutes** each end; no bike/drive access.

## 10. Reproduction

```bash
# 1. Regenerate the scenario GTFS from the xlsx
cd buildthetunnel && python3 build_gtfs_from_skeletons.py

# 2. Assemble an r5r data folder
#    (CTA/Metra/Pace GTFS + chicago-streets.osm.pbf + crosstowner-xroutes-gtfs.zip)

# 3. Validate the feed (MobilityData canonical validator; do NOT re-zip
#    with Finder -- validate the generator's flat zip)
curl -sL -o gtfs-validator.jar \
  https://github.com/MobilityData/gtfs-validator/releases/download/v8.0.1/gtfs-validator-8.0.1-cli.jar
/opt/homebrew/opt/openjdk@21/bin/java -jar gtfs-validator.jar \
  -i crosstowner-xroutes-gtfs.zip -o validation-report/
# R alternative (same engine): gtfstools::download_validator() + validate_gtfs()

# 4. Run the analysis (R)
#    scripts preserved in this folder: r5r_xroutes_run.R
JAVA_HOME=/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home \
  Rscript r5r_xroutes_run.R
```

## 11. File inventory (this folder)

| File | What it is |
|---|---|

| `build_gtfs_from_skeletons.py` | xlsx → GTFS generator, incl. ALIASES and sanity checks |
| `crosstowner_xroutes_gtfs/`, `crosstowner-xroutes-gtfs.zip` | the scheduled scenario feed (X1-X6) |
| `deprecated/crosstowner_crcl_gtfs/`, `deprecated/crosstowner-crcl-gtfs.zip` | superseded v1 shuttle feed (produced the Scenario A numbers) |
| `../private/` (untracked) | Scott's xlsx timetable and Google My Maps KML — the source files, shared privately and available on request |
| `kml_to_inputs.py` | KML -> generator inputs; verifies station extract against the KML |
| `station_match_report.csv` | audit trail: every skeleton name -> stop match, method, distance to alignment |
| `data/ct_stations.tsv` | 294 CrossTowner station coordinates (verified 1:1 against the KML) |
| `data/xroute_lines.tsv` | X1-X6 alignments extracted from the KML |
| `data/metra_stops.txt` | Metra GTFS stops (fallback station matching) |
| `r5r_xroutes_run.R` | the r5r analysis script (isochrones, jobs overlay, routed itinerary) |
| `results/` | isochrone GeoJSONs (baseline / shuttle / X-routes / OTP cross-check), Transitous reachable-stops GeoJSON, jobs-comparison CSVs |
| `../maps/` | the five published trip-comparison pages (see `maps/index.html`) |
| `METHODOLOGY.md` | this document |
