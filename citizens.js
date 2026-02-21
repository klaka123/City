// citizens.js
// simple low-poly pedestrians wandering, uses world for road points

export let Citizens = null;

export function initCitizens(world, count=20){
  if(Citizens) return Citizens;
  const THREE = window.THREE;
  const group = new THREE.Group();
  world.scene.add(group);

  const citizens = [];
  for(let i=0;i<count;i++){
    const geom = new THREE.BoxGeometry(0.3,0.8,0.3);
    const mat = new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL(Math.random(),0.6,0.6)});
    const m = new THREE.Mesh(geom, mat);
    const pos = randomPoint(world);
    m.position.set(pos.x, 0.4, pos.z);
    m.castShadow = true;
    m.userData.target = randomPoint(world);
    m.userData.speed = 0.01 + Math.random()*0.02;
    group.add(m);
    citizens.push(m);
  }

  function randomPoint(w){
    // return random point within grid (not on water middle necessarily)
    const gs = w.state.gridSize;
    const c = w.state.cell;
    const gx = Math.floor(Math.random()*gs);
    const gz = Math.floor(Math.random()*gs);
    const coords = {x: (gx - gs/2 + 0.5)*c, z:(gz - gs/2 + 0.5)*c};
    return coords;
  }

  function step(){
    requestAnimationFrame(step);
    citizens.forEach(c=>{
      const t = c.userData.target;
      const dx = t.x - c.position.x;
      const dz = t.z - c.position.z;
      const d = Math.hypot(dx,dz);
      if(d < 0.5){
        c.userData.target = randomPoint(world);
      } else {
        const vx = dx/d * c.userData.speed;
        const vz = dz/d * c.userData.speed;
        c.position.x += vx;
        c.position.z += vz;
        // simple bobbing
        c.rotation.y = Math.atan2(vx, vz);
      }
    });
  }
  step();

  Citizens = {group, citizens};
  return Citizens;
}
