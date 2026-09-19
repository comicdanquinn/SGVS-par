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


  // Fairmont Chateau Whistler Golf Club — Fairmont scorecard.
  courseDefs["Fairmont Chateau Whistler Golf Club"]={
    pars:[5,4,4,4,3,4,5,3,5,3,4,4,4,4,4,3,4,5],
    tees:{
      "Gold":[505,326,399,411,190,457,538,212,472,131,355,395,349,352,389,167,445,543],
      "Blue":[482,298,387,402,163,436,507,184,449,118,332,376,324,330,366,142,424,523],
      "Fairmont":[482,298,342,362,144,411,507,158,449,118,332,343,324,330,351,142,366,523],
      "White":[449,266,342,362,144,411,484,158,426,92,301,343,304,285,351,110,366,498],
      "Red":[415,242,313,311,108,393,454,123,504,75,287,307,259,249,324,88,337,467]
    },defaultTee:"Blue",labels:{"Gold":"Gold","Blue":"Blue","Fairmont":"Fairmont","White":"White","Red":"Red"}
  };
  TEE_HANDICAP_RATINGS["Fairmont Chateau Whistler Golf Club"]={
    "Gold":{rating:71.5,slope:145},"Blue":{rating:69.6,slope:131},
    "Fairmont":{rating:68.4,slope:127},"White":{rating:67.5,slope:119},"Red":{rating:69.8,slope:126}
  };

  // Blue Ocean Golf Club — club confirms current 18-hole par 72 and 5,351–6,553 yard range;
  // hole-by-hole card reconciled to those published totals.
  courseDefs["Blue Ocean Golf Club"]={
    pars:[4,3,4,4,5,3,4,5,4,4,4,5,3,5,4,4,3,4],
    tees:{
      "Blue":[364,177,376,439,453,196,388,494,362,345,411,488,179,474,361,416,227,403],
      "White":[338,139,345,416,436,178,351,457,339,318,371,465,145,450,345,392,199,374],
      "Red":[302,118,324,376,400,149,317,421,303,280,321,424,124,418,314,362,160,343],
      "Gold":[302,99,324,376,400,132,317,421,303,280,321,384,95,418,314,362,160,343]
    },defaultTee:"Blue",labels:{"Blue":"Blue","White":"White","Red":"Red","Gold":"Gold"}
  };
  TEE_HANDICAP_RATINGS["Blue Ocean Golf Club"]={
    "Blue":{rating:71.6,slope:126},"White":{rating:69.0,slope:122},
    "Red":{rating:65.8,slope:115},"Gold":{rating:70.3,slope:114}
  };

  // Sunshine Coast Golf & Country Club — official club confirms four tees, par 72, 4,669–6,357 yards.
  courseDefs["Sunshine Coast Golf & Country Club"]={
    pars:[5,4,3,5,4,4,4,5,3,4,5,4,4,4,3,4,3,4],
    tees:{
      "Blue":[510,292,212,502,340,322,417,489,196,415,533,364,378,407,183,309,126,362],
      "White":[490,272,188,474,312,301,388,462,170,315,500,357,370,381,171,309,126,352],
      "Red":[440,262,167,416,292,258,314,448,155,293,457,344,370,354,157,299,100,352],
      "Gold":[440,152,106,363,267,222,314,357,114,90,423,332,359,354,157,299,100,294]
    },defaultTee:"White",labels:{"Blue":"Blue","White":"White","Red":"Red","Gold":"Gold"}
  };
  TEE_HANDICAP_RATINGS["Sunshine Coast Golf & Country Club"]={
    "Blue":{rating:70.3,slope:131},"White":{rating:68.6,slope:124},
    "Red":{rating:66.3,slope:116},"Gold":{rating:64.5,slope:111}
  };

  // Myrtle Point Golf Club — current official hole-by-hole card.
  courseDefs["Myrtle Point Golf Club"]={
    pars:[5,4,4,3,4,3,4,4,5,4,4,5,3,4,5,4,3,4],
    tees:{
      "Black":[526,433,375,193,420,170,402,403,523,439,362,493,208,405,538,390,198,425],
      "Blue":[499,419,341,172,394,143,376,382,482,423,341,467,187,382,509,345,173,408],
      "White":[475,391,323,149,371,121,351,356,447,391,297,440,160,353,486,311,136,392],
      "Red":[396,374,284,124,352,100,326,334,427,364,271,410,130,322,482,290,113,327]
    },defaultTee:"Blue",labels:{"Black":"Black","Blue":"Blue","White":"White","Red":"Red"}
  };
  // Ratings intentionally omitted here until the club's current rating card is reconciled
  // with the current official Black tee total (6,903 yards).


  // Squamish Valley Golf Club — official 2026 scorecard and BC Golf Association handicap tables.
  courseDefs["Squamish Valley Golf Club"]={
    pars:[5,4,4,4,3,5,4,3,4,4,3,5,4,4,4,3,5,4],
    tees:{
      "Black":[539,371,318,440,199,472,343,185,402,365,190,483,449,332,368,140,508,417],
      "Blue":[520,352,286,421,168,472,324,177,379,365,190,470,395,321,343,140,494,400],
      "Gold":[485,352,286,356,153,420,310,166,379,365,165,470,364,321,343,140,478,355],
      "White":[485,310,260,356,153,420,310,166,337,351,165,409,364,273,335,116,437,355],
      "Green":[431,310,260,356,153,420,238,143,337,351,122,409,338,273,355,116,422,345],
      "Red":[431,271,243,326,122,410,238,143,296,336,122,340,283,273,268,97,380,318]
    },defaultTee:"Blue",labels:{"Black":"Black","Blue":"Blue","Gold":"Gold","White":"White","Green":"Green","Red":"Red"}
  };
  TEE_HANDICAP_RATINGS["Squamish Valley Golf Club"]={
    "Black":{rating:71.5,slope:125},"Blue":{rating:70.0,slope:122},
    "Gold":{rating:68.5,slope:122},"White":{rating:66.8,slope:118},
    "Green":{rating:65.7,slope:113},"Red":{rating:63.1,slope:104}
  };

  // Furry Creek Golf & Country Club — current 18-hole layout; tee ratings cross-checked
  // against the club's published rating/slope material and current booking data.
  courseDefs["Furry Creek Golf & Country Club"]={
    pars:[4,3,5,5,3,5,3,3,4,3,5,4,4,3,5,3,5,4],
    tees:{
      "Gold":[352,152,485,575,107,441,238,197,325,174,485,374,458,211,512,167,471,336],
      "White":[326,129,459,524,97,425,200,167,285,122,460,326,432,184,466,140,430,295],
      "Red":[291,104,431,421,91,350,185,150,244,97,413,301,325,141,415,117,419,254]
    },defaultTee:"Gold",labels:{"Gold":"Gold","White":"White","Red":"Red"}
  };
  TEE_HANDICAP_RATINGS["Furry Creek Golf & Country Club"]={
    "Gold":{rating:70.0,slope:125},"White":{rating:67.3,slope:116},"Red":{rating:63.8,slope:111}
  };

  const REGION_MAP={
    "Big Sky Golf Club":"Sea-to-Sky / Sunshine Coast",
    "Nicklaus North Golf Course":"Sea-to-Sky / Sunshine Coast",
    "Fairmont Chateau Whistler Golf Club":"Sea-to-Sky / Sunshine Coast",
    "Blue Ocean Golf Club":"Sea-to-Sky / Sunshine Coast",
    "Sunshine Coast Golf & Country Club":"Sea-to-Sky / Sunshine Coast",
    "Myrtle Point Golf Club":"Sea-to-Sky / Sunshine Coast",
    "Squamish Valley Golf Club":"Sea-to-Sky / Sunshine Coast",
    "Furry Creek Golf & Country Club":"Sea-to-Sky / Sunshine Coast",
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