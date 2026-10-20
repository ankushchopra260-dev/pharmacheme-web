/* PharmaChemE: share the current page (header button in the app and on phones, share row under each page). */
(function () {
  'use strict';
  const url = () => location.href.split('#')[0].replace(/[?&]source=pwa\b/, '').replace(/\?$/, '');
  const title = () => { const h = document.querySelector('h1'); return (h ? h.textContent.trim() : document.title).replace(/\s+/g, ' '); };
  const track = (m) => { if (window.gtag) window.gtag('event', 'share', { method: m, content_type: 'page', item_id: location.pathname }); };
  function toast(msg) { const t = document.createElement('div'); t.className = 'share-toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2200); }
  async function copy() {
    try { await navigator.clipboard.writeText(url()); toast('Link copied'); }
    catch (e) { const i = document.createElement('input'); i.value = url(); document.body.appendChild(i); i.select(); try { document.execCommand('copy'); toast('Link copied'); } catch (e2) { prompt('Copy this link:', url()); } i.remove(); }
    track('copy');
  }
  async function native() {
    if (navigator.share) { try { await navigator.share({ title: title() + ' | PharmaChemE', text: title(), url: url() }); track('native'); } catch (e) { } }
    else copy();
  }
  function init() {
    document.querySelectorAll('[data-share-btn]').forEach(b => b.addEventListener('click', native));
    document.querySelectorAll('[data-share]').forEach(el => {
      const k = el.dataset.share;
      if (k === 'wa') el.href = 'https://wa.me/?text=' + encodeURIComponent(title() + ' ' + url());
      if (k === 'li') el.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url());
      if (k === 'wa' || k === 'li') { el.target = '_blank'; el.addEventListener('click', () => track(k === 'wa' ? 'whatsapp' : 'linkedin')); }
      if (k === 'copy') el.addEventListener('click', copy);
      if (k === 'native') { if (navigator.share) { el.hidden = false; el.addEventListener('click', native); } }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
