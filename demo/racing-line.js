import * as THREE from 'three';

export const racingLineStyle = { spacing: 5, maxOffset: 4.2 };

export function createRacingLine(track) {
  const count = Math.ceil(track.length / racingLineStyle.spacing);
  const step = track.length / count;
  const wrap = i => (i % count + count) % count;
  const centers = Array.from({ length: count }, (_, i) => track.at(i * step).position);
  const normals = centers.map((_, i) => {
    const before = centers[wrap(i - 1)], after = centers[wrap(i + 1)];
    return new THREE.Vector3(after.z - before.z, 0, before.x - after.x).normalize();
  });
  const curvature = centers.map((_, i) => {
    const a = centers[wrap(i - 4)], b = centers[i], c = centers[wrap(i + 4)];
    const ab = new THREE.Vector2(b.x - a.x, b.z - a.z);
    const bc = new THREE.Vector2(c.x - b.x, c.z - b.z);
    const ac = new THREE.Vector2(c.x - a.x, c.z - a.z);
    return 2 * ab.cross(bc) / Math.max(ab.length() * bc.length() * ac.length(), .001);
  });
  const turns = curvature.map((value, i) => {
    let sum = 0, weight = 0;
    for (let d = -10; d <= 10; d++) {
      const w = Math.exp(-.5 * (d * step / 20) ** 2);
      sum += curvature[wrap(i + d)] * w; weight += w;
    }
    const k = sum / weight;
    return Math.abs(k) > .0015 ? Math.sign(k) : 0;
  });
  // Bridge short noise gaps within a bend, without joining opposite-direction turns.
  for (let i = 0; i < count; i++) {
    if (turns[i]) continue;
    let before = 1, after = 1;
    while (before <= 10 && !turns[wrap(i - before)]) before++;
    while (after <= 10 && !turns[wrap(i + after)]) after++;
    if (before + after <= 10 && turns[wrap(i - before)] === turns[wrap(i + after)]) {
      turns[i] = turns[wrap(i - before)];
    }
  }
  const target = new Float64Array(count), weights = new Float64Array(count);
  const seam = turns.findIndex((sign, i) => sign !== turns[wrap(i - 1)]);
  if (seam < 0 && turns[0]) target.fill(-turns[0] * racingLineStyle.maxOffset);
  else if (seam >= 0) {
    for (let visited = 0; visited < count;) {
      const start = seam + visited, sign = turns[wrap(start)];
      let span = 1;
      while (visited + span < count && turns[wrap(start + span)] === sign) span++;
      visited += span;
      if (!sign || span * step < 25) continue;
      let apex = 0, apexWeight = 0;
      for (let i = start; i < start + span; i++) {
        const weight = Math.abs(curvature[wrap(i)]) ** 4;
        apex += i * weight; apexWeight += weight;
      }
      apex /= apexWeight;
      // Keep an apex inside the bend, with room for both entry and exit transitions.
      apex = THREE.MathUtils.clamp(apex, start + span * .25, start + span * .75);
      const entry = start - 70 / step, exit = start + span - 1 + 70 / step;
      for (let i = Math.ceil(entry); i <= Math.floor(exit); i++) {
        const t = i <= apex ? (i - entry) / (apex - entry) : (exit - i) / (exit - apex);
        const offset = sign * racingLineStyle.maxOffset * Math.cos(Math.PI * t);
        const weight = THREE.MathUtils.smoothstep(Math.min(i - entry, exit - i) * step, 0, 35);
        target[wrap(i)] += offset * weight;
        weights[wrap(i)] += weight;
      }
    }
    for (let i = 0; i < count; i++) target[i] /= Math.max(1, weights[i]);
  }
  // Relax horizontal curvature within the road corridor; retain a weak pull to the apex plan.
  let offsets = target.slice();
  for (let pass = 0; pass < 120; pass++) {
    const next = new Float64Array(count);
    for (let i = 0; i < count; i++) {
      const a = wrap(i - 1), b = wrap(i + 1), normal = normals[i];
      const x = (centers[a].x + normals[a].x * offsets[a] + centers[b].x + normals[b].x * offsets[b]) / 2;
      const z = (centers[a].z + normals[a].z * offsets[a] + centers[b].z + normals[b].z * offsets[b]) / 2;
      const projected = (x - centers[i].x) * normal.x + (z - centers[i].z) * normal.z;
      next[i] = THREE.MathUtils.clamp(offsets[i] + .45 * (projected - offsets[i])
        + .018 * (target[i] - offsets[i]), -racingLineStyle.maxOffset, racingLineStyle.maxOffset);
    }
    offsets = next;
  }
  const planned = centers.map((point, i) => point.clone().addScaledVector(normals[i], offsets[i]));
  const radius = Math.ceil(60 / step);
  const filtered = planned.map((_, i) => {
    const point = new THREE.Vector3();
    let total = 0;
    for (let d = -radius; d <= radius; d++) {
      const weight = Math.exp(-.5 * (d * step / 20) ** 2);
      point.addScaledVector(planned[wrap(i + d)], weight); total += weight;
    }
    point.divideScalar(total);
    const projected = point.clone().sub(centers[i]).dot(normals[i]);
    const offset = racingLineStyle.maxOffset * Math.tanh(projected / racingLineStyle.maxOffset);
    return centers[i].clone().addScaledVector(normals[i], offset);
  });
  const smoothCurve = new THREE.CatmullRomCurve3(filtered, true, 'catmullrom', .5);
  function at(distance) {
    if (distance < 0 || distance >= track.length) distance = (distance % track.length + track.length) % track.length;
    const center = track.at(distance).position;
    const before = track.at((distance - 2 + track.length) % track.length).position;
    const after = track.at((distance + 2) % track.length).position;
    const normal = new THREE.Vector3(after.z - before.z, 0, before.x - after.x).normalize();
    const position = smoothCurve.getPoint(distance / track.length).setY(center.y);
    const displacement = position.clone().sub(center);
    if (displacement.length() > racingLineStyle.maxOffset) {
      position.copy(center).add(displacement.setLength(racingLineStyle.maxOffset));
    }
    const offset = position.clone().sub(center).dot(normal);
    return { position, elevation: center.y + 300, offset };
  }
  return { at, offsets, target, step };
}
