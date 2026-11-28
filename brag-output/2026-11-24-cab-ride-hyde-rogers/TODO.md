# Hyde Park to Rogers Park: changes carried over from the main film

The main film's TODO as of 2026-11-24, done here first. They are still open in `../2026-11-15-cab-ride/`
and the alders' cut.

| # | Change | Alders' cut | Status |
|---|--------|-------------|--------|
| 1 | Wheelchair users waiting on a station platform should board the train, not be left behind on the platform. | Yes | Done here |
| 2 | The oncoming train we pass should arrive into the station at the same time as ours (both trains in the station together), instead of passing us on the open line. Meet at **Union Station**. | Yes | Done here |

## Notes

- **#1:** The fixed wheelchair rider is placed per station in `assets/cab-ride.js` (`stand(wheelchairUser(...), "wheelchair", ...)`, ~line 1853). Its side is `sw * (PLAT_IN + 1.7)`, and `sw` alternates by station, so at every other station the rider is on the far platform. Only riders with `side > 0` get added to `boarders[si]`. Fix: keep the wheelchair rider on the train's platform (or add a second one there), and check that the boarding animation moves a seated rider.
- **#2:** The oncoming train is set up in `assets/cab-ride.js` ~line 2399: it passes at `MEET_D = stops[0] + 500` (between stations) at a constant `ON_SPEED = 40`, and is only drawn within 9 s of `MEET_T` (~line 2507). Fix: move the meeting point to Union Station (stop 3), make it slow to a stop at the far platform as we pull in, and keep it visible while both trains dwell. Its riders would board from the other platform.

## Done here (2026-11-24)

- **#1:** where the fixed wheelchair rider waits on the far platform (`sw < 0`), a second waits on the train's platform and boards.
- **#2:** `meetTrain` (a new lit train; `oncoming` stays as the dark shot's stand-in) brakes into Union Station's far platform
  0.8 s after ours stops, its tail at the platform's north end (`MEET_D`) so the cab sees it, and stays until ours has gone.
  The far platform's riders board it at the dissolve (`farBoarders`).

## Notes on preview v1 (2026-11-24), for v2

| # | Note | Status |
|---|------|--------|
| 1 | South Shore trains are stainless with orange accents (not red). | Done |
| 2 | People in wheelchairs can't go down stairs: keep wheeled riders off the island stairs (27th and the other islands). | Done |
| 3 | Two sharp bends in the track ~1:18 (McCormick Place to 18th). | Done |
| 4 | A sharp bend ~1:20 where a track seems to vanish for a short stretch (approaching 18th). | Done |
| 5 | 18th's stair up to the footbridge has a weird wall in it. | Done |
| 6 | After Chicago/Halsted, 8x between stations, as south of 18th. | Done |
| 7 | The Brown Line's elevated tracks overhead just before Addison/Lincoln, on their OSM alignment. | Done |
| 8 | Peterson/Ridge: stairs down to an underpass (draw the openings, not the underpass), no footbridge. | Done |
| 9 | Fade out entirely before the end of the track can be seen. | Done |
| 10 | The minimap's line keeps going up past the map's edge at the end. | Done |
| 11 | Straighten the soft bends (from the OSM data) on the straights between the north side stations. | Done |
| 12 | The UP North's bridge over the river at Webster Ave (drawn by a Haiku 5.5 subtask); cut to an overhead shot there, back to the cab once the whole train is over it. | Done |

## Notes on preview v2 (2026-11-24), for v3

