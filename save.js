// save.js
// localStorage save/load + a simple leaderboard (local-only)

export function saveGame(world){
  try{
    const st = world.getState();
    st.savedAt = (new Date()).toISOString();
    localStorage.setItem('megacity_save_v1', JSON.stringify(st));
    // also record score in leaderboard
    const score = evaluateScore(st);
    const lb = JSON.parse(localStorage.getItem('megacity_leader_v1') || '[]');
    lb.push({score, at:st.savedAt});
    // keep top 20
    lb.sort((a,b)=>b.score-a.score);
    localStorage.setItem('megacity_leader_v1', JSON.stringify(lb.slice(0,20)));
    return true;
  }catch(e){
    console.error(e);
    return false;
  }
}

export function loadGame(world){
  try{
    const raw = localStorage.getItem('megacity_save_v1');
    if(!raw) return null;
    const st = JSON.parse(raw);
    world.loadState(st);
    return st;
  }catch(e){
    console.error(e);
    return null;
  }
}

export function getLeaders(){
  try{
    return JSON.parse(localStorage.getItem('megacity_leader_v1') || '[]');
  }catch(e){ return []; }
}

function evaluateScore(state){
  // simple scoring: buildings * weight + roads * 0.5
  const bcount = Object.keys(state.buildings||{}).length;
  const rcount = Object.keys(state.roads||{}).length;
  return Math.round(bcount*10 + rcount*5 + (state.waterEnabled?200:0));
}
