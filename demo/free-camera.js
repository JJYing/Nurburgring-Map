import * as THREE from 'three';

export function moveFreeCamera(camera, controls, keys, delta) {
  const forward = camera.getWorldDirection(new THREE.Vector3());
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  const motion = new THREE.Vector3();
  motion.addScaledVector(forward, Number(keys.has('KeyW')) - Number(keys.has('KeyS')));
  motion.addScaledVector(right, Number(keys.has('KeyD')) - Number(keys.has('KeyA')));
  motion.y += Number(keys.has('KeyE')) - Number(keys.has('KeyQ'));
  if (!motion.lengthSq()) return;
  const boost = keys.has('ShiftLeft') || keys.has('ShiftRight');
  motion.normalize().multiplyScalar(delta * (boost ? 140 : 35));
  camera.position.add(motion);
  controls.target.add(motion);
}

export function createFreeCamera(camera, controls, active) {
  const keys = new Set();
  const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'ShiftLeft', 'ShiftRight']);
  addEventListener('keydown', event => {
    if (!active() || event.ctrlKey || event.metaKey || event.altKey
      || event.target.closest?.('input, select, textarea, [contenteditable="true"]')
      || !movementKeys.has(event.code)) return;
    event.preventDefault(); keys.add(event.code);
  });
  addEventListener('keyup', event => keys.delete(event.code));
  addEventListener('blur', () => keys.clear());
  document.addEventListener('visibilitychange', () => { if (document.hidden) keys.clear(); });
  return { reset: () => keys.clear(), update: delta => moveFreeCamera(camera, controls, keys, delta) };
}
