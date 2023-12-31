const Utils = `
import * as THREE from "three";

const getFullscreenTriangle = () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute([-1, -1, 3, -1, -1, 3], 2)
  );
  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2)
  );

  return geometry;
};

export default getFullscreenTriangle
`;

const BicubicUpscale = `
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";

const passFragmentShader = \`
// Based on https://www.shadertoy.com/view/ltKBDd by battlebottle

uniform sampler2D uTexture;
uniform bool uUpscaling;
uniform vec2 uResolution;

varying vec2 vUv;

float w0(float a)
{
    return (1.0/6.0)*(a*(a*(-a + 3.0) - 3.0) + 1.0);
}

float w1(float a)
{
    return (1.0/6.0)*(a*a*(3.0*a - 6.0) + 4.0);
}

float w2(float a)
{
    return (1.0/6.0)*(a*(a*(-3.0*a + 3.0) + 3.0) + 1.0);
}

float w3(float a)
{
    return (1.0/6.0)*(a*a*a);
}

// g0 and g1 are the two amplitude functions
float g0(float a)
{
    return w0(a) + w1(a);
}

float g1(float a)
{
    return w2(a) + w3(a);
}

// h0 and h1 are the two offset functions
float h0(float a)
{
    return -1.0 + w1(a) / (w0(a) + w1(a));
}

float h1(float a)
{
    return 1.0 + w3(a) / (w2(a) + w3(a));
}

vec4 texture_bicubic(sampler2D tex, vec2 uv, vec4 texelSize, vec2 fullSize, float lod)
{
	uv = uv*texelSize.zw + 0.5;
	vec2 iuv = floor( uv );
	vec2 fuv = fract( uv );

    float g0x = g0(fuv.x);
    float g1x = g1(fuv.x);
    float h0x = h0(fuv.x);
    float h1x = h1(fuv.x);
    float h0y = h0(fuv.y);
    float h1y = h1(fuv.y);

	vec2 p0 = (vec2(iuv.x + h0x, iuv.y + h0y) - 0.5) * texelSize.xy;
	vec2 p1 = (vec2(iuv.x + h1x, iuv.y + h0y) - 0.5) * texelSize.xy;
	vec2 p2 = (vec2(iuv.x + h0x, iuv.y + h1y) - 0.5) * texelSize.xy;
	vec2 p3 = (vec2(iuv.x + h1x, iuv.y + h1y) - 0.5) * texelSize.xy;
	
    vec2 lodFudge = pow(1.95, lod) / fullSize;
    return g0(fuv.y) * (g0x * 
        textureLod(tex, p0, lod)  +
                        
        g1x * textureLod(tex, p1, lod)
                    ) +
           g1(fuv.y) * (
            g0x * textureLod(tex, p2, lod)  +
                        g1x * textureLod(tex, p3, lod));
}


vec4 textureBicubic(sampler2D s, vec2 uv, float lod) {
 vec2 lodSizeFloor = vec2(textureSize(s, int(lod)));
 vec2 lodSizeCeil = vec2(textureSize(s, int(lod + 1.0)));
 vec2 fullSize = vec2(textureSize(s, 0));
 vec4 floorSample = texture_bicubic( s, uv, vec4(1.0 / lodSizeFloor.x, 1.0 / lodSizeFloor.y, lodSizeFloor.x, lodSizeFloor.y), fullSize, floor(lod));
 vec4 ceilSample = texture_bicubic( s, uv, vec4(1.0 / lodSizeCeil.x, 1.0 / lodSizeCeil.y, lodSizeCeil.x, lodSizeCeil.y), fullSize, ceil(lod));
 return mix(floorSample, ceilSample, fract(lod));
}

void main() {
    vec2 uv = vUv;
    vec4 res = textureBicubic(uTexture, uv, 0.2);

    vec4 color = res;
    gl_FragColor = color;
}
\`;

const passVertexSHader = \`
varying vec2 vUv;


void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
\`;

const DPR = 2;

class BicubicUpscaleMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTexture: {
          value: null,
        },
        uResolution: {
          value: new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
          ).multiplyScalar(DPR),
        },
      },
      vertexShader: passVertexSHader,
      fragmentShader: passFragmentShader,
      blending: THREE.NoBlending,
      depthWrite: false,
      depthTest: false,
    });
  }
}

export default BicubicUpscaleMaterial;
`;

