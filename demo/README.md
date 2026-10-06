# Nordschleife View Demo

Preview: http://localhost:7888/nurburgring/demo/

Run `npm install` in this directory if dependencies are missing. The existing local server serves this demo without a build step.

Modes: draggable 3D overview with a horizontal reference grid, and an on-rail first-person camera. Play/pause, progress, speed, view reset, and tree visibility are shared controls.

Route source: https://veloviewer.com/segment/5539685

`route.json` stores each point as `[eastMeters, elevationMeters, southMeters, sourceDistanceMeters]`. Coordinates are projected into a local metric plane from the source route; elevations and distances retain the source values. The app interpolates the missing endpoint connection for looping. Road width, roadside ground, and trees are illustrative, not surveyed geometry. Elevation is approximate.

This directory is independent of the existing PHP page and its assets.

Rendering uses 10 m distance-resampled knots, a Gaussian filter with a 10 m standard deviation, and a closed centripetal Catmull-Rom spline tessellated about every 2 m. Road geometry and the first-person camera share this curve. Filtering wraps across the lap boundary. Displayed elevations retain the source interpolation; the source file is unchanged. Trees remain spaced about every 50 m regardless of road tessellation.

Playback follows an illustrative racing speed profile computed from horizontal curvature: 12 m/s² lateral acceleration, 3.5 m/s² acceleration, 8 m/s² braking, and a 65-300 km/h range. Forward/backward circular passes anticipate bends and accelerate out of them. The slider changes playback rate (0.25-4x), while the speed readout shows the underlying estimated racing pace, not the multiplied playback speed. This is not recorded lap telemetry. The first-person road has no centerline.

Corner names and original map ranges in `corners.json` come from the main site's `assets/main.js`. Ranges are approximately aligned to source distance using the start, Wehrseifen (7,350 m), Breidscheid (8,008.4 m), Karussell (12,000 m), and source endpoint. Labels project with the 3D camera and avoid overlapping the HUD, controls, and each other. All 44 entries remain selectable even when their labels cannot fit. The current corner is highlighted; labels can be toggled. The minimap appears only in first-person mode.
