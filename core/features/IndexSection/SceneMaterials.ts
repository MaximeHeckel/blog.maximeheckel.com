import * as THREE from 'three';

import renderFragmentShader from './gpgpu/fragmentShader.glsl';
import simulationFragmentShader from './gpgpu/simulationFragment.glsl';
import simulationVertexShader from './gpgpu/simulationVertex.glsl';
import renderVertexShader from './gpgpu/vertexShader.glsl';

const getRandomData = (width: number, height: number) => {
  const len = width * height * 4;
  const data = new Float32Array(len);

  for (let i = 0; i < len; i += 4) {
    const t = (Math.PI * 2 * i) / len;
    const x = Math.cos(t) / (1.0 + Math.sin(t) * Math.sin(t));
    const y = Math.sin(2.0 * t) / 3.0;
    const z = Math.sin(t) * 0.5;
    const randomness = 1.2;

    data[i] = x * 2.5 + (Math.random() - 0.5) * randomness;
    data[i + 1] = y * 2.5 + (Math.random() - 0.5) * randomness;
    data[i + 2] = z * 2.5 + (Math.random() - 0.5) * randomness;
    data[i + 3] = 1.0;
  }

  return data;
};

export class SimulationMaterial extends THREE.ShaderMaterial {
  private readonly initialPositions: THREE.DataTexture;

  constructor(size: number) {
    const positionsTexture = new THREE.DataTexture(
      getRandomData(size, size),
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    positionsTexture.needsUpdate = true;

    super({
      uniforms: {
        positions: { value: positionsTexture },
        uFrequency: { value: 0.25 },
        uTime: { value: 0 },
        uSize: { value: size },
      },
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
    });

    this.initialPositions = positionsTexture;
  }

  override dispose() {
    // The uniform later points to an FBO owned and disposed by useFBO.
    this.initialPositions.dispose();
    super.dispose();
  }
}

export class DepthOfFieldMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        positions: { value: null },
        pointSize: { value: 3.5 },
      },
      vertexShader: renderVertexShader,
      fragmentShader: renderFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }
}
