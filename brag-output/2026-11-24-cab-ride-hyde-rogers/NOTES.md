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
| Other trains | CrossTowner double-deckers (a four-car KISS) on the Metra Electric, the UP North and in the tunnel; a FLIRT like ours on the South Shore's track at 27th |
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
5. Done: other trains, met at our stops (at 8x one passing on the open line is gone in a blink). They are the
   CrossTowner double-decker (`makeKiss`: a four-car KISS, `assets/kiss-train/`, 106.2 m) everywhere but 27th, where
   a FLIRT like ours (`makeTrain`) runs on the South Shore's track. (The stand-ins they replaced, `makeConsist`'s
   Highliner, South Shore and UP North push-pull, are in git history; `makeConsist` now builds only the Brown Line
   train.) `OTHERS` says where and when, `frontAt` moves them (arrive and stand, pull away, or run through):
   - 59th: a southbound double-decker beside us at the western island, pulling out at 4.6 s (in the opening shot).
   - McCormick Place: a southbound double-decker draws in on the far side of our island; those waiting board it.
   - 27th: a FLIRT runs through southbound on the outer western track (the South Shore's).
   - Addison/Lincoln: a double-decker runs through southbound.
   - Rogers Park: a southbound double-decker draws in at the east platform; its riders board.
   - Union Station: the train the other way (`meetTrain`) is a double-decker too, its windows lit, its pantograph at
     the tunnel's wire (5.3 m); so is the one that pulls in to Chicago/Halsted in the closing shot (`southbound`).
   - The tunnel needed no enlarging for it: the KISS is 4.84 m to its roof, under the tunnel's wire (5.3 m) and the
     station boxes' ceilings (6.0 m), and the bore (5.3 m radius, centred 2.7 m up) clears its upper corners by 1.4 m.
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
   every announcement, fades it in and out into the credits, and writes `assets/audio/music.m4a`. The repo ignores
   audio: copy the MP3 from `~/Music/CCmixter/` to `assets/music/`.

## Open questions

- Platform sides: settled from OSM's platforms (see step 2). Worth a glance at aerials when building them.
- Loyola is on the Red Line, not at Rogers Park Metra; "campus to campus" is approximate at the north end.
- Which Metra Electric tracks the X1 uses (assumed, not checked against Metra's track use): the inner west track,
  northbound, with southbound trains on the eastern of the middle two. Its track is the real one smoothed (two passes
  of an 80 m moving average) and leaves it 75 m short of the 18th St footbridge, easing in to the tunnel's spacing,
  where the real track swings 6 m or more west.

## Audio files

All the film's audio is AAC (`.m4a`, 192 kbit/s), written by `build.py` and `tools/place-audio.mjs`: as WAV the train
sound and the music bed were 64 MB each, over half of what goes to a render droplet (the folder is now ~20 MB).

## Embankments (from LiDAR)

Heights come from Cook County's 2022 LiDAR (ISGS `IL_Cook_DTM_2022` / `IL_Cook_DSM_2022` image services, sampled
along and across the tracks). In the scene, `EMB(d)` is the track bed's height above the streets, added to the
profile; `GAPS` puts a plate-girder bridge wherever a street (not a service road) crosses where `EMB` > 2.5 m.

| Stretch | Measured | In the film |
|---|---|---|
| Metra Electric, 59th to 47th | streets 4.5-6.3 m under the bed; fill +5.0 to +5.4 m | 5.3 m |
| 47th to about 43rd | descends to grade | eases to 0 over 750 m |
| Oakwood, 27th | at grade (even a shallow cut) | 0 |
| UP North, Chicago/Halsted | at grade, under the Chicago Ave and Halsted St viaducts (the LiDAR's ~6 m there is the viaducts, not the track) | 0 |
| Division/Elston, North Ave | Division 4.4 m, North 4.2 m | rises to 4.4 m |
| Clybourn to Rogers Park | Ashland 5.5 m; Sunnyside-Winnemac 4.4-5.7 m; fill +3.3 to +4.1 m | 5.0 m |

North of Clybourn (Armitage to Webster, about 500 m) the LiDAR's bare-earth model reads 3-6 m below the track, as if
the ground were open, but Street View shows solid embankment there: the classifier evidently dropped the fill. It is
drawn as embankment, with bridges at Armitage, Elston and Webster. Check views: `tools/stills.mjs <dir> p9@<stop>` / `p10@` (from the street under the
nearest bridge, east / west), `p11@` / `p12@` (from above, east / west); `p13@0` / `p14@0` (Clybourn to the river: from the street, from above).

## Shareable modules

The train's exterior and Bally's Chicago are their own modules, like the Deering Bridge: `assets/crosstowner-train.js`
(`buildCrossTowner`: a four-car Stadler FLIRT, Metra's battery train without its PowerPack; the PowerPack is kept on its
own in `assets/flirt-powerpack.js`, whose `BEMU_CONSIST` puts it back), `assets/kiss-train/` (`buildKiss`: the
CrossTowner double-decker) and `assets/ballys-resort/` (`buildBallysResort`). `node tools/export-models.mjs` writes each
as `exports/<name>.glb` with a preview PNG (see `exports/README.md`). `node tools/train-views.mjs <dir> [--lit] [--bemu] [--kiss]`
draws a train alone from set viewpoints (front, side, aerial, PowerPack...), for checking its design without the film.

- **The double-decker** (`assets/kiss-train/`) is the "Caltrain Stadler KISS" model (`assets/Caltrain-KISS-project.zip`)
  cut to four cars (B cab, G coach, F bicycle car with the raised pantograph, A cab: 106.2 m) and redesigned: the
  CrossTowner's white (#dce2e4) and teal (#0b7285), a deep teal band low on the side that climbs at each cab to meet a
  teal band straight across under the windscreen (Caltrain's red top and red stripe gone), a nose raked back 0.5 m more
  at the roof, a square-footed windscreen, a slim headlamp bar in place of the KISS's twin-lamp pod, horizontal low
  lamps, a "CrossTowner" wordmark on the cab cars, invented fleet numbers (2131...), and no Caltrain or Stadler marks.
  The body, roof and running gear are the model's (`body.js`, `roof.js`, `gear.js`); `index.js` lays it out like the
  FLIRT (cars along +z, `userData { len, from }`), so `placeTrain` stands it on the track. The KISS has two sets of
  doors for Caltrain's two platform heights (low ones mid-car, sill 0.55 m; high ones over the bogies, 1.44 m); the
  CrossTowner keeps only the end doors, their sill at the film's platform height (1.10 m), and the low doors' places get
  lower-deck windows.
- **Bally's Chicago** (`assets/ballys-resort/`) is the "Bally's Chicago exterior model" (`assets/Ballys-Chicago-Project.zip`,
  after HKS's Phase 1 site approval): the casino podium with its parking decks and green roof, the hotel tower, and
  the riverwalk and park. Its four modules are the model's as delivered, but for two changes: the landscape's ground slab
  is left out (the film has its own ground), and the glass mirrors a painted sky (it went black with none). Its own
  streets, river, neighbours and people are left out. It is registered by fitting ten named buildings of its context data
  to OpenStreetMap's (turned 2.5 degrees, then moved; each within 11 m; its railway lands within about 3 m of OSM's);
  its outline clears OSM's buildings. The earlier model, `assets/ballys-chicago.js`, still supplies `ballysPlan`, for
  the employee car park west of the tracks (its east side now follows the line, 19 m off).
- **The line by Bally's** (`RR_STRIP` in `cab-ride.js`): the straight from the 1000 m curve to Chicago/Halsted ran 4-11 m
  east of the railroad's land, so its north ramp, trench and platforms sat on the Bally's site and its new Jefferson
  St. Checked against Cook County's 2025 parcels (Cityscape database, `parcel_2025`, class RR), the county's 2025
  orthophoto (`CookOrtho2025` ImageServer; note `exportImage` widens the extent to the requested size's aspect, so read
  the returned extent with `f=json`) and OSM, the line now eases over into the middle of that railroad strip (25-40 m
  wide, the old spur's tracks between the site and Halsted St): up to 25 m west, in the bore from about 1 km before the
  stop, back toward the straight through the platforms (a reverse curve of about 730 m) and along the curve onto the
  UP North. The portal stays just north of the Ohio St feeder ramp. Conflicts looked for: the resort is now 25 m or
  more away; the trench and platforms are inside the railroad's parcels but for a small non-RR parcel at the ramp and
  the street under Chicago Ave; 734 N Halsted and 825 W Chicago Ave (7 storeys) come within the cleared corridor but
  are 11.5 and 13.4 m from the line, clear of the platforms, so they are kept (`KEPT`); the UP North join tightens from
  305 m to 287 m; the timing moves by 0.03 s.
- **Museum Park** (`assets/museum-park.js`, `buildMuseumPark`): the towers south of Grant Park, west of the south portal:
  NEMA, One Museum Park, The Grant, Museum Tower, Museum Pointe, Museum Park Towers 1 and 2 and Sky55, from OSM's
  footprints and parts. `museumParkSite` gives one outline per footprint, and OSM's buildings inside them are cleared.
  The Michigan Ave towers are still OSM extrusions.
  - Heights: the podiums and mid-rises are measured with the 2022 LiDAR. The LiDAR has no returns from the five tall
    towers' roofs, so those use OSM's heights; One Museum Park's levels are scaled to its published 221 m.
  - Looks: checked against Commons photographs (credited in the module's header):
    - NEMA: dark glass in a light frame with heavy piers, and a white finned podium.
    - One Museum Park: blue glass with balconies, a silver elliptical core, and a crown of fins and a winding band wall.
    - The Grant: green glass with balconies and a braced screen on its rounded top.
    - Museum Tower and Sky55: dark glass in a white grid.
  - The architects' copper dome on One Museum Park appears in no photograph, so it's left out.
  - Previews: `previews/museum-park/` (the model alone from the south-east, the north and NEMA's top; and the film from
    the south, from the south-east and at cab height).
  - Assumed: storey heights, the facades' proportions, which columns have balconies, where One Museum Park's crown
    starts (205 m) and that its spiral makes one turn, and how The Grant's 181 m is split between box, top and screen.
- **Soldier Field** (`assets/soldier-field.js`, `buildSoldierField`): replaces the OSM boxes and the instanced columns that
  stood in for it. The 1924 Doric colonnades on both sides (22 columns in a double row, 9.4 m, on a 14 m base; four end
  pavilions with pediments), the old horseshoe wall round the south end, the north plaza and lawn on the garage (13.5 m),
  and the 2003 bowl: the west grandstand's "saucer" cantilevered over the west colonnade (fascia 34.5-39.7 m, rim frames to
  44.8 m), the east glass suite building behind the east colonnade (40.5 m), the field and stands. Heights from the 2022
  LiDAR; shapes from OSM's parts and nine Commons photographs (credited in the header). Assumed: the field at street level
  (it is about 2 m below), column and window details, the soffit and struts. `soldierFieldSite` clears OSM's buildings and
  keeps the film's trees off the decks. Previews: `previews/soldier-field/`.
- **Halsted Pointe** (`assets/halsted-pointe.js`, `buildHalstedPointe`, `phases`): Onni's project at the southern tip of
  Goose Island (901 N Halsted), about 280 m east of the line north of the Chicago/Halsted stop. Phase 1 (Hartshorne
  Plunkard, 46 floors, 497 ft, under construction) inside OSM's construction outline (way 1187740901), 7.1 m south of
  OSM's building outline (way 1561094811), where HPA's setback and the City's site plan put it; then SCB's November 2026
  redesign: towers of 44, 51, 44 and 46 floors on one continuous podium per pair, a 13-story hotel, Pointe Park and the
  beach. From the City's Plan Commission deck (November 19, 2026, PD 1522: `931_N_Halsted_CPC_Draft_for_posting.pdf`)
  and HPA's drawings. The deck gives heights above Chicago City Datum; the model's y 0 is the raised terrace at +26 ft
  CCD, so B2 tops out at 171.9 m. Not to be confused with Onni's Halsted Landing (700 W Chicago Ave, PD 1399), beside the
  stop, which isn't modeled. Previews: `previews/halsted-pointe-cpc/` (the first version's: `previews/halsted-pointe/`).
- **Foundry Park** (`assets/foundry-park.js`, `buildFoundryPark`, `phases`): JDL's plan for the Finkl site (PD 1439),
  from the City's Plan Commission deck of January 15, 2026 (`2026-01-12_Foundry_Park_CPC_PD_PowerPoint.pdf`, by
  Hartshorne Plunkard and Nudge Design), about 410 m east of the line before Clybourn. Phase 1 in detail (the 520 ft,
  39-story tower at Cortland and Kingsbury, the brick hotel and two brick blocks round Central Square, the new streets and
  riverwalk); the later subareas from the deck's enlarged master plans (townhouses, river houses, three stepped podium
  towers, the curved riverside towers by the 606 extension, and two towers across the river by Elston). Placed on OSM's
  streets (six intersections, within 3 m); where the deck's drawing doesn't fit OSM (Dickens, Elston), the buildings keep
  to OSM's streets. Previews: `previews/foundry-park-cpc/` (the first version's: `previews/foundry-park/`).
