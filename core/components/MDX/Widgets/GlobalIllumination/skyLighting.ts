import type { SandpackFiles } from '@codesandbox/sandpack-react';

import reflections from './reflections';

const { '/Sky.js': _staticSky, ...reflectionFiles } = reflections;

const app = `import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { button, folder, Leva, useControls } from 'leva';
import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three/webgpu';

import ProbeEffect from './ProbeEffect';
import Scene from './Scene';
import { sunlight } from './Atmosphere';
import { CAMERA_POSITION, CAMERA_TARGET, LIGHT_TARGET } from './sceneData';
import './scene.css';

function Room() {
  const [reset, setReset] = useState(0);

  const [
    {
      enabled,
      showProbes,
      rays,
      density,
      hysteresis,
      reflections,
      sphereRoughness,
    },
    setControls,
  ] = useControls(
    () => ({
      reflections: { value: true, label: 'Reflections' },
      sphereRoughness: {
        value: 0.15,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Roughness',
      },
      enabled: { value: true, label: 'GI' },
      showProbes: { value: false, label: 'Show probes' },
      'Probe settings': folder(
        {
          hysteresis: {
            value: 0.98,
            min: 0,
            max: 0.99,
            step: 0.01,
            label: 'Hysteresis',
          },
          density: {
            value: 20,
            label: 'Density',
            options: {
              '8 × 4 × 8': 8,
              '12 × 6 × 12': 12,
              '16 × 8 × 16': 16,
              '20 × 10 × 20': 20,
              '24 × 12 × 24': 24,
            },
          },
          rays: { value: 16, options: [8, 16, 32], label: 'Rays per lobe' },
          frames: {
            value: 0,
            step: 1,
            disabled: true,
            label: 'History frames',
          },
          'Reset probes': button(() => setReset((n) => n + 1)),
        },
        { collapsed: true }
      ),
    }),
    []
  );

  const { elevation, azimuth, intensity, haze } = useControls(
    'Atmosphere',
    {
      elevation: { value: 42, min: -6, max: 85, step: 0.5, label: 'Elevation' },
      azimuth: { value: -45, min: -180, max: 180, step: 1, label: 'Azimuth' },
      intensity: { value: 10, min: 0, max: 30, step: 0.5, label: 'Intensity' },
      haze: { value: 2.75, min: 0.1, max: 8, step: 0.05, label: 'Haze' },
    },
    { collapsed: false }
  );

  const { position, sunRadiance } = useMemo(() => {
    const altitude = THREE.MathUtils.degToRad(elevation);
    const bearing = THREE.MathUtils.degToRad(azimuth);
    const direction = new THREE.Vector3(
      Math.sin(bearing) * Math.cos(altitude),
      Math.sin(altitude),
      Math.cos(bearing) * Math.cos(altitude)
    );

    return {
      position: direction
        .clone()
        .multiplyScalar(24)
        .add(new THREE.Vector3(...LIGHT_TARGET))
        .toArray(),
      sunRadiance: sunlight(direction.y, intensity, haze),
    };
  }, [elevation, azimuth, intensity, haze]);

  return (
    <>
      <Scene
        nightTime={false}
        sphereRoughness={sphereRoughness}
        lightPosition={position}
        intensity={intensity}
        sunRadiance={sunRadiance}
        haze={haze}
      />
      <ProbeEffect
        nightTime={false}
        lightPosition={position}
        intensity={intensity}
        sunRadiance={sunRadiance}
        haze={haze}
        enabled={enabled}
        showProbes={showProbes}
        rays={rays}
        density={density}
        hysteresis={hysteresis}
        reflections={reflections}
        reset={reset}
        onFrames={setControls}
      />
      <OrbitControls
        makeDefault
        target={CAMERA_TARGET}
        minDistance={2}
        maxDistance={35}
        maxPolarAngle={Math.PI * 0.55}
      />
    </>
  );
}

export default function App() {
  const [supported, setSupported] = useState(null);

  useEffect(() => {
    let active = true;

    async function checkGPU() {
      try {
        const adapter = await navigator.gpu?.requestAdapter();

        if (active) setSupported(Boolean(adapter));
      } catch {
        if (active) setSupported(false);
      }
    }

    checkGPU();

    return () => {
      active = false;
    };
  }, []);

  if (supported !== true)
    return (
      <p role="status">
        {supported === null
          ? 'Checking WebGPU support…'
          : 'This playground needs a browser with WebGPU support.'}
      </p>
    );

  return (
    <>
      <Leva collapsed={false} />
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={1}
        camera={{ position: CAMERA_POSITION, fov: 50, near: 0.1, far: 80 }}
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(props);
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          await renderer.init();

          return renderer;
        }}
      >
        <Room />
      </Canvas>
    </>
  );
}
`;

