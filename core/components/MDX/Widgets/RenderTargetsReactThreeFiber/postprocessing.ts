const ChromaticAberrationMaterial = `import * as THREE from 'three';

const chromaticAberrationFragmentShader = \`
// Based on https://www.shadertoy.com/view/ltKBDd by battlebottle

uniform sampler2D uTexture;
uniform float uRedOffset;
uniform float uGreenOffset;
uniform float uBlueOffset;
uniform float uIntensity;
uniform vec2 winResolution;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    float rOffset = 0.001 * uRedOffset * uIntensity;
    float gOffset = 0.001 * uGreenOffset * uIntensity;
    float bOffset = 0.001 * uBlueOffset * uIntensity;

    float r = texture2D(uTexture, uv * (1.0 + rOffset) - (rOffset / 2.0)).r;
    float g = texture2D(uTexture, uv * (1.0 + gOffset) - (gOffset / 2.0)).g;
    float b = texture2D(uTexture, uv * (1.0 + bOffset) - (bOffset / 2.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
}
\`;

const chromaticAberrationVertexShader = \`
varying vec2 vUv;


void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
\`;

class ChromaticAberrationMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTexture: {
          value: null,
        },
        uRedOffset: {
          value: 10.0,
        },
        uGreenOffset: {
          value: 5.0,
        },
        uBlueOffset: {
          value: 3.0,
        },
        uIntensity: {
          value: 10.0,
        },
        winResolution: {
          value: new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
          ).multiplyScalar(Math.min(window.devicePixelRatio, 2)),
        },
      },
      vertexShader: chromaticAberrationVertexShader,
      fragmentShader: chromaticAberrationFragmentShader,
      blending: THREE.NoBlending,
      depthWrite: false,
      depthTest: false,
    });
  }
}

export default ChromaticAberrationMaterial
`;

const GlitchMaterial = `import * as THREE from 'three';

const glitchFragmentShader = \`
uniform sampler2D uTexture;
uniform float uDistortion;
uniform float uDistortion2;
uniform float uSpeed;
uniform float uTime;

varying vec2 vUv;

uniform vec2 winResolution;


vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  // Create large, incidental noise waves
  float noise = max(0.0, snoise(vec2(uTime, uv.y * 0.3)) - 0.3) * uDistortion;
  // Offset by smaller, constant noise waves
  noise += (snoise(vec2(uTime * 10.0 * uSpeed, uv.y * 2.4)) - 0.5) * uDistortion2;
  // Apply the noise as X displacement for every line
  float xpos = uv.x - noise * noise * 0.25;
  gl_FragColor = texture(uTexture, vec2(xpos, uv.y));
  // Mix in some random interference for lines
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), noise * 0.3).rgb;
  // Apply a line pattern every 4 pixels
  if (floor(mod(gl_FragCoord.y * 0.25, 2.0)) == 0.0) {
      gl_FragColor.rgb *= 1.0 - (0.15 * noise);
  }
}
\`;

const glitchVertexShader = \`
varying vec2 vUv;


void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
\`;

class GlitchMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uTexture: {
          value: null,
        },
        uDistortion: { value: 0.73 },
        uDistortion2: { value: 0.05 },
        uSpeed: { value: 1 },
        uTime: { value: 0 },
        winResolution: {
          value: new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
          ).multiplyScalar(Math.min(window.devicePixelRatio, 2)),
        },
      },
      vertexShader: glitchVertexShader,
      fragmentShader: glitchFragmentShader,
      blending: THREE.NoBlending,
      depthWrite: false,
      depthTest: false,
    });
  }
}

export default GlitchMaterial
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
import { Canvas, useFrame, createPortal, extend } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import './scene.css';

import getFullscreenTriangle from './getFullscreenTriangle';
import GlitchMaterial from './GlitchMaterial';
import ChromaticAberrationMaterial from './ChromaticAberrationMaterial';

extend({ GlitchMaterial, ChromaticAberrationMaterial });

const PostProcessing = () => {
  const sphere = useRef();
  const sphere2 = useRef();
  const screenMesh = useRef();
  const magicScene = new THREE.Scene();
  const screenCamera = useRef();
  const glitchMaterialRef = useRef();
  const chromaticAberrationMaterialRef = useRef();

  const renderTargetA = useFBO();
  const renderTargetB = useFBO();

  useFrame((state) => {
    const { gl, scene, camera, clock } = state;

    gl.setRenderTarget(renderTargetA);
    gl.render(magicScene, camera);

    chromaticAberrationMaterialRef.current.uniforms.uTexture.value =
      renderTargetA.texture;
    screenMesh.current.material = chromaticAberrationMaterialRef.current;

    gl.setRenderTarget(renderTargetB);
    gl.render(screenMesh.current, camera);

    glitchMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
    glitchMaterialRef.current.uniforms.uTexture.value = renderTargetB.texture;
    screenMesh.current.material = glitchMaterialRef.current;

    gl.setRenderTarget(null);
  });

  return (
    <>
      <OrbitControls />
      {createPortal(
        <>
          <Sky sunPosition={[10, 10, 0]} />
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
        magicScene
      )}
      <OrthographicCamera ref={screenCamera} args={[-1, 1, 1, -1, 0, 1]} />
      <chromaticAberrationMaterial ref={chromaticAberrationMaterialRef} />
      <glitchMaterial ref={glitchMaterialRef} />
      <mesh
        ref={screenMesh}
        geometry={getFullscreenTriangle()}
        frustumCulled={false}
      />
    </>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 2]}>
      <PostProcessing />
    </Canvas>
  );
};


export default Scene;
`;

const Postprocessing = {
  '/App.js': {
    code: AppCode,
    active: true,
  },
  '/GlitchMaterial.js': {
    code: GlitchMaterial,
  },
  '/ChromaticAberrationMaterial.js': {
    code: ChromaticAberrationMaterial,
  },
  '/getFullscreenTriangle.js': {
    code: getFullscreenTriangle,
  },
};

export default Postprocessing;
