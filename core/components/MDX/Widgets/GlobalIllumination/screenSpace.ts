import type { SandpackFiles } from '@codesandbox/sandpack-react';

const app = `import { OrbitControls } from '@react-three/drei';
import { Canvas, extend } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import * as THREE from 'three/webgpu';

import GIEffect from './GIEffect';
import Scene, { SCENE_CENTER } from './Scene';
import Sky from './Sky';
import './scene.css';

extend({ MeshBasicNodeMaterial: THREE.MeshBasicNodeMaterial });

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

  if (supported !== true) {
    return (
      <p role="status">
        {supported === null
          ? 'Checking WebGPU support…'
          : 'This playground needs a browser with WebGPU support.'}
      </p>
    );
  }

  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={1}
      camera={{ position: [42, 43.6, 42], fov: 12, near: 0.1, far: 500 }}
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer(props);
        renderer.toneMapping = THREE.NoToneMapping;
        await renderer.init();
        return renderer;
      }}
    >
      <Sky />
      <Scene />
      <GIEffect />
      <OrbitControls makeDefault target={SCENE_CENTER} />
    </Canvas>
  );
}
`;

const effect = `import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { useEffect, useRef } from 'react';
import { fxaa } from 'three/examples/jsm/tsl/display/FXAANode.js';
import {
  getViewPosition,
  materialColor,
  mrt,
  normalWorld,
  output,
  pass,
  renderOutput,
  rtt,
  uniform,
  uv,
  vec4,
  wgslFn,
} from 'three/tsl';
import * as THREE from 'three/webgpu';

import giShader from '!!raw-loader!./gi.wgsl';

const gatherIndirect = wgslFn(giShader);

export default function GIEffect() {
  const { gl, scene, camera } = useThree();
  const postRef = useRef(null);
  const { view, rays } = useControls('Global illumination', {
    view: {
      value: 'Combined',
      options: ['Direct lighting', 'Indirect lighting', 'Combined'],
    },
    rays: { value: 8, options: [8, 16, 32], label: 'Rays per pixel' },
  });

  useEffect(() => {
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

    const indirect = gatherIndirect({
      depthMap: depth,
      normalMap: normals,
      colorMap: color,
      stepCount: uniform(16, 'uint'),
      rayCount: uniform(rays, 'uint'),
      surfaceWorldPosition: worldPosition,
      surfaceWorldNormal: normals.rgb,
      surfaceDepth: depth.r,
      receiverAlbedo: albedo.rgb,
      screenUV: uv(),
      projection: uniform(camera.projectionMatrix),
      inverseProjection: uniform(camera.projectionMatrixInverse),
      viewMatrix: uniform(camera.matrixWorldInverse),
      nearPlane: uniform(camera.near),
    });

    const views = {
      'Direct lighting': color,
      'Indirect lighting': vec4(indirect, 1),
      Combined: vec4(color.rgb.add(indirect), color.a),
    };
    // FXAA expects display-space color. Convert once, before antialiasing.
    const displayTexture = rtt(
      renderOutput(views[view], gl.toneMapping, THREE.SRGBColorSpace)
    );
    const post = new THREE.PostProcessing(gl, fxaa(displayTexture));
    post.outputColorTransform = false;
    postRef.current = post;

    return () => {
      postRef.current = null;
      post.dispose();
      displayTexture.renderTarget?.dispose();
      displayTexture.dispose();
      scenePass.dispose();
    };
  }, [gl, scene, camera, view, rays]);

  useFrame(() => postRef.current?.render(), 1);
  return null;
}
`;

