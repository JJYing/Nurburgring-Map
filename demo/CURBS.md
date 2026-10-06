# Full-Lap Scenery and Curbs

`curbs.json` stores independent curb intervals in meters along the demo route,
not coordinates or fractions of video runtime. Left/right are relative to the
direction of travel. Change `side`, `start`, and `end` to refine each interval.

Reference: official Ford Mustang GTD onboard, https://www.youtube.com/watch?v=Fxw6mf_5j-U.
Sampled video frames around 00:25, 00:30, and 00:40 were used for the initial
Hatzenbach / Hoheichen pilot. The next batch samples 00:45 through 01:35, extending
curbs through Aremberg and scenery through Fuchsröhre. A third batch samples
01:40-02:45 through Breidscheid, extending both data sets to approximately 8150 m.
The final batch samples the remaining lap at 02:55, 03:05, 03:25, 03:50,
04:00-04:05, 04:25, 04:55, 05:20, 05:40-05:48, 06:06-06:33 and 06:47,
plus the start at 00:08. The environment profiles now cover the complete route,
including its synthetic closing seam. Major curb intervals extend through
Hohenrain. This is a complete simplified lap, not an exhaustive curb inventory.

The distance boundaries are visual estimates on the smoothed route, not
measurements. `approximate` records sampled video evidence; `provisional`
records placement inferred from the named corner and needs closer video review.
An omitted interval is not a verified absence of curbs. Timestamps identify
reference footage, not an exact time-to-distance mapping.

Rendering uses one shared approximation: 1.2-meter-wide, flat strips alongside
the 12-meter road with alternating three-meter red/white blocks. Physical curb
height and real widths are intentionally not reproduced. The current-segment
highlight is a separate narrow red strip outside the curbs and stays independent
of label visibility. Curbs currently appear only in first-person mode.

`scenery.json` stores approximate left/right vegetation profiles, barrier and
fence intervals, and bridge locations in route meters. Trees are procedural
mixed broadleaf/conifers; density, heights, and setbacks approximate the footage,
not individual real trees. Profiles and barriers cover 0-20839.722 m with
matching vegetation at the start and end. `surfaces` adds the two flat gray
Karussell inner bands and simplified trackside openings; `bridges`, `gantries`,
and `buildings` store independent, unbranded landmarks. Concrete seams are
decorative: banking and physical curb geometry are not modeled. The smaller
Karussell, some bridges and the Brunnchen opening remain provisional; the
T13 building is an artistic placeholder, not a replica. Actual terrain banks,
advertisements and seasonal foliage are not reconstructed. Do not use these
positions as a driving or safety reference.

All landmark distances use the same route meters as the curbs. Add/edit JSON
entries to move individual objects without changing rendering. Run
`node --test demo/scenery.test.js` from the repository root to check coverage,
bounds, finite geometry, deterministic vegetation, and shared guardrail styling.

## Shared Barrier Appearance

Change `guardrailStyle` in `scenery.json` to update all metal barriers: color,
metalness, roughness, base, height, corrugation depth, post spacing, and post width.
`wallColor` controls the simplified concrete/sound walls. Barrier placement
(`start`, `end`, `side`, `offset`, optional wall `type` and `height`) is independent.
To replace the mesh construction completely, edit `createGuardrail` in
`guardrails.js`; every interval uses this one renderer. Metal barriers are
continuous corrugated sheets, with posts behind the face, rather than spaced
horizontal fence bars. The separate `fences` collection remains wire fencing.

## Rendering

`rendering.js` keeps the first-person look in one place. `renderStyle` controls
fog color/density, sky color, exposure and the near-field shadow range. The
overview retains its unfogged neutral lighting. First-person uses ACES tone
mapping, an exponential distance fog, a horizon-matched procedural sky, and
PCF sunlight shadows following the camera. Shadow resolution is 1024 on narrow
screens and 2048 otherwise. Only nearby shadows are modeled, not the entire lap.
The asphalt and grass use world-space procedural grain faded by pixel footprint
to reduce distant aliasing. Trees remain instanced, with smooth broadleaf crowns
and three-tier conifers; this is a stylized scene, not photorealistic scenery.

## Terrain and Vegetation Variety

Google Maps satellite and terrain layers were viewed as a broad visual reference:
https://www.google.com/maps/search/N%C3%BCrburgring%2BGermany.
The Breidscheid valley, Hohe Acht slopes and mixed woodland/open land inform the
look, not surveyed elevations. No Google map imagery, tiles or elevation data
are downloaded or included in this demo.

