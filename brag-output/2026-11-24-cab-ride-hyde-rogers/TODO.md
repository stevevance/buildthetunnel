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
