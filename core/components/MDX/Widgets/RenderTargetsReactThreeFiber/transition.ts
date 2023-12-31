const FragmentShader = `varying vec2 vUv;

uniform sampler2D textureA;
uniform sampler2D textureB;
uniform float uProgress;

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

void main() {
  vec2 uv = vUv;

    vec4 colorA = texture2D(textureA, uv);
    vec4 colorB = texture2D(textureB, uv);

    // clamp the value between 0 and 1 to make sure the colors don't get messed up
    float noise = clamp(cnoise(vUv * 2.5) + uProgress * 2.0, 0.0, 1.0);

    vec4 color = mix(colorA, colorB, noise);
    gl_FragColor = color;
}
`;

const VertexShader = `varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const getFullscreenTriangle = `
import { BufferGeometry, Float32BufferAttribute } from "three";

const getFullscreenTriangle = () => {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new Float32BufferAttribute([-1, -1, 3, -1, -1, 3], 2)
  );
  geometry.setAttribute(
    "uv",
    new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2)
  );

  return geometry;
};

export default getFullscreenTriangle;
`;

const AppCode = `import { OrbitControls,
  OrthographicCamera, 
  Sky, 
  Environment, 
  useFBO,
} from "@react-three/drei";
import { Canvas, useFrame, createPortal } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import './scene.css';

import getFullscreenTriangle from './getFullscreenTriangle';
import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

const Transition = () => {
  const { progress } = useControls({
    progress: {
      value: -1.0,
      min: -1,
      max: 1,
    },
  });
  const sphere = useRef();
  const sphere2 = useRef();
  const screenMesh = useRef();
  const scene1 = new THREE.Scene();
  const scene2 = new THREE.Scene();
  const sky = useRef();
  const screenCamera = useRef();

  const renderTargetA = useFBO();
  const renderTargetB = useFBO();

  useFrame((state) => {
    const { gl, scene, camera, clock } = state;

    sky.current.material.uniforms.sunPosition.value = new THREE.Vector3(
      10,
      10,
      0
    );

    gl.setRenderTarget(renderTargetA);
    gl.render(scene1, camera);

    sky.current.material.uniforms.sunPosition.value = new THREE.Vector3(
      0,
      -0.3,
      -10
    );

    gl.setRenderTarget(renderTargetB);
    gl.render(scene2, camera);

    screenMesh.current.material.uniforms.textureA.value = renderTargetA.texture;
    screenMesh.current.material.uniforms.textureB.value = renderTargetB.texture;
    screenMesh.current.material.uniforms.uProgress.value = progress;
    gl.setRenderTarget(null);
  });

  return (
    <>
      <OrbitControls />
      {createPortal(
        <>
          <Sky />
          <Environment preset="dawn" />
          <directionalLight args={[10, 10, 0]} intensity={1} />
          <ambientLight intensity={1} />
          <mesh ref={sphere} position={[2, 0, 0]}>
            <dodecahedronGeometry args={[1]} />
            <meshPhysicalMaterial
              roughness={0}
              clearcoat={1}
              clearcoatRoughness={0}
              color="#73B9ED"
            />
          </mesh>
          <mesh ref={sphere2} position={[-2, 0, 0]}>
            <dodecahedronGeometry args={[1]} />
            <meshPhysicalMaterial
              roughness={0}
              clearcoat={1}
              clearcoatRoughness={0}
              color="#73B9ED"
            />
          </mesh>
        </>,
        scene1
      )}
      {createPortal(
        <>
          {/* For some reason only the this instance of Sky is rendered at any time 🤷‍♂️ */}
          <Sky ref={sky} />
          <Environment preset="dawn" />
          <directionalLight args={[0, 0, -10]} intensity={1} />
          {/* <ambientLight intensity={1} /> */}
          <mesh ref={sphere} position={[2, 0, 0]}>
            <torusKnotGeometry args={[0.75, 0.3, 100, 16]} />
            <meshPhysicalMaterial
              roughness={0}
              clearcoat={1}
              clearcoatRoughness={0}
              color="#73B9ED"
            />
          </mesh>
          <mesh ref={sphere2} position={[-2, 0, 0]}>
            <torusKnotGeometry args={[0.75, 0.3, 100, 16]} />
            <meshPhysicalMaterial
              roughness={0}
              clearcoat={1}
              clearcoatRoughness={0}
              color="#73B9ED"
            />
          </mesh>
        </>,
        scene2
      )}
      <OrthographicCamera ref={screenCamera} args={[-1, 1, 1, -1, 0, 1]} />
      <mesh
        ref={screenMesh}
        geometry={getFullscreenTriangle()}
        frustumCulled={false}
      >
        <shaderMaterial
          key={uuidv4()}
          uniforms={{
            textureA: {
              value: null,
            },
            textureB: {
              value: null,
            },
            uTime: {
              value: 0.0,
            },
            uProgress: {
              progress: 0.0,
            },
          }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Leva />
      <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
        <Transition />
      </Canvas>
    </>
  );
};


export default Scene;
`;

const Transition = {
  '/App.js': {
    code: AppCode,
    active: true,
  },
  '/vertexShader.glsl': {
    code: VertexShader,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
  },
  '/getFullscreenTriangle.js': {
    code: getFullscreenTriangle,
  },
};

export default Transition;
