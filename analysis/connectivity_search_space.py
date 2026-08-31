#!/usr/bin/env python3
"""How many locations did the connectivity pass actually test, and how sharp is
the Fulton Market pick?

Candidates are sampled every 100 m along every existing alignment, so
neighbouring candidates share almost all of their catchment -- the walk cap is
1.14 km and the spacing is 0.1 km. That makes the score surface smooth, and it
means the greedy argmax can land anywhere on a plateau. Reporting "Kinzie and
Ada" without saying how wide that plateau is would claim precision the data
cannot support. This script reports the funnel (sampled -> eligible -> anchored),
the counts per line, and the score profile along the UP-W through Fulton Market.
"""
import json, os
import numpy as np, pandas as pd, geopandas as gpd
from scipy.spatial import cKDTree

REPO="/Users/stevevance/Sites/BuildTheTunnel"; RES=REPO+"/analysis/results"
SPD="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
G=SPD+"/gtfs"
CAP=20/60*4.43/1.3; R=6371.0
MIN_SPACING=1.609; BUS_XFER=0.402; RAIL_XFER=0.805; SAMPLE_M=100
COUNTIES={"031","043","089","097","111","197"}
PROPOSED={"X1","X2","X3","X4","X5","X6","RLE"}
CTA_KEYS={"Red","Blue","G","Brn","Org","P","Pink","Y"}
PICK=(41.88906,-87.66162)

def ecef(la,lo):
    la,lo=np.radians(np.asarray(la,float)),np.radians(np.asarray(lo,float))
    return np.column_stack([R*np.cos(la)*np.cos(lo),R*np.cos(la)*np.sin(lo),R*np.sin(la)])
def chord(km): return 2*R*np.sin(km/(2*R))
def gc(ch):    return 2*R*np.arcsin(np.clip(ch/(2*R),0,1))

blk=gpd.read_file(SPD+"/tl_2020_17_tabblock20.shp",
                  columns=["GEOID20","COUNTYFP20","POP20","INTPTLAT20","INTPTLON20"],
                  ignore_geometry=True)
blk=blk[blk.COUNTYFP20.isin(COUNTIES)]
wac=pd.read_csv(SPD+"/il_wac.csv.gz", usecols=["w_geocode","C000"], dtype={"w_geocode":str})
blk=blk.merge(wac.rename(columns={"w_geocode":"GEOID20","C000":"JOBS"}),on="GEOID20",how="left")
blk["JOBS"]=blk.JOBS.fillna(0).astype(int)
blk=blk[(blk.POP20>0)|(blk.JOBS>0)]
B=ecef(blk.INTPTLAT20.astype(float),blk.INTPTLON20.astype(float))
pop=blk.POP20.values.astype(np.int64); jobs=blk.JOBS.values.astype(np.int64)

sts=json.load(open(REPO+"/planner/data/stations.json"))
on=[s for s in sts if s.get("exists_today")]
NET={"metra":[s for s in on if s.get("on_metra")],"cta":[s for s in on if s.get("on_cta_rail")]}
T={k:cKDTree(ecef([s["lat"] for s in v],[s["lon"] for s in v])) for k,v in NET.items()}
reach={k:(gc(T[k].query(B,k=1)[0])<=CAP) for k in T}
OTHER={"metra":"cta","cta":"metra"}

def busnet():
    P,L=[],[]
    for agency,label in (("cta","CTA"),("pace","Pace")):
        rt=pd.read_csv(f"{G}/{agency}/routes.txt",dtype=str); rt=rt[rt.route_type=="3"]
        tr=pd.read_csv(f"{G}/{agency}/trips.txt",dtype=str,usecols=["route_id","shape_id"]).dropna()
        tr=tr.drop_duplicates(); tr=tr[tr.route_id.isin(set(rt.route_id))]
        sh=pd.read_csv(f"{G}/{agency}/shapes.txt",dtype={"shape_id":str},
                       usecols=["shape_id","shape_pt_lat","shape_pt_lon"]).merge(tr,on="shape_id")
        P.append(ecef(sh.shape_pt_lat,sh.shape_pt_lon))
        L.append(np.array([label+" "+str(k) for k in sh.route_id.values]))
    return np.vstack(P), np.concatenate(L)
BP,BL=busnet(); btree=cKDTree(BP)

lines=json.load(open(REPO+"/planner/data/lines.json"))
def densify(part,step):
    out,carry=[],0.0
    for a,b in zip(part[:-1],part[1:]):
        pa,pb=ecef(a[1],a[0])[0],ecef(b[1],b[0])[0]
        seg=gc(np.linalg.norm(pb-pa))
        if seg<=0: continue
        t=carry
        while t<seg:
            f=t/seg; out.append((a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f)); t+=step
        carry=t-seg
    out.append(tuple(part[-1])); return out