const effect = `import reflectionShader from '!!raw-loader!./traceReflection.wgsl';
import skyShader from '!!raw-loader!./skySampling.wgsl';
import { createAtmosphere } from './Atmosphere';
import sampleShader from '!!raw-loader!./sampleProbes.wgsl';
import updateShader from '!!raw-loader!./updateProbes.wgsl';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { fxaa } from 'three/examples/jsm/tsl/display/FXAANode.js';
import {
  getViewPosition,
  materialColor,
  materialMetalness,
  roughness,
  mix,
  mrt,
  normalWorld,
  output,
  pass,
  renderOutput,
  rtt,
  uniform,
  uv,
  vec4,
  wgsl,
  wgslFn,
} from 'three/tsl';
import * as THREE from 'three/webgpu';

import { createProbeCompute, createProbeMarkers } from './probes';
import {
  createWorld,
  getProbeGrid,
  LIGHT_TARGET,
  HISTORY_LIMIT,
} from './sceneData';

export default function ProbeEffect({
  nightTime,
  lightPosition,
  intensity,
  sunRadiance,
  haze,
  enabled,
  showProbes,
  rays,
  density,
  hysteresis,
  reflections,
  reset,
  onFrames,
}) {
  const { gl, scene, camera } = useThree();

  const renderRef = useRef(null);
  const revision = useRef(0);
  const resetRevision = useRef(0);
  const markersVisible = useRef(showProbes);

  const controls = useMemo(
    () => ({
      frame: uniform(0, 'uint'),
      stableFrames: uniform(0, 'uint'),
      hysteresis: uniform(0.98),
      rays: uniform(16, 'uint'),
      sunDirection: uniform(new THREE.Vector3()),
      sunRadiance: uniform(new THREE.Color()),
      solarIntensity: uniform(10),
      haze: uniform(2.75),
      nightTime: uniform(0),
      enabled: uniform(1),
      reflections: uniform(1),
    }),
    []
  );

  const grid = useMemo(() => getProbeGrid(density), [density]);

  const [lightX, lightY, lightZ] = lightPosition;

  useLayoutEffect(() => {
    controls.sunDirection.value
      .set(lightX, lightY, lightZ)
      .sub(new THREE.Vector3(...LIGHT_TARGET))
      .normalize();
    controls.sunRadiance.value.copy(sunRadiance);
    controls.solarIntensity.value = intensity;
    controls.haze.value = haze;
    controls.nightTime.value = nightTime ? 1 : 0;
    controls.rays.value = rays;
    controls.hysteresis.value = hysteresis;

    // Lighting changes restart adaptation without discarding the atlas.
    revision.current++;
  }, [
    controls,
    lightX,
    lightY,
    lightZ,
    intensity,
    sunRadiance,
    haze,
    nightTime,
    rays,
    hysteresis,
  ]);

  useLayoutEffect(() => {
    resetRevision.current++;
  }, [reset]);

  useLayoutEffect(() => {
    controls.enabled.value = enabled ? 1 : 0;
    markersVisible.current = showProbes;
    controls.reflections.value = reflections ? 1 : 0;
  }, [controls, enabled, showProbes, reflections]);

  useEffect(() => {
    const world = wgsl(createWorld(grid));
    const skyCode = wgsl(skyShader);
    const atmosphere = createAtmosphere(controls);
    const sky = atmosphere.atlas;
    const updateProbes = wgslFn(updateShader, [world, skyCode]);
    const sampleProbes = wgslFn(sampleShader, [world]);

    const compute = createProbeCompute(grid, (pixel, previous) =>
      updateProbes({
        pixel,
        previous,
        frame: controls.frame,
        stableFrames: controls.stableFrames,
        hysteresis: controls.hysteresis,
        rays: controls.rays,
        sunDirection: controls.sunDirection,
        sunRadiance: controls.sunRadiance,
        sky,
        nightTime: controls.nightTime,
      })
    );
    const markers = createProbeMarkers(grid);

    const scenePass = pass(scene, camera, { samples: 0 });
    scenePass.setMRT(
      mrt({
        output,
        normal: normalWorld,
        albedo: materialColor,
        material: vec4(roughness, materialMetalness, 0, 1),
      })
    );

    const color = scenePass.getTextureNode('output');
    const depth = scenePass.getTextureNode('depth');
    const normals = scenePass.getTextureNode('normal');
    const albedo = scenePass.getTextureNode('albedo');
    const material = scenePass.getTextureNode('material');

    const viewPosition = getViewPosition(
      uv(),
      depth.r,
      uniform(camera.projectionMatrixInverse)
    );

    const worldPosition = uniform(camera.matrixWorld).mul(
      vec4(viewPosition, 1)
    ).xyz;

    const indirect = sampleProbes({
      atlas: compute.atlas,
      worldPosition,
      worldNormal: normals.rgb,
      depth: depth.r,
      albedo: albedo.rgb.mul(material.g.oneMinus()),
      enabled: controls.enabled,
    });
    const cameraPosition = uniform(camera.matrixWorld).mul(
      vec4(0, 0, 0, 1)
    ).xyz;

    const reflection = wgslFn(reflectionShader, [
      world,
      sampleProbes.functionNode,
      skyCode,
    ])({
      atlas: compute.atlas,
      worldPosition,
      worldNormal: normals.rgb,
      cameraPosition,
      depth: depth.r,
      albedo: albedo.rgb,
      material: material.rg,
      sunDirection: controls.sunDirection,
      sunRadiance: controls.sunRadiance,
      sky,
      nightTime: controls.nightTime,
      giEnabled: controls.enabled,
      enabled: controls.reflections,
    });

    const background = wgslFn(
      /* wgsl */ \`
      fn background(sky: texture_2d<f32>, direction: vec3f) -> vec3f { return sampleSky(sky, direction); }
    \`,
      [skyCode]
    )({ sky, direction: worldPosition.sub(cameraPosition) });

    const combined = vec4(
      mix(
        color.rgb.add(indirect).add(reflection),
        background,
        depth.r.greaterThanEqual(1)
      ),
      1
    );

    // Add a subtle glow to bright daylight highlights before tone mapping.
    const glow = bloom(combined, 0.035, 0.3, 1);
    const bloomed = vec4(combined.rgb.add(glow.rgb), 1);

    const display = rtt(
      renderOutput(bloomed, gl.toneMapping, THREE.SRGBColorSpace)
    );

    // Composite a freshly cleared marker pass instead of drawing into a
    // retained output framebuffer, which leaves trails when the camera moves.
    const markerPass = pass(markers.scene, camera, { samples: 0 });
    const markerColor = markerPass.getTextureNode('output');
    const markerDepth = markerPass.getTextureNode('depth');
    const markerOpacity = uniform(0);
    const markerDisplay = renderOutput(
      markerColor, gl.toneMapping, THREE.SRGBColorSpace
    );
    const finalOutput = mix(
      fxaa(display),
      markerDisplay,
      markerDepth.r.lessThan(1).select(markerOpacity, 0)
    );
    const post = new THREE.PostProcessing(gl, finalOutput);
    post.outputColorTransform = false;

    let frames = 0;
    let stableFrames = 0;
    let previousRevision = -1;
    let previousReset = -1;

    renderRef.current = () => {
      // Generate the sky before probes and reflections sample its HDR texture.
      atmosphere.update(gl);

      if (resetRevision.current !== previousReset) {
        previousReset = resetRevision.current;
        frames = 0;
        stableFrames = 0;
        onFrames({ frames: 0 });
      }

      if (revision.current !== previousRevision) {
        previousRevision = revision.current;
        stableFrames = 0;
      }

      // Keep measuring after history fills so changed lighting can replace it.
      // Camera movement changes neither counter nor the world-space atlas.
      controls.frame.value = frames;
      controls.stableFrames.value = stableFrames;
      compute.update(gl);
      frames++;
      stableFrames = Math.min(stableFrames + 1, HISTORY_LIMIT);

      if (frames === 1 || (frames <= HISTORY_LIMIT && frames % 8 === 0)) {
        onFrames({ frames: Math.min(frames, HISTORY_LIMIT) });
      }

      markerOpacity.value = markersVisible.current ? 1 : 0;
      post.render();
    };

    return () => {
      renderRef.current = null;
      compute.dispose();
      atmosphere.dispose();
      markerPass.dispose();
      markers.dispose();
      post.dispose();
      glow.dispose();
      scenePass.dispose();
      display.renderTarget?.dispose();
      display.dispose();
    };
  }, [gl, scene, camera, controls, onFrames, grid]);

  useFrame(() => renderRef.current?.(), 1);

  return null;
}
`;