`terrain.js` generates a continuous 80 m grid covering the route plus a 1200 m
margin, with 16 m refinement only near the road (currently 66,104 triangles in
one mesh). The local ground rises toward road height and blends back to the
coarse terrain over 12-64 m. Triangle vertices near any road are capped below
its elevation, including neighboring hairpin legs. Tree roots sample the actual
refined triangles. Its broad relief remains synthetic. The former 160 m grass ribbon was
removed because it folded over neighboring road sections at hairpins.
This is fictional ground for visual continuity, not a DEM.
The overview hides it. Change `terrainStyle` to tune grid spacing and relief.

`road-banks.js` adds a narrow curved apron from the 8 m shoulder edge to the
ground at 12 m from the centerline. Three lateral samples blend down smoothly,
with a small overlap under the shoulder to hide the seam. It is attached to the
terrain mesh so overview visibility remains unchanged.

Vegetation now uses six stylized forms: clustered oak, rounded beech, slender
light-trunk birch, tiered spruce, broader pine and low shrubs. Crown width, height,
rotation and color vary deterministically. One trunk batch plus six instanced
crown batches avoids one draw call per tree. All tree roots use the terrain
mesh's triangle-interpolated height to avoid floating. `road-clearance.js`
reserves the full canopy footprint plus the road half-width and a 2 m margin
around every road segment, including neighboring legs at another elevation.
Run `node --test demo/scenery.test.js demo/rendering.test.js demo/terrain.test.js`.

## UI and Free Camera

The demo reuses the main site's logo, Smiley Wide/Fira fonts, red/black/white
tokens and 9-degree skew. The main site's source and layout remain unchanged.

Free camera is a debugging mode, not a driving mode. Mouse drag rotates,
right-button drag pans, and the wheel zooms. WASD translates the camera relative
to its orientation, Q/E moves down/up, and Shift boosts movement. Keys do not
intercept text inputs or modified browser shortcuts; focus loss clears them.
Playback pauses and its controls are disabled while free camera is active.
Free camera keeps the detailed lighting and sky but disables distance fog;
first-person mode retains fog.
The HUD still describes the selected route point, not camera coordinates.
Selecting a segment or scrubbing progress repositions the free camera above
that route point. Reset restores this inspection view without resetting progress.
Run `node --test demo/free-camera.test.js` for movement checks.
Run `node --test demo/road-clearance.test.js demo/scenery.test.js` for vegetation clearance checks.

## Tree Sprites

Metal guardrails share three corrugated horizontal panels with 0.025 m gaps.
Their combined span is 1.05 m above a short 0.12 m exposed post base; total
height remains about 1.2 m. `guardrailStyle` in `scenery.json` controls the
dimensions globally. Concrete walls keep their continuous profile.

Barriers and wire fences are grounded at their own lateral positions, using
the highest rendered surface from the terrain and narrow road banks. Bank
heights use a spatial index of actual triangles rather than road-center height.
Post feet extend 8 cm into the ground to prevent small slope gaps.

`track.js` applies very strong three-axis smoothing specifically to Dottinger
Hohe (progress .853-.945, matching `corners.json`). Its central section follows
the straight chord between the smoothed endpoints, preserving the overall
grade. Quintic blends over .012 progress at each end retain smooth entry and
exit. Other sections keep the existing Gaussian filter. The elevation HUD now
reports the rendered road elevation; raw source samples remain untouched.
Run `node --test demo/track.test.js` for straightness and transition checks.

Global elevation uses an independent 45 m Gaussian sigma (formerly 10 m),
sampling up to 135 m each way with wraparound at the lap seam. The horizontal
curve is kept separate and unchanged. Dottinger's linear grade is applied after
the elevation filter so its central section remains straight in all axes.

The generated transparent six-tree atlas is saved in
`assets/trees-summer-atlas-v1.png`; prompt and provenance are in `assets/TREES.md`.
The tree style selector keeps both original 3D trees and two-plane cutout trees
available. Both representations share positions and use the larger of their
footprints for road clearance. Each cutout tree has four triangles; six instanced
batches share one image. Alpha testing avoids transparent sorting errors.
Run `node --test demo/tree-sprites.test.js` for atlas UVs and switching checks.
