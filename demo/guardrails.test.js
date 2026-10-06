import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createGuardrail } from './guardrails.js';

const style = JSON.parse(fs.readFileSync(new URL('scenery.json', import.meta.url))).guardrailStyle;
const sample = (distance, offset, height = 0) => new THREE.Vector3(distance, height, offset);

test('global height multiplier raises panels and walls by 40 percent without moving their footprint', () => {
  for (const interval of [
    { start: 0, end: 20, side: 'left', offset: 10 },
    { type: 'wall', height: 2.8, start: 0, end: 20, side: 'right', offset: 10 }
  ]) {
    const before = createGuardrail(sample, interval, style);
    const after = createGuardrail(sample, interval, style, 1.4);
    const a = before.children[0].geometry.attributes.position;
    const b = after.children[0].geometry.attributes.position;
    for (let i = 0; i < a.count; i++) {
      assert.equal(a.getX(i), b.getX(i)); assert.equal(a.getZ(i), b.getZ(i));
      assert.ok(Math.abs(b.getY(i) - a.getY(i) * 1.4) < .000001);
    }
    if (after.children[1]) {
      const posts = after.children[1], matrix = new THREE.Matrix4(), position = new THREE.Vector3();
      posts.getMatrixAt(0, matrix); position.setFromMatrixPosition(matrix);
      assert.ok(Math.abs(position.y - posts.geometry.parameters.height / 2 + .08) < .000001);
    }
  }
});

test('three close-spaced panels cover most of the height above short exposed feet', () => {
  const item = { start: 0, end: 20, side: 'left', offset: 10 };
  const group = createGuardrail(sample, item, style);
  const panel = (style.height - style.railGap * 2) / 3;
  const positions = group.children[0].geometry.attributes.position;
  const perRail = positions.count / 3;
  assert.equal(perRail, 11 * 9);
  for (let rail = 0; rail < 3; rail++) {
    const ys = Array.from({ length: perRail }, (_, i) => positions.getY(rail * perRail + i));
    assert.ok(Math.abs(Math.min(...ys) - style.base - rail * (panel + style.railGap)) < .000001);
    assert.ok(Math.abs(Math.max(...ys) - style.base - rail * (panel + style.railGap) - panel) < .000001);
  }
  assert.ok(style.base < .15);
  assert.ok(style.railGap < .03);
  assert.ok(panel * 3 / (style.base + style.height) > .85);
  assert.equal(group.children.length, 2);
});

test('concrete walls keep their original continuous profile', () => {
  const group = createGuardrail(sample, { type: 'wall', height: 1.4, start: 0, end: 20, side: 'right', offset: 10 }, style);
  const geometry = group.children[0].geometry;
  assert.equal(group.children.length, 1);
  assert.equal(geometry.attributes.position.count, 11 * 5);
  geometry.computeBoundingBox();
  assert.equal(geometry.boundingBox.min.y, 0);
  assert.ok(Math.abs(geometry.boundingBox.max.y - 1.4) < .000001);
});

test('rails follow sloping ground and post feet are embedded rather than floating', () => {
  const ground = (distance, offset, height = 0) => new THREE.Vector3(distance, 20 + distance * .1 + height, offset);
  const group = createGuardrail(ground, { start: 0, end: 20, side: 'left', offset: 10 }, style);
  const positions = group.children[0].geometry.attributes.position;
  for (let i = 0; i < 11; i++) {
    const vertex = i * 9;
    assert.ok(Math.abs(positions.getY(vertex) - 20 - positions.getX(vertex) * .1 - style.base) < .00001);
  }
  const posts = group.children[1], matrix = new THREE.Matrix4();
  const p = new THREE.Vector3(), scale = new THREE.Vector3(), rotation = new THREE.Quaternion();
  const postHeight = posts.geometry.parameters.height;
  for (let i = 0; i < posts.count; i++) {
    posts.getMatrixAt(i, matrix); matrix.decompose(p, rotation, scale);
    assert.ok(Math.abs(p.y - postHeight / 2 - (20 + p.x * .1) + .08) < .00001);
  }
});
