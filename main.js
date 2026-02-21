// main.js
// Orchestrates everything

import { initWorld } from './world.js';
import { initCitizens } from './citizens.js';
import { initCars } from './cars.js';
import { initUI } from './ui.js';

const container = document.getElementById('canvasContainer');

let world = null;
let citizens = null;
let cars = null;
let ui = null;

async function start(){
  world = await initWorld(container);
  citizens = initCitizens(world, 28);
  cars = initCars(world, 12);
  ui = initUI(world, { onGridClick }); // onGridClick will be set below

  // raycasting for clicks
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function onPointerDown(e){
    const rect = world.renderer.domElement.getBoundingClientRect();
    const x = ( (e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = - ( (e.clientY - rect.top) / rect.height) * 2 + 1;
    mouse.set(x,y);
    raycaster.setFromCamera(mouse, world.camera);
    const hits = raycaster.intersectObject(world.scene, true);
    // prefer ground intersection
    let groundHit = null;
    for(const h of hits){
      if(h.object === world.scene.getObjectByProperty('type','Mesh') || h.point){
        groundHit = h; break;
      }
    }
    if(!groundHit && hits.length>0) groundHit = hits[0];
    if(!groundHit) return;
    const point = groundHit.point;
    const g = world.worldToGridFromPoint(point);
    if(window.onGridClickExternal) window.onGridClickExternal(g);
    if(typeof window.onGridClick === 'function') window.onGridClick(g);
    if(typeof ui?.onGridClick === 'function') ui.onGridClick(g);
    // also notify ui.js via method set in initUI
    if(typeof main.onGridClick === 'function') main.onGridClick(g);
  }

  world.renderer.domElement.addEventListener('pointerdown', onPointerDown);

  // expose callback setter for UI to attach
  window.main = window.main || {};
  window.main.onGridClick = null;
  window.main.lastGrid = null;
  // alias used in ui
  const onGridClickCbHolder = {
    set cb(fn){ window.main.onGridClick = fn; }
  };
  // also allow ui to call by main parameter
  const API = { onGridClick: null };
  Object.defineProperty(API, 'onGridClick', {
    set: function(v){ window.main.onGridClick = v; },
    get: function(){ return window.main.onGridClick; }
  });

  // simple animation tick: world has its own renderer loop; here we update any dynamic HUD etc.
  function tick(){
    requestAnimationFrame(tick);
    // could add time-of-day cycle etc.
  }
  tick();
}
start();

// expose main wrapper for ui module to set callback
export const main = {
  onGridClick: null,
  lastGrid: null
};
