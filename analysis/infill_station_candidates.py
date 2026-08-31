#!/usr/bin/env python3
"""
Infill-station opportunity: people the trip planner turns away who already live
alongside an existing rail line.

no_rail_trip_blocks.py counts everyone in the NITA six-county service area for
whom the planner answers "No rail trip found" -- 5.4 million people, most of
whom live nowhere near a track. That total is the bound, not the ask. NITA is
not going to build new lines; it can plausibly build new *stations* on lines it
already runs. So this script splits the gap in two:

  addressable  -- unserved, but within the planner's own 20-minute walk cap
                  (1.1359 km straight line) of an existing Metra or CTA rail
                  alignment. A platform here would put them on the network.
  off-corridor -- unserved and not near any track. Only a new line reaches them.

Then it actually sites the stations. Candidate points are sampled every 100 m
along each existing alignment; each one scores the currently-unserved population
inside its walk cap. A greedy pass takes the highest-scoring candidate, removes
the blocks it captures so the next pick can't double-count them, and repeats,
holding every pick at least MIN_SPACING from any existing station and from every
pick before it. The result is a ranked list of infill sites and the population
each would newly put within walking distance of rail.

Existing lines only: the CrossTowner X-routes and the Red Line Extension are
excluded from the alignments, because the point of the exercise is what can be
done to the railroad that is already there.

Outputs (analysis/results/):
  infill_candidates.csv       -- ranked infill sites, population newly served
  infill_candidates.geojson   -- the same, as points for QGIS
  infill_report.txt           -- the tables printed below
"""
import json, os
import numpy as np, pandas as pd, geopandas as gpd
from scipy.spatial import cKDTree

SP   = "/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
REPO = "/Users/stevevance/Sites/BuildTheTunnel"
OUT  = os.path.join(REPO, "analysis", "results"); os.makedirs(OUT, exist_ok=True)

CAP        = 20 / 60 * 4.43 / 1.3     # planner walk cap, straight-line km
MIN_SPACING = 1.609                   # km; no infill site within 1 mi of an
                                      # existing station or another infill pick
SAMPLE_M   = 100                      # candidate spacing along the alignment
R          = 6371.0
COUNTIES   = {"031": "Cook", "043": "DuPage", "089": "Kane",
              "097": "Lake", "111": "McHenry", "197": "Will"}
# lines.json also carries the proposals; those are not infill opportunities.
PROPOSED   = {"X1", "X2", "X3", "X4", "X5", "X6", "RLE"}
LINE_NAMES = {"Red":"Red Line","Blue":"Blue Line","G":"Green Line","Brn":"Brown Line",
              "Org":"Orange Line","P":"Purple Line","Pink":"Pink Line","Y":"Yellow Line",
              "BNSF":"BNSF","ME":"Metra Electric","HC":"Heritage Corridor","MD-N":"MD-N",
              "MD-W":"MD-W","NCS":"North Central Service","RI":"Rock Island",
              "SWS":"SouthWest Service","UP-N":"UP-N","UP-NW":"UP-NW","UP-W":"UP-W"}

def ecef(lat, lon):
    la, lo = np.radians(np.asarray(lat, float)), np.radians(np.asarray(lon, float))
    return np.column_stack([R*np.cos(la)*np.cos(lo), R*np.cos(la)*np.sin(lo), R*np.sin(la)])
def chord(km):  return 2 * R * np.sin(km / (2 * R))
def gc(ch):     return 2 * R * np.arcsin(np.clip(ch / (2 * R), 0, 1))

# --- blocks, and who the planner already turns away ---------------------------
blk = gpd.read_file(os.path.join(SP, "tl_2020_17_tabblock20.shp"),
                    columns=["GEOID20","COUNTYFP20","POP20","INTPTLAT20","INTPTLON20"],
                    ignore_geometry=True)
blk = blk[blk.COUNTYFP20.isin(COUNTIES) & (blk.POP20 > 0)].copy()
blk["county"] = blk.COUNTYFP20.map(COUNTIES)
blk["lat"] = blk.INTPTLAT20.astype(float); blk["lon"] = blk.INTPTLON20.astype(float)
B = ecef(blk.lat.values, blk.lon.values)
pop = blk.POP20.values.astype(np.int64)

