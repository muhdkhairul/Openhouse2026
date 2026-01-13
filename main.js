import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/MTLLoader.js";

// ---------- MindAR ----------
const mindarThree = new window.MINDAR.IMAGE.MindARThree({
  container: document.body,
  imageTargetSrc: [
    "assets/marker-base.mind",
    "assets/marker-side.mind",
    "assets/marker-back.mind"
  ]
});

const { renderer, scene, camera } = mindarThree;

// ---------- Lighting ----------
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));

// ---------- Anchors ----------
const anchors = [
  mindarThree.addAnchor(0),
  mindarThree.addAnchor(1),
  mindarThree.addAnchor(2)
];

// ---------- Virtual Root (Smoothed Pose) ----------
const root = new THREE.Group();
scene.add(root);

let activeAnchor = null;

// ---------- Model ----------
let model;
let modelBoxSize = 1; // default fallback
const MARKER_REAL_WIDTH = 0.10; // meters (must match compiler)

const mtlLoader = new MTLLoader();
mtlLoader.load("assets/model.mtl", (materials) => {
  materials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);

  objLoader.load("assets/model.obj", (obj) => {
    model = obj;

    // ---- Compute model bounding box ----
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Use X axis width (most stable)
    modelBoxSize = size.x;

    // ---- Auto-scale ----
    const scaleFactor = MARKER_REAL_WIDTH / modelBoxSize;
    model.scale.setScalar(scaleFactor);

    // Orientation fix (common for OBJ)
    model.rotation.x = -Math.PI / 2;

    root.add(model);
  });
});

// ---------- Anchor Detection ----------
anchors.forEach(anchor => {
  anchor.onTargetFound = () => {
    activeAnchor = anchor;
  };

  anchor.onTargetLost = () => {
    if (activeAnchor === anchor) {
      activeAnchor = null;
    }
  };
});

// ---------- Touch Rotation ----------
let dragging = false;
let prevX = 0;

renderer.domElement.addEventListener("pointerdown", e => {
  dragging = true;
  prevX = e.clientX;
});

renderer.domElement.addEventListener("pointermove", e => {
  if (!dragging || !model) return;
  const dx = e.clientX - prevX;
  model.rotation.y += dx * 0.01;
  prevX = e.clientX;
});

renderer.domElement.addEventListener("pointerup", () => dragging = false);

// ---------- Smooth Follow Logic ----------
const smoothPosition = new THREE.Vector3();
const smoothQuaternion = new THREE.Quaternion();

renderer.setAnimationLoop(() => {
  if (activeAnchor) {
    const targetPos = activeAnchor.group.position;
    const targetQuat = activeAnchor.group.quaternion;

    smoothPosition.lerp(targetPos, 0.15);
    smoothQuaternion.slerp(targetQuat, 0.15);

    root.position.copy(smoothPosition);
    root.quaternion.copy(smoothQuaternion);
  }

  renderer.render(scene, camera);
});

// ---------- Start ----------
await mindarThree.start();