const scene = `import { useEffect, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three/webgpu';

import {
  OBJECTS,
  LIGHT_TARGET,
  EMISSION,
  ARCH_INNER,
  ARCH_CAP_HEIGHT,
  ARCH_DEPTH,
} from './sceneData';

function createArchGeometry() {
  const outline = new THREE.Shape();
  outline.moveTo(ARCH_INNER, 0);
  outline.lineTo(ARCH_INNER, ARCH_CAP_HEIGHT);
  outline.lineTo(-ARCH_INNER, ARCH_CAP_HEIGHT);
  outline.lineTo(-ARCH_INNER, 0);
  outline.absarc(0, 0, ARCH_INNER, Math.PI, 0, true);
  outline.closePath();

  const geometry = new THREE.ExtrudeGeometry(outline, {
    depth: ARCH_DEPTH,
    bevelEnabled: false,
    curveSegments: 64,
    steps: 1,
  });
  geometry.translate(0, 0, -ARCH_DEPTH / 2);

  return geometry;
}

export default function Scene({
  nightTime,
  lightPosition,
  intensity,
  sunRadiance,
  sphereRoughness,
}) {
  // Use the renderer's Three.js light class (Sandpack also loads Three via Fiber).
  const arch = useMemo(createArchGeometry, []);

  useEffect(() => () => arch.dispose(), [arch]);

  const light = useMemo(() => new THREE.DirectionalLight(), []);

  const target = useMemo(() => {
    const object = new THREE.Object3D();
    object.position.set(...LIGHT_TARGET);

    return object;
  }, []);

  useLayoutEffect(() => {
    light.updateMatrixWorld();
    target.updateMatrixWorld();
    light.shadow.updateMatrices(light);

    const camera = light.shadow.camera;
    const bounds = new THREE.Box3();

    // Fit the courtyard and arcade in light space. Refit when
    // the sun moves; keep the depth range wide enough for the arcade's walls.
    for (const x of [-10, 10]) {
      for (const y of [0, 5.2]) {
        for (const z of [-10, 10]) {
          bounds.expandByPoint(
            new THREE.Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse)
          );
        }
      }
    }

    const padding = 0.25;
    camera.left = bounds.min.x - padding;
    camera.right = bounds.max.x + padding;
    camera.bottom = bounds.min.y - padding;
    camera.top = bounds.max.y + padding;
    camera.updateProjectionMatrix();
    light.shadow.needsUpdate = true;
  }, [light, target, lightPosition, intensity, nightTime]);

  return (
    <>
      {OBJECTS.map((object, index) => (
        <mesh
          key={index}
          position={object.position}
          rotation={
            object.kind === 'plane'
              ? [-Math.PI / 2, 0, 0]
              : [0, object.rotation, 0]
          }
          castShadow
          receiveShadow
        >
          {object.kind === 'sphere' ? (
            <sphereGeometry args={[object.extent[0], 64, 32]} />
          ) : object.kind === 'arch' ? (
            <primitive object={arch} attach="geometry" />
          ) : object.kind === 'plane' ? (
            <planeGeometry
              args={[object.extent[0] * 2, object.extent[2] * 2]}
            />
          ) : (
            <boxGeometry args={object.extent.map((v) => v * 2)} />
          )}
          <meshStandardMaterial
            color={object.color}
            roughness={
              object.material === 'metal'
                ? sphereRoughness
                : (object.roughness ?? 1)
            }
            metalness={object.metalness ?? 0}
            emissive={object.emissive ? '#F2701F' : '#000000'}
            emissiveIntensity={object.emissive && nightTime ? EMISSION : 0}
          />
        </mesh>
      ))}
      <primitive object={target} />
      <primitive
        object={light}
        position={lightPosition}
        target={target}
        intensity={1}
        color={sunRadiance}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={1.5}
        shadow-camera-near={0.1}
        shadow-camera-far={60}
        shadow-bias={-0.005}
        shadow-normalBias={0.03}
        shadow-autoUpdate={false}
        shadow-needsUpdate={true}
      />
    </>
  );
}
`;

