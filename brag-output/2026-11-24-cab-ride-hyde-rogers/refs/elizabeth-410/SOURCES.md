# 410 N Elizabeth: reference images and sources

`assets/elizabeth-410.js` draws the first (east) tower of Residential-Business Planned Development 1528, 400/410 N Elizabeth St, on the corner of Kinzie St and Elizabeth St, under construction: levels 1-4 finished outside in the PD's design, levels 5-7 bare concrete, the core with its climbing forms, the tower crane, a material hoist, and the fenced yard. The plan, heights and facade come from the PD's exhibits (Archeo Design Studio, November 17, 2023) and the Plan Commission slides; the crane, site and construction state come from Chicago YIMBY's photographs; the site from OpenStreetMap.

Files in this folder are committed to the public repository. Files in `private/` stay on Steven's machine only (`private/` is gitignored), because they are news photos, the developer's and architect's drawings and renderings, Plan Commission slides, or City documents whose image license is unclear. No openly licensed images were found or used for this model, so this folder holds only this file.

## Data (not images)

| Source | Author or publisher | License | Date | What the model took from it |
|---|---|---|---|---|
| OpenStreetMap way 1308334948 (landuse=construction, "400 N Elizabeth"), streets (Elizabeth St way 24082322, Kinzie St way 402891596), rail lines; queried through the Chicago Cityscape CLI (`cli/overpass.php`) | OpenStreetMap contributors | ODbL | 2026-11-27 | The site ring (`elizabeth410Site`, the fence, the dirt), its north-east corner as the PD's north-east corner, the grid's 1.0 degree turn |
| Urbanize Chicago, tag "400 N. Elizabeth": https://chicago.urbanize.city/tags/400-n-elizabeth (posts of May 23, 2024; December 17, 2024; June 25, 2026) | Lukas Kugler, Urbanize Chicago | Article text, copyright | 2024-2026 | Developers, architect, contractor; 33 stories, 349 ft, 383 apartments, 150 parking spaces; foundation and superstructure permit "through level 7"; phasing (east tower first) |
| Chicago YIMBY, category "410 North Elizabeth": https://chicagoyimby.com/category/410-north-elizabeth | Daniel Schell, Chicago YIMBY | Article text, copyright | June-November 2026 | Construction progress, crane permit dates (February 19, 2026; Phase 2 tie-in approved October 23, 2026), hoist permit (September 2, 2026), Clark Construction and Adjustable Forms |
| Chicago Sun-Times, July 28, 2026; WhatNow Chicago, July 29, 2026 | | Copyright | 2026-07 | Groundbreaking July 28, 2026; Tree Street Group, Magellan, geothermal |
| CTBUH Skyscraper Center, complex 5923 | CTBUH | Copyright | 2026 | East tower 114 m / 374 ft, 33 floors (not used for the model's height; the PD's 348'-5" main roof was) |

## Private (not committed)

### The PD ordinance

| File | Source | Author or publisher | License | Date | What it shows | What the model took from it |
|---|---|---|---|---|---|---|
| `private/pd-1528.pdf` | https://gisapps.chicago.gov/gisimages/zoning_pds/PD1528.pdf | City of Chicago (DPD; City Council Journal); exhibits by Archeo Design Studio | Public record; drawings' license unclear | 2021-2026 (file modified June 9, 2026) | The full PD 1528 file: the May 20, 2026 and March 13, 2025 minor changes, the May 22, 2024 amendment (statements, bulk table: max height 380 ft in Subarea A, 383 units, 150 parking spaces; exhibits pages 12179-12197) and the 2021 adoption | The subarea map's dimensions (166.00', 206.20', 98.55', 70.25'); the site plan, roof plan; the four elevations of the east building (ground floor 15'-7", top of parking podium 71'-1", amenities deck 333'-3", main roof 348'-5"; facade zones and bays); the base, facade and crown details (champagne mesh and fins, charcoal frame, fritted glass) |

### Plan Commission slides (as Urbanize Chicago published them)

All from https://chicago.urbanize.city/sites/default/files/2024-05/400%20N.%20Elizabeth%20-%20N%20CPC%20-%20Archeo%20Design%20Studio.jpg (N = the slide number; slide 8's file name has two spaces before "CPC"). Author: Archeo Design Studio, for the May 16, 2024 Chicago Plan Commission hearing. License: copyright, unclear. Downloaded 2026-11-27.

| File | What it shows | What the model took from it |
|---|---|---|
| `private/urbanize-cpc-1.jpg` | Transit context map | Not used |
| `private/urbanize-cpc-2.jpg` | Massing of nearby towers | Not used |
| `private/urbanize-cpc-3.jpg` | Aerial rendering looking east to the Loop | Context only |
| `private/urbanize-cpc-4.jpg` | Pedestrian rendering of the east tower's base at Kinzie and Elizabeth | The podium's look: champagne fins with the tree-branch perforations, charcoal frame, ground-floor glass, fritted glass at the east face's north end, the lobby canopy |
| `private/urbanize-cpc-5.jpg`, `-6.jpg` | Renderings of the pedestrian path and the Elizabeth St viaduct | Not used |
| `private/urbanize-cpc-7.jpg` | Both towers from the south | The east tower's podium screen and frame; the tower's grid (not drawn) |
| `private/urbanize-cpc-8.jpg` | Site and ground floor plan | Entrances, the north service drive |
| `private/urbanize-cpc-9.jpg` | Typical parking plan | The plate (113 x 126 ft, south corners notched), the column grid, the core |
| `private/urbanize-cpc-10.jpg` | Level 8 typical floor plan | The tower's plate (level 7's slab), the corner balconies |
| `private/urbanize-cpc-11.jpg`, `-12.jpg`, `-13.jpg` | Level 27, 32, 33 plans | Not used (above the drawn levels) |
| `private/urbanize-cpc-14.jpg`, `-15.jpg` | North and south elevations of both buildings | Checking the PD elevations |
| `private/urbanize-cpc-16.jpg` | Both towers from the north over the UP tracks | The north face's fritted glass and fins |
| `private/urbanize-cpc-17.jpg`, `-18.jpg` | The open space and the cafe terrace | Not used |

