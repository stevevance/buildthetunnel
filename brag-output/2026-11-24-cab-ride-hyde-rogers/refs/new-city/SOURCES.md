# NewCity: reference images

The images behind `assets/new-city.js`: NewCity, 1457 N Halsted St / 1500 N Clybourn Ave, Lincoln Park (OKW Architects,
opened 2014-15): the Residences at NewCity tower and its podium, the north building, the main block (Mariano's and the
cinema) and the garage. Footprints are OpenStreetMap's (ways listed in the module's header); heights are the 2022 LiDAR.

No openly licensed photograph of NewCity turned up on Wikimedia Commons (a search for "NewCity Chicago Halsted" found
none), so every photograph is the architect's, in `private/` (gitignored). YoChicago, Google Maps, Mapillary and Nearmap
were not used.

## Public domain and my own plots (in this folder)

### naip-usgs-naipplus-new-city.png
- **Source:** USGS NAIP Plus image service, exportImage over -87.6495, 41.9068 to -87.6455, 41.9097 (EPSG:3435, 900 px),
  https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPPlus/ImageServer
- **Author / license:** USDA Farm Service Agency NAIP, via USGS; public domain. **Date:** the service's current Cook County
  mosaic (2019 or later), fetched 2026-11-27.
- **What it shows:** the block from above: the north building's green roof crossed by paths, the plaza with its fountain,
  the main block's white roof, the tower's white roof and the pool on the podium, the garage's grey top deck.
- **What the model took:** the roof finishes (green roof and paths, membrane, deck, pool), the plaza's opening between the
  buildings.

### lidar-2022-height-above-ground.png, lidar-2022-main-block-10-30m.png
- **Source:** my plots of the ISGS 2022 Cook County LiDAR, DSM minus DTM on a 4 m grid (IL_Cook_DSM_2022 and
  IL_Cook_DTM_2022 image services, https://data.isgs.illinois.edu/arcgis/rest/services/Elevation/), with OSM's outlines.
- **What the model took:** every height (tower 66 m, penthouse 72 m, main block 24 m, garage deck 21.6 m, podium 16.6 and
  15.6 m, north building 12.4 m), and the tower's narrowing ends.

## Not openly licensed (in private/)

All from OKW Architects' project page, https://okwarchitects.com/newcity, photography credited to Defined Space
(2015-16); copyright the photographer / OKW; fetched 2026-11-27 at 1500 px.

| File | What it shows | What the model took |
|---|---|---|
| okw-DS1527_5675.jpg | the tower from the plaza (north-east), its podium and the garage's edge | blue glass, white slab edges, the rounded all-glass prow, balcony stacks on the long face, the podium's silver ribbed panels and top-floor ribbon window, shopfronts |
| okw-DS1527_7434.jpg | the tower's Halsted St entrance | the podium's grey panels; balconies (white slab, glass rail) |
| okw-DS1527_5632.jpg | the plaza at dusk: the cinema block and fountain | the cinema's box of light and mid-grey panels, the glass curtain wall on the plaza side, the ribbon of second-floor glass |
| okw-NewCityMay31_11_rev2.jpg | aerial from the north toward downtown | the green roof, the tower's proportions, the main block's white roof |
| okw-DS1527_4057.jpg, okw-DS1527_4852.jpg, okw-DS1527_7009.jpg | interiors (apartment, amenity room, lobby) | nothing |
