import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTrack } from './track.js?v=elevation-smooth';
import { createSpeedProfile } from './speed.js';
import { createAnnotations } from './annotations.js?v=main-ui';
import { createCurbs } from './curbs.js';
import { createScenery } from './scenery.js?v=taller-barriers';
import { createAtmosphere, addSurfaceGrain } from './rendering.js?v=woodland-tone';
import { createTerrain } from './terrain.js?v=darker-hills';
import { createElevationGrid } from './elevation-grid.js';
import { createRoadBanks } from './road-banks.js?v=ground-sampling';
import { createFreeCamera } from './free-camera.js';
import { createRacingLine } from './racing-line.js?v=camera-only';
import { createDistantWoodland } from './distant-woodland.js?v=tiered-hills';

const $ = selector => document.querySelector(selector);
const loading = $('#loading');
lucide.createIcons();

try {
  const response = await fetch('./route.json');
  if (!response.ok) throw new Error('赛道数据加载失败');
  const route = await response.json();
  const cornerResponse = await fetch('./corners.json');
  if (!cornerResponse.ok) throw new Error('弯道数据加载失败');
  const curbResponse = await fetch('./curbs.json');
  if (!curbResponse.ok) throw new Error('路肩数据加载失败');
  const sceneryResponse = await fetch('./scenery.json?v=taller-barriers');
  if (!sceneryResponse.ok) throw new Error('环境数据加载失败');
  let treeTexture = null;
  try {
    treeTexture = await new THREE.TextureLoader().loadAsync('./assets/trees-summer-atlas-v1.png');
  } catch (error) {
    console.warn('Tree atlas unavailable; using procedural trees.', error);
  }
  let elevation = null;
  try {
    const metadata = await fetch('./assets/terrain-cop30.json');
    const data = await fetch('./assets/terrain-cop30.bin');
    if (!metadata.ok || !data.ok) throw new Error('Elevation data unavailable');
    elevation = createElevationGrid(await metadata.json(), await data.arrayBuffer());
  } catch (error) {
    console.warn('DEM unavailable; using approximate terrain.', error);
  }
  $('#terrain-credit').hidden = !elevation;
  start(route, await cornerResponse.json(), await curbResponse.json(), await sceneryResponse.json(), treeTexture, elevation);
  loading.hidden = true;
} catch (error) {
  loading.textContent = '无法加载场景，请刷新后重试。';
  console.error(error);
}

