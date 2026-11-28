// Settings for the cab ride page (tunnel.stevevance.net/cabride/).

// Where the video comes from: R2, through the buildthetunnel-media Worker (media-worker/), which answers Range requests
// so the video streams and seeks. That holds on a local server too, so testing shows what visitors get. Add ?local to
// the page's address to play the copy in media/ instead (gitignored, never deployed; read whole, as python's
// http.server ignores Range requests): for working offline.
export const MEDIA_BASE = "https://buildthetunnel-media.buildthetunnel.workers.dev/";
export const VIDEO = {
  local: "media/cabride-v4-720.mp4",
  r2: MEDIA_BASE + "cabride-v4-1080.mp4",          // wide screens
  r2Narrow: MEDIA_BASE + "cabride-v4-720.mp4",     // narrow ones
};
const NARROW = "(max-width: 899.98px), (max-height: 540px)";

// The 360 views' images (the small whole faces in base/ and the tiles) are on R2 too, under a version that changes with
// every render (so no cache serves an old one); each view's meta.json stays here with the page.
export const PANO_VERSION = "v4";
export function panoImages(dir) {
  return new URLSearchParams(location.search).has("local") ? dir : `${MEDIA_BASE}pano/${PANO_VERSION}/${dir.replace(/^pano\//, "")}`;
}

export function videoSource() {
  const q = new URLSearchParams(location.search);
  if (q.has("local")) return VIDEO.local;
  return matchMedia(NARROW).matches ? VIDEO.r2Narrow : VIDEO.r2;
}

// Play stats (app.js stat()): small events to the planner's Worker (worker/, POST /play), kept in D1's cabride_events.
// Only the live site sends them to the live Worker; a local server sends them to `wrangler dev` (port 8787), for
// testing, and anywhere else (the ngrok tunnel) sends none, so tests stay out of the live numbers.
export const STATS_URL = location.hostname === "tunnel.stevevance.net" ? "https://buildthetunnel-planner.buildthetunnel.workers.dev/play"
  : /^(localhost|127\.0\.0\.1)$/.test(location.hostname) ? "http://127.0.0.1:8787/play" : null;

// The map: OpenFreeMap's vector tiles (no key), and how close it follows the train.
export const MAP_STYLE = "https://tiles.openfreemap.org/styles/positron";
export const FOLLOW_ZOOM = { cab: 15, air: 13.5 }; // in the cab; in a shot from outside (air > 0.5)

// The 360 views. top: the highest the top edge of the view may go, in degrees above the horizon.
// cone: how far the view cone on the map reaches, in meters.
export const PANOS = {
  hero: { dir: "pano/chicago-halsted-hero/", label: "380 m above Chicago/Halsted", top: 25, cone: 4000 },
  platform: { dir: "pano/chicago-halsted-platform/", label: "On the Chicago/Halsted platform", top: 35, cone: 450 },
};
// Phones and tablets (a touch screen as the main pointer) load only the 360 views' smallest tiles: the 4096 and 8192 px
// levels can be too much for a mobile browser's memory. They're told the page is best on a desktop.
export const MOBILE = matchMedia("(pointer: coarse)").matches;
export const MOBILE_MAX_FACE = 2048;
// PSV's zoom runs from maxFov (0) to minFov (100); the default zoom (50) lands halfway, on the film's 40 degrees.
export const FOV = { min: 15, max: 65 };

// Hotspot kinds: label, pill color and text color.
export const KINDS = {
  landmark: { label: "Landmark", color: "#f4a300", ink: "#1c2427" },
  destination: { label: "Destination", color: "#0b7f93", ink: "#ffffff" },
  job: { label: "Jobs", color: "#7048e8", ink: "#ffffff" },
  bus: { label: "Bus", color: "#1c64c4", ink: "#ffffff" },
  station: { label: "X1 station", color: "#0b7285", ink: "#ffffff" },
};
