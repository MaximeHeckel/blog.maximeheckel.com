const FragmentShader = `const fragmentShader = \`
varying float vDistance;

void main() {
  vec3 color = vec3(0.34, 0.53, 0.96);
  float strength = distance(gl_PointCoord, vec2(0.5));
  strength = 1.0 - strength;
  strength = pow(strength, 3.0);

  color = mix(color, vec3(0.97, 0.70, 0.45), vDistance * 0.5);
  color = mix(vec3(0.0), color, strength);
  gl_FragColor = vec4(color, strength);
}
\`

export default fragmentShader
`;

const glslRotate = `// Source: https://github.com/dmnsgn/glsl-rotate/blob/main/rotation-3d-y.glsl.js
mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(
    c, 0.0, -s,
    0.0, 1.0, 0.0,
    s, 0.0, c
  );
}
`;

const VertexShader = `const vertexShader = \`
uniform float uTime;
uniform float uRadius;

varying float vDistance;

${glslRotate}

void main() {
  float distanceFactor = pow(uRadius - distance(position, vec3(0.0)), 2.0);
  float size = distanceFactor * 10.0 + 10.0;
  vec3 particlePosition = position * rotation3dY(uTime * 0.2 * distanceFactor);

  vDistance = distanceFactor;

  vec4 modelPosition = modelMatrix * vec4(particlePosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  gl_PointSize = size;
  // Size attenuation;
  gl_PointSize *= (1.0 / - viewPosition.z);
}

\`

export default vertexShader
`;

const AppCode = `import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import './scene.css';

import vertexShader from './vertexShader';
import fragmentShader from './fragmentShader';

const CustomGeometryParticles = (props) => {
  const { count } = props;
  const radius = 2;

  // This reference gives us direct access to our points
  const points = useRef();

  // Generate our positions attributes array
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const distance = Math.sqrt((Math.random() - 0.5)) * radius;
      const theta = THREE.MathUtils.randFloatSpread(360); 
      const phi = THREE.MathUtils.randFloatSpread(360); 

      let x = distance * Math.sin(theta) * Math.cos(phi)
      let y = distance * Math.sin(theta) * Math.sin(phi);
      let z = distance * Math.cos(theta);

      positions.set([x, y, z], i * 3);
    }
    
    return positions;
  }, [count]);

  const uniforms = useMemo(() => ({
    uTime: {
      value: 0.0
    },
    uRadius: {
      value: radius
    }
  }), [])

  useFrame((state) => {
    const { clock } = state;

    points.current.material.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={uniforms}
      />
    </points>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ position: [1.5, 1.5, 1.5] }}>
      <ambientLight intensity={0.5} />
      <CustomGeometryParticles count={4000} />
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
`;

const CustomizePointShaderFiles = {
  '/App.js': {
    code: AppCode,
  },
  '/vertexShader.js': {
    code: VertexShader,
  },
  '/fragmentShader.js': {
    code: FragmentShader,
    active: true,
  },
};

export default CustomizePointShaderFiles;
