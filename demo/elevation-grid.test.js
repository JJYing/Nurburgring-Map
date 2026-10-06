import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import { createElevationGrid } from './elevation-grid.js';
import { createTerrain } from './terrain.js';
import { createTrack } from './track.js';

const metadata = JSON.parse(fs.readFileSync(new URL('assets/terrain-cop30.json', import.meta.url)));
const bytes = fs.readFileSync(new URL('assets/terrain-cop30.bin', import.meta.url));
const grid = createElevationGrid(metadata, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const track = createTrack(JSON.parse(fs.readFileSync(new URL('route.json', import.meta.url))));
const terrain = createTerrain(track, grid);

test('offline elevation data has verified coverage, checksum and plausible local heights', () => {
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), metadata.sha256);
  assert.ok(metadata.projection.maxResidualM < .01);
  assert.ok(metadata.elevationRangeM[0] > 150 && metadata.elevationRangeM[1] < 800);
  track.points.forEach(p => assert.ok(Number.isFinite(grid.heightAt(p.x, p.z))));
  assert.throws(() => grid.heightAt(metadata.minX - 1, metadata.minZ));
  assert.throws(() => createElevationGrid(metadata, new ArrayBuffer(2)));
});

test('real terrain covers distant hills without exceeding the mesh budget or road height', () => {
  const geometry = terrain.mesh.geometry;
  assert.ok(geometry.index.count / 3 < 200000);
  geometry.computeBoundingBox();
  const roadBox = new THREE.Box3().setFromPoints(track.points);
  assert.ok(geometry.boundingBox.min.x < roadBox.min.x - 8900);
  assert.ok(geometry.boundingBox.max.z > roadBox.max.z + 8900);
  for (let i = 0; i < track.points.length; i += 3) {
    const p = track.points[i], before = track.points[Math.max(0, i - 1)], after = track.points[Math.min(track.points.length - 1, i + 1)];
    const normal = new THREE.Vector3(after.z - before.z, 0, before.x - after.x).normalize();
    for (const offset of [-8, 0, 8]) assert.ok(terrain.heightAt(p.x + normal.x * offset, p.z + normal.z * offset) <= p.y - .07);
  }
  const x = roadBox.min.x - 6000, z = roadBox.min.z - 6000;
  assert.ok(Math.abs(terrain.heightAt(x, z) - grid.heightAt(x, z)) < 15);
});

test('DEM detail tiles do not introduce periodic depressions on a flat hillside', () => {
  const points = Array.from({ length: 161 }, (_, i) => new THREE.Vector3(i * 10 - 800, 50, 0));
  const flat = createTerrain({ points }, { heightAt: () => 100 });
  for (const z of [64, 96, 128, 160, 240]) {
    const reference = flat.heightAt(0, z);
    for (let x = -480; x <= 480; x += 8) {
      assert.ok(Math.abs(flat.heightAt(x, z) - reference) < .1, `tile depression at ${x},${z}`);
    }
  }
  const positions = flat.mesh.geometry.getAttribute('position');
  const normals = flat.mesh.geometry.getAttribute('normal');
  const shared = new Map();
  for (let i = 0; i < positions.count; i++) {
    const key = `${positions.getX(i)},${positions.getZ(i)}`;
    const previous = shared.get(key);
    const current = [normals.getX(i), normals.getY(i), normals.getZ(i)];
    if (previous) assert.deepEqual(current, previous);
    shared.set(key, current);
  }
  flat.mesh.geometry.dispose();
  flat.mesh.material.dispose();
});