sts = json.load(open(os.path.join(REPO, "planner", "data", "stations.json")))
mdir = os.path.join(REPO, "planner", "data", "matrix", "scenario", "0800")
live = {f[:-5] for f in os.listdir(mdir) if f.endswith(".json")
        and any(k != f[:-5] for k in json.load(open(os.path.join(mdir, f))))}
S = ecef([s["lat"] for s in sts], [s["lon"] for s in sts])
alive = np.array([s["id"] in live for s in sts])
sd, si = cKDTree(S).query(B, k=3)
unserved = ~((sd <= chord(CAP)) & alive[si]).any(axis=1)
blk["unserved"] = unserved
print(f"service-area population (populated blocks): {pop.sum():,}")
print(f"planner turns away:                         {pop[unserved].sum():,}")

# --- existing alignments, densified ------------------------------------------
lines = json.load(open(os.path.join(REPO, "planner", "data", "lines.json")))
def densify(part, step_km):
    """Walk a [[lon,lat],...] polyline, emitting points every step_km."""
    out, carry = [], 0.0
    for a, b in zip(part[:-1], part[1:]):
        pa, pb = ecef(a[1], a[0])[0], ecef(b[1], b[0])[0]
        seg = gc(np.linalg.norm(pb - pa))
        if seg <= 0: continue
        t = carry
        while t < seg:
            f = t / seg
            out.append((a[0] + (b[0]-a[0])*f, a[1] + (b[1]-a[1])*f))
            t += step_km
        carry = t - seg
    out.append(tuple(part[-1]))
    return out

cand_lon, cand_lat, cand_line = [], [], []   # candidate platform sites
dens_lon, dens_lat = [], []                  # finer set, for "is this block near track"
for key, parts in lines.items():
    if key in PROPOSED: continue
    for part in parts:
        pts = densify(part, SAMPLE_M / 1000)
        cand_lon += [p[0] for p in pts]; cand_lat += [p[1] for p in pts]
        cand_line += [key] * len(pts)
        fine = densify(part, 0.05)
        dens_lon += [p[0] for p in fine]; dens_lat += [p[1] for p in fine]
print(f"existing alignments: {len([k for k in lines if k not in PROPOSED])} lines, "
      f"{len(cand_lon):,} candidate sites at {SAMPLE_M} m spacing")

# --- split the gap: addressable by infill vs. off-corridor --------------------
line_tree = cKDTree(ecef(dens_lat, dens_lon))
bd, _ = line_tree.query(B, k=1)
blk["km_to_line"] = gc(bd)
near_line = blk.km_to_line.values <= CAP
addressable = unserved & near_line
print(f"  within {CAP:.3f} km of existing track but unserved: {pop[addressable].sum():,}")
print(f"  not near any existing track (needs a new line):     {pop[unserved & ~near_line].sum():,}")

# --- greedy infill siting -----------------------------------------------------
C = ecef(cand_lat, cand_lon)
keep = gc(cKDTree(S).query(C, k=1)[0]) >= MIN_SPACING     # not on top of a station
C, cand_line = C[keep], np.array(cand_line)[keep]
cand_lon = np.array(cand_lon)[keep]; cand_lat = np.array(cand_lat)[keep]
print(f"  candidates at least {MIN_SPACING:.3f} km from any existing station: {len(C):,}")

btree = cKDTree(B)
catch = btree.query_ball_point(C, r=chord(CAP))            # blocks each site would serve
avail = unserved.copy()
score = np.array([pop[np.array(c, int)][avail[np.array(c, int)]].sum() if c else 0
                  for c in catch], dtype=np.int64)

picks, taken = [], np.zeros(len(C), bool)
while True:
    score[taken] = -1
    i = int(score.argmax())
    if score[i] < 250: break                               # not worth a platform
    idx = np.array(catch[i], int)
    got = idx[avail[idx]]
    picks.append({"line": LINE_NAMES.get(cand_line[i], cand_line[i]),
                  "lat": round(float(cand_lat[i]), 5), "lon": round(float(cand_lon[i]), 5),
                  "new_pop": int(pop[got].sum()), "blocks": int(len(got))})
    avail[got] = False
    # block nearby candidates, then rescore whatever overlapped this pick
    close = gc(cKDTree(C).query(C[i:i+1], k=len(C))[0][0]) < MIN_SPACING
    order = cKDTree(C).query(C[i:i+1], k=len(C))[1][0]
    taken[order[close]] = True
    for j in range(len(C)):
        if taken[j] or not catch[j]: continue
        cj = np.array(catch[j], int)
        score[j] = pop[cj][avail[cj]].sum()

