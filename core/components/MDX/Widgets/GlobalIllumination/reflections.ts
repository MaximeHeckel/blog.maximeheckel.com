import type { SandpackFiles } from '@codesandbox/sandpack-react';

import hysteresis from './hysteresis';

const app = `import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { button, folder, Leva, useControls } from 'leva';
import { useEffect, useState } from 'react';
import * as THREE from 'three/webgpu';

import ProbeEffect from './ProbeEffect';
import Scene from './Scene';
import { CAMERA_POSITION, CAMERA_TARGET } from './sceneData';
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

  const { position, intensity } = useControls(
    'Sun',
    {
      position: { value: [-8, 12, 8], step: 0.1 },
      intensity: { value: 10, min: 0, max: 30, step: 0.5 },
    },
    { collapsed: true }
  );

  return (
    <>
      <Scene
        nightTime={false}
        sphereRoughness={sphereRoughness}
        lightPosition={position}
        intensity={intensity}
      />
      <ProbeEffect
        nightTime={false}
        lightPosition={position}
        intensity={intensity}
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
import { SKY } from './Sky';
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
      sunIntensity: uniform(0),
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
    controls.sunIntensity.value = nightTime ? 0 : intensity;
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
    const sky = wgsl(SKY);
    const updateProbes = wgslFn(updateShader, [world]);
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
        sunIntensity: controls.sunIntensity,
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
      sky,
    ])({
      atlas: compute.atlas,
      worldPosition,
      worldNormal: normals.rgb,
      cameraPosition,
      depth: depth.r,
      albedo: albedo.rgb,
      material: material.rg,
      sunDirection: controls.sunDirection,
      sunIntensity: controls.sunIntensity,
      nightTime: controls.nightTime,
      giEnabled: controls.enabled,
      enabled: controls.reflections,
    });

    const background = wgslFn(
      /* wgsl */ \`
      fn background(direction: vec3f) -> vec3f { return staticSky(direction); }
    \`,
      [sky]
    )({ direction: worldPosition.sub(cameraPosition) });

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
        intensity={nightTime ? 0 : intensity}
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

const sceneData = `import worldShader from '!!raw-loader!./world.wgsl';
import * as THREE from 'three/webgpu';
export const getProbeGrid = (density) => [density, density / 2, density];

export const PROBE_MIN = [-10.3, 0.15, -10.3];
export const PROBE_MAX = [10.3, 5.1, 10.3];

export const LIGHT_TARGET = [0, 1.8, 0];
export const CAMERA_POSITION = [3.8, 1.65, -2.6];
export const CAMERA_TARGET = [0, 1.23, 1.3];

export const HISTORY_LIMIT = 256;
export const EMISSION = 18;
const NIGHT_EMISSIVE_STRENGTH = EMISSION;

const ARCADE_HALF_SIZE = 5.2;
const COLUMN_WIDTH = 0.45;
const ARCH_COUNT = 4;
export const ARCH_DEPTH = 0.4;
const ARCADE_SPAN = ARCADE_HALF_SIZE * 2 - ARCH_DEPTH;
const ARCH_PITCH = (ARCADE_SPAN + COLUMN_WIDTH) / ARCH_COUNT;
export const ARCH_INNER = (ARCH_PITCH - COLUMN_WIDTH) / 2;
export const ARCH_CAP_HEIGHT = 1.4125; // Preserve the existing flat roofline height.
const ARCH_SPRING = 3.5;
const WALL_PARTS = ARCH_COUNT * 2 - 1;

// Both raster meshes and probe rays use this description. An arch is an
// rectangular spandrel above a semicircular opening: half width, radius, depth.

