#!/usr/bin/env python3
"""Zoom maps for the top connectivity infill sites.

Same canvas and same layers as infill_zoom_maps.py, but the block shading asks a
different question. An access-gap map asks who has no rail at all. A connectivity
map asks who this *particular* network misses -- and splits that market by
whether some other network already reaches it, which is the Fulton Market case:
nobody there lacks transit, but Metra cannot touch it.

  teal    inside the walk cap, out of reach of this network on foot, but within
          reach of the other network's rail -- a market served by somebody else
  amber   inside the cap and out of reach of both networks
  blue    already within this network's own walk cap
  pink    outside the cap
  grey    no residents and no jobs
"""
import json, os
import numpy as np, pandas as pd, geopandas as gpd, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Patch, Circle
from matplotlib.lines import Line2D
from scipy.spatial import cKDTree

REPO="/Users/stevevance/Sites/BuildTheTunnel"; RES=REPO+"/analysis/results"
SPD="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
OSM=SPD+"/osm"; CONN=SPD+"/conn"; BLK=SPD+"/tl_2020_17_tabblock20.shp"
CAP=20/60*4.43/1.3; R=6371.0; HALF=1.30; TRANSFER_KM=0.402
FIGW,FIGH=10.0,10.9; DPI=165
def fy(i): return 1-i/FIGH
MAPTOP,MAPH=0.85,7.40
AXRECT=[0.035,fy(MAPTOP+MAPH),0.93,MAPH/FIGH]

CLASSES=[(("residential","unclassified","living_street"), 0.55, "#c3cbd2"),
         (("tertiary","tertiary_link","secondary_link","primary_link",
           "trunk_link","motorway_link"),                 1.05, "#aab4bd"),
         (("secondary",),                                 1.6,  "#98a4ae"),
         (("primary","trunk"),                            2.3,  "#7d8b96"),
         (("motorway",),                                  3.2,  "#6d7c88")]
LABELCLASS={"motorway","trunk","primary","secondary","tertiary"}
SERVICE={"Red":("Red Line","#c60c30"),"Blue":("Blue Line","#00a1de"),
         "G":("Green Line","#009b3a"),"Brn":("Brown Line","#62361b"),
         "Org":("Orange Line","#f9461c"),"P":("Purple Line","#522398"),
         "Pink":("Pink Line","#e27ea6"),"Y":("Yellow Line","#f9e300"),
         "BNSF":("BNSF","#2b5f8e"),"ME":("Metra Electric","#2b5f8e"),
         "HC":("Heritage Corridor","#2b5f8e"),"MD-N":("MD-N","#2b5f8e"),
         "MD-W":("MD-W","#2b5f8e"),"NCS":("North Central Service","#2b5f8e"),
         "RI":("Rock Island","#2b5f8e"),"SWS":("SouthWest Service","#2b5f8e"),
         "UP-N":("UP-N","#2b5f8e"),"UP-NW":("UP-NW","#2b5f8e"),"UP-W":("UP-W","#2b5f8e"),
         "X1":("CrossTowner X1","#b5179e"),"X2":("CrossTowner X2","#b5179e"),
         "X3":("CrossTowner X3","#b5179e"),"X4":("CrossTowner X4","#b5179e"),
         "X5":("CrossTowner X5","#b5179e"),"X6":("CrossTowner X6","#b5179e"),
         "RLE":("Red Line Extension","#c60c30")}
PROPOSED={"X1","X2","X3","X4","X5","X6","RLE"}

def ecef(la,lo):
    la,lo=np.radians(np.asarray(la,float)),np.radians(np.asarray(lo,float))
    return np.column_stack([R*np.cos(la)*np.cos(lo),R*np.cos(la)*np.sin(lo),R*np.sin(la)])
def gc(ch): return 2*R*np.arcsin(np.clip(ch/(2*R),0,1))

sts=json.load(open(REPO+"/planner/data/stations.json"))
on=[s for s in sts if s.get("exists_today")]
NET={"METRA":[s for s in on if s.get("on_metra")],"CTA":[s for s in on if s.get("on_cta_rail")]}
TREE={k:cKDTree(ecef([s["lat"] for s in v],[s["lon"] for s in v])) for k,v in NET.items()}
OTHER={"METRA":"CTA","CTA":"METRA"}
S_all=ecef([s["lat"] for s in sts],[s["lon"] for s in sts])
LINES=json.load(open(REPO+"/planner/data/lines.json"))
wac=pd.read_csv(SPD+"/il_wac.csv.gz", usecols=["w_geocode","C000"], dtype={"w_geocode":str})
wac=wac.rename(columns={"w_geocode":"GEOID20","C000":"JOBS"})

