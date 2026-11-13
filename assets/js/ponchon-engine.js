/* Ponchon-Savarit engine for binary distillation (PharmaChemE).
   Enthalpy-composition method: saturated liquid enthalpy hL(x) and saturated vapour enthalpy HV(y) in kcal/kmol,
   difference points ΔD (xD, Q'D) and ΔB (xB, Q'B). No constant molar overflow: flows change from stage to stage.
   Needs an equilibrium curve object c with c.y(x) and c.x(y, hi) (as made by PCEMcCabe.curve). */
(function (root) {
  'use strict';
  /* y on the saturated vapour curve, on the straight line through difference point (xd, Q) and liquid (x, hL(x)) */
  function opY(H, x, xd, Q) {
    var hx = H.hL(x), g = function (y) { return (H.HV(y) - Q) * (x - xd) - (hx - Q) * (y - xd); };
    var lo = Math.min(1, x + 1e-9), n = 60, prev = g(lo), k, a = lo, b = null;
    for (k = 1; k <= n; k++) { var y = lo + (1 - lo) * k / n, v = g(y); if ((prev <= 0 && v >= 0) || (prev >= 0 && v <= 0)) { b = y; break; } a = y; prev = v; }
    if (b == null) return NaN;
    var ga = g(a);
    for (k = 0; k < 45; k++) { var m = (a + b) / 2, gm = g(m); if ((ga <= 0 && gm <= 0) || (ga >= 0 && gm >= 0)) { a = m; ga = gm; } else b = m; }
    return (a + b) / 2;
  }
  function setup(c, H, o, R) {
    var D = o.F * (o.zF - o.xB) / (o.xD - o.xB), B = o.F - D, hD, Qc, x0 = null, y1;
    if (o.partial) {
      x0 = c.x(o.xD, c.az || 1); var L0 = R * D, V1 = L0 + D; y1 = (L0 * x0 + D * o.xD) / V1;
      hD = H.HV(o.xD); Qc = V1 * H.HV(y1) - L0 * H.hL(x0) - D * hD;
    } else { hD = H.hL(o.xD); y1 = o.xD; Qc = D * (R + 1) * (H.HV(o.xD) - hD); }
    var QD = hD + Qc / D, hB = H.hL(o.xB), QB = (o.F * o.hF - D * QD) / B, Qr = B * (hB - QB);
    var yR = function (x) { return opY(H, x, o.xD, QD); }, yS = function (x) { return opY(H, x, o.xB, QB); };
    return { R: R, D: D, B: B, hD: hD, hB: hB, QD: QD, QB: QB, Qc: Qc, Qr: Qr, x0: x0, y1: y1, yR: yR, yS: yS,
      op: function (x) { var a = yR(x), b = yS(x); return isNaN(a) ? b : isNaN(b) ? a : Math.min(a, b); } };
  }
  function feasible(c, H, o, R) {
    var s = setup(c, H, o, R); if (!(s.Qr > 0) || !(s.Qc > 0)) return false;
    var n = 300, k, x, prevX = null, prevD = null;
    var ok = function (xx, a, b) { var y = isNaN(a) ? b : isNaN(b) ? a : Math.min(a, b); return y < c.y(xx) - 1e-9; };
    for (k = 1; k < n; k++) {
      x = o.xB + (o.xD - o.xB) * k / n;
      var ra = s.yR(x), rb = s.yS(x); if (!ok(x, ra, rb)) return false;
      /* the pinch usually sits where the two constructions cross: find that point exactly */
      var d = ra - rb;
      if (prevD != null && isFinite(d) && isFinite(prevD) && (d > 0) !== (prevD > 0)) {
        var a = prevX, b = x, da = prevD;
        for (var j = 0; j < 30; j++) { var m = (a + b) / 2, dm = s.yR(m) - s.yS(m); if ((dm > 0) === (da > 0)) { a = m; da = dm; } else b = m; }
        var mm = (a + b) / 2; if (!ok(mm, s.yR(mm), s.yS(mm))) return false;
      }
      prevX = x; prevD = d;
    }
    return true;
  }
  function rmin(c, H, o) {
    var hi = 1, k; while (!feasible(c, H, o, hi)) { hi *= 2; if (hi > 1e5) return { R: Infinity }; }
    var lo = 0; if (feasible(c, H, o, 1e-6)) return { R: 0 };
    for (k = 0; k < 36; k++) { var m = (lo + hi) / 2; if (feasible(c, H, o, m)) hi = m; else lo = m; }
    return { R: hi, s: setup(c, H, o, hi) };
  }
  /* stage by stage from the top; feed switch where the stripping construction gives the bigger step */
  function step(c, H, o, R) {
    var s = setup(c, H, o, R), st = [], n = 0, y = s.y1, xprev = o.xD, hi = c.az || 1, feed = null, x;
    if (o.partial) { n = 1; st.push({ n: 1, x: s.x0, y: o.xD, kind: 'condenser' }); xprev = s.x0; }
    while (n < 400) {
      n++;
      x = c.x(y, Math.min(hi, xprev + 1e-12)); if (!isFinite(x)) return { ok: false, why: 'curve', s: s };
      var last = x <= o.xB + 1e-12; st.push({ n: n, x: x, y: y, kind: last ? 'reboiler' : 'tray' });
      if (last) break;
      var a = s.yR(x), b = s.yS(x), strip = feed != null || (!isNaN(b) && (isNaN(a) || b <= a));
      if (strip && feed == null) feed = n;
      var ny = strip ? b : a;
      if (!(ny > x) || xprev - x < 1e-7) return { ok: false, why: 'pinch', s: s, st: st };
      xprev = x; y = ny;
    }
    if (n >= 400) return { ok: false, why: 'limit', s: s, st: st };
    if (feed == null) feed = st.length;
    /* internal flows from the lever rule: vapour rising into stage n and liquid leaving it */
    st.forEach(function (p, i) {
      var nx = st[i + 1]; if (!nx) { p.V = null; p.L = null; return; }
      if (nx.n <= feed) { p.V = s.D * (o.xD - p.x) / (nx.y - p.x); p.L = p.V - s.D; }
      else { p.V = s.B * (p.x - o.xB) / (nx.y - p.x); p.L = p.V + s.B; }
    });
    var lastSt = st[st.length - 1], prevX = st.length > 1 ? st[st.length - 2].x : o.xD;
    return { ok: true, s: s, st: st, N: st.length, Nfrac: st.length - 1 + Math.min(1, (prevX - o.xB) / (prevX - lastSt.x)), feed: feed };
  }
  var api = { opY: opY, setup: setup, feasible: feasible, rmin: rmin, step: step };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PCEPonchon = api;
})(this);
