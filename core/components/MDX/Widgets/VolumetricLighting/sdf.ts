const FragmentShader = `uniform mat4 projectionMatrixInverse;
uniform vec3 lightDirection;
uniform vec3 lightPosition;
uniform mat4 viewMatrixInverse;
uniform vec3 cameraPosition;
uniform float cameraFar;
uniform float coneAngle;
uniform int shapeType;

float readDepth(sampler2D depthSampler, vec2 coord) {
  return texture2D(depthSampler, coord).x;
}

vec3 getWorldPosition(vec2 uv, float depth) {
  float clipZ = depth * 2.0 - 1.0;
  vec2 ndc = uv * 2.0 - 1.0;
  vec4 clip = vec4(ndc, clipZ, 1.0);
  vec4 view = projectionMatrixInverse * clip;
  vec4 world = viewMatrixInverse * view;

  return world.xyz / world.w;
}

float sdSphere(vec3 p, vec3 center, float radius) {
  return length(p - center) - radius;
}

float sdTorus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdCylinder(vec3 p, vec3 axisOrigin, vec3 axisDir, float radius) {
  vec3 p_to_origin = p - axisOrigin;
  float projectionLength = dot(p_to_origin, axisDir);
  vec3 closestPointOnAxis = axisOrigin + axisDir * projectionLength;
  float distanceToAxis = length(p - closestPointOnAxis);
  return distanceToAxis - radius;
}

float sdCone(vec3 p, vec3 axisOrigin, vec3 axisDir, float angleRad) {
  vec3 p_to_origin = p - axisOrigin;

  float h = dot(p_to_origin, axisDir); // Height along axis
  float r = length(p_to_origin - axisDir * h); // Radius at height h

  float c = cos(angleRad);
  float s = sin(angleRad);

  vec2 q = vec2(r, h);

  // Calculates distance based on height/radius and cone angle
  float distToSurfaceLine = r * c - h * s;
  float distToApexPlane = -h;

  if (h < 0.0 && distToSurfaceLine > 0.0) {
      return length(p_to_origin); 
  }
  
  vec2 boundaryDists = vec2(distToSurfaceLine, distToApexPlane);
  return length(max(boundaryDists, 0.0)) + min(max(boundaryDists.x, boundaryDists.y), 0.0);
}

const float STEP_SIZE = 0.05;
const int NUM_STEPS = 250;
const vec3 lightColor = vec3(1.0, 0.9, 0.9);

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float depth = readDepth(depthBuffer, uv);
  vec3 worldPosition = getWorldPosition(uv, depth);

  vec3 rayOrigin = cameraPosition;
  vec3 rayDir = normalize(worldPosition - rayOrigin);

  float sceneDepth = length(worldPosition - cameraPosition);

  vec3 lightPos = lightPosition;
  vec3 lightDir = normalize(lightDirection);

  float coneAngleRad = radians(coneAngle);
  float halfConeAngleRad = coneAngleRad * 0.5;

  float smoothEdgeWidth = 0.1;

  float fogAmount = 0.0;
  float lightIntensity = 1.0;
  float t = STEP_SIZE; 

  for (int i = 0; i < NUM_STEPS; i++) {
    vec3 samplePos = rayOrigin + rayDir * t;

    if (t > sceneDepth || t > cameraFar) {
      break;
    }

    float sdfVal;

    if (shapeType == 0) {
      sdfVal = sdSphere(samplePos, vec3(0.0), 5.0);
    } else if (shapeType == 1) {
      sdfVal = sdCylinder(samplePos, lightPos, lightDir, 2.0);
    } else if (shapeType == 2) {
      sdfVal = sdCone(samplePos, lightPos, lightDir, halfConeAngleRad);
    } else if (shapeType == 3) {
      sdfVal = sdTorus(samplePos, vec2(2.0, 0.5));
    }
    float shapeFactor = smoothstep(0.0, -smoothEdgeWidth, sdfVal);

    if (shapeFactor < 0.1) {
      t += STEP_SIZE;
      continue;
    }

    float distanceToLight = length(samplePos - lightPos);
    float attenuation = exp(-0.05 * distanceToLight);

    fogAmount += attenuation * lightIntensity;
    
    t += STEP_SIZE;
  }

  fogAmount /= float(NUM_STEPS);

  vec3 volumetricLight = lightColor * fogAmount;
  vec3 finalColor = inputColor.rgb + volumetricLight;

  outputColor = vec4(finalColor, 1.0);
}
`;