const atmosphere = `import atmosphereShader from '!!raw-loader!./atmosphere.wgsl';
import {
  Fn,
  instanceIndex,
  ivec2,
  texture,
  textureStore,
  wgsl,
  wgslFn,
} from 'three/tsl';
import * as THREE from 'three/webgpu';

// Height-based atmosphere from the article’s Lightmarching widget. Distances are
// atmospheric kilometers, independent of the small temple's world-space units.
const HEIGHT = 100;
const OBSERVER_HEIGHT = 1;
const RAYLEIGH = [0.0058, 0.0135, 0.0331];
const OZONE = [0.00065, 0.00188, 0.00008];
const LIGHT_STEPS = 16;

// CPU counterpart of lightOpticalDepth below. Its transmittance colors the
// raster sun AND the sunlight gathered by probes, including at sunset.
export function sunlight(elevation, intensity, haze) {
  const mu = Math.max(elevation + 0.15, 0.04);
  const step = (HEIGHT - OBSERVER_HEIGHT) / mu / LIGHT_STEPS;
  const depth = [0, 0, 0];

  for (let i = 0; i < LIGHT_STEPS; i++) {
    // Below the horizon, retain sea-level extinction instead of dropping
    // samples and accidentally making the sun's path transparent again.
    const h = Math.max(OBSERVER_HEIGHT + (i + 0.5) * step * elevation, 0);

    if (h > HEIGHT) continue;

    depth[0] += Math.exp(-h / 8) * step;
    depth[1] += Math.exp(-h / 1.2) * step;
    depth[2] +=
      THREE.MathUtils.smoothstep(h, 10, 25) *
      (1 - THREE.MathUtils.smoothstep(h, 30, 50)) *
      step;
  }

  const visibility = THREE.MathUtils.smoothstep(elevation, -0.01, 0.035);
  const rgb = RAYLEIGH.map((beta, channel) =>
    Math.exp(
      -beta * depth[0] - 0.0044 * haze * depth[1] - OZONE[channel] * depth[2]
    )
  );

  return new THREE.Color()
    .setRGB(...rgb)
    .multiplyScalar(intensity * visibility);
}

// Match the dimensions used by skyTexel in atmosphere.wgsl.
const SKY_WIDTH = 256;
const SKY_HEIGHT = 128;

export function createAtmosphere(controls) {
  const target = new THREE.StorageTexture(SKY_WIDTH, SKY_HEIGHT);
  target.type = THREE.HalfFloatType;
  target.generateMipmaps = false;
  target.minFilter = THREE.NearestFilter;
  target.magFilter = THREE.NearestFilter;
  target.colorSpace = THREE.NoColorSpace;

  const atlas = texture(target);
  const skyTexel = wgslFn(
    /* wgsl */ \`
    fn generateSky(pixel: vec2i, sunDirection: vec3f, intensity: f32, haze: f32) -> vec4f {
      return skyTexel(pixel, sunDirection, intensity, haze);
    }
  \`,
    [wgsl(atmosphereShader)]
  );

  const compute = Fn(() => {
    const pixel = ivec2(
      instanceIndex.mod(SKY_WIDTH),
      instanceIndex.div(SKY_WIDTH)
    );

    textureStore(
      target,
      pixel,
      skyTexel({
        pixel,
        sunDirection: controls.sunDirection,
        intensity: controls.solarIntensity,
        haze: controls.haze,
      })
    );
  })().compute(SKY_WIDTH * SKY_HEIGHT, [64]);

  let previousKey = '';

  return {
    atlas,
    update(renderer) {
      // Camera motion, probe density and hysteresis never change the sky.
      const key = [
        ...controls.sunDirection.value.toArray(),
        controls.solarIntensity.value,
        controls.haze.value,
      ].join(':');

      if (key === previousKey) return;

      renderer.compute(compute);
      previousKey = key;
    },
    dispose() {
      compute.dispose();
      target.dispose();
    },
  };
}
`;

