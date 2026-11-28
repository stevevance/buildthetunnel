/*
 * Cloudflare Worker for the cab ride page's media in the R2 bucket cabride-media: the videos, and the 360 views' tiles
 * (pano/v<N>/..., too many and too big to keep in git; the page fetches them with CORS, as WebGL textures need).
 *
 *   GET  /<file>   -> the file, or the bytes a Range header asks for (206), so browsers can stream and seek
 *   HEAD /<file>   -> its size and type, without the body
 *
 * File names carry their version (cabride-v1-1080.mp4), so responses are cached for a year. The page lives on
 * GitHub Pages; this runs on workers.dev because the domain's DNS isn't on Cloudflare. Upload with
 *   npx wrangler r2 object put cabride-media/<file> --file <path> --remote
 */
const TYPES = { mp4: "video/mp4", vtt: "text/vtt", jpg: "image/jpeg", json: "application/json" };   // (json: the trip planner's walking tiles, walk/<version>/...)

export default {
  async fetch(request, env) {
    // Public media, so any origin may read it. Always sending the header matters: a copy fetched without CORS (a plain
    // <img> or a prefetch) is cached for a year, and a reply that varied by origin would leave that copy without it.
    const cors = { "Access-Control-Allow-Origin": "*" };
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...cors, "Access-Control-Allow-Methods": "GET, HEAD", "Access-Control-Allow-Headers": "Range", "Access-Control-Max-Age": "86400" } });
    }
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });

    // a file name, or a path of them (the 360 views' tiles: pano/v1/<view>/tiles/<size>/<face>_<col>_<row>.jpg), no ".."
    const key = decodeURIComponent(new URL(request.url).pathname.slice(1));
    const ext = key.split(".").pop();
    if (!/^[\w-][\w.-]*(\/[\w-][\w.-]*)*$/.test(key) || !TYPES[ext]) return new Response("Not found", { status: 404, headers: cors });

    const obj = request.method === "HEAD" ? await env.MEDIA.head(key) : await env.MEDIA.get(key, { range: request.headers });
    if (!obj) return new Response("Not found", { status: 404, headers: cors });

    const headers = new Headers(cors);
    headers.set("Content-Type", TYPES[ext]);
    headers.set("Accept-Ranges", "bytes");
    headers.set("ETag", obj.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    if (request.method === "HEAD") {
      headers.set("Content-Length", String(obj.size));
      return new Response(null, { headers });
    }
    // a Range request: R2 has read only the bytes asked for (obj.range: { offset, length } or { suffix }, the others
    // present but undefined)
    if (obj.range && request.headers.has("Range")) {
      const { suffix } = obj.range;
      const offset = suffix !== undefined ? obj.size - suffix : obj.range.offset ?? 0;
      const length = suffix !== undefined ? suffix : obj.range.length ?? obj.size - offset;
      headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${obj.size}`);
      headers.set("Content-Length", String(length));
      return new Response(obj.body, { status: 206, headers });
    }
    headers.set("Content-Length", String(obj.size));
    return new Response(obj.body, { headers });
  },
};
