/*
 * Cloudflare Worker for the CrossTowner trip planner.
 *
 *   POST /email    { email, source } -> insert-or-ignore into D1 (advocacy list)
 *   POST /track    { origin, ... }   -> log a planned trip's stations + times (D1)
 *   GET  /geocode?text=...           -> Geocode.earth autocomplete proxy
 *   GET  /s?...trip params           -> share page with per-trip og: tags,
 *                                        redirecting a human to the planner
 *   GET  /og?...trip params          -> 1200x630 png social-preview image
 *
 * The Geocode.earth key lives in the GEOCODE_EARTH_KEY secret and never
 * reaches the browser. CORS is restricted to the configured origins.
 */
import { ImageResponse } from "workers-og";

const GEOCODE_URL = "https://api.geocode.earth/v1/autocomplete";
const PLANNER_URL = "https://stevevance.github.io/buildthetunnel/planner/";

// Chicago-area focus point so autocomplete favours local results.
const FOCUS = { lat: 41.85, lon: -87.75 };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, env);

    // Preflight.
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (url.pathname === "/geocode" && request.method === "GET") {
        return await handleGeocode(url, env, cors);
      }
      if (url.pathname === "/email" && request.method === "POST") {
        return await handleEmail(request, env, cors);
      }
      if (url.pathname === "/feedback" && request.method === "POST") {
        return await handleFeedback(request, env, cors);
      }
      if (url.pathname === "/track" && request.method === "POST") {
        return await handleTrack(request, env, cors);
      }
      if (url.pathname === "/s" && request.method === "GET") {
        return handleShare(url);       // social crawlers + human redirect
      }
      if (url.pathname === "/og" && request.method === "GET") {
        return handleOg(url);          // generated preview image
      }
      return json({ error: "not found" }, 404, cors);
    } catch (err) {
      return json({ error: "server error" }, 500, cors);
    }
  }
};

/* ---- CORS -------------------------------------------------------------- */
function corsHeaders(origin, env) {
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim());
  const ok = allowed.indexOf(origin) !== -1;
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0] || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: Object.assign({ "Content-Type": "application/json" }, extra || {})
  });
}

/* ---- /geocode ---------------------------------------------------------- */
async function handleGeocode(url, env, cors) {
  const text = (url.searchParams.get("text") || "").trim();
  if (text.length < 3) return json({ features: [] }, 200, cors);

  const params = new URLSearchParams({
    api_key: env.GEOCODE_EARTH_KEY,
    text: text,
    "focus.point.lat": String(FOCUS.lat),
    "focus.point.lon": String(FOCUS.lon),
    "boundary.country": "US",
    size: "5"
  });
  const resp = await fetch(GEOCODE_URL + "?" + params.toString());
  if (!resp.ok) return json({ features: [] }, 200, cors);
  const data = await resp.json();
  // Pass through only what the client needs (label + coordinates).
  const features = (data.features || []).map((f) => ({
    type: "Feature",
    geometry: f.geometry,
    properties: { label: f.properties.label, name: f.properties.name }
  }));
  return json({ type: "FeatureCollection", features }, 200, cors);
}

/* ---- /email ------------------------------------------------------------ */
async function handleEmail(request, env, cors) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, cors); }

  const email = String(body.email || "").trim().toLowerCase();
  // Basic shape check; the real defence is the D1 unique key + honeypot.
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
    return json({ error: "invalid email" }, 400, cors);
  }
  const source = String(body.source || "planner").slice(0, 40);
  const ua = (request.headers.get("User-Agent") || "").slice(0, 300);

  await env.DB.prepare(
    "INSERT OR IGNORE INTO emails (email, created_at, source, user_agent) VALUES (?, ?, ?, ?)"
  ).bind(email, new Date().toISOString(), source, ua).run();

  return json({ ok: true }, 200, cors);
}

/* ---- /feedback ---------------------------------------------------------- */
async function handleFeedback(request, env, cors) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, cors); }
  if (body.hp) return json({ ok: true }, 200, cors);          // honeypot: silently accept bots
  const message = String(body.message || "").trim();
  if (!message || message.length > 5000) return json({ error: "invalid message" }, 400, cors);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 254) || null;
  const trip  = String(body.trip || "").slice(0, 1000) || null;
  const ua    = (request.headers.get("User-Agent") || "").slice(0, 300);
  await env.DB.prepare(
    "INSERT INTO feedback (created_at, message, email, trip, user_agent) VALUES (?, ?, ?, ?, ?)"
  ).bind(new Date().toISOString(), message, email, trip, ua).run();
  return json({ ok: true }, 200, cors);
}

