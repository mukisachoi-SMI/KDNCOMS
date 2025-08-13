// Service Worker for Church Donation System PWA
const CACHE_NAME = 'church-donation-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/manifest-dark.json'
];

// 테마별 아이콘 캐싱
const iconSizes = ['16x16', '32x32', '72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];
const iconUrls = [];

// 브라이트 모드 아이콘
iconSizes.forEach(size => {
  iconUrls.push(`/icons/coms_b-${size}.png`);
});

// 다크 모드 아이콘
iconSizes.forEach(size => {
  iconUrls.push(`/icons/coms_d-${size}.png`);
});

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // 기본 URL 캐싱
        return cache.addAll(urlsToCache)
          .then(() => {
            // 아이콘 캐싱 (에러 무시)
            return Promise.all(
              iconUrls.map(url => 
                cache.add(url).catch(err => 
                  console.log('Failed to cache icon:', url, err)
                )
              )
            );
          });
      })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', event => {
  // manifest 파일 요청 처리
  if (event.request.url.includes('manifest.json') || event.request.url.includes('manifest-dark.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 캐시 업데이트
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // 오프라인 시 캐시에서 반환
          return caches.match(event.request);
        })
    );
    return;
  }

  // 아이콘 요청 처리
  if (event.request.url.includes('/icons/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(response => {
              // 아이콘 캐싱
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            });
        })
    );
    return;
  }

  // 기타 요청 처리
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// 테마 변경 메시지 처리
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'THEME_CHANGED') {
    console.log('Theme changed to:', event.data.theme);
    
    // 새 테마에 맞는 manifest 캐싱
    const manifestUrl = event.data.theme === 'dark' 
      ? '/manifest-dark.json' 
      : '/manifest.json';
    
    caches.open(CACHE_NAME)
      .then(cache => {
        return fetch(manifestUrl)
          .then(response => {
            cache.put(manifestUrl, response);
          });
      });
    
    // 클라이언트에 업데이트 알림
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'THEME_UPDATED',
          theme: event.data.theme
        });
      });
    });
  }
});

// 백그라운드 동기화 (옵션)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-donations') {
    event.waitUntil(syncDonations());
  }
});

async function syncDonations() {
  // 오프라인에서 저장된 데이터 동기화 로직
  console.log('Syncing donations...');
}