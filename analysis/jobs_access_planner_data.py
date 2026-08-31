#!/usr/bin/env python3
"""Could the public planner say something true about jobs?

Three claims of increasing weight, costed here so the choice is informed:

  A  CATCHMENT   residents and jobs within a 20-minute walk of the boarding and
                 alighting stations. One number per station; a few kilobytes.
  B  ACCESS      jobs reachable from the boarding station inside a travel-time
                 budget, today versus the scenario. The difference is the
                 advocacy number -- "CrossTowner puts N more jobs within 45
                 minutes of this station." One row per station per network.
  C  FLOW        how many people actually commute between the two catchments
                 today, from LODES origin-destination data. This is the closest
                 thing to "your trip affects X workers," and the only one of the
                 three that is about the specific pair the rider planned.

Blocks are assigned to their single nearest station within the walk cap, so a
block is counted once and catchments do not double-count where they overlap.
Jobs are LODES 2023 workplace counts; flows are LODES 2023 primary jobs (JT01),
main plus auxiliary so out-of-state residents are included.
"""
import json, os, sys
import numpy as np, pandas as pd, geopandas as gpd
from scipy.spatial import cKDTree

REPO="/Users/stevevance/Sites/BuildTheTunnel"; RES=REPO+"/analysis/results"
SPD="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
OUT=SPD+"/planner_jobs"; os.makedirs(OUT, exist_ok=True)
CAP=20/60*4.43/1.3; R=6371.0; SLICE="0800"
BUDGETS=[30,45,60]
COUNTIES={"031","043","089","097","111","197"}

def ecef(la,lo):
    la,lo=np.radians(np.asarray(la,float)),np.radians(np.asarray(lo,float))
    return np.column_stack([R*np.cos(la)*np.cos(lo),R*np.cos(la)*np.sin(lo),R*np.sin(la)])
def gc(ch): return 2*R*np.arcsin(np.clip(ch/(2*R),0,1))

# --- blocks with residents and jobs, assigned to one station each -------------
blk=gpd.read_file(SPD+"/tl_2020_17_tabblock20.shp",
                  columns=["GEOID20","COUNTYFP20","POP20","INTPTLAT20","INTPTLON20"],
                  ignore_geometry=True)
blk=blk[blk.COUNTYFP20.isin(COUNTIES)]
wac=pd.read_csv(SPD+"/il_wac.csv.gz", usecols=["w_geocode","C000"], dtype={"w_geocode":str})
blk=blk.merge(wac.rename(columns={"w_geocode":"GEOID20","C000":"JOBS"}), on="GEOID20", how="left")
blk["JOBS"]=blk.JOBS.fillna(0).astype(int)
B=ecef(blk.INTPTLAT20.astype(float), blk.INTPTLON20.astype(float))
pop=blk.POP20.values.astype(np.int64); jobs=blk.JOBS.values.astype(np.int64)

sts=json.load(open(REPO+"/planner/data/stations.json"))
NETS={"today":[s for s in sts if s.get("exists_today")], "scenario":sts}
catch={}
for net,ss in NETS.items():
    tree=cKDTree(ecef([s["lat"] for s in ss],[s["lon"] for s in ss]))
    d,i=tree.query(B,k=1); d=gc(d)
    inside=d<=CAP
    df=pd.DataFrame({"sid":[ss[j]["id"] for j in i],"pop":pop,"jobs":jobs,"in":inside})
    g=df[df["in"]].groupby("sid").agg(pop=("pop","sum"), jobs=("jobs","sum"))
    catch[net]=g
    print(f"{net}: {inside.sum():,} of {len(blk):,} blocks assigned to a station; "
          f"{g['pop'].sum():,} residents and {g.jobs.sum():,} jobs inside catchments")

# --- A. per-station catchment file --------------------------------------------
A={}
for s in sts:
    row={}
    for net in NETS:
        if s["id"] in catch[net].index:
            r=catch[net].loc[s["id"]]
            row[net]={"p":int(r["pop"]),"j":int(r.jobs)}
    if row: A[s["id"]]=row
json.dump(A, open(OUT+"/station_catchment.json","w"), separators=(",",":"))
print(f"\nA. station_catchment.json  {os.path.getsize(OUT+'/station_catchment.json')/1024:.1f} KB "
      f"({len(A)} stations)")

# --- B. jobs reachable inside a travel-time budget ----------------------------
# Travel time is the matrix's station-to-station minutes: in-vehicle, waits,
# transfers and any walking r5r did between stations. It excludes the rider's own
# walk to the first platform and from the last, which is what the planner already
# shows separately as access and egress.
access={}
for net in NETS:
    d=os.path.join(REPO,"planner","data","matrix",net,SLICE)
    jobs_by_station=catch[net].jobs.to_dict()
    for f in os.listdir(d):
        if not f.endswith(".json"): continue
        sid=f[:-5]; row=json.load(open(os.path.join(d,f)))
        tot={b:0 for b in BUDGETS}
        for dest,cell in row.items():
            m=cell if isinstance(cell,(int,float)) else cell.get("m")
            if m is None: continue
            j=jobs_by_station.get(dest,0)
            for b in BUDGETS:
                if m<=b: tot[b]+=j
        access.setdefault(sid,{})[net]={str(b):int(tot[b]) for b in BUDGETS}
json.dump(access, open(OUT+"/station_jobs_access.json","w"), separators=(",",":"))
print(f"B. station_jobs_access.json {os.path.getsize(OUT+'/station_jobs_access.json')/1024:.1f} KB "
      f"({len(access)} stations x {len(BUDGETS)} budgets x 2 networks)")

rows=[]
byid={s["id"]:s for s in sts}
for sid,v in access.items():
    if "today" not in v or "scenario" not in v: continue
    rows.append({"station":byid[sid]["name"],
                 "today45":v["today"]["45"],"scen45":v["scenario"]["45"],
                 "delta45":v["scenario"]["45"]-v["today"]["45"]})
acc=pd.DataFrame(rows)
acc["pct"]=np.where(acc.today45>0, 100*acc.delta45/acc.today45, np.nan)
acc.to_csv(RES+"/station_jobs_access.csv", index=False)
print("\n   Biggest scenario gains in jobs within 45 minutes (station to station):")
for r in acc.sort_values("delta45",ascending=False).head(12).itertuples():
    print(f"     {r.station:34s} {r.today45:>9,} -> {r.scen45:>9,}   +{r.delta45:>8,}"
          + (f"  ({r.pct:+.0f}%)" if np.isfinite(r.pct) else ""))
print(f"\n   Median station gains {int(acc.delta45.median()):,} jobs within 45 min; "
      f"{int((acc.delta45>0).sum())} of {len(acc)} stations gain anything.")
