import * as THREE from 'three';

function surfaceHeightAt(geometry) {
  const cells = new Map(), positions = geometry.attributes.position, indices = geometry.index.array;
  const size = 16;
  for (let i = 0; i < indices.length; i += 3) {
    const a = new THREE.Vector3().fromBufferAttribute(positions, indices[i]);
    const b = new THREE.Vector3().fromBufferAttribute(positions, indices[i + 1]);
    const c = new THREE.Vector3().fromBufferAttribute(positions, indices[i + 2]);
    for (let x = Math.floor(Math.min(a.x, b.x, c.x) / size); x <= Math.floor(Math.max(a.x, b.x, c.x) / size); x++) {
      for (let z = Math.floor(Math.min(a.z, b.z, c.z) / size); z <= Math.floor(Math.max(a.z, b.z, c.z) / size); z++) {
        const key = `${x},${z}`;
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push([a, b, c]);
      }
    }
  }
  return (x, z) => {
    let height = -Infinity;
    for (const [a, b, c] of cells.get(`${Math.floor(x / size)},${Math.floor(z / size)}`) ?? []) {
      const denominator = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z);
      if (Math.abs(denominator) < .000001) continue;
      const u = ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / denominator;
      const v = ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / denominator;
      if (u >= -.000001 && v >= -.000001 && u + v <= 1.000001) {
        height = Math.max(height, u * a.y + v * b.y + (1 - u - v) * c.y);
      }
    }
    return height;
  };
}

export function createRoadBanks(track, terrain) {
  const vertices = [], colors = [], indices = [], offsets = [7.95, 9.5, 12];
  const color = new THREE.Color();
  const last = track.points.length - 1;
  const samples = track.points.filter((_, i) => i % 2 === 0 || i === last);
  for (const sign of [-1, 1]) {
    const start = vertices.length / 3;
    samples.forEach((p, i) => {
      const source = i === samples.length - 1 ? last : i * 2;
      const before = track.points[(source - 1 + last) % last], after = track.points[(source + 1) % last];
      const normal = new THREE.Vector3(after.z - before.z, 0, before.x - after.x).normalize();
      for (const offset of offsets) {
        const x = p.x + normal.x * offset * sign, z = p.z + normal.z * offset * sign;
        const blend = THREE.MathUtils.smoothstep(offset, offsets[0], offsets.at(-1));
        const y = THREE.MathUtils.lerp(p.y + .015, Math.min(p.y + .015, terrain.heightAt(x, z)), blend);
        vertices.push(x, y, z);
        const patch = .5 + .5 * Math.sin(x / 340) * Math.cos(z / 470);
        color.setHSL(.24 + patch * .045, .22 + patch * .09, .25 + patch * .045);
        colors.push(color.r, color.g, color.b);
      }
      if (i < samples.length - 1) for (let j = 0; j < offsets.length - 1; j++) {
        const a = start + i * offsets.length + j, b = a + 1, c = a + offsets.length, d = c + 1;
        indices.push(a, c, b, b, c, d);
      }
    });
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 1, side: THREE.DoubleSide
  }));
  mesh.name = 'Short curved road banks'; mesh.receiveShadow = true;
  mesh.userData.heightAt = surfaceHeightAt(geometry);
  return mesh;
}
