/* Unit converter and gas volume conversion. Factors to SI from NIST SP 811 (2008), Appendix B; calorie and BTU are the International Table values. */
(function () {
  'use strict';
  var K = PCEKit;
  /* 6 significant figures without trailing zeros */
  var G = function (x) { if (!isFinite(x)) return '–'; if (x !== 0 && (Math.abs(x) < 1e-6 || Math.abs(x) >= 1e12)) return Number(x).toExponential(5); return Number(Number(x).toPrecision(6)).toLocaleString('en-IN', { maximumFractionDigits: 10 }); };
  /* [key, label, factor to the SI unit] ; temperature handled separately */
  var Q = {
    pressure: ['Pressure', [['bar', 'bar', 1e5], ['mbar', 'mbar', 100], ['kpa', 'kPa', 1e3], ['mpa', 'MPa', 1e6], ['pa', 'Pa', 1], ['ksc', 'kg/cm²', 98066.5], ['psi', 'psi', 6894.757293168], ['atm', 'atm', 101325],
      ['mmhg', 'mmHg (torr)', 133.322368], ['inhg', 'inHg', 3386.389], ['mmwc', 'mm water column', 9.80665], ['mwc', 'm water column', 9806.65], ['inwc', 'inch water column', 249.0889]]],
    temperature: ['Temperature', [['c', '°C'], ['k', 'K'], ['f', '°F'], ['r', '°R']]],
    energy: ['Energy, heat', [['kcal', 'kcal', 4186.8], ['kj', 'kJ', 1e3], ['j', 'J', 1], ['mj', 'MJ', 1e6], ['btu', 'BTU', 1055.05585262], ['kwh', 'kWh', 3.6e6], ['mmbtu', 'MMBTU', 1.05505585262e9], ['therm', 'therm', 1.05505585262e8]]],
    power: ['Power, heat duty', [['kcalh', 'kcal/h', 1.163], ['kw', 'kW', 1e3], ['w', 'W', 1], ['mw', 'MW', 1e6], ['btuh', 'BTU/h', 0.29307107], ['tr', 'TR (refrigeration ton)', 3516.853], ['hp', 'hp (mechanical)', 745.69987], ['ps', 'hp (metric, PS)', 735.49875], ['mkcalh', 'million kcal/h (Gcal/h)', 1.163e6]]],
    vflow: ['Volume flow', [['m3h', 'm³/h', 1 / 3600], ['m3s', 'm³/s', 1], ['lpm', 'L/min', 1e-3 / 60], ['lps', 'L/s', 1e-3], ['lph', 'L/h', 1e-3 / 3600], ['usgpm', 'US gpm', 6.30901964e-5], ['igpm', 'Imperial gpm', 7.57681667e-5], ['cfm', 'ft³/min (cfm)', 4.719474432e-4], ['bpd', 'barrel/day', 1.84013e-6], ['m3d', 'm³/day', 1 / 86400]]],
    mflow: ['Mass flow', [['kgh', 'kg/h', 1 / 3600], ['kgs', 'kg/s', 1], ['th', 't/h', 1000 / 3600], ['td', 't/day', 1000 / 86400], ['lbh', 'lb/h', 0.45359237 / 3600], ['kgmin', 'kg/min', 1 / 60]]],
    mass: ['Mass', [['kg', 'kg', 1], ['g', 'g', 1e-3], ['t', 'tonne', 1e3], ['lb', 'lb', 0.45359237], ['oz', 'oz', 0.028349523125]]],
    volume: ['Volume', [['m3', 'm³', 1], ['l', 'litre', 1e-3], ['kl', 'kL', 1], ['usgal', 'US gallon', 3.785411784e-3], ['igal', 'Imperial gallon', 4.54609e-3], ['ft3', 'ft³', 0.028316846592], ['bbl', 'barrel (oil)', 0.158987294928]]],
    length: ['Length', [['m', 'm', 1], ['mm', 'mm', 1e-3], ['cm', 'cm', 1e-2], ['in', 'inch', 0.0254], ['ft', 'ft', 0.3048], ['km', 'km', 1e3], ['mile', 'mile', 1609.344]]],
    area: ['Area', [['m2', 'm²', 1], ['cm2', 'cm²', 1e-4], ['mm2', 'mm²', 1e-6], ['in2', 'in²', 6.4516e-4], ['ft2', 'ft²', 0.09290304], ['acre', 'acre', 4046.8564224]]],
    density: ['Density', [['kgm3', 'kg/m³', 1], ['gcc', 'g/cm³ (g/mL)', 1e3], ['kgl', 'kg/L', 1e3], ['lbft3', 'lb/ft³', 16.01846337], ['lbgal', 'lb/US gal', 119.8264273]]],
    visc: ['Viscosity (dynamic)', [['cp', 'cP (mPa·s)', 1e-3], ['pas', 'Pa·s', 1], ['p', 'poise', 0.1], ['lbfts', 'lb/ft·s', 1.488163944]]],
    kvisc: ['Viscosity (kinematic)', [['cst', 'cSt (mm²/s)', 1e-6], ['m2s', 'm²/s', 1], ['st', 'stokes', 1e-4], ['ft2s', 'ft²/s', 0.09290304]]],
    htc: ['Heat transfer coefficient, U', [['kcalhm2c', 'kcal/h·m²·°C', 1.163], ['wm2k', 'W/m²·K', 1], ['btuhft2f', 'BTU/h·ft²·°F', 5.678263341]]],
    tk: ['Thermal conductivity', [['kcalhmc', 'kcal/h·m·°C', 1.163], ['wmk', 'W/m·K', 1], ['btuhftf', 'BTU/h·ft·°F', 1.730734666]]],
    cp: ['Specific heat', [['kcalkgc', 'kcal/kg·°C', 4186.8], ['kjkgk', 'kJ/kg·K', 1e3], ['btulbf', 'BTU/lb·°F', 4186.8]]],
    enth: ['Specific enthalpy, latent heat', [['kcalkg', 'kcal/kg', 4186.8], ['kjkg', 'kJ/kg', 1e3], ['btulb', 'BTU/lb', 2326]]],
    vel: ['Velocity', [['ms', 'm/s', 1], ['mmin', 'm/min', 1 / 60], ['kmh', 'km/h', 1 / 3.6], ['fts', 'ft/s', 0.3048], ['ftmin', 'ft/min', 0.00508]]]
  };
  var qOpts = Object.keys(Q).map(function (k) { return [k, Q[k][0]]; });
  var inputs = [{ k: 'q', label: 'Quantity', type: 'sel', v: 'pressure', opts: qOpts }, { k: 'x', label: 'Value', v: 1 }];
  Object.keys(Q).forEach(function (q) { inputs.push({ k: 'u_' + q, label: 'From unit', type: 'sel', v: Q[q][1][0][0], opts: Q[q][1].map(function (u) { return [u[0], u[1]]; }), show: function (v) { return v.q === q; } }); });
  inputs.push({ k: 'pt', label: 'Pressure reading is', type: 'sel', v: 'g', opts: [['a', 'Absolute'], ['g', 'Gauge (above atmosphere)'], ['v', 'Vacuum (below atmosphere)']], show: function (v) { return v.q === 'pressure'; } });
  inputs.push({ k: 'patm', label: 'Local atmospheric pressure', unit: 'bar abs', v: 1.01325, show: function (v) { return v.q === 'pressure'; }, help: '1.01325 at sea level; about 0.95 at 500 m' });

  function toC(x, u) { return u === 'c' ? x : u === 'k' ? x - 273.15 : u === 'f' ? (x - 32) / 1.8 : (x - 491.67) / 1.8; }
  function fromC(c, u) { return u === 'c' ? c : u === 'k' ? c + 273.15 : u === 'f' ? c * 1.8 + 32 : (c + 273.15) * 1.8; }

  K.add('unit-convert', {
    title: 'Unit converter for process engineers',
    sub: 'Pressure (gauge, absolute, vacuum), temperature, heat duty, U values, flows, viscosity and more',
    inputs: inputs,
    example: { v: { q: 'pressure', x: 650, u_pressure: 'mmhg', pt: 'v', patm: 1.01325 } },
    run: function (v) {
      var q = v.q, list = Q[q][1], u = v['u_' + q], rows = [], notes = [], tbl;
      if (q === 'temperature') {
        var c = toC(v.x, u);
        if (c < -273.15) return { rows: [], notes: [['Below absolute zero.', 'bad']] };
        tbl = list.map(function (w) { return [w[1], G(fromC(c, w[0]))]; });
        rows = [[list.filter(function (w) { return w[0] === u; })[0][1] + ' ' + v.x + ' =', G(fromC(c, u === 'c' ? 'f' : 'c')), u === 'c' ? '°F' : '°C']];
        notes.push(['A temperature <i>difference</i> converts without the offset: 1 °C difference = 1 K = 1.8 °F.']);
        return { rows: rows, tables: [{ title: 'All units', head: ['Unit', 'Value'], rows: tbl }], notes: notes };
      }
      var f = list.filter(function (w) { return w[0] === u; })[0][2], si = v.x * f;
      if (q === 'pressure') {
        var atm = v.patm * 1e5, abs = v.pt === 'a' ? si : v.pt === 'g' ? atm + si : atm - si;
        if (abs < 0) return { rows: [], notes: [['The vacuum reading is larger than the atmospheric pressure.', 'bad']] };
        tbl = list.map(function (w) { return [w[1], G(abs / w[2]), G((abs - atm) / w[2]), abs < atm ? G((atm - abs) / w[2]) : '–']; });
        rows = [['Absolute pressure', G(abs / 1e5), 'bar abs'], ['Gauge pressure', G((abs - atm) / 1e5), 'barg'], ['Absolute pressure', G(abs / 133.322368), 'mmHg abs (torr)']];
        if (abs < atm) rows.push(['Vacuum below atmosphere', G((atm - abs) / 133.322368), 'mmHg']);
        notes.push(['Boiling points depend on absolute pressure. Many plant vacuum gauges read mmHg <i>below</i> atmosphere: 700 mmHg vacuum is about 60 mmHg absolute at sea level.']);
        return { rows: rows, tables: [{ title: 'All units', head: ['Unit', 'Absolute', 'Gauge', 'Vacuum'], rows: tbl }], notes: notes };
      }
      tbl = list.map(function (w) { return [w[1], G(si / w[2])]; });
      var first = list.filter(function (w) { return w[0] !== u; })[0];
      rows = [[v.x + ' ' + list.filter(function (w) { return w[0] === u; })[0][1] + ' =', G(si / first[2]), first[1]]];
      return { rows: rows, tables: [{ title: 'All units', head: ['Unit', 'Value'], rows: tbl }] };
    },
    refs: ['NIST Special Publication 811 (2008), <i>Guide for the Use of the International System of Units</i>, Appendix B (conversion factors).', 'kcal and BTU are International Table values: 1 kcal = 4.1868 kJ; 1 BTU = 1.05505585262 kJ.']
  });

  /* Gas flow at normal (0 °C, 1.01325 bar), standard (15 °C, 1.01325 bar) and actual conditions */
  var BASES = [['nm3', 'Nm³/h (0 °C, 1.01325 bar abs)'], ['sm3', 'Sm³/h (15 °C, 1.01325 bar abs)'], ['scfm', 'SCFM (60 °F, 14.696 psia)'], ['am3', 'Actual m³/h at the conditions below'], ['kgh', 'kg/h (needs molecular weight)']];
  function basisPT(b) { return b === 'nm3' ? [101325, 273.15] : b === 'sm3' ? [101325, 288.15] : b === 'scfm' ? [101325, 288.706] : null; }
  K.add('gas-volume', {
    title: 'Gas flow: Nm³/h, Sm³/h, SCFM, actual m³/h and kg/h',
    sub: 'Converts between reference conditions with the ideal gas law (and Z if you have it)',
    inputs: [
      { k: 'x', label: 'Flow', v: 500 }, { k: 'b', label: 'Given as', type: 'sel', v: 'nm3', opts: BASES },
      { k: 'p', label: 'Actual pressure', v: 5 }, { k: 'u', label: 'Pressure unit', type: 'sel', v: 'barg', opts: K.pOpts(['barg', 'bara', 'kscg', 'kpaa', 'psig', 'mmhga']) },
      { k: 't', label: 'Actual temperature', unit: '°C', v: 30 },
      { k: 'mw', label: 'Molecular weight of the gas', unit: 'kg/kmol', v: 28.01, help: 'Nitrogen 28.01, air 28.96, CO2 44.01, H2 2.016, methane 16.04' },
      { k: 'z', label: 'Compressibility Z at actual conditions', v: 1, help: '1 for most plant gases below about 10 bar' }
    ],
    example: { v: { x: 300, b: 'nm3', p: 7, u: 'barg', t: 35, mw: 28.96, z: 1 } },
    run: function (v) {
      var Pa = K.toBarA(v.p, v.u) * 1e5, Ta = v.t + 273.15, Rg = 8314.462618;
      if (!(Pa > 0) || !(Ta > 0) || !(v.mw > 0) || !(v.z > 0)) return { rows: [], notes: [['Check pressure, temperature, molecular weight and Z.', 'bad']] };
      var kmolh;
      if (v.b === 'am3') kmolh = v.x * Pa / (v.z * Rg * Ta);
      else if (v.b === 'kgh') kmolh = v.x / v.mw;
      else { var r = basisPT(v.b), qh = v.b === 'scfm' ? v.x * 0.028316846592 * 60 : v.x; kmolh = qh * r[0] / (Rg * r[1]); }
      var at = function (P, T) { return kmolh * Rg * T / P; };
      var rows = [['Normal flow', G(at(101325, 273.15)), 'Nm³/h'], ['Standard flow (15 °C)', G(at(101325, 288.15)), 'Sm³/h'], ['Standard flow (60 °F)', G(at(101325, 288.706) / 0.028316846592 / 60), 'SCFM'],
        ['Actual flow', G(kmolh * v.z * Rg * Ta / Pa), 'm³/h at ' + G(Pa / 1e5, 4) + ' bar abs, ' + v.t + ' °C'], ['Mass flow', G(kmolh * v.mw), 'kg/h'], ['Molar flow', G(kmolh), 'kmol/h']];
      return { rows: rows, notes: [['Reference conditions differ between users: "normal" is usually 0 °C, "standard" 15 °C or 60 °F (some use 20 °C). Check which one a vendor or a permit means.']] };
    },
    refs: ['Ideal gas law pV = Z n R T, with R = 8.314462618 J/mol·K (CODATA 2018).', 'Reference conditions: normal 0 °C and 101.325 kPa (DIN 1343); standard 15 °C and 101.325 kPa (ISO 13443); SCFM at 60 °F and 14.696 psia.']
  });
})();
