import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createTrack } from './track.js';
import { createTerrain, terrainColorAt } from './terrain.js';
import { createDistantWoodland, woodlandStyle } from './distant-woodland.js';
import { createRoadClearance } from './road-clearance.js';

const track = createTrack(JSON.parse(fs.readFileSync(new URL('route.json', import.meta.url))));
const terrain = createTerrain(track);
const woodland = createDistantWoodland(track, terrain);

test('far hills darken gradually without changing the roadside palette', () => {
  const near = terrainColorAt(0, 0, 0), edge = terrainColorAt(0, 0, 100);
  const middle = terrainColorAt(0, 0, 300), far = terrainColorAt(0, 0, 700);
  assert.deepEqual(near.toArray(), edge.toArray());
  const brightness = color => color.r + color.g + color.b;
  assert.ok(brightness(near) > brightness(middle));
  assert.ok(brightness(middle) > brightness(far));
  assert.ok(brightness(far) < brightness(near) * .7);
});

test('sparse woodland uses two batches and a bounded triangle budget', () => {
  assert.equal(woodland.children.length, 2);
  const count = woodland.children.reduce((total, mesh) => total + mesh.count, 0);
  assert.ok(count > 300 && count <= woodlandStyle.maxTrees);
  let triangles = 0;
  woodland.children.forEach(mesh => {
    assert.ok(mesh.isInstancedMesh);
    assert.equal(mesh.castShadow, false);
    assert.ok(mesh.geometry.attributes.position.array.every(Number.isFinite));
    triangles += mesh.geometry.attributes.position.count / 3 * mesh.count;
  });
  assert.ok(triangles < 80000);
});

test('distant tree roots follow terrain and leave every road leg clear', () => {
  const nearRoad = createRoadClearance(track.points, 0, woodlandStyle.roadSetback);
  for (const { position, width } of woodland.userData.placements) {
    assert.equal(position.y, terrain.heightAt(position.x, position.z));
    assert.equal(nearRoad(position, width), false);
  }
  const repeated = createDistantWoodland(track, terrain);
  assert.deepEqual(repeated.userData.placements, woodland.userData.placements);
});
