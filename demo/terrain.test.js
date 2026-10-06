import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createTrack } from './track.js';
import { createTerrain, terrainStyle } from './terrain.js';

const track = createTrack(JSON.parse(fs.readFileSync(new URL('route.json', import.meta.url))));
const terrain = createTerrain(track);

test('terrain is continuous, indexed, finite and stays within the polygon budget', () => {
  const geometry = terrain.mesh.geometry;
  assert.ok(geometry.index.count / 3 < 100000);
  assert.ok(geometry.attributes.position.array.every(Number.isFinite));
  geometry.computeBoundingBox();
  const routeBox = new THREE.Box3().setFromPoints(track.points);
  assert.ok(geometry.boundingBox.min.x < routeBox.min.x - terrainStyle.margin + 1);
  assert.ok(geometry.boundingBox.max.z > routeBox.max.z + terrainStyle.margin - 1);
  const usedVertices = [...new Set(geometry.index.array)];
  for (let n = 0; n < usedVertices.length; n += 31) {
    const i = usedVertices[n];
    const p = new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i);
    assert.ok(Math.abs(terrain.heightAt(p.x, p.z) - p.y) < .001);
  }
});

test('nearby ground meets a level road and transitions to the coarse terrain', () => {
  const flat = { points: Array.from({ length: 101 }, (_, i) => new THREE.Vector3(i * 2 - 100, 50, 0)) };
  const ground = createTerrain(flat);
  assert.ok(ground.heightAt(0, 8) > 49.5);
  assert.ok(ground.heightAt(0, 16) > 49.5);
  assert.ok(ground.heightAt(0, 48) < ground.heightAt(0, 16));
  assert.ok(Math.abs(ground.heightAt(0, 80) - ground.coarseHeightAt(0, 80)) < .001);
});

test('ground does not cover the road or either shoulder anywhere along the lap', () => {
  track.points.forEach((p, i) => {
    const before = track.points[Math.max(0, i - 1)], after = track.points[Math.min(track.points.length - 1, i + 1)];
    const normal = new THREE.Vector3(after.z - before.z, 0, before.x - after.x).normalize();
    for (const offset of [-8, 0, 8]) {
      assert.ok(terrain.heightAt(p.x + normal.x * offset, p.z + normal.z * offset) <= p.y - .07);
    }
  });
});
