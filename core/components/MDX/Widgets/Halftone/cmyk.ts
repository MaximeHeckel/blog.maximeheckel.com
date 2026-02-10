const HalftoneFragmentShader = `uniform float pixelSize;
uniform float dotSize;

const float CYAN_STRENGTH    = 0.95;
const float MAGENTA_STRENGTH = 0.95;
const float YELLOW_STRENGTH  = 0.95;
const float BLACK_STRENGTH   = 1.10;

const float ANGLE_C = 15.0;
const float ANGLE_M = 45.0;
const float ANGLE_Y = 0.0;
const float ANGLE_K = 75.0;

mat2 rot(float deg) {
  float a = radians(deg);
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

vec2 toGridUV(vec2 uv, float angleDeg) {
  return rot(angleDeg) * (uv * resolution) / pixelSize;
}

vec2 getCellCenterUV(vec2 uv, float angleDeg) {
  vec2 gridUV = toGridUV(uv, angleDeg);
  vec2 cellCenter = floor(gridUV) + 0.5;
  vec2 centerScreen = rot(-angleDeg) * cellCenter * pixelSize;
  return centerScreen / resolution;
}

float halftoneDot(vec2 uv, float angleDeg, float coverage) {
  vec2 gridUV = toGridUV(uv, angleDeg);
  vec2 gv = fract(gridUV) - 0.5;
  float r = dotSize * sqrt(clamp(coverage, 0.0, 1.0));
  float aa = fwidth(length(gv));
  float d = length(gv);
  return 1.0 - smoothstep(r - aa, r + aa, d);
}

// Convert RGB to CMYK by MattDSL -> https://gist.github.com/mattdesl/e40d3189717333293813626cbdb2c1d1
vec4 RGBtoCMYK (vec3 rgb) {
  float r = rgb.r;
  float g = rgb.g;
  float b = rgb.b;
  float k = min(1.0 - r, min(1.0 - g, 1.0 - b));
  vec3 cmy = vec3(0.0);
  float invK = 1.0 - k;

  if (invK != 0.0) {
      cmy.x = (1.0 - r - k) / invK;
      cmy.y = (1.0 - g - k) / invK;
      cmy.z = (1.0 - b - k) / invK;
  }

  return clamp(vec4(cmy, k), 0.0, 1.0);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 uvC = getCellCenterUV(uv, ANGLE_C);
  vec2 uvM = getCellCenterUV(uv, ANGLE_M);
  vec2 uvY = getCellCenterUV(uv, ANGLE_Y);
  vec2 uvK = getCellCenterUV(uv, ANGLE_K);
  
  vec4 cmykC = RGBtoCMYK(texture2D(inputBuffer, uvC).rgb);
  vec4 cmykM = RGBtoCMYK(texture2D(inputBuffer, uvM).rgb);
  vec4 cmykY = RGBtoCMYK(texture2D(inputBuffer, uvY).rgb);
  vec4 cmykK = RGBtoCMYK(texture2D(inputBuffer, uvK).rgb);
  
  float dotC = halftoneDot(uv, ANGLE_C, cmykC.x);
  float dotM = halftoneDot(uv, ANGLE_M, cmykM.y);
  float dotY = halftoneDot(uv, ANGLE_Y, cmykY.z);
  float dotK = halftoneDot(uv, ANGLE_K, cmykK.w);
  
  vec3 outColor = vec3(1.0);
  outColor.r *= (1.0 - CYAN_STRENGTH * dotC);
  outColor.g *= (1.0 - MAGENTA_STRENGTH * dotM);
  outColor.b *= (1.0 - YELLOW_STRENGTH * dotY);
  outColor *= (1.0 - BLACK_STRENGTH * dotK);
  
  outputColor = vec4(outColor, 1.0);
}
`;

const GlassVertexShader = `varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

void main() {

  vec3 pos = position;
  vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
  vec4 mvPosition = viewMatrix * worldPos;
	
  gl_Position = projectionMatrix * mvPosition;

  vec3 transformedNormal = normalMatrix * normal;
  vec3 normal = normalize( transformedNormal );

  vUv = uv;
  vNormal = normal;
  vViewPos = -mvPosition.xyz;
  vWorldPos = worldPos.xyz;
}
`;

