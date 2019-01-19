// Stitch Kit service worker file

const cacheName    = 'stitchkit_v0.1'; // name of cache to use.
const oldCacheName = 'stitchkit_v0.0'; // name of cache from previous version of app. used to remove old cache.
const offlinePage  = './offline.html'; // page to load to show an offline status.

// attach listener to 'beforeinstallprompt' event
self.addEventListener('beforeinstallprompt', function(event) {
	event.userChoice.then(
		function(result) {
			console.log(result.outcome);
			if(result.outcome == 'dismissed') { /* prompt was dismissed */ }
			else { /* prompt was accepted */ }
		}
	);
});

// TODO: add images to cache in next version
// attach listener to 'install' event
self.addEventListener('install', function(event) {
	event.waitUntil(self.skipWaiting()); // trigger activate event to start immediately instead of waiting for a page reload
	event.waitUntil(
		caches.open(cacheName).then(
			cache => cache.addAll([ '/',
				'/about.html',
				'/cables.html',
				'/eyeofpartridge.html',
				'/index.html',
				'/kitchener.html',
				'/m1randm1l.html',
				'/wrapandturn.html',
				offlinePage ])
		)
	);
});

// attach listener to 'activate' event
self.addEventListener('activate', function(event) {
	event.waitUntil(self.clients.claim()); // claim all current clients to activate immediately instead of waiting for a page reload
	event.waitUntil(
		caches.keys().then(
			function(cacheNames) {
				return Promise.all(cacheNames.filter(
						function(cacheName) {
							// Return true to remove this cache
							if(cacheName === oldCacheName)
								return true;
							return false;
						}).map(function(cacheName) {
							return caches.delete(cacheName);
						})
				);
			}
		) 
	);
});

// attach listener to 'fetch' event
self.addEventListener('fetch', function(event) { 
	event.respondWith(
		// first, check if the requested document is in the cache
		caches.match(event.request).then( 
			function(response) {
				// if found in the cache, return it, else fetch from server
				if(response) return response;
				var requestForCache = event.request.clone() 
				return fetch(requestForCache).then(
					function(response) {
						if(!response || response.status !== 200) return reponse;
						var responseForCache = response.clone();
						// cache the fetched result
						caches.open(cacheName).then(
							function(cache) {
								cache.put(requestForCache, responseForCache);
							}
						);
						return response;
					}
				).catch(error => {
					// If fetch fails and trying to navigate to an html page, return offline page
					if (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))
						return caches.match(offline);
				});
			}
		)
	);
});

