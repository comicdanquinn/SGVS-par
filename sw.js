const CACHE_NAME = "sg-vs-par-v2-8-1";
const PATCH_TAG = '<script src="./v2_8_1_patch.js"></script>';
const ASSETS = ["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./v2_8_1_patch.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

async function withPatch(response){
  const type=response.headers.get("content-type") || "";
  if(!type.includes("text/html")) return response;
  const text=await response.text();
  if(text.includes("v2_8_1_patch.js")) return new Response(text,{status:response.status,statusText:response.statusText,headers:response.headers});
  const patched=text.includes("</body>") ? text.replace("</body>", PATCH_TAG + "\n</body>") : text + PATCH_TAG;
  return new Response(patched,{status:response.status,statusText:response.statusText,headers:response.headers});
}

self.addEventListener("fetch", e => {
  if(e.request.method!=="GET") return;

  const url=new URL(e.request.url);
  const isPage=e.request.mode==="navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html");

  if(isPage){
    e.respondWith(
      fetch(e.request)
        .then(withPatch)
        .then(async r => {
          const copy=r.clone();
          const cache=await caches.open(CACHE_NAME);
          cache.put(e.request,copy);
          return r;
        })
        .catch(async ()=>{
          const cached=await caches.match(e.request) || await caches.match("./index.html");
          return cached ? withPatch(cached) : cached;
        })
    );
    return;
  }

  e.respondWith(
    fetch(e.request).then(r => {
      const copy=r.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));
      return r;
    }).catch(()=>caches.match(e.request))
  );
});
