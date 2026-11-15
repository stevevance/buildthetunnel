#!/usr/bin/env python3
"""
Builds the two HyperFrames compositions for the Build the Tunnel video
(Story 9, see brag-plan.md): vertical 1080x1920 and landscape 1920x1080.

Every picture is drawn from the repo's own geometry. No web page is captured.
  - Metra lines and the X1-X4 tunnel routes: planner/data/lines.json
  - The tunnel and its four stations: CLINTON_ROOSEVELT_CONNECTOR in lines.js
  - County outlines: planner/data/metra_counties.geojson

Run from anywhere:  python3 brag-output/2026-11-15-tunnel-rebuild/build.py
It writes vertical/composition/index.html and landscape/composition/index.html.
"""
import json
import math
import os

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))

# ---------------------------------------------------------------- geometry
LON0, LAT0 = -87.633, 41.879            # downtown, the origin of the drawing
KX = math.cos(math.radians(LAT0)) * 111.32   # km per degree of longitude here
KY = 110.574                                  # km per degree of latitude


def xy(lonlat):
    """Longitude and latitude to kilometers east and south of downtown."""
    return ((lonlat[0] - LON0) * KX, -(lonlat[1] - LAT0) * KY)


def path_d(coords):
    """An SVG path through a list of [lon, lat] points, in kilometers."""
    pts = [xy(c) for c in coords]
    return "M" + " L".join("%.3f %.3f" % p for p in pts)


def dash(pts):
    """
    Attributes that hide a line until it is drawn: one dash as long as the line,
    pushed back by its own length. The script pulls the offset to 0 to draw it.
    """
    n = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:])) + 0.01
    return 'data-len="%.3f" style="stroke-dasharray:%.3f %.3f;stroke-dashoffset:%.3f"' % (n, n, n, n)


lines = json.load(open(os.path.join(REPO, "planner", "data", "lines.json")))
METRA = ["BNSF", "ME", "HC", "MD-N", "MD-W", "NCS", "RI", "SWS", "UP-N", "UP-NW", "UP-W"]

# The tunnel object is the first constant in lines.js
src = open(os.path.join(REPO, "lines.js")).read()
start = src.index("const CLINTON_ROOSEVELT_CONNECTOR = ") + len("const CLINTON_ROOSEVELT_CONNECTOR = ")
tunnel, _ = json.JSONDecoder().raw_decode(src[start:])
tunnel_pts = [xy(c) for c in tunnel["line"][::6]] + [xy(tunnel["line"][-1])]

counties = json.load(open(os.path.join(REPO, "planner", "data", "metra_counties.geojson")))

# The four downtown stations are where the Metra lines in lines.json end
TERMINALS = [
    ("ogilvie", "Ogilvie", lines["UP-N"][0][-1]),
    ("union", "Union Station", lines["BNSF"][0][-1]),
    ("lasalle", "LaSalle Street", lines["RI"][0][-1]),
    ("millennium", "Millennium", lines["ME"][0][-1]),
]

# The trip between trains today: Ogilvie east across the Loop to Millennium
og, mi = xy(TERMINALS[0][2]), xy(TERMINALS[3][2])
walk = []
N_WALK = 22
for i in range(N_WALK + 1):
    f = i / N_WALK
    # east along the street first, then north to the station
    leg = abs(mi[0] - og[0]) / (abs(mi[0] - og[0]) + abs(mi[1] - og[1]))
    if f <= leg:
        walk.append((og[0] + (mi[0] - og[0]) * (f / leg), og[1]))
    else:
        walk.append((mi[0], og[1] + (mi[1] - og[1]) * ((f - leg) / (1 - leg))))
walk = walk[1:-1]

# Tunnel routes, drawn north end first so they shoot through downtown
ROUTES = [
    ("X1", "Highland Park to South Chicago", "#d9a8ff"),
    ("X2", "Palatine to South Chicago", "#b983ff"),
    ("X3", "Des Plaines to Harvey", "#f29bff"),
    ("X4", "Winnetka to Blue Island", "#9d7bff"),
]

