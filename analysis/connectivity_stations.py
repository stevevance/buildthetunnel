#!/usr/bin/env python3
"""Connectivity infill: stations that join networks rather than fill an access gap.

infill_station_candidates.py answers "where do the most people with no rail at
all live?" That is one kind of infill. Scott Presslak's framing is the other:
a connectivity station serves a market that is *already* well served -- by the
'L', by buses -- but that this particular network misses entirely. Fulton Market
is the canonical case. Nobody there lacks transit; what is missing is a Metra
platform, so no suburban rider can reach one of the region's biggest job centers
without changing downtown.

So the metric flips. Instead of scoring unserved residents, score the market a
line misses, and require the place to already be a transit node:

  missed market   residents + jobs inside the walk cap that are NOT within the
                  cap of an existing station ON THE SAME NETWORK (Metra
                  candidates measured against Metra stations, CTA against CTA)
  cross-served    the part of that missed market that IS within the cap of the
                  other network's rail -- literally "served by another network"
  bus             distinct CTA/Pace routes within a quarter mile, and their
                  weekday trips per day, as a measure of what converges there
  rail transfer   other-network stations within half a mile of the platform

A candidate qualifies only if it has a connectivity anchor: three or more bus
routes within a quarter mile, or an other-network station within half a mile.
Ranking is by missed market, greedy, one mile apart, same as the access pass.

Jobs are LODES 2023 workplace counts (LODES8, il_wac_S000_JT00_2023).
"""
import json, os
import numpy as np, pandas as pd, geopandas as gpd
from scipy.spatial import cKDTree

REPO="/Users/stevevance/Sites/BuildTheTunnel"; RES=REPO+"/analysis/results"
SPD="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
G=SPD+"/gtfs"
CAP=20/60*4.43/1.3; R=6371.0
MIN_SPACING=1.609          # km between picks and from same-network stations
BUS_XFER=0.402             # quarter mile
RAIL_XFER=0.805            # half mile
SAMPLE_M=100
COUNTIES={"031":"Cook","043":"DuPage","089":"Kane","097":"Lake","111":"McHenry","197":"Will"}
PROPOSED={"X1","X2","X3","X4","X5","X6","RLE"}
CTA_KEYS={"Red","Blue","G","Brn","Org","P","Pink","Y"}
LINE_NAMES={"Red":"Red Line","Blue":"Blue Line","G":"Green Line","Brn":"Brown Line",
            "Org":"Orange Line","P":"Purple Line","Pink":"Pink Line","Y":"Yellow Line",
            "BNSF":"BNSF","ME":"Metra Electric","HC":"Heritage Corridor","MD-N":"MD-N",
            "MD-W":"MD-W","NCS":"North Central Service","RI":"Rock Island",
            "SWS":"SouthWest Service","UP-N":"UP-N","UP-NW":"UP-NW","UP-W":"UP-W"}

def ecef(la,lo):
    la,lo=np.radians(np.asarray(la,float)),np.radians(np.asarray(lo,float))
    return np.column_stack([R*np.cos(la)*np.cos(lo),R*np.cos(la)*np.sin(lo),R*np.sin(la)])
def chord(km): return 2*R*np.sin(km/(2*R))
def gc(ch):    return 2*R*np.arcsin(np.clip(ch/(2*R),0,1))

# --- blocks, with residents and jobs -----------------------------------------
blk=gpd.read_file(SPD+"/tl_2020_17_tabblock20.shp",
                  columns=["GEOID20","COUNTYFP20","POP20","INTPTLAT20","INTPTLON20"],
                  ignore_geometry=True)
blk=blk[blk.COUNTYFP20.isin(COUNTIES)].copy()
wac=pd.read_csv(SPD+"/il_wac.csv.gz", usecols=["w_geocode","C000"], dtype={"w_geocode":str})
blk=blk.merge(wac.rename(columns={"w_geocode":"GEOID20","C000":"JOBS"}), on="GEOID20", how="left")
blk["JOBS"]=blk.JOBS.fillna(0).astype(int)
blk=blk[(blk.POP20>0)|(blk.JOBS>0)].copy()
B=ecef(blk.INTPTLAT20.astype(float), blk.INTPTLON20.astype(float))
pop=blk.POP20.values.astype(np.int64); jobs=blk.JOBS.values.astype(np.int64)
print(f"blocks with people or jobs: {len(blk):,}   {pop.sum():,} residents, {jobs.sum():,} jobs")

