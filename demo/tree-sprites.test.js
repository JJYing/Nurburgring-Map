import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createTrack } from './track.js';
import { createScenery } from './scenery.js';
import { createRoadClearance } from './road-clearance.js';
import { createTreeSprites, treeSpriteKinds } from './tree-sprites.js';

test('six tree variants use two crossed cutout planes and isolated atlas UVs', () => {
  const texture = new THREE.Texture();
  const trees = createTreeSprites(treeSpriteKinds.map(kind => ({ kind, position: new THREE.Vector3(), height: 10, width: 1, tone: .5 })), texture);
  assert.equal(trees.children.length, 6);
  trees.children.forEach((mesh, slot) => {
    assert.equal(mesh.geometry.index.count / 3, 4);
    assert.equal(mesh.count, 1);
    assert.equal(mesh.material.map, texture);
    assert.equal(mesh.material.transparent, false);
    assert.equal(mesh.material.alphaToCoverage, false);
    assert.equal(mesh.material.alphaTest, .4);
    assert.equal(mesh.material.depthWrite, true);
    assert.equal(mesh.material.fog, true);
    assert.ok(mesh.material.alphaTest > 0);
    const uv = mesh.geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      assert.equal(Math.floor(uv.getX(i) * 3), slot % 3);
      assert.equal(Math.floor(uv.getY(i) * 2), 1 - Math.floor(slot / 3));
    }
  });
});

test('sprite footprints avoid every road and the planes start at ground level', () => {
  const track = createTrack(JSON.parse(fs.readFileSync(new URL('route.json', import.meta.url))));
  const data = JSON.parse(fs.readFileSync(new URL('scenery.json', import.meta.url)));
  const { trees, setTreeStyle } = createScenery(track, data, { heightAt: () => 42 }, new THREE.Texture());
  const sprites = trees.children.at(-1);
  assert.equal(sprites.visible, true);
  assert.ok(trees.children.slice(0, -1).every(mesh => !mesh.visible));
  const overlaps = createRoadClearance(track.points);
  const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), scale = new THREE.Vector3(), rotation = new THREE.Quaternion();
  for (const mesh of sprites.children) for (let i = 0; i < mesh.count; i++) {
    mesh.getMatrixAt(i, matrix); matrix.decompose(position, rotation, scale);
    assert.equal(position.y, 42);
    assert.equal(overlaps(position, scale.x / 2 - .00001), false);
  }
  setTreeStyle('solid');
  assert.equal(sprites.visible, false);
  assert.ok(trees.children.slice(0, -1).every(mesh => mesh.visible));
  setTreeStyle('sprite');
  assert.equal(sprites.visible, true);
});
