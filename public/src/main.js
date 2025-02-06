import * as THREE from 'three';
import { LoadGLTFByPath } from './Helpers/ModelHelper.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';

//Renderer does the job of rendering the graphics
let renderer = new THREE.WebGLRenderer({
  //Defines the canvas component in the DOM that will be used
  canvas: document.querySelector('#background'),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

//set up the renderer with the default settings for threejs.org/editor - revision r153
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1;
renderer.useLegacyLights = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0xffffff, 0);
//make sure three/build/three.module.js is over r152 or this feature is not available. 
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light
directionalLight.position.set(5, 10, 7.5); // Position the light
scene.add(directionalLight);

let cameraList = [];
let camera;
let controls;

// Load the GLTF model
LoadGLTFByPath(scene)
  .then(() => {
    retrieveListOfCameras(scene);
  })
  .catch((error) => {
    console.error('Error loading JSON scene:', error);
  });

//retrieve list of all cameras
function retrieveListOfCameras(scene) {
  // Get a list of all cameras in the scene
  scene.traverse(function (object) {
    if (object.isCamera) {
      cameraList.push(object);
    }
  });

  //Set the camera to the first value in the list of cameras
  camera = cameraList[0];

  // Initialize OrbitControls
  controls = new OrbitControls(camera, renderer.domElement);

  // Set the camera position and look at the scene's center
  camera.position.set(0, 5, 10);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  updateCameraAspect(camera);

  // Start the animation loop after the model and cameras are loaded
  animate();
}

// Set the camera aspect ratio to match the browser window dimensions
function updateCameraAspect(camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let selectedObject = null;
let originalColor = null;

// Event listener for mouse clicks
window.addEventListener('click', onMouseClick, false);

function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the raycaster
  const intersects = raycaster.intersectObjects(scene.children, true);

  // Reset the color of the previously selected object
  if (selectedObject) {
    selectedObject.material.color.set(originalColor);
    selectedObject.material.transparent = false;
    selectedObject.material.opacity = 1;
    selectedObject = null;
  }

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    console.log('Clicked on:', intersectedObject);

    // Store the original color of the new intersected object
    originalColor = intersectedObject.material.color.getHex();
    selectedObject = intersectedObject;

    // Change the color of the new intersected object to transparent yellow
    intersectedObject.material.color.set(0xffff00);
    intersectedObject.material.transparent = true;
    intersectedObject.material.opacity = 0.5;
  }
}

//A method to be run each time a frame is generated
function animate() {
  requestAnimationFrame(animate);

  // Update controls
  controls.update();

  renderer.render(scene, camera);
}