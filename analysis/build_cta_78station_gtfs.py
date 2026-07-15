#!/usr/bin/env python3
"""
Build a modified CTA GTFS that adds a Red Line infill station at 1500 S Clark St
(the 78), inserted between Roosevelt (Subway) and Cermak-Chinatown on every Red
Line trip. The new station's stop time is interpolated GEOMETRICALLY by distance:
new_time = from_time + f * (to_time - from_time), where f is the new station's
fractional distance along the path from the trip's from-stop to its to-stop.
Downstream times are left unchanged (zero added dwell), per the spec.

Direction mapping (verified against the feed):
  dir 0 (southbound): Roosevelt 30270 -> Chinatown 30194
  dir 1 (northbound): Chinatown 30193 -> Roosevelt 30269
"""
import csv, math, os, io, zipfile

SP  = "/private/tmp/claude-502/-Users-stevevance-Sites-Chicago-Cityscape/f5bb1ab6-a48c-48f9-aaea-e4546a6de112/scratchpad"
SRC = os.path.join(SP, "cta_gtfs")                 # unzipped original CTA feed
OUT = os.path.join(SP, "cta_gtfs_78")              # modified feed (folder)
ZIP = os.path.join(SP, "cta-gtfs-78.zip")          # modified feed (zip)

# Station coordinates
ROOS  = (41.867368, -87.627402)   # Roosevelt (Subway)  stops 30269/30270
CHINA = (41.853206, -87.630968)   # Cermak-Chinatown    stops 30193/30194
NEW   = (41.861854, -87.630796)   # 1500 S Clark St (geocoded)

# New GTFS ids for the infill station
P_PARENT = "41999"; P_SB = "30999"; P_NB = "30998"; NEW_NAME = "The 78-15th/Clark"

def haversine(a, b):
    R=6371000.0; la1,lo1=map(math.radians,a); la2,lo2=map(math.radians,b)
    dla=la2-la1; dlo=lo2-lo1
    h=math.sin(dla/2)**2+math.cos(la1)*math.cos(la2)*math.sin(dlo/2)**2
    return 2*R*math.asin(math.sqrt(h))

# Distance fraction of NEW along Roosevelt->Chinatown (path through NEW).
d_rn=haversine(ROOS,NEW); d_nc=haversine(NEW,CHINA)
F_FROM_ROOS = d_rn/(d_rn+d_nc)          # fraction when traveling Roosevelt->Chinatown
print(f"d(Roosevelt->new)={d_rn:.1f}m  d(new->Chinatown)={d_nc:.1f}m  "
      f"fraction-from-Roosevelt={F_FROM_ROOS:.4f}")

def to_sec(t):
    h,m,s=t.split(":"); return int(h)*3600+int(m)*60+int(s)
def to_hms(x):
    x=int(round(x)); h=x//3600; m=(x%3600)//60; s=x%60
    return f"{h:02d}:{m:02d}:{s:02d}"

# --- which Red trips, and their direction ------------------------------------
red_dir={}
with open(os.path.join(SRC,"trips.txt")) as f:
    for r in csv.DictReader(f):
        if r["route_id"]=="Red": red_dir[r["trip_id"]]=r["direction_id"]

# For dir 0 insert P_SB between 30270 and 30194; for dir 1 insert P_NB between
# 30193 and 30269. Interpolation is by fraction-from-first-stop of that trip.
# fraction from Roosevelt = F_FROM_ROOS; fraction from Chinatown = 1-F_FROM_ROOS.
PLAN = {  # from_stop -> (to_stop, new_platform, fraction_from_first)
    "30270": ("30194", P_SB, F_FROM_ROOS),        # dir0 Roos->China
    "30193": ("30269", P_NB, 1.0-F_FROM_ROOS),    # dir1 China->Roos
}

os.makedirs(OUT, exist_ok=True)
# Copy through every file unchanged except stops.txt and stop_times.txt
passthrough=["agency.txt","calendar.txt","routes.txt","trips.txt","transfers.txt"]
for fn in passthrough:
    src=os.path.join(SRC,fn)
    if os.path.exists(src):
        with open(src) as a, open(os.path.join(OUT,fn),"w") as b: b.write(a.read())

