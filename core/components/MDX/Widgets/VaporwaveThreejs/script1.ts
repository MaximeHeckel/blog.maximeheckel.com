// Base scene
export const script1 = `import "../styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Objects

/**
 * Here I use a Plane Geometry of width 1 and height 2
 * It's also subdivided into 24 square along the width and the height
 * which adds more vertices and edges to play with when we'll build our terrain
 */ 
const geometry = new THREE.PlaneGeometry(1, 2, 24, 24);
const material = new THREE.MeshBasicMaterial({
    // Uncomment the following if you wish to visualize the wireframe of our mesh
    // wireframe: true,
    color: 0xffffff

});

const plane = new THREE.Mesh(geometry, material);

// Here we position our plane flat in front of the camera
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = 0.0;
plane.position.z = 0.15;

scene.add(plane);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new THREE.PerspectiveCamera(
  // field of view
  75,
  // aspect ratio
  sizes.width / sizes.height,
  // near plane: it's low since we want our mesh to be visible even from very close
  0.01,
  // far plane: how far we're rendering
  20
);

// Position the camera a bit higher on the y axis and a bit further back from the center
camera.position.x = 0;
camera.position.y = 0.06;
camera.position.z = 1.1;

// Controls
// These are custom controls I like using for dev: we can drag/rotate the scene easily
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Event listener to handle screen resize
window.addEventListener("resize", () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera's aspect ratio and projection matrix
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    // Note: We set the pixel ratio of the renderer to at most 2
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animate: we call this tick function on every frame
const tick = () => {
    // Update controls
    controls.update();
  
    // Update the rendered scene
    renderer.render(scene, camera);
  
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

// Calling tick will initiate the rendering of the scene
tick();
`;
