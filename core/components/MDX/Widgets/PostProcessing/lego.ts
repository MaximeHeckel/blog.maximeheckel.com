const FragmentShader = `uniform float pixelSize;
uniform vec2 lightPosition;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 rgbToHsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Function to convert HSV back to RGB
vec3 hsvToRgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

const float colorNum = 16.0;
const float MASK_BORDER = 1.5;
const float MASK_INTENSITY = 1.5;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 normalizedPixelSize = pixelSize / resolution;
    vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
    vec4 color = texture(inputBuffer, uvPixel);

    color.r = floor(color.r * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
    color.g = floor(color.g * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
    color.b = floor(color.b * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);

    color.rgb = clamp(color.rgb, 0.01, 0.95);
    
    vec2 cellPosition = floor(uv / normalizedPixelSize);
    vec2 cellUV = fract(uv / normalizedPixelSize);
    
    float lighting = dot(normalize(cellUV - vec2(0.5)), lightPosition) * 0.7;
    float dis = abs(distance(cellUV,vec2(0.5)) * 2.0 - 0.5);
    color.rgb *= smoothstep(0.1,0.0,dis) * lighting + 1.0;

    vec2 centeredCellUV = cellUV * 2.0 - 1.0;
    vec3 maskColor = vec3(1.0, 0.0, 0.0);
    vec2 border = 1.05 - pow(centeredCellUV, vec2(8.0)) * MASK_BORDER;
    maskColor.rgb *= border.x * border.y;
    float maskStrength = smoothstep(0.0, 0.8, maskColor.r);
    color.rgb *=  0.8 + (maskStrength * 0.1);


    float hueShift = random(cellPosition) * 0.02;
    vec3 hsv = rgbToHsv(color.rgb);
    hsv.x += hueShift;
    color.rgb = hsvToRgb(hsv);
    
    outputColor = color;
}
`;

const AppCode = `import { OrbitControls, OrthographicCamera, Image } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { Effect } from 'postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

import fragmentShader from '!!raw-loader!./fragmentShader.glsl';
import './scene.css';

class CustomLegoEffectImpl extends Effect {
  constructor({ pixelSize = 1.0, lightPosition = new THREE.Vector2(0.8, 0.8) }) {
    const uniforms = new Map([
      ['pixelSize', new THREE.Uniform(pixelSize)],
      ['lightPosition', new THREE.Uniform(lightPosition)],
    ]);

    super('CustomLegoEffect', fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
    this.uniforms.get('lightPosition').value = this.lightPosition;
  }
}

const CustomLegoEffect = wrapEffect(CustomLegoEffectImpl);

const LegoEffect = () => {
  const effectRef = useRef();

  const { pixelSize, lightPosition } = useControls({
    pixelSize: {
      value: 24.0,
      min: 8.0,
      max: 32.0,
      step: 2.0,
    },
    lightPosition: {
      value: new THREE.Vector2(0.8, 0.8),
      min: -1.0,
      max: 1.0,
    },
  });

  useFrame((state) => {
    const { camera } = state;

    if (effectRef.current) {
      effectRef.current.pixelSize = pixelSize;
      effectRef.current.lightPosition = lightPosition;
    }

    camera.lookAt(0, 0, 0);
  });

  return (
    <EffectComposer>
      <CustomLegoEffect ref={effectRef} pixelSize={pixelSize} lightPosition={lightPosition} />
    </EffectComposer>
  );
};

const FullScreenImage = () => {
  const meshRef = useRef();
  const { viewport } = useThree();

  useFrame((state) => {
    const { camera } = state;
    meshRef.current.rotation.setFromQuaternion(camera.quaternion);
  });

  return (
    <Image
      ref={meshRef}
      scale={[viewport.width, viewport.height, 1.0]}
      url='https://cdn.maximeheckel.com/images/backgrounds/gril-with-pearl-earing.jpg'
    />
  );
};

const Lego = () => {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 10]}
        zoom={100}
        near={0.01}
        far={500}
      />
      <FullScreenImage />
      <LegoEffect />
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 1.5]}
      >
        <Suspense>
          <color attach='background' args={['#74B7FF']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, -5]} intensity={10.0} />
          <OrbitControls />
          <Lego />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const Lego = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default Lego;