# --- stops.txt: append parent + two directional platforms --------------------
with open(os.path.join(SRC,"stops.txt")) as f:
    stops_lines=f.read().splitlines()
hdr=stops_lines[0].split(",")
ncol=len(hdr)
def stop_row(sid,name,lat,lon,loctype,parent):
    d={c:"" for c in hdr}
    d["stop_id"]=sid; d["stop_name"]=name; d["stop_lat"]=f"{lat:.6f}"
    d["stop_lon"]=f"{lon:.6f}"; d["location_type"]=str(loctype)
    d["parent_station"]=parent
    if "wheelchair_boarding" in d: d["wheelchair_boarding"]="1"
    return ",".join(d[c] for c in hdr)
stops_lines += [
    stop_row(P_PARENT,NEW_NAME,NEW[0],NEW[1],1,""),
    stop_row(P_SB,    NEW_NAME,NEW[0],NEW[1],0,P_PARENT),
    stop_row(P_NB,    NEW_NAME,NEW[0],NEW[1],0,P_PARENT),
]
with open(os.path.join(OUT,"stops.txt"),"w") as f:
    f.write("\n".join(stops_lines)+"\n")

# --- stop_times.txt: group by trip (file order), insert + renumber Red trips --
with open(os.path.join(SRC,"stop_times.txt")) as f:
    rd=csv.reader(f); st_hdr=next(rd)
    ci={c:i for i,c in enumerate(st_hdr)}
    # Group by trip_id into a dict (robust to non-contiguous rows in the file),
    # preserving first-appearance order for output; sort each trip by sequence.
    groups={}; order=[]
    for row in rd:
        tid=row[ci["trip_id"]]
        if tid not in groups: groups[tid]=[]; order.append(tid)
        groups[tid].append(row)
    trips=[(tid, sorted(groups[tid], key=lambda r:int(r[ci["stop_sequence"]]))) for tid in order]

inserted=0
out=[",".join(st_hdr)]
for tid,rows in trips:
    if tid in red_dir:
        # locate the from_stop row that has a planned insertion
        newrow=None; ins_after=None
        for idx,row in enumerate(rows):
            sid=row[ci["stop_id"]]
            if sid in PLAN:
                to_stop,plat,frac=PLAN[sid]
                # confirm the next row is the expected to_stop
                if idx+1<len(rows) and rows[idx+1][ci["stop_id"]]==to_stop:
                    t1=to_sec(row[ci["departure_time"]])
                    t2=to_sec(rows[idx+1][ci["arrival_time"]])
                    nt=to_hms(t1+frac*(t2-t1))
                    nr=[""]*len(st_hdr)
                    nr[ci["trip_id"]]=tid; nr[ci["arrival_time"]]=nt
                    nr[ci["departure_time"]]=nt; nr[ci["stop_id"]]=plat
                    nr[ci["stop_sequence"]]="0"  # renumbered below
                    newrow=(idx,nr); ins_after=idx
                    break
        if newrow is not None:
            i,nr=newrow
            rows=rows[:i+1]+[nr]+rows[i+1:]
            inserted+=1
        # renumber stop_sequence 1..N for this trip
        for k,row in enumerate(rows,1): row[ci["stop_sequence"]]=str(k)
    for row in rows: out.append(",".join(row))

with open(os.path.join(OUT,"stop_times.txt"),"w") as f:
    f.write("\n".join(out)+"\n")
print(f"Inserted new station into {inserted} Red Line trips (expected 424).")

# --- zip it ------------------------------------------------------------------
if os.path.exists(ZIP): os.remove(ZIP)
with zipfile.ZipFile(ZIP,"w",zipfile.ZIP_DEFLATED) as z:
    for fn in os.listdir(OUT):
        z.write(os.path.join(OUT,fn),fn)
print("Wrote", ZIP)
