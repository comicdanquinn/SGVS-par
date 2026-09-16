/* SG vs Par v6.3.16 — Swaneset Bay Resort & Country Club course library.
   Canonical course distances are stored in yards. Existing metric support converts
   course/hole/full-shot distances to metres for players whose profile uses metres. */
(function(){
  if(typeof courseDefs==='undefined' || typeof TEE_HANDICAP_RATINGS==='undefined') return;

  const resortPars=[5,4,3,4,5,4,4,3,4,5,4,4,3,5,4,3,4,4];
  const resortTees={
    "Championship":[611,441,188,398,524,389,417,203,412,535,388,406,182,551,417,171,379,388],
    "Championship/Regular":[574,408,188,398,492,389,371,164,412,535,363,389,182,512,370,171,354,388],
    "Regular":[574,408,153,367,492,339,371,164,374,479,363,389,149,512,370,138,354,347],
    "Red":[496,358,128,330,457,296,340,119,323,465,305,339,108,466,333,115,339,307]
  };

  const linksPars=[4,5,4,4,3,5,4,3,4,5,4,3,4,4,5,4,3,4];
  const linksTees={
    "Black":[409,592,367,400,178,589,363,240,443,614,382,218,368,439,497,376,194,457],
    "Blue":[378,558,340,372,160,557,338,213,406,594,366,182,344,410,472,344,174,438],
    "White":[372,515,336,366,155,488,334,186,366,575,359,172,339,383,467,338,167,402],
    "White/Red":[342,511,336,285,155,488,334,140,366,531,302,138,306,383,467,299,167,375],
    "Red":[342,511,300,285,138,483,305,140,361,531,302,138,306,378,447,299,135,375],
    "Yellow":[316,478,300,285,112,456,238,140,334,490,237,138,259,323,410,299,135,339]
  };

  courseDefs["Swaneset Bay — Resort Course"]={
    pars:resortPars, tees:resortTees, defaultTee:"Regular",
    labels:{
      "Championship":"Championship — 7,000 yd",
      "Championship/Regular":"Championship/Regular — 6,660 yd",
      "Regular":"Regular — 6,343 yd",
      "Red":"Red — 5,624 yd"
    }
  };
  courseDefs["Swaneset Bay — Links Course"]={
    pars:linksPars, tees:linksTees, defaultTee:"White",
    labels:{
      "Black":"Black — 7,126 yd",
      "Blue":"Blue — 6,646 yd",
      "White":"White — 6,320 yd",
      "White/Red":"White/Red — 5,925 yd",
      "Red":"Red — 5,776 yd",
      "Yellow":"Yellow — 5,289 yd"
    }
  };

  TEE_HANDICAP_RATINGS["Swaneset Bay — Resort Course"]={
    "Championship":{rating:73.6,slope:137},
    "Championship/Regular":{rating:72.1,slope:135},
    "Regular":{rating:70.6,slope:130},
    "Red":{rating:67.1,slope:118}
  };
  TEE_HANDICAP_RATINGS["Swaneset Bay — Links Course"]={
    "Black":{rating:74.4,slope:137},
    "Blue":{rating:72.2,slope:131},
    "White":{rating:70.4,slope:129},
    "White/Red":{rating:68.5,slope:127},
    "Red":{rating:67.7,slope:123},
    "Yellow":{rating:66.3,slope:114}
  };

  const courseEl=document.getElementById('course');
  if(courseEl){
    const names=["Swaneset Bay — Links Course","Swaneset Bay — Resort Course"];
    names.forEach(name=>{
      if(!Array.from(courseEl.options).some(o=>o.value===name)){
        const opt=document.createElement('option');
        opt.value=name; opt.textContent=name;
        courseEl.appendChild(opt);
      }
    });
    const sorted=Array.from(courseEl.options).sort((a,b)=>a.text.localeCompare(b.text));
    sorted.forEach(o=>courseEl.appendChild(o));
  }
})();