- **1840 N Marcey** (`assets/marcey-1840.js`, `buildMarcey1840`): Sterling Bay's two towers by Solomon Cordwell Buenz
  (PD 1605; Plan Commission June 20, 2024; passed by the City Council, scaled back, July 16, 2025; not started), on the
  strip between Marcey, Kingsbury, Clifton and Wisconsin, about 690 m east of the UP North beyond Foundry Park: A, 19
  stories to 68.6 m, and B, 16 stories, 59.4 m north of its notch and 53.3 m south of it, both on 12 m brick-and-glass
  bases; 590 homes. Footprints traced from the PD's roof plan; heights from its elevations (A's label is blurred, so
  its 225 ft is the scale bar's). Replaces city-wide.js entries i 28880 and i 29198. References (none openly licensed)
  in refs/marcey-1840/private/.
- **410 N Elizabeth** (`assets/elizabeth-410.js`, `buildElizabeth410`): the first (east) tower of PD 1528 (400 N
  Elizabeth; Tree Street Group with Mark Goodman & Associates; Archeo Design Studio; Clark Construction; 33 stories,
  106.2 m to the main roof) as it would stand at level 7: levels 1-4 finished in the PD's champagne fins and fritted glass
  in a charcoal frame (levels 2-6 are parking behind that screen, so no apartment windows), levels 5-7 bare slabs and
  columns with guardrails and netting, the core with its climbing forms to 28 m, and a red hammerhead crane south of
  the tower (its spot from Chicago YIMBY's photos). The builder's default puts the jib 20 m above the finished roof (my
  brief); the film passes `jibHeight: 60`, a free-standing height for this stage (assumed). The site is OSM way
  1308334948 (landuse=construction), which had no city buildings on it. 1,714 triangles. References (the PD ordinance,
  the Plan Commission slides, YIMBY's photos; none openly licensed) in refs/elizabeth-410/private/.
- **875 N Michigan** (`assets/875-north-michigan.js`, `buildNorthMichigan875`): the old John Hancock Center, in place
  of OSM's five tower parts, penthouse and two antenna boxes (city-wide.js entries 33028-33032, 36873, 33174-33175, and
  the canopies 36868, 36869, 36875, 36876; a 2 m kiosk, 36874, goes with them). The tower tapers in straight lines from
  80.8 x 50.3 m at grade to 48.8 x 30.5 m at the parapet (337.4 m, matching the 2022 LiDAR), with the penthouse to
  343.7 m, X-braces on all four faces (their levels assumed, from photos), and white antennas to 457.2 m (east, FCC
  via SkyscraperPage) and 424.3 m (west, assumed: Wikipedia's "reduced to 285 ft"). The lattice masts have a solid grey
  core inside their white members: the real steel is dense and full of feed lines and panels, and drawn as an open
  frame it looked hollow (Steven, 2026-11-27). About 2,100 triangles, 9 draw calls.
  References in refs/875-north-michigan/.
- **Willis Tower** (`assets/willis-tower.js`, `buildWillisTower`): replaces OSM's single 442 m box (city-wide.js
  entry 36109, whose antenna rule had also drawn two white masts 85 m too tall). The nine 75 ft tubes stepping back at
  the 50th (NW, SE), 66th (NE, SW) and 90th (N, E, S) floors, W and C to the 108th (436.4 m) and the penthouse to
  442.1 m; heights from the 2022 LiDAR. The antennas as of August 2026 (tips level at about 528 m, from a photo; the
  FCC's 527.3 m for the west); black louver bands capping the setbacks (TODO.md had asked for white ones; every photo
  shows black); the five glass boxes of the Skydeck Ledge on the west face at the 103rd floor. Previews:
  `previews/willis-tower/`.
- **Prairie Material's Yard 32** (`assets/prairie-material.js`, `buildPrairieMaterial`): the ready-mix concrete plant at
  835 N Peoria St by Chicago/Halsted (it makes concrete, not cement): 11 slip-formed aggregate silos with the conveyor
  gallery on top, the batch tower over its truck bay, four steel cement silos, the barge quay and crane, conveyors,
  stockpiles, trucks; all measured from the LiDAR. The film passes it its line (`railway`), so the yard's paving stops at
  the ballast and the fence and trucks keep off the track. Previews: `previews/prairie-material/`.
- The line past Chicago/Halsted now keeps to the industrial spur it follows (OSM way 927810930; `RR_STRIP`, 100 to 480 m
  past the stop): the plain curve had cut the corner by up to 14.7 m and put the track through Prairie's silos. The
  line is 5 m shorter; every later stop arrives 0.02 s earlier. The assumed extra track 10.5 m east of ours ends 100 m
  past the stop, short of the silos.
- `node tools/model-views.mjs <out-dir> <module> <builder> [--centre NAME] <views>` draws any of these modules alone.

## The web page (tunnel.stevevance.net/cabride/)

The page around the film lives in `cabride/` at the repo root (plan: `docs/plans/2026-11-26-cabride-page-plan.md`).
The film side:
- `index.html?web` / `tools/direct-render.mjs --web` renders the cut for the page: no story cards, captions or minimap
  (the page shows them, with a MapLibre map); the badge stays. The first cut is film 157 to 218.5 s (Union Station to
  the top of the hero pull-up at Chicago/Halsted).
- `tools/export-web.mjs <cabride/data> --from 157 --to 218.5` writes the page's data from the film: the story cards,
  stops, the train's track (lon/lat every 0.25 s), the route and the captions. Re-run it whenever the film's timing or
  line changes.
- `tools/cubemap.mjs` renders a 360 view from the scene (`createCabRide`'s `cube()`), as six faces or as tiles at a
  level of detail; `tools/web-panos.sh` renders the page's two views at Chicago/Halsted (from the hero shot's own camera
  at its top, 217.28 s; and on the platform beside the train's last car, d 14435) at 2048, 4096 and 8192 px, with the
  hotspots' directions from `cabride/data/places.json`. Phones load only the 2048 px tiles.
- Station signs are two-sided now (`twoSided`): they read correctly from behind, exit arrows pointing the right way.
- The overlays are three switches (`createCabRide`'s `opts`: `cards`, `minimap`, `captions`; index.html `?nocards`,
  `?nominimap`, `?nocaptions`, or `?web` for none of them; `direct-render.mjs --no-cards` etc.; `PARAMS="nocards"` for
  `tools/stills.mjs`). From v8 the film itself goes without the cards and the minimap (Steven, 2026-11-27), except the
  opening: the map of the terminals and the tunnel still draws with its two cards (TODAY, WITH THE TUNNEL), then fades
  away where it used to shrink into the minimap, and an "A PROPOSAL" card follows, so the film shared on its own still
  says the line isn't built. Cards marked `keep: true` are the ones that stay (`drawStory(t, true)`); `?web` drops them too.
- Stops north of Clybourn take 30 s on the clock (`realDwellOf`), the others 60 s.
- Since left-hand running (2026-11-27) the train stands on the west track at Chicago/Halsted: the platform 360 view
  moves to 7.3 m left of the line (`--at 14435,-7.3,2.7` in `tools/web-panos.sh`), and the page's data (`export-web.mjs`)
  and video must be re-made with the 360 views, or the paused frame and the 360 view won't match.

## City data fixes

`assets/city-additions.js` corrects buildings the OSM-built city files get wrong, until OSM is fixed and the files are
rebuilt: index.html drops the generated buildings inside each `replace` ring and adds its `buildings`, which the film
draws like their neighbors. So far: Westerly, 740 N Aberdeen St (OSM way 791826141 has no height, so it was drawn 6 m
tall; now its 11-story U, 36 m, round a 7.5 m courtyard podium, heights from the 2022 LiDAR). A JOSM file adding
`building:levels=11` and `height=36` to the way was written for Steven (Desktop, westerly-740-n-aberdeen.osm); once OSM
has them and the city files are rebuilt, remove the entry.
- Halsted St over the North Branch (2026-11-27; Steven saw its elevation was wrong): the viaduct's north ramp used to
  run down across the river and stood in it as fill. Now the deck comes down from the viaduct's 8.4 m to 6.4 m before
  the south bank, crosses at 6.4-6.0-5.0 m (the 2022 LiDAR; OSM's bascule, way 24231504, layer 1) on girders with no
  piers in the water, and reaches grade 185 m north of the river (`H.bank`, `H.end`).
- Every train keeps to the left-hand track (Steven, 2026-11-27: on the Metra Electric to match the UP lines, and in
  the tunnel too), so past Chicago/Halsted our two tracks just run parallel under the wires; the scissors crossover
  that used to change sides there (`XO_FROM`, `trackAt`) is gone. `sideAt` is the west track, `otherAt` the east.

## People

The people are their own module, `assets/people.js` (`peopleKit`). It has ten kinds of rider:
- commuter (coat, shoulder bag, phone)
- student (hoodie, backpack, sometimes headphones)
- nurse (scrubs, lanyard, coffee)
- trades (hi-vis vest over flannel, boots, beanie, lunch bag)
- elder (gray hair, cardigan or quilted vest, cane)
- dress (dress with denim jacket or cardigan, tote)
- parent (zip jacket, jeans, crossbody bag)
- cyclist (dressed as the parent, with the bike)
- child (rain jacket)
- wheelchair user (sweater)

Each is varied by its seed: skin tone, hair color and style (a headscarf now and then), clothing colors, build and
height. Faces have eyes, eyebrows, a nose and ears; every hairstyle and the beanie keep above the eyebrows. Arms reach
their hands with two-bone IK, so hands meet a stroller's handle, a bike's bars, a suitcase's handle or a child's hand.

Each station's people are merged into one vertex-colored mesh per lot that comes and goes together (waiting for our
train, waiting for the other, got off), so they cost a few draws, not one per body part. The Quaternius rigged bodies
(`USE_HUMANS` in index.html) are off and their posing code is gone from cab-ride.js (it is in the git history).

Check views:
- `node tools/people-lineup.mjs <dir>` shows the ten in a row: front, three-quarter, side, back, faces close (`faces1`, `faces2`), and five variations of each crowd kind (`vary1`, `vary2`). Add `--seed n` for others.
- `node tools/stills.mjs <dir> p0@<stop>` to `p5@` show the film's wheelchair user, stroller, bike, family, traveller and couple; `p15@` to `p18@` show four of the crowd, close.

## The opening shot

The film opens on an 11 s shot (`INTRO`, `SHOTS[4]`, flight in `INTRO_FLIGHT`). It starts 240 m up, 650 m south of
where the plan begins, looking at the Obama Center's tower; it passes the tower to the west and comes down over 59th
St's platforms to just behind and above the operator's seat, then dissolves into the cab over the last 1.4 s
(`INTRO_FADE`). The ride, and everything timed to it (the opening map, the cards, the audio), starts at `INTRO`;
`clampT` holds the train at 59th until then, and `tools/place-audio.mjs` times the first announcements from
`arrivals[0].t`.

What the shot looks over beyond the corridor's data is `assets/city-intro.js`, from `node tools/build-intro-area.mjs`
(Overpass through the Cityscape CLI, cached). It covers Jackson Park, Woodlawn and the south of Hyde Park
(`AREA`: 67th to 55th, Washington Park's edge to the lake), with buildings, streets, parks and water the corridor
lacks. For the whole area it adds park paths, mapped trees, woods and residential streets. In the scene:
- the paths are pale ribbons;
- `plantTrees` plants trees thick in the woods, scattered over the parks, along the residential streets, and at the
  mapped trees, kept clear of streets, paths, buildings, water, the railway and the Obama Center's grounds.

The Obama Center itself is `assets/obama-center.js` (`buildObamaCenter`), with OSM's buildings on its site cleared. So is
the Museum of Science and Industry: `assets/msi.js` (`buildMSI`).
- Footprint: OSM's outline of the whole complex.
- Heights: measured from Cook County's 2022 LiDAR on a 3 m grid. The main hall's blocks are 14.3 m; the cross's gabled
  arms are 33 m wide with 28 m ridges; the central dome's crown is 44 m and its lantern 47.4 m; the pavilions are 15.8 m
  with small domes to about 23 m; the Space Center's dome reaches 20 m.
- Porticos and columns: assumed.

South of where the film's own alignment begins (about 240 m south of 59th), the Metra Electric runs on from OSM's main
tracks (`city.rails`). It sits on the same 5.3 m embankment between concrete walls, with a plate-girder bridge wherever a
street crosses under.

## Review batch, 2026-11-26

- **The lake** reaches the horizon: `assets/lake.js` (OSM's "Lake Michigan" shore, Indiana to Evanston, simplified to
  10 m; `python3 tools/build-lake.py`) is closed 40 km out and added to `city.water` at the top of `createCabRide`.
- **South of 59th** OSM has six tracks (four Metra Electric, two CN "Chicago Subdivision"), and Cook County's 2025
  orthophoto shows them too: the extension south of the plan (`city.rails`) is right to draw six. North of the plan's
  start the film's own corridor shows five. Decided (2026-11-26): keep five; don't add the fifth and sixth tracks.
- **Curves eased** (end of `buildPlan`): the arcs met their straights with a step in curvature, a ~0.3 m kink over 34 m
  that made the train lurch at 4x (by the south portal; at the UP North join). Two passes of the 50 m moving average over
  the whole plan turn each step into a ~100 m ramp; the line moves at most 1.4 m; arrivals from Roosevelt on are ~2 s
  earlier (the speed profile no longer reads the kinks as tight curves).
- **The Brown Line** reaches 2.5 km from where it crosses the UP North (`BROWN_REACH` in `tools/build-tracks.mjs`, on a
  wider Overpass box), so its structure runs out of view instead of ending in mid-air.
- **Minimap landmarks** (`SIGHTS`): the Obama Center, the Museum of Science and Industry, McCormick Place, Soldier Field
  and Bally's Chicago, as amber diamonds, each labelled on the side away from the line (below it if it would run off).
- **The cab's pillars** follow the train's own nose (`FLIRT_CAB` in `assets/crosstowner-train.js`): the windscreen wraps
  round each corner and back as it rises, so from the seat (an eye 2.1 m behind the face, 2.75 m up) its edges sit at
  the lower corners of the view and sweep up and out of it. The pillar is the 0.35 m strip behind that edge; the cab's
  sides below and above the side windows are drawn too. (Before: two near-upright bars leaning in.) Approved as is.
- **Captions**: of the two alternatives mocked up (`previews/notes-batch/4a`, `4b`), A (cards like today's) over B (an LED
  sign in the cab). No new landmark labels (such as Museum Park). No pinning either: most cards are ideas with nothing on screen to
  point at, and at 4x a leader line would chase its subject out of frame. So the story cards stay as they are.