df = pd.DataFrame(picks)
df.insert(0, "rank", range(1, len(df) + 1))
df["cumulative"] = df.new_pop.cumsum()

# municipality label for each site
plc = gpd.read_file(os.path.join(SP, "tl_2020_17_place.shp"), columns=["NAME","geometry"])
g = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.lon, df.lat), crs="EPSG:4269")
g = gpd.sjoin(g, plc.to_crs("EPSG:4269"), how="left", predicate="within")
g = g[~g.index.duplicated(keep="first")]
df["place"] = g.NAME.fillna("unincorporated").values

# Label each site by the two nearest existing stations of the same mode. An
# earlier version tried to name the stations it would sit *between*, ordering
# stations by distance along the alignment -- but lines.json is a display
# polyline (the Red Line is 79 vertices for 35 km), and at that resolution
# stations drift on and off the line and the bracketing comes out wrong. Nearest
# same-mode stations is a claim the geometry can actually support.
ON = [s_ for s_ in sts if s_.get("exists_today")]
ON_E = ecef([s_["lat"] for s_ in ON], [s_["lon"] for s_ in ON])
CTA_KEYS = {"Red","Blue","G","Brn","Org","P","Pink","Y"}
KEY = {v: k for k, v in LINE_NAMES.items()}
def nearest_pair(lat, lon, key):
    """Two closest existing stations of this line's mode, with miles."""
    mode = np.array([bool(s_.get("on_cta_rail")) if key in CTA_KEYS else bool(s_.get("on_metra"))
                     for s_ in ON])
    d = gc(np.linalg.norm(ON_E - ecef(lat, lon), axis=1))
    d = np.where(mode, d, np.inf)
    o = np.argsort(d)[:2]
    return ", ".join(f"{ON[i]['name']} ({d[i]*0.621371:.1f} mi)" for i in o)
df["nearest_stations"] = [nearest_pair(r.lat, r.lon, KEY.get(r.line, r.line))
                          for r in df.itertuples()]
df["km_to_nearest_station"] = [round(float(gc(cKDTree(S).query(ecef(r.lat, r.lon), k=1)[0][0])), 2)
                               for r in df.itertuples()]

lines_out = []
def say(s): print(s); lines_out.append(s)
say("")
say(f"Infill sites on existing lines (>= {MIN_SPACING:.3f} km apart, >= 250 new residents each)")
say(f"{len(df)} sites would put {df.new_pop.sum():,} currently-unserved people within the walk cap")
say("")
say(f'{"#":>3} {"line":22s} {"place":22s} {"new":>7s} {"cum":>9s}  nearest existing stations of the same mode')
for r in df.head(40).itertuples():
    say(f'{r.rank:>3} {r.line:22s} {r.place:22s} {r.new_pop:>7,} {r.cumulative:>9,}  {r.nearest_stations}')
say("")
say("By line:")
t = df.groupby("line").agg(sites=("rank","size"), people=("new_pop","sum")).sort_values("people",ascending=False)
for l, r in t.iterrows(): say(f'  {l:24s} {r["sites"]:>3} sites  {r["people"]:>8,} people')

open(os.path.join(OUT, "infill_report.txt"), "w").write("\n".join(lines_out) + "\n")
df.to_csv(os.path.join(OUT, "infill_candidates.csv"), index=False)
gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.lon, df.lat), crs="EPSG:4269") \
   .to_file(os.path.join(OUT, "infill_candidates.geojson"), driver="GeoJSON")

blk["near_line"] = near_line; blk["addressable"] = addressable
blk[blk.unserved][["GEOID20","county","POP20","lat","lon","km_to_line","near_line","addressable"]] \
   .to_csv(os.path.join(OUT, "unserved_blocks_corridor.csv"), index=False)
print("\nwrote infill_candidates.{csv,geojson}, infill_report.txt, unserved_blocks_corridor.csv")
