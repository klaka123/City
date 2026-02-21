import { createBuilding, buildings } from "./buildings.js";
import { updateCitizens } from "./citizens.js";
import { updateCars } from "./cars.js";

export let mode = "build";
export let isNight = false;

let sun, ambient, ground;

export function initWorld(scene) {
  sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(30, 50, 20);
  sun.castShadow = true;
  scene.add(sun);

  ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x3a8f5a })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

export function toggleDayNight() {
  isNight = !isNight;
  sun.intensity = isNight ? 0.2 : 1;
  ambient.intensity = isNight ? 0.2 : 0.4;
}

export function handleClick(e, camera, scene) {
  const mouse = new THREE.Vector2(
    (e.clientX / innerWidth) * 2 - 1,
    -(e.clientY / innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObject(ground);
  if (!hit.length) return;

  const x = Math.round(hit[0].point.x / 2) * 2;
  const z = Math.round(hit[0].point.z / 2) * 2;

  if (mode === "build") createBuilding(scene, x, z);
  if (mode === "delete") buildings.delete(`${x}_${z}`);
}

export function updateWorld() {
  updateCitizens();
  updateCars();
}
