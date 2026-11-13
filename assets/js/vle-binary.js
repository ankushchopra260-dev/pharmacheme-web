/* Binary vapour-liquid equilibrium curves for the distillation calculators (PharmaChemE).
   Two solvents: modified UNIFAC (or ideal Raoult) with Antoine vapour pressures, dilute-end points, two-liquid detection.
   Own data: x-y pairs through a monotone cubic. Needs batch-distill-engine.js (PCEBatch) and mccabe-engine.js (PCEMcCabe). */
(function (root) {
  'use strict';
  var MC = root.PCEMcCabe, MOD = null, BY = {}, CACHE = {};
  var ps = function (c, t) { return Math.pow(10, c.ant[0] - c.ant[1] / (c.ant[2] + t)); };
  function solCurve(a, b, P, ideal) {
    var key = [a, b, P.toFixed(3), ideal].join('|'); if (CACHE[key]) return CACHE[key];
    var A = BY[a], B = BY[b], S = ideal ? null : MOD.setup([A, B]), pts = [], T = null, i;
    if (S && S.missing.length) return null;
    for (i = 0; i <= 400; i++) {
      var x = i / 400;
      if (ideal) {
        var t = T == null ? 80 : T;
        for (var k = 0; k < 80; k++) { var f = x * ps(A, t) + (1 - x) * ps(B, t), d = (Math.log(P) - Math.log(f)) * 30; t += Math.max(-20, Math.min(20, d)); if (Math.abs(d) < 1e-8) break; }
        T = t; pts.push([x, x * ps(A, t) / P, t]);
      } else { var r = MOD.bubble(S, [x, 1 - x], P, T); T = r.T; pts.push([x, r.y[0], r.T]); }
    }
    /* extra points at both dilute ends (1 ppm upwards), where plant specifications sit */
    var bub = function (x, T0) {
      if (!ideal) { var r = MOD.bubble(S, [x, 1 - x], P, T0); return [x, r.y[0], r.T]; }
      var t = T0; for (var k = 0; k < 80; k++) { var f = x * ps(A, t) + (1 - x) * ps(B, t), d = (Math.log(P) - Math.log(f)) * 30; t += Math.max(-20, Math.min(20, d)); if (Math.abs(d) < 1e-8) break; }
      return [x, x * ps(A, t) / P, t];
    };
    [1e-6, 3e-6, 1e-5, 3e-5, 1e-4, 3e-4, 1e-3, 1.7e-3].forEach(function (e) { pts.push(bub(e, pts[0][2]), bub(1 - e, pts[400][2])); });
    pts.sort(function (p1, p2) { return p1[0] - p2[0]; });
    var lle = ideal ? null : liquidSplit(S, a, b, P, pts);
    if (lle && lle.xa != null && !lle.outside) { pts = pts.filter(function (q) { return q[0] < lle.xa || q[0] > lle.xb; }); pts.push([lle.xa, lle.y, lle.T], [lle.xb, lle.y, lle.T]); for (var k = 1; k < 20; k++) { var xm = lle.xa + (lle.xb - lle.xa) * k / 20; pts.push([xm, lle.y, lle.T]); } pts.sort(function (p1, p2) { return p1[0] - p2[0]; }); }
    var hump = false, top = -1; pts.forEach(function (q) { if (q[1] < top - 1e-3) hump = true; if (q[1] < top) q[1] = top; else top = q[1]; });
    var cv = MC.curve(pts); cv.lle = lle; cv.hump = hump;
    return (CACHE[key] = cv);
  }
  /* Two liquid layers. Model: lower convex hull of the Gibbs energy of mixing at the boiling temperature (modified UNIFAC),
     iterated to the three-phase (heterogeneous azeotrope) temperature. Model splits are checked against measured behaviour. */
  var ONE = { 'thf|water': 1, 'tert-butanol|water': 1, 'methanol|n-hexane': 1, 'methanol|n-heptane': 1 };
  var TWO = 'toluene benzene n-hexane n-heptane cyclohexane methylcyclohexane chloroform dichloromethane 1-2-dichloroethane chlorobenzene o-dichlorobenzene ethylbenzene xylene o-xylene m-xylene p-xylene ethyl-acetate isopropyl-acetate n-propyl-acetate n-butyl-acetate isobutyl-acetate tert-butyl-acetate mibk methyl-ethyl-ketone mtbe diisopropyl-ether diethyl-ether dibutyl-ether n-butanol isobutanol sec-butanol nitrobenzene tetrachloroethylene trichloroethylene benzyl-alcohol n-pentane'.split(' ');
  function pairKey(a, b) { return [a, b].sort().join('|'); }
  function hull(S, TK) {
    var p = [], k, h = [], best = null;
    for (k = 0; k <= 900; k++) { var t = -16 + 32 * k / 900, x = 1 / (1 + Math.exp(-t)), g = MOD.lngam(S, [x, 1 - x], TK); p.push([x, x * (Math.log(x) + g[0]) + (1 - x) * (Math.log(1 - x) + g[1])]); }
    p.forEach(function (q) { while (h.length >= 2) { var a = h[h.length - 2], b = h[h.length - 1]; if ((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]) <= 0) h.pop(); else break; } h.push(q); });
    for (k = 1; k < h.length; k++) {
      var A = h[k - 1], B = h[k], mid = p.filter(function (q) { return q[0] > A[0] && q[0] < B[0]; });
      if (mid.length < 3) continue;
      var gap = Math.max.apply(null, mid.map(function (q) { return q[1] - (A[1] + (B[1] - A[1]) * (q[0] - A[0]) / (B[0] - A[0])); }));
      if (gap > 1e-6 && (!best || B[0] - A[0] > best[1] - best[0])) best = [A[0], B[0]];
    }
    return best;
  }
  function liquidSplit(S, a, b, P, pts) {
    var key = pairKey(a, b), water = a === 'water' || b === 'water', other = a === 'water' ? b : a;
    var known = water && TWO.indexOf(other) >= 0;
    var mid = pts.filter(function (q) { return q[0] >= 0.5; })[0], T = mid[2], sp = null, y = null, it;
    for (it = 0; it < 10; it++) {
      sp = hull(S, T + 273.15); if (!sp) break;
      var r = MOD.bubble(S, [sp[0], 1 - sp[0]], P, T); y = r.y[0];
      if (Math.abs(r.T - T) < 0.01) { T = r.T; break; } T = r.T;
    }
    if (!sp) return null;
    if (ONE[key]) return { overridden: true };
    if (!(y > sp[0] && y < sp[1])) return { xa: sp[0], xb: sp[1], y: y, T: T, known: known, outside: true };
    return { xa: sp[0], xb: sp[1], y: y, T: T, known: known };
  }
  /* own data: "x y" pairs, commas, semicolons or new lines; values above 1 read as percent. Monotone cubic resampling. */
  function dataCurve(txt, pc) {
    var nums = String(txt || '').replace(/[;,\n\t]+/g, ' ').trim().split(/\s+/).map(Number);
    if (nums.length < 4 || nums.length % 2 || nums.some(function (n) { return !isFinite(n); })) return { err: 'Enter the data as pairs of numbers: x y, x y, ... (at least two points).' };
    var p = [], i, lim = pc ? 100 : 1;
    if (nums.some(function (n) { return n < 0 || n > lim; })) return { err: pc ? 'Mol % values must lie between 0 and 100.' : 'Mole fractions must lie between 0 and 1. If you typed percentages, choose "Mol %" above.' };
    for (i = 0; i < nums.length; i += 2) p.push([nums[i] / (pc ? 100 : 1), nums[i + 1] / (pc ? 100 : 1)]);
    p.push([0, 0], [1, 1]); p.sort(function (a, b) { return a[0] - b[0]; });
    p = p.filter(function (q, k) { return k === 0 || q[0] > p[k - 1][0] + 1e-9; });
    if (p.some(function (q) { return q[0] < 0 || q[0] > 1 || q[1] < 0 || q[1] > 1; })) return { err: 'Mole fractions must lie between 0 and 1 (or 0 and 100 %).' };
    var n = p.length, h = [], dl = [], m = [];
    for (i = 0; i < n - 1; i++) { h.push(p[i + 1][0] - p[i][0]); dl.push((p[i + 1][1] - p[i][1]) / h[i]); }
    m.push(dl[0]); for (i = 1; i < n - 1; i++) m.push(dl[i - 1] * dl[i] <= 0 ? 0 : 3 * (h[i - 1] + h[i]) / ((2 * h[i] + h[i - 1]) / dl[i - 1] + (h[i] + 2 * h[i - 1]) / dl[i])); m.push(dl[n - 2]);
    var out = [], j = 0;
    for (i = 0; i <= 400; i++) {
      var x = i / 400; while (j < n - 2 && x > p[j + 1][0]) j++;
      var t = (x - p[j][0]) / h[j], t2 = t * t, t3 = t2 * t;
      out.push([x, (2 * t3 - 3 * t2 + 1) * p[j][1] + (t3 - 2 * t2 + t) * h[j] * m[j] + (-2 * t3 + 3 * t2) * p[j + 1][1] + (t3 - t2) * h[j] * m[j + 1]]);
    }
    return { c: MC.curve(out), pts: p };
  }

  root.PCEVLE = {
    init: function (U) { MOD = root.PCEBatch.model(U); U.comps.forEach(function (c) { BY[c.s] = c; }); },
    solCurve: solCurve, dataCurve: dataCurve, ps: ps,
    model: function () { return MOD; }, comp: function (s) { return BY[s]; }
  };
})(this);
