# Minimap plate

`assets/minimap.png` is the basemap the film's corner minimap crops from: streets
with names, parks, water and rail, drawn by the `telemetry-recap-video` skill.
To rebuild it (for example after changing the alignment), from a scratch folder:

```
node tools/export-route.mjs <scratch>          # route.json + streams.json
K=~/.claude/skills/telemetry-recap-video/scripts
W=<this project>/tools/minimap/via-cityscape.py      # sends the scripts' Overpass queries through the Cityscape CLI (Overspan)
uv run --python 3.12 python $W $K/fetch_streets.py --latlng-json route.json --out streets.geojson
uv run --python 3.12 python $W $K/fetch_basemap.py --latlng-json route.json --prefix osm --layers parks,water,rail,places
cp tools/minimap/recap.json <scratch>/
uv run --python 3.12 --with geopandas --with matplotlib --with shapely python $K/build_map_plate.py --config recap.json
```

Then copy `minimap.png` to `assets/` and the contents of `minimap.json` into
`assets/minimap-geo.js`, keeping its `opening` (the opening map's view of the tunnel). Map data (c) OpenStreetMap contributors.
