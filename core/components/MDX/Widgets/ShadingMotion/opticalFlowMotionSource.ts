const MotionSourceCode = `import { Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
  Fn,
  cross,
  float,
  normalLocal,
  normalize,
  positionLocal,
  transformNormalToView,
  uniform,
  varying,
  vec3,
  wgslFn,
} from 'three/tsl';
import * as THREE from 'three/webgpu';

const MovingBlob = () => {
  const timeUniformRef = useRef(null);
  const emissiveColor = useMemo(
    () => new THREE.Color('white').multiplyScalar(0.05),
    [],
  );
  const color = useMemo(() => new THREE.Color('white'), []);

  if (!timeUniformRef.current) {
    timeUniformRef.current = uniform(0.0);
  }

  const timeUniform = timeUniformRef.current;

  const { nodes, uniforms } = useMemo(() => {
    const vNormal = varying(vec3(), 'vNormal');

    const updatePosition = wgslFn(\`\
      fn updatePosition(pos: vec3f, time: f32, normal: vec3f) -> vec3f {
        let frequency = 0.3;
        let amplitude = 2.3;
        let timeOffset = vec3f(
          sin(time * 0.63),
          cos(time * 0.47),
          sin(time * 0.29)
        );
        let primaryNoise = cnoise(pos * frequency + timeOffset);
        let detailNoise = cnoise(pos * frequency * 2.7 - timeOffset * 0.5);
        let periodicPulse = sin(pos.y * 3.0 + time * 1.35) * 0.5 + 0.5;
        let displacement = (
          primaryNoise * 0.7 + detailNoise * 0.3
        ) * (periodicPulse * 0.65 + 0.35) * amplitude;

        return pos + normal * displacement;
      }

      fn permute4(x: vec4f) -> vec4f {
        return ((x * 34.0 + 1.0) * x) % 289.0;
      }

      fn taylorInvSqrt4(r: vec4f) -> vec4f {
        return 1.79284291400159 - 0.85373472095314 * r;
      }

      fn fade3(t: vec3f) -> vec3f {
        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
      }

      fn cnoise(P: vec3f) -> f32 {
        var Pi0 = floor(P);
        var Pi1 = Pi0 + vec3f(1.0);
        Pi0 = Pi0 % 289.0;
        Pi1 = Pi1 % 289.0;

        let Pf0 = fract(P);
        let Pf1 = Pf0 - vec3f(1.0);
        let ix = vec4f(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        let iy = vec4f(Pi0.y, Pi0.y, Pi1.y, Pi1.y);
        let iz0 = vec4f(Pi0.z);
        let iz1 = vec4f(Pi1.z);
        let ixy = permute4(permute4(ix) + iy);
        let ixy0 = permute4(ixy + iz0);
        let ixy1 = permute4(ixy + iz1);

        var gx0 = ixy0 / 7.0;
        var gy0 = fract(floor(gx0) / 7.0) - 0.5;
        gx0 = fract(gx0);
        let gz0 = vec4f(0.5) - abs(gx0) - abs(gy0);
        let sz0 = step(gz0, vec4f(0.0));
        gx0 = gx0 - sz0 * (step(vec4f(0.0), gx0) - 0.5);
        gy0 = gy0 - sz0 * (step(vec4f(0.0), gy0) - 0.5);

        var gx1 = ixy1 / 7.0;
        var gy1 = fract(floor(gx1) / 7.0) - 0.5;
        gx1 = fract(gx1);
        let gz1 = vec4f(0.5) - abs(gx1) - abs(gy1);
        let sz1 = step(gz1, vec4f(0.0));
        gx1 = gx1 - sz1 * (step(vec4f(0.0), gx1) - 0.5);
        gy1 = gy1 - sz1 * (step(vec4f(0.0), gy1) - 0.5);

        var g000 = vec3f(gx0.x, gy0.x, gz0.x);
        var g100 = vec3f(gx0.y, gy0.y, gz0.y);
        var g010 = vec3f(gx0.z, gy0.z, gz0.z);
        var g110 = vec3f(gx0.w, gy0.w, gz0.w);
        var g001 = vec3f(gx1.x, gy1.x, gz1.x);
        var g101 = vec3f(gx1.y, gy1.y, gz1.y);
        var g011 = vec3f(gx1.z, gy1.z, gz1.z);
        var g111 = vec3f(gx1.w, gy1.w, gz1.w);

        let norm0 = taylorInvSqrt4(vec4f(
          dot(g000, g000),
          dot(g010, g010),
          dot(g100, g100),
          dot(g110, g110)
        ));
        g000 = g000 * norm0.x;
        g010 = g010 * norm0.y;
        g100 = g100 * norm0.z;
        g110 = g110 * norm0.w;

        let norm1 = taylorInvSqrt4(vec4f(
          dot(g001, g001),
          dot(g011, g011),
          dot(g101, g101),
          dot(g111, g111)
        ));
        g001 = g001 * norm1.x;
        g011 = g011 * norm1.y;
        g101 = g101 * norm1.z;
        g111 = g111 * norm1.w;

        let n000 = dot(g000, Pf0);
        let n100 = dot(g100, vec3f(Pf1.x, Pf0.y, Pf0.z));
        let n010 = dot(g010, vec3f(Pf0.x, Pf1.y, Pf0.z));
        let n110 = dot(g110, vec3f(Pf1.x, Pf1.y, Pf0.z));
        let n001 = dot(g001, vec3f(Pf0.x, Pf0.y, Pf1.z));
        let n101 = dot(g101, vec3f(Pf1.x, Pf0.y, Pf1.z));
        let n011 = dot(g011, vec3f(Pf0.x, Pf1.y, Pf1.z));
        let n111 = dot(g111, Pf1);

        let fadeXyz = fade3(Pf0);
        let nz = mix(
          vec4f(n000, n100, n010, n110),
          vec4f(n001, n101, n011, n111),
          fadeXyz.z
        );
        let nyz = mix(nz.xy, nz.zw, fadeXyz.y);
        let nxyz = mix(nyz.x, nyz.y, fadeXyz.x);

        return 2.2 * nxyz;
      }
    \`);

    const orthogonal = wgslFn(\`\
      fn orthogonal(pos: vec3f) -> vec3f {
        if (abs(pos.x) > abs(pos.z)) {
          return normalize(vec3f(-pos.y, pos.x, 0.0));
        }

        return normalize(vec3f(0.0, -pos.z, pos.y));
      }
    \`);

    const positionNode = Fn(() => {
      const position = positionLocal;
      const displacedPosition = updatePosition(
        position,
        timeUniform,
        normalLocal,
      );
      const theta = float(0.01);
      const tangent = orthogonal(normalLocal);
      const bitangent = normalize(cross(normalLocal, tangent));
      const neighbour1 = position.add(tangent.mul(theta));
      const neighbour2 = position.add(bitangent.mul(theta));
      const displacedNeighbour1 = updatePosition(
        neighbour1,
        timeUniform,
        normalLocal,
      );
      const displacedNeighbour2 = updatePosition(
        neighbour2,
        timeUniform,
        normalLocal,
      );
      const displacedTangent = displacedNeighbour1.sub(displacedPosition);
      const displacedBitangent = displacedNeighbour2.sub(displacedPosition);
      const normal = normalize(cross(displacedTangent, displacedBitangent));
      const displacedNormal = normal
        .dot(normalLocal)
        .lessThan(0.0)
        .select(normal.negate(), normal);

      vNormal.assign(displacedNormal);

      return displacedPosition;
    })();

    const normalNode = Fn(() => transformNormalToView(vNormal))();

    return {
      nodes: {
        normalNode,
        positionNode,
      },
      uniforms: {
        time: timeUniform,
      },
    };
  }, [timeUniform]);

  useFrame(({ clock }) => {
    uniforms.time.value = clock.elapsedTime;
  });

  return (
    <Float speed={2} rotationIntensity={10} floatIntensity={2}>
      <mesh>
        <icosahedronGeometry args={[1.5, 50]} />
        <meshPhongMaterial
          color={color}
          emissive={emissiveColor}
          normalNode={nodes.normalNode}
          positionNode={nodes.positionNode}
          shininess={750}
        />
      </mesh>
    </Float>
  );
};

export default MovingBlob;
`;

export default MotionSourceCode;