# --- station sets, by network -------------------------------------------------
sts=json.load(open(REPO+"/planner/data/stations.json"))
on=[s for s in sts if s.get("exists_today")]
E_metra=ecef([s["lat"] for s in on if s.get("on_metra")],[s["lon"] for s in on if s.get("on_metra")])
E_cta  =ecef([s["lat"] for s in on if s.get("on_cta_rail")],[s["lon"] for s in on if s.get("on_cta_rail")])
N_metra=[s for s in on if s.get("on_metra")]; N_cta=[s for s in on if s.get("on_cta_rail")]
T={"metra":cKDTree(E_metra),"cta":cKDTree(E_cta)}
NAMES={"metra":N_metra,"cta":N_cta}
# which blocks each network already reaches on foot
reach={k:(gc(T[k].query(B,k=1)[0])<=CAP) for k in T}
print(f"blocks within the cap of Metra: {reach['metra'].sum():,}   of the CTA: {reach['cta'].sum():,}")

# --- bus network, with weekday service intensity ------------------------------
def bus(agency,label):
    cal=pd.read_csv(f"{G}/{agency}/calendar.txt", dtype=str)
    wk=set(cal[cal.monday=="1"].service_id)
    rt=pd.read_csv(f"{G}/{agency}/routes.txt", dtype=str)
    rt=rt[rt.route_type=="3"]
    tr=pd.read_csv(f"{G}/{agency}/trips.txt", dtype=str, usecols=["route_id","service_id","shape_id"])
    perday=tr[tr.service_id.isin(wk)].groupby("route_id").size()
    tr=tr.dropna(subset=["shape_id"])[["route_id","shape_id"]].drop_duplicates()
    tr=tr[tr.route_id.isin(set(rt.route_id))]
    sh=pd.read_csv(f"{G}/{agency}/shapes.txt", dtype={"shape_id":str},
                   usecols=["shape_id","shape_pt_lat","shape_pt_lon"])
    sh=sh.merge(tr, on="shape_id")
    rt=rt.set_index("route_id")
    key=sh.route_id.values
    lab=np.array([f"{label} " + (rt.route_short_name.get(k) if isinstance(rt.route_short_name.get(k),str)
                  and str(rt.route_short_name.get(k)).strip() else str(k)) for k in key])
    return sh, lab, {f"{label} " + (rt.route_short_name.get(k) if isinstance(rt.route_short_name.get(k),str)
                     and str(rt.route_short_name.get(k)).strip() else str(k)): int(perday.get(k,0))
                     for k in rt.index}
BP=[]; BL=[]; TRIPS={}
for a,l in (("cta","CTA"),("pace","Pace")):
    sh,lab,per=bus(a,l)
    BP.append(ecef(sh.shape_pt_lat,sh.shape_pt_lon)); BL.append(lab); TRIPS.update(per)
BP=np.vstack(BP); BL=np.concatenate(BL); btree=cKDTree(BP)
print(f"bus shape points: {len(BP):,} across {len(set(BL)):,} routes")

# --- candidate points along the existing lines --------------------------------
lines=json.load(open(REPO+"/planner/data/lines.json"))
def densify(part, step_km):
    out, carry = [], 0.0
    for a,b in zip(part[:-1], part[1:]):
        pa,pb=ecef(a[1],a[0])[0], ecef(b[1],b[0])[0]
        seg=gc(np.linalg.norm(pb-pa))
        if seg<=0: continue
        t=carry
        while t<seg:
            f=t/seg; out.append((a[0]+(b[0]-a[0])*f, a[1]+(b[1]-a[1])*f)); t+=step_km
        carry=t-seg
    out.append(tuple(part[-1])); return out

clon,clat,cline,cnet=[],[],[],[]
for key,parts in lines.items():
    if key in PROPOSED: continue
    net="cta" if key in CTA_KEYS else "metra"
    for part in parts:
        pts=densify(part, SAMPLE_M/1000)
        clon+=[p[0] for p in pts]; clat+=[p[1] for p in pts]
        cline+=[key]*len(pts); cnet+=[net]*len(pts)
clon=np.array(clon); clat=np.array(clat); cline=np.array(cline); cnet=np.array(cnet)
C=ecef(clat,clon)

# not on top of a station of its OWN network -- the whole point is that the other
# network may well have one right there
own=np.array([gc(T[cnet[i]].query(C[i:i+1],k=1)[0][0]) for i in range(len(C))])
keep=own>=MIN_SPACING
C,clon,clat,cline,cnet=C[keep],clon[keep],clat[keep],cline[keep],cnet[keep]
print(f"candidates at least {MIN_SPACING:.3f} km from a station on their own network: {len(C):,}")

