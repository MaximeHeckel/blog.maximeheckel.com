const FragmentShader = `#define SECTOR_COUNT 8

uniform int radius;
uniform sampler2D inputBuffer;
uniform vec4 resolution;
uniform sampler2D originalTexture;

varying vec2 vUv;

vec3 sampleColor(vec2 offset) {
    vec2 coord = (gl_FragCoord.xy + offset) / resolution.xy;
    return texture2D(inputBuffer, coord).rgb;
}

void getSectorVarianceAndAverageColor(float angle, float radius, out vec3 avgColor, out float variance) {
    vec3 colorSum = vec3(0.0);
    vec3 squaredColorSum = vec3(0.0);
    float sampleCount = 0.0;

    for (float r = 1.0; r <= radius; r += 1.0) {
        for (float a = -0.392699; a <= 0.392699; a += 0.196349) {
            vec2 sampleOffset = r * vec2(cos(angle + a), sin(angle + a));
            vec3 color = sampleColor(sampleOffset);
            colorSum += color;
            squaredColorSum += color * color;
            sampleCount += 1.0;
        }
    }

    // Calculate average color and variance
    avgColor = colorSum / sampleCount;
    vec3 varianceRes = (squaredColorSum / sampleCount) - (avgColor * avgColor);
    variance = dot(varianceRes, vec3(0.299, 0.587, 0.114)); // Convert to luminance
}

void main() {
    vec3 sectorAvgColors[SECTOR_COUNT];
    float sectorVariances[SECTOR_COUNT];

    for (int i = 0; i < SECTOR_COUNT; i++) {
      float angle = float(i) * 6.28318 / float(SECTOR_COUNT); // 2π / SECTOR_COUNT
      getSectorVarianceAndAverageColor(angle, float(radius), sectorAvgColors[i], sectorVariances[i]);
    }

    float minVariance = sectorVariances[0];
    vec3 finalColor = sectorAvgColors[0];

    for (int i = 1; i < SECTOR_COUNT; i++) {
        if (sectorVariances[i] < minVariance) {
            minVariance = sectorVariances[i];
            finalColor = sectorAvgColors[i];
        }
    }

    gl_FragColor = vec4(finalColor, 1.0);
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
      <directionalLight position={[15, 10, -5.95]} intensity={20.0} />
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

const AppCode = `import { 
  OrbitControls,
  OrthographicCamera,
  useFBO,
  Effects,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { useControls } from "leva";

import { Pass } from "postprocessing";
import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";
import { Plant, Spaceship } from "./Models";

import './scene.css';

const kuwaharaShader = {
  uniforms: {
    inputBuffer: { value: null },
    resolution: {
      value: new THREE.Vector4(),
    },
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
  fragmentShader,
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


extend({ KuwaharaPass });

const Painting = () => {
  const kuwaharaPassRef = useRef();

  const { enabled, radius, model } = useControls({
    enabled: true,
    radius: { value: 10, min: 1, max: 25, step: 1 },
    model: {
        value: "spaceship",
        options: ["spaceship", "plant"],
    }
  });

  useFrame((state) => {
    const { camera } = state;
    kuwaharaPassRef.current.radius = radius;
    kuwaharaPassRef.current.enabled = enabled;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <group scale={0.70}>
        {model === "spaceship" ? <Spaceship /> : <Plant />}
      </group>
      <Effects key={uuidv4()}>
        <kuwaharaPass 
          ref={kuwaharaPassRef}
          args={[{
            radius
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

const Circular = {
  '/App.js': {
    code: AppCode,
  },
  '/Models.js': {
    code: Models,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default Circular;