# Region view: the box around every Metra line
allpts = [xy(c) for k in METRA for p in lines[k] for c in p]
RX0, RX1 = min(p[0] for p in allpts), max(p[0] for p in allpts)
RY0, RY1 = min(p[1] for p in allpts), max(p[1] for p in allpts)
REGION_C = ((RX0 + RX1) / 2, (RY0 + RY1) / 2)
# Downtown view: the box around the tunnel and the four stations
dpts = tunnel_pts + [xy(t[2]) for t in TERMINALS]
DX0, DX1 = min(p[0] for p in dpts), max(p[0] for p in dpts)
DY0, DY1 = min(p[1] for p in dpts), max(p[1] for p in dpts)
DOWNTOWN_C = ((DX0 + DX1) / 2, (DY0 + DY1) / 2)

# ---------------------------------------------------------------- timing (seconds)
BEAT = 0.45           # the track runs at 133 beats a minute; cuts sit on multiples of it
MUSIC_START = 2.455   # a strong beat in the track, so its downbeats land every 1.8 s from 0
T_PUSH = 1.35         # push in from the region to downtown
T_FLARE = 2.25        # the four stations light up
T_WALK = 3.15         # the trip between trains
T_TUNNEL = 5.4        # the tunnel burns across
T_RACE1 = 11.7
T_RACE2 = 17.1
T_END = 22.5
DURATION = 27.45

MUSIC_TITLE = 'Music: "Winter Fusion (Instrumental)" by Aussens@iter, ccMixter (CC BY 3.0)'

# Each race: minutes riding, minutes between trains, minutes riding; then the tunnel trip
RACES = [
    ("r1", "Northwestern to UChicago", [30, 21, 18], 44),
    ("r2", "Arlington Heights to Hyde Park", [40, 17, 18], 60),
]
RACE_SPEED = 0.022    # seconds of video per minute of trip


