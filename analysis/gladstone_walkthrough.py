#!/usr/bin/env python3
"""Full derivation of the Gladstone Park jobs-access figures, step by step.

Prints every intermediate value so the arithmetic can be checked by hand, and
makes explicit a modelling choice that was buried before: whether the job
catchments are held constant between the two networks or allowed to move.
"""
import json, os
import numpy as np, pandas as pd, geopandas as gpd
from scipy.spatial import cKDTree

REPO="/Users/stevevance/Sites/BuildTheTunnel"
SPD="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
CAP=20/60*4.43/1.3; R=6371.0; SID="gladstone-park-1bbd"; BUDGET=45; TARGET=250_000
def ecef(la,lo):
    la,lo=np.radians(np.asarray(la,float)),np.radians(np.asarray(lo,float))
    return np.column_stack([R*np.cos(la)*np.cos(lo),R*np.cos(la)*np.sin(lo),R*np.sin(la)])
def gc(ch): return 2*R*np.arcsin(np.clip(ch/(2*R),0,1))
def L(t): print("\n"+t+"\n"+"-"*len(t))

sts=json.load(open(REPO+"/planner/data/stations.json")); byid={s["id"]:s for s in sts}
gp=byid[SID]
L("STEP 0 — the station")
print(f"  {gp['name']}  {gp['lat']}, {gp['lon']}")
print(f"  on_metra={gp['on_metra']}  on_crosstowner={gp['on_crosstowner']}  exists_today={gp['exists_today']}")
print(f"  walk cap = {CAP*1000:.0f} m straight line (20 min at 4.43 km/h with a 1.3 detour factor)")

L("STEP 1 — assign every block to its single nearest station inside the walk cap")
blk=gpd.read_file(SPD+"/tl_2020_17_tabblock20.shp",
                  columns=["GEOID20","COUNTYFP20","POP20","INTPTLAT20","INTPTLON20"],
                  ignore_geometry=True)
blk=blk[blk.COUNTYFP20.isin({"031","043","089","097","111","197"})]
wac=pd.read_csv(SPD+"/il_wac.csv.gz", usecols=["w_geocode","C000"], dtype={"w_geocode":str})
blk=blk.merge(wac.rename(columns={"w_geocode":"GEOID20","C000":"JOBS"}), on="GEOID20", how="left")
blk["JOBS"]=blk.JOBS.fillna(0).astype(int)
B=ecef(blk.INTPTLAT20.astype(float), blk.INTPTLON20.astype(float))
pop=blk.POP20.values.astype(np.int64); jb=blk.JOBS.values.astype(np.int64)
NETS={"today":[s for s in sts if s.get("exists_today")], "scenario":sts}
CATCH={}
for net,ss in NETS.items():
    d,i=cKDTree(ecef([s["lat"] for s in ss],[s["lon"] for s in ss])).query(B,k=1)
    ok=gc(d)<=CAP
    df=pd.DataFrame({"sid":[ss[j]["id"] for j in i],"pop":pop,"jobs":jb})[ok]
    CATCH[net]=df.groupby("sid").agg(pop=("pop","sum"),jobs=("jobs","sum"))
    print(f"  {net:9s}: {len(ss):>3} stations, {ok.sum():>6,} blocks assigned, "
          f"{int(CATCH[net].jobs.sum()):>9,} jobs and {int(CATCH[net]['pop'].sum()):>9,} residents captured")
print(f"\n  Gladstone Park's own catchment: {int(CATCH['scenario'].loc[SID,'pop']):,} residents, "
      f"{int(CATCH['scenario'].loc[SID,'jobs']):,} jobs")
print("  (a block belongs to exactly one station, so summing catchments never double-counts)")

L(f"STEP 2 — today: destinations reachable within {BUDGET} min, and the jobs in each")
def shard(net):
    row=json.load(open(f"{REPO}/planner/data/matrix/{net}/0800/{SID}.json"))
    out={}
    for d,c in row.items():
        m=c if isinstance(c,(int,float)) else c.get("m")
        if m is not None: out[d]=m
    return out
S={n:shard(n) for n in NETS}
def table(net, jobs_src):
    J=CATCH[jobs_src].jobs.to_dict()
    rows=[(byid[d]["name"],m,int(J.get(d,0))) for d,m in S[net].items() if m<=BUDGET]
    return sorted(rows,key=lambda r:(-r[2],r[1]))
