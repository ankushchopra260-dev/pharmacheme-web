/* PharmaChemE: header search. Loads the search index on first use; results appear in a compact panel. */
(function () {
  'use strict';
  const btn = document.getElementById('navSearchBtn'), box = document.getElementById('siteSearch');
  if (!btn || !box) return;
  const q = document.getElementById('siteSearchQ'), res = document.getElementById('siteSearchRes'), x = document.getElementById('siteSearchX');
  const base = box.dataset.base || '';
  let data = null, loading = null, sel = -1;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clean = t => String(t || '').replace(/\s+(Basics|Working level|Going deeper)$/, '');
  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) loading = fetch(box.dataset.src).then(r => r.json()).then(d => {
      data = d.filter(r => !/PCCPL/i.test(r.u)).map(r => ({ r, t: (r.t || '').toLowerCase(), m: ((r.s || '') + ' ' + (r.w || '') + ' ' + (r.k || '')).toLowerCase(), x: (r.x || '').toLowerCase() }));
      return data;
    }).catch(() => { loading = null; return []; });
    return loading;
  }
  function search(query) {
    const w = query.toLowerCase().trim(); if (!w || !data) return [];
    const toks = w.split(/\s+/).filter(Boolean), cas = /^\d{2,7}-?\d{2}-?\d$/.test(w) ? w.replace(/-/g, '') : null;
    const out = [];
    data.forEach(d => {
      let sc = 0;
      for (const t of toks) {
        const inT = d.t.includes(t), inM = d.m.includes(t), inX = d.x.includes(t);
        if (!inT && !inM && !inX && !(cas && d.x.replace(/-/g, '').includes(cas))) return;
        sc += inT ? 3 : inM ? 1.5 : 1;
      }
      if (d.t === w) sc += 12; else if (d.t.startsWith(w)) sc += 7; else if (d.t.includes(w)) sc += 4;
      if (/Calculator|Tool|Solvent data/.test(d.r.k)) sc += 0.8;
      if (d.r.h) sc -= 0.8;
      out.push([sc, d.r]);
    });
    out.sort((a, b) => b[0] - a[0]);
    const seen = new Set(), top = [];
    for (const [, r] of out) { const key = clean(r.t).toLowerCase(); if (seen.has(key) || seen.has(r.u)) continue; seen.add(r.u); seen.add(key); top.push(r); if (top.length >= 10) break; }
    return top;
  }
  function render() {
    const query = q.value;
    if (!query.trim()) { res.innerHTML = ''; return; }
    if (!data) { res.innerHTML = '<div class="none">Loading…</div>'; load().then(render); return; }
    const hits = search(query); sel = -1;
    res.innerHTML = hits.length ? hits.map((r, i) => `<a href="${base}${r.u}" role="option" data-i="${i}"><b>${esc(clean(r.t))}</b><span><em>${esc(r.k || '')}</em>${esc(r.s || '')}</span></a>`).join('')
      : `<div class="none">Nothing found for &ldquo;${esc(query)}&rdquo;. Try a shorter word, a chemical name or a CAS number.</div>`;
  }
  function open() { box.hidden = false; btn.setAttribute('aria-expanded', 'true'); q.focus(); load(); }
  function close() { box.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  btn.addEventListener('click', () => box.hidden ? open() : close());
  x.addEventListener('click', () => { close(); btn.focus(); });
  q.addEventListener('input', render);
  q.addEventListener('keydown', e => {
    const items = res.querySelectorAll('a');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!items.length) return;
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((a, i) => a.classList.toggle('on', i === sel)); items[sel].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') { const a = items[sel >= 0 ? sel : 0]; if (a) { e.preventDefault(); location.href = a.href; } }
    else if (e.key === 'Escape') { close(); btn.focus(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && box.hidden && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable) { e.preventDefault(); open(); }
  });
  document.addEventListener('click', e => { if (!box.hidden && !box.contains(e.target) && !btn.contains(e.target)) close(); });
})();
