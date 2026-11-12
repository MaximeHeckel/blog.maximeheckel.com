import type { SandpackFiles } from '@codesandbox/sandpack-react';

const app = `import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { button, folder, Leva, useControls } from 'leva';
import { useEffect, useState } from 'react';
import * as THREE from 'three/webgpu';

import ProbeEffect from './ProbeEffect';
import Scene from './Scene';
import { CAMERA_TARGET } from './sceneData';
import './scene.css';

function Room() {
  const [reset, setReset] = useState(0);

  const [{ nightTime, enabled, showProbes, rays, density }, setControls] =
    useControls(
      () => ({
        nightTime: { value: false, label: 'Night Time' },
        enabled: { value: true, label: 'GI' },
        showProbes: { value: false, label: 'Show probes' },
        'Probe settings': folder(
          {
            density: {
              value: 20,
              label: 'Density',
              options: {
                '8 × 5 × 8': 8,
                '12 × 8 × 12': 12,
                '16 × 10 × 16': 16,
                '20 × 13 × 20': 20,
                '24 × 15 × 24': 24,
              },
            },
            rays: { value: 16, options: [8, 16, 32], label: 'Rays per lobe' },
            frames: { value: 0, step: 1, disabled: true, label: 'Frames' },
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
      position: { value: [20, 4, 5], step: 0.1 },
      intensity: { value: 10, min: 0, max: 30, step: 0.5 },
    },
    { collapsed: true }
  );

  return (
    <>
      <Scene
        ambientIntensity={0.15}
        nightTime={nightTime}
        lightPosition={position}
        intensity={intensity}
      />
      <ProbeEffect
        nightTime={nightTime}
        lightPosition={position}
        intensity={intensity}
        enabled={enabled}
        showProbes={showProbes}
        rays={rays}
        density={density}
        reset={reset}
        onFrames={setControls}
      />
      <OrbitControls
        makeDefault
        target={CAMERA_TARGET}
        minDistance={4}
        maxDistance={12}
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
        camera={{ position: [0.6, 2.7, 8.6], fov: 40, near: 0.1, far: 80 }}
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

const effect = `import { SKY } from './Sky';
import sampleShader from '!!raw-loader!./sampleProbes.wgsl';
import updateShader from '!!raw-loader!./updateProbes.wgsl';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { fxaa } from 'three/examples/jsm/tsl/display/FXAANode.js';
import {
  cameraPosition,
  getViewPosition,
  materialColor,
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
  reset,
  onFrames,
}) {
  const { gl, scene, camera } = useThree();

  const renderRef = useRef(null);
  const revision = useRef(0);
  const markersVisible = useRef(showProbes);

  const controls = useMemo(
    () => ({
      frame: uniform(0, 'uint'),
      rays: uniform(16, 'uint'),
      sunDirection: uniform(new THREE.Vector3()),
      sunIntensity: uniform(0),
      nightTime: uniform(0),
      enabled: uniform(1),
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

    // A new lighting setup discards history. Camera movement never does.
    revision.current++;
  }, [controls, lightX, lightY, lightZ, intensity, nightTime, rays, reset]);

  useLayoutEffect(() => {
    controls.enabled.value = enabled ? 1 : 0;
    markersVisible.current = showProbes;
  }, [controls, enabled, showProbes]);

  useEffect(() => {
    const world = wgsl(createWorld(grid));
    const updateProbes = wgslFn(updateShader, [world]);
    const sampleProbes = wgslFn(sampleShader, [world]);

    const compute = createProbeCompute(grid, (pixel, previous) =>
      updateProbes({
        pixel,
        previous,
        frame: controls.frame,
        rays: controls.rays,
        sunDirection: controls.sunDirection,
        sunIntensity: controls.sunIntensity,
        nightTime: controls.nightTime,
      })
    );
    const markers = createProbeMarkers(grid);

    const scenePass = pass(scene, camera, { samples: 0 });
    scenePass.setMRT(
      mrt({ output, normal: normalWorld, albedo: materialColor })
    );

    const color = scenePass.getTextureNode('output');
    const depth = scenePass.getTextureNode('depth');
    const normals = scenePass.getTextureNode('normal');
    const albedo = scenePass.getTextureNode('albedo');

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
      albedo: albedo.rgb,
      enabled: controls.enabled,
    });

    const sky = wgsl(SKY);
    const background = wgslFn(
      /* wgsl */ \`
      fn background(direction: vec3f) -> vec3f { return staticSky(direction); }
    \`,
      [sky]
    )({ direction: worldPosition.sub(cameraPosition) });

    const combined = vec4(
      mix(color.rgb.add(indirect), background, depth.r.greaterThanEqual(1)),
      1
    );

    // Keep daylight bloom subtle and give night emitters a stronger glow.
    const glow = bloom(combined, 1, 0.3, 1);
    const bloomStrength = mix(0.15, 0.5, controls.nightTime);
    const bloomed = vec4(combined.rgb.add(glow.rgb.mul(bloomStrength)), 1);

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
    let previousRevision = -1;

    renderRef.current = () => {
      if (revision.current !== previousRevision) {
        previousRevision = revision.current;
        frames = 0;
        onFrames({ frames: 0 });
      }

      // Cache 256 frame batches per lobe. Moving the camera reuses this atlas.
      if (frames < HISTORY_LIMIT) {
        controls.frame.value = frames;
        compute.update(gl);
        frames++;

        if (frames === 1 || frames % 8 === 0) onFrames({ frames });
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

const updateProbes = `fn updateProbes(
  pixel: vec2i, previous: texture_2d<f32>, frame: u32,
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
        let shadow = traceWorld(p + hit.normal * 0.005, sunDirection);

        if (shadow.id < 0) {
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

  // Lighting changes reset the frame counter, discarding stale history.

  if (frame == 0u) {
    return vec4f(fresh, 1.0);
  }

  // RGB stores lighting; alpha counts accumulated frame batches (not rays).
  // Read the SAME texel from last frame: this probe never moves with the camera,
  // so no previous-screen-UV calculation or reprojection is needed.
  let history = textureLoad(previous, pixel, 0);
  let count = min(history.a + 1.0, 256.0);

  return vec4f(mix(history.rgb, fresh, 1.0 / count), count);
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
          let obstruction = traceWorld(p, delta / distance);

          if (obstruction.distance < distance - 0.01) {
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

const world = `// The same object data builds the visible meshes and these tracing shapes.

// Albedo is the fraction/color of light reflected by a diffuse material.
// Emission is light the material produces itself. Both use linear RGB.
struct Shape {
  center: vec3f,
  extent: vec3f,
  albedo: vec3f,
  angle: f32,
  sphere: u32,
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

fn rotateY(p: vec3f, angle: f32) -> vec3f {
  let c = cos(angle);
  let s = sin(angle);

  return vec3f(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

// A light meter buried inside an opaque object cannot represent the room.
// Reject those probes, with a small margin to avoid nearly touching surfaces.
fn insideSolid(p: vec3f) -> bool {
  for (var i = 0u; i < SHAPE_COUNT; i++) {
    let shape = shapes[i];
    let local = rotateY(p - shape.center, -shape.angle);

    if (shape.sphere == 1u) {
      if (length(local) < shape.extent.x + 0.025) {
        return true;
      }
    } else if (all(abs(local) < shape.extent + vec3f(0.025))) {
      return true;
    }
  }

  return false;
}

// A ray is origin + direction * distance. Callers supply a unit direction,
// so distance is measured in scene units. Test every shape and keep the first
// positive intersection; geometry farther along the ray is hidden behind it.
fn traceWorld(origin: vec3f, direction: vec3f) -> SceneHit {
  var closest = SceneHit(1000.0, vec3f(0.0), -1);

  for (var i = 0u; i < SHAPE_COUNT; i++) {
    let shape = shapes[i];

    // Move the ray into this object's coordinates. The object is now centered
    // at zero and its box faces line up with X/Y/Z, simplifying the math.
    let ro = rotateY(origin - shape.center, -shape.angle);
    let rd = rotateY(direction, -shape.angle);
    var distance = -1.0;
    var normal = vec3f(0.0);

    if (shape.sphere == 1u) {
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

    if (distance > 0.001 && distance < closest.distance) {
      // Return the normal in world space, where we calculate the lighting.
      closest = SceneHit(distance, rotateY(normal, shape.angle), i32(i));
    }
  }

  return closest;
}

fn probePosition(cell: vec3i) -> vec3f {
  return probeMin + vec3f(cell) * probeSpacing;
}

// An atlas is simply one 2D texture packing all our 3D probe data.
// Each probe owns six adjacent texels across X. Rows pack Y, then Z slices.
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

const scene = `import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three/webgpu';

import { OBJECTS, LIGHT_TARGET, EMISSION } from './sceneData';

export default function Scene({
  nightTime,
  lightPosition,
  intensity,
  ambientIntensity = 0,
}) {
  // Use the renderer's Three.js light class (Sandpack also loads Three via Fiber).
  const light = useMemo(() => new THREE.DirectionalLight(), []);
  const ambient = useMemo(() => new THREE.AmbientLight(), []);

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

    // Fit the window and the displayed corner in light space. Refit when
    // the sun moves; keep the depth range wide enough for the room's walls.
    for (const x of [-5, 5.8]) {
      for (const y of [0, 6]) {
        for (const z of [-4, 5]) {
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
      <color attach="background" args={['#090b0e']} />
      <primitive object={ambient} intensity={ambientIntensity} />

      {OBJECTS.map((object, index) => (
        <mesh
          key={index}
          position={object.position}
          rotation={[0, object.rotation, 0]}
          castShadow
          receiveShadow
        >
          {object.kind === 'sphere' ? (
            <sphereGeometry args={[object.extent[0], 64, 32]} />
          ) : (
            <boxGeometry args={object.extent.map((v) => v * 2)} />
          )}
          <meshStandardMaterial
            color={object.color}
            roughness={1}
            metalness={0}
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
        shadow-camera-far={40}
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

// Density sets X/Z counts; Y follows the room proportions.
export const getProbeGrid = (density) => [
  density,
  Math.round(density * 0.625),
  density,
];

export const PROBE_MIN = [-4.75, 0.15, -3.75];
export const PROBE_MAX = [4.75, 5.85, 7.25];

export const LIGHT_TARGET = [1, 1, -3];
export const CAMERA_TARGET = [-1.6, 1.45, -2.0];

export const HISTORY_LIMIT = 256;
export const EMISSION = 10;

const box = (position, size, color = '#E8E3D9', rotation = 0) => ({
  kind: 'box',
  position,
  extent: size.map((value) => value / 2),
  color,
  rotation,
});

const sphere = (position, radius, color, emissive = false) => ({
  kind: 'sphere',
  position,
  extent: [radius, radius, radius],
  color,
  rotation: 0,
  emissive,
});

// Meshes and analytic rays share this description. Boxes use HALF extents.
export const OBJECTS = [
  box([0, -0.15, 3], [11.6, 0.3, 15.6]),
  box([0, 6.15, 3], [11.6, 0.3, 15.6]),
  box([0, 3, -4.4], [11.6, 6, 0.8]),
  box([-5.4, 3, 3], [0.8, 6, 14]),
  box([0, 3, 10.4], [11.6, 6, 0.8]),

  // Four solid pieces surround the right-hand window: y [1.2, 4.8], z [-1.5, 5].
  box([5.4, 3, -2.75], [0.8, 6, 2.5]),
  box([5.4, 3, 7.5], [0.8, 6, 5]),
  box([5.4, 0.6, 1.75], [0.8, 1.2, 6.5]),
  box([5.4, 5.4, 1.75], [0.8, 1.2, 6.5]),
  box([5.3, 1.2, 1.75], [1.1, 0.12, 6.7], '#F0EDE5'),

  // Poster composition: orange sphere left, tall blue box right, green foreground.
  sphere([-3.1, 1.2, -2.65], 1.2, '#D95635', true),
  box([-0.2, 1.65, -2.8], [2.1, 3.3, 1.9], '#3674A5', 0.12),
  sphere([-0.85, 0.57, -0.9], 0.57, '#69804C'),
];

const vector = (values) =>
  \`vec3f(\${values.map((v) => v.toFixed(8)).join(', ')})\`;

const declarations = OBJECTS.map((object) => {
  const albedo = new THREE.Color(object.color).toArray();
  const emission = new THREE.Color(object.emissive ? '#F2701F' : '#000000')
    .multiplyScalar(EMISSION)
    .toArray();

  return \`Shape(\${vector(object.position)}, \${vector(object.extent)}, \${vector(albedo)}, \${object.rotation.toFixed(8)}, \${object.kind === 'sphere' ? '1u' : '0u'}, \${vector(emission)}, 0.0)\`;
}).join(',\\n');

// Only scene data is injected; the tracing algorithm stays in world.wgsl.
export const createWorld = (grid) =>
  worldShader.replace(
    '/* SCENE_DATA */',
    \`
  const SHAPE_COUNT = \${OBJECTS.length}u;
  const shapes = array<Shape, \${OBJECTS.length}>(\${declarations});
  const gridSize = vec3i(\${grid.join(', ')});
  const probeMin = \${vector(PROBE_MIN)};
  const probeMax = \${vector(PROBE_MAX)};
  const probeSpacing = (probeMax - probeMin) / vec3f(gridSize - vec3i(1));
\`
  );

export function isInsideObject(position) {
  return OBJECTS.some((object) => {
    const p = position.clone().sub(new THREE.Vector3(...object.position));
    p.applyAxisAngle(new THREE.Vector3(0, 1, 0), -object.rotation);

    return object.kind === 'sphere'
      ? p.length() < object.extent[0] + 0.025
      : p
          .toArray()
          .every((v, axis) => Math.abs(v) < object.extent[axis] + 0.025);
  });
}
`;

const probes = `import { Fn, instanceIndex, ivec2, texture, textureStore } from 'three/tsl';
import * as THREE from 'three/webgpu';

import { PROBE_MIN, PROBE_MAX, isInsideObject } from './sceneData';

export function createProbeCompute(grid, buildUpdate) {
  const width = grid[0] * 6;
  const height = grid[1] * grid[2];
  const histories = [0, 1].map(() => {
    const atlas = new THREE.StorageTexture(width, height);
    atlas.type = THREE.HalfFloatType;
    atlas.minFilter = THREE.NearestFilter;
    atlas.magFilter = THREE.NearestFilter;
    atlas.generateMipmaps = false;
    atlas.colorSpace = THREE.NoColorSpace;

    return atlas;
  });
  const atlas = texture(histories[0]);
  const updates = histories.map((previous, index) =>
    Fn(() => {
      const pixel = ivec2(instanceIndex.mod(width), instanceIndex.div(width));
      textureStore(
        histories[1 - index],
        pixel,
        buildUpdate(pixel, texture(previous))
      );
    })().compute(width * height, [64])
  );
  let readIndex = 0;

  return {
    atlas,
    update(renderer) {
      renderer.compute(updates[readIndex]);
      readIndex = 1 - readIndex;
      atlas.value = histories[readIndex];
    },
    dispose() {
      updates.forEach((node) => node.dispose());
      histories.forEach((target) => target.dispose());
    },
  };
}

// Markers live in an overlay scene: they never enter the G-buffer or probe rays.
export function createProbeMarkers(grid) {
  const scene = new THREE.Scene();
  const geometry = new THREE.SphereGeometry(0.035, 6, 4);
  const material = new THREE.MeshBasicNodeMaterial({ color: '#ffcc66' });
  const mesh = new THREE.InstancedMesh(
    geometry,
    material,
    grid[0] * grid[1] * grid[2]
  );
  const matrix = new THREE.Matrix4();
  let count = 0;

  for (let z = 0; z < grid[2]; z++) {
    for (let y = 0; y < grid[1]; y++) {
      for (let x = 0; x < grid[0]; x++) {
        const cell = [x, y, z];
        const p = new THREE.Vector3(
          ...PROBE_MIN.map(
            (min, axis) =>
              min + (cell[axis] * (PROBE_MAX[axis] - min)) / (grid[axis] - 1)
          )
        );

        if (isInsideObject(p)) continue;

        matrix.makeTranslation(p);
        mesh.setMatrixAt(count++, matrix);
      }
    }
  }

  mesh.count = count;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  scene.add(mesh);

  return {
    scene,
    dispose() {
      mesh.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}
`;

const sky = `export const SKY = /* wgsl */ \`
fn staticSky(direction: vec3f) -> vec3f {
  let d = normalize(direction);
  let uv = vec2f(atan2(d.z, d.x) / 6.28318530718 + 0.5,
    asin(clamp(d.y, -1.0, 1.0)) / 3.14159265359 + 0.5);
  let t = clamp(length(abs(uv - 0.5)), 0.0, 0.8);
  return mix(vec3f(0.01, 0.22, 0.98), vec3f(0.36, 0.68, 1.0), t);
}
\`;
`;

const probeBased = {
  '/App.js': { code: app },
  '/ProbeEffect.js': { code: effect, active: true },
  '/updateProbes.wgsl': { code: updateProbes },
  '/sampleProbes.wgsl': { code: sampleProbes },
  '/world.wgsl': { code: world },
  '/Scene.js': { code: scene },
  '/sceneData.js': { code: sceneData },
  '/probes.js': { code: probes },
  '/Sky.js': { code: sky },
} satisfies SandpackFiles;

export default probeBased;
