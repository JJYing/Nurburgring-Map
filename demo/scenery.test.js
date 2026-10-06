import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createTrack } from './track.js';
import { createScenery } from './scenery.js';
import { createCurbs } from './curbs.js';
import { createGuardrail } from './guardrails.js';
import { createRoadClearance } from './road-clearance.js';

const read = name => JSON.parse(fs.readFileSync(new URL(name, import.meta.url)));
const track = createTrack(read('route.json'));
const scenery = read('scenery.json'), curbs = read('curbs.json');
const interval = item => {
  assert.ok(item.start >= 0 && item.start < item.end && item.end <= track.length);
};

test('environment and barriers cover the complete lap with matching seam settings', () => {
  let end = 0;
  for (const profile of scenery.profiles) {
    interval(profile); assert.equal(profile.start, end); end = profile.end;
    for (const side of ['left', 'right']) {
      const settings = profile[side];
      assert.ok(settings.spacing > 0 && settings.setback >= 13 && settings.height > 0);
    }
  }
  assert.ok(Math.abs(end - track.length) < .001);
  for (const side of ['left', 'right']) {
    assert.deepEqual(scenery.profiles[0][side], scenery.profiles.at(-1)[side]);
    let barrierEnd = 0;
    for (const barrier of scenery.barriers.filter(b => b.side === side)) {
      interval(barrier); assert.equal(barrier.start, barrierEnd); barrierEnd = barrier.end;
    }
    assert.equal(barrierEnd, track.length);
  }
  scenery.fences.forEach(interval);
  scenery.surfaces.forEach(surface => {
    interval(surface); assert.ok(surface.inner < surface.outer);
  });
  for (const item of [...scenery.bridges, ...scenery.buildings, ...scenery.gantries]) {
    assert.ok(item.distance >= 0 && item.distance <= track.length);
  }
});

test('curbs have valid, separately editable intervals and evidence status', () => {
  assert.ok(curbs.segments.length >= 40);
  for (const curb of curbs.segments) {
    interval(curb); assert.ok(['left', 'right'].includes(curb.side));
    assert.ok(['approximate', 'provisional'].includes(curb.confidence));
    if (curb.confidence === 'approximate') assert.ok(curb.referenceTime);
  }
  assert.equal(createCurbs(track, curbs).children.length, curbs.segments.length);
});

test('complete scenery is finite and vegetation deterministic', () => {
  const first = createScenery(track, scenery), second = createScenery(track, scenery);
  assert.ok(first.trees.children[0].count > 1000);
  assert.equal(first.trees.children.length, 7);
  for (const kind of ['oak', 'beech', 'birch', 'spruce', 'pine', 'shrub']) {
    assert.ok(first.trees.getObjectByName(`Vegetation ${kind}`).count > 0);
  }
  for (const [i, mesh] of first.trees.children.entries()) {
    assert.deepEqual(mesh.instanceMatrix.array, second.trees.children[i].instanceMatrix.array);
  }
  first.root.traverse(object => {
    for (const attribute of Object.values(object.geometry?.attributes ?? {})) {
      assert.ok(attribute.array.every(Number.isFinite), object.name);
    }
    if (object.instanceMatrix) assert.ok(object.instanceMatrix.array.every(Number.isFinite));
  });
  for (const item of [...scenery.surfaces, ...scenery.bridges, ...scenery.buildings, ...scenery.gantries]) {
    assert.ok(first.root.getObjectByName(item.name), item.name);
  }
});

test('all metal guardrails use the shared style', () => {
  const sample = (distance, offset, height = 0) => new THREE.Vector3(distance, height, offset);
  const item = { start: 0, end: 20, side: 'left', offset: 10 };
  const original = createGuardrail(sample, item, scenery.guardrailStyle);
  const changed = createGuardrail(sample, item, { ...scenery.guardrailStyle, height: 2, color: '#123456' });
  assert.equal(changed.children[0].material.color.getHexString(), '123456');
  original.children[0].geometry.computeBoundingBox();
  changed.children[0].geometry.computeBoundingBox();
  assert.ok(changed.children[0].geometry.boundingBox.max.y > original.children[0].geometry.boundingBox.max.y);
});

test('all generated tree canopies clear every road segment and roots follow terrain', () => {
  const ground = { heightAt: () => -50 };
  const { trees } = createScenery(track, scenery, ground);
  const overlaps = createRoadClearance(track.points);
  const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), scale = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  for (const mesh of trees.children.slice(1)) {
    const vertices = mesh.geometry.attributes.position;
    let radius = 0;
    for (let i = 0; i < vertices.count; i++) radius = Math.max(radius, Math.hypot(vertices.getX(i), vertices.getZ(i)));
    for (let i = 0; i < mesh.count; i++) {
      mesh.getMatrixAt(i, matrix); matrix.decompose(position, rotation, scale);
      assert.equal(overlaps(position, radius * Math.max(scale.x, scale.z)), false, `${mesh.name} ${i}`);
    }
  }
  const trunk = trees.children[0];
  for (let i = 0; i < trunk.count; i++) {
    trunk.getMatrixAt(i, matrix); matrix.decompose(position, rotation, scale);
    assert.ok(Math.abs(position.y - scale.y / 2 + 50) < .00001);
  }
});

test('barriers anchor to the rendered bank surface instead of road-center elevation', () => {
  const item = { start: 0, end: 20, side: 'left', offset: 10 };
  const data = { profiles: [], barriers: [item], fences: [], bridges: [], guardrailStyle: scenery.guardrailStyle };
  const { root } = createScenery(track, data, { heightAt: () => 10, surfaceHeightAt: () => 42 });
  const barrier = root.getObjectByName('Guardrail left 0');
  barrier.children[0].geometry.computeBoundingBox();
  assert.ok(Math.abs(barrier.children[0].geometry.boundingBox.min.y - 42 - scenery.guardrailStyle.base) < .00001);
  const posts = barrier.children[1], matrix = new THREE.Matrix4(), position = new THREE.Vector3();
  for (let i = 0; i < posts.count; i++) {
    posts.getMatrixAt(i, matrix); position.setFromMatrixPosition(matrix);
    assert.ok(Math.abs(position.y - posts.geometry.parameters.height / 2 - 42 + .08) < .00001);
  }
});

test('global fence height is 4.9 meters and remains grounded', () => {
  const data = { profiles: [], barriers: [], fences: [{ start: 0, end: 20, side: 'left', offset: 15 }],
    bridges: [], guardrailStyle: scenery.guardrailStyle, barrierHeightScale: scenery.barrierHeightScale };
  const { root } = createScenery(track, data, { heightAt: () => 42 });
  const fence = root.children.find(object => object.isLineSegments);
  fence.geometry.computeBoundingBox();
  assert.equal(fence.geometry.boundingBox.min.y, 42);
  assert.ok(Math.abs(fence.geometry.boundingBox.max.y - 42 - 4.9) < .00001);
});
