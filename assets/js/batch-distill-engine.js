/* Batch distillation engine.
   VLE: modified UNIFAC (Dortmund) activity coefficients, published group parameters (data file unifac-do.json), Antoine vapour pressure, ideal vapour.
   Column: still (equilibrium stage) + N theoretical stages + total condenser, constant molar overflow, constant molar holdups on stages and in the reflux drum.
   Start-up at total reflux, then distillate drawn at reflux ratio R, cut by cut. Explicit Euler with an adaptive step. */
(function (root) {
  'use strict';
  function model(D) {
    var SG = D.sg, IP = D.ip;
    function psi(m, n, T) { if (m === n) return 1; var p = IP[m + '-' + n]; return p ? Math.exp(-(p[0] + p[1] * T + p[2] * T * T) / T) : 1; }
    /* comps: array of component records {g: {subgroup: count}, ant, mw} */
    function setup(comps) {
      var keys = {}, list = [];
      comps.forEach(function (c) { for (var k in c.g) if (!(k in keys)) { keys[k] = list.length; list.push(k); } });
      var nu = comps.map(function (c) { var v = list.map(function () { return 0; }); for (var k in c.g) v[keys[k]] = c.g[k]; return v; });
      var Q = list.map(function (k) { return SG[k][1]; }), M = list.map(function (k) { return SG[k][2]; });
      var r = comps.map(function (c) { var s = 0; for (var k in c.g) s += c.g[k] * SG[k][0]; return s; });
      var q = comps.map(function (c) { var s = 0; for (var k in c.g) s += c.g[k] * SG[k][1]; return s; });
      var mains = {}; list.forEach(function (k) { mains[SG[k][2]] = 1; }); var ms = Object.keys(mains), missing = [];
      for (var i = 0; i < ms.length; i++) for (var j = 0; j < ms.length; j++) if (i !== j && !IP[ms[i] + '-' + ms[j]]) missing.push(ms[i] + '-' + ms[j]);
      return { comps: comps, list: list, nu: nu, Q: Q, M: M, r: r, q: q, missing: missing, T: null, P: null, pure: null };
    }
    function lnGam(S, X) {
      var n = S.list.length, sQX = 0, th = [], s1 = [], out = [], k, m;
      for (k = 0; k < n; k++) sQX += S.Q[k] * X[k];
      for (k = 0; k < n; k++) th.push(S.Q[k] * X[k] / sQX);
      for (k = 0; k < n; k++) { var t = 0; for (m = 0; m < n; m++) t += th[m] * S.P[m][k]; s1.push(t); }
      for (k = 0; k < n; k++) { var t2 = 0; for (m = 0; m < n; m++) t2 += th[m] * S.P[k][m] / s1[m]; out.push(S.Q[k] * (1 - Math.log(s1[k]) - t2)); }
      return out;
    }
    function prep(S, T) {
      if (S.T === T) return; var n = S.list.length; S.P = [];
      for (var i = 0; i < n; i++) { S.P.push([]); for (var j = 0; j < n; j++) S.P[i].push(psi(S.M[i], S.M[j], T)); }
      S.pure = S.nu.map(function (v) { var tot = v.reduce(function (a, b) { return a + b; }, 0); return lnGam(S, v.map(function (z) { return z / tot; })); });
      S.T = T;
    }
    /* ln gamma for mole fractions x (array), T in K */
    function lngam(S, x, T) {
      prep(S, T);
      var nc = x.length, sr = 0, sr34 = 0, sq = 0, i, k, n = S.list.length;
      for (i = 0; i < nc; i++) { sr += x[i] * S.r[i]; sr34 += x[i] * Math.pow(S.r[i], 0.75); sq += x[i] * S.q[i]; }
      var X = [], tot = 0;
      for (k = 0; k < n; k++) { var v = 0; for (i = 0; i < nc; i++) v += x[i] * S.nu[i][k]; X.push(v); tot += v; }
      for (k = 0; k < n; k++) X[k] /= tot;
      var LG = lnGam(S, X), res = [];
      for (i = 0; i < nc; i++) {
        var V = S.r[i] / sr, Vp = Math.pow(S.r[i], 0.75) / sr34, Fq = S.q[i] / sq;
        var lr = 0; for (k = 0; k < n; k++) lr += S.nu[i][k] * (LG[k] - S.pure[i][k]);
        res.push(1 - Vp + Math.log(Vp) - 5 * S.q[i] * (1 - V / Fq + Math.log(V / Fq)) + lr);
      }
      return res;
    }
    var ps = function (a, Tc) { return Math.pow(10, a[0] - a[1] / (a[2] + Tc)); };
    var dl = function (a, Tc) { return Math.LN10 * a[1] / Math.pow(a[2] + Tc, 2); };
    /* bubble point: T in °C and vapour y for liquid x at P (mmHg) */
    function bubble(S, x, P, T0) {
      var T = T0 == null ? 80 : T0, nc = x.length, y = new Array(nc), g, i, it;
      for (it = 0; it < 60; it++) {
        g = lngam(S, x, T + 273.15);
        var sum = 0, d = 0;
        for (i = 0; i < nc; i++) { y[i] = x[i] * Math.exp(g[i]) * ps(S.comps[i].ant, T); sum += y[i]; }
        for (i = 0; i < nc; i++) d += y[i] / sum * dl(S.comps[i].ant, T);
        var dT = (Math.log(P) - Math.log(sum)) / d; dT = Math.max(-30, Math.min(30, dT)); T += dT;
        if (Math.abs(dT) < 1e-5) break;
      }
      var s = 0; for (i = 0; i < nc; i++) s += y[i]; for (i = 0; i < nc; i++) y[i] /= s;
      return { T: T, y: y };
    }
    return { setup: setup, lngam: lngam, bubble: bubble };
  }

  /* opts: { comps:[...], moles:[kmol], P (mmHg), N, V (kmol/h), hold (kmol per stage), holdC (kmol in reflux drum),
             cuts: [{ R, end: 'T'|'mass'|'time'|'purity', val, key }], maxT (h), lambda: [kcal/kmol] } */
  function simulate(M, o) {
    var S = M.setup(o.comps), nc = o.comps.length, N = o.N, V = o.V, mw = o.comps.map(function (c) { return c.mw; });
    if (S.missing.length) return { ok: false, msg: 'no-params' };
    var tot0 = o.moles.reduce(function (a, b) { return a + b; }, 0), z = o.moles.map(function (m) { return m / tot0; });
    var H = N > 0 ? o.hold : 0, Hc = o.holdC, inCol = H * N + Hc;
    if (inCol > 0.5 * tot0) return { ok: false, msg: 'holdup' };
    var W = tot0 - inCol, xW = z.slice(), xs = [], xD = z.slice(), Tst = [], t = 0, P = o.P, i, j;
    for (j = 0; j < N; j++) { xs.push(z.slice()); Tst.push(null); }
    var Tw = null, TD = null, prodMol = z.map(function () { return 0; });
    var trace = [], cuts = [], cur = 0, cutMol = z.map(function () { return 0; }), cutStart = 0, cutHeat = 0, Q = 0, steps = 0;
    var lam = o.lambda; // kcal/kmol per component
    function stageY(x, T0) { return M.bubble(S, x, P, T0); }
    /* one Euler step; returns false if the still is exhausted */
    function step(dt, R, total) {
      var bw = stageY(xW, Tw); Tw = bw.T;
      var ys = [], k;
      for (j = 0; j < N; j++) { var b = stageY(xs[j], Tst[j]); Tst[j] = b.T; ys.push(b.y); }
      var yTop = N > 0 ? ys[0] : bw.y;
      var Dr = total ? 0 : V / (R + 1), L = V - Dr;
      var bD = stageY(xD, TD); TD = bD.T;
      var dW = (L - V) * dt; // = -D dt
      var nW = W + dW;
      if (nW <= 1e-6 * tot0) return false;
      var xBottomLiq = N > 0 ? xs[N - 1] : xD; // liquid returning to the still
      var newW = [];
      for (i = 0; i < nc; i++) newW.push((W * xW[i] + (L * xBottomLiq[i] - V * bw.y[i]) * dt) / nW);
      var newS = [];
      for (j = 0; j < N; j++) {
        var yin = j === N - 1 ? bw.y : ys[j + 1], xin = j === 0 ? xD : xs[j - 1], ns = [];
        for (i = 0; i < nc; i++) ns.push(xs[j][i] + dt / H * (V * (yin[i] - ys[j][i]) + L * (xin[i] - xs[j][i])));
        newS.push(ns);
      }
      var newD = []; for (i = 0; i < nc; i++) newD.push(xD[i] + dt / Hc * V * (yTop[i] - xD[i]));
      // distillate leaves at reflux drum composition
      for (i = 0; i < nc; i++) { prodMol[i] += Dr * xD[i] * dt; cutMol[i] += Dr * xD[i] * dt; }
      var lm = 0; for (i = 0; i < nc; i++) lm += bw.y[i] * lam[i]; Q += V * lm * dt; cutHeat += V * lm * dt;
      var norm = function (a) { var s = 0, k2; for (k2 = 0; k2 < nc; k2++) { a[k2] = Math.max(0, a[k2]); s += a[k2]; } for (k2 = 0; k2 < nc; k2++) a[k2] /= s; return a; };
      W = nW; xW = norm(newW); xs = newS.map(norm); xD = norm(newD); t += dt;
      return true;
    }
    var dtMax = Math.min(0.02, (N > 0 ? 0.25 * H / (2 * V) : 1), 0.25 * Hc / V, 0.01 * tot0 / V);
    /* start-up at total reflux until the reflux drum composition settles (max 3 h) */
    var startT = 0, prev = xD.slice();
    if (N > 0 || Hc > 0) {
      var sMax = (o.startH == null ? 0.5 : o.startH) / dtMax;
      for (var s = 0; s < sMax; s++) {
        step(dtMax, 0, true); startT += dtMax; steps++;
        if (s % 20 === 19) { var dmax = 0; for (i = 0; i < nc; i++) dmax = Math.max(dmax, Math.abs(xD[i] - prev[i])); prev = xD.slice(); if (dmax < 1e-5) break; }
      }
    }
    var t0 = t, startHeat = Q; cutHeat = 0;
    trace.push({ t: t, Tw: Tw, TD: TD, xD: xD.slice(), xW: xW.slice(), dist: 0 });
    var distKmol = 0, stop = '';
    while (cur < o.cuts.length) {
      var c = o.cuts[cur], R = c.R, done = false;
      var ok = step(dtMax, R, false); steps++;
      var dm = 0; for (i = 0; i < nc; i++) dm += cutMol[i] * mw[i];
      distKmol = prodMol.reduce(function (a, b) { return a + b; }, 0);
      if (steps % 10 === 0) trace.push({ t: t, Tw: Tw, TD: TD, xD: xD.slice(), xW: xW.slice(), dist: distKmol });
      if (!ok) { stop = 'empty'; done = true; }
      else if (c.end === 'T' && Tw >= c.val) done = true;
      else if (c.end === 'TD' && TD >= c.val) done = true;
      else if (c.end === 'mass' && dm >= c.val) done = true;
      else if (c.end === 'time' && t - cutStart - t0 >= c.val) done = true;
      else if (c.end === 'purity' && xD[c.key] * mw[c.key] / xD.reduce(function (a, x, k) { return a + x * mw[k]; }, 0) * 100 < c.val) done = true;
      if (t - t0 > o.maxT) { stop = 'time'; done = true; }
      if (W < 0.02 * tot0) { stop = 'empty'; done = true; }
      if (done) {
        cuts.push({ i: cur + 1, R: R, end: t - t0, dur: t - t0 - cutStart, mol: cutMol.slice(), heat: cutHeat, TwEnd: Tw, TDend: TD });
        cutMol = z.map(function () { return 0; }); cutStart = t - t0; cutHeat = 0; cur++;
        if (stop) break;
      }
      if (steps > 400000) { stop = 'steps'; break; }
    }
    trace.push({ t: t, Tw: Tw, TD: TD, xD: xD.slice(), xW: xW.slice(), dist: distKmol });
    // residue = still + column holdup (drained at the end)
    var resMol = []; for (i = 0; i < nc; i++) { var m = W * xW[i] + Hc * xD[i]; for (j = 0; j < N; j++) m += H * xs[j][i]; resMol.push(m); }
    var bal = 0, in0 = 0; for (i = 0; i < nc; i++) { bal += prodMol[i] + resMol[i]; in0 += o.moles[i]; }
    return { ok: true, cuts: cuts, residue: resMol, stillMol: W, trace: trace, startup: startT, startHeat: startHeat, Q: Q, balance: bal / in0, stop: stop, steps: steps };
  }
  var api = { model: model, simulate: simulate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PCEBatch = api;
})(this);
