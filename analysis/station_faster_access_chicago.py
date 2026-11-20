#!/usr/bin/env python3
"""
The station_faster_access counts, for Chicago residents only, at least MINUTES (15) faster.

Reads the per-block-group results of r5r_station_faster_access.R (data/station_faster_access_bg.csv) and keeps the
block groups whose population-weighted centroid (2020 Census, data/census/CenPop2020_Mean_BG17.txt) lies inside
the City of Chicago, taken as the union of its 2023 ward boundaries (data/wards2023.geojson, data portal p293-wvbd).
A block group counts if its CrossTowner time is at least MINUTES shorter than today's, or if it can reach the station
within the 120-minute cap only with CrossTowner. Writes data/station_faster_access_chicago.csv (people_faster).
"""
import csv
import json
import os
import statistics
from shapely.geometry import Point, shape
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
MINUTES = 15

city = unary_union([shape(f["geometry"]) for f in json.load(open(os.path.join(DATA, "wards2023.geojson")))["features"]])
with open(os.path.join(DATA, "census", "CenPop2020_Mean_BG17.txt"), encoding="utf-8-sig") as f:
    in_city = {r["STATEFP"] + r["COUNTYFP"] + r["TRACTCE"] + r["BLKGRPCE"]
               for r in csv.DictReader(f) if city.contains(Point(float(r["LONGITUDE"]), float(r["LATITUDE"])))}

num = lambda v: float(v) if v not in ("", "NA") else None
rows = [r for r in csv.DictReader(open(os.path.join(DATA, "station_faster_access_bg.csv"))) if r["from_id"] in in_city]
for r in rows:                                                    # faster by at least MINUTES (the R script used 10)
    t, c = num(r["today"]), num(r["ct"])
    r["faster"] = "TRUE" if c is not None and (t is None or t - c >= MINUTES) else "FALSE"
stations = sorted({r["to_id"] for r in rows})
out = []
for s in stations:
    rs = [r for r in rows if r["to_id"] == s]
    fast = [r for r in rs if r["faster"] == "TRUE"]
    saved = [num(r["today"]) - num(r["ct"]) for r in fast if num(r["today"]) is not None]
    out.append({"to_id": s, "people_faster": round(sum(float(r["pop"]) for r in fast)), "block_groups": len(fast),
                "median_minutes_saved": statistics.median(saved) if saved else "",
                "reach_60_today": round(sum(float(r["pop"]) for r in rs if num(r["today"]) is not None and num(r["today"]) <= 60)),
                "reach_60_ct": round(sum(float(r["pop"]) for r in rs if num(r["ct"]) is not None and num(r["ct"]) <= 60))})
# and once for each group of stations, counting each block group once
def any_of(label, which):
    by_bg = {}
    for r in rows:
        if r["to_id"] in which:
            by_bg.setdefault(r["from_id"], [float(r["pop"]), False])[1] |= r["faster"] == "TRUE"
    fast = [p for p, f in by_bg.values() if f]
    return {"to_id": label, "people_faster": round(sum(fast)), "block_groups": len(fast),
            "median_minutes_saved": "", "reach_60_today": "", "reach_60_ct": ""}
out.append(any_of("Any of the five tunnel stations", [s for s in stations if s != "18th (Soldier Field)"]))
out.append(any_of("Any of the six stops in the film", stations))
with open(os.path.join(DATA, "station_faster_access_chicago.csv"), "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(out[0])); w.writeheader(); w.writerows(out)
city_pop = sum(float(r["pop"]) for r in rows if r["to_id"] == stations[0])
print(f"Chicago block groups: {len(in_city)}, population {city_pop:,.0f}")
print(f"at least {MINUTES} minutes faster:")
for r in out: print(f"  {r['to_id']:34s} {r['people_faster']:>10,}  ({r['median_minutes_saved']} min saved)")
