
const CACHE_NAME = 'wasd-shooter-v3'; // Bump version to force update
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',
  '/components/GameContainer.tsx',
  '/components/Player.tsx',
  '/components/Enemy.tsx',
  '/components/Projectile.tsx',
  '/components/HUD.tsx',
  '/components/PowerUp.tsx',
  '/components/Confetti.tsx',
  '/components/MeleeAttack.tsx',
  '/hooks/useGameLoop.ts',
  '/hooks/useKeyboardInput.ts',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@^19.1.0',
  'https://esm.sh/react-dom@^19.1.0/client',
  'https://esm.sh/react@^19.1.0/jsx-runtime'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});