const scattering = `const skyPI = 3.14159265359;
const atmosphereHeight = 100.0;
const observerHeight = 1.0;
const rayleighBeta = vec3f(0.0058, 0.0135, 0.0331);
const ozoneBeta = vec3f(0.00065, 0.00188, 0.00008);

fn mediumDensity(h: f32) -> vec3f {
  let ozone = smoothstep(10.0, 25.0, h) * (1.0 - smoothstep(30.0, 50.0, h));

  return vec3f(exp(-h / 8.0), exp(-h / 1.2), ozone);
}

fn lightOpticalDepth(height: f32, elevation: f32) -> vec3f {
  let mu = max(elevation + 0.15, 0.04);
  let step = max(atmosphereHeight - height, 0.0) / mu / 16.0;
  var depth = vec3f(0.0);

  for (var i = 0; i < 16; i++) {
    // Keep below-ground samples optically dense. Skipping them causes a
    // second burst of horizon haze just after the sun sets.
    let h = max(height + (f32(i) + 0.5) * step * elevation, 0.0);

    if (h <= atmosphereHeight) {
      depth += mediumDensity(h) * step;
    }
  }

  return depth;
}

fn transmittance(depth: vec3f, haze: f32) -> vec3f {
  return exp(-(rayleighBeta * depth.x + vec3f(0.0044 * haze * depth.y) + ozoneBeta * depth.z));
}

fn atmosphere(direction: vec3f, sunDirection: vec3f, intensity: f32, haze: f32) -> vec3f {
  // Extend horizon scattering below the floating scene, as in the article.
  // Keep the pole finite when the horizontal projection has zero length.
  let skyDirection = normalize(vec3f(direction.x, max(direction.y, 0.00001), direction.z));
  let step = 200.0 / 32.0;
  let mu = clamp(dot(skyDirection, sunDirection), -1.0, 1.0);
  let phaseR = 3.0 / (16.0 * skyPI) * (1.0 + mu * mu);
  let g = 0.8;
  let gg = g * g;
  let phaseM = 3.0 * (1.0 - gg) * (1.0 + mu * mu)
    / (8.0 * skyPI * (2.0 + gg) * pow(max(1.0 + gg - 2.0 * g * mu, 0.0001), 1.5));
  var viewDepth = vec3f(0.0);
  var sumR = vec3f(0.0);
  var sumM = vec3f(0.0);
  var sumO = vec3f(0.0);

  for (var i = 0; i < 32; i++) {
    let h = observerHeight + (f32(i) + 0.5) * step * skyDirection.y;

    if (h > atmosphereHeight) {
      break;
    }
    let density = mediumDensity(h);
    let midpointDepth = viewDepth + density * step * 0.5;
    let sunDepth = lightOpticalDepth(h, sunDirection.y);
    let transmission = transmittance(sunDepth + midpointDepth, haze);

    // Retain the reference shader's high-altitude twilight approximation.
    let threshold = mix(0.0, -0.16, clamp(h / atmosphereHeight, 0.0, 1.0));
    let visibility = smoothstep(threshold - 0.02, threshold + 0.02, sunDirection.y);

    sumR += density.x * transmission * visibility * step;
    sumM += density.y * transmission * visibility * step;
    sumO += density.z * transmission * visibility * step;
    viewDepth += density * step;
  }

  let twilight = smoothstep(-0.16, 0.06, sunDirection.y);
  let skyScattering = intensity * twilight * (phaseR * rayleighBeta * sumR + vec3f(0.00005) * sumO);
  let sunHaze = intensity * twilight * phaseM * 0.003 * haze * sumM;

  // Deliberately faint night fill, not simulated moonlight. It is shared by
  // the backdrop and probes when the sun drops below the horizon.
  let night = vec3f(0.0015, 0.003, 0.008) * (1.0 - twilight);

  // Daylight blue/cyan correction, before the shared display transform.
  // Fade it out at sunset to preserve the warm scattering colors.
  let daylight = smoothstep(0.02, 0.3, sunDirection.y);
  let daylightBalance = mix(vec3f(1.0), vec3f(0.9, 1.8, 2.5), daylight);

  return (skyScattering + sunHaze) * daylightBalance + night;
}

fn skyTexel(pixel: vec2i, sunDirection: vec3f, intensity: f32, haze: f32) -> vec4f {
  let uv = (vec2f(pixel) + 0.5) / vec2f(256.0, 128.0);
  let phi = (uv.x - 0.5) * 2.0 * skyPI;
  let theta = uv.y * skyPI;
  let direction = vec3f(sin(theta) * cos(phi), cos(theta), sin(theta) * sin(phi));

  return vec4f(atmosphere(direction, sunDirection, intensity, haze), 1.0);
}
`;

