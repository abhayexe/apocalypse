import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 5, 11);

// Set the background color of the scene to a specific color
scene.background = new THREE.Color(0x000); // Light blue color


//adds a picture as background
// const textureLoader = new THREE.TextureLoader();
// const backgroundTexture = textureLoader.load('texture.jpg');
// scene.background = backgroundTexture;


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = true;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x555555,
  side: THREE.DoubleSide,
});
// const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
// groundMesh.castShadow = false;
// groundMesh.receiveShadow = true;
// scene.add(groundMesh);

// const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);
// spotLight.position.set(0, 25, 0);
// spotLight.castShadow = true;
// spotLight.shadow.bias = -0.0011;
// scene.add(spotLight);

// Main Spotlight
const spotLight1 = new THREE.SpotLight(0x3700ff, 2000, 100, Math.PI / 2, 1);
spotLight1.position.set(10, 25, 10);
spotLight1.castShadow = true;
spotLight1.shadow.bias = -0.0011;
scene.add(spotLight1);

// Additional Spotlight 1
// const spotLight2 = new THREE.SpotLight(0xffffff, 1500, 100, Math.PI / 6, 1);
// spotLight2.position.set(10, 15, 10);
// spotLight2.castShadow = true;
// spotLight2.shadow.bias = -0.0011;
// scene.add(spotLight2);

// Additional Spotlight 2
const spotLight3 = new THREE.SpotLight(0xff0000, 2500, 100, Math.PI / 6, 1);
spotLight3.position.set(10, 5, 10);
spotLight3.castShadow = true;
spotLight3.shadow.bias = -0.0001;
scene.add(spotLight3);


const loader = new GLTFLoader().setPath('public/millennium_falcon/');
loader.load(
  'scene.gltf',
  (gltf) => {
    console.log('loading model');
    const mesh = gltf.scene;

    mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    mesh.scale.set(3, 3, 3); // Increase the size of the model
    mesh.position.set(0, 1.05, -1);
    scene.add(mesh);

    document.getElementById('progress-container').style.display = 'none';
  },
  (xhr) => {
    console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
  },
  (error) => {
    console.error(error);
  }
);

// Post-processing setup for distance blur
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bokehPass = new BokehPass(scene, camera, {
  focus: 10.0, // Adjust the focus distance
  aperture: 0.00025, // Adjust the aperture (higher values create a stronger blur effect)
  maxblur: 0.1, // Maximum blur amount
  width: window.innerWidth,
  height: window.innerHeight,
});

composer.addPass(bokehPass);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  composer.render();
}

animate();
