// buildings.js
// Exports: BUILDING_TYPES array and createBuildingMesh(type,opts)

export const BUILDING_TYPES = [];

// We'll procedurally create ~120 building "types" (varied)
(function generateTypes(){
  const baseNames = ['Resid', 'Com', 'Ind', 'Office','Hotel','Market','Clinic','School','Park','Bank','Lab','Tower'];
  for(let i=0;i<120;i++){
    const name = baseNames[i % baseNames.length] + '-' + (Math.floor(i/ baseNames.length)+1);
    BUILDING_TYPES.push({
      id: 't'+i,
      name,
      basePrice: Math.round(800 + Math.pow(i%10+1,2)*120),
      colorHue: (i*13)%360,
      complexity: 1 + (i%5),
      maxLevel: 5,
    });
  }
})();

// Helper to create stylized stacked boxes building (Townscaper-like)
export function createBuildingMesh(typeIndex, x, z, level=1){
  const THREE = window.THREE;
  const spec = BUILDING_TYPES[typeIndex % BUILDING_TYPES.length];
  const group = new THREE.Group();
  group.userData.buildingType = spec.id;
  group.userData.typeIndex = typeIndex;
  group.userData.level = level;

  // base tower height depends on complexity and level
  const baseHeight = (1.4 + spec.complexity*0.8) * (0.9 + level*0.25);

  const blocks = Math.max(2, Math.round(2 + spec.complexity / 2));
  for(let i=0;i<blocks;i++){
    const sx = 1.6 - (i*0.12);
    const sz = 1.6 - (i*0.12);
    const sh = baseHeight * (0.5 + Math.random()*0.8) * (1 - i*0.08);
    const geom = new THREE.BoxGeometry(sx, sh, sz);
    // color gradient
    const hue = ((spec.colorHue + i*8) % 360) / 360;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(hue, 0.45, 0.55),
      metalness: 0.1,
      roughness: 0.6
    });
    const m = new THREE.Mesh(geom, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    m.position.set(0, (i===0? sh/2 : blocks*0.02 + sh/2 + i*0.6), 0);
    // slight random rotation for charm
    m.rotation.y = (i%2?0.03:-0.03)*Math.random();
    group.add(m);
  }

  // roof decoration
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.6, 6), new THREE.MeshStandardMaterial({color:0xeeeeee, metalness:0.2, roughness:0.5}));
  roof.position.set(0, group.children[group.children.length-1].position.y + group.children[group.children.length-1].geometry.parameters.height/2 + 0.3, 0);
  group.add(roof);

  group.position.set(x, 0, z);
  group.scale.set(1.0,1.0,1.0);

  // convenience references
  group.userData.price = Math.round(spec.basePrice * (1 + (level-1)*0.5));
  group.userData.income = Math.round(group.userData.price * 0.08);

  return group;
}
