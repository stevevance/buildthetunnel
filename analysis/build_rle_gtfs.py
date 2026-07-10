#!/usr/bin/env python3
"""
Build a frequency-based GTFS feed for the CTA Red Line Extension (RLE), the
under-construction segment from 95th/Dan Ryan south to 130th Street.

The RLE has no published timetable, so it is modeled the way CTA rapid
transit runs: a repeating headway. Rather than a frequencies.txt (which r5r
cannot route), the two headway bands are materialized into explicit trips.
The feed's 95th/Dan Ryan station is placed at the exact coordinates of the
existing CTA Red Line terminal so R5 treats it as a same-station transfer
onto today's Red Line (which is in the base CTA feed).

Geometry: the five stations and the 5.5-mile alignment come from the
BuildTheTunnel flythrough dataset (lines.js, RED_LINE_EXTENSION), itself
derived from CTA's project plans.

Service (materialized into stop_times as explicit trips):
  - 10-minute headway, 07:00-22:00
  - 15-minute headway, 22:00-07:00 (overnight; GTFS extended time to 31:00)
  - ~10 min end-to-end (95th<->130th), matching CTA's projected run time
  - route_type 1 (subway/metro)

Usage:  python3 build_rle_gtfs.py
Output: redline_extension_gtfs/*.txt  +  redline-extension-gtfs.zip
"""
import csv, json, math, os, re, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
OUTDIR = os.path.join(HERE, "redline_extension_gtfs")
OUTZIP = os.path.join(HERE, "redline-extension-gtfs.zip")

# Stations north->south, with the 95th terminal pinned to the CTA stop coords
# so the transfer onto today's Red Line is co-located.
STATIONS = [
    ("rle-95th-dan-ryan", "95th/Dan Ryan (RLE)", 41.722377, -87.624342),
    ("rle-103rd",         "103rd Street",        41.70657,  -87.633151),
    ("rle-111th",         "111th Street",        41.69239,  -87.632732),
    ("rle-michigan",      "Michigan (116th)",    41.683017, -87.620805),
    ("rle-130th",         "130th Street",        41.6585,   -87.5918),
]
# Cumulative minutes from the northern terminus (95th) southbound.
CUM_MIN = [0, 3, 5, 7, 10]

# (start_min, end_min, headway_min) bands over one service day; the overnight
# band uses GTFS extended time (past 24:00) so it wraps to 07:00 next morning.
BANDS = [
    (7 * 60,  22 * 60, 10),   # 07:00-22:00, every 10 min
    (22 * 60, 31 * 60, 15),   # 22:00-07:00 (next day), every 15 min
]


def load_path():
    """Return the RLE alignment [[lon,lat],...] from lines.js (130th -> 95th)."""
    s = open(os.path.join(REPO, "lines.js")).read()
    m = re.search(r"const RED_LINE_EXTENSION\s*=\s*(\{.*?\});", s, re.S)
    return json.loads(m.group(1))["path"]


def main():
    os.makedirs(OUTDIR, exist_ok=True)
    path = load_path()                       # 130th (idx 0) -> 95th (idx -1)
    path_nb = path                           # 130th -> 95th (northbound)
    path_sb = list(reversed(path))           # 95th -> 130th (southbound)

    def write(fname, header, rows):
        with open(os.path.join(OUTDIR, fname), "w", newline="") as f:
            w = csv.writer(f); w.writerow(header); w.writerows(rows)

    write("agency.txt",
          ["agency_id", "agency_name", "agency_url", "agency_timezone"],
          [["CTA-RLE", "CTA Red Line Extension (under construction)",
            "https://www.transitchicago.com/rle/", "America/Chicago"]])
    write("routes.txt",
          ["route_id", "agency_id", "route_short_name", "route_long_name",
           "route_type", "route_color", "route_text_color"],
          [["RLE", "CTA-RLE", "Red", "Red Line Extension (95th-130th)",
            1, "C60C30", "FFFFFF"]])
    write("calendar.txt",
          ["service_id", "monday", "tuesday", "wednesday", "thursday", "friday",
           "saturday", "sunday", "start_date", "end_date"],
          [["DAILY", 1, 1, 1, 1, 1, 1, 1, 20260101, 20261231]])
    write("stops.txt",
          ["stop_id", "stop_name", "stop_lat", "stop_lon"],
          [[sid, name, lat, lon] for sid, name, lat, lon in STATIONS])
    def hms(mins):
        return f"{mins//60:02d}:{mins%60:02d}:00"

    # Per-direction stop offsets (minutes from that trip's first stop).
    order_sb = list(range(len(STATIONS)))            # 95th -> 130th
    order_nb = list(reversed(order_sb))              # 130th -> 95th
    patterns = {
        "SB": [(STATIONS[i][0], CUM_MIN[i]) for i in order_sb],
        "NB": [(STATIONS[i][0], CUM_MIN[-1] - CUM_MIN[i]) for i in order_nb],
    }
    heads = {"NB": "95th/Dan Ryan", "SB": "130th Street"}
    direction = {"NB": 0, "SB": 1}

    # Materialize one trip per direction per headway tick across both bands.
    trips, st = [], []
    for d in ("NB", "SB"):
        n = 0
        for start, end, hw in BANDS:
            for anchor in range(start, end, hw):
                tid = f"RLE_{d}_{anchor:04d}"
                trips.append(["RLE", "DAILY", tid, heads[d], direction[d], f"RLE_{d}"])
                for seq, (sid, off) in enumerate(patterns[d], 1):
                    t = hms(anchor + off)
                    st.append([tid, t, t, sid, seq])
            n += 1
    write("trips.txt",
          ["route_id", "service_id", "trip_id", "trip_headsign", "direction_id",
           "shape_id"], trips)
    write("stop_times.txt",
          ["trip_id", "arrival_time", "departure_time", "stop_id", "stop_sequence"], st)

    shapes = []
    for sid, pth in (("RLE_NB", path_nb), ("RLE_SB", path_sb)):
        for i, (lon, lat) in enumerate(pth, 1):
            shapes.append([sid, round(lat, 6), round(lon, 6), i])
    write("shapes.txt",
          ["shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"], shapes)

    write("feed_info.txt",
          ["feed_publisher_name", "feed_publisher_url", "feed_lang",
           "feed_start_date", "feed_end_date", "feed_version", "feed_contact_url"],
          [["Chicago Cityscape (CTA Red Line Extension, frequency model)",
            "https://www.transitchicago.com/rle/", "en",
            20260101, 20261231, "rle-freq-2026-07-10",
            "https://www.transitchicago.com/rle/"]])

    with zipfile.ZipFile(OUTZIP, "w", zipfile.ZIP_DEFLATED) as z:
        for fn in os.listdir(OUTDIR):
            if fn.endswith(".txt"):
                z.write(os.path.join(OUTDIR, fn), fn)
    print(f"stops {len(STATIONS)}  trips {len(trips)}  stop_times {len(st)}  "
          f"bands 10min(07-22)+15min(22-07)  shape pts {len(path)*2}")
    print(f"wrote {OUTDIR}/ and {OUTZIP}")


if __name__ == "__main__":
    main()