const VertexShader = `varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
`;

const FragmentShader = `uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uBlueNoise;
uniform sampler2D uNoise;
uniform int uFrame;

#define MAX_STEPS 40
#define ABSORPTION_COEFFICIENT 0.9

float sdSphere(vec3 p, float radius) {
  return length(p) - radius;
}

float BeersLaw (float dist, float absorption) {
  return exp(-dist * absorption);
}

float noise( in vec3 x ) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f*f*(3.0-2.0*f);

  vec2 uv = (p.xy+vec2(37.0,239.0)*p.z) + f.xy;
  vec2 tex = textureLod(uNoise,(uv+0.5)/256.0,0.0).yx;

  return mix(tex.x, tex.y, f.z) * 2.0 - 1.0;
}

float fbm(vec3 p) {
  vec3 q = p + uTime * 0.5 * vec3(1.0, -0.2, -1.0);
  float g = noise(q);

  float f = 0.0;
  float scale = 0.5;
  float factor = 2.02;

  for (int i = 0; i < 6; i++) {
      f += scale * noise(q);
      q *= factor;
      factor += 0.21;
      scale *= 0.5;
  }

  return f;
}

float scene(vec3 p) {
  float distance = sdSphere(p, 1.2);

  float f = fbm(p);

  return -distance + f;
}

const vec3 SUN_POSITION = vec3(1.0, 0.0, 0.0);
const float MARCH_SIZE = 0.16;

float raymarch(vec3 rayOrigin, vec3 rayDirection, float offset) {
  float depth = 0.0;
  depth += MARCH_SIZE * offset;
  vec3 p = rayOrigin + depth * rayDirection;
  vec3 sunDirection = normalize(SUN_POSITION);

  float totalTransmittance = 1.0;
  float lightEnergy = 0.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    float density = scene(p);

    // We only draw the density if it's greater than 0
    if (density > 0.0) {
      float transmittance = BeersLaw(density * MARCH_SIZE, ABSORPTION_COEFFICIENT);
      float luminance = density;

      totalTransmittance *= transmittance;
      lightEnergy += totalTransmittance * luminance;
    }

    depth += MARCH_SIZE;
    p = rayOrigin + depth * rayDirection;
  }

  return lightEnergy;
}

void main() {
  vec2 uv = gl_FragCoord.xy/uResolution.xy;
  uv -= 0.5;
  uv.x *= uResolution.x / uResolution.y;

  // Ray Origin - camera
  vec3 ro = vec3(0.0, 0.0, 5.0);
  // Ray Direction
  vec3 rd = normalize(vec3(uv, -1.0));
  
  vec3 color = vec3(0.0);

  // Sun and Sky
  vec3 sunColor = vec3(1.0,0.5,0.3);
  vec3 sunDirection = normalize(SUN_POSITION);
  float sun = clamp(dot(sunDirection, rd), 0.0, 1.0);
  // Base sky color
  color = vec3(0.7,0.7,0.90);
  // Add vertical gradient
  color -= 0.8 * vec3(0.90,0.75,0.90) * rd.y;
  // Add sun color to sky
  color += 0.5 * sunColor * pow(sun, 10.0);

  float blueNoise = texture2D(uBlueNoise, gl_FragCoord.xy / 1024.0).r;
  float offset = fract(blueNoise + float(uFrame%32) / sqrt(0.5));

  // Cloud
  float res = raymarch(ro, rd, offset);
  color = color + sunColor * res;

  gl_FragColor = vec4(color, 1.0);
}
`;

