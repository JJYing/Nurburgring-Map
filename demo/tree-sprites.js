import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const treeSpriteKinds = ['oak', 'beech', 'birch', 'spruce', 'pine', 'shrub'];
export const treeSpriteWidths = { oak: 1.1, beech: .9, birch: .65, spruce: .7, pine: .95, shrub: 1.25 };

export function createTreeSprites(placements, texture) {
  const trees = new THREE.Group(), dummy = new THREE.Object3D();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  for (const [slot, kind] of treeSpriteKinds.entries()) {
    const front = new THREE.PlaneGeometry(1, 1).translate(0, .5, 0);
    const cross = front.clone().rotateY(Math.PI / 2);
    const geometry = mergeGeometries([front, cross]);
    front.dispose(); cross.dispose();
    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      uv.setXY(i, (slot % 3 + .003 + uv.getX(i) * .994) / 3,
        (1 - Math.floor(slot / 3) + .018 + uv.getY(i) * .98) / 2);
    }
    const material = new THREE.MeshStandardMaterial({
      map: texture, alphaTest: .4, alphaToCoverage: false,
      side: THREE.DoubleSide, roughness: 1
    });
    const entries = placements.filter(p => p.kind === kind);
    const mesh = new THREE.InstancedMesh(geometry, material, entries.length);
    mesh.name = `Vegetation ${kind}`;
    entries.forEach((p, i) => {
      dummy.position.copy(p.position);
      dummy.rotation.y = p.tone * Math.PI * 2;
      dummy.scale.set(p.height * treeSpriteWidths[kind] * p.width, p.height, p.height * treeSpriteWidths[kind] * p.width);
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, new THREE.Color().setHSL(.27 + p.tone * .015, .04, .85 + p.tone * .1));
    });
    trees.add(mesh);
  }
  return trees;
}
