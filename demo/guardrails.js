import * as THREE from 'three';

// All intervals use this renderer; placement data never contains mesh details.
export function createGuardrail(sample, interval, style, heightScale = 1) {
  const group = new THREE.Group();
  group.name = `${interval.type === 'wall' ? 'Wall' : 'Guardrail'} ${interval.side} ${interval.start}`;
  const wall = interval.type === 'wall';
  const sign = interval.side === 'left' ? 1 : -1;
  const height = (wall ? interval.height : style.height) * heightScale;
  const base = wall ? 0 : style.base * heightScale;
  const section = wall ? [[0, 0], [1, 0], [1, .35], [0, .35], [0, 0]]
    : [[0, 0], [.08, 1], [.22, -1], [.36, 1], [.5, 0], [.64, 1], [.78, -1], [.92, 1], [1, 0]];
  const stride = section.length, vertices = [], indices = [];
  const steps = Math.ceil((interval.end - interval.start) / 2);
  const material = new THREE.MeshStandardMaterial({ color: wall ? style.wallColor : style.color,
    metalness: wall ? 0 : style.metalness, roughness: wall ? 1 : style.roughness, side: THREE.DoubleSide });
  const railCount = wall ? 1 : (style.railCount ?? 3);
  const railGap = wall ? 0 : (style.railGap ?? .025) * heightScale;
  const railHeight = (height - railGap * (railCount - 1)) / railCount;
  for (let rail = 0; rail < railCount; rail++) {
    const start = vertices.length / 3;
    for (let i = 0; i <= steps; i++) {
      const distance = THREE.MathUtils.lerp(interval.start, interval.end, i / steps);
      for (const [fraction, depth] of section) {
        const p = sample(distance, sign * (interval.offset + depth * (wall ? 1 : style.corrugation)),
          base + rail * (railHeight + railGap) + fraction * railHeight);
        vertices.push(p.x, p.y, p.z);
      }
      if (i < steps) {
        for (let j = 0; j < stride - 1; j++) {
          const n = start + i * stride + j;
          indices.push(n, n + stride, n + 1, n + 1, n + stride, n + stride + 1);
        }
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  group.add(new THREE.Mesh(geometry, material));
  if (!wall) {
    const count = Math.floor((interval.end - interval.start) / style.postSpacing) + 1;
    const postHeight = base + height - .05 * heightScale;
    const embed = .08;
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(style.postWidth, postHeight + embed, style.postWidth), material, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      dummy.position.copy(sample(interval.start + i * style.postSpacing, sign * (interval.offset + .18), (postHeight - embed) / 2));
      dummy.updateMatrix(); posts.setMatrixAt(i, dummy.matrix);
    }
    group.add(posts);
  }
  return group;
}