const AppCode = `import { useTexture, useFBO, OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree, createPortal, extend } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef, Suspense } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import './scene.css';

import BicubicUpscaleMaterial from './BicubicUpscaleMaterial';
import getFullscreenTriangle from './utils';
import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

extend({ BicubicUpscaleMaterial });

const DPR = 0.5;
// Blue noise texture
const BLUE_NOISE_TEXTURE_URL = "https://cdn.maximeheckel.com/noises/blue-noise.png";
// Noise texture
const NOISE_TEXTURE_URL = "https://cdn.maximeheckel.com/noises/noise2.png";

const Raymarching = () => {
  const mesh = useRef();
  const screenMesh = useRef();
  const screenCamera = useRef();
  const upscalerMaterialRef = useRef();
  const { viewport } = useThree();

  const magicScene = new THREE.Scene();

  const {
    resolution,
  } = useControls({
    resolution: {
      value: 2,
      options: {
        "1x": 1,
        "0.5x": 2,
        "0.25x": 4,
        "0.125x": 8,
      },
    },
  });

  const renderTargetA = useFBO(
    window.innerWidth / resolution,
    window.innerHeight / resolution
  );

  const blueNoiseTexture = useTexture(BLUE_NOISE_TEXTURE_URL);
  blueNoiseTexture.wrapS = THREE.RepeatWrapping;
  blueNoiseTexture.wrapT = THREE.RepeatWrapping;

  blueNoiseTexture.minFilter = THREE.NearestMipmapLinearFilter;
  blueNoiseTexture.magFilter = THREE.NearestMipmapLinearFilter;

  const noisetexture = useTexture(NOISE_TEXTURE_URL);
  noisetexture.wrapS = THREE.RepeatWrapping;
  noisetexture.wrapT = THREE.RepeatWrapping;

  noisetexture.minFilter = THREE.NearestMipmapLinearFilter;
  noisetexture.magFilter = THREE.NearestMipmapLinearFilter;

  const uniforms = {
    uTime: new THREE.Uniform(0.0),
    uResolution: new THREE.Uniform(new THREE.Vector2()),
    uNoise: new THREE.Uniform(null),
    uBlueNoise: new THREE.Uniform(null),
    uFrame: new THREE.Uniform(0),
  };

  useFrame((state) => {
    const { gl, clock, camera } = state;
    mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
    mesh.current.material.uniforms.uResolution.value = new THREE.Vector2(
      renderTargetA.width,
      renderTargetA.height
    );

    mesh.current.material.uniforms.uBlueNoise.value = blueNoiseTexture;
    mesh.current.material.uniforms.uNoise.value = noisetexture;

    mesh.current.material.uniforms.uFrame.value += 1;

    gl.setRenderTarget(renderTargetA);
    gl.render(magicScene, camera);

    upscalerMaterialRef.current.uniforms.uTexture.value = renderTargetA.texture;
    screenMesh.current.material = upscalerMaterialRef.current;

    gl.setRenderTarget(null);
  });

  return (
    <>
      {createPortal(
        <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
          <planeBufferGeometry args={[1, 1]} />
          <shaderMaterial
            key={uuidv4()}
            fragmentShader={fragmentShader}
            vertexShader={vertexShader}
            uniforms={uniforms}
            wireframe={false}
          />
        </mesh>,
        magicScene
      )}
      <OrthographicCamera ref={screenCamera} args={[-1, 1, 1, -1, 0, 1]} />
      <bicubicUpscaleMaterial ref={upscalerMaterialRef} key={uuidv4()} />
      <mesh
        ref={screenMesh}
        geometry={getFullscreenTriangle()}
        frustumCulled={false}
      >
        <meshBasicMaterial />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 6] }} dpr={DPR}>
      <Suspense fallback={null}>
        <Raymarching />
      </Suspense>
    </Canvas>
  );
};


export default Scene;
`;

const BeersLaw = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
  '/vertexShader.glsl': {
    code: VertexShader,
  },
  '/BicubicUpscaleMaterial.js': {
    code: BicubicUpscale,
  },
  '/utils.js': {
    code: Utils,
  },
};

export default BeersLaw;
