import type { Box3, Camera, Point3 } from './geometry';

export const CAMERA: Camera = {
  azimuth: 225,
  elevation: 35.264,
  zoom: 1,
  target: [0, -0.1, 0.1],
  span: [9.4, 6.8],
};

export const SLAB: Box3 = {
  min: [-3.74, -0.1968, -2.76],
  max: [3.74, -0.012, 2.96],
};
export const CUBE: Box3 = { min: [0, 0, -0.65], max: [1.7, 1.7, 1.05] };
export const SURFACE_POINT: Point3 = [-1.05, 0.025, 0.3];
