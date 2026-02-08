const HalftoneFragmentShader = `uniform float pixelSize;
uniform float gooeyness; 

float smin(float a, float b, float k) {
    if (k <= 0.001) return min(a, b);
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * 0.25;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 pixelCoord = uv * resolution;
    vec2 baseCellIndex = floor(pixelCoord / pixelSize);
    
    float minDist = 100.0;
    float maxCircle = 0.0;
    
    float smoothK = gooeyness * 1.5;
    
    const int searchRadius = 2;
    
    for (int dx = -searchRadius; dx <= searchRadius; dx++) {
      for (int dy = -searchRadius; dy <= searchRadius; dy++) {
        vec2 cellIndex = baseCellIndex + vec2(float(dx), float(dy));
        
        if (mod(cellIndex.x + cellIndex.y, 2.0) > 0.5) {
          continue;
        }
        
        vec2 cellCenter = (cellIndex + 0.5) * pixelSize;
    
        vec2 uvPixel = cellCenter / resolution;
        vec4 texColor = texture2D(inputBuffer, uvPixel);
        float luma = dot(vec3(0.2126, 0.7152, 0.0722), texColor.rgb);
        
        float dist = length(pixelCoord - cellCenter);
        
        float radius = (1.0 - luma) * pixelSize * 0.6 + pixelSize * 0.05;
        
        float sdfDist = dist - radius;
        minDist = smin(minDist, sdfDist, smoothK * pixelSize);
        
        float aa = fwidth(dist);
        float circle = 1.0 - smoothstep(radius - aa, radius + aa, dist);
        maxCircle = max(maxCircle, circle);
      }
    }
    
    float finalShape;

    if (gooeyness > 0.01) {
      float aa = fwidth(minDist);
      finalShape = 1.0 - smoothstep(-aa, aa, minDist);
    } else {
      finalShape = maxCircle;
    }
    
    vec3 color = vec3(1.0 - finalShape);
    
    outputColor = vec4(color, 1.0);
}
`;

const BlobVertexShader = `uniform float uTime;
uniform float uFrequency;
uniform float uAmplitude;
varying vec3 vNormal;
varying vec3 vPosition;

//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec3 P) {
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

// Displacement function
vec3 displace(vec3 pos) {
  float noise = cnoise(pos * uFrequency + vec3(uTime)) * uAmplitude;
  return pos + normal * noise;
}

// Compute displaced normal using finite differences
vec3 orthogonal(vec3 v) {
  return abs(v.x) > abs(v.z) ? normalize(vec3(-v.y, v.x, 0.0)) : normalize(vec3(0.0, -v.z, v.y));
}

void main() {
  vec3 displacedPosition = displace(position);
  
  // Compute displaced normal using central differences
  float epsilon = 0.001;
  vec3 tangent = orthogonal(normal);
  vec3 bitangent = normalize(cross(normal, tangent));
  
  vec3 neighbour1 = position + tangent * epsilon;
  vec3 neighbour2 = position + bitangent * epsilon;
  
  vec3 displacedNeighbour1 = displace(neighbour1);
  vec3 displacedNeighbour2 = displace(neighbour2);
  
  vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
  vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
  
  vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));
  
  // Flip normal if it points in the wrong direction
  if (dot(displacedNormal, normal) < 0.0) {
    displacedNormal = -displacedNormal;
  }
  
  vNormal = normalMatrix * displacedNormal;
  vPosition = (modelViewMatrix * vec4(displacedPosition, 1.0)).xyz;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}
`;

const BlobFragmentShader = `varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 lightDir = normalize(vec3(10.0, 10.0, 7.0));
  vec3 normal = normalize(vNormal);
  
  float diff = max(dot(normal, lightDir), 0.0);
  
  vec3 viewDir = normalize(-vPosition);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 400.0);

  vec3 baseColor = vec3(0.6, 0.85, 1.0);
  vec3 emissive = baseColor * 0.25;
  
  vec3 ambient = baseColor * 0.3;
  vec3 diffuse = baseColor * diff * 0.7;
  vec3 specular = vec3(1.0) * spec;
  
  vec3 finalColor = ambient + diffuse + specular + emissive;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

const WrapEffect = `
import { extend, useThree } from '@react-three/fiber';
import React from 'react';

