#!/usr/bin/env python3
"""Is a cumulative jobs-within-T-minutes number safe to show a rider?

Gladstone Park reports +394% jobs within 45 minutes. Tracing it shows why: the
Loop sits at 46-56 minutes today and 32-45 in the scenario, so an eight-to-eleven
minute improvement tips the region's densest job cluster across the cutoff all at
once. The underlying change is real; the percentage is an artifact of where the
line was drawn. This measures how badly that cliff affects per-station numbers,
by rescoring every station at 40, 45 and 50 minutes.
"""
import json, os
import numpy as np, pandas as pd

REPO="/Users/stevevance/Sites/BuildTheTunnel"; RES=REPO+"/analysis/results"
SPD="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
BUDGETS=[35,40,45,50,55]
sts=json.load(open(REPO+"/planner/data/stations.json")); byid={s["id"]:s for s in sts}
A=json.load(open(SPD+"/planner_jobs/station_catchment.json"))

def jobs_of(net):
    return {k:v.get(net,{}).get("j",0) for k,v in A.items()}

rows={}
for net in ("today","scenario"):
    J=jobs_of(net); d=f"{REPO}/planner/data/matrix/{net}/0800"
    for f in os.listdir(d):
        if not f.endswith(".json"): continue
        sid=f[:-5]; row=json.load(open(os.path.join(d,f)))
        acc={b:0 for b in BUDGETS}
        for dest,cell in row.items():
            m=cell if isinstance(cell,(int,float)) else cell.get("m")
            if m is None: continue
            for b in BUDGETS:
                if m<=b: acc[b]+=J.get(dest,0)
        rows.setdefault(sid,{})[net]=acc

pop={k:v.get("scenario",{}).get("p",0) for k,v in A.items()}
recs=[]
for sid,v in rows.items():
    if "today" not in v or "scenario" not in v: continue
    r={"station":byid[sid]["name"],"pop":pop.get(sid,0)}
    for b in BUDGETS:
        t,s=v["today"][b],v["scenario"][b]
        r[f"t{b}"]=t; r[f"s{b}"]=s
        r[f"pct{b}"]=(100*(s-t)/t) if t>0 else np.nan
    recs.append(r)
d=pd.DataFrame(recs)

print("Population-weighted jobs near a station, by cutoff (the regional headline):")
print(f'{"cutoff":>7} {"today":>11} {"scenario":>11} {"gain":>11} {"%":>7}')
for b in BUDGETS:
    t=np.average(d[f"t{b}"],weights=d["pop"]); s=np.average(d[f"s{b}"],weights=d["pop"])
    print(f'{str(b)+"m":>7} {t:>11,.0f} {s:>11,.0f} {s-t:>+11,.0f} {100*(s-t)/t:>6.0f}%')

print("\nHow much a single station's headline percentage moves with the cutoff:")
sub=d[(d.t45>0)&(d.t40>0)&(d.t50>0)].copy()
sub["swing"]=sub[["pct40","pct45","pct50"]].max(axis=1)-sub[["pct40","pct45","pct50"]].min(axis=1)
print(f"  median swing between the 40, 45 and 50-minute cutoffs: "
      f"{sub.swing.median():.0f} percentage points")
print(f"  stations whose percentage swings by more than 100 points: "
      f"{(sub.swing>100).sum()} of {len(sub)}")
print("\n  worst offenders:")
for r in sub.sort_values("swing",ascending=False).head(10).itertuples():
    print(f"    {r.station:32s} 40m {r.pct40:>7.0f}%  45m {r.pct45:>7.0f}%  50m {r.pct50:>7.0f}%")
print("\n  Gladstone Park across every cutoff:")
g=d[d.station=="Gladstone Park"].iloc[0]
for b in BUDGETS:
    print(f"    {b} min: {g[f't{b}']:>9,.0f} -> {g[f's{b}']:>9,.0f}  ({g[f'pct{b}']:+.0f}%)")

print("\nA cliff-free alternative: minutes saved to the nearest 100k / 250k jobs.")
J=jobs_of("scenario")
def minutes_to(sid,net,target):
    p=f"{REPO}/planner/data/matrix/{net}/0800/{sid}.json"
    if not os.path.exists(p): return None
    row=json.load(open(p))
    pairs=[]
    for dest,cell in row.items():
        m=cell if isinstance(cell,(int,float)) else cell.get("m")
        if m is not None: pairs.append((m,J.get(dest,0)))
    pairs.sort()
    run=0
    for m,j in pairs:
        run+=j
        if run>=target: return m
    return None
out=[]
for sid in rows:
    a,b=minutes_to(sid,"today",250_000),minutes_to(sid,"scenario",250_000)
    if a and b: out.append((byid[sid]["name"],a,b,a-b))
out.sort(key=lambda x:-x[3])
print(f"  {len(out)} stations can reach 250,000 jobs at all; median saving "
      f"{np.median([o[3] for o in out]):.0f} min")
for nm,a,b,g2 in out[:10]:
    print(f"    {nm:32s} {a:>3} -> {b:>3} min   saves {g2:>2} min")
