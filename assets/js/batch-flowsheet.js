/* PharmaChemE batch flowsheet and mass balance (free tool).
   Steps of a batch process, each with its charges and an operation. Quantities are entered as in the lab procedure
   (mass, volume, volumes per key material, or mole equivalents) and scaled to the plant batch.
   compute(state) is pure and is exported as window.PCME_BFD for testing. Units: kg, °C, kcal. */
(function () {
  'use strict';
  var STORE = 'pcme-batch-flowsheet-v1';
  var DESTS = ['Solvent recovery', 'ETP', 'Incineration', 'Scrubber / vent', 'Loss'];
  var LAYERS = { org: 'Organic', aq: 'Aqueous', solid: 'Solid (undissolved)', gas: 'Gas' };
  var TYPES = {
    add: { label: 'Charge / add', addLabel: 'Charges' },
    react: { label: 'React', addLabel: 'Charges' },
    sep: { label: 'Separate layers', addLabel: 'Charges before settling (water, brine, solvent)' },
    dist: { label: 'Distil / concentrate', addLabel: 'Charges' },
    cryst: { label: 'Crystallise', addLabel: 'Charges (antisolvent, seed)' },
    filt: { label: 'Filter and wash', addLabel: 'Wash' },
    dry: { label: 'Dry', addLabel: null }
  };
  var UNITS = { mass: 'mass', vol: 'volume', V: 'volumes (V)', eq: 'mole eq' };

  /* ---------- helpers ---------- */
  function num(x) { var v = parseFloat(x); return isFinite(v) ? v : NaN; }
  function tot(m) { var s = 0; for (var k in m) s += m[k]; return s; }
  function addTo(m, k, v) { if (!(v > 0)) return; m[k] = (m[k] || 0) + v; }
  function take(m, k, v) { var have = m[k] || 0, t = Math.min(have, v); m[k] = have - t; if (m[k] < 1e-12) delete m[k]; return t; }
  function scaleMap(m, f) { var o = {}; for (var k in m) if (m[k] * f > 0) o[k] = m[k] * f; return o; }
  function merge(a, b) { var o = {}; for (var k in a) addTo(o, k, a[k]); for (k in b) addTo(o, k, b[k]); return o; }
  function stream(liq, sol) { return { liq: liq || {}, sol: sol || {} }; }
  function sTot(s) { return tot(s.liq) + tot(s.sol); }
  function clone(s) { return stream(merge(s.liq, {}), merge(s.sol, {})); }
  function uid() { return 'm' + Math.random().toString(36).slice(2, 8); }

  /* ---------- engine ---------- */
  function compute(st) {
    var R = { steps: [], charges: [], sides: [], warn: [], errs: [] };
    var M = {}; st.mats.forEach(function (m) { M[m.id] = m; });
    var b = st.basis, key = M[b.key], P = M[b.product];
    var unitF = b.unit === 'g' ? 0.001 : 1, bq = num(b.qty), pl = num(b.plant), cp = num(st.cp);
    if (!key) R.errs.push('Choose the key raw material in the batch basis.');
    if (!P) R.errs.push('Choose the product in the batch basis.');
    if (!(bq > 0)) R.errs.push('Enter the quantity of key material in the procedure (greater than zero).');
    if (!(pl > 0)) R.errs.push('Enter the plant batch size (greater than zero).');
    if (!(cp > 0)) R.errs.push('Enter a heat capacity greater than zero.');
    if (!st.steps.length) R.errs.push('Add at least one step.');
    if (R.errs.length) return R;
    var s = pl / (bq * unitF); R.scale = s;
    function kgOf(a, where) {
      var m = M[a.m], q = num(a.q);
      if (!m) { R.warn.push(where + ': a charge has no material selected.'); return 0; }
      if (!(q >= 0)) { R.warn.push(where + ': enter a quantity for ' + m.n + ' (zero or more).'); return 0; }
      var base;
      if (a.u === 'mass') base = q;
      else if (a.u === 'vol') { if (!(num(m.rho) > 0)) { R.warn.push(where + ': ' + m.n + ' needs a density to use volume.'); return 0; } base = q * num(m.rho); }
      else if (a.u === 'V') { if (!(num(m.rho) > 0)) { R.warn.push(where + ': ' + m.n + ' needs a density to use volumes (V).'); return 0; } base = q * bq * num(m.rho); }
      else if (a.u === 'eq') {
        if (!(num(m.mw) > 0) || !(num(key.mw) > 0)) { R.warn.push(where + ': mole equivalents need the molar mass of ' + m.n + ' and of ' + key.n + '.'); return 0; }
        base = q * bq / num(key.mw) * num(m.mw);
      } else return 0;
      return base * unitF * s;
    }
    var cur = stream(), keyCharged = 0, pCharged = 0, theo = null, rxIn = 0, rxOut = 0;
    function side(step, name, liq, sol, dest) {
      var x = { step: step.i, stepName: step.name, name: name, liq: liq || {}, sol: sol || {}, dest: dest };
      x.kg = sTot(x); if (x.kg <= 1e-9) return;
      x.id = 'W-' + (R.sides.length + 1); R.sides.push(x); step.sides.push(x);
    }
    function isVol(id) { return M[id] && M[id].vol; }
    function layerOf(id) { return M[id] ? M[id].layer : 'org'; }
    function ventGas(step) { var g = {}; for (var k in cur.liq) if (layerOf(k) === 'gas') { g[k] = cur.liq[k]; delete cur.liq[k]; } if (tot(g) > 0) side(step, 'Off-gas', g, {}, 'Scrubber / vent'); }

    st.steps.forEach(function (sp, i) {
      var T = TYPES[sp.type] ? sp.type : 'add', p = sp.p || {};
      var step = { i: i + 1, name: (sp.name || TYPES[T].label), type: T, sides: [], notes: [], charges: [] };
      var where = 'Step ' + step.i + ' (' + step.name + ')';
      var ch = stream();
      (sp.add || []).forEach(function (a) {
        var kg = kgOf(a, where); if (!(kg > 0)) return;
        var c = { step: step.i, stepName: step.name, m: a.m, kg: kg }; R.charges.push(c); step.charges.push(c);
        if (a.m === b.key) keyCharged += kg; if (a.m === b.product) pCharged += kg;
        if (layerOf(a.m) === 'solid') addTo(ch.sol, a.m, kg); else addTo(ch.liq, a.m, kg);
      });
      step.chargeKg = sTot(ch);
      if (T !== 'filt') { cur = stream(merge(cur.liq, ch.liq), merge(cur.sol, ch.sol)); }
      step.vessel = sTot(cur) + (T === 'filt' ? sTot(ch) : 0);
      if (T === 'add') ventGas(step);
      else if (T === 'react') {
        var rx = p.rx || { r: [], pr: [] }, rs = (rx.r || []).filter(function (x) { return M[x.m]; }), ps = (rx.pr || []).filter(function (x) { return M[x.m]; });
        var conv = num(p.conv), dH = num(p.dH);
        if (!rs.length || !ps.length) step.notes.push(['No reaction defined: this step only mixes its charges.', 'warn']);
        else {
          var bad = rs.concat(ps).filter(function (x) { return !(num(M[x.m].mw) > 0) || !(num(x.nu) > 0); });
          if (bad.length) step.notes.push(['Every reactant and product needs a molar mass and a stoichiometric coefficient greater than zero.', 'err']);
          else if (!(conv >= 0 && conv <= 100)) step.notes.push(['Conversion must be between 0 and 100 %.', 'err']);
          else {
            var k0 = rs[0], avail = function (id) { return (cur.liq[id] || 0) + (cur.sol[id] || 0); };
            var n = conv / 100 * avail(k0.m) / num(M[k0.m].mw) / num(k0.nu); // kmol of reaction events
            var lim = null;
            rs.forEach(function (x) { var nmax = avail(x.m) / num(M[x.m].mw) / num(x.nu); if (nmax < n - 1e-12) { n = nmax; lim = x; } });
            if (lim) step.notes.push(['Not enough ' + M[lim.m].n + ' for the conversion asked: it runs out first and limits the reaction.', 'warn']);
            var mr = 0, mp = 0;
            rs.forEach(function (x) { var need = n * num(x.nu) * num(M[x.m].mw); mr += need; var t = take(cur.liq, x.m, need); take(cur.sol, x.m, need - t); });
            ps.forEach(function (x) { var made = n * num(x.nu) * num(M[x.m].mw); mp += made; if (layerOf(x.m) === 'solid') addTo(cur.sol, x.m, made); else addTo(cur.liq, x.m, made); });
            rxIn += mr; rxOut += mp;
            var sr = rs.reduce(function (a, x) { return a + num(x.nu) * num(M[x.m].mw); }, 0), sp2 = ps.reduce(function (a, x) { return a + num(x.nu) * num(M[x.m].mw); }, 0);
            if (Math.abs(sr - sp2) > 0.005 * sr) step.notes.push(['The reaction does not balance by mass: reactants ' + f1(sr) + ', products ' + f1(sp2) + ' g/mol of reaction. Check the molar masses and coefficients.', 'err']);
            step.n = n; step.conv = n * num(k0.nu) * num(M[k0.m].mw) / Math.max(1e-12, (avail(k0.m) + n * num(k0.nu) * num(M[k0.m].mw))) * 100;
            if (theo === null && k0.m === b.key) { var pp = ps.filter(function (x) { return x.m === b.product; })[0]; if (pp) theo = { kmolPerKg: num(pp.nu) / num(k0.nu) / num(key.mw), mw: num(P.mw) }; }
            if (isFinite(dH) && dH !== 0) {
              step.Q = -dH * n * 1000; step.dTad = step.Q / (step.vessel * cp);
              if (step.Q > 0) {
                var lvl = step.dTad < 20 ? ['ok', 'low'] : step.dTad < 50 ? ['warn', 'moderate: plan the dosing and cooling'] : ['err', 'high: a loss of cooling could run away. Do a hazard study before scale-up'];
                step.notes.push(['Heat released ' + f0(step.Q) + ' kcal. Adiabatic temperature rise ' + f1(step.dTad) + ' °C, ' + lvl[1] + '.', lvl[0]]);
              } else step.notes.push(['Endothermic: ' + f0(-step.Q) + ' kcal must be supplied.', 'ok']);
            }
          }
        }
        ventGas(step);
      } else if (T === 'sep') {
        var keep = p.keep === 'aq' ? 'aq' : 'org', loss = num(p.loss); if (!(loss >= 0 && loss <= 100)) { loss = 0; step.notes.push(['Product loss must be 0 to 100 %; 0 used.', 'warn']); }
        var kept = {}, gone = {};
        for (var k in cur.liq) {
          var L = layerOf(k), v = cur.liq[k];
          if (L === 'gas') continue;
          var into = L === 'aq' ? 'aq' : 'org';
          if (k === b.product) { var lost = v * loss / 100; if (into === keep) { addTo(kept, k, v - lost); addTo(gone, k, lost); } else { addTo(gone, k, v - lost); addTo(kept, k, lost); } }
          else if (into === keep) addTo(kept, k, v); else addTo(gone, k, v);
        }
        var hasAq = Object.keys(cur.liq).some(function (k) { return layerOf(k) === 'aq'; }), hasOrg = Object.keys(cur.liq).some(function (k) { return layerOf(k) === 'org'; });
        if (!hasAq || !hasOrg) step.notes.push(['Only one liquid layer is present, so nothing separates. Add water or an organic solvent first.', 'warn']);
        if (tot(cur.sol) > 0) step.notes.push(['Solids are present; they are kept with the ' + (keep === 'org' ? 'organic' : 'aqueous') + ' layer. Filter first if they should be removed.', 'warn']);
        if (P && layerOf(b.product) !== keep && (kept[b.product] || 0) < (gone[b.product] || 0)) step.notes.push(['Most of the product is in the layer you discard. Check which layer you keep.', 'err']);
        var g = {}; for (k in cur.liq) if (layerOf(k) === 'gas') g[k] = cur.liq[k];
        cur = stream(kept, cur.sol);
        side(step, (keep === 'org' ? 'Aqueous' : 'Organic') + ' layer', gone, {}, p.dest || (keep === 'org' ? 'ETP' : 'Incineration'));
        if (tot(g)) side(step, 'Off-gas', g, {}, 'Scrubber / vent');
      } else if (T === 'dist') {
        var pct = num(p.pct), eff = num(p.eff), tgt = p.tgt || 'all';
        if (!(pct >= 0 && pct <= 100)) { step.notes.push(['Percentage distilled must be 0 to 100 %.', 'err']); pct = 0; }
        if (!(eff >= 0 && eff <= 100)) { step.notes.push(['Condenser recovery must be 0 to 100 %.', 'err']); eff = 100; }
        var dist = {}, lossV = {};
        for (k in cur.liq) {
          if (!(tgt === 'all' ? isVol(k) : k === tgt)) continue;
          var d = cur.liq[k] * pct / 100; take(cur.liq, k, d); addTo(dist, k, d * eff / 100); addTo(lossV, k, d * (1 - eff / 100));
        }
        if (!tot(dist) && !tot(lossV)) step.notes.push(['Nothing to distil: ' + (tgt === 'all' ? 'no volatile material is present.' : (M[tgt] ? M[tgt].n : 'the chosen material') + ' is not present.'), 'warn']);
        var resid = sTot(cur);
        if (resid > 0 && tot(cur.liq) / resid < 0.15 && tot(cur.sol) + tot(cur.liq) > 0) step.notes.push(['Less than 15 % liquid is left: the residue may be too thick to stir or discharge.', 'warn']);
        side(step, 'Distillate', dist, {}, p.dest || 'Solvent recovery'); side(step, 'Uncondensed vapour', lossV, {}, 'Scrubber / vent');
      } else if (T === 'cryst') {
        var S = num(p.sol);
        if (!(S >= 0)) step.notes.push(['Enter the solubility of the product at the final temperature (zero or more).', 'err']);
        else if (!P || !(cur.liq[b.product] > 0)) step.notes.push(['No dissolved product to crystallise.', 'warn']);
        else {
          var solv = 0; for (k in cur.liq) if (k !== b.product && isVol(k)) solv += cur.liq[k];
          var maxD = S / 100 * solv, have = cur.liq[b.product];
          if (have > maxD) { var x = have - maxD; take(cur.liq, b.product, x); addTo(cur.sol, b.product, x); step.notes.push([f1(x) + ' kg of product crystallises; ' + f1(maxD) + ' kg stays dissolved (' + f1(maxD / have * 100) + ' %).', 'ok']); }
          else step.notes.push(['The solution is not saturated at the final temperature: no solid forms. Distil more solvent, add antisolvent or check the solubility.', 'err']);
          if (solv > 0 && sTot(cur) > 0 && tot(cur.sol) / sTot(cur) > 0.35) step.notes.push(['The slurry is more than 35 % solids by mass: it may be hard to stir and transfer.', 'warn']);
        }
      } else if (T === 'filt') {
        var lod = num(p.lod), wl = num(p.wl);
        if (!(lod >= 0 && lod < 100)) { step.notes.push(['Wet cake LOD must be from 0 to below 100 %.', 'err']); lod = 0; }
        if (!(wl >= 0 && wl <= 100)) { step.notes.push(['Product loss in the wash must be 0 to 100 %.', 'err']); wl = 0; }
        var wash = merge(ch.liq, {}); var washSol = ch.sol;
        if (!tot(cur.sol)) step.notes.push(['There are no solids to filter.', 'warn']);
        if (tot(washSol)) { cur.sol = merge(cur.sol, washSol); step.notes.push(['A solid charged as wash stays in the cake.', 'warn']); }
        if (P && cur.sol[b.product] > 0 && wl > 0) { var dsl = cur.sol[b.product] * wl / 100; take(cur.sol, b.product, dsl); addTo(tot(wash) > 0 ? wash : cur.liq, b.product, dsl); }
        var cs = tot(cur.sol), need = lod > 0 ? cs * lod / (100 - lod) : 0, cakeL = {};
        var fromW = Math.min(need, tot(wash)), wT = tot(wash);
        if (fromW > 0) for (k in wash) { var t2 = wash[k] / wT * fromW; take(wash, k, t2); addTo(cakeL, k, t2); }
        var rest = need - fromW, mlT = tot(cur.liq);
        if (rest > 0) { if (mlT < rest - 1e-9) step.notes.push(['Not enough liquid to wet the cake to the LOD you set; the cake leaves with all the liquid.', 'warn']); var f = Math.min(1, rest / Math.max(mlT, 1e-12)); for (k in cur.liq) { var t3 = cur.liq[k] * f; addTo(cakeL, k, t3); cur.liq[k] -= t3; } }
        var filtrate = merge(cur.liq, wash);
        cur = stream(cakeL, cur.sol);
        side(step, 'Mother liquor and washes', filtrate, {}, p.dest || 'Solvent recovery');
        step.wetCake = sTot(cur);
      } else if (T === 'dry') {
        var lod2 = num(p.lod), hl = num(p.hl);
        if (!(lod2 >= 0 && lod2 < 100)) { step.notes.push(['Final LOD must be from 0 to below 100 %.', 'err']); lod2 = 0; }
        if (!(hl >= 0 && hl < 100)) { step.notes.push(['Handling loss must be from 0 to below 100 %.', 'err']); hl = 0; }
        if (!tot(cur.sol)) step.notes.push(['There are no solids to dry. Filter first.', 'warn']);
        var nv = 0, vv = 0; for (k in cur.liq) { if (isVol(k)) vv += cur.liq[k]; else nv += cur.liq[k]; }
        var sol0 = tot(cur.sol), target = lod2 > 0 ? (sol0 + nv) * lod2 / (100 - lod2) : 0; // volatile liquid allowed
        var cond = {};
        if (vv > target) { var fr = (vv - target) / vv; for (k in cur.liq) if (isVol(k)) { var t4 = cur.liq[k] * fr; take(cur.liq, k, t4); addTo(cond, k, t4); } }
        if (nv > 0 && sol0 > 0 && nv / (sol0 + nv) * 100 > lod2 + 0.05) step.notes.push(['Non-volatile liquid (' + f1(nv) + ' kg) stays in the solid; drying cannot remove it.', 'warn']);
        side(step, 'Dryer condensate', cond, {}, p.dest || 'Solvent recovery');
        if (hl > 0) { var lq = scaleMap(cur.liq, hl / 100), ls = scaleMap(cur.sol, hl / 100); for (k in lq) take(cur.liq, k, lq[k]); for (k in ls) take(cur.sol, k, ls[k]); side(step, 'Handling loss', lq, ls, 'Loss'); }
      }
      step.out = clone(cur); step.outKg = sTot(cur); step.id = 'S-' + step.i;
      R.steps.push(step);
      step.notes.forEach(function (n2) { if (n2[1] !== 'ok') R.warn.push(where + ': ' + n2[0]); });
    });
    R.final = cur;
    R.charged = R.charges.reduce(function (a, c) { return a + c.kg; }, 0);
    R.sideKg = R.sides.reduce(function (a, x) { return a + x.kg; }, 0);
    R.outKg = sTot(cur);
    R.balErr = R.charged - R.sideKg - R.outKg; // closes unless the reaction is unbalanced
    R.pSolid = P ? (cur.sol[b.product] || 0) : 0; R.pAll = P ? R.pSolid + (cur.liq[b.product] || 0) : 0;
    R.assay = R.outKg > 0 ? R.pAll / R.outKg * 100 : NaN;
    if (theo) { R.theo = keyCharged * theo.kmolPerKg * theo.mw; R.yieldBasis = 'theoretical from ' + key.n; }
    else if (pCharged > 0) { R.theo = pCharged; R.yieldBasis = 'product charged'; }
    R.yield = R.theo > 0 ? R.pAll / R.theo * 100 : NaN;
    R.keyCharged = keyCharged;
    if (Math.abs(keyCharged - bq * unitF * s) > 0.005 * bq * unitF * s) R.warn.push('The key material charged (' + f1(keyCharged) + ' kg) is not the plant batch size (' + f1(pl) + ' kg). Check the charges or the batch basis.');
    if (R.yield > 100.5) R.warn.push('The yield is above 100 %. Check the molar masses, the charges and the drying LOD.');
    R.pmi = R.outKg > 0 ? R.charged / R.outKg : NaN;
    R.byDest = {}; DESTS.forEach(function (d) { R.byDest[d] = 0; }); R.sides.forEach(function (x) { R.byDest[x.dest] = (R.byDest[x.dest] || 0) + x.kg; });
    R.efactor = R.outKg > 0 ? (R.charged - R.outKg) / R.outKg : NaN;
    R.efactorRec = R.outKg > 0 ? (R.charged - R.outKg - R.byDest['Solvent recovery']) / R.outKg : NaN;
    // solvent recovery per volatile material
    R.solv = st.mats.filter(function (m) { return m.vol && m.layer !== 'gas'; }).map(function (m) {
      var c = R.charges.filter(function (x) { return x.m === m.id; }).reduce(function (a, x) { return a + x.kg; }, 0);
      var r = R.sides.filter(function (x) { return x.dest === 'Solvent recovery'; }).reduce(function (a, x) { return a + (x.liq[m.id] || 0); }, 0);
      return { id: m.id, n: m.n, charged: c, toRec: r };
    }).filter(function (x) { return x.charged > 0; });
    if (Math.abs(R.balErr) > 1e-6 * Math.max(1, R.charged) && Math.abs(rxIn - rxOut) < 1e-9) R.warn.push('Internal check: the balance does not close. Please report this case.');
    return R;
  }
  function f0(x) { return isFinite(x) ? Math.round(x).toLocaleString('en-US') : '–'; }
  function f1(x) { if (!isFinite(x)) return '–'; var a = Math.abs(x); return a >= 100 ? f0(x) : a >= 10 ? x.toFixed(1) : a >= 0.1 ? x.toFixed(2) : a === 0 ? '0' : x.toPrecision(2); }
  window.PCME_BFD = { compute: compute, TYPES: TYPES, DESTS: DESTS };

  /* ---------- example: an amide-type coupling in toluene, quench, wash, concentrate, antisolvent crystallisation ---------- */
  function example() {
    return {
      basis: { key: 'ksm', product: 'p', qty: 100, unit: 'g', plant: 500, name: 'Example: coupling, work-up and crystallisation' }, cp: 0.45,
      mats: [
        { id: 'ksm', n: 'Key starting material (KSM)', mw: 250, rho: 1.2, layer: 'org', vol: false },
        { id: 'rg', n: 'Acid chloride (excess hydrolyses in the quench)', mw: 160, rho: 1.15, layer: 'aq', vol: false },
        { id: 'tea', n: 'Triethylamine', mw: 101.19, rho: 0.726, layer: 'org', vol: true },
        { id: 'sal', n: 'Triethylamine hydrochloride', mw: 137.65, rho: 1.1, layer: 'aq', vol: false },
        { id: 'p', n: 'Product', mw: 373.54, rho: 1.25, layer: 'org', vol: false },
        { id: 'tol', n: 'Toluene', mw: 92.14, rho: 0.867, layer: 'org', vol: true },
        { id: 'w', n: 'Water', mw: 18.02, rho: 1.0, layer: 'aq', vol: true },
        { id: 'hep', n: 'n-Heptane', mw: 100.2, rho: 0.684, layer: 'org', vol: true }
      ],
      steps: [
        { type: 'react', name: 'Charge and react', add: [{ m: 'ksm', q: 100, u: 'mass' }, { m: 'tol', q: 6, u: 'V' }, { m: 'tea', q: 1.3, u: 'eq' }, { m: 'rg', q: 1.15, u: 'eq' }],
          p: { conv: 98, dH: -28, rx: { r: [{ m: 'ksm', nu: 1 }, { m: 'rg', nu: 1 }, { m: 'tea', nu: 1 }], pr: [{ m: 'p', nu: 1 }, { m: 'sal', nu: 1 }] } } },
        { type: 'sep', name: 'Water quench and layer cut', add: [{ m: 'w', q: 3, u: 'V' }], p: { keep: 'org', loss: 1, dest: 'ETP' } },
        { type: 'sep', name: 'Water wash', add: [{ m: 'w', q: 2, u: 'V' }], p: { keep: 'org', loss: 0.5, dest: 'ETP' } },
        { type: 'dist', name: 'Concentrate', add: [], p: { tgt: 'all', pct: 75, eff: 98, dest: 'Solvent recovery' } },
        { type: 'cryst', name: 'Add heptane and cool', add: [{ m: 'hep', q: 4, u: 'V' }], p: { sol: 1.2 } },
        { type: 'filt', name: 'Centrifuge and wash', add: [{ m: 'hep', q: 1, u: 'V' }], p: { lod: 20, wl: 0.5, dest: 'Solvent recovery' } },
        { type: 'dry', name: 'Dry', add: [], p: { lod: 0.5, hl: 0.3, dest: 'Solvent recovery' } }
      ]
    };
  }
  function blank() {
    return { basis: { key: 'k', product: 'p', qty: 100, unit: 'g', plant: 100, name: '' }, cp: 0.45,
      mats: [{ id: 'k', n: 'Key raw material', mw: '', rho: 1, layer: 'org', vol: false }, { id: 'p', n: 'Product', mw: '', rho: 1, layer: 'org', vol: false }, { id: uid(), n: 'Solvent', mw: '', rho: 0.8, layer: 'org', vol: true }],
      steps: [{ type: 'add', name: 'Charge', add: [{ m: 'k', q: 100, u: 'mass' }], p: {} }] };
  }
  window.PCME_BFD.example = example;

  /* ---------- UI ---------- */
  var root = document.getElementById('bfd-app'); if (!root) return;
  var st;
  try { st = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) { st = null; }
  if (!st || !st.mats || !st.steps) st = example();
  var lastR = null;
  function save() { try { localStorage.setItem(STORE, JSON.stringify(st)); } catch (e) { /* storage off: work in memory */ } }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function matOpts(sel, extra) { return (extra || '') + st.mats.map(function (m) { return '<option value="' + m.id + '"' + (m.id === sel ? ' selected' : '') + '>' + esc(m.n) + '</option>'; }).join(''); }
  function opts(o, sel) { return Object.keys(o).map(function (k) { return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + esc(o[k]) + '</option>'; }).join(''); }
  function destOpts(sel) { return DESTS.map(function (d) { return '<option' + (d === sel ? ' selected' : '') + '>' + d + '</option>'; }).join(''); }
  function inp(path, val, attrs) { return '<input data-p="' + path + '" value="' + esc(val) + '" ' + (attrs || 'type="number" step="any" inputmode="decimal"') + '>'; }
  function lbl(text, control, unit) { return '<label class="bf-f"><span>' + text + (unit ? ' <i>' + unit + '</i>' : '') + '</span>' + control + '</label>'; }

  function render() {
    var b = st.basis, bu = b.unit === 'g' ? 'g' : 'kg', vu = b.unit === 'g' ? 'mL' : 'L';
    var h = '<section class="bf-card"><h2>1. Batch basis</h2><div class="bf-row">'
      + lbl('Process name', inp('basis.name', b.name, 'type="text" placeholder="Step 3: amide coupling"'))
      + lbl('Key raw material', '<select data-p="basis.key">' + matOpts(b.key) + '</select>')
      + lbl('Product', '<select data-p="basis.product">' + matOpts(b.product) + '</select>')
      + lbl('Key material in the procedure', '<div class="bf-pair">' + inp('basis.qty', b.qty) + '<select data-p="basis.unit"><option value="g"' + (b.unit === 'g' ? ' selected' : '') + '>g</option><option value="kg"' + (b.unit === 'kg' ? ' selected' : '') + '>kg</option></select></div>')
      + lbl('Plant batch: key material', inp('basis.plant', b.plant), 'kg')
      + lbl('Heat capacity of the mass', inp('cp', st.cp), 'kcal/kg·°C')
      + '</div><p class="bf-hint">Enter the charges exactly as written in the procedure. Everything is scaled by plant batch ÷ procedure quantity.</p></section>';
    h += '<section class="bf-card"><h2>2. Materials</h2><div class="bf-tw"><table class="bf-mt"><thead><tr><th>Name</th><th>Molar mass <i>g/mol</i></th><th>Density <i>g/mL</i></th><th>Goes to</th><th>Volatile</th><th></th></tr></thead><tbody>'
      + st.mats.map(function (m, i) {
        return '<tr><td>' + inp('mats.' + i + '.n', m.n, 'type="text" aria-label="Material name"') + '</td><td>' + inp('mats.' + i + '.mw', m.mw, 'type="number" step="any" inputmode="decimal" aria-label="Molar mass"') + '</td><td>' + inp('mats.' + i + '.rho', m.rho, 'type="number" step="any" inputmode="decimal" aria-label="Density"') + '</td><td><select data-p="mats.' + i + '.layer" aria-label="Layer">' + opts(LAYERS, m.layer) + '</select></td><td><input type="checkbox" data-p="mats.' + i + '.vol"' + (m.vol ? ' checked' : '') + ' aria-label="Volatile"></td><td><button type="button" class="bf-x" data-act="delMat" data-i="' + i + '" aria-label="Remove ' + esc(m.n) + '">×</button></td></tr>';
      }).join('') + '</tbody></table></div><button type="button" class="bf-btn" data-act="addMat">+ Add material</button><p class="bf-hint">"Goes to" decides which layer a material follows when layers separate. Volatile materials can be distilled or dried off. Molar mass is needed for reactions and mole equivalents; density for volumes.</p></section>';
    h += '<section class="bf-card"><h2>3. Steps</h2>' + st.steps.map(function (sp, i) { return stepHtml(sp, i, bu, vu); }).join('')
      + '<div class="bf-addstep"><select id="bf-newtype" aria-label="Step type">' + Object.keys(TYPES).map(function (k) { return '<option value="' + k + '">' + TYPES[k].label + '</option>'; }).join('') + '</select><button type="button" class="bf-btn" data-act="addStep">+ Add step</button></div></section>';
    h += '<section class="bf-card bf-res" id="bf-res" aria-live="polite"></section>';
    h += '<div class="bf-bar"><button type="button" class="btn btn-outline btn-sm" data-act="pdf">Download PDF</button><button type="button" class="btn btn-outline btn-sm" data-act="xlsx">Download Excel</button><button type="button" class="bf-btn" data-act="example">Load example</button><button type="button" class="bf-btn" data-act="clear">Start blank</button></div>';
    root.innerHTML = h; results();
  }
  function stepHtml(sp, i, bu, vu) {
    var T = TYPES[sp.type] || TYPES.add, p = sp.p || {}, P = 'steps.' + i + '.p.';
    var h = '<div class="bf-step" data-step="' + i + '"><div class="bf-sh"><b class="bf-n">' + (i + 1) + '</b>' + inp('steps.' + i + '.name', sp.name, 'type="text" aria-label="Step name"')
      + '<select data-p="steps.' + i + '.type" data-re="1" aria-label="Step type">' + Object.keys(TYPES).map(function (k) { return '<option value="' + k + '"' + (k === sp.type ? ' selected' : '') + '>' + TYPES[k].label + '</option>'; }).join('') + '</select>'
      + '<span class="bf-mv"><button type="button" data-act="up" data-i="' + i + '" aria-label="Move step up"' + (i ? '' : ' disabled') + '>↑</button><button type="button" data-act="down" data-i="' + i + '" aria-label="Move step down"' + (i < st.steps.length - 1 ? '' : ' disabled') + '>↓</button><button type="button" data-act="delStep" data-i="' + i + '" aria-label="Delete step">×</button></span></div>';
    if (T.addLabel) {
      h += '<p class="bf-sub">' + T.addLabel + '</p>' + (sp.add || []).map(function (a, j) {
        var uo = { mass: bu, vol: vu, V: 'V (' + vu + '/' + bu + ' key)', eq: 'mole eq' };
        return '<div class="bf-ch"><select data-p="steps.' + i + '.add.' + j + '.m" aria-label="Material">' + matOpts(a.m, a.m ? '' : '<option value="">Choose</option>') + '</select>' + inp('steps.' + i + '.add.' + j + '.q', a.q, 'type="number" step="any" inputmode="decimal" aria-label="Quantity"') + '<select data-p="steps.' + i + '.add.' + j + '.u" aria-label="Unit">' + opts(uo, a.u) + '</select><button type="button" class="bf-x" data-act="delAdd" data-i="' + i + '" data-j="' + j + '" aria-label="Remove charge">×</button></div>';
      }).join('') + '<button type="button" class="bf-btn bf-sm" data-act="addAdd" data-i="' + i + '">+ Add ' + (sp.type === 'filt' ? 'wash' : 'charge') + '</button>';
    }
    var f = '';
    if (sp.type === 'react') {
      var rx = p.rx || { r: [], pr: [] };
      var row = function (side, list) {
        return list.map(function (x, j) { return '<div class="bf-ch"><input data-p="' + P + 'rx.' + side + '.' + j + '.nu" value="' + esc(x.nu) + '" type="number" step="any" inputmode="decimal" class="bf-nu" aria-label="Coefficient"><select data-p="' + P + 'rx.' + side + '.' + j + '.m" aria-label="Material">' + matOpts(x.m, x.m ? '' : '<option value="">Choose</option>') + '</select><button type="button" class="bf-x" data-act="delRx" data-i="' + i + '" data-s="' + side + '" data-j="' + j + '" aria-label="Remove">×</button></div>'; }).join('') + '<button type="button" class="bf-btn bf-sm" data-act="addRx" data-i="' + i + '" data-s="' + side + '">+ Add ' + (side === 'r' ? 'reactant' : 'product') + '</button>';
      };
      f += '<div class="bf-rx"><div><p class="bf-sub">Reactants (conversion is of the first one)</p>' + row('r', rx.r || []) + '</div><div><p class="bf-sub">Products</p>' + row('pr', rx.pr || []) + '</div></div><div class="bf-row">'
        + lbl('Conversion of the first reactant', inp(P + 'conv', p.conv), '%') + lbl('Heat of reaction (negative = exothermic)', inp(P + 'dH', p.dH), 'kcal/mol') + '</div>';
    } else if (sp.type === 'sep') {
      f += '<div class="bf-row">' + lbl('Layer kept', '<select data-p="' + P + 'keep"><option value="org"' + (p.keep !== 'aq' ? ' selected' : '') + '>Organic</option><option value="aq"' + (p.keep === 'aq' ? ' selected' : '') + '>Aqueous</option></select>') + lbl('Product lost to the other layer', inp(P + 'loss', p.loss), '%') + lbl('Discarded layer goes to', '<select data-p="' + P + 'dest">' + destOpts(p.dest || 'ETP') + '</select>') + '</div>';
    } else if (sp.type === 'dist') {
      f += '<div class="bf-row">' + lbl('Distil', '<select data-p="' + P + 'tgt">' + matOpts(p.tgt, '<option value="all"' + (!p.tgt || p.tgt === 'all' ? ' selected' : '') + '>All volatile materials</option>') + '</select>') + lbl('Share of it distilled off', inp(P + 'pct', p.pct), '%') + lbl('Condensed and collected', inp(P + 'eff', p.eff), '%') + lbl('Distillate goes to', '<select data-p="' + P + 'dest">' + destOpts(p.dest || 'Solvent recovery') + '</select>') + '</div>';
    } else if (sp.type === 'cryst') {
      f += '<div class="bf-row">' + lbl('Product solubility at the final temperature', inp(P + 'sol', p.sol), 'g per 100 g solvent') + '</div><p class="bf-hint">Solvent here means all volatile liquids together. To get this value from lab data, use the <a href="/process-modelling/solubility-curve-crystallisation/">solubility curve tool</a>.</p>';
    } else if (sp.type === 'filt') {
      f += '<div class="bf-row">' + lbl('Wet cake LOD', inp(P + 'lod', p.lod), '%') + lbl('Product dissolved by the wash', inp(P + 'wl', p.wl), '% of cake') + lbl('Filtrate goes to', '<select data-p="' + P + 'dest">' + destOpts(p.dest || 'Solvent recovery') + '</select>') + '</div>';
    } else if (sp.type === 'dry') {
      f += '<div class="bf-row">' + lbl('Final LOD', inp(P + 'lod', p.lod), '%') + lbl('Handling and dust loss', inp(P + 'hl', p.hl), '%') + lbl('Condensate goes to', '<select data-p="' + P + 'dest">' + destOpts(p.dest || 'Solvent recovery') + '</select>') + '</div>';
    }
    return h + f + '<div class="bf-snote" data-snote="' + i + '"></div></div>';
  }

  function nm(id) { var m = st.mats.filter(function (x) { return x.id === id; })[0]; return m ? m.n : '?'; }
  function results() {
    var R = lastR = compute(st), el = document.getElementById('bf-res'); save();
    st.steps.forEach(function (_, i) { var n = root.querySelector('[data-snote="' + i + '"]'); if (n) n.innerHTML = ''; });
    if (R.errs.length) { el.innerHTML = '<h2>4. Results</h2>' + R.errs.map(function (e) { return '<p class="bf-msg err">' + esc(e) + '</p>'; }).join(''); return; }
    R.steps.forEach(function (s, i) { var n = root.querySelector('[data-snote="' + i + '"]'); if (n) n.innerHTML = s.notes.map(function (x) { return '<p class="bf-msg ' + x[1] + '">' + esc(x[0]) + '</p>'; }).join(''); });
    var h = '<h2>4. Results <span class="bf-scale">Scale factor ' + f1(R.scale) + '×</span></h2>';
    h += '<div class="bf-kpi">' + kpi('Product out', f1(R.outKg) + ' kg', R.pAll > 0 ? 'assay ' + f1(R.assay) + ' % by mass' : 'no product in the final stream yet') + kpi('Yield', isFinite(R.yield) ? f1(R.yield) + ' %' : '–', R.yieldBasis ? 'vs ' + R.yieldBasis : 'define a reaction or charge the product') + kpi('Process mass intensity', f1(R.pmi), 'kg charged per kg product') + kpi('Effluent to ETP', f1(R.byDest.ETP) + ' kg', f1(R.outKg > 0 ? R.byDest.ETP / R.outKg : NaN) + ' kg per kg product') + '</div>';
    var bal = Math.abs(R.balErr) <= 1e-6 * Math.max(1, R.charged);
    h += '<p class="bf-msg ' + (bal ? 'ok' : 'err') + '">' + (bal ? 'Mass balance closes: charged ' + f0(R.charged) + ' kg = product ' + f1(R.outKg) + ' kg + other streams ' + f0(R.sideKg) + ' kg.' : 'Mass balance is off by ' + f1(R.balErr) + ' kg: charged ' + f0(R.charged) + ' kg, out ' + f0(R.outKg + R.sideKg) + ' kg. The reaction does not balance by mass.') + '</p>';
    if (R.warn.length) h += '<details class="bf-warn" open><summary>' + R.warn.length + ' point' + (R.warn.length > 1 ? 's' : '') + ' to check</summary><ul>' + R.warn.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') + '</ul></details>';
    // flowsheet
    h += '<h3>Block flow diagram</h3><div class="bf-flow">';
    R.steps.forEach(function (s) {
      h += '<div class="bf-fr"><div class="bf-in">' + s.charges.map(function (c) { return '<span>+ ' + esc(nm(c.m)) + ' <b>' + f1(c.kg) + '</b></span>'; }).join('') + '</div>'
        + '<div class="bf-blk"><b>' + s.i + '. ' + esc(s.name) + '</b><small>' + TYPES[s.type].label + ' · in vessel ' + f0(s.vessel) + ' kg</small></div>'
        + '<div class="bf-out">' + s.sides.map(function (x) { return '<span class="d-' + x.dest.replace(/[^A-Za-z]/g, '') + '">' + x.id + ' ' + esc(x.name) + ' <b>' + f1(x.kg) + '</b><i>to ' + x.dest + '</i></span>'; }).join('') + '</div></div>'
        + '<div class="bf-arr">' + s.id + ' · ' + f1(s.outKg) + ' kg</div>';
    });
    h += '</div>';
    // stream table
    var cols = R.steps.map(function (s) { return { id: s.id, t: s.name, s: s.out }; }).concat(R.sides.map(function (x) { return { id: x.id, t: x.name, s: { liq: x.liq, sol: x.sol } }; }));
    var comps = st.mats.filter(function (m) { return cols.some(function (c) { return c.s.liq[m.id] > 1e-9 || c.s.sol[m.id] > 1e-9; }); });
    h += '<h3>Stream table <small>kg per batch</small></h3><div class="bf-tw"><table class="bf-st"><thead><tr><th>Material</th>' + cols.map(function (c) { return '<th title="' + esc(c.t) + '">' + c.id + '<small>' + esc(c.t) + '</small></th>'; }).join('') + '</tr></thead><tbody>'
      + comps.map(function (m) {
        var row = function (key, tag) { return cols.some(function (c) { return c.s[key][m.id] > 1e-9; }) ? '<tr><td>' + esc(m.n) + tag + '</td>' + cols.map(function (c) { var v = c.s[key][m.id]; return '<td>' + (v > 1e-9 ? f1(v) : '') + '</td>'; }).join('') + '</tr>' : ''; };
        return row('liq', '') + row('sol', ' (solid)');
      }).join('') + '<tr class="bf-tot"><td>Total</td>' + cols.map(function (c) { return '<td>' + f1(sTot(c.s)) + '</td>'; }).join('') + '</tr></tbody></table></div>';
    // destinations and solvents
    h += '<div class="bf-two"><div><h3>Where the waste goes</h3><table class="bf-sm-t"><tbody>' + DESTS.filter(function (d) { return R.byDest[d] > 0; }).map(function (d) { return '<tr><td>' + d + '</td><td>' + f0(R.byDest[d]) + ' kg</td><td>' + f1(R.byDest[d] / R.outKg) + ' kg/kg</td></tr>'; }).join('')
      + '</tbody></table><p class="bf-hint">E-factor ' + f1(R.efactor) + ' kg waste per kg product; ' + f1(R.efactorRec) + ' if everything sent to solvent recovery is reused.</p></div>';
    h += '<div><h3>Solvents</h3><table class="bf-sm-t"><thead><tr><th>Solvent</th><th>Charged</th><th>To recovery</th></tr></thead><tbody>' + R.solv.map(function (x) { return '<tr><td>' + esc(x.n) + '</td><td>' + f0(x.charged) + ' kg</td><td>' + f0(x.toRec) + ' kg (' + f0(x.toRec / x.charged * 100) + ' %)</td></tr>'; }).join('') + '</tbody></table><p class="bf-hint">Share sent to recovery, before the losses of the recovery unit itself.</p></div></div>';
    h += '<div class="bf-up"><b>Need equipment tags, utilities and costing?</b> The <a href="/exclusive/bfd-tool/">BFD tool (offline app)</a> turns a pasted lab procedure into a full step-sheet workbook, linked to one batch-size cell.</div>';
    el.innerHTML = h;
  }
  function kpi(t, v, s) { return '<div><span>' + t + '</span><b>' + v + '</b><small>' + s + '</small></div>'; }

  /* ---------- events ---------- */
  function setPath(path, val) {
    var ks = path.split('.'), o = st;
    for (var i = 0; i < ks.length - 1; i++) { var k = /^\d+$/.test(ks[i]) ? +ks[i] : ks[i]; if (o[k] == null) o[k] = /^\d+$/.test(ks[i + 1]) ? [] : {}; o = o[k]; }
    o[ks[ks.length - 1]] = val;
  }
  var tmr;
  root.addEventListener('input', function (e) {
    var p = e.target.getAttribute('data-p'); if (!p || e.target.getAttribute('data-re')) return;
    setPath(p, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
    if (e.target.tagName === 'SELECT' || e.target.type === 'checkbox') { results(); return; }
    clearTimeout(tmr); tmr = setTimeout(function () { results(); if (/^mats\.\d+\.n$/.test(p)) refreshNames(); }, 250);
  });
  function refreshNames() { root.querySelectorAll('select option').forEach(function (o) { var m = st.mats.filter(function (x) { return x.id === o.value; })[0]; if (m) o.textContent = m.n; }); }
  root.addEventListener('change', function (e) { if (e.target.getAttribute('data-re')) { var i = +e.target.closest('[data-step]').getAttribute('data-step'), t = e.target.value, old = st.steps[i]; if (old.name === TYPES[old.type].label) old.name = TYPES[t].label; old.type = t; old.p = defaults(t); render(); } });
  function defaults(t) { return { react: { conv: 95, dH: '', rx: { r: [{ m: st.basis.key, nu: 1 }], pr: [{ m: st.basis.product, nu: 1 }] } }, sep: { keep: 'org', loss: 1, dest: 'ETP' }, dist: { tgt: 'all', pct: 70, eff: 98, dest: 'Solvent recovery' }, cryst: { sol: 2 }, filt: { lod: 20, wl: 1, dest: 'Solvent recovery' }, dry: { lod: 0.5, hl: 0.5, dest: 'Solvent recovery' }, add: {} }[t] || {}; }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var a = b.getAttribute('data-act'), i = +b.getAttribute('data-i'), j = +b.getAttribute('data-j');
    if (a === 'addMat') { st.mats.push({ id: uid(), n: 'New material', mw: '', rho: 1, layer: 'org', vol: false }); }
    else if (a === 'delMat') {
      var id = st.mats[i].id, used = st.steps.some(function (s) { return (s.add || []).some(function (x) { return x.m === id; }) || (s.p && s.p.rx && (s.p.rx.r.concat(s.p.rx.pr)).some(function (x) { return x.m === id; })); }) || st.basis.key === id || st.basis.product === id;
      if (used && !confirm(st.mats[i].n + ' is used in the batch basis or a step. Remove it and its charges?')) return;
      st.mats.splice(i, 1);
      st.steps.forEach(function (s) { s.add = (s.add || []).filter(function (x) { return x.m !== id; }); if (s.p && s.p.rx) { s.p.rx.r = s.p.rx.r.filter(function (x) { return x.m !== id; }); s.p.rx.pr = s.p.rx.pr.filter(function (x) { return x.m !== id; }); } if (s.p && s.p.tgt === id) s.p.tgt = 'all'; });
      if (st.basis.key === id) st.basis.key = ''; if (st.basis.product === id) st.basis.product = '';
    }
    else if (a === 'addStep') { var t = document.getElementById('bf-newtype').value; st.steps.push({ type: t, name: TYPES[t].label, add: [], p: defaults(t) }); }
    else if (a === 'delStep') { if (!confirm('Delete step ' + (i + 1) + '?')) return; st.steps.splice(i, 1); }
    else if (a === 'up' && i > 0) { st.steps.splice(i - 1, 0, st.steps.splice(i, 1)[0]); }
    else if (a === 'down' && i < st.steps.length - 1) { st.steps.splice(i + 1, 0, st.steps.splice(i, 1)[0]); }
    else if (a === 'addAdd') { (st.steps[i].add = st.steps[i].add || []).push({ m: '', q: '', u: 'mass' }); }
    else if (a === 'delAdd') { st.steps[i].add.splice(j, 1); }
    else if (a === 'addRx') { var p = st.steps[i].p; p.rx = p.rx || { r: [], pr: [] }; p.rx[b.getAttribute('data-s')].push({ m: '', nu: 1 }); }
    else if (a === 'delRx') { st.steps[i].p.rx[b.getAttribute('data-s')].splice(j, 1); }
    else if (a === 'example') { if (!confirm('Replace your flowsheet with the example?')) return; st = example(); }
    else if (a === 'clear') { if (!confirm('Clear the flowsheet and start blank?')) return; st = blank(); }
    else if (a === 'pdf') { pdf(b); return; }
    else if (a === 'xlsx') { xlsx(b); return; }
    else return;
    render();
  });

  /* ---------- exports ---------- */
  function title() { return st.basis.name ? st.basis.name : 'Batch flowsheet and mass balance'; }
  function tables(R) {
    var cols = R.steps.map(function (s) { return { id: s.id, t: s.name, s: s.out }; }).concat(R.sides.map(function (x) { return { id: x.id, t: x.name + ' (to ' + x.dest + ')', s: { liq: x.liq, sol: x.sol } }; }));
    var comps = []; st.mats.forEach(function (m) { ['liq', 'sol'].forEach(function (k) { if (cols.some(function (c) { return c.s[k][m.id] > 1e-9; })) comps.push([m, k]); }); });
    return { cols: cols, comps: comps };
  }
  function summaryRows(R) {
    return [['Plant batch (key material)', +st.basis.plant, 'kg'], ['Scale factor from the procedure', +R.scale.toFixed(4), '×'], ['Total charged', +R.charged.toFixed(2), 'kg'], ['Product out', +R.outKg.toFixed(2), 'kg'], ['Product assay (by mass)', +R.assay.toFixed(2), '%'],
      ['Yield' + (R.yieldBasis ? ' (vs ' + R.yieldBasis + ')' : ''), isFinite(R.yield) ? +R.yield.toFixed(2) : '–', '%'], ['Process mass intensity', +R.pmi.toFixed(2), 'kg/kg'], ['E-factor', +R.efactor.toFixed(2), 'kg/kg'], ['E-factor with solvents recovered', +R.efactorRec.toFixed(2), 'kg/kg']]
      .concat(DESTS.filter(function (d) { return R.byDest[d] > 0; }).map(function (d) { return ['To ' + d, +R.byDest[d].toFixed(2), 'kg'] }));
  }
  function pdf(btn) {
    var R = lastR; if (!R || R.errs.length) { alert('Fix the inputs first: ' + (R ? R.errs[0] : '')); return; }
    if (!window.PCME_XL || !window.PCME_XL.report) { alert('Download is not available on this page.'); return; }
    btn.disabled = true; btn.textContent = 'Preparing…';
    var T = tables(R), secs = [{ title: 'Summary', head: ['Result', 'Value', 'Unit'], rows: summaryRows(R), widths: [0.5, 0.25, 0.25], bold: [1] }];
    secs.push({ title: 'Charges (plant scale)', head: ['Step', 'Material', 'kg'], rows: R.charges.map(function (c) { return [c.step + '. ' + c.stepName, nm(c.m), +c.kg.toFixed(2)]; }), widths: [0.42, 0.4, 0.18] });
    secs.push({ title: 'Steps', head: ['Step', 'In vessel, kg', 'Out, kg', 'Other streams'], rows: R.steps.map(function (s) { return [s.i + '. ' + s.name + ' (' + TYPES[s.type].label + ')', Math.round(s.vessel), +s.outKg.toFixed(1), s.sides.map(function (x) { return x.id + ' ' + x.name + ' ' + f1(x.kg) + ' kg to ' + x.dest; }).join('; ') || '–']; }), widths: [0.3, 0.14, 0.12, 0.44] });
    T.cols.forEach(function (c) { secs.push({ title: 'Stream ' + c.id + ': ' + c.t, head: ['Material', 'kg', '% by mass'], rows: T.comps.filter(function (x) { return c.s[x[1]][x[0].id] > 1e-9; }).map(function (x) { var v = c.s[x[1]][x[0].id]; return [x[0].n + (x[1] === 'sol' ? ' (solid)' : ''), +v.toFixed(2), +(v / sTot(c.s) * 100).toFixed(2)]; }).concat([['Total', +sTot(c.s).toFixed(2), 100]]), widths: [0.6, 0.2, 0.2] }); });
    var notes = R.warn.slice(0, 12).concat(['Free screening tool. Quantities follow the step model shown on the page; confirm with plant data before use.']);
    window.PCME_XL.report({ title: title(), sub: 'Batch flowsheet and mass balance', sections: secs, notes: notes, link: location.href.split('#')[0] })
      .then(function () { btn.disabled = false; btn.textContent = 'Download PDF'; }, function (e) { window.PCME_XL.fail(btn, e); });
  }
  function xlsx(btn) {
    var R = lastR; if (!R || R.errs.length) { alert('Fix the inputs first: ' + (R ? R.errs[0] : '')); return; }
    btn.disabled = true; btn.textContent = 'Preparing…';
    var go = function () {
      try {
        var X = window.XLSX, wb = X.utils.book_new(), T = tables(R);
        var add = function (name, aoa, w) { var ws = X.utils.aoa_to_sheet(aoa); ws['!cols'] = w.map(function (x) { return { wch: x }; }); X.utils.book_append_sheet(wb, ws, name); };
        add('Summary', [[title()], ['PharmaChemE batch flowsheet and mass balance. Values only.'], [], ['Result', 'Value', 'Unit']].concat(summaryRows(R)).concat([[], ['Points to check']]).concat(R.warn.map(function (w) { return [w]; })), [44, 14, 10]);
        add('Materials', [['Material', 'Molar mass, g/mol', 'Density, g/mL', 'Goes to', 'Volatile']].concat(st.mats.map(function (m) { return [m.n, num(m.mw) || '', num(m.rho) || '', LAYERS[m.layer], m.vol ? 'yes' : 'no']; })), [32, 16, 14, 18, 10]);
        add('Charges', [['Step', 'Step name', 'Material', 'Procedure quantity', 'Unit', 'Plant kg']].concat([].concat.apply([], st.steps.map(function (s, i) { return (s.add || []).map(function (a) { var c = R.charges.filter(function (c) { return c.step === i + 1 && c.m === a.m; })[0]; return [i + 1, s.name, nm(a.m), num(a.q), a.u === 'mass' ? st.basis.unit : a.u === 'vol' ? (st.basis.unit === 'g' ? 'mL' : 'L') : a.u === 'V' ? 'V' : 'eq', c ? +c.kg.toFixed(3) : 0]; }); }))), [6, 28, 30, 18, 8, 12]);
        add('Streams', [['Material'].concat(T.cols.map(function (c) { return c.id + ' ' + c.t; }))].concat(T.comps.map(function (x) { return [x[0].n + (x[1] === 'sol' ? ' (solid)' : '')].concat(T.cols.map(function (c) { var v = c.s[x[1]][x[0].id]; return v > 1e-9 ? +v.toFixed(3) : ''; })); })).concat([['Total'].concat(T.cols.map(function (c) { return +sTot(c.s).toFixed(3); }))]), [30].concat(T.cols.map(function () { return 16; })));
        add('Solvents', [['Solvent', 'Charged, kg', 'To recovery, kg', 'Share to recovery, %']].concat(R.solv.map(function (x) { return [x.n, +x.charged.toFixed(2), +x.toRec.toFixed(2), +(x.toRec / x.charged * 100).toFixed(1)]; })), [28, 14, 16, 20]);
        X.writeFile(wb, (title().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'batch-flowsheet') + '.xlsx');
      } catch (e) { alert('Could not make the Excel file.'); }
      btn.disabled = false; btn.textContent = 'Download Excel';
    };
    if (window.XLSX) return go();
    var s = document.createElement('script'); s.src = XSRC; s.onload = go; s.onerror = function () { alert('Could not prepare the Excel file. Check your connection and try again.'); btn.disabled = false; btn.textContent = 'Download Excel'; }; document.head.appendChild(s);
  }
  var XSRC = (function () { var me = document.querySelector('script[src*="batch-flowsheet.js"]'); return me ? me.src.replace(/js\/batch-flowsheet\.js.*$/, 'vendor/xlsx.mini.min.js') : '/assets/vendor/xlsx.mini.min.js'; })();
  render();
})();
