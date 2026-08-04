# Observed O'Hare Blue Line ↔ terminal times

Real-world stopwatch measurements of the walk/ATS connection between the CTA
Blue Line "O'Hare" station and the terminals, contributed by **Josh
(@blainplanes.bsky.social)** in reply to the CrossTowner trip-planner post
(bsky.app/profile/stevevance.net/post/3mr56annol225). Useful for sanity-checking
the planner's hand-estimated per-terminal egress minutes in
`../planner/app.js` (the `OHARE.terminals[*].egress` values) and
`../planner/methodology.html`.

## Measurements

| Connection | Observed | Detail | Source |
|------------|----------|--------|--------|
| **Blue Line → Terminal 1** | **4:40** (~4 min 40 s) | Exiting the train at the first car, walking into T1 via the moving walkways. | Jul 24, 2026 — bsky.app/profile/blainplanes.bsky.social/post/3mre7vukapc2d |
| **Terminal 5 → Blue Line** | **12:44** (~12 min 45 s) | Two laps, T5 → Blue Line fare gates (see below). | Jul 25, 2026 — bsky.app/profile/blainplanes.bsky.social/post/3mril2k3k2s2i |

The T5 → Blue Line trip was split into two stopwatch laps (total 12:44.51):

- **Lap 01 — 8:20** — Terminal 5 (just exiting the customs hall at the automatic
  doors) → top of the escalator at the T3 ATS station / parking-garage entrance.
- **Lap 02 — 4:24** — top of the ATS escalator → just past the Blue Line fare
  gates, via the parking elevator and the underground walkway by the badging office.

## Comparison to the planner's current assumptions

The planner models egress from the Blue Line "O'Hare" (terminal-core) station as:

| Terminal | Planner assumes | Observed | Note |
|----------|-----------------|----------|------|
| Terminal 1 | 9 min (walk) | **4:40** | Planner ~2× high, though Josh optimized (first car + moving walkways). |
| Terminal 5 | 12 min (walk + ATS) | **12:44** (reverse direction) | Essentially a match — validates this one. |

Caveats: measurements are a single trip each, one direction; T5→Blue is the
reverse of the planner's Blue→T5 leg; and the T5 timing starts at the
international-customs exit, not a domestic gate. Two other repliers judged the
planner's ATS assumptions reasonable (within ~1–2 min): Steven Lucy
(@slucy.bsky.social) and Josh, who called them "on the more cautious side."