const gi = `fn gatherIndirect(
  depthMap: texture_depth_2d,
  normalMap: texture_2d<f32>,
  colorMap: texture_2d<f32>,
  stepCount: u32,
  rayCount: u32,
  surfaceWorldPosition: vec3f,
  surfaceWorldNormal: vec3f,
  surfaceDepth: f32,
  receiverAlbedo: vec3f,
  screenUV: vec2f,
  projection: mat4x4f,
  inverseProjection: mat4x4f,
  viewMatrix: mat4x4f,
  nearPlane: f32
) -> vec3f {
  if (surfaceDepth >= 1.0) {
    return vec3f(0.0);
  }

  let n = normalize(surfaceWorldNormal);

  // Form a stable local frame around the receiving surface's normal.
  var axis = vec3f(0.0, 0.0, 1.0);

  if (abs(n.z) > 0.999) {
    axis = vec3f(0.0, 1.0, 0.0);
  }

  let tangent = normalize(cross(axis, n));
  let bitangent = cross(n, tangent);

  let size = vec2i(textureDimensions(depthMap));

  let pixel = vec2u(screenUV * vec2f(size));

  var incoming = vec3f(0.0);

  for (var i = 0u; i < rayCount; i++) {
    // Fixed per-pixel samples: no temporal accumulation yet.
    let random = hash23(vec3f(vec2f(pixel), f32(i + 16u)));
    let u1 = (f32(i) + random.x) / f32(rayCount);
    let u2 = random.y;

    // Cosine-weighted hemisphere: PDF = cos(theta) / PI.
    let radius = sqrt(u1);
    let phi = 6.28318530718 * u2;
    let direction = tangent * (radius * cos(phi))
      + bitangent * (radius * sin(phi)) + n * sqrt(1.0 - u1);
    let hit = traceScreenRay(depthMap, surfaceWorldPosition, n, direction,
      surfaceDepth, projection, inverseProjection, viewMatrix, nearPlane,
      stepCount, 1.0);

    if (hit.z > 0.0) {
      let hitPixel = vec2i(hit.xy * vec2f(size));
      let hitNormal = normalize(textureLoad(normalMap, hitPixel, 0).xyz);

      // The visible source surface must face the receiving point.
      if (dot(hitNormal, -direction) > 0.0) {
        incoming += textureLoad(colorMap, hitPixel, 0).rgb;
      }
    }
  }

  // Lambert BRDF (albedo / PI) * cosine / PDF reduces to albedo.
  // Misses contribute zero and still count among the samples.
  return receiverAlbedo * incoming / f32(rayCount);
}

fn traceScreenRay(
  depthMap: texture_depth_2d,
  surfaceWorldPosition: vec3f,
  surfaceWorldNormal: vec3f,
  rayDirection: vec3f,
  surfaceDepth: f32,
  projection: mat4x4f,
  inverseProjection: mat4x4f,
  viewMatrix: mat4x4f,
  nearPlane: f32,
  stepCount: u32,
  marchOffset: f32
) -> vec3f {
  // Result: hit UV in XY, hit flag in Z. Background cannot launch a ray.
  if (surfaceDepth >= 1.0) {
    return vec3f(0.0);
  }

  let direction = normalize(rayDirection);
  let origin = surfaceWorldPosition + normalize(surfaceWorldNormal) * 0.05;

  let size = vec2i(textureDimensions(depthMap));
  var previousDelta = -1.0;

  // Keep the current four-world-unit reach when changing the step budget.
  // Jitter shifts the sampling grid by less than one step.
  let stepSize = 4.0 / f32(stepCount);

  let originView = viewMatrix * vec4f(origin, 1.0);
  let directionView = viewMatrix * vec4f(direction, 0.0);

  for (var i = 0u; i < stepCount; i++) {
    let distance = (f32(i) + marchOffset) * stepSize;
    let rayViewPosition = originView + directionView * distance;

    if (rayViewPosition.z >= -nearPlane) {
      break;
    }

    // World -> view -> clip -> screen UV, as in the Solar shadow lookup.
    let clip = projection * rayViewPosition;
    let ndc = clip.xy / clip.w;
    let sampleUV = vec2f(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5);

    if (any(sampleUV < vec2f(0.0)) || any(sampleUV >= vec2f(1.0))) {
      break;
    }

    // Load one depth texel: do not interpolate across object silhouettes.
    let pixel = vec2i(sampleUV * vec2f(size));

    let sampleDepth = textureLoad(depthMap, pixel, 0);

    if (sampleDepth >= 1.0) {
      previousDelta = -1.0;
      continue;
    }

    // Compare the ray and visible surface in view space.
    let surfaceViewH = inverseProjection * vec4f(ndc, sampleDepth, 1.0);
    let surfaceViewZ = surfaceViewH.z / surfaceViewH.w;
    let delta = surfaceViewZ - rayViewPosition.z;

    // A front-to-back crossing within our assumed surface thickness.
    if (previousDelta < 0.0 && delta >= 0.0 && delta <= 0.2) {
      let hitUV = (vec2f(pixel) + 0.5) / vec2f(size);

      return vec3f(hitUV, 1.0);
    }

    previousDelta = delta;
  }

  return vec3f(0.0);
}

fn hash23(seed: vec3f) -> vec2f {
  let h = vec2f(
    dot(seed, vec3f(127.1, 311.7, 74.7)),
    dot(seed, vec3f(269.5, 183.3, 246.1))
  );

  return fract(sin(h) * 43758.5453);
}
`;

