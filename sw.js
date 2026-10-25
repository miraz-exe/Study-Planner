/* Study Planner service worker: offline support.
   Code ba file bodlale CACHE er version number barie din (v1 -> v2). */
var CACHE='study-planner-v1';
var CORE=['./','./index.html','./manifest.json','./favicon.png','./apple-touch-icon.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE)}).then(function(){return self.skipWaiting()}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var url=new URL(req.url);

  /* Google Fonts: cache-first, offline e ekbar load howa font cholbe */
  if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.match(req).then(function(hit){
      if(hit)return hit;
      return fetch(req).then(function(res){
        var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy)});return res;
      }).catch(function(){return new Response('',{status:504})});
    }));
    return;
  }

  if(url.origin!==location.origin)return;

  /* Page: online thakle notun version, offline hole cache theke */
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(res){
      var copy=res.clone();caches.open(CACHE).then(function(c){c.put('./index.html',copy)});return res;
    }).catch(function(){
      return caches.match('./index.html').then(function(r){return r||caches.match('./')});
    }));
    return;
  }

  /* Baki file: cache theke dekhao, pichone update koro */
  e.respondWith(caches.match(req).then(function(hit){
    var net=fetch(req).then(function(res){
      if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy)})}
      return res;
    }).catch(function(){return hit});
    return hit||net;
  }));
});
