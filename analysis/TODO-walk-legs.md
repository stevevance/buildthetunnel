# Follow-up: keep R5's walk legs in the matrix

## Why

`precompute_legs_8am.R` writes a cell as `{ m, r, x, legs: [...] }`, but it only
keeps the *transit* segments:

```r
if (!(seg$mode[k] %in% TRANSIT)) next
```

`m` is the whole trip between the two station points, so it already contains
R5's access walk, egress walk, and any transfer walks. Dropping the WALK
segments means the planner can see *that* time but not *where* it was spent.
That produced a real bug: for a trip looked up under Morse, R5 walked the rider
13 minutes over to Rogers Park and boarded there, and the planner rendered
"Walk 1 min to Rogers Park" — the 1 minute being the walk to Morse. Across the
whole matrix, **24% of station pairs** have legs that start or end somewhere
other than the station the cell is keyed under (15.3% at the board end, 9.7% at
the alight end).

`planner/app.js` now surfaces those walks, but it has to *estimate* them
(straight line × 1.3 ÷ 2.75 mph) because the real number isn't in the data. For
Cermak-Chinatown → McCormick Place that reads 22 min where R5's street network
had about 15, so the steps can overshoot the total.

## The change

In the leg loop, emit walk segments instead of skipping them:

```r
for (k in seq_len(nrow(seg))) {
  if (seg$mode[k] == "WALK") {
    legs[[length(legs)+1]] <- list(
      mode = "WALK",
      ride = as.integer(round(seg$segment_duration[k])))
    next
  }
  if (!(seg$mode[k] %in% TRANSIT)) next
  ...
}
```

Station names for a walk leg come free from the neighbouring transit legs (the
walk before leg 1 ends where leg 1 boards; the walk after the last leg starts
where it alights), so only the duration needs storing. Keep `x` counted from
transit legs only — `max(sum(mode %in% TRANSIT) - 1L, 0L)` — or the transfer
count inflates.

Then in `app.js`, prefer a walk leg's stored minutes over `gapWalk()` /
`epWalkMin()` when one is present, and the steps reconcile with the total.

## Cost and caveat

Rerunning `precompute_legs_8am.R` is the slow path (detailed_itineraries over
all pairs, hours per network). Note that `merge_median_into_legs.R` afterwards
overwrites `m` with the 30-minute-window median while the legs stay from the
single 8:00 departure — which is why the walk time can't simply be recovered
today as `m - sum(ride + wait)`: that residual is negative for 11.6% of cells.
