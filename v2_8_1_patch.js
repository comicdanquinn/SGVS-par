// SG vs Par v2.8.2 corrective patch
// 1) Honors tee-specific pars for Surrey Forward and Peace Portal Red.
// 2) Recovers completed rounds stored under prior version keys into Results history.
// 3) Restores the approved six-state lie/access entry system.

(function(){
  function activePars(courseName, teeName){
    const c=courseDefs[courseName] || courseDefs["Fraserview Golf Course"];
    const selected=(teeName && c.tees[teeName]) ? teeName : c.defaultTee;
    return (c.teePars && c.teePars[selected]) ? c.teePars[selected] : c.pars;
  }

  templateFor = function(courseName, teeName){
    const c=courseDefs[courseName] || courseDefs["Fraserview Golf Course"];
    const selected=(teeName && c.tees[teeName]) ? teeName : c.defaultTee;
    const yards=c.tees[selected];
    const pars=activePars(courseName, selected);
    return pars.map((par,i)=>[par,yards[i]]);
  };

  onCourseSelectionChange = function(){
    const courseName=document.getElementById("course").value;
    const c=courseDefs[courseName];
    round.course=courseName;
    round.tees=c.defaultTee;
    const template=templateFor(courseName, round.tees);
    round.holes=template.map(x=>({par:x[0],yards:x[1],score:null,shots:[],recordedPutts:null,teeClub:"",scoreSource:null,puttsSource:null,penaltyFlag:false}));
    document.getElementById("totalPar").value=activePars(courseName,round.tees).reduce((a,b)=>a+b,0);
    populateTeeDropdown(courseName, round.tees);
    autosave();
    render();
  };

  onTeeSelectionChange = function(){
    const courseName=document.getElementById("course").value;
    const selected=document.getElementById("tees").value;
    const c=courseDefs[courseName];
    if(!c || !c.tees[selected]) return;
    round.course=courseName;
    round.tees=selected;
    const hr=handicapRatingFor(courseName,selected);
    if(hr){ round.courseRating=hr.rating; round.slopeRating=hr.slope; }
    const yards=c.tees[selected];
    const pars=activePars(courseName,selected);
    round.holes.forEach((h,i)=>{
      h.par=pars[i];
      h.yards=yards[i];
      if(h.shots && h.shots.length){
        recalcHole(i);
        updateCalculatedScore(h);
      }
    });
    document.getElementById("totalPar").value=pars.reduce((a,b)=>a+b,0);
    autosave();
    render();
  };

  newSelectedCourseRound = function(){
    const courseName=document.getElementById("course").value || "Fraserview Golf Course";
    const c=courseDefs[courseName] || courseDefs["Fraserview Golf Course"];
    const currentTee=document.getElementById("tees").value;
    const teeName=c.tees[currentTee] ? currentTee : c.defaultTee;
    round.course=courseName; round.tees=teeName;
    round.holes=templateFor(courseName,teeName).map(x=>({
      par:x[0], yards:x[1], score:null, shots:[], recordedPutts:null, teeClub:"",
      scoreSource:null, puttsSource:null, penaltyFlag:false
    }));
    document.getElementById("totalPar").value=activePars(courseName,teeName).reduce((a,b)=>a+b,0);
    document.getElementById("date").value="";
    autosave(); render();
  };

  function migrateCompletedPriorRounds(){
    try{
      const history=getHistory();
      let changed=false;
      for(const key of PREVIOUS_STORAGE_KEYS){
        const raw=localStorage.getItem(key);
        if(!raw) continue;
        let prior;
        try{ prior=migrateKnownRating(JSON.parse(raw)); }catch(_){ continue; }
        if(!prior || !Array.isArray(prior.holes) || prior.holes.length!==18) continue;
        if(!prior.holes.every(h=>Number(h.score)>0)) continue;
        if(!prior.historyId) continue;
        if(history.some(r=>r.id===prior.historyId)) continue;
        const snap=roundSnapshot(prior);
        if(!snap) continue;
        snap.id=prior.historyId;
        history.push(snap);
        changed=true;
      }
      if(changed) localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }catch(_){}
  }

  function repairCurrentSpecialTee(){
    try{
      if(!round || !courseDefs[round.course] || !Array.isArray(round.holes) || round.holes.length!==18) return;
      const pars=activePars(round.course,round.tees);
      let changed=false;
      round.holes.forEach((h,i)=>{
        if(Number(h.par)!==Number(pars[i])){
          h.par=pars[i];
          changed=true;
          if(h.shots && h.shots.length){
            recalcHole(i);
            updateCalculatedScore(h);
          }
        }
      });
      if(changed){
        const totalPar=document.getElementById("totalPar");
        if(totalPar) totalPar.value=pars.reduce((a,b)=>a+b,0);
        autosave();
        render();
      }
    }catch(_){}
  }

  // Approved golfer-facing lie/access states and created-position PR costs.
  // Legacy labels remain in the cost table so old saved rounds can still recalculate.
  Object.assign(createdLieCost, {
    "Fairway / Fringe":0.0,
    "Light Rough":0.1,
    "Deep Rough":0.2,
    "Bunker":0.2,
    "Restricted":0.5,
    "Recovery Only":1.0
  });

  const LIE_OPTIONS = ["Fairway / Fringe","Light Rough","Deep Rough","Bunker","Restricted","Recovery Only"];
  const LEGACY_LIE_MAP = {
    "Fairway":"Fairway / Fringe",
    "Fringe/Puttable":"Fairway / Fringe",
    "Rough":"Light Rough",
    "Heavy Rough":"Deep Rough",
    "Fairway Bunker":"Bunker",
    "Greenside Bunker":"Bunker",
    "Trees/Clear Shot":"Restricted",
    "Restricted/Blocked":"Restricted",
    "Recovery Only":"Recovery Only"
  };

  function simplifyLieSelect(hi, preferred){
    const sel=document.getElementById(`lie${hi}`);
    if(!sel) return;
    const wanted=LEGACY_LIE_MAP[preferred || sel.value] || preferred || sel.value || "Fairway / Fringe";
    sel.innerHTML=LIE_OPTIONS.map(x=>`<option value="${x}">${x}</option>`).join("");
    sel.value=LIE_OPTIONS.includes(wanted) ? wanted : "Fairway / Fringe";
  }

  const originalShotForm=shotForm;
  shotForm=function(hi){
    const form=originalShotForm(hi);
    setTimeout(()=>simplifyLieSelect(hi),0);
    return form;
  };

  const originalPopulateEditForm=populateEditForm;
  populateEditForm=function(hi,si){
    const s=round.holes[hi] && round.holes[hi].shots ? round.holes[hi].shots[si] : null;
    const oldLie=s ? s.lie : null;
    originalPopulateEditForm(hi,si);
    if(s && s.dest!=="Green" && s.dest!=="Holed") simplifyLieSelect(hi,oldLie);
  };

  migrateCompletedPriorRounds();
  repairCurrentSpecialTee();
})();
