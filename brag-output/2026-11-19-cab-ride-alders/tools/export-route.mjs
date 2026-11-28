#!/usr/bin/env node
/*
 * Write the alignment the film follows as lat/lng, for the minimap tools
 * (the telemetry-recap-video skill's fetch_streets / fetch_basemap /
 * build_map_plate scripts all take this file).
 *
 *   node tools/export-route.mjs <out-dir>
 *
 * Writes <out-dir>/route.json ([[lat, lng], ...]) and <out-dir>/streams.json
 * ({ latlng: [...] }).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "../assets/vendor/three.module.js";
import city from "../assets/city.js";
import { buildPlan, RUNOUT, FILM_RUNOUT } from "../assets/cab-ride.js";

const outDir = process.argv[2] || path.dirname(fileURLToPath(import.meta.url));
const KX = 111320 * Math.cos(city.origin[1] * Math.PI / 180), KY = 111070;
const { plan: whole } = buildPlan(THREE, city);
// The map shows the line only as far as the film's minimap does: the last RUNOUT - FILM_RUNOUT metres
// are a straight run-out for the 3D scene, not the real line (which curves west there).
let keep = whole.length - 1;
for (let cut = RUNOUT - FILM_RUNOUT; keep > 0 && cut > 0; keep--) cut -= whole[keep].distanceTo(whole[keep - 1]);
const plan = whole.slice(0, keep + 1);
// every 4th point (~10 m) is plenty for a map
const latlng = plan.filter((_, i) => i % 4 === 0 || i === plan.length - 1)
  .map((p) => [+(city.origin[1] - p.y / KY).toFixed(6), +(city.origin[0] + p.x / KX).toFixed(6)]);
fs.writeFileSync(path.join(outDir, "route.json"), JSON.stringify(latlng));
fs.writeFileSync(path.join(outDir, "streams.json"), JSON.stringify({ latlng }));
console.log(`${latlng.length} points, ${latlng[0]} -> ${latlng[latlng.length - 1]}`);
