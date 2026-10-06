export function createElevationGrid(metadata, buffer) {
  const { minX, minZ, spacing, nx, nz, scale } = metadata;
  if (![minX, minZ, spacing, nx, nz, scale].every(Number.isFinite)
    || spacing <= 0 || scale <= 0 || !Number.isInteger(nx) || !Number.isInteger(nz)
    || nx < 1 || nz < 1 || buffer.byteLength !== (nx + 1) * (nz + 1) * 2) {
    throw new Error('Invalid elevation grid');
  }
  const view = new DataView(buffer);
  const heights = Float32Array.from({ length: (nx + 1) * (nz + 1) }, (_, i) => view.getUint16(i * 2, true) * scale - 300);
  return {
    metadata,
    heightAt(x, z) {
      const u = (x - minX) / spacing, v = (z - minZ) / spacing;
      if (u < 0 || v < 0 || u > nx || v > nz) throw new Error('Outside elevation grid');
      const i = Math.min(Math.floor(u), nx - 1), j = Math.min(Math.floor(v), nz - 1);
      const fx = u - i, fz = v - j, n = j * (nx + 1) + i;
      return (heights[n] * (1 - fx) + heights[n + 1] * fx) * (1 - fz)
        + (heights[n + nx + 1] * (1 - fx) + heights[n + nx + 2] * fx) * fz;
    }
  };
}
