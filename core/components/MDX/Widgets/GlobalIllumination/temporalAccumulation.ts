import type { SandpackFiles } from '@codesandbox/sandpack-react';

import screenSpace from './screenSpace';

const effect = `import accumulationShader from '!!raw-loader!./accumulation.wgsl';
import giShader from '!!raw-loader!./gi.wgsl';
import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { button, useControls } from 'leva';
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
  texture,
  uniform,
  uv,
  vec4,
  wgslFn,
} from 'three/tsl';
import * as THREE from 'three/webgpu';

const gatherIndirect = wgslFn(giShader);
const averageIndirect = wgslFn(accumulationShader);

export default function GIEffect() {
  const { gl, scene, camera } = useThree();
  const renderRef = useRef(null);
  const resetRequested = useRef(false);
  const blueNoise = useTexture(
    'https://cdn.maximeheckel.com/noises/blue-noise.png'
  );
  const [{ accumulate }, setTemporal] = useControls(
    'Temporal accumulation',
    () => ({
      accumulate: { value: true, label: 'Accumulate' },
      frames: { value: 0, disabled: true, label: 'Frames' },
      'Reset history': button(() => {
        resetRequested.current = true;
      }),
    }),
    []
  );
  const { view, rays } = useControls('Global illumination', {
    view: {
      value: 'Combined',
      options: ['Direct lighting', 'Indirect lighting', 'Combined'],
    },
    rays: { value: 8, options: [8, 16, 32], label: 'Rays per pixel' },
  });

  useEffect(() => {
    // Noise is data: load exact texels without color conversion or filtering.
    blueNoise.colorSpace = THREE.NoColorSpace;
    blueNoise.minFilter = THREE.NearestFilter;
    blueNoise.magFilter = THREE.NearestFilter;
    blueNoise.generateMipmaps = false;

    const historyCount = uniform(0);
    const frameIndex = uniform(0, 'uint');
    const histories = [0, 1].map(
      () =>
        new THREE.RenderTarget(1, 1, {
          type: THREE.HalfFloatType,
          minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter,
          depthBuffer: false,
        })
    );
    const sampleTarget = histories[0].clone();
    const previousHistory = texture(histories[0].texture);
    const accumulatedLight = texture(histories[1].texture);

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
      noiseMap: texture(blueNoise),
      frameIndex,
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

    const samplePass = new THREE.PostProcessing(gl, vec4(indirect, 1));
    samplePass.outputColorTransform = false;
    const accumulationPass = new THREE.PostProcessing(
      gl,
      averageIndirect({
        current: texture(sampleTarget.texture).rgb,
        previous: previousHistory.rgb,
        count: historyCount,
      })
    );
    accumulationPass.outputColorTransform = false;

    // The sample pass already rendered the scene. Reuse its texture here.
    const sceneColor = texture(scenePass.getTexture('output'));
    const views = {
      'Direct lighting': sceneColor,
      'Indirect lighting': vec4(accumulatedLight.rgb, 1),
      Combined: vec4(sceneColor.rgb.add(accumulatedLight.rgb), sceneColor.a),
    };
    // FXAA expects display-space color. Convert once, before antialiasing.
    const displayTexture = rtt(
      renderOutput(views[view], gl.toneMapping, THREE.SRGBColorSpace)
    );
    const post = new THREE.PostProcessing(gl, fxaa(displayTexture));
    post.outputColorTransform = false;
    const size = new THREE.Vector2();
    const previousCamera = new THREE.Matrix4();
    const previousProjection = new THREE.Matrix4();
    let previousLighting = '';
    let readIndex = 0;
    let count = 0;
    let sampleIndex = 0;

    renderRef.current = () => {
      scene.updateMatrixWorld(true);
      camera.updateMatrixWorld();
      gl.getDrawingBufferSize(size);
      const resized =
        histories[0].width !== size.x || histories[0].height !== size.y;
      if (resized) {
        for (const target of [...histories, sampleTarget])
          target.setSize(size.x, size.y);
      }

      // This scene's geometry is fixed; only the camera and light can move.
      const lighting = [];
      scene.traverse((object) => {
        if (!object.isLight) return;
        object.target?.updateMatrixWorld();
        lighting.push(
          object.matrixWorld.elements,
          object.color.toArray(),
          object.intensity,
          object.target?.matrixWorld.elements
        );
      });
      const lightingKey = JSON.stringify(lighting);
      const cameraChanged =
        camera.matrixWorld.elements.some(
          (value, index) =>
            Math.abs(value - previousCamera.elements[index]) > 0.00001
        ) || !camera.projectionMatrix.equals(previousProjection);

      // There is no reprojection: a changed view invalidates screen-space history.
      if (
        resized ||
        cameraChanged ||
        lightingKey !== previousLighting ||
        resetRequested.current ||
        !accumulate
      ) {
        count = 0;
        sampleIndex = 0;
        resetRequested.current = false;
      }
      previousCamera.copy(camera.matrixWorld);
      previousProjection.copy(camera.projectionMatrix);
      previousLighting = lightingKey;
      historyCount.value = count;
      frameIndex.value = sampleIndex;

      const writeIndex = 1 - readIndex;
      previousHistory.value = histories[readIndex].texture;
      const originalTarget = gl.getRenderTarget();
      try {
        gl.setRenderTarget(sampleTarget);
        samplePass.render();
        gl.setRenderTarget(histories[writeIndex]);
        accumulationPass.render();
        accumulatedLight.value = histories[writeIndex].texture;
        gl.setRenderTarget(originalTarget);
        post.render();
      } finally {
        gl.setRenderTarget(originalTarget);
      }
      readIndex = writeIndex;
      if (count === 0 || sampleIndex % 8 === 0) {
        setTemporal({ frames: Math.min(count + 1, 1024) });
      }
      // Cap the averaging window, without periodically throwing away history.
      count = Math.min(count + 1, 1023);
      sampleIndex = (sampleIndex + 1) >>> 0;
    };

    return () => {
      renderRef.current = null;
      samplePass.dispose();
      accumulationPass.dispose();
      post.dispose();
      displayTexture.renderTarget?.dispose();
      displayTexture.dispose();
      scenePass.dispose();
      sampleTarget.dispose();
      histories.forEach((target) => target.dispose());
    };
  }, [gl, scene, camera, view, rays, accumulate, blueNoise, setTemporal]);

  useFrame(() => renderRef.current?.(), 1);
  return null;
}
`;

