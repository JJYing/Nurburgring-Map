import * as THREE from 'three';

export const renderStyle = {
  fogColor: 0xcbd7d5,
  fogDensity: .0019,
  skyColor: 0x8aaabd,
  exposure: 1.12,
  shadowRange: 160
};

export function createAtmosphere(renderer, scene) {
  const fill = new THREE.HemisphereLight(0xddebf2, 0x687858, 1.3);
  const sun = new THREE.DirectionalLight(0xfff0da, 2.8);
  sun.shadow.mapSize.set(innerWidth < 600 ? 1024 : 2048, innerWidth < 600 ? 1024 : 2048);
  Object.assign(sun.shadow.camera, {
    left: -renderStyle.shadowRange, right: renderStyle.shadowRange,
    top: renderStyle.shadowRange, bottom: -renderStyle.shadowRange, near: 1, far: 600
  });
  sun.shadow.bias = -.00015;
  sun.shadow.normalBias = .08;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(12000, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: {
      horizon: { value: new THREE.Color(renderStyle.fogColor) },
      zenith: { value: new THREE.Color(renderStyle.skyColor) }
    },
    vertexShader: `varying vec3 direction;
      void main() {
        direction = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `uniform vec3 horizon; uniform vec3 zenith; varying vec3 direction;
      void main() {
        float altitude = smoothstep(0.0, 0.45, normalize(direction).y);
        gl_FragColor = vec4(mix(horizon, zenith, altitude), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  }));
  sky.name = 'Atmospheric sky'; sky.frustumCulled = false;
  scene.add(fill, sun, sun.target, sky);
  return {
    setMode(first, fog = first) {
      sky.visible = first; sun.castShadow = first;
      renderer.shadowMap.enabled = first;
      renderer.toneMapping = first ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
      renderer.toneMappingExposure = first ? renderStyle.exposure : 1;
      fill.intensity = first ? 1.3 : 2.3;
      fill.color.set(first ? 0xddebf2 : 0xffffff);
      fill.groundColor.set(first ? 0x687858 : 0x72906c);
      sun.intensity = first ? 2.8 : 2.1;
      sun.color.set(first ? 0xfff0da : 0xffffff);
      sun.position.set(-1500, 4000, 1800); sun.target.position.set(0, 0, 0);
      scene.fog = fog ? new THREE.FogExp2(renderStyle.fogColor, renderStyle.fogDensity) : null;
      renderer.setClearColor(first ? renderStyle.fogColor : 0xe7eeea);
    },
    update(camera) {
      sky.position.copy(camera.position);
      // Quantize the moving near-field shadow window to reduce subpixel shimmer.
      const texel = renderStyle.shadowRange * 2 / sun.shadow.mapSize.x;
      const x = Math.round(camera.position.x / texel) * texel;
      const z = Math.round(camera.position.z / texel) * texel;
      sun.target.position.set(x, camera.position.y, z);
      sun.position.set(x - 110, camera.position.y + 170, z + 85);
    }
  };
}

export function addSurfaceGrain(material, scale, strength) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = `varying vec3 surfacePosition;\n${shader.vertexShader}`
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nsurfacePosition = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = `varying vec3 surfacePosition;
      float grainHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float grainNoise(vec2 p) {
        vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(grainHash(i), grainHash(i + vec2(1, 0)), f.x),
          mix(grainHash(i + vec2(0, 1)), grainHash(i + vec2(1, 1)), f.x), f.y);
      }\n${shader.fragmentShader}`.replace('#include <color_fragment>', `#include <color_fragment>
        vec2 grainUv = surfacePosition.xz * ${scale.toFixed(3)};
        float detailFade = 1.0 - smoothstep(0.2, 1.2, max(length(dFdx(grainUv)), length(dFdy(grainUv))));
        float grain = (grainNoise(grainUv) - 0.5) * detailFade;
        diffuseColor.rgb *= 1.0 + grain * ${strength.toFixed(3)};`);
  };
  material.customProgramCacheKey = () => `surface-grain-${scale}-${strength}`;
}
