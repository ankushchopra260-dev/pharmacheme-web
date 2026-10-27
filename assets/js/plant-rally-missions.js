/* Plant Rally: engineering missions.
   Each mission makes its own plant-realistic numbers, the correct answer and three wrong answers built from the usual mistakes,
   and a short worked explanation. The formulas and data are the same as the PharmaChemE calculators each mission links to
   (checked by tools/test-plant-rally.js). Needs if97.js (steam) and, passed in at start, the azeotrope and solvent data files.
   Units: kcal, °C, bar, m. */
(function (root) {
  'use strict';
  var IF97 = root.IF97 || (typeof require === 'function' ? require('./if97.js') : null);
  var G = 9.80665, RG = 8.314462618, KJ = 4.1868, PATM_BAR = 1.01325, MMHG_PA = 133.322368;
  var SITE = 'https://www.pharmacheme.in';

  /* API 526 effective orifice areas, in² (same table as the relief valve calculator) */
  var ORI = [['D', 0.110], ['E', 0.196], ['F', 0.307], ['G', 0.503], ['H', 0.785], ['J', 1.287], ['K', 1.838], ['L', 2.853], ['M', 3.60], ['N', 4.34], ['P', 6.38], ['Q', 11.05], ['R', 16.0], ['T', 26.0]];
  /* ASME B36.10M: NB, OD mm, Sch 40 wall mm (same data as the line sizing tool) */
  var PIPE40 = [[25, 33.4, 3.38], [32, 42.2, 3.56], [40, 48.3, 3.68], [50, 60.3, 3.91], [65, 73.0, 5.16], [80, 88.9, 5.49], [100, 114.3, 6.02], [125, 141.3, 6.55], [150, 168.3, 7.11], [200, 219.1, 8.18]];
  var pipeID = function (r) { return (r[1] - 2 * r[2]) / 1000; };

  /* ---------- helpers ---------- */
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  var between = function (R, a, b, step) { var n = Math.round((b - a) / step); return +(a + step * Math.floor(R() * (n + 1))).toFixed(6); };
  var pick = function (R, arr) { return arr[Math.floor(R() * arr.length)]; };
  function sig(v, n) { if (!isFinite(v)) return '–'; if (v === 0) return '0'; var d = Math.max(0, (n || 3) - 1 - Math.floor(Math.log10(Math.abs(v)))); return Number(v.toFixed(Math.min(d, 4))).toLocaleString('en-IN', { maximumFractionDigits: Math.min(d, 4) }); }
  var dec = function (v, d) { return Number(v).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }); };
  function shuffle(R, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* numeric choices: the answer + wrong answers from real mistakes, kept clearly apart */
  function numChoices(R, ans, wrong, fmt, gap) {
    gap = gap || 0.08;
    var vals = [ans], far = function (v) { return vals.every(function (u) { return Math.abs(v - u) > gap * Math.max(Math.abs(u), Math.abs(v), 1e-9); }); };
    wrong.forEach(function (v) { if (isFinite(v) && vals.length < 4 && far(v)) vals.push(v); });
    [1.35, 0.7, 1.6, 0.55, 1.2, 0.85].forEach(function (f) { var v = ans * f; if (vals.length < 4 && far(v)) vals.push(v); });
    var labels = vals.map(fmt);
    var order = shuffle(R, [0, 1, 2, 3]);
    return { choices: order.map(function (i) { return labels[i]; }), correct: order.indexOf(0) };
  }
  function catChoices(R, right, wrong) {
    var all = [right].concat(wrong.filter(function (w, i) { return w !== right && wrong.indexOf(w) === i; }).slice(0, 3));
    var order = shuffle(R, all.map(function (_, i) { return i; }));
    return { choices: order.map(function (i) { return all[i]; }), correct: order.indexOf(0) };
  }
  /* the neighbours of item i in a sorted list: the one just below first (the classic undersizing), then outwards */
  function near(n, i) { var out = []; for (var d = 1; d < n; d++) { if (d === 1 && i - 1 >= 0) out.push(i - 1); if (i + d < n) out.push(i + d); if (d > 1 && i - d >= 0) out.push(i - d); } return out; }
  function antoinePa(s, T) { return Math.pow(10, s.a[0] - s.a[1] / (s.a[2] + T)) * MMHG_PA; }
  function satBarA(Pbar) { var s = IF97.sat(Pbar / 10); return s && { T: s.T - 273.15, hf: s.L.h / KJ, hg: s.V.h / KJ }; }

  /* ---------- the twelve missions ---------- */
  var BAYS = [
    { id: 'reactor', name: 'Reactor bay' }, { id: 'pump', name: 'Pump house' }, { id: 'utility', name: 'Utility block' },
    { id: 'solvent', name: 'Solvent recovery' }, { id: 'tank', name: 'Tank farm' }, { id: 'rack', name: 'Pipe rack' }
  ];

  var M = {};

  M.tip = { hint: 'Tip speed = π × N × D. Keep it the same at both scales.', bay: 'reactor', title: 'Agitator scale-up', calc: '/calculators/mixing-scale-up-calculator/', calcName: 'Mixing scale-up calculator',
    make: function (R) {
      var D1 = pick(R, [300, 350, 400, 450, 500]), N1 = between(R, 150, 320, 10), D2 = pick(R, [900, 1050, 1200, 1350, 1500, 1800]);
      var N2 = N1 * D1 / D2, u = Math.PI * N1 / 60 * D1 / 1000;
      return { inp: { D1: D1, N1: N1, D2: D2 }, num: N2, unit: 'rpm', tol: 0.03, fmt: function (v) { return sig(v, 3) + ' rpm'; },
        wrong: [N1 * Math.pow(D1 / D2, 2 / 3), N1 * D2 / D1, N1 * Math.pow(D1 / D2, 2)],
        q: 'The pilot reactor runs a <b>' + D1 + ' mm</b> impeller at <b>' + N1 + ' rpm</b>. The plant reactor has a <b>' + D2 + ' mm</b> impeller of the same type. Scale up at constant <b>tip speed</b>: what speed should the plant agitator run at?',
        why: 'Tip speed = π·N·D. Keep it equal: N₂ = N₁ × D₁ / D₂ = ' + N1 + ' × ' + D1 + ' / ' + D2 + ' = <b>' + sig(N2, 3) + ' rpm</b> (tip speed ' + dec(u, 2) + ' m/s). Constant P/V would give N₁ × (D₁/D₂)<sup>2/3</sup> = ' + sig(N1 * Math.pow(D1 / D2, 2 / 3), 3) + ' rpm instead.',
        link: { k: 'tip' } };
    } };

  M.orifice = { hint: 'Pick the smallest standard orifice whose area is at least the required area (1 in² = 645.16 mm²).', bay: 'reactor', title: 'Relief valve orifice', calc: '/calculators/relief-valve-sizing/', calcName: 'Relief valve sizing calculator', choice: true,
    make: function (R) {
      var A, i;
      for (var tries = 0; tries < 50; tries++) {
        i = 1 + Math.floor(R() * 11); var lo = ORI[i - 1][1] * 645.16, hi = ORI[i][1] * 645.16;
        A = Math.round((lo + (hi - lo) * (0.12 + 0.76 * R())) / 5) * 5; if (A > lo * 1.05 && A < hi * 0.97) break;
      }
      var right = ORI[i][0], wrong = near(ORI.length, i).map(function (k) { return ORI[k][0]; });
      var c = catChoices(R, right, wrong);
      return { inp: { A: A, letter: right }, choices: c.choices, correct: c.correct,
        q: 'The relief case for a reactor needs an effective discharge area of <b>' + dec(A, 0) + ' mm²</b>. Which API 526 orifice do you specify?',
        why: 'Take the next orifice that is at least as large as the required area. ' + ORI[i - 1][0] + ' is ' + dec(ORI[i - 1][1] * 645.16, 0) + ' mm² (too small); <b>' + right + ' is ' + dec(ORI[i][1] * 645.16, 0) + ' mm²</b> (' + ORI[i][1] + ' in²). A bigger orifice than needed can chatter, so do not jump a size without a reason.' };
    } };

  M.npsh = { hint: 'NPSHa = (P surface − P vapour)/(ρ g) + liquid height above the pump − suction losses.', bay: 'pump', title: 'NPSH check', calc: '/calculators/pipe-pressure-drop/', calcName: 'Pipe pressure drop and NPSH calculator',
    make: function (R, D) {
      var s = pick(R, D.solvents.filter(function (x) { return /^(toluene|methanol|acetone|ethyl-acetate|isopropanol|ethanol|n-hexane|thf|cyclohexane)$/.test(x.s) && x.rho; }));
      var T = between(R, 25, 45, 5), Pv = antoinePa(s, T), rho = s.rho, z = between(R, -2, 3, 0.5), hf = between(R, 0.3, 1.2, 0.1), nr = between(R, 1.5, 4, 0.5);
      var head = function (p) { return p / (rho * G); };
      var ans = head(101325 - Pv) + z - hf;
      var verdict = function (v) { return v < nr ? ' (cavitates)' : ' (OK)'; };
      return { inp: { s: s.s, T: T, rho: rho, pv: Pv / MMHG_PA, z: z, hf: hf, nr: nr }, num: ans, unit: 'm', tol: 0.03, abs: 0.2, fmt: function (v) { return dec(v, 1) + ' m' + verdict(v); },
        wrong: [head(101325) + z - hf, head(101325 - Pv) - z - hf, head(101325 - Pv) + z],
        q: 'A pump takes <b>' + s.n + '</b> at <b>' + T + ' °C</b> (density ' + dec(rho, 0) + ' kg/m³, vapour pressure ' + dec(Pv / MMHG_PA, 0) + ' mmHg) from a tank open to atmosphere. Liquid level is <b>' + dec(z, 1) + ' m</b> ' + (z >= 0 ? 'above' : 'below') + ' the pump inlet, suction losses are <b>' + dec(hf, 1) + ' m</b>, and the pump needs NPSHr <b>' + dec(nr, 1) + ' m</b>. What is the NPSH available?',
        why: 'NPSHa = (P<sub>surface</sub> − P<sub>v</sub>)/(ρg) + z − h<sub>f</sub> = (101,325 − ' + dec(Pv, 0) + ') / (' + dec(rho, 0) + ' × 9.81) ' + (z >= 0 ? '+ ' : '− ') + dec(Math.abs(z), 1) + ' − ' + dec(hf, 1) + ' = <b>' + dec(ans, 1) + ' m</b>. ' + (ans < nr ? 'That is below NPSHr ' + dec(nr, 1) + ' m, so the pump cavitates: raise the tank level, shorten or enlarge the suction line, or cool the liquid.' : 'That is above NPSHr ' + dec(nr, 1) + ' m. Check the margin at the lowest level and the hottest liquid you will pump.') };
    } };

  M.pump = { hint: 'Shaft power (kW) = ρ × g × Q (m³/s) × H / 1000 ÷ efficiency.', bay: 'pump', title: 'Pump shaft power', calc: '/calculators/pump-power-calculator/', calcName: 'Pump power calculator',
    make: function (R) {
      var Q = between(R, 10, 80, 5), H = between(R, 20, 80, 5), sg = between(R, 0.8, 1.2, 0.05), eta = between(R, 0.55, 0.75, 0.05);
      var hyd = 1000 * sg * G * (Q / 3600) * H / 1000, ans = hyd / eta;
      return { inp: { Q: Q, H: H, sg: sg, eta: eta }, num: ans, unit: 'kW', tol: 0.03, fmt: function (v) { return sig(v, 3) + ' kW'; },
        wrong: [hyd, hyd * eta, Q * H / 367 / eta],
        q: 'Transfer <b>' + Q + ' m³/h</b> of a liquid with specific gravity <b>' + dec(sg, 2) + '</b> against a total head of <b>' + H + ' m</b>. Pump efficiency is <b>' + dec(eta * 100, 0) + ' %</b>. What is the pump shaft power?',
        why: 'Hydraulic power = ρ·g·Q·H = ' + dec(sg * 1000, 0) + ' × 9.81 × ' + Q + '/3600 × ' + H + ' = ' + sig(hyd, 3) + ' kW. Shaft power = hydraulic ÷ efficiency = <b>' + sig(ans, 3) + ' kW</b>. Quick check: Q × H × SG / 367 / η gives the same.' };
    } };

  M.flash = { hint: 'Flash fraction = (h_f at high pressure − h_f at low pressure) ÷ latent heat at low pressure. Use absolute pressure.', bay: 'utility', title: 'Flash steam', calc: '/calculators/steam-tables/', calcName: 'Steam tables and flash steam calculator',
    make: function (R) {
      var p1 = between(R, 4, 10, 1), p2 = pick(R, [0, 0, 0.5, 1, 1.5]);
      var s1 = satBarA(p1 + PATM_BAR), s2 = satBarA(p2 + PATM_BAR), x = (s1.hf - s2.hf) / (s2.hg - s2.hf);
      var w = [];
      var g1 = satBarA(p1), g2 = p2 > 0 ? satBarA(p2) : null; if (g1 && g2) w.push((g1.hf - g2.hf) / (g2.hg - g2.hf) * 100);
      w.push((s1.hf - s2.hf) / s2.hg * 100, (s1.hf - s2.hf) / (s1.hg - s1.hf) * 100, (s1.hg - s1.hf - (s2.hg - s2.hf)) / (s2.hg - s2.hf) * 100);
      return { inp: { p1: p1, p2: p2 }, num: x * 100, unit: '%', tol: 0.03, abs: 0.2, fmt: function (v) { return dec(v, 1) + ' %'; }, wrong: w,
        q: 'Condensate leaves the steam traps of a reactor jacket at <b>' + p1 + ' barg</b> (saturated) and drops into a ' + (p2 === 0 ? '<b>vented condensate tank (0 barg)</b>' : 'flash vessel at <b>' + dec(p2, 1) + ' barg</b>') + '. What percentage of the condensate flashes to steam?',
        why: 'Use absolute pressures: ' + dec(p1 + PATM_BAR, 2) + ' and ' + dec(p2 + PATM_BAR, 2) + ' bar abs. Liquid enthalpy h<sub>f</sub> = ' + dec(s1.hf, 1) + ' kcal/kg at the trap, ' + dec(s2.hf, 1) + ' kcal/kg at the lower pressure, where the latent heat is ' + dec(s2.hg - s2.hf, 1) + ' kcal/kg. Flash = (' + dec(s1.hf, 1) + ' − ' + dec(s2.hf, 1) + ') / ' + dec(s2.hg - s2.hf, 1) + ' = <b>' + dec(x * 100, 1) + ' %</b>.' };
    } };

  M.lmtd = { hint: 'LMTD = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂), with ΔT taken at each end of a counter-current exchanger.', bay: 'utility', title: 'Cooler LMTD', calc: '/calculators/lmtd-calculator/', calcName: 'LMTD calculator',
    make: function (R) {
      var thi = between(R, 80, 140, 5), tho = between(R, 42, 60, 2), tci = between(R, 28, 32, 1), tco = between(R, 35, 40, 1);
      var d1 = thi - tco, d2 = tho - tci, ans = (d1 - d2) / Math.log(d1 / d2);
      var c1 = thi - tci, c2 = tho - tco;
      return { inp: { thi: thi, tho: tho, tci: tci, tco: tco }, num: ans, unit: '°C', tol: 0.03, abs: 0.5, fmt: function (v) { return dec(v, 1) + ' °C'; },
        wrong: [(d1 + d2) / 2, (c1 - c2) / Math.log(c1 / c2), d1 - d2],
        q: 'A counter-current cooler takes a process stream from <b>' + thi + ' °C</b> down to <b>' + tho + ' °C</b> with cooling water heating from <b>' + tci + ' °C</b> to <b>' + tco + ' °C</b>. What is the LMTD?',
        why: 'Counter-current: ΔT₁ = ' + thi + ' − ' + tco + ' = ' + d1 + ' °C at the hot end, ΔT₂ = ' + tho + ' − ' + tci + ' = ' + d2 + ' °C at the cold end. LMTD = (ΔT₁ − ΔT₂) / ln(ΔT₁/ΔT₂) = <b>' + dec(ans, 1) + ' °C</b>. The arithmetic mean (' + dec((d1 + d2) / 2, 1) + ' °C) overstates it.' };
    } };

  M.azeo = { hint: 'A minimum-boiling azeotrope boils below both pure components.', bay: 'solvent', title: 'Azeotrope', calc: '/solvents/azeotropes/', calcName: 'Azeotrope table and calculator', choice: true,
    make: function (R, D) {
      var want = ['ethanol', 'toluene', 'cyclohexane', 'tetrahydrofuran', 'acetonitrile', 'n-butanol', 'chloroform', '2-propanol', 'ethyl acetate', 'methyl ethyl ketone', 'isopropyl acetate', 'pyridine'];
      var rows = D.azeo.filter(function (r) { return r.a === 'water' && r.k === 'min' && isFinite(r.t) && isFinite(r.w) && want.indexOf(r.b) >= 0; });
      var r = pick(R, rows), name = r.b.charAt(0).toUpperCase() + r.b.slice(1), het = !!r.L;
      if (R() < 0.5) {
        var c = numChoices(R, r.t, [r.tb, 100, (r.tb + 100) / 2, Math.min(r.tb, 100) + 3], function (v) { return dec(v, 1) + ' °C'; }, 0.02);
        return { inp: { r: r, form: 't' }, choices: c.choices, correct: c.correct,
          q: name + ' (boils at ' + dec(r.tb, 1) + ' °C) and water are distilled together at 1 atm. At what temperature does the azeotrope come over?',
          why: 'Measured value: <b>' + dec(r.t, 1) + ' °C</b>, below both boiling points: a minimum-boiling azeotrope, ' + dec(r.w, 1) + ' wt % ' + r.b + '. ' + (het ? 'The condensate splits into two layers, so a decanter breaks it.' : 'It does not split into layers, so plain distillation stops at that composition.') };
      }
      var c2 = numChoices(R, r.w, [r.x, 100 - r.w, 50, Math.min(99, r.w + 12)], function (v) { return dec(v, 1) + ' wt %'; }, 0.05);
      return { inp: { r: r, form: 'w' }, choices: c2.choices, correct: c2.correct,
        q: 'You distil a wet ' + r.b + ' batch at 1 atm. The first distillate is the ' + r.b + '–water azeotrope (' + dec(r.t, 1) + ' °C). How much ' + r.b + ' does it contain, by weight?',
        why: 'Measured: <b>' + dec(r.w, 1) + ' wt % ' + r.b + '</b> (' + dec(r.x, 1) + ' mol %). Do not mix up weight % and mole %: water\'s low molecular weight makes the two very different.' };
    } };

  M.vacuum = { hint: 'Absolute pressure = local atmospheric pressure − vacuum reading. 1 mmHg = 1.3332 mbar.', bay: 'solvent', title: 'Vacuum reading', calc: '/calculators/unit-converter/', calcName: 'Unit converter',
    make: function (R) {
      var atm = pick(R, [760, 760, 750, 740]), vac = between(R, 600, atm - 20, 10), absmm = atm - vac, ans = absmm * MMHG_PA / 100;
      return { inp: { atm: atm, vac: vac }, num: ans, unit: 'mbar abs', tol: 0.03, abs: 1, fmt: function (v) { return sig(v, 3) + ' mbar abs'; },
        wrong: [vac * MMHG_PA / 100, absmm, (760 - vac) * MMHG_PA / 100, (atm + vac) * MMHG_PA / 100],
        q: 'The vacuum gauge on the solvent recovery receiver reads <b>' + vac + ' mmHg vacuum</b>. Local atmospheric pressure is <b>' + atm + ' mmHg</b>. What is the absolute pressure in mbar?',
        why: 'Absolute = atmospheric − vacuum = ' + atm + ' − ' + vac + ' = ' + absmm + ' mmHg abs = ' + absmm + ' × 1.3332 = <b>' + sig(ans, 3) + ' mbar abs</b>.' + (atm !== 760 ? ' Using 760 mmHg instead of the local ' + atm + ' would give ' + sig((760 - vac) * MMHG_PA / 100, 3) + ' mbar: at deep vacuum the local reading matters.' : '') };
    } };

  M.hydro = { hint: 'ASME VIII Div. 1 UG-99: hydrotest = 1.3 × MAWP × stress ratio.', bay: 'tank', title: 'Hydrotest pressure', calc: '/calculators/vessel-thickness-calculator/', calcName: 'Vessel thickness and MAWP calculator',
    make: function (R) {
      var mawp = between(R, 3, 15, 0.5), ans = 1.3 * mawp;
      return { inp: { mawp: mawp }, num: ans, unit: 'barg', tol: 0.03, fmt: function (v) { return dec(v, 2) + ' barg'; },
        wrong: [1.5 * mawp, 1.1 * mawp, mawp + 1],
        q: 'A new pressure vessel to ASME VIII Division 1 has an MAWP of <b>' + dec(mawp, 1) + ' barg</b>, and its material has the same allowable stress at design and test temperature. What is the minimum hydrostatic test pressure?',
        why: 'UG-99(b): test pressure = 1.3 × MAWP × (stress at test temperature ÷ stress at design temperature) = 1.3 × ' + dec(mawp, 1) + ' × 1 = <b>' + dec(ans, 2) + ' barg</b>, at the top of the vessel. 1.5× is the older code value; 1.1× is for a pneumatic test.' };
    } };

  M.tank = { hint: 'Vapour pushed out = volume filled × P_v × MW / (R × T), with T in kelvin.', bay: 'tank', title: 'Filling vapour loss', calc: '/calculators/tank-breathing-losses/', calcName: 'Tank breathing losses calculator',
    make: function (R, D) {
      var s = pick(R, D.solvents.filter(function (x) { return /^(toluene|methanol|acetone|ethyl-acetate|isopropanol|ethanol|n-hexane|thf|dichloromethane)$/.test(x.s); }));
      var T = between(R, 20, 35, 5), V = between(R, 10, 40, 5), Pv = antoinePa(s, T);
      var Wv = Pv * s.mw / (RG * 1000 * (T + 273.15)), ans = V * Wv;
      return { inp: { s: s.s, T: T, V: V, Wv: Wv }, num: ans, unit: 'kg', tol: 0.03, fmt: function (v) { return sig(v, 3) + ' kg'; },
        wrong: [V * Pv * s.mw / (RG * 1000 * T), ans * 1000 / MMHG_PA, V * s.mw / 22.414],
        q: 'A road tanker unloads <b>' + V + ' m³</b> of <b>' + s.n + '</b> into a fixed-roof tank with an open vent, at <b>' + T + ' °C</b>. The vapour pressure is ' + dec(Pv / 1000, 2) + ' kPa (molecular weight ' + dec(s.mw, 1) + '). Assuming the headspace is saturated, how much solvent leaves the vent as vapour?',
        why: 'Each m³ pumped in pushes 1 m³ of headspace out. Vapour concentration = P<sub>v</sub>·MW/(R·T) = ' + dec(Pv, 0) + ' × ' + dec(s.mw, 1) + ' / (8.314 × ' + dec(T + 273.15, 1) + ') = ' + sig(Wv * 1000, 3) + ' g/m³. Loss = ' + V + ' × ' + sig(Wv, 3) + ' = <b>' + sig(ans, 3) + ' kg</b>. Use temperature in kelvin, never °C.' };
    } };

  M.line = { hint: 'Velocity = flow ÷ pipe inside area. Check the next size down too.', bay: 'rack', title: 'Line size', calc: '/design-tools/line-sizing/', calcName: 'Line sizing tool', choice: true,
    make: function (R) {
      var vmax = pick(R, [1.5, 2, 2.5]), Q, i;
      for (var tries = 0; tries < 50; tries++) {
        Q = between(R, 4, 220, 2);
        i = PIPE40.findIndex(function (r) { return Q / 3600 / (Math.PI * Math.pow(pipeID(r), 2) / 4) <= vmax; });
        if (i > 0) { var vi = Q / 3600 / (Math.PI * Math.pow(pipeID(PIPE40[i]), 2) / 4), vp = Q / 3600 / (Math.PI * Math.pow(pipeID(PIPE40[i - 1]), 2) / 4); if (vi < vmax * 0.97 && vp > vmax * 1.04) break; }
      }
      var v = function (k) { return Q / 3600 / (Math.PI * Math.pow(pipeID(PIPE40[k]), 2) / 4); };
      var lab = function (k) { return PIPE40[k][0] + ' NB'; };
      var c = catChoices(R, lab(i), near(PIPE40.length, i).map(lab));
      return { inp: { Q: Q, vmax: vmax, nb: PIPE40[i][0] }, choices: c.choices, correct: c.correct,
        q: 'A pump discharge line carries <b>' + Q + ' m³/h</b> of water. Site practice is to keep velocity at or below <b>' + vmax + ' m/s</b>. What is the smallest Sch 40 line size that meets it?',
        why: 'v = Q / A. ' + lab(i - 1) + ' (ID ' + dec(pipeID(PIPE40[i - 1]) * 1000, 1) + ' mm) gives ' + dec(v(i - 1), 2) + ' m/s, too fast. <b>' + lab(i) + '</b> (ID ' + dec(pipeID(PIPE40[i]) * 1000, 1) + ' mm) gives <b>' + dec(v(i), 2) + ' m/s</b>.' };
    } };

  M.cv = { hint: 'Kv = Q × √(SG/ΔP) in m³/h and bar; Cv = Kv ÷ 0.865.', bay: 'rack', title: 'Control valve Cv', calc: '/calculators/control-valve-sizing/', calcName: 'Control valve sizing calculator',
    make: function (R) {
      var Q = between(R, 5, 60, 1), dp = between(R, 0.5, 3, 0.25), sg = between(R, 0.8, 1.1, 0.05);
      var Kv = Q * Math.sqrt(sg / dp), ans = Kv / 0.865;
      return { inp: { Q: Q, dp: dp, sg: sg }, num: ans, unit: '', tol: 0.03, fmt: function (v) { return 'Cv ' + sig(v, 3); },
        wrong: [Kv, Q * sg / dp / 0.865, Q / 0.865 * Math.sqrt(dp / sg), Kv * 0.865],
        q: 'A level control valve passes <b>' + Q + ' m³/h</b> of liquid (SG <b>' + dec(sg, 2) + '</b>) with <b>' + dec(dp, 2) + ' bar</b> pressure drop at the design flow, not choked. What Cv is required at that point?',
        why: 'Kv = Q × √(SG/ΔP) = ' + Q + ' × √(' + dec(sg, 2) + '/' + dec(dp, 2) + ') = ' + sig(Kv, 3) + ' (m³/h, bar). Cv = Kv / 0.865 = <b>' + sig(ans, 3) + '</b>.' };
    } };

  /* open the linked calculator with this mission's numbers filled in (calculators that support share links) */
  M.npsh.pre = function (i) { return { id: 'npsh', v: { fluid: i.s, t: i.T, rho: Math.round(i.rho), pv: Math.round(i.pv), p: 0, u: 'barg', z: i.z, hf: +(i.hf * i.rho * G / 1e5).toFixed(3), npshr: i.nr } }; };
  M.flash.pre = function (i) { return { id: 'condensate-flash', v: { m: 1000, p1: i.p1, u1: 'barg', sub: 0, p2: i.p2, u2: 'barg' } }; };
  M.lmtd.pre = function (i) { return { id: 'lmtd', v: { Thi: i.thi, Tho: i.tho, tci: i.tci, tco: i.tco, arr: 'cc' } }; };
  M.vacuum.pre = function (i) { return { id: 'unit-convert', v: { q: 'pressure', x: i.vac, u_pressure: 'mmhg', pt: 'v', patm: +(i.atm * MMHG_PA / 1e5).toFixed(5) } }; };
  M.tank.pre = function (i) { return { id: 'tank-loss', v: { sol: i.s, T: i.T, thru: i.V } }; };
  M.cv.pre = function (i) { return { id: 'cv-liquid', v: { Q: i.Q, rho: Math.round(i.sg * 999.1), p1: 6, p2: +(6 - i.dp).toFixed(2) } }; };
  function enc(o) { var j = JSON.stringify(o), b = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(j))) : Buffer.from(j, 'utf8').toString('base64'); return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }

  var IDS = Object.keys(M);
  function make(id, seed, D) {
    var m = M[id], R = rng(seed), o = m.make(R, D || {});
    o.id = id; o.bay = m.bay; o.title = m.title; o.calc = SITE + m.calc; o.calcName = m.calcName; o.seed = seed;
    if (o.num != null && !o.choices) { var c = numChoices(R, o.num, o.wrong, o.fmt); o.choices = c.choices; o.correct = c.correct; }
    o.typed = o.num != null; // Professional mode types the number
    o.hint = m.hint;
    if (m.pre) { var p = m.pre(o.inp); o.calc += '#s=' + enc({ k: 'pk', id: p.id, v: p.v }); }
    return o;
  }
  function check(o, typed) {
    if (!o.typed) return false;
    var x = parseFloat(String(typed).replace(/,/g, '').replace(/[^\d.\-eE]/g, ''));
    if (!isFinite(x)) return false;
    return Math.abs(x - o.num) <= Math.max(o.tol * Math.abs(o.num), o.abs || 0);
  }
  var api = { BAYS: BAYS, IDS: IDS, M: M, make: make, check: check, rng: rng, ORI: ORI, PIPE40: PIPE40, pipeID: pipeID, antoinePa: antoinePa, satBarA: satBarA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.PRMissions = api;
})(typeof window !== 'undefined' ? window : globalThis);