export const resolveRef = (ref) =>
  typeof ref === 'object' && ref != null && 'current' in ref
    ? ref.current
    : ref;

let i = 0;
const components = new WeakMap();

export const wrapEffect = (effect, defaults) =>
  /* @__PURE__ */ function Effect({
    blendFunction = defaults?.blendFunction,
    opacity = defaults?.opacity,
    ...props
  }) {
    const { ref, ...params } = props;
    let Component = components.get(effect);
    if (!Component) {
      const key = \`@react-three/postprocessing/\${effect.name}-\${i++}\`;
      extend({ [key]: effect });
      components.set(effect, (Component = key));
    }

    const camera = useThree((state) => state.camera);
    const args = React.useMemo(
      () => [
        ...(defaults?.args ?? []),
        ...(params.args ?? [{ ...defaults, ...params }]),
      ],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [JSON.stringify(params)],
    );

    return (
      <Component
        camera={camera}
        blendMode-blendFunction={blendFunction}
        blendMode-opacity-value={opacity}
        ref={ref}
        {...props}
        args={args}
      />
    );
  };
`;

const AppCode = `import { OrbitControls } from '@react-three/drei';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { useControls } from 'leva';
import { Effect } from 'postprocessing';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { wrapEffect } from './WrapEffect';
import './scene.css';

import halftoneFragmentShader from '!!raw-loader!./halftoneFragmentShader.glsl';
import blobVertexShader from '!!raw-loader!./blobVertexShader.glsl';
import blobFragmentShader from '!!raw-loader!./blobFragmentShader.glsl';

extend(THREE);

class HalftoneEffectImpl extends Effect {
  constructor({ pixelSize = 1.0, gooeyness = 0.0 }) {
    const uniforms = new Map([
      ['pixelSize', new THREE.Uniform(pixelSize)],
      ['gooeyness', new THREE.Uniform(gooeyness)],
    ]);

    super('CustomDotsEffect', halftoneFragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
    this.uniforms.get('gooeyness').value = this.gooeyness;
  }
}

const CustomHalftoneEffect = wrapEffect(HalftoneEffectImpl);

const HalftoneEffect = () => {
  const { enabled, pixelSize, gooeyness } = useControls({
    pixelSize: {
      value: 16.0,
      min: 2.0,
      max: 32.0,
      step: 2.0,
    },
    gooeyness: {
      value: 0.8,
      min: 0.0,
      max: 1.0,
      step: 0.01,
    },
    enabled: {
      value: true,
    },
  });

  return (
    <EffectComposer enabled={enabled}>
      <CustomHalftoneEffect pixelSize={pixelSize} gooeyness={gooeyness} />
    </EffectComposer>
  );
};

const Blob = () => {
  const meshRef = useRef();

  const { frequency, amplitude } = useControls('Noise', {
    frequency: {
      value: 1.5,
      min: 0.1,
      max: 3.0,
      step: 0.1,
    },
    amplitude: {
      value: 0.3,
      min: 0.0,
      max: 0.5,
      step: 0.01,
    },
  });
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uFrequency: { value: 1.0 },
    uAmplitude: { value: 0.2 },
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
      meshRef.current.material.uniforms.uFrequency.value = frequency;
      meshRef.current.material.uniforms.uAmplitude.value = amplitude;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.5, 128]} />
      <shaderMaterial
        vertexShader={blobVertexShader}
        fragmentShader={blobFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

const Core = () => {
  const { scene, gl } = useThree();

  return (
    <>
      <Blob />
      <HalftoneEffect />
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 5] }}>
        <Suspense>
          <color attach="background" args={["#FFFFFF"]} />
          <OrbitControls />
          <Core />
        </Suspense>
      </Canvas>
    </>
  );
};

export default Scene;`;

const Gooey = {
  '/App.js': {
    code: AppCode,
  },
  '/halftoneFragmentShader.glsl': {
    code: HalftoneFragmentShader,
    active: true,
  },
  '/blobVertexShader.glsl': {
    code: BlobVertexShader,
    hidden: true,
  },
  '/blobFragmentShader.glsl': {
    code: BlobFragmentShader,
    hidden: true,
  },
  '/WrapEffect.js': {
    code: WrapEffect,
    hidden: true,
  },
};

export default Gooey;
