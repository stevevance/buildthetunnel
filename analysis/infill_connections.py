#!/usr/bin/env python3
"""What a rider could transfer to at each infill site.

A platform is only worth as much as what it connects to, so this pulls the CTA
and Pace bus networks out of their GTFS feeds and works out, for each of the top
five sites, which routes pass close enough to be a genuine transfer. Rail
connections (CTA 'L', other Metra lines, and the proposed CrossTowner X-routes)
come from the planner's own lines.json rather than GTFS, so the map and the
planner agree about where the tracks are.

Writes one small JSON per site with the bus geometry inside the map window and
the list of connecting routes, so the map script doesn't have to touch the
50 MB shape tables.
"""
import json, os, sys
import numpy as np, pandas as pd

REPO="/Users/stevevance/Sites/BuildTheTunnel"; RES=REPO+"/analysis/results"
SPD="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
G=SPD+"/gtfs"; OUT=SPD+"/conn"; os.makedirs(OUT, exist_ok=True)
HALF=1.30                    # km, matches the zoom map window
TRANSFER_KM=0.30             # a route this close to the platform is a real transfer
R=6371.0

def ecef(la,lo):
    la,lo=np.radians(np.asarray(la,float)),np.radians(np.asarray(lo,float))
    return np.column_stack([R*np.cos(la)*np.cos(lo),R*np.cos(la)*np.sin(lo),R*np.sin(la)])
def gc(ch): return 2*R*np.arcsin(np.clip(ch/(2*R),0,1))

SRC = sys.argv[1] if len(sys.argv)>1 else "infill_candidates.csv"
TAG = sys.argv[2] if len(sys.argv)>2 else "site"
N   = int(sys.argv[3]) if len(sys.argv)>3 else 5
cand=pd.read_csv(os.path.join(RES,SRC)).head(N)
# one bounding box covering all five windows, so each feed is scanned once
pad_lat=HALF/110.574*1.15
sites=[(r.rank,r.lat,r.lon) for r in cand.itertuples()]

def load(agency):
    rt=pd.read_csv(f"{G}/{agency}/routes.txt", dtype=str)
    rt=rt[rt.route_type=="3"]                      # bus only; rail comes from lines.json
    tr=pd.read_csv(f"{G}/{agency}/trips.txt", dtype=str, usecols=["route_id","shape_id"])
    tr=tr.dropna().drop_duplicates()
    tr=tr.merge(rt[["route_id","route_short_name","route_long_name"]], on="route_id")
    sh=pd.read_csv(f"{G}/{agency}/shapes.txt",
                   usecols=["shape_id","shape_pt_lat","shape_pt_lon","shape_pt_sequence"],
                   dtype={"shape_id":str})
    return tr, sh

BUS={}
for agency,label in (("cta","CTA"),("pace","Pace")):
    tr,sh=load(agency)
    print(f"{label}: {tr.route_id.nunique()} bus routes, {len(sh):,} shape points")
    BUS[label]=(tr,sh)

for rank,lat,lon in sites:
    dlat=HALF/110.574*1.05; dlon=HALF/(111.320*np.cos(np.radians(lat)))*1.05
    site=ecef(lat,lon)
    out={"rank":int(rank),"routes":[],"lines":[]}
    for label,(tr,sh) in BUS.items():
        w=sh[(sh.shape_pt_lat.between(lat-dlat,lat+dlat)) &
             (sh.shape_pt_lon.between(lon-dlon,lon+dlon))]
        if w.empty: continue
        w=w.merge(tr, on="shape_id")
        # one representative shape per route: the one with the most points in frame
        best=w.groupby(["route_id","shape_id"]).size().reset_index(name="k")
        best=best.sort_values("k",ascending=False).drop_duplicates("route_id")
        for r_ in best.itertuples():
            pts=sh[sh.shape_id==r_.shape_id].sort_values("shape_pt_sequence")
            d=gc(np.linalg.norm(ecef(pts.shape_pt_lat,pts.shape_pt_lon)-site,axis=1))
            keep=pts[d<=HALF*1.6]
            if keep.empty: continue
            nm=tr[tr.route_id==r_.route_id].iloc[0]
            short=(nm.route_short_name if isinstance(nm.route_short_name,str) and nm.route_short_name.strip()
                   else str(nm.route_id))
            out["routes"].append({
                "agency":label,"route":short,"name":str(nm.route_long_name),
                "transfer":bool(d.min()<=TRANSFER_KM),
                "min_km":round(float(d.min()),3),
                "geom":[[round(float(a),5),round(float(b),5)]
                        for a,b in zip(keep.shape_pt_lon,keep.shape_pt_lat)]})
    t=[r_ for r_ in out["routes"] if r_["transfer"]]
    json.dump(out, open(f"{OUT}/{TAG}{rank}.json","w"))
    print(f"  site {rank}: {len(out['routes'])} bus routes in frame, {len(t)} within "
          f"{TRANSFER_KM*1000:.0f} m -> " +
          ", ".join(f"{x['agency']} {x['route']}" for x in sorted(t,key=lambda z:z['min_km'])))