export const OBJECTS = [
  {
    kind: 'plane',
    position: [0, 0, 0],
    extent: [10, 0, 10],
    rotation: 0,
    color: '#ffffff',

    // metalness: 0.05,
    // roughness: 0.95
  },

  // Same orange material, radius, and night emission as GI5, near a corner.
  {
    kind: 'sphere',
    position: [3.5, 1.1, 3.5],
    extent: [0.85, 0.85, 0.85],
    rotation: 0,
    color: '#D95635',
    emissive: true,
  },
  {
    kind: 'sphere',
    position: [0, 1.15, 0],
    extent: [0.85, 0.85, 0.85],
    rotation: 0,
    color: '#b8b8b8',
    metalness: 0.85,
    roughness: 0.15,
    material: 'metal',
  },

  // Vivid green, offset from the opposite corner and resting flat on the floor.
  {
    kind: 'box',
    position: [-3.1, 0.8, -2.5],
    extent: [0.85, 0.8, 0.7],
    rotation: Math.PI / 10,
    color: '#48B84A',
    material: 'plain',
  },

  // Low barriers around all four edges. The Z barriers meet the inner
  // faces of the full-length X barriers for clean, non-overlapping corners.
  {
    kind: 'box',
    position: [-9.85, 0.2, 0],
    extent: [0.15, 0.2, 10],
    rotation: 0,
    color: '#f1f1f1',
  },
  {
    kind: 'box',
    position: [0, 0.2, 9.85],
    extent: [9.7, 0.2, 0.15],
    rotation: 0,
    color: '#f1f1f1',
  },
  {
    kind: 'box',
    position: [9.85, 0.2, 0],
    extent: [0.15, 0.2, 10],
    rotation: 0,
    color: '#f1f1f1',
  },
  {
    kind: 'box',
    position: [0, 0.2, -9.85],
    extent: [9.7, 0.2, 0.15],
    rotation: 0,
    color: '#f1f1f1',
  },
];

// One shared post per corner. Each wall terminates at its inner face;
// perpendicular walls no longer overlap or leave stepped exterior corners.
for (const x of [-ARCADE_HALF_SIZE, ARCADE_HALF_SIZE]) {
  for (const z of [-ARCADE_HALF_SIZE, ARCADE_HALF_SIZE]) {
    const height = ARCH_SPRING + ARCH_CAP_HEIGHT;
    OBJECTS.push({
      kind: 'box',
      position: [x, height / 2, z],
      extent: [ARCH_DEPTH / 2, height / 2, ARCH_DEPTH / 2],
      rotation: 0,
      color: '#f1f1f1',
    });
  }
}

// Integrated open roof: beam tops sit below the arcade tops, and ends
// meet the inner wall faces without overlapping or projecting outside.
const ROOF_BEAM_HEIGHT = 0.32;
const ROOF_BEAM_INSET = 0.2;

// One beam per interior column, sharing its centerline and width.
for (let column = 1; column < ARCH_COUNT; column++) {
  const x = (column - ARCH_COUNT / 2) * ARCH_PITCH;
  OBJECTS.push({
    kind: 'box',
    position: [
      x,
      ARCH_SPRING + ARCH_CAP_HEIGHT - ROOF_BEAM_HEIGHT / 2 - ROOF_BEAM_INSET,
      0,
    ],
    extent: [
      COLUMN_WIDTH / 2,
      ROOF_BEAM_HEIGHT / 2,
      ARCADE_HALF_SIZE - ARCH_DEPTH / 2,
    ],
    rotation: 0,
    color: '#f1f1f1',
  });
}

// Cover only the outer +X bay above the orange sphere. The slab rests
// on the full width of the first beam, with its underside at the beam top.
const ROOF_SLAB_THICKNESS = 0.2;
const ROOF_SLAB_INNER_X = ARCH_PITCH - COLUMN_WIDTH / 2;
const ROOF_SLAB_OUTER_X = ARCADE_HALF_SIZE - ARCH_DEPTH / 2;
OBJECTS.push({
  kind: 'box',
  position: [
    (ROOF_SLAB_INNER_X + ROOF_SLAB_OUTER_X) / 2,
    ARCH_SPRING + ARCH_CAP_HEIGHT - ROOF_BEAM_INSET + ROOF_SLAB_THICKNESS / 2,
    0,
  ],
  extent: [
    (ROOF_SLAB_OUTER_X - ROOF_SLAB_INNER_X) / 2,
    ROOF_SLAB_THICKNESS / 2,
    ARCADE_HALF_SIZE - ARCH_DEPTH / 2,
  ],
  rotation: 0,
  color: '#f1f1f1',
  material: 'stone',
});

const STANDALONE_COUNT = OBJECTS.length;

