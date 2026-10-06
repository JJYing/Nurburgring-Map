import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTrack } from './track.js';
import { createSpeedProfile } from './speed.js';
import { createAnnotations } from './annotations.js';

const $ = selector => document.querySelector(selector);
const loading = $('#loading');
lucide.createIcons();

try {
  const response = await fetch('./route.json');
  if (!response.ok) throw new Error('赛道数据加载失败');
  const route = await response.json();
  const cornerResponse = await fetch('./corners.json');
  if (!cornerResponse.ok) throw new Error('弯道数据加载失败');
  start(route, await cornerResponse.json());
  loading.hidden = true;
} catch (error) {
  loading.textContent = '无法加载场景，请刷新后重试。';
  console.error(error);
}

function start(route, corners) {
  const track = createTrack(route);
  const { length, points, at, treeStride } = track;
  const pace = createSpeedProfile(track);
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
  scene.add(new THREE.HemisphereLight(0xffffff, 0x72906c, 2.3));
  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(-1500, 4000, 1800);
  scene.add(sun);
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
    world.add(mesh);
    return mesh;
  }
  const grass = ribbon(160, -.5, 0x8daa78);
  ribbon(16, .15, 0xe2e6dc);
  ribbon(12, .3, 0x454e4b);
  const overviewLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p => p.clone().add(new THREE.Vector3(0, 1, 0)))), new THREE.LineBasicMaterial({ color: 0x343f39, depthTest: false }));
  overviewLine.renderOrder = 2;
  world.add(overviewLine);
  const travelledLine = new THREE.Line(overviewLine.geometry.clone(), new THREE.LineBasicMaterial({ color: 0xdf423c, depthTest: false }));
  travelledLine.renderOrder = 4;
  world.add(travelledLine);
  const trees = new THREE.Group();
  world.add(trees);
  const treeCount = Math.ceil(points.length / treeStride) * 2;
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.45, .7, 6, 5), new THREE.MeshStandardMaterial({ color: 0x777265 }), treeCount);
  const crowns = new THREE.InstancedMesh(new THREE.ConeGeometry(4, 12, 7), new THREE.MeshStandardMaterial({ color: 0x315d43, flatShading: true }), treeCount);
  const dummy = new THREE.Object3D();
  let treeIndex = 0;
  for (let i = 0; i < points.length; i += treeStride) {
    const side = sideways(i), p = points[i];
    for (const sign of [-1, 1]) {
      const random = (Math.sin(i * 12.9898 + sign * 78.233) * 43758.5453) % 1;
      const shift = sign * (22 + Math.abs(random) * 37);
      const height = .8 + Math.abs(random) * .6;
      dummy.position.set(p.x + side.x * shift, p.y + 3 * height, p.z + side.z * shift);
      dummy.scale.set(height, height, height);
      dummy.updateMatrix(); trunks.setMatrixAt(treeIndex, dummy.matrix);
      dummy.position.y = p.y + 10 * height;
      dummy.updateMatrix(); crowns.setMatrixAt(treeIndex, dummy.matrix);
      treeIndex++;
    }
  }
  trees.add(trunks, crowns);
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
  let scrollTarget = null;
  let showLabels = true;
  const annotations = createAnnotations(corners, track, scene, perspective, setProgress);

  function setProgress(value) {
    progress = value;
    scrollTarget = null;
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
    mode = next;
    document.body.classList.toggle('first-person', mode === 'first');
    $('#minimap').hidden = mode !== 'first';
    orbit.enabled = mode === 'orbit';
    trees.visible = mode === 'first' && treeVisible;
    grass.visible = mode === 'first';
    $('#trees').hidden = mode !== 'first';
    marker.visible = mode !== 'first'; startMarker.visible = mode !== 'first';
    overviewLine.visible = mode !== 'first';
    travelledLine.visible = mode !== 'first';
    perspective.near = mode === 'first' ? .1 : 10;
    perspective.updateProjectionMatrix();
    grid.visible = mode === 'orbit';
    horizon.visible = true;
    scene.fog = mode === 'first' ? new THREE.Fog(0xc8dcde, 300, 1800) : null;
    renderer.setClearColor(mode === 'first' ? 0xc8dcde : 0xe7eeea);
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    if (mode !== 'first') resetView();
  }
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  $('#reset').addEventListener('click', () => { if (mode === 'first') { setProgress(0); } else resetView(); });
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
  renderer.domElement.addEventListener('wheel', event => {
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (playing) setPlaying(false);
    if (document.activeElement === $('#progress')) $('#progress').blur();
    if (mode === 'first') {
      scrollTarget = THREE.MathUtils.clamp((scrollTarget ?? progress) + delta / 90000, 0, 1);
    } else setProgress(THREE.MathUtils.clamp(progress + delta / 18000, 0, 1));
  }, { passive: false });
  $('#trees').addEventListener('click', () => { treeVisible = !treeVisible; trees.visible = mode === 'first' && treeVisible; $('#trees').setAttribute('aria-pressed', String(treeVisible)); });
  $('#labels').addEventListener('click', () => { showLabels = !showLabels; $('#labels').setAttribute('aria-pressed', String(showLabels)); });
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
    const mapPosition = mapPoint(current.position);
    const mapAhead = mapPoint(at((progress * length + 10) % length).position);
    const heading = Math.atan2(mapAhead.x - mapPosition.x, mapPosition.y - mapAhead.y) * 180 / Math.PI;
    $('#minimap-marker').setAttribute('transform', `translate(${mapPosition.x} ${mapPosition.y}) rotate(${heading})`);
    $('#minimap-travelled').setAttribute('stroke-dasharray', `${progress} 1`);
    marker.position.copy(current.position).add(new THREE.Vector3(0, 20, 0));
    travelledLine.geometry.setDrawRange(0, Math.max(0, Math.floor(progress * (points.length - 1)) + 1));
    if (mode === 'first') {
      const ahead = at((progress * length + 25) % length);
      perspective.position.copy(current.position).add(new THREE.Vector3(0, 1.8, 0));
      perspective.lookAt(ahead.position.clone().add(new THREE.Vector3(0, 1.8, 0)));
    } else orbit.update();
    annotations.update(progress * length, mode, showLabels);
    $('#distance').innerHTML = `${(progress * length / 1000).toFixed(2)} <em>km</em>`;
    $('#elevation').innerHTML = `${Math.round(current.elevation)} <em>m</em>`;
    $('#velocity').innerHTML = `${Math.round(pace.at(progress * length) * 3.6)} <em>km/h</em>`;
    $('#percent').textContent = `${Math.round(progress * 100)}%`;
    if (document.activeElement !== $('#progress')) $('#progress').value = Math.round(progress * 10000);
    renderer.render(scene, perspective);
  });
}
