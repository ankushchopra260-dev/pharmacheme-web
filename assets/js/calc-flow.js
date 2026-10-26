/* Liquid line pressure drop with fittings (Darby 3-K) and pump NPSH available. Needs pce-kit.js; loads solvent-lite.json. */
(function () {
  'use strict';
  var K = PCEKit, F = K.F, G = K.G, g = 9.80665;
  var me = document.currentScript, DATA = me ? me.getAttribute('data-sol') : null;
  /* ASME B36.10M / B36.19M: NB (mm), OD (mm), wall Sch 10S, 40, 80 (mm) */
  var PIPE = [[15, 21.3, 2.11, 2.77, 3.73], [20, 26.7, 2.11, 2.87, 3.91], [25, 33.4, 2.77, 3.38, 4.55], [32, 42.2, 2.77, 3.56, 4.85], [40, 48.3, 2.77, 3.68, 5.08], [50, 60.3, 2.77, 3.91, 5.54],
    [65, 73.0, 3.05, 5.16, 7.01], [80, 88.9, 3.05, 5.49, 7.62], [100, 114.3, 3.05, 6.02, 8.56], [125, 141.3, 3.40, 6.55, 9.53], [150, 168.3, 3.40, 7.11, 10.97], [200, 219.1, 3.76, 8.18, 12.70],
    [250, 273.0, 4.19, 9.27, 15.09], [300, 323.8, 4.57, 10.31, 17.48], [350, 355.6, 4.78, 11.13, 19.05], [400, 406.4, 4.78, 12.70, 21.44], [450, 457.0, 4.78, 14.27, 23.83], [500, 508.0, 5.54, 15.09, 26.19], [600, 610.0, 6.35, 17.48, 30.96]];
  var INCH = { 15: '½"', 20: '¾"', 25: '1"', 32: '1¼"', 40: '1½"', 50: '2"', 65: '2½"', 80: '3"', 100: '4"', 125: '5"', 150: '6"', 200: '8"', 250: '10"', 300: '12"', 350: '14"', 400: '16"', 450: '18"', 500: '20"', 600: '24"' };
  var SCH = { s10: 2, s40: 3, s80: 4 };
  var ROUGH = [['cs', 'Carbon steel, new (0.045 mm)', 0.045], ['csold', 'Carbon steel, used (0.15 mm)', 0.15], ['ss', 'Stainless steel (0.015 mm)', 0.015], ['plastic', 'Plastic / PTFE-lined (0.0015 mm)', 0.0015], ['gi', 'Galvanised iron (0.15 mm)', 0.15]];
  /* Darby 3-K coefficients: K = K1/Re + Kinf (1 + Kd / Dn^0.3), Dn = nominal diameter in inches */
  var K3 = [
    ['e90lr', '90° elbow, welded/flanged, long radius (R/D = 1.5 to 2)', 800, 0.056, 3.9], ['e90s', '90° elbow, welded/flanged, standard (R/D = 1)', 800, 0.091, 4.0],
    ['e90t', '90° elbow, threaded, standard', 800, 0.14, 4.0], ['e45', '45° elbow, threaded, standard', 500, 0.071, 4.2], ['b180', '180° return bend (R/D = 1.5)', 1000, 0.1, 4.0],
    ['teeb', 'Tee, flow through the branch (flanged)', 800, 0.28, 4.0], ['teer', 'Tee, flow straight through the run (flanged)', 150, 0.05, 4.0],
    ['gate', 'Gate valve, open', 300, 0.037, 3.9], ['ball', 'Ball valve, full bore, open', 300, 0.017, 3.5], ['plug', 'Plug valve, straight through', 300, 0.084, 3.9],
    ['globe', 'Globe valve, open', 1500, 1.7, 3.6], ['angle', 'Angle valve 90°, open', 1000, 0.69, 4.0], ['diaph', 'Diaphragm valve (dam type)', 1000, 0.69, 4.9],
    ['swing', 'Swing check valve', 1500, 0.46, 4.0], ['lift', 'Lift check valve', 2000, 2.85, 3.8]];
  var SOL = [];
  function churchill(Re, eD) {
    var A = Math.pow(2.457 * Math.log(1 / (Math.pow(7 / Re, 0.9) + 0.27 * eD)), 16), B = Math.pow(37530 / Re, 16);
    return 8 * Math.pow(Math.pow(8 / Re, 12) + Math.pow(A + B, -1.5), 1 / 12);
  }
  function pipeID(nb, s) { var r = PIPE.filter(function (p) { return p[0] === +nb; })[0]; return r ? (r[1] - 2 * r[SCH[s]]) / 1000 : NaN; }
  function solOpts() { return [['own', 'Enter density and viscosity']].concat(SOL.map(function (s) { return [s.s, s.n]; })); }
  function fill(slug) { var s = SOL.filter(function (x) { return x.s === slug; })[0]; return s ? { rho: s.rho, mu: s.mu } : null; }
  function antoineP(s, T) { return Math.pow(10, s.a[0] - s.a[1] / (s.a[2] + T)); } // mmHg

  function register() {
    var fitInputs = [{ k: 'h_fit', type: 'head', label: 'Fittings and valves (number of each)' }].concat(K3.map(function (f) { return { k: 'n_' + f[0], label: f[1], v: f[0] === 'e90lr' ? 4 : f[0] === 'ball' ? 2 : 0, step: 1 }; }));
    K.add('pipe-dp', {
      title: 'Pressure drop in a liquid line',
      sub: 'Pipe friction (Darcy–Weisbach, Churchill) plus fittings and valves by the Darby 3-K method, entrance, exit and elevation',
      inputs: [
        { k: 'fluid', label: 'Liquid', type: 'sel', v: 'water', opts: solOpts() },
        { k: 'rho', label: 'Density', unit: 'kg/m³', v: 998 }, { k: 'mu', label: 'Viscosity', unit: 'cP', v: 0.89 },
        { k: 'q', label: 'Flow', unit: 'm³/h', v: 10 },
        { k: 'nb', label: 'Pipe size', type: 'sel', v: '50', opts: PIPE.map(function (p) { return [String(p[0]), p[0] + ' NB (' + INCH[p[0]] + ')']; }) },
        { k: 'sch', label: 'Schedule', type: 'sel', v: 's40', opts: [['s10', 'Sch 10S'], ['s40', 'Sch 40'], ['s80', 'Sch 80']] },
        { k: 'mat', label: 'Pipe material', type: 'sel', v: 'ss', opts: ROUGH.map(function (r) { return [r[0], r[1]]; }) },
        { k: 'L', label: 'Straight pipe length', unit: 'm', v: 50 },
        { k: 'dz', label: 'Outlet higher than inlet by', unit: 'm', v: 5, help: 'Negative if the outlet is lower' },
        { k: 'ent', label: 'Entrances from a tank (sharp-edged, K = 0.5)', v: 1, step: 1 },
        { k: 'ext', label: 'Exits into a tank (K = 1.0)', v: 1, step: 1 }
      ].concat(fitInputs).concat([
        { k: 'kx', label: 'Other resistance, sum of K (optional)', v: 0 },
        { k: 'dpx', label: 'Fixed pressure drops: control valve, filter, exchanger (optional)', unit: 'bar', v: 0 }
      ]),
      onSel: function (k, val) { if (k === 'fluid' && val !== 'own') return fill(val); },
      example: { v: { fluid: 'toluene', rho: 867, mu: 0.56, q: 15, nb: '50', sch: 's10', mat: 'ss', L: 80, dz: 12, ent: 1, ext: 1, n_e90lr: 8, n_ball: 3, n_teer: 2, n_swing: 1, kx: 0, dpx: 0 } },
      run: function (v) {
        var D = pipeID(v.nb, v.sch), A = Math.PI * D * D / 4, u = v.q / 3600 / A, rho = v.rho, mu = v.mu / 1000;
        if (!(D > 0 && u > 0 && rho > 0 && mu > 0)) return { rows: [], notes: [['Flow, density and viscosity must be above zero.', 'bad']] };
        var Re = rho * u * D / mu, eD = ROUGH.filter(function (r) { return r[0] === v.mat; })[0][2] / 1000 / D, f = churchill(Re, eD), dyn = rho * u * u / 2;
        var dpPipe = f * v.L / D * dyn, Dn = D / 0.0254, Kfit = 0, rows = [];
        K3.forEach(function (x) { var n = v['n_' + x[0]] || 0; if (n > 0) { var k1 = x[2] / Re + x[3] * (1 + x[4] / Math.pow(Dn, 0.3)); Kfit += n * k1; rows.push([x[1], String(n), G(k1, 3), G(n * k1, 3), F(n * k1 * dyn / 1e5, 4)]); } });
        var Ke = 0.5 * (v.ent || 0) + 1.0 * (v.ext || 0) + (v.kx || 0), Ktot = Kfit + Ke;
        if (Ke) rows.push(['Entrances, exits and other K', '', '', G(Ke, 3), F(Ke * dyn / 1e5, 4)]);
        var dpFit = Ktot * dyn, dpZ = rho * g * v.dz, dpTot = dpPipe + dpFit + dpZ + (v.dpx || 0) * 1e5;
        var notes = [], reg = Re < 2100 ? 'laminar' : Re < 4000 ? 'transitional' : 'turbulent';
        if (u > 3) notes.push(['Velocity above 3 m/s: high pressure drop, noise and erosion. Check the next pipe size up.', 'warn']);
        if (u < 0.6 && Re > 2100) notes.push(['Velocity below about 0.6 m/s: solids can settle and the line is probably larger than needed.', 'warn']);
        if (reg === 'transitional') notes.push(['Transitional flow (Re 2,100 to 4,000): friction factor is uncertain here.', 'warn']);
        notes.push(['Fittings use the Darby 3-K method, which accounts for pipe size and Reynolds number, so small lines are not under-estimated as they are with a single K value.']);
        return { rows: [['Total pressure drop', F(dpTot / 1e5, 3), 'bar (' + F(dpTot / (rho * g), 2) + ' m of liquid)'],
          ['Pipe friction', F(dpPipe / 1e5, 3), 'bar'], ['Fittings, valves, entrance, exit', F(dpFit / 1e5, 3), 'bar'], ['Elevation', F(dpZ / 1e5, 3), 'bar'], ['Fixed drops', F(v.dpx || 0, 3), 'bar'],
          ['Velocity', F(u, 2), 'm/s'], ['Inside diameter', F(D * 1000, 1), 'mm'], ['Reynolds number', G(Re, 3), reg], ['Darcy friction factor', G(f, 4), ''],
          ['Pressure drop per 100 m of pipe', F(f * 100 / D * dyn / 1e5, 3), 'bar'], ['Equivalent length of fittings', F(Ktot * D / f, 1), 'm']],
          tables: rows.length ? [{ title: 'Fittings and valves', head: ['Item', 'Number', 'K each', 'K total', 'ΔP bar'], rows: rows }] : [], notes: notes };
      },
      refs: ['Darby R., “Correlate pressure drops through fittings”, <i>Chemical Engineering</i>, July 1999, 101–104; coefficients as tabulated by <a href="https://neutrium.net/articles/fluid-flow/pressure-loss-from-fittings-3k-method/" rel="noopener">Neutrium</a>.',
        'Churchill S.W., “Friction-factor equation spans all fluid-flow regimes”, <i>Chemical Engineering</i>, 7 November 1977, 91–92 (Darcy friction factor).',
        'Pipe dimensions: ASME B36.10M (carbon steel) and B36.19M (stainless steel). Roughness and entrance/exit K: Crane Technical Paper 410.']
    });

    K.add('npsh', {
      title: 'Pump NPSH available',
      sub: 'Net positive suction head available from the suction vessel pressure, liquid level, vapour pressure and suction line loss',
      inputs: [
        { k: 'fluid', label: 'Liquid', type: 'sel', v: 'water', opts: solOpts() },
        { k: 't', label: 'Liquid temperature', unit: '°C', v: 40 },
        { k: 'rho', label: 'Density', unit: 'kg/m³', v: 998, help: 'Filled from the solvent page (20 °C); correct it for hot liquids' },
        { k: 'pv', label: 'Vapour pressure at this temperature', unit: 'mmHg abs', v: 55, help: 'Filled from the Antoine constants for the chosen liquid' },
        { k: 'p', label: 'Pressure in the suction vessel', v: 0 }, { k: 'u', label: 'Pressure unit', type: 'sel', v: 'barg', opts: K.pOpts(['barg', 'bara', 'kscg', 'mmhga', 'mbara', 'kpaa']) },
        { k: 'z', label: 'Liquid level above the pump inlet (centre line)', unit: 'm', v: 2, help: 'Use the lowest operating level; negative for a suction lift' },
        { k: 'hf', label: 'Suction line pressure drop at design flow', unit: 'bar', v: 0.05, help: 'From the pressure drop calculator above' },
        { k: 'npshr', label: 'NPSH required by the pump (from its curve)', unit: 'm', v: 3 }
      ],
      onSel: function (k, val, v) { if (k === 'fluid' && val !== 'own') { var s = SOL.filter(function (x) { return x.s === val; })[0]; if (s) return { rho: s.rho, pv: +antoineP(s, v.t).toPrecision(4) }; } },
      example: { v: { fluid: 'methanol', t: 30, rho: 792, pv: 164, p: 300, u: 'mmhga', z: 2.5, hf: 0.03, npshr: 2.5 } },
      run: function (v) {
        var s = SOL.filter(function (x) { return x.s === v.fluid; })[0], pv = v.pv, note = [];
        if (s) { var pa = antoineP(s, v.t); if (Math.abs(pa - pv) / pa > 0.02) note.push(['Vapour pressure from the Antoine constants at ' + v.t + ' °C is ' + G(pa, 4) + ' mmHg; you entered ' + G(pv, 4) + '.', 'warn']); }
        var P = K.toBarA(v.p, v.u) * 1e5, Pv = pv * 133.322368;
        if (P <= 0) return { rows: [], notes: [['The suction vessel pressure is below zero absolute: check the pressure and unit.', 'bad']] };
        var hP = (P - Pv) / (v.rho * g), hfm = v.hf * 1e5 / (v.rho * g), npsha = hP + v.z - hfm, mar = npsha - v.npshr;
        var notes = [['NPSHa = (P<sub>vessel</sub> − P<sub>vapour</sub>) / ρg + level − suction losses', 'lead']].concat(note);
        if (Pv > P) notes.push(['The liquid is above its boiling point at the vessel pressure: it will flash in the suction line.', 'bad']);
        else if (mar < 0) notes.push(['NPSH available is less than the pump needs: the pump will cavitate. Raise the level, cool the liquid, reduce suction losses or choose a pump with lower NPSHr.', 'bad']);
        else if (mar < 1 || npsha / v.npshr < 1.3) notes.push(['Small margin. NPSHr is the 3 % head-drop point, where cavitation has already started; ANSI/HI 9.6.1 recommends margin ratios above 1 depending on the application. Check with the pump vendor.', 'warn']);
        else notes.push(['Margin looks adequate; confirm against the vendor curve at the maximum flow.', 'good']);
        if (P < 0.5e5) notes.push(['Vacuum vessel: every metre of liquid level counts. Pumps from vacuum receivers usually need the pump well below the vessel.', 'warn']);
        return { rows: [['NPSH available', F(npsha, 2), 'm'], ['Margin over NPSH required', F(mar, 2), 'm'], ['NPSHa / NPSHr', F(npsha / v.npshr, 2), ''], ['Pressure head above vapour pressure', F(hP, 2), 'm'],
          ['Static head', F(v.z, 2), 'm'], ['Suction loss', F(hfm, 2), 'm'], ['Vessel pressure', F(P / 1e5, 4), 'bar abs']], notes: notes };
      },
      refs: ['NPSH available definition: ANSI/HI 9.6.1, <i>Rotodynamic Pumps – Guideline for NPSH Margin</i> (Hydraulic Institute).', 'Vapour pressure: Antoine constants from the PharmaChemE solvent pages.']
    });
  }
  if (DATA) fetch(DATA).then(function (r) { return r.json(); }).then(function (d) { SOL = d; register(); }).catch(register); else register();
  if (typeof module !== 'undefined' && module.exports) module.exports = { churchill: churchill, K3: K3, pipeID: pipeID, setSol: function (d) { SOL = d; register(); } };
})();
