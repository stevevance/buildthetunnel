#!/usr/bin/env python3
"""
Build a scheduled GTFS feed for the CrossTowner X1-X6 routes from Scott's
clockface skeleton timetables in "CrossTowner Schedules.xlsx".

How the skeleton works:
  - Worksheets "CRCL Plan - NB Skeleton" / "CRCL Plan - SB Skeleton"
  - Column A = station name; every other column = one trip
  - Header row = route name (X1..X6, plus UP-N / UP-NW locals which we SKIP,
    because the real Metra GTFS in the scenario folder already provides them)
  - Cell values are clock offsets within a repeating one-hour cycle;
    each route appears twice per direction = 30-minute headways
  - "--" = not on route, arrow = express pass (no stop) -> both mean "no stop_time"

We materialize the cycle hourly with anchors 05:00 through 21:00, so service
runs ~5:00 am to ~11:30 pm (last trips end ~2h23m after the 21:00 anchor).
Stop sequence per trip = cells sorted by time, so the sheet's branch-block row
order never matters.

Station coordinates come from data/ct_stations.tsv (the 294 station points
digitized from Star:Line's Google My Maps KML export), falling back to
data/metra_stops.txt (Metra GTFS stops). ALIASES pins the 9 names that don't
match automatically.

Usage:  python3 build_gtfs_from_skeletons.py
Output: crosstowner_xroutes_gtfs/*.txt  +  crosstowner-xroutes-gtfs.zip
"""
import csv, math, os, re, sys, zipfile
from datetime import time as dtime
import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
XLSX = os.path.join(HERE, "CrossTowner Schedules.xlsx")
OUTDIR = os.path.join(HERE, "crosstowner_xroutes_gtfs")
OUTZIP = os.path.join(HERE, "crosstowner-xroutes-gtfs.zip")

ROUTES = {
    "X1": "Highland Park to 93rd/South Chicago, every 30 minutes via tunnel",
    "X2": "Palatine to 93rd/South Chicago, every 30 minutes via tunnel",
    "X3": "Des Plaines to Harvey, every 30 minutes via tunnel",
    "X4": "Winnetka to 115th (Kensington) and Blue Island, every 30 minutes via tunnel",
    "X5": "Downers Grove-Main St to O'Hare Transfer, every 30 minutes via Union Station Riverside",
    "X6": "Elmhurst to Auburn Park and Blue Island, every 30 minutes via Union Station Riverside",
}

# Sheet station name -> station slug in data/ct_stations.tsv, for names the
# normalizer can't match on its own.
ALIASES = {
    '35th ("Lou" Jones)': "crosstownerstation-35th-street-lou-jones",
    "95th-Chicago State": "crosstownerstation-95th-chicago-state-university",
    "Central/Green Bay (Evanston)": "crosstownerstation-evanston-central-st",
    "Cicero/Lake": "crosstownerstation-cicero-kinzie",
    "Davis St (Evanston)": "crosstownerstation-evanston-davis-st",
    "Elmwood Park - Conti Cir": "crosstownerstation-elmwood-park-conti-circle",
    "Halsted/16th": "crosstownerstation-halsted-18th",
    "Irving Park/Keeler": "crosstownerstation-irving-park",
    "Western/Hubbard": "crosstownerstation-western-kinzie",
}

# Anchor hours for the repeating cycle: trips leave their origins between
# 5:00 am and 9:59 pm; the second column-set per route is already +30 min.
CYCLE_HOURS = range(5, 22)


