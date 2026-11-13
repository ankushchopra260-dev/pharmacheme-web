/* McCabe-Thiele engine for binary distillation (PharmaChemE).
   Equilibrium curve: any increasing function y*(x) supplied as a fine table (constant relative volatility, ideal or
   modified UNIFAC, or experimental points). Constant molar overflow. Total or partial condenser, partial reboiler
   (counted as an equilibrium stage). Optional Murphree vapour efficiency on column trays.
   Minimum reflux by a feasibility search, so tangent pinches (non-ideal systems) are found as well as feed pinches. */
(function (root) {
  'use strict';
  /* ---------- equilibrium curve from a table of [x, y] (and optional T) ---------- */
  function curve(pts) {
    pts = pts.slice().sort(function (a, b) { return a[0] - b[0]; });
    var X = pts.map(function (p) { return p[0]; }), Y = pts.map(function (p) { return p[1]; }), T = pts.map(function (p) { return p[2]; });
    function idx(x) { var lo = 0, hi = X.length - 1; while (hi - lo > 1) { var m = (lo + hi) >> 1; if (X[m] <= x) lo = m; else hi = m; } return lo; }
    function lin(A, x) { if (x <= X[0]) return A[0]; if (x >= X[X.length - 1]) return A[A.length - 1]; var i = idx(x), f = (x - X[i]) / (X[i + 1] - X[i]); return A[i] + f * (A[i + 1] - A[i]); }
    var c = { pts: pts, y: function (x) { return lin(Y, x); }, T: T[0] != null ? function (x) { return lin(T, x); } : null };
    /* azeotrope: first crossing of y = x inside (0, 1) */
    c.az = null;
    for (var i = 1; i < X.length - 1; i++) {
      var d0 = Y[i] - X[i], d1 = Y[i + 1] - X[i + 1];
      if (X[i] > 0.005 && X[i + 1] < 0.995 && d0 > 1e-5 && d1 <= 0) { c.az = X[i] + d0 / (d0 - d1) * (X[i + 1] - X[i]); break; }
    }
    /* x on the curve for vapour y, searched in [0, hi] where the curve rises */
    c.x = function (y, hi) {
      hi = hi == null ? 1 : hi; var lo = 0, k;
      if (c.y(hi) < y) return NaN;
      for (k = 0; k < 60; k++) { var m = (lo + hi) / 2; if (c.y(m) < y) lo = m; else hi = m; }
      return (lo + hi) / 2;
    };
    return c;
  }
  function alphaCurve(a) { var p = []; for (var i = 0; i <= 400; i++) { var x = i / 400; p.push([x, a * x / (1 + (a - 1) * x)]); } return curve(p); }
  /* relative volatility from the curve */
  function alphaAt(c, x) { x = Math.min(1 - 1e-6, Math.max(1e-6, x)); var y = Math.min(1 - 1e-9, c.y(x)); return y * (1 - x) / (x * (1 - y)); }

  /* ---------- lines ---------- */
  function lines(o, R) {
    var zF = o.zF, xD = o.xD, xB = o.xB, q = o.q, s = R / (R + 1), b = xD / (R + 1), xi, yi;
    if (Math.abs(q - 1) < 1e-9) xi = zF;
    else { var m = q / (q - 1), cq = -zF / (q - 1); xi = (cq - b) / (s - m); }
    yi = s * xi + b;
    var ss = (yi - xB) / (xi - xB);
    return { R: R, s: s, b: b, xi: xi, yi: yi, ss: ss, rect: function (x) { return s * x + b; }, strip: function (x) { return xB + ss * (x - xB); } };
  }
  function feasible(c, o, R) {
    var L = lines(o, R); if (!(L.xi > o.xB && L.xi < o.xD) || !(L.ss > 1)) return false;
    var n = 400, k, x;
    for (k = 0; k <= n; k++) { x = L.xi + (o.xD - L.xi) * k / n; if (x < o.xD - 1e-9 && L.rect(x) >= c.y(x) - 1e-9) return false; }
    for (k = 0; k <= n; k++) { x = o.xB + (L.xi - o.xB) * k / n; if (x > o.xB + 1e-9 && L.strip(x) >= c.y(x) - 1e-9) return false; }
    return true;
  }
  function rmin(c, o) {
    var hi = 1, k;
    while (!feasible(c, o, hi)) { hi *= 2; if (hi > 1e5) return { R: Infinity }; }
    var lo = 0; if (feasible(c, o, 0)) return { R: 0 };
    for (k = 0; k < 60; k++) { var m = (lo + hi) / 2; if (feasible(c, o, m)) hi = m; else lo = m; }
    /* where is the pinch: at the feed (q-line) intersection or a tangent point? */
    var L = lines(o, hi), gap = c.y(L.xi) - L.yi;
    return { R: hi, type: gap < 2e-3 ? 'feed' : 'tangent', L: L };
  }

  /* ---------- stage-by-stage stepping from the top ---------- */
  function step(c, o, R) {
    var L = lines(o, R), E = o.E == null ? 1 : o.E, st = [], fs = null, y = o.xD, x, hi = o.az ? Math.min(1, o.az) : 1, n = 0, onStrip = false, op, xprev = o.xD;
    hi = c.az ? c.az : 1;
    if (o.partial) { x = c.x(o.xD, hi); st.push({ n: 1, x: x, y: o.xD, kind: 'condenser' }); n = 1; xprev = x; y = L.rect(x); }
    while (n < 400) {
      n++;
      op = function (xx) { return onStrip ? L.strip(xx) : L.rect(xx); };
      var xi = c.x(y, Math.min(hi, xprev + 1e-12));            /* ideal stage */
      if (!isFinite(xi)) return { ok: false, why: 'curve' };
      var last = xi <= o.xB + 1e-12, kind = 'tray';
      if (last) { x = xi; kind = 'reboiler'; }
      else if (E >= 0.9999) x = xi;
      else {                                                   /* Murphree: y = yin + E (y* - yin), yin from the operating line */
        var lo = xi, up = xprev, k;
        for (k = 0; k < 60; k++) { var m = (lo + up) / 2, yin = m <= L.xi ? L.strip(m) : L.rect(m), yv = yin + E * (c.y(m) - yin); if (yv > y) up = m; else lo = m; }
        x = (lo + up) / 2;
        if (x <= o.xB) { x = xi; kind = 'reboiler'; last = true; }
      }
      st.push({ n: n, x: x, y: y, kind: kind });
      if (!onStrip && x <= L.xi) { onStrip = true; fs = n; }
      if (last) break;
      var ny = onStrip ? L.strip(x) : L.rect(x);
      if (xprev - x < 1e-7) return { ok: false, why: 'pinch', st: st, L: L };
      xprev = x; y = ny;
    }
    if (n >= 400) return { ok: false, why: 'limit', st: st, L: L };
    var lastSt = st[st.length - 1], prevX = st.length > 1 ? st[st.length - 2].x : o.xD;
    var frac = (prevX - o.xB) / (prevX - lastSt.x);
    return { ok: true, st: st, L: L, N: st.length, Nfrac: st.length - 1 + Math.min(1, frac), feed: fs || st.length };
  }
  /* total reflux (diagonal operating line) */
  function nmin(c, o) {
    var y = o.xD, x, n = 0, st = [], hi = c.az ? c.az : 1, xprev = o.xD;
    while (n < 400) { n++; x = c.x(y, Math.min(hi, xprev + 1e-12)); if (!isFinite(x)) return { N: NaN }; st.push({ x: x, y: y }); if (x <= o.xB) break; if (xprev - x < 1e-8) return { N: Infinity }; xprev = x; y = x; }
    var prev = st.length > 1 ? st[st.length - 2].x : o.xD;
    return { N: st.length, Nfrac: st.length - 1 + (prev - o.xB) / (prev - st[st.length - 1].x), st: st };
  }
  function fenske(c, o) {
    var a = Math.sqrt(alphaAt(c, o.xD) * alphaAt(c, o.xB));
    return { a: a, N: Math.log((o.xD / (1 - o.xD)) * ((1 - o.xB) / o.xB)) / Math.log(a) };
  }
  /* Gilliland correlation, Molokanov form */
  function gilliland(R, Rm, Nm) {
    var X = (R - Rm) / (R + 1); if (X <= 0) return Infinity;
    var Y = 1 - Math.exp((1 + 54.4 * X) / (11 + 117.2 * X) * (X - 1) / Math.sqrt(X));
    return (Y + Nm) / (1 - Y);
  }
  var api = { curve: curve, alphaCurve: alphaCurve, alphaAt: alphaAt, lines: lines, feasible: feasible, rmin: rmin, step: step, nmin: nmin, fenske: fenske, gilliland: gilliland };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PCEMcCabe = api;
})(this);
