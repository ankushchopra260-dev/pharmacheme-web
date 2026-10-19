/* PharmaChemE: in-page search for section pages (calculators, articles, videos...).
   Adds a search box under the page heading that filters the cards on that page.
   Configured from front matter (page_search: items, groups, placeholder) via data attributes. */
(function () {
  'use strict';
  const me = document.currentScript; if (!me) return;
  const ITEMS = me.dataset.items, GROUPS = me.dataset.groups || '', HEADS = me.dataset.heads || '', PH = me.dataset.ph || 'Search this page…';
  function init() {
    const items = [...document.querySelectorAll(ITEMS)]; if (!items.length) return;
    const h1 = document.querySelector('main h1, h1'); if (!h1) return;
    const bar = document.createElement('div'); bar.className = 'pf-bar';
    bar.innerHTML = `<label class="pf-sr" for="pf-q">Search this page</label><input id="pf-q" type="search" placeholder="${PH.replace(/"/g, '&quot;')}" autocomplete="off" spellcheck="false"><span class="pf-count" aria-live="polite"></span><p class="pf-none" hidden>Nothing on this page matches. Ask the plant guide (bottom right) to search the whole site.</p>`;
    let at = h1, nx = h1.nextElementSibling;
    if (nx && nx.tagName === 'P') at = nx;
    at.insertAdjacentElement('afterend', bar);
    const q = bar.querySelector('input'), cnt = bar.querySelector('.pf-count'), none = bar.querySelector('.pf-none');
    const groups = GROUPS ? [...document.querySelectorAll(GROUPS)] : [];
    const txt = items.map(el => ((el.innerText || el.textContent) + ' ' + (el.getAttribute('href') || '') + ' ' + (el.dataset.q || '')).toLowerCase());
    function run() {
      const words = q.value.toLowerCase().split(/\s+/).filter(Boolean);
      let n = 0;
      items.forEach((el, i) => { const ok = !words.length || words.every(w => txt[i].includes(w)); el.classList.toggle('pf-hide', !ok); if (ok) n++; });
      groups.forEach(g => { const has = !words.length || [...g.querySelectorAll(ITEMS)].some(el => !el.classList.contains('pf-hide')); g.classList.toggle('pf-hide', !has);
        if (HEADS) { let p = g.previousElementSibling; while (p && p.matches(HEADS)) { p.classList.toggle('pf-hide', !has); p = p.previousElementSibling; } } });
      cnt.textContent = words.length ? n + ' of ' + items.length : '';
      none.hidden = !words.length || n > 0;
    }
    q.addEventListener('input', run);
    q.addEventListener('keydown', e => { if (e.key === 'Escape') { q.value = ''; run(); } });
    try { const s = new URLSearchParams(location.search).get('q'); if (s) { q.value = s; run(); } } catch (e) { }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0)); else setTimeout(init, 0);
})();