/* ---- /track ------------------------------------------------------------ */
// Logs a planned trip for ranking popular corridors. Deliberately stores only
// the boarding/alighting station names (never the typed address or coordinates)
// plus the two travel times.
async function handleTrack(request, env, cors) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, cors); }

  // Share event: flag a previously-logged trip (matched by its client token) as
  // shared. No new row.
  if (body.shared && body.ttoken) {
    await env.DB.prepare("UPDATE trips SET shared = 1 WHERE ttoken = ?")
      .bind(String(body.ttoken).slice(0, 64)).run();
    return json({ ok: true }, 200, cors);
  }

  const result = String(body.result || "ok").slice(0, 20);       // ok | no_route | out_of_county | geocode_*
  const origin = String(body.origin || "").slice(0, 120) || null;
  const dest   = String(body.destination || "").slice(0, 120) || null;
  // A successful trip must name its stations; failures carry none (unmet demand).
  if (result === "ok" && !origin && !dest) return json({ error: "empty" }, 400, cors);
  const slice  = String(body.slice || "").slice(0, 20) || null;
  const cid    = String(body.cid || "").slice(0, 64) || null;   // anonymous client id
  const source = String(body.source || "").slice(0, 20) || null; // predefined | permalink | search
  const xroute = String(body.x_route || "").slice(0, 40) || null; // CrossTowner routes used, e.g. "X1,X5"
  const ttoken = String(body.ttoken || "").slice(0, 64) || null;  // per-trip token for share matching
  const device = String(body.device || "").slice(0, 12) || null;  // mobile | tablet | desktop
  const refHost = String(body.ref_host || "").slice(0, 100) || null;      // referring host or direct/internal
  const utmSrc  = String(body.utm_source || "").slice(0, 60) || null;
  const utmMed  = String(body.utm_medium || "").slice(0, 60) || null;
  const utmCamp = String(body.utm_campaign || "").slice(0, 80) || null;
  const toInt  = (v) => (v == null || v === "" || !isFinite(+v)) ? null : Math.round(+v);
  await env.DB.prepare(
    "INSERT INTO trips (created_at, origin, destination, slice, today_min, scenario_min, cid, source, result, transfers_today, transfers_scenario, x_route, ttoken, device, ref_host, utm_source, utm_medium, utm_campaign) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    new Date().toISOString(), origin, dest, slice,
    toInt(body.today_min), toInt(body.scenario_min), cid, source, result,
    toInt(body.transfers_today), toInt(body.transfers_scenario), xroute,
    ttoken, device, refHost, utmSrc, utmMed, utmCamp
  ).run();
  return json({ ok: true }, 200, cors);
}

/* ---- share page (per-trip og: tags) ------------------------------------ */
function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}
function handleShare(url) {
  const p = url.searchParams;
  const ol = p.get("ol") || "Origin", dl = p.get("dl") || "Destination";
  const td = p.get("td"), xd = p.get("xd");
  const title = `${ol} → ${dl}`;
  const desc = (td && xd)
    ? `${td} min today vs. ${xd} min with the CrossTowner tunnel + Red Line Extension.`
    : "Compare a Chicago rail trip today vs. with the CrossTowner tunnel.";
  const ogImg = `${url.origin}/og?${p.toString()}`;
  const planner = `${PLANNER_URL}?${p.toString()}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(ogImg)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(ogImg)}">
<meta http-equiv="refresh" content="0; url=${esc(planner)}">
</head><body>Opening the CrossTowner trip planner&hellip;
<a href="${esc(planner)}">Continue</a></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

/* ---- generated preview image (1200x630 png) ---------------------------- */
// satori renders the markup as pseudo-HTML but does NOT decode entities, so we
// only strip angle brackets (to avoid breaking the parse) and keep &, ', "
// as literal characters.
function ogtext(s) { return String(s).replace(/[<>]/g, ""); }
function handleOg(url) {
  const p = url.searchParams;
  const ol = ogtext(p.get("ol") || "Origin"), dl = ogtext(p.get("dl") || "Destination");
  const td = p.get("td"), xd = p.get("xd");
  const saved = (td && xd) ? Math.max(0, parseInt(td, 10) - parseInt(xd, 10)) : null;
  // satori requires display:flex on any element with multiple children.
  // satori (workers-og) does NOT decode HTML entities in text nodes, so use
  // literal Unicode characters (·, →) rather than &middot;/&rarr;/&nbsp;.
  const markup = `
  <div style="display:flex;flex-direction:column;width:1200px;height:630px;padding:64px;background:#0B7285;color:#ffffff;font-family:sans-serif;justify-content:space-between">
    <div style="display:flex;font-size:30px;opacity:0.85">CrossTowner Trip Planner · Build the Tunnel</div>
    <div style="display:flex;flex-direction:column">
      <div style="display:flex;font-size:60px;font-weight:700;line-height:1.1">${ol} → ${dl}</div>
      <div style="display:flex;font-size:38px;margin-top:28px;opacity:0.95">Today ${ogtext(td || "?")} min   →   With CrossTowner ${ogtext(xd || "?")} min</div>
      ${saved != null ? `<div style="display:flex;font-size:48px;font-weight:700;margin-top:16px;color:#9BE7F5">${saved} minutes faster</div>` : ""}
    </div>
    <div style="display:flex;font-size:26px;opacity:0.8">stevevance.github.io/buildthetunnel</div>
  </div>`;
  return new ImageResponse(markup, { width: 1200, height: 630 });
}
