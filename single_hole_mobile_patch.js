/* SG vs Par v6.3.15 — single-hole mobile flow + responsive width fix.
   Shows one hole at a time, advances automatically after the hole is completed,
   and adds Back / Go to Hole / Next navigation. Scoring formulas are untouched. */
(function(){
  function isClosed(h){
    if(!h || !Array.isArray(h.shots) || !h.shots.length) return false;
    if(h.shots.some(s=>s && s.autoPutting)) return true;
    const last=h.shots[h.shots.length-1];
    return !!(last && last.dest==='Holed');
  }

  function firstIncomplete(){
    const holes=(window.round && Array.isArray(round.holes)) ? round.holes : [];
    const i=holes.findIndex(h=>!isClosed(h));
    return i>=0 ? i : Math.max(0,holes.length-1);
  }

  let activeHoleIndex=firstIncomplete();

  const style=document.createElement('style');
  style.id='singleHoleMobileStyles';
  style.textContent=`
    html,body{max-width:100%;overflow-x:hidden;}
    .wrap,.card,#holes,.shot-form{max-width:100%;box-sizing:border-box;}
    .hole-title{flex-wrap:wrap;}
    .hole-title h3{min-width:0;max-width:100%;flex-wrap:wrap;}
    #holeNavigator{margin-bottom:12px;}
    #holeNavigator .hole-nav-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
    #holeNavigator .hole-nav-title{font-weight:700;font-size:16px;margin-right:auto;}
    #holeNavigator select{min-width:110px;}
    #holeNavigator button:disabled{opacity:.45;cursor:default;}
    @media (max-width:700px){
      .wrap{width:100%;padding-left:8px!important;padding-right:8px!important;box-sizing:border-box;}
      .card{width:100%;padding:12px!important;overflow:hidden;}
      #holes{width:100%;}
      .hole-title{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important;width:100%;}
      .hole-title h3{display:flex!important;flex-wrap:wrap!important;gap:5px!important;width:100%;}
      .hole-title>div{width:100%;}
      .hole-title>div input{width:100%!important;max-width:100%!important;box-sizing:border-box;}
      .shot-form{width:100%;overflow:hidden;}
      .shot-form .row{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:9px!important;width:100%;}
      .shot-form .row>div,.shot-form .row>button{min-width:0!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;flex:none!important;}
      .shot-form input,.shot-form select,.shot-form button{width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
      #holeNavigator{position:sticky;top:58px;z-index:40;background:#f6f7f5;padding:8px 0;}
      #holeNavigator .hole-nav-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
      #holeNavigator .hole-nav-title{grid-column:1 / -1;margin:0;font-size:15px;}
      #holeNavigator .hole-nav-select-wrap{grid-column:1 / -1;display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:8px;}
      #holeNavigator select,#holeNavigator button{width:100%;max-width:100%;box-sizing:border-box;}
      #holes table{display:block!important;width:100%!important;max-width:100%!important;overflow-x:auto!important;white-space:nowrap!important;}
      #holes table th,#holes table td{font-size:12px;padding:7px 5px;}
      input,select,button{max-width:100%;box-sizing:border-box;}
    }
  `;
  document.head.appendChild(style);

  function ensureNavigator(){
    const holesRoot=document.getElementById('holes');
    if(!holesRoot) return null;
    let nav=document.getElementById('holeNavigator');
    if(!nav){
      nav=document.createElement('div');
      nav.id='holeNavigator';
      nav.className='card';
      holesRoot.parentNode.insertBefore(nav,holesRoot);
    }
    return nav;
  }

  function clampActive(){
    const n=(round && Array.isArray(round.holes)) ? round.holes.length : 0;
    if(!n){ activeHoleIndex=0; return; }
    activeHoleIndex=Math.max(0,Math.min(activeHoleIndex,n-1));
  }

  function applySingleHoleView(){
    const holesRoot=document.getElementById('holes');
    if(!holesRoot) return;
    clampActive();
    const cards=Array.from(holesRoot.children);
    cards.forEach((card,i)=>{ card.style.display=(i===activeHoleIndex?'block':'none'); });

    const nav=ensureNavigator();
    if(!nav) return;
    const n=(round && Array.isArray(round.holes)) ? round.holes.length : cards.length;
    const h=(round && round.holes) ? round.holes[activeHoleIndex] : null;
    const complete=isClosed(h);
    const options=Array.from({length:n},(_,i)=>`<option value="${i}" ${i===activeHoleIndex?'selected':''}>Hole ${i+1}</option>`).join('');
    nav.innerHTML=`<div class="hole-nav-row">
      <div class="hole-nav-title">Hole ${activeHoleIndex+1} of ${n}${complete?' • Complete':''}</div>
      <button type="button" onclick="window.sgGoHole(${activeHoleIndex-1})" ${activeHoleIndex===0?'disabled':''}>← Back</button>
      <button type="button" onclick="window.sgGoHole(${activeHoleIndex+1})" ${activeHoleIndex>=n-1?'disabled':''}>Next →</button>
      <div class="hole-nav-select-wrap"><label style="margin:0">Go to hole</label><select onchange="window.sgGoHole(Number(this.value))">${options}</select></div>
    </div>`;
  }

  window.sgGoHole=function(i){
    const n=(round && Array.isArray(round.holes)) ? round.holes.length : 18;
    const next=Math.max(0,Math.min(Number(i)||0,n-1));
    activeHoleIndex=next;
    applySingleHoleView();
    const root=document.getElementById('holes');
    if(root) root.scrollIntoView({behavior:'smooth',block:'start'});
  };

  const originalRender=window.render;
  if(typeof originalRender==='function'){
    window.render=render=function(){
      const out=originalRender();
      applySingleHoleView();
      return out;
    };
  }

  const originalAddShot=window.addShot;
  if(typeof originalAddShot==='function'){
    window.addShot=addShot=function(hi){
      const wasClosed=isClosed(round&&round.holes?round.holes[hi]:null);
      const out=originalAddShot(hi);
      const h=round&&round.holes?round.holes[hi]:null;
      if(!wasClosed && isClosed(h) && hi<round.holes.length-1){
        activeHoleIndex=hi+1;
        applySingleHoleView();
        const root=document.getElementById('holes');
        if(root) root.scrollIntoView({behavior:'smooth',block:'start'});
      }else{
        activeHoleIndex=hi;
        applySingleHoleView();
      }
      return out;
    };
  }

  const originalStartNewRound=window.startNewRound;
  if(typeof originalStartNewRound==='function'){
    window.startNewRound=startNewRound=function(){
      const before=round;
      const out=originalStartNewRound();
      if(round!==before || (round&&round.holes&&round.holes.every(h=>!h.shots||!h.shots.length))){
        activeHoleIndex=0;
        applySingleHoleView();
      }
      return out;
    };
  }

  const originalCourseChange=window.onCourseSelectionChange;
  if(typeof originalCourseChange==='function'){
    window.onCourseSelectionChange=onCourseSelectionChange=function(){
      const out=originalCourseChange();
      activeHoleIndex=0;
      applySingleHoleView();
      return out;
    };
  }

  const originalRestore=window.restoreProgress;
  if(typeof originalRestore==='function'){
    window.restoreProgress=restoreProgress=function(){
      const out=originalRestore();
      activeHoleIndex=firstIncomplete();
      applySingleHoleView();
      return out;
    };
  }

  const originalSetPlayerName=window.setPlayerName;
  if(typeof originalSetPlayerName==='function'){
    window.setPlayerName=setPlayerName=function(v){
      const out=originalSetPlayerName(v);
      activeHoleIndex=firstIncomplete();
      applySingleHoleView();
      return out;
    };
  }

  activeHoleIndex=firstIncomplete();
  if(typeof window.render==='function') window.render();
  else applySingleHoleView();
})();
