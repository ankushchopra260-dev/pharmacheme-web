/* Solvent data: quick boiling point / vapour pressure calculator, and search on the index page. */
(function () {
  'use strict';
  const f = (x, d) => x.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
  document.querySelectorAll('.sv-calc').forEach(box => {
    const A = +box.dataset.a, B = +box.dataset.b, C = +box.dataset.c, name = box.dataset.name;
    const p = box.querySelector('.sv-p'), u = box.querySelector('.sv-u'), t = box.querySelector('.sv-t');
    const out = box.querySelector('.sv-out'), out2 = box.querySelector('.sv-out2');
    function bp() {
      const v = parseFloat(p.value); let abs = u.value === 'gauge' ? 760 - v : u.value === 'mbar' ? v / 1.33322 : v;
      if (!isFinite(v) || abs <= 0) { out.textContent = 'Enter a pressure above full vacuum (absolute pressure must be more than 0).'; return; }
      const T = B / (A - Math.log10(abs)) - C;
      out.innerHTML = `${name} boils at <b>${f(T, 1)} °C</b> at ${f(abs, abs < 10 ? 1 : 0)} mmHg absolute (${f(abs * 1.33322, 0)} mbar).` + (T < -20 ? ' This is outside the reliable range of the data.' : '');
    }
    function vp() {
      const T = parseFloat(t.value); if (!isFinite(T)) { out2.textContent = 'Enter a temperature.'; return; }
      const P = Math.pow(10, A - B / (C + T));
      out2.innerHTML = `Vapour pressure at ${f(T, 0)} °C: <b>${f(P, P < 10 ? 2 : 0)} mmHg</b> (${f(P * 1.33322, P < 10 ? 2 : 0)} mbar).`;
    }
    p.addEventListener('input', bp); u.addEventListener('change', () => {
      if (u.value === 'gauge') p.value = 660; else if (u.value === 'mbar') p.value = 133; else p.value = 100; bp(); });
    t.addEventListener('input', vp); bp(); vp();
  });
  const q = document.getElementById('sv-q');
  if (q) {
    const rows = [...document.querySelectorAll('.sv-list tbody tr')], groups = [...document.querySelectorAll('.sv-group')], none = document.getElementById('sv-none');
    q.addEventListener('input', () => {
      const w = q.value.toLowerCase().trim(); let n = 0;
      const cas = /^[\d-]{4,}$/.test(w) ? w.replace(/-/g, '') : null;
      rows.forEach(r => { const ok = !w || r.dataset.q.includes(w) || (cas && r.dataset.q.replace(/-/g, '').includes(cas)); r.classList.toggle('hide', !ok); if (ok) n++; });
      groups.forEach(g => g.classList.toggle('hide', !g.querySelector('tbody tr:not(.hide)')));
      none.hidden = n > 0;
    });
  }
})();
