import { initWorld, updateWorld, handleClick } from "./world.js";
import { initUI } from "./ui.js";
import { loadGame } from "./save.js";

const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const canvas = document.getElementById("game");

export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87a8ff);

export const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
camera.position.set(18, 20, 18);

export const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.2;

initWorld(scene);
initUI();
loadGame();

window.addEventListener("pointerdown", e => handleClick(e, camera, scene));

function loop() {
  requestAnimationFrame(loop);
  controls.update();
  updateWorld();
  renderer.render(scene, camera);
}
loop();

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
