// Service Worker for AI News Platform
// Handles runtime caching for article thumbnail images

const CACHE_NAME = 'ai-news-images-v1';
const MAX_IMAGES = 50;
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Install event - create cache
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting(); // Take control immediately
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName.startsWith('ai-news-images-') && cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all pages
    })
  );
});

// Fetch event - handle image caching with Cache First strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle image requests
  if (event.request.method === 'GET' && 
      (event.request.destination === 'image' || 
       url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i))) {
    
    event.respondWith(
      cacheFirstStrategy(event.request)
    );
  }
});

// Cache First strategy for images
async function cacheFirstStrategy(request) {
  try {
    // Try to get from cache first
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache entry is expired
      const cacheTime = parseInt(cachedResponse.headers.get('sw-cache-time') || '0');
      const isExpired = Date.now() - cacheTime > CACHE_EXPIRATION;
      
      if (!isExpired) {
        console.log('Serving from cache:', request.url);
        return cachedResponse;
      } else {
        // Remove expired entry
        await cache.delete(request);
      }
    }
    
    // Fetch from network
    console.log('Fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse.ok) {
      // Check cache size and evict oldest entries if needed
      await manageCacheSize(cache);
      
      // Clone response and add timestamp header
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', Date.now().toString());
      
      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      // Cache the response
      await cache.put(request, cachedResponse);
      console.log('Cached:', request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('Cache strategy failed:', error);
    
    // Try to serve stale cache as fallback
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Serving stale cache due to error:', request.url);
      return cachedResponse;
    }
    
    // Return error if nothing else works
    throw error;
  }
}

// Manage cache size by removing oldest entries
async function manageCacheSize(cache) {
  const keys = await cache.keys();
  
  if (keys.length >= MAX_IMAGES) {
    // Get all cached responses with timestamps
    const cacheEntries = await Promise.all(
      keys.map(async (key) => {
        const response = await cache.match(key);
        const timestamp = parseInt(response.headers.get('sw-cache-time') || '0');
        return { key, timestamp };
      })
    );
    
    // Sort by timestamp (oldest first)
    cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest entries to make room
    const entriesToRemove = cacheEntries.slice(0, Math.max(1, keys.length - MAX_IMAGES + 1));
    
    for (const entry of entriesToRemove) {
      await cache.delete(entry.key);
      console.log('Evicted from cache:', entry.key.url);
    }
  }
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});