function start(route, corners, curbData, sceneryData, treeTexture, elevation) {
  const track = createTrack(route);
  const { length, points, at } = track;
  const pace = createSpeedProfile(track);
  const racingLine = createRacingLine(track);
  const box = new THREE.Box3().setFromPoints(points);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const extent = Math.max(size.x, size.z);
  const mapScale = Math.min(196 / size.x, 156 / size.z);
  const mapPoint = position => ({ x: 120 + (position.x - center.x) * mapScale, y: 100 + (position.z - center.z) * mapScale });
  const mapPath = points.filter((_, i) => i % 5 === 0 || i === points.length - 1).map((point, i) => {
    const projected = mapPoint(point);
    return `${i === 0 ? 'M' : 'L'}${projected.x.toFixed(2)} ${projected.y.toFixed(2)}`;
  }).join(' ') + ' Z';
  $('#minimap-route').setAttribute('d', mapPath);
  $('#minimap-travelled').setAttribute('d', mapPath);
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xe7eeea);
  $('#scene').append(renderer.domElement);
  const scene = new THREE.Scene();
  const atmosphere = createAtmosphere(renderer, scene);
  const perspective = new THREE.PerspectiveCamera(48, 1, .3, 35000);
  const orbit = new OrbitControls(perspective, renderer.domElement);
  orbit.enableDamping = true;
  orbit.enableZoom = false;
  orbit.minDistance = 40;
  orbit.maxDistance = extent * 4;
  orbit.maxPolarAngle = Math.PI * .48;
  const world = new THREE.Group();
  scene.add(world);

  function sideways(i) {
    const last = points.length - 1;
    const before = points[(i - 1 + last) % last], after = points[(i + 1) % last];
    return new THREE.Vector3(after.z - before.z, 0, before.x - after.x).normalize();
  }
  function ribbon(width, offset, color, roughness = 1) {
    const vertices = [], indices = [];
    points.forEach((p, i) => {
      const normal = sideways(i).multiplyScalar(width / 2);
      vertices.push(p.x + normal.x, p.y + offset, p.z + normal.z, p.x - normal.x, p.y + offset, p.z - normal.z);
      if (i < points.length - 1) { const n = i * 2; indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3); }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness, side: THREE.DoubleSide }));
    mesh.receiveShadow = true;
    world.add(mesh);
    return mesh;
  }
  const terrain = createTerrain(track, elevation);
  addSurfaceGrain(terrain.mesh.material, .45, .3, .25);
  const banks = createRoadBanks(track, terrain);
  addSurfaceGrain(banks.material, .45, .3);
  terrain.mesh.add(banks);
  terrain.surfaceHeightAt = (x, z) => Math.max(terrain.heightAt(x, z), banks.userData.heightAt(x, z));
  world.add(terrain.mesh);
  ribbon(16, .02, 0x737e72);
  const asphalt = ribbon(12, .03, 0x343b3c, .93);
  addSurfaceGrain(asphalt.material, 8, .22);
  const curbs = createCurbs(track, curbData);
  world.add(curbs);
  const overviewLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p => p.clone().add(new THREE.Vector3(0, 1, 0)))), new THREE.LineBasicMaterial({ color: 0x343f39, depthTest: false }));
  overviewLine.renderOrder = 2;
  world.add(overviewLine);
  const travelledLine = new THREE.Line(overviewLine.geometry.clone(), new THREE.LineBasicMaterial({ color: 0xdf423c, depthTest: false }));
  travelledLine.renderOrder = 4;
  world.add(travelledLine);
  const { root: scenery, trees, setTreeStyle } = createScenery(track, sceneryData, terrain, treeTexture);
  if (!treeTexture) { $('#tree-style').value = 'solid'; $('#tree-style').disabled = true; }
  world.add(scenery);
  scenery.traverse(object => {
    if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; }
  });
  trees.add(createDistantWoodland(track, terrain));
  curbs.traverse(object => { if (object.isMesh) object.receiveShadow = true; });
  const marker = new THREE.Mesh(new THREE.SphereGeometry(16, 16, 12), new THREE.MeshBasicMaterial({ color: 0xdf423c }));
  world.add(marker);
  const startMarker = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 50, 12), new THREE.MeshBasicMaterial({ color: 0xf4c758 }));
  startMarker.position.copy(points[0]).add(new THREE.Vector3(0, 25, 0));
  world.add(startMarker);
  const horizon = new THREE.Mesh(new THREE.PlaneGeometry(30000, 30000), new THREE.MeshBasicMaterial({ color: 0xe7eeea }));
  horizon.rotation.x = -Math.PI / 2;
  horizon.position.set(center.x, -30, center.z);
  scene.add(horizon);
  const grid = new THREE.GridHelper(extent * 2, 24, 0x98aaa0, 0xbdcbc1);
  grid.position.set(center.x, -29, center.z);
  grid.material.transparent = true;
  grid.material.opacity = .65;
  scene.add(grid);
  let mode = 'orbit', progress = 0, playing = false, playbackRate = 1, treeVisible = true;
  let racingEnabled = false, racingBlend = 0;
  const freeCamera = createFreeCamera(perspective, orbit, () => mode === 'free');
  let scrollTarget = null;
  let showLabels = true;
  const annotations = createAnnotations(corners, track, scene, perspective, setProgress);

  function setProgress(value) {
    progress = value;
    scrollTarget = null;
    if (mode === 'free') resetFreeView();
  }

  function resetFreeView() {
    freeCamera.reset();
    const damping = orbit.enableDamping;
    orbit.enableDamping = false; orbit.update(); orbit.enableDamping = damping;
    const position = at(progress * length).position;
    const ahead = at((progress * length + 25) % length).position;
    const forward = ahead.clone().sub(position).normalize();
    orbit.target.copy(position).add(new THREE.Vector3(0, 2, 0));
    perspective.position.copy(position).addScaledVector(forward, -45).add(new THREE.Vector3(0, 28, 0));
    perspective.up.set(0, 1, 0); perspective.lookAt(orbit.target); orbit.update();
  }

  function resetView() {
    orbit.target.copy(center);
    perspective.up.set(0, 1, 0);
    const radius = size.length() / 2;
    const fit = radius / Math.sin(THREE.MathUtils.degToRad(perspective.fov / 2)) / Math.min(perspective.aspect, 1) * .88;
    perspective.position.copy(center).add(new THREE.Vector3(.15, 1, .85).normalize().multiplyScalar(fit));
    perspective.lookAt(center);
    orbit.update();
  }
  function resize() {
    const width = innerWidth, height = innerHeight;
    renderer.setSize(width, height);
    perspective.aspect = width / height;
    perspective.updateProjectionMatrix();
    if (mode === 'orbit') resetView();
  }
  function setMode(next) {
    scrollTarget = null;
    freeCamera.reset();
    mode = next;
    const detailed = mode !== 'orbit';
    document.body.classList.toggle('first-person', detailed);
    document.body.classList.toggle('freeform', mode === 'free');
    $('#minimap').hidden = mode !== 'first';
    orbit.enabled = mode !== 'first';
    orbit.enableZoom = mode === 'free';
    orbit.enablePan = mode === 'free';
    orbit.minDistance = mode === 'free' ? 1 : 40;
    orbit.maxDistance = extent * (mode === 'free' ? 8 : 4);
    orbit.maxPolarAngle = mode === 'free' ? Math.PI : Math.PI * .48;
    trees.visible = detailed && treeVisible;
    scenery.visible = detailed;
    terrain.mesh.visible = detailed;
    curbs.visible = detailed;
    $('#trees').hidden = !detailed;
    $('#tree-style-control').hidden = !detailed;
    marker.visible = !detailed; startMarker.visible = !detailed;
    overviewLine.visible = !detailed;
    travelledLine.visible = !detailed;
    perspective.near = detailed ? .1 : 10;
    perspective.updateProjectionMatrix();
    grid.visible = mode === 'orbit';
    horizon.visible = mode === 'orbit';
    atmosphere.setMode(detailed, mode === 'first');
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    if (mode === 'orbit') resetView();
    if (mode === 'free') { setPlaying(false); resetFreeView(); }
    $('#play').disabled = mode === 'free';
    $('#speed').disabled = mode === 'free';
  }
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  $('#reset').addEventListener('click', () => {
    if (mode === 'first') setProgress(0);
    else if (mode === 'free') resetFreeView();
    else resetView();
  });
  $('#progress').addEventListener('input', event => { setProgress(Number(event.target.value) / 10000); });
  $('#speed').addEventListener('input', event => { playbackRate = Number(event.target.value); $('#speed-value').textContent = `${playbackRate.toFixed(2).replace(/\.?0+$/, '')}×`; });
  function setPlaying(value) {
    playing = value;
    if (playing) scrollTarget = null;
    $('#play').setAttribute('aria-label', playing ? '暂停' : '播放');
    $('#play').title = playing ? '暂停' : '播放';
    $('#play').innerHTML = `<i data-lucide="${playing ? 'pause' : 'play'}"></i>`;
    lucide.createIcons();
  }
  $('#play').addEventListener('click', () => setPlaying(!playing));
  document.addEventListener('wheel', event => {
    if (mode === 'free' || event.ctrlKey || !(event.target instanceof Element) || !event.target.closest('#scene, #corner-labels')) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (playing) setPlaying(false);
    if (document.activeElement === $('#progress')) $('#progress').blur();
    if (mode === 'first') {
      scrollTarget = THREE.MathUtils.clamp((scrollTarget ?? progress) + delta / 90000, 0, 1);
    } else setProgress(THREE.MathUtils.clamp(progress + delta / 18000, 0, 1));
  }, { passive: false });
  $('#trees').addEventListener('click', () => { treeVisible = !treeVisible; trees.visible = mode !== 'orbit' && treeVisible; $('#trees').setAttribute('aria-pressed', String(treeVisible)); });
  $('#tree-style').addEventListener('change', event => setTreeStyle(event.target.value));
  $('#labels').addEventListener('click', () => { showLabels = !showLabels; $('#labels').setAttribute('aria-pressed', String(showLabels)); });
  $('#racing-line').addEventListener('click', () => {
    racingEnabled = !racingEnabled;
    $('#racing-line').setAttribute('aria-pressed', String(racingEnabled));
  });
  addEventListener('resize', resize);
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); loading.hidden = false; loading.textContent = '图形场景已中断，请刷新页面。'; });
  resize(); resetView(); setMode('orbit');
  let previous = performance.now();
  renderer.setAnimationLoop(now => {
    const delta = Math.min((now - previous) / 1000, .1); previous = now;
    if (playing) {
      const elapsed = delta * playbackRate;
      const midpoint = progress * length + pace.at(progress * length) * elapsed / 2;
      progress = (progress + elapsed * pace.at(midpoint) / length) % 1;
    } else if (scrollTarget !== null) {
      // Frame-rate-independent easing keeps the camera and all readouts in sync.
      progress = THREE.MathUtils.lerp(progress, scrollTarget, 1 - Math.exp(-10 * delta));
      if (Math.abs(scrollTarget - progress) * length < .02) setProgress(scrollTarget);
    }
    const current = at(progress * length);
    racingBlend = THREE.MathUtils.lerp(racingBlend, racingEnabled ? 1 : 0, 1 - Math.exp(-6 * delta));
    if (mode === 'first') current.position.lerp(racingLine.at(progress * length).position, racingBlend);
    const mapPosition = mapPoint(current.position);
    const mapAheadPosition = at((progress * length + 10) % length).position;
    if (mode === 'first') mapAheadPosition.lerp(racingLine.at(progress * length + 10).position, racingBlend);
    const mapAhead = mapPoint(mapAheadPosition);
    const heading = Math.atan2(mapAhead.x - mapPosition.x, mapPosition.y - mapAhead.y) * 180 / Math.PI;
    $('#minimap-marker').setAttribute('transform', `translate(${mapPosition.x} ${mapPosition.y}) rotate(${heading})`);
    $('#minimap-travelled').setAttribute('stroke-dasharray', `${progress} 1`);
    marker.position.copy(current.position).add(new THREE.Vector3(0, 20, 0));
    travelledLine.geometry.setDrawRange(0, Math.max(0, Math.floor(progress * (points.length - 1)) + 1));
    if (mode === 'first') {
      const ahead = at((progress * length + 25) % length);
      ahead.position.lerp(racingLine.at(progress * length + 25).position, racingBlend);
      perspective.position.copy(current.position).add(new THREE.Vector3(0, 1.8, 0));
      perspective.lookAt(ahead.position.clone().add(new THREE.Vector3(0, 1.8, 0)));
      atmosphere.update(perspective);
    } else {
      if (mode === 'free') { freeCamera.update(delta); atmosphere.update(perspective); }
      orbit.update();
    }
    annotations.update(progress * length, mode === 'free' ? 'first' : mode, showLabels);
    $('#distance').innerHTML = `${(progress * length / 1000).toFixed(2)} <em>KM</em>`;
    $('#elevation').innerHTML = `${Math.round(current.elevation)} <em>m</em>`;
    $('.elevation-meter').style.setProperty('--elevation', THREE.MathUtils.clamp((current.elevation - 330) / 300, 0, 1));
    $('#velocity').innerHTML = `${Math.round(pace.at(progress * length) * 3.6)} <em>km/h</em>`;
    $('#percent').textContent = `${Math.round(progress * 100)}%`;
    if (document.activeElement !== $('#progress')) $('#progress').value = Math.round(progress * 10000);
    renderer.render(scene, perspective);
  });
}