def norm_loose(s):
    """Normalize a station name, DROPPING parentheticals. Ambiguous for
    Chicago's numbered streets, which repeat across parallel lines."""
    s = s.lower().strip()
    s = re.sub(r"\(.*?\)", "", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    s = re.sub(r"\b(st|street|ave|avenue|rd|road|blvd)\b", "", s)
    return re.sub(r"\s+", " ", s).strip()


def norm_full(s):
    """Normalize KEEPING parenthetical words: '83rd (Avalon Park)' and
    '83rd Street' stay distinct."""
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    s = re.sub(r"\b(st|street|ave|avenue|rd|road|blvd)\b", "", s)
    return re.sub(r"\s+", " ", s).strip()


def pt_seg_miles(p, a, b):
    """Distance in miles from point p to segment a-b (all (lat, lon))."""
    ky = 69.0
    kx = 69.0 * math.cos(math.radians(p[0]))
    px, py = (p[1] - a[1]) * kx, (p[0] - a[0]) * ky
    bx, by = (b[1] - a[1]) * kx, (b[0] - a[0]) * ky
    L2 = bx * bx + by * by
    t = 0 if L2 == 0 else max(0, min(1, (px * bx + py * by) / L2))
    return math.hypot(px - t * bx, py - t * by)


def dist_to_alignment(p, aln):
    """Distance in miles from point p (lat, lon) to alignment [[lon,lat],...]."""
    return min(pt_seg_miles(p, (aln[i][1], aln[i][0]), (aln[i + 1][1], aln[i + 1][0]))
               for i in range(len(aln) - 1))


def load_stations():
    """slug -> (lat, lon), plus name-candidate multimaps (full and loose norms).
    CrossTowner stations first, Metra GTFS stops as fallback."""
    coords, by_full, by_loose = {}, {}, {}
    def add(slug, name):
        by_full.setdefault(norm_full(name), []).append(slug)
        by_loose.setdefault(norm_loose(name), []).append(slug)
    with open(os.path.join(HERE, "data", "ct_stations.tsv")) as f:
        for line in f:
            slug, name, lat, lon = line.rstrip("\n").split("\t")
            coords[slug] = (float(lat), float(lon))
            add(slug, name)
    with open(os.path.join(HERE, "data", "metra_stops.txt")) as f:
        for r in csv.DictReader(f, skipinitialspace=True):
            r = {k.strip(): (v or "").strip() for k, v in r.items()}
            slug = "metra-" + r["stop_id"].lower()
            coords[slug] = (float(r["stop_lat"]), float(r["stop_lon"]))
            add(slug, name := r["stop_name"])
    return coords, by_full, by_loose


def load_alignments():
    """route id -> [[lon, lat], ...] from the KML-derived alignment extract."""
    import json
    lines = {}
    path = os.path.join(HERE, "data", "xroute_lines.tsv")
    if not os.path.exists(path):
        return lines
    with open(path) as f:
        for row in f:
            rid, gj = row.rstrip("\n").split("\t")
            lines[rid] = json.loads(gj)["coordinates"]
    return lines


def cell_seconds(v):
    """Convert a skeleton cell to seconds-into-cycle, or None if not a stop."""
    if v is None:
        return None
    if isinstance(v, dtime):
        return v.hour * 3600 + v.minute * 60 + v.second
    s = str(v).strip()
    m = re.fullmatch(r"(\d{1,2}):(\d{2}):(\d{2})", s)
    if m:
        return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + int(m.group(3))
    return None  # '--', arrow, 'n/a', blanks


def hms(seconds):
    return f"{seconds//3600:02d}:{seconds%3600//60:02d}:{seconds%60:02d}"


def miles(a, b):
    dy = (a[0] - b[0]) * 69.0
    dx = (a[1] - b[1]) * 69.0 * math.cos(math.radians(a[0]))
    return math.hypot(dx, dy)


def main():
    coords, by_full, by_loose = load_stations()
    wb = openpyxl.load_workbook(XLSX, data_only=True)

    used_stops, trips, stop_times, problems = {}, [], [], []
    alignments, shapes = load_alignments(), {}
    coords_of = lambda slug: coords[slug]

    """
    X3's drawn alignment ends at Des Plaines, but Scott's skeleton schedules
    the route through to Arlington Park (the KML route description calls this
    the event extension). Splice the UP-NW segment out of X2's alignment so
    X3's shape covers its full scheduled run.
    """
    dp, ap = coords.get("crosstownerstation-des-plaines"), coords.get("crosstownerstation-arlington-park")
    if dp and ap and "X2" in alignments and "X3" in alignments:
        x2, x3 = alignments["X2"], alignments["X3"]
        near = lambda aln, pt: min(range(len(aln)),
                                   key=lambda i: (aln[i][1] - pt[0]) ** 2 + (aln[i][0] - pt[1]) ** 2)
        i1, i2 = near(x2, dp), near(x2, ap)
        seg = x2[min(i1, i2):max(i1, i2) + 1]
        if i1 > i2:
            seg = list(reversed(seg))  # order the splice Des Plaines -> Arlington Park
        d_start = miles((x3[0][1], x3[0][0]), dp)
        d_end = miles((x3[-1][1], x3[-1][0]), dp)
        alignments["X3"] = (list(reversed(seg)) + x3) if d_start < d_end else (x3 + seg)
    match_report = {}  # (sheet name, route) -> (slug, resolution, mi_to_alignment)

    def resolve(name, route):
        """Match a skeleton station name to a stop, disambiguating repeated
        numbered-street names by distance to the route's own alignment."""
        aln = alignments.get(route)
        if name in ALIASES:
            cands, how = [ALIASES[name]], "alias"
        elif norm_full(name) in by_full:
            cands, how = by_full[norm_full(name)], "full-name"
        elif norm_loose(name) in by_loose:
            cands, how = by_loose[norm_loose(name)], "loose-name"
        else:
            return None
        if len(cands) > 1 and aln:
            cands = sorted(cands, key=lambda c: dist_to_alignment(coords[c], aln))
            how += f"+nearest-of-{len(cands)}"
        slug = cands[0]
        d = round(dist_to_alignment(coords[slug], aln), 2) if aln else None
        match_report[(name, route)] = (slug, how, d)
        return slug

    for sheet, direction in (("CRCL Plan - NB Skeleton", 0), ("CRCL Plan - SB Skeleton", 1)):
        rows = list(wb[sheet].iter_rows(values_only=True))
        header = [str(h).strip() if h else "" for h in rows[0]]
        # Each trip column: (column index, route, occurrence index for trip ids)
        seen = {}
        for j, route in enumerate(header):
            if route not in ROUTES:
                continue  # skips 'Station', UP-N, UP-NW
            seen[route] = seen.get(route, 0) + 1
            colset = seen[route]

            # Collect (seconds, slug) for every timed cell in this column
            pattern = []
            for r in rows[1:]:
                name = str(r[0]).strip() if r[0] else ""
                if not name or name == "Total Run Time":
                    continue
                secs = cell_seconds(r[j]) if j < len(r) else None
                if secs is None:
                    continue
                slug = resolve(name, route)
                if not slug:
                    problems.append(f"UNMATCHED station: {name!r} ({sheet})")
                    continue
                used_stops[slug] = name
                pattern.append((secs, slug))
            if not pattern:
                continue
            pattern.sort()

            # Sanity 1: adjacent stops shouldn't be far apart
            for (s1, a), (s2, b) in zip(pattern, pattern[1:]):
                d = miles(coords[a], coords[b])
                if d > 6:
                    problems.append(
                        f"GAP {d:.1f} mi on {route} dir{direction} set{colset}: {a} -> {b}")
            # Sanity 2: every stop should sit close to the route alignment
            if route in alignments:
                for _, slug in pattern:
                    d = dist_to_alignment(coords[slug], alignments[route])
                    if d > 0.5:
                        problems.append(
                            f"OFF-ALIGNMENT {d:.2f} mi on {route}: {slug}")

            # Headsign = the trip's final stop, so the two directions are
            # distinguishable in viewers and trip planners
            headsign = used_stops[pattern[-1][1]]

            """
            Shape: the KML alignment for this route, oriented to match this
            direction of travel. Orientation test: whichever pattern terminus
            is nearer the alignment's first vertex is treated as the start;
            if that's the trip's LAST stop, the alignment is reversed.
            """
            shape_id = ""
            if route in alignments:
                aln = alignments[route]
                first = aln[0]
                d_first = miles(coords_of(pattern[0][1]), (first[1], first[0]))
                d_last = miles(coords_of(pattern[-1][1]), (first[1], first[0]))
                oriented = aln if d_first <= d_last else list(reversed(aln))
                shape_id = f"{route}_{'NB' if direction == 0 else 'SB'}"
                if shape_id not in shapes:
                    shapes[shape_id] = oriented

            # Materialize one trip per cycle hour
            for h in CYCLE_HOURS:
                trip_id = f"{route}_{'NB' if direction == 0 else 'SB'}_{colset}_{h:02d}00"
                trips.append((route, "DAILY", trip_id, headsign, direction, shape_id))
                for seq, (secs, slug) in enumerate(pattern, start=1):
                    t = hms(h * 3600 + secs)
                    stop_times.append((trip_id, t, t, slug, seq))

    if any(p.startswith("UNMATCHED") for p in problems):
        for p in problems:
            print("!!", p)
        sys.exit("Unmatched stations -- fix ALIASES and rerun.")
    for p in problems:
        print("warning:", p)

    os.makedirs(OUTDIR, exist_ok=True)

    def write(fname, header, rows_):
        with open(os.path.join(OUTDIR, fname), "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(header)
            w.writerows(rows_)

    write("agency.txt",
          ["agency_id", "agency_name", "agency_url", "agency_timezone"],
          [["CROSSTOWNER", "CrossTowner Regional Rail (proposed)",
            "https://buildthetunnelchicago.org", "America/Chicago"]])
    write("routes.txt",
          ["route_id", "agency_id", "route_short_name", "route_long_name", "route_type"],
          [[rid, "CROSSTOWNER", rid, desc, 2] for rid, desc in ROUTES.items()])
    write("feed_info.txt",
          ["feed_publisher_name", "feed_publisher_url", "feed_lang",
           "feed_start_date", "feed_end_date", "feed_version", "feed_contact_url"],
          [["Chicago Cityscape (schedule by Star:Line Chicago, proposed service)",
            "https://buildthetunnelchicago.org", "en",
            20260101, 20261231, "crcl-plan-skeleton-2026-07-08",
            "https://buildthetunnelchicago.org"]])
    write("calendar.txt",
          ["service_id", "monday", "tuesday", "wednesday", "thursday", "friday",
           "saturday", "sunday", "start_date", "end_date"],
          [["DAILY", 1, 1, 1, 1, 1, 1, 1, 20260101, 20261231]])
    write("stops.txt",
          ["stop_id", "stop_name", "stop_lat", "stop_lon"],
          [[slug, name, coords[slug][0], coords[slug][1]]
           for slug, name in sorted(used_stops.items())])
    write("trips.txt",
          ["route_id", "service_id", "trip_id", "trip_headsign", "direction_id",
           "shape_id"], trips)
    write("shapes.txt",
          ["shape_id", "shape_pt_lat", "shape_pt_lon", "shape_pt_sequence"],
          [[sid, pt[1], pt[0], i]
           for sid, pts in sorted(shapes.items())
           for i, pt in enumerate(pts, start=1)])
    write("stop_times.txt",
          ["trip_id", "arrival_time", "departure_time", "stop_id", "stop_sequence"],
          stop_times)

    with zipfile.ZipFile(OUTZIP, "w", zipfile.ZIP_DEFLATED) as z:
        for fname in os.listdir(OUTDIR):
            if fname.endswith(".txt"):
                z.write(os.path.join(OUTDIR, fname), fname)

    with open(os.path.join(HERE, "station_match_report.csv"), "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["sheet_name", "route", "stop_id", "match_method", "mi_to_alignment"])
        for (nm, rt), (slug, how, d) in sorted(match_report.items()):
            w.writerow([nm, rt, slug, how, d])
    print(f"stops: {len(used_stops)}  trips: {len(trips)}  stop_times: {len(stop_times)}")
    print(f"wrote {OUTDIR}/ and {OUTZIP}")


if __name__ == "__main__":
    main()
