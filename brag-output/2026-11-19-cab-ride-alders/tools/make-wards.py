#!/usr/bin/env python3
"""
Write assets/wards.js: the outlines of the City of Chicago's wards (2023 boundaries, data portal dataset p293-wvbd,
../../analysis/data/wards2023.geojson) around the film's route, simplified to about 3 m, for the minimap, which
draws the ward the train is in and says its number.
"""
import json
import os
from shapely.geometry import box, shape

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "..", "..", "analysis", "data", "wards2023.geojson")
AREA = box(-87.675, 41.845, -87.600, 41.915)                     # lon/lat, a little beyond the minimap's plate
out = []
for f in json.load(open(SRC))["features"]:
    g = shape(f["geometry"])
    if not g.intersects(AREA):
        continue
    g = g.simplify(0.00003, preserve_topology=True)
    polys = list(g.geoms) if g.geom_type == "MultiPolygon" else [g]
    out.append({"ward": int(float(f["properties"]["ward"])),
                "rings": [[[round(x, 6), round(y, 6)] for x, y in p.exterior.coords] for p in polys]})
out.sort(key=lambda w: w["ward"])
with open(os.path.join(HERE, "..", "assets", "wards.js"), "w") as fh:
    fh.write("// Written by tools/make-wards.py: City of Chicago ward outlines (2023), [lon, lat], around the route.\n")
    fh.write("export default " + json.dumps(out, separators=(",", ":")) + ";\n")
print(len(out), "wards:", [w["ward"] for w in out])
