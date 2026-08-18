const SphereMaterialCode = `import {
  Fn,
  color,
  floor,
  mix,
  mod,
  uv,
  vec2,
} from 'three/tsl';
import * as THREE from 'three/webgpu';

const WHITE = color('#ffffff');
const LIGHT_GRAY = color('#c7cbd1');

export const createSphereMaterial = ({ opacity = 1.0 } = {}) => {
  const material = new THREE.MeshPhongNodeMaterial();

  material.colorNode = Fn(() => {
    const sphereUv = uv();
    const checkerCell = floor(sphereUv.mul(vec2(16.0, 8.0)));
    const checker = mod(checkerCell.x.add(checkerCell.y), 2.0);

    return mix(LIGHT_GRAY, WHITE, checker);
  })();
  material.shininess = 100;
  material.opacity = opacity;
  material.transparent = opacity < 1.0;
  material.depthWrite = opacity >= 1.0;

  return material;
};
`;

export default SphereMaterialCode;
