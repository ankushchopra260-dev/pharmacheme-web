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
    bar.innerHTML = `<label class="pf-sr" for="pf-q">Search this page</label><input id="pf-q" type="search" placeholder="${PH.replace(/"/g, '&quot;')}" autocomplete="off" spellcheck="false"><span class="pf-count" aria-live="polite"></span><p class="pf-none" hidden>Nothing on this page matches.</p><div class="pf-site"></div>`;
    document.body.classList.add('has-page-search');
    let at = h1, nx = h1.nextElementSibling;
    if (nx && nx.tagName === 'P') at = nx;
    at.insertAdjacentElement('afterend', bar);
    const q = bar.querySelector('input'), cnt = bar.querySelector('.pf-count'), none = bar.querySelector('.pf-none');
    const groups = GROUPS ? [...document.querySelectorAll(GROUPS)] : [];
    const txt = items.map(el => ((el.innerText || el.textContent) + ' ' + (el.getAttribute('href') || '') + ' ' + (el.dataset.q || '')).toLowerCase());
    // section data (same file as the header search), limited to this tab: URLs under this page's path, never the page itself
    const ss = document.getElementById('siteSearch'), SRC = ss && ss.dataset.src, BASE = (ss && ss.dataset.base) || '';
    const TAB = location.pathname.replace(BASE, '').replace(/index\.html$/, '');
    const hrefOf = el => { const a = el.matches('a') ? el : el.querySelector('a'); if (!a) return ''; try { return new URL(a.href, location.href).pathname.replace(BASE, '').replace(/index\.html$/, ''); } catch (e) { return ''; } };
    const hrefs = items.map(hrefOf), here = new Set(hrefs);
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let DATA = null, loading = false;
    function records(words) {
      if (!SRC || words.join('').length < 3) return null;
      if (!DATA) { if (!loading) { loading = true; fetch(SRC).then(r => r.json()).then(d => { DATA = d; run(); }).catch(() => { }); } return null; }
      const out = [];
      for (const r of DATA) {
        const u = (r.u || '').split('#')[0]; if (!u.startsWith(TAB) || u === TAB) continue;
        const t = (r.t || '').toLowerCase(), all = t + ' ' + (r.s || '').toLowerCase() + ' ' + (r.w || '').toLowerCase() + ' ' + (r.x || '').toLowerCase();
        if (words.every(w => all.includes(w))) out.push([words.every(w => t.includes(w)) ? 0 : 1, r.h ? 1 : 0, r, u]);
      }
      return out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    }
    function run() {
      const words = q.value.toLowerCase().split(/\s+/).filter(Boolean);
      const recs = words.length ? records(words) : null;
      const inside = new Set((recs || []).map(x => x[3]));   // pages whose content matches
      let n = 0;
      items.forEach((el, i) => { const ok = !words.length || words.every(w => txt[i].includes(w)) || inside.has(hrefs[i]); el.classList.toggle('pf-hide', !ok); if (ok) n++; });
      groups.forEach(g => { const has = !words.length || [...g.querySelectorAll(ITEMS)].some(el => !el.classList.contains('pf-hide')); g.classList.toggle('pf-hide', !has);
        if (HEADS) { let p = g.previousElementSibling; while (p && p.matches(HEADS)) { p.classList.toggle('pf-hide', !has); p = p.previousElementSibling; } } });
      // pages in this section that have no card here (for example single GATE questions)
      const seen = new Set(), extra = [];
      for (const [, , r, u] of recs || []) { if (here.has(u) || seen.has(r.u)) continue; seen.add(r.u); extra.push(r); if (extra.length >= 6) break; }
      const box = bar.querySelector('.pf-site');
      box.innerHTML = extra.length ? '<p>Also in this section</p>' + extra.map(r => `<a href="${esc(BASE + r.u)}"><b><em>${esc(r.k || '')}</em>${esc(String(r.t).replace(/\s+(Basics|Working level|Going deeper)$/, ''))}</b><span>${esc(r.s || '')}</span></a>`).join('') : '';
      cnt.textContent = words.length ? n + ' of ' + items.length : '';
      none.hidden = !words.length || n > 0 || extra.length > 0;
    }
    q.addEventListener('input', run);
    q.addEventListener('keydown', e => { if (e.key === 'Escape') { q.value = ''; run(); } });
    try { const s = new URLSearchParams(location.search).get('q'); if (s) { q.value = s; run(); } } catch (e) { }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0)); else setTimeout(init, 0);
})();
