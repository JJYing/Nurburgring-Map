import * as THREE from 'three';
import { createGuardrail } from './guardrails.js?v=taller-barriers';
import { createRoadClearance } from './road-clearance.js';
import { createTreeSprites, treeSpriteWidths } from './tree-sprites.js?v=clean-alpha';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export function createScenery(track, data, terrain = null, treeTexture = null) {
  const root = new THREE.Group(), trees = new THREE.Group();
  root.add(trees);
  const random = seed => { const n = Math.sin(seed * 12.9898) * 43758.5453; return n - Math.floor(n); };
  function sample(distance, offset = 0, height = 0) {
    const p = track.at(distance).position;
    const a = track.at(Math.max(0, distance - 2)).position;
    const b = track.at(Math.min(track.length, distance + 2)).position;
    const normal = new THREE.Vector3(b.z - a.z, 0, a.x - b.x).normalize();
    return p.addScaledVector(normal, offset).add(new THREE.Vector3(0, height, 0));
  }
  function groundSample(distance, offset = 0, height = 0) {
    const position = sample(distance, offset);
    if (terrain) position.y = (terrain.surfaceHeightAt ?? terrain.heightAt)(position.x, position.z);
    position.y += height;
    return position;
  }
  const overlapsRoad = createRoadClearance(track.points);
  const placements = [];
  for (let d = 0; d < track.length; d += 10) {
    const profile = data.profiles.find(p => d >= p.start && d < p.end);
    for (const [side, sign] of [['left', 1], ['right', -1]]) {
      const settings = profile?.[side] ?? { spacing: 50, setback: 28, height: 13 };
      for (let row = 0; row < (profile ? 3 : 1); row++) {
        const seed = d + sign * 71 + row * 139;
        if (random(seed) > 10 / settings.spacing) continue;
        const distance = THREE.MathUtils.clamp(d + random(seed + 3) * 8, 0, track.length);
        const offset = sign * (settings.setback + row * 13 + random(seed + 5) * 7);
        const position = sample(distance, offset, -.5);
        if (terrain) position.y = terrain.heightAt(position.x, position.z);
        const variety = random(seed + 9);
        const kind = variety < .23 ? 'spruce' : variety < .4 ? 'pine' : variety < .62 ? 'oak'
          : variety < .8 ? 'beech' : variety < .94 ? 'birch' : 'shrub';
        const height = settings.height * (.68 + random(seed + 7) * .65) * (kind === 'shrub' ? .25 : 1);
        const width = .8 + random(seed + 13) * .45;
        const solidRadius = Math.max(.55, height * (kind === 'birch' ? .16 : .25) * width * 1.5);
        const radius = treeTexture ? Math.max(solidRadius, height * treeSpriteWidths[kind] * width / 2) : solidRadius;
        if (overlapsRoad(position, radius)) continue;
        placements.push({ position, height, kind, tone: random(seed + 11), width });
      }
    }
  }
  const sprites = treeTexture ? createTreeSprites(placements, treeTexture) : null;
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.3, .55, 1, 5), new THREE.MeshStandardMaterial({ color: 0xffffff }), placements.length);
  function crownGeometry(parts) {
    const crowns = parts.map(([x, y, z, radius]) =>
      new THREE.IcosahedronGeometry(radius, 1).translate(x, y, z));
    const leafGeometry = mergeGeometries(crowns);
    crowns.forEach(geometry => geometry.dispose());
    const leafPositions = leafGeometry.attributes.position;
    const leafColors = [];
    for (let i = 0; i < leafPositions.count; i++) {
      const x = leafPositions.getX(i), y = leafPositions.getY(i), z = leafPositions.getZ(i);
      const radius = 1 + .08 * Math.sin(x * 9 + y * 7) * Math.cos(z * 8);
      leafPositions.setXYZ(i, x * radius, y * radius, z * radius);
      const shade = .65 + .35 * (y + 1) / 2;
      leafColors.push(shade, shade, shade);
    }
    leafGeometry.setAttribute('color', new THREE.Float32BufferAttribute(leafColors, 3));
    const smoothLeafGeometry = mergeVertices(leafGeometry);
    smoothLeafGeometry.computeVertexNormals();
    leafGeometry.dispose();
    return smoothLeafGeometry;
  }
  const tiers = [[1, .55, -.225], [.78, .5, 0], [.52, .5, .25]]
    .map(([radius, height, y]) => new THREE.ConeGeometry(radius, height, 12).translate(0, y, 0));
  const pineGeometry = mergeGeometries(tiers);
  tiers.forEach(geometry => geometry.dispose());
  const shapes = {
    spruce: pineGeometry,
    pine: mergeGeometries([new THREE.ConeGeometry(.85, .7, 9).translate(0, .15, 0), new THREE.ConeGeometry(1, .55, 9).translate(0, -.2, 0)]),
    oak: crownGeometry([[-.4, -.1, 0, .65], [.38, -.05, .15, .7], [0, .4, -.15, .6]]),
    beech: crownGeometry([[0, 0, 0, 1]]),
    birch: crownGeometry([[0, -.35, 0, .65], [.1, .25, 0, .75]]),
    shrub: crownGeometry([[-.35, -.15, 0, .65], [.35, -.12, .1, .65], [0, .25, 0, .55]])
  };
  const dummy = new THREE.Object3D();
  placements.forEach((p, i) => {
    dummy.position.copy(p.position).add(new THREE.Vector3(0, p.height * .25, 0));
    dummy.scale.set(1, p.height * .5, 1);
    dummy.updateMatrix(); trunk.setMatrixAt(i, dummy.matrix);
    trunk.setColorAt(i, new THREE.Color(p.kind === 'birch' ? 0xd7d7c9 : p.kind === 'pine' ? 0x695c49 : 0x626454));
  });
  trees.add(trunk);
  for (const [kind, geometry] of Object.entries(shapes)) {
    const entries = placements.filter(p => p.kind === kind);
    const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({
      color: 0xffffff, vertexColors: !!geometry.attributes.color, roughness: 1
    }), entries.length);
    mesh.name = `Vegetation ${kind}`;
    entries.forEach((p, i) => {
      dummy.position.copy(p.position).add(new THREE.Vector3(0, p.height * .65, 0));
      const conifer = kind === 'pine' || kind === 'spruce';
      const width = p.height * (kind === 'birch' ? .16 : .25) * p.width;
      dummy.scale.set(width, p.height * (conifer ? .75 : .35), width);
      dummy.rotation.y = p.tone * Math.PI * 2;
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, new THREE.Color().setHSL((conifer ? .3 : .24) + p.tone * .05,
        .2 + p.tone * .12, (kind === 'birch' ? .29 : .18) + p.tone * .12));
    });
    trees.add(mesh);
  }
  const solidTrees = trees.children.slice();
  if (sprites) trees.add(sprites);
  function setTreeStyle(style) {
    const useSprites = style === 'sprite' && !!sprites;
    if (sprites) sprites.visible = useSprites;
    solidTrees.forEach(mesh => { mesh.visible = !useSprites; });
  }
  setTreeStyle(sprites ? 'sprite' : 'solid');
  for (const surface of data.surfaces ?? []) {
    const sign = surface.side === 'left' ? 1 : -1, vertices = [], indices = [];
    const divisions = Math.ceil((surface.end - surface.start) / 2);
    const roadSurface = surface.outer <= 6;
    const height = roadSurface ? .045 : -.35;
    for (let i = 0; i <= divisions; i++) {
      const distance = THREE.MathUtils.lerp(surface.start, surface.end, i / divisions);
      for (const offset of [surface.inner, surface.outer]) {
        const p = sample(distance, sign * offset, height);
        vertices.push(p.x, p.y, p.z);
      }
      if (i < divisions) {
        const n = i * 2;
        indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color: surface.color, roughness: 1, side: THREE.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1
    }));
    mesh.name = surface.name; root.add(mesh);
    if (surface.seams) {
      const seams = [];
      for (let d = surface.start; d <= surface.end; d += surface.seams) {
        for (const offset of [surface.inner, surface.outer]) {
          const p = sample(d, sign * offset, height + .006);
          seams.push(p.x, p.y, p.z);
        }
      }
      const lines = new THREE.BufferGeometry();
      lines.setAttribute('position', new THREE.Float32BufferAttribute(seams, 3));
      root.add(new THREE.LineSegments(lines, new THREE.LineBasicMaterial({ color: 0x7e837f })));
    }
  }
  const barrierHeightScale = data.barrierHeightScale ?? 1;
  for (const barrier of data.barriers) {
    root.add(createGuardrail(groundSample, barrier, data.guardrailStyle, barrierHeightScale));
  }
  for (const fence of data.fences) {
    const sign = fence.side === 'left' ? 1 : -1, vertices = [];
    for (let d = fence.start; d < fence.end; d += 8) {
      const a = groundSample(d, sign * fence.offset), b = groundSample(Math.min(d + 8, fence.end), sign * fence.offset);
      for (const height of [1.5, 2.2, 3, 3.5]) vertices.push(a.x, a.y + height * barrierHeightScale, a.z, b.x, b.y + height * barrierHeightScale, b.z);
      vertices.push(a.x, a.y, a.z, a.x, a.y + 3.5 * barrierHeightScale, a.z);
      for (let h = 1.5; h < 3.5; h += .5) vertices.push(a.x, a.y + h * barrierHeightScale, a.z, b.x, b.y + (h + .5) * barrierHeightScale, b.z);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    root.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0x7f9189, transparent: true, opacity: .55 })));
  }
  const concrete = new THREE.MeshStandardMaterial({ color: 0xb9bbb5, roughness: 1 });
  for (const bridge of data.bridges) {
    const structure = new THREE.Group(); structure.name = bridge.name;
    structure.position.copy(sample(bridge.distance));
    const tangent = sample(bridge.distance + 5).sub(sample(bridge.distance - 5));
    structure.rotation.y = Math.atan2(tangent.x, tangent.z);
    for (const x of [-11, 11]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 4), concrete);
      pillar.position.set(x, 3, 0); structure.add(pillar);
    }
    const deck = new THREE.Mesh(new THREE.BoxGeometry(24, 1.2, 4), concrete);
    deck.position.y = 6.6; structure.add(deck); root.add(structure);
  }
  for (const gantry of data.gantries ?? []) {
    const structure = new THREE.Group(); structure.name = gantry.name;
    structure.position.copy(sample(gantry.distance));
    const tangent = sample(gantry.distance + 5).sub(sample(gantry.distance - 5));
    structure.rotation.y = Math.atan2(tangent.x, tangent.z);
    for (const x of [-11, 11]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(.35, 7, .35), concrete);
      post.position.set(x, 3.5, 0); structure.add(post);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(22, .9, .5), concrete);
    beam.position.y = 7; structure.add(beam); root.add(structure);
  }
  const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0xb8c1bf, roughness: .9 });
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x51686b, roughness: .45 });
  for (const building of data.buildings ?? []) {
    const structure = new THREE.Group(); structure.name = building.name;
    structure.position.copy(sample(building.distance, (building.side === 'left' ? 1 : -1) * building.offset));
    const tangent = sample(building.distance + 5).sub(sample(building.distance - 5));
    structure.rotation.y = Math.atan2(tangent.x, tangent.z);
    const body = new THREE.Mesh(new THREE.BoxGeometry(building.width, building.height, building.depth), buildingMaterial);
    body.position.y = building.height / 2; structure.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(building.width + .6, .3, building.depth + .6), windowMaterial);
    roof.position.y = building.height; structure.add(roof);
    for (const side of [-1, 1]) {
      const windows = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.2, building.depth * .8), windowMaterial);
      windows.position.set(side * (building.width / 2 + .03), building.height * .65, 0);
      structure.add(windows);
    }
    root.add(structure);
  }
  return { root, trees, setTreeStyle };
}
