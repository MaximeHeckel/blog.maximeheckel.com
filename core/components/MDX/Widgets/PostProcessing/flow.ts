const FragmentShader = `uniform sampler2D mouseTrailTexture;
uniform vec2 mouse;
uniform vec2 mouseDirection;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec4 mouseTrailOG = texture2D(mouseTrailTexture, uv);
  float distanceToCenter = 1.-distance(uv, mouse);

  float pixelSize = 32.0 + length(mouseTrailOG.rg) * distanceToCenter;
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
  vec4 mouseTrail = texture2D(mouseTrailTexture, uvPixel);

  
  vec2 textureUV = uv;
  textureUV -= mouseTrail.rg * distanceToCenter * mouseDirection;
  
  vec4 color = texture2D(inputBuffer, textureUV);
  vec4 trailColor = vec4(0.9, 0.9, 0.9, 0.1);
  outputColor = max(color, mix(color, trailColor, mouseTrail.r));
}
`;

const MouseTrailVertexShader = `varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const MouseTrailFragmentShader = `uniform vec2 mousePosition;
uniform vec2 mouseVelocity;
uniform float time;
uniform float aspect;
uniform sampler2D previousFrame;
uniform float decay;
uniform float size;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec2 uvAspect = vUv;
  uvAspect.x *= aspect;
  
  vec2 mouse = mousePosition;
  mouse.x *= aspect;
  
  vec4 prev = texture2D(previousFrame, vUv);
  
  float dist = distance(uvAspect, mouse);
  float trail = smoothstep(size, 0.0, dist);
  
  vec3 velocity = vec3(abs(mouseVelocity), 0.0) * 0.5;
  vec3 color = mix(prev.rgb * decay, vec3(velocity.r , velocity.g , 0.0), trail);

  gl_FragColor = vec4(color, 1.0);
}
`;

const MouseTrailCode = `import {
  OrbitControls,
  OrthographicCamera,
  useFBO,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useControls } from 'leva';
import * as THREE from 'three';

import mouseTrailVertexShader from '!!raw-loader!./mouseTrailVertexShader.glsl';
import mouseTrailFragmentShader from '!!raw-loader!./mouseTrailFragmentShader.glsl';

