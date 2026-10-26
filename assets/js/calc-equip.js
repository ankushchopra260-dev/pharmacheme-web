/* Equipment: vertical knock-out pot / separator (Souders–Brown, GPSA K), solvent tank filling and breathing losses (physical estimate), vessel wall thickness and MAWP (ASME VIII-1 internal pressure).
   Needs pce-kit.js; loads solvent-lite.json for vapour pressure and molecular weight. */
(function () {
  'use strict';
  var K = PCEKit, F = K.F, G = K.G, me = document.currentScript, SOL = [], URL_S = me && me.getAttribute('data-sol');
  var Rg = 8.314462618;
  /* GPSA Engineering Data Book: K for vertical drums with a horizontal mesh pad, by gauge pressure (bar) */
  var KTAB = [[0, 0.107], [7, 0.107], [21, 0.101], [42, 0.092], [63, 0.083], [105, 0.065]];
  function kGPSA(pg) { pg = Math.max(0, Math.min(105, pg)); var i = 0; while (i < KTAB.length - 2 && pg > KTAB[i + 1][0]) i++; var a = KTAB[i], b = KTAB[i + 1]; return a[1] + (b[1] - a[1]) * (pg - a[0]) / (b[0] - a[0]); }
  function pvap(s, T) { return Math.pow(10, s.a[0] - s.a[1] / (s.a[2] + T)) * 133.322368; } // Pa

  function register() {
    var solOpts = SOL.map(function (s) { return [s.s, s.n]; });
    K.add('ko-pot', {
      title: 'Knock-out pot / vertical separator',
      sub: 'Diameter from the Souders–Brown velocity and liquid height from the hold-up time: vent knock-out pots, vacuum line catch pots, scrubber inlet drums',
      inputs: [
        { k: 'W', label: 'Vapour or gas flow', unit: 'kg/h', v: 500 }, { k: 'M', label: 'Molecular weight of the gas', unit: 'kg/kmol', v: 28.96 },
        { k: 'p', label: 'Operating pressure', v: 0.2 }, { k: 'u', label: 'Pressure unit', type: 'sel', v: 'barg', opts: K.pOpts(['barg', 'bara', 'mmhga', 'kpaa']) },
        { k: 't', label: 'Temperature', unit: '°C', v: 40 }, { k: 'Z', label: 'Compressibility Z', v: 1 },
        { k: 'rl', label: 'Liquid density', unit: 'kg/m³', v: 1000 },
        { k: 'mesh', label: 'Mist eliminator', type: 'sel', v: 'y', opts: [['y', 'Horizontal wire-mesh pad'], ['n', 'No mesh pad (half of the GPSA K)']] },
        { k: 'kf', label: 'Service factor on K', v: 1, help: 'GPSA: 0.6 to 0.8 for glycol or amine solutions, 0.7 to 0.8 for compressor suction scrubbers' },
        { k: 'pct', label: 'Design velocity as % of the maximum', unit: '%', v: 100 },
        { k: 'ql', label: 'Liquid flow into the pot (optional)', unit: 'kg/h', v: 50, optional: true }, { k: 'hold', label: 'Liquid hold-up time', unit: 'min', v: 10, optional: true }
      ],
      example: { v: { W: 120, M: 32, p: 100, u: 'mmhga', t: 30, Z: 1, rl: 790, mesh: 'y', kf: 1, pct: 100, ql: 20, hold: 15 } },
      run: function (v) {
        var Pa = K.toBarA(v.p, v.u) * 1e5, pg = Pa / 1e5 - 1.01325, rv = Pa * v.M / (v.Z * Rg * 1000 * (v.t + 273.15));
        if (!(v.rl > rv)) return { rows: [], notes: [['Liquid density must be above the gas density.', 'bad']] };
        var Kv = kGPSA(pg) * (v.mesh === 'y' ? 1 : 0.5) * v.kf, vmax = Kv * Math.sqrt((v.rl - rv) / rv), vd = vmax * v.pct / 100;
        var Q = v.W / 3600 / rv, D = Math.sqrt(4 * Q / (Math.PI * vd)), rows = [['Minimum inside diameter', F(D * 1000, 0), 'mm'], ['Maximum allowable gas velocity', F(vmax, 2), 'm/s'], ['K used', F(Kv, 3), 'm/s'], ['Gas density', G(rv, 4), 'kg/m³'], ['Actual gas flow', G(Q * 3600, 4), 'm³/h']];
        if (v.ql > 0 && v.hold > 0) { var vol = v.ql / v.rl * v.hold / 60; rows.push(['Liquid hold-up volume', F(vol * 1000, 0), 'litres'], ['Liquid height for the hold-up (at this diameter)', F(vol / (Math.PI * D * D / 4) * 1000, 0), 'mm']); }
        return { rows: rows, notes: [['v<sub>max</sub> = K &radic;((&rho;<sub>L</sub> − &rho;<sub>G</sub>)/&rho;<sub>G</sub>), D = &radic;(4Q/(&pi; v)). K from the GPSA table for vertical drums with a mesh pad, reduced above 7 barg.', 'lead'],
          ['Round the diameter up to a standard shell size. Allow height above the liquid for the inlet nozzle and for disengagement below the mesh pad, as your design standard requires.'],
          (pg < -0.5 ? ['Under vacuum the gas density is low and the velocity limit high, but the volumetric flow is large: check the inlet nozzle velocity too.', 'warn'] : null)].filter(Boolean) };
      },
      refs: ['Gas Processors Suppliers Association, <i>Engineering Data Book</i>, Section 7 (separation equipment): K values for vertical drums with mesh pads and service factors, as tabulated in the Wikipedia article on the Souders–Brown equation.', 'Souders M., Brown G.G., “Design of fractionating columns: entrainment and capacity”, <i>Ind. Eng. Chem.</i> 26 (1934) 98–103.']
    });

    K.add('tank-loss', {
      title: 'Solvent tank filling and breathing losses',
      sub: 'Conservative physical estimate of the solvent lost from a fixed-roof tank vent each year',
      inputs: [
        { k: 'sol', label: 'Solvent', type: 'sel', v: 'toluene', opts: solOpts },
        { k: 'T', label: 'Average liquid temperature', unit: '°C', v: 30 },
        { k: 'thru', label: 'Volume pumped into the tank per year', unit: 'm³', v: 1200 },
        { k: 'D', label: 'Tank diameter', unit: 'm', v: 4 }, { k: 'Hs', label: 'Tank shell height', unit: 'm', v: 6 }, { k: 'Hl', label: 'Average liquid height', unit: 'm', v: 3 },
        { k: 'dT', label: 'Daily swing of the vapour space temperature', unit: '°C', v: 12, help: 'Larger for dark, sunlit tanks; smaller for white, shaded or insulated tanks' },
        { k: 'dPb', label: 'Conservation vent: pressure setting minus vacuum setting', unit: 'mbar', v: 0, help: '0 for an open vent; for +20 / −5 mbar enter 25' },
        { k: 'bal', label: 'Vapour balancing to the road tanker during filling', type: 'sel', v: 'n', opts: [['n', 'No'], ['y', 'Yes (enter efficiency)']] },
        { k: 'eff', label: 'Vapour balancing efficiency', unit: '%', v: 90, show: function (v) { return v.bal === 'y'; } }
      ],
      example: { v: { sol: 'acetone', T: 30, thru: 2000, D: 4, Hs: 6, Hl: 3, dT: 15, dPb: 0, bal: 'n' } },
      run: function (v) {
        var s = SOL.filter(function (x) { return x.s === v.sol; })[0]; if (!s) return { rows: [], notes: [['Choose a solvent.', 'bad']] };
        var Tk = v.T + 273.15, PA = 101325, Pv = pvap(s, v.T), Wv = Pv * s.mw / (Rg * 1000 * Tk); // kg/m3 of saturated vapour
        if (Pv >= PA) return { rows: [], notes: [['The solvent boils at this temperature at atmospheric pressure: it cannot be stored in an atmospheric tank.', 'bad']] };
        var Vv = Math.PI * v.D * v.D / 4 * Math.max(0, v.Hs - v.Hl);
        var dPv = pvap(s, v.T + v.dT / 2) - pvap(s, v.T - v.dT / 2), KE = Math.max(0, v.dT / Tk + (dPv - v.dPb * 100) / (PA - Pv));
        var standing = 365 * Vv * Wv * KE, working = v.thru * Wv * (v.bal === 'y' ? 1 - v.eff / 100 : 1);
        var notes = [['Filling: each m³ pumped in pushes out 1 m³ of headspace gas saturated with vapour (' + G(Wv * 1000, 3) + ' g/m³ at ' + v.T + ' °C). Breathing: the vapour space expands and contracts each day by K<sub>E</sub> = ΔT/T + (Δp<sub>v</sub> − Δp<sub>vent</sub>)/(p<sub>atm</sub> − p<sub>v</sub>).', 'lead'],
          ['A conservative estimate: the vapour space is taken as saturated and no turnover credit is applied. For permit reporting use the full US EPA AP-42 Chapter 7.1 method (tank paint, solar insolation, saturation and turnover factors).'],
          ['Nitrogen blanketing does not reduce these losses; vapour balancing and a vent condenser do.', 'warn']];
        return { rows: [['Total loss', F(standing + working, 0), 'kg per year'], ['Filling (working) loss', F(working, 0), 'kg per year'], ['Breathing (standing) loss', F(standing, 0), 'kg per year'],
          ['Vapour pressure at ' + v.T + ' °C', F(Pv / 1000, 2), 'kPa'], ['Vapour concentration in the headspace', F(Wv * 1000, 0), 'g/m³'], ['Vapour space volume', F(Vv, 1), 'm³'], ['Daily expansion factor KE', F(KE, 4), '']], notes: notes };
      },
      refs: ['Structure of the estimate follows US EPA, <i>AP-42 Compilation of Air Pollutant Emission Factors</i>, Chapter 7.1, Organic Liquid Storage Tanks (standing and working losses of fixed-roof tanks); here with saturation, turnover and product factors set to 1.', 'Vapour pressure (Antoine) and molecular weight: PharmaChemE solvent pages.']
    });
  }

  /* ---------- vessel wall thickness: ASME VIII Div. 1, internal pressure ---------- */
  K.add('vessel-thk', {
    title: 'Vessel shell and head thickness, MAWP (ASME VIII Div. 1, internal pressure)',
    sub: 'Cylindrical shell and 2:1 ellipsoidal, torispherical (ASME F&D) or hemispherical heads',
    inputs: [
      { k: 'P', label: 'Design pressure (internal)', unit: 'barg', v: 6 }, { k: 'D', label: 'Inside diameter', unit: 'mm', v: 2000 },
      { k: 'S', label: 'Allowable stress of the material at design temperature', unit: 'MPa', v: 115, help: 'From ASME Section II Part D for your material and temperature' },
      { k: 'E', label: 'Joint efficiency', type: 'sel', v: '0.85', opts: [['1', '1.00 (full radiography)'], ['0.85', '0.85 (spot radiography)'], ['0.7', '0.70 (no radiography)']] },
      { k: 'ca', label: 'Corrosion allowance', unit: 'mm', v: 1.5 },
      { k: 'head', label: 'Head type', type: 'sel', v: 'ell', opts: [['ell', '2:1 ellipsoidal'], ['tor', 'Torispherical, crown radius = D, knuckle 6 % (ASME F&D)'], ['hem', 'Hemispherical']] },
      { k: 'tn', label: 'Nominal plate thickness you plan to use (optional, for MAWP)', unit: 'mm', v: 10, optional: true }
    ],
    example: { v: { P: 3.5, D: 1600, S: 138, E: '0.85', ca: 1.5, head: 'tor', tn: 8 } },
    run: function (v) {
      var P = v.P * 0.1, S = v.S, E = +v.E, R = v.D / 2 + v.ca, Dc = v.D + 2 * v.ca; // corroded inside dimensions, MPa
      var ts = P * R / (S * E - 0.6 * P), th;
      if (v.head === 'ell') th = P * Dc / (2 * S * E - 0.2 * P);
      else if (v.head === 'tor') th = 0.885 * P * Dc / (S * E - 0.1 * P);
      else th = P * R / (2 * S * E - 0.2 * P);
      if (!(ts > 0) || P > 0.385 * S * E) return { rows: [], notes: [['The thin-wall formulas apply only while P ≤ 0.385 S E. Check the inputs or use the thick-wall rules of the Code.', 'bad']] };
      var rows = [['Shell: minimum required thickness', F(ts + v.ca, 2), 'mm including corrosion (' + F(ts, 2) + ' + ' + v.ca + ')'], ['Head: minimum required thickness', F(th + v.ca, 2), 'mm including corrosion (after forming)']];
      if (v.tn > 0) {
        var t = v.tn - v.ca, mS = S * E * t / (R + 0.6 * t), mH;
        if (v.head === 'ell') mH = 2 * S * E * t / (Dc + 0.2 * t); else if (v.head === 'tor') mH = S * E * t / (0.885 * Dc + 0.1 * t); else mH = 2 * S * E * t / (R + 0.2 * t);
        var mawp = Math.min(mS, mH);
        rows.push(['MAWP with ' + v.tn + ' mm (corroded)', F(mawp * 10, 2), 'barg (shell ' + F(mS * 10, 2) + ', head ' + F(mH * 10, 2) + ')'], ['Hydrotest pressure, 1.3 × MAWP', F(1.3 * mawp * 10, 2), 'barg (× ratio of stress at test to design temperature)']);
      }
      return { rows: rows, notes: [['Shell t = PR/(SE − 0.6P); 2:1 head t = PD/(2SE − 0.2P); F&D head t = 0.885PL/(SE − 0.1P); hemispherical t = PR/(2SE − 0.2P). R, D, L are inside dimensions in the corroded condition.', 'lead'],
        ['Internal pressure only. Vessels under vacuum or with a jacket around them must also be checked for external pressure (UG-28), which often governs thin reactors. Add allowance for thinning during forming, plate tolerance, nozzle reinforcement, and static head of liquid.', 'warn'],
        ['A screening tool: the vessel design must be done and stamped by a competent engineer to the edition of the Code that applies.']] };
    },
    refs: ['ASME Boiler and Pressure Vessel Code, Section VIII Division 1: UG-27 (shells under internal pressure), UG-32 (formed heads), UG-99(b) (standard hydrostatic test, 1.3 × MAWP × stress ratio).', 'Allowable stresses: ASME Section II Part D.']
  });
  if (URL_S) fetch(URL_S).then(function (r) { return r.json(); }).then(function (d) { SOL = d; register(); }).catch(register); else register();
  if (typeof module !== 'undefined' && module.exports) module.exports = { kGPSA: kGPSA, setSol: function (d) { SOL = d; register(); } };
})();
