import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { renderStyle, createAtmosphere, addSurfaceGrain } from './rendering.js';

test('fog keeps nearby curbs clear while softening distant scenery', () => {
  const fogAmount = distance => 1 - Math.exp(-((distance * renderStyle.fogDensity) ** 2));
  assert.ok(fogAmount(50) < .02);
  assert.ok(fogAmount(500) > .5);
  assert.ok(fogAmount(1000) > .95);
});

test('mode changes restore the overview and keep the sky around the camera', () => {
  const previousWidth = globalThis.innerWidth;
  globalThis.innerWidth = 390;
  try {
    const renderer = { shadowMap: {}, setClearColor(color) { this.clearColor = color; } };
    const scene = new THREE.Scene();
    const atmosphere = createAtmosphere(renderer, scene);
    atmosphere.setMode(true);
    assert.ok(scene.fog.isFogExp2);
    assert.equal(renderer.shadowMap.enabled, true);
    assert.equal(renderer.toneMapping, THREE.ACESFilmicToneMapping);
    const sun = scene.children.find(object => object.isDirectionalLight);
    assert.equal(sun.shadow.mapSize.x, 1024);
    const camera = new THREE.PerspectiveCamera(); camera.position.set(200, 160, 300);
    atmosphere.update(camera);
    assert.deepEqual(scene.getObjectByName('Atmospheric sky').position, camera.position);
    assert.ok(sun.position.distanceTo(sun.target.position) > 100);
    atmosphere.setMode(true, false);
    assert.equal(scene.fog, null);
    assert.equal(renderer.shadowMap.enabled, true);
    assert.equal(scene.getObjectByName('Atmospheric sky').visible, true);
    atmosphere.setMode(true);
    assert.ok(scene.fog.isFogExp2);
    atmosphere.setMode(false);
    assert.equal(scene.fog, null);
    assert.equal(renderer.shadowMap.enabled, false);
    assert.equal(renderer.toneMapping, THREE.NoToneMapping);
    assert.equal(scene.getObjectByName('Atmospheric sky').visible, false);
  } finally {
    if (previousWidth === undefined) delete globalThis.innerWidth;
    else globalThis.innerWidth = previousWidth;
  }
});

test('surface grain has separate cache keys and preserves standard shading', () => {
  const material = new THREE.MeshStandardMaterial(); addSurfaceGrain(material, 8, .22);
  const shader = {
    vertexShader: '#include <begin_vertex>',
    fragmentShader: '#include <color_fragment>\n#include <fog_fragment>'
  };
  material.onBeforeCompile(shader);
  assert.ok(shader.vertexShader.includes('surfacePosition'));
  assert.ok(shader.fragmentShader.includes('dFdx'));
  assert.ok(shader.fragmentShader.includes('#include <fog_fragment>'));
  const grass = new THREE.MeshStandardMaterial(); addSurfaceGrain(grass, .45, .3);
  assert.notEqual(grass.customProgramCacheKey(), material.customProgramCacheKey());
});
