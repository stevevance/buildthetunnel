# Target at Division and Larrabee: reference images

The images behind `assets/target-division.js`: Target store T-2613, "Chicago Division", 1200 N Larrabee St (600 W Division St).
The module's own coordinates are meters from `TARGET_DIVISION_CENTRE` (-87.64424, 41.90427), x east and z south.

No openly licensed photo of this store turned up. Wikimedia Commons had none (a geosearch within 400 m of the store, and the
"Target stores in Illinois" category), and neither did KartaView. So every photograph is in `private/` (gitignored), and only my
own plots are in this folder.

## Own work (in this folder)

### lidar-heights.png
- **Source:** Cook County 2022 LiDAR, ISGS image services `Elevation/IL_Cook_DSM_2022` and `Elevation/IL_Cook_DTM_2022`
  (https://data.isgs.illinois.edu/arcgis/rest/services/Elevation/), sampled with `getSamples` on a 1 m grid
  (199 x 167 points) on November 26, 2026.
- **Author / license:** my own plot (made for this project) of public data.
- **What it shows:** the DSM less the street grade (180.5 m NAVD88, the DTM along Division and Larrabee) over the block,
  north up, with the model's outline in white (walls, north block, bays, pylon) and the sedum beds dashed.
- **Taken for the model:** every height and edge. Main roof 13.3-14.0 m (falling north), parapets 14.4-15.3 m, north block
  20.0 m with a 1.2-1.8 m parapet, ledge and north-east roof 13.3 m, brick bays 10.7 m, Division canopy 4.2 m, pylon 20.9 m;
  the corners of the walls (+-0.5 m); the setback of the north block; the 25 rooftop units.

### osm-outline.png
- **Source:** OpenStreetMap through the Chicago Cityscape CLI (`cli/overpass.php`), November 26, 2026: way 243831261
  (Target), landuse 1168444261, driveways 830804366 and 830804367, the streets and neighbors.
- **Author / license:** my own plot. The data is (c) OpenStreetMap contributors, ODbL.
- **What it shows:** OSM's Target outline (red) against the model's LiDAR outline (black), the sedum beds (dashed), the two
  garage driveways (blue), and the `targetDivisionSite()` ring (green), north up.
- **Taken for the model:** a cross-check of the footprint. OSM's jogs on Division match the bays and recesses. The driveways
  place the garage entrances (Division at Howe St, x = -54; Larrabee at z = -42). It also shows that the site ring covers the
  OSM building, which the film draws as city-wide.js building i = 36023.

## Private (in `private/`, not committed)

### private/nbc-2013-store-opening.jpg
- **Source:** NBC News photo gallery "Infamous Chicago housing project reborn",
  https://www.nbcnews.com/news/photo/infamous-chicago-housing-project-reborn-flna8C11362073
  (image: https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_jpg,q_auto:best/streams/2013/October/131009/8C9317464-131009-cabrini-target.jpg)
- **Author / license:** NBC Chicago; all rights reserved.
- **Date:** published October 9, 2013 (the week the store opened).
- **What it shows:** the corner of Division and Larrabee from across the intersection (from the south-east, looking
  north-west): the red box, the two-story curtain wall, the red canopy over the corner entrance, the pylon, gray panels on
  Larrabee.
- **Taken for the model:** the red box's extent on both streets; the glass box above the entrance wrapping onto Larrabee;
  the pylon's sign (bullseye over "TARGET", in red on white); the red canopy band.

### private/yochicago-2013-07-construction.jpg
- **Source:** YoChicago, "Visiting six new construction sites", https://yochicago.com/visiting-six-new-construction-sites/
  (image: https://i.yochicago.com/images/hpmain/352/288352.jpg), reduced to 1600 px.
- **Author / license:** YoChicago; no license stated, so treated as all rights reserved.
- **Date:** published July 8, 2013 (under construction).
- **What it shows:** a panorama from the south-east corner of Division and Larrabee showing both street fronts before the
  cladding was finished.
- **Taken for the model:** the brick bays (tan brick above, red-brown below, tall narrow windows) and where they stand; the
  horizontal-ribbed gray panels; the open garage on columns behind a brick plinth on Larrabee; the pylon's place on Division;
  the curtain wall at the corner standing over the open entrance.

### Google Street View captures (8 files)
All: Google Street View, image capture August 2026, (c) 2026 Google, all rights reserved; captured from Google Maps in Chrome
on November 26-27, 2026 (1400 x 852 px, horizontal field of view 90 degrees). The URL is the panorama request.

| File | Panorama request | Looking | What it shows | Taken for the model |
|------|------------------|---------|---------------|---------------------|
| private/streetview-2026-08-division-from-west.jpg | `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=41.90368,-87.64570&heading=40&pitch=8&fov=90` (658 W Division St) | north-east | the west and south faces from down Division, the pylon in the distance | the white south-west block; the brown base on the west face; the bays' rhythm along Division |
| private/streetview-2026-08-sw-corner.jpg | `...viewpoint=41.90368,-87.64535&heading=25&pitch=12&fov=100` (650 W Division St) | north-north-east | the south-west corner close up | white flat panels; the red strip at the corner on the west face; the red panel, louvers and brick at street level; the "TARGET PARKING" entrance and its bullseye sign; bay A's windows |
| private/streetview-2026-08-division-at-howe.jpg | `...viewpoint=41.90366,-87.64440&heading=10&pitch=14&fov=100` (633 W Division St) | north | recess 1 between bays A and B | the ribbon window; the ribbed panels; the canopy (gray fascia, red stripe, white columns); the louvers; bay B's window pair; the CVS sign |
| private/streetview-2026-08-corner-glass-pylon.jpg | `...viewpoint=41.90366,-87.64370&heading=345&pitch=16&fov=100` (609 W Division St) | north-north-west | the pylon and the red box's glass on Division | the red panels' grid; the curtain wall on a brick sill, its mullions; the pylon's white panels and logo; the CVS sign's place |
| private/streetview-2026-08-division-larrabee-from-se.jpg | `...viewpoint=41.90362,-87.64310&heading=310&pitch=14&fov=100` (1199 N Larrabee St) | north-west | the corner from across the intersection (the angle of the NBC photograph) | the red box on both streets; the entrance, red canopy and glass box; the garage opening under the red panels on Larrabee; the pylon's height above the roof. Matched by previews/target-division/sv-se-corner.png |
| private/streetview-2026-08-larrabee-brick-bay.jpg | `...viewpoint=41.90420,-87.64318&heading=260&pitch=14&fov=100` (1257 N Larrabee St) | west | bay C on Larrabee, close | two-tone brick; tall windows with a transom and red-and-white graphics in the lower panes; louvers on a brick plinth beside it |
| private/streetview-2026-08-ne-corner-larrabee.jpg | `...viewpoint=41.90485,-87.64322&heading=220&pitch=12&fov=100` (1298 N Larrabee St) | south-west | the north-east corner | the brick block at the corner; the red door panel; the Larrabee garage entrance with "TARGET PARKING"; the red strip; the big bullseye on the north face. Matched by previews/target-division/sv-ne-corner.png |
| private/streetview-2026-08-north-face-from-scott.jpg | `...viewpoint=41.90506,-87.64430&heading=185&pitch=12&fov=100` (618 W Scott St) | south | the north face across the lawn | cream panels; brown piers alternating with louver bays; the red strips along the top; the step where the north block comes forward. Matched by previews/target-division/sv-north-scott.png |

### private/googlemaps-satellite-roof-top-down.jpg
- **Source:** Google Maps satellite view, `https://www.google.com/maps/@41.90427,-87.64424,260m/data=!3m1!1e3`
- **Author / license:** Imagery (c) 2026 Airbus, Maxar Technologies, Vexcel Imaging US, Inc.; map data (c) 2026 Google; all
  rights reserved. Captured November 27, 2026.
- **What it shows:** the roof from above, north up.
- **Taken for the model:** the six sedum beds, traced by color and fitted to the LiDAR's corners; the tan membrane; the
  rooftop units on the walkways.

### private/googlemaps-3d-roof-from-sw-close.jpg and private/googlemaps-3d-from-sw.jpg
- **Source:** Google Maps 3D view, `https://www.google.com/maps/@41.9030,-87.6458,220a,35y,40h,55t/data=!3m1!1e3` and
  `https://www.google.com/maps/@41.9022,-87.6468,330a,35y,45h,58t/data=!3m1!1e3`
- **Author / license:** Imagery (c) 2026 Airbus, Maxar Technologies, Vexcel Imaging US, Inc.; all rights reserved. Captured
  November 26, 2026.
- **What it shows:** the store from the south-west, from above (the angle of the film's aerial).
- **Taken for the model:** confirmation of the green roof and the raised north block with its two beds; the roof's colors.
  Compare previews/target-division/aerial-sw-close.png.

## Not images, but sources for the text
- Target press release, October 18, 2012: https://corporate.target.com/press/release/2012/10/target-to-open-new-store-in-chicago (about 190,000 sq ft, opening October 2013).
- DNAinfo, October 8, 2013: https://www.dnainfo.com/chicago/20131008/old-town/new-target-store-unveiled-as-anchor-near-old-cabrini-green ("three-story", 1200 N Larrabee).
- YoChicago, October 19, 2012: https://yochicago.com/a-target-where-once-there-were-many/ (via https://yochicago.com/?p=28171; parking on the ground level; Novak Construction).
- City Council journal for PD 1183, July 28, 2011 (applicant Target Corporation; 1200-1232 N Larrabee St and 600-646 W Division St), and the Plan Commission agenda of July 21, 2011. The ordinance PDF, https://gisapps.chicago.gov/gisimages/zoning_pds/PD1183.pdf, could not be fetched from here; it should hold the site plan and the PD's height limit.
