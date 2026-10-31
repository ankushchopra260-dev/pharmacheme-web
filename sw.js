---
layout: null
sitemap: false
---
/* PharmaChemE service worker: makes the site installable and keeps pages you have opened available offline.
   Pages: network first, cached copy when offline. Site files (css, js, images, data): served from cache and refreshed in the background.
   A new deploy changes VERSION, so browsers pick up this file again; the caches keep their names so saved pages still work offline. */
const VERSION = '{{ site.time | date: "%s" }}';
const PAGES = 'pce-pages-v1', FILES = 'pce-files-v1';
const OFFLINE = '/offline/';
const SKIP = [/^\/admin\//, /^\/PCCPL-LALRU\//, /^\/get-test/];
const MAX_PAGES = 80, MAX_FILES = 200;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(PAGES).then(c => c.addAll([OFFLINE, '/'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== PAGES && k !== FILES).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function trim(name, max) {
  const c = await caches.open(name), keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || SKIP.some(r => r.test(url.pathname))) return;

  if (req.mode === 'navigate') {
    // Always check with the server (cheap if unchanged), so a new deploy shows at once instead of after the browser's 10-minute cache.
    e.respondWith(fetch(req.url, { cache: 'no-cache', credentials: 'include' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(PAGES).then(c => c.put(req, copy)).then(() => trim(PAGES, MAX_PAGES)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match(OFFLINE))));
    return;
  }

  if (/^\/assets\/data\//.test(url.pathname)) {
    // search and guide data: always ask the server first, so new pages are findable straight after a deploy
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(res => { if (res.ok) { const copy = res.clone(); caches.open(FILES).then(c => c.put(req, copy)); } return res; }).catch(() => caches.match(req)));
    return;
  }

  if (/^\/(assets\/|favicon\.ico|manifest\.webmanifest)/.test(url.pathname)) {
    e.respondWith(caches.open(FILES).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()).then(() => trim(FILES, MAX_FILES)); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
