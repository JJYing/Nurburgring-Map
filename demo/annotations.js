import * as THREE from 'three';

export function createAnnotations(corners, track, scene, camera, onSelect) {
  const anchors = [[0, 0], [.003, 0], [.353, 7350], [.3775, 8008.4], [.5785, 12000], [.997, 20655.5], [1, track.length]];
  const distanceAt = progress => {
    const index = anchors.findIndex(anchor => anchor[0] >= progress);
    if (index <= 0) return anchors[0][1];
    const [a, b] = [anchors[index - 1], anchors[index]];
    return THREE.MathUtils.lerp(a[1], b[1], (progress - a[0]) / (b[0] - a[0]));
  };
  const root = document.querySelector('#corner-labels');
  const connectors = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  connectors.classList.add('corner-connectors');
  connectors.setAttribute('aria-hidden', 'true');
  root.append(connectors);
  const select = document.querySelector('#segment');
  const group = new THREE.Group();
  scene.add(group);
  const shoulders = new THREE.Group();
  scene.add(shoulders);
  const shoulderMaterial = new THREE.MeshBasicMaterial({ color: 0xdf423c, side: THREE.DoubleSide });
  const palette = [0x487565, 0xb39145, 0x647c93];
  const items = corners.map((corner, i) => {
    const start = distanceAt(corner.start), end = distanceAt(corner.end);
    const distance = distanceAt((corner.start + corner.end) / 2);
    const groundPosition = track.at(distance).position.add(new THREE.Vector3(0, .03, 0));
    const position = groundPosition.clone().add(new THREE.Vector3(0, 24.97, 0));
    const vertices = [], indices = [];
    const shoulderVertices = [], shoulderIndices = [];
    const divisions = Math.max(2, Math.ceil((end - start) / 3));
    for (let step = 0; step <= divisions; step++) {
      const d = start + (end - start) * step / divisions;
      const p = track.at(d).position;
      const before = track.at(Math.max(0, d - 2)).position;
      const after = track.at(Math.min(track.length, d + 2)).position;
      const side = new THREE.Vector3(after.z - before.z, 0, before.x - after.x).normalize().multiplyScalar(12);
      vertices.push(p.x + side.x, p.y + 1.1, p.z + side.z, p.x - side.x, p.y + 1.1, p.z - side.z);
      if (step < divisions) { const n = step * 2; indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3); }
      for (const offset of [7.4, 8, -7.4, -8]) {
        shoulderVertices.push(p.x + side.x * offset / 12, p.y + .04, p.z + side.z * offset / 12);
      }
      if (step < divisions) {
        const n = step * 4;
        shoulderIndices.push(n, n + 4, n + 1, n + 1, n + 4, n + 5,
          n + 2, n + 6, n + 3, n + 3, n + 6, n + 7);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: palette[i % palette.length], side: THREE.DoubleSide, depthTest: false }));
    mesh.renderOrder = 3;
    group.add(mesh);
    const shoulderGeometry = new THREE.BufferGeometry();
    shoulderGeometry.setAttribute('position', new THREE.Float32BufferAttribute(shoulderVertices, 3));
    shoulderGeometry.setIndex(shoulderIndices);
    const shoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    shoulder.visible = false;
    shoulders.add(shoulder);
    const button = document.createElement('button');
    button.className = 'corner-label';
    button.title = corner.label === corner.name ? corner.name : `${corner.label} · ${corner.name}`;
    const name = document.createElement('span'); name.textContent = corner.name;
    const translation = document.createElement('small'); translation.textContent = corner.label === corner.name ? '' : corner.label;
    button.append(name, translation);
    button.addEventListener('click', () => onSelect(distance / track.length));
    root.append(button);
    const connector = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    connectors.append(connector);
    const option = document.createElement('option');
    option.value = i;
    option.textContent = button.title;
    select.append(option);
    return { ...corner, start, end, distance, position, groundPosition, mesh, shoulder, button, connector, width: 0, height: 0, index: i };
  });
  select.addEventListener('change', () => { if (select.value === '') return; const item = items[Number(select.value)]; if (item) onSelect(item.distance / track.length); });
  let selected = -1;
  let overviewLayout = '';
  return {
    update(distance, mode, showLabels) {
      group.visible = mode === 'orbit';
      shoulders.visible = mode === 'first';
      root.hidden = !showLabels;
      const current = items.find(item => distance >= item.start && distance <= item.end && !item.section)
        || items.find(item => distance >= item.start && distance <= item.end);
      const index = current?.index ?? -1;
      if (index !== selected) {
        selected = index;
        select.value = index < 0 ? '' : String(index);
        items.forEach(item => {
          item.button.classList.toggle('current', item.index === index);
          item.shoulder.visible = item.index === index;
          item.mesh.material.color.setHex(item.index === index ? 0xdf423c : palette[item.index % palette.length]);
        });
      }
      if (!showLabels) { overviewLayout = ''; return; }
      camera.updateMatrixWorld();
      const layoutKey = `${innerWidth},${innerHeight},${camera.matrixWorld.elements.join(',')}`;
      if (mode === 'orbit' && overviewLayout === layoutKey) return;
      const footer = document.querySelector('footer').getBoundingClientRect();
      const header = document.querySelector('header').getBoundingClientRect();
      const hud = document.querySelector('.readings').getBoundingClientRect();
      const top = Math.max(header.bottom, hud.bottom) + 16;
      const bottom = footer.top - 12;
      const projectedItems = items.map(item => {
        const projected = (mode === 'first' ? item.groundPosition : item.position).clone().project(camera);
        const x = (projected.x + 1) * innerWidth / 2, y = (1 - projected.y) * innerHeight / 2;
        return { item, x, y, inView: projected.z >= -1 && projected.z <= 1 && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1,
          ahead: (item.distance - distance + track.length) % track.length };
      });
      function place(entry, left, y, caption = '') {
        const { item, x, y: anchorY, inView } = entry;
        item.button.hidden = false;
        item.button.querySelector('small').textContent = caption;
        const opacity = mode === 'first' ? 1 - .72 * THREE.MathUtils.smoothstep(entry.ahead, 120, 1200) : 1;
        item.button.style.opacity = opacity;
        item.connector.style.opacity = opacity;
        item.button.style.transform = `translate(${left}px, ${y}px)`;
        const width = item.button.offsetWidth, height = item.button.offsetHeight;
        item.connector.setAttribute('x1', Math.max(0, Math.min(innerWidth, x)));
        item.connector.setAttribute('y1', mode === 'first' ? anchorY : Math.max(top, Math.min(bottom, anchorY)));
        item.connector.setAttribute('x2', Math.max(left, Math.min(left + width, x)));
        item.connector.setAttribute('y2', y + (mode === 'first' ? height : height / 2));
        item.connector.style.display = inView && (mode !== 'first' || anchorY > header.bottom && anchorY < footer.top) ? '' : 'none';
      }
      if (mode === 'orbit') {
        overviewLayout = layoutKey;
        const placed = [hud];
        // Local offsets reduce collisions without hiding labels or reordering on progress.
        projectedItems.forEach(entry => {
          const { item, x, y } = entry;
          item.button.hidden = false;
          item.button.querySelector('small').textContent = '';
          const width = item.button.offsetWidth, height = item.button.offsetHeight;
          const preferredX = x < innerWidth / 2 ? x - width - 8 : x + 8;
          const preferredY = y - height / 2;
          let best;
          for (const dx of [0, -16, 16, -32, 32]) {
            for (const dy of [0, -16, 16, -32, 32, -48, 48]) {
              const left = THREE.MathUtils.clamp(preferredX + dx, 8, innerWidth - width - 8);
              const t = THREE.MathUtils.clamp(preferredY + dy, header.bottom + 8, bottom - height);
              const rect = { left, top: t, right: left + width, bottom: t + height };
              const overlap = placed.reduce((total, other) => total
                + Math.max(0, Math.min(rect.right, other.right + 3) - Math.max(left, other.left - 3))
                * Math.max(0, Math.min(rect.bottom, other.bottom + 3) - Math.max(t, other.top - 3)), 0);
              const score = overlap * 5 + dx * dx * .12 + dy * dy * .12;
              if (!best || score < best.score) best = { ...rect, score };
            }
          }
          place(entry, best.left, best.top);
          item.connector.style.display = entry.inView && Math.hypot(best.left - preferredX, best.top - preferredY) > 12 ? '' : 'none';
          placed.push(best);
        });
      } else {
        overviewLayout = '';
        items.forEach(item => { item.button.hidden = true; item.connector.style.display = 'none'; });
        const placed = [hud, document.querySelector('#minimap').getBoundingClientRect()];
        projectedItems.filter(entry => !entry.item.section && entry.ahead > 10 && entry.ahead < 1800
          && entry.inView && entry.y > header.bottom && entry.y < footer.top)
          .sort((a, b) => a.ahead - b.ahead).slice(0, 3)
          .forEach(entry => {
            const { item, x, y } = entry;
            const caption = `${Math.round(entry.ahead)} m`;
            item.button.hidden = false;
            item.button.querySelector('small').textContent = caption;
            const width = item.button.offsetWidth, height = item.button.offsetHeight;
            const floating = item.groundPosition.clone().add(new THREE.Vector3(0, 8, 0)).project(camera);
            const preferredLeft = THREE.MathUtils.clamp(x - width / 2, 8, innerWidth - width - 8);
            let labelY = Math.min((1 - floating.y) * innerHeight / 2 - height, y - height - 24);
            labelY = THREE.MathUtils.clamp(labelY, header.bottom + 8, bottom - height);
            let best;
            const candidateY = [labelY, labelY - height - 8, labelY + height + 8,
              labelY - 2 * (height + 8), labelY + 2 * (height + 8),
              ...placed.map(rect => rect.bottom + 12)];
            for (const dx of [0, -24, 24, -48, 48]) {
              for (const candidate of candidateY) {
                const left = THREE.MathUtils.clamp(preferredLeft + dx, 8, innerWidth - width - 8);
                const t = THREE.MathUtils.clamp(candidate, header.bottom + 8, bottom - height);
                const overlap = placed.reduce((total, rect) => total
                  + Math.max(0, Math.min(left + width, rect.right + 10) - Math.max(left, rect.left - 10))
                  * Math.max(0, Math.min(t + height, rect.bottom + 10) - Math.max(t, rect.top - 10)), 0);
                const score = overlap * 100 + (left - preferredLeft) ** 2 + (t - labelY) ** 2;
                if (!best || score < best.score) best = { left, top: t, score };
              }
            }
            place(entry, best.left, best.top, caption);
            placed.push({ left: best.left, right: best.left + width, top: best.top, bottom: best.top + height });
          });
      }
    }
  };
}
