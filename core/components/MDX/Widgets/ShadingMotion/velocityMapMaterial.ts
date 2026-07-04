const VelocityMaterialCode = `import { vec4 } from 'three/tsl';
import * as THREE from 'three/webgpu';

export const createVelocityMaterial = ({ velocity }) => {
  const material = new THREE.MeshBasicNodeMaterial();

  material.outputNode = vec4(velocity, 0.0, 1.0);
  material.depthTest = true;
  material.depthWrite = true;
  material.toneMapped = false;

  return material;
};
`;

export default VelocityMaterialCode;
