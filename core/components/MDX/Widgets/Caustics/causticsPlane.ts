const causticsComputeFragment = `
uniform sampler2D uTexture;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec3 uLight;
uniform float uIntensity;

void main() {
  vec2 uv = vUv;
  float scale = 0.0;

  vec3 normalTexture = texture2D(uTexture, uv).rgb;
  vec3 normal = normalize(normalTexture);
  vec3 lightDir = normalize(uLight);
  
  vec3 ray = refract(lightDir, normal, 1.0 / 1.25);

  vec3 newPos = vPosition.xyz + ray;
  vec3 oldPos = vPosition.xyz;

  float lightArea = length(dFdx(oldPos)) * length(dFdy(oldPos));
  float newLightArea = length(dFdx(newPos)) * length(dFdy(newPos));
  
  float value = lightArea / newLightArea * 0.2;
  scale += clamp(value, 0.0, 1.0) * uIntensity;
  scale *= scale;


  gl_FragColor = vec4(vec3(scale), 1.0);
}
`;

const CausticsComputeMaterial = `import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

import fragmentShader from "!!raw-loader!./causticsComputeFragment.glsl";

const vertexShader = \`
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vPosition = worldPosition.xyz;

  vec4 viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewPosition;
  
}
\`;

const CausticsComputeMaterial = shaderMaterial(
  {
    uLight: { value: new THREE.Vector2(0, 0, 0) },
    uTexture: { value: null },
    uIntensity: { value: 1.0 },
  },
  vertexShader,
  fragmentShader
);

export default CausticsComputeMaterial;
`;

const NormalMaterial = `import { shaderMaterial } from "@react-three/drei";

const vertexShader = \`
varying vec2 vUv;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);

  // Set the final position of the vertex
  gl_Position = projectionMatrix * modelViewPosition;
}
\`;

const fragmentShader = \`
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vec3 normal = normalize(vNormal);
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
  }
\`;

const NormalMaterial = shaderMaterial({}, vertexShader, fragmentShader);

export default NormalMaterial;
`;

const causticsPlaneFragmentShader = `uniform sampler2D uTexture;
uniform float uAberration;

varying vec2 vUv;

const int SAMPLES = 16;

float random(vec2 p){
  return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

void main() {
  vec2 uv = vUv;
  vec4 color = vec4(0.0);
  
  vec3 refractCol = vec3(0.0);

  float flip = -0.5;

  for ( int i = 0; i < SAMPLES; i ++ ) {
    float noiseIntensity = 0.01; 
    float noise = random(uv) * noiseIntensity;
    float slide = float(i) / float(SAMPLES) * 0.1 + noise;

    
    float mult = i % 2 == 0 ? 1.0 : -1.0;
    flip *= mult;

    vec2 dir = i % 2 == 0 ? vec2(flip, 0.0) : vec2(0.0, flip);

  
    refractCol.r += texture2D(uTexture, uv + (uAberration * slide * dir * 1.0) ).r;
    refractCol.g += texture2D(uTexture, uv + (uAberration * slide * dir * 2.0) ).g;
    refractCol.b += texture2D(uTexture, uv + (uAberration * slide * dir * 3.0) ).b;
  }
  // Divide by the number of layers to normalize colors (rgb values can be worth up to the value of SAMPLES)
  refractCol /= float(SAMPLES);
  refractCol = sat(refractCol, 1.265);

  color = vec4(refractCol.r, refractCol.g, refractCol.b, 1.0);

  gl_FragColor = vec4(color.rgb, 1.0);

  #include <tonemapping_fragment>
  #include <encodings_fragment>
}
`;

const CausticsPlaneMaterial = `import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

import fragmentShader from "!!raw-loader!./causticsPlaneFragmentShader.glsl";

const vertexShader = \`
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);

  vec4 viewPosition = viewMatrix * worldPosition;
  gl_Position = projectionMatrix * viewPosition;
}
\`;

const CausticsPlaneMaterial = shaderMaterial(
  {
    uLight: { value: new THREE.Vector2(0, 0, 0) },
    uTexture: { value: null },
    uAberration: { value: 0.02 },
  },
  vertexShader,
  fragmentShader
);

export default CausticsPlaneMaterial;
`;

