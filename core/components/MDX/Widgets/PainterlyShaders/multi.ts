const KuwaharaFragmentShader = `#define SECTOR_COUNT 8

uniform int radius;
uniform sampler2D inputBuffer;
uniform vec4 resolution;
uniform sampler2D originalTexture;

varying vec2 vUv;

vec4 fromLinear(vec4 linearRGB) {
    bvec3 cutoff = lessThan(linearRGB.rgb, vec3(0.0031308));
    vec3 higher = vec3(1.055)*pow(linearRGB.rgb, vec3(1.0/2.4)) - vec3(0.055);
    vec3 lower = linearRGB.rgb * vec3(12.92);

    return vec4(mix(higher, lower, cutoff), linearRGB.a);
}

vec3 sampleColor(vec2 offset) {
    vec2 coord = (gl_FragCoord.xy + offset) / resolution.xy;
    return texture2D(originalTexture, coord).rgb;
}

vec4 getDominantOrientation(vec4 structureTensor) {
    float Jxx = structureTensor.r; 
    float Jyy = structureTensor.g; 
    float Jxy = structureTensor.b; 

    float trace = Jxx + Jyy;
    float determinant = Jxx * Jyy - Jxy * Jxy;

    float lambda1 = trace * 0.5 + sqrt(trace * trace * 0.25 - determinant);
    float lambda2 = trace * 0.5 - sqrt(trace * trace * 0.25 - determinant);
    
    float jxyStrength = abs(Jxy) / (abs(Jxx) + abs(Jyy) + abs(Jxy) + 1e-7);

    vec2 v;
    
    if (jxyStrength > 0.0) {
        v = normalize(vec2(-Jxy, Jxx - lambda1));
    } else {
        v = vec2(0.0, 1.0);
    }

    return vec4(normalize(v), lambda1, lambda2);
}

float polynomialWeight(float x, float y, float eta, float lambda) {
    float polyValue = (x + eta) - lambda * (y * y);
    return max(0.0, polyValue * polyValue);
}

void getSectorVarianceAndAverageColor(mat2 anisotropyMat, float angle, float radius, out vec3 avgColor, out float variance) {
    vec3 weightedColorSum = vec3(0.0);
    vec3 weightedSquaredColorSum = vec3(0.0);
    float totalWeight = 0.0;

    float eta = 0.1;
    float lambda = 0.5;

    for (float r = 1.0; r <= radius; r += 1.0) {
        for (float a = -0.392699; a <= 0.392699; a += 0.196349) {
            vec2 sampleOffset = r * vec2(cos(angle + a), sin(angle + a));
            sampleOffset *= anisotropyMat;

            vec3 color = sampleColor(sampleOffset);
            float weight = polynomialWeight(sampleOffset.x, sampleOffset.y, eta, lambda);

            weightedColorSum += color * weight;
            weightedSquaredColorSum += color * color * weight;
            totalWeight += weight;
        }
    }

    // Calculate average color and variance
    avgColor = weightedColorSum / totalWeight;
    vec3 varianceRes = (weightedSquaredColorSum / totalWeight) - (avgColor * avgColor);
    variance = dot(varianceRes, vec3(0.299, 0.587, 0.114)); // Convert to luminance
}

void main() {
    vec4 structureTensor = texture2D(inputBuffer, vUv);

    vec3 sectorAvgColors[SECTOR_COUNT];
    float sectorVariances[SECTOR_COUNT];

    vec4 orientationAndAnisotropy = getDominantOrientation(structureTensor);
    vec2 orientation = orientationAndAnisotropy.xy;

    float anisotropy = (orientationAndAnisotropy.z - orientationAndAnisotropy.w) / (orientationAndAnisotropy.z + orientationAndAnisotropy.w + 1e-7);

    float alpha = 25.0;
    float scaleX = alpha / (anisotropy + alpha);
    float scaleY = (anisotropy + alpha) / alpha;

    mat2 anisotropyMat = mat2(orientation.x, -orientation.y, orientation.y, orientation.x) * mat2(scaleX, 0.0, 0.0, scaleY);

    for (int i = 0; i < SECTOR_COUNT; i++) {
      float angle = float(i) * 6.28318 / float(SECTOR_COUNT); // 2π / SECTOR_COUNT
      getSectorVarianceAndAverageColor(anisotropyMat, angle, float(radius), sectorAvgColors[i], sectorVariances[i]);
    }

    float minVariance = sectorVariances[0];
    vec3 finalColor = sectorAvgColors[0];

    for (int i = 1; i < SECTOR_COUNT; i++) {
        if (sectorVariances[i] < minVariance) {
            minVariance = sectorVariances[i];
            finalColor = sectorAvgColors[i];
        }
    }

    vec4 color = vec4(finalColor, 1.0);
    gl_FragColor = fromLinear(color);
}`;

