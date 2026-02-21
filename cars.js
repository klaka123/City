const cars = [];

export function spawnCar(scene) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(0.8,0.4,1.4),
    new THREE.MeshStandardMaterial({ color: 0xff4444 })
  );
  m.position.set(-20,0.25,Math.random()*20-10);
  m.userData.speed = 0.05;
  scene.add(m);
  cars.push(m);
}

export function updateCars() {
  cars.forEach(c => {
    c.position.x += c.userData.speed;
    if (c.position.x > 20) c.position.x = -20;
  });
}
