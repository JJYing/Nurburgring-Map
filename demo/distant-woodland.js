import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createRoadClearance } from './road-clearance.js';

export const woodlandStyle = { spacing: 110, margin: 3200, roadSetback: 110, maxTrees: 2400 };

export function createDistantWoodland(track, terrain) {
  const root = new THREE.Group();
  root.name = 'Sparse distant woodland';
  const roadBox = new THREE.Box3().setFromPoints(track.points);
  terrain.mesh.geometry.computeBoundingBox();
  const bounds = terrain.mesh.geometry.boundingBox;
  const { spacing, margin, roadSetback, maxTrees } = woodlandStyle;
  const minX = Math.max(bounds.min.x + 40, roadBox.min.x - margin);
  const maxX = Math.min(bounds.max.x - 40, roadBox.max.x + margin);
  const minZ = Math.max(bounds.min.z + 40, roadBox.min.z - margin);
  const maxZ = Math.min(bounds.max.z - 40, roadBox.max.z + margin);
  const nearRoad = createRoadClearance(track.points, 0, roadSetback);
  const roadSamples = track.points.filter((_, i) => i % 50 === 0);
  const random = seed => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const placements = [[], []];
  for (let z = minZ; z <= maxZ; z += spacing) {
    for (let x = minX; x <= maxX; x += spacing) {
      const seed = Math.floor(x) * 17 + Math.floor(z) * 31;
      const patch = .5 + .5 * Math.sin(x / 510 + 1) * Math.cos(z / 680);
      if (random(seed) > .2 + patch * .32) continue;
      const cluster = 1 + Math.floor(random(seed + 1) * 3);
      for (let i = 0; i < cluster; i++) {
        const s = seed + i * 19;
        const px = x + (random(s + 2) - .5) * 75;
        const pz = z + (random(s + 3) - .5) * 75;
        if (px < minX || px > maxX || pz < minZ || pz > maxZ) continue;
        const height = 8 + random(s + 4) * 10, width = 3 + random(s + 5) * 3;
        const position = new THREE.Vector3(px, 0, pz);
        if (nearRoad(position, width)) continue;
        position.y = terrain.heightAt(px, pz);
        let distance = Infinity;
        for (const p of roadSamples) distance = Math.min(distance, Math.hypot(px - p.x, pz - p.z));
        const priority = random(s + 123) * (1 + distance / 500);
        placements[random(s + 6) < .45 ? 0 : 1].push({ position, height, width, seed: s, priority });
      }
    }
  }
  // Apply the budget across the whole region, not just the first rows of the grid.
  const selected = placements.flat().sort((a, b) => a.priority - b.priority).slice(0, maxTrees);
  placements[0] = []; placements[1] = [];
  selected.forEach(item => placements[random(item.seed + 6) < .45 ? 0 : 1].push(item));
  placements.forEach((items, type) => {
    const trunk = new THREE.CylinderGeometry(.055, .08, .35, 4, 1, true);
    trunk.translate(0, .175, 0);
    const crown = type === 0 ? new THREE.ConeGeometry(1, .65, 5, 1, true)
      : new THREE.IcosahedronGeometry(1, 0);
    if (type === 1) crown.scale(1, .4, 1);
    crown.translate(0, type === 0 ? .475 : .6, 0);
    const shapes = [trunk, crown];
    if (type === 0) {
      const top = new THREE.ConeGeometry(.65, .55, 5, 1, true);
      top.translate(0, .725, 0); shapes.push(top);
    }
    const parts = shapes.map(part => part.index ? part.toNonIndexed() : part);
    const geometry = mergeGeometries(parts);
    [...new Set([...shapes, ...parts])].forEach(part => part.dispose());
    const mesh = new THREE.InstancedMesh(geometry,
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true }), items.length);
    mesh.name = type === 0 ? 'Distant conifers' : 'Distant broadleaf';
    const dummy = new THREE.Object3D(), color = new THREE.Color();
    items.forEach(({ position, height, width, seed }, i) => {
      dummy.position.copy(position); dummy.rotation.y = random(seed + 7) * Math.PI * 2;
      dummy.scale.set(width, height, width); dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.setHSL(.28 + random(seed + 8) * .045, .23 + random(seed + 9) * .12, .09 + random(seed + 10) * .04);
      mesh.setColorAt(i, color);
    });
    mesh.computeBoundingSphere();
    root.add(mesh);
  });
  root.userData.placements = placements.flat();
  return root;
}