cand=pd.read_csv(RES+"/connectivity_candidates.csv").head(5)
cross=pd.read_csv(RES+"/conn_crossstreets.csv")

for r in cand.itertuples():
    cx=cross[cross["rank"]==r.rank].iloc[0]
    kx=111.320*np.cos(np.radians(r.lat)); ky=110.574
    X=lambda lon:(np.asarray(lon,float)-r.lon)*kx
    Y=lambda lat:(np.asarray(lat,float)-r.lat)*ky
    dlat=HALF/ky; dlon=HALF/kx
    blk=gpd.read_file(BLK, columns=["GEOID20","POP20","INTPTLAT20","INTPTLON20"],
                      bbox=(r.lon-dlon*1.06,r.lat-dlat*1.06,r.lon+dlon*1.06,r.lat+dlat*1.06))
    blk=blk.to_crs(4269).merge(wac,on="GEOID20",how="left")
    blk["JOBS"]=blk.JOBS.fillna(0).astype(int)
    B=ecef(blk.INTPTLAT20.astype(float).values, blk.INTPTLON20.astype(float).values)
    own=gc(TREE[r.network].query(B,k=1)[0])<=CAP
    oth=gc(TREE[OTHER[r.network]].query(B,k=1)[0])<=CAP
    inside=gc(np.linalg.norm(B-ecef(r.lat,r.lon),axis=1))<=CAP
    empty=(blk.POP20.values==0)&(blk.JOBS.values==0)
    blk["cat"]=np.where(empty,"nopop",
               np.where(own,"own",
               np.where(~inside,"out",
               np.where(oth,"cross","nonet"))))

    osm=json.load(open(f"{OSM}/conn{r.rank}.json"))
    ways=[e for e in osm["elements"] if e["type"]=="way" and "geometry" in e]
    conn=json.load(open(f"{CONN}/conn{r.rank}.json"))

    fig=plt.figure(figsize=(FIGW,FIGH),dpi=DPI); fig.patch.set_facecolor("white")
    ax=fig.add_axes(AXRECT); ax.set_facecolor("#f4f6f8")
    for w in ways:
        t=w.get("tags",{}); g=w["geometry"]
        if len(g)<3: continue
        xs=X([p["lon"] for p in g]); ys=Y([p["lat"] for p in g])
        if t.get("natural")=="water" or t.get("waterway")=="riverbank":
            ax.fill(xs,ys,color="#d3e3ee",zorder=1,lw=0)
        elif t.get("leisure") in ("park","golf_course") or \
             t.get("landuse") in ("cemetery","forest","grass","recreation_ground"):
            ax.fill(xs,ys,color="#e2eadd",zorder=1,lw=0)
    COL={"cross":"#2a9d8f","nonet":"#f2c14e","own":"#a9c6da","out":"#eecfd4","nopop":"#d6d3cc"}
    for cat in ("nopop","out","own","nonet","cross"):
        for geom in blk[blk.cat==cat].geometry:
            for poly in (geom.geoms if geom.geom_type=="MultiPolygon" else [geom]):
                xs,ys=poly.exterior.coords.xy
                ax.fill(X(list(xs)),Y(list(ys)),color=COL[cat],zorder=2,lw=0,alpha=.80)
    for klass,lw,col in CLASSES:
        for w in ways:
            if w.get("tags",{}).get("highway") not in klass: continue
            g=w["geometry"]
            ax.plot(X([p["lon"] for p in g]),Y([p["lat"] for p in g]),
                    color=col,lw=lw,zorder=3,solid_capstyle="round")
    transfers=[]
    for b in sorted(conn["routes"],key=lambda z:z["min_km"]):
        g=np.array(b["geom"])
        if len(g)<2: continue
        if b["min_km"]<=TRANSFER_KM:
            ax.plot(X(g[:,0]),Y(g[:,1]),color="#00857a",lw=2.0,zorder=6,solid_capstyle="round")
            transfers.append(b)
        else:
            ax.plot(X(g[:,0]),Y(g[:,1]),color="#8fb8b3",lw=1.0,zorder=5,alpha=.7,solid_capstyle="round")
    rails=[w for w in ways if "railway" in w.get("tags",{}) and len(w["geometry"])>1]
    def ends(w):
        g=w["geometry"]
        return ((round(g[0]["lat"],6),round(g[0]["lon"],6)),
                (round(g[-1]["lat"],6),round(g[-1]["lon"],6)))
    at={}
    for i,w in enumerate(rails):
        for e in ends(w): at.setdefault(e,[]).append(i)
    start=min(range(len(rails)),
              key=lambda i:min(gc(np.linalg.norm(ecef(p["lat"],p["lon"])-ecef(r.lat,r.lon)))
                               for p in rails[i]["geometry"]))
    host={start}; q=[start]
    while q:
        i=q.pop()
        for e in ends(rails[i]):
            for j in at.get(e,()):
                if j not in host: host.add(j); q.append(j)
    for i,w in enumerate(rails):
        g=w["geometry"]; xs=X([p["lon"] for p in g]); ys=Y([p["lat"] for p in g])
        if i in host:
            ax.plot(xs,ys,color="#20272d",lw=3.4,zorder=8,solid_capstyle="round")
            ax.plot(xs,ys,color="#f4f6f8",lw=1.0,zorder=8,dashes=(4,4))
        else:
            ax.plot(xs,ys,color="#9aa5ae",lw=1.9,zorder=4,solid_capstyle="round")
    rail_here=[]
    for key,parts in LINES.items():
        label,col=SERVICE.get(key,(key,"#555")); hit=False
        for part in parts:
            g=np.array(part)
            d=gc(np.linalg.norm(ecef(g[:,1],g[:,0])-ecef(r.lat,r.lon),axis=1))
            keep=d<=HALF*1.7
            if keep.sum()<2: continue
            hit=True
            ax.plot(X(g[keep,0]),Y(g[keep,1]),color=col,lw=1.7,zorder=9,alpha=.95,
                    dashes=(6,3) if key in PROPOSED else (None,None),solid_capstyle="round")
        if hit: rail_here.append((label,col,key in PROPOSED))
    prop_here=[l for l,_,p_ in rail_here if p_]
    prop_short=", ".join(l.replace("CrossTowner ","") for l in prop_here)
    rail_here=[(l,c,p_) for l,c,p_ in rail_here if not p_][:8]
    if prop_here:
        rail_here.append(("CrossTowner / RLE (proposed)","#b5179e",True))
    ax.add_patch(Circle((0,0),CAP,fill=False,ec="#b57e08",lw=1.9,ls=(0,(7,4)),zorder=10))
    ax.plot([0],[0],marker="o",ms=15,mfc="#f0b323",mec="#4a3a06",mew=1.6,zorder=12)
    ax.plot([0],[0],marker="o",ms=4.5,mfc="#4a3a06",mec="none",zorder=13)
    d_all=gc(np.linalg.norm(S_all-ecef(r.lat,r.lon),axis=1))
    for i in np.where(d_all<HALF*1.5)[0]:
        ex=sts[i].get("exists_today")
        sx,sy=X(sts[i]["lon"]),Y(sts[i]["lat"])
        ax.plot([sx],[sy],marker="s",ms=8,mfc="#20272d" if ex else "white",
                mec="white" if ex else "#b5179e",mew=1.4,zorder=12)
        ax.annotate(sts[i]["name"]+("" if ex else " (proposed)"),(sx,sy),xytext=(0,-15),
                    textcoords="offset points",ha="center",fontsize=8,color="#20272d",zorder=13,
                    bbox=dict(boxstyle="round,pad=0.2",fc="white",ec="none",alpha=.85))
    placed=[]
    for w in sorted(ways,key=lambda w:-len(w.get("geometry",[]))):
        t=w.get("tags",{})
        if t.get("highway") not in LABELCLASS or not t.get("name"): continue
        if t["name"] in [p[0] for p in placed]: continue
        pts=[(X(p["lon"]),Y(p["lat"])) for p in w["geometry"]]
        pts=[p for p in pts if abs(p[0])<HALF*.88 and abs(p[1])<HALF*.88]
        if not pts: continue
        px,py=pts[len(pts)//2]
        if any((px-q2[1])**2+(py-q2[2])**2<0.20 for q2 in placed): continue
        placed.append((t["name"],px,py))
        ax.annotate(t["name"],(px,py),fontsize=7.6,color="#4a5560",zorder=11,ha="center",
                    bbox=dict(boxstyle="round,pad=0.18",fc="#f4f6f8",ec="none",alpha=.8))
    ax.set_xlim(-HALF,HALF); ax.set_ylim(-HALF,HALF); ax.set_aspect("equal"); ax.set_axis_off()
    ax.plot([HALF-1.16,HALF-.16],[-HALF+.15]*2,color="#20272d",lw=2.6,solid_capstyle="butt",zorder=14)
    ax.text(HALF-.66,-HALF+.23,"1 km",ha="center",fontsize=8,color="#20272d",zorder=14,
            bbox=dict(boxstyle="round,pad=0.15",fc="white",ec="none",alpha=.8))

    fig.text(0.035,fy(0.34),f"C{r.rank}. {cx.primary_crossing} at the {r.line}",
             fontsize=16,fontweight="bold",va="top")
    fig.text(0.035,fy(0.62),f"{r.place}  ·  {r.miss_jobs:,} jobs and {r.miss_pop:,} residents the "
             f"{r.line} cannot reach on foot  ·  {r.cross_share:.0f}% of them already have other rail",
             fontsize=11,color="#4a5560",va="top")
    handles=[
        Line2D([],[],color="none",marker="o",markerfacecolor="#f0b323",markeredgecolor="#4a3a06",
               markersize=11,label="Proposed connectivity station"),
        Line2D([],[],color="#b57e08",lw=1.8,ls=(0,(7,4)),label="20-minute walk cap (0.71 mi)"),
        Patch(facecolor="#2a9d8f",label=f"Missed by the {r.line}, reached by other rail"),
        Patch(facecolor="#f2c14e",label="Missed by both networks"),
        Patch(facecolor="#a9c6da",label=f"Already within reach of {'Metra' if r.network=='METRA' else 'the CTA'}"),
        Patch(facecolor="#eecfd4",label="Outside the walk cap"),
        Patch(facecolor="#d6d3cc",label="No residents and no jobs"),
        Line2D([],[],color="#20272d",lw=2.6,label=f"{cx.railway} (the {r.line})"),
        Line2D([],[],color="#9aa5ae",lw=1.8,label="Other tracks in the corridor"),
        Line2D([],[],color="#00857a",lw=2.0,label="Bus route within a quarter mile"),
        Line2D([],[],color="#8fb8b3",lw=1.0,label="Other bus route in frame"),
        Line2D([],[],color="none",marker="s",markerfacecolor="#20272d",markeredgecolor="white",
               markersize=8,label="Existing station"),
    ]
    for label,col,prop in rail_here:
        handles.append(Line2D([],[],color=col,lw=1.7,dashes=(6,3) if prop else (None,None),
                              label=label+(" (proposed)" if prop and "proposed" not in label else "")))
    fig.legend(handles=handles,loc="upper left",bbox_to_anchor=(0.035,fy(MAPTOP+MAPH+0.20)),
               ncol=4,fontsize=8.4,frameon=False,handlelength=2.0,columnspacing=1.4)
    bus=", ".join(f"{b['agency']} {b['route']} ({b['name']})" for b in transfers) or "none within a quarter mile"
    fig.text(0.035,fy(9.72),"Connections at this site",fontsize=10.5,fontweight="bold",va="top")
    fig.text(0.035,fy(9.96),f"Bus:  {bus}",fontsize=9,color="#33404a",va="top")
    fig.text(0.035,fy(10.19),f"Rail transfer:  {r.rail_transfer}"
             + (f"    ·    CrossTowner here: {prop_short}" if prop_here else "") + "    ·    "
             f"{r.bus_routes} bus routes within a quarter mile, {r.bus_trips_per_day:,} weekday trips a day",
             fontsize=9,color="#33404a",va="top")
    fig.text(0.035,fy(10.52),"Jobs are LODES 2023 workplace counts; bus routes from CTA and Pace GTFS; "
             "rail services from the planner's lines.json; base map © OpenStreetMap contributors.",
             fontsize=7.4,color="#68757f",va="top")
    out=f"{RES}/connectivity_zoom_{r.rank}.png"
    fig.savefig(out,facecolor="white"); plt.close(fig)
    print("wrote",out)
