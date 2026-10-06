import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createTrack, dottingerSmoothing } from './track.js';
import { createRacingLine, racingLineStyle } from './racing-line.js';

const track = createTrack(JSON.parse(fs.readFileSync(new URL('route.json', import.meta.url))));
const line = createRacingLine(track);

test('racing line remains on asphalt, preserves road height and closes smoothly', () => {
  for (let d = 0; d < track.length; d += 2) {
    const current = line.at(d), center = track.at(d).position;
    assert.ok(current.position.toArray().every(Number.isFinite));
    assert.equal(current.position.y, center.y);
    assert.ok(current.position.distanceTo(center) <= racingLineStyle.maxOffset + .00001);
  }
  assert.ok(line.at(0).position.distanceTo(line.at(track.length).position) < .00001);
  const before = line.at(-.1).position, middle = line.at(0).position, after = line.at(.1).position;
  assert.ok(middle.clone().sub(before).normalize().dot(after.clone().sub(middle).normalize()) > .999);
  assert.equal(line.mesh, undefined, 'camera path does not create a visible road marking');
});

test('long straight stays centered and straight with no added lateral wobble', () => {
  const { start, end, transition } = dottingerSmoothing;
  const a = line.at(track.length * (start + transition + .01)).position;
  const b = line.at(track.length * (end - transition - .01)).position;
  const direction = b.clone().sub(a).normalize();
  for (let f = start + transition + .012; f < end - transition - .012; f += .002) {
    const current = line.at(track.length * f);
    assert.ok(Math.abs(current.offset) < .01);
    assert.ok(current.position.clone().sub(a).cross(direction).length() < .01);
  }
});

test('isolated bends have outside entry and exit with an inside apex', () => {
  const radius = 70, straight = 400, half = straight + Math.PI * radius;
  const stadium = { length: half * 2, at(distance) {
    const d = (distance % (half * 2) + half * 2) % (half * 2);
    const side = d >= half ? -1 : 1, local = d % half;
    const position = local < straight ? new THREE.Vector3(side * (local - straight / 2), 0, -side * radius)
      : new THREE.Vector3(side * (straight / 2 + radius * Math.sin((local - straight) / radius)), 0,
        -side * radius * Math.cos((local - straight) / radius));
    return { position };
  } };
  const racing = createRacingLine(stadium);
  assert.ok(racing.at(straight - 35).offset > 1);
  assert.ok(racing.at(straight + Math.PI * radius / 2).offset < -1);
  assert.ok(racing.at(half + 35).offset > 1);
});

test('horizontal relaxation reduces high-frequency steering changes', () => {
  let centerNoise = 0, racingNoise = 0;
  function noise(source, d) {
    const a = source.at(d - 5).position, b = source.at(d).position;
    const c = source.at(d + 5).position, e = source.at(d + 10).position;
    return Math.hypot(e.x - 3 * c.x + 3 * b.x - a.x, e.z - 3 * c.z + 3 * b.z - a.z);
  }
  for (let d = 10; d < track.length - 10; d += 5) {
    centerNoise += noise(track, d); racingNoise += noise(line, d);
  }
  assert.ok(racingNoise < centerNoise, `${racingNoise} >= ${centerNoise}`);
});

test('opposite consecutive turns transition through the center instead of crossing abruptly', () => {
  const sBends = { length: 1000, at(distance) {
    return { position: new THREE.Vector3(distance, 0, 30 * Math.sin((distance - 500) / 50)) };
  } };
  const racing = createRacingLine(sBends);
  assert.ok(Math.abs(racing.at(500).offset) < .5);
  assert.ok(racing.at(450).offset * racing.at(550).offset < 0);
  for (let d = 475; d < 525; d++) {
    assert.ok(Math.abs(racing.at(d + 1).offset - racing.at(d).offset) < .15);
  }
});