| # | Note | Status |
|---|------|--------|
| 1 | The track is wiggly north of Clybourn (around Diversey Pkwy / Clybourn Ave). | Done |
| 2 | A Brown Line train passing above on the Brown Line structure, heading inbound (toward the Loop). | Done |
| 3 | Addison/Lincoln: announce "Transfer to Brown Line trains"; stairs down to an invisible underpass instead of stairs up to a footbridge. | Done |
| 4 | Many buildings have really small windows: half of those should have larger windows. | Done |
| 5 | Ravenswood: stairs down to an invisible underpass. | Done |
| 6 | Division/Elston and every station north of it are on embankments: the line should sit a little above the ground and be seen crossing over the streets. (The stations south of 27th are on a wider embankment where the streets below are harder to see: later.) | Done (heights from Cook County's 2022 LiDAR; see NOTES.md) |
| 7 | Station name signs cut by a pole (59th's island canopy): names must not be interrupted. | Done |

## Notes on preview v3, for v4

| # | Note | Status |
|---|---|---|
| 1 | Pedestrian bridges over the Metra Electric at 43rd St, 41st St (the curving ramps with blue cable stays) and 35th St (a straight deck, up from Lake Park Ave). | Done (OSM ways 1120034136, 822859695, 32971805; heights and mast shapes assumed) |
| 2 | The line passes under the Oakwood Blvd and 31st St road bridges: draw them. | Done (OSM ways 57254762, 57254853; walled ramps assumed) |
| 3 | Trees along both sides of the tracks from 47th (Kenwood) to 27th (after Apple Maps aerials). | Done |
| 4 | Lakeside Center (McCormick Place East) at its real height, measured with the Cook County LiDAR. | Done (25.9 m roof; OSM had 100 m) |
| 5 | McCormick Place station is underneath a building: draw it (find photos of the station). | Done (under the North and South buildings, per OSM's platform; North Building 28.7 m from LiDAR) |
| 6 | Minimap: major POIs (Soldier Field, Field Museum, ...). Deferred until the POI list is complete. | Deferred |
| 7 | Division/Elston: stairs down from the platforms to the street (like Addison/Lincoln and Ravenswood), not the footbridge. | Done |
| 8 | Continue the Brown Line tracks north and draw its Addison station. | Done (tracks to 750 m from the crossing; Addison's platforms from OSM) |
| 9 | Does the top speed between stations match the FLIRT's acceleration? Yes: each run is a physics run (assumed FLIRT figures: 1.2 m/s² start, 2.6 MW, 1.0 m/s² braking), capped at 79 mph and the curve limits. Short runs peak lower (59th to 55th-56th-57th: 54 mph, 0.37 mi). | Answered |

## Notes on preview v4, for v5

| # | Note | Status |
|---|---|---|
| 1 | Minimap: once the new tunnel line is shown, the Union Station and Ogilvie icons change to a "transfer possible" icon. | Done (teal ring with two arrows, as the tunnel finishes drawing) |
| 2 | Approaching Oakwood Blvd: objects hang down from the road bridge onto the tracks. | Done (a bug: every OVERS bridge's span had shrunk to a point, so its walls came down between the tracks; the footbridges' masts were off too) |
| 3 | Refine the trees: more definition. | Done (crowns of 4-5 lumpy lobes, shaded underneath; three shapes) |
| 4 | At every station, nobody waits at the near (approach) end of the platform. | Done (everyone waiting stands behind where the cab stops) |
| 5 | 18th St: the footbridge passes over one of the outer tracks (impossible). East of it, remove the tiny buildings. | Done (its north ramp moved east, clear of the tracks; small OSM buildings removed east of the line, 18th St to Soldier Field) |
| 6 | The smokestack (near Lawrence, UP North) has windows: it's not a building. | Done (any footprint under 8 m and over 15 m tall is drawn as a plain brick chimney) |
| 7 | Rephrase the awkward left-hand-running caption. | Done ("Trains on the UP North keep to the left-hand track, a holdover from the Chicago & North Western, which built the line.") |
| 8 | Straighten the random bend at 4:36 (north of Foster). | Done (OSM's 3.5 m jog between Ravenswood and Peterson/Ridge straightened in tools/build-tracks.mjs) |
| 9 | Rogers Park still has a footbridge: give it stairs down instead. | Done |
| 10 | "No transfer." → "No transfer needed!" | Done |
| 11 | Drop "/planner" from the closing URL label. | Done |

## Notes on preview v7 (2026-11-26), for v8

| # | Note | Status |
|---|---|---|
| 1 | Remove the "Low Line" label from the minimap (drawn at the north portal's junction, `label("Low Line", ...)` in `assets/cab-ride.js`). | Moot: the next version has no minimap (item 7). |
| 2 | Left-hand running on the Metra Electric, to match the UP North and UP Northwest. | Decided (2026-11-27): yes, and in the tunnel too (Steven: "Scott didn't say what to do in the tunnel so I presume we must run on the left in the tunnel, too"). Done (2026-11-27): the X1 keeps left the whole way. On the Metra Electric it uses the inner west track (the western pair's island at 59th, 55th-56th-57th and 51st/53rd; the middle island, on its right, from 47th to 18th); the crossover past Chicago/Halsted is gone; door sides flipped at the Metra Electric and tunnel stops, and the 12 "next stop" announcements from 55th-56th-57th to Chicago/Halsted were re-voiced (same voice, checked bit for bit against unchanged clips). |
| 3 | McCormick Place: add platforms so it's a transfer station. | To do (question: can we?) |
| 4 | The tunnel would carry four lines, not six: fix the "SIX ROUTES" card ("Six CrossTowner routes, X1 to X6, would share this new tunnel") and anything else that says six. | Done (2026-11-26): X1 to X4 run in the tunnel, X5 and X6 through Union Station (Steven); the card now says so. Union Station's announcement already named X5 and X6. Nothing else said six. |
| 5 | Platform heights: high platforms on the Metra Electric and in the tunnel, low ones on the UP North and UP Northwest (today every platform is `PLAT_UP` = 1.10 m). Real, from Metra's Design Manual rev. 3 (September 2025), section 8.2, table 8-6: high-level (Metra Electric) 4 ft 3.5 in (1.31 m) above top of rail, edge 5 ft 7 in (1.70 m) from the track's centre on straight track; low-level (diesel lines) 8 in (0.20 m; the host railroad may ask for about 9 in), edge 5 ft 6 in (1.68 m), 5 ft 1 in on the inside of curves; side platforms at least 10 ft clear. UP/BNSF's platform guideline also caps platforms beside freight tracks at 8 in. Then the trains need doors for both heights, as the KISS had before its low doors were removed, and the CrossTowner FLIRT's sill must be checked. | To do |
| 6 | Shorter stops: 30 s (real time) at the stations north of Clybourn (Steven, 2026-11-27; this replaces "Metra Electric dwells to 30 s, except McCormick Place") (today every stop is `DWELL_REAL` = 60 s on the clock, in `cab-ride.js`; it needs a per-stop value, and the clock, the "60-second stop" tag and the ride-time cards, such as 18th to Clybourn, will change with it). | Done (2026-11-27): `realDwellOf` gives the four stops north of Clybourn 30 s on the clock; where a stop is shorter than its time on screen (Rogers Park, shown in full at 8x) the clock slows rather than skipping, and the yellow pill shows each stop's own time ("30-second stop"), only where the dissolve skips. |
| 7 | The next version has no story cards and no minimap (Steven, 2026-11-27): the page shows the cards beside the video and a map that follows the train. | Ready (2026-11-27): render with `tools/direct-render.mjs --no-cards --no-minimap` (the announcements' captions stay; `--no-captions` drops them too). The opening map and its two cards stay, the map fades instead of shrinking, and a new "A PROPOSAL" card says the line isn't built (Steven agreed with a side agent's note that a film with no cards wouldn't say so). |

## Later

- Done: a second train, the CrossTowner double-decker (`assets/kiss-train/`, from `assets/Caltrain-KISS-project.zip`),
  four cars, redesigned; it is the train seen on the UP North, the Metra Electric and in the tunnel (see NOTES).
- Done: Bally's Chicago replaced with the model in `assets/Ballys-Chicago-Project.zip` (`assets/ballys-resort/`).

## Modeling wishlist

- Halsted Pointe: modeled 2026-11-26 (`assets/halsted-pointe.js`), in the film; refined the same day from the City's Plan
  Commission deck (November 19, 2026); awaiting Steven's review.
- Foundry Park: modeled 2026-11-26 (`assets/foundry-park.js`), in the film; refined the same day from the City's full Plan
  Commission deck (January 15, 2026); awaiting Steven's review.
- Soldier Field: modeled 2026-11-26 (`assets/soldier-field.js`), replacing the `SF` block in `cab-ride.js`; awaiting Steven's review.
- Improve the high-rises south of Grant Park by the south portal (One Museum Park, The Grant, NEMA and their
  neighbours; now OSM extrusions).
  - Modeled 2026-11-26, awaiting Steven's review of `previews/museum-park/`: `assets/museum-park.js`, integrated in
    `cab-ride.js`, in `tools/export-models.html`. See NOTES.md, "Shareable modules".
  - Towers: NEMA (way 509032412; parts 1333503937-46, podium 1581043622-24), One Museum Park (parts
    1267940234-44, podium 151479984), The Grant (151371817; parts 1554322545-47), Museum Tower (151477490),
    Museum Pointe (151479987), Museum Park Towers 1 and 2 (151479985, 151479986) and Sky55 (151544480). The
    Michigan Ave towers stay as OSM extrusions.
  - Heights: the 2022 LiDAR measures the podiums and mid-rises (NEMA's podium 50 and 55.5 m; Museum Park Tower 2
    69 m; Museum Pointe 81 m) and the Willis Tower (438 m), but reads near the ground on the roofs of NEMA, One
    Museum Park, The Grant, Museum Tower and Sky55 (no returns there). Use OSM `height` and published heights for
    those five. (An earlier note here said the LiDAR was useless; that was a units mistake on my part.)
- Willis (Sears) Tower: modeled 2026-11-26 (`assets/willis-tower.js`), in the film; awaiting Steven's review. The
  mechanical bands are black, not white as this item first said (every photo shows black louvers).
- Target, Division St and Larrabee St: modeled 2026-11-27 (`assets/target-division.js`, references in
  `refs/target-division/`); in the film since 2026-11-27 (replaces city-wide.js building 33096, OSM way 243831261);
  awaiting Steven's review.
- Solstice on the Park, 1616 E 56th St: modeled 2026-11-27 (`assets/solstice-on-the-park.js`, references in
  `refs/solstice-on-the-park/`); in the film since 2026-11-27; awaiting Steven's review.
- 875 N Michigan Ave (the old John Hancock Center): modeled and in the film 2026-11-27 (`assets/875-north-michigan.js`,
  references in `refs/875-north-michigan/`), a 20-minute model; awaiting Steven's review. Replaces OSM's dark box and
  its two orange masts. Not settled: the X-brace levels (from photo proportions) and the west antenna's height (424 m,
  from Wikipedia's "reduced to 285 ft" and a scaled photo).
- 410 N Elizabeth (PD 1528's first tower): modeled and in the film 2026-11-27 (`assets/elizabeth-410.js`), shown at
  level 7 with a crane, as Steven asked; awaiting his review. The crane's jib is at 60 m in the film (assumed).
- 1840 N Marcey (Sterling Bay, PD 1605, approved 2025): modeled and in the film 2026-11-27 (`assets/marcey-1840.js`);
  awaiting Steven's review. It's beyond Foundry Park from the line, so it shows from the air more than from the train.
- Halsted Landing (Onni, 700 W Chicago Ave, PD 1399): its 44-story tower at Chicago and Halsted is approved (Plan
  Commission, June 2024); not modeled.