const TensorFragmentShader = `varying vec2 vUv;
uniform sampler2D inputBuffer;
uniform vec4 resolution;

// Sobel kernels
const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 ); // x direction kernel
const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 ); // y direction kernel


vec4 computeStructureTensor(sampler2D inputTexture, vec2 uv) {
    vec3 tx0y0 = texture2D(inputTexture, uv + vec2(-1, -1) / resolution.xy).rgb;
    vec3 tx0y1 = texture2D(inputTexture, uv + vec2(-1,  0) / resolution.xy).rgb;
    vec3 tx0y2 = texture2D(inputTexture, uv + vec2(-1,  1) / resolution.xy).rgb;
    vec3 tx1y0 = texture2D(inputTexture, uv + vec2( 0, -1) / resolution.xy).rgb;
    vec3 tx1y1 = texture2D(inputTexture, uv + vec2( 0,  0) / resolution.xy).rgb;
    vec3 tx1y2 = texture2D(inputTexture, uv + vec2( 0,  1) / resolution.xy).rgb;
    vec3 tx2y0 = texture2D(inputTexture, uv + vec2( 1, -1) / resolution.xy).rgb;
    vec3 tx2y1 = texture2D(inputTexture, uv + vec2( 1,  0) / resolution.xy).rgb;
    vec3 tx2y2 = texture2D(inputTexture, uv + vec2( 1,  1) / resolution.xy).rgb;

    vec3 Sx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
              Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
              Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;

    vec3 Sy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
              Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
              Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;

    return vec4(dot(Sx, Sx), dot(Sy, Sy), dot(Sx, Sy), 1.0);
}

void main() {
    vec4 tensor = computeStructureTensor(inputBuffer, vUv);
    
    gl_FragColor = tensor;
}`;

const Models = `import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";


export const Plant = () => {
  const { scene } = useGLTF("https://cdn.maximeheckel.com/models/plant-optimized.glb");


  return (
    <group rotation={[0, 0, 0]} position={[0, -3.5, 0]} scale={4}>
      <primitive  object={scene} />
      <directionalLight position={[15, 10, -5.95]} intensity={10.0} />
    </group>
  );
};


export const Spaceship = () => {
  // Original model by Sousinho
  // Their work: https://sketchfab.com/sousinho
  // The original model: https://sketchfab.com/3d-models/rusty-spaceship-orange-18541ebed6ce44a9923f9b8dc30d87f5
  const gltf = useGLTF("https://cdn.maximeheckel.com/models/spaceship-optimized.glb");

  useEffect(() => {
    if (gltf) {
      function alphaFix(material) {
        material.transparent = true;
        material.alphaToCoverage = true;
        material.depthFunc = THREE.LessEqualDepth;
        material.depthTest = true;
        material.depthWrite = true;
      }
      alphaFix(gltf.materials.spaceship_racer);
      alphaFix(gltf.materials.cockpit);
    }
  }, [gltf]);

  return (
    <group rotation={[Math.PI * 0.05, Math.PI * 0.4, 0]}>
      <group
        scale={0.005}
        rotation={[0, -Math.PI * 0.5, 0]}
        position={[1.583, 0, -3.725]}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={gltf.nodes.Cube001_spaceship_racer_0.geometry}
          material={gltf.materials.spaceship_racer}
          position={[739.26, -64.81, 64.77]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={gltf.nodes.Cube005_cockpit_0.geometry}
          material={gltf.materials.spaceship_racer}
          position={[739.26, 0, 0]}
        />
      </group>
      <directionalLight position={[5, 10, 5.95]} intensity={25.0} />
    </group>
  );
};
`;

