/*
 * app.js -- CrossTowner trip planner (static, client-side).
 *
 * Flow:
 *   1. Email wall: first visit shows a modal; the address is POSTed to the
 *      Worker and a localStorage flag reveals the tool.
 *   2. The user types an origin and destination address; each is geocoded via
 *      the Worker's Geocode.earth proxy and validated to be inside a
 *      Metra-service county.
 *   3. For a chosen departure slice we snap each endpoint to its nearest
 *      stations, look up the precomputed station-to-station minutes for both
 *      the "today" and "scenario" networks, add the walking access/egress, and
 *      show the best total for each -- so the rider sees today vs CrossTowner.
 *
 * All routing is precomputed; this file only does geometry + lookups.
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
  var stationByName = {};     // station name -> {lat,lon} (for leg endpoints)
  var endpoints = { from: null, to: null };  // {lat,lon,label}
  var map, fromMarker, toMarker, routeLayer;

  /* ---- data loading ----------------------------------------------------- */
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

  /* ---- nearest stations within the walk cap ----------------------------- */
  function nearestStations(lat, lon, network) {
    var cands = [];
    for (var i = 0; i < stations.length; i++) {
      var s = stations[i];
      // On the "today" network, only stations that exist today are boardable;
      // scenario allows the infill stations too.
      if (network === "today" && !s.exists_today) continue;
      var km = haversineKm(lat, lon, s.lat, s.lon);
      var wmin = walkMinutes(km);
      if (wmin <= CFG.maxWalkMin) cands.push({ station: s, walk: wmin });
    }
    cands.sort(function (a, b) { return a.walk - b.walk; });
    return cands.slice(0, CFG.nearestK);
  }

  // Fetch (and cache) one origin shard: { destId: minutes }.
  function getShard(network, slice, originId) {
    var key = network + "/" + slice + "/" + originId;
    if (shardCache[key]) return Promise.resolve(shardCache[key]);
    var path = CFG.dataBase + "/matrix/" + key + ".json";
    return loadJSON(path)
      .then(function (obj) { shardCache[key] = obj; return obj; })
      .catch(function () { shardCache[key] = {}; return {}; }); // unreachable origin
  }

  /* ---- the core lookup: best door-to-door total for one network --------- */
  function bestTotal(network, slice) {
    var origins = nearestStations(endpoints.from.lat, endpoints.from.lon, network);
    var dests   = nearestStations(endpoints.to.lat,   endpoints.to.lon,   network);
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
          var legs   = (typeof cell === "object") ? cell.legs : null;
          if (ride == null) return;
          var total = entry.o.walk + ride + d.walk;
          if (!best || total < best.total) {
            best = {
              total: total,
              access: entry.o.walk, egress: d.walk, ride: ride, routes: routes, legs: legs,
              board: entry.o.station, alight: d.station
            };
          }
        });
      });
      return best;
    });
  }

  /* ---- render ----------------------------------------------------------- */
  function renderResults(slice, today, scen) {
    var el = document.getElementById("results");
    if (!today && !scen) {
      el.innerHTML = '<p class="text-secondary small">No reasonable rail trip found for ' +
        'this origin and destination within a ' + CFG.maxWalkMin +
        '-minute walk of a station.</p>';
      return;
    }
    function card(title, accent, r, net) {
      if (!r) return '<div class="card"><div class="card-body py-2 px-3">' +
        '<h2 class="h6 mb-1">' + title + '</h2>' +
        '<p class="text-secondary small mb-0">No rail trip found.</p></div></div>';
      var wc = (r.board.wheelchair === 1 && r.alight.wheelchair === 1) ?
        '<div class="small text-crcl mb-1">&#9855; Both stations are wheelchair-accessible</div>' : '';
      var rr = parseRoutes(r.routes, net);
      var xfers = rr ? rr.transfers : 0;
      var steps;
      if (r.legs && r.legs.length) {
        // Detailed legs: board/alight stations + in-vehicle ride per vehicle.
        // Per-leg wait is intentionally not shown: the headline time is the
        // 30-minute-window median (typical waiting is folded into it), so a
        // single departure's wait would be both misleading and inconsistent.
        steps = '<li>Walk ' + fmtMin(r.access) + ' to <b>' + r.legs[0].from + '</b></li>';
        r.legs.forEach(function (leg, i) {
          var label = routeLabel(leg.line, net) || leg.mode;
          // An out-of-station transfer: previous leg alighted at a different station.
          if (i > 0 && r.legs[i - 1].to !== leg.from) {
            steps += '<li><span class="text-secondary">Transfer: walk from ' +
              r.legs[i - 1].to + ' to <b>' + leg.from + '</b></span></li>';
          }
          // Service frequency makes the CrossTowner benefit visible: the same
          // corridor often runs more often in the scenario (added X-route trains).
          var freqTxt = leg.freq ? ' &middot; a train every ~' + leg.freq + ' min' : '';
          steps += '<li>Board the <b>' + label + '</b> at ' + leg.from +
            '<div class="text-secondary">' + leg.ride + ' min &rarr; alight ' + leg.to +
            freqTxt + '</div></li>';
        });
        steps += '<li>Walk ' + fmtMin(r.egress) + ' to your destination</li>';
      } else {
        // Fallback: route sequence only (no station-level detail).
        steps = '<li>Walk ' + fmtMin(r.access) + ' to ' + r.board.name + '</li>';
        if (rr && rr.labels.length) {
          rr.labels.forEach(function (lbl, i) {
            steps += '<li>' + (i === 0 ? 'Board the <b>' : 'Transfer to the <b>') + lbl + '</b></li>';
          });
        } else {
          steps += '<li>Ride ' + r.board.name + ' &rarr; ' + r.alight.name + '</li>';
        }
        steps += '<li>Walk ' + fmtMin(r.egress) + ' to your destination</li>';
      }
      var sub = '<div class="text-secondary small mb-1">' + fmtMin(r.ride) +
        ' station-to-station &middot; ' + (xfers === 0 ? "one seat" :
          xfers + " transfer" + (xfers > 1 ? "s" : "")) +
        ' &middot; ' + r.board.name + ' &rarr; ' + r.alight.name + '</div>';
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
      delta = '<div class="alert mb-0 text-white small" style="background:var(--crcl)">' + (d > 0
        ? "CrossTowner is <b>" + d + " min faster</b>."
        : d < 0 ? "CrossTowner is " + (-d) + " min slower here."
                : "Same total time on this trip.") + '</div>';
    }
    el.innerHTML =
      card("Today", "#3A4750", today, "today") +
      card("With CrossTowner + Red Line Extension", "var(--crcl)", scen, "scenario") +
      delta +
      '<p class="text-secondary small mb-0">Precomputed median travel time, weekday ' +
        sliceLabel(slice) + ', 2.75 mph walk, 20-minute walk cap. The line you board ' +
        'reflects a representative departure at this time.</p>';
    drawRoute(today, scen);
  }

  function sliceLabel(id) {
    var s = CFG.slices.filter(function (x) { return x.id === id; })[0];
    return s ? s.label : id;
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
    X1:"#0B7285", X2:"#0B7285", X3:"#0B7285", X4:"#0B7285", X5:"#0B7285", X6:"#0B7285"
  };
  function lineColor(code) {
    if (LINE_COLOR[code]) return LINE_COLOR[code];
    if (/^\d/.test(code)) return "#8B979E";        // bus number -> grey
    return "#2b6cb0";                               // Metra lines -> blue
  }
  // Nearest vertex index of a path ([[lon,lat],...]) to a lat/lon.
  function nearestIdx(path, lat, lon) {
    var best = 0, bd = Infinity;
    for (var i = 0; i < path.length; i++) {
      var dy = path[i][1] - lat, dx = path[i][0] - lon, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = i; }
    }
    return { idx: best, d: bd };
  }
  // Clip a line (list of paths) between two stations -> [[lat,lon],...] board->alight.
  function clipLine(code, aLat, aLon, bLat, bLon) {
    var paths = LINES && LINES[code];
    if (!paths) return null;
    var bestPath = null, bestScore = Infinity, ai = 0, bi = 0;
    paths.forEach(function (p) {
      var na = nearestIdx(p, aLat, aLon), nb = nearestIdx(p, bLat, bLon);
      if (na.d + nb.d < bestScore) { bestScore = na.d + nb.d; bestPath = p; ai = na.idx; bi = nb.idx; }
    });
    if (!bestPath) return null;
    var lo = Math.min(ai, bi), hi = Math.max(ai, bi);
    var seg = bestPath.slice(lo, hi + 1).map(function (c) { return [c[1], c[0]]; });
    if (ai > bi) seg.reverse();
    return seg;
  }
  function stCoord(name) { var s = stationByName[name]; return s ? [s.lat, s.lon] : null; }

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
    if (r && r.legs && r.legs.length) {
      var prevPt = [endpoints.from.lat, endpoints.from.lon];
      r.legs.forEach(function (leg) {
        var from = stCoord(leg.from), to = stCoord(leg.to);
        if (from) { walk([prevPt, from]); allPts.push(from); }        // access/transfer walk
        var geom = (from && to) ? clipLine(leg.line, from[0], from[1], to[0], to[1]) : null;
        if (geom && geom.length > 1) {
          ride(geom, lineColor(leg.line)); geom.forEach(function (p) { allPts.push(p); });
        } else if (from && to) {
          ride([from, to], lineColor(leg.line)); allPts.push(to);
        }
        if (to) prevPt = to;
      });
      walk([prevPt, [endpoints.to.lat, endpoints.to.lon]]);            // egress walk
    } else if (r) {
      ride([[endpoints.from.lat, endpoints.from.lon], [r.board.lat, r.board.lon],
            [r.alight.lat, r.alight.lon], [endpoints.to.lat, endpoints.to.lon]], "#0B7285");
    }
    map.fitBounds(L.latLngBounds(allPts).pad(0.15));
  }

  /* ---- setting an endpoint (used by examples, permalinks, and geocode) -- */
  function setEndpoint(which, ep) {
    endpoints[which] = ep;
    var inp = document.getElementById(which);
    if (inp) inp.value = ep.label;
    var list = document.getElementById(which + "-list");   // may be absent (Option B has no dropdown)
    if (list) list.innerHTML = "";
  }

  /* ---- Option A: predefined trips --------------------------------------- */
  function renderPredefinedTrips() {
    var box = document.getElementById("predefined-trips");
    if (!box || !Array.isArray(CFG.predefined_trips)) return;
    box.innerHTML = "";
    CFG.predefined_trips.forEach(function (trip) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-outline-secondary text-start w-100";
      b.innerHTML = '<span class="fw-semibold d-block">' + trip.title + '</span>' +
        (trip.blurb ? '<span class="small text-secondary">' + trip.blurb + '</span>' : "");
      b.addEventListener("click", function () {
        setEndpoint("from", { lat: trip.from.lat, lon: trip.from.lon, label: trip.from.label });
        setEndpoint("to",   { lat: trip.to.lat,   lon: trip.to.lon,   label: trip.to.label });
        onPlan();
      });
      box.appendChild(b);
    });
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
  // On load, if the URL already describes a trip, restore and run it.
  function applyPermalink() {
    var p = new URLSearchParams(location.search);
    if (!p.get("olat") || !p.get("dlat")) return;
    setEndpoint("from", { lat: +p.get("olat"), lon: +p.get("olon"), label: p.get("ol") || "Origin" });
    setEndpoint("to", { lat: +p.get("dlat"), lon: +p.get("dlon"), label: p.get("dl") || "Destination" });
    if (p.get("sl")) document.getElementById("slice").value = p.get("sl");
    onPlan();
  }

  /* ---- geocode autocomplete wiring -------------------------------------- */
  function wireAutocomplete(inputId, listId, which) {
    var input = document.getElementById(inputId);
    var list = document.getElementById(listId);
    var timer = null;
    input.addEventListener("input", function () {
      endpoints[which] = null;
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
              if (!pointInCounties(lon, lat, counties)) {
                list.innerHTML = '<li class="list-group-item text-danger small">Trips must ' +
                  'start and end in a Metra-service county (Cook, DuPage, Lake, Kane, ' +
                  'McHenry, Will).</li>';
                return;
              }
              setEndpoint(which, { lat: lat, lon: lon, label: label });
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
      if (!pointInCounties(lon, lat, counties)) return { error: "county", which: which };
      var ep = { lat: lat, lon: lon, label: f.properties.label || f.properties.name };
      setEndpoint(which, ep);
      return ep;
    }).catch(function () { return { error: "geocoder", which: which }; });
  }

  /* ---- plan button ------------------------------------------------------ */
  function onPlan() {
    var slice = document.getElementById("slice").value;
    var res = document.getElementById("results");
    res.innerHTML = '<p class="text-secondary small">Planning…</p>';
    Promise.all([resolveEndpoint("from"), resolveEndpoint("to")]).then(function (eps) {
      var bad = eps.filter(function (e) { return e && e.error; })[0];
      if (bad) {
        var msg = bad.error === "county"
          ? "Trips must start and end in a Metra-service county (Cook, DuPage, Lake, Kane, McHenry, Will)."
          : bad.error === "notfound" ? "Couldn't find that address — try adding a city."
          : "Address lookup is unavailable right now.";
        res.innerHTML = '<p class="text-danger small">' + msg + '</p>';
        return;
      }
      if (!endpoints.from || !endpoints.to) {
        res.innerHTML = '<p class="text-secondary small">Enter a starting point and a destination, ' +
          'or pick a predefined trip above.</p>';
        return;
      }
      Promise.all([bestTotal("today", slice), bestTotal("scenario", slice)])
        .then(function (r) {
          renderResults(slice, r[0], r[1]);
          var shareUrl = updatePermalink(slice, r[0], r[1]);
          addShareButton(shareUrl);
        });
    });
  }

  // Append a "Copy share link" button; the link carries a per-trip og: preview.
  function addShareButton(shareUrl) {
    var el = document.getElementById("results");
    var wrap = document.createElement("div");
    wrap.className = "mt-1";
    var btn = document.createElement("button");
    btn.className = "btn btn-sm btn-outline-secondary";
    btn.textContent = "Copy share link";
    btn.addEventListener("click", function () {
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
    if (endpoints.from && endpoints.to) onPlan();
  }

  /* ---- email wall ------------------------------------------------------- */
  function initEmailWall() {
    var KEY = "btt_planner_email_ok";
    var wall = new bootstrap.Modal(document.getElementById("emailwall"));
    if (!localStorage.getItem(KEY)) wall.show();
    document.getElementById("emailform").addEventListener("submit", function (e) {
      e.preventDefault();
      // honeypot: bots fill the hidden field; humans don't.
      if (document.getElementById("hp").value) return;
      var email = document.getElementById("email").value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
      fetch(CFG.workerBase + "/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, source: "planner" })
      }).catch(function () { /* soft wall: let them in even if the POST fails */ })
        .finally(function () {
          localStorage.setItem(KEY, "1");
          wall.hide();
        });
    });
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
    initMap();
    initEmailWall();
    initFeedback();
    // Populate the slice selector.
    var sel = document.getElementById("slice");
    CFG.slices.forEach(function (s) {
      var o = document.createElement("option");
      o.value = s.id; o.textContent = s.label; sel.appendChild(o);
    });
    document.getElementById("plan").addEventListener("click", onPlan);
    document.getElementById("swap").addEventListener("click", onSwap);
    Promise.all([
      loadJSON(CFG.dataBase + "/stations.json"),
      loadJSON(CFG.dataBase + "/metra_counties.geojson"),
      loadJSON(CFG.dataBase + "/lines.json").catch(function () { return null; })
    ]).then(function (r) {
      stations = r[0]; counties = r[1]; LINES = r[2];
      stations.forEach(function (s) { if (!(s.name in stationByName)) stationByName[s.name] = s; });
      renderPredefinedTrips();   // Option A one-click trips
      applyPermalink();          // if the URL already describes a trip, run it
    });
  }

  if (document.readyState !== "loading") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
