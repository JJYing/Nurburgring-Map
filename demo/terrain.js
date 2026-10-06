import * as THREE from 'three';

export const terrainStyle = { spacing: 80, detailSpacing: 16, margin: 1200, roadClearance: 2, relief: 24 };

export function createTerrain(track) {
  const box = new THREE.Box3().setFromPoints(track.points);
  const { spacing, margin, roadClearance, relief } = terrainStyle;
  const minX = Math.floor((box.min.x - margin) / spacing) * spacing;
  const minZ = Math.floor((box.min.z - margin) / spacing) * spacing;
  const nx = Math.ceil((box.max.x + margin - minX) / spacing);
  const nz = Math.ceil((box.max.z + margin - minZ) / spacing);
  const heights = new Float32Array((nx + 1) * (nz + 1));
  const samples = track.points.filter((_, i) => i % 25 === 0);
  const vertices = [], colors = [], indices = [];
  const baseColor = new THREE.Color();
  for (let j = 0; j <= nz; j++) {
    for (let i = 0; i <= nx; i++) {
      const x = minX + i * spacing, z = minZ + j * spacing;
      let total = 0, weight = 0, nearest = Infinity, ceiling = Infinity;
      for (const p of samples) {
        const d2 = (p.x - x) ** 2 + (p.z - z) ** 2;
        const w = 1 / (d2 + 160000) ** 2;
        total += p.y * w; weight += w; nearest = Math.min(nearest, d2);
      }
      // Incident road cells cap all their vertices so the coarse mesh cannot cover asphalt.
      for (const p of track.points) {
        if (Math.abs(p.x - x) <= spacing + 12 && Math.abs(p.z - z) <= spacing + 12) {
          ceiling = Math.min(ceiling, p.y - roadClearance);
        }
      }
      const wave = Math.sin(x / 620 + .8) * Math.cos(z / 850) + .35 * Math.sin((x + z) / 310);
      const fade = THREE.MathUtils.smoothstep(Math.sqrt(nearest), 100, 600);
      const y = Math.min(total / weight - 5 + wave * relief * fade, ceiling);
      heights[j * (nx + 1) + i] = y;
      vertices.push(x, y, z);
      const patch = .5 + .5 * Math.sin(x / 340) * Math.cos(z / 470);
      baseColor.setHSL(.24 + patch * .045, .22 + patch * .09, .25 + patch * .045);
      colors.push(baseColor.r, baseColor.g, baseColor.b);
    }
  }
  function coarseHeightAt(x, z) {
    const u = THREE.MathUtils.clamp((x - minX) / spacing, 0, nx - .000001);
    const v = THREE.MathUtils.clamp((z - minZ) / spacing, 0, nz - .000001);
    const i = Math.floor(u), j = Math.floor(v), fx = u - i, fz = v - j;
    const a = heights[j * (nx + 1) + i], b = heights[j * (nx + 1) + i + 1];
    const c = heights[(j + 1) * (nx + 1) + i], d = heights[(j + 1) * (nx + 1) + i + 1];
    return fx + fz <= 1 ? a + (b - a) * fx + (c - a) * fz
      : d + (c - d) * (1 - fx) + (b - d) * (1 - fz);
  }
  const tiles = new Set(), roadCells = new Map(), detailed = new Map();
  for (const p of track.points) {
    const i = Math.floor((p.x - minX) / spacing), j = Math.floor((p.z - minZ) / spacing);
    const key = `${i},${j}`;
    if (!roadCells.has(key)) roadCells.set(key, []);
    roadCells.get(key).push(p);
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) tiles.add(`${i + di},${j + dj}`);
  }
  const divisions = spacing / terrainStyle.detailSpacing, step = terrainStyle.detailSpacing;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const key = `${i},${j}`;
    if (!tiles.has(key)) {
      const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
      indices.push(a, c, b, b, c, d);
      continue;
    }
    const nearby = [];
    for (let di = -2; di <= 2; di++) for (let dj = -2; dj <= 2; dj++) nearby.push(...(roadCells.get(`${i + di},${j + dj}`) ?? []));
    const tileHeights = [], start = vertices.length / 3;
    for (let v = 0; v <= divisions; v++) for (let u = 0; u <= divisions; u++) {
      const x = minX + i * spacing + u * step, z = minZ + j * spacing + v * step;
      let nearest = Infinity, roadHeight = 0, ceiling = Infinity;
      for (const p of nearby) {
        const dx = p.x - x, dz = p.z - z, distance = dx * dx + dz * dz;
        if (distance < nearest) { nearest = distance; roadHeight = p.y; }
        // Every triangle touching a road is kept below that road, including adjacent legs.
        if (Math.abs(dx) <= step + 9 && Math.abs(dz) <= step + 9) ceiling = Math.min(ceiling, p.y - .08);
      }
      const blend = 1 - THREE.MathUtils.smoothstep(Math.sqrt(nearest), 12, 64);
      const y = Math.min(THREE.MathUtils.lerp(coarseHeightAt(x, z), roadHeight - .08, blend), ceiling);
      tileHeights.push(y); vertices.push(x, y, z);
      const patch = .5 + .5 * Math.sin(x / 340) * Math.cos(z / 470);
      baseColor.setHSL(.24 + patch * .045, .22 + patch * .09, .25 + patch * .045);
      colors.push(baseColor.r, baseColor.g, baseColor.b);
      if (u < divisions && v < divisions) {
        const a = start + v * (divisions + 1) + u, b = a + 1, c = a + divisions + 1, d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    }
    detailed.set(key, tileHeights);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
  mesh.name = 'Continuous approximate terrain'; mesh.receiveShadow = true;
  function heightAt(x, z) {
    const i = Math.floor((x - minX) / spacing), j = Math.floor((z - minZ) / spacing);
    const tile = detailed.get(`${i},${j}`);
    if (!tile) return coarseHeightAt(x, z);
    const u = (x - minX - i * spacing) / step, v = (z - minZ - j * spacing) / step;
    const a = Math.min(Math.floor(u), divisions - 1), b = Math.min(Math.floor(v), divisions - 1);
    const fx = u - a, fz = v - b, n = b * (divisions + 1) + a;
    const h0 = tile[n], h1 = tile[n + 1], h2 = tile[n + divisions + 1], h3 = tile[n + divisions + 2];
    return fx + fz <= 1 ? h0 + (h1 - h0) * fx + (h2 - h0) * fz
      : h3 + (h2 - h3) * (1 - fx) + (h1 - h3) * (1 - fz);
  }
  return { mesh, heightAt, coarseHeightAt };
}
