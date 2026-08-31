#!/usr/bin/env python3
"""
Who does the trip planner have to turn away?

Finds every 2020 census block in the NITA (formerly RTA) six-county service area
where the planner would answer "No rail trip found" for a trip starting at home,
and totals the population living there.

The planner never routes on the street network at request time: it snaps each
endpoint to the nearest stations within a walk cap and looks the pair up in a
precomputed station-to-station matrix (planner/app.js). So the failure is
reproducible offline, exactly, from three inputs:

  1. the walk cap   -- 20 min at 4.43 km/h with a 1.3 street-detour factor,
                       i.e. any station farther than 1.1359 km straight-line is
                       unreachable (CFG.maxWalkMin / walkSpeedKmh / detourFactor)
  2. nearestK = 3   -- only the three closest walkable stations are ever tried,
                       so a 4th walkable station cannot rescue a trip
  3. the matrix     -- an origin station with no shard, or a shard that reaches
                       only itself, is a dead end no matter how close it is

A block is a "no rail trip found" origin when *every* trip leaving it fails,
which happens two ways:

  no_station  -- nothing boardable within the walk cap (bestTotal returns null;
                 diagnoseNoRoute calls this "origin_no_station")
  stranded    -- a station is walkable, but none of the three nearest reach any
                 other station in the matrix ("route_data_missing")

Run for both networks. The planner only prints the error when today *and*
scenario both fail, so the headline number is the intersection; the today-only
number is what the network strands before CrossTowner + the Red Line Extension.

Outputs (analysis/results/):
  no_rail_trip_blocks.csv     -- one row per unreachable block, with population
  no_rail_trip_summary.csv    -- county x network totals
  no_rail_trip_blocks.geojson -- the same blocks' internal points, for QGIS
"""
import json, os, sys
import numpy as np
import pandas as pd
import geopandas as gpd
from scipy.spatial import cKDTree

SP   = "/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
REPO = "/Users/stevevance/Sites/BuildTheTunnel"
OUT  = os.path.join(REPO, "analysis", "results")
os.makedirs(OUT, exist_ok=True)

# --- planner constants, read from the live config so they can't drift ---------
cfg = open(os.path.join(REPO, "planner", "config.js")).read()
def cfgnum(key):
    import re
    return float(re.search(key + r"\s*:\s*([0-9.]+)", cfg).group(1))
WALK_KMH, MAX_WALK, DETOUR, NEAREST_K = (
    cfgnum("walkSpeedKmh"), cfgnum("maxWalkMin"), cfgnum("detourFactor"), int(cfgnum("nearestK")))
CAP_KM = MAX_WALK / 60 * WALK_KMH / DETOUR          # straight-line walk cap
R = 6371.0                                          # same earth radius as app.js

# NITA / RTA service area: Cook, DuPage, Kane, Lake, McHenry, Will.
COUNTIES = {"031": "Cook", "043": "DuPage", "089": "Kane",
            "097": "Lake", "111": "McHenry", "197": "Will"}

print(f"walk cap {MAX_WALK:.0f} min -> {CAP_KM:.4f} km straight line "
      f"({CAP_KM*0.621371:.3f} mi); nearestK={NEAREST_K}")

# --- 1. stations, and which of them can actually reach anywhere ---------------
stations = json.load(open(os.path.join(REPO, "planner", "data", "stations.json")))
MDIR = os.path.join(REPO, "planner", "data", "matrix")
SLICE = "0800"

def live_ids(network):
    """Station ids whose origin shard reaches at least one *other* station."""
    d = os.path.join(MDIR, network, SLICE)
    live = set()
    for f in os.listdir(d):
        if not f.endswith(".json"):
            continue
        sid = f[:-5]
        row = json.load(open(os.path.join(d, f)))
        if any(k != sid for k in row):
            live.add(sid)
    return live

NETS = {"today": [s for s in stations if s.get("exists_today")],
        "scenario": stations}
LIVE = {n: live_ids(n) for n in NETS}
for n in NETS:
    dead = [s["name"] for s in NETS[n] if s["id"] not in LIVE[n]]
    print(f"{n}: {len(NETS[n])} stations, {len(dead)} dead ends -> {sorted(dead)}")

# --- 2. blocks in the six counties -------------------------------------------
blk = gpd.read_file(os.path.join(SP, "tl_2020_17_tabblock20.shp"),
                    columns=["GEOID20", "COUNTYFP20", "POP20", "HOUSING20",
                             "ALAND20", "INTPTLAT20", "INTPTLON20", "UR20"],
                    ignore_geometry=True)
blk = blk[blk.COUNTYFP20.isin(COUNTIES)].copy()
blk["county"] = blk.COUNTYFP20.map(COUNTIES)
blk["lat"] = blk.INTPTLAT20.astype(float)
blk["lon"] = blk.INTPTLON20.astype(float)
print(f"blocks in service area: {len(blk):,}   pop {blk.POP20.sum():,}")

# --- 3. nearest-K station lookup, on the sphere (matches app.js haversine) ----
def ecef(lat, lon):
    la, lo = np.radians(lat), np.radians(lon)
    return np.column_stack([R*np.cos(la)*np.cos(lo), R*np.cos(la)*np.sin(lo), R*np.sin(la)])

B = ecef(blk.lat.values, blk.lon.values)
CAP_CHORD = 2 * R * np.sin(CAP_KM / (2 * R))        # great-circle cap -> chord

