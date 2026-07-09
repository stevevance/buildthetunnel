#!/usr/bin/env python3
"""
Extract GTFS-generator inputs directly from Scott's Google My Maps KML
("CrossTowner Regional Rail - System Diagram.kml", in ../data/), so the
whole pipeline is reproducible from files in this repository:

  1. data/xroute_lines.tsv  — X1-X6 alignments as GeoJSON LineStrings
     (consumed by build_gtfs_from_skeletons.py for shapes.txt)
  2. verifies every station coordinate in data/ct_stations.tsv against the
     KML's point placemarks and reports the worst deviation, so the station
     extract's provenance is checkable without any database access.

Usage: python3 kml_to_inputs.py
"""
import json, math, os, re
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
KML = os.path.join(HERE, "..", "data", "CrossTowner Regional Rail - System Diagram.kml")
NS = {"k": "http://www.opengis.net/kml/2.2"}


def parse_coords(text):
    """KML coordinates: 'lon,lat[,alt] lon,lat[,alt] ...' -> [[lon, lat], ...]"""
    out = []
    for tok in text.strip().split():
        lon, lat = tok.split(",")[:2]
        out.append([round(float(lon), 6), round(float(lat), 6)])
    return out


def main():
    root = ET.parse(KML).getroot()

    # 1. X-route alignments
    lines = {}
    for pm in root.iter("{http://www.opengis.net/kml/2.2}Placemark"):
        name = pm.find("k:name", NS)
        ls = pm.find(".//k:LineString/k:coordinates", NS)
        if name is None or ls is None:
            continue
        m = re.search(r"CrossTowner (X[1-6])\b", name.text or "")
        if m:
            lines[m.group(1)] = parse_coords(ls.text)
    out = os.path.join(HERE, "data", "xroute_lines.tsv")
    with open(out, "w") as f:
        for rid in sorted(lines):
            f.write(rid + "\t" + json.dumps(
                {"type": "LineString", "coordinates": lines[rid]}) + "\n")
    print(f"wrote {out}: " + ", ".join(f"{r}({len(c)} pts)" for r, c in sorted(lines.items())))

    # 2. Verify ct_stations.tsv against KML point placemarks
    kml_pts = []
    for pm in root.iter("{http://www.opengis.net/kml/2.2}Placemark"):
        pt = pm.find(".//k:Point/k:coordinates", NS)
        if pt is not None:
            kml_pts.append(parse_coords(pt.text)[0])
    worst = 0.0
    n = 0
    with open(os.path.join(HERE, "data", "ct_stations.tsv")) as f:
        for line in f:
            slug, name, lat, lon = line.rstrip("\n").split("\t")
            lat, lon = float(lat), float(lon)
            d = min(math.hypot((lon - p[0]) * 69 * math.cos(math.radians(lat)),
                               (lat - p[1]) * 69) for p in kml_pts)
            worst = max(worst, d)
            n += 1
    print(f"verified {n} stations against {len(kml_pts)} KML points; "
          f"worst deviation {worst * 5280:.0f} ft")


if __name__ == "__main__":
    main()
