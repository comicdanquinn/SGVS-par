/* SG vs Par v6.3.13 — fairway stats compatibility fix.
   Current shot entry uses "Fairway / Good Lie" while the legacy stats
   calculator only recognized older fairway labels. Recompute fairways from
   the first non-putting shot on par 4s and par 5s using all supported labels.
   Scoring is untouched. */
(function(){
  if(typeof roundFunStats !== 'function') return;
  const baseRoundFunStats = roundFunStats;
  const FAIRWAY_LABELS = new Set([
    'Fairway / Good Lie',
    'Fairway / First Cut',
    'Fairway / Fringe',
    'Fairway'
  ]);

  roundFunStats = function(rec){
    const s = baseRoundFunStats(rec);
    if(!s) return s;
    const r = rec && rec.sourceRound;
    if(!r || !Array.isArray(r.holes)) return s;

    let fw = 0, fwN = 0;
    r.holes.forEach(h => {
      const par = Number(h.par);
      if(par !== 4 && par !== 5) return;
      const tee = (h.shots || []).find(x => !x.autoPutting);
      if(!tee) return;
      fwN++;
      if(FAIRWAY_LABELS.has(String(tee.lie || ''))) fw++;
    });

    s.fw = fw;
    s.fwN = fwN;
    return s;
  };
  window.roundFunStats = roundFunStats;
})();