const MouseTrail = (props) => {
  const { mouse } = props;
  const plane = useRef();
  const previousPointer = useRef({ x: 0.5, y: 0.5 });
  const previousTime = useRef(0);

  const viewport = useThree((state) => state.viewport);

  const [currentRT, previousRT] = useMemo(() => {
    return [
      new THREE.WebGLRenderTarget(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
        },
      ),
      new THREE.WebGLRenderTarget(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          type: THREE.FloatType,
        },
      ),
    ];
  }, []);

  // Store the FBO references in refs so we can swap them
  const currentRTRef = useRef(currentRT);
  const previousRTRef = useRef(previousRT);

  const { decay, size } = useControls({
    decay: { value: 0.91, min: 0.0, max: 0.99, step: 0.01 },
    size: { value: 0.175, min: 0.0, max: 0.75, step: 0.01 },
  });

  const uniforms = useMemo(() => {
    return {
      mousePosition: { value: [0, 0] },
      time: { value: 0 },
      aspect: { value: 1 },
      previousFrame: { value: null },
      mouseVelocity: { value: [0, 0] },
      decay: { value: 0.85 },
      size: { value: 0.32 },
    };
  }, []);

  const handleResize = useCallback(() => {
    const width = window.innerWidth * window.devicePixelRatio;
    const height = window.innerHeight * window.devicePixelRatio;

    currentRTRef.current.setSize(width, height);
    previousRTRef.current.setSize(width, height);
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useFrame((state) => {
    const { gl, scene, camera, viewport } = state;

    const currentTime = state.clock.getElapsedTime();
    const deltaTime = currentTime - previousTime.current + 1e-6;
    previousTime.current = currentTime;

    const velocityX = (mouse.current.x - previousPointer.current.x) / deltaTime;
    const velocityY = (mouse.current.y - previousPointer.current.y) / deltaTime;

    if (plane.current) {
      plane.current.lookAt(camera.position);

      const material = plane.current.material;
      material.uniforms.time.value = currentTime;
      material.uniforms.mouseVelocity.value = new THREE.Vector2(
        velocityX,
        velocityY,
      );
      material.uniforms.mousePosition.value = new THREE.Vector2(
        mouse.current.x,
        mouse.current.y,
      );
      material.uniforms.previousFrame.value = previousRTRef.current.texture;
      material.uniforms.decay.value = decay;
      material.uniforms.size.value = size;
      material.uniforms.aspect.value = viewport.width / viewport.height;
    }

    gl.setRenderTarget(currentRTRef.current);
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    const temp = currentRTRef.current;
    currentRTRef.current = previousRTRef.current;
    previousRTRef.current = temp;

    previousPointer.current.x = mouse.current.x;
    previousPointer.current.y = mouse.current.y;
  });

  useEffect(() => {
    return () => {
      currentRT.dispose();
      previousRT.dispose();
    };
  }, [currentRT, previousRT]);

  return (
    <>
      <mesh ref={plane} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          fragmentShader={mouseTrailFragmentShader}
          vertexShader={mouseTrailVertexShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
};

export { MouseTrail };
`;

const Model = `import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { v4 as uuidv4 } from "uuid";


const Spaceship = () => {
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
     <group>
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
};

export { Spaceship };
`;

const AppCode = `import { OrbitControls, OrthographicCamera, useFBO } from '@react-three/drei';
import { Canvas, useFrame, useThree, createPortal } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { easing } from 'maath';
import { Effect } from 'postprocessing';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';

import fragmentShader from '!!raw-loader!./fragmentShader.glsl';

import { MouseTrail } from './MouseTrail';
import { Spaceship } from './Model';
import './scene.css';

class CustomPixelatingMouseTrailEffectImpl extends Effect {
  constructor({ mouseTrailTexture = null, mouse = new THREE.Vector2(0, 0), mouseDirection = new THREE.Vector2(0, 0) }) {
    const uniforms = new Map([
     
      ['mouseTrailTexture', new THREE.Uniform(mouseTrailTexture)],
      ['mouse', new THREE.Uniform(mouse)],
      ['mouseDirection', new THREE.Uniform(mouseDirection)],
    ]);

    super('CustomPixelatingMouseTrailEffect', fragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('mouseTrailTexture').value = this.mouseTrailTexture;
    this.uniforms.get('mouse').value = this.mouse;
    this.uniforms.get('mouseDirection').value = this.mouseDirection;
  }
}

const CustomPixelatingMouseTrailEffect = wrapEffect(CustomPixelatingMouseTrailEffectImpl);

const PixelatingMouseTrailEffect = (props) => {
  const effectRef = useRef();

  useFrame(() => {
    if (effectRef.current) {
      effectRef.current.mouse = props.mouse;
      effectRef.current.mouseDirection = props.mouseDirection;
      effectRef.current.mouseTrailTexture = props.mouseTrailTexture;
    }
  });

  return (
    <EffectComposer>
      <CustomPixelatingMouseTrailEffect ref={effectRef} {...props} />
    </EffectComposer>
  );
};



const PixelatingMouseTrail = () => {
  const mouseTrail = useMemo(() => new THREE.Scene(), []);
  const mouseTrailFBO = useFBO({
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const smoothedMouse = useRef({ x: 0.5, y: 0.5 });

  const mouseDirection = useRef({ x: 0, y: 0 });
  const smoothedMouseDirection = useRef({ x: 0, y: 0 });

  const spaceshipRef = useRef();

  useFrame((state) => {
    const { gl, pointer, clock, camera } = state;
    camera.lookAt(0, 0, 0);

    const normalizedPointerX = (pointer.x + 1) * 0.5;
    const normalizedPointerY = (pointer.y + 1) * 0.5;

    mouse.current.x = normalizedPointerX;
    mouse.current.y = normalizedPointerY;

    const mouseDirectionX =
      mouse.current.x > smoothedMouse.current.x
        ? 1
        : mouse.current.x < smoothedMouse.current.x
          ? -1
          : 0;
    const mouseDirectionY =
      mouse.current.y > smoothedMouse.current.y
        ? 1
        : mouse.current.y < smoothedMouse.current.y
          ? -1
          : 0;

    mouseDirection.current.x = mouseDirectionX;
    mouseDirection.current.y = mouseDirectionY;

    easing.damp(smoothedMouse.current, 'x', mouse.current.x, 0.105);
    easing.damp(smoothedMouse.current, 'y', mouse.current.y, 0.105);
    easing.damp(
      smoothedMouseDirection.current,
      'x',
      mouseDirection.current.x,
      0.15,
    );
    easing.damp(
      smoothedMouseDirection.current,
      'y',
      mouseDirection.current.y,
      0.15,
    );

    gl.setRenderTarget(mouseTrailFBO);
    gl.render(mouseTrail, camera);
    gl.setRenderTarget(null);

    if (spaceshipRef.current) {
      spaceshipRef.current.rotation.x =
        Math.cos(clock.getElapsedTime() * 1.0) *
        Math.cos(clock.getElapsedTime()) *
        0.15;
      spaceshipRef.current.position.y =
        Math.sin(clock.getElapsedTime() * 1.0) * 0.5;
    }
  });

  const { camera } = useThree();

  return (
    <>
      {createPortal(<MouseTrail mouse={smoothedMouse} />, mouseTrail, {
        camera,
      })}
      <OrthographicCamera
        makeDefault
        position={[0, 0, 10]}
        zoom={100}
        near={0.01}
        far={500}
      />
      <group rotation={[0, Math.PI / 3, 0]} scale={0.7} ref={spaceshipRef}>
        <Spaceship />
      </group>
      <PixelatingMouseTrailEffect
        mouseTrailTexture={mouseTrailFBO.texture}
        mouse={smoothedMouse.current}
        mouseDirection={smoothedMouseDirection.current}
      />
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
          <color attach='background' args={['#3386E0']} />
          <ambientLight intensity={1.25} />
          <directionalLight position={[5, 10, 5.95]} intensity={15.0} />
          <OrbitControls autoRotate={false} maxZoom={175} minZoom={100} />
          <PixelatingMouseTrail />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const PixelatingMouseTrail = {
  '/App.js': {
    code: AppCode,
  },
  '/MouseTrail.js': {
    code: MouseTrailCode,
  },
  '/Model.js': {
    code: Model,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
  '/mouseTrailVertexShader.glsl': {
    code: MouseTrailVertexShader,
  },
  '/mouseTrailFragmentShader.glsl': {
    code: MouseTrailFragmentShader,
  },
};

export default PixelatingMouseTrail;
