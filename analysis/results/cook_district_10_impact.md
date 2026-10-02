# CrossTowner impact: Cook County Commissioner District 10

How building the CrossTowner tunnel (plus the Red Line Extension, i.e. the
planner's "scenario" network) would affect residents and commuters in Cook
County Commissioner District 10, on the district map effective 12/5/22.

Analysis date: 2026-10-02. Analyst: Steven Vance, with Claude Code.

## Summary

- 325,649 residents (2020 Census); 28% live within a 20-minute walk of a
  CrossTowner station. No new stations are built in the district; six existing
  Metra stations become frequent CrossTowner stops.
- Of ~113,500 resident commuters (excluding work-from-home), **~21,100 (19%)
  would have a faster trip**, saving 6.4 minutes on average among them.
- Current transit share: **33% of commuters** (24% of all workers, 28% of whom
  work from home).
- The biggest gains are along the UP-North and UP-Northwest corridors
  (Gladstone Park, Norwood Park, Peterson/Ridge, Ravenswood, Jefferson Park).
  Lakefront Red Line areas see small gains (+2% to +5% jobs in 45 minutes).
- 72,335 jobs are located in the district; 83% are held by people who live
  outside it.

## Residents

| | Residents | Share |
|---|---|---|
| District 10, 2020 Census | 325,649 | 100% |
| Within a 20-minute walk of any rail station | 265,150 | 81% |
| Within a 20-minute walk of a CrossTowner station | 90,529 | 28% |
| More than a 20-minute walk from any station | 60,499 | 19% |

### CrossTowner stations serving the district

| Station | Line | Residents within walk (nearest CT station) |
|---|---|---|
| Ravenswood | X1/X4 (UP-North) | 29,582 |
| Gladstone Park | X2/X3 (UP-Northwest) | 16,943 |
| Peterson/Ridge | X1/X4 | 15,212 |
| Jefferson Park | X2/X3 | 12,387 |
| Addison (Brown), just outside the district | X1/X4 | 9,791 |
| Norwood Park, just outside the district | X2/X3 | 6,370 |

## Jobs reachable within 45 minutes (8 AM)

| Station group | Change, today to scenario |
|---|---|
| Gladstone Park | 208,240 to 1,028,855 (+394%) |
| Norwood Park | +334% |
| Peterson/Ridge, Ravenswood, Jefferson Park | +11% to +15% (+117k to +156k) |
| Forest Glen, Edgebrook (UP-NW, not CT stops) | +15% to +18%, from a low base of ~200k |
| Brown Line (Western, Damen, Montrose) | +8% to +9% |
| Red Line lakefront (Sheridan, Wilson, Bryn Mawr, Argyle, etc.) | +2% to +5% |

Gladstone Park and Norwood Park jump because today's Metra service there is too
sparse to fall inside a 45-minute window.

Population-weighted average gain: **+118,000 jobs (+12.6%)** for residents near
a station; **~+96,000** averaged over all residents (those beyond walking
distance get no gain in this model). The average is pulled up by the two UP-NW
stations; the typical lakefront resident gains 3–5%.

## District 10 resident workers (by home block)

LODES 2023, primary jobs (JT01), Illinois main file.

| | Workers | Share |
|---|---|---|
| All D10 resident workers | 156,916 | 100% |
| Home more than a 20-minute walk from any station | 25,775 | 16% |
| Home near a station, job not | 33,833 | 22% |
| Both ends near the same station (no rail trip) | 1,995 | 1% |
| Both ends near different stations (comparable trip) | 95,163 | 61% |
| Trip faster with CrossTowner | 28,820 | 18.4% |
| Saves 5+ minutes | 13,862 | 9% |
| Saves 10+ minutes | 6,264 | 4% |

Average saving among faster trips: 6.3 minutes. Where they work: 58,005 (37%)
in or near the Loop (rough box, Roosevelt to Chicago Ave, lake to ~Halsted),
12,336 (8%) inside D10, 137,770 (88%) in Cook County.

Biggest per-trip gains are to destinations around rather than into the Loop:
Chicago/Halsted (−13 min), 18th St. (−18 min), Division/Elston (−7 min). Loop
CTA destinations (Monroe, Washington, Quincy) save about a minute.

### Work from home and commuting

LODES has no work-from-home category; it places every job at the employer's
address. The split comes from ACS 2020–2024 5-year, table B08301, block groups
weighted by the share of their 2020 population inside D10.

| | Workers | Share |
|---|---|---|
| All D10 workers (ACS) | 198,856 | 100% |
| Commute somewhere | 142,596 | 72% |
| Work from home | 56,259 | 28% |

### Commute mode today (ACS 2020–2024)

| Mode | Share of commuters (excl. WFH) | Share of all workers |
|---|---|---|
| Transit | 33% | 24% |
| Drive alone | 51% | 36% |
| Carpool | 6% | 5% |
| Walk | 6% | 4% |
| Bike | 2% | 1% |
| Work from home | — | 28% |

For residents within a 20-minute walk of a station only: transit 36% of
commuters, drive alone 48%.

### Faster trips among actual commuters (WFH-adjusted)

Each LODES worker was discounted by the WFH rate of their home block group
(ACS), then the same trip comparison was rerun.

| D10 resident commuters (excl. WFH) | Workers | Share |
|---|---|---|
| All commuters | ~113,500 | 100% |
| Faster with CrossTowner | ~21,100 | 18.6% |
| Saves 5+ minutes | ~10,400 | 9% |
| Saves 10+ minutes | ~4,700 | 4% |

Average saving among faster trips: 6.4 minutes.

## Jobs located in District 10 (by work block)

LODES 2023 JT01, Illinois main + auxiliary (out-of-state residents) files.

| | Workers | Share |
|---|---|---|
| All jobs located in D10 | 72,335 | 100% |
| Held by D10 residents | 12,336 | 17% |
| Held by residents elsewhere in Illinois | 58,211 | 80% |
| Held by out-of-state residents | 1,788 | 2% |

Illinois commuters into D10 by home county: Cook 44,897; DuPage 3,759; Lake
2,602; Will 1,706; Kane 1,554; McHenry 985; rest of Illinois 2,708.
Out of state: Indiana 744, Wisconsin 429, other 615.

Of the 70,547 Illinois-resident workers (main file): 47% live more than a
20-minute walk from a station; 11,452 (16%) get a faster trip; 2,906 save 10+
minutes; average saving 6.9 minutes among faster trips.

## Method

- **District boundary:** Cook County GIS, `politicalBoundary/MapServer/9`
  ("Cook County Commissioner District (effective 12/5/22)"),
  `DISTRICT_INT = 10`; 19.7 sq mi.
- **Blocks:** TIGER 2020 `tl_2020_17_tabblock20`; a block is in D10 if its
  internal point is.
- **Station catchment:** same rule as the planner and
  `planner_commute_flows.py`: each block goes to its single nearest station
  within the walk cap (20 min at 4.43 km/h, 1.3 detour factor = 1.136 km
  straight line), over all 404 stations in `planner/data/stations.json`.
- **Travel times:** `planner/data/matrix/{today,scenario}/0800/`, median
  station-to-station minutes for the 8 AM weekday slice. A trip is "faster"
  when scenario minutes < today minutes.
- **Jobs access:** `analysis/results/station_jobs_access.csv` (`today45`,
  `scen45`), population-weighted by each block's nearest station.
- **Commuters:** LODES8 2023 `il_od_main_JT01_2023` and `il_od_aux_JT01_2023`.
- **Mode share / WFH:** ACS 5-year 2024 (2020–2024), B08301 at block group,
  apportioned by 2020 block population inside D10.

## Caveats

- LODES counts primary jobs only, excludes most self-employed workers, and
  treats remote workers as commuting to the employer's address. LODES and ACS
  totals therefore don't match (156,916 vs 198,856).
- The 2020–2024 ACS average includes pandemic years and likely overstates
  today's WFH share; the true faster-commute count is probably between ~21,100
  and 28,820.
- The WFH adjustment uses home location, not job type. If Loop office workers
  (who save least) work from home more, the real count is somewhat higher.
- Workers without a comparable trip (home or job beyond walking distance of a
  station) are counted as not faster, so shares are conservative.
- CrossTowner frequencies are the proposal's assumptions, not an adopted
  service plan. Times are 8 AM weekday medians.
- Block assignment by internal point can misplace blocks on the district edge.
- An earlier pass counted commutes by station area (stations inside D10:
  100,613 outbound workers, 28,103 faster). It is superseded by the
  residence-based numbers above.
