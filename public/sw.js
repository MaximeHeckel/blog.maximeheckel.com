/** This removes the service worker installed by gatsby-plugin-offline */
// eslint-disable-next-line no-console
console.log('Removing any service worker registered')

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  // eslint-disable-next-line no-console
  self.registration.unregister()
    .then(function() {
      return self.clients.matchAll();
    })
    .then(function(clients) {
      clients.forEach(client => client.navigate(client.url))
    });
});