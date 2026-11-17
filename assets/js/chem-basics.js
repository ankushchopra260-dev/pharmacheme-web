/* PharmaChemE: interactive tools for the Basic chemistry articles.
   Each tool is a <div class="cb-w" data-w="name"></div> placeholder filled in here. */
(function () {
  'use strict';
  var AW = { H: 1.008, He: 4.0026, Li: 6.94, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, K: 39.098, Ca: 40.078, Ti: 47.867, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Br: 79.904, Pd: 106.42, Ag: 107.87, Sn: 118.71, I: 126.90, Ba: 137.33, Pt: 195.08, Pb: 207.2, D: 2.014 };
  var EN = { H: 2.20, Li: 0.98, B: 2.04, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.90, P: 2.19, S: 2.58, Cl: 3.16, K: 0.82, Ca: 1.00, Fe: 1.83, Cu: 1.90, Zn: 1.65, Br: 2.96, I: 2.66 };

  function el(h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; }
  function f(x, d) { if (!isFinite(x)) return '–'; return x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function num(root, k) { var i = root.querySelector('[data-k="' + k + '"]'); var v = parseFloat(i.value); return isFinite(v) ? v : NaN; }
  function val(root, k) { return root.querySelector('[data-k="' + k + '"]').value; }
  function out(root, k, h, cls) { var o = root.querySelector('[data-o="' + k + '"]'); o.innerHTML = h; if (cls !== undefined) o.className = cls; }
  function inp(k, label, v, unit, step) { return '<label class="cb-f"><span>' + label + '</span><input type="number" inputmode="decimal" data-k="' + k + '" value="' + v + '"' + (step ? ' step="' + step + '"' : ' step="any"') + '>' + (unit ? '<em>' + unit + '</em>' : '') + '</label>'; }
  function txt(k, label, v, w) { return '<label class="cb-f cb-t"><span>' + label + '</span><input type="text" spellcheck="false" autocomplete="off" data-k="' + k + '" value="' + v + '"' + (w ? ' style="width:' + w + '"' : '') + '></label>'; }
  function sel(k, label, opts, v) { return '<label class="cb-f"><span>' + label + '</span><select data-k="' + k + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] == v ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>'; }
  function rd(k, label) { return '<div><span>' + label + '</span><b data-o="' + k + '">–</b></div>'; }
  function box(title, inner, note) { return '<figure class="art-fig cb-box"><p class="cb-h">' + title + '</p>' + inner + (note ? '<figcaption>' + note + '</figcaption>' : '') + '</figure>'; }
  function wire(root, fn) { root.addEventListener('input', fn); root.addEventListener('change', fn); fn(); }

  /* formula parser: CuSO4·5H2O, Ca(OH)2, (CH3)3COH, C6H5NO2 */
  function parse(s) {
    s = s.replace(/\s+/g, '').replace(/[·•*]/g, '.');
    if (!s) throw 'Enter a formula';
    var total = {};
    s.split('.').forEach(function (part, i) {
      if (!part) throw 'Check the dots in the formula';
      var m = part.match(/^(\d+)(.*)$/), mult = 1;
      if (m && i > 0) { mult = +m[1]; part = m[2]; }
      var c = group(part);
      for (var k in c) total[k] = (total[k] || 0) + c[k] * mult;
    });
    return total;
  }
  function group(s) {
    var st = [{}], i = 0;
    while (i < s.length) {
      var ch = s[i];
      if (ch === '(' || ch === '[') { st.push({}); i++; continue; }
      if (ch === ')' || ch === ']') {
        if (st.length < 2) throw 'Unmatched bracket';
        var g = st.pop(); i++; var n = ''; while (i < s.length && /\d/.test(s[i])) n += s[i++];
        var k = n ? +n : 1, top = st[st.length - 1];
        for (var e in g) top[e] = (top[e] || 0) + g[e] * k; continue;
      }
      var m = s.slice(i).match(/^([A-Z][a-z]?)(\d*)/);
      if (!m) throw 'Cannot read "' + s.slice(i, i + 3) + '". Use capital letters for elements, e.g. NaCl not nacl.';
      if (!AW[m[1]]) throw 'Element ' + m[1] + ' is not in the table here';
      var t = st[st.length - 1]; t[m[1]] = (t[m[1]] || 0) + (m[2] ? +m[2] : 1); i += m[0].length;
    }
    if (st.length !== 1) throw 'Unmatched bracket';
    return st[0];
  }
  function mw(c) { var s = 0; for (var e in c) s += AW[e] * c[e]; return s; }

  var W = {};

  W.molar = function (r) {
    r.innerHTML = box('Molar mass and composition', '<div class="art-ctl">' + txt('f', 'Formula', 'CH2Cl2', '11em') + inp('m', 'Mass', 100, 'kg') + '</div><div class="art-read">' + rd('mw', 'Molar mass, kg/kmol') + rd('n', 'Amount, kmol') + '</div><div class="cb-tab" data-o="tab"></div>',
      'Try C6H5NO2, CuSO4·5H2O, Ca(OH)2 or (CH3)3COH. Atomic weights from the IUPAC table, rounded.');
    wire(r, function () {
      try {
        var c = parse(val(r, 'f')), M = mw(c), m = num(r, 'm');
        out(r, 'mw', f(M, 2)); out(r, 'n', f(m / M, 4));
        out(r, 'tab', '<table class="art-table"><thead><tr><th>Element</th><th>Atoms</th><th>Mass, kg/kmol</th><th>Mass %</th><th>In ' + f(m, 1) + ' kg</th></tr></thead><tbody>' +
          Object.keys(c).map(function (e) { var x = AW[e] * c[e]; return '<tr><td>' + e + '</td><td>' + c[e] + '</td><td>' + f(x, 2) + '</td><td>' + f(100 * x / M, 2) + '</td><td>' + f(m * x / M, 2) + ' kg</td></tr>'; }).join('') + '</tbody></table>');
      } catch (e) { out(r, 'mw', '–'); out(r, 'n', '–'); out(r, 'tab', '<p class="cb-err">' + e + '</p>'); }
    });
  };

  W.polarity = function (r) {
    var opts = Object.keys(EN).map(function (e) { return [e, e + ' (' + EN[e].toFixed(2) + ')']; });
    r.innerHTML = box('Bond polarity checker', '<div class="art-ctl">' + sel('a', 'Atom 1', opts, 'O') + sel('b', 'Atom 2', opts, 'H') + '</div><div class="art-read">' + rd('d', 'Electronegativity difference') + rd('t', 'Bond type (rough guide)') + rd('neg', 'Carries δ−') + '</div><div class="cb-bar"><i data-o="bar"></i></div>',
      'Pauling electronegativities. The cut-offs at 0.4 and 1.7 are rules of thumb, not sharp lines.');
    wire(r, function () {
      var a = val(r, 'a'), b = val(r, 'b'), d = Math.abs(EN[a] - EN[b]);
      out(r, 'd', f(d, 2));
      out(r, 't', a === b ? 'Non-polar covalent' : d < 0.4 ? 'Non-polar covalent' : d <= 1.7 ? 'Polar covalent' : 'Mostly ionic');
      out(r, 'neg', d < 0.05 ? 'neither' : (EN[a] > EN[b] ? a : b));
      var bar = r.querySelector('[data-o="bar"]'); bar.style.width = Math.min(100, d / 3.2 * 100) + '%';
    });
  };

  W.limiting = function (r) {
    r.innerHTML = box('Limiting reagent and yield calculator',
      '<div class="cb-grid"><div><p class="cb-sub">Reactant A</p>' + txt('fa', 'Formula or molar mass', 'C6H7NO', '9em') + inp('ma', 'Mass charged', 100, 'kg') + inp('pa', 'Assay', 100, '%') + inp('ca', 'Coefficient', 1, '', 1) + '</div>' +
      '<div><p class="cb-sub">Reactant B</p>' + txt('fb', 'Formula or molar mass', 'C4H6O3', '9em') + inp('mb', 'Mass charged', 105, 'kg') + inp('pb', 'Assay', 100, '%') + inp('cb', 'Coefficient', 1, '', 1) + '</div>' +
      '<div><p class="cb-sub">Product</p>' + txt('fp', 'Formula or molar mass', 'C8H9NO2', '9em') + inp('cp', 'Coefficient', 1, '', 1) + inp('ap', 'Dry product isolated', 125, 'kg') + inp('pp', 'Product assay', 100, '%') + '</div></div>' +
      '<div class="art-read">' + rd('lim', 'Limiting reagent') + rd('ex', 'Excess of the other') + rd('th', 'Theoretical product, kg') + rd('y', 'Yield, %') + rd('left', 'Excess left over, kg') + '</div>',
      'Defaults are the paracetamol batch above. A formula box also accepts a plain molar mass, e.g. 98.07.');
    function M(k) { var s = val(r, k).trim(); if (/^\d+(\.\d+)?$/.test(s)) return +s; return mw(parse(s)); }
    wire(r, function () {
      try {
        var Ma = M('fa'), Mb = M('fb'), Mp = M('fp');
        var na = num(r, 'ma') * num(r, 'pa') / 100 / Ma, nb = num(r, 'mb') * num(r, 'pb') / 100 / Mb;
        var ca = num(r, 'ca'), cb = num(r, 'cb'), cp = num(r, 'cp');
        var ra = na / ca, rb = nb / cb, lim = ra <= rb ? 'A' : 'B', ext = Math.min(ra, rb);
        var other = lim === 'A' ? nb : na, needed = ext * (lim === 'A' ? cb : ca), Mo = lim === 'A' ? Mb : Ma;
        var th = ext * cp * Mp, y = num(r, 'ap') * num(r, 'pp') / 100 / th * 100;
        out(r, 'lim', lim === 'A' ? 'A (' + val(r, 'fa') + ')' : 'B (' + val(r, 'fb') + ')');
        out(r, 'ex', f((other - needed) / needed * 100, 1) + ' %, ' + f(other / needed, 2) + ' eq');
        out(r, 'th', f(th, 1)); out(r, 'y', f(y, 1), y > 100.5 ? 'no' : ''); out(r, 'left', f((other - needed) * Mo, 1));
      } catch (e) { ['lim', 'ex', 'th', 'y', 'left'].forEach(function (k) { out(r, k, '–'); }); out(r, 'lim', '<small>' + e + '</small>'); }
    });
  };

  W.extract = function (r) {
    r.innerHTML = box('Which layer is my compound in?',
      '<div class="art-ctl">' + sel('t', 'Compound type', [['acid', 'Acid (carboxylic acid, phenol)'], ['base', 'Base (amine, pyridine)']], 'acid') +
      '<label><span>pK<sub>a</sub></span> <input type="range" min="0" max="14" step="0.1" value="4.8" data-k="pka"><output data-o="pkav"></output></label>' +
      '<label><span>Wash pH</span> <input type="range" min="0" max="14" step="0.1" value="8" data-k="ph"><output data-o="phv"></output></label></div>' +
      '<div class="cb-split"><div class="cb-org" data-o="org"></div><div class="cb-aq" data-o="aq"></div></div>' +
      '<div class="art-read">' + rd('neu', 'Neutral form (organic-soluble), %') + rd('ion', 'Charged form (water-soluble), %') + rd('adv', 'What it means') + '</div>',
      'For pK<sub>a</sub> of a base, use the pK<sub>a</sub> of its protonated form (e.g. 10.7 for triethylamine). Henderson–Hasselbalch in water; mixed solvents shift the real values.');
    wire(r, function () {
      var t = val(r, 't'), pka = num(r, 'pka'), ph = num(r, 'ph');
      out(r, 'pkav', f(pka, 1)); out(r, 'phv', f(ph, 1));
      var ion = t === 'acid' ? 100 / (1 + Math.pow(10, pka - ph)) : 100 / (1 + Math.pow(10, ph - pka)), neu = 100 - ion;
      out(r, 'neu', f(neu, 1)); out(r, 'ion', f(ion, 1));
      out(r, 'adv', neu >= 99 ? 'Stays in the organic layer' : ion >= 99 ? 'Goes to the water layer' : 'Split between layers: move pH ≥ 2 units away from pKa', (neu < 99 && ion < 99) ? 'no' : '');
      r.querySelector('[data-o="org"]').style.flexGrow = Math.max(neu, 1); r.querySelector('[data-o="aq"]').style.flexGrow = Math.max(ion, 1);
      out(r, 'org', 'Organic ' + f(neu, 0) + ' %'); out(r, 'aq', 'Water ' + f(ion, 0) + ' %');
    });
  };

  W.ph = function (r) {
    r.innerHTML = box('pH of an acid or base solution',
      '<div class="art-ctl">' + sel('t', 'Type', [['sa', 'Strong acid (HCl, HNO₃)'], ['wa', 'Weak acid'], ['sb', 'Strong base (NaOH, KOH)'], ['wb', 'Weak base']], 'wa') + inp('c', 'Concentration', 0.1, 'mol/L') + inp('pka', 'pKa (weak only)', 4.76) + '</div><div class="art-read">' + rd('ph', 'pH at 25 °C') + rd('a', 'Fraction ionised, %') + '</div>',
      'Exact quadratic for the weak acid or base; water self-ionisation ignored, so very dilute solutions (below about 10⁻⁶ mol/L) are not reliable.');
    wire(r, function () {
      var t = val(r, 't'), C = num(r, 'c'), pka = num(r, 'pka'), h, a = 100;
      if (t === 'sa') h = C; else if (t === 'sb') h = 1e-14 / C;
      else if (t === 'wa') { var K = Math.pow(10, -pka); var x = (-K + Math.sqrt(K * K + 4 * K * C)) / 2; h = x; a = x / C * 100; }
      else { var Kb = Math.pow(10, -(14 - pka)); var y = (-Kb + Math.sqrt(Kb * Kb + 4 * Kb * C)) / 2; h = 1e-14 / y; a = y / C * 100; }
      out(r, 'ph', f(-Math.log10(h), 2)); out(r, 'a', f(a, 2));
    });
  };

  W.equil = function (r) {
    r.innerHTML = box('Equilibrium conversion for A + B ⇌ C + D',
      '<div class="art-ctl">' + inp('k', 'K at reaction temperature', 4) + inp('rb', 'Moles B per mole A', 1) + inp('rw', 'Fraction of D left in pot', 100, '%') + '</div>' +
      '<div class="art-read">' + rd('x', 'Equilibrium conversion of A, %') + rd('x1', 'Same K, 1 : 1 feed, all D kept, %') + '</div>' +
      '<p class="cb-sub" style="margin-top:14px">Effect of temperature on K (van ’t Hoff)</p><div class="art-ctl">' + inp('dh', 'ΔH of reaction', -10, 'kcal/mol') + inp('t1', 'K known at', 25, '°C') + inp('t2', 'New temperature', 85, '°C') + '</div>' +
      '<div class="art-read">' + rd('k2', 'K at new temperature') + rd('x2', 'Conversion at new K, %') + '</div>',
      'Removing D (water in an esterification, say) is modelled as keeping only the stated fraction in the pot. Ideal mixture; K in mole terms.');
    function conv(K, b, w) { /* K = w x^2 /((1-x)(b-x)) */ var lo = 0, hi = Math.min(1, b); for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; var g = w * m * m - K * (1 - m) * (b - m); if (g > 0) hi = m; else lo = m; } return (lo + hi) / 2; }
    wire(r, function () {
      var K = num(r, 'k'), b = num(r, 'rb'), w = Math.max(num(r, 'rw'), 0.01) / 100;
      out(r, 'x', f(conv(K, b, w) * 100, 1)); out(r, 'x1', f(conv(K, 1, 1) * 100, 1));
      var T1 = num(r, 't1') + 273.15, T2 = num(r, 't2') + 273.15, dH = num(r, 'dh') * 1000;
      var K2 = K * Math.exp(-dH / 1.987 * (1 / T2 - 1 / T1));
      out(r, 'k2', K2 >= 1000 ? K2.toExponential(2) : f(K2, 3)); out(r, 'x2', f(conv(K2, b, w) * 100, 1));
    });
  };

  W.cod = function (r) {
    r.innerHTML = box('Theoretical COD from a formula',
      '<div class="art-ctl">' + txt('f', 'Formula', 'CH3OH', '10em') + inp('m', 'Mass lost to drain', 10, 'kg') + '</div><div class="art-read">' + rd('o2', 'O₂ per mol, mol') + rd('r', 'COD, kg O₂ per kg') + rd('cod', 'COD added, kg') + '</div>',
      'Carbon to CO₂, hydrogen to water, nitrogen counted as ammonia, halogens as HX, sulfur to sulfate. The dichromate test may oxidise some compounds less than fully.');
    wire(r, function () {
      try {
        var c = parse(val(r, 'f')), g = function (e) { return c[e] || 0; };
        var hal = g('Cl') + g('Br') + g('F') + g('I');
        var o2 = g('C') + (g('H') - 3 * g('N') - hal) / 4 - g('O') / 2 + 1.5 * g('S');
        var ratio = o2 * 31.998 / mw(c);
        out(r, 'o2', f(o2, 2)); out(r, 'r', f(ratio, 2)); out(r, 'cod', f(ratio * num(r, 'm'), 1));
      } catch (e) { out(r, 'o2', '<small>' + e + '</small>'); out(r, 'r', '–'); out(r, 'cod', '–'); }
    });
  };

  W.oxnum = function (r) {
    r.innerHTML = box('Oxidation number finder',
      '<div class="art-ctl">' + txt('f', 'Formula', 'H2SO4', '9em') + inp('q', 'Overall charge', 0, '', 1) + txt('x', 'Find for element', 'S', '3em') + '</div><div class="art-read">' + rd('o', 'Oxidation number') + rd('how', 'Working') + '</div>',
      'Uses the standard rules: H +1, O −2, F −1, group 1 metals +1, group 2 +2, Cl/Br/I −1 when not the element asked for. Works for one unknown element; peroxides and metal hydrides are exceptions.');
    var FIX = { H: 1, O: -2, F: -1, Li: 1, Na: 1, K: 1, Mg: 2, Ca: 2, Ba: 2, Cl: -1, Br: -1, I: -1 };
    wire(r, function () {
      try {
        var c = parse(val(r, 'f')), x = val(r, 'x').trim(), q = num(r, 'q');
        if (!c[x]) throw x + ' is not in the formula';
        var sum = 0, parts = [];
        for (var e in c) { if (e === x) continue; if (FIX[e] === undefined) throw 'Two unknowns: ' + e + ' and ' + x; sum += FIX[e] * c[e]; parts.push(c[e] + '(' + (FIX[e] > 0 ? '+' : '') + FIX[e] + ')'); }
        var ox = (q - sum) / c[x];
        out(r, 'o', (ox > 0 ? '+' : '') + (Math.abs(ox - Math.round(ox)) < 1e-9 ? ox : f(ox, 2)));
        out(r, 'how', '<small>' + (parts.length ? parts.join(' + ') + ' + ' : '') + c[x] + '·' + x + ' = ' + q + '</small>');
      } catch (e) { out(r, 'o', '–'); out(r, 'how', '<small>' + e + '</small>'); }
    });
  };

  W.conc = function (r) {
    var P = { hcl32: ['HCl', 32, 1.16, 1], hcl36: ['HCl', 36, 1.18, 1], h2so4: ['H2SO4', 98, 1.84, 2], hno3: ['HNO3', 68, 1.41, 1], naoh: ['NaOH', 48, 1.51, 1], h2o2: ['H2O2', 50, 1.20, 0] };
    r.innerHTML = box('Concentration converter',
      '<div class="art-ctl">' + sel('p', 'Preset', [['', 'Your own'], ['hcl32', 'HCl 32 %'], ['hcl36', 'HCl 36 %'], ['h2so4', 'H₂SO₄ 98 %'], ['hno3', 'HNO₃ 68 %'], ['naoh', 'NaOH lye 48 %'], ['h2o2', 'H₂O₂ 50 %']], 'hcl32') + '</div>' +
      '<div class="art-ctl">' + txt('f', 'Solute formula', 'HCl', '7em') + inp('w', 'Strength', 32, '% w/w') + inp('d', 'Density', 1.16, 'g/mL') + inp('e', 'H⁺ or OH⁻ per molecule', 1, '', 1) + '</div>' +
      '<div class="art-read">' + rd('M', 'Molarity, mol/L') + rd('N', 'Normality, eq/L') + rd('m', 'Molality, mol/kg water') + rd('x', 'Mole fraction solute') + rd('gl', 'g solute per litre') + '</div>',
      'Solvent taken as water. Use the density from the supplier’s certificate for an exact charge.');
    r.querySelector('[data-k="p"]').addEventListener('change', function () {
      var p = P[this.value]; if (!p) return;
      ['f', 'w', 'd', 'e'].forEach(function (k, i) { r.querySelector('[data-k="' + k + '"]').value = p[i]; });
    });
    wire(r, function () {
      try {
        var M = mw(parse(val(r, 'f'))), w = num(r, 'w') / 100, d = num(r, 'd'), e = num(r, 'e');
        var mol = 1000 * d * w / M;
        out(r, 'M', f(mol, 2)); out(r, 'N', e > 0 ? f(mol * e, 2) : '–'); out(r, 'm', f(w / M * 1000 / (1 - w), 2));
        var ns = w / M, nw = (1 - w) / 18.015; out(r, 'x', f(ns / (ns + nw), 3)); out(r, 'gl', f(1000 * d * w, 0));
      } catch (er) { out(r, 'M', '<small>' + er + '</small>'); }
    });
  };

  W.dilute = function (r) {
    r.innerHTML = box('Dilution and blending by mass',
      '<div class="art-ctl">' + inp('w1', 'Strong solution', 48, '% w/w') + inp('w0', 'Diluent (water = 0)', 0, '% w/w') + inp('wt', 'Target strength', 10, '% w/w') + inp('mt', 'Target batch', 1000, 'kg') + '</div>' +
      '<div class="art-read">' + rd('a', 'Strong solution, kg') + rd('b', 'Diluent, kg') + rd('s', 'Solute in batch, kg') + '</div>',
      'Mass balance on the solute. Add the strong solution to the diluent slowly with cooling for acids and caustic.');
    wire(r, function () {
      var w1 = num(r, 'w1'), w0 = num(r, 'w0'), wt = num(r, 'wt'), mt = num(r, 'mt');
      if (!(wt > Math.min(w0, w1) && wt < Math.max(w0, w1))) { out(r, 'a', 'Target must lie between the two strengths', 'no'); out(r, 'b', '–'); out(r, 's', '–'); return; }
      var a = mt * (wt - w0) / (w1 - w0);
      out(r, 'a', f(a, 1), ''); out(r, 'b', f(mt - a, 1)); out(r, 's', f(mt * wt / 100, 1));
    });
  };

  W.gasflow = function (r) {
    r.innerHTML = box('Normal and actual gas flow',
      '<div class="art-ctl">' + inp('q', 'Flow', 100) + sel('dir', 'Given as', [['n', 'Nm³/h (0 °C, 1.013 bar)'], ['a', 'Actual m³/h']], 'n') + inp('t', 'Line temperature', 40, '°C') + inp('p', 'Line pressure', 0.5, 'bar(g)') + inp('m', 'Molar mass', 28.01, 'kg/kmol') + '</div>' +
      '<div class="art-read">' + rd('o', 'Converted flow') + rd('kg', 'Mass flow, kg/h') + rd('rho', 'Density at line conditions, kg/m³') + '</div>',
      'Ideal gas. Defaults are nitrogen. Atmospheric pressure taken as 1.013 bar.');
    wire(r, function () {
      var q = num(r, 'q'), T = num(r, 't') + 273.15, P = num(r, 'p') + 1.013, M = num(r, 'm');
      var fac = (T / 273.15) * (1.013 / P), n = val(r, 'dir') === 'n' ? q : q / fac;
      out(r, 'o', val(r, 'dir') === 'n' ? f(q * fac, 1) + ' m³/h actual' : f(q / fac, 1) + ' Nm³/h');
      out(r, 'kg', f(n / 22.414 * M, 1)); out(r, 'rho', f(P * M / (0.08314 * T), 3));
    });
  };

  W.purge = function (r) {
    r.innerHTML = box('Pressure purge: oxygen and nitrogen per cycle',
      '<div class="art-ctl">' + inp('v', 'Headspace volume', 5, 'm³') + inp('p', 'Purge pressure', 3, 'bar(g)') + inp('t', 'Temperature', 25, '°C') + inp('o', 'Target oxygen', 1, '%') + '</div>' +
      '<div class="art-read">' + rd('n', 'Cycles needed') + rd('o2', 'Oxygen after those cycles, %') + rd('nm', 'Nitrogen per cycle, Nm³') + rd('tot', 'Total nitrogen, Nm³') + '</div><div class="cb-steps" data-o="steps"></div>',
      'Starts from air (20.9 % O₂), pure nitrogen, full mixing, vented to atmosphere each cycle. Set the target from the limiting oxygen concentration with a safety margin.');
    wire(r, function () {
      var V = num(r, 'v'), Pg = num(r, 'p'), T = num(r, 't') + 273.15, tgt = num(r, 'o');
      var Pa = 1.013, Ph = Pg + Pa, ratio = Pa / Ph;
      if (!(Pg > 0) || !(tgt > 0)) { out(r, 'n', '–'); return; }
      var n = Math.max(0, Math.ceil(Math.log(tgt / 20.9) / Math.log(ratio) - 1e-9));
      var nm = (Ph - Pa) * V / (0.08314 * T) * 22.414;
      out(r, 'n', n); out(r, 'o2', f(20.9 * Math.pow(ratio, n), 2)); out(r, 'nm', f(nm, 1)); out(r, 'tot', f(nm * n, 1));
      var s = ''; for (var i = 0; i <= Math.min(n, 8); i++) { var o = 20.9 * Math.pow(ratio, i); s += '<span style="height:' + Math.max(4, o / 20.9 * 60) + 'px" title="cycle ' + i + ': ' + f(o, 2) + ' %"><em>' + f(o, o < 1 ? 2 : 1) + '</em></span>'; }
      out(r, 'steps', s);
    });
  };

  W.groups = function (r) {
    var tb = document.getElementById('fg-table'); if (!tb) return;
    r.innerHTML = '<div class="art-ctl"><label>Find a group or hazard <input type="search" data-k="q" placeholder="e.g. water, peroxide, amine, gas" style="width:16em"></label><output data-o="c"></output></div>';
    var rows = [].slice.call(tb.querySelectorAll('tbody tr'));
    r.addEventListener('input', function () {
      var q = val(r, 'q').toLowerCase().trim(), n = 0;
      rows.forEach(function (tr) { var ok = !q || tr.textContent.toLowerCase().indexOf(q) >= 0; tr.hidden = !ok; if (ok) n++; });
      out(r, 'c', q ? n + ' of ' + rows.length + ' groups' : '');
    });
  };

  W.adiabatic = function (r) {
    r.innerHTML = box('Adiabatic temperature rise',
      '<div class="art-ctl">' + inp('dh', 'Heat of reaction', -132, 'kcal/mol') + inp('ml', 'Limiting reagent unreacted', 150, 'kg') + inp('mw', 'Its molar mass', 123.11, 'kg/kmol') + '</div>' +
      '<div class="art-ctl">' + inp('mb', 'Batch mass', 1000, 'kg') + inp('cp', 'Mixture Cp', 0.5, 'kcal/kg·°C') + inp('t0', 'Process temperature', 60, '°C') + inp('bp', 'Solvent boiling point', 65, '°C') + inp('td', 'Decomposition onset (DSC)', 250, '°C') + '</div>' +
      '<div class="art-read">' + rd('q', 'Heat available, kcal') + rd('dt', 'ΔT adiabatic, °C') + rd('tm', 'Maximum temperature, °C') + rd('sev', 'Severity (Stoessel scale)') + '</div><p class="cb-msg" data-o="msg"></p>',
      'Screening only. Use the measured heat of reaction and the accumulated (unreacted) amount from reaction calorimetry for design. Severity bands: below 50 °C low, 50–200 °C medium, above 200 °C high.');
    wire(r, function () {
      var n = num(r, 'ml') / num(r, 'mw') * 1000, Q = -num(r, 'dh') * n, dT = Q / (num(r, 'mb') * num(r, 'cp')), t0 = num(r, 't0'), tm = t0 + dT;
      out(r, 'q', f(Q, 0)); out(r, 'dt', f(dT, 0)); out(r, 'tm', f(tm, 0));
      out(r, 'sev', dT < 0 ? 'Endothermic' : dT < 50 ? 'Low' : dT <= 200 ? 'Medium' : 'High', dT > 200 ? 'no' : '');
      var bp = num(r, 'bp'), td = num(r, 'td'), m = [];
      if (tm > bp) m.push('The batch would reach the boiling point (' + f(bp, 0) + ' °C): the condenser and vent must handle the boil-up, or pressure rises in a closed vessel.');
      if (tm > td) m.push('The maximum temperature passes the decomposition onset (' + f(td, 0) + ' °C): a secondary decomposition is possible. This needs a full thermal safety assessment.');
      if (!m.length && dT > 0) m.push('The maximum temperature stays below the boiling point and the decomposition onset for these inputs.');
      out(r, 'msg', m.join(' '));
    });
  };

  W.formation = function (r) {
    var HF = [['', '— pick —', 0], ['h2o_l', 'Water (liquid)', -68.32], ['h2o_g', 'Water (gas)', -57.80], ['co2', 'Carbon dioxide (gas)', -94.05], ['co', 'Carbon monoxide (gas)', -26.42], ['ch4', 'Methane (gas)', -17.89], ['meoh', 'Methanol (liquid)', -57.0], ['etoh', 'Ethanol (liquid)', -66.3], ['nh3', 'Ammonia (gas)', -10.97], ['hcl', 'Hydrogen chloride (gas)', -22.06], ['so2', 'Sulfur dioxide (gas)', -70.94], ['nb', 'Nitrobenzene (liquid)', 3.0], ['an', 'Aniline (liquid)', 7.6], ['bz', 'Benzene (liquid)', 11.7], ['tol', 'Toluene (liquid)', 2.9], ['acet', 'Acetone (liquid)', -59.3], ['acoh', 'Acetic acid (liquid)', -115.7], ['el', 'Element (H₂, O₂, N₂, C…)', 0]];
    function row(p, i, d, c) { return '<div class="art-ctl">' + inp(p + 'c' + i, '', c, '', 1).replace('<span></span>', '') + sel(p + 's' + i, '', HF.map(function (h) { return [h[0], h[1]]; }), d) + '</div>'; }
    r.innerHTML = box('Heat of reaction from heats of formation (Hess’s law)',
      '<div class="cb-grid2"><div><p class="cb-sub">Reactants</p>' + row('r', 1, 'nb', 1) + row('r', 2, 'el', 3) + row('r', 3, '', 0) + '</div><div><p class="cb-sub">Products</p>' + row('p', 1, 'an', 1) + row('p', 2, 'h2o_l', 2) + row('p', 3, '', 0) + '</div></div>' +
      '<div class="art-read">' + rd('dh', 'ΔH reaction, kcal/mol') + rd('kind', 'Type') + '</div>',
      'Standard heats of formation at 25 °C, kcal/mol, rounded from the NIST Chemistry WebBook. Defaults reproduce the nitrobenzene hydrogenation above.');
    var map = {}; HF.forEach(function (h) { map[h[0]] = h[2]; });
    wire(r, function () {
      var s = function (p) { var t = 0; for (var i = 1; i <= 3; i++) { var k = val(r, p + 's' + i); if (k) t += (num(r, p + 'c' + i) || 0) * map[k]; } return t; };
      var dh = s('p') - s('r'); out(r, 'dh', f(dh, 1)); out(r, 'kind', dh < 0 ? 'Exothermic' : dh > 0 ? 'Endothermic' : '–');
    });
  };

  function init() { [].forEach.call(document.querySelectorAll('.cb-w[data-w]'), function (n) { var w = W[n.getAttribute('data-w')]; if (w) { try { w(n); } catch (e) { if (window.console) console.error(e); } } }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
