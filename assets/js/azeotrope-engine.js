/* PharmaChemE azeotrope estimator.
   Activity coefficients: modified UNIFAC (Dortmund), published group parameters
   (DDBST public release, as distributed in the open-source "thermo" library, MIT licence).
   Vapour pressure: Antoine constants from the PharmaChemE solvent pages (log10 P[mmHg] = A - B/(C + T[degC])).
   Ideal vapour phase. Two-liquid-phase (heterogeneous) azeotropes are found from the
   liquid-liquid split predicted by the same model. Results are estimates, not measured data. */
(function (root) {
  'use strict';

  function makeModel(D) {
    var SG = D.sg, IP = D.ip;
    function comp(c) {
      var groups = [], r = 0, q = 0;
      for (var k in c.g) { var s = SG[k], n = c.g[k]; groups.push([k, n]); r += n * s[0]; q += n * s[1]; }
      return { c: c, groups: groups, r: r, q: q };
    }
    function pairOK(a, b) {
      var mains = {};
      [a, b].forEach(function (p) { p.groups.forEach(function (g) { mains[SG[g[0]][2]] = 1; }); });
      var ms = Object.keys(mains), missing = [];
      for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms.length; j++) {
        if (i !== j && !IP[ms[i] + '-' + ms[j]]) missing.push(ms[i] + '-' + ms[j]);
      }
      return missing;
    }
    function psi(m, n, T) {
      if (m === n) return 1;
      var p = IP[m + '-' + n]; if (!p) return 1;
      return Math.exp(-(p[0] + p[1] * T + p[2] * T * T) / T);
    }
    function setup(a, b) {
      var keys = {}, list = [];
      [a, b].forEach(function (p) { p.groups.forEach(function (g) { if (!(g[0] in keys)) { keys[g[0]] = list.length; list.push(g[0]); } }); });
      var nu = [a, b].map(function (p) { var v = list.map(function () { return 0; }); p.groups.forEach(function (g) { v[keys[g[0]]] = g[1]; }); return v; });
      var Q = list.map(function (k) { return SG[k][1]; }), M = list.map(function (k) { return SG[k][2]; });
      return { list: list, nu: nu, Q: Q, M: M, a: a, b: b, cacheT: null, P: null, pure: null };
    }
    function lnGam(S, X, T) {
      var n = S.list.length, sQX = 0, th = [], k, m;
      for (k = 0; k < n; k++) sQX += S.Q[k] * X[k];
      for (k = 0; k < n; k++) th.push(S.Q[k] * X[k] / sQX);
      var P = S.P, s1 = [], out = [];
      for (k = 0; k < n; k++) { var t = 0; for (m = 0; m < n; m++) t += th[m] * P[m][k]; s1.push(t); }
      for (k = 0; k < n; k++) {
        var t2 = 0; for (m = 0; m < n; m++) t2 += th[m] * P[k][m] / s1[m];
        out.push(S.Q[k] * (1 - Math.log(s1[k]) - t2));
      }
      return out;
    }
    function prepT(S, T) {
      if (S.cacheT === T) return;
      var n = S.list.length; S.P = [];
      for (var i = 0; i < n; i++) { S.P.push([]); for (var j = 0; j < n; j++) S.P[i].push(psi(S.M[i], S.M[j], T)); }
      S.pure = S.nu.map(function (v) { var tot = v.reduce(function (s, z) { return s + z; }, 0); return lnGam(S, v.map(function (z) { return z / tot; }), T); });
      S.cacheT = T;
    }
    /* ln(gamma1), ln(gamma2) at mole fraction x2 of component b and T in kelvin */
    function lngammas(S, x2, T) {
      prepT(S, T);
      var x = [1 - x2, x2], ps = [S.a, S.b], i;
      var sr = 0, sr34 = 0, sq = 0;
      for (i = 0; i < 2; i++) { sr += x[i] * ps[i].r; sr34 += x[i] * Math.pow(ps[i].r, 0.75); sq += x[i] * ps[i].q; }
      var n = S.list.length, X = [], tot = 0, k;
      for (k = 0; k < n; k++) { var v = x[0] * S.nu[0][k] + x[1] * S.nu[1][k]; X.push(v); tot += v; }
      for (k = 0; k < n; k++) X[k] /= tot;
      var LG = lnGam(S, X, T), res = [];
      for (i = 0; i < 2; i++) {
        var p = ps[i], V = p.r / sr, Vp = Math.pow(p.r, 0.75) / sr34, Fq = p.q / sq;
        var lc = 1 - Vp + Math.log(Vp) - 5 * p.q * (1 - V / Fq + Math.log(V / Fq));
        var lr = 0; for (k = 0; k < n; k++) lr += S.nu[i][k] * (LG[k] - S.pure[i][k]);
        res.push(lc + lr);
      }
      return res;
    }
    return { comp: comp, pairOK: pairOK, setup: setup, lngammas: lngammas };
  }

  function psat(ant, Tc) { return Math.pow(10, ant[0] - ant[1] / (ant[2] + Tc)); }
  function dlnpsat(ant, Tc) { return Math.LN10 * ant[1] / Math.pow(ant[2] + Tc, 2); }

  /* Bubble temperature (degC) of a homogeneous liquid with x2 of component b at P (mmHg). */
  function bubble(M, S, x2, P, T0) {
    var A = S.a.c.ant, B = S.b.c.ant, T = T0 == null ? 80 : T0, g, p1, p2, k;
    for (var it = 0; it < 80; it++) {
      g = M.lngammas(S, x2, T + 273.15);
      p1 = (1 - x2) * Math.exp(g[0]) * psat(A, T); p2 = x2 * Math.exp(g[1]) * psat(B, T);
      var p = p1 + p2; k = p2 / p;
      var dT = (Math.log(P) - Math.log(p)) / ((1 - k) * dlnpsat(A, T) + k * dlnpsat(B, T));
      if (dT > 40) dT = 40; if (dT < -40) dT = -40;
      T += dT; if (Math.abs(dT) < 1e-6) break;
    }
    g = M.lngammas(S, x2, T + 273.15);
    var y2 = x2 * Math.exp(g[1]) * psat(B, T) / P;
    return { T: T, y2: y2, g: g };
  }

  /* Liquid-liquid split at T (degC): returns [x2 in phase I, x2 in phase II] or null. Lower convex hull of gmix. */
  function lle(M, S, Tc) {
    var T = Tc + 273.15, N = 900, pts = [], i;
    for (i = 0; i <= N; i++) {
      var u = -16 + 32 * i / N, x = 1 / (1 + Math.exp(-u)), g = M.lngammas(S, x, T);
      pts.push([x, (1 - x) * (Math.log(1 - x) + g[0]) + x * (Math.log(x) + g[1])]);
    }
    var h = [];
    for (i = 0; i < pts.length; i++) {
      while (h.length >= 2) {
        var o = h[h.length - 2], a = h[h.length - 1], b = pts[i];
        if ((a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]) <= 0) h.pop(); else break;
      }
      h.push(pts[i]);
    }
    var best = null;
    for (i = 1; i < h.length; i++) {
      var w = h[i][0] - h[i - 1][0];
      if (w > 0.02 && (!best || w > best[1] - best[0])) {
        var mid = (h[i][0] + h[i - 1][0]) / 2, gm = M.lngammas(S, mid, T);
        var gmid = (1 - mid) * (Math.log(1 - mid) + gm[0]) + mid * (Math.log(mid) + gm[1]);
        var lin = h[i - 1][1] + (h[i][1] - h[i - 1][1]) * (mid - h[i - 1][0]) / w;
        if (gmid - lin > 1e-7) best = [h[i - 1][0], h[i][0]];
      }
    }
    if (!best) return null;
    /* refine: equal activities of both components in both phases (Newton in logit space) */
    var u1 = Math.log(best[0] / (1 - best[0])), u2 = Math.log(best[1] / (1 - best[1]));
    function F(u1, u2) {
      var a = 1 / (1 + Math.exp(-u1)), b = 1 / (1 + Math.exp(-u2)), ga = M.lngammas(S, a, T), gb = M.lngammas(S, b, T);
      return [Math.log(1 - a) + ga[0] - Math.log(1 - b) - gb[0], Math.log(a) + ga[1] - Math.log(b) - gb[1]];
    }
    for (var it = 0; it < 40; it++) {
      var f = F(u1, u2), e = 1e-6, fa = F(u1 + e, u2), fb = F(u1, u2 + e);
      var J = [[(fa[0] - f[0]) / e, (fb[0] - f[0]) / e], [(fa[1] - f[1]) / e, (fb[1] - f[1]) / e]];
      var det = J[0][0] * J[1][1] - J[0][1] * J[1][0]; if (!isFinite(det) || Math.abs(det) < 1e-14) break;
      var d1 = (f[0] * J[1][1] - f[1] * J[0][1]) / det, d2 = (J[0][0] * f[1] - J[1][0] * f[0]) / det;
      d1 = Math.max(-2, Math.min(2, d1)); d2 = Math.max(-2, Math.min(2, d2));
      u1 -= d1; u2 -= d2;
      if (Math.abs(d1) + Math.abs(d2) < 1e-10) break;
    }
    var x1 = 1 / (1 + Math.exp(-u1)), x2 = 1 / (1 + Math.exp(-u2));
    if (!isFinite(x1) || !isFinite(x2) || Math.abs(x1 - x2) < 1e-3) return best;
    return x1 < x2 ? [x1, x2] : [x2, x1];
  }

  /* Main: azeotropes of a binary at pressure P (mmHg). Returns {ok, msg, az:[...], curve:[...]} */
  function azeotropes(M, ca, cb, P) {
    var a = M.comp(ca), b = M.comp(cb), miss = M.pairOK(a, b);
    if (miss.length) return { ok: false, msg: 'no-params', missing: miss };
    var S = M.setup(a, b), N = 120, xs = [], curve = [], i, T0 = 80;
    for (i = 0; i <= N; i++) xs.push(0.0005 + 0.999 * i / N);
    for (i = 0; i <= N; i++) { var bb = bubble(M, S, xs[i], P, T0); T0 = bb.T; curve.push({ x: xs[i], T: bb.T, y: bb.y2 }); }
    var Tb1 = bubble(M, S, 0, P, curve[0].T).T, Tb2 = bubble(M, S, 1, P, curve[N].T).T;
    var out = [], gap = null;
    /* two liquid phases? test at the lowest bubble temperature */
    var Tmin = Math.min.apply(null, curve.map(function (p) { return p.T; }));
    var split = lle(M, S, Tmin);
    if (split) {
      /* three-phase temperature: bubble pressure of phase I equals P */
      var lo = Tmin - 60, hi = Math.max(Tb1, Tb2), Th = Tmin, sp = split, yv = null;
      for (var it = 0; it < 60; it++) {
        var mid = (lo + hi) / 2, s2 = lle(M, S, mid);
        if (!s2) { hi = mid; continue; }
        var g = M.lngammas(S, s2[0], mid + 273.15);
        var p = (1 - s2[0]) * Math.exp(g[0]) * psat(a.c.ant, mid) + s2[0] * Math.exp(g[1]) * psat(b.c.ant, mid);
        if (p > P) hi = mid; else lo = mid;
        Th = mid; sp = s2; yv = s2[0] * Math.exp(g[1]) * psat(b.c.ant, mid) / p;
        if (hi - lo < 1e-4) break;
      }
      gap = { T: Th, x: sp, y: yv };
      if (yv != null && yv > sp[0] && yv < sp[1] && Th < Math.min(Tb1, Tb2)) {
        out.push({ type: 'het', T: Th, y2: yv, xI: sp[0], xII: sp[1] });
      }
    }
    for (i = 0; i < N; i++) {
      var d0 = curve[i].y - curve[i].x, d1 = curve[i + 1].y - curve[i + 1].x;
      if (d0 * d1 < 0) {
        var l = curve[i].x, h = curve[i + 1].x, m2 = l, r2;
        for (var k = 0; k < 50; k++) { m2 = (l + h) / 2; r2 = bubble(M, S, m2, P, curve[i].T); if ((r2.y2 - m2) * d0 > 0) l = m2; else h = m2; }
        if (gap && m2 > gap.x[0] && m2 < gap.x[1]) continue; /* inside the two-liquid region: not real */
        var Tz = r2.T, typ = Tz < Math.min(Tb1, Tb2) ? 'min' : Tz > Math.max(Tb1, Tb2) ? 'max' : null;
        if (typ) out.push({ type: typ, T: Tz, x2: m2 });
      }
    }
    return { ok: true, az: out, Tb1: Tb1, Tb2: Tb2, gap: gap, curve: curve };
  }

  /* Bubble points for a list of liquid compositions (x2 of b): [{x, T, y}] */
  function bubbleCurve(M, ca, cb, P, xs) {
    var S = M.setup(M.comp(ca), M.comp(cb)), T0 = null;
    return xs.map(function (x) { var r = bubble(M, S, x, P, T0); T0 = r.T; return { x: x, T: r.T, y: r.y2 }; });
  }

  var api = { makeModel: makeModel, azeotropes: azeotropes, bubbleCurve: bubbleCurve, psat: psat };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PCEAzeo = api;
})(this);
