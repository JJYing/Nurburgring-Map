import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createTrack } from './track.js';
import { createTerrain } from './terrain.js';
import { createRoadBanks } from './road-banks.js';

test('short road banks meet the shoulder and curve down to the ground on both sides', () => {
  const track = { points: Array.from({ length: 11 }, (_, i) => new THREE.Vector3(i * 2, 50, 0)) };
  const mesh = createRoadBanks(track, { heightAt: () => 48 });
  const positions = mesh.geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 3) {
    assert.ok(Math.abs(positions.getY(i) - 50.015) < .001);
    assert.ok(positions.getY(i + 1) < 50.015 && positions.getY(i + 1) > 48);
    assert.equal(positions.getY(i + 2), 48);
  }
  assert.ok(positions.array.every(Number.isFinite));
  assert.ok(Math.abs(mesh.userData.heightAt(10, 8) - 50) < .1);
  assert.equal(mesh.userData.heightAt(10, 20), -Infinity);
});

test('full-lap banks remain outside the road and within a modest polygon budget', () => {
  const track = createTrack(JSON.parse(fs.readFileSync(new URL('route.json', import.meta.url))));
  const mesh = createRoadBanks(track, createTerrain(track));
  assert.ok(mesh.geometry.index.count / 3 < 45000);
  mesh.updateMatrixWorld();
  const ray = new THREE.Raycaster();
  for (let i = 0; i < track.points.length; i += 4) {
    const p = track.points[i];
    ray.set(p.clone().add(new THREE.Vector3(0, 100, 0)), new THREE.Vector3(0, -1, 0));
    assert.equal(ray.intersectObject(mesh).filter(hit => hit.point.y >= p.y).length, 0, `road sample ${i}`);
  }
});
