/**
 * Harkco Hub PWA & Service Worker Registration
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[Harkco PWA] ServiceWorker registered with scope:', registration.scope);

          // Check for service worker updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.warn('[Harkco PWA] ServiceWorker registration failed:', error);
        });
    });
  }
}