const PostProcessing = `import { Pass } from "postprocessing";
import * as THREE from "three";
import tensorFragmentShader from "!!raw-loader!./tensorFragmentShader.glsl";
import kuwaharaFragmentShader from "!!raw-loader!./kuwaharaFragmentShader.glsl";

const tensorShader = {
  uniforms: {
    inputBuffer: { value: null },
    resolution: {
      value: new THREE.Vector4(),
    },
  },
  vertexShader: \`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
   

    // Set the final position of the vertex
    gl_Position = projectionMatrix * modelViewPosition;
  }
  \`,
  fragmentShader: tensorFragmentShader,
};

class TensorPass extends Pass {
  constructor(args) {
    super();

    this.material = new THREE.ShaderMaterial(tensorShader);
    this.fullscreenMaterial = this.material;
    this.resolution = new THREE.Vector4(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2),
      1 / (window.innerWidth * Math.min(window.devicePixelRatio, 2)),
      1 / (window.innerHeight * Math.min(window.devicePixelRatio, 2))
    );
  }

  dispose() {
    this.material.dispose();
  }

  render(renderer, writeBuffer, readBuffer) {
    this.material.uniforms.inputBuffer.value = readBuffer.texture;
    this.material.uniforms.resolution.value = new THREE.Vector4(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2),
      1 / (window.innerWidth * Math.min(window.devicePixelRatio, 2)),
      1 / (window.innerHeight * Math.min(window.devicePixelRatio, 2))
    );

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      renderer.render(this.scene, this.camera);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      renderer.render(this.scene, this.camera);
    }
  }
}

const kuwaharaShader = {
  uniforms: {
    inputBuffer: { value: null },
    resolution: {
      value: new THREE.Vector4(),
    },
    originalTexture: { value: null },
    radius: { value: 10.0 },
  },
  vertexShader: \`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
   

    // Set the final position of the vertex
    gl_Position = projectionMatrix * modelViewPosition;
  }
  \`,
  fragmentShader: kuwaharaFragmentShader,
};

class KuwaharaPass extends Pass {
  constructor(args) {
    super();

    this.material = new THREE.ShaderMaterial(kuwaharaShader);
    this.fullscreenMaterial = this.material;
    this.resolution = new THREE.Vector4(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2),
      1 / (window.innerWidth * Math.min(window.devicePixelRatio, 2)),
      1 / (window.innerHeight * Math.min(window.devicePixelRatio, 2))
    );
    this.radius = args.radius;
    this.originalSceneTarget = args.originalSceneTarget;
  }

  dispose() {
    this.material.dispose();
  }

  render(renderer, writeBuffer, readBuffer) {
    this.material.uniforms.resolution.value = new THREE.Vector4(
      window.innerWidth * Math.min(window.devicePixelRatio, 2),
      window.innerHeight * Math.min(window.devicePixelRatio, 2),
      1 / (window.innerWidth * Math.min(window.devicePixelRatio, 2)),
      1 / (window.innerHeight * Math.min(window.devicePixelRatio, 2))
    );
    this.material.uniforms.radius.value = this.radius;
    this.material.uniforms.inputBuffer.value = readBuffer.texture;
    this.material.uniforms.originalTexture.value = this.originalSceneTarget.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      renderer.render(this.scene, this.camera);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      renderer.render(this.scene, this.camera);
    }
  }
}

export { TensorPass, KuwaharaPass };

`;

const AppCode = `import { 
  OrbitControls,
  OrthographicCamera,
  useFBO,
  Effects,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useControls, folder } from "leva";
import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import { Plant, Spaceship } from "./Models";
import { TensorPass, KuwaharaPass } from "./PostProcessing";

import './scene.css';

extend({ TensorPass, KuwaharaPass });

const Painting = () => {
  const tensorPassRef = useRef();
  const kuwaharaPassRef = useRef();
  const { tensorPass, kuwaharaPass, radius, model } = useControls({
    passes: folder({
      tensorPass: { value: true },
      kuwaharaPass: { value: true },
    }),
    radius: { value: 6, min: 1, max: 10, step: 1 },
    model: {
        value: "plant",
        options: ["spaceship", "plant"],
    }
  });

  const originalSceneTarget = useFBO(
    window.innerWidth * Math.min(window.devicePixelRatio, 2),
    window.innerHeight * Math.min(window.devicePixelRatio, 2)
  );

  useFrame((state) => {
    const { gl, scene, camera } = state;
    tensorPassRef.current.enabled = false;
    kuwaharaPassRef.current.enabled = false;

    gl.setRenderTarget(originalSceneTarget);
    gl.render(scene, camera);

    tensorPassRef.current.enabled = tensorPass;
    kuwaharaPassRef.current.enabled = kuwaharaPass;

    gl.setRenderTarget(null);
    gl.render(scene, camera);

    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <group scale={0.70}>
        {model === "spaceship" ? <Spaceship /> : <Plant />}
      </group>
      <Effects key={uuidv4()}>
        <tensorPass 
          ref={tensorPassRef}
        />
        <kuwaharaPass 
          ref={kuwaharaPassRef}
          args={[{
            radius,
            originalSceneTarget: originalSceneTarget
          }]}
        />
      </Effects>
    </>
  );
};

const Scene = () => {
  return (
    <Canvas dpr={[1, 2]}>
      <Suspense fallback="Loading">
        <ambientLight intensity={1.25} />
        <color attach="background" args={["#3386E0"]} />
        <Painting />
        <OrbitControls />
        <OrthographicCamera
          makeDefault
          position={[5, 0, 10]}
          zoom={100}
          near={0.01}
          far={500}
        />
      </Suspense>
    </Canvas>
  );
};


export default Scene;`;

const Multi = {
  '/App.js': {
    code: AppCode,
  },
  '/PostProcessing.js': {
    code: PostProcessing,
  },
  '/Models.js': {
    code: Models,
    hidden: true,
  },
  '/tensorFragmentShader.glsl': {
    code: TensorFragmentShader,
    hidden: true,
  },
  '/kuwaharaFragmentShader.glsl': {
    code: KuwaharaFragmentShader,
    active: true,
  },
};

export default Multi;
