/*
 * app.js -- CrossTowner trip planner (static, client-side).
 *
 * Flow:
 *   1. The user types an origin and destination address; each is geocoded via
 *      the Worker's Geocode.earth proxy and validated to be inside a
 *      Metra-service county.
 *   2. Each endpoint's walk to the stations around it is routed on the street
 *      network (prebuilt OpenStreetMap tiles; see "walking on the street
 *      network" below).
 *   3. For a chosen departure slice we look up the precomputed station-to-
 *      station minutes from those stations for both the "today" and "scenario"
 *      networks, add the walking access/egress, and show the best total for
 *      each -- so the rider sees today vs CrossTowner.
 *
 * Transit routing is precomputed; this file does the walking (a small
 * Dijkstra over street tiles), geometry and lookups.
 */
(function () {
  "use strict";
  var CFG = window.PLANNER_CONFIG;

  /* ---- small helpers ---------------------------------------------------- */

  // Great-circle distance in kilometres.
  function haversineKm(aLat, aLon, bLat, bLon) {
    var R = 6371, r = Math.PI / 180;
    var dLat = (bLat - aLat) * r, dLon = (bLon - aLon) * r;
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(aLat * r) * Math.cos(bLat * r) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  // Walking minutes for a straight-line distance, with the street detour fudge.
  function walkMinutes(km) {
    return (km * CFG.detourFactor) / CFG.walkSpeedKmh * 60;
  }

  // Ray-casting point-in-polygon for one ring ([[lon,lat],...]).
  function pointInRing(lon, lat, ring) {
    var inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var xi = ring[i][0], yi = ring[i][1];
      var xj = ring[j][0], yj = ring[j][1];
      var hit = ((yi > lat) !== (yj > lat)) &&
                (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (hit) inside = !inside;
    }
    return inside;
  }

  // Is a point inside any polygon of the county FeatureCollection?
  function pointInCounties(lon, lat, fc) {
    for (var f = 0; f < fc.features.length; f++) {
      var g = fc.features[f].geometry;
      var polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
      for (var p = 0; p < polys.length; p++) {
        // polys[p][0] is the outer ring; [1..] are holes (ignored -- counties
        // have no interior exclaves relevant here).
        if (pointInRing(lon, lat, polys[p][0])) return true;
      }
    }
    return false;
  }

  function fmtMin(m) { return Math.round(m) + " min"; }

  /* ---- state ------------------------------------------------------------ */
  var stations = [];          // [{id,name,lat,lon,exists_today,on_*,wheelchair}]
  var counties = null;        // county FeatureCollection
  var shardCache = {};        // "net/slice/oid" -> {destId: minutes}
  var LINES = null;           // { "Red": [[[lon,lat],...]], ... } rail-line geometry
  var MMF_WALK = null;        // [[lat,lon],...] sidewalk: O'Hare Transfer <-> MMF
  var SSL = null;             // South Shore Line graft (see data/southshore.json)
  var MATRIX_WALKED = false;  // manifest says the cells itemize their walking
  var stationsByName = {};    // station name -> [stations]; six names (Berwyn,
                              // Bryn Mawr, Cumberland, Harvey, Racine,
                              // Rosemont) belong to two stations each
  var stationById = {};       // station id -> station (for airport egress lookup)
  var endpoints = { from: null, to: null };  // {lat,lon,label}
  var map, fromMarker, toMarker, routeLayer;

  /* ---- data loading ----------------------------------------------------- */
  // Static-data URL with the build stamp attached, so the station list and the
  // matrix shards are cached and invalidated as one set (see CFG.dataVersion).
  function dataURL(rel) {
    return CFG.dataBase + rel + (CFG.dataVersion ? "?v=" + encodeURIComponent(CFG.dataVersion) : "");
  }

  function loadJSON(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error("fetch " + path + " -> " + r.status);
      return r.json();
    });
  }

  /* ---- geocoding via the Worker proxy ----------------------------------- */
  function geocode(text) {
    var url = CFG.workerBase + "/geocode?text=" + encodeURIComponent(text);
    return loadJSON(url);
  }

  // Some geocoder results land far from any usable station (e.g. a large campus
  // resolves to a centroid beyond the walk cap). Snap known ones onto the
  // station that actually serves them, so the trip routes. Matched on the result
  // label; returns a possibly-rewritten {lat,lon,label}. O'Hare is handled
  // separately (see OHARE below) — it needs a per-terminal choice, not a snap.
  var GEOCODE_SNAP = [];
  function snapGeocode(ep) {
    if (!ep || !ep.label) return ep;
    for (var i = 0; i < GEOCODE_SNAP.length; i++) {
      if (GEOCODE_SNAP[i].test.test(ep.label)) {
        return { lat: GEOCODE_SNAP[i].lat, lon: GEOCODE_SNAP[i].lon, label: GEOCODE_SNAP[i].label };
      }
    }
    return ep;
  }

  /* ---- O'Hare terminals -------------------------------------------------- */
  // O'Hare's terminals aren't rail stations. Two rail nodes serve them: the Blue
  // Line "O'Hare" (in the terminal core) and Metra/CrossTowner "O'Hare Transfer"
  // (at the Multi-Modal Facility, one end of the ATS people mover). When a rider
  // picks a terminal we route to BOTH stations and add a fixed *egress* time to
  // reach the chosen terminal, letting each network use whichever station it can
  // reach — Blue Line today, CrossTowner in the scenario. That's a fairer
  // comparison than snapping every airport trip onto one station.
  //
  // Egress minutes = ATS wait (~half the 3-5 min headway) + ride (~2.5 min per
  // hop over the T1-T2-T3-T5-MMF line; 10 min end-to-end per the CDA) + platform
  // walk. Terminal-core walks are manual estimates (T2 = 5 min, others scaled).
  // These are debatable — see methodology.html — and easy to tune here.
  var OHARE_STATIONS = { blue: "o-hare-1b3d", transfer: "o-hare-transfer-1b71" };
  var OHARE_DEFAULT = "t1";
  var OHARE = {
    order: ["t1", "t2", "t3", "t5", "mmf"],
    // lat/lon are the terminals' ATS-station coordinates (from OSM), so the map
    // marker sits on the people-mover guideway. Egress minutes are estimates.
    terminals: {
      t1:  { short: "Terminal 1",           label: "O'Hare — Terminal 1",
             lat: 41.97927, lon: -87.90555, egress: { blue: 9,  transfer: 13 } },
      t2:  { short: "Terminal 2",           label: "O'Hare — Terminal 2",
             lat: 41.97732, lon: -87.90496, egress: { blue: 5,  transfer: 11 } },
      t3:  { short: "Terminal 3",           label: "O'Hare — Terminal 3",
             lat: 41.97712, lon: -87.90184, egress: { blue: 8,  transfer: 9  } },
      t5:  { short: "Terminal 5",           label: "O'Hare — Terminal 5",
             lat: 41.97497, lon: -87.89024, egress: { blue: 12, transfer: 6  } },
      mmf: { short: "MMF / O'Hare Transfer", label: "O'Hare — MMF / Transfer",
             lat: 41.99294, lon: -87.88234, egress: { blue: 14, transfer: 3  } }
    }
  };
  function isOhare(label) { return !!label && /o[\W_]?hare/i.test(label); }

  // How you cover an O'Hare egress/access hop: on foot or on the ATS people
  // mover. The Blue Line drops you in the terminal core (walk to T1/T2/T3; ATS
  // out to T5/MMF); O'Hare Transfer sits at the MMF (walk to the MMF; ATS in to
  // the terminals). stationKey is "blue" or "transfer".
  function ohareHopMode(stationKey, terminalKey) {
    if (stationKey === "blue") return (terminalKey === "t5" || terminalKey === "mmf") ? "ats" : "walk";
    return (terminalKey === "mmf") ? "walk" : "ats";
  }
  // "blue"/"transfer" for an O'Hare rail station id, else null.
  function ohareStationKey(id) {
    if (id === OHARE_STATIONS.blue) return "blue";
    if (id === OHARE_STATIONS.transfer) return "transfer";
    return null;
  }

  // Turn an endpoint into an O'Hare-terminal endpoint and (re)draw its picker.
  function setOhareEndpoint(which, key) {
    if (!OHARE.terminals[key]) key = OHARE_DEFAULT;
    var t = OHARE.terminals[key];
    setEndpoint(which, { lat: t.lat, lon: t.lon, label: t.label, airport: key });
    renderTerminalPicker(which);
  }

  // Render the "which O'Hare destination?" dropdown next to a field, or clear it
  // when the endpoint isn't an airport one.
  function renderTerminalPicker(which) {
    var box = document.getElementById(which + "-terminal");
    if (!box) return;
    var ep = endpoints[which];
    if (!ep || !ep.airport) { box.innerHTML = ""; return; }
    var opts = OHARE.order.map(function (k) {
      return '<option value="' + k + '"' + (k === ep.airport ? " selected" : "") + '>' +
        OHARE.terminals[k].short + "</option>";
    }).join("");
    box.innerHTML = '<label class="form-label small fw-semibold text-uppercase text-secondary mb-1">' +
      "Which O'Hare destination?</label>" +
      '<select class="form-select form-select-sm">' + opts + "</select>";
    box.querySelector("select").addEventListener("change", function () {
      setOhareEndpoint(which, this.value);
      if (endpoints.from && endpoints.to) onPlan();
    });
  }

  /* ---- South Shore Line (NICTD) graft ----------------------------------- */
  // The South Shore Line isn't in the precomputed matrix — it runs east into
  // Indiana, outside the Metra-county grid the matrices cover. Instead we
  // *graft* it on: a rider reaches one of a few hub stations that both the
  // CrossTowner/Metra network AND the South Shore serve (primary: 55th-56th-
  // 57th St., plus the downtown Metra Electric stops), transfers, and rides the
  // South Shore the rest of the way. So a South Shore trip = matrix time to a
  // hub + transfer + a South Shore leg whose in-vehicle minutes and headway
  // come straight from NICTD's GTFS. CrossTowner never speeds up the South
  // Shore itself — only how fast you reach the hub — which is exactly what the
  // today-vs-scenario comparison then shows. See data/southshore.json.
  var SSL_SNAP_KM = 4.0;   // treat an endpoint this close to a South Shore-only
                           // station as *being* that station (regional park-and-
                           // rides, reached by car/bus — a walk cap is moot).

  function initSSL(data) {
    if (!data) return;
    SSL = data;
    SSL.byId = {}; SSL.byName = {};
    (SSL.stations || []).forEach(function (s) { SSL.byId[s.ssl] = s; SSL.byName[s.name] = s; });
    if (SSL.shape && LINES) {                    // clippable geometry for the map;
      // keep the main line and the Monon branch separate so a branch trip can
      // trace hub -> Hammond on the main line, then Hammond -> station on Monon.
      if (SSL.shape.lakeshore) LINES.SSL = [SSL.shape.lakeshore];
      if (SSL.shape.monon)     LINES.SSL_MONON = [SSL.shape.monon];
    }
  }

  // Nearest South Shore-only station to a point: { s, km } or null.
  function nearestSSL(lat, lon) {
    if (!SSL || !SSL.stations) return null;
    var best = null, bestKm = Infinity;
    SSL.stations.forEach(function (s) {
      var km = haversineKm(lat, lon, s.lat, s.lon);
      if (km < bestKm) { bestKm = km; best = s; }
    });
    return best ? { s: best, km: bestKm } : null;
  }

  // If a geocoded point sits on (near) a South Shore-only station, rewrite the
  // endpoint to that station and tag it `ssl`. Mirrors snapGeocode/O'Hare: an
  // off-matrix place made routable by naming the station that serves it.
  function snapSouthShore(ep) {
    if (!ep || ep.airport || ep.ssl || !SSL) return ep;
    var near = nearestSSL(ep.lat, ep.lon);
    if (!near) return ep;
    // In-county points only snap when they're essentially *at* a South Shore
    // station (Hegewisch), so a normal South Side trip isn't hijacked; Indiana
    // points (out of county) snap within the fuller park-and-ride radius.
    var inCounty = counties && pointInCounties(ep.lon, ep.lat, counties);
    var thresh = inCounty ? 1.5 : SSL_SNAP_KM;
    if (near.km <= thresh) {
      return { lat: near.s.lat, lon: near.s.lon, label: near.s.name, ssl: near.s.ssl };
    }
    return ep;
  }

  // Both ends on the South Shore Line: a single direct ride, no hub backtrack.
  // Network-independent (CrossTowner doesn't touch the South Shore), so today
  // and scenario come out equal — which is the honest answer.
  function sslDirect() {
    var a = SSL.byId[endpoints.from.ssl], b = SSL.byId[endpoints.to.ssl];
    if (!a || !b || a.ssl === b.ssl) return null;
    var out = b.sb >= a.sb;                       // b farther from Chicago than a
    var ride = out ? (b.sb - a.sb) : (a.nb - b.nb);
    if (!(ride >= 0)) return null;
    var board = out ? SSL.board.out : SSL.board.in;
    var total = board.wait + ride;
    return {
      total: total, rt: Math.round(total), nlegs: 1, access: 0, egress: 0,
      ride: total, routes: "SSL",
      legs: [{ mode: "TRAIN", line: "SSL", from: a.name, to: b.name,
               ride: ride, wait: board.wait, freq: board.freq, ssl: true }],
      board: { name: a.name, lat: a.lat, lon: a.lon, wheelchair: 0 },
      alight: { name: b.name, lat: b.lat, lon: b.lon, wheelchair: 0 },
      boardLabel: a.name, alightLabel: b.name
    };
  }

  // The South Shore connector between a hub and a station, for one travel
  // direction. `side` is the endpoint's role: "to" = outbound (hub -> Indiana),
  // "from" = inbound (Indiana -> hub). Returns { time, leg, hub } where time is
  // the whole connector cost (platform transfer + board wait + in-vehicle) and
  // leg renders as a South Shore vehicle leg. Station sb/nb are in-vehicle
  // minutes relative to the 55-56-57 hub; a hub's own sb/nb offsets it.
  function sslLeg(st, hubNode, side) {
    var out = side === "to";
    var ride = out ? (st.sb - hubNode.sb) : (st.nb - hubNode.nb);
    if (!(ride >= 0)) return null;
    var board = out ? SSL.board.out : SSL.board.in;
    var hubName = stationById[hubNode.id] ? stationById[hubNode.id].name : hubNode.name;
    return {
      time: SSL.transfer_min + board.wait + ride,
      hub: hubNode,
      leg: {
        mode: "TRAIN", line: "SSL",
        from: out ? hubName : st.name,
        to:   out ? st.name : hubName,
        ride: ride, wait: board.wait, freq: board.freq, ssl: true
      }
    };
  }

  // Boarding/alighting candidates for a South Shore endpoint: each hub station
  // (already in the matrix) carrying its South Shore connector as `ssl`.
  // bestTotal adds ssl.time to the total and splices ssl.leg into the trip.
  function sslCandidates(ep, network, side) {
    var st = SSL && SSL.byId[ep.ssl];
    if (!st) return [];
    var out = [];
    (SSL.hubs || []).forEach(function (h) {
      var hs = stationById[h.id];
      if (!hs || (network === "today" && !hs.exists_today)) return;
      var L = sslLeg(st, h, side);
      if (L) out.push({ station: hs, walk: 0, ssl: L });
    });
    return out;
  }

  /* ---- walking on the street network ------------------------------------ */
  // The walk between an address and a station is routed on OpenStreetMap's
  // streets and paths -- the same extract R5 walked riders on when it built
  // the matrix -- so a river, a rail yard or an expressway is only crossed
  // where a bridge, underpass or crossing really is. The network is prebuilt
  // by planner/tools/build-walk-tiles.mjs into ~1 km tiles under
  // CFG.walkBase. For each end of a trip we load the tiles within a
  // maxWalkMin walk, snap the address onto the nearest street or path
  // (counting that short straight connector at its length), and run one
  // Dijkstra outward, capped at maxWalkMin, which gives the walking time to
  // every station in reach. A station's walk ends at its access points: its
  // OSM entrances, or else the nearest street (and platform, if mapped); a
  // proposed station's are assumed. If the tiles can't be loaded or the
  // address is off the network, that end falls back to the straight-line
  // estimate (walkMinutes), so the planner never breaks.
  var WALK_SNAP_M = 400;      // no street or path this close = off the network
  var WALK_PAD_M = 50;        // load tiles a little past the walk radius
  var walkIndexP = null;      // Promise of the walk index (reset if it fails)
  var WALK = null;            // the walk index: grid, tile list, station access
  var walkTileP = {};         // tile key -> Promise of its JSON
  var walkCache = {};         // "lat,lon" -> Promise of that point's walk result
  var walkCacheKeys = [];     // oldest first; only the last few are kept
  var walks = { from: null, to: null };   // this trip's walk result per end
  // The network loaded so far. It only grows: each tile is added once, and an
  // edge that crosses a tile line (sent with every tile it touches) once.
  var WG = {
    tiles: {},                // tile key -> [edge index] (edges touching it)
    byId: {},                 // shared edge id -> edge index
    node: {},                 // "lonE6,latE6" -> node index
    nx: [], ny: [], adj: [],  // node coords (millionths of a degree), edges
    ea: [], eb: [], elen: [], eflag: [], epts: []  // per edge: end nodes,
                              // meters, flags (1 = don't snap), [x0,y0,x1,y1..]
  };

  function walkMPerMin() { return CFG.walkSpeedKmh * 1000 / 60; }
  function walkCapM() { return CFG.maxWalkMin * walkMPerMin(); }
  function walkURL(rel) {
    return CFG.walkBase + rel + (CFG.walkVersion ? "?v=" + encodeURIComponent(CFG.walkVersion) : "");
  }
  function walkIndex() {
    if (!walkIndexP) {
      walkIndexP = loadJSON(walkURL("/index.json")).then(function (idx) {
        idx.tileSet = {};
        idx.tiles.forEach(function (k) { idx.tileSet[k] = 1; });
        WALK = idx;
        return idx;
      }).catch(function () { walkIndexP = null; return null; });   // retry next trip
    }
    return walkIndexP;
  }
  function walkTile(key) {
    if (!walkTileP[key]) {
      walkTileP[key] = loadJSON(walkURL("/t/" + key + ".json"))
        .catch(function () { delete walkTileP[key]; return null; });
    }
    return walkTileP[key];
  }

  // Keys of the index's tiles within radiusM of a point.
  function walkTilesAround(lat, lon, radiusM) {
    var g = WALK.grid, KX = 111320 * Math.cos(lat * Math.PI / 180) / 1e6, KY = 111132 / 1e6;
    var x = lon * 1e6, y = lat * 1e6, rx = radiusM / KX, ry = radiusM / KY, out = [];
    var i0 = Math.floor((x - rx - g.lon0E6) / g.dLonE6), i1 = Math.floor((x + rx - g.lon0E6) / g.dLonE6);
    var j0 = Math.floor((y - ry - g.lat0E6) / g.dLatE6), j1 = Math.floor((y + ry - g.lat0E6) / g.dLatE6);
    for (var i = i0; i <= i1; i++) {
      for (var j = j0; j <= j1; j++) {
        var key = i + "_" + j;
        if (!WALK.tileSet[key]) continue;
        var w = g.lon0E6 + i * g.dLonE6, s = g.lat0E6 + j * g.dLatE6;
        var cx = Math.max(w, Math.min(x, w + g.dLonE6)), cy = Math.max(s, Math.min(y, s + g.dLatE6));
        if (Math.sqrt(Math.pow((cx - x) * KX, 2) + Math.pow((cy - y) * KY, 2)) <= radiusM) out.push(key);
      }
    }
    return out;
  }

  function walkNode(x, y) {
    var k = x + "," + y, n = WG.node[k];
    if (n == null) { n = WG.node[k] = WG.nx.length; WG.nx.push(x); WG.ny.push(y); WG.adj.push([]); }
    return n;
  }
  // Add one tile's edges to the network. A tile row is
  // [id, meters, flags, x0, y0, dx1, dy1, ...] relative to the tile's corner.
  function walkAddTile(key, data) {
    if (WG.tiles[key]) return;
    var p = key.split("_"), g = WALK.grid;
    var ox = g.lon0E6 + (+p[0]) * g.dLonE6, oy = g.lat0E6 + (+p[1]) * g.dLatE6, list = [];
    (data.e || []).forEach(function (row) {
      var id = row[0];
      if (id && WG.byId[id] != null) { list.push(WG.byId[id]); return; }
      var x = ox + row[3], y = oy + row[4], pts = [x, y];
      for (var k = 5; k + 1 < row.length; k += 2) { x += row[k]; y += row[k + 1]; pts.push(x, y); }
      var ei = WG.ea.length, a = walkNode(pts[0], pts[1]), b = walkNode(x, y);
      WG.ea.push(a); WG.eb.push(b); WG.elen.push(row[1]); WG.eflag.push(row[2]); WG.epts.push(pts);
      WG.adj[a].push(ei);
      if (b !== a) WG.adj[b].push(ei);
      if (id) WG.byId[id] = ei;
      list.push(ei);
    });
    WG.tiles[key] = list;
  }

  // The nearest point on the network to (lat, lon): { ei, k, t, d, f } --
  // edge, segment (index into its flat point list), position on the segment,
  // distance in meters, and fraction of the way along the edge. Prefers edges
  // an address can sit on (not a bridge, tunnel or stairway). null if nothing
  // is within WALK_SNAP_M.
  function walkSnap(lat, lon) {
    var x = lon * 1e6, y = lat * 1e6;
    var KX = 111320 * Math.cos(lat * Math.PI / 180) / 1e6, KY = 111132 / 1e6;
    var best = null, bestAny = null, seen = {};
    walkTilesAround(lat, lon, WALK_SNAP_M).forEach(function (key) {
      (WG.tiles[key] || []).forEach(function (ei) {
        if (seen[ei]) return;
        seen[ei] = 1;
        var p = WG.epts[ei], along = 0, hit = null;
        for (var k = 0; k + 3 < p.length; k += 2) {
          var ax = (p[k] - x) * KX, ay = (p[k + 1] - y) * KY;
          var dx = (p[k + 2] - p[k]) * KX, dy = (p[k + 3] - p[k + 1]) * KY;
          var L2 = dx * dx + dy * dy, segL = Math.sqrt(L2);
          var t = L2 > 0 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L2)) : 0;
          var d = Math.sqrt(Math.pow(ax + t * dx, 2) + Math.pow(ay + t * dy, 2));
          if (!hit || d < hit.d) hit = { ei: ei, k: k, t: t, d: d, along: along + t * segL };
          along += segL;
        }
        if (!hit || hit.d > WALK_SNAP_M) return;
        hit.f = along > 0 ? hit.along / along : 0;
        if (!(WG.eflag[ei] & 1) && (!best || hit.d < best.d)) best = hit;
        if (!bestAny || hit.d < bestAny.d) bestAny = hit;
      });
    });
    return best || bestAny;
  }

  // A small binary min-heap of node indices keyed by distance.
  function walkHeap() {
    var keys = [], vals = [];
    return {
      size: function () { return vals.length; },
      push: function (key, val) {
        var i = vals.length;
        keys.push(key); vals.push(val);
        while (i > 0) {
          var up = (i - 1) >> 1;
          if (keys[up] <= key) break;
          keys[i] = keys[up]; vals[i] = vals[up]; i = up;
        }
        keys[i] = key; vals[i] = val;
      },
      pop: function () {
        var top = vals[0], k = keys.pop(), v = vals.pop(), n = vals.length, i = 0;
        if (n) {
          for (;;) {
            var c = 2 * i + 1;
            if (c >= n) break;
            if (c + 1 < n && keys[c + 1] < keys[c]) c++;
            if (keys[c] >= k) break;
            keys[i] = keys[c]; vals[i] = vals[c]; i = c;
          }
          keys[i] = k; vals[i] = v;
        }
        return top;
      }
    };
  }

  // Walk outward from a point: snap it, then Dijkstra up to the walk cap.
  // Returns { net: true, lat, lon, snap, dist, prev, stations: { id: { m, min,
  // node } } }, or { net: false } when the point is off the network.
  function walkFrom(lat, lon) {
    var snap = walkSnap(lat, lon);
    if (!snap) return { net: false, why: "off-network" };
    var cap = walkCapM(), N = WG.nx.length, ei0 = snap.ei, len0 = WG.elen[ei0];
    var dist = new Float64Array(N), prev = new Int32Array(N), heap = walkHeap(), i;
    for (i = 0; i < N; i++) { dist[i] = Infinity; prev[i] = -1; }
    // The address reaches both ends of the edge it snapped onto.
    [[WG.ea[ei0], snap.d + snap.f * len0], [WG.eb[ei0], snap.d + (1 - snap.f) * len0]].forEach(function (s) {
      if (s[1] < dist[s[0]]) { dist[s[0]] = s[1]; heap.push(s[1], s[0]); }
    });
    while (heap.size()) {
      var n = heap.pop(), dn = dist[n], adj = WG.adj[n];
      for (i = 0; i < adj.length; i++) {
        var e = adj[i], m = WG.ea[e] === n ? WG.eb[e] : WG.ea[e], dm = dn + WG.elen[e];
        if (dm < dist[m] && dm <= cap) { dist[m] = dm; prev[m] = e; heap.push(dm, m); }
      }
    }
    // Lazy deletion: a node can sit in the heap twice; re-expanding it is
    // harmless (its neighbours can't improve), so no visited set is needed.
    var res = { net: true, lat: lat, lon: lon, snap: snap, dist: dist, prev: prev, stations: {} };
    var mpm = walkMPerMin();
    Object.keys(WALK.stations).forEach(function (id) {
      var a = WALK.stations[id].a, best = null;
      for (var j = 0; j < a.length; j++) {
        var nd = WG.node[a[j][0] + "," + a[j][1]];
        if (nd == null) continue;
        var dm = dist[nd] + a[j][2];
        if (dm <= cap && (!best || dm < best.m)) best = { m: dm, node: nd };
      }
      if (best) { best.min = best.m / mpm; res.stations[id] = best; }
    });
    return res;
  }

  // The walk from an end of the trip to a network node, as [[lat, lon], ...]:
  // the address, the straight connector to where it snapped, part of that
  // edge, then the edges Dijkstra followed.
  function walkPath(res, node) {
    var chain = [], n = node, guard = 0, i, k;
    while (res.prev[n] >= 0 && guard++ < 1e5) {
      var e = res.prev[n];
      chain.push(e);
      n = WG.ea[e] === n ? WG.eb[e] : WG.ea[e];
    }
    var s = res.snap, p = WG.epts[s.ei];
    var px = p[s.k] + s.t * (p[s.k + 2] - p[s.k]), py = p[s.k + 1] + s.t * (p[s.k + 3] - p[s.k + 1]);
    var out = [[res.lat, res.lon], [py / 1e6, px / 1e6]];
    if (n === WG.ea[s.ei]) { for (k = s.k; k >= 0; k -= 2) out.push([p[k + 1] / 1e6, p[k] / 1e6]); }
    else { for (k = s.k + 2; k < p.length; k += 2) out.push([p[k + 1] / 1e6, p[k] / 1e6]); }
    for (i = chain.length - 1; i >= 0; i--) {
      var ce = chain[i], q = WG.epts[ce], fwd = WG.ea[ce] === n;
      if (fwd) { for (k = 2; k < q.length; k += 2) out.push([q[k + 1] / 1e6, q[k] / 1e6]); }
      else { for (k = q.length - 4; k >= 0; k -= 2) out.push([q[k + 1] / 1e6, q[k] / 1e6]); }
      n = fwd ? WG.eb[ce] : WG.ea[ce];
    }
    return out;
  }

  // Walk times from one end of the trip (memoized per point). Resolves to a
  // walkFrom() result, { net: false } to fall back to straight-line estimates,
  // or null for an end that isn't walked (an O'Hare terminal or South Shore
  // station). Never rejects.
  function prepareWalk(which) {
    var ep = endpoints[which];
    if (!ep || ep.airport || ep.ssl) return Promise.resolve(null);
    var key = ep.lat.toFixed(6) + "," + ep.lon.toFixed(6);
    if (walkCache[key]) return walkCache[key];
    var p = walkIndex().then(function (idx) {
      if (!idx) return { net: false, why: "no-index" };
      // Every street a walk within the cap can use lies within the cap of the
      // address (the snap connector counts against the cap too).
      var keys = walkTilesAround(ep.lat, ep.lon, walkCapM() + WALK_PAD_M);
      return Promise.all(keys.map(walkTile)).then(function (tiles) {
        for (var i = 0; i < tiles.length; i++) {
          if (!tiles[i]) return { net: false, why: "tiles" };
          walkAddTile(keys[i], tiles[i]);
        }
        return walkFrom(ep.lat, ep.lon);
      });
    }).catch(function () { return { net: false, why: "error" }; }).then(function (res) {
      if (!res.net && res.why !== "off-network") delete walkCache[key];   // retry later
      return res;
    });
    walkCache[key] = p;
    walkCacheKeys.push(key);
    if (walkCacheKeys.length > 6) delete walkCache[walkCacheKeys.shift()];
    return p;
  }

  // Walking minutes from a trip end to a station: { min, est } -- est when
  // it's the straight-line estimate (no network for this end, or a station
  // past the edge of the OSM extract) -- or null if it's beyond the walk cap.
  function walkTo(side, s) {
    var ep = endpoints[side], w = walks[side];
    if (w && w.net && WALK && WALK.stations[s.id]) {
      var r = w.stations[s.id];
      return r ? { min: r.min, est: false } : null;
    }
    var m = walkMinutes(haversineKm(ep.lat, ep.lon, s.lat, s.lon));
    return m <= CFG.maxWalkMin ? { min: m, est: true } : null;
  }

  /* ---- nearest stations within the walk cap ----------------------------- */
  // Candidate stations for one end, by walking time. Origins are capped at
  // CFG.nearestK (each costs a shard download); destinations aren't (they're
  // just cells in the shards already loaded), so no better station is lost.
  function nearestStations(side, network) {
    var cands = [];
    for (var i = 0; i < stations.length; i++) {
      var s = stations[i];
      // On the "today" network, only stations that exist today are boardable;
      // scenario allows the infill stations too.
      if (network === "today" && !s.exists_today) continue;
      var w = walkTo(side, s);
      if (w) cands.push({ station: s, walk: w.min, est: w.est });
    }
    cands.sort(function (a, b) { return a.walk - b.walk; });
    return side === "to" ? cands : cands.slice(0, CFG.nearestK);
  }

  // The single closest station to a point, ignoring the walk cap — used to
  // explain *why* a trip found no route (usually: the nearest station is too
  // far to walk).
  function nearestAnyStation(lat, lon) {
    var best = null, bestKm = Infinity;
    for (var i = 0; i < stations.length; i++) {
      var km = haversineKm(lat, lon, stations[i].lat, stations[i].lon);
      if (km < bestKm) { bestKm = km; best = stations[i]; }
    }
    return best ? { station: best, km: bestKm, walk: walkMinutes(bestKm) } : null;
  }

  // Fetch (and cache) one origin shard: { destId: minutes }.
  function getShard(network, slice, originId) {
    var key = network + "/" + slice + "/" + originId;
    if (shardCache[key]) return Promise.resolve(shardCache[key]);
    var path = dataURL("/matrix/" + key + ".json");
    return loadJSON(path)
      .then(function (obj) { shardCache[key] = obj; return obj; })
      .catch(function () { shardCache[key] = {}; return {}; }); // unreachable origin
  }

  // Boarding/alighting candidates for one endpoint: a South Shore endpoint uses
  // its transfer hubs with the South Shore connector baked in (see SSL); an
  // airport endpoint uses its two O'Hare rail stations with fixed ATS/walk
  // egress (see OHARE); everything else uses the stations within a walk (see
  // nearestStations). `side` ("from"/"to") is which end this is, which also
  // sets the South Shore travel direction.
  function candidateStations(ep, network, side) {
    if (ep && ep.ssl) return sslCandidates(ep, network, side);
    if (ep && ep.airport && OHARE.terminals[ep.airport]) {
      var eg = OHARE.terminals[ep.airport].egress;
      var out = [];
      [["blue", eg.blue], ["transfer", eg.transfer]].forEach(function (pair) {
        var s = stationById[OHARE_STATIONS[pair[0]]];
        if (!s) return;
        if (network === "today" && !s.exists_today) return;   // both exist today
        out.push({ station: s, walk: pair[1] });
      });
      return out;
    }
    return nearestStations(side, network);
  }

  // R5's own walking, stored as its own leg: { mode:"WALK", ride }. A cell's
  // `m` is the whole trip between two station points, so it always contained
  // the walk to the boarding stop, any transfer walk, and the walk off at the
  // far end -- the matrix just used to drop those segments, leaving the
  // planner able to see the time but not say where it went. Fold each walk
  // onto the vehicle leg it precedes (`wb`), and a trailing one onto the last
  // leg (`wa`), so every other consumer still sees a plain list of vehicle
  // legs.
  function foldWalks(legs) {
    if (!legs || !legs.length) return legs;
    var out = [], pending = 0, i, k, copy;
    for (i = 0; i < legs.length; i++) {
      if (legs[i].mode === "WALK") { pending += legs[i].ride || 0; continue; }
      copy = {};
      for (k in legs[i]) copy[k] = legs[i][k];
      if (pending) { copy.wb = pending; pending = 0; }
      out.push(copy);
    }
    if (pending && out.length) out[out.length - 1].wa = pending;
    return out;
  }

  /* ---- the core lookup: best door-to-door total for one network --------- */
  function bestTotal(network, slice) {
    // Both ends on the South Shore: a direct ride, not a hub graft.
    if (endpoints.from && endpoints.from.ssl && endpoints.to && endpoints.to.ssl) {
      return Promise.resolve(sslDirect());
    }
    var origins = candidateStations(endpoints.from, network, "from");
    var dests   = candidateStations(endpoints.to,   network, "to");
    if (!origins.length || !dests.length) return Promise.resolve(null);

    // Fetch the origin shards we need, then combine with every candidate dest.
    return Promise.all(origins.map(function (o) {
      return getShard(network, slice, o.station.id).then(function (row) {
        return { o: o, row: row };
      });
    })).then(function (rows) {
      var best = null;
      rows.forEach(function (entry) {
        dests.forEach(function (d) {
          var cell = entry.row[d.station.id];
          if (cell == null) return;                       // pair unreachable
          // Cells are { m: minutes, r: "ME|X1", legs: [...] }; tolerate a bare number too.
          var ride   = (typeof cell === "number") ? cell : cell.m;
          var routes = (typeof cell === "object") ? cell.r : null;
          var raw    = (typeof cell === "object") ? cell.legs : null;
          var walked = MATRIX_WALKED && !!(raw && raw.length);
          var legs   = foldWalks(raw);
          if (ride == null) return;
          // A South Shore endpoint carries its connector on the candidate; splice
          // its leg in (origin ssl before the matrix legs, dest ssl after) and add
          // its whole cost (transfer + wait + in-vehicle) to the total.
          var oS = entry.o.ssl, dS = d.ssl;
          var sslExtra = (oS ? oS.time : 0) + (dS ? dS.time : 0);
          var total = entry.o.walk + ride + d.walk + sslExtra;
          if (oS || dS) {
            var base = legs && legs.length ? legs.slice()
                     : [{ mode: "RAIL", line: routes ? String(routes).split("|")[0] : null,
                          from: entry.o.station.name, to: d.station.name, ride: ride }];
            legs = (oS ? [oS.leg] : []).concat(base, dS ? [dS.leg] : []);
            routes = [oS ? "SSL" : null, routes, dS ? "SSL" : null].filter(Boolean).join("|");
          }
          // Number of vehicle legs (fewer = simpler, fewer transfers).
          var nlegs = legs && legs.length ? legs.length
                    : routes ? String(routes).split("|").length : 1;
          var rt = Math.round(total);
          // Prefer the lowest total; when two options display the same minute
          // (e.g. a one-seat airport ride vs. a downtown backtrack that ties),
          // prefer the simpler trip (fewer legs), then the truly faster one.
          var better = !best || rt < best.rt ||
            (rt === best.rt && nlegs < best.nlegs) ||
            (rt === best.rt && nlegs === best.nlegs && total < best.total);
          if (better) {
            best = {
              total: total, rt: rt, nlegs: nlegs,
              access: entry.o.walk, egress: d.walk,
              // true when that walk is a straight-line estimate, not routed
              accessEst: !!entry.o.est, egressEst: !!d.est,
              // "station-to-station" line covers the rail + connector time.
              ride: ride + sslExtra, routes: routes, legs: legs,
              // Whether the cell itemized its walking (see foldWalks): if it
              // did, the steps can report real minutes instead of estimates.
              walked: walked,
              board: entry.o.station, alight: d.station,
              // The stations the rider actually boards/alights at. Usually the
              // candidate stations, but a matrix cell's total can include r5r
              // walking from the station we looked the cell up under to a
              // different one (~24% of pairs) -- the legs know where that is.
              boardLabel: (legs && legs.length) ? legs[0].from : entry.o.station.name,
              alightLabel: (legs && legs.length) ? legs[legs.length - 1].to : d.station.name
            };
          }
        });
      });
      return best;
    });
  }

  // How a station reads on a card. build_stations.R gives every station a name
  // that identifies it on its own -- the nine pairs the feeds ship under the
  // same name (two "Bryn Mawr", 25 km apart) get the serving line appended
  // there -- so this is just the name, via whatever resolved the station.
  function stationLabel(st) {
    return (st && st.name) || "";
  }

  // Which operator a leg belongs to, as the station flag that marks it. CTA
  // rail rides are SUBWAY; the X routes are the CrossTowner; other RAIL is
  // Metra. A bus leg says nothing -- it can board at either operator's station.
  function legOperator(leg) {
    if (!leg) return null;
    if (leg.mode === "SUBWAY") return "on_cta_rail";
    if (leg.mode === "RAIL") return /^X[1-6]$/.test(leg.line) ? "on_crosstowner" : "on_metra";
    return null;
  }

  // A station object by name -- from the rail list or the South Shore graft.
  // Matrix legs name their endpoints, so this is how a leg gets back to
  // coordinates (and to its wheelchair flag).
  //
  // build_stations.R keeps names unique, so normally one candidate matches.
  // This stays as a guard for the day a feed introduces a fresh collision:
  // resolve with what the leg does say -- its mode and route name the operator
  // -- and, failing that, take whichever candidate sits nearer a reference
  // point `near` ([lat, lon]): the other end of the leg, or the trip endpoint.
  function stNamed(name, leg, near) {
    var list = stationsByName[name];
    if (!list || !list.length) return (SSL && SSL.byName[name]) || null;
    if (list.length === 1) return list[0];
    var pool = list, flag = legOperator(leg), i, matched = [];
    if (flag) {
      for (i = 0; i < list.length; i++) if (list[i][flag]) matched.push(list[i]);
      if (matched.length) pool = matched;
    }
    if (pool.length > 1 && near) {
      var best = pool[0], bestKm = haversineKm(best.lat, best.lon, near[0], near[1]), km;
      for (i = 1; i < pool.length; i++) {
        km = haversineKm(pool[i].lat, pool[i].lon, near[0], near[1]);
        if (km < bestKm) { best = pool[i]; bestKm = km; }
      }
      return best;
    }
    return pool[0];
  }

  // Walking minutes from an endpoint to a station, in the planner's own walk
  // model: routed on the street network when this end was, else the
  // straight-line estimate. null when the endpoint isn't reached on foot: an
  // O'Hare terminal (people mover / fixed egress) or a South Shore station.
  function epWalkMin(which, station) {
    var ep = endpoints[which];
    if (!ep || ep.airport || ep.ssl || !station) return null;
    var w = walks[which], r = w && w.net && station.id && w.stations[station.id];
    return r ? r.min : walkMinutes(haversineKm(ep.lat, ep.lon, station.lat, station.lon));
  }

  // Walking minutes between two stations named by legs (an out-of-station
  // transfer, or the gap the matrix walked the rider across). "" if either
  // name doesn't resolve.
  function gapWalk(fromName, toName, fromLeg, toLeg) {
    var a = stNamed(fromName, fromLeg);
    var b = stNamed(toName, toLeg, a ? [a.lat, a.lon] : null);
    return (a && b) ? fmtMin(walkMinutes(haversineKm(a.lat, a.lon, b.lat, b.lon))) : "";
  }

  // One access ("from") or egress ("to") hop as an <li>. For an O'Hare terminal
  // endpoint the hop is to/from a specific terminal, and is labeled as an ATS
  // ride or a walk depending on which station served it — so we never call the
  // people mover a "walk". `est` marks a walk that couldn't be routed on the
  // street network and is a straight-line estimate.
  function hopLi(side, station, minutes, boardName, est) {
    var ep = endpoints[side];
    // A South Shore endpoint *is* the boarding/alighting station (you start or
    // end on the platform), so there's no access/egress walk to show. Nor is
    // there when the endpoint sits on top of its station -- "Walk 0 min" is
    // noise, not a step.
    if (ep && ep.ssl) return "";
    if (!ep.airport && Math.round(minutes) < 1) return "";
    var sk = ep && ep.airport && station ? ohareStationKey(station.id) : null;
    if (sk) {
      var ats = ohareHopMode(sk, ep.airport) === "ats";
      var verb = ats ? "Take the ATS ~" + Math.round(minutes) + " min" : "Walk " + fmtMin(minutes);
      var term = OHARE.terminals[ep.airport].short;
      return side === "from"
        ? "<li>" + verb + " from <b>" + term + "</b> to <b>" + boardName + "</b></li>"
        : "<li>" + verb + " to <b>" + term + "</b></li>";
    }
    var estTxt = est ? ' <span class="text-secondary">(straight-line estimate)</span>' : "";
    return side === "from"
      ? "<li>Walk " + fmtMin(minutes) + estTxt + " to <b>" + boardName + "</b></li>"
      : "<li>Walk " + fmtMin(minutes) + estTxt + " to your destination</li>";
  }

  /* ---- render ----------------------------------------------------------- */
  // Once a trip is planned, bring its results up to the top of the panel (on a phone, where the page itself
  // scrolls, to the top of the window), leaving a sliver of the form above them.
  function scrollToResults(el) {
    var behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    var panel = el.closest(".panel");
    if (panel && window.matchMedia("(min-width: 768px)").matches) {
      panel.scrollTo({ top: panel.scrollTop + el.getBoundingClientRect().top - panel.getBoundingClientRect().top - 12, behavior: behavior });
    } else {
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 12, behavior: behavior });
    }
  }

  function renderResults(slice, today, scen) {
    showMapLoading(false);
    var el = document.getElementById("results");
    if (!today && !scen) {
      el.innerHTML = noRouteHtml();
      scrollToResults(el);
      return;
    }
    function card(title, accent, r, net) {
      if (!r) return '<div class="card"><div class="card-body py-2 px-3">' +
        '<h2 class="h6 mb-1">' + title + '</h2>' +
        '<p class="text-secondary small mb-0">No rail trip found.</p></div></div>';
      // Where the rider really boards and alights. The matrix cell's total can
      // include r5r walking them from the station we looked the cell up under to
      // a neighbouring one -- the legs say where -- so measure the access and
      // egress hops to *those* stations, not to the station that keyed the cell.
      // The map already draws it this way; this makes the steps agree.
      var first = (r.legs && r.legs.length) ? r.legs[0] : null;
      var last  = (r.legs && r.legs.length) ? r.legs[r.legs.length - 1] : null;
      // An O'Hare end keeps its rail station: the hop there is a fixed ATS/walk
      // egress to a terminal, not a hop to whatever station the legs name.
      var bSt = (!endpoints.from.airport && first &&
                 stNamed(first.from, first, [endpoints.from.lat, endpoints.from.lon])) || r.board;
      var aSt = (!endpoints.to.airport   && last  &&
                 stNamed(last.to, last, [endpoints.to.lat, endpoints.to.lon]))         || r.alight;
      // Access and egress. When the cell itemized its walking, the first and
      // last walk legs are R5's own street-network minutes from the station
      // that keyed the cell to the stop the rider actually uses, so they add
      // to our walk out to that station and the pair is exact. Without them
      // all we can do is estimate the whole thing straight-line from the
      // endpoint to the station the legs name.
      var accessMin, egressMin;
      if (r.walked) {
        accessMin = r.access + ((first && first.wb) || 0);
        egressMin = r.egress + ((last && last.wa) || 0);
      } else {
        accessMin = epWalkMin("from", bSt);
        egressMin = epWalkMin("to", aSt);
        if (accessMin == null) accessMin = r.access;
        if (egressMin == null) egressMin = r.egress;
      }
      var wc = (bSt.wheelchair === 1 && aSt.wheelchair === 1) ?
        '<div class="small text-crcl mb-1">&#9855; Both stations are wheelchair-accessible</div>' : '';
      var rr = parseRoutes(r.routes, net);
      var xfers = rr ? rr.transfers : 0;
      // Waiting time, so the steps add up to the total above them. What's left
      // of the total after the walking and riding we can name *is* the wait,
      // and that's the honest place to put it: `m` is a 30-minute-window
      // median while the legs come from a single 8:00 departure, and waiting
      // is exactly what differs between the two. (A South Shore leg's wait is
      // its own scheduled figure, added outside the matrix, so it stays put.)
      var waitOf = [];
      if (r.walked && r.legs && r.legs.length) {
        // Work in the minutes the card actually prints. Every step is rounded
        // on its way to the screen, so taking the leftover *after* rounding
        // the rest is what makes the column add up to the headline instead of
        // landing a minute or two off it.
        var shown = Math.round(accessMin) + Math.round(egressMin), pool = 0;
        r.legs.forEach(function (leg, i) {
          shown += leg.ride || 0;
          if (i > 0) shown += Math.round(leg.wb || 0);
          if (leg.ssl) shown += leg.wait || 0; else pool += leg.wait || 0;
        });
        var left = Math.max(0, Math.round(r.total) - shown), spent = 0, i2;
        r.legs.forEach(function (leg, i) {
          if (leg.ssl) { waitOf[i] = null; return; }   // its own scheduled wait
          var w = pool > 0 ? Math.round(left * (leg.wait || 0) / pool) : 0;
          waitOf[i] = w; spent += w;
        });
        // Whatever the split rounded away goes to the first vehicle leg.
        for (i2 = 0; i2 < r.legs.length; i2++) {
          if (!r.legs[i2].ssl) { waitOf[i2] = Math.max(0, waitOf[i2] + left - spent); break; }
        }
      }
      var steps;
      if (r.legs && r.legs.length) {
        // Detailed legs: board/alight stations + in-vehicle ride per vehicle.
        steps = hopLi("from", bSt, accessMin, stationLabel(bSt) || first.from, r.accessEst);
        var ref = [endpoints.from.lat, endpoints.from.lon], prevToNm = "";
        r.legs.forEach(function (leg, i) {
          var label = routeLabel(leg.line, net) || leg.mode;
          // Resolve both ends so they can be named unambiguously, walking the
          // reference point forward so a bus leg at one of the same-named
          // pairs resolves against where the rider actually is.
          var fromSt = stNamed(leg.from, leg, ref);
          if (fromSt) ref = [fromSt.lat, fromSt.lon];
          var toSt = stNamed(leg.to, leg, ref);
          var fromNm = stationLabel(fromSt) || leg.from;
          var toNm = stationLabel(toSt) || leg.to;
          if (toSt) ref = [toSt.lat, toSt.lon];
          // Walking at a transfer: to another station, or across the one
          // you're in. Real minutes when the cell itemized its walking, a
          // straight-line estimate otherwise.
          if (i > 0) {
            var moved = r.legs[i - 1].to !== leg.from;
            var tw = r.walked ? (leg.wb >= 1 ? fmtMin(leg.wb) : "")
                              : (moved ? gapWalk(r.legs[i - 1].to, leg.from, r.legs[i - 1], leg) : "");
            if (moved) {
              steps += '<li><span class="text-secondary">Transfer: walk ' + (tw ? tw + ' ' : '') +
                'from ' + (prevToNm || r.legs[i - 1].to) + ' to <b>' + fromNm + '</b></span></li>';
            } else if (tw) {
              steps += '<li><span class="text-secondary">Transfer: walk ' + tw +
                ' within <b>' + fromNm + '</b></span></li>';
            }
          }
          // Service frequency makes the CrossTowner benefit visible: the same
          // corridor often runs more often in the scenario (added X-route trains).
          // The South Shore leg is a scheduled transfer, so its typical wait is a
          // real part of the total (not folded into a median) — show it plainly.
          var freqTxt = leg.freq ? '<div class="text-secondary">a train every ~' + leg.freq + ' min' +
            (leg.ssl && leg.wait ? ', about ' + leg.wait + ' min typical wait' : '') + '</div>' : '';
          var transferInto = leg.ssl ? ' <span class="text-secondary">(transfer to the South Shore Line)</span>' : '';
          var wm = waitOf[i] != null ? Math.round(waitOf[i]) : 0;
          var waitTxt = wm >= 1 ? ' after a ~' + wm + ' min wait' : '';
          steps += '<li>Board the <b>' + label + '</b> at ' + fromNm + waitTxt + transferInto + freqTxt + '</li>';
          // Alighting is its own step so it's obvious where to get off.
          steps += '<li>Ride ' + leg.ride + ' min &rarr; alight at <b>' + toNm + '</b></li>';
          prevToNm = toNm;
        });
        steps += hopLi("to", aSt, egressMin, null, r.egressEst);
      } else {
        // Fallback: route sequence only (no station-level detail).
        steps = hopLi("from", r.board, r.access, stationLabel(r.board), r.accessEst);
        if (rr && rr.labels.length) {
          rr.labels.forEach(function (lbl, i) {
            steps += '<li>' + (i === 0 ? 'Board the <b>' : 'Transfer to the <b>') + lbl + '</b></li>';
          });
        } else {
          steps += '<li>Ride ' + stationLabel(r.board) + ' &rarr; ' + stationLabel(r.alight) + '</li>';
        }
        steps += hopLi("to", r.alight, r.egress, null, r.egressEst);
      }
      // In-vehicle time, summed from the legs, so the headline under the total
      // always reconciles with the ride steps below it. (r.ride is the matrix
      // cell, which folds in waiting and any walking between stations.)
      var sub = '<div class="text-secondary small mb-1">' +
        (r.legs && r.legs.length
          ? fmtMin(r.legs.reduce(function (a, l) { return a + (l.ride || 0); }, 0)) + ' riding'
          : fmtMin(r.ride) + ' station-to-station') +
        ' &middot; ' + (xfers === 0 ? "one seat" :
          xfers + " transfer" + (xfers > 1 ? "s" : "")) +
        ' &middot; ' + (stationLabel(bSt) || r.boardLabel || r.board.name) + ' &rarr; ' +
        (stationLabel(aSt) || r.alightLabel || r.alight.name) + '</div>';
      return '<div class="card" style="border-top:3px solid ' + accent + '">' +
        '<div class="card-body py-2 px-3">' +
        '<h2 class="h6 d-flex justify-content-between align-items-baseline mb-1">' +
          title + '<span class="fs-4 fw-bold">' + fmtMin(r.total) + '</span></h2>' +
        wc + sub +
        '<ol class="mb-0 ps-3 small">' + steps + '</ol></div></div>';
    }
    var delta = "";
    if (today && scen) {
      var d = Math.round(today.total - scen.total);
      // faster: the cab ride film's green pill with a tick; otherwise a plain note
      delta = d > 0
        ? '<div><span class="faster" role="status"><svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">' +
          '<path d="M2 7.5 6.5 12 16 2" fill="none" stroke="#05331a" stroke-width="3.2" stroke-linecap="round" ' +
          'stroke-linejoin="round"/></svg><span>' + d + (d === 1 ? " minute" : " minutes") + ' faster ' +
          '<span class="faster-with">with CrossTowner</span></span></span></div>'
        : '<div class="not-faster small">' + (d < 0 ? "CrossTowner is " + (-d) + " min slower here."
                                                   : "Same total time on this trip.") + '</div>';
    }
    el.innerHTML =
      card("Today", "#3A4750", today, "today") +
      card("With CrossTowner + Red Line Extension", "var(--crcl)", scen, "scenario") +
      delta;
    // The methodology note lives in the footer, below the divider — set it here
    // because the slice label is dynamic.
    var note = document.getElementById("method-note");
    if (note) note.innerHTML = 'Precomputed median travel time in a 30-minute period ' +
      sliceLabel(slice) + ', assuming 2.75 mph walk speed and a 20-minute maximum walk to any one station. ' +
      'Every walk is measured on OpenStreetMap\'s streets and paths: the walk between your address and a station ' +
      'is routed in your browser, and walking inside the trip — to the platform, at a transfer, or out at the far ' +
      'end — comes from the trip planning engine, so the steps add up to the total. Walks to proposed stations ' +
      'start from assumed entrances. The line you board reflects a representative departure at this time.';
    drawRoute(today, scen);
    scrollToResults(el);
  }

  // A prominent, specific "no trip" explanation. Names the end(s) whose nearest
  // station is beyond the walk cap and how far it is, so the user knows what to
  // fix. Rendered as a warning alert (not easily-missed grey text).
  function noRouteHtml() {
    var cap = CFG.maxWalkMin;
    var ends = [
      { label: "starting point", side: "from", n: nearestAnyStation(endpoints.from.lat, endpoints.from.lon) },
      { label: "destination",    side: "to",   n: nearestAnyStation(endpoints.to.lat,   endpoints.to.lon) }
    ];
    // An end is out of reach when no station is within the walk cap -- on the
    // street network when it was routed, which can be the case even though a
    // station looks close as the crow flies (across a river or a rail yard).
    var far = ends.filter(function (e) {
      return e.n && !candidateStations(endpoints[e.side], "scenario", e.side).length;
    });
    var why = far.length
      ? '<p class="mb-2">' + far.map(function (e) {
          var mi = (e.n.km * 0.621371).toFixed(1), w = walks[e.side];
          return (w && w.net)
            ? "Your " + e.label + " is more than a <b>" + cap + "-minute walk</b> from any station by street " +
              "(the nearest, " + stationLabel(e.n.station) + ", is " + mi + " mi away as the crow flies)."
            : "Your " + e.label + " is about a <b>" + Math.round(e.n.walk) +
              "-minute walk</b> from the nearest station (" + stationLabel(e.n.station) + ", " + mi + " mi away).";
        }).join(" ") + '</p>'
      : '<p class="mb-2">There\'s no rail connection between these two points in the network.</p>';
    return '<div class="alert alert-warning" role="alert">' +
      '<h2 class="h5 alert-heading mb-2">🚫 No rail trip found</h2>' + why +
      '<p class="mb-0 small">A trip needs a train station within a ' + cap +
      '-minute walk of <em>each</em> end. The trip planner doesn\'t include bus routes yet, ' +
      'so it can\'t plan a bus ride to the station. Try an address closer to a station.</p></div>';
  }

  function sliceLabel(id) {
    var s = CFG.slices.filter(function (x) { return x.id === id; })[0];
    return s ? s.label : id;
  }

  // Show/hide the "Planning your trip" overlay (a little train) on the map.
  function showMapLoading(on) {
    var e = document.getElementById("map-loading");
    if (e) { e.classList.toggle("show", !!on); e.setAttribute("aria-hidden", on ? "false" : "true"); }
  }

  /* ---- map -------------------------------------------------------------- */
  function initMap() {
    map = L.map("map", { scrollWheelZoom: true }).setView([41.85, -87.72], 10);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);
    routeLayer = L.layerGroup().addTo(map);
    // The map lives in a flex container that fills the viewport; make sure
    // Leaflet measures it correctly on load and whenever the window resizes.
    setTimeout(function () { map.invalidateSize(); }, 200);
    window.addEventListener("resize", function () { map.invalidateSize(); });
  }

  /* ---- route labels ----------------------------------------------------- */
  var METRA_LINES = {
    "ME": "Metra Electric", "UP-N": "Union Pacific North",
    "UP-NW": "Union Pacific Northwest", "UP-W": "Union Pacific West",
    "BNSF": "BNSF", "RI": "Rock Island", "MD-N": "Milwaukee District North",
    "MD-W": "Milwaukee District West", "NCS": "North Central Service",
    "SWS": "SouthWest Service", "HC": "Heritage Corridor"
  };
  var CTA_LINES = {
    "Red": "Red Line", "Blue": "Blue Line", "G": "Green Line",
    "Brn": "Brown Line", "Org": "Orange Line", "P": "Purple Line",
    "Pink": "Pink Line", "Y": "Yellow Line"
  };
  // In the CrossTowner scenario the Metra corridors are rebranded to the
  // lettered "Suburban Service" lines shown on the Star:Line CrossTowner map
  // (the (code) in each is the Metra GTFS route the letter line replaces).
  // Applies only to the "scenario" network, so "Today" keeps the Metra names.
  var CROSSTOWNER_RENAME = {
    "UP-N":  "A Line", "UP-NW": "C Line", "MD-N": "E Line", "NCS": "G Line",
    "MD-W":  "J Line", "UP-W":  "K Line", "BNSF": "M Line", "HC":  "P Line",
    "SWS":   "Q Line", "RI":    "R Line", "ME":   "U Line"
  };
  // Turn one route token into a human label (null for walking).
  function routeLabel(tok, net) {
    if (!tok) return null;
    tok = tok.replace(/[\[\]]/g, "");
    if (tok === "WALK" || tok === "") return null;
    if (net === "scenario" && CROSSTOWNER_RENAME[tok]) return CROSSTOWNER_RENAME[tok];
    if (/^X[1-6]$/.test(tok)) return "CrossTowner " + tok;
    if (tok === "SSL") return "South Shore Line";
    if (/^rle$/i.test(tok) || /red.?ext/i.test(tok)) return "Red Line Extension";
    if (METRA_LINES[tok]) return METRA_LINES[tok];
    if (CTA_LINES[tok]) return CTA_LINES[tok] ? CTA_LINES[tok] : tok;
    if (/^\d+[A-Za-z]?$/.test(tok) || /^[A-Za-z]\d+$/.test(tok)) return "Bus " + tok;
    return tok;
  }
  // Parse a "ME|X1" route string into { labels[], transfers } for one network.
  function parseRoutes(r, net) {
    if (!r) return null;
    var labels = r.split("|").map(function (t) { return routeLabel(t, net); }).filter(Boolean);
    return { labels: labels, transfers: Math.max(labels.length - 1, 0) };
  }

  // Colour per line code (CTA official, CrossTowner teal, Metra blue, bus grey).
  var LINE_COLOR = {
    Red:"#C60C30", Blue:"#00A1DE", G:"#009B3A", Brn:"#62361B", Org:"#F9461C",
    P:"#522398", Pink:"#E27EA6", Y:"#F9E300", RLE:"#C60C30",
    X1:"#0B7285", X2:"#0B7285", X3:"#0B7285", X4:"#0B7285", X5:"#0B7285", X6:"#0B7285",
    SSL:"#F6931C"   // NICTD South Shore Line orange (GTFS route_color)
  };
  function lineColor(code) {
    if (LINE_COLOR[code]) return LINE_COLOR[code];
    if (/^\d/.test(code)) return "#8B979E";        // bus number -> grey
    return "#2b6cb0";                               // Metra lines -> blue
  }
  /*
   * A rail line's geometry arrives as one or more disconnected parts
   * ([[lon,lat],...] each) -- e.g. a downtown Loop stub separate from the branch
   * out to the terminus. Stitch parts that share an endpoint into maximal
   * continuous chains so a slice can span what used to be a part boundary
   * (the Rock Island LaSalle->Blue Island gap was exactly this). Greedy: start a
   * chain from an unused part, then keep gluing on any part whose end touches
   * either tip (within ~40 m), reversing it as needed.
   */
  /*
   * Collapse consecutive (near-)duplicate vertices. Some CTA lines carry
   * zero-length Loop stubs (a 2-point part whose ends are identical); turf's
   * nearestPointOnLine divides by segment length and yields NaN on those,
   * which then makes lineSlice throw "coordinates must contain numbers". Drop
   * them here so every segment has real length.
   */
  function dedupePath(path) {
    var EPS = 1e-7, out = [];
    for (var i = 0; i < path.length; i++) {
      var p = path[i], q = out[out.length - 1];
      if (!q || Math.abs(p[0] - q[0]) > EPS || Math.abs(p[1] - q[1]) > EPS) out.push(p);
    }
    return out;
  }

  function stitchChains(parts) {
    var TOL = 4e-4;                                   // ~40 m in degrees
    function near(a, b) { return Math.abs(a[0] - b[0]) < TOL && Math.abs(a[1] - b[1]) < TOL; }
    // Clean each part first, then drop any that collapsed below 2 points.
    var segs = parts.map(dedupePath).filter(function (p) { return p.length >= 2; });
    var used = segs.map(function () { return false; });
    var chains = [];
    for (var i = 0; i < segs.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      var chain = segs[i].slice();
      var grew = true;
      while (grew) {
        grew = false;
        for (var j = 0; j < segs.length; j++) {
          if (used[j]) continue;
          var s = segs[j], head = chain[0], tail = chain[chain.length - 1];
          var sh = s[0], stail = s[s.length - 1];
          if (near(tail, sh)) { chain = chain.concat(s.slice(1)); }
          else if (near(tail, stail)) { chain = chain.concat(s.slice().reverse().slice(1)); }
          else if (near(head, stail)) { chain = s.slice().concat(chain.slice(1)); }
          else if (near(head, sh)) { chain = s.slice().reverse().concat(chain.slice(1)); }
          else continue;
          used[j] = true; grew = true;
        }
      }
      chains.push(dedupePath(chain));                 // dedupe again after stitching
    }
    return chains.filter(function (c) { return c.length >= 2; });
  }

  // Per-line cache of stitched chains as turf LineStrings (built once, lazily).
  var chainCache = {};
  function lineChains(code) {
    if (chainCache[code]) return chainCache[code];
    var parts = LINES && LINES[code];
    if (!parts) return (chainCache[code] = null);
    var chains = stitchChains(parts).filter(function (c) { return c.length >= 2; });
    chainCache[code] = window.turf
      ? chains.map(function (c) { return turf.lineString(c); })
      : chains;                                       // raw fallback if turf absent
    return chainCache[code];
  }

  /*
   * Clip a line between two stations -> [[lat,lon],...] board->alight. Picks the
   * stitched chain closest to both endpoints, then uses turf.lineSlice to cut the
   * piece between them (turf handles endpoint order). Falls back to a simple
   * vertex-index slice if turf did not load.
   */
  function clipLine(code, aLat, aLon, bLat, bLon) {
    var chains = lineChains(code);
    if (!chains || !chains.length) return null;

    if (window.turf) {
      var A = turf.point([aLon, aLat]), B = turf.point([bLon, bLat]);
      var best = null, bestScore = Infinity;
      chains.forEach(function (ls) {
        var na = turf.nearestPointOnLine(ls, A), nb = turf.nearestPointOnLine(ls, B);
        var score = na.properties.dist + nb.properties.dist;   // km
        if (score < bestScore) { bestScore = score; best = { ls: ls, na: na, nb: nb }; }
      });
      if (!best) return null;
      var sliced = turf.lineSlice(best.na, best.nb, best.ls);
      return sliced.geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
    }

    // Fallback (no turf): nearest-vertex slice on the best raw chain.
    function nIdx(path, lat, lon) {
      var bi = 0, bd = Infinity;
      for (var i = 0; i < path.length; i++) {
        var dx = path[i][0] - lon, dy = path[i][1] - lat, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; bi = i; }
      }
      return { idx: bi, d: bd };
    }
    var bestPath = null, bScore = Infinity, ai = 0, bi2 = 0;
    chains.forEach(function (p) {
      var na = nIdx(p, aLat, aLon), nb = nIdx(p, bLat, bLon);
      if (na.d + nb.d < bScore) { bScore = na.d + nb.d; bestPath = p; ai = na.idx; bi2 = nb.idx; }
    });
    if (!bestPath) return null;
    var lo = Math.min(ai, bi2), hi = Math.max(ai, bi2);
    var seg = bestPath.slice(lo, hi + 1).map(function (c) { return [c[1], c[0]]; });
    if (ai > bi2) seg.reverse();
    return seg;
  }
  // The walk between an end of the trip and a station, as [[lat, lon], ...] in
  // trip order: address -> station for "from", station -> address for "to".
  // On the street network when this end was routed: to the station itself if
  // it's within the walk, else to `via` -- the station the trip was looked up
  // under, from which the matrix walked the rider on (the last stretch is
  // drawn straight, as R5's own path isn't stored). A straight line otherwise.
  function accessLine(side, st, via) {
    var ep = endpoints[side], w = walks[side], line = null;
    function path(s) { var r = w && w.net && s && s.id && w.stations[s.id]; return r ? walkPath(w, r.node) : null; }
    if (w && w.net) {
      line = path(st);
      if (!line && via && via !== st) { line = path(via); if (line) line.push([via.lat, via.lon]); }
    }
    if (line) line.push([st.lat, st.lon]);
    else line = [[ep.lat, ep.lon], [st.lat, st.lon]];
    return side === "to" ? line.reverse() : line;
  }

  function drawRoute(today, scen) {
    routeLayer.clearLayers();
    if (fromMarker) map.removeLayer(fromMarker);
    if (toMarker) map.removeLayer(toMarker);
    if (!endpoints.from || !endpoints.to) return;
    fromMarker = L.marker([endpoints.from.lat, endpoints.from.lon]).addTo(map);
    toMarker = L.marker([endpoints.to.lat, endpoints.to.lon]).addTo(map);
    var r = scen || today, net = scen ? "scenario" : "today";
    var allPts = [[endpoints.from.lat, endpoints.from.lon], [endpoints.to.lat, endpoints.to.lon]];
    // A cased line (white halo under a thick colour) pops against the busy basemap.
    function ride(latlngs, color) {
      L.polyline(latlngs, { color: "#ffffff", weight: 9, opacity: 0.95 }).addTo(routeLayer);
      L.polyline(latlngs, { color: color, weight: 5.5, opacity: 1 }).addTo(routeLayer);
    }
    function walk(latlngs) {
      L.polyline(latlngs, { color: "#ffffff", weight: 6, opacity: 0.85 }).addTo(routeLayer);
      L.polyline(latlngs, { color: "#3A4750", weight: 3, opacity: 0.9, dashArray: "1 7", lineCap: "round" }).addTo(routeLayer);
    }
    // The O'Hare ATS people mover: a distinct dashed connector (purple, longer
    // dashes) so it doesn't read as a walking path.
    function ats(latlngs) {
      L.polyline(latlngs, { color: "#ffffff", weight: 7, opacity: 0.9 }).addTo(routeLayer);
      L.polyline(latlngs, { color: "#7B2CBF", weight: 4, opacity: 1, dashArray: "10 6" }).addTo(routeLayer);
    }
    var d2 = function (p, lat, lon) { var dy = p[0] - lat, dx = p[1] - lon; return dy * dy + dx * dx; };
    // Draw a walk and add its points to the fit set.
    function drawWalk(latlngs) { walk(latlngs); latlngs.forEach(function (p) { allPts.push(p); }); }
    // Draw the ATS guideway clipped between two points, oriented A->B (lineSlice
    // returns it in native order, so flip it or A stitches to the far end and
    // draws a straight backtrack). Falls back to a straight dash.
    function drawGuideway(aLat, aLon, bLat, bLon) {
      var g = clipLine("ATS", aLat, aLon, bLat, bLon);
      var line;
      if (g && g.length) {
        if (d2(g[g.length - 1], aLat, aLon) < d2(g[0], aLat, aLon)) g = g.slice().reverse();
        line = [[aLat, aLon]].concat(g, [[bLat, bLon]]);
      } else {
        line = [[aLat, aLon], [bLat, bLon]];
      }
      ats(line);
      line.forEach(function (p) { allPts.push(p); });
    }
    // Connector between an O'Hare rail station and a terminal marker. From
    // O'Hare Transfer it's a real sidewalk walk to the MMF (OSM geometry) plus,
    // for ATS destinations, the guideway ride; the MMF itself is walk-only. From
    // the Blue Line it's the guideway ride, or a short straight walk to T1/T2/T3.
    function drawAirportHop(station, ep) {
      var sk = ohareStationKey(station.id);
      var atsRide = ohareHopMode(sk, ep.airport) === "ats";
      var stLL = [station.lat, station.lon], termLL = [ep.lat, ep.lon];
      if (sk === "transfer" && MMF_WALK && MMF_WALK.length) {
        var w = d2(MMF_WALK[MMF_WALK.length - 1], stLL[0], stLL[1]) < d2(MMF_WALK[0], stLL[0], stLL[1])
          ? MMF_WALK.slice().reverse() : MMF_WALK.slice();
        drawWalk([stLL].concat(w));
        var mmf = w[w.length - 1];
        if (atsRide) drawGuideway(mmf[0], mmf[1], termLL[0], termLL[1]);
        else drawWalk([mmf, termLL]);
        return;
      }
      if (atsRide) drawGuideway(stLL[0], stLL[1], termLL[0], termLL[1]);
      else drawWalk([stLL, termLL]);
    }
    // Draw one clipped rail leg, connecting the track to its station endpoints.
    // A small station<->track gap is folded into the track (no visible seam); a
    // real gap — e.g. Metra Union Station to the X1 tunnel a block west under
    // Clinton St — is drawn as a *walk*, since that connection is on foot, not a
    // one-seat ride. Orients the geometry to run from -> to.
    var WALK_GAP2 = 6.4e-7;   // (~90 m)^2 in deg^2
    function drawClipped(code, from, to, color) {
      var geom = clipLine(code, from[0], from[1], to[0], to[1]);
      if (!geom || !geom.length) { ride([from, to], color); allPts.push(from); allPts.push(to); return; }
      if (d2(geom[geom.length - 1], from[0], from[1]) < d2(geom[0], from[0], from[1])) geom = geom.slice().reverse();
      var g0 = geom[0], gN = geom[geom.length - 1], line = geom.slice();
      if (d2(from, g0[0], g0[1]) > WALK_GAP2) drawWalk([from, g0]); else line = [from].concat(line);
      if (d2(to,   gN[0], gN[1]) > WALK_GAP2) drawWalk([to, gN]);   else line = line.concat([to]);
      ride(line, color);
      line.forEach(function (p) { allPts.push(p); });
    }
    // A South Shore leg: a Monon-branch station is reached by tracing the main
    // line to Hammond Gateway, then the Monon branch out to the station; every
    // other station traces the main line directly.
    function drawSSLLeg(leg, from, to) {
      var col = lineColor("SSL");
      var stName = (SSL && SSL.byName[leg.to]) ? leg.to : leg.from;
      var st  = SSL && SSL.byName[stName];
      var ham = SSL && SSL.byName["Hammond Gateway"];
      if (st && st.branch === "monon" && ham) {
        var hamLL = [ham.lat, ham.lon];
        var hubLL = (stName === leg.to) ? from : to;
        var stLL  = (stName === leg.to) ? to : from;
        drawClipped("SSL", hubLL, hamLL, col);
        drawClipped("SSL_MONON", hamLL, stLL, col);
      } else {
        drawClipped("SSL", from, to, col);
      }
    }
    if (r && r.legs && r.legs.length) {
      var fromAirport = endpoints.from.airport && ohareStationKey(r.board.id);
      var toAirport   = endpoints.to.airport   && ohareStationKey(r.alight.id);
      var prevPt = [endpoints.from.lat, endpoints.from.lon], prevSt = null;
      r.legs.forEach(function (leg, i) {
        var fromSt = stNamed(leg.from, leg, prevPt);
        var from = fromSt ? [fromSt.lat, fromSt.lon] : null;
        var toSt = stNamed(leg.to, leg, from || prevPt);
        var to = toSt ? [toSt.lat, toSt.lon] : null;
        // i===0 is the access hop (the walk from the address, or the airport
        // connector); i>0 are transfer walks, drawn straight.
        if (from) {
          if (i === 0 && fromAirport) drawAirportHop(r.board, endpoints.from);
          else if (i === 0) drawWalk(accessLine("from", fromSt, r.board));
          else walk([prevPt, from]);
          allPts.push(from);
        }
        if (from && to) {
          if (leg.ssl) drawSSLLeg(leg, from, to);
          else drawClipped(leg.line, from, to, lineColor(leg.line));
        }
        if (to) { prevPt = to; prevSt = toSt; }
      });
      if (toAirport) drawAirportHop(r.alight, endpoints.to);
      else if (prevSt) drawWalk(accessLine("to", prevSt, r.alight));
      else walk([prevPt, [endpoints.to.lat, endpoints.to.lon]]);
    } else if (r) {
      ride([[endpoints.from.lat, endpoints.from.lon], [r.board.lat, r.board.lon],
            [r.alight.lat, r.alight.lon], [endpoints.to.lat, endpoints.to.lon]], "#0B7285");
    }
    map.fitBounds(L.latLngBounds(allPts).pad(0.15));
  }

  /* ---- setting an endpoint (used by examples, permalinks, and geocode) -- */
  function setEndpoint(which, ep) {
    endpoints[which] = ep;
    prepareWalk(which);   // start fetching this end's street tiles now (memoized)
    var inp = document.getElementById(which);
    if (inp) inp.value = ep.label;
    var list = document.getElementById(which + "-list");   // may be absent (Option B has no dropdown)
    if (list) list.innerHTML = "";
    // A plain (non-airport) endpoint has no terminal picker.
    var tbox = document.getElementById(which + "-terminal");
    if (tbox && !ep.airport) tbox.innerHTML = "";
  }

  /* ---- Option A: predefined trips --------------------------------------- */
  // Set one end of a predefined trip: an O'Hare terminal (via `airport`) or a
  // plain {lat,lon,label} point.
  function setTripEnd(which, e) {
    if (e && e.airport && OHARE.terminals[e.airport]) setOhareEndpoint(which, e.airport);
    else if (e && e.ssl && SSL && SSL.byId[e.ssl]) {
      var s = SSL.byId[e.ssl];
      setEndpoint(which, { lat: s.lat, lon: s.lon, label: s.name, ssl: s.ssl });
    }
    else setEndpoint(which, { lat: e.lat, lon: e.lon, label: e.label });
  }
  var PREDEFINED_VISIBLE = 4;   // trips beyond this hide under a "see more" toggle
  function renderPredefinedTrips() {
    var box = document.getElementById("predefined-trips");
    if (!box || !Array.isArray(CFG.predefined_trips)) return;
    var moreBox = document.getElementById("predefined-trips-more");
    var moreWrap = document.getElementById("predefined-more-wrap");
    box.innerHTML = "";
    if (moreBox) moreBox.innerHTML = "";
    CFG.predefined_trips.forEach(function (trip, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn trip-btn text-start w-100";
      b.innerHTML = '<span class="fw-semibold d-block">' + trip.title + '</span>' +
        (trip.blurb ? '<span class="small blurb">' + trip.blurb + '</span>' : "");
      b.addEventListener("click", function () {
        setTripEnd("from", trip.from);
        setTripEnd("to", trip.to);
        onPlan("predefined");
      });
      (i < PREDEFINED_VISIBLE ? box : (moreBox || box)).appendChild(b);
    });
    if (moreWrap) {
      var extra = CFG.predefined_trips.length - PREDEFINED_VISIBLE;
      moreWrap.hidden = extra <= 0;
      // the toggle says how many trips it holds, and how to fold them away again
      var label = function () {
        document.getElementById("predefined-more-label").textContent = moreWrap.open
          ? "Show fewer example trips" : "See " + extra + " more example trip" + (extra === 1 ? "" : "s");
      };
      label();
      moreWrap.addEventListener("toggle", label);
    }
  }

  /* ---- permalinks ------------------------------------------------------- */
  // Build the query params that describe the current trip.
  function tripParams(slice, today, scen) {
    var p = new URLSearchParams();
    p.set("ol", endpoints.from.label);
    p.set("olat", endpoints.from.lat.toFixed(5));
    p.set("olon", endpoints.from.lon.toFixed(5));
    p.set("dl", endpoints.to.label);
    p.set("dlat", endpoints.to.lat.toFixed(5));
    p.set("dlon", endpoints.to.lon.toFixed(5));
    if (endpoints.from.airport) p.set("oa", endpoints.from.airport);   // O'Hare terminal
    if (endpoints.to.airport)   p.set("da", endpoints.to.airport);
    p.set("sl", slice);
    if (today) p.set("td", Math.round(today.total));
    if (scen) p.set("xd", Math.round(scen.total));
    return p;
  }
  // Update the address bar (shareable planner URL) and return the Worker-backed
  // share URL (which serves per-trip og: image + tags for social previews).
  function updatePermalink(slice, today, scen) {
    var p = tripParams(slice, today, scen);
    history.replaceState(null, "", location.pathname + "?" + p.toString());
    return CFG.workerBase + "/s?" + p.toString();
  }
  // A stable, anonymous per-browser id (random UUID in localStorage) so we can
  // estimate distinct visitors and trips-per-person. Not PII and not shared
  // across sites; absent in private mode or where storage/crypto is unavailable.
  function clientId() {
    try {
      var id = localStorage.getItem("btt_cid");
      if (!id && window.crypto && crypto.randomUUID) {
        id = crypto.randomUUID();
        localStorage.setItem("btt_cid", id);
      }
      return id || null;
    } catch (e) { return null; }
  }

  // Transfer count for one network's result (0 = one-seat ride), or null.
  function transfersOf(r, net) {
    var rr = r ? parseRoutes(r.routes, net) : null;
    return rr ? rr.transfers : null;
  }
  // The distinct CrossTowner tunnel routes (X1–X6) a scenario trip rides, as a
  // comma-joined string ("X5" / "X1,X3"), or null if it uses none.
  function xRoutesOf(scen) {
    if (!scen || !scen.routes) return null;
    var seen = {}, out = [];
    scen.routes.split("|").forEach(function (t) {
      t = t.replace(/[\[\]]/g, "");
      if (/^X[1-6]$/.test(t) && !seen[t]) { seen[t] = 1; out.push(t); }
    });
    return out.length ? out.join(",") : null;
  }

  // Session context captured once on load (see captureContext): how the visitor
  // arrived (referring host + campaign tags) and a coarse device class. Attached
  // to every logged trip so we can gauge reach and channel performance.
  var ATTR = { ref_host: null, utm_source: null, utm_medium: null, utm_campaign: null };
  var DEVICE = null;
  function captureContext() {
    try {
      var q = new URLSearchParams(location.search);
      ATTR.utm_source   = (q.get("utm_source")   || "").slice(0, 60) || null;
      ATTR.utm_medium   = (q.get("utm_medium")   || "").slice(0, 60) || null;
      ATTR.utm_campaign = (q.get("utm_campaign") || "").slice(0, 80) || null;
      var ref = document.referrer || "";
      if (!ref) { ATTR.ref_host = "direct"; }
      else {
        var h = new URL(ref).hostname.replace(/^www\./, "");
        ATTR.ref_host = (h === location.hostname.replace(/^www\./, "")) ? "internal" : h;
      }
    } catch (e) {}
    try {
      var coarse = window.matchMedia && matchMedia("(pointer: coarse)").matches;
      var w = window.innerWidth || 0;
      DEVICE = coarse ? (w && w < 768 ? "mobile" : "tablet") : "desktop";
    } catch (e) { DEVICE = null; }
  }

  // A random per-trip token (echoed back with a later "shared" event so we can
  // flag the exact trip row without racing on the server's row id).
  function randomToken() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return "t" + Date.now() + "-" + Math.floor(Math.random() * 1e9);
  }

  // Fire-and-forget POST to /track. Never throws — analytics must never disrupt
  // planning.
  function postJSON(payload) {
    try {
      fetch(CFG.workerBase + "/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify(payload)
      }).catch(function () {});
    } catch (e) {}
  }
  // Attach the anonymous id + session context to a logging payload and send it.
  function logTrack(payload) {
    payload.cid = clientId();
    payload.device = DEVICE;
    payload.ref_host = ATTR.ref_host;
    payload.utm_source = ATTR.utm_source;
    payload.utm_medium = ATTR.utm_medium;
    payload.utm_campaign = ATTR.utm_campaign;
    postJSON(payload);
  }

  // Log a completed trip: the *stations* (not the address typed — see the
  // methodology's privacy note), the two travel times, transfer counts, and any
  // CrossTowner X-route used. Prefer the scenario trip's stations; fall back to
  // today's. "Trip made possible" is derivable: today_min IS NULL and
  // scenario_min IS NOT NULL. `ttoken` lets a later share event flag this row.
  function trackTrip(slice, today, scen, source, ttoken) {
    var r = scen || today;
    if (!r || !r.board || !r.alight) return;
    // When an end is an O'Hare terminal, keep its full label (e.g. "O'Hare —
    // Terminal 3") so we can see which terminal people pick — the station name
    // alone can't tell T1 from T5. Only set for airport ends, so a normal trip
    // still stores no typed address.
    var oTerm = endpoints.from && endpoints.from.airport ? endpoints.from.label : null;
    var dTerm = endpoints.to   && endpoints.to.airport   ? endpoints.to.label   : null;
    logTrack({
      result: "ok",
      // A South Shore trip logs its real end station (e.g. "Gary Metro Center"),
      // not the hub — still a station name, so the privacy model is unchanged.
      origin: r.boardLabel || r.board.name,
      destination: r.alightLabel || r.alight.name,
      slice: slice,
      today_min: today ? Math.round(today.total) : null,
      scenario_min: scen ? Math.round(scen.total) : null,
      transfers_today: transfersOf(today, "today"),
      transfers_scenario: transfersOf(scen, "scenario"),
      x_route: xRoutesOf(scen),
      source: source || "search",
      ttoken: ttoken || null,
      origin_terminal: oTerm,
      dest_terminal: dTerm
    });
  }

  // The raw text still in an address box — the user's actual keystrokes (e.g.
  // "zion station"), before the geocoder rewrote it to a labeled result. Picking
  // an autocomplete suggestion sets the endpoint but leaves the typed text in the
  // box, so this is a faithful record of what was entered. Empty for predefined/
  // permalink trips (no typing). Kept for failed searches only.
  function rawInput(which) {
    var box = document.getElementById(which === "from" ? "from" : "to");
    var v = box && box.value ? box.value.trim() : "";
    return v ? v.slice(0, 160) : null;
  }

  // Diagnose *why* a search found no trip, so unmet demand is actionable. Uses
  // the scenario network — the most permissive (it adds the infill, CrossTowner,
  // and Red Line Extension stations); if even that can't reach an endpoint, no
  // network can. Reports which end(s) lack a walkable station and the nearest
  // station to each end. Stores the nearest *station* (name + walk minutes),
  // never the typed address — same privacy model as a successful trip.
  function diagnoseNoRoute(slice) {
    var f = endpoints.from, t = endpoints.to;
    var oCands = candidateStations(f, "scenario", "from");
    var dCands = candidateStations(t, "scenario", "to");
    var oReach = oCands.length > 0, dReach = dCands.length > 0;
    // Nearest station to each end, ignoring the walk cap. Airport and South Shore
    // ends always have a serving station/hub, so skip them.
    var oNear = f && !f.airport && !f.ssl ? nearestAnyStation(f.lat, f.lon) : null;
    var dNear = t && !t.airport && !t.ssl ? nearestAnyStation(t.lat, t.lon) : null;

    var reason;
    if (!oReach && !dReach) reason = "both_no_station";
    else if (!oReach)       reason = "origin_no_station";
    else if (!dReach)       reason = "dest_no_station";
    else {
      // Both ends have a walkable station, yet no route was found. bestTotal has
      // already fetched and cached these scenario origin shards, so inspect them:
      // a real station's shard always reaches other stations, so an empty/missing
      // one means getShard swallowed a fetch error (missing shard, 404, offline)
      // — a data problem, not a genuine gap. Only when a shard actually loaded
      // with entries but none reach the destination stations is the pair truly
      // unreachable (rare on a connected network; usually a matrix/data hole).
      var anyLoaded = oCands.some(function (o) {
        var sh = shardCache["scenario/" + slice + "/" + o.station.id];
        return sh && Object.keys(sh).length > 0;
      });
      reason = anyLoaded ? "pair_unreachable" : "route_data_missing";
    }
    return {
      fail_reason: reason,
      origin: oNear ? oNear.station.name : null,
      destination: dNear ? dNear.station.name : null,
      origin_walk_min: oNear ? Math.round(oNear.walk) : null,
      dest_walk_min: dNear ? Math.round(dNear.walk) : null,
      // For a failed search only, also keep what the user typed and the geocoded
      // coordinates, so unmet demand shows the real places people wanted and can
      // be mapped (a successful trip never stores either). `*_input` is the raw
      // string still in the box (the actual keystrokes, e.g. "zion station");
      // `*_typed` is the geocoder's chosen label (e.g. "Zion Mera Station") — the
      // two differ when a geocoder result is misspelled or mismatched, which is
      // exactly what we want to see.
      origin_input: rawInput("from"),
      dest_input: rawInput("to"),
      origin_typed: f && f.label ? f.label : null,
      dest_typed: t && t.label ? t.label : null,
      origin_lat: f && isFinite(f.lat) ? f.lat : null,
      origin_lon: f && isFinite(f.lon) ? f.lon : null,
      dest_lat: t && isFinite(t.lat) ? t.lat : null,
      dest_lon: t && isFinite(t.lon) ? t.lon : null
    };
  }

  // Log a search that produced no trip: no route found within the walk cap, an
  // out-of-county endpoint, or a geocode miss. Captures unmet demand. `extra`
  // (no_route only) carries the diagnosed reason and nearest stations; the other
  // kinds are self-explaining from `result` and store no station/address.
  function logFailed(result, slice, source, extra) {
    var p = { result: result, slice: slice, source: source || "search" };
    if (extra) {
      p.fail_reason = extra.fail_reason;
      p.origin = extra.origin;
      p.destination = extra.destination;
      p.origin_walk_min = extra.origin_walk_min;
      p.dest_walk_min = extra.dest_walk_min;
      p.origin_input = extra.origin_input;
      p.dest_input = extra.dest_input;
      p.origin_typed = extra.origin_typed;
      p.dest_typed = extra.dest_typed;
      p.origin_lat = extra.origin_lat;
      p.origin_lon = extra.origin_lon;
      p.dest_lat = extra.dest_lat;
      p.dest_lon = extra.dest_lon;
    }
    logTrack(p);
  }

  // Flag a trip's row as shared once, when the user copies its share link.
  var sharedTokens = {};
  function markShared(ttoken) {
    if (!ttoken || sharedTokens[ttoken]) return;
    sharedTokens[ttoken] = 1;
    postJSON({ shared: true, ttoken: ttoken });
  }

  // On load, if the URL already describes a trip, restore and run it.
  function applyPermalink() {
    var p = new URLSearchParams(location.search);
    if (!p.get("olat") || !p.get("dlat")) return;
    if (p.get("oa") && OHARE.terminals[p.get("oa")]) setOhareEndpoint("from", p.get("oa"));
    else setEndpoint("from", snapSouthShore({ lat: +p.get("olat"), lon: +p.get("olon"), label: p.get("ol") || "Origin" }));
    if (p.get("da") && OHARE.terminals[p.get("da")]) setOhareEndpoint("to", p.get("da"));
    else setEndpoint("to", snapSouthShore({ lat: +p.get("dlat"), lon: +p.get("dlon"), label: p.get("dl") || "Destination" }));
    if (p.get("sl")) document.getElementById("slice").value = p.get("sl");
    onPlan("permalink");
  }

  /* ---- geocode autocomplete wiring -------------------------------------- */
  function wireAutocomplete(inputId, listId, which) {
    var input = document.getElementById(inputId);
    var list = document.getElementById(listId);
    var timer = null;
    input.addEventListener("input", function () {
      endpoints[which] = null;
      var tbox = document.getElementById(which + "-terminal");
      if (tbox) tbox.innerHTML = "";
      clearTimeout(timer);
      var text = input.value.trim();
      if (text.length < 4) { list.innerHTML = ""; return; }
      timer = setTimeout(function () {
        geocode(text).then(function (fc) {
          list.innerHTML = "";
          (fc.features || []).slice(0, 5).forEach(function (f) {
            var lon = f.geometry.coordinates[0], lat = f.geometry.coordinates[1];
            var label = f.properties.label || f.properties.name;
            var li = document.createElement("li");
            li.className = "list-group-item list-group-item-action small";
            li.style.cursor = "pointer";
            li.textContent = label;
            li.addEventListener("click", function () {
              if (isOhare(label)) {   // let the rider pick a terminal instead of snapping
                setOhareEndpoint(which, OHARE_DEFAULT);
                if (endpoints.from && endpoints.to) onPlan();
                return;
              }
              var ep = snapSouthShore(snapGeocode({ lat: lat, lon: lon, label: label }));
              // South Shore endpoints are the one exception to the in-county rule
              // (they run east into Indiana) — they route via a shared hub.
              if (!ep.ssl && !pointInCounties(ep.lon, ep.lat, counties)) {
                list.innerHTML = '<li class="list-group-item text-danger small">Trips must ' +
                  'start and end in a Metra-service county (Cook, DuPage, Lake, Kane, ' +
                  'McHenry, Will) — or a South Shore Line station.</li>';
                return;
              }
              setEndpoint(which, ep);
              if (endpoints.from && endpoints.to) onPlan();
            });
            list.appendChild(li);
          });
        }).catch(function () {
          list.innerHTML = '<li class="list-group-item text-danger small">Address lookup is unavailable right now.</li>';
        });
      }, 300);
    });
  }

  /* ---- resolve an endpoint from a typed address (Option B has no dropdown) */
  // Returns a promise for {lat,lon,label} | {error} | null. Uses an already-set
  // endpoint (from a predefined trip or permalink) when the input is unchanged;
  // otherwise geocodes the typed text and takes the top in-county result.
  function resolveEndpoint(which) {
    var input = document.getElementById(which);
    var text = input ? input.value.trim() : "";
    if (endpoints[which] && endpoints[which].label === text) return Promise.resolve(endpoints[which]);
    if (!text) return Promise.resolve(null);
    return geocode(text).then(function (fc) {
      var f = (fc.features || [])[0];
      if (!f) return { error: "notfound", which: which };
      var lon = f.geometry.coordinates[0], lat = f.geometry.coordinates[1];
      var label = f.properties.label || f.properties.name;
      if (isOhare(label)) {   // typed "O'Hare" + Plan: default a terminal, show the picker
        setOhareEndpoint(which, OHARE_DEFAULT);
        return endpoints[which];
      }
      var ep = snapSouthShore(snapGeocode({ lat: lat, lon: lon, label: label }));
      if (!ep.ssl && !pointInCounties(ep.lon, ep.lat, counties)) return { error: "county", which: which };
      setEndpoint(which, ep);
      return ep;
    }).catch(function () { return { error: "geocoder", which: which }; });
  }

  /* ---- plan button ------------------------------------------------------ */
  // `source` records how the trip was initiated, for the /track log. Only the
  // predefined-button and permalink paths pass it explicitly; everything else
  // (Plan button, autocomplete pick, swap) is a normal "search". The Plan
  // button passes a click Event here, so anything unrecognized normalizes to
  // "search".
  var planSeq = 0;   // bumped per plan, so a slower earlier plan can't overwrite a newer one
  function onPlan(source) {
    var seq = ++planSeq;
    var src = (source === "predefined" || source === "permalink") ? source : "search";
    var slice = document.getElementById("slice").value;
    var res = document.getElementById("results");
    res.innerHTML = '<p class="text-secondary small">Planning…</p>';
    showMapLoading(true);
    Promise.all([resolveEndpoint("from"), resolveEndpoint("to")]).then(function (eps) {
      var bad = eps.filter(function (e) { return e && e.error; })[0];
      if (bad) {
        var msg = bad.error === "county"
          ? "Trips must start and end in a Metra-service county (Cook, DuPage, Lake, Kane, McHenry, Will)."
          : bad.error === "notfound" ? "Couldn't find that address — try adding a city."
          : "Address lookup is unavailable right now.";
        res.innerHTML = '<p class="text-danger small">' + msg + '</p>';
        var kind = bad.error === "county" ? "out_of_county"
                 : bad.error === "notfound" ? "geocode_notfound" : "geocode_error";
        logFailed(kind, slice, src);
        showMapLoading(false);
        return;
      }
      if (!endpoints.from || !endpoints.to) {
        res.innerHTML = '<p class="text-secondary small">Enter a starting point and a destination, ' +
          'or pick a predefined trip above.</p>';
        showMapLoading(false);
        return;
      }
      // Walk times from each end first (street network, or the straight-line
      // fallback); candidate stations and totals are built from them.
      return Promise.all([prepareWalk("from"), prepareWalk("to")]).then(function (w) {
        if (seq !== planSeq) return null;
        walks.from = w[0]; walks.to = w[1];
        return Promise.all([bestTotal("today", slice), bestTotal("scenario", slice)]);
      }).then(function (r) {
        if (!r || seq !== planSeq) return;
        renderResults(slice, r[0], r[1]);
        if (!r[0] && !r[1]) { logFailed("no_route", slice, src, diagnoseNoRoute(slice)); return; }
        var shareUrl = updatePermalink(slice, r[0], r[1]);
        var ttoken = randomToken();
        addShareButton(shareUrl, ttoken);
        trackTrip(slice, r[0], r[1], src, ttoken);
      });
    }).catch(function () { showMapLoading(false); });   // never leave the spinner stuck
  }

  // Append a "Copy share link" button; the link carries a per-trip og: preview.
  // Copying flags this trip's row as shared (once), via its ttoken.
  function addShareButton(shareUrl, ttoken) {
    var el = document.getElementById("results");
    var wrap = document.createElement("div");
    wrap.className = "mt-1";
    var btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-secondary";
    btn.textContent = "Copy share link";
    btn.addEventListener("click", function () {
      markShared(ttoken);
      navigator.clipboard.writeText(shareUrl).then(function () {
        btn.textContent = "Link copied!";
        setTimeout(function () { btn.textContent = "Copy share link"; }, 1500);
      });
    });
    wrap.appendChild(btn);
    el.appendChild(wrap);
  }

  function onSwap() {
    var tmp = endpoints.from; endpoints.from = endpoints.to; endpoints.to = tmp;
    var fi = document.getElementById("from"), ti = document.getElementById("to");
    var t = fi.value; fi.value = ti.value; ti.value = t;
    renderTerminalPicker("from"); renderTerminalPicker("to");   // pickers follow their endpoint
    if (endpoints.from && endpoints.to) onPlan();
  }

  /* ---- reset ------------------------------------------------------------ */
  /*
   * Return the planner to its blank first-load state: forget both endpoints,
   * empty the address inputs and their autocomplete lists, clear the results,
   * strip every drawn object (route lines + origin/destination markers) off the
   * map and recenter it, and rewrite the address bar back to the bare planner
   * URL (dropping the shareable ?trip params).
   */
  function onReset() {
    planSeq++;   // drop any plan still in flight
    endpoints = { from: null, to: null };
    walks = { from: null, to: null };
    ["from", "to"].forEach(function (which) {
      var inp = document.getElementById(which);
      if (inp) inp.value = "";
      var list = document.getElementById(which + "-list");   // Option B has none
      if (list) list.innerHTML = "";
      var tbox = document.getElementById(which + "-terminal");
      if (tbox) tbox.innerHTML = "";
    });
    document.getElementById("results").innerHTML = "";
    showMapLoading(false);
    var note = document.getElementById("method-note");
    if (note) note.innerHTML = "";
    // Wipe the map: route polylines live in routeLayer; the two markers don't.
    if (routeLayer) routeLayer.clearLayers();
    if (fromMarker) { map.removeLayer(fromMarker); fromMarker = null; }
    if (toMarker) { map.removeLayer(toMarker); toMarker = null; }
    if (map) map.setView([41.85, -87.72], 10);
    // Drop the ?trip query so the URL is the clean, unshared planner address.
    history.replaceState(null, "", location.pathname);
  }

  /* ---- feedback --------------------------------------------------------- */
  function initFeedback() {
    var modal = new bootstrap.Modal(document.getElementById("feedbackmodal"));
    document.getElementById("feedback-btn").addEventListener("click", function () { modal.show(); });
    document.getElementById("feedbackform").addEventListener("submit", function (e) {
      e.preventDefault();
      if (document.getElementById("fb-hp").value) return;       // honeypot
      var message = document.getElementById("fb-message").value.trim();
      if (!message) return;
      var status = document.getElementById("fb-status");
      status.textContent = "Sending…";
      fetch(CFG.workerBase + "/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
          email: document.getElementById("fb-email").value.trim(),
          trip: location.search                                  // the trip they were viewing
        })
      }).then(function (r) {
        if (!r.ok) throw new Error();
        status.textContent = "Thanks — sent!";
        document.getElementById("fb-message").value = "";
        document.getElementById("fb-email").value = "";
        setTimeout(function () { modal.hide(); status.textContent = ""; }, 1200);
      }).catch(function () { status.textContent = "Couldn't send — please try again."; });
    });
  }

  /* ---- boot ------------------------------------------------------------- */
  function boot() {
    captureContext();   // referrer/UTM/device — before applyPermalink rewrites the URL
    initMap();
    initFeedback();
    // Populate the slice selector.
    var sel = document.getElementById("slice");
    CFG.slices.forEach(function (s) {
      var o = document.createElement("option");
      o.value = s.id; o.textContent = s.label; sel.appendChild(o);
    });
    document.getElementById("plan").addEventListener("click", onPlan);
    document.getElementById("swap").addEventListener("click", onSwap);
    document.getElementById("reset").addEventListener("click", onReset);
    // Live geocode autocomplete for the Option B address fields.
    wireAutocomplete("from", "from-list", "from");
    wireAutocomplete("to", "to-list", "to");
    Promise.all([
      loadJSON(dataURL("/stations.json")),
      loadJSON(dataURL("/metra_counties.geojson")),
      loadJSON(dataURL("/lines.json")).catch(function () { return null; }),
      loadJSON(dataURL("/ats.json")).catch(function () { return null; }),
      loadJSON(dataURL("/southshore.json")).catch(function () { return null; }),
      loadJSON(dataURL("/matrix/manifest.json")).catch(function () { return null; })
    ]).then(function (r) {
      // Does this matrix itemize its walking? It's a property of the whole
      // build, not of one cell: 8.8% of cells legitimately have no walk at all
      // (the station point *is* the stop), and reading "no walk legs here" as
      // "this data is the old kind" would drop their waiting time.
      MATRIX_WALKED = !!(r[5] && r[5].walk_legs);
      stations = r[0]; counties = r[1]; LINES = r[2] || {};
      // Register the O'Hare ATS guideway as a clippable "line" so the map can
      // trace it, and keep the Metra-Transfer<->MMF sidewalk for the walk hop.
      if (r[3]) {
        LINES.ATS = r[3].guideway;
        MMF_WALK = (r[3].mmfWalk || []).map(function (c) { return [c[1], c[0]]; });  // [lon,lat] -> [lat,lon]
      }
      stations.forEach(function (s) {
        (stationsByName[s.name] || (stationsByName[s.name] = [])).push(s);
        stationById[s.id] = s;
      });
      initSSL(r[4]);             // South Shore Line graft (adds LINES.SSL)
      renderPredefinedTrips();   // Option A one-click trips
      applyPermalink();          // if the URL already describes a trip, run it
    });
  }

  if (document.readyState !== "loading") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