const skySampling = `fn skyLoad(sky: texture_2d<f32>, pixel: vec2i) -> vec3f {
  let size = vec2i(textureDimensions(sky));
  let wrapped = vec2i((pixel.x % size.x + size.x) % size.x, clamp(pixel.y, 0, size.y - 1));

  return textureLoad(sky, wrapped, 0).rgb;
}

fn sampleSky(sky: texture_2d<f32>, direction: vec3f) -> vec3f {
  let d = normalize(direction);

  // Cosine samples can land exactly on a pole. atan2(0, 0) is undefined
  // on the GPU and would contaminate every later temporal average.
  var longitude = 0.0;

  if (abs(d.x) + abs(d.z) > 0.000001) {
    longitude = atan2(d.z, d.x);
  }
  let uv = vec2f(longitude / 6.28318530718 + 0.5, acos(clamp(d.y, -1.0, 1.0)) / 3.14159265359);
  let pixel = uv * vec2f(textureDimensions(sky)) - 0.5;
  let base = vec2i(floor(pixel));
  let blend = fract(pixel);

  return mix(
    mix(skyLoad(sky, base), skyLoad(sky, base + vec2i(1, 0)), blend.x),
    mix(skyLoad(sky, base + vec2i(0, 1)), skyLoad(sky, base + vec2i(1, 1)), blend.x),
    blend.y
  );
}
`;