def build(name, W, H, L):
    """Write one composition. L holds the layout numbers for this frame."""
    k_region = min(L["region_w"] / (RX1 - RX0), L["region_h"] / (RY1 - RY0))
    k_down = min(L["map_w"] / (DX1 - DX0), L["map_h"] / (DY1 - DY0))
    sx, sy = L["map_cx"], L["map_cy"]

    def screen(p, k=k_down, c=DOWNTOWN_C):
        return (sx + (p[0] - c[0]) * k, sy + (p[1] - c[1]) * k)

    svg = []
    # Counties, faint, so the region reads as a place
    for f in counties["features"]:
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            svg.append('<path class="county" d="%sZ"/>' % path_d(poly[0]))
    # Metra lines: a wide soft stroke under a thin bright one
    for cls in ("glow", "core"):
        for k in METRA:
            for p in lines[k]:
                svg.append('<path class="metra %s" %s d="%s"/>' % (cls, dash([xy(c) for c in p]), path_d(p)))
    # Tunnel routes
    for cls in ("glow", "core"):
        for rid, _, color in ROUTES:
            svg.append('<path class="route %s rt-%s" %s stroke="%s" d="%s"/>'
                       % (cls, rid, dash([xy(c) for c in lines[rid][0]]), color, path_d(lines[rid][0][::-1])))
    # The tunnel itself
    tun_d = "M" + " L".join("%.3f %.3f" % p for p in tunnel_pts)
    svg.append('<path class="tunnel glow" %s d="%s"/>' % (dash(tunnel_pts), tun_d))
    svg.append('<path class="tunnel core" %s d="%s"/>' % (dash(tunnel_pts), tun_d))
    # The trip between trains: dots from Ogilvie to Millennium
    for i, p in enumerate(walk):
        svg.append('<circle class="walk" id="walk-%d" cx="%.3f" cy="%.3f"/>' % (i, p[0], p[1]))
    # The four downtown stations
    for tid, _, lonlat in TERMINALS:
        p = xy(lonlat)
        svg.append('<circle class="term-ring" id="ring-%s" cx="%.3f" cy="%.3f"/>' % (tid, p[0], p[1]))
        svg.append('<circle class="term" id="term-%s" cx="%.3f" cy="%.3f"/>' % (tid, p[0], p[1]))
    # The four tunnel stations
    for i, s in enumerate(tunnel["stations"]):
        p = xy(s["lonlat"])
        svg.append('<circle class="ts-ring" id="tsring-%d" cx="%.3f" cy="%.3f"/>' % (i, p[0], p[1]))
        svg.append('<circle class="tstation" id="ts-%d" cx="%.3f" cy="%.3f"/>' % (i, p[0], p[1]))

    # Station names sit in screen space, placed for the downtown view
    labels = []
    for tid, label, lonlat in TERMINALS:
        x, y = screen(xy(lonlat))
        side = "left" if tid in ("ogilvie", "union") else "right"
        if side == "left":
            style = "right:%dpx;top:%dpx;" % (W - x + 26, y - 24)
        else:
            style = "left:%dpx;top:%dpx;" % (x + 26, y - 24)
        labels.append('<div class="tlabel" id="lab-%s" style="%s">%s</div>' % (tid, style, label))


    # Names for the four tunnel stations: left of the line on Clinton, under it on Roosevelt
    for i, st in enumerate(tunnel["stations"]):
        x, y = screen(xy(st["lonlat"]))
        if st["name"] == "Roosevelt":
            style = "left:%dpx;top:%dpx;" % (x - 90, y + 30)
        else:
            style = "right:%dpx;top:%dpx;" % (W - x + 30, y - 24)
        labels.append('<div class="slabel" id="slab-%d" style="%s">%s</div>' % (i, style, st["name"]))

    ppm = L["race_w"] / 75.0   # bar pixels per minute; the longest trip is 75 minutes
    race_html = []
    for rid, title, segs, tun in RACES:
        race_html.append('''  <div class="race" id="%(id)s">
    <div class="race-title">%(title)s</div>
    <div class="race-k">Today</div>
    <div class="bar"><div class="seg ride" id="%(id)s-a"></div><div class="seg wait" id="%(id)s-b"></div><div class="seg ride" id="%(id)s-c"></div></div>
    <div class="race-v" id="%(id)s-today"><b>%(total)d min</b>, 2 transfers</div>
    <div class="race-k tun">With the tunnel</div>
    <div class="bar"><div class="seg tunbar" id="%(id)s-t"></div></div>
    <div class="race-v tun" id="%(id)s-tun"><b>%(tun)d min</b>, one train</div>
    <div class="race-faster" id="%(id)s-faster">%(faster)d minutes faster!</div>
    <div class="race-legend"><span class="sw"></span>Getting between trains downtown</div>
  </div>''' % {"id": rid, "title": title, "total": sum(segs), "tun": tun, "faster": sum(segs) - tun})

    html = TEMPLATE
    subs = {
        "@W@": str(W), "@H@": str(H), "@DURATION@": str(DURATION),
        "@SVG@": "\n      ".join(svg), "@LABELS@": "\n  ".join(labels),
        "@RACES@": "\n".join(race_html),
        "@MUSIC@": MUSIC_TITLE.replace("&", "&amp;"), "@MUSIC_START@": str(MUSIC_START),
        "@TX@": str(L["text_x"]), "@TY@": str(L["text_y"]), "@TW@": str(L["text_w"]),
        "@HEAD@": str(L["head"]), "@SUB@": str(L["sub"]),
        "@RACE_X@": str(L["race_x"]), "@RACE_Y@": str(L["race_y"]), "@RACE_W@": str(L["race_w"]),
        "@END_Y@": str(L["end_y"]), "@URL@": str(L["url"]), "@SHADE@": L["shade"], "@CREDIT_Y@": str(L["credit_y"]),
        "@JS@": json.dumps({
            "sx": sx, "sy": sy, "kRegion": round(k_region, 4), "kDown": round(k_down, 3),
            "regionC": [round(v, 3) for v in REGION_C], "downC": [round(v, 3) for v in DOWNTOWN_C],
            "tunnel": [[round(p[0], 3), round(p[1], 3)] for p in tunnel_pts],
            "stationS": [s["s"] for s in tunnel["stations"]],
            "nWalk": len(walk), "routes": [r[0] for r in ROUTES],
            "terminals": [t[0] for t in TERMINALS],
            "races": [{"id": r[0], "segs": r[2], "tun": r[3]} for r in RACES],
            "ppm": round(ppm, 3), "raceSpeed": RACE_SPEED,
            "t": {"push": T_PUSH, "flare": T_FLARE, "walk": T_WALK, "tunnel": T_TUNNEL,
                  "race1": T_RACE1, "race2": T_RACE2, "end": T_END, "duration": DURATION},
        }),
    }
    for a, b in subs.items():
        html = html.replace(a, b)
    out = os.path.join(HERE, name, "composition")
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, "index.html"), "w").write(html)
    print(name, "k_region=%.2f k_down=%.1f" % (k_region, k_down))


