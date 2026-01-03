const HalftoneFragmentShader = `uniform float pixelSize;
uniform float dotSize;
uniform sampler2D brushTexture;
uniform float mouseStrength;
uniform bool debug;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 pixelCoord = uv * resolution;
    vec2 baseCellIndex = floor(pixelCoord / pixelSize);
    
    float minDist = 100.0;
    float maxCircle = 0.0;
    
    const int searchRadius = 4;
    
    for (int dy = -searchRadius; dy <= searchRadius; dy++) {
        for (int dx = -searchRadius; dx <= searchRadius; dx++) {
            vec2 cellIndex = baseCellIndex + vec2(float(dx), float(dy));
            
            vec2 cellOffset = mod(cellIndex.y, 2.0) == 0.0 ? vec2(0.0) : vec2(0.5, 0.0);
            vec2 cellCenter = (cellIndex + 0.5 + cellOffset) * pixelSize;
            
            vec2 brushUV = cellCenter / resolution;
            vec4 brush = texture2D(brushTexture, brushUV);
            vec2 brushVel = clamp(brush.rg, -0.45, 0.45);
            float brushIntensity = length(brushVel);

            vec2 forwardDir = brushIntensity > 0.001 ? brushVel / brushIntensity : vec2(0.0);
            vec2 perpDir = vec2(-forwardDir.y, forwardDir.x);
            float side = sign(random(cellCenter) - 0.5);
            
            float t = smoothstep(0.0, 0.5, brushIntensity);
            float easeIn = t * t * t;
            float easedIntensity = mix(easeIn, t, 0.5);
            
            vec2 srcUV = clamp(cellCenter / resolution, 0.0, 1.0);
            vec3 srcColor = texture2D(inputBuffer, srcUV).rgb;
            
            vec2 displacement = forwardDir * 0.75 + perpDir * side * 0.25;
            cellCenter += displacement * mouseStrength * easedIntensity;
            
            float l = dot(vec3(0.2126, 0.7152, 0.0722), srcColor);
            float darkness = 1.0 - l;
            darkness = smoothstep(0.0, 3.0, darkness);
            
            if (darkness > 0.175) {
                float dist = length(pixelCoord - cellCenter);
                
                float outerRadius = darkness * dotSize * pixelSize;
                float ringThickness = pixelSize * 0.25;
                float innerRadius = max(outerRadius - ringThickness, 0.0);
                
                float midRadius = (outerRadius + innerRadius) * 0.5;
                float halfThickness = (outerRadius - innerRadius) * 0.5;
                float sdfDist = abs(dist - midRadius) - halfThickness;
                minDist = min(minDist, sdfDist);
                
                float aa = fwidth(dist);
                float outer = 1.0 - smoothstep(outerRadius - aa, outerRadius + aa, dist);
                float inner = smoothstep(innerRadius - aa, innerRadius + aa, dist);
                float ring = outer * inner;
                maxCircle = max(maxCircle, ring);
            }
        }
    }
    
    float finalShape = maxCircle;
    
    vec3 finalColor = vec3(1.0 - finalShape);
    vec4 debugTextureColor = texture2D(brushTexture, uv);
    outputColor = vec4(finalColor, 1.0) + (debug ? debugTextureColor : vec4(0.0));
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

const MouseTrailVertexShader = `
varying vec2 vUv;
  
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
  
  float velMagnitude = length(mouseVelocity);
  float trail = smoothstep(size, 0.0, dist) * smoothstep(0.0, 0.5, velMagnitude);
  
  vec3 velocity = vec3(mouseVelocity, 0.0) * 0.5;
  vec3 color = mix(prev.rgb * decay, velocity, trail);

  gl_FragColor = vec4(color, 1.0);
}
`;

const MouseTrail = `import { useFrame } from '@react-three/fiber';
import { useRef, useMemo, useCallback, useEffect } from 'react';
import * as THREE from 'three';

import mouseTrailVertexShader from '!!raw-loader!./MouseTrailVertexShader.glsl';
import mouseTrailFragmentShader from '!!raw-loader!./MouseTrailFragmentShader.glsl';