const scene = `import { useControls } from 'leva';
import { useMemo } from 'react';
import * as THREE from 'three/webgpu';

export const SCENE_CENTER = [-0.5, 1.1, -0.5];

const SceneLight = () => {
  const light = useMemo(() => new THREE.DirectionalLight(), []);
  const target = useMemo(() => {
    const object = new THREE.Object3D();

    object.position.set(...SCENE_CENTER);
    object.updateMatrixWorld();

    return object;
  }, []);

  const { position } = useControls('Light', {
    position: { value: [4, 1.5, 4], step: 0.1 },
  });

  return (
    <>
      <primitive object={target} />
      <primitive
        object={light}
        position={position}
        target={target}
        intensity={4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-radius={4}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={0.1}
        shadow-camera-far={25}
        // Offset the receiver enough for the wider PCF kernel to avoid self-shadowing.
        shadow-bias={-0.005}
      />
    </>
  );
};

const Box = ({ position, size, color = '#cecece', rotation }) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} roughness={1} metalness={0} />
  </mesh>
);

const Scene = () => (
  <>
    <group>
      <Box position={[0, -0.1, 0]} size={[8, 0.2, 8]} />
      <Box position={[0, 2.4, -3.9]} size={[8, 4.8, 0.2]} />
      <Box position={[-3.9, 2.4, 0]} size={[0.2, 4.8, 8]} />

      <mesh position={[-2.65, 1.15, -1.1]} castShadow receiveShadow>
        <sphereGeometry args={[1.2, 64, 32]} />
        <meshStandardMaterial color="#F2701F" roughness={1} metalness={0} />
      </mesh>
      <mesh position={[-3.0, 0.65, 1.1]} castShadow receiveShadow>
        <sphereGeometry args={[0.72, 64, 32]} />
        <meshStandardMaterial color="#F2302F" roughness={1} metalness={0} />
      </mesh>
      <Box
        position={[1.1, 1.2, -1.5]}
        size={[2.5, 2.5, 2.5]}
        rotation={[0, 0.3, 0]}
        color="#0683FF"
      />
    </group>
    <SceneLight />
  </>
);

export default Scene;
`;

const sky = `import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { uv, wgslFn } from 'three/tsl';
import * as THREE from 'three/webgpu';

const Sky = () => {
  const mesh = useRef(null);

  const colorNode = useMemo(
    () =>
      wgslFn(/* wgsl */ \`
        fn sphereColor(uv: vec2f) -> vec3f {
          let color1 = vec3(0.01, 0.22, 0.98);
          let color2 = vec3(0.36, 0.68, 1.0);
          let t = clamp(length(abs(uv - 0.5)), 0.0, 0.8);

          return mix(color1, color2, t);
        }

      \`)({ uv: uv() }),
    []
  );

  // Keep the sky around the camera when panning or zooming freely.
  useFrame(({ camera }) => mesh.current?.position.copy(camera.position));

  return (
    <mesh ref={mesh} rotation={[0, Math.PI, 0]}>
      <sphereGeometry args={[200, 16, 16]} />
      <meshBasicNodeMaterial
        colorNode={colorNode}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};

export default Sky;
`;

const screenSpace = {
  '/App.js': { code: app },
  '/GIEffect.js': { code: effect, active: true },
  '/gi.wgsl': { code: gi },
  '/Scene.js': { code: scene },
  '/Sky.js': { code: sky },
} satisfies SandpackFiles;

export default screenSpace;
