console.log('Hello from sw.js');

if (workbox) {
  console.log('Yay! Workbox is loaded 🎉');
  workbox.routing.registerRoute(
    new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
    workbox.strategies.cacheFirst({
      cacheName: 'google-fonts',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 30
        }),
        new workbox.cacheableResponse.Plugin({
          statuses: [0, 200]
        })
      ]
    })
  );
  workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg)$/,
    workbox.strategies.cacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
        })
      ]
    })
  );
  workbox.routing.registerRoute(
    /\.(?:js|css)$/,
    workbox.strategies.staleWhileRevalidate({
      cacheName: 'static-resources'
    })
  );
  try {
    workbox.googleAnalytics.initialize();
  } catch (e) {
    console.log('Probably an ad-blocker');
  }
} else {
  console.log('Boo! Workbox didn\'t load 😬');
}
(async() => {
  if (event.request.mode === 'navigate' && registration.waiting) {
    if ((await clients.matchAll()).length < 2) {
      registration.waiting.postMessage('skipWaiting');
    }
  }
})();

addEventListener('message', messageEvent => {
  if (messageEvent.data === 'skipWaiting') return skipWaiting();
});

addEventListener('fetch', event => {
  event.respondWith(
    (async() => {
      if (
        event.request.mode === 'navigate' &&
        event.request.method === 'GET' &&
        registration.waiting &&
        (await clients.matchAll()).length < 2
      ) {
        registration.waiting.postMessage('skipWaiting');
        return new Response('', { headers: { Refresh: '0' } });
      }
      return (await caches.match(event.request)) || fetch(event.request);
    })()
  );
});
