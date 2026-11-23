import type { SandpackFiles } from '@codesandbox/sandpack-react';

import probeBased from './probeBased';

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

  const [
    { nightTime, enabled, showProbes, rays, density, hysteresis },
    setControls,
  ] = useControls(
    () => ({
      nightTime: { value: false, label: 'Night Time' },
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
              '8 × 5 × 8': 8,
              '12 × 8 × 12': 12,
              '16 × 10 × 16': 16,
              '20 × 13 × 20': 20,
              '24 × 15 × 24': 24,
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
        hysteresis={hysteresis}
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
  hysteresis,
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

const hysteresis = {
  ...probeBased,
  '/App.js': { code: app },
  '/ProbeEffect.js': { code: effect, active: true },
  '/updateProbes.wgsl': { code: updateProbes },
} satisfies SandpackFiles;

export default hysteresis;
