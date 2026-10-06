import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { moveFreeCamera } from './free-camera.js';

test('free camera translates position and orbit target together without rotating', () => {
  const camera = new THREE.PerspectiveCamera();
  const controls = { target: new THREE.Vector3(0, 0, -10) };
  const rotation = camera.quaternion.clone();
  moveFreeCamera(camera, controls, new Set(['KeyW']), 1);
  assert.equal(camera.position.z, -35);
  assert.equal(controls.target.z, -45);
  assert.ok(camera.quaternion.equals(rotation));
});
test('diagonals are normalized and Shift boosts movement', () => {
  const camera = new THREE.PerspectiveCamera(), controls = { target: new THREE.Vector3() };
  moveFreeCamera(camera, controls, new Set(['KeyW', 'KeyD', 'KeyE', 'ShiftLeft']), .5);
  assert.ok(Math.abs(camera.position.length() - 70) < 1e-6);
  assert.ok(camera.position.x > 0 && camera.position.y > 0 && camera.position.z < 0);
});
test('opposite keys cancel and empty input is stationary', () => {
  const camera = new THREE.PerspectiveCamera(), controls = { target: new THREE.Vector3() };
  moveFreeCamera(camera, controls, new Set(['KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyQ', 'KeyE']), 1);
  assert.equal(camera.position.length(), 0);
  moveFreeCamera(camera, controls, new Set(), 1);
  assert.equal(controls.target.length(), 0);
});
