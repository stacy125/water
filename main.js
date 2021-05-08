import './style.css'
import * as THREE from '../node_modules/three/build/three.module'
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls'
import { Water } from '../node_modules/three/examples/jsm/objects/Water'
import { Sky } from '../node_modules/three/examples/jsm/objects/Sky'

console.log('hello');

let container, stats;
let camera, scene, renderer;
let controls, water, sun;

init();
animate();

function init() {
  // this is where we bring together our threejs canvas scene
  container = document.querySelector('#container');
  
  // renderer calls it to be
  renderer = new THREE.WebGL1Renderer();
  renderer.setPixelRatio(window.devivePixelRatio);
  renderer.setSize(window.innerWidth, innerHeight);
  renderer.toneMapping =THREE.ACESFilmicToneMapping;
  container.appendChild(renderer.domElement);

  // creating scene
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(30, 30, 100);

  // creating the sun (3D object parent)
  // A point in 3D space (x, y, z)
  sun = new THREE.Vector3();

  // creating water
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
  water = new Water(waterGeometry,

    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('waterNormals.jpg', function(texture) {
        texture.wrap5 = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xE9F714,
      waterColor: 0x27BDF9,
      distortionScale: 3.7,
      // fog: scene.fog !== undefined
    });

    water.rotation.x = - Math.PI / 2;

    scene.add(water);

    // creating the sky

  const sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  
  skyUniforms['turbidity'].value = 100;
  skyUniforms['rayleigh'].value = 2;
  skyUniforms['mieCoefficient'].value = 0.005;
  skyUniforms['mieDirectionalG'].value = 0.8;
  skyUniforms.exposure = 4
  
console.log(skyUniforms);
  const parameters = {
    elevation: 2,
    azimuth: 180
  }

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  function updateSun() {

    const phi = THREE.MathUtils.degToRad(parameters.azimuth);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
  }
  updateSun();
  
  // adding controls
  
  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();
  
  // eventLister
  
  window.addEventListener('resize', onWindowResize);
  
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
} 

function render() {
  const time = performance.now() * 0.001;

  // torus.postion.y = Math.sin(time) * 20 * 5;
  // torus.rotation.x = time * 0.5;
  // torus.rotation.z = time * 0.51;

  water.material.uniforms['time'].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}
