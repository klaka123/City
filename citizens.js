const citizens = [];

export function spawnCitizen(scene) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.8, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xffcc88 })
  );
  m.position.set(Math.random()*20-10,0.4,Math.random()*20-10);
  m.userData.dir = Math.random() * Math.PI * 2;
  scene.add(m);
  citizens.push(m);
}

export function updateCitizens() {
  citizens.forEach(c => {
    c.position.x += Math.cos(c.userData.dir) * 0.02;
    c.position.z += Math.sin(c.userData.dir) * 0.02;
    if (Math.random() < 0.01) c.userData.dir = Math.random() * Math.PI * 2;
  });
}
