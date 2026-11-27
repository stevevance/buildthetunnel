#!/usr/bin/env python3
"""Write assets/lake.js: Lake Michigan's shore along Chicago, for the lake out to the horizon.

The film's water (city.water) comes from map tiles cut to the areas around the line, so beyond them the lake ended in a
straight edge with bare ground past it. This takes the shore of OpenStreetMap's "Lake Michigan" multipolygon (its
member ways from Indiana to Evanston, through the Chicago Cityscape CLI's Overpass), stitches them into one line from
south to north, and simplifies it (Douglas-Peucker, TOL metres). cab-ride.js closes it far out in the lake (LAKE_OUT).

    python3 tools/build-lake.py            # reads/writes the Overpass answer in tools/.cache/lake.json

Map data (c) OpenStreetMap contributors.
"""
import json, math, os, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".cache", "lake.json")
BBOX = (41.66, -87.80, 42.10, -87.45)          # south, west, north, east
TOL = 10.0
QUERY = '[out:json][timeout:120];rel["name"="Lake Michigan"]["natural"="water"];way(r)(%s,%s,%s,%s);out geom;' % BBOX

if not os.path.exists(CACHE):
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    cli = os.path.expanduser("~/Sites/Chicago Cityscape/cli/overpass.php")
    out = subprocess.run(["php", cli, "--json"], input=QUERY, capture_output=True, text=True, check=True).stdout
    open(CACHE, "w").write(out)
ways = [[(p["lon"], p["lat"]) for p in e["geometry"]] for e in json.load(open(CACHE))["elements"]]

# stitch the ways end to end (each may need reversing), starting from the southernmost end
KX = 111320 * math.cos(math.radians(41.88)); KY = 111070
dist = lambda a, b: math.hypot((a[0] - b[0]) * KX, (a[1] - b[1]) * KY)
start = min(range(len(ways)), key=lambda i: min(ways[i][0][1], ways[i][-1][1]))
line = ways.pop(start)
if line[-1][1] < line[0][1]: line.reverse()
while ways:
    end = line[-1]
    k, rev = min(((i, r) for i in range(len(ways)) for r in (False, True)),
                 key=lambda ir: dist(end, ways[ir[0]][-1] if ir[1] else ways[ir[0]][0]))
    w = ways[k]; gap = dist(end, w[-1] if rev else w[0])
    if gap > 50: break                            # the rest are islands or pieces off the main shore
    ways.pop(k); line += (w[::-1] if rev else w)[1:]

def simplify(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]; ax, ay, bx, by = a[0] * KX, a[1] * KY, b[0] * KX, b[1] * KY
    L = math.hypot(bx - ax, by - ay) or 1e-9
    far, k = 0, 0
    for i in range(1, len(pts) - 1):
        px, py = pts[i][0] * KX, pts[i][1] * KY
        d = abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / L
        if d > far: far, k = d, i
    if far <= tol: return [a, b]
    return simplify(pts[:k + 1], tol)[:-1] + simplify(pts[k:], tol)

shore = simplify(line, TOL)
if shore[0][1] > shore[-1][1]: shore.reverse()
body = ",\n  ".join("[%.6f, %.6f]" % p for p in shore)
open(os.path.join(HERE, "..", "assets", "lake.js"), "w").write(
    "// Lake Michigan's shore along Chicago, south to north, [lon, lat] (OpenStreetMap's \"Lake Michigan\", simplified to %g m;\n"
    "// written by tools/build-lake.py). Map data (c) OpenStreetMap contributors.\n"
    "export const LAKE_SHORE = [%s];\n" % (TOL, body))
print("%d points from %.4f to %.4f (lat), %d ways left over" % (len(shore), shore[0][1], shore[-1][1], len(ways)))
