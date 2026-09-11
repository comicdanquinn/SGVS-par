/* SG vs Par v6.3.9 — per-player yards/metres display layer.
   Scoring and stored round distances remain in yards internally so the model
   stays identical regardless of the player's display preference. */
(function(){
  const YD_TO_M = 0.9144;

  function profile(){
    try { return getHandicapProfile() || {}; } catch(e) { return {}; }
  }
  window.getDistanceUnit = function(){
    return profile().distanceUnit === 'meters' ? 'meters' : 'yards';
  };
  window.distanceUnitAbbr = function(){ return getDistanceUnit()==='meters' ? 'm' : 'yd'; };
  window.distanceUnitWord = function(){ return getDistanceUnit()==='meters' ? 'Metres' : 'Yards'; };
  window.displayDistanceFromYards = function(y){
    const n=Number(y); if(!Number.isFinite(n)) return '';
    return getDistanceUnit()==='meters' ? Math.round(n*YD_TO_M) : Math.round(n);
  };
  window.yardsFromDisplayDistance = function(v){
    const n=Number(v); if(!Number.isFinite(n)) return NaN;
    const y=getDistanceUnit()==='meters' ? n/YD_TO_M : n;
    return Math.round(y*10)/10;
  };

  function saveDistanceUnit(v, rerender=true){
    const p=profile();
    p.distanceUnit = v==='meters' ? 'meters' : 'yards';
    try { saveHandicapProfile(p); } catch(e) {}
    if(rerender){
      try { render(); } catch(e) {}
      try { renderResults(); } catch(e) {}
    }
  }
  window.setDistanceUnit = function(v){ saveDistanceUnit(v,true); };

  function ensureUnitControls(){
    const grid=document.querySelector('#entryPage .profile-grid');
    if(grid && !document.getElementById('distanceUnit')){
      const div=document.createElement('div');
      div.innerHTML='<label>Distance Units</label><select id="distanceUnit" onchange="setDistanceUnit(this.value)"><option value="yards">Yards</option><option value="meters">Metres</option></select>';
      grid.appendChild(div);
    }
    const unit=document.getElementById('distanceUnit');
    if(unit) unit.value=getDistanceUnit();

    const gateGrid=document.querySelector('#profileGate .profile-gate-grid');
    if(gateGrid && !document.getElementById('setupDistanceUnit')){
      const btn=gateGrid.querySelector('button');
      const div=document.createElement('div');
      div.innerHTML='<label>Distance Units</label><select id="setupDistanceUnit"><option value="yards">Yards</option><option value="meters">Metres</option></select>';
      gateGrid.insertBefore(div,btn || null);
    }
    const setup=document.getElementById('setupDistanceUnit');
    if(setup && !activePlayerName) setup.value='yards';

    const note=document.querySelector('#entryPage .card .note');
    if(note && !note.textContent.includes('Distance Units are saved separately')){
      note.textContent += ' Distance Units are saved separately for each player.';
    }
  }

  function fullShotLabel(s){
    if(!s) return '';
    if(s.autoPutting) return s.label || `${s.strokesUsed} putt${s.strokesUsed===1?'':'s'} from ${s.putt} (auto)`;
    if(s.penaltyMode==='strokeDistance') return '2 strokes — Stroke & Distance — reset to prior position';
    if(s.dest==='Green') return s.putt || '';
    if(s.dest==='Holed') return 'Holed';
    const zone=resolvePositionZone(s.dest,s.yards);
    let text=`${displayDistanceFromYards(s.yards)} ${distanceUnitAbbr()} left • ${s.lie||''}${zone==='Short Game' ? ' • Short Game position' : ''}`;
    if(s.jobPct!==undefined && s.jobPct!==null && s.category==='Driving' && s.dest==='Full Shot') text += ` • ${Number(s.jobPct).toFixed(1)}% advanced`;
    return text;
  }
  window.displayShotLabel = fullShotLabel;

  function applyEntryUnits(){
    const unit=distanceUnitAbbr();
    (round.holes||[]).forEach((h,hi)=>{
      const card=document.querySelectorAll('#holes > .card')[hi];
      if(!card) return;
      const holeInput=card.querySelector('.hole-title input[aria-label^="Hole"]');
      if(holeInput){
        holeInput.value=displayDistanceFromYards(h.yards);
        holeInput.setAttribute('aria-label',`Hole ${hi+1} distance`);
        let node=holeInput.nextSibling;
        if(node && node.nodeType===Node.TEXT_NODE) node.textContent=` ${unit}`;
      }
      const dest=document.getElementById(`dest${hi}`);
      if(dest && dest.options.length) dest.options[0].textContent=`${distanceUnitWord()} remaining`;
      const box=document.getElementById(`yardsBox${hi}`);
      if(box){
        const lab=box.querySelector('label'); if(lab) lab.textContent=`Distance remaining (${unit})`;
        const inp=document.getElementById(`yards${hi}`);
        if(inp) inp.placeholder=getDistanceUnit()==='meters' ? 'e.g. 165' : 'e.g. 180';
      }
      const rows=card.querySelectorAll(`#shots${hi} tbody tr`);
      (h.shots||[]).forEach((s,si)=>{ if(rows[si] && rows[si].cells[2]) rows[si].cells[2].textContent=fullShotLabel(s); });
    });
  }

  function applyCopy(){
    const quick=document.querySelector('header .sub');
    if(quick){
      quick.innerHTML=quick.innerHTML
        .replace('Short Game begins at 60 yards and in.','Short Game begins at 60 yards / 55 metres and in.')
        .replace('Hole yardage can be adjusted','Hole distance can be adjusted')
        .replace('small changes are only marginally important.','small changes are only marginally important. Your profile can display full-shot distances in yards or metres.');
    }
  }

  function applyMetricUI(){ ensureUnitControls(); applyEntryUnits(); applyCopy(); }

  const coreRender=window.render || render;
  render=function(){ const out=coreRender.apply(this,arguments); setTimeout(applyMetricUI,0); return out; };
  window.render=render;

  const coreSetHoleYards=window.setHoleYards || setHoleYards;
  setHoleYards=function(hi,v){ return coreSetHoleYards.call(this,hi,yardsFromDisplayDistance(v)); };
  window.setHoleYards=setHoleYards;

  const corePopulateEditForm=window.populateEditForm || populateEditForm;
  populateEditForm=function(hi,si){
    const out=corePopulateEditForm.apply(this,arguments);
    if(getDistanceUnit()==='meters'){
      const s=round.holes?.[hi]?.shots?.[si];
      const el=document.getElementById(`yards${hi}`);
      if(s && el && s.dest!=='Green' && s.dest!=='Holed') el.value=displayDistanceFromYards(s.yards);
    }
    return out;
  };
  window.populateEditForm=populateEditForm;

  const coreAddShot=window.addShot || addShot;
  addShot=function(hi){
    const dest=document.getElementById(`dest${hi}`)?.value;
    const pen=document.getElementById(`pen${hi}`)?.value;
    const el=document.getElementById(`yards${hi}`);
    if(getDistanceUnit()==='meters' && el && dest!=='Green' && dest!=='Holed' && pen!=='strokeDistance' && el.value!==''){
      el.value=String(yardsFromDisplayDistance(el.value));
    }
    return coreAddShot.apply(this,arguments);
  };
  window.addShot=addShot;

  const coreCompleteProfileSetup=window.completeProfileSetup || completeProfileSetup;
  completeProfileSetup=function(){
    const u=document.getElementById('setupDistanceUnit')?.value || 'yards';
    const before=String(activePlayerName||'');
    const out=coreCompleteProfileSetup.apply(this,arguments);
    if(String(activePlayerName||'') && (String(activePlayerName||'')!==before || !profile().distanceUnit)) saveDistanceUnit(u,true);
    return out;
  };
  window.completeProfileSetup=completeProfileSetup;

  const coreRenderHandicapProfileControls=window.renderHandicapProfileControls || renderHandicapProfileControls;
  renderHandicapProfileControls=function(){
    const out=coreRenderHandicapProfileControls.apply(this,arguments);
    const u=document.getElementById('distanceUnit'); if(u) u.value=getDistanceUnit();
    return out;
  };
  window.renderHandicapProfileControls=renderHandicapProfileControls;

  if(typeof openRoundDetail==='function'){
    const coreOpenRoundDetail=openRoundDetail;
    openRoundDetail=function(id){
      const out=coreOpenRoundDetail.apply(this,arguments);
      setTimeout(()=>{
        const r=getHistory().find(x=>x.id===id);
        if(!r?.sourceRound?.holes) return;
        const table=document.querySelector('#roundDetailContent table');
        if(!table) return;
        const th=table.querySelector('thead th:nth-child(3)'); if(th) th.textContent=distanceUnitAbbr();
        const rows=table.querySelectorAll('tbody tr');
        r.sourceRound.holes.forEach((h,i)=>{ if(rows[i]?.cells[2]) rows[i].cells[2].textContent=displayDistanceFromYards(h.yards); });
      },0);
      return out;
    };
    window.openRoundDetail=openRoundDetail;
  }

  if(typeof renderRoundStats==='function'){
    const coreRenderRoundStats=renderRoundStats;
    renderRoundStats=function(rec){
      let html=coreRenderRoundStats.apply(this,arguments);
      if(getDistanceUnit()==='meters'){
        const s=roundFunStats(rec);
        if(s){
          const longest=s.drives.length ? `${displayDistanceFromYards(s.drives[0])} m` : '—';
          const avg=s.avg5 ? `${displayDistanceFromYards(s.avg5)} m` : '—';
          html=html.replace(/<div class="metric">Longest Drive<b>.*?<\/b><span class="muted">Top-5 avg .*?<\/span><\/div>/,
            `<div class="metric">Longest Drive<b>${longest}</b><span class="muted">Top-5 avg ${avg}</span></div>`);
        }
      }
      return html;
    };
    window.renderRoundStats=renderRoundStats;
  }

  // Apply immediately because the core app renders once before this patch loads.
  applyMetricUI();
})();
