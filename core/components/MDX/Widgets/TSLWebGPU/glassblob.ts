const Perlin = `import {
  mod,
  Fn,
  mul,
  sub,
  floor,
  vec3,
  fract,
  vec4,
  abs,
  step,
  dot,
  mix,
} from 'three/tsl';
import type { TSL, Node } from 'three/webgpu';

export const permute = /*@__PURE__*/ Fn(([x]) => {
  return mod(x.mul(34.0).add(1.0).mul(x), 289.0);
});

export const taylorInvSqrt = /*@__PURE__*/ Fn(
  ([r]) => {
    return sub(1.79284291400159, mul(0.85373472095314, r));
  },
);

export const fade = /*@__PURE__*/ Fn(([t]) => {
  return t
    .mul(t)
    .mul(t)
    .mul(t.mul(t.mul(6.0).sub(15.0)).add(10.0));
});

export const cnoise = /*@__PURE__*/ Fn(([P]) => {
  const Pi0 = floor(P);

  // Integer part for indexing

  const Pi1 = Pi0.add(vec3(1.0));

  // Integer part + 1

  Pi0.assign(mod(Pi0, 289.0));
  Pi1.assign(mod(Pi1, 289.0));
  const Pf0 = fract(P);

  // Fractional part for interpolation

  const Pf1 = Pf0.sub(vec3(1.0));

  // Fractional part - 1.0

  const ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  const iy = vec4(Pi0.yy, Pi1.yy);
  const iz0 = Pi0.zzzz;
  const iz1 = Pi1.zzzz;
  const ixy = permute(permute(ix).add(iy));
  const ixy0 = permute(ixy.add(iz0));
  const ixy1 = permute(ixy.add(iz1));
  const gx0 = ixy0.div(7.0);
  const gy0 = fract(floor(gx0).div(7.0)).sub(0.5);
  gx0.assign(fract(gx0));
  const gz0 = vec4(0.5).sub(abs(gx0)).sub(abs(gy0));
  const sz0 = step(gz0, vec4(0.0));
  gx0.subAssign(sz0.mul(step(0.0, gx0).sub(0.5)));
  gy0.subAssign(sz0.mul(step(0.0, gy0).sub(0.5)));
  const gx1 = ixy1.div(7.0);
  const gy1 = fract(floor(gx1).div(7.0)).sub(0.5);
  gx1.assign(fract(gx1));
  const gz1 = vec4(0.5).sub(abs(gx1)).sub(abs(gy1));
  const sz1 = step(gz1, vec4(0.0));
  gx1.subAssign(sz1.mul(step(0.0, gx1).sub(0.5)));
  gy1.subAssign(sz1.mul(step(0.0, gy1).sub(0.5)));
  const g000 = vec3(gx0.x, gy0.x, gz0.x);
  const g100 = vec3(gx0.y, gy0.y, gz0.y);
  const g010 = vec3(gx0.z, gy0.z, gz0.z);
  const g110 = vec3(gx0.w, gy0.w, gz0.w);
  const g001 = vec3(gx1.x, gy1.x, gz1.x);
  const g101 = vec3(gx1.y, gy1.y, gz1.y);
  const g011 = vec3(gx1.z, gy1.z, gz1.z);
  const g111 = vec3(gx1.w, gy1.w, gz1.w);
  const norm0 = taylorInvSqrt(
    vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)),
  );
  g000.mulAssign(norm0.x);
  g010.mulAssign(norm0.y);
  g100.mulAssign(norm0.z);
  g110.mulAssign(norm0.w);
  const norm1 = taylorInvSqrt(
    vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)),
  );
  g001.mulAssign(norm1.x);
  g011.mulAssign(norm1.y);
  g101.mulAssign(norm1.z);
  g111.mulAssign(norm1.w);
  const n000 = dot(g000, Pf0);
  const n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  const n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  const n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  const n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  const n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  const n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  const n111 = dot(g111, Pf1);
  const fade_xyz = fade(Pf0);
  const n_z = mix(
    vec4(n000, n100, n010, n110),
    vec4(n001, n101, n011, n111),
    fade_xyz.z,
  );
  const n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  const n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);

  return mul(2.2, n_xyz);
});
`;

