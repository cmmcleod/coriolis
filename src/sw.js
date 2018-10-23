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

  try {
    workbox.googleAnalytics.initialize();
  } catch (e) {
    console.log('Probably an ad-blocker');
  }
} else {
  console.log('Boo! Workbox didn\'t load 😬');
}

self.addEventListener('message', event => {
  if (!event.data) {
    return;
  }

  switch (event.data) {
    case 'skipWaiting':
      self.skipWaiting();
      break;
    default:
      // NOOP
      break;
  }
});
const OFFLINE_URL = '/';
self.addEventListener('fetch', function(event) {
  console.log('Handling fetch event for', event.request.url);

  event.respondWith(
    caches.match(event.request).then(function(response) {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then(function(response) {
          return response;
        })
        .catch(function(error) {
          return caches.match(OFFLINE_URL);
        });
    })
  );
});
