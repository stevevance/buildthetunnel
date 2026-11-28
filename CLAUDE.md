# BuildTheTunnel

## Live site

The site is hosted on GitHub Pages with the custom domain `tunnel.stevevance.net`
(the `CNAME` file at the repo root; DNS is a CNAME record at DreamHost pointing to
`stevevance.github.io`):

- **Base URL:** https://tunnel.stevevance.net/
- **Trip planner:** https://tunnel.stevevance.net/planner/

The old address, https://stevevance.github.io/buildthetunnel/, redirects to it.
Do **not** use `buildthetunnel.com` — that domain is not configured for this site.

## Deploys

Pushes to `main` deploy automatically via the GitHub Actions workflow
`.github/workflows/pages.yml`. It publishes **only** the files it lists (the
pages, `flythrough/`, `planner/`, `maps/`, `img/`, `cabride/`, and a few root files); the
rest of the repo (`CLAUDE.md`, `README.md`, `analysis/`, `docs/`, `newsletter/`,
`worker/`) is not served. A new top-level file or folder must be added to that
list to go live. Check the latest deploy with:

```
gh run list --workflow=pages.yml --limit 1
```

## Cloudflare Worker + D1 database

A Cloudflare Worker (`worker/`, `name = "buildthetunnel-planner"`) backs the
otherwise-static planner: it stores voluntarily-provided emails and feedback, and
proxies Geocode.earth so the API key stays server-side. Config in
`worker/wrangler.toml`, schema in `worker/schema.sql`.

The D1 database is **`planner_emails`** (binding `DB`) with four tables:

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `emails` | Advocacy email list; one row per address, re-submissions ignored. Dead addresses are marked, not deleted: skip rows where `bad_at` is set when emailing the list | `email` (PK), `created_at`, `source`, `user_agent`, `bad_at`, `bad_reason` |
| `feedback` | User feedback; `trip` holds the share params for context | `id` (PK), `created_at`, `message`, `email` (optional), `trip`, `user_agent` |
| `trips` | One row per planned trip (or failed search), for usage analytics | `origin`/`destination` (stations, not addresses), `today_min`/`scenario_min`, `transfers_*`, `x_route`, `result` (`ok`/`no_route`/…), `source`, `cid` (anonymous localStorage UUID), `ttoken`, `shared`, `device`, `ref_host`, `utm_*` |
| `cabride_events` | The cab ride page's play events (`POST /play` from `cabride/app.js`): plays, every 10% reached by playing, arriving at the 360 stop by playing (`arrive360`) or jumping there (`jump360`), "Continue the ride", the end, chapter and stop jumps, the platform view, wards turned on. Only the live site sends them (`cabride/config.js` `STATS_URL`) | `event`, `detail`, `t` (film seconds), `sid` (one visit), `cid`, `video`, `device`, `ref_host`, `utm_*` |

Query the live (remote) database with wrangler — run from `worker/`:

```
cd worker
npx wrangler d1 execute planner_emails --remote --json \
  --command "SELECT COUNT(*) FROM emails;" | jq '.[0].results'
```

Use `--remote` to hit the deployed database; omit it and you query a local dev
copy. Add `--json | jq '.[0].results'` to get clean result rows.

## Cab ride page (cabride/)

https://tunnel.stevevance.net/cabride/ plays the whole Hyde Park to Rogers Park cab ride
(`brag-output/2026-11-24-cab-ride-hyde-rogers/`, rendered with `--web`) with the story cards, a chapter list, a
MapLibre map that follows the train, and captions beside the video; at the top of the hero shot over Chicago/Halsted
the video pauses into a 360° view (Photo Sphere Viewer, tiled cube maps in `cabride/pano/`) with hotspots from
`cabride/data/places.json`, and "Continue the ride" plays on to Rogers Park.
Plan: `docs/plans/2026-11-26-cabride-page-plan.md`. Everything in `cabride/data/` and `cabride/pano/` is made from the
film by its tools (`tools/export-web.mjs`, `tools/web-panos.sh`, on the cab-ride branch); `places.json` is hand-written.

The video is too big for Pages, so it streams from Cloudflare R2 (bucket `cabride-media`) through a second Worker,
`media-worker/` (`buildthetunnel-media`, https://buildthetunnel-media.buildthetunnel.workers.dev), which answers Range
requests. File names carry a version (`cabride-v1-1080.mp4`, `cabride-v1-720.mp4`; `config.js` picks by screen size).
Upload from `media-worker/`:

```
wrangler r2 object put cabride-media/cabride-v1-1080.mp4 --file <path> --content-type video/mp4 --remote
```

`cabride/media/` holds local copies for offline testing (gitignored; add `?local` to the page's address).

## South Shore Line (planner graft)

The NICTD South Shore Line (Indiana → South Bend, plus the new Monon/Munster
branch) is **grafted** onto the otherwise-precomputed planner, not routed
end-to-end. It lives outside the six-county matrix, so instead of rebuilding the
r5r network, `planner/data/southshore.json` holds the South Shore stations and
their in-vehicle minutes/headways (straight from NICTD GTFS), keyed relative to
the shared transfer hub. `planner/app.js` recognizes a South Shore endpoint
(`snapSouthShore`), and `sslCandidates`/`sslLeg`/`bestTotal` route the rider to
a hub that both the CrossTowner/Metra network and the South Shore serve —
primary **55th-56th-57th St.**, with downtown Metra Electric stops as
alternates — then adds the South Shore leg. So a trip = matrix time to the hub +
transfer + South Shore leg; CrossTowner only ever changes how fast you reach the
hub. Disclosed in `methodology.html` ("Reaching the South Shore Line").

To refresh the schedule, re-fetch the feed and rebuild the data file:
`http://www.mysouthshoreline.com/google/google_transit.zip` (Transitland feed
`mysouthshoreline.com.dmfr.json`). Ride times are the 8 AM weekday slice.

## Local testing over HTTPS (ngrok)

The planner can be tested over a trusted-cert HTTPS URL via ngrok. The
`buildthetunnel.ngrok.io` origin is already allow-listed in the Worker's
`ALLOWED_ORIGINS`, and a `planner` tunnel (→ port 8890) lives in
`~/.ngrok2/ngrok.yml`.

Start the backend static server (from the repo root) so the tunnel has
something to serve:

```
python3 -m http.server 8890 --bind 127.0.0.1
```

Then the site is live at <https://buildthetunnel.ngrok.io/planner/> (ngrok must
be running — `ngrok start --all`; the account allows only one agent session).
The tunnel serves the working tree, so it reflects uncommitted changes.
