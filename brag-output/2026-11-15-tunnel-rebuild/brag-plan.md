# Brag plan: Build the Tunnel (rebuilt story, 2026-11-15)

Replaces the 2026-11-14 plan (`brag-output/2026-11-14-174432/`). That video was the web viewer's flythrough baked frame by frame. Steven's feedback (2026-11-15): don't copy the frame of the webpage into the video, and make it far more exciting, because the tunnel is transformational. Not built yet: this is the story for approval.

## What changed

| | 2026-11-14 video | This story |
|---|---|---|
| Subject | The 3D viewer | What the tunnel does to the region |
| Picture | The web page's map, baked | Graphics drawn for the video from the repo's own geometry; no frame of any web page |
| Scale | Four downtown blocks | Seven counties, then downtown, then back out |
| Payoff | 102,935 jobs near four stations | Trips that take half the time, on one train |
| Energy | One calm continuous shot | Hard cuts on the beat, lines that race, numbers that drop |

## The angle

Metra's lines end at four separate downtown stations with no track between them, so changing from one line to another means leaving the station and crossing downtown on foot or by bus. A 3-mile tunnel joins them, and trains that used to stop run through to the other side of the region. The video shows the before (four stations and the walk between them), the fix (the tunnel burning across the gap), and the after (crosstown trains and trips cut in half).

## Story card

- **Hook (0-3 s, 12 words; rewritten 2026-11-15):** "Metra's four downtown stations don't connect. 3 miles of tunnel fixes that."
  The problem is the transfer, not that the lines end: routes that terminate at different stations can't hand riders to each other (Steven, 2026-11-15).
- **The one number:** 69 minutes and two transfers become 44 minutes on one train (Northwestern to the University of Chicago)
- **The place:** downtown with the four Metra stations lit and apart, a rider walking between them, then the tunnel across the gap, then the region with trains running through
- **The click:** the CrossTowner Trip Planner: plan your own trip, today against the tunnel
- **Last line:** "Build the tunnel."
- **Caption first line:** "Metra's lines end at four downtown stations that don't connect, so changing trains means crossing downtown on foot. A 3-mile tunnel under Clinton and Roosevelt would join them, so trains run through to the other side of the region. Plan your own trip, today against the tunnel: stevevance.github.io/buildthetunnel/planner/"

## Beats (about 22 s)

Dark background, the lines as light. Cuts land on the beat.

| Time | Beat | On screen |
|---|---|---|
| 0-3 s | **The broken transfer.** The region in black. Every Metra line draws in from the suburbs and stops at one of four downtown stations, each flaring red and named: Union Station, Ogilvie, LaSalle Street, Millennium. Push in: a dotted walking path crawls from one station to another while a clock runs | "Metra's four downtown stations don't connect." then, on the walking path, "21 of 69 minutes: getting between trains" |
| 3-6.5 s | **The tunnel.** Snap zoom into the gap between the terminals. A purple line burns from the Metra Electric to the Union Pacific tracks; four stations hit one by one on the beat | "3 miles of tunnel fixes that." then "4 new stations" |
| 6.5-10.5 s | **Through-running.** Snap back out. The four tunnel routes, X1 to X4, shoot through downtown and out the far side, one per beat, each with its two ends named | "Highland Park to South Chicago", "Palatine to South Chicago", "Des Plaines to Harvey", "Winnetka to Blue Island" |
| 10.5-15 s | **The race.** Two tunnel trips, each as two bars racing: today in gray, with the tunnel in purple. The gray bar stalls at each transfer; the purple bar doesn't stop | "Northwestern to UChicago: 69 min, 2 transfers" against "44 min, one train". Then "Arlington Heights to Hyde Park: 75 min, 2 transfers" against "60 min, one train" |
| 15-18 s | **The frequency.** Back in the tunnel: trains pulse through in both directions, one after another, as a counter climbs to 8 | "8 trains an hour, each way" |
| 18-22 s | **End card.** Every line glowing, through-running | "Build the tunnel." then the planner URL |

