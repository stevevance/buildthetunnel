# CRCL 3D flythrough

A self-contained [MapLibre GL JS](https://maplibre.org/) viewer that flies a
pitched 3D camera along the **Clinton-Roosevelt Connector Line (CRCL)** — a
proposed line of the CrossTowner transit concept — over real extruded buildings.
The camera dwells at each of the four stations and shows how many **jobs** and
**households** are in the surrounding Census tract(s).

The whole thing is one HTML file (`index.html`) with the geometry
and statistics embedded inline, so it runs straight from disk.

## Running it

Open `index.html` in any modern browser. It needs an internet
connection for the MapLibre library (CDN) and the OpenFreeMap vector tiles, but
no server and no API keys — all CRCL geometry and the per-station statistics are
baked into the file.

### Controls
- **Pitch / Zoom** sliders adjust the camera.
- **Pause / Play** pauses and resumes the flythrough (you can still drag to look around while paused).
- **Replay** restarts from the south end.
- **Drag** to look around at any time.

## What you see

- A dashed purple **tunnel alignment** with a soft "trench" casing. MapLibre
  GL JS cannot place geometry below ground level, so the subsurface line is drawn
  with the conventional cartographic tunnel treatment rather than true 3D depth.
- Four red **station markers**. The camera decelerates into each, dwells ~5 s
  while a callout shows the jobs/households figures, then accelerates out.
- Two teal **non-dwell annotations** at the ends: *"Connection to Metra Electric
  District"* (south) and *"Low Line connection"* (north).

## Stations: jobs and households

For each station, figures are summed across **every 2020 Census tract within
50 ft of the station point** (a point on a tract boundary can touch several
tracts, so all of them are included). Roosevelt sits on a boundary and spans
four tracts; the other three points are tract-interior.

| Station | Census tract(s) within 50 ft | Residents | Jobs | Households |
|---------|------------------------------|----------:|-----:|-----------:|
| Roosevelt | 3206, 3301.02, 3302, 8390 | 32,626 | 11,533 | 19,458 |
| Taylor/Clinton | 8419 | 6,567 | 24,894 | 1,671 |
| Union Station (West) | 2819 | 6,907 | 37,015 | 4,529 |
| Randolph/Clinton | 2801 | 7,742 | 29,493 | 5,641 |

## Data and methodology

### CRCL geometry (`crcl_geo.json`)
The line and camera path come from the CrossTowner alignment stored in the
[Chicago Cityscape](https://www.chicagocityscape.com/) PostGIS database (layer
`b_crosstowner_lines`, feature *Clinton-Roosevelt Connector Line (CRCL)*).
Processing, in QGIS:

1. Reproject to **EPSG:3435** (Illinois State Plane East, US feet).
2. Round corners with **Chaikin smoothing (4 iterations)**.
3. Resample to a uniform **~25 ft** point spacing (670 points).
4. Reproject back to **EPSG:4326** for the web map.

Stations come from `b_crosstowner_stations`; the four CRCL stops carry the
`X1`–`X4` tags. (Union Station Riverside is intentionally excluded — it is ~619 ft
off on the parallel SCAL line.)

### Jobs (workplace)
Total jobs (`C000`) from the U.S. Census Bureau **LEHD LODES8 Workplace Area
Characteristics (WAC)** dataset for Illinois, vintage **2023**
(`il_wac_S000_JT00_2023` — S000 = all workers, JT00 = all jobs). Block-level
counts are aggregated to 2020 Census tracts and summed across each station's
tract set. This is the same column and aggregation used by the Chicago Cityscape
Demographics Snapshot "Jobs (workplace)" metric.

### Households
Total households, ACS table **B11001 (Household Type)**, estimate `B11001_001`,
**ACS 2024 5-year (2020–2024)**, retrieved per tract from the Census Reporter API
and summed across each station's tract set.

### Residents (population)
Total population, ACS table **B01003 (Total Population)**, estimate `B01003_001`,
**ACS 2024 5-year (2020–2024)**, retrieved per tract from the Census Reporter API
and summed across each station's tract set.

> **Vintage note:** the jobs figure is LODES 2023 and the households figure is
> ACS 2020–2024. They are close but not the same reference year.

### Tract boundaries
Point-in-tract and the 50-ft buffer test use **2020 TIGER/Line Census tract**
geometry (`b_census_tracts_illinois_2020`, EPSG:3435). 2020 tracts are used to
match the vintage of the LODES8 block geocodes.

The per-station statistics are precomputed (this viewer runs from `file://` and
cannot reach the database or APIs) and embedded in the HTML.

## Sources

- **Base map & 3D buildings** — [OpenFreeMap](https://openfreemap.org/) "Liberty"
  style and vector tiles. © OpenMapTiles, data © OpenStreetMap contributors
  (rendered via MapLibre).
- **Map library** — [MapLibre GL JS](https://github.com/maplibre/maplibre-gl-js) v4.7.1.
- **Jobs** — U.S. Census Bureau, LEHD LODES8 WAC:
  <https://lehd.ces.census.gov/data/lodes/LODES8/il/wac/>
- **Households** — U.S. Census Bureau, ACS 5-year table B11001, via
  [Census Reporter](https://censusreporter.org/) (<https://api.censusreporter.org/>).
- **Residents (population)** — U.S. Census Bureau, ACS 5-year table B01003, via
  [Census Reporter](https://censusreporter.org/).
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
| `index.html` | The viewer (data embedded inline). |
| `crcl_geo.json` | Finalized geometry: camera `path`, drawn `line`, and `stations`. |

Rendered video files (`*.mp4`, `*.mov`) are gitignored — they exceed GitHub's
file-size limits and the live viewer reproduces the flythrough.
