import * as THREE from 'three';

export function createTrack(route) {
  const samples = route.points.map(([x, elevation, z, distance]) => ({ position: new THREE.Vector3(x, elevation - 300, z), elevation, distance }));
  const first = samples[0], last = samples.at(-1);
  const gap = first.position.distanceTo(last.position);
  for (let i = 1; i <= 20; i++) {
    const t = i / 20;
    samples.push({ position: last.position.clone().lerp(first.position, t), elevation: THREE.MathUtils.lerp(last.elevation, first.elevation, t), distance: last.distance + gap * t });
  }
  const length = samples.at(-1).distance;
  function rawAt(distance) {
    distance = THREE.MathUtils.clamp(distance, 0, length);
    let low = 0, high = samples.length - 1;
    while (high - low > 1) {
      const mid = (low + high) >> 1;
      if (samples[mid].distance <= distance) low = mid;
      else high = mid;
    }
    const a = samples[low], b = samples[high];
    const t = (distance - a.distance) / (b.distance - a.distance);
    return { position: a.position.clone().lerp(b.position, t), elevation: THREE.MathUtils.lerp(a.elevation, b.elevation, t) };
  }

  // Distance-based filtering avoids overweighting densely sampled GPS sections.
  const knotCount = Math.ceil(length / 10);
  const spacing = length / knotCount;
  const knots = Array.from({ length: knotCount }, (_, i) => rawAt(i * spacing).position);
  const sigma = 10;
  const radius = Math.ceil(3 * sigma / spacing);
  const filtered = knots.map((_, i) => {
    const result = new THREE.Vector3();
    let total = 0;
    for (let offset = -radius; offset <= radius; offset++) {
      const weight = Math.exp(-.5 * (offset * spacing / sigma) ** 2);
      result.addScaledVector(knots[(i + offset + knotCount) % knotCount], weight);
      total += weight;
    }
    return result.divideScalar(total);
  });
  const curve = new THREE.CatmullRomCurve3(filtered, true, 'centripetal');
  const divisions = Math.ceil(length / 2);
  const points = curve.getPoints(divisions);
  return {
    length,
    points,
    treeStride: Math.max(1, Math.round(50 / (length / divisions))),
    rawAt,
    at(distance) {
      distance = THREE.MathUtils.clamp(distance, 0, length);
      return { position: curve.getPoint(distance / length), elevation: rawAt(distance).elevation };
    }
  };
}
