/* PharmaChemE: install as an app (PWA).
   Registers the service worker, shows an "Install app" button when the browser allows it,
   and on iPhone/iPad (no install prompt in Safari) explains Share > Add to Home Screen. */
(function () {
  'use strict';
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => { }); });

  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone) return; // already installed and opened as an app

  const ua = navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const mobile = window.matchMedia('(max-width: 820px)').matches;
  // Safari on a Mac (Sonoma or newer) can add a site to the Dock from File > Add to Dock; it has no install prompt.
  const macSafari = !ios && /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua) && 'serviceWorker' in navigator;
  const KEY = 'pce-install-dismissed';
  const get = () => { try { return +localStorage.getItem(KEY) || 0; } catch (e) { return 0; } };
  const set = () => { try { localStorage.setItem(KEY, String(Date.now())); } catch (e) { } };
  const recentlyDismissed = Date.now() - get() < 14 * 864e5;
  let deferred = null;

  function track(name) { if (window.gtag) window.gtag('event', name); }

  function iosHelp() {
    let d = document.getElementById('pce-ios-help');
    if (!d) {
      d = document.createElement('div'); d.id = 'pce-ios-help'; d.className = 'pce-sheet'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Install PharmaChemE');
      const steps = macSafari
        ? '<li>In the menu bar at the top of the screen, click <b>File</b>.</li><li>Choose <b>Add to Dock</b>.</li><li>Click <b>Add</b>. PharmaChemE opens from the Dock in its own window.</li>'
        : /crios/i.test(ua)
        ? '<li>Tap the <b>Share</b> button at the top right of the address bar (the square with an arrow).</li><li>Scroll down and choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li>'
        : /fxios|edgios/i.test(ua)
          ? '<li>Open the browser menu and tap <b>Share</b>.</li><li>Choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li>'
          : '<li>Tap the <b>Share</b> button in Safari (the square with an arrow).</li><li>Choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li>';
      d.innerHTML = '<div class="pce-sheet-box"><b>Install PharmaChemE</b><ol>' + steps + '</ol>' + (macSafari ? '<p class="pce-sheet-note">Needs macOS Sonoma or newer. In Chrome or Edge, use the install icon in the address bar.</p>' : '<p class="pce-sheet-note">Needs iOS 16.4 or newer in Chrome, Edge or Firefox. On older iPhones, open the site in Safari.</p>') + '<button type="button" class="pce-sheet-ok">Got it</button></div>';
      d.addEventListener('click', e => { if (e.target === d || e.target.tagName === 'BUTTON') d.hidden = true; });
      document.body.appendChild(d);
    }
    d.hidden = false; track('pwa_ios_help');
  }

  async function install() {
    if (deferred) {
      deferred.prompt(); track('pwa_install_prompt');
      const r = await deferred.userChoice.catch(() => null);
      if (r && r.outcome === 'accepted') { track('pwa_installed'); hideAll(); }
      deferred = null; return;
    }
    if (ios || macSafari) iosHelp();
  }

  function hideAll() {
    document.querySelectorAll('.pce-install').forEach(b => { b.hidden = true; });
    const bar = document.getElementById('pce-install-bar'); if (bar) bar.remove();
  }

  function showButtons() { document.querySelectorAll('.pce-install').forEach(b => { b.hidden = false; b.onclick = install; }); }

  function showBar() {
    if (recentlyDismissed || document.getElementById('pce-install-bar')) return;
    const bar = document.createElement('div'); bar.id = 'pce-install-bar'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Install app');
    bar.innerHTML = '<img src="/assets/img/icon-192.png" alt="" width="36" height="36">' + (mobile ? '<span><b>Get the PharmaChemE app</b><br>Free, no login, opens like an app</span>' : '<span><b>Install PharmaChemE on this computer</b><br>Opens in its own window, like a desktop app. Free, no login.</span>') + '<button type="button" class="pce-bar-go">Install</button><button type="button" class="pce-bar-x" aria-label="Not now">&times;</button>';
    bar.querySelector('.pce-bar-go').onclick = install;
    bar.querySelector('.pce-bar-x').onclick = () => { set(); bar.remove(); track('pwa_bar_dismissed'); };
    document.body.appendChild(bar);
  }

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; showButtons(); setTimeout(showBar, 15000); });
  window.addEventListener('appinstalled', () => { track('pwa_installed'); hideAll(); });

  document.addEventListener('DOMContentLoaded', () => {
    if (ios || macSafari) { showButtons(); setTimeout(showBar, 15000); }
  });
})();