t=table("today","today")
print(f"  the shard lists {len(S['today'])} destinations; {len(t)} are within {BUDGET} min")
print(f"  {'destination':34s} {'min':>4} {'jobs':>9}")
run=0
for nm,m,j in t:
    run+=j; print(f"  {nm:34s} {m:>4} {j:>9,}")
print(f"  {'':34s} {'':>4} {'-'*9}")
print(f"  {'TODAY, jobs within 45 minutes':34s} {'':>4} {run:>9,}")

L(f"STEP 3 — scenario: the same sum on the scenario network")
t2=table("scenario","scenario")
print(f"  {len(S['scenario'])} destinations listed; {len(t2)} within {BUDGET} min")
run2=sum(j for _,_,j in t2)
print(f"  {'destination':34s} {'min':>4} {'jobs':>9}   (top 15 of {len(t2)})")
for nm,m,j in t2[:15]:
    print(f"  {nm:34s} {m:>4} {j:>9,}")
print(f"  {'... the other ' + str(len(t2)-15) + ' stations':34s} {'':>4} {sum(j for _,_,j in t2[15:]):>9,}")
print(f"  {'':34s} {'':>4} {'-'*9}")
print(f"  {'SCENARIO, jobs within 45 minutes':34s} {'':>4} {run2:>9,}")
print(f"\n  difference: {run2-run:+,}  ({100*(run2-run)/run:+.0f}%)")

L("STEP 4 — where the difference comes from")
Jt,Js=CATCH["today"].jobs.to_dict(), CATCH["scenario"].jobs.to_dict()
inT={d for d,m in S["today"].items() if m<=BUDGET}
inS={d for d,m in S["scenario"].items() if m<=BUDGET}
both,new,lost=inT&inS,inS-inT,inT-inS
print(f"  reachable on both networks : {len(both):>3} stations")
print(f"  newly inside {BUDGET} min       : {len(new):>3} stations")
print(f"  dropped out                : {len(lost):>3} stations")
a=sum(Jt.get(d,0) for d in both); b=sum(Js.get(d,0) for d in both)
print(f"\n  (i)  faster travel, i.e. stations newly inside the budget:"
      f" {sum(Js.get(d,0) for d in new):>+10,}")
print(f"  (ii) stations that dropped out:                          {-sum(Jt.get(d,0) for d in lost):>+10,}")
print(f"  (iii) catchment reassignment on the stations in common:  {b-a:>+10,}")
print(f"       (new scenario stations pull some blocks away from existing ones,")
print(f"        so a station's own job catchment can shrink between networks)")
print(f"  {'':56s} {'-'*10}")
print(f"  {'total':56s} {sum(Js.get(d,0) for d in new)-sum(Jt.get(d,0) for d in lost)+(b-a):>+10,}")
print(f"\n  So {100*sum(Js.get(d,0) for d in new)/(run2-run):.0f}% of the gain is stations crossing the")
print( "  45-minute line. Almost all of them are downtown:")
for d in sorted(new,key=lambda d:-Js.get(d,0))[:6]:
    print(f"     {byid[d]['name']:34s} today {S['today'].get(d,'unreachable'):>4} min -> "
          f"scenario {S['scenario'][d]:>3} min   {Js.get(d,0):>8,} jobs")

L("STEP 5 — the cliff, and the cliff-free alternative")
print("  Cumulative jobs by travel time, holding job catchments at their scenario")
print("  values so only travel time varies:")
J=CATCH["scenario"].jobs.to_dict()
print(f"  {'cutoff':>7} {'today':>11} {'scenario':>11}")
for c in (30,35,40,45,50,55,60):
    print(f"  {str(c)+' min':>7} {sum(J.get(d,0) for d,m in S['today'].items() if m<=c):>11,} "
          f"{sum(J.get(d,0) for d,m in S['scenario'].items() if m<=c):>11,}")
def minutes_to(net,target):
    pairs=sorted((m,J.get(d,0)) for d,m in S[net].items())
    run=0
    for m,j in pairs:
        run+=j
        if run>=target: return m
    return None
mt,ms=minutes_to("today",TARGET),minutes_to("scenario",TARGET)
print(f"\n  minutes to reach {TARGET:,} jobs:  today {mt}, scenario {ms}  -> saves {mt-ms} min")
print("  This is the number that does not move when you nudge the cutoff, because")
print("  there is no cutoff -- the threshold is on the job count, not the clock.")
