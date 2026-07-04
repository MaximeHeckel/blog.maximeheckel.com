import VelocityMaterialCode from './velocityMapMaterial';
import PostprocessingCode from './velocityMapPostprocessing';
import SphereMaterialCode from './velocityMapSphereMaterial';

const AppCode = `import { OrthographicCamera } from '@react-three/drei';
import {
  Canvas,
  createPortal,
  extend,
  useFrame,
  useThree,
} from '@react-three/fiber';
import { Leva, useControls } from 'leva';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { pass, uniform } from 'three/tsl';
import * as THREE from 'three/webgpu';

import {
  createOutputNode,
  createVelocityMapOutputNode,
} from './postprocessing';
import { createSphereMaterial } from './sphereMaterial';
import { createVelocityMaterial } from './velocityMaterial';
import './scene.css';

extend(THREE);

const ORBIT_RADIUS = 2.5;
const CAMERA_DISTANCE = 14;
const MAX_SMEAR_SAMPLES = 40;
const SMEAR_EXPOSURE_WIDTH = 3.0;
const SMEAR_SPEED_THRESHOLD = 4.0;
const SMEAR_FADE_IN_RANGE = 2.0;
const SMEAR_SLOT_IDS = Array.from(
  { length: MAX_SMEAR_SAMPLES },
  (_, index) => index,
);

const makeRenderTarget = (width, height, filter) =>
  new THREE.WebGLRenderTarget(width, height, {
    depthBuffer: true,
    magFilter: filter,
    minFilter: filter,
    stencilBuffer: false,
    type: THREE.HalfFloatType,
  });

const SceneLights = () => {
  const { scene } = useThree();

  useEffect(() => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 4.0);
    directionalLight.position.set(10, 10, 10);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

    scene.add(directionalLight, ambientLight);

    return () => {
      scene.remove(directionalLight, ambientLight);
    };
  }, [scene]);

  return null;
};

const ObjectMotionBlur = ({
  blurIntensity,
  showVelocityMap,
  velocityScene,
}) => {
  const { camera, gl, scene, size } = useThree();
  const postProcessingRef = useRef(null);
  const targetWidth = Math.max(1, Math.floor(size.width * gl.getPixelRatio()));
  const targetHeight = Math.max(
    1,
    Math.floor(size.height * gl.getPixelRatio()),
  );

  const resources = useMemo(
    () => ({
      velocityTarget: makeRenderTarget(
        targetWidth,
        targetHeight,
        THREE.NearestFilter,
      ),
    }),
    [targetHeight, targetWidth],
  );
  const scenePass = useMemo(() => pass(scene, camera), [camera, scene]);
  const sceneTexture = useMemo(
    () => scenePass.getTextureNode('output'),
    [scenePass],
  );
  const blurAmount = useMemo(() => uniform(2.25), []);

  const outputNode = useMemo(
    () =>
      createOutputNode({
        blurAmount,
        resources,
        sceneTexture,
        targetHeight,
        targetWidth,
      }),
    [blurAmount, resources, sceneTexture, targetHeight, targetWidth],
  );
  const velocityMapOutputNode = useMemo(
    () => createVelocityMapOutputNode({ resources }),
    [resources],
  );

  useEffect(() => {
    const postProcessing = new THREE.PostProcessing(gl);

    postProcessing.outputNode = showVelocityMap
      ? velocityMapOutputNode
      : outputNode;
    postProcessingRef.current = postProcessing;

    return () => {
      postProcessingRef.current = null;
    };
  }, [gl, outputNode, showVelocityMap, velocityMapOutputNode]);

  useEffect(
    () => () => {
      scenePass.dispose();
      resources.velocityTarget.dispose();
    },
    [resources, scenePass],
  );

  useFrame(() => {
    blurAmount.value = blurIntensity;

    gl.setRenderTarget(resources.velocityTarget);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(velocityScene, camera);
    gl.setRenderTarget(null);

    if (postProcessingRef.current) {
      gl.clear();
      postProcessingRef.current.render();
    }
  }, 1);

  return null;
};

const Stage = () => {
  const {
    blurIntensity,
    objectSmearEnabled,
    objectSmearSamples,
    objectSmearStrength,
    showVelocityMap,
    speed,
  } = useControls('Analytical object smear', {
    showVelocityMap: {
      value: false,
      label: 'Show velocity map',
    },
    blurIntensity: {
      value: 2.25,
      min: 0,
      max: 5,
      step: 0.05,
      label: 'Blur intensity',
    },
    objectSmearEnabled: {
      value: true,
      label: 'Enable smear',
    },
    speed: {
      value: 15,
      min: 0,
      max: 40,
      step: 0.1,
      label: 'Orbit speed',
    },
    objectSmearSamples: {
      value: 30,
      min: 2,
      max: MAX_SMEAR_SAMPLES,
      step: 1,
      label: 'Smear samples',
    },
    objectSmearStrength: {
      value: 0.65,
      min: 0,
      max: 1.5,
      step: 0.05,
      label: 'Smear strength',
    },
  });
  const sphereRef = useRef(null);
  const smearSphereRefs = useRef([]);
  const velocitySphereRef = useRef(null);
  const orbitAngleRef = useRef(0);
  const previousNdcRef = useRef(new THREE.Vector2());
  const projectedPositionRef = useRef(new THREE.Vector3());
  const previousFrameInitializedRef = useRef(false);
  const velocityScene = useMemo(() => new THREE.Scene(), []);
  const velocity = useMemo(() => uniform(new THREE.Vector2()), []);
  const velocityMaterial = useMemo(
    () => createVelocityMaterial({ velocity }),
    [velocity],
  );
  const sphereMaterial = useMemo(() => createSphereMaterial(), []);
  const smearMaterials = useMemo(
    () =>
      Array.from({ length: MAX_SMEAR_SAMPLES }, () =>
        createSphereMaterial({ opacity: 0.0 }),
      ),
    [],
  );

  useEffect(
    () => () => {
      sphereMaterial.dispose();
      velocityMaterial.dispose();
      smearMaterials.forEach((material) => material.dispose());
    },
    [smearMaterials, sphereMaterial, velocityMaterial],
  );

  useFrame((state, delta) => {
    const sphere = sphereRef.current;
    const velocitySphere = velocitySphereRef.current;

    state.camera.lookAt(0, 0, 0);

    if (!sphere || !velocitySphere) {
      return;
    }

    orbitAngleRef.current += delta * speed;
    const angle = orbitAngleRef.current;

    sphere.position.set(
      Math.cos(angle) * ORBIT_RADIUS,
      0,
      Math.sin(angle) * ORBIT_RADIUS,
    );
    sphere.updateMatrixWorld(true);

    const activeSmearSamples = Math.max(
      2,
      Math.min(MAX_SMEAR_SAMPLES, Math.round(objectSmearSamples)),
    );
    const smearSpeed = Math.max(0, speed - SMEAR_SPEED_THRESHOLD);
    const smearVisibility = Math.min(
      1,
      smearSpeed / SMEAR_FADE_IN_RANGE,
    );

    for (let index = 0; index < MAX_SMEAR_SAMPLES; index += 1) {
      const smearSphere = smearSphereRefs.current[index];
      const smearMaterial = smearMaterials[index];
      const isActive =
        objectSmearEnabled &&
        objectSmearStrength > 0 &&
        smearSpeed > 0 &&
        index < activeSmearSamples;

      if (!smearSphere || !smearMaterial) {
        continue;
      }

      smearSphere.visible = isActive;

      if (!isActive) {
        smearMaterial.opacity = 0;
        continue;
      }

      const phase = (index + 0.5) / activeSmearSamples;
      const shutterWeight = 1 - Math.cos(phase * Math.PI * 2);
      const centeredPhase = phase - 0.5;
      const smearAngle =
        angle + centeredPhase * delta * smearSpeed * SMEAR_EXPOSURE_WIDTH;

      smearSphere.position.set(
        Math.cos(smearAngle) * ORBIT_RADIUS,
        0,
        Math.sin(smearAngle) * ORBIT_RADIUS,
      );
      smearSphere.updateMatrixWorld(true);

      smearMaterial.opacity =
        (shutterWeight / 2) *
        objectSmearStrength *
        smearVisibility *
        0.35;
    }

    projectedPositionRef.current.copy(sphere.position).project(state.camera);

    if (!previousFrameInitializedRef.current) {
      previousNdcRef.current.set(
        projectedPositionRef.current.x,
        projectedPositionRef.current.y,
      );
      velocity.value.set(0, 0);
      previousFrameInitializedRef.current = true;
    } else {
      velocity.value.set(
        (projectedPositionRef.current.x - previousNdcRef.current.x) * 0.5,
        (projectedPositionRef.current.y - previousNdcRef.current.y) * -0.5,
      );
      previousNdcRef.current.set(
        projectedPositionRef.current.x,
        projectedPositionRef.current.y,
      );
    }

    velocitySphere.position.copy(sphere.position);
    velocitySphere.updateMatrixWorld(true);
  }, -1);

  return (
    <>
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial color="#0273F3" />
        </mesh>
        <gridHelper args={[50, 50]} position={[0, -0.99, 0]}>
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.05}
          />
        </gridHelper>
      </group>

      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <primitive object={sphereMaterial} attach="material" />
      </mesh>

      {SMEAR_SLOT_IDS.map((slotId, index) => (
        <mesh
          key={slotId}
          ref={(mesh) => {
            smearSphereRefs.current[index] = mesh;
          }}
          visible={false}
        >
          <sphereGeometry args={[0.5, 32, 32]} />
          <primitive object={smearMaterials[index]} attach="material" />
        </mesh>
      ))}

      <SceneLights />

      {createPortal(
        <mesh ref={velocitySphereRef} material={velocityMaterial}>
          <sphereGeometry args={[0.5, 32, 32]} />
        </mesh>,
        velocityScene,
      )}

      <ObjectMotionBlur
        blurIntensity={blurIntensity}
        showVelocityMap={showVelocityMap}
        velocityScene={velocityScene}
      />
    </>
  );
};

const App = () => (
  <>
    <Canvas
      dpr={[1, 1.5]}
      flat
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer(props);
        renderer.toneMapping = THREE.NoToneMapping;
        await renderer.init();
        return renderer;
      }}
    >
      <Suspense fallback={null}>
        <OrthographicCamera
          makeDefault
          position={[CAMERA_DISTANCE, CAMERA_DISTANCE, CAMERA_DISTANCE]}
          zoom={100}
          near={0.1}
          far={200}
        />
        <color attach="background" args={['#0273F3']} />
        <Stage />
      </Suspense>
    </Canvas>
    <Leva collapsed={false} />
  </>
);

export default App;
`;

const ObjectSmear = {
  '/App.js': {
    code: AppCode,
  },
  '/postprocessing.js': {
    code: PostprocessingCode,
    active: true,
  },
  '/sphereMaterial.js': {
    code: SphereMaterialCode,
  },
  '/velocityMaterial.js': {
    code: VelocityMaterialCode,
  },
};

export default ObjectSmear;