const gi = `fn gatherIndirect(
  depthMap: texture_depth_2d,
  normalMap: texture_2d<f32>,
  colorMap: texture_2d<f32>,
  noiseMap: texture_2d<f32>,
  frameIndex: u32,
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

  let noisePixel = pixel + frameIndex * vec2u(29u, 93u);
  var incoming = vec3f(0.0);

  for (var i = 0u; i < rayCount; i++) {
    // Shift the blue-noise tile to sample new directions on each frame.
    let random = vec2f(
      sampleBlueNoise(noiseMap, noisePixel, i * 3u),
      sampleBlueNoise(noiseMap, noisePixel, i * 3u + 1u)
    );
    let marchNoise = sampleBlueNoise(noiseMap, noisePixel, i * 3u + 2u);
    let u1 = (f32(i) + random.x) / f32(rayCount);
    let u2 = random.y;

    // Cosine-weighted hemisphere: PDF = cos(theta) / PI.
    let radius = sqrt(u1);
    let phi = 6.28318530718 * u2;
    let direction = tangent * (radius * cos(phi))
      + bitangent * (radius * sin(phi)) + n * sqrt(1.0 - u1);
    let hit = traceScreenRay(depthMap, surfaceWorldPosition, n, direction,
      surfaceDepth, projection, inverseProjection, viewMatrix, nearPlane,
      stepCount, marchNoise);

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

fn sampleBlueNoise(noiseMap: texture_2d<f32>, pixel: vec2u, dimension: u32) -> f32 {
  let size = textureDimensions(noiseMap);
  let coord = (pixel + dimension * vec2u(37u, 73u)) % size;
  let value = textureLoad(noiseMap, vec2i(coord), 0).r;

  // Center the 8-bit bins to avoid sampling exactly zero or one.
  return (value * 255.0 + 0.5) / 256.0;
}
`;

const accumulation = `fn averageIndirect(current: vec3f, previous: vec3f, count: f32) -> vec4f {
  // Ignore stale history entirely on the first frame after a reset.
  if (count == 0.0) {
    return vec4f(current, 1.0);
  }

  return vec4f(previous + (current - previous) / (count + 1.0), 1.0);
}
`;

const temporalAccumulation = {
  ...screenSpace,
  '/GIEffect.js': { code: effect, active: true },
  '/gi.wgsl': { code: gi },
  '/accumulation.wgsl': { code: accumulation },
} satisfies SandpackFiles;

export default temporalAccumulation;
