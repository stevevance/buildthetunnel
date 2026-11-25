# Cab ride: Hyde Park to Rogers Park

The X1 from **59th (University of Chicago)**, the stop for the Obama Presidential Center, to **Rogers Park**,
in the operator's seat: no transfer, 18 stops, 17 miles. Copied from the main film (`../2026-11-15-cab-ride/`,
v19) on 2026-11-24. It has its **own diverged copy** of `assets/cab-ride.js`, so port scene changes by hand.

## Brief

| | Decision |
|---|---|
| Audience | Train nerds |
| Length | 4–6 minutes. Variable speed: 8x on the open-air ends, 4x in the tunnel and downtown. Full dwells at 59th, Union Station, Chicago/Halsted and Rogers Park; quick dissolves at the rest |
| Format | Horizontal 16:9 |
| Lighting | Morning rush, like v19 |
| Overlays | Same as v19 (captions, minimap) |
| South junction | The rendering the main film already has |
| Other trains | Metra Electric locals and expresses, South Shore Line, UP North bilevels, the oncoming X1 at Union Station |
| Audio | v19's train sound and announcements, plus a house music bed (laerlooper) |
| Ending | 78 min today vs 47 with CrossTowner; one seat instead of Metra Electric + walk + Red Line; UChicago to Loyola; jobs reached (LODES) |

Trip times are the planner matrix's, 8 AM, station to station (`planner/data/matrix/{today,scenario}/0800/`).
Today: ME to Museum Campus, 10-min walk, Red Line Roosevelt to Morse. CrossTowner: X1 from 59th, no transfer.

## The route (X1, CrossTowner GTFS)

| Segment | Stops | Track miles | In v19? |
|---|---|---|---|
| South, on the Metra Electric | 59th, 55th-56th-57th, 51st/53rd, 47th (Kenwood), Oakwood Blvd, 27th, McCormick Place | ~5.2 | No |
| Core | 18th, Roosevelt, Taylor/Clinton, Union Station, Randolph/Clinton, Chicago/Halsted, Division/Elston, Clybourn | 5.7 | Yes |
| North, on the UP North | Addison/Lincoln, Ravenswood, Peterson/Ridge, Rogers Park | 6.4 | No |

## Progress

