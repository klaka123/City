// world.js
// Exports: initWorld(container), placeBuilding(gridX,gridZ,typeIndex), removeAt(...), placeRoad(...), getState(), loadState(state)
// World runs Three.js scene, grid, water, bridges, simple path graph for cars

import { createBuildingMesh, BUILDING_TYPES } from './buildings.js';

const THREE = window.THREE;

export let World = null; // will hold instance after init

export function initWorld(container){
  if(World) return World;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87c0ff);

  const camera = new THREE.PerspectiveCamera(55, container.clientWidth/container.clientHeight, 0.1, 1000);
  camera.position.set(30, 30, 30);

  const renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // controls (orbit)
  const { OrbitControls } = await import('https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js');
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2.15;

  // lights
  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(60,80,40);
  sun.castShadow = true;
  sun.shadow.camera.left = -80; sun.shadow.camera.right = 80; sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
  scene.add(sun);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  // ground (slightly textured color)
  const gridSize = 40;
  const cell = 2.0;
  const groundGeo = new THREE.PlaneGeometry(gridSize*cell, gridSize*cell, 1, 1);
  const groundMat = new THREE.MeshStandardMaterial({color:0x2b7a4a});
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  scene.add(ground);

  // small grid lines
  const gridHelper = new THREE.GridHelper(gridSize*cell, gridSize, 0x144d2f, 0x144d2f);
  scene.add(gridHelper);

  // water plane (hidden unless toggled)
  const waterMat = new THREE.MeshStandardMaterial({color:0x0f89d1, metalness:0.2, roughness:0.6, opacity:0.85, transparent:true});
  const water = new THREE.Mesh(new THREE.PlaneGeometry(gridSize*cell, gridSize*cell), waterMat);
  water.rotation.x = -Math.PI/2;
  water.position.y = -0.01;
  water.visible = false;
  scene.add(water);

  // storage
  const state = {
    gridSize,
    cell,
    buildings: {}, // key "x_z" => {typeIndex,level}
    roads: {}, // key => true
    waterEnabled: false
  };

  // maps for meshes
  const meshGroup = new THREE.Group(); scene.add(meshGroup);

  // bridge materials
  const bridgeMat = new THREE.MeshStandardMaterial({color:0x8b7a6f});

  // helper functions
  function gridToWorld gxz(gx, gz) {
    // grid coords centered
    const half = (gridSize/2)*cell - cell/2;
    const x = (gx - gridSize/2) * cell + cell/2;
    const z = (gz - gridSize/2) * cell + cell/2;
    return {x,z};
  }

  function key(gx, gz){ return `${gx}_${gz}`; }

  function placeBuilding(gx, gz, typeIndex, level=1){
    const k = key(gx,gz);
    if(state.buildings[k] || state.roads[k]) return false;
    const {x,z} = gridToWorld gxz(gx,gz);
    const mesh = createBuildingMesh(typeIndex, x, z, level);
    mesh.position.set(x, 0, z);
    meshGroup.add(mesh);
    state.buildings[k] = {typeIndex, level};
    mesh.userData.grid = {gx,gz};
    return true;
  }

  function removeAt(gx,gz){
    const k = key(gx,gz);
    if(state.buildings[k]){
      // find mesh by grid
      const found = meshGroup.children.find(m => m.userData?.grid && m.userData.grid.gx===gx && m.userData.grid.gz===gz);
      if(found){ meshGroup.remove(found); }
      delete state.buildings[k];
      return true;
    }
    if(state.roads[k]){
      // remove road mesh
      const found = meshGroup.children.find(m => m.userData?.roadKey === k);
      if(found) meshGroup.remove(found);
      delete state.roads[k];
      return true;
    }
    return false;
  }

  function placeRoad(gx,gz){
    const k=key(gx,gz);
    if(state.buildings[k]) return false;
    if(state.roads[k]) return false;
    const {x,z} = gridToWorld gxz(gx,gz);
    const geom = new THREE.BoxGeometry(cell*0.95, 0.05, cell*0.95);
    const mat = new THREE.MeshStandardMaterial({color:0x333333, metalness:0.2, roughness:0.7});
    const road = new THREE.Mesh(geom, mat);
    road.position.set(x, 0.025, z);
    road.userData.roadKey = k;
    road.receiveShadow = true;
    meshGroup.add(road);
    state.roads[k] = true;
    return true;
  }

  function toggleWater(){
    state.waterEnabled = !state.waterEnabled;
    water.visible = state.waterEnabled;
  }

  function getState(){
    return JSON.parse(JSON.stringify(state));
  }
  function loadState(s){
    // clear existing
    meshGroup.clear();
    state.buildings = {};
    state.roads = {};
    if(s.waterEnabled) toggleWater();
    if(s.roads){
      for(const k in s.roads){
        const [gx,gz] = k.split('_').map(n=>parseInt(n,10));
        placeRoad(gx,gz);
      }
    }
    if(s.buildings){
      for(const k in s.buildings){
        const [gx,gz] = k.split('_').map(n=>parseInt(n,10));
        const b = s.buildings[k];
        placeBuilding(gx,gz,b.typeIndex,b.level);
      }
    }
  }

  // raycast helper to map click to grid coord
  function worldToGridFromPoint(point){
    // convert world coordinate to nearest grid index
    const half = (gridSize/2)*cell - cell/2;
    const gx = Math.round((point.x + (gridSize/2)*cell - cell/2)/cell);
    const gz = Math.round((point.z + (gridSize/2)*cell - cell/2)/cell);
    // clamp
    return {
      gx: Math.max(0,Math.min(gridSize-1,gx)),
      gz: Math.max(0,Math.min(gridSize-1,gz))
    };
  }

  // resize handler
  function onResize(){
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
  window.addEventListener('resize', onResize);

  // animation loop
  let running = true;
  function animate(){
    if(!running) return;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  World = {
    scene, camera, renderer, controls, container,
    state, placeBuilding, removeAt, placeRoad, toggleWater, getState, loadState, worldToGridFromPoint
  };
  return World;
}
