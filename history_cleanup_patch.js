/* SG vs Par v6.3.11 — safe player/history isolation cleanup.
   Removes hard-coded seeded calibration rounds from player history, prevents
   legacy shared data from being copied into every new profile, and preserves
   each player's real saved rounds/profile data. Scoring is untouched. */
(function(){
  const SEEDED_IDS = new Set([
    'legacy_hazelmere_blue',
    'legacy_morgan_creek_blue',
    'legacy_fraserview_aug30'
  ]);
  const LEGACY_OWNER_CLAIM_KEY = 'sg_vs_par_legacy_owner_claim_v1';

  function cleanSeeded(arr){
    return (Array.isArray(arr) ? arr : []).filter(r => !r || !SEEDED_IDS.has(String(r.id||'')));
  }

  // Disable automatic seed injection for all current and future players.
  ensureSeedHistory = function(arr){ return cleanSeeded(arr).slice(); };
  window.ensureSeedHistory = ensureSeedHistory;

  // Remove only known hard-coded seed records from already-created player histories.
  // Real player rounds are left untouched.
  function sanitizeAllPlayerHistories(){
    const names = (typeof getPlayerList==='function' ? getPlayerList() : []) || [];
    const slugs = new Set(names.map(n => playerSlug(n)));
    if(String(activePlayerName||'').trim()) slugs.add(playerSlug(activePlayerName));
    slugs.forEach(slug => {
      const key = 'sg_vs_par_history_' + slug;
      const raw = localStorage.getItem(key);
      if(!raw) return;
      try{
        const before = JSON.parse(raw);
        const after = cleanSeeded(before);
        if(Array.isArray(before) && after.length !== before.length){
          localStorage.setItem(key, JSON.stringify(after));
        }
      }catch(e){}
    });
  }

  // Legacy pre-profile data may belong to one golfer only. Once a profile claims it,
  // other profiles on the device can never inherit that shared data.
  migrateLegacyToPlayer = function(){
    if(!String(activePlayerName||'').trim()) return;
    const ownerSlug = playerSlug(activePlayerName);
    let claimed = localStorage.getItem(LEGACY_OWNER_CLAIM_KEY) || '';

    const legacyRoundKeys = (typeof LEGACY_STORAGE_KEYS!=='undefined' && Array.isArray(LEGACY_STORAGE_KEYS))
      ? LEGACY_STORAGE_KEYS : [];
    const hasLegacyRound = legacyRoundKeys.some(k => !!localStorage.getItem(k));
    const hasLegacyHistory = !!localStorage.getItem(LEGACY_HISTORY_KEY);
    const hasLegacyProfile = !!localStorage.getItem(LEGACY_PROFILE_KEY);
    const hasLegacy = hasLegacyRound || hasLegacyHistory || hasLegacyProfile;

    if(!hasLegacy) return;
    if(claimed && claimed !== ownerSlug) return;
    if(!claimed){
      claimed = ownerSlug;
      localStorage.setItem(LEGACY_OWNER_CLAIM_KEY, ownerSlug);
    }

    const sk=playerStorageKey(), hk=playerHistoryKey(), pk=playerProfileKey();

    let legacyRound=null;
    for(const key of legacyRoundKeys){
      const raw=localStorage.getItem(key);
      if(!raw) continue;
      try{ legacyRound=JSON.parse(raw); break; }catch(e){}
    }
    if(legacyRound){
      let current=null;
      try{ current=JSON.parse(localStorage.getItem(sk)||'null'); }catch(e){}
      const completed=r=>r&&Array.isArray(r.holes)?r.holes.filter(h=>Number(h.score)>0).length:0;
      const dateVal=r=>{ const t=Date.parse((r&&r.date)||''); return Number.isFinite(t)?t:0; };
      const legacyNewer=!current || dateVal(legacyRound)>dateVal(current) ||
        (dateVal(legacyRound)===dateVal(current) && completed(legacyRound)>completed(current));
      if(legacyNewer) localStorage.setItem(sk,JSON.stringify(legacyRound));
    }

    const legacyHistRaw=localStorage.getItem(LEGACY_HISTORY_KEY);
    if(legacyHistRaw){
      try{
        const legacy=cleanSeeded(JSON.parse(legacyHistRaw)||[]);
        const existing=cleanSeeded(JSON.parse(localStorage.getItem(hk)||'[]')||[]);
        const ids=new Set(existing.map(r=>r&&String(r.id||r.historyId||'')));
        for(const r of legacy){
          const id=String((r&&(r.id||r.historyId))||'');
          if(id && ids.has(id)) continue;
          existing.push(r);
          if(id) ids.add(id);
        }
        localStorage.setItem(hk,JSON.stringify(existing));
      }catch(e){}
    }
    if(!localStorage.getItem(pk) && localStorage.getItem(LEGACY_PROFILE_KEY)){
      localStorage.setItem(pk,localStorage.getItem(LEGACY_PROFILE_KEY));
    }
  };
  window.migrateLegacyToPlayer = migrateLegacyToPlayer;

  // Use a non-seeding history reader from this point forward.
  getHistory = function(){
    try{
      const raw=localStorage.getItem(playerHistoryKey());
      let arr=raw ? JSON.parse(raw) : [];
      arr=cleanSeeded(Array.isArray(arr) ? arr : []);
      arr=arr.map(applyKnownHandicapRating).map(refreshHistorySnapshotFromSource);
      localStorage.setItem(playerHistoryKey(), JSON.stringify(arr));
      return arr;
    }catch(e){
      try{ localStorage.setItem(playerHistoryKey(), '[]'); }catch(_){}
      return [];
    }
  };
  window.getHistory = getHistory;

  sanitizeAllPlayerHistories();
  try{ renderResults(); }catch(e){}
})();