### Construction photographs (Chicago YIMBY)

Author: Daniel Schell, Chicago YIMBY (the lead images carry no separate credit). License: copyright. Downloaded 2026-11-27.

| Files | Source | Date | What they show | What the model took from them |
|---|---|---|---|---|
| `private/yimby-2026-07-crane-01.jpg` to `-08.jpg` | https://chicagoyimby.com/2026/07/410-north-elizabeth-plants-a-tower-crane-in-the-fulton-market-district.html (files `.../uploads/2026/07/410-North-Elizabeth-crane-NN.jpg`) | 2026-07-30 | The cleared site from a UP-W train and from Ogden Ave; the crane's red base frame by the east fence; caisson work | The crane's foot south of the foundation, near Elizabeth St; the yard; the Jersey-barrier fence |
| `private/yimby-2026-10-crane-01.jpg`, `-03.jpg` to `-14.jpg` | https://chicagoyimby.com/2026/10/the-tower-crane-is-up-at-410-north-elizabeth.html (files `.../uploads/2026/10/410-North-Elizabeth-tower-crane-NN.jpg`) | 2026-10-21 | The crane's erection: red hammerhead with a tower head, cab, Clark banner on the counter-jib | The crane's type, colour, cab, tower head and tie bars, the banner |
| `private/yimby-2026-11-01.jpg` to `-10.jpg`, `-12.jpg` to `-15.jpg` | https://chicagoyimby.com/2026/11/410-north-elizabeth-goes-vertical.html (files `.../uploads/2026/11/410-Noth-Elizabeth-November-2026-NN.jpg`) | 2026-11-10 | The east facade from Elizabeth St, the south side from the yard, the west side from Ogden Ave; the core's blue climbing forms; slab edge forms and guardrails; reshoring; the mast against the south slab edge; the site banner | The crane's place (south face, toward Elizabeth St, about 1 m off the slab edge); the climbing forms; the guardrails and reshores; the fence with banners; the containers |
| `private/yimby-400-n-elizabeth-ext-5.jpg` | https://chicagoyimby.com/wp-content/uploads/2026/02/400-n-Elizabeth-ext-5.jpg (rendering by Archeo Design Studio, as published by Chicago YIMBY) | 2026-02 | Both towers from the south-west over the tracks | Context only |

## Not fetched

The City's Plan Commission deck for the May 16, 2024 hearing (chicago.gov `cpc_materials`) was not looked for, because chicago.gov refuses automated downloads. The PD's exhibits and Urbanize's copies of the slides covered what the model needed.
