/* Azeotrope table and estimator page. Data: assets/data/azeotropes.json (measured, CC BY-SA via Wikipedia)
   and assets/data/unifac-do.json (modified UNIFAC Dortmund groups + solvent Antoine constants). */
(function () {
  'use strict';
  var me = document.currentScript, SOL = me.getAttribute('data-sol');
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var f1 = function (v, d) { return (Math.round(v * Math.pow(10, d == null ? 1 : d)) / Math.pow(10, d == null ? 1 : d)).toFixed(d == null ? 1 : d); };
  var track = function (n, p) { try { if (window.gtag) gtag('event', n, p || {}); } catch (e) {} };
  var MEAS = [], MODEL = null, M = null, BYCAS = {}, filt = 'all', showAll = false;

  var TYPE = { min: 'Minimum-boiling', max: 'Maximum-boiling', none: 'No azeotrope', het: 'Two layers' };
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function link(name, slug) { return slug ? '<a href="' + SOL + slug + '/">' + esc(name) + '</a>' : esc(name); }

  /* ---------- measured table ---------- */
  function drawTable() {
    var q = $('az-q').value.trim().toLowerCase();
    var rows = MEAS.filter(function (r) {
      if (filt === 'water' && r.a !== 'water' && r.b !== 'water') return false;
      if (filt === 'het' && !r.L) return false;
      if (filt === 'max' && r.k !== 'max') return false;
      if (q && (r.a + ' ' + r.b).toLowerCase().indexOf(q) < 0 && !(r.ca + r.cb).includes(q)) return false;
      return true;
    });
    var lim = showAll || q ? rows.length : Math.min(rows.length, 40);
    $('az-count').textContent = rows.length + ' of ' + MEAS.length + ' pairs' + (lim < rows.length ? ', showing ' + lim : '');
    $('az-more').hidden = lim >= rows.length;
    var h = '<thead><tr><th>Mixture (A + B)</th><th>Boiling points A / B</th><th>Azeotrope boils at</th><th>Composition (share of B)</th><th>Type</th></tr></thead><tbody>';
    rows.slice(0, lim).forEach(function (r, i) {
      var can = BYCAS[r.ca] && BYCAS[r.cb];
      var comp = r.k === 'none' ? '&ndash;' : f1(r.w, r.w < 1 ? 2 : 1) + ' % w/w' + (r.x != null ? ' <span class="az-mute">(' + f1(r.x) + ' mol %)</span>' : '') + (r.L ? '<br><span class="az-mute">Layers: ' + esc(r.L) + ' % w/w</span>' : '');
      var typ = r.k === 'none' ? 'No azeotrope' : TYPE[r.k] + (r.L ? ', two layers' : '');
      h += '<tr' + (r.flag ? ' class="az-flag"' : '') + '><td>' + link(cap(r.a), r.sa) + ' + ' + link(r.b, r.sb) +
        (can ? '<br><button type="button" class="az-est" data-a="' + r.ca + '" data-b="' + r.cb + '">Estimate &rsaquo;</button>' : '') + '</td>' +
        '<td class="num">' + f1(r.ta) + ' / ' + f1(r.tb) + ' &deg;C</td>' +
        '<td class="num">' + (r.k === 'none' ? '&ndash;' : '<b>' + r.t + ' &deg;C</b>' + (r.P ? '<br><span class="az-mute">at ' + esc(r.P) + '</span>' : '')) + '</td>' +
        '<td class="num">' + comp + '</td><td>' + typ + (r.note ? '<br><span class="az-mute">' + esc(r.note) + '</span>' : '') +
        (r.flag ? '<br><span class="az-warn">Estimate differs by more than 5 &deg;C: check another source</span>' : '') + '</td></tr>';
    });
    $('az-tbl').innerHTML = h + '</tbody>';
  }

  /* ---------- estimator ---------- */
  function toMMHG(v, u) { return u === 'mbar' ? v * 0.750062 : u === 'kPa' ? v * 7.50062 : u === 'vac' ? 760 - v : v; }
  function wt(xb, a, b) { if (!a.mw || !b.mw) return null; var mb = xb * b.mw, ma = (1 - xb) * a.mw; return 100 * mb / (ma + mb); }
  function short(n) { return n.replace(/\s*\(.*\)$/, ''); }
  function measFor(ca, cb) {
    for (var i = 0; i < MEAS.length; i++) {
      var r = MEAS[i];
      if (r.ca === ca && r.cb === cb) return { r: r, flip: false };
      if (r.ca === cb && r.cb === ca) return { r: r, flip: true };
    }
    return null;
  }
  function plot(res, A, B, P) {
    var svg = $('az-svg');
    if (!res || !res.ok) { svg.innerHTML = ''; return; }
    var het = res.az.filter(function (z) { return z.type === 'het'; })[0], gap = het ? res.gap : null, branches = [], k, n = 70;
    if (gap) {
      /* liquid on each side of the two-layer region, spaced finely near the pure components */
      var lx = [], rx = [];
      for (k = 0; k <= n; k++) {
        lx.push(Math.exp(Math.log(1e-6) + (Math.log(gap.x[0]) - Math.log(1e-6)) * k / n));
        rx.push(1 - Math.exp(Math.log(1e-6) + (Math.log(1 - gap.x[1]) - Math.log(1e-6)) * k / n));
      }
      branches.push(PCEAzeo.bubbleCurve(M, A, B, P, [0].concat(lx)));
      branches.push(PCEAzeo.bubbleCurve(M, A, B, P, rx.reverse().concat([1])));
    } else {
      branches.push([{ x: 0, T: res.Tb1, y: 0 }].concat(res.curve).concat([{ x: 1, T: res.Tb2, y: 1 }]));
    }
    var Ts = [res.Tb1, res.Tb2]; branches.forEach(function (b) { b.forEach(function (p) { Ts.push(p.T); }); });
    if (het) Ts.push(het.T);
    var tmin = Math.min.apply(null, Ts), tmax = Math.max.apply(null, Ts);
    var pad = Math.max(2, (tmax - tmin) * 0.08); tmin -= pad; tmax += pad;
    var W = 640, H = 300, L = 52, R = 14, T = 16, Bm = 42;
    var X = function (x) { return L + (W - L - R) * Math.min(1, Math.max(0, x)); }, Y = function (t) { return T + (H - T - Bm) * (1 - (t - tmin) / (tmax - tmin)); };
    var path = function (pts) { return pts.map(function (p, q) { return (q ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' '); };
    var s = '<rect x="' + L + '" y="' + T + '" width="' + (W - L - R) + '" height="' + (H - T - Bm) + '" fill="none" stroke="var(--grid-line)"/>';
    for (k = 0; k <= 5; k++) { var tv = tmin + (tmax - tmin) * k / 5; s += '<text x="' + (L - 6) + '" y="' + (Y(tv) + 4) + '" text-anchor="end" class="az-ax">' + f1(tv, 0) + '</text>'; }
    for (k = 0; k <= 4; k++) s += '<text x="' + X(k / 4) + '" y="' + (H - Bm + 16) + '" text-anchor="middle" class="az-ax">' + (k * 25) + '</text>';
    s += '<text x="' + ((L + W - R) / 2) + '" y="' + (H - 6) + '" text-anchor="middle" class="az-ax">mol % ' + esc(short(B.n)) + ' (in liquid or vapour)</text>';
    s += '<text x="12" y="' + (T + 4) + '" class="az-ax">&deg;C</text>';
    branches.forEach(function (b, q) {
      var liq = b.map(function (p) { return [p.x, p.T]; }), vap = b.map(function (p) { return [p.y, p.T]; });
      if (het) { if (q === 0) { liq.push([gap.x[0], het.T]); vap.push([het.y2, het.T]); } else { liq.unshift([gap.x[1], het.T]); vap.unshift([het.y2, het.T]); } }
      s += '<path d="' + path(liq) + '" class="az-liq"/><path d="' + path(vap) + '" class="az-vap"/>';
    });
    if (het) s += '<line x1="' + X(gap.x[0]) + '" x2="' + X(gap.x[1]) + '" y1="' + Y(het.T) + '" y2="' + Y(het.T) + '" class="az-liq" stroke-dasharray="5 4"/>';
    res.az.forEach(function (z) { var xz = z.type === 'het' ? z.y2 : z.x2; s += '<circle cx="' + X(xz) + '" cy="' + Y(z.T) + '" r="5" class="az-pt"/>'; });
    s += '<g class="az-leg"><line x1="' + (L + 10) + '" x2="' + (L + 30) + '" y1="' + (T + 14) + '" y2="' + (T + 14) + '" class="az-liq"/><text x="' + (L + 36) + '" y="' + (T + 18) + '">Liquid (bubble point)</text>' +
      '<line x1="' + (L + 180) + '" x2="' + (L + 200) + '" y1="' + (T + 14) + '" y2="' + (T + 14) + '" class="az-vap"/><text x="' + (L + 206) + '" y="' + (T + 18) + '">Vapour (dew point)</text>' +
      (het ? '<line x1="' + (L + 340) + '" x2="' + (L + 360) + '" y1="' + (T + 14) + '" y2="' + (T + 14) + '" class="az-liq" stroke-dasharray="5 4"/><text x="' + (L + 366) + '" y="' + (T + 18) + '">Two liquid layers</text>' : '') + '</g>';
    svg.innerHTML = s;
    svg.setAttribute('aria-label', 'Boiling point diagram of ' + short(A.n) + ' and ' + short(B.n) + ' at ' + f1(P, 0) + ' mmHg');
  }
  function describe(z, A, B) {
    var a = short(A.n), b = short(B.n);
    if (z.type === 'het') {
      var w = wt(z.y2, A, B);
      return '<p class="az-big">Heterogeneous azeotrope at <b>' + f1(z.T) + ' &deg;C</b></p><p>The vapour, and the condensate, contain <b>' + f1(100 * z.y2) + ' mol % ' + esc(b) + '</b>' + (w != null ? ' (' + f1(w) + ' % w/w)' : '') + '. The condensate separates into two layers: one with ' + fmtx(z.xI) + ' mol % ' + esc(b) + ', the other with ' + fmtx(z.xII) + ' mol % ' + esc(b) + '. Decanting the layers breaks the azeotrope.</p>';
    }
    var w2 = wt(z.x2, A, B);
    return '<p class="az-big">' + (z.type === 'min' ? 'Minimum' : 'Maximum') + '-boiling azeotrope at <b>' + f1(z.T) + ' &deg;C</b></p><p>Composition: <b>' + f1(100 * z.x2) + ' mol % ' + esc(b) + '</b>' + (w2 != null ? ' (' + f1(w2) + ' % w/w)' : '') + ', the rest ' + esc(a) + '. ' + (z.type === 'min' ? 'It distils over first; the pure component in excess stays in the still.' : 'It stays in the still while the component in excess distils off.') + '</p>';
  }
  function fmtx(x) { var v = 100 * x; return v < 0.1 ? v.toPrecision(1) : v < 1 || v > 99 ? f1(v, 2) : f1(v); }

  /* Cross-checks against the solvent pages: water miscibility and melting points */
  function waterNote(res, A, B) {
    var w = A.s === 'water' ? B : B.s === 'water' ? A : null; if (!w) return '';
    var het = res.az.some(function (z) { return z.type === 'het'; }), nm = esc(short(w.n));
    if (het && w.ww === 'm') return '<p class="az-warn">The ' + nm + ' page lists it as fully miscible with water, so the condensate is probably one layer, not two. Modified UNIFAC tends to over-predict layer separation; treat this temperature as approximate and rely on measured data where available.</p>';
    if (!het && res.az.length && w.ww === 'n') return '<p class="az-warn">The ' + nm + ' page lists it as not miscible with water, so in practice the condensate will usually split into two layers.</p>';
    return '';
  }
  function frozen(T, A, B) {
    var f = [A, B].filter(function (c) { return c.mp != null && T < c.mp; });
    return f.length ? f.map(function (c) { return esc(short(c.n)); }).join(' and ') : '';
  }
  function checks(res, A, B) {
    var h = waterNote(res, A, B);
    res.az.forEach(function (z) { var f = frozen(z.T, A, B); if (f) h += '<p class="az-warn">' + f1(z.T) + ' &deg;C is below the melting point of ' + f + ', so this azeotrope is not reachable at this pressure; the liquid would freeze first.</p>'; });
    return h;
  }

  function run() {
    var ia = $('az-a').value, ib = $('az-b').value, out = $('az-res'), sw = $('az-sweep');
    var A = BYCAS[ia], B = BYCAS[ib];
    var P = toMMHG(+$('az-p').value, $('az-u').value);
    if (!A || !B) return;
    if (ia === ib) { out.innerHTML = '<p class="az-warn">Pick two different solvents.</p>'; plot(null); sw.innerHTML = ''; return; }
    if (!(P > 1) || P > 15000) { out.innerHTML = '<p class="az-warn">Enter an absolute pressure between 1 and 15,000 mmHg (vacuum gauge readings must be below 760).</p>'; plot(null); sw.innerHTML = ''; return; }
    var res = PCEAzeo.azeotropes(M, A, B, P);
    track('azeotrope_estimate', { pair: A.s + '+' + B.s, p_mmhg: Math.round(P) });
    if (!res.ok) { out.innerHTML = '<p class="az-warn">No published modified UNIFAC parameters for the groups in this pair, so it cannot be estimated. Use measured data.</p>'; plot(null); sw.innerHTML = ''; return; }
    var h = '<div class="az-card">';
    h += res.az.length ? res.az.map(function (z) { return describe(z, A, B); }).join('') : '<p class="az-big">No azeotrope predicted</p><p>At this pressure the model predicts that ' + esc(short(A.n)) + ' and ' + esc(short(B.n)) + ' can be separated by distillation (a close-boiling pair can still need many plates).</p>';
    h += '<p class="az-mute">Pure boiling points at ' + f1(P, 0) + ' mmHg: ' + esc(short(A.n)) + ' ' + f1(res.Tb1) + ' &deg;C, ' + esc(short(B.n)) + ' ' + f1(res.Tb2) + ' &deg;C. Estimate by modified UNIFAC (Dortmund).</p>';
    var m = measFor(ia, ib);
    if (m) {
      var r = m.r;
      h += '<p class="az-meas"><b>Measured at ' + (r.P || '760 mmHg') + ':</b> ' + (r.k === 'none' ? 'no azeotrope' : r.t + ' &deg;C, ' + f1(m.flip ? 100 - r.w : r.w) + ' % w/w ' + esc(short(B.n)) + (r.L ? ', two layers' : '')) + '.' + (r.note ? ' ' + esc(r.note) : '') + '</p>';
    }
    var chk = checks(res, A, B);
    if (chk.indexOf('fully miscible with water') >= 0) h = h.replace(' Decanting the layers breaks the azeotrope.', '').replace('Heterogeneous azeotrope at', 'Azeotrope at').replace('The condensate separates into two layers:', 'The model predicts two layers:');
    h += chk;
    if (P < 50) h += '<p class="az-warn">Below about 50 mmHg the Antoine constants are used far from where they were fitted; treat the temperatures as rough.</p>';
    out.innerHTML = h + '</div>';
    plot(res, A, B, P);
    sw.innerHTML = '<p class="az-mute">Working out how the azeotrope moves with pressure&hellip;</p>';
    setTimeout(function () { sweep(A, B); }, 30);
  }
  function sweep(A, B) {
    var Ps = [50, 100, 200, 400, 760, 1520, 3800], b = short(B.n);
    var rows = Ps.map(function (p) {
      var r = PCEAzeo.azeotropes(M, A, B, p); if (!r.ok) return '';
      var z = r.az[0];
      var kpa = f1(p / 7.50062, 0);
      if (!z) return '<tr><td class="num">' + p + ' <span class="az-mute">(' + kpa + ' kPa)</span></td><td colspan="3">No azeotrope</td></tr>';
      var x = z.type === 'het' ? z.y2 : z.x2, w = wt(x, A, B);
      var fz = frozen(z.T, A, B);
      return '<tr><td class="num">' + p + ' <span class="az-mute">(' + kpa + ' kPa)</span></td><td class="num">' + f1(z.T) + ' &deg;C' + (fz ? '<br><span class="az-warn">below melting point of ' + fz + '</span>' : '') + '</td><td class="num">' + f1(100 * x) + (w != null ? ' <span class="az-mute">(' + f1(w) + ' % w/w)</span>' : '') + '</td><td>' + (z.type === 'het' ? 'Two layers' : TYPE[z.type]) + '</td></tr>';
    }).join('');
    $('az-sweep').innerHTML = '<h3>How it moves with pressure (estimate)</h3><div class="sv-scroll"><table class="sv-table az-table"><thead><tr><th>Pressure (mmHg abs)</th><th>Azeotrope boils at</th><th>mol % ' + esc(b) + '</th><th>Type</th></tr></thead><tbody>' + rows + '</tbody></table></div><p class="az-mute">If the composition shifts a lot between two pressures, pressure-swing distillation may separate the pair.</p>';
  }

  function fillSelects() {
    var opts = MODEL.comps.slice().sort(function (p, q) { return p.n.localeCompare(q.n); }).map(function (c) { return '<option value="' + c.cas + '">' + esc(c.n) + '</option>'; }).join('');
    $('az-a').innerHTML = opts; $('az-b').innerHTML = opts;
    var qs = new URLSearchParams(location.search);
    var byslug = function (s) { var c = MODEL.comps.filter(function (c) { return c.s === s; })[0]; return c && c.cas; };
    $('az-a').value = byslug(qs.get('a')) || '108-88-3';
    $('az-b').value = byslug(qs.get('b')) || '7732-18-5';
  }

  function init() {
    Promise.all([fetch(me.getAttribute('data-meas')).then(function (r) { return r.json(); }), fetch(me.getAttribute('data-model')).then(function (r) { return r.json(); })]).then(function (d) {
      MEAS = d[0]; MODEL = d[1]; M = PCEAzeo.makeModel(MODEL);
      MODEL.comps.forEach(function (c) { BYCAS[c.cas] = c; });
      var qs = new URLSearchParams(location.search);
      if (qs.get('q')) $('az-q').value = qs.get('q');
      drawTable(); fillSelects(); run();
    }).catch(function () { $('az-count').textContent = 'The data did not load. Check your connection and reload the page.'; });
    $('az-q').addEventListener('input', drawTable);
    document.querySelectorAll('.az-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        filt = b.dataset.f; document.querySelectorAll('.az-chip').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); drawTable();
      });
    });
    $('az-more').addEventListener('click', function () { showAll = true; drawTable(); });
    $('az-tbl').addEventListener('click', function (e) {
      var b = e.target.closest('.az-est'); if (!b) return;
      $('az-a').value = b.dataset.a; $('az-b').value = b.dataset.b; run();
      $('calculator').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    $('az-go').addEventListener('click', run);
    ['az-a', 'az-b', 'az-u'].forEach(function (id) { $(id).addEventListener('change', run); });
    $('az-p').addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
  }
  init();
})();