const GlassFragmentShader = `
uniform float uTransparent;
uniform vec2 winResolution;
uniform float uRefractPower;
uniform sampler2D uSceneTex;

varying vec3 vNormal;
varying vec3 vViewPos;

#define PI 3.141592653589793

float random(vec2 p){
	return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float classicFresnel( vec3 viewVector, vec3 worldNormal, float power ) {
  float fresnelFactor = abs(dot(viewVector, worldNormal));
  float inversefresnelFactor = 1.0 - fresnelFactor;
  return pow(inversefresnelFactor, power);
}

// Increase this value for a higher resolution color shift (more layers)
// Descrease this for a lower resolution color shift (less layers)
const int LOOP = 16;

void main() {
  vec2 uv = gl_FragCoord.xy / winResolution.xy;
  vec2 refractNormal = vNormal.xy * (1.0 - vNormal.z * 0.85);
  vec3 refractCol = vec3( 0.0 );

  for ( int i = 0; i < LOOP; i ++ ) {
    float noiseIntensity = 0.025;
    float noise = random(uv) * noiseIntensity;
    float slide = float(i) / float(LOOP) * 0.1 + noise;
 
    vec2 refractUvR = uv - refractNormal * ( uRefractPower + slide * 1.0 ) * uTransparent;
    vec2 refractUvG = uv - refractNormal * ( uRefractPower + slide * 2.0 ) * uTransparent;
    vec2 refractUvB = uv - refractNormal * ( uRefractPower + slide * 3.0 ) * uTransparent;

    refractCol.r += texture2D( uSceneTex, refractUvR ).r;
    refractCol.g += texture2D( uSceneTex, refractUvG ).g;
    refractCol.b += texture2D( uSceneTex, refractUvB ).b;
  }
  refractCol /= float( LOOP );

  float shininess = 100.0;

  vec3 lightVector = normalize( vec3( 10.0, 10.0, 10.0 ) );
  vec3 viewVector = normalize( vViewPos );
  vec3 normalVector = normalize( vNormal );

  vec3 halfVector = normalize(viewVector + lightVector);

  float NdotL = dot(normalVector, lightVector);
  float NdotH = dot(normalVector, halfVector);

  float kDiffuse = max(0.0, NdotL);
  float NdotH2 = NdotH * NdotH;
  float kSpecular = pow(NdotH2, shininess);

  float fresnel = classicFresnel(viewVector, normalVector, 8.0);

  refractCol += (kSpecular + kDiffuse * 0.05 + fresnel);

  gl_FragColor = vec4(refractCol, 1.0);
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

const AppCode = `import { OrbitControls, Text, Float } from '@react-three/drei';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { useControls } from 'leva';
import { Effect } from 'postprocessing';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { wrapEffect } from './WrapEffect';
import './scene.css';

import halftoneFragmentShader from '!!raw-loader!./halftoneFragmentShader.glsl';
import vertexShader from '!!raw-loader!./glassVertexShader.glsl';
import fragmentShader from '!!raw-loader!./glassFragmentShader.glsl';

extend(THREE);

