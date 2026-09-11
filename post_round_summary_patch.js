/* SG vs Par v6.3.12 — post-round summary popup */
(function(){
  function signed(n){
    const v=Number(n)||0;
    return (v>0?'+':'')+v.toFixed(1);
  }
  function scoreToPar(n){
    const v=Number(n)||0;
    if(Math.abs(v)<0.05) return 'E';
    return (v>0?'+':'')+String(Math.round(v*10)/10).replace('.0','');
  }
  function ensureModal(){
    if(document.getElementById('postRoundSummaryOverlay')) return;
    const style=document.createElement('style');
    style.textContent=`
      #postRoundSummaryOverlay{position:fixed;inset:0;background:rgba(0,0,0,.48);display:none;align-items:center;justify-content:center;padding:18px;z-index:6000}
      #postRoundSummaryOverlay.open{display:flex}
      .prs-card{width:min(100%,560px);background:#fff;border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.3);padding:22px}
      .prs-card h2{margin:0 0 4px;font-size:24px}
      .prs-sub{color:#666;font-size:13px;margin-bottom:16px}
      .prs-score{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px}
      .prs-score-box{flex:1 1 150px;background:#f7f8f7;border:1px solid #e0e4e1;border-radius:10px;padding:12px}
      .prs-score-box span{display:block;color:#666;font-size:12px;margin-bottom:4px}
      .prs-score-box b{font-size:24px}
      .prs-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0 16px}
      .prs-stat{border:1px solid #e1e4e2;border-radius:10px;padding:13px;background:#fff}
      .prs-stat span{display:block;font-size:12px;color:#666;margin-bottom:5px}
      .prs-stat b{font-size:22px}
      .prs-note{font-size:13px;color:#666;line-height:1.4;margin:10px 0 16px;text-align:center}
      .prs-actions{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}
      @media(max-width:560px){.prs-grid{grid-template-columns:1fr 1fr}.prs-card{padding:18px}.prs-actions button{flex:1 1 160px}}
    `;
    document.head.appendChild(style);
    const overlay=document.createElement('div');
    overlay.id='postRoundSummaryOverlay';
    overlay.innerHTML=`<div class="prs-card" role="dialog" aria-modal="true" aria-labelledby="prsTitle">
      <h2 id="prsTitle">Round Summary</h2>
      <div class="prs-sub" id="prsCourse"></div>
      <div class="prs-score">
        <div class="prs-score-box"><span>Score</span><b id="prsScore">—</b></div>
        <div class="prs-score-box"><span>To Par</span><b id="prsToPar">—</b></div>
        <div class="prs-score-box"><span>Total SG vs Par</span><b id="prsTotal">—</b></div>
      </div>
      <div class="prs-grid">
        <div class="prs-stat"><span>Driving</span><b id="prsDriving">—</b></div>
        <div class="prs-stat"><span>Approach</span><b id="prsApproach">—</b></div>
        <div class="prs-stat"><span>Short Game</span><b id="prsShort">—</b></div>
        <div class="prs-stat"><span>Putting</span><b id="prsPutting">—</b></div>
      </div>
      <div class="prs-note">For more detailed stats, trends and hole-by-hole analysis, go to the Results page.</div>
      <div class="prs-actions">
        <button onclick="closePostRoundSummary()">Close</button>
        <button class="primary" onclick="viewDetailedResults()">View Detailed Results</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
  }
  window.closePostRoundSummary=function(){
    const el=document.getElementById('postRoundSummaryOverlay');
    if(el) el.classList.remove('open');
  };
  window.viewDetailedResults=function(){
    closePostRoundSummary();
    if(typeof showPage==='function') showPage('results');
  };
  window.showPostRoundSummary=function(){
    ensureModal();
    const snap=typeof roundSnapshot==='function' ? roundSnapshot(round) : null;
    if(!snap) return;
    const course=[snap.course,snap.tees].filter(Boolean).join(' • ');
    document.getElementById('prsCourse').textContent=course;
    document.getElementById('prsScore').textContent=String(snap.score||0);
    document.getElementById('prsToPar').textContent=scoreToPar(snap.overPar);
    document.getElementById('prsTotal').textContent=signed(snap.totalSG);
    document.getElementById('prsDriving').textContent=signed(snap.Driving);
    document.getElementById('prsApproach').textContent=signed(snap.Approach);
    document.getElementById('prsShort').textContent=signed(snap['Short Game']);
    document.getElementById('prsPutting').textContent=signed(snap.Putting);
    document.getElementById('postRoundSummaryOverlay').classList.add('open');
  };

  const coreFinishRound=window.finishRound || finishRound;
  finishRound=function(){
    const completed=round?.holes?.filter(h=>h.score).length || 0;
    if(completed!==18) return coreFinishRound.apply(this,arguments);
    const originalShowPage=window.showPage;
    window.showPage=function(which){ if(which==='results') return; return originalShowPage.apply(this,arguments); };
    try { coreFinishRound.apply(this,arguments); }
    finally { window.showPage=originalShowPage; }
    setTimeout(showPostRoundSummary,0);
  };
  window.finishRound=finishRound;
})();
