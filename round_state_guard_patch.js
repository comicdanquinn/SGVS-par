/* SG vs Par v6.3.14 — completed-hole entry guard + save reconciliation validation.
   Prevents shots being appended after a hole has already reached the green/been holed,
   and blocks saving an 18-hole result when shot accounting does not reconcile to Par − Score.
   Scoring formulas are untouched. */
(function(){
  function holeIsClosed(h){
    if(!h || !Array.isArray(h.shots) || !h.shots.length) return false;
    if(h.shots.some(s=>s && s.autoPutting)) return true;
    const last=h.shots[h.shots.length-1];
    return !!(last && last.dest==='Holed');
  }

  function malformedPostGreen(h){
    if(!h || !Array.isArray(h.shots)) return false;
    const greenIndex=h.shots.findIndex(s=>s && !s.autoPutting && s.dest==='Green');
    if(greenIndex<0) return false;
    return h.shots.slice(greenIndex+1).some(s=>s && !s.autoPutting);
  }

  function reconciliationProblem(h){
    if(!h || !Number(h.score)) return false;
    const shotTotal=(h.shots||[]).reduce((a,s)=>a+(Number(s&&s.sg)||0),0);
    const target=(Number(h.par)||0)-Number(h.score);
    return Math.abs(shotTotal-target)>=0.05;
  }

  // Once a hole has been completed, remove the entry form. Changes must be made
  // by editing/removing one of the recorded shots, which prevents stale controls
  // from appending full shots after the ball was already on the green.
  const originalShotForm=window.shotForm;
  if(typeof originalShotForm==='function'){
    window.shotForm=shotForm=function(hi){
      const h=round && round.holes ? round.holes[hi] : null;
      const editing=editingShot && editingShot.hi===hi;
      if(holeIsClosed(h) && !editing){
        const box=document.createElement('div');
        box.className='shot-form';
        box.innerHTML='<div class="note"><b>Hole complete.</b> To make a change, use <b>Edit</b> or <b>Remove</b> on a shot above. New shots cannot be added after the hole is complete.</div>';
        return box;
      }
      return originalShotForm(hi);
    };
  }

  // Extra protection in case addShot is triggered from an older/stale form.
  const originalAddShot=window.addShot;
  if(typeof originalAddShot==='function'){
    window.addShot=addShot=function(hi){
      const h=round && round.holes ? round.holes[hi] : null;
      const editing=editingShot && editingShot.hi===hi;
      if(holeIsClosed(h) && !editing){
        const status=document.getElementById('copyStatus');
        if(status) status.textContent=`Hole ${hi+1} is already complete. Edit or remove a recorded shot before adding another.`;
        return;
      }
      return originalAddShot(hi);
    };
  }

  // A finished round must reconcile hole-by-hole before it is allowed into Results.
  const originalFinishRound=window.finishRound;
  if(typeof originalFinishRound==='function'){
    window.finishRound=finishRound=function(){
      try{ if(typeof syncRoundHeader==='function') syncRoundHeader(); }catch(e){}
      const holes=(round && Array.isArray(round.holes)) ? round.holes : [];
      const completed=holes.filter(h=>Number(h.score)>0).length;
      if(completed!==18) return originalFinishRound();

      const malformed=[];
      const unreconciled=[];
      holes.forEach((h,i)=>{
        if(malformedPostGreen(h)) malformed.push(i+1);
        if(reconciliationProblem(h)) unreconciled.push(i+1);
      });

      if(malformed.length || unreconciled.length){
        const parts=[];
        if(malformed.length) parts.push(`invalid shot sequence on hole${malformed.length===1?'':'s'} ${malformed.join(', ')}`);
        if(unreconciled.length) parts.push(`SGvP does not reconcile on hole${unreconciled.length===1?'':'s'} ${unreconciled.join(', ')}`);
        const status=document.getElementById('copyStatus');
        if(status) status.textContent='Round not saved: '+parts.join('; ')+'. Edit those holes before saving.';
        try{ if(typeof showPage==='function') showPage('entry'); }catch(e){}
        return;
      }
      return originalFinishRound();
    };
  }
})();