const AppCode = `import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Leva,useControls } from 'leva';
import { Effect, EffectAttribute } from 'postprocessing';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';

import fragmentShader from '!!raw-loader!./fragmentShader.glsl';
import './scene.css';

class VolumetricLightingEffectImpl extends Effect {
  constructor(
    cameraFar = 500,
    projectionMatrixInverse = new THREE.Matrix4(),
    viewMatrixInverse = new THREE.Matrix4(),
    cameraPosition = new THREE.Vector3(),
    lightDirection = new THREE.Vector3(),
    lightPosition = new THREE.Vector3(),
    coneAngle = 40.0,
    shapeType = 0,
  ) {
    const uniforms = new Map([
      ['cameraFar', new THREE.Uniform(cameraFar)],
      ['projectionMatrixInverse', new THREE.Uniform(projectionMatrixInverse)],
      ['viewMatrixInverse', new THREE.Uniform(viewMatrixInverse)],
      ['cameraPosition', new THREE.Uniform(cameraPosition)],
      ['lightDirection', new THREE.Uniform(lightDirection)],
      ['lightPosition', new THREE.Uniform(lightPosition)],
      ['coneAngle', new THREE.Uniform(coneAngle)],
      ['shapeType', new THREE.Uniform(shapeType)],
    ]);

    super('MyCustomEffect', fragmentShader, {
      attributes: EffectAttribute.DEPTH,
      uniforms,
    });

    this.uniforms = uniforms;
  }

  update(_renderer, _inputBuffer, _deltaTime) {
    this.uniforms.get('projectionMatrixInverse').value = this.projectionMatrixInverse;
    this.uniforms.get('viewMatrixInverse').value = this.viewMatrixInverse;
    this.uniforms.get('cameraPosition').value = this.cameraPosition;
    this.uniforms.get('cameraFar').value = this.cameraFar;
    this.uniforms.get('lightDirection').value = this.lightDirection;
    this.uniforms.get('lightPosition').value = this.lightPosition;
    this.uniforms.get('coneAngle').value = this.coneAngle;
    this.uniforms.get('shapeType').value = this.shapeType;
  }
}

const VolumetricLightingEffect = wrapEffect(VolumetricLightingEffectImpl);

const SHAPES = ['Sphere', 'Cylinder', 'Cone', 'Torus'];

export const VolumetricLightEffect = () => {
  const effectRef = useRef();

  const coneAngle = 40.0;

  const { shape, lightDirection, lightPosition, enabled } = useControls({
    enabled: {
      value: true,
      label: 'Enable Effect',
    },
    lightDirection: {
      value: { x: -1, y: -1, z: 1 },
      label: 'Light Direction',
    },
    lightPosition: {
      value: { x: 3, y: 3, z: -3 },
      label: 'Light Position',
    },
    shape: {
      value: 'Cylinder',
      options: SHAPES,
      label: 'Shape',
    },
  });

  const shapeType = useMemo(() => {
    return SHAPES.indexOf(shape);
  }, [shape]);

  const lightPositionVec = useMemo(
    () => new THREE.Vector3(lightPosition.x, lightPosition.y, lightPosition.z),
    [lightPosition],
  );

  const lightDirectionVec = useMemo(
    () =>
      new THREE.Vector3(
        lightDirection.x,
        lightDirection.y,
        lightDirection.z,
      ).normalize(),
    [lightDirection],
  );

  useFrame((state) => {
    const { camera } = state;

    if (effectRef.current) {
      effectRef.current.cameraFar = camera.far;
      effectRef.current.projectionMatrixInverse =
        camera.projectionMatrixInverse;
       effectRef.current.viewMatrixInverse = camera.matrixWorld;

      effectRef.current.cameraPosition = camera.position;
      effectRef.current.lightDirection = lightDirectionVec;
      effectRef.current.lightPosition = lightPositionVec;
      effectRef.current.shapeType = shapeType;
      effectRef.current.coneAngle = coneAngle;
    }

    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <directionalLight position={lightPositionVec} intensity={3.0} />
      <EffectComposer enabled={enabled}>
        <VolumetricLightingEffect ref={effectRef} />
      </EffectComposer>
    </>
  );
};



const VolumetricLight = () => {
  

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 0, -5]}
        fov={70}
        near={0.1}
        far={200}
      />
      <mesh>
        <sphereGeometry args={[1, 256]} />
        <meshStandardMaterial color='lightgray' />
      </mesh>
      <Environment 
        background 
        backgroundIntensity={0.04}
        backgroundBlurriness={0.05}
        environmentIntensity={0.1}
        path="https://cdn.maximeheckel.com/cubemaps/gallery/" 
        files={["px.jpg", "nx.jpg", "py.jpg", "ny.jpg", "pz.jpg", "nz.jpg"]}
      />
      <VolumetricLightEffect />
    </>
  );
};

const Scene = () => {
  return (
    <>
      <Canvas
        shadows
        gl={{
          alpha: true,
        }}
        dpr={[1, 1.5]}
      >
        <Suspense>
          <color attach='background' args={['#000000']} />
          <ambientLight intensity={0.15} />
          <OrbitControls />
          <VolumetricLight />
        </Suspense>
      </Canvas>
      <Leva collapsed />
    </>
  );
};

export default Scene;`;

const SDF = {
  '/App.js': {
    code: AppCode,
  },
  '/fragmentShader.glsl': {
    code: FragmentShader,
    active: true,
  },
};

export default SDF;
