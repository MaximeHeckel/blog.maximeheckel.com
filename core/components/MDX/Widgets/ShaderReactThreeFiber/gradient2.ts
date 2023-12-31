const SimplexNoise = `//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

// https://github.com/hughsk/glsl-noise/blob/master/simplex/2d.glsl

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
// End of Simplex Noise Code
`;

const FragmentShader = `uniform float u_time;
uniform vec3 u_bg;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec2 u_mouse;

varying vec2 vUv;

${SimplexNoise}

void main() {
  vec3 color = u_bg;

  float noise1 = snoise(vUv + u_time * (sin(u_mouse.x * 0.001) + 0.2));
  float noise2 = snoise(vUv + u_time * (sin(u_mouse.y * 0.001) + 0.2));

  color = mix(color, u_colorA, noise1);
  color = mix(color, u_colorB, noise2);
  
  gl_FragColor = vec4(color ,1.0);
}
`;

const VertexShader = `varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
`;

const AppCode = `import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useCallback } from "react";
import { Vector2, Color } from "three";
import './scene.css';

import vertexShader from "!!raw-loader!./vertexShader.glsl";
import fragmentShader from "!!raw-loader!./fragmentShader.glsl";

const Gradient = () => {
    // This reference will give us direct access to the mesh
  const mesh = useRef();
  const mousePosition = useRef({ x: 0, y: 0 });

  const updateMousePosition = useCallback((e) => {
    mousePosition.current = { x: e.pageX, y: e.pageY };
  }, []);

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_mouse: { value: new Vector2(0, 0) },
      u_bg: {
        value: new Color("#A1A3F7"),
      },
      u_colorA: { value: new Color("#9FBAF9") },
      u_colorB: { value: new Color("#FEB3D9") },
    }),
    []
  );

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition, false);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition, false);
    };
  }, [updateMousePosition]);

  useFrame((state) => {
    const { clock } = state;

    mesh.current.material.uniforms.u_time.value = clock.getElapsedTime();
    mesh.current.material.uniforms.u_mouse.value = new Vector2(
      mousePosition.current.x,
      mousePosition.current.y
    );
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]} scale={1.5}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [0.0, 0.0, 1.5] }}>
      <Gradient />
    </Canvas>
  );
};

export default Scene;
`;

const Gradient2Files = {
  '/App.js': {
    code: AppCode,
  },
  '/vertexShader.glsl': {
    code: VertexShader,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
  },
};

export default Gradient2Files;
