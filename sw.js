const CACHE_NAME = 'houseplant-care-v41'; 
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE_NAME)));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))));
self.addEventListener('fetch', (e) => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
