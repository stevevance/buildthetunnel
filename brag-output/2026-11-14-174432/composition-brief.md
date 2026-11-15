# HyperFrames composition brief: Build the Tunnel — CRCL flythrough

## Objective
A short launch-style video of the Clinton–Roosevelt Connector 3D flythrough, in two formats.

## Output
- Composition directories: `composition/` (1920x1080) and `composition-vertical/` (1080x1920)
- Rendered videos: `brag.mp4` and `brag-vertical.mp4`
- Duration: 24.5 s, 30 fps

## Source material
- Project root: `/Users/stevevance/Sites/BuildTheTunnel`
- Files read: `index.html`, `lines.js` (the `crcl` entry and `CLINTON_ROOSEVELT_CONNECTOR`), `README.md`
- Product name: Build the Tunnel — 3D flythrough viewer
- Key visual: the viewer itself. `bake/bake-map.mjs` loads the real `index.html#crcl` in headless Chrome, hides its panels, and steps a compressed version of its camera (same path, look-ahead bearing, 62° pitch, zoom-in at stations) one frame at a time into `assets/map.mp4`.
- Copy that appears verbatim: "Clinton–Roosevelt Connector", "proposed subway", "Connection to Metra Electric District", "Low Line connection", station names, jobs / residents figures and Census tract names from `lines.js`, "Unlocking Chicagoland with regional rail".
- Derived figures: 3.2 miles (length of the drawn alignment), 102,935 jobs (sum of the four stations' tract job counts; the tracts do not overlap).

## Creative direction
- Tone preset: polished — civic infrastructure film, one continuous shot.
- Avoid: generic SaaS language, redrawn maps, pulsing or floating UI, click rings.

## Visual identity
- Accent #8d5a99, note #0e7c7b, ink #2a1830, white panels at 93%; Inter.

## Storyboard
See `brag-plan.md`. One overlay sub-composition (`compositions/hud.html`) over the baked map.

## Audio
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`, cue preset bundled with /brag; timings in the plan.
- SFX: `drop_001–003` rotated on station cards, `impactSoft_medium_001` on the dive, `impactBell_heavy_003` on the total.
- Audio-reactive: none, on purpose (see plan).

## Requirements
- `npx hyperframes check` passes before render.
- Map credit on screen: © OpenFreeMap · © OpenMapTiles · © OpenStreetMap contributors.
