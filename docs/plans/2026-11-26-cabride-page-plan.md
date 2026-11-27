---
date: 2026-11-26
topic: cabride-page
status: v1 published 2026-11-27
---

# Cab ride page (tunnel.stevevance.net/cabride/)

## What we're building

One page around the cab-ride film:

- **The film plays without its story cards, captions or minimap.** The cards' text sits beside the video and appears as the film reaches each card.
- **A MapLibre map beside the video follows the train.** It shows the route, the stations and the train's position at every moment of the video. Clicking a station jumps the video there.
- **At Chicago/Halsted the film pauses and becomes a 360° view from the platform.** Hotspots show where a passenger can go from there:
  - the CTA #8 Halsted and #66 Chicago buses
  - Bally's Chicago
  - Halsted Pointe
  - Prairie Material's Yard 32 (a job)
  - the downtown skyline and the Willis Tower
  The map shows the same places, with the bus routes and walking routes.
- **"Continue the ride" resumes the film** into its hero shot. The film already pulls up from the platform over downtown 1.2 s after the train stops (`PULL_FROM` in `cab-ride.js`); the web cut holds the platform shot a little longer, so the pause always lands on it.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Page | Plain HTML, CSS and ES modules, no build step, in `cabride/` at the repo root | Same as the planner. GitHub Pages deploys it once `cabride` is added to `pages.yml`. |
| Map | MapLibre GL JS with OpenFreeMap's vector tiles (no API key). Pin the exact version at build time. | The film already uses OpenFreeMap/OpenMapTiles for its water and parks, so the map looks like the same city. |
| 360 viewer | Photo Sphere Viewer 5 (core, cubemap adapter, markers and gyroscope plugins) on three.js. Load it from jsDelivr through an import map, pinned. | Open source and built on three.js. Hotspots, keyboard control and tilt-to-look on phones come with it. |
| Panoramas | Cube maps: six 2048 px JPEG faces per stop, about 1 MB each, rendered from the film's own scene. Served from Pages under `cabride/pano/<stop>/`. | The panorama matches the paused frame exactly: same models, same light, same moment. |
| Video | A "web" render of the film: no story cards, captions, minimap or ending dim, and a longer hold at Chicago/Halsted | See "Changes to the film" below. |
| Captions | WebVTT generated from `assets/captions.js` (the announcements), behind a CC button | Accessible, and they can be turned off. |
| Video hosting | Recommended: Vimeo, on Steven's Plus account (2 TB, 74 GB used), embedded with its Player API. Fallback: Cloudflare R2 behind a small Worker. | Vimeo makes every size and streams adaptively, which phones on weak connections need, and it's already paid for. A small player wrapper (play, pause, seek, current time, time events) keeps the switch to R2 cheap. |
| Data from the film | `tools/export-web.mjs` writes these into `cabride/data/` from `createCabRide`'s own timings and geometry, so the page can't drift from the render: | |
| | `story.json` | the cards |
| | `stops.json` | each stop's arrival and departure in film seconds |
| | `track.json` | the train's [lon, lat, bearing] four times a second of film |
| | `route.geojson` | the alignment, with the tunnel marked |
| | `pois.geojson` | the minimap's points of interest, from `minimap-geo.js` |
| | `captions.vtt` | the announcements |
| Hotspot positions | `tools/cubemap.mjs` computes each target's yaw and pitch from its coordinates, and flags targets hidden behind buildings | No hand placement. Moving a model moves its hotspot. |
| Hotspot content | `cabride/data/hotspots.json`, with sources: | Numbers with sources, as on the rest of the site. |
| | bus frequencies and route shapes | CTA GTFS |
| | walk times and walking routes from the platform | the r5r pipeline in `analysis/` (the planner's method) |
| | facts about each destination | public sources |

## How the page works

- **Layout:**
  - On a desktop, the video is on the left, about two-thirds of the width. The right column has the map above the story panel.
  - On a phone, the video sticks to the top, with a short map strip under it and the story panel scrolling below. (A Story/Map toggle is the alternative if the strip feels cramped.)
- **The map:**
  - By default it follows the train: centered on the train dot, turned to its bearing, zoomed in on the open line and out for the aerial shots.
  - Dragging the map stops following; a "Follow the train" button resumes it.
  - The X1 route is drawn with the new tunnel styled apart (dashed teal, like the film's "New tunnel"), along with the stations and points of interest.
  - Clicking a station seeks the video to its stop.
  - During the 360 view:
    - a view cone shows which way the panorama faces;
    - the hotspots appear as map markers, and the #8 and #66 routes and the walking routes are drawn;
    - hovering a hotspot in one view highlights it in the other.
- **Story panel:**
  - It's a running list: the current card is highlighted, and past cards stay so people can read at their own pace.
  - Clicking a card seeks the video.
  - Trip comparisons ("Rogers Park to McCormick Place: 63 min today, 39 with CrossTowner") are drawn as HTML bars.
- **Keeping time:**
  - The page reads the player's time events (Vimeo's are about four a second; R2's video element allows frame-accurate `requestVideoFrameCallback`).
  - Between events it interpolates, so the train dot moves smoothly.
- **The stop:**
  - When playback crosses Chicago/Halsted's pause time, the video pauses. The film is showing the train at the platform from outside at that moment.
  - The frame crossfades to the panorama, which opens facing the same way as the paused shot.
  - Beside it, the same hotspots appear as a plain HTML list, for keyboard and screen-reader users.
  - "Continue the ride" crossfades back and plays on into the hero shot.
  - A "Stop at stations" toggle can skip the panorama. Seeking past a stop doesn't trigger it.
- **Phones:**
  - The video plays inline.
  - Tilting the phone looks around; iOS asks permission on the first tap.
  - Phones get 1536 px cube faces.

## Changes to the film (`brag-output/2026-11-24-cab-ride-hyde-rogers`)

1. **A `web` option.** `createCabRide` gets an option, set by `index.html?web` and passed by `direct-render.mjs --web`.
   - It skips `drawStory`, `drawCaption`, `drawMini` and the ending's dim.
   - It holds the Chicago/Halsted platform shot about 2 s longer before `PULL_FROM`.
   - It keeps the in-cab display, the top-left badge (speed-up and timetable clock) and the opening map (see decisions).
2. **Export.** `STORY`, every stop's times, and a function from time to position and bearing go into `info`. `tools/export-web.mjs` reads them through headless Chrome, the way `stills.mjs` reads `info:` keys, and writes the data files above. It converts local meters back to lon/lat with the film's origin.
3. **Panorama tool.** `tools/cubemap.mjs` plus a `cube(t, position, size)` hook in `createCabRide`.
   - The hook renders six 90° views at film time `t` with the cab interior hidden.
   - The tool writes the faces and a `meta.json` (position and heading), and computes hotspot yaw and pitch from a targets file.
   - The Chicago/Halsted platform is at `ECH` = [-87.647364, 41.895754].
4. **Models in view from the platform:**
   - The Willis Tower and Prairie Material are being modeled now.
   - Halsted Pointe and Foundry Park are being refined from the City's Plan Commission decks.
   - Bally's is already modeled.
   - Check the first test cube for anything else that looks unfinished.
5. **Text fixes the page will show.**
   - The "SIX ROUTES" card becomes four lines through the tunnel (v8 note 4).
   - The cards about the Metra Electric's dwells change too, if v8 note 6 is done first.
   - The "Low Line" label goes with the minimap (v8 note 1).

The web render includes everything added since v7 (Soldier Field, Halsted Pointe, Foundry Park, the Willis Tower, Prairie Material), because removing the overlays needs a new render anyway.

## Hosting and deploy

- **Video on Vimeo (recommended):**
  - Upload the web render, at 4K or 1080p, through the API with the existing token.
  - Vimeo makes the smaller sizes and streams adaptively.
  - Set embed privacy to tunnel.stevevance.net (and the ngrok address while testing).
  - Hide the logo and title in the player settings. Confirm that Plus allows both.
  - Embed with `dnt=1` (no tracking cookies) and `playsinline=1`.
  - Upload the captions as a text track, or keep them in the page.
  - Check whether Vimeo's cue points (`addCuePoint`) work on Plus. If they do, use them for the pause.
- **Video on R2 (fallback):**
  - An R2 bucket `cabride-media`, and a Worker `buildthetunnel-media` (workers.dev, since the DNS is at DreamHost) with an R2 binding.
  - The Worker answers GET and HEAD and returns 206 for Range requests.
  - Two MP4 sizes (1080p and 720p) with version names (`cabride-v8-1080.mp4`).
  - Cost: should fit R2's and Workers' free tiers. Verify both when setting up.
- **Page:**
  - `cabride/index.html`, `app.js`, `style.css`, `data/` and `pano/`.
  - Add `cabride` to the `cp` list in `.github/workflows/pages.yml`.
  - Add a `sitemap.xml` entry, an Open Graph image (a still of the hero shot) and a link from the homepage.
  - Credit OpenStreetMap and OpenFreeMap on the map.
- **Testing:**
  - Locally with `python3 -m http.server`, and on phones through the ngrok tunnel (`buildthetunnel.ngrok.io`), before merging to `main`.

## Milestones

1. **Decisions** (below).
2. **Film tools:** the `web` option, `export-web.mjs` and `cubemap.mjs`. Check them with stills, a test cube at Chicago/Halsted, and the track drawn on a map.
3. **Page skeleton.** Use a short test clip (`direct-render.mjs --web --start/--end` around Chicago/Halsted) with:
   - the story panel
   - the map following the track
   - the pause
   - the panorama with placeholder hotspots
4. **Hotspot content:**
   - bus frequencies and routes
   - walk times and routes
   - destination cards
   - the Willis Tower and Prairie Material models in the scene
5. **Full web render** uploaded to Vimeo (or R2), with the page pointed at it.
6. **Polish:**
   - phones, keyboard, captions and the Open Graph image
   - test through ngrok
   - merge to `main`

**Later:**

- more stops: 18th St with Soldier Field, Union Station's hall, Clybourn with Foundry Park
- anonymous counts in D1 (plays, stops opened, hotspots clicked), like the planner's `trips` table

## Decisions

Decided:

- **The minimap comes out of the video;** a MapLibre map in the page follows the video (Steven, 2026-11-26).
- **Video host: Cloudflare R2** behind the `buildthetunnel-media` Worker, not Vimeo (Steven). The 360 views' tiles live
  there too, under a version (`pano/v1/`), so re-renders don't bloat the git history.
- **The first cut is Union Station to Chicago/Halsted** (film 157 to 218.5 s), and **the hero shot is part of the 360
  view:** the video pauses at the top of the pull-up and the 360 view opens from that camera; "Down to the platform"
  switches to a second view beside the train.
- **The 360 view can't look high into the sky** (top of view at 25° up high, 35° on the platform).
- **Phones and tablets** are told the page is best on a desktop, and load only the 2048 px tiles.
- **Captions** on a switch in the page; **no minimap**; the badge stays in the video.
- **Published 2026-11-27** with the Willis Tower and Prairie Material in the scene; the Target and Solstice on the
  Park come with the next version.

Still needed:

1. **The other overlays.** Recommended: keep the top-left badge (speed-up and timetable clock) and the opening map in the video. Moving the badge into the page beside the map is possible too.
2. **Captions.** Recommended: a CC track the viewer can turn on, rather than burned in.
3. **Where the 360 view stands.** Recommended: on the platform beside the train, at a passenger's eye height, rather than in the cab.
4. **Video host.** Recommended: Vimeo, with R2 as the fallback.
5. **Analytics.** Whether to count plays and hotspot clicks; it can wait.

## Risks

- **Vimeo's time events about four times a second.**
  - The pause could land up to about half a second late. Mitigation: the longer hold at Chicago/Halsted, or cue points.
  - The map would step between events. Mitigation: interpolate.
- **Data on cellular.** Mitigation: Vimeo's adaptive streaming; MapLibre's tiles are small.
- **The panorama not matching the paused frame.** It's rendered at the same film time from the same scene, so a mismatch means a bug; check it with a still/cube pair.
- **iOS tilt permission.** It must be requested from a tap; Photo Sphere Viewer's gyroscope plugin handles this, but test it on a real iPhone.