# --- score --------------------------------------------------------------------
btree_idx=btree.query_ball_point(C, r=chord(BUS_XFER))
routes=[sorted(set(BL[np.array(ix,int)])) if ix else [] for ix in btree_idx]
other={"metra":"cta","cta":"metra"}
xfer=[]
for i in range(len(C)):
    o=other[cnet[i]]
    d,j=T[o].query(C[i:i+1],k=min(3,len(NAMES[o])))
    d=gc(d[0]); j=np.atleast_1d(j[0])
    xfer.append([NAMES[o][k]["name"] for k,dd in zip(j,np.atleast_1d(d)) if dd<=RAIL_XFER])

anchor=np.array([len(routes[i])>=3 or len(xfer[i])>0 for i in range(len(C))])
print(f"of those, with a connectivity anchor (3+ bus routes or a cross-network station): {anchor.sum():,}")

catch=cKDTree(B).query_ball_point(C, r=chord(CAP))
def score_at(i, avail):
    ix=np.array(catch[i],int)
    if not len(ix): return 0,0,0,0,0
    miss=ix[~reach[cnet[i]][ix] & avail[ix]]
    cross=miss[reach[other[cnet[i]]][miss]]
    return (int(pop[miss].sum()), int(jobs[miss].sum()),
            int(pop[cross].sum()), int(jobs[cross].sum()), len(miss))

avail=np.ones(len(B),bool)
score=np.array([sum(score_at(i,avail)[:2]) if anchor[i] else -1 for i in range(len(C))])
ctree=cKDTree(C)
picks,taken=[],~anchor.copy()
while True:
    score[taken]=-1
    i=int(score.argmax())
    if score[i]<1000: break                       # market too small to bother
    p,j,cp,cj,nb=score_at(i,avail)
    picks.append({"line":LINE_NAMES.get(cline[i],cline[i]),"network":cnet[i].upper(),
                  "lat":round(float(clat[i]),5),"lon":round(float(clon[i]),5),
                  "miss_pop":p,"miss_jobs":j,"miss_market":p+j,
                  "cross_pop":cp,"cross_jobs":cj,
                  "cross_share":round(100*(cp+cj)/(p+j),1) if p+j else 0,
                  "bus_routes":len(routes[i]),
                  "bus_trips_per_day":int(sum(TRIPS.get(x,0) for x in routes[i])),
                  "buses":", ".join(routes[i][:10]),
                  "rail_transfer":", ".join(xfer[i]) or "—"})
    ix=np.array(catch[i],int)
    avail[ix[~reach[cnet[i]][ix]]]=False
    near=ctree.query_ball_point(C[i:i+1], r=chord(MIN_SPACING))[0]
    taken[np.array(near,int)]=True
    for k in range(len(C)):
        if taken[k]: continue
        a,b2=score_at(k,avail)[:2]; score[k]=a+b2

df=pd.DataFrame(picks); df.insert(0,"rank",range(1,len(df)+1))
plc=gpd.read_file(SPD+"/tl_2020_17_place.shp", columns=["NAME","geometry"])
g=gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.lon,df.lat), crs="EPSG:4269")
g=gpd.sjoin(g, plc.to_crs("EPSG:4269"), how="left", predicate="within")
g=g[~g.index.duplicated(keep="first")]
df["place"]=g.NAME.fillna("unincorporated").values

out=[]
def say(s): print(s); out.append(s)
say("")
say(f"Connectivity infill: {len(df)} sites, {df.miss_market.sum():,} residents+jobs "
    f"their own network cannot reach on foot")
say("")
say(f'{"#":>3} {"line":22s} {"place":18s} {"jobs":>8s} {"people":>8s} {"market":>9s} '
    f'{"cross":>6s} {"bus":>4s} {"trips":>6s}  transfers / routes')
for r in df.head(30).itertuples():
    say(f'{r.rank:>3} {r.line:22s} {r.place:18s} {r.miss_jobs:>8,} {r.miss_pop:>8,} '
        f'{r.miss_market:>9,} {r.cross_share:>5.0f}% {r.bus_routes:>4} {r.bus_trips_per_day:>6,}  '
        f'{r.rail_transfer if r.rail_transfer!="—" else r.buses[:52]}')
open(RES+"/connectivity_report.txt","w").write("\n".join(out)+"\n")
df.to_csv(RES+"/connectivity_candidates.csv", index=False)
gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.lon,df.lat), crs="EPSG:4269") \
   .to_file(RES+"/connectivity_candidates.geojson", driver="GeoJSON")
print("\nwrote connectivity_candidates.{csv,geojson}, connectivity_report.txt")
