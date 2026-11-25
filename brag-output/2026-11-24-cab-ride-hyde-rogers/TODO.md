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
