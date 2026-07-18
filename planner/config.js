/*
 * config.js -- runtime configuration for the CrossTowner trip planner.
 * Edit workerBase after deploying the Cloudflare Worker (Phase 4).
 */
window.PLANNER_CONFIG = {
  /* Cloudflare Worker base URL: serves /geocode (Geocode.earth proxy) and
   * /email (advocacy-list capture). Replace after `wrangler deploy`. */
  workerBase: "https://buildthetunnel-planner.buildthetunnel.workers.dev",

  /* Where the precomputed static data lives, relative to this page. */
  dataBase: "data",

  /* Departure-time slice(s), matching planner/data/matrix/<net>/<slice>/.
   * A single weekday 8 AM departure: "the first/best trip if you leave at 8:00". */
  slices: [
    { id: "0800", label: "Weekday, leaving at 8 AM" }
  ],

  /* Network keys -> display labels. */
  networks: [
    { id: "today",    label: "Today" },
    /* scenario routes on today + CrossTowner X-routes + the Red Line Extension */
    { id: "scenario", label: "With CrossTowner + Red Line Extension" }
  ],

  /* Example locations shown as quick-pick chips under the From/To fields
   * (coords hardcoded so no geocode call is needed). The first two match the
   * input placeholders. */
  examples: [
    { label: "71st & Exchange, Chicago", lat: 41.7653, lon: -87.5658 },
    { label: "Chicago Botanic Garden",   lat: 42.1489, lon: -87.7887 },
    { label: "Arlington Heights",        lat: 42.0842, lon: -87.9836 }
  ],
  
  /* Curated example trips shown as one-click buttons (Option A). Coordinates
   * are the authoritative view_places station centroids. */
  predefined_trips: [
    {
      title: "Clybourn to 67th Street",
      blurb: "Straight down the CrossTowner trunk, North Side to South Side.",
      from: { label: "Clybourn",          lat: 41.917159, lon: -87.668241 },
      to:   { label: "67th Street",        lat: 41.773259, lon: -87.592035 }
    },
    {
      title: "Berwyn to O'Hare Transfer",
      blurb: "West suburbs to the airport on the X5, no downtown backtrack.",
      from: { label: "Berwyn - Harlem Ave", lat: 41.8314, lon: -87.8019 },
      to:   { label: "O'Hare Transfer",    lat: 41.995212, lon: -87.880317 }
    },
    {
      title: "Davis Street to 55th-56th-57th",
      blurb: "The historic Evanston-to-Hyde Park one-seat ride.",
      from: { label: "Davis Street (Evanston)", lat: 42.048064, lon: -87.684822 },
      to:   { label: "55th-56th-57th Street",   lat: 41.792842, lon: -87.587498 }
    },
    {
      title: "Jefferson Park to McCormick Place",
      blurb: "Northwest Side to the convention center, a semi-airport trip.",
      from: { label: "Jefferson Park",     lat: 41.971506, lon: -87.763344 },
      to:   { label: "McCormick Place",    lat: 41.850942, lon: -87.616142 }
    }
  ],

  /* Walk model -- must match precompute_matrix.R. */
  walkSpeedKmh: 4.43,   /* 2.75 mph */
  maxWalkMin: 20,       /* access/egress cap; also the matrix's max_walk_time */
  detourFactor: 1.3,    /* straight-line -> street-network fudge */
  nearestK: 3           /* candidate stations to try on each end */
};