TEMPLATE = r'''<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<style>
@font-face { font-family: 'Inter'; font-weight: 400; src: url('assets/fonts/inter-latin-400-normal.woff2') format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 600; src: url('assets/fonts/inter-latin-600-normal.woff2') format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 800; src: url('assets/fonts/inter-latin-800-normal.woff2') format('woff2'); }
html, body { margin: 0; background: #000; }
#root { position: relative; width: @W@px; height: @H@px; overflow: hidden; background: #000; color: #fff; font-family: 'Inter', sans-serif; }
/* The map. --k is the camera's pixels per kilometer, so strokes keep their width on screen at any zoom */
#map { position: absolute; left: 0; top: 0; width: @W@px; height: @H@px; --k: 1; }
#map path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
#map .county { fill: #08080c; stroke: #23232c; stroke-width: calc(1.5px / var(--k)); }
.metra { stroke: #e9eef5; }
.metra.core { stroke-width: calc(2.6px / var(--k)); }
.metra.glow { stroke-width: calc(9px / var(--k)); opacity: .14; }
.route.core { stroke-width: calc(5px / var(--k)); }
.route.glow { stroke-width: calc(18px / var(--k)); opacity: .28; }
.tunnel { stroke: #c57bff; }
.tunnel.core { stroke-width: calc(9px / var(--k)); stroke: #e3b5ff; }
.tunnel.glow { stroke-width: calc(34px / var(--k)); opacity: .35; }
.walk { r: calc(5px / var(--k)); fill: #fff; opacity: 0; }
.term { r: calc(13px / var(--k)); fill: #ff3b3b; stroke: #000; stroke-width: calc(3px / var(--k)); opacity: 0; }
.term-ring { --rr: 12; r: calc(var(--rr) * 1px / var(--k)); fill: none; stroke: #ff3b3b; stroke-width: calc(4px / var(--k)); opacity: 0; }
.tstation { r: calc(12px / var(--k)); fill: #fff; stroke: #c57bff; stroke-width: calc(6px / var(--k)); opacity: 0; }
.ts-ring { --rr: 12; r: calc(var(--rr) * 1px / var(--k)); fill: none; stroke: #e3b5ff; stroke-width: calc(5px / var(--k)); opacity: 0; }
.slabel { position: absolute; font-size: 30px; font-weight: 800; white-space: nowrap; padding: 5px 12px; border-radius: 8px; color: #1a0b26; background: #e3b5ff; opacity: 0; }
.tlabel { position: absolute; font-size: 34px; font-weight: 800; white-space: nowrap; padding: 6px 12px; border-radius: 8px; background: rgba(0,0,0,.78); opacity: 0; }
/* A dark band behind the type, so lines passing under it don't fight the words */
#shade { position: absolute; left: 0; top: 0; @SHADE@ }
/* Type */
.head { position: absolute; left: @TX@px; top: @TY@px; width: @TW@px; font-size: @HEAD@px; font-weight: 800; line-height: 1.04; letter-spacing: -.025em; opacity: 0; text-shadow: 0 2px 22px #000, 0 0 60px #000; }
.head em { font-style: normal; color: #ff5a5a; }
.head .p { color: #d9a8ff; }
#h1 { opacity: 1; }
.subhead { font-size: @SUB@px; font-weight: 800; color: #d9a8ff; margin-top: 18px; letter-spacing: -.01em; opacity: 0; }
#h3-sub2 { margin-top: 4px; color: #fff; }
#h3-sub3 { margin-top: 4px; color: #b9c0cb; font-size: 36px; }
/* The race: one trip, today against the tunnel. A bar's length is the trip's minutes */
#racepanel { position: absolute; inset: 0; background: rgba(0,0,0,.9); opacity: 0; }
.race { position: absolute; left: @RACE_X@px; top: @RACE_Y@px; width: @RACE_W@px; opacity: 0; }
.race-title { font-size: 64px; font-weight: 800; line-height: 1.05; letter-spacing: -.02em; margin-bottom: 44px; }
.race-k { font-size: 36px; font-weight: 800; color: #b9c0cb; margin: 26px 0 10px; }
.race-k.tun { color: #d9a8ff; }
.bar { display: flex; height: 64px; }
.seg { height: 64px; width: 0; }
.seg.ride { background: #8a919c; }
.seg.wait { background: #ff3b3b; }
.seg.tunbar { background: #c57bff; box-shadow: 0 0 34px rgba(197,123,255,.7); }
.race-v { font-size: 46px; font-weight: 600; margin-top: 12px; opacity: 0; }
.race-v b { font-weight: 800; font-size: 60px; }
.race-v.tun b { color: #d9a8ff; }
.race-faster { font-size: 68px; font-weight: 800; letter-spacing: -.02em; color: #fff; margin-top: 34px; opacity: 0; }
.race-legend { font-size: 30px; font-weight: 600; color: #b9c0cb; margin-top: 46px; }
.race-legend .sw { display: inline-block; width: 26px; height: 26px; background: #ff3b3b; margin-right: 12px; vertical-align: -3px; }
/* End card */
#end { position: absolute; left: @TX@px; top: @END_Y@px; width: @TW@px; }
#end-1 { font-size: 128px; font-weight: 800; line-height: 1; letter-spacing: -.035em; opacity: 0; text-shadow: 0 2px 22px #000, 0 0 60px #000; }
#end-2 { font-size: 36px; font-weight: 800; color: #b9c0cb; margin-top: 36px; opacity: 0; }
#end-url { font-size: @URL@px; font-weight: 800; color: #d9a8ff; margin-top: 8px; opacity: 0; }
#credit { position: absolute; left: @TX@px; top: @CREDIT_Y@px; width: @TW@px; font-size: 28px; line-height: 1.35; color: #d5dae2; background: rgba(0,0,0,.78); padding: 10px 14px; border-radius: 8px; box-sizing: border-box; opacity: 0; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="@DURATION@" data-width="@W@" data-height="@H@">
  <svg id="map" data-layout-allow-overflow viewBox="0 0 @W@ @H@" xmlns="http://www.w3.org/2000/svg">
    <g id="world">
      @SVG@
    </g>
  </svg>
  <div id="shade"></div>
  @LABELS@

  <div class="head" id="h1">Metra's four downtown stations <em>don't connect.</em></div>
  <div class="head" id="h2"><span id="walkmin">21</span> of 69 minutes: getting between trains</div>
  <div class="head" id="h3">3 miles of tunnel <span class="p">fixes that.</span><div class="subhead" id="h3-sub">4 new stations</div><div class="subhead" id="h3-sub2">connecting 10 Metra lines</div><div class="subhead" id="h3-sub3">Change trains at a new station</div></div>

  <div id="racepanel"></div>
@RACES@

  <div id="end">
    <div id="end-1">Build the tunnel.</div>
    <div id="end-2">Plan your own trip:</div>
    <div id="end-url">tunnel.stevevance.net</div>
  </div>
  <div id="credit">CrossTowner is Star:Line Chicago's proposal.<br />@MUSIC@</div>
  <audio id="music" data-timeline-role="music" data-start="0" data-duration="@DURATION@" data-track-index="2" data-volume="0.85" data-fade-in="0.05" data-fade-out="2" data-media-start="@MUSIC_START@" src="assets/music/winter-fusion.mp3"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {};
  const C = @JS@;
  const T = C.t;
  const tl = gsap.timeline({ paused: true });
  const map = document.getElementById("map"), world = document.getElementById("world");

  /*
   * The camera: a center in map kilometers and a zoom in pixels per kilometer.
   * The zoom moves on a log scale so a push from the region to downtown feels even.
   */
  const cam = { x: C.regionC[0], y: C.regionC[1], z: Math.log(C.kRegion) };
  const applyCam = () => {
    const k = Math.exp(cam.z);
    world.setAttribute("transform", "translate(" + C.sx + " " + C.sy + ") scale(" + k + ") translate(" + (-cam.x) + " " + (-cam.y) + ")");
    map.style.setProperty("--k", k);
  };
  applyCam();
  const REGION = { x: C.regionC[0], y: C.regionC[1], z: Math.log(C.kRegion) };
  const DOWN = { x: C.downC[0], y: C.downC[1], z: Math.log(C.kDown) };
  const camTo = (view, at, duration, ease) => tl.to(cam, { x: view.x, y: view.y, z: view.z, duration: duration, ease: ease || "power3.inOut", onUpdate: applyCam }, at);
  // Short helpers, each naming the visible end state so any seek lands right
  const show = (sel, at, d) => tl.fromTo(sel, { opacity: 0 }, { opacity: 1, duration: d || .2 }, at);
  const rise = (sel, at) => tl.fromTo(sel, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .25, ease: "power2.out" }, at);
  const hide = (sel, at, d) => tl.to(sel, { opacity: 0, duration: d || .15 }, at);
  // A line's own length, for drawing it in: the dash offset runs from this to 0
  const len = f => (i, el) => el.dataset.len * (f || 1);

  // 0 s: the region. Every Metra line draws in from the suburbs and stops downtown
  tl.fromTo(".metra", { strokeDashoffset: len(.6) }, { strokeDashoffset: 0, duration: 1.15, ease: "power1.in" }, 0);
  // Push in: the lines end at four separate stations
  camTo(DOWN, T.push, .8);
  C.terminals.forEach((id, i) => {
    const at = T.flare + i * .15;
    tl.fromTo("#term-" + id, { opacity: 0 }, { opacity: 1, duration: .1 }, at);
    tl.fromTo("#ring-" + id, { opacity: 1, "--rr": 12 }, { opacity: 0, "--rr": 70, duration: .6, ease: "power2.out", immediateRender: false }, at);
    rise("#lab-" + id, at);
  });

  // The trip between trains: dots cross the Loop from Ogilvie to Millennium while the minutes count
  hide("#h1", T.walk - .1);
  rise("#h2", T.walk);
  for (let i = 0; i < C.nWalk; i++) {
    tl.fromTo("#walk-" + i, { opacity: 0 }, { opacity: 1, duration: .08 }, T.walk + .15 + i * (1.5 / C.nWalk));
  }
  const walkMin = { v: 0 }, walkEl = document.getElementById("walkmin");
  tl.fromTo(walkMin, { v: 0 }, { v: 21, duration: 1.5, ease: "none", onUpdate: () => { walkEl.textContent = Math.round(walkMin.v); } }, T.walk + .15);

  // The tunnel burns from the Metra Electric to the Union Pacific tracks; each station pops as the line reaches it
  hide("#h2,.walk,#lab-ogilvie,#lab-union", T.tunnel - .1);
  rise("#h3", T.tunnel);
  const BURN = 2.1;
  tl.fromTo(".tunnel", { strokeDashoffset: len() }, { strokeDashoffset: 0, duration: BURN, ease: "none" }, T.tunnel + .1);
  C.stationS.forEach((s, i) => {
    tl.fromTo("#ts-" + i, { opacity: 0, scale: 2.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: .3, ease: "back.out(2)" }, T.tunnel + .1 + s * BURN);
  });
  rise("#h3-sub", T.tunnel + .1 + BURN);
  rise("#h3-sub2", T.tunnel + .1 + BURN + .55);
  /*
   * The four new stations are where riders change trains: name them and pulse
   * a ring out of each, twice, as the line about changing trains lands.
   */
  const XFER = T.tunnel + .1 + BURN + 1.1;
  rise("#h3-sub3", XFER);
  C.stationS.forEach((s, i) => {
    rise("#slab-" + i, XFER + i * .1);
    [0, .9, 1.8].forEach(d => {
      tl.fromTo("#tsring-" + i, { opacity: 1, "--rr": 12 }, { opacity: 0, "--rr": 64, duration: .7, ease: "power2.out", immediateRender: false }, XFER + i * .1 + d);
    });
  });


  /*
   * The race. Both bars grow at the same speed per minute of trip, so the
   * shorter trip finishes first. The red part is the time between trains.
   */
  hide("#h3,.tlabel,.slabel,.term,.tstation", T.race1 - .1);
  show("#racepanel", T.race1 - .1, .2);
  camTo(REGION, T.race1 + .5, .1, "none");   // behind the race panel, so the move isn't seen
  [T.race1, T.race2].forEach((t0, n) => {
    const r = C.races[n], R = "#" + r.id;
    show(R, t0, .15);
    let at = t0 + .3;
    ["a", "b", "c"].forEach((key, j) => {
      const d = r.segs[j] * C.raceSpeed;
      tl.fromTo(R + "-" + key, { width: 0 }, { width: r.segs[j] * C.ppm, duration: d, ease: "none" }, at);
      at += d;
    });
    show(R + "-today", at, .15);
    const dt = r.tun * C.raceSpeed;
    tl.fromTo(R + "-t", { width: 0 }, { width: r.tun * C.ppm, duration: dt, ease: "none" }, t0 + .3);
    show(R + "-tun", t0 + .3 + dt, .15);
    // How much faster, once both bars have finished
    rise(R + "-faster", at + .35);
    hide(R, (n === 0 ? T.race2 : T.end) - .15);
  });


  // End card: the region with every line and every tunnel route lit
  hide("#racepanel", T.end - .1, .2);
  C.routes.forEach((id, i) => {
    tl.fromTo(".rt-" + id, { strokeDashoffset: len() }, { strokeDashoffset: 0, duration: .9, ease: "power2.inOut" }, T.end + .1 + i * .15);
  });
  camTo(REGION, T.end, .6);
  rise("#end-1", T.end + .3);
  rise("#end-2", T.end + 1.0);
  rise("#end-url", T.end + 1.0);
  show("#credit", T.end + .4, .3);
  tl.to({}, { duration: .01 }, T.duration - .01);
  window.__timelines["main"] = tl;
</script>
</body>
</html>
'''

