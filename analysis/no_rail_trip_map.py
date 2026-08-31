#!/usr/bin/env python3
"""Map the "No rail trip found" gap: which parts of the NITA six-county service
area sit beyond the trip planner's 20-minute walk cap from any rail station.
Reads the block flags computed by no_rail_trip_blocks.py's logic (recomputed
here so the map is standalone) and draws served vs. unserved blocks over county
outlines, in Illinois State Plane East (EPSG:3435)."""
import json, os, numpy as np, geopandas as gpd, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Patch
from scipy.spatial import cKDTree

SP="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
REPO="/Users/stevevance/Sites/BuildTheTunnel"; OUT=REPO+"/analysis/results"
COUNTIES={"031":"Cook","043":"DuPage","089":"Kane","097":"Lake","111":"McHenry","197":"Will"}
CAP=20/60*4.43/1.3; R=6371.0

blk=gpd.read_file(SP+"/tl_2020_17_tabblock20.shp",
                  columns=["GEOID20","COUNTYFP20","POP20","ALAND20","AWATER20","INTPTLAT20","INTPTLON20"])
blk=blk[blk.COUNTYFP20.isin(COUNTIES)].copy()
lat=blk.INTPTLAT20.astype(float).values; lon=blk.INTPTLON20.astype(float).values

sts=json.load(open(REPO+"/planner/data/stations.json"))
d=REPO+"/planner/data/matrix/scenario/0800"
live={f[:-5] for f in os.listdir(d) if f.endswith(".json")
      and any(k!=f[:-5] for k in json.load(open(os.path.join(d,f))))}
def ecef(la,lo):
    la,lo=np.radians(la),np.radians(lo)
    return np.column_stack([R*np.cos(la)*np.cos(lo),R*np.cos(la)*np.sin(lo),R*np.sin(la)])
tree=cKDTree(ecef(np.array([s["lat"] for s in sts]),np.array([s["lon"] for s in sts])))
ch,idx=tree.query(ecef(lat,lon),k=3)
km=2*R*np.arcsin(np.clip(ch/(2*R),0,1))
alive=np.array([s["id"] in live for s in sts])
blk["fail"]=~((km<=CAP)&alive[idx]).any(axis=1)

blk=blk.to_crs(3435)
counties=blk.dissolve("COUNTYFP20").reset_index()
stn=gpd.GeoDataFrame(geometry=gpd.points_from_xy([s["lon"] for s in sts],[s["lat"] for s in sts]),
                     crs=4269).to_crs(3435)

fig,ax=plt.subplots(figsize=(11,13),dpi=170)
fig.patch.set_facecolor("white")
served=blk[~blk.fail]; unserved=blk[blk.fail]
# water-only blocks (Lake Michigan, rivers) are neither served nor a gap
water=blk[blk.ALAND20==0]
unserved[unserved.ALAND20>0].plot(ax=ax,facecolor="#e8e2d9",edgecolor="none")
# populated unserved blocks stand out from empty land (forest preserve, industry)
unserved[(unserved.POP20>0)&(unserved.ALAND20>0)].plot(ax=ax,facecolor="#d1495b",edgecolor="none")
served[served.ALAND20>0].plot(ax=ax,facecolor="#2c7fb8",edgecolor="none")
water.plot(ax=ax,facecolor="#dce9f2",edgecolor="none")
counties.boundary.plot(ax=ax,color="#3a3a3a",linewidth=0.8)
land=blk[blk.ALAND20>0]
b=land.total_bounds
stn.cx[b[0]:b[2],b[1]:b[3]].plot(ax=ax,color="#111111",markersize=1.4,marker="o")
ax.set_xlim(b[0]-6000,b[2]+6000); ax.set_ylim(b[1]-6000,b[3]+6000)
ax.set_axis_off()
ax.set_title('Where the CrossTowner trip planner answers "No rail trip found"\n'
             "2020 census blocks in the NITA six-county service area, scenario network",
             fontsize=13,pad=14)
ax.legend(handles=[
    Patch(facecolor="#2c7fb8",label="Within a 20-min walk of a routable station (3,032,705 people)"),
    Patch(facecolor="#d1495b",label='Populated, beyond the walk cap — "No rail trip found" (5,413,161)'),
    Patch(facecolor="#e8e2d9",label="Beyond the walk cap, nobody lives there"),
    Patch(facecolor="#dce9f2",label="Water"),
], loc="upper center",bbox_to_anchor=(0.5,-0.005),ncol=2,fontsize=9.5,frameon=False)
ax.text(0.5,-0.105,"Stations shown as black dots. Walk cap = 20 min at 2.75 mph with a 1.3 detour factor "
        "(0.71 mi straight line). Data: 2020 Census PL 94-171 blocks, planner station list + 8 AM matrix.",
        transform=ax.transAxes,ha="center",va="top",fontsize=7.5,color="#555")
fig.savefig(OUT+"/no_rail_trip_map.png",bbox_inches="tight",facecolor="white")
print("wrote",OUT+"/no_rail_trip_map.png")
print("served pop",served.POP20.sum(),"unserved pop",unserved.POP20.sum())
