#!/usr/bin/env python3
"""Give the top infill sites a street address.

The siting pass in infill_station_candidates.py returns bare coordinates, which
is useless for talking about a station with anybody. A platform has to go where
a street meets the track, so this pulls OpenStreetMap around each site, finds
every place a named street actually crosses the railroad, and reports the
crossings nearest the scored location. Also caches the raw OSM extract for the
zoom maps to reuse.

Overpass is rate-limited; the extracts are cached on disk and only fetched once.
"""
import json, os, sys, time, urllib.request, urllib.parse
import numpy as np, pandas as pd

REPO="/Users/stevevance/Sites/BuildTheTunnel"; RES=REPO+"/analysis/results"
CACHE="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad/osm"
os.makedirs(CACHE, exist_ok=True)
OVERPASS="https://overpass-api.de/api/interpreter"
RADIUS_DEG=0.012          # ~1.3 km box, enough for a zoom map and the crossings
R=6371.0

def km(a, b):
    """Great-circle km between two (lat,lon) pairs, matching the planner."""
    r=np.pi/180
    dla,dlo=(b[0]-a[0])*r,(b[1]-a[1])*r
    h=np.sin(dla/2)**2+np.cos(a[0]*r)*np.cos(b[0]*r)*np.sin(dlo/2)**2
    return 2*R*np.arcsin(np.sqrt(h))

def fetch(lat, lon, tag):
    p=os.path.join(CACHE, f"{tag}.json")
    if os.path.exists(p): return json.load(open(p))
    s,w,nn,e = lat-RADIUS_DEG, lon-RADIUS_DEG*1.34, lat+RADIUS_DEG, lon+RADIUS_DEG*1.34
    q=f"""[out:json][timeout:120];
(
  way["railway"~"^(rail|light_rail|subway)$"]({s},{w},{nn},{e});
  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|living_street|motorway_link|trunk_link|primary_link|secondary_link)$"]({s},{w},{nn},{e});
  way["natural"="water"]({s},{w},{nn},{e});
  way["waterway"="riverbank"]({s},{w},{nn},{e});
  way["leisure"~"^(park|golf_course)$"]({s},{w},{nn},{e});
  way["landuse"~"^(cemetery|forest|grass|recreation_ground)$"]({s},{w},{nn},{e});
);
out geom;"""
    req=urllib.request.Request(OVERPASS, data=urllib.parse.urlencode({"data":q}).encode(),
                               headers={"User-Agent":"buildthetunnel-analysis/1.0"})
    for attempt in range(4):
        try:
            d=json.load(urllib.request.urlopen(req, timeout=180)); break
        except Exception as ex:
            print(f"   retry {attempt+1} ({ex})"); time.sleep(12)
    else:
        raise SystemExit("Overpass failed")
    json.dump(d, open(p,"w")); time.sleep(4)
    return d

def seg_cross(p1, p2, p3, p4):
    """Intersection of segments p1-p2 and p3-p4 in lon/lat, or None."""
    x1,y1=p1; x2,y2=p2; x3,y3=p3; x4,y4=p4
    d=(x2-x1)*(y4-y3)-(y2-y1)*(x4-x3)
    if abs(d)<1e-14: return None
    t=((x3-x1)*(y4-y3)-(y3-y1)*(x4-x3))/d
    u=((x3-x1)*(y2-y1)-(y3-y1)*(x2-x1))/d
    if 0<=t<=1 and 0<=u<=1: return (x1+t*(x2-x1), y1+t*(y2-y1))
    return None