Optional, if it earns its 3 seconds: a speed-ramped street-level rush along the tunnel between beats 2 and 3, rendered in a dark style made for the video (not the site's map), with the four station names flashing past.

## Facts and where they come from

| Fact | Value | Source in the repo |
|---|---|---|
| Tunnel length | 3 miles on screen (Steven, 2026-11-15), rounded from 3.1 to 3.2 | Star:Line Chicago's Bluesky diagram (indexed 2026-11-14) says "CRCL Tunnel: ~3.2 miles"; its website says "a 3.1-mile tunnel" (buildthetunnelchicago.org, checked 2026-11-15). The drawn alignment in `lines.js` also measures 3.2 miles. Star:Line's "4.6 miles" is the total of all new segments (tunnel, SCAL Ramp, Sox Park Connector), not the tunnel |
| Stations | 4: Roosevelt, Taylor/Clinton, Union Station (West), Randolph/Clinton | `lines.js` |
| Routes | X1 Highland Park to 93rd/South Chicago; X2 Palatine to 93rd/South Chicago; X3 Des Plaines to Harvey; X4 Winnetka to 115th and Blue Island; X5 Downers Grove to O'Hare Transfer; X6 Elmhurst to Auburn Park and Blue Island | `analysis/crosstowner_xroutes_gtfs/routes.txt` |
| Frequency | Each route every 30 minutes; 8 trains an hour each way through the tunnel | `routes.txt`, and counted in `stop_times.txt`: 8 departures in each direction at Taylor/Clinton between 8 and 9 am (2 each on X1, X2, X3 and X4) |
| Northwestern to UChicago | 69 min, 2 transfers today; 44 min, no transfers on the X4 | `maps/map-northwestern-to-uchicago.html` |
| Arlington Heights to Hyde Park | 75 min, 2 transfers today; 60 min, no transfers on the X2 | `maps/map-arlington-heights-to-hyde-park.html` |

Geometry for the drawings, all in the repo: Metra lines (`METRA_LINES` in `lines.js`, `planner/data/lines.json`), the X routes (`analysis/crosstowner_xroutes_gtfs/shapes.txt`), the tunnel (`lines.js`), county outlines (`planner/data/metra_counties.geojson`).

## Care

- **Every proof is a tunnel trip (Steven, 2026-11-15).** Only X1 to X4 use the tunnel; X5 and X6 run via Union Station Riverside, so they are not drawn or named. That rules out the Berkeley to Blue Island trip (X6) and the O'Hare workforce figure (X5), which were in the first draft. Both race trips ride the tunnel: Northwestern to UChicago on the X4, Arlington Heights to Hyde Park on the X2.
- **"Four downtown stations" are Union Station, Ogilvie, LaSalle Street and Millennium.** "Don't connect" means no track and no in-station transfer between them; Union Station and Ogilvie are two blocks apart, but it is still a walk outside.
- **The tunnel doesn't join all four.** It links the Metra Electric (Millennium's line) to the Union Pacific lines (Ogilvie's), with a stop at Union Station. LaSalle Street's Rock Island line stays unconnected; the site's Tinley Park page says so. If "fixes that" reads as too broad, use "3 miles of tunnel connects them" only with that caveat in the caption, or say "3 miles of tunnel changes that."
- "21 of 69 minutes" is the Northwestern to UChicago trip today: the time spent getting from Ogilvie to Millennium Station (`maps/map-northwestern-to-uchicago.html`). The same trip is the race in beat 4, so the walk in beat 1 sets it up.
- CrossTowner is Star:Line Chicago's proposal. Credit it in the caption.
- The site's own maps include honest nulls (Tinley Park to Lake Bluff saves no time, because the Rock Island line isn't connected). The video picks winners; the caption should send people to the planner to test their own trip.

## Tone, format, audio

- Tone: cinematic. Black, white type, the tunnel's purple (#8d5a99) pushed brighter for glow, red for the four stations.
- Formats: vertical 1080x1920 and landscape 1920x1080, each composed for its frame.
- Music: a driving track from the bundled set, cuts on the beat. Sound on the visible hits only: the four stations lighting, the four tunnel stations, each route, the two race finishes, each train in the frequency beat.

## Open questions for Steven

1. Keep the optional street-level rush, or leave the map view out entirely?

## As built (2026-11-15)

Built by `build.py` and rendered on Chicago Cityscape's brag-render-2cpu droplet: `vertical/brag-vertical.mp4` (1080x1920) and `landscape/brag.mp4` (1920x1080), 27.45 s each, poster at 2.9 s. Sources are in `README.md`.

| Time | Beat |
|---|---|
| 0-3.15 s | The region; Metra lines draw in; push in to downtown; the four stations light up and are named |
| 3.15-5.4 s | Dots cross the Loop from Ogilvie to Millennium; "21 of 69 minutes: getting between trains" |
| 5.4-11.7 s | The tunnel burns across; its four stations pop; "4 new stations", "connecting 10 Metra lines", "Change trains at a new station"; the four stations are named and pulse |
| 11.7-22.5 s | Two races, 5.4 s each, each ending on "25 minutes faster!" or "15 minutes faster!" |
| 22.5-27.45 s | The four tunnel routes draw in; "Build the tunnel.", tunnel.stevevance.net, the Star:Line credit and the music credit |

- It runs about 27 s, not 22: each line holds long enough to read.
- The optional street-level rush is left out (the open question above was not answered).
- No sound effects. The plan asked for sound on the hits, but Steven has called effect sounds on earlier videos "weird thwops", so the cuts land on the music's beats instead (133 beats a minute, downbeats every 1.8 s).
- "Fixes that" is kept as written. The tunnel doesn't reach LaSalle Street (see Care).
- Type starts 270 px from the top in the vertical version and credits sit above 1,480 px, clear of Instagram's buttons and caption.
- Not asked yet: Star:Line Chicago for a Collab.
- Revised 2026-11-15 (Steven): the "8 trains an hour, each way" scene is gone, each race stays up 1.8 s longer, and each ends with how many minutes faster the tunnel trip is.
- Revised again 2026-11-15 (Steven): the card naming routes X1 to X4 is gone (the routes still draw in on the end card, unnamed); the address on screen and in the captions is tunnel.stevevance.net, which replaces the "use stevevance.github.io/buildthetunnel/" rule in Care; and "connecting 10 Metra lines" follows "4 new stations" (10 is Steven's number: every line but the Rock Island, see README). The four new stations are named and pulse, with "Change trains at a new station", so it is clear a transfer may be needed.
