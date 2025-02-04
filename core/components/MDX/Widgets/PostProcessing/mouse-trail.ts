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

const AppCode = `import { OrbitControls, OrthographicCamera, useFBO } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva, useControls } from 'leva';
import { easing } from 'maath';
import { Effect } from 'postprocessing';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';

import { MouseTrail } from './MouseTrail';
import './scene.css';

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

  useFrame((state) => {
    const { gl, pointer, clock, camera } = state;
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
  });

  const { camera } = useThree();

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 10]}
        zoom={100}
        near={0.01}
        far={500}
      />
      <MouseTrail mouse={smoothedMouse} />
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