def crossings(osm, lat, lon):
    """Named streets crossing the railway nearest the site, closest first."""
    ways=[e for e in osm["elements"] if e["type"]=="way" and "geometry" in e]
    rails=[w for w in ways if "railway" in w.get("tags",{})]
    # the railway the site sits on: the one with a vertex closest to the point
    best,bd=None,1e9
    for w in rails:
        d=min(km((lat,lon),(g["lat"],g["lon"])) for g in w["geometry"])
        if d<bd: bd,best=d,w
    if best is None: return [], None
    name=best.get("tags",{}).get("name") or best.get("tags",{}).get("operator")
    # every rail way sharing that name is the same alignment (Overpass splits ways)
    align=[w for w in rails if (w.get("tags",{}).get("name")==best.get("tags",{}).get("name"))] or [best]
    rsegs=[]
    for w in align:
        g=[(p["lon"],p["lat"]) for p in w["geometry"]]
        rsegs += list(zip(g[:-1], g[1:]))
    out=[]
    for w in ways:
        t=w.get("tags",{})
        if "highway" not in t or not t.get("name"): continue
        g=[(p["lon"],p["lat"]) for p in w["geometry"]]
        for a,b in zip(g[:-1],g[1:]):
            for c,d in rsegs:
                x=seg_cross(a,b,c,d)
                if x:
                    out.append({"street":t["name"], "hw":t["highway"],
                                "lon":x[0], "lat":x[1],
                                "km":km((lat,lon),(x[1],x[0]))})
    seen,uniq={},[]
    for c in sorted(out, key=lambda r:r["km"]):
        if c["street"] in seen: continue
        seen[c["street"]]=1; uniq.append(c)
    return uniq, name

def nearby_streets(osm, lat, lon, exclude, limit=4):
    """Named cross-streets running near the site but not over the track --
    the other half of an intersection description."""
    ways=[e for e in osm["elements"] if e["type"]=="way" and "geometry" in e]
    best={}
    for w in ways:
        t=w.get("tags",{})
        if "highway" not in t or not t.get("name") or t["name"] in exclude: continue
        d=min(km((lat,lon),(p["lat"],p["lon"])) for p in w["geometry"])
        if t["name"] not in best or d<best[t["name"]]: best[t["name"]]=d
    return sorted(best.items(), key=lambda kv: kv[1])[:limit]

SRC   = sys.argv[1] if len(sys.argv)>1 else "infill_candidates.csv"
TAG   = sys.argv[2] if len(sys.argv)>2 else "site"
N     = int(sys.argv[3]) if len(sys.argv)>3 else 5
cand=pd.read_csv(os.path.join(RES,SRC)).head(N)
rows=[]
for r in cand.itertuples():
    print(f"[{r.rank}] {r.place} / {r.line}  {r.lat},{r.lon}")
    osm=fetch(r.lat, r.lon, f"{TAG}{r.rank}")
    cx, railname = crossings(osm, r.lat, r.lon)
    top=cx[:4]
    near=nearby_streets(osm, r.lat, r.lon, {c["street"] for c in top})
    print(f"    railway: {railname}")
    for c in top:
        print(f"    crosses {c['street']:34s} {c['km']*0.621371:.2f} mi  ({c['lat']:.5f},{c['lon']:.5f})")
    print(f"    other streets nearby: " + ", ".join(f"{k} ({v*0.621371:.2f} mi)" for k,v in near))
    rows.append({"rank":r.rank,"line":r.line,"place":r.place,
                 "site_lat":r.lat,"site_lon":r.lon,
                 "railway":railname,
                 "primary_crossing":top[0]["street"] if top else None,
                 "primary_lat":round(top[0]["lat"],5) if top else None,
                 "primary_lon":round(top[0]["lon"],5) if top else None,
                 "primary_mi":round(top[0]["km"]*0.621371,2) if top else None,
                 "other_crossings":"; ".join(f"{c['street']} ({c['km']*0.621371:.2f} mi)" for c in top[1:]),
                 "nearby_streets":"; ".join(k for k,_ in near)})
pd.DataFrame(rows).to_csv(os.path.join(RES,TAG+"_crossstreets.csv"), index=False)
print("\nwrote", os.path.join(RES,TAG+"_crossstreets.csv"))
