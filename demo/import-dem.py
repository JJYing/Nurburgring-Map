"""Build an offline local elevation grid from Copernicus GeoTIFF tiles.

Requires rasterio, numpy and polyline. Source HTML only supplies the original
route projection; no latitude/longitude is added to the stored route points.
"""
import argparse
import hashlib
import json
import math
import re
from pathlib import Path

import numpy as np
import polyline
import rasterio

parser = argparse.ArgumentParser()
parser.add_argument('--route', type=Path, default=Path(__file__).with_name('route.json'))
parser.add_argument('--source-html', type=Path, required=True)
parser.add_argument('--tiles', type=Path, nargs='+', required=True)
parser.add_argument('--output', type=Path, default=Path(__file__).with_name('assets'))
args = parser.parse_args()
route = np.asarray(json.loads(args.route.read_text())['points'])
match = re.search(r'var segment = (\{[^\n]+\});', args.source_html.read_text())
segment = json.loads(match.group(1))
coordinates = np.asarray(polyline.decode(segment['latLngArr']))
if len(coordinates) != len(route):
    raise ValueError('Source route point count changed; projection cannot be verified')
east = np.linalg.lstsq(np.column_stack([coordinates[:, 1], np.ones(len(route))]), route[:, 0], rcond=None)[0]
south = np.linalg.lstsq(np.column_stack([coordinates[:, 0], np.ones(len(route))]), route[:, 2], rcond=None)[0]
error = max(np.max(np.abs(coordinates[:, 1] * east[0] + east[1] - route[:, 0])),
            np.max(np.abs(coordinates[:, 0] * south[0] + south[1] - route[:, 2])))
if error > .02:
    raise ValueError(f'Projection residual too large: {error} meters')

spacing, margin = 40, 10000
min_x = math.floor((route[:, 0].min() - margin) / spacing) * spacing
min_z = math.floor((route[:, 2].min() - margin) / spacing) * spacing
nx = math.ceil((route[:, 0].max() + margin - min_x) / spacing)
nz = math.ceil((route[:, 2].max() + margin - min_z) / spacing)
x, z = np.meshgrid(min_x + np.arange(nx + 1) * spacing, min_z + np.arange(nz + 1) * spacing)
lon, lat = (x - east[1]) / east[0], (z - south[1]) / south[0]
heights = np.full(x.shape, np.nan)
for path in args.tiles:
    with rasterio.open(path) as dataset:
        data = dataset.read(1)
        col = (lon - dataset.transform.c) / dataset.transform.a - .5
        row = (lat - dataset.transform.f) / dataset.transform.e - .5
        covered = (lon >= dataset.bounds.left) & (lon <= dataset.bounds.right) & (lat >= dataset.bounds.bottom) & (lat <= dataset.bounds.top)
        col = np.clip(col, 0, dataset.width - 1.000001)
        row = np.clip(row, 0, dataset.height - 1.000001)
        c, r = np.floor(col[covered]).astype(int), np.floor(row[covered]).astype(int)
        fx, fz = col[covered] - c, row[covered] - r
        h = (data[r, c] * (1 - fx) + data[r, c + 1] * fx) * (1 - fz) + (data[r + 1, c] * (1 - fx) + data[r + 1, c + 1] * fx) * fz
        if dataset.nodata is not None and np.any(data[r, c] == dataset.nodata):
            raise ValueError('No-data pixels in requested area')
        heights[covered] = h
if not np.all(np.isfinite(heights)):
    raise ValueError('Input tiles do not cover the requested terrain')
if heights.min() < 0 or heights.max() * 10 > 65535:
    raise ValueError('Elevation outside uint16 decimeter range')
payload = np.rint(heights * 10).astype('<u2').tobytes()
args.output.mkdir(parents=True, exist_ok=True)
(args.output / 'terrain-cop30.bin').write_bytes(payload)
metadata = {
    'dataset': 'Copernicus GLO-30 Public, 2021 release (DSM)',
    'catalog': 'https://portal.opentopography.org/datasetMetadata.jsp?otCollectionID=OT.032021.4326.1',
    'source': 'https://registry.opendata.aws/copernicus-dem/',
    'retrieved': '2026-10-06',
    'tiles': [f'https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_N50_00_E00{e}_00_DEM/Copernicus_DSM_COG_10_N50_00_E00{e}_00_DEM.tif' for e in [6, 7]],
    'minX': min_x, 'minZ': min_z, 'spacing': spacing, 'nx': nx, 'nz': nz,
    'encoding': 'uint16-le', 'scale': .1, 'verticalDatum': 'EGM2008, meters',
    'bounds': {'west': float(lon.min()), 'east': float(lon.max()), 'south': float(lat.min()), 'north': float(lat.max())},
    'projection': {'eastMetersPerDegree': float(east[0]), 'southMetersPerDegree': float(south[0]), 'originLongitude': float(-east[1] / east[0]), 'originLatitude': float(-south[1] / south[0]), 'maxResidualM': float(error)},
    'elevationRangeM': [float(heights.min()), float(heights.max())],
    'sha256': hashlib.sha256(payload).hexdigest(),
    'notice': 'produced using Copernicus WorldDEM-30 \u00a9 DLR e.V. 2010-2014 and \u00a9 Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved'
}
(args.output / 'terrain-cop30.json').write_text(json.dumps(metadata, indent=2) + '\n')
print(json.dumps({'size': x.shape, 'bytes': len(payload), 'range': metadata['elevationRangeM'], 'projectionResidualM': error}))
