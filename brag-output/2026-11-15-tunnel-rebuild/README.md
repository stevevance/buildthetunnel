# Sources: Build the Tunnel video (2026-11-15)

Every source used in `vertical/brag-vertical.mp4` (1080x1920) and `landscape/brag.mp4` (1920x1080). Both are written by `build.py`, which draws every picture from this repo's own geometry. No web page is captured.

## Facts on screen

| What | Source |
|---|---|
| Four downtown stations: Ogilvie, Union Station, LaSalle Street, Millennium | Where the Metra lines end in `planner/data/lines.json` |
| "21 of 69 minutes: getting between trains"; 69 min and 2 transfers against 44 min on one train (Northwestern to UChicago) | `maps/map-northwestern-to-uchicago.html`, re-checked 2026-11-15. The red part of the "today" bar is those 21 minutes; the gray parts are 30 and 18 minutes riding |
| 75 min and 2 transfers against 60 min on one train (Arlington Heights to Hyde Park) | `maps/map-arlington-heights-to-hyde-park.html`, re-checked 2026-11-15. Red is 17 minutes between trains; gray is 40 and 18 minutes riding |
| "3 miles of tunnel" | Steven, 2026-11-15, rounded from Star:Line Chicago's 3.1 to 3.2 miles (see `brag-plan.md`) |
| "4 new stations" | `CLINTON_ROOSEVELT_CONNECTOR.stations` in `lines.js` |
| "connecting 10 Metra lines" (Steven, 2026-11-15) and "Change trains at a new station" | Every Metra line but the Rock Island. Tunnel routes run on three (Union Pacific North, Union Pacific Northwest, Metra Electric; `analysis/crosstowner_xroutes_gtfs/routes.txt`). Riders reach the other seven by changing trains at the tunnel's stations: BNSF, Heritage Corridor, Milwaukee District North and West, North Central Service and SouthWest Service at Union Station, and Union Pacific West at Ogilvie (Randolph/Clinton) |
| "25 minutes faster!" and "15 minutes faster!" | 69 minus 44, and 75 minus 60 |

## Map geometry

| What | Source |
|---|---|
| Metra lines and tunnel routes X1 to X4 | `planner/data/lines.json` |
| The tunnel and its stations | `CLINTON_ROOSEVELT_CONNECTOR` in `lines.js` |
| County outlines | `planner/data/metra_counties.geojson` |
| The dotted trip from Ogilvie to Millennium | Drawn for the video: east from Ogilvie, then north to Millennium. It stands for the walk and bus across the Loop and is not a surveyed route |

## Design assets

| What | Source | License |
|---|---|---|
| Inter 400/600/800 | `@fontsource/inter` | SIL Open Font License 1.1 |
| GSAP 3.12.5 | cdn.jsdelivr.net | GreenSock standard no-charge license |
| Music | "Winter Fusion (Instrumental)" by Aussens@iter, [ccMixter](https://ccmixter.org/files/tobias_weber/57029), played from 2.455 s in | CC BY 3.0 (credited on the end card and in captions) |
| Rendering | HyperFrames 0.9.26 and ffmpeg on Chicago Cityscape's brag-render-2cpu droplet | Tools only |

CrossTowner is Star:Line Chicago's proposal; the end card and captions say so.
