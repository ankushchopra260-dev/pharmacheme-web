/* Control valve sizing (ANSI/ISA-75.01.01 = IEC 60534-2-1, turbulent flow, valve the same size as the line, Fp = 1) and restriction orifice sizing.
   Needs pce-kit.js; steam density from if97.js when present. */
(function () {
  'use strict';
  var K = PCEKit, F = K.F, G = K.G;
  var REF = 'ANSI/ISA-75.01.01 (IEC 60534-2-1), <i>Flow Equations for Sizing Control Valves</i>: turbulent liquid and gas equations, choked flow, expansion factor Y = 1 − x/(3 F<sub>γ</sub> x<sub>T</sub>), F<sub>F</sub> = 0.96 − 0.28 &radic;(p<sub>v</sub>/p<sub>c</sub>); numerical constants N<sub>1</sub> = 0.865 (C<sub>v</sub>, m³/h, bar) and N<sub>6</sub> = 27.3 (C<sub>v</sub>, kg/h, bar, kg/m³).';
  var STYLES = [['own', 'Enter FL and xT from the valve vendor'], ['g3v', 'Globe, single port, 3 V-port plug (FL 0.90, xT 0.70)'], ['ball', 'Ball valve, full bore, 70° (FL 0.74, xT 0.42)'], ['bfly', 'Butterfly, swing-through, 60° (FL 0.70, xT 0.42)']];
  var SV = { g3v: [0.9, 0.7], ball: [0.74, 0.42], bfly: [0.7, 0.42] };
  var styleIn = function (show) { return [
    { k: 'st', label: 'Valve style', type: 'sel', v: 'g3v', opts: STYLES, show: show },
    { k: 'FL', label: 'Liquid pressure recovery factor FL', v: 0.9, show: show },
    { k: 'xT', label: 'Pressure differential ratio factor xT', v: 0.7, show: show }]; };
  var onStyle = function (k, val) { if (k === 'st' && SV[val]) return { FL: SV[val][0], xT: SV[val][1] }; };
  var cvRows = function (Cv, rated) {
    var r = [['Required Cv', G(Cv, 3), 'US gal/min at 1 psi'], ['Required Kv', G(Cv / 1.156, 3), 'm³/h at 1 bar']];
    if (rated > 0) r.push(['Share of the rated Cv', F(100 * Cv / rated, 0), '% (read the opening from the valve characteristic)']);
    return r;
  };

  K.add('cv-liquid', {
    title: 'Control valve Cv for a liquid',
    sub: 'Turbulent flow with the choked-flow (flashing and cavitation) limit',
    inputs: [
      { k: 'Q', label: 'Flow', unit: 'm³/h', v: 25 }, { k: 'rho', label: 'Density', unit: 'kg/m³', v: 870 },
      { k: 'p1', label: 'Upstream pressure', unit: 'barg', v: 6 }, { k: 'p2', label: 'Downstream pressure', unit: 'barg', v: 3.5 },
      { k: 'pv', label: 'Vapour pressure at inlet temperature', unit: 'bar abs', v: 0.04 }, { k: 'pc', label: 'Critical pressure of the liquid', unit: 'bar abs', v: 41.1, help: 'Water 220.6, methanol 81.0, toluene 41.1, acetone 47.0' },
      { k: 'rated', label: 'Rated Cv of the chosen valve (optional)', v: 0, optional: true }
    ].concat(styleIn()),
    onSel: onStyle,
    example: { v: { Q: 40, rho: 998, p1: 8, p2: 2, pv: 0.3, pc: 220.6, rated: 75, st: 'g3v', FL: 0.9, xT: 0.7 } },
    run: function (v) {
      var P1 = v.p1 + 1.01325, P2 = v.p2 + 1.01325, dp = P1 - P2;
      if (!(dp > 0) || !(v.pc > v.pv)) return { rows: [], notes: [['Downstream pressure must be below upstream, and critical pressure above vapour pressure.', 'bad']] };
      var FF = 0.96 - 0.28 * Math.sqrt(v.pv / v.pc), dpch = v.FL * v.FL * (P1 - FF * v.pv), dps = Math.min(dp, dpch);
      var Cv = v.Q / 0.865 * Math.sqrt((v.rho / 999.1) / dps), choked = dp >= dpch;
      var notes = [['C<sub>v</sub> = (Q / N<sub>1</sub>) &radic;((&rho;/&rho;<sub>0</sub>) / &Delta;p<sub>sizing</sub>), &Delta;p<sub>sizing</sub> = smaller of &Delta;p and F<sub>L</sub>² (p<sub>1</sub> − F<sub>F</sub> p<sub>v</sub>)', 'lead']];
      if (choked) notes.push([P2 < v.pv ? 'Flashing: outlet pressure is below the vapour pressure, so vapour leaves the valve. Expect erosion; consider hardened trim or a different valve style.' : 'Choked flow: the pressure drop exceeds the choked limit, so the valve is cavitating. Flow will not rise with more pressure drop; use anti-cavitation trim, split the drop, or a valve with higher FL.', 'bad']);
      else if (dp > 0.7 * dpch) notes.push(['Pressure drop is above 70 % of the choked limit: incipient cavitation and noise are likely. Ask the vendor for the cavitation index of the trim.', 'warn']);
      return { rows: cvRows(Cv, v.rated).concat([['Pressure drop used for sizing', F(dps, 3), 'bar'], ['Choked pressure drop', F(dpch, 3), 'bar'], ['FF', F(FF, 3), '']]), notes: notes };
    },
    refs: [REF, 'Typical FL and xT values: ISA-75.01.01 Table D.2 (typical values; use the manufacturer’s data for the final selection).']
  });

  K.add('cv-gas', {
    title: 'Control valve Cv for a gas or steam',
    sub: 'Expansion factor and choked flow; density from the gas law, or from the steam tables for steam',
    inputs: [
      { k: 'fl', label: 'Fluid', type: 'sel', v: 'gas', opts: [['gas', 'Gas (enter molecular weight)'], ['steam', 'Steam (saturated or superheated)']] },
      { k: 'W', label: 'Mass flow', unit: 'kg/h', v: 1500 },
      { k: 'p1', label: 'Upstream pressure', unit: 'barg', v: 7 }, { k: 'p2', label: 'Downstream pressure', unit: 'barg', v: 3 },
      { k: 't', label: 'Upstream temperature', unit: '°C', v: 35, help: 'For saturated steam enter the saturation temperature or leave a value below it' },
      { k: 'M', label: 'Molecular weight', unit: 'kg/kmol', v: 28.96, show: function (v) { return v.fl === 'gas'; } },
      { k: 'k', label: 'Ratio of specific heats, γ = cp/cv', v: 1.4, help: 'Air and N2 1.40, CO2 1.29, steam about 1.3' },
      { k: 'Z', label: 'Compressibility Z', v: 1, show: function (v) { return v.fl === 'gas'; } },
      { k: 'rated', label: 'Rated Cv of the chosen valve (optional)', v: 0, optional: true }
    ].concat(styleIn()),
    onSel: function (k, val, v) { if (k === 'fl') return val === 'steam' ? { k: 1.3, t: 180 } : { k: 1.4, t: 35 }; return onStyle(k, val); },
    example: { v: { fl: 'steam', W: 3000, p1: 10, p2: 3, t: 184.1, k: 1.3, rated: 100, st: 'g3v', FL: 0.9, xT: 0.7 } },
    run: function (v) {
      var P1 = v.p1 + 1.01325, P2 = v.p2 + 1.01325, x = (P1 - P2) / P1, rho;
      if (!(x > 0)) return { rows: [], notes: [['Downstream pressure must be below upstream.', 'bad']] };
      var note = [];
      if (v.fl === 'steam') {
        if (!window.IF97) return { rows: [], notes: [['Steam tables not loaded.', 'bad']] };
        var ts = IF97.tsat(P1 / 10) - 273.15, T = Math.max(v.t, ts + 0.01), s = IF97.pt(T + 273.15, P1 / 10);
        if (!s) return { rows: [], notes: [['Outside the steam table range.', 'bad']] };
        rho = 1 / (s.region === 2 ? s.v : IF97.region2(T + 273.15, P1 / 10).v);
        if (v.t <= ts + 0.5) note.push(['Taken as dry saturated steam at ' + F(ts, 1) + ' °C.']);
      } else rho = P1 * 1e5 * v.M / (v.Z * 8314.462618 * (v.t + 273.15));
      var Fg = v.k / 1.4, xch = Fg * v.xT, xs = Math.min(x, xch), Y = 1 - xs / (3 * Fg * v.xT);
      var Cv = v.W / (27.3 * Y * Math.sqrt(xs * P1 * rho)), choked = x >= xch;
      var notes = [['C<sub>v</sub> = W / (N<sub>6</sub> Y &radic;(x p<sub>1</sub> &rho;<sub>1</sub>)), x = &Delta;p/p<sub>1</sub> limited to F<sub>γ</sub> x<sub>T</sub>', 'lead']].concat(note);
      if (choked) notes.push(['Choked flow: the pressure ratio is beyond the choked limit, so flow depends only on upstream conditions. Expect high outlet velocity and noise; check outlet velocity and noise with the vendor.', 'warn']);
      return { rows: cvRows(Cv, v.rated).concat([['Upstream density', G(rho, 4), 'kg/m³'], ['Pressure drop ratio x', F(x, 3), choked ? 'choked' : ''], ['Choked ratio Fγ·xT', F(xch, 3), ''], ['Expansion factor Y', F(Y, 3), '']]), notes: notes };
    },
    refs: [REF, 'Typical FL and xT values: ISA-75.01.01 Table D.2.', 'Steam density: IAPWS-IF97.']
  });

  /* Restriction orifice: thin square-edged plate. Permanent pressure loss related to the differential by ISO 5167-2. */
  function permRatio(beta, C) { var a = Math.sqrt(1 - Math.pow(beta, 4) * (1 - C * C)), b = C * beta * beta; return (a - b) / (a + b); }
  K.add('ro-liquid', {
    title: 'Restriction orifice for a liquid',
    sub: 'Bore diameter of a single-hole plate that takes a fixed pressure drop at a given flow',
    inputs: [
      { k: 'Q', label: 'Flow', unit: 'm³/h', v: 5 }, { k: 'rho', label: 'Density', unit: 'kg/m³', v: 998 },
      { k: 'dp', label: 'Pressure drop to take across the orifice (permanent)', unit: 'bar', v: 3 },
      { k: 'D', label: 'Pipe inside diameter', unit: 'mm', v: 52.5 },
      { k: 'C', label: 'Discharge coefficient C', v: 0.61, help: 'About 0.6 for a sharp-edged plate at high Reynolds number' },
      { k: 'p1', label: 'Upstream pressure (to check cavitation)', unit: 'barg', v: 5 }, { k: 'pv', label: 'Vapour pressure', unit: 'bar abs', v: 0.03 }
    ],
    example: { v: { Q: 3, rho: 998, dp: 6, D: 26.6, C: 0.61, p1: 8, pv: 0.05 } },
    run: function (v) {
      var D = v.D / 1000, Qs = v.Q / 3600, lo = 0.05, hi = 0.8, beta, d, dpd;
      for (var i = 0; i < 80; i++) {
        beta = (lo + hi) / 2; d = beta * D;
        var r = permRatio(beta, v.C); dpd = v.dp * 1e5 / r; // differential at the taps
        var q = v.C / Math.sqrt(1 - Math.pow(beta, 4)) * Math.PI * d * d / 4 * Math.sqrt(2 * dpd / v.rho);
        if (q > Qs) hi = beta; else lo = beta;
      }
      var notes = [['Q = C / &radic;(1 − &beta;⁴) · (&pi;d²/4) · &radic;(2&Delta;p/&rho;), with the permanent loss related to the tap differential by ISO 5167-2.', 'lead']];
      if (beta > 0.75 || beta < 0.1) notes.push(['&beta; outside 0.1 to 0.75: accuracy falls; consider a different line size or a multi-hole or multi-stage orifice.', 'warn']);
      var P1 = v.p1 + 1.01325;
      if (v.dp > 0.5 * (P1 - v.pv)) notes.push(['The drop is more than half of (P1 − Pv): a single plate is likely to cavitate. Use a multi-stage restriction orifice and check with the vendor.', 'warn']);
      return { rows: [['Bore diameter', F(d * 1000, 2), 'mm'], ['Beta ratio d/D', F(beta, 3), ''], ['Differential at the taps', F(dpd / 1e5, 3), 'bar'], ['Velocity in the bore', F(Qs / (Math.PI * d * d / 4), 1), 'm/s']], notes: notes };
    },
    refs: ['ISO 5167-2:2003, <i>Measurement of fluid flow by means of pressure differential devices — Orifice plates</i>: flow equation and pressure loss relation.', 'Crane Technical Paper 410, <i>Flow of Fluids through Valves, Fittings and Pipe</i>.']
  });

  K.add('ro-gas', {
    title: 'Restriction orifice for a gas',
    sub: 'Single-hole plate; checks whether the flow is choked (critical)',
    inputs: [
      { k: 'W', label: 'Mass flow', unit: 'kg/h', v: 50 }, { k: 'p1', label: 'Upstream pressure', unit: 'barg', v: 6 }, { k: 'p2', label: 'Downstream pressure', unit: 'barg', v: 0.1 },
      { k: 't', label: 'Upstream temperature', unit: '°C', v: 30 }, { k: 'M', label: 'Molecular weight', unit: 'kg/kmol', v: 28.01 }, { k: 'k', label: 'k = cp/cv', v: 1.4 }, { k: 'Z', label: 'Z', v: 1 },
      { k: 'C', label: 'Discharge coefficient C', v: 0.61, help: 'Sharp-edged plate; use the vendor value for the final design' }
    ],
    example: { v: { W: 30, p1: 4, p2: 0.05, t: 25, M: 28.01, k: 1.4, Z: 1, C: 0.61 } },
    run: function (v) {
      var P1 = (v.p1 + 1.01325) * 1e5, P2 = (v.p2 + 1.01325) * 1e5, T = v.t + 273.15, Rg = 8314.462618, rho1 = P1 * v.M / (v.Z * Rg * T), w = v.W / 3600;
      var rc = Math.pow(2 / (v.k + 1), v.k / (v.k - 1)), choked = P2 / P1 <= rc, A;
      if (choked) A = w / (v.C * P1 * Math.sqrt(v.k * v.M / (v.Z * Rg * T) * Math.pow(2 / (v.k + 1), (v.k + 1) / (v.k - 1))));
      else { var r = P2 / P1, flux = Math.sqrt(2 * rho1 * P1 * (v.k / (v.k - 1)) * (Math.pow(r, 2 / v.k) - Math.pow(r, (v.k + 1) / v.k))); A = w / (v.C * flux); }
      var d = Math.sqrt(4 * A / Math.PI);
      return { rows: [['Bore diameter', F(d * 1000, 2), 'mm'], ['Flow', choked ? 'Choked (critical)' : 'Subcritical', ''], ['Critical pressure ratio', F(rc, 3), 'P2/P1 = ' + F(P2 / P1, 3)], ['Upstream density', G(rho1, 4), 'kg/m³']],
        notes: [['Isentropic nozzle flow through the bore with discharge coefficient C (approach velocity neglected). Choked when P2/P1 ≤ (2/(k+1))<sup>k/(k−1)</sup>.', 'lead'],
          [choked ? 'Choked: flow is fixed by upstream pressure and the bore, which makes a restriction orifice a good flow limiter (for example, nitrogen to a blanketing header).' : 'Not choked: the flow will change with downstream pressure.', choked ? 'good' : 'warn']] };
    },
    refs: ['Isentropic flow of an ideal gas through a restriction (Perry’s Chemical Engineers’ Handbook, fluid dynamics section; Crane TP-410).']
  });
})();