# Vertical: type on top (below Instagram's top band), the map under it, credits above the caption area
build("vertical", 1080, 1920, {
    "map_cx": 540, "map_cy": 1070, "map_w": 800, "map_h": 800, "region_w": 940, "region_h": 1040,
    "text_x": 70, "text_y": 270, "text_w": 940, "head": 84, "sub": 46,
    "race_x": 70, "race_y": 330, "race_w": 900,
    "end_y": 290, "credit_y": 1380, "url": 58,
    "shade": "width: 1080px; height: 760px; background: linear-gradient(180deg, #000 0%, rgba(0,0,0,.82) 70%, rgba(0,0,0,0) 100%);",
})
# Landscape: type in a left column, the map on the right
build("landscape", 1920, 1080, {
    "map_cx": 1400, "map_cy": 540, "map_w": 880, "map_h": 900, "region_w": 900, "region_h": 980,
    "text_x": 90, "text_y": 130, "text_w": 820, "head": 78, "sub": 44,
    "race_x": 260, "race_y": 120, "race_w": 1400,
    "end_y": 250, "credit_y": 900, "url": 54,
    "shade": "width: 1300px; height: 1080px; background: linear-gradient(90deg, #000 0%, rgba(0,0,0,.9) 68%, rgba(0,0,0,0) 100%);",
})
