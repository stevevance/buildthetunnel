#!/usr/bin/env python3
"""
add_leg_frequency.py -- Add an effective service FREQUENCY to every transit leg
in the trip-planner shards, so the cards can explain *why* a CrossTowner trip is
faster even when the route looks identical: it's usually more frequent service.

For each leg (board station -> alight station), we count how many trains actually
run that segment in the hour around 8 AM, across ALL feeds in that network:
  - today network   = Metra + CTA + Pace
  - scenario network = the same PLUS the CrossTowner X-routes and the Red Line
    Extension. So a BNSF ("M Line") leg picks up the X5 trains that share its
    corridor -- roughly doubling frequency -- and that's what the number shows.

A leg's `freq` is the mean headway in minutes ("a train every ~N min") over
07:30-08:30, considering every trip (any route) that stops at the board station
and then the alight station.

Writes `freq` into each leg of every shard in place.

Usage:  python3 analysis/add_leg_frequency.py
"""
import json, zipfile, csv, io, os, math, glob, sys, collections

IN = "analysis/r5r_network_inputs"
MATRIX = "planner/data/matrix"
STATIONS = "planner/data/stations.json"
FEEDS = {
    "today":    ["metra-gtfs.zip", "cta-gtfs.zip", "pace-gtfs.zip"],
    "scenario": ["metra-gtfs.zip", "cta-gtfs.zip", "pace-gtfs.zip",
                 "crosstowner-xroutes-gtfs.zip", "redline-extension-gtfs.zip"],
}
WIN_START, WIN_END = 7 * 3600 + 30 * 60, 8 * 3600 + 30 * 60   # 07:30-08:30

def hms_to_sec(t):
    try:
        h, m, s = t.split(":"); return int(h) * 3600 + int(m) * 60 + int(s)
    except Exception:
        return None

def load_feed(zip_path):
    """Return (stops{id:(lat,lon)}, trips{trip_id:[(stop_id, dep_sec), ...ordered]})."""
    z = zipfile.ZipFile(zip_path)
    stops = {}
    for r in csv.DictReader(io.TextIOWrapper(z.open("stops.txt"))):
        try: stops[r["stop_id"]] = (float(r["stop_lat"]), float(r["stop_lon"]))
        except Exception: pass
    trips = {}
    for r in csv.reader(io.TextIOWrapper(z.open("stop_times.txt"))):
        # header: trip_id,arrival_time,departure_time,stop_id,stop_sequence
        if len(r) < 5 or r[0] == "trip_id": continue
        dep = hms_to_sec(r[2] or r[1])
        if dep is None: continue
        trips.setdefault(r[0], []).append((int(r[4]), r[3], dep))
    for tid in trips:
        trips[tid].sort()                      # by stop_sequence
    return stops, trips

def main():
    stations = json.load(open(STATIONS))
    # Load every feed once.
    feeds = {}
    for f in set(sum(FEEDS.values(), [])):
        feeds[f] = load_feed(f"{IN}/{f}")
        print("loaded", f, "trips:", len(feeds[f][1]))

    # station name -> set of stop_ids per feed (proximity match, <200 m).
    def near(a, b):
        return math.hypot((a[0]-b[0]) * 111000, (a[1]-b[1]) * 85000)
    st_stops = {}   # feed -> name -> [stop_id]
    for f, (stops, _) in feeds.items():
        m = {}
        for s in stations:
            hits = [sid for sid, c in stops.items() if near((s["lat"], s["lon"]), c) < 200]
            if hits: m[s["name"]] = hits
        st_stops[f] = m

    # Per-feed index: stop_id -> trip_ids, and trip_id -> {stop_id: (seq, dep)}.
    # Lets us test only the trips that touch both endpoints instead of scanning all.
    idx = {}
    for f, (stops, trips) in feeds.items():
        stop_trips = collections.defaultdict(set)
        trip_stops = {}
        for tid, seq in trips.items():
            d = {}
            for sq, sid, dep in seq:
                stop_trips[sid].add(tid)
                d[sid] = (sq, dep)
            trip_stops[tid] = d
        idx[f] = (stop_trips, trip_stops)

    def leg_freq(net, from_name, to_name):
        deps = set()
        for f in FEEDS[net]:
            froms = st_stops[f].get(from_name); tos = st_stops[f].get(to_name)
            if not froms or not tos: continue
            stop_trips, trip_stops = idx[f]
            cand = set().union(*[stop_trips[s] for s in froms]) & \
                   set().union(*[stop_trips[s] for s in tos])
            for tid in cand:
                ts = trip_stops[tid]
                fseq_dep = min((ts[s] for s in froms if s in ts), default=None, key=lambda x: x[0])
                tseq     = min((ts[s][0] for s in tos if s in ts), default=None)
                if fseq_dep and tseq is not None and fseq_dep[0] < tseq \
                   and WIN_START <= fseq_dep[1] < WIN_END:
                    deps.add((f, round(fseq_dep[1])))
        n = len(deps)
        if n == 0: return None
        return max(1, round(60.0 / n))               # mean headway (min) over the hour

    # Sanity check before rewriting everything.
    print("\n== sanity: Clarendon Hills -> LaGrange Road ==")
    for net in ("today", "scenario"):
        print(f"  {net}: every ~{leg_freq(net, 'Clarendon Hills', 'LaGrange Road')} min")
    if "--test" in sys.argv:
        return

    # Rewrite shards: add `freq` to each leg. Cache leg frequencies (net, from, to).
    cache = {}
    for net in ("today", "scenario"):
        n_updated = 0
        for shard in glob.glob(f"{MATRIX}/{net}/0800/*.json"):
            cell = json.load(open(shard))
            changed = False
            for did, c in cell.items():
                for leg in c.get("legs", []):
                    key = (net, leg["from"], leg["to"])
                    if key not in cache: cache[key] = leg_freq(*key)
                    if cache[key] is not None:
                        leg["freq"] = cache[key]; changed = True
            if changed:
                json.dump(cell, open(shard, "w"), separators=(",", ":")); n_updated += 1
        print(f"{net}: added freq to {n_updated} shards")
    print("done.")

if __name__ == "__main__":
    main()
