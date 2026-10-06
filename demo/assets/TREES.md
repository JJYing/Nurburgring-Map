# Summer Tree Atlas

`trees-summer-atlas-v1.png` was generated with the built-in image generation tool.
It is a 1536 x 1024 RGBA atlas, three columns and two rows:
oak, beech, birch / spruce, Scots pine, shrub. No external photographic assets.

Prompt: Six isolated full European summer trees in a strict 3 by 2 equal-cell
grid, front orthographic ground-level view, realistic detailed foliage,
restrained greens, neutral overcast light, transparent alpha including branch
gaps, complete crowns and trunks, no ground, grass, text, shadow or watermark.

`tree-sprites.js` uses two crossed planes per tree, shared atlas UVs, alpha test,
depth writing, instancing and shadows. Full plane width participates in road
clearance. The tree style selector switches between sprite and procedural trees
without changing positions or camera state. Both batches remain available;
only the selected representation renders. Procedural trees are also the fallback
if the image cannot load.

Alpha-to-coverage is intentionally disabled: with fog it produced bright
speckled outlines on distant foliage at Breidscheid. A .4 alpha cutoff keeps
the silhouette opaque and lets standard fog blend its color normally.
