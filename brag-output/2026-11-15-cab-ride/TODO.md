# Cab ride: changes for the next video

Running list of changes for the next render (after v19). "Alders' cut" says whether the change
also has to be ported by hand to `../2026-11-19-cab-ride-alders/assets/cab-ride.js`.

| # | Change | Alders' cut | Status |
|---|--------|-------------|--------|
| 1 | Wheelchair users waiting on a station platform should board the train, not be left behind on the platform. | Yes | To do |
| 2 | The oncoming train we pass should arrive into the station at the same time as ours (both trains in the station together), instead of passing us on the open line. Meet at **Union Station**. | Yes | To do |

## Notes

- **#1:** The fixed wheelchair rider is placed per station in `assets/cab-ride.js` (`stand(wheelchairUser(...), "wheelchair", ...)`, ~line 1853). Its side is `sw * (PLAT_IN + 1.7)`, and `sw` alternates by station, so at every other station the rider is on the far platform. Only riders with `side > 0` get added to `boarders[si]`. Fix: keep the wheelchair rider on the train's platform (or add a second one there), and check that the boarding animation moves a seated rider.
- **#2:** The oncoming train is set up in `assets/cab-ride.js` ~line 2399: it passes at `MEET_D = stops[0] + 500` (between stations) at a constant `ON_SPEED = 40`, and is only drawn within 9 s of `MEET_T` (~line 2507). Fix: move the meeting point to Union Station (stop 3), make it slow to a stop at the far platform as we pull in, and keep it visible while both trains dwell. Its riders would board from the other platform.
