import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/MTLLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/controls/OrbitControls.js";

const mindarThree = new window.MINDAR.IMAGE.MindARThree({
  container: document.body,
  //imageTargetSrc: "assets/marker.mind"
  imageTargetSrc: "https://github.com/muhdkhairul/Openhouse2026/raw/refs/heads/main/assets/marker.mind"
});

const { renderer, scene, camera } = mindarThree;

const anchor = mindarThree.addAnchor(0);

// Lighting
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// Load model
let model;
const mtlLoader = new MTLLoader();
mtlLoader.load("https://github.com/muhdkhairul/Openhouse2026/raw/refs/heads/main/assets/model.mtl", (materials) => {
  materials.preload();
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.load("https://github.com/muhdkhairul/Openhouse2026/raw/refs/heads/main/assets/model.obj", (obj) => {
    model = obj;
    model.scale.set(0.02, 0.02, 0.02); // 🔧 adjust scale here
    model.rotation.x = -Math.PI / 2;
    anchor.group.add(model);
  });
});

// Touch rotate
let isDragging = false;
let prevX = 0;

renderer.domElement.addEventListener("pointerdown", (e) => {
  isDragging = true;
  prevX = e.clientX;
});

renderer.domElement.addEventListener("pointermove", (e) => {
  if (!isDragging || !model) return;
  const deltaX = e.clientX - prevX;
  model.rotation.y += deltaX * 0.01;
  prevX = e.clientX;
});

renderer.domElement.addEventListener("pointerup", () => {
  isDragging = false;
});

// Tap detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener("click", (event) => {
  if (!model) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(model, true);

  if (intersects.length > 0) {
    showInfo();
  }
});

// Info panel
async function showInfo() {
  const res = await fetch("ui/info.json");
  const data = await res.json();

  document.getElementById("infoTitle").innerText = data.title;
  document.getElementById("infoText").innerText = data.description;
  document.getElementById("infoPanel").classList.remove("hidden");
}

window.closeInfo = function () {
  document.getElementById("infoPanel").classList.add("hidden");
};

// Start AR
await mindarThree.start();
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});
