# CrossTowner trip planner — precompute pipeline

These scripts build the static data behind the CrossTowner trip planner
(`/planner/` on the Build the Tunnel site). The planner compares any Chicago-area
rail trip **today** vs. **with the proposed CrossTowner tunnel**. Because every trip
runs between rail stations, we precompute every station-to-station result offline and
ship it as static JSON — so the website itself runs no routing engine.

Everything here is reproducible from public data.

## What the scripts do

Run in this order (all write into `planner/data/`):

| Step | Script | What it does |
|---|---|---|
| 1 | `build_stations.R` | Unifies Metra + CTA "L" + CrossTowner + RLE stops → `stations.json` (deduped at 150 m, distance-only) + `station_dedup_report.csv`. |
| 2 | `../precompute_expanded.R` | Matrix cells `{m, r, x}` for the 8 AM slice: **median** travel time over a 30-min window (robust), route via X-route preference (within 12 min). |
| 3 | `../precompute_legs_8am.R` | Re-routes with `detailed_itineraries` at 8:00 to add `legs:[{mode, line, from, to, ride}]` — the board/alight **stations** per leg. |
| 4 | `../merge_median_into_legs.R` | Overwrites each cell's `m` with the 30-min median (step 3's single-departure time is fragile) while keeping the legs. |
| 5 | `../add_leg_frequency.py` | Adds `freq` (mean headway, min) to each leg — trains/hr serving board→alight around 8 AM, across the network's feeds (scenario picks up X-route trains sharing a corridor). |
| — | line geometry | `lines.json` (route shapes for the map) is exported from `view_places` (CTA/Metra) + GTFS `shapes.txt` (X-routes/RLE); see the export snippet in this repo. |

> **Cell format:** `{ dest_id: { m, r, x, legs:[{mode, line, from, to, ride, freq}] } }`.
> `m` = median minutes (station-to-station); `r` = boarding-route sequence
> (`X1`–`X6` = CrossTowner, `RLE` = Red Line Extension, Metra/CTA codes, or a bus
> number); `x` = transfers; each leg carries its board/alight station, in-vehicle
> `ride` minutes, and `freq` (a train every ~N min).
>
> `precompute_matrix.R` (times-only) is the original fast builder, superseded by
> the chain above; kept for reference.

## Inputs (public)

Committed under `analysis/r5r_network_inputs/`:

- `metra-gtfs.zip`, `cta-gtfs.zip`, `pace-gtfs.zip` — published agency GTFS.
- `crosstowner-xroutes-gtfs.zip` — the proposed CrossTowner scenario feed (built from
  Scott Presslak's schedules; see `analysis/METHODOLOGY.md`).
- `redline-extension-gtfs.zip` — the under-construction Red Line Extension (four new
  stations not yet in CTA's published feed); included in the future scenario.
- `chicago-streets.osm.pbf` — OpenStreetMap street network for walking.

The **future scenario routes on `scenario_rle`** = today + CrossTowner X-routes + the
Red Line Extension, so the RLE's new stations are reachable.

## Reproduce

```bash
# From the repo root. Requires R with r5r 2.4.0 + data.table + jsonlite,
# and Java 21 (r5r builds the routing network with Conveyal R5).
export JAVA_HOME=/path/to/jdk-21
bash analysis/planner/run_precompute.sh
```

`run_precompute.sh` assembles the routing networks (`analysis/assemble_networks.sh`),
builds the station list, then runs the matrix. Times-only takes minutes.

## Routing parameters

Held constant across the project, and documented in `analysis/METHODOLOGY.md`:

- **Walk speed** 2.75 mph (4.43 km/h), grounded in US walking-speed studies.
- **Max walk** 20 minutes for access, egress, and transfers (stricter than the 30-minute
  cap used on the published trip maps — the planner is a stricter-walk variant).
- **Departure slices** weekday 08:00, 12:00, 18:00.
- **Travel time** = median over a 30-minute departure window (`percentiles = 50`).

## Data format

- `stations.json`: `[{id, name, lat, lon, on_metra, on_cta_rail, on_crosstowner,
  exists_today, wheelchair}]`. `exists_today` is false for CrossTowner-only infill
  stations (they aren't boardable on today's network).
- `matrix/<network>/<slice>/<origin_id>.json`: `{ destination_id: minutes }`, only for
  reachable destinations. The matrix is **directional** (A→B ≠ B→A).

## License / attribution

Derived from public CTA, Metra, and Pace GTFS and OpenStreetMap, plus the CrossTowner
scenario feed. See the repository LICENSE. OpenStreetMap data © OpenStreetMap
contributors.