const sphereVertex = \`
varying vec2 vUv;

void main() {
  vec3 pos = position;
  vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
  vec4 mvPosition = viewMatrix * worldPos;
  
  gl_Position = projectionMatrix * mvPosition;
  vUv = uv;
}
\`;

const sphereFragment = \`
varying vec2 vUv;

void main() {
  vec3 color1 = vec3(0.494,0.698,0.882);
  vec3 color2 = vec3(0.369,0.639,0.886);

  float t = clamp(length(abs(vUv - 0.5)), 0.0, 0.8);

  gl_FragColor = vec4(mix(color1, color2, t), 1.0);
}
\`;

class HalftoneEffectImpl extends Effect {
  constructor({ pixelSize = 1.0, dotSize = 0.7 }) {
    const uniforms = new Map([
      ['pixelSize', new THREE.Uniform(pixelSize)],
      ['dotSize', new THREE.Uniform(dotSize)],
    ]);

    super('CustomHalftoneEffect', halftoneFragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
    this.uniforms.get('dotSize').value = this.dotSize;
  }
}

const CustomHalftoneEffect = wrapEffect(HalftoneEffectImpl);

const HalftoneEffect = () => {
  const { enabled, dotSize, pixelSize } = useControls({
    pixelSize: {
      value: 8.0,
      min: 2.0,
      max: 32.0,
      step: 2.0,
    },
    dotSize: {
      value: 0.7,
      min: 0.25,
      max: 1.0,
      step: 0.05,
    },
    enabled: {
      value: true,
    },
  });

  return (
    <EffectComposer enabled={enabled}>
      <CustomHalftoneEffect pixelSize={pixelSize} dotSize={dotSize} />
    </EffectComposer>
  );
};

const GlassMesh = (_props) => {
  const mesh = useRef();
  const bgAssetsRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTime: {
        value: 0.0,
      },
      uSceneTex: {
        value: null,
      },
      uTransparent: {
        value: 0.8,
      },
      uRefractPower: {
        value: 0.2,
      },
      color: {
        value: new THREE.Vector4(),
      },
      winResolution: {
        value: new THREE.Vector2(
          window.innerWidth,
          window.innerHeight,
        ).multiplyScalar(Math.min(window.devicePixelRatio, 2)),
      },
    }),
    [],
  );

  const refractPower = 0.1;
  const transparent = 0.8;

  const backRenderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio,
  );

  const mainRenderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio,
  );

  const captureMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.3,
  });

  useFrame((state) => {
    const { gl, scene, camera } = state;

    const instanceMat = mesh.current.material;

    mesh.current.material = captureMat;
    bgAssetsRef.current.visible = true;

    gl.setRenderTarget(backRenderTarget);
    gl.clear();
    gl.render(scene, camera);
    mesh.current.material = instanceMat;
    mesh.current.material.uniforms.winResolution.value = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight,
    ).multiplyScalar(Math.min(window.devicePixelRatio, 2));

    mesh.current.material.uniforms.uRefractPower.value = refractPower;
    mesh.current.material.uniforms.uTransparent.value = transparent;
    mesh.current.material.uniforms.uSceneTex.value = backRenderTarget.texture;
    mesh.current.material.side = THREE.BackSide;

    mesh.current.visible = true;

    gl.setRenderTarget(mainRenderTarget);
    gl.clear();
    gl.render(scene, camera);
    mesh.current.material.uniforms.uSceneTex.value = mainRenderTarget.texture;
    mesh.current.material.side = THREE.FrontSide;
    bgAssetsRef.current.visible = false;

    gl.setRenderTarget(null);
  });

  return (
    <>
      <mesh ref={mesh} scale={1.0} receiveShadow>
        <torusKnotGeometry args={[1, 0.4, 100, 16]} />
        <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          wireframe={false}
          transparent
        />
      </mesh>

      <group ref={bgAssetsRef}>
        <mesh position={[0, 2.5, -2.5]} scale={1.5}>
          <sphereGeometry />
          <meshStandardMaterial color='cyan' />
        </mesh>

        <Text
          color='white'
          position={[0, 0, -4]}
          scale={2.5}
          rotation={[0, 0, Math.PI / 8]}
        >
          3.1415926535
        </Text>
      </group>
    </>
  );
};

const Core = () => {
  const { scene, gl } = useThree();

  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight castShadow position={[10, 10, 10]} intensity={10} />
      <mesh>
        <sphereGeometry args={[50, 16, 16]} />
        <shaderMaterial
          fragmentShader={sphereFragment}
          vertexShader={sphereVertex}
          side={THREE.BackSide}
        />
      </mesh>
      <Float
        position={[0.0, 0.0, 0]}
        speed={2}
        rotationIntensity={4.0}
        floatIntensity={2}
      >
        <GlassMesh />
      </Float>
      <HalftoneEffect />
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas shadows camera={{ position: [0, 0, 5] }}>
        <Suspense>
          <color attach="background" args={["#000"]} />
          <OrbitControls />
          <Core />
        </Suspense>
      </Canvas>
    </>
  );
};

export default Scene;`;

const CMYK = {
  '/App.js': {
    code: AppCode,
  },
  '/halftoneFragmentShader.glsl': {
    code: HalftoneFragmentShader,
    active: true,
  },
  '/glassVertexShader.glsl': {
    code: GlassVertexShader,
    hidden: true,
  },
  '/glassFragmentShader.glsl': {
    code: GlassFragmentShader,
    hidden: true,
  },
  '/WrapEffect.js': {
    code: WrapEffect,
    hidden: true,
  },
};

export default CMYK;
