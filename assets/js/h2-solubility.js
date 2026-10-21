/* PharmaChemE: hydrogen solubility in solvents vs pressure and temperature.
   Henry's law x = p(H2) / H(T); H(T) from published measurements, fitted as ln H = a + b/T between the measured points.
   Sources:
   [B] Brunner E., J. Chem. Eng. Data 30 (1985) 269-273: x at 101.325 kPa H2, 298.15, 323.15 and 373.15 K, measured to about 10-14 MPa.
   [K] Katayama T., Nitta T., J. Chem. Eng. Data 21 (1976) 194-195: Henry's constants in atm, -60 to 25 C (used: -20, 0, 25 C).
   [J] Jaatinen S. et al., J. Chem. Thermodyn. 112 (2017) 1-6: x at 5-12.5 MPa, 323 and 399 K (Henry's constant derived here).
   [W] IUPAC Solubility Data Series vol. 5/6 (Young, 1981), Battino & Wilhelm evaluation for water, 273-353 K. */
(function () {
  'use strict';
  const MPA_ATM = 0.101325;
  const bx = (x298, x323, x373) => [[298.15, MPA_ATM / (x298 * 1e-4)], [323.15, MPA_ATM / (x323 * 1e-4)], [373.15, MPA_ATM / (x373 * 1e-4)]];
  const ka = (h25, h0, hm20) => [[253.15, hm20 * MPA_ATM], [273.15, h0 * MPA_ATM], [298.15, h25 * MPA_ATM]];
  // name, slug (solvent page), molar mass g/mol, density kg/m3 at 20 C, Antoine A B C (mmHg, C), points [[T K, H MPa]], source
  const S = [
    ['n-Hexane', 'n-hexane', 86.18, 659, [6.9895, 1216.92, 227.451], bx(7.13, 8.20, 10.78), 'B'],
    ['n-Octane', 'n-octane', 114.23, 703, [7.14462, 1498.96, 225.874], bx(6.76, 7.88, 9.75), 'B'],
    ['n-Decane', '', 142.28, 730, [7.21745, 1693.93, 216.459], bx(6.73, 8.00, 10.20), 'B'],
    ['Toluene', 'toluene', 92.14, 867, [6.95087, 1342.31, 219.187], bx(3.15, 3.75, 5.05), 'B'],
    ['Acetone', 'acetone', 58.08, 791, [7.11714, 1210.595, 229.664], bx(2.87, 3.50, 4.97), 'B'],
    ['THF', 'thf', 72.11, 889, [7.10537, 1256.68, 232.621], bx(2.70, 3.30, 4.71), 'B'],
    ['1,4-Dioxane', '1-4-dioxane', 88.11, 1033, [7.29909, 1485.85, 234.976], bx(1.84, 2.29, 3.29), 'B'],
    ['NMP', 'nmp', 99.13, 1028, [7.54826, 1979.68, 222.2], bx(1.41, 1.71, 2.40), 'B'],
    ['DMF', 'dmf', 73.09, 944, [7.24128, 1597.92, 213.457], bx(1.47, 1.83, 2.54), 'B'],
    ['Acetonitrile', 'acetonitrile', 41.05, 786, [7.0735, 1279.2, 224.01], bx(1.78, 2.16, 3.02), 'B'],
    ['Methanol', 'methanol', 32.04, 792, [8.08097, 1582.271, 239.726], ka(6160, 7110, 7960), 'K'],
    ['Ethanol', 'ethanol', 46.07, 789, [8.1122, 1592.864, 226.184], ka(4900, 5640, 6400), 'K'],
    ['n-Propanol', 'n-propanol', 60.10, 803, [8.02426, 1598.24, 213.541], ka(4270, 4970, 5550), 'K'],
    ['n-Butanol', 'n-butanol', 74.12, 810, [7.90119, 1608.45, 202.643], ka(3750, 4320, 4770), 'K'],
    ['Isopropanol (IPA)', 'isopropanol', 60.10, 786, [8.87829, 2010.33, 252.636], [[323.4, 361.2], [399.1, 230.4]], 'J'],
    ['Water', 'water', 18.015, 998, [8.07131, 1730.63, 233.426], null, 'W']
  ].map(([name, slug, M, rho, ant, pts, src]) => {
    let a = 0, b = 0, lo = 273.15, hi = 353.15;
    if (pts) { // least squares ln H = a + b/T
      const n = pts.length, X = pts.map(p => 1 / p[0]), Y = pts.map(p => Math.log(p[1]));
      const mx = X.reduce((s, v) => s + v, 0) / n, my = Y.reduce((s, v) => s + v, 0) / n;
      b = X.reduce((s, v, i) => s + (v - mx) * (Y[i] - my), 0) / X.reduce((s, v) => s + (v - mx) ** 2, 0); a = my - b * mx;
      lo = Math.min(...pts.map(p => p[0])); hi = Math.max(...pts.map(p => p[0]));
    }
    return { name, slug, M, rho, ant, src, a, b, lo, hi };
  });
  const SRC = {
    B: 'Brunner, J. Chem. Eng. Data 30 (1985) 269: measured at 25, 50 and 100 °C',
    K: 'Katayama & Nitta, J. Chem. Eng. Data 21 (1976) 194: measured from −20 to 25 °C',
    J: 'Jaatinen et al., J. Chem. Thermodyn. 112 (2017) 1: measured at 50 and 126 °C, 5 to 12.5 MPa',
    W: 'IUPAC Solubility Data Series vol. 5/6 (1981), evaluated equation for 0 to 80 °C'
  };
  function Hmpa(s, TK) { // Henry's constant, MPa
    if (s.src === 'W') { const t = TK / 100, x = Math.exp(-48.1611 + 55.2845 / t + 16.8893 * Math.log(t)); return MPA_ATM / x; }
    return Math.exp(s.a + s.b / TK);
  }
  const pvap = (s, T) => Math.pow(10, s.ant[0] - s.ant[1] / (s.ant[2] + T)) * 1.33322e-4; // MPa
  function status(s, TK) {
    if (TK >= s.lo - 0.5 && TK <= s.hi + 0.5) return ['in', 'Within measured range'];
    const d = TK < s.lo ? s.lo - TK : TK - s.hi;
    return d <= 25 ? ['ext', 'Extrapolated ' + Math.round(d) + ' °C beyond the data'] : ['far', 'Far outside the data (' + Math.round(d) + ' °C): rough only'];
  }
  function solve(s, T, Pg, V) {
    const TK = T + 273.15, Pabs = (Pg + 1.01325) / 10, pv = pvap(s, T), pH2 = Pabs - pv, H = Hmpa(s, TK);
    const x = pH2 > 0 ? pH2 / H : 0, molL = x / (1 - x) * s.rho / s.M; // mol H2 per L of solvent
    return { TK, Pabs, pv, pH2, H, x, molL, mgL: molL * 2.016 * 1000, nm3: molL * 22.414, kg: molL * V * 2.016 / 1000, nm3b: molL * V * 22.414 / 1000, st: status(s, TK) };
  }
  const F = (v, d) => isFinite(v) ? Number(v).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–';
  const sig = v => !isFinite(v) ? '–' : v >= 100 ? F(v, 0) : v >= 10 ? F(v, 1) : v >= 1 ? F(v, 2) : F(v, 3);
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // links that carry the inputs: everything after "#s=" stays in the browser and is never sent to a server
  const pcmeEnc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const pcmeLink = (o) => location.origin + location.pathname + "#s=" + pcmeEnc(o);
  const pcmeRead = (k) => { try { const m = location.hash.match(/[#&]s=([A-Za-z0-9_-]+)/); if (!m) return null; const o = JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))))); return o && o.k === k ? o : null; } catch (e) { return null; } };
  function init() {
    const el = document.getElementById('h2-calc'); if (!el) return;
    const BASE = el.dataset.base || '';
    const v = { s: 3, T: 25, P: 5, V: 1000 };
    { const st = pcmeRead('h2'); if (st && st.v) Object.keys(v).forEach(k => { if (typeof st.v[k] === 'number' && isFinite(st.v[k])) v[k] = st.v[k]; }); }
    el.innerHTML = `<div class="ut-card"><div class="ut-hd"><h3>Hydrogen solubility in a solvent</h3><p>Henry's law with measured constants. Change the solvent, temperature or pressure.</p></div>
      <div class="ut-body"><form class="ut-in" autocomplete="off">
        <label class="ut-f"><span>Solvent</span><select data-k="s">${S.map((s, i) => `<option value="${i}">${esc(s.name)}</option>`).join('')}</select></label>
        <label class="ut-f"><span>Temperature <i>°C</i></span><input data-k="T" type="number" step="any" inputmode="decimal"></label>
        <label class="ut-f"><span>Hydrogen pressure <i>bar g</i></span><input data-k="P" type="number" step="any" inputmode="decimal"></label>
        <label class="ut-f"><span>Solvent in the reactor <i>L</i></span><input data-k="V" type="number" step="any" inputmode="decimal"></label>
      </form><div class="ut-out" aria-live="polite"></div></div>
      <div class="ut-tools"><button type="button" class="ut-xl">Download PDF</button><small>your inputs and result</small></div></div>
      <h2 style="margin-top:28px">All solvents at the same conditions</h2><p class="h2-cond"></p><div style="overflow-x:auto"><table class="ut-table h2-all"></table></div>
      <h2>Effect of temperature in <span class="h2-sname"></span></h2><p>At the same pressure. In organic solvents hydrogen dissolves <b>better when hot</b>, unlike most gases; at a fixed total pressure the rising vapour pressure takes back part of the gain.</p><div style="overflow-x:auto"><table class="ut-table h2-temp"></table></div>`;
    const form = el.querySelector('form'), out = el.querySelector('.ut-out');
    form.querySelector('[data-k="s"]').value = v.s; ['T', 'P', 'V'].forEach(k => form.querySelector(`[data-k="${k}"]`).value = v[k]);
    const tag = st => `<span class="h2-st h2-${st[0]}">${st[0] === 'in' ? 'measured' : st[0] === 'ext' ? 'extrapolated' : 'rough'}</span>`;
    function run() {
      if (![v.T, v.P, v.V].every(isFinite)) { out.innerHTML = '<p class="ut-empty">Fill in every value to see the result.</p>'; return; }
      const s = S[v.s], r = solve(s, v.T, v.P, v.V);
      const notes = [];
      if (r.pH2 <= 0) notes.push(['The solvent\'s own vapour pressure is above the total pressure at this temperature: it would boil. Raise the pressure or lower the temperature.', 'bad']);
      if (r.st[0] !== 'in') notes.push([`${r.st[1]}. The data cover ${F(s.lo - 273.15, 0)} to ${F(s.hi - 273.15, 0)} °C; outside that the van 't Hoff fit is extended.`, r.st[0] === 'far' ? 'bad' : 'warn']);
      if (r.pH2 > 10) notes.push(['Above about 100 bar, Henry\'s law starts to over-predict a little; the measurements behind these constants go to 10 to 14 MPa.', 'warn']);
      notes.push([`Source: ${SRC[s.src]}.` + (s.slug ? ` <a href="${BASE}/solvents/${s.slug}/">${esc(s.name)} data</a>.` : '')]);
      out.innerHTML = r.pH2 <= 0 ? notes.map(n => `<p class="ut-note ${n[1] || ''}">${n[0]}</p>`).join('') : `<dl class="ut-res">
        <div class="lead"><dt>Dissolved hydrogen</dt><dd>${sig(r.mgL)} <small>mg per L of solvent</small></dd></div>
        <div><dt>Mole fraction</dt><dd>${F(r.x * 1e4, 2)} <small>× 10⁻⁴</small></dd></div>
        <div><dt>Concentration</dt><dd>${F(r.molL * 1000, 1)} <small>mmol/L</small></dd></div>
        <div><dt>Gas volume dissolved</dt><dd>${F(r.nm3 * 1000, 1)} <small>NL per m³ solvent</small></dd></div>
        <div><dt>H₂ in ${F(v.V, 0)} L of solvent</dt><dd>${F(r.kg * 1000, 0)} <small>g (${F(r.nm3b * 1000, 0)} NL)</small></dd></div>
        <div><dt>Hydrogen partial pressure</dt><dd>${F(r.pH2 * 10, 2)} <small>bar a</small></dd></div>
        <div><dt>Solvent vapour pressure</dt><dd>${F(r.pv * 10, 3)} <small>bar a</small></dd></div>
        <div><dt>Henry's constant</dt><dd>${sig(r.H)} <small>MPa</small></dd></div>
        <div><dt>Data status</dt><dd>${tag(r.st)}</dd></div></dl>` + notes.map(n => `<p class="ut-note ${n[1] || ''}">${n[0]}</p>`).join('');
      // all solvents
      el.querySelector('.h2-cond').textContent = `At ${F(v.T, 0)} °C and ${F(v.P, 1)} bar g hydrogen, sorted from most to least soluble.`;
      const all = S.map((t, i) => [t, solve(t, v.T, v.P, v.V), i]).sort((a, b) => b[1].mgL - a[1].mgL);
      el.querySelector('.h2-all').innerHTML = `<thead><tr><th>Solvent</th><th>mg/L</th><th>mmol/L</th><th>x × 10⁴</th><th>Henry, MPa</th><th>Data</th></tr></thead><tbody>${all.map(([t, q, i]) => `<tr${i === v.s ? ' class="h2-sel"' : ''}><td>${t.slug ? `<a href="${BASE}/solvents/${t.slug}/">${esc(t.name)}</a>` : esc(t.name)}</td><td>${q.pH2 > 0 ? sig(q.mgL) : 'boils'}</td><td>${q.pH2 > 0 ? F(q.molL * 1000, 1) : '–'}</td><td>${q.pH2 > 0 ? F(q.x * 1e4, 2) : '–'}</td><td>${sig(q.H)}</td><td>${tag(q.st)}</td></tr>`).join('')}</tbody>`;
      // temperature
      el.querySelector('.h2-sname').textContent = s.name;
      const temps = [0, 10, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 120];
      el.querySelector('.h2-temp').innerHTML = `<thead><tr><th>°C</th><th>mg/L</th><th>x × 10⁴</th><th>Henry, MPa</th><th>Vapour pressure, bar a</th><th>Data</th></tr></thead><tbody>${temps.map(T => { const q = solve(s, T, v.P, v.V); return `<tr${T === v.T ? ' class="h2-sel"' : ''}><td>${T}</td><td>${q.pH2 > 0 ? sig(q.mgL) : 'boils'}</td><td>${q.pH2 > 0 ? F(q.x * 1e4, 2) : '–'}</td><td>${sig(q.H)}</td><td>${F(q.pv * 10, 3)}</td><td>${tag(q.st)}</td></tr>`; }).join('')}</tbody>`;
    }
    form.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; v[k] = e.target.value === '' ? NaN : +e.target.value; run(); });
    el.querySelector('.ut-xl').addEventListener('click', e => {
      const b = e.target; if (!window.PCME_XL) return; b.disabled = true; b.textContent = 'Preparing…';
      const s = S[v.s], r = solve(s, v.T, v.P, v.V), temps = [0, 10, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 120];
      window.PCME_XL.dataBook({ link: pcmeLink({ k: 'h2', v }), title: 'Hydrogen solubility', sub: 'Henry\'s law with measured constants (PharmaChemE)',
        inputs: [['Solvent', s.name, ''], ['Temperature', v.T, '°C'], ['Hydrogen pressure', v.P, 'bar g'], ['Solvent volume', v.V, 'L']],
        results: [['Dissolved hydrogen', sig(r.mgL), 'mg/L'], ['Mole fraction', r.x, ''], ['Concentration', F(r.molL * 1000, 2), 'mmol/L'], ['H2 in the solvent volume', F(r.kg * 1000, 1), 'g'], ['Henry constant', sig(r.H), 'MPa'], ['Data status', r.st[1], '']],
        notes: ['x = p(H2) / H(T); p(H2) = total absolute pressure minus solvent vapour pressure (Antoine).', 'Source: ' + SRC[s.src]],
        tables: [{ name: 'All solvents', head: ['Solvent', 'mg/L', 'mmol/L', 'x', 'Henry MPa', 'Data'], rows: S.map(t => { const q = solve(t, v.T, v.P, v.V); return [t.name, +q.mgL.toFixed(2), +(q.molL * 1000).toFixed(2), q.x, +q.H.toFixed(1), q.st[1]]; }) },
          { name: s.name.slice(0, 25) + ' vs T', head: ['T °C', 'mg/L', 'x', 'Henry MPa', 'Vapour pressure bar a', 'Data'], rows: temps.map(T => { const q = solve(s, T, v.P, v.V); return [T, +q.mgL.toFixed(2), q.x, +q.H.toFixed(1), +(q.pv * 10).toFixed(4), q.st[1]]; }) }] })
        .then(() => { b.disabled = false; b.textContent = 'Download PDF'; }, err => window.PCME_XL.fail(b, err));
    });
    run();
  }
  window.PCME_H2 = { S, solve, Hmpa };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
