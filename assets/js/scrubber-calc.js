/* PharmaChemE: scrubbing solution calculator.
   Stoichiometry from molar masses; heats of reaction from standard enthalpies of formation
   (gas + aqueous reagent -> aqueous products, 25 deg C), rounded. Heat in kcal. */
(function () {
  'use strict';
  const root = document.getElementById('scr-app'); if (!root) return;
  const AG = {
    NaOH: { mw: 40.00, label: 'Sodium hydroxide (NaOH)', rho: { 5: 1.054, 10: 1.109, 15: 1.164, 20: 1.219, 30: 1.328, 50: 1.525 } },
    KOH: { mw: 56.11, label: 'Potassium hydroxide (KOH)', rho: { 5: 1.044, 10: 1.090, 15: 1.137, 20: 1.186, 30: 1.288, 45: 1.456 } },
    H2SO4: { mw: 98.08, label: 'Dilute sulphuric acid (H₂SO₄)', rho: { 5: 1.032, 10: 1.066, 15: 1.102, 20: 1.139, 30: 1.219 } },
    H2O2: { mw: 34.01, label: 'Hydrogen peroxide (H₂O₂)', rho: { 3: 1.01, 5: 1.017, 10: 1.034, 20: 1.071, 30: 1.111 } },
  };
  // gas: [name, MW, {agent: [mol agent per mol gas, heat kcal per mol gas, product label, product kg per kmol gas, saturation % w/w of the limiting salt]}, note]
  const GAS = {
    HCl: ['HCl (hydrogen chloride)', 36.46, { NaOH: [1, 31.2, 'NaCl', 58.44, 26], KOH: [1, 31.5, 'KCl', 74.55, 25] }],
    HBr: ['HBr (hydrogen bromide)', 80.91, { NaOH: [1, 33.7, 'NaBr', 102.89, 48], KOH: [1, 34, 'KBr', 119.0, 39] }],
    HF: ['HF (hydrogen fluoride)', 20.01, { KOH: [1, 27.5, 'KF', 58.10, 48], NaOH: [1, 27.5, 'NaF', 41.99, 3.9] }, 'Use KOH: sodium fluoride saturates at only about 4 % and scales the packing.'],
    SO2: ['SO₂ (sulphur dioxide), to sulphite', 64.07, { NaOH: [2, 39.3, 'Na₂SO₃', 126.04, 23], KOH: [2, 39, 'K₂SO₃', 158.26, 50] }, 'Below about pH 9 sulphite turns to bisulphite and SO₂ starts to slip.'],
    Cl2: ['Cl₂ (chlorine)', 70.90, { NaOH: [2, 23.9, 'NaCl + NaOCl', 132.88, 26], KOH: [2, 24, 'KCl + KOCl', 165.1, 25] }, 'Keep free caustic and the liquor below about 40 °C (chlorate forms when hot).'],
    Br2: ['Br₂ (bromine vapour)', 159.81, { NaOH: [2, 17.3, 'NaBr + NaOBr', 221.8, 40], KOH: [2, 17, 'KBr + KOBr', 254, 35] }],
    COCl2: ['COCl₂ (phosgene)', 98.92, { NaOH: [4, 106.1, 'Na₂CO₃ + 2NaCl', 222.87, 17], KOH: [4, 106, 'K₂CO₃ + 2KCl', 287.3, 25] }, 'Use generous excess and outlet phosgene detection; carbonate formed limits the strength you can reach.'],
    HCN: ['HCN (hydrogen cyanide), absorption stage', 27.03, { NaOH: [1, 9.6, 'NaCN', 49.01, 37], KOH: [1, 10, 'KCN', 65.12, 41] }, 'Keep pH above 11. Then oxidise with NaOCl: 2.75 kg NaOCl per kg HCN absorbed, pH above 10.'],
    H2S: ['H₂S (hydrogen sulphide), to hydrosulphide', 34.08, { NaOH: [1, 12.6, 'NaHS', 56.06, 37], KOH: [1, 13, 'KHS', 72.17, 40] }, 'Spent liquor gives H₂S back with acid: keep it away from acid drains.'],
    CH3SH: ['CH₃SH (methyl mercaptan)', 48.11, { NaOH: [1, 10, 'CH₃SNa', 70.09, 40], KOH: [1, 10, 'CH₃SK', 86.2, 40] }, 'Follow with hypochlorite oxidation to destroy the odour.'],
    CO2: ['CO₂ (carbon dioxide, side reaction)', 44.01, { NaOH: [2, 26.2, 'Na₂CO₃', 105.99, 17], KOH: [2, 26, 'K₂CO₃', 138.21, 50] }, 'Not a target gas, but it uses caustic and sodium carbonate crystallises above about 17 %.'],
    NH3: ['NH₃ (ammonia)', 17.03, { H2SO4: [0.5, 20.6, '(NH₄)₂SO₄', 66.07, 43] }],
    NO2: ['NO₂ (nitrogen dioxide)', 46.01, { H2O2: [0.5, 34.7, 'HNO₃', 63.01, 0] }, 'Gives nitric acid: neutralise in a following caustic stage.'],
    NO: ['NO (nitric oxide)', 30.01, { H2O2: [1.5, 71, 'HNO₃', 63.01, 0] }, 'NO must be oxidised by the peroxide before it can be absorbed.'],
  };
  const fmt = (x, d) => (isFinite(x) ? x.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function rhoAt(ag, pct) {
    const t = Object.entries(AG[ag].rho).map(([k, v]) => [+k, v]).sort((a, b) => a[0] - b[0]);
    if (pct <= t[0][0]) return 1 + (t[0][1] - 1) * pct / t[0][0];
    for (let i = 1; i < t.length; i++) if (pct <= t[i][0]) { const [x0, y0] = t[i - 1], [x1, y1] = t[i]; return y0 + (y1 - y0) * (pct - x0) / (x1 - x0); }
    return t[t.length - 1][1];
  }
  const DEF = { NaOH: [10, 2], KOH: [10, 2], H2SO4: [10, 1], H2O2: [5, 0.5] };
  root.innerHTML = `
    <div class="scr-grid">
      <label>Scrubbing liquor<select id="scr-ag">${Object.keys(AG).map(k => `<option value="${k}">${AG[k].label}</option>`).join('')}</select></label>
      <label>Liquor charge in the scrubber tank, kg<input id="scr-m" type="number" min="1" step="any" value="2000"></label>
      <label>Starting strength, % w/w<input id="scr-c" type="number" min="0.1" max="60" step="any" value="10"></label>
      <label>Change-out (minimum free) strength, % w/w<input id="scr-cmin" type="number" min="0" step="any" value="2"></label>
      <label>Design excess on the agent, %<input id="scr-x" type="number" min="0" step="any" value="20"></label>
      <label>Liquor start temperature, &deg;C<input id="scr-t" type="number" step="any" value="30"></label>
    </div>
    <h3 class="scr-h">Gases released per batch</h3>
    <div id="scr-rows"></div>
    <button type="button" class="scr-addbtn" id="scr-add">+ Add a gas</button>
    <div id="scr-out" aria-live="polite"></div>`;
  const $ = id => root.querySelector('#' + id);
  let rows = [['HCl', 60]];
  function gasesFor(ag) { return Object.keys(GAS).filter(g => GAS[g][2][ag]); }
  function drawRows() {
    const ag = $('scr-ag').value, ok = gasesFor(ag);
    rows = rows.filter(r => ok.includes(r[0])); if (!rows.length) rows = [[ok[0], 50]];
    $('scr-rows').innerHTML = rows.map((r, i) => `<div class="scr-row"><select data-i="${i}" class="scr-g" aria-label="Gas">${ok.map(g => `<option value="${g}"${g === r[0] ? ' selected' : ''}>${GAS[g][0]}</option>`).join('')}</select>
      <label class="scr-kg"><input data-i="${i}" class="scr-q" type="number" min="0" step="any" value="${r[1]}" aria-label="kg of gas per batch"> kg per batch</label>
      ${rows.length > 1 ? `<button type="button" class="scr-rm" data-i="${i}" aria-label="Remove gas">×</button>` : ''}</div>`).join('');
  }
  function calc() {
    const ag = $('scr-ag').value, A = AG[ag], M = +$('scr-m').value, c = +$('scr-c').value, cmin = +$('scr-cmin').value, x = +$('scr-x').value, T0 = +$('scr-t').value;
    const out = $('scr-out');
    if (!(M > 0 && c > 0 && cmin >= 0 && cmin < c)) { out.innerHTML = '<p class="scr-warn">Enter a liquor charge, and a change-out strength lower than the starting strength.</p>'; return null; }
    let agent = 0, heat = 0, gasKg = 0, salts = [], notes = [];
    rows.filter(r => GAS[r[0]][2][ag]).forEach(([g, q]) => {
      q = +q || 0; const G = GAS[g], d = G[2][ag]; const kmol = q / G[1];
      const a = kmol * d[0] * A.mw; agent += a; heat += kmol * 1000 * d[1]; gasKg += q;
      salts.push({ g, name: d[2], kg: kmol * d[3], sat: d[4], ratio: d[0] * A.mw / G[1], a, q });
      if (G[3]) notes.push(`<b>${esc(G[0].split(' (')[0])}:</b> ${esc(G[3])}`);
    });
    const agentDesign = agent * (1 + x / 100);
    const free0 = M * c / 100, reserve = M * cmin / 100, usable = free0 - reserve;
    const batches = agentDesign > 0 ? Math.floor(usable / agentDesign) : Infinity;
    const cp = ag === 'H2O2' || ag === 'H2SO4' ? 0.95 : (c <= 10 ? 0.92 : c <= 20 ? 0.88 : 0.82); // kcal/kg.degC, dilute solutions
    const dT = heat / (M * cp);
    const minCharge = agentDesign / ((c - cmin) / 100);
    const rho = rhoAt(ag, c), litres = M / rho;
    // salt concentration at change-out (after the batches that fit)
    const nb = isFinite(batches) ? Math.max(batches, 1) : 1;
    const massEnd = M + nb * gasKg;
    const saltRows = salts.map(s => { const pct = 100 * nb * s.kg / massEnd; return { ...s, pct }; });
    const satWarn = saltRows.filter(s => s.sat && s.pct > 0.8 * s.sat);
    let h = `<div class="scr-res">
      <div class="scr-kpi"><span>Agent used per batch</span><b>${fmt(agent, 1)} kg</b><small>100 % ${esc(ag)}; ${fmt(agentDesign, 1)} kg with ${fmt(x, 0)} % excess</small></div>
      <div class="scr-kpi"><span>Batches per liquor charge</span><b>${isFinite(batches) ? batches : '–'}</b><small>${fmt(usable, 1)} kg usable ${esc(ag)} above the ${fmt(cmin, 1)} % change-out</small></div>
      <div class="scr-kpi"><span>Heat released per batch</span><b>${fmt(heat, 0)} kcal</b><small>about ${fmt(dT, 1)} &deg;C rise in the liquor if not cooled (${fmt(T0 + dT, 1)} &deg;C)</small></div>
      <div class="scr-kpi"><span>Minimum charge for one batch</span><b>${fmt(minCharge, 0)} kg</b><small>of ${fmt(c, 1)} % liquor, keeping the reserve and excess</small></div>
    </div>`;
    h += `<table class="scr-tab"><thead><tr><th>Gas</th><th>kg per batch</th><th>kg ${esc(ag)} per kg gas</th><th>${esc(ag)} used, kg</th><th>Product formed</th><th>Product at change-out</th></tr></thead><tbody>` +
      saltRows.map(s => `<tr><td>${esc(GAS[s.g][0].split(',')[0])}</td><td>${fmt(s.q, 1)}</td><td>${fmt(s.ratio, 2)}</td><td>${fmt(s.a, 1)}</td><td>${esc(s.name)}: ${fmt(s.kg, 1)} kg</td><td>${s.sat ? fmt(s.pct, 1) + ' % (saturates near ' + s.sat + ' %)' : fmt(s.pct, 1) + ' %'}</td></tr>`).join('') + '</tbody></table>';
    h += `<p class="scr-mute">Liquor charge ${fmt(M, 0)} kg is about ${fmt(litres, 0)} L at ${fmt(c, 1)} % (density ${fmt(rho, 3)} kg/L). Batches assume the change-out strength is checked by titration before each batch.</p>`;
    if (dT > 15) notes.unshift(`<b>Heat:</b> a ${fmt(dT, 0)} &deg;C rise per batch is large. Cool the liquor (heat exchanger on the recirculation loop) or increase the charge; hot liquor absorbs worse and can release SO₂, NH₃ or Cl₂ again.`);
    if (satWarn.length) notes.unshift(`<b>Solids risk:</b> ${satWarn.map(s => esc(s.name)).join(', ')} will be near saturation at change-out. Change the liquor earlier or start more dilute to avoid blocking packing and nozzles.`);
    if (ag === 'NaOH' && rows.some(r => r[0] === 'HF')) notes.unshift('<b>HF with NaOH:</b> sodium fluoride saturates at about 4 %. Use KOH instead.');
    if (rows.some(r => r[0] === 'Cl2') && rows.some(r => ['HCl', 'HBr', 'SO2', 'CO2'].includes(r[0]))) notes.push('<b>Mixed vent:</b> acid gases reduce the free caustic; if it runs out, hypochlorite in the liquor releases chlorine. Change out at a higher strength.');
    if (notes.length) h += '<div class="scr-notes">' + notes.map(n => `<p>${n}</p>`).join('') + '</div>';
    h += '<div class="scr-act"><button type="button" class="btn btn-outline btn-sm" id="scr-xl">Download Excel</button></div>';
    out.innerHTML = h;
    return { ag, M, c, cmin, x, T0, agent, agentDesign, batches, heat, dT, minCharge, saltRows, litres, rho };
  }
  function excel(r) {
    if (!window.PCME_XL) return;
    const btn = $('scr-xl'); btn.disabled = true; btn.textContent = 'Preparing…';
    const inputs = [{ k: 'M', label: 'Liquor charge', unit: 'kg', value: r.M }, { k: 'c', label: 'Starting strength', unit: '% w/w ' + r.ag, value: r.c }, { k: 'cmin', label: 'Change-out strength', unit: '% w/w', value: r.cmin }, { k: 'x', label: 'Design excess', unit: '%', value: r.x }];
    const xl = [['free0', 'Free agent at start', '{M}*{c}/100', 'kg'], ['usable', 'Usable agent above change-out', '{M}*({c}-{cmin})/100', 'kg']];
    r.saltRows.forEach((s, i) => { inputs.push({ k: 'q' + i, label: GAS[s.g][0] + ' per batch', unit: 'kg', value: s.q }); inputs.push({ k: 'r' + i, label: 'kg ' + r.ag + ' per kg ' + s.g, unit: 'kg/kg', value: +s.ratio.toFixed(4) }); });
    xl.push(['agent', 'Agent per batch (stoichiometric)', r.saltRows.map((s, i) => `{q${i}}*{r${i}}`).join('+'), 'kg']);
    xl.push(['design', 'Agent per batch with excess', '{agent}*(1+{x}/100)', 'kg']);
    xl.push(['nb', 'Batches per charge', 'IF({design}>0,ROUNDDOWN({usable}/{design},0),0)', 'batches']);
    window.PCME_XL.calcSheet({ title: 'Scrubbing solution calculation', sub: 'Liquor: ' + r.ag, inputs, xl: xl.map(z => z[0] === 'nb' ? ['nb', z[1], 'ROUNDDOWN({usable}/{design},0)', 'batches'] : z),
      rows: [['Heat released per batch', fmt(r.heat, 0), 'kcal'], ['Temperature rise per batch (no cooling)', fmt(r.dT, 1), '°C'], ['Minimum charge for one batch', fmt(r.minCharge, 0), 'kg']].concat(r.saltRows.map(s => ['Product ' + s.name + ' per batch', fmt(s.kg, 1), 'kg'])),
      notes: ['Stoichiometry from molar masses; heats from standard enthalpies of formation, about ±10 %. Verify change-out by titration.'] })
      .then(() => { btn.disabled = false; btn.textContent = 'Download Excel'; }, e => window.PCME_XL.fail(btn, e));
  }
  let last = null;
  const run = () => { last = calc(); };
  root.addEventListener('input', e => {
    if (e.target.classList.contains('scr-q')) rows[+e.target.dataset.i][1] = e.target.value;
    if (e.target.tagName === 'SELECT') return;
    run();
  });
  root.addEventListener('change', e => {
    if (e.target.id === 'scr-ag') { const d = DEF[e.target.value]; $('scr-c').value = d[0]; $('scr-cmin').value = d[1]; drawRows(); }
    if (e.target.classList.contains('scr-g')) rows[+e.target.dataset.i][0] = e.target.value;
    run();
  });
  root.addEventListener('click', e => {
    if (e.target.id === 'scr-add') { const ok = gasesFor($('scr-ag').value); const nx = ok.find(g => !rows.some(r => r[0] === g)) || ok[0]; rows.push([nx, 10]); drawRows(); run(); }
    if (e.target.classList.contains('scr-rm')) { rows.splice(+e.target.dataset.i, 1); drawRows(); run(); }
    if (e.target.id === 'scr-xl' && last) excel(last);
  });
  drawRows(); run();
  window.PCME_SCRUB = { GAS, AG, calc: () => last };
})();
