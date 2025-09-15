const Spaceship = `import { useGLTF } from "@react-three/drei";
import { forwardRef, useEffect } from "react";
import * as THREE from "three";

const SPACESHIP_GEOMETRY_URL = "https://cdn.maximeheckel.com/models/spaceship-optimized.glb";

const Spaceship = forwardRef((_, ref) => {
  // Original model by Sousinho
  // Their work: https://sketchfab.com/sousinho
  // The original model: https://sketchfab.com/3d-models/rusty-spaceship-orange-18541ebed6ce44a9923f9b8dc30d87f5
  const gltf = useGLTF(SPACESHIP_GEOMETRY_URL);

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
    <group ref={ref}>
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
    </group>
  );
});

export default Spaceship;
`;

const AppCode = `import { OrbitControls, useFBO, PerspectiveCamera } from '@react-three/drei';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import * as THREE from 'three/webgpu';
import {
  Fn,
  vec2,
  hash,
  sin,
  cos,
  vec3,
  vec4,
  mat3,
  abs,
  length,
  clamp,
  uv,
  mix,
  pass,
  nodeObject,
  add,
  luminance,
  uniform,
  texture,
  textureStore,
  instanceIndex,
  int,
  uvec2,
  float,
  perspectiveDepthToViewZ,
  viewZToOrthographicDepth,
} from 'three/tsl';

import Spaceship from "./Spaceship";
import './scene.css';

extend(THREE);

class CustomEffectNode extends THREE.TempNode {
  constructor(inputNode, storageTexture) {
    super('vec4');
    this.inputNode = inputNode;
    this.storageTexture = storageTexture;
  }

  setup() {
    const inputNode = this.inputNode;
    const storageTexture = this.storageTexture;

    const effect = Fn(() => {
      const input = inputNode;

      const outlineColor = vec4(0.0, 0.0, 0.0, 1.0);
      const magnitude = texture(storageTexture, uv()).r;

      const finalColor = mix(input, outlineColor, magnitude);

      return vec4(finalColor.r, finalColor.g, finalColor.b, 1.0);
    });

    const outputNode = effect();

    return outputNode;
  }
}

const customPass = (node, storageTexture) =>
  nodeObject(new CustomEffectNode(node, storageTexture));

const Core = () => {
  const spaceship = useRef();
  const { scene, camera, gl } = useThree();

  useEffect(() => {
    const dirLight = new THREE.DirectionalLight(0xffffff, 4.0);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
  }, []);

  const { nodes: backgroundNodes } = useMemo(() => {
    const gradientNode = Fn(() => {
      const color1 = vec3(0.01, 0.22, 0.98);
      const color2 = vec3(0.36, 0.68, 1.0);
      const t = clamp(length(abs(uv().sub(0.5))), 0.0, 0.8);
      return mix(color1, color2, t);
    });

    const sphereColorNode = gradientNode();

    return {
      nodes: {
        sphereColorNode,
      },
    };
  }, []);

  const { outputNode, depthTexture } = useMemo(() => {
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');
    const depthTexture = scenePass.getTextureNode('depth');

    const outputNode = scenePassColor;

    return {
      outputNode,
      depthTexture,
    };
  }, [scene, camera]);

  const [normalVisualizationMaterial] = useState(
    () => new THREE.MeshNormalMaterial(),
  );

  const normalRenderTarget = useFBO(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio,
  );

  const { nodes, uniforms, buffers } = useMemo(() => {
    const time = uniform(0.0);

    const storageTexture = new THREE.StorageTexture(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio,
    );

    const computeTexture = Fn(
      ({ storageTexture, depthTexture, normalTexture }) => {
        const posX = instanceIndex.mod(
          int(window.innerWidth * window.devicePixelRatio),
        );

        const posY = instanceIndex.div(
          window.innerWidth * window.devicePixelRatio,
        );

        const fragCoord = uvec2(posX, posY);

        const cameraNear = float(0.1);
        const cameraFar = float(1000.0);

        const readDepth = (depthTexture, coord) => {
          const fragCoordZ = texture(depthTexture, coord).r;
          const viewZ = perspectiveDepthToViewZ(
            fragCoordZ,
            cameraNear,
            cameraFar,
          );
          return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
        };

        const outlineThickness = 1.675 * window.devicePixelRatio;

        const uvCoord = vec2(
          float(fragCoord.x).div(
            float(window.innerWidth * window.devicePixelRatio),
          ),
          float(fragCoord.y).div(
            float(window.innerHeight * window.devicePixelRatio),
          ),
        );

        const frequency = 0.08;
        const displacement = vec2(
          hash(vec2(float(fragCoord.x), float(fragCoord.y))).mul(
            sin(float(fragCoord.y).mul(frequency)),
          ),

          hash(vec2(float(fragCoord.x), float(fragCoord.y))).mul(
            cos(float(fragCoord.x).mul(frequency)),
          ),
        )
          .mul(1.2)
          .div(
            vec2(
              window.innerWidth * window.devicePixelRatio,
              window.innerHeight * window.devicePixelRatio,
            ),
          );

        const texel = vec2(
          1.0 / (window.innerWidth * window.devicePixelRatio),
          1.0 / (window.innerHeight * window.devicePixelRatio),
        ).mul(outlineThickness);

        const Gx = mat3(-1, -2, -1, 0, 0, 0, 1, 2, 1);
        const Gy = mat3(-1, 0, 1, -2, 0, 2, -1, 0, 1);

        const depth0y0 = luminance(
          readDepth(
            depthTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(-1.0, 1.0))),
          ),
        );
        const depth0y1 = luminance(
          readDepth(
            depthTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(-1.0, 0.0))),
          ),
        );
        const depth0y2 = luminance(
          readDepth(
            depthTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(-1.0, -1.0))),
          ),
        );

        const depth1y0 = luminance(
          readDepth(
            depthTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(0.0, -1.0))),
          ),
        );
        const depth1y1 = luminance(
          readDepth(
            depthTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(0.0, 0.0))),
          ),
        );
        const depth1y2 = luminance(
          readDepth(
            depthTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(0.0, 1.0))),
          ),
        );

        const depth2y0 = luminance(
          readDepth(
            depthTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(1.0, -1.0))),
          ),
        );
        const depth2y1 = luminance(
          readDepth(
            depthTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(1.0, 0.0))),
          ),
        );
        const depth2y2 = luminance(
          readDepth(
            depthTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(1.0, 1.0))),
          ),
        );

        const valueGx = add(
          Gx[0][0].mul(depth0y0),
          Gx[1][0].mul(depth0y1),
          Gx[2][0].mul(depth0y2),
          Gx[0][1].mul(depth1y0),
          Gx[1][1].mul(depth1y1),
          Gx[2][1].mul(depth1y2),
          Gx[0][2].mul(depth2y0),
          Gx[1][2].mul(depth2y1),
          Gx[2][2].mul(depth2y2),
        );

        const valueGy = add(
          Gy[0][0].mul(depth0y0),
          Gy[1][0].mul(depth0y1),
          Gy[2][0].mul(depth0y2),
          Gy[0][1].mul(depth1y0),
          Gy[1][1].mul(depth1y1),
          Gy[2][1].mul(depth1y2),
          Gy[0][2].mul(depth2y0),
          Gy[1][2].mul(depth2y1),
          Gy[2][2].mul(depth2y2),
        );

        const GDepth = valueGx.mul(valueGx).add(valueGy.mul(valueGy)).sqrt();

        const normal0y0 = luminance(
          texture(
            normalTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(-1.0, 1.0))),
          ).rgb,
        );
        const normal0y1 = luminance(
          texture(
            normalTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(-1.0, 0.0))),
          ).rgb,
        );
        const normal0y2 = luminance(
          texture(
            normalTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(-1.0, -1.0))),
          ).rgb,
        );

        const normal1y0 = luminance(
          texture(
            normalTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(0.0, -1.0))),
          ).rgb,
        );
        const normal1y1 = luminance(
          texture(
            normalTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(0.0, 0.0))),
          ).rgb,
        );
        const normal1y2 = luminance(
          texture(
            normalTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(0.0, 1.0))),
          ).rgb,
        );

        const normal2y0 = luminance(
          texture(
            normalTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(1.0, -1.0))),
          ).rgb,
        );
        const normal2y1 = luminance(
          texture(
            normalTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(1.0, 0.0))),
          ).rgb,
        );
        const normal2y2 = luminance(
          texture(
            normalTexture,
            uvCoord.add(displacement).add(texel.mul(vec2(1.0, 1.0))),
          ).rgb,
        );

        const valueGxNormal = add(
          Gx[0][0].mul(normal0y0),
          Gx[1][0].mul(normal0y1),
          Gx[2][0].mul(normal0y2),
          Gx[0][1].mul(normal1y0),
          Gx[1][1].mul(normal1y1),
          Gx[2][1].mul(normal1y2),
          Gx[0][2].mul(normal2y0),
          Gx[1][2].mul(normal2y1),
          Gx[2][2].mul(normal2y2),
        );

        const valueGyNormal = add(
          Gy[0][0].mul(normal0y0),
          Gy[1][0].mul(normal0y1),
          Gy[2][0].mul(normal0y2),
          Gy[0][1].mul(normal1y0),
          Gy[1][1].mul(normal1y1),
          Gy[2][1].mul(normal1y2),
          Gy[0][2].mul(normal2y0),
          Gy[1][2].mul(normal2y1),
          Gy[2][2].mul(normal2y2),
        );

        const GNormal = valueGxNormal
          .mul(valueGxNormal)
          .add(valueGyNormal.mul(valueGyNormal))
          .sqrt();

        const magnitude = GDepth.add(GNormal);

        textureStore(storageTexture, fragCoord, vec4(magnitude, 0.0, 0.0, 1.0));
      },
    );

    const computeNode = computeTexture({
      storageTexture: storageTexture,
      depthTexture: depthTexture,
      normalTexture: normalRenderTarget.texture,
    }).compute(
      window.innerWidth *
        window.devicePixelRatio *
        window.innerHeight *
        window.devicePixelRatio,
    );

    return {
      nodes: {
        computeNode,
      },
      uniforms: {
        time,
      },
      buffers: {
        storageTexture,
      },
    };
  }, [depthTexture, normalRenderTarget]);

  const compute = useCallback(async () => {
    try {
      await gl.computeAsync(nodes.computeNode);
    } catch (error) {
      console.error(error);
    }
  }, [nodes.computeNode, gl]);

  const postProcessingRef = useRef();

  useEffect(() => {
    const postProcessing = new THREE.PostProcessing(gl);
    postProcessing.outputNode = outputNode;
    postProcessingRef.current = postProcessing;

    if (postProcessingRef.current) {
      postProcessingRef.current.needsUpdate = true;
    }

    return () => {
      postProcessingRef.current = null;
    };
  }, [gl, outputNode]);

  useFrame((state) => {
    const { gl, clock, scene, camera } = state;

    uniforms.time.value = clock.getElapsedTime();

    spaceship.current.rotation.x =
      Math.cos(clock.getElapsedTime() * 2.0) *
      Math.cos(clock.getElapsedTime()) *
      0.15;
    spaceship.current.position.y =
      Math.sin(clock.getElapsedTime() * 2.0);

    gl.setRenderTarget(normalRenderTarget);

    const materials = [];
    scene.traverse((obj) => {
      if (obj.isMesh) {
        materials.push(obj.material);
        obj.material = normalVisualizationMaterial;
      }
    });

    gl.render(scene, camera);

    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = materials.shift();
      }
    });

    gl.setRenderTarget(null);

    compute();
  });

  useFrame(() => {
    if (postProcessingRef.current) {
      postProcessingRef.current.outputNode = customPass(
        outputNode,
        buffers.storageTexture,
      );
      postProcessingRef.current.render();
    }
  }, 1);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[10, 10, 10]}
        near={0.01}
        fov={40}
        far={800}
      />
      <mesh>
        <sphereGeometry args={[50, 16, 16]} />
        <meshBasicNodeMaterial
          colorNode={backgroundNodes.sphereColorNode}
          side={THREE.BackSide}
        />
      </mesh>
      <group rotation={[0, Math.PI / 2, 0]} position={[0, 2, 0]}>
        <Spaceship ref={spaceship} />
      </group>
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas
        shadows
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(props);
          await renderer.init();
          return renderer;
        }}
      >
        <Suspense>
          <OrbitControls />
          <Core />
        </Suspense>
      </Canvas>
    </>
  );
};

export default Scene;`;

const Outline = {
  '/App.js': {
    code: AppCode,
  },
  '/Spaceship.js': {
    code: Spaceship,
  },
};

export default Outline;