const AppCode = `import { 
  OrbitControls, 
  Environment, 
  MeshTransmissionMaterial,
  PerspectiveCamera,
  useFBO,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef, useState } from "react";
import * as THREE from "three";
import { FullScreenQuad } from "three-stdlib";

import CausticsPlaneMaterial from "./CausticsPlaneMaterial";
import CausticsComputeMaterial from "./CausticsComputeMaterial";
import NormalMaterial from "./NormalMaterial";

import './scene.css';

const config = {
  backsideThickness: 0.3,
  thickness: 25,
  samples: 6,
  transmission: 0.9,
  clearcoat: 1,
  clearcoatRoughness: 0.5,
  chromaticAberration: 1.5,
  anisotropy: 0.2,
  roughness: 0,
  distortion: 0,
  distortionScale: 0.09,
  temporalDistortion: 0,
  ior: 1.5,
  color: "#ffffff",
};

const Caustics = () => {
  const mesh = useRef();
  const causticsPlane = useRef();

  const {
    light,
    intensity,
    chromaticAberration,
    rotate,
  } = useControls({
    light: {
      value: new THREE.Vector3(-10, 13, -10),
    },
    intensity: {
      value: 1.5,
      step: 0.01,
      min: 0,
      max: 10.0,
    },
    chromaticAberration: {
      value: 0.16,
      step: 0.001,
      min: 0,
      max: 0.4,
    },
    rotate: {
      value: true,
    }
  });

  const normalRenderTarget = useFBO(2000, 2000, {});
  const [normalCamera] = useState(
    () => new THREE.PerspectiveCamera(65, 1, 0.1, 1000)
  );
  const [normalMaterial] = useState(() => new NormalMaterial());


  const causticsComputeRenderTarget = useFBO(2000, 2000, {});
  const [causticsQuad] = useState(() => new FullScreenQuad());
  const [causticsComputeMaterial] = useState(() => new CausticsComputeMaterial());

  const [causticsPlaneMaterial] = useState(() => new CausticsPlaneMaterial());
  causticsPlaneMaterial.transparent = true;
  causticsPlaneMaterial.blending = THREE.CustomBlending;
  causticsPlaneMaterial.blendSrc = THREE.OneFactor;
  causticsPlaneMaterial.blendDst = THREE.SrcAlphaFactor;

  useFrame((state) => {
    const { gl } = state;

    const bounds = new THREE.Box3().setFromObject(mesh.current, true);

    let boundsVertices = [];
    boundsVertices.push(
      new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.min.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.min.x, bounds.min.y, bounds.max.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.min.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.min.x, bounds.max.y, bounds.max.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.min.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.max.x, bounds.min.y, bounds.max.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.min.z)
    );
    boundsVertices.push(
      new THREE.Vector3(bounds.max.x, bounds.max.y, bounds.max.z)
    );

    const lightDir = new THREE.Vector3(
      light.x,
      light.y,
      light.z
    ).normalize();

    // Calculates the projected coordinates of the vertices onto the plane
    // perpendicular to the light direction
    const projectedCoordinates = boundsVertices.map((v) =>
      {
        const newX = v.x + lightDir.x * (-v.y / lightDir.y);
        const newY = v.y + lightDir.y * (-v.y / lightDir.y);
        const newZ = v.z + lightDir.z * (-v.y / lightDir.y);

        return new THREE.Vector3(newX, newY, newZ);
      }
    );

    // Calculates the combined spatial coordinates of the projected vertices
    // and divides by the number of vertices to get the center position
    const centerPos = projectedCoordinates
      .reduce((a, b) => a.add(b), new THREE.Vector3(0, 0, 0))
      .divideScalar(projectedCoordinates.length);

    // Calculates the scale of the caustic plane based on the distance of the
    // furthest vertex from the center (using euclidean distance)
    const scale = projectedCoordinates
      .map((p) =>
        Math.sqrt(
          Math.pow(p.x - centerPos.x, 2),
          Math.pow(p.z - centerPos.z, 2)
        )
      )
      .reduce((a, b) => Math.max(a, b), 0);

    // The scale of the plane is multiplied by this correction factor to
    // avoid the caustics pattern to be cut / overflow the bounds of the plane
    // my normal projection or my math must be a bit off, so I'm trying to be very conservative here
    const scaleCorrection = 1.75;

    causticsPlane.current.scale.set(
      scale * scaleCorrection,
      scale * scaleCorrection,
      scale * scaleCorrection
    );
    causticsPlane.current.position.set(centerPos.x, centerPos.y, centerPos.z);

    if (rotate) {
      mesh.current.rotation.x += 0.005;
      mesh.current.rotation.y += 0.005;
    }

    normalCamera.position.set(light.x, light.y, light.z);
    normalCamera.lookAt(
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).x,
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).y,
      bounds.getCenter(new THREE.Vector3(0, 0, 0)).z
    );
    normalCamera.up = new THREE.Vector3(0, 1, 0);

    const originalMaterial = mesh.current.material;

    mesh.current.material = normalMaterial;
    mesh.current.material.side = THREE.BackSide;

    gl.setRenderTarget(normalRenderTarget);
    gl.render(mesh.current, normalCamera);

    mesh.current.material = originalMaterial;

    causticsQuad.material = causticsComputeMaterial;
    causticsQuad.material.uniforms.uTexture.value = normalRenderTarget.texture;
    causticsQuad.material.uniforms.uLight.value = light;
    causticsQuad.material.uniforms.uIntensity.value = intensity;

    gl.setRenderTarget(causticsComputeRenderTarget);
    causticsQuad.render(gl);

    causticsPlane.current.material = causticsPlaneMaterial;

    causticsPlane.current.material.uniforms.uTexture.value =
      causticsComputeRenderTarget.texture;
    causticsPlane.current.material.uniforms.uAberration.value =
    chromaticAberration;

    gl.setRenderTarget(null);
  });

  return (
    <>
      <mesh
        ref={mesh}
        scale={0.02}
        position={[0, 6.5, 0]}
      >
        <torusKnotGeometry args={[200, 40, 600, 16]} />
        <MeshTransmissionMaterial backside {...config} />
      </mesh>
      <mesh ref={causticsPlane} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry />
      </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas dpr={[1, 2]}>
      <Caustics />
      <OrbitControls />
      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={65} />
      <Environment
        files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/syferfontein_0d_clear_puresky_1k.hdr"
        ground={{ height: 45, radius: 100, scale: 300 }}
      />
    </Canvas>
  );
};


export default Scene;
`;

const CausticsPlane = {
  '/App.js': {
    code: AppCode,
    active: true,
  },
  '/CausticsPlaneMaterial.js': {
    code: CausticsPlaneMaterial,
  },
  '/causticsPlaneFragmentShader.glsl': {
    code: causticsPlaneFragmentShader,
  },
  '/CausticsComputeMaterial.js': {
    code: CausticsComputeMaterial,
  },
  '/causticsComputeFragment.glsl': {
    code: causticsComputeFragment,
  },
  '/NormalMaterial.js': {
    code: NormalMaterial,
  },
};

export default CausticsPlane;
