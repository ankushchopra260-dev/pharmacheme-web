/* PharmaChemE line sizing and distribution network engine.
   Generic: any plant, any utility. Pressures in barg at the interface, Pa (absolute) inside.
   Network solve: linear-theory method (works for branched and looped networks, liquids and gases).
   Friction: Darcy-Weisbach with the Churchill (1977) friction factor, valid for all flow regimes. */
(function (root) {
  'use strict';
  const G = 9.80665, PATM = 101325, R = 8314.462;

  /* ---------- pipe data: ASME B36.10M / B36.19M, OD and wall thickness in mm ---------- */
  const PIPE = [
    // NB, OD, Sch10S, Sch40, Sch80
    [15, 21.3, 2.11, 2.77, 3.73], [20, 26.7, 2.11, 2.87, 3.91], [25, 33.4, 2.77, 3.38, 4.55], [32, 42.2, 2.77, 3.56, 4.85],
    [40, 48.3, 2.77, 3.68, 5.08], [50, 60.3, 2.77, 3.91, 5.54], [65, 73.0, 3.05, 5.16, 7.01], [80, 88.9, 3.05, 5.49, 7.62],
    [100, 114.3, 3.05, 6.02, 8.56], [125, 141.3, 3.40, 6.55, 9.53], [150, 168.3, 3.40, 7.11, 10.97], [200, 219.1, 3.76, 8.18, 12.70],
    [250, 273.0, 4.19, 9.27, 15.09], [300, 323.8, 4.57, 10.31, 17.48], [350, 355.6, 4.78, 11.13, 19.05], [400, 406.4, 4.78, 12.70, 21.44],
    [450, 457.0, 4.78, 14.27, 23.83], [500, 508.0, 5.54, 15.09, 26.19], [600, 610.0, 6.35, 17.48, 30.96]
  ];
  const SCHED = { '10S': 2, '40': 3, '80': 4 };
  const NBS = PIPE.map(r => r[0]);
  function pipeID(nb, sch) { const r = PIPE.find(p => p[0] === +nb); if (!r) return null; return (r[1] - 2 * r[SCHED[sch] || 3]) / 1000; }

  /* in-line items on a pipe: K (resistance coefficient, fully open), Kv (m3/h at 1 bar), fixed dp (bar) or pump head (m) */
  const ITEMS = {
    gate: { n: 'Gate valve', K: 0.17, g: 'v' }, globe: { n: 'Globe valve', K: 6, g: 'v' }, ball: { n: 'Ball valve', K: 0.05, g: 'v' }, butterfly: { n: 'Butterfly valve', K: 0.5, g: 'v' },
    plug: { n: 'Plug valve', K: 0.3, g: 'v' }, diaphragm: { n: 'Diaphragm valve', K: 2.3, g: 'v' }, check: { n: 'Check valve (swing)', K: 2, g: 'v' }, needle: { n: 'Needle valve', K: 10, g: 'v' },
    cv: { n: 'Control valve', dp: 0.7, g: 'c', inst: 'CV' }, prv: { n: 'Pressure reducing valve', dp: 1.0, g: 'c', inst: 'PCV' },
    strainer: { n: 'Y-strainer', K: 3, g: 'e' }, fe: { n: 'Flow element (orifice)', dp: 0.1, g: 'c', inst: 'FE' }, fm: { n: 'Flowmeter (magnetic)', K: 0.1, g: 'c', inst: 'FT' },
    sg: { n: 'Sight glass', K: 0.5, g: 'e' }, filter: { n: 'Filter', dp: 0.3, g: 'e' }, hx: { n: 'Heat exchanger', dp: 0.5, g: 'e' }, trap: { n: 'Steam trap', dp: 0.2, g: 'e' },
    solenoid: { n: 'Solenoid valve', K: 3, g: 'v' }, onoff: { n: 'On/off valve (actuated)', K: 0.05, g: 'v', inst: 'XV' }, breather: { n: 'Breather / vent valve', K: 2, g: 'e' },
    flamearr: { n: 'Flame arrestor', dp: 0.02, g: 'e' }, rotameter: { n: 'Rotameter', dp: 0.05, g: 'c', inst: 'FI' },
    pump: { n: 'Centrifugal pump', head: 30, g: 'p' }, aodd: { n: 'Diaphragm pump (AODD)', head: 40, g: 'p' }, gear: { n: 'Gear pump', head: 60, g: 'p' }, blower: { n: 'Blower / compressor', dp: -0.5, g: 'p' }
  };
  const MATERIALS = {
    cs: { n: 'Carbon steel (new)', e: 0.045 }, csold: { n: 'Carbon steel (used, light rust)', e: 0.15 }, ss: { n: 'Stainless steel', e: 0.015 },
    gi: { n: 'Galvanised iron', e: 0.15 }, plastic: { n: 'HDPE / PP / PVC / PVDF', e: 0.0015 }, cu: { n: 'Copper', e: 0.0015 }, frp: { n: 'FRP / GRP', e: 0.01 }
  };

  /* ---------- fluid properties ---------- */
  function waterRho(T) { return 1000 * (1 - (T + 288.9414) / (508929.2 * (T + 68.12963)) * Math.pow(T - 3.9863, 2)); }
  function waterMu(T) { return 2.414e-5 * Math.pow(10, 247.8 / (T + 133.15)); }
  // saturated steam: P bar(a), Tsat C, rho_g kg/m3, mu Pa.s
  const SAT = [[1, 99.6, .590, 1.22e-5], [1.5, 111.4, .863, 1.27e-5], [2, 120.2, 1.129, 1.30e-5], [3, 133.5, 1.651, 1.35e-5], [4, 143.6, 2.163, 1.39e-5],
    [5, 151.8, 2.669, 1.42e-5], [6, 158.8, 3.170, 1.45e-5], [7, 165.0, 3.667, 1.47e-5], [8, 170.4, 4.162, 1.49e-5], [9, 175.4, 4.655, 1.51e-5],
    [10, 179.9, 5.147, 1.52e-5], [12, 188.0, 6.127, 1.55e-5], [14, 195.0, 7.106, 1.58e-5], [16, 201.4, 8.085, 1.60e-5], [18, 207.1, 9.065, 1.63e-5],
    [20, 212.4, 10.05, 1.65e-5], [25, 224.0, 12.51, 1.70e-5], [30, 233.9, 15.00, 1.74e-5], [40, 250.4, 20.09, 1.80e-5]];
  function satAt(Pbar) { const p = Math.max(SAT[0][0], Math.min(SAT[SAT.length - 1][0], Pbar)); let i = 1; while (i < SAT.length - 1 && SAT[i][0] < p) i++;
    const a = SAT[i - 1], b = SAT[i], t = (p - a[0]) / (b[0] - a[0]);
    // density roughly proportional to pressure: interpolate in log space
    return { T: a[1] + t * (b[1] - a[1]), rho: Math.exp(Math.log(a[2]) + t * (Math.log(b[2]) - Math.log(a[2]))), mu: a[3] + t * (b[3] - a[3]) }; }

  /* Utilities. kind: 'liq' | 'steam' | 'gas'. unit: flow unit shown to the user.
     Criteria are typical rules of thumb (editable): vmin, vmax in m/s, dp100 = max bar per 100 m. */
  const UTIL = {
    cw: { n: 'Cooling water', kind: 'liq', unit: 'm³/h', T: 32, crit: { vmin: 1.0, vmax: 2.5, dp100: 0.4 }, mat: 'cs', sch: '40', col: '#3E8ED0' },
    pw: { n: 'Process / soft / DM water', kind: 'liq', unit: 'm³/h', T: 30, crit: { vmin: 1.0, vmax: 2.5, dp100: 0.4 }, mat: 'ss', sch: '10S', col: '#4CC0DF' },
    chw: { n: 'Chilled water', kind: 'liq', unit: 'm³/h', T: 7, crit: { vmin: 1.0, vmax: 2.0, dp100: 0.4 }, mat: 'cs', sch: '40', col: '#5AA9E6' },
    brine: { n: 'Brine / glycol (enter ρ, μ)', kind: 'liq', unit: 'm³/h', T: -10, rho: 1060, mu: 0.006, crit: { vmin: 0.8, vmax: 2.0, dp100: 0.4 }, mat: 'cs', sch: '40', col: '#7E6BD6' },
    steam: { n: 'Steam (saturated / superheated)', kind: 'steam', unit: 'kg/h', T: null, crit: { vmin: 10, vmax: 30, dp100: 0.3 }, mat: 'cs', sch: '40', col: '#D9534F' },
    cond: { n: 'Condensate return (pumped)', kind: 'liq', unit: 'm³/h', T: 90, crit: { vmin: 0.5, vmax: 1.5, dp100: 0.3 }, mat: 'cs', sch: '80', col: '#E8915A' },
    air: { n: 'Compressed air', kind: 'gas', unit: 'Nm³/h', T: 35, MW: 28.96, mu: 1.85e-5, crit: { vmin: 3, vmax: 10, dp100: 0.1 }, mat: 'gi', sch: '40', col: '#9BB0C1' },
    n2: { n: 'Nitrogen', kind: 'gas', unit: 'Nm³/h', T: 30, MW: 28.01, mu: 1.78e-5, crit: { vmin: 3, vmax: 15, dp100: 0.15 }, mat: 'ss', sch: '10S', col: '#6FBF73' },
    liq: { n: 'Other liquid (enter ρ, μ)', kind: 'liq', unit: 'm³/h', T: 25, rho: 900, mu: 0.001, crit: { vmin: 1.0, vmax: 2.5, dp100: 0.4 }, mat: 'ss', sch: '10S', col: '#C9A227' },
    gas: { n: 'Other gas (enter MW, μ)', kind: 'gas', unit: 'Nm³/h', T: 30, MW: 16.04, mu: 1.1e-5, crit: { vmin: 5, vmax: 20, dp100: 0.2 }, mat: 'cs', sch: '40', col: '#B5895A' }
  };

  /* a line can carry its own service/fluid; it then behaves like a network of that utility */
  function effNet(net, s) { const f = s && s.fluid; if (!f || !f.u) return net;
    const same = f.u === net.utility;
    return Object.assign({}, net, { utility: f.u, T: f.T != null && f.T !== '' ? f.T : same ? net.T : '', rho: f.rho || (same ? net.rho : ''), mu: f.mu || (same ? net.mu : ''), MW: f.MW || (same ? net.MW : ''), Z: same ? net.Z : '', crit: same ? net.crit : (f.crit || null) }); }
  /* fluid state at absolute pressure P (Pa) for a network definition */
  function fluid(net, P) {
    const u = UTIL[net.utility] || UTIL.liq, T = net.T != null && net.T !== '' ? +net.T : u.T;
    if (u.kind === 'liq') {
      const isWater = ['cw', 'pw', 'chw', 'cond'].includes(net.utility);
      const rho = net.rho ? +net.rho : isWater ? waterRho(T) : u.rho, mu = net.mu ? +net.mu : isWater ? waterMu(T) : u.mu;
      return { rho, mu, T, kind: 'liq' };
    }
    if (u.kind === 'steam') {
      const s = satAt(P / 1e5), Ts = s.T; const Tr = net.T != null && net.T !== '' && +net.T > Ts ? +net.T : Ts;
      return { rho: s.rho * (Ts + 273.15) / (Tr + 273.15), mu: s.mu, T: Tr, Tsat: Ts, kind: 'steam' };
    }
    const MW = net.MW ? +net.MW : u.MW, mu = net.mu ? +net.mu : u.mu, Z = net.Z ? +net.Z : 1;
    return { rho: P * MW / (Z * R * (T + 273.15)), mu, T, MW, kind: 'gas' };
  }
  /* user flow -> kg/s */
  function massFlow(net, q) {
    const u = UTIL[net.utility] || UTIL.liq; q = +q || 0;
    if (u.unit === 'kg/h') return q / 3600;
    if (u.unit === 'Nm³/h') { const MW = net.MW ? +net.MW : u.MW; return q / 3600 * PATM * MW / (R * 273.15); }
    const T = net.T != null && net.T !== '' ? +net.T : u.T, isWater = ['cw', 'pw', 'chw', 'cond'].includes(net.utility);
    const rho = net.rho ? +net.rho : isWater ? waterRho(T) : u.rho; return q / 3600 * rho;
  }
  function churchill(Re, eD) {
    if (Re < 1e-9) return 64 / 1e-9;
    const A = Math.pow(2.457 * Math.log(1 / (Math.pow(7 / Re, 0.9) + 0.27 * eD)), 16), B = Math.pow(37530 / Re, 16);
    return 8 * Math.pow(Math.pow(8 / Re, 12) + 1 / Math.pow(A + B, 1.5), 1 / 12);
  }

  /* ---------- network solve ---------- */
  function geomLen(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
  function segLength(net, s, byId) { const a = byId[s.from], b = byId[s.to]; const base = s.lenAuto === false || !a || !b || a.x == null || b.x == null ? +s.len || 0 : geomLen(a, b); return base; }
  function eqLength(net, s, L) { const pct = s.fitPct != null && s.fitPct !== '' ? +s.fitPct : (net.fitPct != null ? +net.fitPct : 20); return L * (1 + pct / 100) + (+s.extra || 0); }
  function demandOf(net, n) { if (n.type !== 'consumer') return 0; const use = n.use != null && n.use !== '' ? +n.use : 1; return massFlow(net, n.flow) * use * (1 + (+net.margin || 0) / 100); }

  /* solve pressures and flows for fixed pipe sizes. Returns {ok, msg, nodes:{id:{P,...}}, segs:{id:{m,...}}} */
  function solve(net, opts) {
    opts = opts || {};
    const nodes = net.nodes, segs = net.segs.filter(s => s.from !== s.to && !s.ns), touched = new Set(); net.segs.forEach(s => { touched.add(s.from); touched.add(s.to); });
    const byId = {}; nodes.forEach(n => byId[n.id] = n);
    const srcs = nodes.filter(n => n.type === 'source');
    if (!srcs.length) return { ok: false, msg: 'Add a source (supply point) with its pressure.' };
    if (!segs.length) return { ok: false, msg: net.segs.length ? 'Every line is set to "not sized". Tick "Include in sizing" on the lines to calculate.' : 'Draw at least one pipe.' };
    // connectivity: every node with a demand must be reachable from a source
    const adj = {}; nodes.forEach(n => adj[n.id] = []); segs.forEach(s => { if (adj[s.from] && adj[s.to]) { adj[s.from].push(s.to); adj[s.to].push(s.from); } });
    const seen = new Set(srcs.map(s => s.id)), st = srcs.map(s => s.id); while (st.length) { const k = st.pop(); adj[k].forEach(j => { if (!seen.has(j)) { seen.add(j); st.push(j); } }); }
    const cut = nodes.filter(n => !seen.has(n.id) && (adj[n.id].length || (n.type === 'consumer' && !touched.has(n.id))));
    if (cut.length) return { ok: false, msg: 'Not connected to a source: ' + cut.map(n => n.name || n.id).join(', ') };
    const free = nodes.filter(n => n.type !== 'source' && seen.has(n.id)), idx = {}; free.forEach((n, i) => idx[n.id] = i);
    const N = free.length, kind = (UTIL[net.utility] || UTIL.liq).kind;
    const P = {}; const P0 = Math.max(...srcs.map(s => (+s.p || 0) * 1e5 + PATM));
    nodes.forEach(n => P[n.id] = n.type === 'source' ? (+n.p || 0) * 1e5 + PATM : P0);
    // circuits: lines joined together share one fluid (the first line's service, or the network's)
    const comp = {}; let ci = 0; const cnet = []; nodes.forEach(n => { if (comp[n.id] !== undefined || !seen.has(n.id)) return; const k = ci++; let fl = null; const stk = [n.id]; comp[n.id] = k;
      while (stk.length) { const a = stk.pop(); segs.forEach(s => { if (s.from !== a && s.to !== a) return; if (!fl && s.fluid && s.fluid.u) fl = s; const b = s.from === a ? s.to : s.from; if (comp[b] === undefined) { comp[b] = k; stk.push(b); } }); }
      cnet[k] = fl ? effNet(net, fl) : net; });
    const netOfNode = id => cnet[comp[id]] || net;
    const S = segs.map(s => { const L = segLength(net, s, byId); const D = pipeID(s.nbUse || s.nb, s.sch || net.sch) || 0.05;
      const e = (MATERIALS[s.mat || net.mat] || MATERIALS.cs).e / 1000; return { s, L, Le: eqLength(net, s, L), D, A: Math.PI * D * D / 4, e, K: (+s.K || 0) + itemK(s), m: 0.1, en: netOfNode(s.from) }; });
    const dem = {}; nodes.forEach(n => dem[n.id] = seen.has(n.id) && adj[n.id].length ? demandOf(netOfNode(n.id), n) : 0);
    const totDem = Object.values(dem).reduce((a, b) => a + b, 0);
    S.forEach(x => x.m = Math.max(1e-4, totDem / Math.max(1, S.length)));
    let it = 0, err = 1;
    const fl = (x) => { const Pm = (P[x.s.from] + P[x.s.to]) / 2; return fluid(x.en, Math.max(Pm, 2e4)); };
    for (it = 0; it < 200 && err > 1e-6; it++) {
      // conductance for each segment, linearised about the current flow
      S.forEach(x => { const f0 = fl(x); x.rho = f0.rho; x.mu = f0.mu; const Re = Math.abs(x.m) * x.D / (x.A * x.mu); x.Re = Re; x.f = churchill(Math.max(Re, 1), x.e / x.D);
        x.R = (x.f * x.Le / x.D + x.K) / (2 * x.rho * x.A * x.A) + itemKvC(x.s, x.rho); x.dz = (byId[x.s.to].z || 0) - (byId[x.s.from].z || 0);
        x.hs = x.rho * G * x.dz + itemConst(x.s, x.rho, x.m);
        x.g = 1 / (x.R * Math.max(Math.abs(x.m), 1e-6) + 1e-12); });
      // assemble: sum over segments g*(Pi - Pj - hs) = -demand_i (flow out of i positive along from->to)
      const Am = Array.from({ length: N }, () => new Float64Array(N)), b = new Float64Array(N);
      S.forEach(x => { const i = idx[x.s.from], j = idx[x.s.to];
        if (i !== undefined) { Am[i][i] += x.g; b[i] += x.g * x.hs; if (j !== undefined) Am[i][j] -= x.g; else b[i] += x.g * P[x.s.to]; }
        if (j !== undefined) { Am[j][j] += x.g; b[j] -= x.g * x.hs; if (i !== undefined) Am[j][i] -= x.g; else b[j] += x.g * P[x.s.from]; } });
      free.forEach(n => { b[idx[n.id]] -= dem[n.id]; });
      const sol = gauss(Am, b); if (!sol) return { ok: false, msg: 'The network could not be solved. Check for pipes that lead nowhere.' };
      free.forEach(n => P[n.id] = sol[idx[n.id]]);
      err = 0; S.forEach(x => { const mNew = x.g * (P[x.s.from] - P[x.s.to] - x.hs); const mAvg = it < 2 ? mNew : (mNew + x.m) / 2; err = Math.max(err, Math.abs(mAvg - x.m) / Math.max(1e-3, totDem)); x.m = mAvg; });
    }
    const out = { ok: true, it, nodes: {}, segs: {}, totDem, kind };
    nodes.forEach(n => { if (!seen.has(n.id) || !adj[n.id].length) return; const Pg = (P[n.id] - PATM) / 1e5, en = netOfNode(n.id); out.nodes[n.id] = { P: P[n.id], Pg, dem: dem[n.id], unit: (UTIL[en.utility] || UTIL.liq).unit, q: displayFlow(en, dem[n.id]) }; });
    S.forEach(x => { const f0 = fl(x), v = Math.abs(x.m) / (f0.rho * x.A), Re = Math.abs(x.m) * x.D / (x.A * f0.mu), f = churchill(Math.max(Re, 1), x.e / x.D);
      const kItems = itemK(x.s), dpf = (f * x.Le / x.D + (x.K - kItems)) * f0.rho * v * v / 2;
      const items = (x.s.items || []).map(it => ({ id: it.id, dp: itemDP(it, f0.rho, v, x.m), kvReq: itemKvReq(it, f0, x.m) }));
      out.segs[x.s.id] = { m: x.m, dir: x.m >= 0 ? 1 : -1, v, Re, f, D: x.D, L: x.L, Le: x.Le, rho: f0.rho, mu: f0.mu, dpf, dps: x.hs, dp100: f / x.D * f0.rho * v * v / 2 * 100 / 1e5, /* friction gradient of straight pipe */
        q: Math.abs(x.m) / f0.rho * 3600, qd: displayFlow(x.en, Math.abs(x.m)), unit: (UTIL[x.en.utility] || UTIL.liq).unit, util: x.en.utility, T: f0.T, kind: f0.kind, P1: P[x.s.from], P2: P[x.s.to], Tsat: f0.Tsat, items, dpItems: items.reduce((a, q) => a + q.dp, 0) }; });
    return out;
  }
  /* in-line items */
  function itemDef(it) { return ITEMS[it.k] || {}; }
  function num(v, d) { return v === '' || v == null || isNaN(+v) ? d : +v; }
  function itemK(s) { return (s.items || []).reduce((a, it) => { const D = itemDef(it); if (it.kv) return a; const K = num(it.K, D.K); return a + (K != null && D.dp == null && D.head == null ? K : (it.K !== '' && it.K != null && D.K == null ? +it.K : 0)); }, 0); }
  function itemKvC(s, rho) { return (s.items || []).reduce((a, it) => it.kv > 0 ? a + 1e5 * (rho / 1000) * Math.pow(3600 / (rho * it.kv), 2) : a, 0); }
  function itemConst(s, rho, m) { // fixed losses act against the flow; pumps add pressure in their own direction (from -> to unless reversed)
    let c = 0; (s.items || []).forEach(it => { if (it.kv > 0) return; const D = itemDef(it);
      if (D.head != null || it.k === 'pump') c -= rho * G * num(it.head, D.head || 0) * (it.rev ? -1 : 1);
      else if (D.dp != null && D.dp < 0) c += num(it.dp, D.dp) * 1e5 * (it.rev ? -1 : 1);
      else if (D.dp != null) c += num(it.dp, D.dp) * 1e5 * (m >= 0 ? 1 : -1); });
    return c; }
  function itemDP(it, rho, v, m) { const D = itemDef(it);
    if (it.kv > 0) { const Q = Math.abs(m) / rho * 3600; return 1e5 * (rho / 1000) * Math.pow(Q / it.kv, 2); }
    if (D.head != null || it.k === 'pump') return -rho * G * num(it.head, D.head || 0);
    if (D.dp != null) return num(it.dp, D.dp) * 1e5 * (D.dp < 0 ? 1 : 1);
    return num(it.K, D.K || 0) * rho * v * v / 2; }
  function itemKvReq(it, f0, m) { // liquids: Kv = Q * sqrt(SG / dP)
    if (!(it.k === 'cv' || it.k === 'prv') || f0.kind !== 'liq') return null; const D = itemDef(it), dp = it.kv > 0 ? null : num(it.dp, D.dp); if (!dp) return null;
    return Math.abs(m) / f0.rho * 3600 * Math.sqrt(f0.rho / 1000 / dp); }
  function gauss(A, b) {
    const n = b.length; const M = A.map((r, i) => { const x = Array.from(r); x.push(b[i]); return x; });
    for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      if (Math.abs(M[p][c]) < 1e-18) return null; [M[c], M[p]] = [M[p], M[c]];
      for (let r = c + 1; r < n; r++) { const k = M[r][c] / M[c][c]; if (!k) continue; for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]; } }
    const x = new Array(n); for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let j = r + 1; j < n; j++) s -= M[r][j] * x[j]; x[r] = s / M[r][r]; } return x;
  }

  /* ---------- auto-size: velocity / dp criteria, then delivered pressure at each consumer ---------- */
  function critOf(net) { const u = UTIL[net.utility] || UTIL.liq; return Object.assign({}, u.crit, net.crit || {}); }
  function smallestOK(net, x, m, rho, mu) {
    const c = critOf(effNet(net, x.fluid ? x : null) || net), sch = x.sch || net.sch, e = (MATERIALS[x.mat || net.mat] || MATERIALS.cs).e / 1000, minNB = +net.minNB || 15;
    for (const nb of NBS) { if (nb < minNB) continue; const D = pipeID(nb, sch); if (!D) continue; const A = Math.PI * D * D / 4, v = Math.abs(m) / (rho * A), Re = Math.abs(m) * D / (A * mu), f = churchill(Math.max(Re, 1), e / D);
      const dp100 = f * 100 / D * rho * v * v / 2 / 1e5; if (v <= c.vmax && dp100 <= c.dp100) return nb; }
    return NBS[NBS.length - 1];
  }
  function size(net) {
    const isAuto = s => !s.nb || s.nb === 'auto';
    const auto = net.segs.filter(isAuto);
    net.segs.forEach(s => { s.nbUse = isAuto(s) ? (s.nbUse || 100) : +s.nb; });
    let r = solve(net); if (!r.ok) return r;
    const c = critOf(net);
    // 1) velocity and dp/100 m; flows in loops depend on the sizes, so iterate (only growing after the first passes)
    function passCriteria(growOnly) { let total = 0;
      for (let k = 0; k < 16; k++) { let changed = 0;
        auto.forEach(s => { const x = r.segs[s.id]; if (!x) return; let nb = smallestOK(net, s, x.m, x.rho, x.mu); if (growOnly || k > 3) nb = Math.max(nb, s.nbUse); if (nb !== s.nbUse) { s.nbUse = nb; changed++; } });
        if (!changed) break; total += changed; r = solve(net); if (!r.ok) return total; }
      return total; }
    // 2) delivered pressure: upsize the pipe losing most pressure on the path to the user that is shortest of pressure
    function passPressure() { let total = 0;
      for (let k = 0; k < 150; k++) {
        const short = net.nodes.filter(n => n.type === 'consumer' && n.preq !== '' && n.preq != null && r.nodes[n.id] && r.nodes[n.id].Pg < +n.preq - 1e-6);
        if (!short.length) break;
        // users fed through a pump are fixed by the pump head, not by bigger pipes (the tool reports the head needed)
        const pumped = s => (s.items || []).some(it => (ITEMS[it.k] || {}).g === 'p');
        let path = []; for (const w of short.sort((a, b) => (r.nodes[a.id].Pg - a.preq) - (r.nodes[b.id].Pg - b.preq))) {
          const full = pathTo(net, r, w.id); if (full.some(pumped)) continue;
          path = full.filter(s => isAuto(s) && !s.ns && s.nbUse < NBS[NBS.length - 1]); if (path.length) break; }
        if (!path.length) break;
        path.sort((a, b) => r.segs[b.id].dpf - r.segs[a.id].dpf);
        const s = path[0]; s.nbUse = NBS[NBS.indexOf(s.nbUse) + 1]; total++; r = solve(net); if (!r.ok) return total; }
      return total; }
    passCriteria(false);
    for (let k = 0; k < 6 && r.ok; k++) { const a = passPressure(), b = passCriteria(true); if (!a && !b) break; }
    return r;
  }
  /* trace upstream from a node following the largest inflow until a source */
  function pathTo(net, r, id) {
    const out = [], seen = new Set([id]); let cur = id;
    for (let k = 0; k < 500; k++) { const n = net.nodes.find(x => x.id === cur); if (!n || n.type === 'source') break;
      let best = null, bm = 0; net.segs.forEach(s => { const x = r.segs[s.id]; if (!x) return; const inflow = s.to === cur ? x.m : s.from === cur ? -x.m : 0; if (inflow > bm) { bm = inflow; best = s; } });
      if (!best) break; out.push(best); cur = best.to === cur ? best.from : best.to; if (seen.has(cur)) break; seen.add(cur); }
    return out;
  }
  /* status of each segment and node against the criteria */
  function check(net, r) {
    const seg = {}, node = {};
    net.segs.forEach(s => { const x = r.segs[s.id]; if (!x) return; const w = [], c = critOf(effNet(net, s));
      if (x.v > c.vmax * 1.001) w.push('velocity above ' + c.vmax + ' m/s');
      if (x.v < c.vmin && Math.abs(x.m) > 1e-6) w.push('velocity below ' + c.vmin + ' m/s');
      if (x.dp100 > c.dp100 * 1.001) w.push('ΔP above ' + c.dp100 + ' bar/100 m');
      seg[s.id] = { warn: w, level: w.some(t => !/below/.test(t)) ? 2 : w.length ? 1 : 0 }; });
    net.nodes.forEach(n => { const x = r.nodes[n.id]; if (!x) return; const w = [];
      if (n.type === 'consumer' && n.preq !== '' && n.preq != null && x.Pg < +n.preq - 1e-6) w.push('pressure ' + x.Pg.toFixed(2) + ' barg is below the required ' + (+n.preq).toFixed(2));
      if (x.P < 0.2e5) w.push('pressure below 0.2 bar(a): supply pressure too low');
      node[n.id] = { warn: w, level: w.length ? 2 : 0 }; });
    return { seg, node };
  }
  function displayFlow(net, m) { const u = UTIL[net.utility] || UTIL.liq; if (u.unit === 'kg/h') return m * 3600; const q1 = massFlow(net, 1); return m / q1; }

  root.LNE = { effNet, ITEMS, itemDef, PIPE, NBS, SCHED, MATERIALS, UTIL, pipeID, fluid, massFlow, churchill, solve, size, check, critOf, segLength, eqLength, displayFlow, pathTo, satAt, waterRho, waterMu, PATM };
})(typeof window !== 'undefined' ? window : globalThis);