const updateProbes = `fn updateProbes(
  pixel: vec2i, previous: texture_2d<f32>, frame: u32,
  stableFrames: u32, hysteresis: f32,
  rays: u32, sunDirection: vec3f, sunRadiance: vec3f, sky: texture_2d<f32>, nightTime: f32
) -> vec4f {
  // The compute invocation supplies an integer atlas coordinate directly.
  // Undo atlasPixel's packing to recover this probe's integer grid position.
  let cell = vec3i(pixel.x / 6, pixel.y % gridSize.y, pixel.y / gridSize.y);
  let origin = probePosition(cell);

  // Alpha zero marks an unusable probe so the surface shader can skip it.

  if (insideSolid(origin)) {
    return vec4f(0.0);
  }

  // Build a local coordinate frame facing this lobe's hemisphere.
  // Tangent/bitangent point sideways; n points forward. Choose a helper axis
  // that is not parallel to n so the cross product has a usable length.
  let n = lobeNormal(pixel.x % 6);
  let axis = select(vec3f(0.0, 1.0, 0.0), vec3f(0.0, 0.0, 1.0), abs(n.y) > 0.9);
  let tangent = normalize(cross(axis, n));
  let bitangent = cross(n, tangent);
  var incoming = vec3f(0.0);

  for (var i = 0u; i < rays; i++) {
    // Vary samples across probes, lobes, rays, and frames. Changing the frame
    // gives us new measurements to average instead of repeating the same noise.
    // Keep all hash inputs in [0, 1). A continuously growing frame seed makes
    // the sine hash lose precision and produces coherent bands of false light.
    // Atlas XY identifies the probe/lobe. Wrap only the sampling phase, NOT
    // the accumulation frame: wrapping must never clear persistent history.
    let phase = frame % 4096u;
    let seed = vec3f(
      (vec2f(pixel) + 0.5) / vec2f(textureDimensions(previous)),
      (f32(i + phase * rays) + 0.5) / (4096.0 * f32(rays))
    );
    let random = hash23(seed);

    // Spread the first random value across equal intervals to reduce clumping.
    // u controls tilt away from n; phi rotates around it.
    let u = (f32(i) + random.x) / f32(rays);
    let phi = 6.28318530718 * random.y;

    // Cosine-weighted hemisphere sampling: more rays point forward, where
    // incoming light matters more to a diffuse surface, fewer skim its edge.
    let direction = tangent * (sqrt(u) * cos(phi))
      + bitangent * (sqrt(u) * sin(phi)) + n * sqrt(1.0 - u);
    let hit = traceWorld(origin, direction);

    // The hit must face the probe. -direction points from the hit back to us.

    if (hit.id >= 0 && dot(hit.normal, -direction) > 0.0) {
      // Emission is outgoing radiance, independent of sunlight or its shadows.
      incoming += shapes[hit.id].emission * nightTime;

      let p = origin + hit.distance * direction;

      // A surface facing the sun gets more light than one at a grazing angle.
      let cosine = max(dot(hit.normal, sunDirection), 0.0);

      if (cosine > 0.0 && any(sunRadiance > vec3f(0.0))) {
        // Ask whether sunlight can reach the hit. The tiny outward offset
        // prevents the surface from immediately intersecting itself.
        let blocked = isOccluded(p + hit.normal * 0.005, sunDirection, 1000.0);

        if (!blocked) {
          // For a matte (Lambert) material, reflected radiance is
          // albedo / PI * incoming sunlight * cosine. Radiance means the light
          // traveling from that hit toward the probe.
          // We use sunlight + emission only, never previous probe lighting:
          // temporal averaging reduces noise but does not add extra bounces.
          incoming += shapes[hit.id].albedo * (1.0 - shapes[hit.id].metalness) * (sunRadiance * cosine / 3.14159265359);
        }
      }
    }

    // Unblocked directions now gather the sky's diffuse radiance.

    if (hit.id < 0) {
      incoming += sampleSky(sky, direction);
    }
  }

  // Average ALL rays, including misses. Dividing by only successful hits
  // would make tiny light sources incorrectly bright.
  // Irradiance is the total light arriving at a surface. Because our rays
  // already follow the cosine weighting, this average estimates irradiance/PI.
  // We can later multiply by the receiving surface's albedo to shade it.
  let fresh = incoming / f32(rays);

  // Only a new grid or an explicit reset discards history.

  if (frame == 0u) {
    return vec4f(fresh, 1.0);
  }

  // RGB stores lighting; alpha counts accumulated frame batches (not rays).
  // Read the SAME texel from last frame: this probe never moves with the camera,
  // so no previous-screen-UV calculation or reprojection is needed.
  let history = textureLoad(previous, pixel, 0);
  let count = min(history.a + 1.0, 256.0);

  // Start with the selected retention, then favor history as lighting settles.
  // The count limit avoids over-weighting history while the atlas warms up.
  let window = min(1.0 / (1.0 - hysteresis) + f32(stableFrames), 256.0);
  let retention = min(1.0 - 1.0 / window, 1.0 - 1.0 / count);

  return vec4f(mix(fresh, history.rgb, retention), count);
}
`;

