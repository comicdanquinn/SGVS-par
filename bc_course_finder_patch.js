/* SG vs Par v6.3.17 — BC regional course finder + verified Sea-to-Sky additions.
   Course distances remain canonical yards; metric_patch.js handles display/input conversion. */
(function(){
  if(typeof courseDefs==='undefined' || typeof TEE_HANDICAP_RATINGS==='undefined') return;

  // Big Sky Golf Club — official Jan 2026 scorecard / course tour.
  const bigSkyPars=[4,4,3,5,3,4,4,4,5,4,3,4,5,4,4,4,3,5];
  courseDefs["Big Sky Golf Club"]={
    pars:bigSkyPars,
    tees:{
      "Black":[450,413,194,600,161,349,380,393,536,453,161,434,520,454,336,405,216,546],
      "Blue":[424,376,177,520,140,330,356,360,518,418,155,417,504,408,321,378,189,505],
      "White":[389,353,158,480,128,307,331,331,485,389,142,382,474,376,306,354,173,479],
      "Red":[337,308,143,448,105,270,287,298,420,338,104,325,402,318,257,286,157,405]
    },
    defaultTee:"Blue",
    labels:{"Black":"Black","Blue":"Blue","White":"White","Red":"Red"}
  };
  TEE_HANDICAP_RATINGS["Big Sky Golf Club"]={
    "Black":{rating:73.8,slope:130},
    "Blue":{rating:71.0,slope:127},
    "White":{rating:69.0,slope:121},
    "Red":{rating:64.9,slope:108}
  };

  // Nicklaus North — official current scorecard.
  const nnPars=[4,3,5,4,4,3,4,5,4,3,5,3,5,4,4,4,3,4];
  courseDefs["Nicklaus North Golf Course"]={
    pars:nnPars,
    tees:{
      "Gold":[390,197,518,465,416,179,366,514,429,185,555,225,564,432,437,425,226,438],
      "Blue":[355,170,498,432,391,153,333,503,340,160,537,200,529,403,407,385,213,404],
      "White":[344,160,469,408,373,133,306,482,321,137,512,168,515,380,384,356,188,368],
      "Green":[310,132,459,370,333,111,274,470,296,116,501,151,470,340,348,323,163,322],
      "Red":[267,105,392,326,290,90,234,397,262,105,429,128,410,335,312,281,135,266]
    },
    defaultTee:"Blue",
    labels:{"Gold":"Gold","Blue":"Blue","White":"White","Green":"Green","Red":"Red"}
  };
  // Current official men's ratings/slopes shown on scorecard.
  TEE_HANDICAP_RATINGS["Nicklaus North Golf Course"]={
    "Gold":{rating:73.0,slope:138},
    "Blue":{rating:71.3,slope:136},
    "White":{rating:70.3,slope:130},
    "Green":{rating:68.3,slope:126},
    "Red":{rating:67.1,slope:116}
  };

  const REGION_MAP={
    "Big Sky Golf Club":"Sea-to-Sky / Sunshine Coast",
    "Nicklaus North Golf Course":"Sea-to-Sky / Sunshine Coast",
    "Swaneset Bay — Resort Course":"Lower Mainland / Fraser Valley",
    "Swaneset Bay — Links Course":"Lower Mainland / Fraser Valley",
    "Burnaby Mountain Golf Course":"Lower Mainland / Fraser Valley",
    "Fraserview Golf Course":"Lower Mainland / Fraser Valley",
    "Hazelmere Golf Course":"Lower Mainland / Fraser Valley",
    "Kings Links":"Lower Mainland / Fraser Valley",
    "Langara Golf Course":"Lower Mainland / Fraser Valley",
    "Mayfair Lakes Golf & Country Club":"Lower Mainland / Fraser Valley",
    "McCleery Golf Course":"Lower Mainland / Fraser Valley",
    "Meadow Gardens Golf Club":"Lower Mainland / Fraser Valley",
    "Morgan Creek Golf Course":"Lower Mainland / Fraser Valley",
    "Northlands Golf Course":"Lower Mainland / Fraser Valley",
    "Northview Canal Course":"Lower Mainland / Fraser Valley",
    "Northview Ridge Course":"Lower Mainland / Fraser Valley",
    "Peace Portal Golf Course":"Lower Mainland / Fraser Valley",
    "Redwoods Golf Course":"Lower Mainland / Fraser Valley",
    "Riverway Golf Course":"Lower Mainland / Fraser Valley",
    "Surrey Golf Club — Main Course":"Lower Mainland / Fraser Valley",
    "University Golf Club":"Lower Mainland / Fraser Valley"
  };
  window.SG_BC_REGIONS=["Vancouver Island","Lower Mainland / Fraser Valley","Sea-to-Sky / Sunshine Coast","Okanagan","Thompson / Kamloops","Shuswap / Revelstoke","Kootenays","Cariboo / Chilcotin","Northern BC","Northeast BC"];

  function addCourseOptions(){
    const courseEl=document.getElementById('course'); if(!courseEl) return;
    Object.keys(courseDefs).sort((a,b)=>a.localeCompare(b)).forEach(name=>{
      if(!Array.from(courseEl.options).some(o=>o.value===name)){
        const o=document.createElement('option'); o.value=name; o.textContent=name; courseEl.appendChild(o);
      }
    });
  }

  function installFinder(){
    const courseEl=document.getElementById('course'); if(!courseEl || document.getElementById('sgCourseFinder')) return;
    const box=document.createElement('div'); box.id='sgCourseFinder'; box.className='sg-course-finder';
    box.innerHTML='<div class="sg-find-title">Find a Course</div><input id="sgCourseSearch" type="search" placeholder="Search for a course…" autocomplete="off"><div class="sg-find-or">or browse by region</div><div class="sg-find-grid"><select id="sgCountry"><option>Canada</option></select><select id="sgProvince"><option>British Columbia</option></select><select id="sgRegion"><option value="">All BC regions</option></select></div><div id="sgSearchResults" class="sg-search-results"></div>';
    courseEl.parentNode.insertBefore(box,courseEl);
    const region=document.getElementById('sgRegion');
    window.SG_BC_REGIONS.forEach(r=>{const o=document.createElement('option');o.value=r;o.textContent=r;region.appendChild(o);});
    const search=document.getElementById('sgCourseSearch'), results=document.getElementById('sgSearchResults');

    function filtered(){
      const q=(search.value||'').trim().toLowerCase(), rg=region.value;
      return Object.keys(courseDefs).filter(n=>(!q||n.toLowerCase().includes(q))&&(!rg||REGION_MAP[n]===rg)).sort((a,b)=>a.localeCompare(b));
    }
    function refresh(){
      const names=filtered();
      Array.from(courseEl.options).forEach(o=>{if(o.value)o.hidden=!names.includes(o.value);});
      results.innerHTML='';
      if(search.value.trim()){
        names.slice(0,8).forEach(n=>{
          const b=document.createElement('button');b.type='button';b.className='sg-course-result';
          b.innerHTML='<strong>'+n.replace(/</g,'&lt;')+'</strong><small>'+(REGION_MAP[n]||'British Columbia')+'</small>';
          b.onclick=()=>{courseEl.value=n;courseEl.dispatchEvent(new Event('change',{bubbles:true}));search.value='';results.innerHTML='';};
          results.appendChild(b);
        });
      }
    }
    search.addEventListener('input',refresh); region.addEventListener('change',refresh);
  }

  const css=document.createElement('style');
  css.textContent='.sg-course-finder{margin:10px 0 14px;padding:12px;border:1px solid #d8e1dc;border-radius:12px;background:#f8fbf9}.sg-find-title{font-weight:700;margin-bottom:8px}.sg-find-or{text-align:center;font-size:.85rem;opacity:.7;margin:8px 0}.sg-find-grid{display:grid;grid-template-columns:1fr 1fr 1.3fr;gap:8px}.sg-course-finder input,.sg-course-finder select{width:100%;max-width:100%;box-sizing:border-box}.sg-search-results{display:grid;gap:6px;margin-top:8px}.sg-course-result{text-align:left;padding:9px 10px}.sg-course-result small{display:block;font-weight:400;opacity:.7;margin-top:2px}@media(max-width:700px){.sg-find-grid{grid-template-columns:1fr}.sg-course-finder{padding:10px}}';
  document.head.appendChild(css);
  addCourseOptions(); installFinder();
})();