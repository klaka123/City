// ui.js
// Binds UI controls to world/main behavior. Exports initUI(world, main)

import { saveGame, loadGame, getLeaders } from './save.js';

let currentMode = 'build';
let selectedTypeIndex = 0;

export function initUI(world, main){
  // DOM refs
  const buildBtn = document.getElementById('buildBtn');
  const roadBtn = document.getElementById('roadBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const waterBtn = document.getElementById('waterBtn');
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const leaderBtn = document.getElementById('leaderBtn');
  const buildingList = document.getElementById('buildingList');
  const infoBox = document.getElementById('infoBox');
  const leadersEl = document.getElementById('leaders');
  const leaderboard = document.getElementById('leaderboard');

  buildBtn.onclick = ()=> setMode('build');
  roadBtn.onclick = ()=> setMode('road');
  deleteBtn.onclick = ()=> setMode('delete');

  upgradeBtn.onclick = ()=>{
    if(!main.lastGrid) { infoBox.innerText = 'Выделите ячейку с зданием чтобы улучшить'; return; }
    const g = main.lastGrid;
    const k = `${g.gx}_${g.gz}`;
    const b = world.state.buildings[k];
    if(!b){ infoBox.innerText = 'Нет здания в этой клетке'; return; }
    if(b.level >= 5){ infoBox.innerText = 'Макс уровень'; return; }
    b.level++;
    // update the mesh: remove and re-place with higher level
    world.removeAt(g.gx,g.gz);
    world.placeBuilding(g.gx,g.gz,b.typeIndex,b.level);
    infoBox.innerText = `Улучшено: уровень ${b.level}`;
    updateStats(world);
  };

  waterBtn.onclick = ()=>{
    world.toggleWater();
  };

  saveBtn.onclick = ()=>{
    const ok = saveGame(world);
    infoBox.innerText = ok ? 'Сохранено локально' : 'Ошибка сохранения';
  };

  loadBtn.onclick = ()=>{
    const st = loadGame(world);
    if(st){ infoBox.innerText = 'Загрузка успешна'; updateStats(world); }
    else infoBox.innerText = 'Сохранений нет';
  };

  resetBtn.onclick = ()=> {
    if(!confirm('Создать новый город? Текущий прогресс будет потерян.')) return;
    location.reload();
  };

  leaderBtn.onclick = ()=>{
    const lb = getLeaders();
    leadersEl.innerHTML = '';
    lb.forEach(entry=>{
      const li = document.createElement('li');
      li.textContent = `${entry.score} — ${new Date(entry.at).toLocaleString()}`;
      leadersEl.appendChild(li);
    });
    leaderboard.classList.toggle('hidden');
  };

  function setMode(mode){
    currentMode = mode;
    document.querySelectorAll('button.mode').forEach(b=>b.classList.remove('active'));
    if(mode==='build') buildBtn.classList.add('active');
    if(mode==='road') roadBtn.classList.add('active');
    if(mode==='delete') deleteBtn.classList.add('active');
    infoBox.innerText = `Режим: ${mode}`;
  }

  // fill buildingList
  import('./buildings.js').then(mod=>{
    mod.BUILDING_TYPES.slice(0,36).forEach((b,i)=>{
      const card = document.createElement('div');
      card.className = 'buildCard';
      card.innerHTML = `<div style="font-weight:700">${b.name}</div><div>Цена: ${b.basePrice}</div>`;
      card.onclick = ()=>{
        document.querySelectorAll('.buildCard').forEach(n=>n.classList.remove('selected'));
        card.classList.add('selected');
        selectedTypeIndex = i;
        infoBox.innerText = `Выбрано: ${b.name}`;
      };
      buildingList.appendChild(card);
      if(i===0){ card.classList.add('selected'); selectedTypeIndex=0; }
    });
  });

  // connect click on canvas to actions
  main.onGridClick = ({gx,gz})=>{
    main.lastGrid = {gx,gz};
    if(currentMode==='build'){
      const ok = world.placeBuilding(gx,gz, selectedTypeIndex,1);
      infoBox.innerText = ok ? `Построено ${gx},${gz}` : 'Нельзя поставить здесь';
      updateStats(world);
    } else if(currentMode==='road'){
      const ok = world.placeRoad(gx,gz);
      infoBox.innerText = ok ? `Поставлена дорога` : 'Нельзя поставить дорогу';
      updateStats(world);
    } else if(currentMode==='delete'){
      const ok = world.removeAt(gx,gz);
      infoBox.innerText = ok ? 'Удалено' : 'Нечего удалять';
      updateStats(world);
    }
  };

  // update stat display
  function updateStats(w){
    const moneyEl = document.getElementById('money');
    const popEl = document.getElementById('population');
    const incEl = document.getElementById('income');
    // calculate metrics
    const bcount = Object.keys(w.state.buildings).length;
    const rcount = Object.keys(w.state.roads).length;
    moneyEl.innerText = `💰 ${bcount*1000}`;
    popEl.innerText = `👥 ${Math.round(bcount*4)}`;
    incEl.innerText = `📈 ${Math.round(bcount*8 + rcount*2)}`;
  }

  // ticker to refresh stats
  setInterval(()=>updateStats(world), 1500);

  // expose helper
  return { setMode, updateStats };
}