for (let side = 0; side < 4; side++) {
  const rotation = (side * Math.PI) / 2;
  const axis = new THREE.Vector3(0, 1, 0);
  const positionOnSide = (x, y) =>
    new THREE.Vector3(x, y, -ARCADE_HALF_SIZE)
      .applyAxisAngle(axis, rotation)
      .toArray();

  for (let opening = 0; opening < ARCH_COUNT; opening++) {
    const x = (opening - (ARCH_COUNT - 1) / 2) * ARCH_PITCH;
    OBJECTS.push({
      kind: 'arch',
      position: positionOnSide(x, ARCH_SPRING),
      extent: [ARCH_INNER, ARCH_INNER, ARCH_DEPTH / 2],
      rotation,
      color: '#f1f1f1',
    });
  }

  const height = ARCH_SPRING + ARCH_CAP_HEIGHT;

  for (let column = 1; column < ARCH_COUNT; column++) {
    const x = (column - ARCH_COUNT / 2) * ARCH_PITCH;
    OBJECTS.push({
      kind: 'box',
      position: positionOnSide(x, height / 2),
      extent: [COLUMN_WIDTH / 2, height / 2, ARCH_DEPTH / 2],
      rotation,
      color: '#f1f1f1',
    });
  }
}

const vectorCode = (values) =>
  \`vec3f(\${values.map((value) => value.toFixed(8)).join(', ')})\`;

// Keep serialization outside WGSL so the shader stays readable in the editor.

const shapeDeclarations = OBJECTS.map((object) => {
  const albedo = new THREE.Color(object.color);
  const emission = new THREE.Color(
    object.emissive ? '#F2701F' : '#000000'
  ).multiplyScalar(NIGHT_EMISSIVE_STRENGTH);
  const kind =
    object.kind === 'sphere'
      ? 1
      : object.kind === 'arch'
        ? 2
        : object.kind === 'plane'
          ? 3
          : 0;

  return \`Shape(\${[
    vectorCode(object.position),
    vectorCode(object.extent),
    vectorCode(albedo.toArray()),
    object.rotation.toFixed(8),
    \`\${kind}u\`,
    vectorCode(emission.toArray()),
    (object.metalness ?? 0).toFixed(8),
  ].join(', ')})\`;
}).join(',\\n');

export const createWorld = (grid) =>
  worldShader.replace(
    '/* SCENE_DATA */',
    \`
const shapes = array<Shape, \${OBJECTS.length}>(\${shapeDeclarations});
const gridSize = vec3i(\${grid.join(', ')});
const probeMin = \${vectorCode(PROBE_MIN)};
const probeMax = \${vectorCode(PROBE_MAX)};
\`
  );

export function isInsideObject(position) {
  return OBJECTS.some((object) => {
    const p = position.clone().sub(new THREE.Vector3(...object.position));
    p.applyAxisAngle(new THREE.Vector3(0, 1, 0), -object.rotation);

    if (object.kind === 'arch') {
      return (
        p.y > -0.025 &&
        p.y < ARCH_CAP_HEIGHT + 0.025 &&
        Math.abs(p.z) < object.extent[2] + 0.025 &&
        Math.hypot(p.x, p.y) > object.extent[1] - 0.025 &&
        Math.abs(p.x) < object.extent[0] + 0.025
      );
    }

    return object.kind === 'sphere'
      ? p.length() < object.extent[0] + 0.025
      : p
          .toArray()
          .every((v, axis) => Math.abs(v) < object.extent[axis] + 0.025);
  });
}
`;

