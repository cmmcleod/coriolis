console.log('Hello from sw.js');

if (workbox) {
  console.log('Yay! Workbox is loaded 🎉');
  workbox.precaching.precacheAndRoute(self.__precacheManifest);

  workbox.routing.registerNavigationRoute('/index.html');

  workbox.routing.registerRoute(
    new RegExp('/(.*?)'),
    workbox.strategies.staleWhileRevalidate()
  );

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
