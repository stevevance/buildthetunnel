# BuildTheTunnel

## Live site

The site is hosted on GitHub Pages at a project path (no custom domain / CNAME):

- **Base URL:** https://stevevance.github.io/buildthetunnel/
- **Trip planner:** https://stevevance.github.io/buildthetunnel/planner/

Do **not** use `buildthetunnel.com` — that domain is not configured for this site.

## Deploys

Pushes to `main` deploy automatically via GitHub Pages. Check build status with:

```
gh api repos/stevevance/buildthetunnel/pages/builds/latest --jq '{status, commit: .commit, error: .error.message}'
```

## Cloudflare Worker + D1 database

A Cloudflare Worker (`worker/`, `name = "buildthetunnel-planner"`) backs the
otherwise-static planner: it stores voluntarily-provided emails and feedback, and
proxies Geocode.earth so the API key stays server-side. Config in
`worker/wrangler.toml`, schema in `worker/schema.sql`.

The D1 database is **`planner_emails`** (binding `DB`) with three tables:

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `emails` | Advocacy email list; one row per address, re-submissions ignored | `email` (PK), `created_at`, `source`, `user_agent` |
| `feedback` | User feedback; `trip` holds the share params for context | `id` (PK), `created_at`, `message`, `email` (optional), `trip`, `user_agent` |
| `trips` | One row per planned trip (or failed search), for usage analytics | `origin`/`destination` (stations, not addresses), `today_min`/`scenario_min`, `transfers_*`, `x_route`, `result` (`ok`/`no_route`/…), `source`, `cid` (anonymous localStorage UUID), `ttoken`, `shared`, `device`, `ref_host`, `utm_*` |

Query the live (remote) database with wrangler — run from `worker/`:

```
cd worker
npx wrangler d1 execute planner_emails --remote --json \
  --command "SELECT COUNT(*) FROM emails;" | jq '.[0].results'
```

Use `--remote` to hit the deployed database; omit it and you query a local dev
copy. Add `--json | jq '.[0].results'` to get clean result rows.

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
