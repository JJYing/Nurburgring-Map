import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createTrack, dottingerSmoothing } from './track.js';

const route = JSON.parse(fs.readFileSync(new URL('route.json', import.meta.url)));
const track = createTrack(route), original = createTrack(route, { smoothDottinger: false });

test('Dottinger core is straight horizontally and has a stable vertical grade', () => {
  const { start, end, transition } = dottingerSmoothing;
  const a = track.at(track.length * (start + transition + .002)).position;
  const b = track.at(track.length * (end - transition - .002)).position;
  const direction = b.clone().sub(a).normalize();
  for (let f = start + transition + .003; f < end - transition - .003; f += .001) {
    const offset = track.at(track.length * f).position.sub(a);
    assert.ok(offset.clone().cross(direction).length() < .001);
  }
  assert.ok(b.y > a.y, 'retain the overall uphill grade rather than flattening elevation');
});

test('the rest of the lap and straight endpoints stay unchanged', () => {
  const { start, end } = dottingerSmoothing;
  assert.equal(track.length, original.length);
  for (let f = 0; f <= 1; f += .002) {
    if (f > start - .002 && f < end + .002) continue;
    assert.ok(track.at(track.length * f).position.distanceTo(original.at(original.length * f).position) < .00001);
  }
  for (const f of [start, end]) {
    assert.ok(track.at(track.length * f).position.distanceTo(original.at(original.length * f).position) < .001);
    const before = track.at(track.length * f - 1).position;
    const middle = track.at(track.length * f).position;
    const after = track.at(track.length * f + 1).position;
    assert.ok(middle.clone().sub(before).normalize().dot(after.clone().sub(middle).normalize()) > .999);
  }
});

test('displayed elevation matches the rendered road and all samples stay finite', () => {
  for (let f = 0; f <= 1; f += .001) {
    const { position, elevation } = track.at(track.length * f);
    assert.equal(elevation, position.y + 300);
    assert.ok(position.toArray().every(Number.isFinite));
  }
});

test('stronger elevation filtering reduces grade noise without changing the horizontal route', () => {
  const previous = createTrack(route, { elevationSigma: 10 });
  let currentNoise = 0, previousNoise = 0;
  let maxHeightChange = 0;
  for (let d = 20; d < track.length - 20; d += 10) {
    const p = track.at(d).position, old = previous.at(d).position;
    assert.equal(p.x, old.x); assert.equal(p.z, old.z);
    maxHeightChange = Math.max(maxHeightChange, Math.abs(p.y - old.y));
    currentNoise += Math.abs(track.at(d - 10).position.y - 2 * p.y + track.at(d + 10).position.y);
    previousNoise += Math.abs(previous.at(d - 10).position.y - 2 * old.y + previous.at(d + 10).position.y);
  }
  assert.ok(currentNoise < previousNoise * .65);
  assert.ok(maxHeightChange < 5, 'preserve major elevation landmarks');
  const start = track.at(0).position, end = track.at(track.length).position;
  assert.ok(start.distanceTo(end) < .00001);
});
