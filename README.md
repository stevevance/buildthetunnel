# Transit line 3D flythrough

A [MapLibre GL JS](https://maplibre.org/) viewer that flies a pitched 3D camera
along a transit line over real extruded buildings. It opens by framing the whole
line, then dives to the start and travels stop to stop, dwelling at each station.

Four lines are selectable, each directly linkable via a URL hash:

| Line | Status | Permalink |
|------|--------|-----------|
| **Chicago — Clinton–Roosevelt Connector (CRCL)** | proposed | [`#crcl`](https://stevevance.github.io/buildthetunnel/#crcl) |
| **Toulouse — Ligne C (Line 3)** | under construction | [`#toulouse`](https://stevevance.github.io/buildthetunnel/#toulouse) |
| **Austin — Light Rail (Project Connect)** | planned | [`#austin`](https://stevevance.github.io/buildthetunnel/#austin) |
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
- **Toulouse, Austin, and Hamburg** alignments and stations — and the existing
  **Metra** and **MetroRail** context overlays — come from **Transit Explorer**,
  the interactive transit map by **[The Transport Politic](https://www.thetransportpolitic.com/)**
  (Yonah Freemark): <https://www.transitexplorer.com/>. They are pulled from the
  mirrored `transitexplorer_lines_20260405` / `transitexplorer_stations_20260405`
  tables in the Chicago Cityscape database (filtered by agency, line, and status),
  then, per line, the drawn alignment is simplified into a smooth camera `path`
  and each station is projected to its along-track position.

### Station statistics (U.S. lines: CRCL and Austin)
For each station, figures are taken from its 2020 Census tract(s):

- **Jobs (workplace)** — total jobs (`C000`) from the U.S. Census Bureau **LEHD
  LODES8 Workplace Area Characteristics (WAC)**, vintage **2023**
  (`il_wac_S000_JT00_2023` for CRCL, `tx_wac_S000_JT00_2023` for Austin), block
  counts aggregated to tracts.
- **Households** — ACS table **B11001** (`B11001_001`), **ACS 2024 5-year**, via
  the [Census Reporter](https://censusreporter.org/) API.
- **Residents** — ACS table **B01003** (`B01003_001`), **ACS 2024 5-year**, via
  Census Reporter.

CRCL sums across every 2020 tract within 50 ft of the station point (Roosevelt
spans four tracts on a boundary); Austin uses each station's containing 2020 tract
(all 15 are in Travis County). Non-U.S. lines (Toulouse, Hamburg) show
name-only callouts. All statistics are precomputed and embedded in `lines.js`.

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
| `index.html` | The viewer — map, camera engine, UI, and per-line theming. |
| `lines.js` | The line datasets and the `TRANSIT_LINES` config registry. |
| `crcl_geo.json` | The finalized CRCL geometry (camera `path`, drawn `line`, `stations`). |

Rendered video files (`*.mp4`, `*.mov`) are gitignored — they exceed GitHub's
file-size limits and the live viewer reproduces the flythrough.
