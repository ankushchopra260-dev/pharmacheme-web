/* PharmaChemE: simple line sizing calculator. Uses the engine in line-network-engine.js (window.LNE). */
(function () {
  'use strict';
  const L = window.LNE, box = document.getElementById('ls-app'); if (!L || !box) return;
  const $ = s => box.querySelector(s);
  const INCH = { 15: '½"', 20: '¾"', 25: '1"', 32: '1¼"', 40: '1½"', 50: '2"', 65: '2½"', 80: '3"', 100: '4"', 125: '5"', 150: '6"', 200: '8"', 250: '10"', 300: '12"', 350: '14"', 400: '16"', 450: '18"', 500: '20"', 600: '24"' };
  // what the user picks: label -> engine utility (+ defaults)
  const FLUIDS = [
    ['cw', 'Cooling water'], ['pw', 'Process / DM / soft water'], ['chw', 'Chilled water'], ['brine', 'Brine / glycol'],
    ['liq', 'Solvent or process liquid'], ['cond', 'Condensate (pumped)'],
    ['steam', 'Steam'], ['air', 'Compressed air'], ['n2', 'Nitrogen'], ['gas', 'Other gas']];
  const SOLV = { '': ['Type your own', '', ''], water: ['Water', 997, 0.89], methanol: ['Methanol', 791, 0.55], ethanol: ['Ethanol', 789, 1.07], ipa: ['IPA', 786, 2.0], acetone: ['Acetone', 784, 0.31],
    toluene: ['Toluene', 867, 0.56], mdc: ['Methylene chloride (MDC)', 1325, 0.41], ea: ['Ethyl acetate', 897, 0.43], hexane: ['n-Hexane', 655, 0.30], dmf: ['DMF', 944, 0.80], thf: ['THF', 889, 0.46], acn: ['Acetonitrile', 786, 0.34], h2so4: ['Sulphuric acid 98%', 1830, 24], naoh: ['Caustic lye 48%', 1500, 20] };
  const params = new URLSearchParams(location.search);
  const st = { u: FLUIDS.some(f => f[0] === params.get('fluid')) ? params.get('fluid') : 'cw', q: +params.get('flow') || 50, p: 7, len: 100, rho: 867, mu: 0.56, solv: 'toluene', T: '', sch: '', more: false };

  box.innerHTML = `
<form class="ls-form" id="ls-form" autocomplete="off">
  <label class="ls-f"><span>What flows in the line</span><select id="ls-u">${FLUIDS.map(f => '<option value="' + f[0] + '">' + f[1] + '</option>').join('')}</select></label>
  <label class="ls-f ls-solv"><span>Liquid</span><select id="ls-solv">${Object.entries(SOLV).map(([k, v]) => '<option value="' + k + '">' + v[0] + '</option>').join('')}</select></label>
  <label class="ls-f"><span>Flow</span><span class="ls-in"><input id="ls-q" type="number" step="any" min="0" inputmode="decimal"><b id="ls-qu"></b></span></label>
  <label class="ls-f ls-pr"><span>Pressure in the line</span><span class="ls-in"><input id="ls-p" type="number" step="any" inputmode="decimal"><b>barg</b></span></label>
  <label class="ls-f"><span>Line length</span><span class="ls-in"><input id="ls-len" type="number" step="any" min="0" inputmode="decimal"><b>m</b></span></label>
  <details class="ls-more" id="ls-more"><summary>More options</summary>
    <div class="ls-moregrid">
      <label class="ls-f ls-liqprop"><span>Density</span><span class="ls-in"><input id="ls-rho" type="number" step="any"><b>kg/m³</b></span></label>
      <label class="ls-f ls-liqprop"><span>Viscosity</span><span class="ls-in"><input id="ls-mu" type="number" step="any"><b>cP</b></span></label>
      <label class="ls-f"><span>Temperature</span><span class="ls-in"><input id="ls-T" type="number" step="any" placeholder="typical"><b>°C</b></span></label>
      <label class="ls-f"><span>Pipe schedule</span><select id="ls-sch"><option value="">Typical for this service</option><option value="10S">Sch 10S</option><option value="40">Sch 40</option><option value="80">Sch 80</option></select></label>
    </div>
  </details>
</form>
<div class="ls-out" id="ls-out" aria-live="polite"></div>`;

  const ids = ['u', 'solv', 'q', 'p', 'len', 'rho', 'mu', 'T', 'sch'];
  function syncInputs() { $('#ls-u').value = st.u; $('#ls-solv').value = st.solv; $('#ls-q').value = st.q; $('#ls-p').value = st.p; $('#ls-len').value = st.len; $('#ls-rho').value = st.rho; $('#ls-mu').value = st.mu; $('#ls-T').value = st.T; $('#ls-sch').value = st.sch; }
  syncInputs();
  box.addEventListener('input', e => { const id = e.target.id.replace('ls-', ''); if (!ids.includes(id)) return; const v = e.target.value;
    if (id === 'u' || id === 'solv' || id === 'sch') st[id] = v; else st[id] = v === '' ? '' : +v;
    if (id === 'solv' && SOLV[v][1]) { st.rho = SOLV[v][1]; st.mu = SOLV[v][2]; $('#ls-rho').value = st.rho; $('#ls-mu').value = st.mu; }
    if ((id === 'rho' || id === 'mu') && st.solv) { st.solv = ''; $('#ls-solv').value = ''; }
    if (id === 'u') { const U = L.UTIL[v]; st.p = U.kind === 'steam' ? 7 : U.kind === 'gas' ? 6 : 3; $('#ls-p').value = st.p; st.q = U.unit === 'kg/h' ? 1000 : U.unit === 'Nm³/h' ? 200 : 50; $('#ls-q').value = st.q; }
    calc(); });

  const fmt = (x, d) => isFinite(x) ? (+x).toFixed(d) : '';
  let last = null;
  /* "Download PDF": the inputs, the recommended size and the neighbouring sizes, as on screen */
  function pdfSpec() {
    if (!last) return { error: 'Enter the flow first.' };
    const { U, f, sch, best, show, crit, tot, none } = last;
    const inputs = [['Service', last.fluidName], ['Flow', st.q + ' ' + U.unit], ['Line length', st.len + ' m']];
    if (U.kind !== 'liq') inputs.push(['Pressure', st.p + ' barg']);
    inputs.push(['Density used', fmt(f.rho, f.rho < 20 ? 2 : 0) + ' kg/m³'], ['Viscosity used', fmt(f.mu * 1000, 3) + ' cP'], ['Pipe schedule', 'Sch ' + sch], ['Limits for this service', 'velocity ' + crit.vmin + '–' + crit.vmax + ' m/s, ΔP below ' + crit.dp100 + ' bar/100 m']);
    const res = [['Recommended size', none ? 'None in range (largest shown: ' + best.nb + ' NB)' : best.nb + ' NB (' + INCH[best.nb] + '), ID ' + fmt(best.D * 1000, 1) + ' mm'], ['Velocity', fmt(best.v, 2) + ' m/s'], ['Pressure drop', fmt(best.dp100, 3) + ' bar per 100 m'], ['Reynolds number', fmt(best.Re, 0)]];
    if (tot != null) res.push(['Pressure drop over ' + fmt(st.len, 0) + ' m', fmt(tot, 3) + ' bar (incl. 20 % for bends and valves)']);
    return { title: 'Line Sizing', sub: last.fluidName + ', ' + st.q + ' ' + U.unit,
      sections: [{ title: 'Inputs', head: ['Item', 'Value'], widths: [0.38, 0.62], rows: inputs },
        { title: 'Result', head: ['Item', 'Value'], widths: [0.38, 0.62], bold: [1], rows: res },
        { title: 'Sizes compared', head: ['Size', 'Velocity (m/s)', 'ΔP (bar/100 m)', 'Status'], widths: [0.25, 0.22, 0.22, 0.31], rows: show.map(r => [r.nb + ' NB (' + INCH[r.nb] + ')', fmt(r.v, 2), fmt(r.dp100, 3), r === best ? 'Recommended' : r.ok ? 'Bigger than needed' : 'Too small']) }],
      notes: ['Friction factor from the Churchill equation; pressure drop by Darcy–Weisbach for straight pipe. Check against your piping standard, and size relief, two-phase and slurry lines separately.'] };
  }
  const bar = document.createElement('div'); bar.className = 'xl-bar';
  bar.innerHTML = '<button type="button" class="btn btn-outline btn-sm">Download PDF</button><span>A copy of your inputs and results</span>';
  box.parentNode.insertBefore(bar, box.nextSibling);
  bar.querySelector('button').addEventListener('click', e => { const btn = e.currentTarget, c = pdfSpec(); if (c.error) { alert(c.error); return; }
    if (!window.PCME_XL) { alert('The PDF tool is still loading. Please try again.'); return; }
    btn.disabled = true; btn.textContent = 'Preparing…'; c.link = location.href.split('#')[0];
    window.PCME_XL.report(c).then(() => { btn.disabled = false; btn.textContent = 'Download PDF'; }, err => window.PCME_XL.fail(btn, err)); });
  function calc() {
    const U = L.UTIL[st.u], kind = U.kind, liqUser = st.u === 'liq';
    box.classList.toggle('is-gas', kind !== 'liq'); box.classList.toggle('is-userliq', liqUser);
    $('#ls-qu').textContent = U.unit;
    const net = { utility: st.u, T: st.T, rho: liqUser ? st.rho : '', mu: liqUser && st.mu ? st.mu / 1000 : '', MW: '', Z: '', margin: 0 };
    const sch = st.sch || U.sch, mat = U.mat, e = L.MATERIALS[mat].e / 1000, crit = U.crit, out = $('#ls-out');
    if (!(st.q > 0)) { out.innerHTML = '<p class="ls-empty">Enter the flow to get the line size.</p>'; return; }
    const Pa = (kind === 'liq' ? 3 : (+st.p || 0)) * 1e5 + L.PATM, f = L.fluid(net, Pa), m = L.massFlow(net, st.q);
    if (!(f.rho > 0) || !(f.mu > 0)) { out.innerHTML = '<p class="ls-empty">Enter the density and viscosity under More options.</p>'; return; }
    const rows = L.NBS.map(nb => { const D = L.pipeID(nb, sch); if (!D) return null; const A = Math.PI * D * D / 4, v = m / (f.rho * A), Re = m * D / (A * f.mu), fr = L.churchill(Math.max(Re, 1), e / D), dp100 = fr * 100 / D * f.rho * v * v / 2 / 1e5;
      return { nb, D, v, Re, fr, dp100, ok: v <= crit.vmax && dp100 <= crit.dp100, slow: v < crit.vmin }; }).filter(Boolean);
    let k = rows.findIndex(r => r.ok); const none = k < 0; if (none) k = rows.length - 1; const best = rows[k];
    const tot = st.len > 0 ? best.dp100 * st.len / 100 * 1.2 : null; // 20 % for bends and valves
    const show = rows.slice(Math.max(0, k - 2), k + 3);
    last = { U, f, sch, best, show, crit, tot, none, fluidName: (FLUIDS.find(x => x[0] === st.u) || [, ''])[1] + (liqUser && st.solv ? ' (' + SOLV[st.solv][0] + ')' : '') };
    const why = best.v > crit.vmax * .85 ? 'velocity' : best.dp100 > crit.dp100 * .85 ? 'pressure drop' : 'velocity';
    out.innerHTML = `
<div class="ls-answer${none ? ' bad' : ''}">
  <div class="ls-big"><span>${none ? 'Even the largest size is not enough' : 'Line size'}</span><strong>${best.nb} NB</strong><em>${INCH[best.nb]} · Sch ${sch} · ID ${fmt(best.D * 1000, 1)} mm</em></div>
  <dl class="ls-kv">
    <div><dt>Velocity</dt><dd>${fmt(best.v, 2)} m/s</dd><small>keep ${crit.vmin}–${crit.vmax} m/s</small></div>
    <div><dt>Pressure drop</dt><dd>${fmt(best.dp100, 3)} bar per 100 m</dd><small>keep below ${crit.dp100}</small></div>
    ${tot != null ? `<div><dt>For ${fmt(st.len, 0)} m of line</dt><dd>${fmt(tot, 3)} bar</dd><small>incl. 20 % for bends and valves</small></div>` : ''}
  </dl>
</div>
<p class="ls-why">${none ? 'Split the flow into two lines or check the flow figure.' : best.slow ? 'The smallest size that suits is still slow for this flow; that is normal for small flows.' : 'This is the smallest standard size that keeps the ' + why + ' within the usual limit for ' + U.n.replace(/ \(.*\)/, '').toLowerCase() + '.'}
  Fluid used: ${fmt(f.rho, f.rho < 20 ? 2 : 0)} kg/m³, ${fmt(f.mu * 1000, 3)} cP${f.Tsat != null ? ', ' + fmt(f.Tsat, 0) + ' °C saturated' : ''}.</p>
<table class="ls-tab"><thead><tr><th>Size</th><th>Velocity (m/s)</th><th>ΔP (bar/100 m)</th><th></th></tr></thead><tbody>
${show.map(r => `<tr class="${r === best ? 'pick' : ''}"><td>${r.nb} NB <small>${INCH[r.nb]}</small></td><td>${fmt(r.v, 2)}</td><td>${fmt(r.dp100, 3)}</td><td>${r === best ? 'Recommended' : r.ok ? 'Bigger than needed' : 'Too small'}</td></tr>`).join('')}
</tbody></table>`;
  }
  calc();

  /* ---------- velocity from flow and density (separate panel, does not touch the sizing above) ---------- */
  (function () {
    const host = document.createElement('div'); host.className = 'ls ls-vel'; host.id = 'ls-vel';
    const anchor = bar.nextSibling; box.parentNode.insertBefore(host, anchor);
    const UNITS = [['m3h', 'm³/h'], ['kgh', 'kg/h'], ['th', 't/h'], ['lmin', 'L/min']];
    const CHECK = [['', 'No comparison'], ['cw', 'Water (cooling, process, chilled)'], ['liq', 'Solvent or process liquid'], ['cond', 'Pumped condensate']];
    const v = { rho: 867, q: 12, qu: 'm3h', nb: 50, sch: '40', idm: '', mode: 'nb', chk: 'liq', vt: 1.5 };
    host.innerHTML = `
<form class="ls-form" autocomplete="off" onsubmit="return false">
  <h2 class="ls-h">Velocity from flow and density</h2>
  <label class="ls-f"><span>Density</span><span class="ls-in"><input data-k="rho" type="number" step="any" min="0" inputmode="decimal"><b>kg/m³</b></span></label>
  <label class="ls-f"><span>Flow</span><span class="ls-in"><input data-k="q" type="number" step="any" min="0" inputmode="decimal"><select data-k="qu" class="ls-qsel">${UNITS.map(u => '<option value="' + u[0] + '">' + u[1] + '</option>').join('')}</select></span></label>
  <label class="ls-f"><span>Pipe size</span><select data-k="mode"><option value="nb">Standard size (NB and schedule)</option><option value="id">Type the inside diameter</option></select></label>
  <label class="ls-f lv-nb"><span>Nominal size</span><select data-k="nb">${L.NBS.map(n => '<option value="' + n + '">' + n + ' NB (' + INCH[n] + ')</option>').join('')}</select></label>
  <label class="ls-f lv-nb"><span>Schedule</span><select data-k="sch"><option value="10S">Sch 10S</option><option value="40">Sch 40</option><option value="80">Sch 80</option></select></label>
  <label class="ls-f lv-id"><span>Inside diameter</span><span class="ls-in"><input data-k="idm" type="number" step="any" min="0" inputmode="decimal"><b>mm</b></span></label>
  <label class="ls-f"><span>Compare with usual limits for</span><select data-k="chk">${CHECK.map(c => '<option value="' + c[0] + '">' + c[1] + '</option>').join('')}</select></label>
  <label class="ls-f"><span>Target velocity (to find the pipe ID)</span><span class="ls-in"><input data-k="vt" type="number" step="any" min="0" inputmode="decimal"><b>m/s</b></span></label>
</form>
<div class="ls-out" id="lv-out" aria-live="polite"></div>`;
    const q = s => host.querySelector(s);
    host.querySelectorAll('[data-k]').forEach(el => { el.value = v[el.dataset.k]; });
    function calc2() {
      host.classList.toggle('lv-byid', v.mode === 'id');
      const out = q('#lv-out');
      const flowM3s = (() => { const x = +v.q, r = +v.rho; if (!(x > 0)) return 0; if (v.qu === 'm3h') return x / 3600; if (v.qu === 'lmin') return x / 1000 / 60;
        if (!(r > 0)) return 0; return (v.qu === 'kgh' ? x : x * 1000) / 3600 / r; })();
      if (!(flowM3s > 0)) { out.innerHTML = '<p class="ls-empty">' + (v.qu === 'kgh' || v.qu === 'th' ? 'Enter the density and the flow.' : 'Enter the flow.') + '</p>'; return; }
      const D = v.mode === 'id' ? (+v.idm > 0 ? +v.idm / 1000 : 0) : L.pipeID(+v.nb, v.sch);
      let html = '';
      if (D > 0) {
        const vel = flowM3s / (Math.PI * D * D / 4), c = v.chk ? L.UTIL[v.chk].crit : null;
        let verdict = '', cls = '';
        if (c) { if (vel > c.vmax) { verdict = 'Above the usual ' + c.vmax + ' m/s limit. Use a bigger pipe.'; cls = ' bad'; } else if (vel < c.vmin) verdict = 'Below the usual ' + c.vmin + ' m/s. Fine for small flows, but solids or air can settle out.'; else verdict = 'Within the usual ' + c.vmin + '–' + c.vmax + ' m/s range.'; }
        html += `<div class="ls-answer${cls}"><div class="ls-big"><span>Fluid velocity</span><strong>${vel.toFixed(2)} m/s</strong><em>${v.mode === 'id' ? 'ID ' + (+v.idm).toFixed(1) + ' mm' : v.nb + ' NB (' + INCH[v.nb] + ') · Sch ' + v.sch + ' · ID ' + (D * 1000).toFixed(1) + ' mm'}</em></div>
<dl class="ls-kv"><div><dt>Volume flow</dt><dd>${(flowM3s * 3600).toFixed(2)} m³/h</dd></div>${+v.rho > 0 ? `<div><dt>Mass flow</dt><dd>${(flowM3s * v.rho * 3600).toFixed(0)} kg/h</dd></div>` : ''}</dl></div>${verdict ? '<p class="ls-why">' + verdict + '</p>' : ''}`;
      } else html += '<p class="ls-empty">Enter the inside diameter.</p>';
      if (+v.vt > 0) {
        const Dt = Math.sqrt(4 * flowM3s / (Math.PI * +v.vt)), pick = L.NBS.find(n => { const d = L.pipeID(n, v.sch); return d && d >= Dt; });
        html += `<p class="ls-why">For ${(+v.vt).toFixed(2)} m/s the inside diameter must be ${(Dt * 1000).toFixed(1)} mm. ${pick ? 'The smallest Sch ' + v.sch + ' pipe at least that big is ' + pick + ' NB (' + INCH[pick] + '), ID ' + (L.pipeID(pick, v.sch) * 1000).toFixed(1) + ' mm, which gives ' + (flowM3s / (Math.PI * L.pipeID(pick, v.sch) ** 2 / 4)).toFixed(2) + ' m/s.' : 'That is bigger than the standard sizes listed here.'}</p>`;
      }
      out.innerHTML = html;
    }
    host.addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.k; if (!k) return; const x = e.target.value; v[k] = ['qu', 'mode', 'nb', 'sch', 'chk'].includes(k) ? x : (x === '' ? '' : +x); calc2(); });
    calc2();
  })();
})();
