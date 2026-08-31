#!/usr/bin/env python3
"""Score the locations that government studies actually chose, using the same
metric as the siting pass, so the comparison is like-for-like.

Two real decisions to check against:
  - Evanston's 2011-12 Yellow Line feasibility study picked ASBURY over DODGE on
    projected ridership. This model picks Dodge. Score both (and Ridge, the third
    location the 2007 RTA corridor study looked at) to see whether the two
    metrics genuinely disagree or just measure different things.
  - Metra is building AUBURN PARK at 79th/Lowe on the Rock Island, about a mile
    and a half from this model's top-ranked site at 75th/Ashland on the
    SouthWest Service. Score both.
"""
import json, os, numpy as np, geopandas as gpd, pandas as pd
from scipy.spatial import cKDTree

REPO="/Users/stevevance/Sites/BuildTheTunnel"; RES=REPO+"/analysis/results"
SPD="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
CAP=20/60*4.43/1.3; R=6371.0
def ecef(la,lo):
    la,lo=np.radians(np.asarray(la,float)),np.radians(np.asarray(lo,float))
    return np.column_stack([R*np.cos(la)*np.cos(lo),R*np.cos(la)*np.sin(lo),R*np.sin(la)])
def gc(ch): return 2*R*np.arcsin(np.clip(ch/(2*R),0,1))

blk=gpd.read_file(SPD+"/tl_2020_17_tabblock20.shp",
                  columns=["GEOID20","COUNTYFP20","POP20","INTPTLAT20","INTPTLON20"],
                  ignore_geometry=True)
blk=blk[blk.COUNTYFP20.isin({"031","043","089","097","111","197"}) & (blk.POP20>0)]
B=ecef(blk.INTPTLAT20.astype(float),blk.INTPTLON20.astype(float)); pop=blk.POP20.values

sts=json.load(open(REPO+"/planner/data/stations.json"))
mdir=REPO+"/planner/data/matrix/scenario/0800"
live={f[:-5] for f in os.listdir(mdir) if f.endswith(".json")
      and any(k!=f[:-5] for k in json.load(open(os.path.join(mdir,f))))}
S=ecef([s["lat"] for s in sts],[s["lon"] for s in sts])
alive=np.array([s["id"] in live for s in sts])
# Auburn Park is ALREADY in stations.json -- as a scenario station, since it
# opens in 2026 -- so the default baseline treats it as built and scoring it
# against that baseline would trivially return zero. Every location is therefore
# scored against a baseline with that same location's station removed.
def baseline(drop_id=None):
    keep=[i for i,s_ in enumerate(sts) if s_["id"]!=drop_id]
    d,i=cKDTree(S[keep]).query(B,k=3)
    return ~((gc(d)<=CAP)&alive[keep][i]).any(axis=1)
unserved=baseline()

def score(name,lat,lon,drop_id=None,note=""):
    u = baseline(drop_id) if drop_id else unserved
    inside=gc(np.linalg.norm(B-ecef(lat,lon),axis=1))<=CAP
    new=int(pop[inside&u].sum()); tot=int(pop[inside].sum())
    print(f"  {name:36s} {new:>7,} newly served   ({tot:>7,} live in the catchment; "
          f"{100*new/tot if tot else 0:4.0f}% of it not otherwise served) {note}")
    return new

# Yellow Line: the three locations the 2007 RTA corridor study examined. Points
# are where each street crosses the Skokie Swift, from the OSM crossing pass.
print("\nYellow Line, south Evanston -- the 2007/2012 study locations:")
score("Dodge Avenue  (this model's pick)", 42.02252,-87.69954)
score("Asbury Avenue (Evanston's 2012 pick)",42.02208,-87.69014)
score("Ridge Avenue  (third location, 2007)",42.02190,-87.68493)

# Rock Island vs SouthWest Service in Auburn Gresham
print("\nAuburn Gresham -- what Metra is building vs. this model's top site:")
score("Auburn Park, 79th & Lowe (Metra, 2026)",41.7508,-87.6394,drop_id="79th-auburn-park-1b76")
score("75th & Ashland (this model, #1)",      41.75768,-87.66366)

# and how much they overlap
d1=gc(np.linalg.norm(B-ecef(41.7508,-87.6394),axis=1))<=CAP
d2=gc(np.linalg.norm(B-ecef(41.75768,-87.66366),axis=1))<=CAP
ub=baseline("79th-auburn-park-1b76")
print(f"  the two catchments are {gc(np.linalg.norm(ecef(41.7508,-87.6394)-ecef(41.75768,-87.66366)))*0.621371:.2f} mi apart "
      f"and share {int(pop[d1&d2&ub].sum()):,} otherwise-unserved residents")
