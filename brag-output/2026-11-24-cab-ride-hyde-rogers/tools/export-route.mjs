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
import { buildPlan, ROGERS_PARK, MAP_PAST_END } from "../assets/cab-ride.js";

const outDir = process.argv[2] || path.dirname(fileURLToPath(import.meta.url));
const KX = 111320 * Math.cos(city.origin[1] * Math.PI / 180), KY = 111070;
const { plan: whole } = buildPlan(THREE, city);
// The map shows the line only as far as the film's minimap does: MAP_PAST_END metres past Rogers Park.
const cly = new THREE.Vector2((ROGERS_PARK[0] - city.origin[0]) * KX, (city.origin[1] - ROGERS_PARK[1]) * KY);
let keep = 0;
whole.forEach((p, i) => { if (p.distanceTo(cly) < whole[keep].distanceTo(cly)) keep = i; });
for (let run = 0; keep < whole.length - 1 && run < MAP_PAST_END; keep++) run += whole[keep + 1].distanceTo(whole[keep]);
const plan = whole.slice(0, keep + 1);
// every 4th point (~10 m) is plenty for a map
const latlng = plan.filter((_, i) => i % 4 === 0 || i === plan.length - 1)
  .map((p) => [+(city.origin[1] - p.y / KY).toFixed(6), +(city.origin[0] + p.x / KX).toFixed(6)]);
fs.writeFileSync(path.join(outDir, "route.json"), JSON.stringify(latlng));
fs.writeFileSync(path.join(outDir, "streams.json"), JSON.stringify({ latlng }));
console.log(`${latlng.length} points, ${latlng[0]} -> ${latlng[latlng.length - 1]}`);
