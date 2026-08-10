// Service worker — La Clé.
// Incrémenter VERSION à chaque déploiement, sinon les utilisatrices
// reçoivent l'ancienne version depuis le cache (PROJET.md §7.5).
const VERSION = 4;
const CACHE = 'lacle-v' + VERSION;

const ASSETS = [
  '.',
  'index.html',
  'styles.css',
  'fonts.css',
  'manifest.webmanifest',
  'js/i18n.js',
  'js/storage.js',
  'js/voice.js',
  'js/reader.js',
  'js/session.js',
  'js/app.js',
  'js/pensees.js',
  'data/weeks.fr.json',
  'data/weeks.ja.json',
  'content/index.json',
  'content/exercices.fr.json',
  'content/exercices.ja.json',
  'content/part-01.fr.json',
  'content/part-01.ja.json',
  'content/part-02.fr.json',
  'content/part-02.ja.json',
  'content/part-03.fr.json',
  'content/part-03.ja.json',
  'content/part-04.fr.json',
  'content/part-04.ja.json',
  'content/part-05.fr.json',
  'content/part-05.ja.json',
  'content/part-06.fr.json',
  'content/part-06.ja.json',
  'content/part-07.fr.json',
  'content/part-07.ja.json',
  'content/part-08.fr.json',
  'content/part-08.ja.json',
  'content/part-09.fr.json',
  'content/part-09.ja.json',
  'content/part-10.fr.json',
  'content/part-10.ja.json',
  'content/part-11.fr.json',
  'content/part-11.ja.json',
  'content/part-12.fr.json',
  'content/part-12.ja.json',
  'content/part-13.fr.json',
  'content/part-13.ja.json',
  'content/part-14.fr.json',
  'content/part-14.ja.json',
  'content/part-15.fr.json',
  'content/part-15.ja.json',
  'content/part-16.fr.json',
  'content/part-16.ja.json',
  'content/part-17.fr.json',
  'content/part-17.ja.json',
  'content/part-18.fr.json',
  'content/part-18.ja.json',
  'content/part-19.fr.json',
  'content/part-19.ja.json',
  'content/part-20.fr.json',
  'content/part-20.ja.json',
  'content/part-21.fr.json',
  'content/part-21.ja.json',
  'content/part-22.fr.json',
  'content/part-22.ja.json',
  'content/part-23.fr.json',
  'content/part-23.ja.json',
  'content/part-24.fr.json',
  'content/part-24.ja.json',
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
