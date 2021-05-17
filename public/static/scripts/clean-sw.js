if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  // eslint-disable-next-line no-console
  console.log("Service Worker Detected: Cleaning up!")
  window.navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister())
  })
}