/* Sends one GA4 "tool_use" event per page view, the first time a visitor
   actually works a calculator, simulator, game or interactive figure
   (types a value, changes a select or presses a button in the page body).
   Site chrome (menu, search, guide, share row, footer) is ignored. */
(function () {
  var sent = false;
  var CHROME = '.site-nav, .site-footer, .share-row, .pg, #pce-install-bar, #pce-ios-help, .breadcrumbs, [data-no-track]';
  function section() {
    var s = location.pathname.split('/').filter(Boolean);
    return s[0] || 'home';
  }
  function fire(e) {
    if (sent) return;
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest(CHROME)) return;
    if (e.type === 'click' && !t.closest('button, [role="button"], input[type="range"], input[type="checkbox"], input[type="radio"], canvas, svg')) return;
    sent = true;
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'tool_use', { tool_page: location.pathname, tool_section: section(), first_action: e.type });
      }
    } catch (err) {}
    ['input', 'change', 'click'].forEach(function (n) { document.removeEventListener(n, fire, true); });
  }
  ['input', 'change', 'click'].forEach(function (n) { document.addEventListener(n, fire, true); });
})();
