#!/usr/bin/env python3
"""Map the infill-station opportunity: blocks the planner turns away that sit
within a 20-minute walk of an existing Metra or CTA alignment, and the ranked
platform sites that would pick them up. Illinois State Plane East (EPSG:3435)."""
import json, os, numpy as np, pandas as pd, geopandas as gpd, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.patches import Patch
from shapely.geometry import LineString

SP="/private/tmp/claude-502/-Users-stevevance-Sites-BuildTheTunnel/c230cecd-d79f-4a5f-880a-a2d0a1d7e7cd/scratchpad"
REPO="/Users/stevevance/Sites/BuildTheTunnel"; OUT=REPO+"/analysis/results"
COUNTIES={"031":"Cook","043":"DuPage","089":"Kane","097":"Lake","111":"McHenry","197":"Will"}
PROPOSED={"X1","X2","X3","X4","X5","X6","RLE"}

blk=gpd.read_file(SP+"/tl_2020_17_tabblock20.shp",
                  columns=["GEOID20","COUNTYFP20","POP20","ALAND20"])
blk=blk[blk.COUNTYFP20.isin(COUNTIES)].copy().to_crs(3435)
gap=pd.read_csv(OUT+"/unserved_blocks_corridor.csv",dtype={"GEOID20":str})
corridor=set(gap[gap.addressable].GEOID20)
counties=blk.dissolve("COUNTYFP20").reset_index()

lines=json.load(open(REPO+"/planner/data/lines.json"))
segs=[LineString(p) for k,v in lines.items() if k not in PROPOSED for p in v if len(p)>1]
rail=gpd.GeoDataFrame(geometry=segs,crs=4269).to_crs(3435)
sts=json.load(open(REPO+"/planner/data/stations.json"))
on=[s for s in sts if s.get("exists_today")]
stn=gpd.GeoDataFrame(geometry=gpd.points_from_xy([s["lon"] for s in on],[s["lat"] for s in on]),
                     crs=4269).to_crs(3435)
c=pd.read_csv(OUT+"/infill_candidates.csv")
cg=gpd.GeoDataFrame(c,geometry=gpd.points_from_xy(c.lon,c.lat),crs=4269).to_crs(3435)

fig,ax=plt.subplots(figsize=(11,12.5),dpi=170); fig.patch.set_facecolor("white")
land=blk[blk.ALAND20>0]
land.plot(ax=ax,facecolor="#eceff1",edgecolor="none")
blk[blk.ALAND20==0].plot(ax=ax,facecolor="#dce9f2",edgecolor="none")
land[land.GEOID20.isin(corridor)].plot(ax=ax,facecolor="#d1495b",edgecolor="none")
counties.boundary.plot(ax=ax,color="#9aa5ae",linewidth=0.7)
rail.plot(ax=ax,color="#37424c",linewidth=0.9)
stn.plot(ax=ax,color="#37424c",markersize=2.5)
cg.plot(ax=ax,facecolor="#f0b323",edgecolor="#4a3a06",linewidth=0.6,
        markersize=np.sqrt(cg.new_pop)*1.9,zorder=5,alpha=0.95)

# Label only the top five, with hand-set offsets -- the Chicago sites sit close
# enough together that automatic placement stacks the boxes on top of each other.
OFFSETS={1:(14,-18),2:(16,14),3:(-172,-20),4:(14,-40),5:(22,20)}
for r in cg.head(5).itertuples():
    ax.annotate(f"{r.rank}. {r.place} ({r.line}) -- {r.new_pop:,}",(r.geometry.x,r.geometry.y),
                xytext=OFFSETS[r.rank],textcoords="offset points",fontsize=7.8,color="#22282e",
                arrowprops=dict(arrowstyle="-",lw=0.6,color="#8a939b",shrinkA=0,shrinkB=3),
                bbox=dict(boxstyle="round,pad=0.25",fc="white",ec="#c8ced4",lw=0.5,alpha=0.95),
                zorder=6)
b=land.total_bounds
ax.set_xlim(b[0]-6000,b[2]+6000); ax.set_ylim(b[1]-6000,b[3]+6000); ax.set_axis_off()
ax.set_title("Infill station opportunity on the existing railroad\n"
             "Blocks the planner turns away that already sit within a 20-minute walk of track",
             fontsize=13,pad=14)
ax.legend(handles=[
  Patch(facecolor="#d1495b",label='"No rail trip found," but within a 20-min walk of existing track (846,145 people)'),
  Patch(facecolor="#eceff1",label="Rest of the six-county service area"),
  Line2D([],[],color="#37424c",lw=1.2,marker="o",markersize=3,label="Existing Metra / CTA line and stations"),
  Line2D([],[],color="none",marker="o",markerfacecolor="#f0b323",markeredgecolor="#4a3a06",
         markersize=9,label="Infill site, sized by population it would newly serve (114 sites, 378,237 people)"),
],loc="upper center",bbox_to_anchor=(0.5,-0.005),ncol=1,fontsize=9,frameon=False)
ax.text(0.5,-0.115,"Sites are spaced at least 1 mile from any existing station and from each other, and each must "
        "reach 250+ currently-unserved residents.\nWalk cap = 20 min at 2.75 mph with a 1.3 detour factor "
        "(0.71 mi straight line). Data: 2020 Census PL 94-171 blocks; planner station list, alignments, and 8 AM matrix.",
        transform=ax.transAxes,ha="center",va="top",fontsize=7.5,color="#555")
fig.savefig(OUT+"/infill_map.png",bbox_inches="tight",facecolor="white")
print("wrote",OUT+"/infill_map.png")
