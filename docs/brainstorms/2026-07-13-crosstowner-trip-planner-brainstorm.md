---
date: 2026-07-13
topic: crosstowner-trip-planner
---

# CrossTowner trip planner (email-walled advocacy tool)

## What We're Building

A public, fully static web tool (GitHub Pages) where anyone can type an
origin and destination address within the Metra-service counties and see a
**today vs. CrossTowner** trip comparison: total time, number of transfers,
and a leg-by-leg breakdown, drawn on a map. Before using it, a visitor
enters an email address, which is added to the **Build the Tunnel advocacy
list** (storage mechanism TBD — see Open Questions). All routing is
precomputed offline; the website itself
runs no routing engine and needs no server.

## Why This Approach

We chose **Approach C (precomputed station-to-station matrix)** over live
routing (r5r/Plumber API, or a standalone R5 server). Because every trip is
bounded to a fixed set of rail stations, we can compute every
station-to-station result **once**, offline, with the existing r5r pipeline
on the Mac, and export it as static data. That removes the live engine
entirely:

- Hosts on **GitHub Pages** with no droplet and no serverless function.
- Returns results **instantly** (a lookup, not a routing call).
- Nothing expensive exists to abuse, so no rate limiting is needed.

The email step is a **soft, client-side capture** (no Mailgun, no magic link,
no authentication). Its purpose is list-building for advocacy, not security,
so a bypassable client-side wall is acceptable.

## Key Decisions

- **Routing model:** precomputed station-to-station matrix, computed offline
  via r5r, exported as static JSON. Sharded **per origin station** so the
  browser fetches only the row it needs.
- **Station set (phase 1):** Metra (242) + CTA rail "L" (~145) + CrossTowner
  X-served (142), deduped to ~450-500 distinct stations. **CTA bus stops
  deferred** (11,178 stops would blow the matrix up to ~125M pairs).
- **Address input:** user types origin + destination addresses -> geocode via
  **Geocode.earth** (referer-restricted browser key) -> snap to the nearest
  1-3 stations on each end -> add access/egress walk at **2.75 mph** ->
  look up the matrix -> pick the best total.
- **Departure-time slices:** three, all weekday — **8:00 am**, **12:00 pm**,
  **6:00 pm** — because time-of-day materially changes results (cf. the
  Braeside midday-gap finding). User picks the slice per query.
- **Directional matrix + swap:** the matrix is **directional** (A->B != B->A
  because of schedules), so the full N x N is precomputed both ways. The UI
  has a **swap-directions** button that reverses origin/destination and does
  the reverse lookup.
- **Output:** interactive results view — a map with both route lines plus
  leg-by-leg cards, using **factual, data-generated labels only** (no
  editorial captions).
- **Geographic bounds:** reject any origin/destination outside the
  Metra-service counties (Cook, DuPage, Lake, Kane, McHenry, Will).
- **Email capture:** client-side modal -> a **self-owned email store**
  (mechanism TBD, see Open Questions) -> `localStorage` flag reveals the tool.
  No Mailgun, no Mailchimp, no magic link, no gating.
- **Hosting:** **GitHub Pages only.** No droplet, no serverless function for
  the MVP.

## Open Questions

- **Where the email list lives** (Mailchimp is ruled out). Needs a store the
  user owns and can export, reachable from a static page. Candidates: a
  self-hosted insert endpoint (own Postgres / Cityscape), a serverless
  function + DB (Cloudflare Worker + D1), a Postgres-as-a-service with an
  insert-only key (Supabase), or a form-capture service. Decision pending.
- How many **departure-time slices**, and which (AM peak / midday / PM /
  weekend)?
- **Leg-by-leg detail** requires all-pairs `detailed_itineraries`, a much
  heavier precompute than `travel_time_matrix` (times only). Validate the
  overnight runtime for ~500 stations x 2 networks x N slices; if too slow,
  start times-only and add legs later, or cap the station set.
- **CTA rail-only** for phase 1; add bus first/last-mile later if users need
  closer snapping?
- Is the **soft client-side email wall** acceptable long-term, or add a light
  serverless function later to enforce it and hide the geocode key?
- **Nearest-station snapping:** how many candidate stations per end, and what
  maximum access-walk before we say "no reasonable transit trip"?

## Next Steps
-> `/workflows:plan` for implementation details: station data model + dedup,
   the offline precompute batch script, the static matrix format/sharding,
   the frontend (map, address boxes, results cards), the email-store
   integration (mechanism TBD), and the Geocode.earth integration.
