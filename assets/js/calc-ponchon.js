/* Ponchon-Savarit calculator page. Needs pce-kit.js, batch-distill-engine.js, mccabe-engine.js, vle-binary.js, ponchon-engine.js.
   Enthalpies in kcal/kmol, reference: pure liquids at 0 °C. Latent heat with temperature from the Antoine slope (Clausius-Clapeyron),
   scaled to the measured value at the normal boiling point. Heat of mixing from modified UNIFAC: hE = −RT² Σ x dlnγ/dT. */
(function () {
  'use strict';
  var K = PCEKit, F = K.F, G = K.G, MC = PCEMcCabe, PS = PCEPonchon, me = document.currentScript;
  var URL_U = me && me.getAttribute('data-unifac'), URL_S = me && me.getAttribute('data-sol');
  var U = null, BY = {}, LITE = {}, RG = 1.98720;
  var isSol = function (v) { return v.vle === 'sol' || v.vle === 'ideal'; };

  /* enthalpy functions for a solvent pair on curve c */
  function solEnthalpy(c, a, b, mix) {
    var A = BY[a], B = BY[b], MOD = PCEVLE.model(), S = mix ? MOD.setup([A, B]) : null;
    var tb = function (C) { return C.ant[1] / (C.ant[0] - Math.log(760) / Math.LN10) - C.ant[2]; };
    var cc = function (C, t) { var T = t + 273.15; return T * T * C.ant[1] / Math.pow(C.ant[2] + t, 2); };
    function lamFn(C) { var L = LITE[C.s], Tb = tb(C), lb = L && L.lh ? L.lh * C.mw : 21 * (Tb + 273.15), r = cc(C, Tb); return function (t) { return lb * cc(C, t) / r; }; }
    var lA = lamFn(A), lB = lamFn(B), cpA = (LITE[a] && LITE[a].cp || 0.5) * A.mw, cpB = (LITE[b] && LITE[b].cp || 0.5) * B.mw;
    function hE(x, t) {
      if (!S || x <= 0 || x >= 1) return 0;
      var T = t + 273.15, g1 = MOD.lngam(S, [x, 1 - x], T + 0.5), g0 = MOD.lngam(S, [x, 1 - x], T - 0.5);
      return -RG * T * T * (x * (g1[0] - g0[0]) + (1 - x) * (g1[1] - g0[1]));
    }
    /* dew temperature as a function of y, on the branch below or above an azeotrope */
    var lowP = c.pts.filter(function (p) { return !c.az || p[0] <= c.az; }), hiP = c.az ? c.pts.filter(function (p) { return p[0] >= c.az; }) : [];
    function tab(P) { var q = P.map(function (p) { return [p[1], p[2]]; }).sort(function (u, w) { return u[0] - w[0]; }); return function (y) { if (y <= q[0][0]) return q[0][1]; if (y >= q[q.length - 1][0]) return q[q.length - 1][1]; var lo = 0, hi = q.length - 1; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (q[m][0] <= y) lo = m; else hi = m; } var f = (y - q[lo][0]) / ((q[hi][0] - q[lo][0]) || 1); return q[lo][1] + f * (q[hi][1] - q[lo][1]); }; }
    var dewLo = tab(lowP), dewHi = hiP.length > 2 ? tab(hiP) : dewLo;
    var Td = function (y) { return c.az && y > c.az ? dewHi(y) : dewLo(y); };
    /* tabulate once on a grid that is fine at both ends, then interpolate */
    var gx = []; for (var i = 0; i <= 400; i++) gx.push(i / 400); [1e-6, 1e-5, 1e-4, 1e-3].forEach(function (e) { gx.push(e, 1 - e); }); gx.sort(function (p1, p2) { return p1 - p2; });
    var hLt = gx.map(function (x) { var t = c.T(x); return x * cpA * t + (1 - x) * cpB * t + hE(x, t); });
    var HVt = gx.map(function (y) { var t = Td(y); return y * (cpA * t + lA(t)) + (1 - y) * (cpB * t + lB(t)); });
    var interp = function (A) { return function (z) { if (z <= 0) return A[0]; if (z >= 1) return A[A.length - 1]; var lo = 0, hi = gx.length - 1; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (gx[m] <= z) lo = m; else hi = m; } return A[lo] + (z - gx[lo]) / (gx[hi] - gx[lo]) * (A[hi] - A[lo]); }; };
    var hL = interp(hLt), HV = interp(HVt);
    var hLiq = function (x, t) { return x * cpA * t + (1 - x) * cpB * t + hE(x, t); };
    return { hL: hL, HV: HV, Td: Td, hLiq: hLiq, lamA: lA, lamB: lB };
  }
  /* own data rows: x y hL HV */
  function dataEnthalpy(txt) {
    var n = String(txt || '').replace(/[;,\n\t]+/g, ' ').trim().split(/\s+/).map(Number);
    if (n.length < 16 || n.length % 4 || n.some(function (v) { return !isFinite(v); })) return { err: 'Enter at least four rows of four numbers: x y hL HV (mole fractions, kcal/kmol).' };
    var rows = []; for (var i = 0; i < n.length; i += 4) rows.push(n.slice(i, i + 4));
    if (rows.some(function (r) { return r[0] < 0 || r[0] > 1 || r[1] < 0 || r[1] > 1; })) return { err: 'x and y must be mole fractions between 0 and 1.' };
    var sorted = rows.slice().sort(function (u, w) { return u[0] - w[0]; });
    if (sorted.some(function (r, i) { return i && r[1] < sorted[i - 1][1]; })) return { err: 'y must rise as x rises. Check the order of the numbers in each row: x y hL HV.' };
    if (rows.some(function (r) { return r[3] <= r[2]; })) return { err: 'Each saturated vapour enthalpy HV must be above the liquid enthalpy hL on the same row.' };
    var dc = PCEVLE.dataCurve(rows.filter(function (r) { return r[0] > 0 && r[0] < 1; }).map(function (r) { return r[0] + ' ' + r[1]; }).join(', '), false);
    if (dc.err) return dc;
    function lin(P) { P = P.slice().sort(function (u, w) { return u[0] - w[0]; }); return function (z) { var k = 0; while (k < P.length - 2 && z > P[k + 1][0]) k++; var f = (z - P[k][0]) / ((P[k + 1][0] - P[k][0]) || 1); return P[k][1] + f * (P[k + 1][1] - P[k][1]); }; }
    return { c: dc.c, H: { hL: lin(rows.map(function (r) { return [r[0], r[2]]; })), HV: lin(rows.map(function (r) { return [r[1], r[3]]; })) } };
  }

  /* ---------- enthalpy-composition (Ponchon) diagram ---------- */
  function hxy(H, o, s, run, view, name) {
    var W = 620, L = 70, R = 18, T = 14, pw = W - L - R, ph = 470, B = 84, xs = [], k;
    for (k = 0; k <= 100; k++) xs.push(k / 100);
    var hv = xs.map(H.HV), hl = xs.map(H.hL), lo = Math.min.apply(null, hl), hi = Math.max.apply(null, hv);
    if (view === 'all') { lo = Math.min(lo, s.QB); hi = Math.max(hi, s.QD); }
    var pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
    var X = function (x) { return L + pw * x; }, Y = function (h) { return T + ph * (1 - (h - lo) / (hi - lo)); }, P = function (x, h) { return X(x).toFixed(1) + ' ' + Y(h).toFixed(1); };
    var sv = '<svg viewBox="0 0 ' + W + ' ' + (T + ph + B) + '" width="100%" role="img" aria-label="Enthalpy-composition diagram"><defs><clipPath id="psc"><rect x="' + L + '" y="' + T + '" width="' + pw + '" height="' + ph + '"/></clipPath></defs><rect x="' + L + '" y="' + T + '" width="' + pw + '" height="' + ph + '" class="pk-frame"/>';
    var step = Math.pow(10, Math.floor(Math.log10((hi - lo) / 5))), m = (hi - lo) / step > 12 ? 5 : (hi - lo) / step > 6 ? 2 : 1; step *= m;
    for (var g = Math.ceil(lo / step) * step; g <= hi; g += step) sv += '<line x1="' + L + '" x2="' + (L + pw) + '" y1="' + Y(g) + '" y2="' + Y(g) + '" class="pk-grid"/><text x="' + (L - 6) + '" y="' + (Y(g) + 4) + '" text-anchor="end" class="pk-ax">' + F(Math.abs(g) < step * 1e-6 ? 0 : g, 0) + '</text>';
    for (k = 0; k <= 10; k++) sv += '<line x1="' + X(k / 10) + '" x2="' + X(k / 10) + '" y1="' + T + '" y2="' + (T + ph) + '" class="pk-grid"/><text x="' + X(k / 10) + '" y="' + (T + ph + 16) + '" text-anchor="middle" class="pk-ax">' + k / 10 + '</text>';
    sv += '<text x="' + (L + pw / 2) + '" y="' + (T + ph + 38) + '" text-anchor="middle" class="pk-ax">x or y, mole fraction of ' + K.esc(name) + '</text><text transform="translate(14 ' + (T + ph / 2) + ') rotate(-90)" text-anchor="middle" class="pk-ax">enthalpy, kcal/kmol</text><g clip-path="url(#psc)">';
    var line = function (arr, cls) { return '<path d="' + arr.map(function (h, i) { return (i ? 'L' : 'M') + P(xs[i], h); }).join('') + '" class="pk-l ' + cls + '" style="stroke-width:2.5"/>'; };
    sv += line(hv, 'pk-l2') + line(hl, 'pk-l0');
    /* operating lines from the difference points, and equilibrium tie lines */
    var op = '', tie = '';
    run.st.forEach(function (p, i) {
      tie += 'M' + P(p.x, H.hL(p.x)) + 'L' + P(p.y, H.HV(p.y));
      var nx = run.st[i + 1]; if (!nx) return;
      var top = nx.n <= run.feed, dx = top ? o.xD : o.xB, dq = top ? s.QD : s.QB;
      op += 'M' + P(dx, dq) + 'L' + P(p.x, H.hL(p.x)) + 'M' + P(dx, dq) + 'L' + P(nx.y, H.HV(nx.y));
    });
    sv += '<path d="' + op + '" style="fill:none;stroke:var(--muted);stroke-width:.8;stroke-dasharray:3 3"/><path d="' + tie + '" style="fill:none;stroke:var(--paper);stroke-width:1.4"/>';
    sv += '<path d="M' + P(o.xD, s.QD) + 'L' + P(o.xB, s.QB) + '" class="pk-l pk-l3" style="stroke-width:1.5"/></g>';
    var mk = function (x, h, t, col) { var y = Y(h), out = y < T || y > T + ph, yy = Math.max(T + 6, Math.min(T + ph - 4, y)); return '<circle cx="' + X(x) + '" cy="' + yy + '" r="5" style="fill:' + col + '"/><text x="' + (X(x) + (x > 0.8 ? -8 : 8)) + '" y="' + (yy + (yy < T + 20 ? 14 : -6)) + '" text-anchor="' + (x > 0.8 ? 'end' : 'start') + '" class="pk-ax" style="font-weight:700;fill:' + col + '">' + t + (out ? ' (off chart: ' + F(h, 0) + ')' : '') + '</text>'; };
    sv += mk(o.zF, o.hF, 'F', '#E07A6A') + mk(o.xD, s.QD, 'ΔD', '#F2A900') + mk(o.xB, s.QB, 'ΔB', '#5FD09A');
    var lg = [['pk-l2', 'saturated vapour HV'], ['pk-l0', 'saturated liquid hL'], ['pk-l3', 'ΔD – F – ΔB line']], lx = L, ly = T + ph + 58;
    lg.forEach(function (l) { sv += '<line x1="' + lx + '" x2="' + (lx + 18) + '" y1="' + (ly - 4) + '" y2="' + (ly - 4) + '" class="pk-l ' + l[0] + '"/><text x="' + (lx + 22) + '" y="' + ly + '" class="pk-ax">' + l[1] + '</text>'; lx += 34 + l[1].length * 6; });
    sv += '<text x="' + L + '" y="' + (ly + 18) + '" class="pk-ax">Solid lines between the curves: equilibrium stages. Dashed: operating lines through ΔD or ΔB.</text>';
    return sv + '</svg>';
  }
  /* x-y diagram with the curved operating lines */
  function xyd(c, o, run, name) {
    var W = 620, L = 58, R = 18, T = 14, pw = W - L - R, B = 70, X = function (x) { return L + pw * x; }, Y = function (y) { return T + pw * (1 - y); }, P = function (x, y) { return X(x).toFixed(1) + ' ' + Y(y).toFixed(1); }, k;
    var sv = '<svg viewBox="0 0 ' + W + ' ' + (T + pw + B) + '" width="100%" role="img" aria-label="x-y diagram"><rect x="' + L + '" y="' + T + '" width="' + pw + '" height="' + pw + '" class="pk-frame"/>';
    for (k = 0; k <= 10; k++) sv += '<line x1="' + X(k / 10) + '" x2="' + X(k / 10) + '" y1="' + T + '" y2="' + (T + pw) + '" class="pk-grid"/><line x1="' + L + '" x2="' + (L + pw) + '" y1="' + Y(k / 10) + '" y2="' + Y(k / 10) + '" class="pk-grid"/><text x="' + X(k / 10) + '" y="' + (T + pw + 16) + '" text-anchor="middle" class="pk-ax">' + k / 10 + '</text><text x="' + (L - 6) + '" y="' + (Y(k / 10) + 4) + '" text-anchor="end" class="pk-ax">' + k / 10 + '</text>';
    sv += '<text x="' + (L + pw / 2) + '" y="' + (T + pw + 38) + '" text-anchor="middle" class="pk-ax">x, liquid mole fraction of ' + K.esc(name) + '</text>';
    sv += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(1) + '" y2="' + Y(1) + '" style="stroke:var(--muted);stroke-width:1"/>';
    var d = ''; for (k = 0; k <= 200; k++) d += (k ? 'L' : 'M') + P(k / 200, c.y(k / 200)); sv += '<path d="' + d + '" class="pk-l pk-l0" style="stroke-width:2.5"/>';
    var curve = function (f, a, b, cls) { var dd = '', first = true; for (var j = 0; j <= 80; j++) { var x = a + (b - a) * j / 80, y = f(x); if (!isFinite(y)) continue; dd += (first ? 'M' : 'L') + P(x, y); first = false; } return '<path d="' + dd + '" class="pk-l ' + cls + '" style="stroke-width:2"/>'; };
    var xf = run.st[run.feed - 1] ? run.st[run.feed - 1].x : o.zF;
    sv += curve(run.s.yR, xf, o.xD, 'pk-l1') + curve(run.s.yS, o.xB, xf, 'pk-l2');
    var dd = '', x0 = o.partial ? o.xD : o.xD, lab = '', lastL = null;
    run.st.forEach(function (p, i) {
      dd += 'M' + P(x0, p.y) + 'L' + P(p.x, p.y) + 'L' + P(p.x, i < run.st.length - 1 ? run.st[i + 1].y : p.x); x0 = p.x;
      var fx = X(p.x), fy = Y(p.y), far = !lastL || Math.abs(fx - lastL[0]) > 13 || Math.abs(fy - lastL[1]) > 13 || p.n === run.feed;
      if (far) { lastL = [fx, fy]; lab += '<text x="' + (fx - L < 26 ? fx + 5 : fx - 4) + '" y="' + Math.max(T + 11, fy - 5) + '" text-anchor="' + (fx - L < 26 ? 'start' : 'end') + '" class="pk-ax" style="font-weight:700;fill:' + (p.n === run.feed ? '#E07A6A' : 'var(--paper)') + '">' + p.n + '</text>'; }
    });
    sv += '<path d="' + dd + '" style="fill:none;stroke:var(--paper);stroke-width:1.4"/>' + lab;
    var lg = [['pk-l0', 'equilibrium'], ['pk-l1', 'rectifying (curved)'], ['pk-l2', 'stripping (curved)']], lx = L, ly = T + pw + 58;
    lg.forEach(function (l) { sv += '<line x1="' + lx + '" x2="' + (lx + 18) + '" y1="' + (ly - 4) + '" y2="' + (ly - 4) + '" class="pk-l ' + l[0] + '"/><text x="' + (lx + 22) + '" y="' + ly + '" class="pk-ax">' + l[1] + '</text>'; lx += 34 + l[1].length * 6; });
    return sv + '</svg>';
  }

  function register() {
    var opts = U.comps.slice().sort(function (a, b) { return a.n.localeCompare(b.n); }).map(function (c) { return [c.s, c.n]; });
    var sol = isSol;
    K.add('ponchon', {
      title: 'Ponchon-Savarit: stages and duties from enthalpy',
      sub: 'Binary distillation by the enthalpy-composition method: difference points, minimum reflux, stages, changing flows and exact condenser and reboiler duties',
      inputs: [
        { k: 'h1', type: 'head', label: 'Equilibrium and enthalpy data' },
        { k: 'vle', label: 'Data from', type: 'sel', v: 'sol', opts: [['sol', 'Two solvents: real mixture with heat of mixing (modified UNIFAC)'], ['ideal', 'Two solvents: ideal mixture (Raoult, no heat of mixing)'], ['alpha', 'Constant relative volatility with two latent heats'], ['data', 'My own table: x, y, hL, HV']] },
        { k: 'a', label: 'Light component (more volatile)', type: 'sel', v: 'ethanol', opts: opts, show: sol },
        { k: 'b', label: 'Heavy component', type: 'sel', v: 'water', opts: opts, show: sol },
        { k: 'p', label: 'Column pressure', v: 760, show: sol },
        { k: 'u', label: 'Pressure unit', type: 'sel', v: 'mmhga', opts: K.pOpts(['mmhga', 'mbara', 'bara', 'barg', 'kscg']), show: sol },
        { k: 'al', label: 'Relative volatility α', v: 2.5, show: function (v) { return v.vle === 'alpha'; } },
        { k: 'la', label: 'Latent heat of the light component', unit: 'kcal/kmol', v: 7000, show: function (v) { return v.vle === 'alpha'; } },
        { k: 'lb', label: 'Latent heat of the heavy component', unit: 'kcal/kmol', v: 9700, show: function (v) { return v.vle === 'alpha'; }, help: 'Equal latent heats give the McCabe-Thiele answer. The difference is what this method captures.' },
        { k: 'dt', label: 'Rows: x  y  hL  HV', type: 'text', v: '0 0 2000 11700, 0.1 0.217 1950 11450, 0.3 0.517 1850 10950, 0.5 0.714 1750 10450, 0.7 0.854 1650 9950, 0.9 0.957 1550 9450, 1 1 1500 9200', show: function (v) { return v.vle === 'data'; }, help: 'Mole fractions and kcal/kmol. x and y on a row are in equilibrium; hL is at x and HV at y, both saturated. The default rows are illustrative: replace them with your data.' },
        { k: 'h2', type: 'head', label: 'Feed and products (light component)' },
        { k: 'bs', label: 'Compositions in', type: 'sel', v: 'w', opts: [['w', 'wt %'], ['m', 'mol %']], show: sol },
        { k: 'zF', label: 'Feed', unit: '% (mol %, or wt % if chosen)', v: 30 },
        { k: 'xD', label: 'Distillate (top product)', unit: '%', v: 88 },
        { k: 'xB', label: 'Bottoms (residue)', unit: '%', v: 0.1 },
        { k: 'F', label: 'Feed rate', unit: 'kg/h or kmol/h as chosen', v: 1000, show: sol },
        { k: 'fu', label: 'Feed rate unit', type: 'sel', v: 'kg', opts: [['kg', 'kg/h'], ['km', 'kmol/h']], show: sol },
        { k: 'Fm', label: 'Feed rate', unit: 'kmol/h', v: 100, show: function (v) { return !isSol(v); } },
        { k: 'fc', label: 'Feed condition', type: 'sel', v: 'sl', opts: [['sl', 'Saturated liquid'], ['sub', 'Cold liquid below its boiling point'], ['pv', 'Partly vaporised'], ['sv', 'Saturated vapour'], ['h', 'Enter the feed enthalpy']] },
        { k: 'tf', label: 'Feed temperature', unit: '°C', v: 30, show: function (v) { return v.fc === 'sub' && isSol(v); } },
        { k: 'fv', label: 'Vapour in the feed', unit: 'mol %', v: 30, show: function (v) { return v.fc === 'pv'; } },
        { k: 'hf', label: 'Feed enthalpy', unit: 'kcal/kmol (same reference as the data)', v: -1000, show: function (v) { return v.fc === 'h' || (v.fc === 'sub' && !isSol(v)); } },
        { k: 'h3', type: 'head', label: 'Column' },
        { k: 'rm', label: 'Reflux set as', type: 'sel', v: 'mult', opts: [['mult', 'Multiple of minimum reflux'], ['R', 'Reflux ratio R = L/D']] },
        { k: 'rf', label: 'R ÷ Rmin', v: 1.3, show: function (v) { return v.rm === 'mult'; } },
        { k: 'R', label: 'Reflux ratio R', v: 2, show: function (v) { return v.rm === 'R'; } },
        { k: 'cd', label: 'Condenser', type: 'sel', v: 't', opts: [['t', 'Total condenser (saturated liquid reflux and distillate)'], ['p', 'Partial condenser (vapour distillate, counts as a stage)']] },
        { k: 'E', label: 'Overall tray efficiency', unit: '%', v: 100, help: 'Real trays = theoretical trays in the column ÷ efficiency.' },
        { k: 'zm', label: 'Enthalpy diagram view', type: 'sel', v: 'all', opts: [['all', 'Show the difference points'], ['sat', 'Zoom on the saturation curves']] }
      ],
      example: { v: { vle: 'alpha', al: 2.5, la: 7000, lb: 9700, bs: 'm', zF: 50, xD: 95, xB: 5, Fm: 100, fc: 'sl', rm: 'mult', rf: 1.5, cd: 't', E: 100, zm: 'all' } },
      run: function (v) {
        var c, H, name = 'light component', nameH = 'heavy component', mwA, mwB, notes = [], Pmm;
        if (isSol(v)) {
          if (!v.a || !v.b || v.a === v.b) return { rows: [], notes: [['Choose two different components.', 'bad']] };
          Pmm = K.toBarA(v.p, v.u) / 1.33322e-3; if (!(Pmm > 1)) return { rows: [], notes: [['Enter a column pressure above vacuum zero.', 'bad']] };
          var a = v.a, b = v.b; c = PCEVLE.solCurve(a, b, Pmm, v.vle === 'ideal');
          if (!c) return { rows: [], notes: [['Published modified UNIFAC parameters are missing for this pair. Choose "ideal mixture" or enter your own table.', 'bad']] };
          if (c.y(0.5) < 0.5 && !c.az) { var t = a; a = b; b = t; c = PCEVLE.solCurve(a, b, Pmm, v.vle === 'ideal'); notes.push([BY[a].n + ' is the more volatile component, so it is treated as the light component. The compositions you entered are read as ' + BY[a].n + '.', 'warn']); }
          var cr = v.vle === 'ideal' ? PCEVLE.solCurve(a, b, Pmm, false) : c;
          if ((c.lle && c.lle.xa != null && !c.lle.outside) || (cr && cr.lle && cr.lle.xa != null && !cr.lle.outside)) return { rows: [], notes: [['These two liquids separate into two layers at their boiling point. Enthalpy of a two-liquid mixture is not modelled here: use the McCabe-Thiele calculator, which handles the two-liquid range, or a full process simulator.', 'bad']] };
          H = solEnthalpy(c, a, b, v.vle === 'sol'); name = BY[a].n.replace(/\s*\(.*\)$/, ''); nameH = BY[b].n.replace(/\s*\(.*\)$/, ''); mwA = BY[a].mw; mwB = BY[b].mw;
          if (!(LITE[a] && LITE[a].lh && LITE[b] && LITE[b].lh)) notes.push(['Latent heat estimated from the boiling point (Trouton rule) for a component without data.', 'warn']);
        } else if (v.vle === 'alpha') {
          if (!(v.al > 1)) return { rows: [], notes: [['Relative volatility must be above 1.', 'bad']] };
          if (!(v.la > 0 && v.lb > 0)) return { rows: [], notes: [['Enter both latent heats above zero.', 'bad']] };
          c = MC.alphaCurve(v.al); H = { hL: function () { return 0; }, HV: function (y) { return y * v.la + (1 - y) * v.lb; } };
        } else { var de = dataEnthalpy(v.dt); if (de.err) return { rows: [], notes: [[de.err, 'bad']] }; c = de.c; H = de.H; }
        var wt = isSol(v) && v.bs === 'w', toX = function (p) { var w = p / 100; return wt ? (w / mwA) / (w / mwA + (1 - w) / mwB) : w; }, toW = function (x) { return 100 * x * mwA / (x * mwA + (1 - x) * mwB); };
        var zF = toX(v.zF), xD = toX(v.xD), xB = toX(v.xB);
        if (!(xB > 0 && xD < 1 && xB < zF && zF < xD)) return { rows: [], notes: [['Compositions must satisfy 0 < bottoms < feed < distillate < 100 %.', 'bad']] };
        if (c.az && xD > c.az - 1e-6) return { rows: [], notes: [['The distillate is beyond the azeotrope at ' + F(100 * c.az, 1) + ' mol % ' + name + (c.T ? ' (' + F(c.T(c.az), 1) + ' °C)' : '') + '. No reflux or number of stages can pass it at this pressure.', 'bad']] };
        if (!(v.E >= 5 && v.E <= 100)) return { rows: [], notes: [['Tray efficiency must be between 5 and 100 %.', 'bad']] };
        var mwF = isSol(v) ? zF * mwA + (1 - zF) * mwB : null, Fk = !isSol(v) ? v.Fm : v.fu === 'kg' ? v.F / mwF : v.F;
        if (!(Fk > 0)) return { rows: [], notes: [['Enter a feed rate above zero.', 'bad']] };
        /* feed enthalpy */
        var hF, hLz = H.hL(zF), HVz = H.HV(zF);
        if (v.fc === 'sl') hF = hLz; else if (v.fc === 'sv') hF = HVz; else if (v.fc === 'h') hF = v.hf;
        else if (v.fc === 'pv') {
          if (!(v.fv > 0 && v.fv < 100)) return { rows: [], notes: [['Vapour in the feed must be between 0 and 100 %.', 'bad']] };
          var f = v.fv / 100, lo = 0, hi = zF, x;
          for (var k = 0; k < 60; k++) { x = (lo + hi) / 2; if ((1 - f) * x + f * c.y(x) > zF) hi = x; else lo = x; }
          hF = (1 - f) * H.hL(x) + f * H.HV(c.y(x));
        } else {
          if (!isSol(v)) hF = v.hf;
          else { if (!(v.tf > -100 && v.tf < c.T(zF))) return { rows: [], notes: [['The feed temperature must be between −100 °C and the feed bubble point (' + F(c.T(zF), 1) + ' °C).', 'bad']] }; hF = H.hLiq(zF, v.tf); }
        }
        if ((v.fc === 'sub' || v.fc === 'h') && !isFinite(hF)) return { rows: [], notes: [['Enter a feed enthalpy.', 'bad']] };
        if (v.fc === 'sub' && !isSol(v) && !(hF < hLz)) return { rows: [], notes: [['A cold liquid feed must have an enthalpy below the saturated liquid at the feed composition (' + F(hLz, 0) + ' kcal/kmol). Use "Partly vaporised" or "Enter the feed enthalpy" for a warmer feed.', 'bad']] };
        var q = (HVz - hF) / (HVz - hLz);
        if (v.fc === 'h' && (q > 2 || q < -1)) return { rows: [], notes: [['This feed enthalpy gives q = ' + F(q, 2) + ', far outside normal plant feeds (a liquid more than about one latent heat below its boiling point, or a vapour superheated by more than a latent heat). Check the value and its reference state: pure liquids at 0 °C.', 'bad']] };
        var o = { zF: zF, xD: xD, xB: xB, F: Fk, hF: hF, partial: v.cd === 'p' };
        var rm = PS.rmin(c, H, o); if (!isFinite(rm.R)) return { rows: [], notes: [['No reflux ratio reaches this separation with these data. Check for an azeotrope, a feed that is too hot or too cold, or enthalpy data that are not smooth.', 'bad']] };
        var r0 = rm.R < 1e-4, R = v.rm === 'mult' ? (r0 ? 0.1 : v.rf * rm.R) : v.R;
        if (r0) notes.push(['Minimum reflux is zero for this case: the feed vapour is already richer than the distillate. Results use R = ' + F(R, 2) + '.', 'warn']);
        if (!(R > 0.01)) return { rows: [], notes: [['Enter a reflux ratio above zero.', 'bad']] };
        if (!r0 && !(R > rm.R * 1.0005)) return { rows: [['Minimum reflux ratio Rmin', F(rm.R, 3), '']], notes: [['The reflux ratio is at or below the minimum (' + F(rm.R, 3) + '). Increase R.', 'bad']] };
        var run = PS.step(c, H, o, R);
        if (!run.ok) return { rows: [['Minimum reflux ratio Rmin', F(rm.R, 3), '']], notes: [[run.why === 'limit' ? 'This separation needs more than 400 stages. Raise R or lower the purities.' : 'Stepping pinched: the reflux is too close to the minimum. Increase R.', 'bad']] };
        var s = run.s, cond = o.partial ? 1 : 0, trays = run.N - 1 - cond, real = Math.ceil(trays / (v.E / 100) - 1e-9);
        /* McCabe-Thiele on the same equilibrium curve, for comparison */
        var mo = { zF: zF, xD: xD, xB: xB, q: q, E: 1, partial: o.partial }, mrm = MC.rmin(c, mo), mst = isFinite(mrm.R) && R > mrm.R ? MC.step(c, mo, R) : null;
        var top = run.st[0], bot = run.st[run.st.length - 2] || top;
        var kgh = function (n, x) { return isSol(v) ? ' (' + F(n * (x * mwA + (1 - x) * mwB), 0) + ' kg/h)' : ''; };
        var rows = [
          ['Minimum reflux ratio Rmin', F(rm.R, 3), mrm && isFinite(mrm.R) ? 'McCabe-Thiele on the same data: ' + F(mrm.R, 3) : ''],
          ['Reflux ratio used R', F(R, 3), r0 ? 'Rmin is zero' : F(R / rm.R, 2) + ' × Rmin'],
          ['Theoretical stages', String(run.N), 'incl. reboiler' + (cond ? ' and partial condenser' : '') + (mst && mst.ok ? '; McCabe-Thiele: ' + mst.N : '')],
          ['Feed stage', String(run.feed), 'counted from the top' + (mst && mst.ok ? '; McCabe-Thiele: ' + mst.feed : '')],
          [v.E < 100 ? 'Real trays in the column' : 'Theoretical trays in the column', String(v.E < 100 ? real : trays), v.E < 100 ? 'at ' + F(v.E, 0) + ' % overall efficiency, plus the reboiler' : 'stages minus reboiler' + (cond ? ' and condenser' : '')],
          ['Condenser duty', F(s.Qc, 0), 'kcal/h'],
          ['Reboiler duty', F(s.Qr, 0), 'kcal/h'],
          ['Difference point ΔD (top)', F(s.QD, 0), 'kcal/kmol at x = ' + G(xD, 4)],
          ['Difference point ΔB (bottom)', F(s.QB, 0), 'kcal/kmol at x = ' + G(xB, 4)],
          ['Feed enthalpy and q', F(hF, 0) + ' kcal/kmol', 'q = ' + F(q, 3)],
          ['Distillate D / bottoms B', F(s.D, 2) + ' / ' + F(s.B, 2), 'kmol/h' + (isSol(v) ? ' (' + F(s.D * (xD * mwA + (1 - xD) * mwB), 0) + ' / ' + F(s.B * (xB * mwA + (1 - xB) * mwB), 0) + ' kg/h)' : '')],
          [o.partial ? 'Vapour into the condenser' : 'Vapour leaving the top stage', F((R + 1) * s.D, 2), 'kmol/h'],
          ['Vapour into the top stage from stage 2', top.V != null ? F(top.V, 2) : '–', 'kmol/h; changes down the column'],
          ['Vapour from the reboiler', bot.V != null ? F(bot.V, 2) : '–', 'kmol/h']
        ];
        if (c.T) rows.push(['Top / bottom temperature', F(c.T(o.partial ? run.st[0].x : xD), 1) + ' / ' + F(c.T(run.st[run.st.length - 1].x), 1), '°C']);
        notes.unshift(['Needs ' + run.N + ' theoretical stages with the feed on stage ' + run.feed + ' at R = ' + F(R, 2) + '. Condenser ' + F(s.Qc, 0) + ' kcal/h, reboiler ' + F(s.Qr, 0) + ' kcal/h.', 'lead']);
        if (mst && mst.ok && mst.N !== run.N) notes.push(['McCabe-Thiele with constant molar overflow gives ' + mst.N + ' stages for the same R. The difference comes from the changing vapour and liquid flows, which this method follows.']);
        var vs = run.st.filter(function (p) { return p.V != null; }).map(function (p) { return p.V; }), vmin = Math.min.apply(null, vs), vmax = Math.max.apply(null, vs);
        if (vmax / vmin > 1.1) notes.push(['The vapour flow changes by ' + F((vmax / vmin - 1) * 100, 0) + ' % down the column. Size the column and the reboiler on the stage with the most vapour.', 'warn']);
        if (c.az) notes.push(['Azeotrope at ' + F(100 * c.az, 1) + ' mol % ' + name + (c.T ? ' and ' + F(c.T(c.az), 1) + ' °C' : '') + '.', 'warn']);
        if (c.hump) notes.push(['The model curve for this pair has a dip that a single liquid cannot have; it has been flattened. Use measured data for design.', 'warn']);
        notes.push(['Method: saturated liquid and vapour enthalpies (reference: pure liquids at 0 °C), adiabatic column, no heat losses, saturated reflux. ' + (v.vle === 'sol' ? 'Heat of mixing from modified UNIFAC; latent heats change with temperature through the vapour-pressure slope.' : '')]);
        var st = run.st.map(function (p) {
          var r = [p.kind === 'condenser' ? 'Condenser' : p.kind === 'reboiler' ? 'Reboiler' : String(p.n) + (p.n === run.feed ? ' (feed)' : ''), G(100 * p.x, 4), G(100 * p.y, 4)];
          if (isSol(v)) r.push(G(toW(p.x), 4)); if (c.T) r.push(F(c.T(p.x), 1));
          r.push(F(H.hL(p.x), 0), F(H.HV(p.y), 0), p.L != null ? F(p.L, 2) : '–', p.V != null ? F(p.V, 2) : '–');
          return r;
        });
        var head = ['Stage', 'x, mol %', 'y, mol %'].concat(isSol(v) ? ['x, wt %'] : []).concat(c.T ? ['T, °C'] : []).concat(['hL, kcal/kmol', 'HV, kcal/kmol', 'Liquid down, kmol/h', 'Vapour up, kmol/h']);
        var fl = run.st.filter(function (p) { return p.V != null; });
        var svg = hxy(H, o, s, run, v.zm, name) + xyd(c, o, run, name);
        svg += K.chart([{ name: 'Vapour up', pts: fl.map(function (p) { return [p.n, p.V]; }) }, { name: 'Liquid down', pts: fl.map(function (p) { return [p.n, p.L]; }) }], { xl: 'stage from the top', yl: 'kmol/h', title: 'Flows down the column (not constant)' });
        return { rows: rows, tables: [{ title: 'Stage by stage (from the top)', head: head, rows: st }], svg: svg, notes: notes };
      },
      refs: ['Ponchon M., <i>Tech. Moderne</i> 13 (1921) 20; Savarit R., <i>Arts et Métiers</i> (1922) 65, 142, 178, 241, 266, 307: the enthalpy-composition method.',
        'Difference points: ΔD at (x<sub>D</sub>, h<sub>D</sub> + Q<sub>C</sub>/D) and ΔB at (x<sub>B</sub>, h<sub>B</sub> − Q<sub>R</sub>/B), on one straight line with the feed point. Optimum feed: the construction that gives the larger step.',
        'Latent heat with temperature: Clausius–Clapeyron slope of the Antoine equation, scaled to the latent heat at the normal boiling point. Heat of mixing: h<sup>E</sup> = −RT² Σ x<sub>i</sub> ∂lnγ<sub>i</sub>/∂T from modified UNIFAC (Dortmund), Gmehling et al., <i>Ind. Eng. Chem. Res.</i> 32 (1993) 178.']
    });
  }
  Promise.all([fetch(URL_U).then(function (r) { return r.json(); }), fetch(URL_S).then(function (r) { return r.json(); })]).then(function (d) {
    U = d[0]; PCEVLE.init(U); U.comps.forEach(function (c) { BY[c.s] = c; }); d[1].forEach(function (s) { LITE[s.s] = s; });
    register();
  });
})();