const world = `// The same object data builds the visible meshes and these tracing shapes.

// Albedo is the fraction/color of light reflected by a diffuse material.
// Emission is light the material produces itself. Both use linear RGB.
struct Shape {
  center: vec3f,
  extent: vec3f,
  albedo: vec3f,
  angle: f32,
  kind: u32,
  emission: vec3f,
  metalness: f32,
}

// A hit tells us how far to travel, which way the surface faces, and which
// material to read. id = -1 means the ray found no object within our range.
struct SceneHit {
  distance: f32,
  normal: vec3f,
  id: i32,
}

/* SCENE_DATA */

// N probes have N - 1 gaps: the first and last sit at the volume bounds.
const probeSpacing = (probeMax - probeMin) / vec3f(gridSize - vec3i(1));

fn rotateY(p: vec3f, angle: f32) -> vec3f {
  let c = cos(angle);
  let s = sin(angle);

  return vec3f(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

// A light meter buried inside an opaque object cannot represent the room.
// Reject those probes, with a small margin to avoid nearly touching surfaces.
fn insideSolid(p: vec3f) -> bool {
  for (var i = 0u; i < 44u; i++) {
    let shape = shapes[i];
    let local = rotateY(p - shape.center, -shape.angle);

    if (shape.kind == 1u) {
      if (length(local) < shape.extent.x + 0.025) {
        return true;
      }
    } else if (shape.kind == 2u) {
      let radius = length(local.xy);

      if (local.y > -0.025 && abs(local.z) < shape.extent.z + 0.025
        && local.y <  1.41250000 + 0.025
        && radius > shape.extent.y - 0.025 && abs(local.x) < shape.extent.x + 0.025) {
          return true;
        }
    } else if (all(abs(local) < shape.extent + vec3f(0.025))) {
      return true;
    }
  }

  return false;
}

// A rectangular spandrel minus the upper half of a cylinder. Test the
// opening's curved soffit and all six flat bounding faces analytically.
fn traceArch(ro: vec3f, rd: vec3f, extent: vec3f) -> SceneHit {
  var hit = SceneHit(1000.0, vec3f(0.0), -1);
  let low = vec3f(-extent.x, 0.0, -extent.z);
  let high = vec3f(extent.x, 1.41250000, extent.z);
  let safe = select(vec3f(-1.0), vec3f(1.0), rd >= vec3f(0.0)) * max(abs(rd), vec3f(0.000001));
  let entry = min((low - ro) / safe, (high - ro) / safe);
  let exit = max((low - ro) / safe, (high - ro) / safe);

  if (min(min(exit.x, exit.y), exit.z) < max(max(max(entry.x, entry.y), entry.z), 0.001)) {
    return hit;
  }

  var candidates = array<f32, 8>(-1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0);
  let a = dot(rd.xy, rd.xy);
  let b = dot(ro.xy, rd.xy);
  let discriminant = b * b - a * (dot(ro.xy, ro.xy) - extent.y * extent.y);

  if (a > 0.0000001 && discriminant >= 0.0) {
    candidates[0] = (-b - sqrt(discriminant)) / a;
    candidates[1] = (-b + sqrt(discriminant)) / a;
  }

  for (var axis = 0; axis < 3; axis++) {
    if (abs(rd[axis]) > 0.000001) {
      candidates[2 + axis * 2] = (low[axis] - ro[axis]) / rd[axis];
      candidates[3 + axis * 2] = (high[axis] - ro[axis]) / rd[axis];
    }
  }

  for (var face = 0; face < 8; face++) {
    let t = candidates[face];

    if (t <= 0.001 || t >= hit.distance) {
      continue;
    }
    let p = ro + rd * t;

    if (any(p < low - vec3f(0.0001)) || any(p > high + vec3f(0.0001))
      || length(p.xy) < extent.y - 0.0001) {
        continue;
      }

    var normal = vec3f(0.0);

    if (face < 2) {
      normal = vec3f(-normalize(p.xy), 0.0);
    } else {
      normal[(face - 2) / 2] = select(-1.0, 1.0, (face % 2) == 1);
    }
    hit = SceneHit(t, normal, 0);
  }

  return hit;
}

// Intersect one candidate in its local coordinates. The wall broad phase
// below supplies only shapes touched by the ray's span through that wall.
fn traceShape(ro: vec3f, rd: vec3f, i: u32) -> SceneHit {
  let shape = shapes[i];
  var distance = -1.0;
  var normal = vec3f(0.0);

  if (shape.kind == 1u) {
    let b = dot(ro, rd);
    let c = dot(ro, ro) - shape.extent.x * shape.extent.x;

    // Solve where the ray reaches the sphere's radius. A negative
    // discriminant means it misses; otherwise there are entry/exit roots.
    let discriminant = b * b - c;

    if (discriminant >= 0.0) {
      // Prefer the entry. If we started inside, use the exit instead.
      distance = -b - sqrt(discriminant);

      if (distance < 0.001) { distance = -b + sqrt(discriminant); }
      normal = normalize(ro + rd * distance);
    }
  } else if (shape.kind == 2u) {
    let arch = traceArch(ro, rd, shape.extent);
    distance = arch.distance;
    normal = arch.normal;
  } else if (shape.kind == 3u) {
    // A finite horizontal plane, visible only from its upward-facing side.

    if (rd.y < -0.000001) {
      let t = -ro.y / rd.y;
      let p = ro + rd * t;

      if (t > 0.001 && all(abs(p.xz) <= shape.extent.xz)) {
        distance = t;
        normal = vec3f(0.0, 1.0, 0.0);
      }
    }
  } else {
    // A box is the overlap of three pairs of planes, called slabs.
    // Find when the ray enters/exits each pair. All three intervals must
    // overlap to hit the box. Avoid dividing by zero for parallel rays.
    let safeDirection = select(vec3f(-1.0), vec3f(1.0), rd >= vec3f(0.0))
      * max(abs(rd), vec3f(0.000001));
    let a = (-shape.extent - ro) / safeDirection;
    let b = (shape.extent - ro) / safeDirection;
    let entry = min(a, b);
    let exit = max(a, b);
    let nearT = max(max(entry.x, entry.y), entry.z);
    let farT = min(min(exit.x, exit.y), exit.z);

    if (farT >= max(nearT, 0.001)) {
      distance = select(farT, nearT, nearT > 0.001);
      let localHit = ro + rd * distance;

      // On the face we hit, one normalized coordinate is about +1 or -1.
      // That coordinate identifies the face and its outward normal.
      let relative = abs(localHit / shape.extent);

      if (relative.x >= relative.y && relative.x >= relative.z) {
        normal = vec3f(sign(localHit.x), 0.0, 0.0);
      } else if (relative.y >= relative.z) {
        normal = vec3f(0.0, sign(localHit.y), 0.0);
      } else {
        normal = vec3f(0.0, 0.0, sign(localHit.z));
      }
    }
  }

  return SceneHit(distance, normal, i32(i));
}

// Slab interval with explicit parallel handling: no artificial ray slope
// for grazing rays. Bounds are padded conservatively before this call.
fn boundsInterval(ro: vec3f, rd: vec3f, low: vec3f, high: vec3f, limit: f32) -> vec2f {
  var near = 0.001;
  var far = limit;

  for (var axis = 0; axis < 3; axis++) {
    if (rd[axis] == 0.0) {
      if (ro[axis] < low[axis] || ro[axis] > high[axis]) {
        return vec2f(1.0, -1.0);
      }
    } else {
      let a = (low[axis] - ro[axis]) / rd[axis];
      let b = (high[axis] - ro[axis]) / rd[axis];
      near = max(near, min(a, b));
      far = min(far, max(a, b));
    }
  }

  return vec2f(near, far);
}

fn traceWorld(origin: vec3f, direction: vec3f) -> SceneHit {
  var closest = SceneHit(1000.0, vec3f(0.0), -1);

  // Standalone objects may be rotated independently of the arcade walls.

  for (var i = 0u; i < 16u; i++) {
    let shape = shapes[i];
    let ro = rotateY(origin - shape.center, -shape.angle);
    let rd = rotateY(direction, -shape.angle);
    var hit = traceShape(ro, rd, i);

    if (hit.distance > 0.001 && hit.distance < closest.distance) {
      hit.normal = rotateY(hit.normal, shape.angle);
      closest = hit;
    }
  }

  for (var side = 0u; side < 4u; side++) {
    let first = 16u + side * 7u;
    let angle = shapes[first].angle;
    let ro = rotateY(origin, -angle) + vec3f(0.0, 0.0, 5.20000000);
    let rd = rotateY(direction, -angle);
    let low = vec3f(-5.00000000, 0.0, -0.20000000) - vec3f(0.0002);
    let high = vec3f(5.00000000, 4.91250000, 0.20000000) + vec3f(0.0002);
    let interval = boundsInterval(ro, rd, low, high, closest.distance);

    if (interval.x > interval.y) {
      continue;
    }

    // A grazing ray can cross several bays. Use its entire interval through
    // the wall, not just its entry point, so those intersections remain exact.
    let x0 = ro.x + rd.x * interval.x;
    let x1 = ro.x + rd.x * interval.y;
    let minX = min(x0, x1) - 0.0002;
    let maxX = max(x0, x1) + 0.0002;

    for (var part = 0u; part < 7u; part++) {
      let i = first + part;
      let isArch = part < 4u;
      let column = f32(i32(part) - 4);
      let centerX = select((column - 1.0) * 2.61250000, (f32(part) - 1.50000000) * 2.61250000, isArch);

      if (centerX + shapes[i].extent.x < minX || centerX - shapes[i].extent.x > maxX) {
        continue;
      }

      let centerY = select(2.45625000, 3.50000000, isArch);
      let hit = traceShape(ro - vec3f(centerX, centerY, 0.0), rd, i);

      if (hit.distance > 0.001 && hit.distance < closest.distance) {
        closest = SceneHit(hit.distance, rotateY(hit.normal, angle), hit.id);
      }
    }
  }

  return closest;
}

// Visibility queries need only one blocker before the endpoint, not the
// closest surface or its normal. Keep the same roots and tolerances as tracing.
fn occludesArch(ro: vec3f, rd: vec3f, extent: vec3f, limit: f32) -> bool {
  let low = vec3f(-extent.x, 0.0, -extent.z);
  let high = vec3f(extent.x, 1.41250000, extent.z);
  let safe = select(vec3f(-1.0), vec3f(1.0), rd >= vec3f(0.0)) * max(abs(rd), vec3f(0.000001));
  let entry = min((low - ro) / safe, (high - ro) / safe);
  let exit = max((low - ro) / safe, (high - ro) / safe);

  if (min(min(exit.x, exit.y), exit.z) < max(max(max(entry.x, entry.y), entry.z), 0.001)) {
    return false;
  }

  var candidates = array<f32, 8>(-1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0);
  let a = dot(rd.xy, rd.xy);
  let b = dot(ro.xy, rd.xy);
  let discriminant = b * b - a * (dot(ro.xy, ro.xy) - extent.y * extent.y);

  if (a > 0.0000001 && discriminant >= 0.0) {
    candidates[0] = (-b - sqrt(discriminant)) / a;
    candidates[1] = (-b + sqrt(discriminant)) / a;
  }

  for (var axis = 0; axis < 3; axis++) {
    if (abs(rd[axis]) > 0.000001) {
      candidates[2 + axis * 2] = (low[axis] - ro[axis]) / rd[axis];
      candidates[3 + axis * 2] = (high[axis] - ro[axis]) / rd[axis];
    }
  }

  for (var face = 0; face < 8; face++) {
    let t = candidates[face];

    if (t <= 0.001 || t >= limit) {
      continue;
    }
    let p = ro + rd * t;

    if (any(p < low - vec3f(0.0001)) || any(p > high + vec3f(0.0001))
      || length(p.xy) < extent.y - 0.0001) {
        continue;
      }

    return true;
  }

  return false;
}

fn occludesShape(ro: vec3f, rd: vec3f, i: u32, limit: f32) -> bool {
  let shape = shapes[i];

  if (shape.kind == 1u) {
    let b = dot(ro, rd);
    let c = dot(ro, ro) - shape.extent.x * shape.extent.x;
    let discriminant = b * b - c;

    if (discriminant < 0.0) {
      return false;
    }
    var t = -b - sqrt(discriminant);

    if (t < 0.001) { t = -b + sqrt(discriminant); }

    return t > 0.001 && t < limit;
  }

  if (shape.kind == 2u) {
    return occludesArch(ro, rd, shape.extent, limit);
  }

  if (shape.kind == 3u) {
    // Match the upward-facing finite floor in traceShape.

    if (rd.y >= -0.000001) {
      return false;
    }
    let t = -ro.y / rd.y;

    if (t <= 0.001 || t >= limit) {
      return false;
    }

    return all(abs((ro + rd * t).xz) <= shape.extent.xz);
  }

  let safeDirection = select(vec3f(-1.0), vec3f(1.0), rd >= vec3f(0.0))
    * max(abs(rd), vec3f(0.000001));
  let a = (-shape.extent - ro) / safeDirection;
  let b = (shape.extent - ro) / safeDirection;
  let entry = min(a, b);
  let exit = max(a, b);
  let nearT = max(max(entry.x, entry.y), entry.z);
  let farT = min(min(exit.x, exit.y), exit.z);

  if (farT < max(nearT, 0.001)) {
    return false;
  }
  let t = select(farT, nearT, nearT > 0.001);

  return t > 0.001 && t < limit;
}

fn isOccluded(origin: vec3f, direction: vec3f, maxDistance: f32) -> bool {
  let limit = min(maxDistance, 1000.0);

  if (limit <= 0.001) {
    return false;
  }

  // Standalone objects may be rotated independently of the arcade walls.

  for (var i = 0u; i < 16u; i++) {
    let shape = shapes[i];
    let ro = rotateY(origin - shape.center, -shape.angle);
    let rd = rotateY(direction, -shape.angle);

    if (occludesShape(ro, rd, i, limit)) {
      return true;
    }
  }

  for (var side = 0u; side < 4u; side++) {
    let first = 16u + side * 7u;
    let angle = shapes[first].angle;
    let ro = rotateY(origin, -angle) + vec3f(0.0, 0.0, 5.20000000);
    let rd = rotateY(direction, -angle);
    let low = vec3f(-5.00000000, 0.0, -0.20000000) - vec3f(0.0002);
    let high = vec3f(5.00000000, 4.91250000, 0.20000000) + vec3f(0.0002);
    let interval = boundsInterval(ro, rd, low, high, limit);

    if (interval.x > interval.y) {
      continue;
    }

    // A grazing ray can cross several bays. Use its entire interval through
    // the wall, not just its entry point, so those intersections remain exact.
    let x0 = ro.x + rd.x * interval.x;
    let x1 = ro.x + rd.x * interval.y;
    let minX = min(x0, x1) - 0.0002;
    let maxX = max(x0, x1) + 0.0002;

    for (var part = 0u; part < 7u; part++) {
      let i = first + part;
      let isArch = part < 4u;
      let column = f32(i32(part) - 4);
      let centerX = select((column - 1.0) * 2.61250000, (f32(part) - 1.50000000) * 2.61250000, isArch);

      if (centerX + shapes[i].extent.x < minX || centerX - shapes[i].extent.x > maxX) {
        continue;
      }

      let centerY = select(2.45625000, 3.50000000, isArch);

      if (occludesShape(ro - vec3f(centerX, centerY, 0.0), rd, i, limit)) {
        return true;
      }
    }
  }

  return false;
}

fn probePosition(cell: vec3i) -> vec3f {
  return probeMin + vec3f(cell) * probeSpacing;
}

// An atlas is simply one 2D texture packing all our 3D probe data.
// Each probe owns six adjacent texels across X. Rows pack Y, then Z slices.
// With our base grid that makes a 144 x 288 texture, independent of screen size.
fn atlasPixel(cell: vec3i, lobe: i32) -> vec2i {
  return vec2i(cell.x * 6 + lobe, cell.y + gridSize.y * cell.z);
}

// A lobe stores the diffuse lighting for an imaginary surface facing one
// direction. The six lobes face +X, -X, +Y, -Y, +Z, -Z.
// Each averages MANY rays over a hemisphere, not just one ray along the axis.
fn lobeNormal(lobe: i32) -> vec3f {
  var n = vec3f(0.0);
  n[lobe / 2] = select(1.0, -1.0, lobe % 2 == 1);

  return n;
}

// The same hash as the other GI demos: turn a 3D seed into two repeatable
// random values between zero and one. This is not blue noise.
fn hash23(seed: vec3f) -> vec2f {
  let h = vec2f(
    dot(seed, vec3f(127.1, 311.7, 74.7)),
    dot(seed, vec3f(269.5, 183.3, 246.1))
  );

  return fract(sin(h) * 43758.5453);
}
`;