rows=[]
for key,parts in lines.items():
    if key in PROPOSED: continue
    net="cta" if key in CTA_KEYS else "metra"
    for part in parts:
        for lon,lat in densify(part,SAMPLE_M/1000):
            rows.append((key,net,lon,lat))
cand=pd.DataFrame(rows,columns=["line","net","lon","lat"])
C=ecef(cand.lat,cand.lon)
cand["own_km"]=[float(gc(np.atleast_1d(T[cand.net.iloc[i]].query(C[i:i+1],k=1)[0]).ravel()[0])) for i in range(len(C))]
elig=cand.own_km>=MIN_SPACING
ball=btree.query_ball_point(C,r=chord(BUS_XFER))
cand["bus"]=[len(set(BL[np.array(ix,int)])) if ix else 0 for ix in ball]
xf=[]
for i in range(len(C)):
    o=OTHER[cand.net.iloc[i]]
    d,_=T[o].query(C[i:i+1],k=1); xf.append(float(gc(np.atleast_1d(d).ravel()[0])))
cand["xrail_km"]=xf
anchor=(cand.bus>=3)|(cand.xrail_km<=RAIL_XFER)

M=cand.net=="metra"
print("SEARCH SPACE — points sampled every 100 m along the existing alignments")
print(f"  all lines:            {len(cand):,} sampled   {int(elig.sum()):,} at least 1 mi from a "
      f"same-network station   {int((elig&anchor).sum()):,} with a connectivity anchor")
print(f"  Metra lines only:     {int(M.sum()):,} sampled   {int((M&elig).sum()):,} eligible   "
      f"{int((M&elig&anchor).sum()):,} anchored")
print(f"  CTA lines only:       {int((~M).sum()):,} sampled   {int((~M&elig).sum()):,} eligible   "
      f"{int((~M&elig&anchor).sum()):,} anchored")
print()
print("Metra, by line:")
t=cand[M].assign(elig=elig[M],anch=(elig&anchor)[M]).groupby("line").agg(
    sampled=("lon","size"),eligible=("elig","sum"),anchored=("anch","sum"))
print(t.sort_values("sampled",ascending=False).to_string())

# --- how sharp is the Fulton Market pick? ------------------------------------
print("\nSCORE PROFILE — every UP-W candidate, scored the same way")
upw=cand[(cand.line=="UP-W")].reset_index(drop=True)
U=ecef(upw.lat,upw.lon)
catch=cKDTree(B).query_ball_point(U,r=chord(CAP))
def score(i):
    ix=np.array(catch[i],int)
    if not len(ix): return 0
    miss=ix[~reach["metra"][ix]]
    return int(pop[miss].sum()+jobs[miss].sum())
upw["score"]=[score(i) for i in range(len(U))]
upw["eligible"]=upw.own_km>=MIN_SPACING
upw["anchored"]=(upw.bus>=3)|(upw.xrail_km<=RAIL_XFER)
ok=upw[upw.eligible&upw.anchored]
peak=ok.score.max()
pk=ok.loc[ok.score.idxmax()]
d_pick=gc(np.linalg.norm(ecef(upw.lat,upw.lon)-ecef(*PICK),axis=1))
upw["km_from_pick"]=d_pick
print(f"  UP-W candidates: {len(upw):,} sampled, {int(upw.eligible.sum()):,} eligible, "
      f"{len(ok):,} anchored and scoreable")
print(f"  peak score {peak:,} at {pk.lat:.5f},{pk.lon:.5f} "
      f"({gc(np.linalg.norm(ecef(pk.lat,pk.lon)-ecef(*PICK)))*1000:.0f} m from the reported pick)")
for pct in (99,95,90,80):
    band=ok[ok.score>=peak*pct/100]
    if len(band)<2: continue
    E=ecef(band.lat,band.lon)
    span=gc(np.linalg.norm(E[:,None,:]-E[None,:,:],axis=2)).max()
    print(f"    within {100-pct:>2}% of the peak: {len(band):>3} candidates spanning {span*0.621371:.2f} mi of track")
print("\n  score every 400 m along the UP-W near the pick (– = not eligible/anchored):")
near=upw[upw.km_from_pick<3.2].copy()
near=near.iloc[np.argsort(near.lon.values)]
for i,row in enumerate(near.itertuples()):
    if i%4: continue
    flag="" if (row.eligible and row.anchored) else "  –"
    print(f"    {row.lat:.5f},{row.lon:.5f}  {row.score:>7,}  bus {row.bus:>2}  "
          f"nearest Metra {row.own_km:4.2f} km  nearest CTA rail {row.xrail_km:4.2f} km{flag}")