const MouseTrail = (props) => {
  const { mouse, onTextureUpdate } = props;
  const plane = useRef();
  const previousPointer = useRef({ x: 0.5, y: 0.5 });
  const previousTime = useRef(0);

  const trailCamera = useMemo(() => {
    const cam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    cam.position.z = 1;
    return cam;
  }, []);

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

  const currentRTRef = useRef(currentRT);
  const previousRTRef = useRef(previousRT);

  const uniforms = useMemo(() => {
    return {
      mousePosition: { value: [0, 0] },
      time: { value: 0 },
      aspect: { value: 1 },
      previousFrame: { value: null },
      mouseVelocity: { value: [0, 0] },
      decay: { value: 0.994 },
      size: { value: 0.06 },
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
    const { gl, scene, viewport } = state;

    const currentTime = state.clock.getElapsedTime();
    const deltaTime = currentTime - previousTime.current + 1e-6;
    previousTime.current = currentTime;

    const velocityX = (mouse.current.x - previousPointer.current.x) / deltaTime;
    const velocityY = (mouse.current.y - previousPointer.current.y) / deltaTime;

    if (plane.current) {
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
      material.uniforms.aspect.value = viewport.width / viewport.height;
    }

    gl.setRenderTarget(currentRTRef.current);
    gl.render(scene, trailCamera);
    gl.setRenderTarget(null);

    const temp = currentRTRef.current;
    currentRTRef.current = previousRTRef.current;
    previousRTRef.current = temp;

    if (onTextureUpdate) {
      onTextureUpdate(previousRTRef.current.texture);
    }

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
      <mesh ref={plane}>
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

const AppCode = `import { PerspectiveCamera, useTexture } from '@react-three/drei';
import { Canvas, extend, useFrame, useThree, createPortal } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { useControls } from 'leva';
import { easing } from 'maath';
import { Effect } from 'postprocessing';
import { Suspense, useMemo, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { MouseTrail } from './MouseTrail';
import { wrapEffect } from './WrapEffect';
import './scene.css';

import halftoneFragmentShader from '!!raw-loader!./halftoneFragmentShader.glsl';

extend(THREE);

class HalftoneEffectImpl extends Effect {
  constructor({ pixelSize = 1.0, dotSize = 0.7, noise = null, mouseStrength = 50.0, debug = false }) {
    const uniforms = new Map([
      ['pixelSize', new THREE.Uniform(pixelSize)],
      ['dotSize', new THREE.Uniform(dotSize)],
      ['blueNoise', new THREE.Uniform(noise)],
      ['brushTexture', new THREE.Uniform(null)],
      ['mouseStrength', new THREE.Uniform(mouseStrength)],
      ['debug', new THREE.Uniform(debug)],
    ]);

    super('CustomHalftoneEffect', halftoneFragmentShader, {
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('pixelSize').value = this.pixelSize;
    this.uniforms.get('dotSize').value = this.dotSize;
    this.uniforms.get('blueNoise').value = this.blueNoise;
    this.uniforms.get('brushTexture').value = this.brushTexture;
    this.uniforms.get('mouseStrength').value = this.mouseStrength;
    this.uniforms.get('debug').value = this.debug;
  }
}

const CustomHalftoneEffect = wrapEffect(HalftoneEffectImpl);

const HalftoneEffect = ({ trailTextureRef }) => {
  const effectRef = useRef();

  const { enabled, dotSize, debug } = useControls({
    dotSize: {
      value: 2.5,
      min: 2.0,
      max: 10.0,
      step: 0.05,
    },
    debug: {
      value: false,
    },
    enabled: {
      value: true,
    },
  });

  useFrame(() => {
    if (effectRef.current && trailTextureRef.current) {
      effectRef.current.brushTexture = trailTextureRef.current;
    }
  });

  return (
    <EffectComposer enabled={enabled}>
      <CustomHalftoneEffect
        ref={effectRef}
        pixelSize={12.0}
        dotSize={dotSize}
        mouseStrength={50.0}
        debug={debug}
      />
    </EffectComposer>
  );
};

const HalftoneTrail = () => {
  const mouseTrail = useMemo(() => new THREE.Scene(), []);
  const trailTextureRef = useRef(null);

  const smoothedMouse = useRef({ x: -2, y: -2 });

  useFrame((state) => {
    const { pointer } = state;

    const normalizedPointerX = (pointer.x + 1) * 0.5;
    const normalizedPointerY = (pointer.y + 1) * 0.5;


    easing.damp(smoothedMouse.current, 'x', normalizedPointerX, 0.075);
    easing.damp(smoothedMouse.current, 'y', normalizedPointerY, 0.075);
  });

  const handleTextureUpdate = useCallback((texture) => {
    trailTextureRef.current = texture;
  }, []);

  const texture = useTexture('https://cdn.maximeheckel.com/images/backgrounds/gril-with-pearl-earing.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const { viewport } = useThree();

  const imageAspect = texture.image
    ? texture.image.width / texture.image.height
    : 1;
  const viewportAspect = viewport.width / viewport.height;

    
  let planeWidth = 1;
  let planeHeight = 1;
  if (imageAspect > viewportAspect) {
    planeHeight = viewport.height;
    planeWidth = viewport.height * imageAspect;
  } else {
    planeWidth = viewport.width;
    planeHeight = viewport.width / imageAspect;
  }
  
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 5]}
        near={0.01}
        far={500}
      />
      {createPortal(
        <MouseTrail mouse={smoothedMouse} onTextureUpdate={handleTextureUpdate} />,
        mouseTrail
      )}
      <mesh scale={[planeWidth, planeHeight, 1]}>
        <planeGeometry args={[0.85, 0.85]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <HalftoneEffect trailTextureRef={trailTextureRef} />
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas dpr={[1, 1.5]}>
        <Suspense>
          <color attach='background' args={['#fff']} />
          <HalftoneTrail />
        </Suspense>
      </Canvas>
    </>
  );
};

export default Scene;`;

const Halftone = {
  '/App.js': {
    code: AppCode,
  },
  '/halftoneFragmentShader.glsl': {
    code: HalftoneFragmentShader,
    active: true,
  },
  '/MouseTrail.js': {
    code: MouseTrail,
    hidden: true,
  },
  '/MouseTrailVertexShader.glsl': {
    code: MouseTrailVertexShader,
    hidden: true,
  },
  '/MouseTrailFragmentShader.glsl': {
    code: MouseTrailFragmentShader,
    hidden: true,
  },
  '/WrapEffect.js': {
    code: WrapEffect,
    hidden: true,
  },
};

export default Halftone;