const sampleProbes = `fn sampleProbes(
  atlas: texture_2d<f32>, worldPosition: vec3f,
  worldNormal: vec3f, depth: f32, albedo: vec3f, enabled: f32
) -> vec3f {
  if (depth >= 1.0 || enabled < 0.5) {
    return vec3f(0.0);
  }

  // Move the lookup slightly outside the receiving surface to avoid self-hits
  // when checking which probes it can see. This is a numerical bias, not fog.
  let n = normalize(worldNormal);

  // Keep the bias small: a large offset can put the sphere's underside
  // inside the floor and falsely block every connection to its neighbors.
  let p = worldPosition + n * 0.005;

  // Convert scene units to grid units: e.g. X = 3.25 sits between probes 3/4.
  // Clamp to our finite volume; there are no extra probes beyond its bounds.
  let coordinate = clamp((p - probeMin) / probeSpacing, vec3f(0.0), vec3f(gridSize - vec3i(1)));

  // Center a 3 x 3 x 3 neighborhood on the closest grid point. Near contact,
  // several probes can lie inside an object or behind it; the wider support
  // gives us more valid measurements than the eight corners of one cell.
  let base = vec3i(floor(coordinate + 0.5)) - vec3i(1);
  var incoming = vec3f(0.0);
  var totalWeight = 0.0;

  // Visit up to 27 neighbors. Outside the finite volume, skip missing probes.

  for (var z = 0; z < 3; z++) {
    for (var y = 0; y < 3; y++) {
      for (var x = 0; x < 3; x++) {
        let offset = vec3i(x, y, z);
        let cell = base + offset;

        if (any(cell < vec3i(0)) || any(cell >= gridSize)) {
          continue;
        }

        if (textureLoad(atlas, atlasPixel(cell, 0), 0).a < 0.5) {
          continue;
        }

        let delta = probePosition(cell) - p;
        let distance = length(delta);

        // Don't borrow lighting from a probe on the other side of an object.
        // Trace toward the probe, but reject it ONLY if an object is closer:
        // a hit beyond the probe does not block this connection.
        // This tiny scene can afford exact visibility rays instead of storing
        // approximate visibility statistics, as a larger DDGI system might.
        // Hard rejection can still cause seams when the usable neighbors change.

        if (distance > 0.001) {
          if (isOccluded(p, delta / distance, distance - 0.01)) {
            continue;
          }
        }

        // A quadratic B-spline gives closer probes more influence, with the
        // weight fading smoothly to zero 1.5 grid steps away. When our nearest
        // grid point changes, entering/leaving probes have zero influence.
        // Unlike a blur of the final image, this still checks each connection
        // for occlusion above, so blocked neighbors cannot contribute.
        let d = abs(vec3f(cell) - coordinate);
        let weights = select(
          0.5 * (vec3f(1.5) - d) * (vec3f(1.5) - d),
          vec3f(0.75) - d * d, d < vec3f(0.5)
        );
        let weight = weights.x * weights.y * weights.z;
        var diffuse = vec3f(0.0);

        // A floor facing +Y uses this probe's +Y lighting. A tilted surface
        // mixes the X/Y/Z lobes facing the same way as its normal.
        // Squared normal components sum to one, preserving constant lighting.
        // Six lobes approximate directional variation; they cannot reconstruct
        // sharp reflections or all the detail of a full directional light map.

        for (var axis = 0; axis < 3; axis++) {
          let lobe = axis * 2 + select(0, 1, n[axis] < 0.0);
          diffuse += textureLoad(atlas, atlasPixel(cell, lobe), 0).rgb * n[axis] * n[axis];
        }
        incoming += diffuse * weight;
        totalWeight += weight;
      }
    }
  }

  // Some neighbors may have been rejected, so normalize by the weights that
  // actually survived. If none survive, incoming is zero and we return black.
  // Multiply by THIS surface's albedo: a red surface reflects mostly red light.
  // The probe values already contain the diffuse 1/PI factor.

  return albedo * incoming / max(totalWeight, 0.00001);
}
`;

