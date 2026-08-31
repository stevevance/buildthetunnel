#!/usr/bin/env python3
"""Option C: how many people actually commute between the two catchments.

This is the only one of the three job metrics that is about the specific pair a
rider planned, so it is the only one that can honestly finish the sentence "this
trip matters to ___ people." It aggregates LODES 2023 origin-destination records
(primary jobs, JT01) from home block and work block up to the nearest station
within the walk cap, giving a sparse station-to-station commuter matrix.

Also sizes the result, because the planner is a static site and every kilobyte
is downloaded by somebody on a phone.
"""
import json, os
import numpy as np, pandas as pd, geopandas as gpd
from scipy.spatial import cKDTree

REPO="/Users/stevevance/Sites/BuildTheTunnel"; RES=REPO+"/analysis/results"
SPD="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
OUT=SPD+"/planner_jobs"; os.makedirs(OUT+"/flows", exist_ok=True)
CAP=20/60*4.43/1.3; R=6371.0
COUNTIES={"031","043","089","097","111","197"}

def ecef(la,lo):
    la,lo=np.radians(np.asarray(la,float)),np.radians(np.asarray(lo,float))
    return np.column_stack([R*np.cos(la)*np.cos(lo),R*np.cos(la)*np.sin(lo),R*np.sin(la)])
def gc(ch): return 2*R*np.arcsin(np.clip(ch/(2*R),0,1))

blk=gpd.read_file(SPD+"/tl_2020_17_tabblock20.shp",
                  columns=["GEOID20","COUNTYFP20","INTPTLAT20","INTPTLON20"],
                  ignore_geometry=True)
blk=blk[blk.COUNTYFP20.isin(COUNTIES)]
sts=json.load(open(REPO+"/planner/data/stations.json"))
tree=cKDTree(ecef([s["lat"] for s in sts],[s["lon"] for s in sts]))
d,i=tree.query(ecef(blk.INTPTLAT20.astype(float),blk.INTPTLON20.astype(float)),k=1)
inside=gc(d)<=CAP
B2S=dict(zip(blk.GEOID20.values[inside],[sts[j]["id"] for j in i[inside]]))
print(f"{len(B2S):,} of {len(blk):,} blocks sit inside a station catchment")

flows={}
kept=tot=0
for fn in ("il_od.csv.gz","il_od_aux.csv.gz"):
    for ch in pd.read_csv(f"{SPD}/{fn}", usecols=["h_geocode","w_geocode","S000"],
                          dtype={"h_geocode":str,"w_geocode":str}, chunksize=2_000_000):
        tot+=int(ch.S000.sum())
        h=ch.h_geocode.map(B2S); w=ch.w_geocode.map(B2S)
        ok=h.notna()&w.notna()&(h!=w)
        kept+=int(ch.S000[ok].sum())
        for a,b,n in zip(h[ok],w[ok],ch.S000[ok]):
            flows[(a,b)]=flows.get((a,b),0)+int(n)
    print(f"  {fn}: running total {tot:,} jobs, {kept:,} with both ends in a catchment")

print(f"\nstation-pair flows: {len(flows):,} non-zero pairs of {len(sts)**2:,} possible "
      f"({100*len(flows)/len(sts)**2:.1f}% dense)")
print(f"commuters covered: {kept:,} of {tot:,} Illinois primary jobs ({100*kept/tot:.1f}%)")

# per-origin shards, matching how the planner already fetches the time matrix
per={}
for (a,b),n in flows.items():
    per.setdefault(a,{})[b]=n
sizes=[]
for a,row in per.items():
    row={k:v for k,v in row.items() if v>=5}      # LODES noise floor; drop dust
    if not row: continue
    p=f"{OUT}/flows/{a}.json"
    json.dump(row, open(p,"w"), separators=(",",":"))
    sizes.append(os.path.getsize(p))
sizes=np.array(sizes)
print(f"\nsharded: {len(sizes)} origin files, median {np.median(sizes)/1024:.1f} KB, "
      f"p90 {np.percentile(sizes,90)/1024:.1f} KB, max {sizes.max()/1024:.1f} KB, "
      f"total {sizes.sum()/1024/1024:.2f} MB")
single=json.dumps({f"{a}|{b}":n for (a,b),n in flows.items() if n>=5},separators=(",",":"))
print(f"as one file instead: {len(single)/1024/1024:.2f} MB "
      f"({len([1 for v in flows.values() if v>=5]):,} pairs at 5+ commuters)")

byid={s["id"]:s for s in sts}
def name(x): return byid[x]["name"]
top=sorted(flows.items(), key=lambda kv:-kv[1])[:15]
print("\nHeaviest station-to-station commute flows in the six counties:")
for (a,b),n in top:
    print(f"  {n:>6,}  {name(a):32s} -> {name(b)}")

pd.DataFrame([{"origin":name(a),"destination":name(b),"workers":n,
               "origin_id":a,"destination_id":b} for (a,b),n in flows.items() if n>=5]) \
  .sort_values("workers",ascending=False).to_csv(RES+"/station_commute_flows.csv", index=False)

# what the planner's own example trips would say
print("\nWhat the planner's built-in example trips would report:")
cfg=open(REPO+"/planner/config.js").read()
import re
EX=[("Clybourn","67th Street"),("Davis Street (Evanston)","55th-56th-57th Street"),
    ("Jefferson Park","McCormick Place"),("Berwyn (BNSF)","O'Hare Transfer")]
ids={s["name"]:s["id"] for s in sts}
for o,dst in EX:
    if o not in ids or dst not in ids: print(f"  {o} -> {dst}: station name not found"); continue
    a,b=ids[o],ids[dst]
    print(f"  {o} -> {dst}: {flows.get((a,b),0):,} commute this way, "
          f"{flows.get((b,a),0):,} the other way")
