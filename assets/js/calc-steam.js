/* Steam tables (IAPWS-IF97), condensate flash and desuperheater. Needs if97.js and pce-kit.js. */
(function () {
  'use strict';
  var K = PCEKit, F = K.F, G = K.G, KJ = K.KJ;
  var REF_IF97 = 'IAPWS, <i>Revised Release on the IAPWS Industrial Formulation 1997 for the Thermodynamic Properties of Water and Steam</i> (IAPWS R7-97, 2012): regions 1, 2 and 4. Checked against the verification values in the release.';
  var PKEYS = ['barg', 'bara', 'kscg', 'kpaa', 'psig', 'mmhga'];
  function satAtBar(pa) { var s = IF97.sat(pa / 10); return s; }
  function satRows(s) {
    var L = s.L, V = s.V, hfg = V.h - L.h, pa = s.P * 10;
    return [
      ['Saturation temperature', F(s.T - 273.15, 2), '°C'],
      ['Pressure', F(pa, 4) + ' bar abs', '= ' + F(pa - 1.01325, 3) + ' barg'],
      ['Latent heat, hfg', F(hfg / KJ, 1), 'kcal/kg (' + F(hfg, 1) + ' kJ/kg)'],
      ['Enthalpy of water, hf', F(L.h / KJ, 1), 'kcal/kg (' + F(L.h, 1) + ' kJ/kg)'],
      ['Enthalpy of steam, hg', F(V.h / KJ, 1), 'kcal/kg (' + F(V.h, 1) + ' kJ/kg)'],
      ['Specific volume of steam, vg', G(V.v, 4), 'm³/kg'],
      ['Density of steam', G(1 / V.v, 4), 'kg/m³'],
      ['Specific volume of water, vf', G(L.v, 4), 'm³/kg'],
      ['Entropy of water, sf', F(L.s, 4), 'kJ/kg·K'],
      ['Entropy of steam, sg', F(V.s, 4), 'kJ/kg·K']
    ];
  }

  K.add('steam-sat', {
    title: 'Saturated steam table',
    sub: 'Temperature, latent heat and enthalpy at any pressure, or pressure at any temperature',
    inputs: [
      { k: 'mode', label: 'Look up by', type: 'sel', v: 'p', opts: [['p', 'Pressure'], ['t', 'Temperature']] },
      { k: 'p', label: 'Pressure', v: 7, show: function (v) { return v.mode === 'p'; } },
      { k: 'u', label: 'Pressure unit', type: 'sel', v: 'barg', opts: K.pOpts(PKEYS), show: function (v) { return v.mode === 'p'; } },
      { k: 't', label: 'Temperature', unit: '°C', v: 150, show: function (v) { return v.mode === 't'; } }
    ],
    example: { v: { mode: 'p', p: 10, u: 'barg' } },
    run: function (v) {
      var pa = v.mode === 'p' ? K.toBarA(v.p, v.u) : (v.t > 0.01 && v.t <= 350 ? IF97.psat(v.t + 273.15) * 10 : NaN);
      var s = isFinite(pa) ? satAtBar(pa) : null;
      if (!s) return { rows: [], notes: [['Outside the range covered: saturation from 0.006 to 165 bar abs (0.01 to 350 °C).', 'bad']] };
      var tbl = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map(function (g) { var q = satAtBar(g + 1.01325); return [F(g, 0), F(q.T - 273.15, 1), F((q.V.h - q.L.h) / KJ, 1), F(q.L.h / KJ, 1), F(q.V.h / KJ, 1), G(q.V.v, 3)]; });
      return { rows: satRows(s), notes: [['1 kcal = 4.1868 kJ (International Table calorie). Gauge pressures assume 1.01325 bar atmosphere; at altitude, use bar abs.']],
        tables: [{ title: 'Saturated steam, 0 to 20 barg', head: ['barg', '°C', 'hfg kcal/kg', 'hf kcal/kg', 'hg kcal/kg', 'vg m³/kg'], rows: tbl }] };
    },
    refs: [REF_IF97]
  });

  K.add('steam-super', {
    title: 'Steam or water properties at any pressure and temperature',
    sub: 'Superheated steam or compressed water: enthalpy, entropy, density, degrees of superheat',
    inputs: [
      { k: 'p', label: 'Pressure', v: 10 }, { k: 'u', label: 'Pressure unit', type: 'sel', v: 'barg', opts: K.pOpts(PKEYS) },
      { k: 't', label: 'Temperature', unit: '°C', v: 250 }
    ],
    example: { v: { p: 40, u: 'barg', t: 400 } },
    run: function (v) {
      var pa = K.toBarA(v.p, v.u), T = v.t + 273.15, r = IF97.pt(T, pa / 10);
      if (!r) return { rows: [], notes: [['Outside the range covered (0 to 800 °C, up to 1,000 bar, excluding the near-critical region above 350 °C and about 165 bar).', 'bad']] };
      var ts = pa / 10 <= 22.064 ? IF97.tsat(pa / 10) - 273.15 : NaN;
      var phase = r.region === 1 ? 'Water (compressed liquid)' : 'Superheated steam';
      var rows = [['Phase', phase, ''], ['Enthalpy', F(r.h / KJ, 1), 'kcal/kg (' + F(r.h, 1) + ' kJ/kg)'], ['Density', G(1 / r.v, 4), 'kg/m³'], ['Specific volume', G(r.v, 4), 'm³/kg'],
        ['Entropy', F(r.s, 4), 'kJ/kg·K'], ['Specific heat, cp', F(r.cp / KJ, 3), 'kcal/kg·°C (' + F(r.cp, 3) + ' kJ/kg·K)']];
      if (isFinite(ts)) rows.push(['Saturation temperature at this pressure', F(ts, 1), '°C'], [r.region === 2 ? 'Degrees of superheat' : 'Subcooling', F(Math.abs(v.t - ts), 1), '°C']);
      var notes = [];
      if (isFinite(ts) && Math.abs(v.t - ts) < 0.5) notes.push(['You are at the saturation temperature: the steam could be wet. Use the saturated steam table with a dryness fraction.', 'warn']);
      return { rows: rows, notes: notes };
    },
    refs: [REF_IF97]
  });

  K.add('condensate-flash', {
    title: 'Flash steam from condensate',
    sub: 'How much condensate flashes to steam when its pressure drops (trap to a flash vessel or the condensate tank)',
    inputs: [
      { k: 'm', label: 'Condensate flow', unit: 'kg/h', v: 2000 },
      { k: 'p1', label: 'Condensate pressure (before the trap)', v: 10 }, { k: 'u1', label: 'Unit', type: 'sel', v: 'barg', opts: K.pOpts(PKEYS) },
      { k: 'sub', label: 'Subcooling of condensate below saturation', unit: '°C', v: 0, help: '0 for condensate at saturation; traps that hold back condensate (thermostatic) give some subcooling' },
      { k: 'p2', label: 'Flash vessel or tank pressure', v: 0.5 }, { k: 'u2', label: 'Unit', type: 'sel', v: 'barg', opts: K.pOpts(PKEYS) },
      { k: 'vel', label: 'Design vapour velocity in the flash vessel (optional)', unit: 'm/s', v: 3, help: 'For a quick vessel diameter; a common rule is up to about 3 m/s upward velocity', optional: true }
    ],
    example: { v: { m: 1500, p1: 7, u1: 'barg', sub: 0, p2: 0, u2: 'barg', vel: 3 } },
    run: function (v) {
      var a1 = K.toBarA(v.p1, v.u1), a2 = K.toBarA(v.p2, v.u2), s1 = satAtBar(a1), s2 = satAtBar(a2);
      if (!s1 || !s2) return { rows: [], notes: [['Pressures must be between 0.006 and 165 bar abs.', 'bad']] };
      if (a2 >= a1) return { rows: [], notes: [['The flash pressure must be lower than the condensate pressure.', 'bad']] };
      var T1 = s1.T - (v.sub || 0), h1 = (v.sub > 0) ? IF97.region1(T1, a1 / 10).h : s1.L.h;
      var hfg2 = s2.V.h - s2.L.h, x = Math.max(0, (h1 - s2.L.h) / hfg2), fl = v.m * x;
      var rows = [['Flash steam', F(fl, 0), 'kg/h'], ['Flash fraction', F(100 * x, 1), '% of the condensate'], ['Condensate left', F(v.m - fl, 0), 'kg/h at ' + F(s2.T - 273.15, 1) + ' °C'],
        ['Heat in the flash steam', F(fl * s2.V.h / KJ, 0), 'kcal/h'], ['Flash steam volume', F(fl * s2.V.v, 0), 'm³/h']];
      if (v.vel > 0) { var D = Math.sqrt(4 * fl * s2.V.v / 3600 / (Math.PI * v.vel)); rows.push(['Flash vessel diameter at ' + F(v.vel, 1) + ' m/s', F(D * 1000, 0), 'mm (minimum)']); }
      var notes = [['Flash fraction = (h<sub>f1</sub> − h<sub>f2</sub>) / h<sub>fg2</sub>: the heat above the saturation enthalpy at the lower pressure boils part of the condensate.', 'lead']];
      if (x === 0) notes.push(['No flash: the condensate is cooler than the saturation temperature at the lower pressure.', 'good']);
      if (a2 < 1.05 && x > 0) notes.push(['Flashing to an open tank wastes this steam and its heat; a flash vessel at a little pressure can feed low-pressure users or a heater.', 'warn']);
      return { rows: rows, notes: notes };
    },
    refs: [REF_IF97, 'Energy balance across the trap or valve (isenthalpic expansion), as in the Spirax Sarco steam engineering guidance on flash steam.']
  });

  K.add('desuperheater', {
    title: 'Desuperheater: spray water needed',
    sub: 'Water injected to bring superheated steam down to a target temperature',
    inputs: [
      { k: 'm', label: 'Superheated steam flow (inlet)', unit: 'kg/h', v: 5000 },
      { k: 'p', label: 'Steam pressure', v: 10 }, { k: 'u', label: 'Unit', type: 'sel', v: 'barg', opts: K.pOpts(PKEYS) },
      { k: 't1', label: 'Inlet steam temperature', unit: '°C', v: 300 },
      { k: 't2', label: 'Target outlet temperature', unit: '°C', v: 195 },
      { k: 'tw', label: 'Spray water temperature', unit: '°C', v: 105 }
    ],
    example: { v: { m: 8000, p: 12, u: 'barg', t1: 320, t2: 200, tw: 105 } },
    run: function (v) {
      var a = K.toBarA(v.p, v.u), P = a / 10, ts = P <= 22.064 ? IF97.tsat(P) - 273.15 : NaN;
      var s1 = IF97.pt(v.t1 + 273.15, P), s2 = IF97.pt(v.t2 + 273.15, P), w = IF97.pt(v.tw + 273.15, Math.max(P, 0.101325) * 1.2);
      if (!s1 || !s2 || !w) return { rows: [], notes: [['Outside the range covered.', 'bad']] };
      if (s1.region !== 2) return { rows: [], notes: [['The inlet is not superheated at this pressure (saturation ' + F(ts, 1) + ' °C).', 'bad']] };
      if (v.t2 <= ts) return { rows: [], notes: [['The target is at or below saturation (' + F(ts, 1) + ' °C): water would not evaporate. Aim at least a few degrees above saturation.', 'bad']] };
      var mw = v.m * (s1.h - s2.h) / (s2.h - w.h);
      var notes = [['Water = steam × (h<sub>in</sub> − h<sub>out</sub>) / (h<sub>out</sub> − h<sub>water</sub>).', 'lead']];
      if (v.t2 - ts < 5) notes.push(['Within 5 °C of saturation: control is difficult and unevaporated water can reach users. Most designs keep 5 to 10 °C or more of superheat.', 'warn']);
      return { rows: [['Spray water', F(mw, 0), 'kg/h'], ['Outlet steam', F(v.m + mw, 0), 'kg/h'], ['Water as % of inlet steam', F(100 * mw / v.m, 1), '%'], ['Saturation temperature', F(ts, 1), '°C'],
        ['Outlet superheat', F(v.t2 - ts, 1), '°C'], ['Inlet enthalpy', F(s1.h / KJ, 1), 'kcal/kg'], ['Outlet enthalpy', F(s2.h / KJ, 1), 'kcal/kg']], notes: notes };
    },
    refs: [REF_IF97, 'Mass and energy balance on the mixing point; spray water taken as compressed liquid at the given temperature.']
  });
})();