const traceReflection = `fn traceReflection(
  atlas: texture_2d<f32>, worldPosition: vec3f, worldNormal: vec3f,
  cameraPosition: vec3f, depth: f32, albedo: vec3f, material: vec2f,
  sunDirection: vec3f, sunRadiance: vec3f, sky: texture_2d<f32>, nightTime: f32,
  giEnabled: f32, enabled: f32
) -> vec3f {
  if (depth >= 1.0 || enabled < 0.5) {
    return vec3f(0.0);
  }
  let roughness = clamp(material.x, 0.0, 1.0);
  let metalness = clamp(material.y, 0.0, 1.0);

  // First teaching step: sharp reflections only. This fades the mirror term
  // on rough materials; it is NOT GGX roughness blur or a full rough BRDF.
  let mirrorWeight = (1.0 - roughness) * (1.0 - roughness);

  if (mirrorWeight < 0.0001) {
    return vec3f(0.0);
  }

  let n = normalize(worldNormal);
  let v = normalize(cameraPosition - worldPosition);

  // Schlick Fresnel: metals tint reflections; grazing angles reflect more.
  let f0 = mix(vec3f(0.04), albedo, metalness);
  let fresnel = f0 + (vec3f(1.0) - f0) * pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 5.0);
  let origin = worldPosition + n * 0.005;
  let direction = reflect(-v, n);
  let hit = traceWorld(origin, direction);

  // A reflected view that misses geometry sees the same directional background as
  // the camera. This is a visual fallback, not environment lighting for probes.

  if (hit.id < 0) {
    return sampleSky(sky, direction) * fresnel * mirrorWeight;
  }

  if (dot(hit.normal, -direction) <= 0.0) {
    return vec3f(0.0);
  }

  let p = origin + direction * hit.distance;
  let surface = shapes[hit.id];
  let diffuseAlbedo = surface.albedo * (1.0 - surface.metalness);
  var radiance = surface.emission * nightTime;
  let cosine = max(dot(hit.normal, sunDirection), 0.0);

  if (cosine > 0.0 && any(sunRadiance > vec3f(0.0))) {
    let blocked = isOccluded(p + hit.normal * 0.005, sunDirection, 1000.0);

    if (!blocked) {
      radiance += diffuseAlbedo * (sunRadiance * cosine / 3.14159265359);
    }
  }

  // Depth is only a background guard in sampleProbes. This hit is a known
  // world-space surface, so use zero rather than sampling camera depth here.
  radiance += sampleProbes(atlas, p, hit.normal, 0.0, diffuseAlbedo, giEnabled);

  // Only one reflection hit: reflected surfaces contribute emission and
  // diffuse lighting, not another mirror ray (no recursive reflections yet).

  return radiance * fresnel * mirrorWeight;
}
`;

const skyLighting = {
  ...reflectionFiles,
  '/App.js': { code: app },
  '/ProbeEffect.js': { code: effect, active: true },
  '/Scene.js': { code: scene },
  '/Atmosphere.js': { code: atmosphere },
  '/atmosphere.wgsl': { code: scattering },
  '/skySampling.wgsl': { code: skySampling },
  '/updateProbes.wgsl': { code: updateProbes },
  '/traceReflection.wgsl': { code: traceReflection },
} satisfies SandpackFiles;

export default skyLighting;
