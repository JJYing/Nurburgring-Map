# Local Real Elevation Data

Dataset: Copernicus GLO-30 Public, 2021 release, DSM, EGM2008 vertical datum.
Catalog researched: https://portal.opentopography.org/datasetMetadata.jsp?otCollectionID=OT.032021.4326.1
Actual download: https://registry.opendata.aws/copernicus-dem/
Accessed 2026-10-06. OpenTopography's API requires a personal key, so this
implementation uses the public AWS release linked by its documentation.
It is not the newer DGED 2023_1 release currently served by OpenTopography.

produced using Copernicus WorldDEM-30 © DLR e.V. 2010-2014 and © Airbus Defence
and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and
ESA; all rights reserved

License and source obligations:
https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM

`terrain-cop30.json` records tile URLs, bounds, projection, height range and
checksum. `terrain-cop30.bin` is a 654 x 624 grid, 40 m spacing, little-endian
uint16 decimeters above the geoid; 816,192 bytes. GeoTIFF tiles are not bundled.
The original source has approximately 30 m resolution. This is a surface model
including trees and buildings, not surveyed bare ground or precise road data.

The local projection was fitted against the source VeloViewer route polyline,
then verified against all existing route points, maximum residual 0.006 m.
This only establishes coordinate consistency, not GPS accuracy. Route data is
unchanged. Browser geometry uses 16 m road-adjacent, 80 m middle and 160 m distant
meshes, extending 9 km beyond the route bounds. Road clearance and local grade
blending deliberately modify the DEM near the illustrative road. Far-field
heights follow the DEM, with no synthetic hills or global elevation shift.

To regenerate (Python packages: rasterio, numpy, polyline):

```sh
python demo/import-dem.py --source-html /path/to/veloviewer.html --tiles /path/to/n50-e006.tif /path/to/n50-e007.tif
```

Source HTML: https://veloviewer.com/segment/5539685
Raw tiles: URLs in `terrain-cop30.json`. All requests are public and require
no credentials. `import-dem.py` rejects incomplete coverage and mismatched
source projections. Standard GeoTIFF affine transforms and bilinear raster
sampling are used, including the different longitude pixel spacing at 50N.

`elevation-grid.js` loads and validates the offline height grid. If it cannot
load, the original approximate terrain remains the fallback and the real-data
credit is hidden. The global road elevation smoothing remains independent.
