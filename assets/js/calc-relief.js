/* Pressure relief valve sizing: API 520 Part I (gas/vapour critical and subcritical, steam, liquid), API 521 fire case (wetted and gas-filled vessels), thermal expansion.
   Orifice letters and effective areas: API 526. Needs pce-kit.js and (for steam) if97.js. */
(function () {
  'use strict';
  var K = PCEKit, F = K.F, G = K.G;
  var ORI = [['D', 0.110], ['E', 0.196], ['F', 0.307], ['G', 0.503], ['H', 0.785], ['J', 1.287], ['K', 1.838], ['L', 2.853], ['M', 3.60], ['N', 4.34], ['P', 6.38], ['Q', 11.05], ['R', 16.0], ['T', 26.0]];
  var REF520 = 'API Standard 520 Part I, <i>Sizing, Selection, and Installation of Pressure-relieving Devices — Sizing and Selection</i> (SI equations for gas/vapour, steam and liquid relief).';
  var REF526 = 'API Standard 526, <i>Flanged Steel Pressure-relief Valves</i>: effective orifice areas D to T.';
  var REF521 = 'API Standard 521, <i>Pressure-relieving and Depressuring Systems</i>: fire heat input to wetted surfaces, Q = 43,200 F A<sup>0.82</sup> W with adequate drainage and firefighting, 70,900 F A<sup>0.82</sup> without (A in m²; 21,000 and 34,500 in BTU/h with A in ft²); wetted area up to 7.6 m above grade.';
  function orifice(Amm2) {
    var A = Amm2 / 645.16;
    for (var i = 0; i < ORI.length; i++) if (ORI[i][1] >= A) return { L: ORI[i][0], A: ORI[i][1] * 645.16, use: 100 * A / ORI[i][1] };
    return { L: 'larger than T: use more than one valve', A: NaN, use: NaN };
  }
  function oriRows(A) {
    var o = orifice(A), r = [['Required effective area', F(A, 0), 'mm² (' + G(A / 645.16, 3) + ' in²)'], ['API 526 orifice', o.L, isFinite(o.A) ? F(o.A, 0) + ' mm² effective' : '']];
    if (isFinite(o.use)) r.push(['Orifice used', F(o.use, 0), '%']);
    r.push(['Equivalent diameter', F(Math.sqrt(4 * A / Math.PI), 1), 'mm']);
    return r;
  }
  function oriTable() { return { title: 'API 526 orifice designations (effective areas)', head: ['Orifice', 'in²', 'mm²'], rows: ORI.map(function (o) { return [o[0], String(o[1]), F(o[1] * 645.16, 0)]; }) }; }
  var C_of = function (k) { return 0.03948 * Math.sqrt(k * Math.pow(2 / (k + 1), (k + 1) / (k - 1))); };
  var PATM = 101.325; // kPa

  /* ---------- gas / vapour ---------- */
  function gasArea(W, P1, P2, T, M, k, Z, Kd, Kb, Kc) { // W kg/h, P kPa abs, T K -> {A mm2, critical, rc}
    var rc = Math.pow(2 / (k + 1), k / (k - 1)), crit = P2 / P1 <= rc;
    if (crit) return { A: W / (C_of(k) * Kd * P1 * Kb * Kc) * Math.sqrt(T * Z / M), crit: true, rc: rc };
    var r = P2 / P1, F2 = Math.sqrt((k / (k - 1)) * Math.pow(r, 2 / k) * (1 - Math.pow(r, (k - 1) / k)) / (1 - r));
    return { A: 17.9 * W / (F2 * Kd * Kc) * Math.sqrt(Z * T / (M * P1 * (P1 - P2))), crit: false, rc: rc, F2: F2 };
  }
  K.add('psv-gas', {
    title: 'Relief valve for gas or vapour (API 520)',
    sub: 'Critical and subcritical flow; conventional, balanced-bellows or pilot valve; rupture disc upstream',
    inputs: [
      { k: 'W', label: 'Required relief rate', unit: 'kg/h', v: 1200 },
      { k: 'ps', label: 'Set pressure', unit: 'barg', v: 3 },
      { k: 'op', label: 'Allowable overpressure', unit: '%', v: 10, help: '10 % single valve, 16 % multiple valves, 21 % fire case (ASME VIII)' },
      { k: 'pb', label: 'Total back pressure at the outlet', unit: 'barg', v: 0 },
      { k: 't', label: 'Relieving temperature', unit: '°C', v: 70 },
      { k: 'M', label: 'Molecular weight', unit: 'kg/kmol', v: 32.04 },
      { k: 'k', label: 'Ratio of specific heats, k = cp/cv', v: 1.2 },
      { k: 'Z', label: 'Compressibility, Z', v: 1 },
      { k: 'Kd', label: 'Discharge coefficient, Kd', v: 0.975, help: '0.975 preliminary for a gas PRV; use the certified value once a valve is chosen' },
      { k: 'Kb', label: 'Back-pressure correction, Kb', v: 1, help: '1 for conventional and pilot valves in critical flow; from the vendor curve for balanced bellows' },
      { k: 'Kc', label: 'Rupture disc upstream, Kc', type: 'sel', v: '1', opts: [['1', 'No rupture disc (1.0)'], ['0.9', 'Rupture disc upstream (0.9)']] }
    ],
    example: { v: { W: 2500, ps: 5, op: 10, pb: 0.5, t: 120, M: 44.01, k: 1.29, Z: 0.98, Kd: 0.975, Kb: 1, Kc: '1' } },
    run: function (v) {
      var P1 = (v.ps * (1 + v.op / 100)) * 100 + PATM, P2 = v.pb * 100 + PATM, T = v.t + 273.15;
      if (!(v.k > 1) || !(v.M > 0) || !(P1 > P2)) return { rows: [], notes: [['Check k (above 1), molecular weight and that back pressure is below the relieving pressure.', 'bad']] };
      var r = gasArea(v.W, P1, P2, T, v.M, v.k, v.Z, v.Kd, v.Kb, +v.Kc);
      var rows = oriRows(r.A).concat([['Relieving pressure P1', F(P1, 1), 'kPa abs (' + F(P1 / 100 - 1.01325, 2) + ' barg)'], ['Flow regime', r.crit ? 'Critical (choked)' : 'Subcritical', ''],
        ['Critical pressure ratio', F(r.rc, 3), 'critical flow below ' + F(r.rc * P1 / 100 - 1.01325, 2) + ' barg back pressure'], ['Coefficient C', G(C_of(v.k), 4), '']]);
      if (!r.crit) rows.push(['Subcritical coefficient F2', G(r.F2, 4), '']);
      var notes = [['Area = W / (C K<sub>d</sub> P<sub>1</sub> K<sub>b</sub> K<sub>c</sub>) &radic;(T Z / M) in critical flow; the subcritical equation with F<sub>2</sub> is used automatically when back pressure is above the critical pressure.', 'lead']];
      var bp = (v.pb) / v.ps * 100;
      if (bp > 10) notes.push(['Built-up plus superimposed back pressure is ' + F(bp, 0) + ' % of set pressure: a conventional valve is usually limited to 10 %. Consider a balanced bellows or pilot valve and use its Kb.', 'warn']);
      notes.push(['Choose an orifice at least as large as the required area. Inlet line loss should stay below 3 % of set pressure.']);
      return { rows: rows, notes: notes, tables: [oriTable()] };
    },
    refs: [REF520, REF526, 'Overpressure limits: ASME Boiler and Pressure Vessel Code, Section VIII Division 1.']
  });

  /* ---------- saturated steam (Napier) ---------- */
  K.add('psv-steam', {
    title: 'Relief valve for saturated steam (API 520, Napier)',
    sub: 'Steam boilers, steam headers and jacket supply after a pressure-reducing valve',
    inputs: [
      { k: 'W', label: 'Required relief rate', unit: 'kg/h', v: 2000, help: 'For a PRV failing open: the full flow through the PRV at maximum upstream pressure' },
      { k: 'ps', label: 'Set pressure', unit: 'barg', v: 6 },
      { k: 'op', label: 'Allowable overpressure', unit: '%', v: 10 },
      { k: 'Kd', label: 'Discharge coefficient, Kd', v: 0.975 },
      { k: 'Kb', label: 'Back-pressure correction, Kb', v: 1 },
      { k: 'Kc', label: 'Rupture disc upstream, Kc', type: 'sel', v: '1', opts: [['1', 'No rupture disc (1.0)'], ['0.9', 'Rupture disc upstream (0.9)']] }
    ],
    example: { v: { W: 4500, ps: 10.5, op: 10, Kd: 0.975, Kb: 1, Kc: '1' } },
    run: function (v) {
      var P1 = v.ps * (1 + v.op / 100) * 100 + PATM;
      if (P1 > 22057) return { rows: [], notes: [['Above 22,057 kPa the Napier equation is not valid.', 'bad']] };
      var KN = P1 <= 10339 ? 1 : (0.02764 * P1 - 1000) / (0.03324 * P1 - 1061);
      var A = 190.5 * v.W / (P1 * v.Kd * v.Kb * +v.Kc * KN);
      return { rows: oriRows(A).concat([['Relieving pressure P1', F(P1, 0), 'kPa abs'], ['Napier correction KN', F(KN, 3), '']]),
        notes: [['Area = 190.5 W / (P<sub>1</sub> K<sub>d</sub> K<sub>b</sub> K<sub>c</sub> K<sub>N</sub> K<sub>SH</sub>) for dry saturated steam (K<sub>SH</sub> = 1). For superheated steam use the gas calculator with steam properties.', 'lead']], tables: [oriTable()] };
    },
    refs: [REF520, REF526]
  });

  /* ---------- liquid ---------- */
  K.add('psv-liquid', {
    title: 'Relief valve for liquid (API 520, certified liquid valve)',
    sub: 'Blocked pump discharge, control valve failure, overfilling; includes the viscosity correction',
    inputs: [
      { k: 'Q', label: 'Required relief flow', unit: 'm³/h', v: 20 },
      { k: 'G', label: 'Specific gravity at relieving temperature', v: 0.87 },
      { k: 'mu', label: 'Viscosity at relieving temperature', unit: 'cP', v: 0.6 },
      { k: 'ps', label: 'Set pressure', unit: 'barg', v: 7 },
      { k: 'op', label: 'Allowable overpressure', unit: '%', v: 10 },
      { k: 'pb', label: 'Total back pressure', unit: 'barg', v: 0.5 },
      { k: 'Kd', label: 'Discharge coefficient, Kd', v: 0.65, help: '0.65 preliminary for a certified liquid valve' },
      { k: 'Kw', label: 'Back-pressure correction, Kw', v: 1, help: '1 for conventional valves; from the vendor curve for balanced bellows' },
      { k: 'Kc', label: 'Rupture disc upstream, Kc', type: 'sel', v: '1', opts: [['1', 'No rupture disc (1.0)'], ['0.9', 'Rupture disc upstream (0.9)']] }
    ],
    example: { v: { Q: 45, G: 0.79, mu: 0.55, ps: 9, op: 10, pb: 1, Kd: 0.65, Kw: 1, Kc: '1' } },
    run: function (v) {
      var Ql = v.Q * 1000 / 60, P1 = v.ps * (1 + v.op / 100) * 100, P2 = v.pb * 100, dP = P1 - P2;
      if (!(dP > 0)) return { rows: [], notes: [['Back pressure must be below the relieving pressure.', 'bad']] };
      var A = 11.78 * Ql / (v.Kd * v.Kw * +v.Kc) * Math.sqrt(v.G / dP), Kv = 1, R = Infinity;
      for (var i = 0; i < 30; i++) { R = Ql * 18800 * v.G / (v.mu * Math.sqrt(A)); var kv = 1 / (0.9935 + 2.878 / Math.sqrt(R) + 342.75 / Math.pow(R, 1.5)); kv = Math.min(1, kv); var An = 11.78 * Ql / (v.Kd * v.Kw * +v.Kc * kv) * Math.sqrt(v.G / dP); if (Math.abs(An - A) < 1e-6 * A) { A = An; Kv = kv; break; } A = An; Kv = kv; }
      var notes = [['Area = 11.78 Q / (K<sub>d</sub> K<sub>w</sub> K<sub>c</sub> K<sub>v</sub>) &radic;(G / &Delta;P), Q in L/min and pressures in kPa; K<sub>v</sub> is iterated from the Reynolds number R = 18,800 Q G / (&mu; &radic;A).', 'lead']];
      if (Kv < 0.97) notes.push(['Viscous liquid: K<sub>v</sub> = ' + F(Kv, 3) + ' increases the area by ' + F(100 * (1 / Kv - 1), 0) + ' %.', 'warn']);
      if (v.op < 10) notes.push(['Certified liquid valves are rated at 10 % overpressure; check with the vendor below that.', 'warn']);
      return { rows: oriRows(A).concat([['Differential pressure', F(dP, 0), 'kPa'], ['Viscosity correction Kv', F(Kv, 3), ''], ['Reynolds number R', G(R, 3), '']]), notes: notes, tables: [oriTable()] };
    },
    refs: [REF520, REF526]
  });

  /* ---------- fire case, wetted vessel ---------- */
  K.add('fire-wetted', {
    title: 'Fire case: relief load of a vessel containing liquid (API 521)',
    sub: 'Wetted area, heat input and the vapour relief rate to size the valve',
    inputs: [
      { k: 'orient', label: 'Vessel', type: 'sel', v: 'v', opts: [['v', 'Vertical, dished bottom'], ['h', 'Horizontal, dished ends']] },
      { k: 'D', label: 'Inside diameter', unit: 'm', v: 1.8 },
      { k: 'L', label: 'Straight side (tangent to tangent) length', unit: 'm', v: 2.4 },
      { k: 'lvl', label: 'Liquid level (from the bottom of the vessel)', unit: 'm', v: 2.2, help: 'Normal high liquid level; for a horizontal vessel, depth of liquid' },
      { k: 'elev', label: 'Height of the vessel bottom above grade (fire source)', unit: 'm', v: 1.5 },
      { k: 'drain', label: 'Drainage and firefighting', type: 'sel', v: 'y', opts: [['y', 'Adequate drainage and prompt firefighting'], ['n', 'Not adequate']] },
      { k: 'Fe', label: 'Environment factor F', v: 1, help: '1.0 bare vessel; 0.03 earth-covered storage; less than 1 only for fire-proof insulation meeting API 521 (enter your calculated F)' },
      { k: 'lam', label: 'Latent heat at relieving conditions', unit: 'kcal/kg', v: 263, help: 'From the solvent pages; methanol about 263, toluene 86, water 539' }
    ],
    example: { v: { orient: 'v', D: 2.0, L: 3.0, lvl: 2.5, elev: 1.2, drain: 'y', Fe: 1, lam: 86 } },
    run: function (v) {
      var D = v.D, R = D / 2, lim = Math.max(0, 7.6 - v.elev), Aw, hd = 0.25 * D; // 2:1 head depth
      if (v.orient === 'v') {
        var wetH = Math.min(v.lvl, lim);
        var headA = 1.084 * D * D; // 2:1 elliptical head inside area
        var inHead = Math.min(wetH, hd) / hd, shellH = Math.max(0, Math.min(wetH, hd + v.L) - hd);
        Aw = headA * inHead + Math.PI * D * shellH;
      } else {
        var h = Math.min(v.lvl, lim, D), th = 2 * Math.acos(1 - 2 * h / D), frac = th / (2 * Math.PI);
        Aw = frac * (Math.PI * D * v.L + 2 * 1.084 * D * D);
      }
      var C1 = v.drain === 'y' ? 43200 : 70900, Q = C1 * v.Fe * Math.pow(Aw, 0.82), W = Q * 3600 / (v.lam * 4186.8);
      var notes = [['Q = ' + (v.drain === 'y' ? '43,200' : '70,900') + ' F A<sub>w</sub><sup>0.82</sup> (W, m²). Relief rate = Q / latent heat. Size the valve with the gas/vapour calculator at 21 % overpressure.', 'lead']];
      if (v.elev >= 7.6) notes.push(['The whole vessel is more than 7.6 m above grade: API 521 normally takes no wetted area above this height.', 'warn']);
      notes.push(['Wetted area is approximate: 2:1 elliptical heads, liquid up to the level you entered and no higher than 7.6 m above grade. Include the wetted area of attached piping if significant.']);
      return { rows: [['Relief load (vapour)', F(W, 0), 'kg/h'], ['Heat input', F(Q / 1000, 1), 'kW (' + F(Q / 1.163, 0) + ' kcal/h)'], ['Wetted area', F(Aw, 2), 'm²'], ['Height limit used', F(lim, 2), 'm above vessel bottom']], notes: notes };
    },
    refs: [REF521, 'ASME Section VIII Division 1: 21 % overpressure allowed for the fire case.']
  });

  /* ---------- fire case, gas-filled vessel ---------- */
  K.add('fire-gas', {
    title: 'Fire case: gas-filled (unwetted) vessel (API 521)',
    sub: 'Relief rate from the heated wall of a vessel holding only gas or vapour',
    inputs: [
      { k: 'A', label: 'Exposed surface area of the vessel', unit: 'm²', v: 20 },
      { k: 'ps', label: 'Set pressure', unit: 'barg', v: 10 },
      { k: 'op', label: 'Allowable overpressure', unit: '%', v: 21 },
      { k: 'tn', label: 'Normal operating temperature', unit: '°C', v: 30 },
      { k: 'pn', label: 'Normal operating pressure', unit: 'barg', v: 8 },
      { k: 'tw', label: 'Vessel wall temperature', unit: '°C', v: 593, help: '593 °C (1,100 °F) is the usual value for carbon steel' },
      { k: 'M', label: 'Molecular weight', unit: 'kg/kmol', v: 28.01 },
      { k: 'k', label: 'k = cp/cv', v: 1.4 }, { k: 'Z', label: 'Compressibility Z', v: 1 },
      { k: 'Kd', label: 'Discharge coefficient Kd', v: 0.975 }
    ],
    example: { v: { A: 12, ps: 7, op: 21, tn: 35, pn: 6, tw: 593, M: 28.96, k: 1.4, Z: 1, Kd: 0.975 } },
    run: function (v) {
      var P1k = v.ps * (1 + v.op / 100) * 100 + PATM, Pnk = v.pn * 100 + PATM, Tn = v.tn + 273.15, T1 = Pnk > 0 ? P1k / Pnk * Tn : NaN;
      var Tw = v.tw + 273.15;
      if (!(Tw > T1)) return { rows: [], notes: [['The relieving temperature is above the wall temperature: no fire relief from this equation.', 'bad']] };
      /* W (lb/h) = 0.1406 sqrt(M P1) A' (Tw - T1)^1.25 / T1^1.1506, P1 psia, A' ft2, T in degR */
      var P1psia = P1k / 6.894757, Aft = v.A * 10.7639, T1R = T1 * 1.8, TwR = Tw * 1.8;
      var Wlb = 0.1406 * Math.sqrt(v.M * P1psia) * Aft * Math.pow(TwR - T1R, 1.25) / Math.pow(T1R, 1.1506), W = Wlb * 0.45359237;
      var A = gasArea(W, P1k, PATM, T1, v.M, v.k, v.Z, v.Kd, 1, 1).A;
      return { rows: [['Relief load', F(W, 0), 'kg/h']].concat(oriRows(A)).concat([['Relieving temperature T1 = (P1/Pn) Tn', F(T1 - 273.15, 0), '°C'], ['Relieving pressure P1', F(P1k, 0), 'kPa abs']]),
        notes: [['W = 0.1406 &radic;(M P<sub>1</sub>) A&prime; (T<sub>w</sub> − T<sub>1</sub>)<sup>1.25</sup> / T<sub>1</sub><sup>1.1506</sup> (US units), then the gas equation in critical flow.', 'lead'],
          ['Gas-filled vessels can fail from wall overheating before the valve lifts; API 521 recommends considering depressuring, water spray or fire-proofing as well.', 'warn']], tables: [oriTable()] };
    },
    refs: [REF521, 'Gas-filled vessel relief equation as given in Moncalvo D. et al., “On the Adequacy of API 521 Relief-Valve Sizing Method for Gas-Filled Pressure Vessels Exposed to Fire”, <i>Safety</i> 4 (2018) 11, eq. 1–3.', REF520, REF526]
  });

  /* ---------- thermal expansion of blocked-in liquid ---------- */
  K.add('thermal-relief', {
    title: 'Thermal relief of blocked-in liquid',
    sub: 'Liquid trapped between closed valves and heated by sun, tracing or a hot fluid',
    inputs: [
      { k: 'phi', label: 'Heat input to the trapped liquid', unit: 'kcal/h', v: 2000, help: 'Solar heating, steam tracing or exchanger duty on the blocked side' },
      { k: 'beta', label: 'Cubic expansion coefficient of the liquid', unit: '1/°C', v: 0.00108, help: 'Toluene 0.00108, methanol 0.00119, water about 0.0002 at 20 °C' },
      { k: 'rho', label: 'Liquid density', unit: 'kg/m³', v: 867 },
      { k: 'cp', label: 'Liquid specific heat', unit: 'kcal/kg·°C', v: 0.41 }
    ],
    example: { v: { phi: 15000, beta: 0.00119, rho: 792, cp: 0.6 } },
    run: function (v) {
      var q = v.beta * v.phi / (v.rho * v.cp); // m3/h
      return { rows: [['Relief flow', G(q * 1000 / 60, 3), 'L/min'], ['Relief flow', G(q, 3), 'm³/h']],
        notes: [['Flow = &beta; &Phi; / (&rho; c<sub>p</sub>): the volume the liquid expands by while it is heated.', 'lead'],
          ['The flow is tiny, so a small valve is normally enough; thermal relief valves are commonly NPS ¾ × 1. Make sure the relief goes somewhere safe (back to the process or a closed drain).']] };
    },
    refs: ['API Standard 521, thermal expansion of blocked-in liquids: q = &alpha;&Phi;/(500 G c) in US units, the same physical balance used here in SI.']
  });

  if (typeof module !== 'undefined' && module.exports) module.exports = { gasArea: gasArea, C_of: C_of, orifice: orifice };
})();
