#!/usr/bin/env python3
"""
Write assets/station-stats.js, the numbers on the alderpersons' cut's station cards, from
../../analysis/data/station_faster_access_chicago.csv: Chicago residents only (analysis/r5r_station_faster_access.R,
then analysis/station_faster_access_chicago.py).

Wards: every ward of the City of Chicago's 2023 boundaries (data portal dataset p293-wvbd) within 250 feet
of each stop's CrossTowner GTFS point; looked up 2026-11-19.
"""
import csv
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
CSV = os.path.join(HERE, "..", "..", "..", "analysis", "data", "station_faster_access_chicago.csv")
# the GTFS's stop names -> the film's, and the wards within 250 ft of each stop
STOPS = {
    "18th (Soldier Field)": ("18th (Soldier Field)", [3, 4]),
    "Roosevelt": ("Roosevelt", [3, 4, 34]),
    "Taylor/Clinton": ("Taylor/Clinton", [28]),
    "Union Station": ("Union Station", [34, 42]),
    "Randolph/Clinton (Ogilvie)": ("Randolph/Clinton", [34, 42]),
    "Chicago/Halsted (Bally's)": ("Chicago/Halsted", [27]),
}

rows = {r["to_id"]: r for r in csv.DictReader(open(CSV))}
stations = {film: {"wards": wards, "people": int(float(rows[gtfs]["people_faster"]))}
            for gtfs, (film, wards) in STOPS.items()}
tunnel_wards = sorted({w for gtfs, (film, wards) in STOPS.items() if gtfs != "18th (Soldier Field)" for w in wards})
tunnel = int(float(rows["Any of the five tunnel stations"]["people_faster"]))
out = os.path.join(HERE, "..", "assets", "station-stats.js")
with open(out, "w") as f:
    f.write("// Written by tools/make-station-stats.py from ../../analysis/data/station_faster_access_chicago.csv (analysis/station_faster_access_chicago.py):\n"
            "// for each stop, the Chicago residents (2020 Census) whose door-to-station trip at 8 AM would be at least 15 minutes faster with CrossTowner,\n"
            "// and the wards within 250 ft of it (City of Chicago ward boundaries, 2023). tunnel: at least one of the five tunnel stations, counted once.\n")
    f.write("export default " + json.dumps({"stations": stations, "tunnel": tunnel, "tunnelWards": tunnel_wards}, indent=1) + ";\n")
for name, s in stations.items():
    print(f"  {name:22s} wards {', '.join(map(str, s['wards'])):10s} {s['people']:>10,}")
print(f"  any tunnel station          {tunnel:>10,}")
