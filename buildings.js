export const buildings = new Map();

export function createBuilding(scene, x, z) {
  const key = `${x}_${z}`;
  if (buildings.has(key)) return;

  const height = 1.5 + Math.random() * 5;
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, height, 1.8),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.5, 0.6)
    })
  );

  mesh.position.set(x, height / 2, z);
  mesh.castShadow = true;
  scene.add(mesh);
  buildings.set(key, { mesh, level: 1 });
}
