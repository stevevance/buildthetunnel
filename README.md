# Build the Tunnel

Two web tools about proposed and under-construction transit, centered on the
**CrossTowner** regional-rail tunnel — a Chicago-area proposal from
[Star:Line Chicago](https://buildthetunnelchicago.org):

1. **[3D flythrough viewer](https://stevevance.github.io/buildthetunnel/)** — a
   cinematic camera that flies along a transit line over real 3D buildings
   (described below).
2. **[CrossTowner Trip Planner](https://stevevance.github.io/buildthetunnel/planner/)** —
   plan any Chicago-area rail trip and compare it today versus with the tunnel built
   (see [Trip planner](#trip-planner)).

Both run as static pages on GitHub Pages at
<https://stevevance.github.io/buildthetunnel/>.

## Trip planner

The [CrossTowner Trip Planner](https://stevevance.github.io/buildthetunnel/planner/)
lets you enter any origin and destination in the Chicago area and compares the rail
trip **as it is today** against the **CrossTowner + Red Line Extension** future
scenario — travel time, the route taken, and the walk to and from stations.

Every trip is precomputed with [r5r](https://ipeagit.github.io/r5r/) (the R interface
to **Conveyal R5**) over present-day GTFS from CTA, Metra, and Pace, plus a synthetic
GTFS feed for the proposed CrossTowner service. The full method — data sources,
walk-time model, which future route is shown, and caveats — is documented on the
planner's methodology page:

**→ [How the CrossTowner Trip Planner works](https://stevevance.github.io/buildthetunnel/planner/methodology.html)**

The planner lives in `planner/` (`index.html`, `app.js`, `config.js`, precomputed
results under `planner/data/`, and `methodology.html`).

## 3D flythrough viewer

A [MapLibre GL JS](https://maplibre.org/) viewer that flies a pitched 3D camera
along a transit line over real extruded buildings. It opens by framing the whole
line, then dives to the start and travels stop to stop, dwelling at each station.

Four lines are selectable, each directly linkable via a URL hash:

| Line | Status | Permalink |
|------|--------|-----------|
| **Chicago — Clinton–Roosevelt Connector (CRCL)** | proposed | [`#crcl`](https://stevevance.github.io/buildthetunnel/#crcl) |
| **Chicago — Red Line Extension (95th–130th)** | under construction | [`#rle`](https://stevevance.github.io/buildthetunnel/#rle) |
| **Toulouse — Ligne C (Line 3)** | under construction | [`#toulouse`](https://stevevance.github.io/buildthetunnel/#toulouse) |
| **Austin — Light Rail (Project Connect)** | planned | [`#austin`](https://stevevance.github.io/buildthetunnel/#austin) |
| **Bogotá — Metro Línea 1** | under construction | [`#bogota`](https://stevevance.github.io/buildthetunnel/#bogota) |
| **Hamburg — U5** | under construction / planned | [`#hamburg`](https://stevevance.github.io/buildthetunnel/#hamburg) |

The viewer is `index.html` plus `lines.js` (the line datasets). It runs straight
from disk — no server and no API keys — because all geometry and statistics are
baked into `lines.js`.

## Running it

Open `index.html` in any modern browser, or visit the live version at
<https://stevevance.github.io/buildthetunnel/>. It needs an internet connection
for the MapLibre library (CDN) and the OpenFreeMap vector tiles only.

### Controls
- **Line** selector switches lines (also settable via the `#`-permalink).
- **Pitch / Zoom** sliders adjust the camera.
- **▶ / ⏸** plays or pauses; pausing (or clicking a station, or dragging) keeps
  the current position so you can pan and explore. **Resume** continues from
  where it stopped.
- **Replay** restarts from the beginning.
- **Click a station** to re-show its label.

## What you see

- The **alignment**: a dashed line with a soft "trench" casing for subway/tunnel
  lines (CRCL, Hamburg U5) or a solid line for surface/elevated lines (Toulouse,
  Austin). MapLibre GL JS cannot place geometry below grade, so subsurface track
  uses the conventional cartographic tunnel treatment rather than true 3D depth.
- **Station markers**. The camera decelerates into each and dwells while a callout
  appears.
- Per line, optional extras:
  - **Existing-rail context** drawn as a muted grey dashed network beneath the
    featured line — the **Metra** network under CRCL, and the existing
    **MetroRail Red Line** under Austin.
  - **Census callouts** (U.S. lines only) showing residents, jobs, and households
    for each station's tract — CRCL and Austin.
  - **Branch announcements** for Austin's Y-shaped route (see below).
  - A secondary info box (CRCL) linking <https://buildthetunnelchicago.org>.

### Austin's Y-shaped tour
The Austin light rail splits into two branches at a downtown junction (near the
Waterfront stop). The flythrough runs the trunk (38th St → junction), continues
down one branch to Oltorf, **flies back to the split**, then runs the other
branch to Yellow Jacket, with an on-screen banner announcing each leg.

## Data sources

### Line alignments and stations
- **CRCL** geometry comes from the CrossTowner alignment in the
  [Chicago Cityscape](https://www.chicagocityscape.com/) PostGIS database
  (`b_crosstowner_lines` / `b_crosstowner_stations`). Processed in QGIS: reproject
  to EPSG:3435, Chaikin-smooth (4 iterations), resample to ~25 ft spacing (670
  points), reproject back to EPSG:4326.
- **RLE** (Red Line Extension) station points were geocoded from the CTA
  project's published locations (103rd, 111th, Michigan, 130th) plus the existing
  95th/Dan Ryan terminal via the U.S. Census geocoder, then snapped onto the
  corridor. The alignment traces two real rail rights-of-way pulled from
  **OpenStreetMap**: the **Union Pacific "Villa Grove Subdivision"** from ~99th
  Street south to Michigan Avenue, then the **NICTD South Shore Line** southeast
  to the 130th Street terminal (placed on that corridor at 130th). Only a short
  hand-drawn connector at the north end — paralleling I-57 out of 95th/Dan Ryan —
  and the UP→South Shore crossover near 115th are approximated. Densified to ~18 m
  spacing. The flythrough runs **south→north**, starting at the 130th terminal.
- **Toulouse, Austin, Bogotá, and Hamburg** alignments and stations — and the existing
  **Metra** and **MetroRail** context overlays — come from **Transit Explorer**,
  the interactive transit map by **[The Transport Politic](https://www.thetransportpolitic.com/)**
  (Yonah Freemark): <https://www.transitexplorer.com/>. They are pulled from the
  mirrored `transitexplorer_lines_20260405` / `transitexplorer_stations_20260405`
  tables in the Chicago Cityscape database (filtered by agency, line, and status),
  then, per line, the drawn alignment is simplified into a smooth camera `path`
  and each station is projected to its along-track position.

### Station statistics (U.S. lines: CRCL, RLE, and Austin)
For each station, figures are taken from its 2020 Census tract(s):

- **Jobs (workplace)** — total jobs (`C000`) from the U.S. Census Bureau **LEHD
  LODES8 Workplace Area Characteristics (WAC)**, vintage **2023**
  (`il_wac_S000_JT00_2023` for CRCL and RLE, `tx_wac_S000_JT00_2023` for Austin),
  block counts aggregated to tracts.
- **Households** — ACS table **B11001** (`B11001_001`), **ACS 2024 5-year**, via
  the [Census Reporter](https://censusreporter.org/) API (RLE via the Census Data API).
- **Residents** — ACS table **B01003** (`B01003_001`), **ACS 2024 5-year**, via
  Census Reporter (RLE via the Census Data API).

CRCL sums across every 2020 tract within 50 ft of the station point (Roosevelt
spans four tracts on a boundary); RLE sums across every 2020 tract within a
half-mile of the station point; Austin uses each station's containing 2020 tract
(all 15 are in Travis County). Non-U.S. lines (Toulouse, Hamburg) show
name-only callouts. All statistics are precomputed and embedded in `lines.js`.

**Walkshed population (Bogotá).** Each Bogotá Línea 1 station callout shows the
**residents within a ½-mile (804 m) walk**. The walkshed is a foot-walking
isochrone (`range_type=distance`, `range=804 m`) from **OpenRouteService**
(`/v2/isochrones/foot-walking`), and the population is ORS's `total_pop`
attribute, which it computes from the European Commission's **GHS-POP** global
population grid — the same OpenRouteService + GHS-POP method Chicago Cityscape
uses for its station walksheds. A few station points sit on the elevated
alignment where the pedestrian network is disconnected (collapsing the
isochrone); those were nudged ~60 m to the nearest walkable street so the
walkshed reflects the surrounding neighborhood (the displayed station marker
stays on the line). Because 804 m is measured along the street network (reaching
~600–700 m in straight-line terms) and the closest stations are ~965 m apart,
adjacent walksheds still overlap slightly, so the per-station figures should not
be summed.

**Zoning (RLE only).** Each RLE station callout also lists the **top three
`zone_class` values by land area within a half-mile**, computed in PostGIS
against the latest Chicago Cityscape zoning snapshot (`zoning_20260514_144516`,
EPSG:3435): a 2,640-ft buffer intersected with the zoning polygons, area summed
per class, shown as a percentage of the buffer's total zoned area.

> **Vintage note:** jobs are LODES 2023 while households/residents are ACS
> 2020–2024 — close but not the same reference year.

## Sources

- **Base map & 3D buildings** — [OpenFreeMap](https://openfreemap.org/) "Liberty"
  style and vector tiles. © OpenMapTiles, data © OpenStreetMap contributors.
- **Map library** — [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) v4.7.1.
- **Transit line geometry & stations (Toulouse, Austin, Hamburg; Metra/MetroRail
  context)** — [Transit Explorer](https://www.transitexplorer.com/) by
  [The Transport Politic](https://www.thetransportpolitic.com/) (Yonah Freemark).
- **Jobs** — U.S. Census Bureau, LEHD LODES8 WAC:
  <https://lehd.ces.census.gov/data/lodes/LODES8/>
- **Households / Residents** — U.S. Census Bureau ACS 5-year (tables B11001,
  B01003) via [Census Reporter](https://censusreporter.org/).
- **Census tract boundaries** — U.S. Census Bureau 2020 TIGER/Line.
- **CRCL alignment & stations** — CrossTowner concept data in the
  [Chicago Cityscape](https://www.chicagocityscape.com/) database.

## Attribution

When publishing screenshots or video, retain the OpenStreetMap / OpenMapTiles
attribution (MapLibre renders it automatically): **"© OpenMapTiles, data from
OpenStreetMap."**

## Files

| File | Purpose |
|------|---------|
| `index.html` | The flythrough viewer — map, camera engine, UI, and per-line theming. |
| `lines.js` | The line datasets and the `TRANSIT_LINES` config registry. |
| `crcl_geo.json` | The finalized CRCL geometry (camera `path`, drawn `line`, `stations`). |
| `planner/` | The CrossTowner Trip Planner — `index.html`, `app.js`, `config.js`, precomputed results in `data/`, and `methodology.html`. |

Rendered video files (`*.mp4`, `*.mov`) are gitignored — they exceed GitHub's
file-size limits and the live viewer reproduces the flythrough.
