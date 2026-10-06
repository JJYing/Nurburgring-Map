import * as THREE from 'three';

export const dottingerSmoothing = { start: .853, end: .945, transition: .012 };
export const elevationSmoothing = { sigma: 45 };

export function createTrack(route, { smoothDottinger = true, elevationSigma = elevationSmoothing.sigma } = {}) {
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
  // Filter elevation independently so stronger vertical smoothing cannot move corners.
  const heightRadius = Math.ceil(3 * elevationSigma / spacing);
  const heights = knots.map((_, i) => {
    let total = 0, height = 0;
    for (let offset = -heightRadius; offset <= heightRadius; offset++) {
      const weight = Math.exp(-.5 * (offset * spacing / elevationSigma) ** 2);
      height += knots[(i + offset + knotCount) % knotCount].y * weight;
      total += weight;
    }
    return height / total;
  });
  if (smoothDottinger) {
    const { start, end, transition } = dottingerSmoothing;
    const reference = new THREE.CatmullRomCurve3(filtered, true, 'centripetal');
    const entry = reference.getPoint(start), exit = reference.getPoint(end);
    const heightReference = new THREE.CatmullRomCurve3(filtered.map((point, i) => point.clone().setY(heights[i])), true, 'centripetal');
    const entryHeight = heightReference.getPoint(start).y, exitHeight = heightReference.getPoint(end).y;
    const smootherstep = t => t * t * t * (t * (t * 6 - 15) + 10);
    filtered.forEach((point, i) => {
      const progress = i / knotCount;
      if (progress <= start || progress >= end) return;
      const ramp = THREE.MathUtils.clamp(Math.min(progress - start, end - progress) / transition, 0, 1);
      // Straighten the main section in all three axes, retaining the overall grade.
      point.lerp(entry.clone().lerp(exit, (progress - start) / (end - start)), smootherstep(ramp));
      heights[i] = THREE.MathUtils.lerp(heights[i], THREE.MathUtils.lerp(entryHeight, exitHeight,
        (progress - start) / (end - start)), smootherstep(ramp));
    });
  }
  const curve = new THREE.CatmullRomCurve3(filtered, true, 'centripetal');
  const heightCurve = new THREE.CatmullRomCurve3(filtered.map((point, i) => point.clone().setY(heights[i])), true, 'centripetal');
  function positionAt(progress) {
    return curve.getPoint(progress).setY(heightCurve.getPoint(progress).y);
  }
  const divisions = Math.ceil(length / 2);
  const points = Array.from({ length: divisions + 1 }, (_, i) => positionAt(i / divisions));
  return {
    length,
    points,
    treeStride: Math.max(1, Math.round(50 / (length / divisions))),
    rawAt,
    at(distance) {
      distance = THREE.MathUtils.clamp(distance, 0, length);
      const position = positionAt(distance / length);
      return { position, elevation: position.y + 300 };
    }
  };
}
