export function createRoadClearance(points, roadHalfWidth = 6, margin = 2) {
  const size = 32, cells = new Map();
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    for (let x = Math.floor(Math.min(a.x, b.x) / size); x <= Math.floor(Math.max(a.x, b.x) / size); x++) {
      for (let z = Math.floor(Math.min(a.z, b.z) / size); z <= Math.floor(Math.max(a.z, b.z) / size); z++) {
        const key = `${x},${z}`;
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push([a, b]);
      }
    }
  }
  // Reserve the whole canopy footprint, even beside a road at another elevation.
  return (position, radius) => {
    const clearance = roadHalfWidth + margin + radius;
    for (let x = Math.floor((position.x - clearance) / size); x <= Math.floor((position.x + clearance) / size); x++) {
      for (let z = Math.floor((position.z - clearance) / size); z <= Math.floor((position.z + clearance) / size); z++) {
        for (const [a, b] of cells.get(`${x},${z}`) ?? []) {
          const dx = b.x - a.x, dz = b.z - a.z;
          const lengthSq = dx * dx + dz * dz;
          const t = lengthSq ? Math.max(0, Math.min(1, ((position.x - a.x) * dx + (position.z - a.z) * dz) / lengthSq)) : 0;
          if ((position.x - a.x - t * dx) ** 2 + (position.z - a.z - t * dz) ** 2 < clearance ** 2) return true;
        }
      }
    }
    return false;
  };
}