for net, sts in NETS.items():
    S = ecef(np.array([s["lat"] for s in sts]), np.array([s["lon"] for s in sts]))
    alive = np.array([s["id"] in LIVE[net] for s in sts])
    tree = cKDTree(S)
    k = min(NEAREST_K, len(sts))
    dist, idx = tree.query(B, k=k)                  # chord distance, ascending
    within = dist <= CAP_CHORD                      # inside the walk cap
    n_walkable = within.sum(axis=1)
    # of the <=K nearest walkable candidates, does any reach another station?
    usable = (within & alive[idx]).any(axis=1)
    blk[f"walkable_{net}"] = n_walkable
    blk[f"nearest_km_{net}"] = 2 * R * np.arcsin(np.clip(dist[:, 0] / (2 * R), 0, 1))
    blk[f"fail_{net}"] = ~usable
    blk[f"reason_{net}"] = np.where(n_walkable == 0, "no_station",
                             np.where(~usable, "stranded", ""))

blk["fail_both"] = blk.fail_today & blk.fail_scenario

# --- 4. municipality label, for the "where are these people" table ------------
plc = gpd.read_file(os.path.join(SP, "tl_2020_17_place.shp"),
                    columns=["NAME", "NAMELSAD", "geometry"])
pts = gpd.GeoDataFrame(blk[["GEOID20"]],
                       geometry=gpd.points_from_xy(blk.lon, blk.lat), crs="EPSG:4269")
j = gpd.sjoin(pts, plc.to_crs("EPSG:4269"), how="left", predicate="within")
j = j[~j.index.duplicated(keep="first")]
blk["place"] = j["NAME"].fillna("unincorporated").values

# --- 5. report ----------------------------------------------------------------
tot = blk.POP20.sum()
lines = []
def say(s):
    print(s); lines.append(s)

say("")
say(f'NITA six-county service area, 2020 census blocks: {len(blk):,} blocks, {tot:,} residents')
for net in ["today", "scenario"]:
    f = blk[blk[f"fail_{net}"]]
    say(f'  {net:9s}: {f.POP20.sum():>9,} people ({100*f.POP20.sum()/tot:5.1f}%) in '
        f'{len(f):,} blocks would get "No rail trip found"')
    for r, g in f.groupby(f"reason_{net}"):
        say(f'      {r:11s} {g.POP20.sum():>9,} ({len(g):,} blocks)')
fb = blk[blk.fail_both]
say(f'  BOTH     : {fb.POP20.sum():>9,} people ({100*fb.POP20.sum()/tot:5.1f}%) -- '
    f'what the planner actually shows the error for')
gain = blk[blk.fail_today & ~blk.fail_scenario]
say(f'  CrossTowner + RLE newly served: {gain.POP20.sum():,} people in {len(gain):,} blocks')

say("")
say("By county (people the planner turns away / county population):")
say(f'{"county":10s} {"population":>11s} {"today":>11s} {"%":>6s} {"scenario":>11s} {"%":>6s}')
for c, g in blk.groupby("county"):
    p = g.POP20.sum()
    t = g[g.fail_today].POP20.sum(); s = g[g.fail_scenario].POP20.sum()
    say(f'{c:10s} {p:>11,} {t:>11,} {100*t/p:>5.1f}% {s:>11,} {100*s/p:>5.1f}%')

say("")
say("Largest unserved populations by municipality (scenario network):")
top = (blk[blk.fail_scenario].groupby("place")
       .agg(pop=("POP20", "sum"), blocks=("GEOID20", "size")).sort_values("pop", ascending=False))
share = blk.groupby("place").POP20.sum()
for place, row in top.head(25).iterrows():
    say(f'  {place:28s} {row["pop"]:>8,}  ({100*row["pop"]/share[place]:4.1f}% of its population)')

open(os.path.join(OUT, "no_rail_trip_report.txt"), "w").write("\n".join(lines) + "\n")

# --- 6. files -----------------------------------------------------------------
cols = ["GEOID20", "county", "place", "POP20", "HOUSING20", "ALAND20", "UR20",
        "lat", "lon", "walkable_today", "walkable_scenario",
        "nearest_km_today", "nearest_km_scenario",
        "fail_today", "fail_scenario", "fail_both", "reason_today", "reason_scenario"]
out = blk[blk.fail_scenario | blk.fail_today][cols].sort_values("POP20", ascending=False)
out.to_csv(os.path.join(OUT, "no_rail_trip_blocks.csv"), index=False)

summ = (blk.groupby("county")
        .apply(lambda g: pd.Series({
            "population": g.POP20.sum(), "blocks": len(g),
            "pop_fail_today": g[g.fail_today].POP20.sum(),
            "pop_fail_scenario": g[g.fail_scenario].POP20.sum(),
            "pop_fail_both": g[g.fail_both].POP20.sum(),
            "pop_no_station_scenario": g[g.reason_scenario == "no_station"].POP20.sum(),
            "pop_stranded_scenario": g[g.reason_scenario == "stranded"].POP20.sum()})))
summ.to_csv(os.path.join(OUT, "no_rail_trip_summary.csv"))

gdf = gpd.GeoDataFrame(out, geometry=gpd.points_from_xy(out.lon, out.lat), crs="EPSG:4269")
gdf.to_file(os.path.join(OUT, "no_rail_trip_blocks.geojson"), driver="GeoJSON")
print(f"\nwrote {OUT}/no_rail_trip_{{blocks.csv,summary.csv,blocks.geojson,report.txt}}")
