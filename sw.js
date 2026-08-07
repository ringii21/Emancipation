// Service worker — La Clé.
// Incrémenter VERSION à chaque déploiement, sinon les utilisatrices
// reçoivent l'ancienne version depuis le cache (PROJET.md §7.5).
const VERSION = 1;
const CACHE = 'lacle-v' + VERSION;

const ASSETS = [
  '.',
  'index.html',
  'fonts.css',
  'manifest.webmanifest',
  'fonts/Fraunces.woff2',
  'fonts/Fraunces-Italic.woff2',
  'fonts/Spectral-Light.woff2',
  'fonts/Spectral-LightItalic.woff2',
  'fonts/Spectral-Regular.woff2',
  'fonts/DMSans.woff2',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => skipWaiting()));
});

addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

// Cache d'abord, réseau sinon. La mise à jour passe par le bump de VERSION,
// pas par la revalidation réseau — l'app doit s'ouvrir hors ligne sans attendre.
addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit =>
      hit || fetch(e.request).then(res => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() =>
        e.request.mode === 'navigate' ? caches.match('index.html') : undefined
      )
    )
  );
});
