# Cab ride: the reel (Instagram) cut

A vertical, about one-minute introduction to CrossTowner for the Chicago Cityscape Instagram, cut from the
cab ride (`../2026-11-15-cab-ride/`). It has its **own diverged copy** of `assets/cab-ride.js`, so port scene
changes by hand.

## What it is

| Film seconds | Shot | On screen |
|---|---|---|
| 0–23 | Shot 2 of the full film (the climb from the north portal up over the Loop), at 1x | The case for the tunnel in big type (`BEATS`); from 16 s, lines of light (`drawRoutes`): the tunnel in gold, X1–X4 in light blue, X5, X6 and the lettered lines (A, C, E, …) in violet |
| 22–25 | Dissolve into the cab | The "Take a ride through the tunnel" label (`drawSpicy`), in Chicago Fire FC navy, red and light blue (`LABEL`), DIN Condensed |
| 23–51 | The cab, from pulling out of Taylor/Clinton, through Union Station | Announcements, captions, minimap, the Union Station card |
| 51–56 | The cab, dimmed | Foundry Park → Soldier Field: 15 min against today's 51 (`TRIP`; 15 is the full film's own `WHOLE_RIDE`) |
| 56–59 | | "Learn more at buildthetunnelchicago.org" (`drawClosing`) |

All of it is `film(T)` in `assets/cab-ride.js`, which maps the reel's clock onto the ride's. The overlays lay
themselves out for a vertical frame (`PORTRAIT`, `UI`).

## Building

| Task | Command |
|---|---|
| Time the audio to the reel | `node tools/place-audio.mjs` (cuts the ride's clips to the cab part, with `data-media-start` trims) |
| Stills | `SIZE=720x1280 node tools/stills.mjs <out-dir> 18 22.5 54` |
| Render | `node tools/direct-render.mjs --size 720 --vertical --output cab-ride-reel-v<N>-720.mp4` (`--size 1080` for the final) |

`build.py` is the full film's and is out of date here: use it only for the audio (`./build.py --no-render`).

## Music

"Video Movie Game" by geoffpeters (https://ccmixter.org/files/geoffpeters/49660), CC BY 3.0, under the intro until
just before the first chime of the cab part; credited on the closing screen. `assets/music/` is not in git (the
repo ignores audio): copy it from `~/Music/CCmixter/geoffpeters_-_Video_Movie_Game.mp3`.

## Data

- `assets/xroutes.js`: the lines of light, from `planner/data/lines.json`. X1–X4 use the tunnel; X5 and X6 go
  through Union Station on its riverside tracks (`analysis/crosstowner_xroutes_gtfs/routes.txt`).
- The Star:Line system diagram (`private/CrossTowner Regional Rail - System Diagram.kml`) has its own lettered
  lines (and a Z Line and shuttles); switching the violet lines to it is an open option.

v6 is the latest render. Its 1080 version (re-encoded to `cab-ride-reel-v6-1080-ig.mp4`) was posted to the Chicago Cityscape Instagram on 2026-11-23: https://www.instagram.com/reel/DgFtCvwiVoX/