const AppCode = `import { OrbitControls } from '@react-three/drei';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three/webgpu';
import { 
 length,
 clamp,
 mix,
 max,
 pow,
 cross,
 float,
 Fn,
 normalize,
 normalLocal,
 normalWorld,
 positionWorld,
 positionLocal,
  uv,
 viewportUV,
 varying,
 transformNormalToView,
 vec3,
 abs,
 If,
 negate,
 add,
 sub,
 dot,
 rand,
 texture,
 uniform,
} from 'three/tsl';
import { v4 as uuidv4 } from 'uuid';

import { cnoise } from './perlin';
import './scene.css';


extend(THREE);

const Core = () => {
  const meshRef = useRef();
  const { scene, gl } = useThree();

  const lightPosition = [10, 10, 10];

  useEffect(() => {
    const dirLight = new THREE.DirectionalLight(0xffffff, 5.0);
    dirLight.position.set(lightPosition[0], lightPosition[1], lightPosition[2]);
    scene.add(dirLight);
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
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

  const { nodes, uniforms, utils} = useMemo(() => {
    const time = uniform(0.0);
    const cameraPosition = uniform(vec3(0, 0, 0));
    const vNormal = varying(vec3(), 'vNormal');

    const sceneTexture = texture(new THREE.Texture());

    const updatePos = Fn(
      ([pos, time]) => {
        const noise = cnoise(vec3(pos).add(vec3(time.mul(1.1)))).mul(0.15);
        return add(pos, noise);
      },
    );

    const orthogonal = Fn(() => {
      const pos = normalLocal;
      If(abs(pos.x).greaterThan(abs(pos.z)), () => {
        return normalize(vec3(negate(pos.y), pos.x, 0.0));
      });

      return normalize(vec3(0.0, negate(pos.z), pos.y));
    });

    const positionNode = Fn(() => {
      const pos = positionLocal;

      const updatedPos = updatePos(pos, time);
      const theta = float(0.001); // Smaller epsilon for better accuracy

      const vecTangent = orthogonal();
      const vecBiTangent = normalize(cross(normalLocal, vecTangent));

      const neighbour1 = pos.add(vecTangent.mul(theta));
      const neighbour2 = pos.add(vecBiTangent.mul(theta));

      const displacedNeighbour1 = updatePos(neighbour1, time);
      const displacedNeighbour2 = updatePos(neighbour2, time);

      const displacedTangent = displacedNeighbour1.sub(updatedPos);
      const displacedBitangent = displacedNeighbour2.sub(updatedPos);

      const normal = normalize(cross(displacedTangent, displacedBitangent));

      const displacedNormal = normal
        .dot(normalLocal)
        .lessThan(0.0)
        .select(normal.negate(), normal);
      vNormal.assign(displacedNormal);

      return updatedPos;
    })();

    const normalNode = Fn(() => {
      const normal = vNormal;
      return transformNormalToView(normal);
    })();

    const classicFresnel = Fn(
      ({
        viewVector,
        worldNormal,
        power,
      }) => {
        const cosTheta = abs(dot(viewVector, worldNormal));
        const inversefresnelFactor = sub(1.0, cosTheta);
        return pow(inversefresnelFactor, power);
      },
    );

     const sat = Fn(([col]) => {
      const W = vec3(0.2125, 0.7154, 0.0721);
      const intensity = vec3(dot(col, W));
      return mix(intensity, col, 1.265);
    });

    const refract = Fn(({ sceneTex }) => {
      const absorption = 0.1;
      const refractionIntensity = 0.25;
      const shininess = 100.0;
      const LOOP = 8;
      const noiseIntensity = 0.015;

      const refractNormal = normalWorld.xy
        .mul(sub(1.0, normalWorld.z.mul(0.85)))
        .add(0.05);

      const refractCol = vec3(0.0, 0.0, 0.0).toVar();

      for (let i = 0; i < LOOP; i++) {
        const noise = rand(viewportUV).mul(noiseIntensity);
        const slide = float(i).div(float(LOOP)).mul(0.18).add(noise);

        const refractUvR = viewportUV.sub(
          refractNormal
            .mul(slide.mul(1.0).add(refractionIntensity))
            .mul(absorption),
        );
        const refractUvG = viewportUV.sub(
          refractNormal
            .mul(slide.mul(2.5).add(refractionIntensity))
            .mul(absorption),
        );
        const refractUvB = viewportUV.sub(
          refractNormal
            .mul(slide.mul(4.0).add(refractionIntensity))
            .mul(absorption),
        );

        const red = texture(sceneTex, refractUvR).r;
        const green = texture(sceneTex, refractUvG).g;
        const blue = texture(sceneTex, refractUvB).b;

        refractCol.assign(refractCol.add(vec3(red, green, blue)));
      }

      refractCol.assign(refractCol.div(float(LOOP)));

      const lightVector = vec3(
        lightPosition[0],
        lightPosition[1],
        lightPosition[2],
      );
      const viewVector = normalize(cameraPosition.sub(positionWorld));
      const normalVector = normalize(normalWorld);

      const halfVector = normalize(viewVector.add(lightVector));

      const NdotL = dot(normalVector, lightVector);
      const NdotH = dot(normalVector, halfVector);

      const kDiffuse = max(0.0, NdotL);

      const NdotH2 = NdotH.mul(NdotH);
      const kSpecular = pow(NdotH2, shininess);

      const fresnel = classicFresnel({
        viewVector: viewVector,
        worldNormal: normalVector,
        power: 5.0,
      });

      refractCol.assign(
        refractCol.add(kSpecular.add(kDiffuse).mul(0.01).add(fresnel)),
      );

      return vec3(sat(refractCol));
    });

    return {
      nodes: {
        positionNode,
        normalNode,
      },
      uniforms: {
        time,
        cameraPosition,
        sceneTexture,
      },
      utils: {
        refract
      }
    }
  }, []);

  const backRenderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio,
  );

  const mainRenderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth * window.devicePixelRatio,
    window.innerHeight * window.devicePixelRatio,
  );

  useFrame((state) => {
    const { clock, gl, scene, camera } = state;
    
    uniforms.time.value = clock.getElapsedTime();
    uniforms.cameraPosition.value = camera.position;

    if (!meshRef.current) return;

    meshRef.current.material.visible = false;
    gl.setRenderTarget(backRenderTarget);
    gl.render(scene, camera);

    meshRef.current.material.side = THREE.BackSide;
    meshRef.current.material.visible = true;

    uniforms.sceneTexture.value = backRenderTarget.texture;

    meshRef.current.material.colorNode = utils.refract({ sceneTex: uniforms.sceneTexture });

    gl.setRenderTarget(mainRenderTarget);
    gl.render(scene, camera);

    meshRef.current.material.side = THREE.FrontSide;
    uniforms.sceneTexture.value = mainRenderTarget.texture;

    meshRef.current.material.colorNode = utils.refract({ sceneTex: uniforms.sceneTexture });

    gl.setRenderTarget(null);
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[50, 16, 16]} />
        <meshBasicNodeMaterial
          colorNode={backgroundNodes.sphereColorNode}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.5, 200]} />
        <meshStandardMaterial
          key={uuidv4()}
          color={new THREE.Color('white').multiplyScalar(1.2)}
          normalNode={nodes.normalNode}
          positionNode={nodes.positionNode}
        />
      </mesh>
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

const Blob = {
  '/App.js': {
    code: AppCode,
  },
  '/perlin.js': {
    code: Perlin,
  },
};

export default Blob;
