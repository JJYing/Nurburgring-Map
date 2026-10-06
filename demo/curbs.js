import * as THREE from 'three';

export function createCurbs(track, data) {
  const group = new THREE.Group();
  const materials = [0xcb4439, 0xf7f5ed].map(color => new THREE.MeshStandardMaterial({
    color, roughness: .9, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
  }));
  for (const segment of data.segments) {
    const { side, start, end } = segment;
    if (!['left', 'right'].includes(side) || !Number.isFinite(start) || !Number.isFinite(end)
      || start < 0 || end <= start || end > track.length) throw new Error('Invalid curb interval');
    const sign = side === 'left' ? 1 : -1;
    const vertices = [], indices = [];
    const geometry = new THREE.BufferGeometry();
    // Separate three-meter blocks keep the red/white pattern independent of GPS sampling.
    for (let d = start, block = 0; d < end; d += 3, block++) {
      const indexStart = indices.length;
      const vertexStart = vertices.length / 3;
      const blockEnd = Math.min(d + 3, end);
      const steps = Math.ceil(blockEnd - d);
      for (let step = 0; step <= steps; step++) {
        const distance = THREE.MathUtils.lerp(d, blockEnd, step / steps);
        const p = track.at(distance).position;
        const before = track.at(Math.max(0, distance - 2)).position;
        const after = track.at(Math.min(track.length, distance + 2)).position;
        const normal = new THREE.Vector3(after.z - before.z, 0, before.x - after.x).normalize();
        for (const offset of [6, 7.2]) {
          vertices.push(p.x + normal.x * offset * sign, p.y + .02, p.z + normal.z * offset * sign);
        }
        if (step < steps) {
          const n = vertexStart + step * 2;
          indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
        }
      }
      geometry.addGroup(indexStart, indices.length - indexStart, block % 2);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.name = segment.name;
    group.add(mesh);
  }
  return group;
}
