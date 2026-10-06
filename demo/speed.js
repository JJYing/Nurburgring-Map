import * as THREE from 'three';

export function createSpeedProfile(track) {
  const count = Math.ceil(track.length / 10);
  const step = track.length / count;
  const wrap = distance => (distance + track.length) % track.length;
  const limits = Array.from({ length: count }, (_, i) => {
    const distance = i * step;
    const a = track.at(wrap(distance - 20)).position;
    const b = track.at(distance).position;
    const c = track.at(wrap(distance + 20)).position;
    a.y = b.y = c.y = 0;
    const denominator = a.distanceTo(b) * b.distanceTo(c) * c.distanceTo(a);
    const curvature = denominator > 0 ? 2 * b.clone().sub(a).cross(c.clone().sub(a)).length() / denominator : 0;
    // Approximate racing pace: 1.2 g lateral grip and a 300 km/h speed cap.
    return THREE.MathUtils.clamp(Math.sqrt(12 / Math.max(curvature, .00001)), 65 / 3.6, 300 / 3.6);
  });
  const speeds = limits.slice();
  // Circular passes propagate braking before corners and acceleration after them.
  for (let lap = 0; lap < 4; lap++) {
    for (let i = count - 1; i >= 0; i--) {
      const next = speeds[(i + 1) % count];
      speeds[i] = Math.min(speeds[i], Math.sqrt(next * next + 2 * 8 * step));
    }
    for (let i = 0; i < count; i++) {
      const previous = speeds[(i - 1 + count) % count];
      speeds[i] = Math.min(speeds[i], Math.sqrt(previous * previous + 2 * 3.5 * step));
    }
  }
  return {
    samples: speeds,
    step,
    at(distance) {
      const position = wrap(distance) / step;
      const index = Math.floor(position);
      return THREE.MathUtils.lerp(speeds[index], speeds[(index + 1) % count], position - index);
    }
  };
}
