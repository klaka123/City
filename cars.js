// cars.js
// simple cars that follow horizontal path across map on roads (smart roads basic)

export let Cars = null;

export function initCars(world, count=8){
  if(Cars) return Cars;
  const THREE = window.THREE;
  const group = new THREE.Group();
  world.scene.add(group);

  const cars = [];
  const gs = world.state.gridSize;
  const csize = world.state.cell;

  // choose road start points (cells with roads) - initially maybe empty, so place some virtual lanes
  function findRoadCells(){
    return Object.keys(world.state.roads).map(k=>{
      const [gx,gz] = k.split('_').map(v=>parseInt(v,10));
      return {gx,gz};
    });
  }

  // spawn on perimeter if no roads, otherwise on roads
  for(let i=0;i<count;i++){
    const geom = new THREE.BoxGeometry(0.8,0.35,1.4);
    const mat = new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL(Math.random(),0.8,0.5)});
    const car = new THREE.Mesh(geom, mat);
    car.castShadow = true;
    // spawn x from -half to +half
    const x = -gs/2 * csize + Math.random() * gs * csize;
    const z = (Math.random()*gs - gs/2) * csize;
    car.position.set(x,0.2,z);
    car.userData.speed = 0.04 + Math.random()*0.04;
    car.userData.dir = 1;
    group.add(car);
    cars.push(car);
  }

  function step(){
    requestAnimationFrame(step);
    // simple movement along X axis; if there are roads, cars will prefer to stay near road y positions
    cars.forEach(car=>{
      car.position.x += car.userData.speed*car.userData.dir;
      // bounce on edges
      const half = (gs/2)*csize;
      if(car.position.x > half+2){ car.userData.dir = -1; car.position.z = (Math.random()*gs - gs/2) * csize; }
      if(car.position.x < -half-2){ car.userData.dir = 1; car.position.z = (Math.random()*gs - gs/2) * csize; }
    });
  }
  step();

  Cars = {group, cars};
  return Cars;
}