1. Done: copied the film; TODO #1 and #2 (see `TODO.md`).
2. Done: track. `node tools/build-tracks.mjs` writes `assets/tracks.js` from OpenStreetMap (Overpass, cached):
   - `ME_LINE`: the Metra Electric from ~400 m south of 59th, through McCormick Place, the S-curve north of it,
     and 18th, with the train on the northbound local track (the eastern of the middle two of four), which every
     platform from 59th to 18th serves. Past 18th's footbridge it eases (12.7 m, over ~430 m) onto the main film's
     straight before the south ramp (`JOIN_SIGMA`). The main film had a straight chord from McCormick Place to
     18th, 20–50 m off the real tracks, missing the curve.
   - `UPN_LINE`: the UP North (relation 3117572) on from where `LOW_LINE` ends to ~1.2 km past Rogers Park.
   - `buildPlan` puts them on the ends of the plan, smoothed like the UP North always was. The plan is 18.2 mi.
     `D0` (in `createCabRide`) is where the main film's first frame would be along the plan, so a point s metres
     along the main film's straight is `D0 + s` (the south ramp, `START`, McCormick Place). The south corridor
     now follows the line (`curvedCorridor`). The ground rectangle grows to cover the plan (otherwise the longer
     corridor's hole broke it and hid the ballast).
   - The film still plays McCormick Place → Clybourn.

   Platforms (OSM): one island between the middle two tracks at 18th, McCormick Place and 47th, so doors open on
   the **left** there; at 51st/53rd, 55th-56th-57th and 59th each pair has its own island, so ours is on the
   **right**. The main film's 18th has side platforms with doors on the right; step 4 should change that.
3. Done: timing. The film runs 59th → Rogers Park, **5:34** (4–6 min is fine).
   - `CALLS`: all 18 stops in order. `ALL` stays the main film's 8, the ones with platforms and crowds; the new
     ones (`SOUTH_STOPS`, `NORTH_STOPS`, GTFS positions, the train centred on them) are timing-only until step 4.
   - `speedupAt(d)`: 8x (`SPEEDUP_ENDS`) on the ends, 4x from 18th through Clybourn, easing between them on the
     runs McCormick Place → 18th and out of Clybourn. Each run's film time (`tf`) is integrated from it.
   - Dwells: 6 s at 59th, Union Station, Chicago/Halsted (the aerial shot needs it) and Rogers Park; 3 s at the
     rest. Every stop is 60 s on the clock. `clockAt` adds up the phases' real time from 7:41 at 59th.
   - Running side: the UP North runs on the left. `sideAt(d)` is the train's side of the line: right on the Metra
     Electric and in the tunnel, left on the UP North, the two tracks swapping through a diamond just past
     Chicago/Halsted's platforms (`XO_FROM`, assumed). The UP North line is shifted `UPN_SHIFT` (2.15 m) east of
     OSM's northbound track so the train runs on that real track. Boarding, alighting and "Exit on the left"
     follow it (`S.our`, `S.doors`). The UP Northwest's track (west) now curves away at Clybourn instead of
     running on to Rogers Park.
   - Captions, announcements and the minimap are still timed to v19 (step 6).
   - Seen, not fixed: the aerial pull-away above Chicago/Halsted smears at ~199 s (v19 does the same at 136 s);
     at 8x the overhead-wire frames leave ghost copies (motion blur sampling); peak speeds reach 84–99 mph.
4. Scenery and stations.
   - Top speed capped at 79 mph (`TRAIN.top`), Metra's limit. The film is 5:36.
   - City: `node tools/build-corridor.mjs` writes `assets/city-corridor.js` (22,230 buildings, streets, water,
     parks within 500 m of the new track, outside `city-wide.js`'s area; same rules as `build-city.mjs`), which
     `index.html` adds to `city-wide.js`'s lists. Its Overpass queries go through the Chicago Cityscape CLI
     (`cli/overpass.php --json`: the paid Overspan endpoint, then the public servers), one at a time, 55 s each;
     water and parks from the OpenFreeMap tiles. Landmarks: the Obama Presidential Center, the Griffin Museum of
     Science and Industry, McCormick Place's halls.
   - Motion blur: the shutter shortens as the speed-up rises (`SHUTTER * SPEEDUP / speedupAt`), and the samples
     increase where the train moves more than ~0.3 m between them, so 8x looks like the main film's 4x.
   - Tracks: the Metra Electric's other three tracks where OSM has them (`ME_SIDES`, from `build-tracks.mjs`);
     our other track is its real southbound local (`meSide(1)`) until it closes in to -OFF before the ramp. The UP
     Northwest's two tracks (moved west past the platforms, assumed) curve away at Clybourn.
   - Stations: `islandStation` builds the Metra Electric's islands (`ISLANDS`): our side's, with a canopy, the
     name facing both tracks and a stair down to an underpass (18th's: up to the footbridge, replacing the main
     film's side platforms), and at the Hyde Park stations the western pair's across the tracks. The UP North's
     new stops are side platforms with a footbridge, like Division/Elston (all assumed). Crowds stand by
     `platAt` (x metres back from a platform's edge), so the main film's stay where they were.
   - `curvedCorridor.has` uses a grid (the corridors are miles long); the Metra Electric's wires follow the curve.
   - Assumed and not modelled: the UP North and the Hyde Park Metra Electric are on embankments with street
     viaducts in reality; here, as in the main film, the line is at grade.
5. Done: other trains, met at our stops (at 8x one passing on the open line is gone in a blink). `makeConsist`
   builds them (looks assumed: a Highliner, 4 stainless bilevel EMU cars; a South Shore train, 6 single-level
   cars with a red stripe; a UP North push-pull, cab car leading south, 4 gallery cars, a Metra-blue diesel at the
   north end), `OTHERS` says where and when, `frontAt` moves them (arrive and stand, pull away, or run through):
   - 59th: a southbound Highliner beside us at the western island as the film opens, pulling out at 4.6 s.
   - McCormick Place: a southbound Highliner draws in on the far side of our island; those waiting board it.
   - 27th: a South Shore train runs through on the outer western track.
   - Addison/Lincoln: a UP North express runs through southbound.
   - Rogers Park: a southbound UP North train draws in at the east platform; its riders board.
   - Union Station: the oncoming X1 (TODO #2), as before.
6. Done: words, sound and the map. The film is **5:49**.
   - Announcements: `build.py` writes them from `STOPS` (spoken name, transfers, door side) for all 18 stops; Zoe
     speaks them. `tools/place-audio.mjs` places them by each stop's own dwell: the full sequence at the four full
     stops; at the rest the door chimes and "Next stop…", without its pre-chime where the run is too short.
   - Cards: the Obama Center (59th), the Metra Electric (51st/53rd), "Into the tunnel" (18th), "On the left"
     (Ravenswood), and the ending, under a dimmed view as the train pulls out of Rogers Park (`REVEAL_TAIL` 18 s):
     78 vs 47 min, one seat, campus to campus, 155,000 more jobs, then "Plan your own trip". The track and city run
     on 2.6 km past Rogers Park for it.
   - Jobs: `analysis/r5r_jobs_59th.R` (LODES 2023, 8 AM, from 59th St): within 60 min 1,122,206 today, 1,277,235
     with CrossTowner (+155,029, +13.8%); within 45 min +122,605. In `analysis/results/jobs_access_59th.csv`.
   - Minimap: rebuilt for the whole ride (`tools/minimap/README.md`); `tools/minimap/via-cityscape.py` sends the
     skill's Overpass queries through the Cityscape CLI. `assets/minimap-geo.js` keeps the opening map's view.
7. Done: music. "This Time With Soul!" by laerlooper (EJG), https://ccmixter.org/files/laerlooper/4570, CC BY 2.5,
   credited on the closing screen. Chosen over "Perpetual Motion (AndyPop Mix)" (andrewwainwright) and "Our Generation"
   (MartynJoseph2000). `tools/place-audio.mjs` loops it once (4 s crossfade), keeps it low under the train, dips it under
   every announcement, fades it in and out into the credits, and writes `assets/audio/music.wav`. The repo ignores
   audio: copy the MP3 from `~/Music/CCmixter/` to `assets/music/`.

## Open questions

- Platform sides: settled from OSM's platforms (see step 2). Worth a glance at aerials when building them.
- Loyola is on the Red Line, not at Rogers Park Metra; "campus to campus" is approximate at the north end.