const updateProbes = `fn updateProbes(
  pixel: vec2i, previous: texture_2d<f32>, frame: u32,
  stableFrames: u32, hysteresis: f32,
  rays: u32, sunDirection: vec3f, sunIntensity: f32, nightTime: f32
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

      if (cosine > 0.0 && sunIntensity > 0.0) {
        // Ask whether sunlight can reach the hit. The tiny outward offset
        // prevents the surface from immediately intersecting itself.
        let blocked = isOccluded(p + hit.normal * 0.005, sunDirection, 1000.0);

        if (!blocked) {
          // For a matte (Lambert) material, reflected radiance is
          // albedo / PI * incoming sunlight * cosine. Radiance means the light
          // traveling from that hit toward the probe.
          // We use sunlight + emission only, never previous probe lighting:
          // temporal averaging reduces noise but does not add extra bounces.
          incoming += shapes[hit.id].albedo * (1.0 - shapes[hit.id].metalness) * (sunIntensity * cosine / 3.14159265359);
        }
      }
    }

    // Misses contribute zero; the blue background is not an environment light.
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
  sunDirection: vec3f, sunIntensity: f32, nightTime: f32,
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
    return staticSky(direction) * fresnel * mirrorWeight;
  }

  if (dot(hit.normal, -direction) <= 0.0) {
    return vec3f(0.0);
  }

  let p = origin + direction * hit.distance;
  let surface = shapes[hit.id];
  let diffuseAlbedo = surface.albedo * (1.0 - surface.metalness);
  var radiance = surface.emission * nightTime;
  let cosine = max(dot(hit.normal, sunDirection), 0.0);

  if (cosine > 0.0 && sunIntensity > 0.0) {
    let blocked = isOccluded(p + hit.normal * 0.005, sunDirection, 1000.0);

    if (!blocked) {
      radiance += diffuseAlbedo * (sunIntensity * cosine / 3.14159265359);
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

const reflections = {
  ...hysteresis,
  '/App.js': { code: app },
  '/ProbeEffect.js': { code: effect, active: true },
  '/Scene.js': { code: scene },
  '/sceneData.js': { code: sceneData },
  '/world.wgsl': { code: world },
  '/sampleProbes.wgsl': { code: sampleProbes },
  '/updateProbes.wgsl': { code: updateProbes },
  '/traceReflection.wgsl': { code: traceReflection },
} satisfies SandpackFiles;

export default reflections;
