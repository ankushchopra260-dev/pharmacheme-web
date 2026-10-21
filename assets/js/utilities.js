/* PharmaChemE: utility system calculators (steam & boiler, cooling tower, chillers & VAM, compressed air & N2, water, DG & power).
   Each calculator is a definition: inputs, a run() that returns result rows, and notes. Pages place <div class="ut-calc" data-calc="id"></div>. */
(function () {
  'use strict';
  const F = (x, d) => (isFinite(x) ? Number(x).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PATM = 1.01325, TR = 3.517, TRK = 3024, KJ = 4.1868; // bar abs, kW per TR, kcal/h per TR, kJ per kcal

  /* Saturated steam (bar abs): T °C, hf, hfg, hg kJ/kg (shown on the site in kcal/kg) */
  const ST = [[1.01325, 100.0, 419.1, 2256.7, 2675.8], [1.5, 111.4, 467.1, 2226.5, 2693.6], [2, 120.2, 504.7, 2201.6, 2706.3], [2.5, 127.4, 535.4, 2181.5, 2716.9], [3, 133.5, 561.4, 2163.2, 2724.7], [4, 143.6, 604.7, 2133.0, 2737.6],
    [5, 151.8, 640.1, 2107.4, 2747.5], [6, 158.8, 670.4, 2085.0, 2755.5], [7, 165.0, 697.1, 2064.9, 2762.0], [8, 170.4, 720.9, 2046.5, 2767.5], [9, 175.4, 742.6, 2029.5, 2772.1],
    [10, 179.9, 762.6, 2013.6, 2776.2], [11, 184.1, 781.1, 1998.5, 2779.7], [12, 188.0, 798.4, 1984.3, 2782.7], [13, 191.6, 814.7, 1970.7, 2785.4], [14, 195.0, 830.1, 1957.7, 2787.8],
    [16, 201.4, 858.6, 1933.2, 2791.7], [18, 207.1, 884.6, 1910.3, 2794.8], [21, 214.9, 920.0, 1878.2, 2798.2]];
  function steam(pg) { // pg = barg
    const p = Math.min(Math.max(pg + PATM, ST[0][0]), ST[ST.length - 1][0]);
    let i = 0; while (i < ST.length - 2 && p > ST[i + 1][0]) i++;
    const a = ST[i], b = ST[i + 1], f = (p - a[0]) / (b[0] - a[0]), L = j => a[j] + f * (b[j] - a[j]);
    return { T: L(1), hf: L(2), hfg: L(3), hg: L(4), clipped: pg + PATM < ST[0][0] - 1e-6 || pg + PATM > ST[ST.length - 1][0] + 1e-6 };
  }
  const FUELS = { coal: ['Indian coal', 4000, 'kg', 75, 8], impcoal: ['Imported coal', 5800, 'kg', 80, 12], briq: ['Biomass briquette', 3800, 'kg', 72, 7],
    husk: ['Rice husk', 3200, 'kg', 70, 5], fo: ['Furnace oil', 10200, 'kg', 85, 55], hsd: ['HSD (diesel)', 10800, 'kg', 85, 105], png: ['Natural gas / PNG', 9500, 'Sm³', 88, 50] };
  const COOL = { water: ['Water', 1.0, 1000], g30: ['Glycol 30 % (MEG)', 0.88, 1040], g40: ['Glycol 40 % (MEG)', 0.84, 1055], custom: ['Other (type cp and density)', 0.72, 1100] };

  const C = {};
  /* ---------------- Steam & boiler ---------------- */
  C.boilerFuel = { title: 'Boiler fuel consumption', sub: 'Fuel needed for a steam load, and the evaporation ratio',
    inputs: [
      { k: 'S', label: 'Steam generated', unit: 'kg/h', v: 5000 },
      { k: 'P', label: 'Steam pressure', unit: 'barg', v: 10 },
      { k: 'Tfw', label: 'Feed water temperature', unit: '°C', v: 80 },
      { k: 'fuel', label: 'Fuel', type: 'sel', v: 'coal', opts: Object.entries(FUELS).map(([k, f]) => [k, f[0]]) },
      { k: 'gcv', label: 'Fuel GCV', unit: 'kcal/kg or /Sm³', v: 4000 },
      { k: 'eff', label: 'Boiler efficiency (on GCV)', unit: '%', v: 75 },
      { k: 'price', label: 'Fuel price', unit: '₹ per kg or Sm³', v: 8 },
      { k: 'hrs', label: 'Running hours per day', unit: 'h', v: 24 }],
    onSel: (k, v) => k === 'fuel' ? { gcv: FUELS[v][1], eff: FUELS[v][3], price: FUELS[v][4] } : null,
    run(v) {
      const s = steam(v.P), hfw = 4.186 * v.Tfw, dh = s.hg - hfw, u = FUELS[v.fuel][2];
      const fuel = v.S * dh / (v.eff / 100 * v.gcv * 4.1868), er = v.S / fuel, day = fuel * v.hrs, cost = day * v.price, perT = cost / (v.S * v.hrs / 1000);
      return { rows: [['Fuel consumption', F(fuel, 0), u + '/h'], ['Fuel per day', F(day / 1000, 2), (u === 'kg' ? 't' : '1,000 Sm³') + '/day'],
        ['Evaporation ratio', F(er, 2), 'kg steam per ' + u + ' fuel'], ['Heat added per kg steam', F(dh / KJ, 0), 'kcal/kg'], ['Fuel cost', '₹ ' + F(cost, 0), 'per day'], ['Steam cost (fuel only)', '₹ ' + F(perT, 0), 'per tonne']],
        notes: [[`Saturated steam at ${v.P} barg is ${F(s.T, 1)} °C with h<sub>g</sub> = ${F(s.hg / KJ, 0)} kcal/kg.`]].concat(s.clipped ? [['Pressure is outside 0 to 20 barg; the steam table end value is used.', 'warn']] : []) };
    } };
  C.boilerEff = { title: 'Boiler efficiency, direct method', sub: 'From measured steam and fuel over the same period',
    inputs: [
      { k: 'S', label: 'Steam generated', unit: 'kg/h', v: 5000 }, { k: 'P', label: 'Steam pressure', unit: 'barg', v: 10 },
      { k: 'Tfw', label: 'Feed water temperature', unit: '°C', v: 80 }, { k: 'fu', label: 'Fuel used', unit: 'kg/h or Sm³/h', v: 1000 },
      { k: 'gcv', label: 'Fuel GCV', unit: 'kcal/kg or /Sm³', v: 4000 }],
    run(v) {
      const s = steam(v.P), dh = s.hg - 4.186 * v.Tfw, eff = v.S * dh / (v.fu * v.gcv * 4.1868) * 100, er = v.S / v.fu;
      const band = eff > 95 ? ['Above 95 % is not possible on GCV: check the steam meter, fuel weight or GCV.', 'bad'] : eff < 65 ? ['Low. Check excess air, unburnt carbon in ash, blowdown and insulation.', 'warn'] : ['Within the usual range for this kind of boiler.', 'good'];
      return { rows: [['Boiler efficiency', F(eff, 1), '%'], ['Evaporation ratio', F(er, 2), 'kg steam per unit fuel'], ['Heat to steam', F(v.S * dh / KJ, 0), 'kcal/h']], notes: [band] };
    } };
  C.flash = { title: 'Flash steam from condensate', sub: 'How much condensate flashes when its pressure drops',
    inputs: [
      { k: 'm', label: 'Condensate flow', unit: 'kg/h', v: 2000 }, { k: 'P1', label: 'Condensate pressure (trap inlet)', unit: 'barg', v: 8 },
      { k: 'P2', label: 'Flash vessel / return pressure', unit: 'barg', v: 0.5 }, { k: 'cost', label: 'Steam cost', unit: '₹/tonne', v: 2500 }, { k: 'hrs', label: 'Hours per year', unit: 'h', v: 7200 }],
    run(v) {
      if (v.P2 >= v.P1) return { rows: [], notes: [['The flash pressure must be lower than the condensate pressure.', 'bad']] };
      const a = steam(v.P1), b = steam(v.P2), x = Math.max(0, (a.hf - b.hf) / b.hfg), fl = x * v.m;
      return { rows: [['Flash fraction', F(x * 100, 1), '%'], ['Flash steam', F(fl, 0), 'kg/h'], ['Low-pressure steam value', '₹ ' + F(fl / 1000 * v.cost * v.hrs / 1e5, 2), 'lakh per year']],
        notes: [[`h<sub>f</sub> falls from ${F(a.hf / KJ, 0)} to ${F(b.hf / KJ, 0)} kcal/kg; that heat boils off part of the condensate.`], ['Recovered only if a flash vessel feeds a low-pressure user; otherwise it vents.']] };
    } };
  C.condensate = { title: 'Condensate recovery savings', sub: 'Fuel and water saved by returning hot condensate',
    inputs: [
      { k: 'm', label: 'Condensate returned', unit: 'kg/h', v: 3000 }, { k: 'Tc', label: 'Condensate temperature at feed tank', unit: '°C', v: 90 },
      { k: 'Tm', label: 'Make-up water temperature', unit: '°C', v: 30 }, { k: 'fuel', label: 'Fuel', type: 'sel', v: 'coal', opts: Object.entries(FUELS).map(([k, f]) => [k, f[0]]) },
      { k: 'gcv', label: 'Fuel GCV', unit: 'kcal/kg or /Sm³', v: 4000 }, { k: 'eff', label: 'Boiler efficiency', unit: '%', v: 75 },
      { k: 'price', label: 'Fuel price', unit: '₹ per kg or Sm³', v: 8 }, { k: 'wat', label: 'Treated water cost', unit: '₹/m³', v: 60 }, { k: 'hrs', label: 'Hours per year', unit: 'h', v: 7200 }],
    onSel: (k, v) => k === 'fuel' ? { gcv: FUELS[v][1], eff: FUELS[v][3], price: FUELS[v][4] } : null,
    run(v) {
      const q = v.m * 4.186 * (v.Tc - v.Tm), fuel = q / (v.eff / 100 * v.gcv * 4.1868), u = FUELS[v.fuel][2];
      const fc = fuel * v.price * v.hrs, wc = v.m / 1000 * v.wat * v.hrs;
      return { rows: [['Heat recovered', F(q / KJ, 0), 'kcal/h'], ['Fuel saved', F(fuel, 1), u + '/h'], ['Fuel saving', '₹ ' + F(fc / 1e5, 2), 'lakh per year'],
        ['Water saved', F(v.m / 1000 * 24, 0), 'm³/day'], ['Water and treatment saving', '₹ ' + F(wc / 1e5, 2), 'lakh per year'], ['Total', '₹ ' + F((fc + wc) / 1e5, 2), 'lakh per year']],
        notes: [['Each 6 °C rise in feed water temperature saves roughly 1 % of boiler fuel.']] };
    } };
  C.steamLeak = { title: 'Steam leak or failed trap loss', sub: 'Napier’s orifice formula, an upper estimate',
    inputs: [
      { k: 'd', label: 'Hole or orifice diameter', unit: 'mm', v: 3 }, { k: 'P', label: 'Steam pressure', unit: 'barg', v: 7 }, { k: 'n', label: 'Number of such leaks', unit: '', v: 1 },
      { k: 'cost', label: 'Steam cost', unit: '₹/tonne', v: 2500 }, { k: 'hrs', label: 'Hours per year', unit: 'h', v: 8000 }],
    run(v) {
      const m = 0.412 * v.d * v.d * (v.P + PATM) * v.n, yr = m / 1000 * v.hrs;
      return { rows: [['Steam lost', F(m, 1), 'kg/h'], ['Per year', F(yr, 0), 'tonnes'], ['Cost', '₹ ' + F(yr * v.cost / 1e5, 2), 'lakh per year']],
        notes: [['Napier: m (kg/h) ≈ 0.412 × d² (mm²) × P (bar abs). It assumes a clean sharp hole; a trap blowing partly open loses less.']] };
    } };

  /* ---------------- Cooling tower ---------------- */
  C.ctPerf = { title: 'Cooling tower performance', sub: 'Range, approach, effectiveness and heat rejected',
    inputs: [
      { k: 'Q', label: 'Circulating water flow', unit: 'm³/h', v: 500 }, { k: 'Thw', label: 'Hot water in', unit: '°C', v: 37 },
      { k: 'Tcw', label: 'Cold water out', unit: '°C', v: 32 }, { k: 'Twb', label: 'Ambient wet bulb', unit: '°C', v: 28 }],
    run(v) {
      const R = v.Thw - v.Tcw, A = v.Tcw - v.Twb;
      if (R <= 0 || A <= 0) return { rows: [], notes: [['Hot water must be warmer than cold water, and cold water warmer than the wet bulb.', 'bad']] };
      const eff = R / (R + A) * 100, kw = v.Q * 1000 / 3600 * 4.186 * R, E = 0.00085 * 1.8 * v.Q * R;
      const note = A < 2.5 ? ['An approach under about 2.5 °C is hard to reach; check the wet bulb reading.', 'warn'] : A > 6 ? ['A wide approach usually means fouled fill, poor distribution or low air flow.', 'warn'] : ['Approach is in the normal 3 to 5 °C band.', 'good'];
      return { rows: [['Range', F(R, 1), '°C'], ['Approach', F(A, 1), '°C'], ['Effectiveness', F(eff, 0), '%'], ['Heat rejected', F(kw * 3600 / KJ, 0), 'kcal/h'], ['Heat rejected', F(kw / TR, 0), 'TR'], ['Evaporation loss', F(E, 2), 'm³/h']], notes: [note] };
    } };
  C.ctWater = { title: 'Make-up, blowdown and cycles of concentration', sub: 'Water balance of a cooling tower',
    inputs: [
      { k: 'Q', label: 'Circulating water flow', unit: 'm³/h', v: 500 }, { k: 'R', label: 'Range', unit: '°C', v: 5 },
      { k: 'mode', label: 'Cycles from', type: 'sel', v: 'coc', opts: [['coc', 'I know the COC'], ['tds', 'Conductivity or TDS readings']] },
      { k: 'coc', label: 'Cycles of concentration (COC)', unit: '', v: 4, show: v => v.mode === 'coc' },
      { k: 'tc', label: 'Circulating water TDS or conductivity', unit: 'ppm or µS/cm', v: 1600, show: v => v.mode === 'tds' },
      { k: 'tm', label: 'Make-up water TDS or conductivity', unit: 'same unit', v: 400, show: v => v.mode === 'tds' },
      { k: 'drift', label: 'Drift loss', unit: '% of flow', v: 0.02 }, { k: 'wat', label: 'Make-up water cost', unit: '₹/m³', v: 30 }],
    run(v) {
      const coc = v.mode === 'tds' ? v.tc / v.tm : v.coc;
      if (!(coc > 1)) return { rows: [], notes: [['Cycles must be more than 1.', 'bad']] };
      const E = 0.00085 * 1.8 * v.Q * v.R, D = v.drift / 100 * v.Q, B = Math.max(0, E / (coc - 1) - D), M = E + B + D;
      return { rows: [['Cycles of concentration', F(coc, 1), ''], ['Evaporation', F(E, 2), 'm³/h'], ['Drift', F(D, 2), 'm³/h'], ['Blowdown', F(B, 2), 'm³/h'], ['Make-up', F(M, 2), 'm³/h'], ['Make-up per day', F(M * 24, 0), 'm³/day'], ['Make-up cost', '₹ ' + F(M * 24 * 365 * v.wat / 1e5, 2), 'lakh per year']],
        notes: [[`Going from ${F(coc, 1)} to ${F(coc + 1, 1)} cycles would cut make-up to ${F(E * (coc + 1) / coc, 2)} m³/h (blowdown ${F(Math.max(0, E / coc - D), 2)} m³/h).`], ['Higher cycles need good chemical treatment for scale and corrosion.']] };
    } };
  C.cwFlow = { title: 'Cooling water flow for a heat load', sub: 'How much water a condenser or cooler needs',
    inputs: [{ k: 'kc', label: 'Heat to remove', unit: 'kcal/h', v: 300000 }, { k: 'dT', label: 'Water temperature rise', unit: '°C', v: 5 }],
    run(v) { const q = v.kc / (1.0 * v.dT) / 1000; return { rows: [['Water flow', F(q, 1), 'm³/h'], ['Heat load', F(v.kc / TRK, 1), 'TR']], notes: [['Q (m³/h) = heat (kcal/h) ÷ (1 kcal/kg·°C × ΔT × 1,000 kg/m³). 1 TR = 3,024 kcal/h.']] }; } };

  /* ---------------- Chillers & VAM ---------------- */
  const coolInputs = [{ k: 'fl', label: 'Fluid', type: 'sel', v: 'water', opts: Object.entries(COOL).map(([k, c]) => [k, c[0]]) },
    { k: 'cp', label: 'Specific heat', unit: 'kcal/kg·°C', v: 1.0 }, { k: 'rho', label: 'Density', unit: 'kg/m³', v: 1000 }];
  C.chillerTR = { title: 'Chiller load and kW/TR', sub: 'Tonnage from flow and ΔT, then efficiency from power',
    inputs: [{ k: 'Q', label: 'Chilled water or brine flow', unit: 'm³/h', v: 120 }, { k: 'Tin', label: 'Return (inlet) temperature', unit: '°C', v: 12 }, { k: 'Tout', label: 'Supply (outlet) temperature', unit: '°C', v: 7 }]
      .concat(coolInputs, [{ k: 'kw', label: 'Chiller power input (measured)', unit: 'kW', v: 140 }]),
    onSel: (k, v) => k === 'fl' ? { cp: COOL[v][1], rho: COOL[v][2] } : null,
    run(v) {
      const dT = v.Tin - v.Tout; if (dT <= 0) return { rows: [], notes: [['Return must be warmer than supply.', 'bad']] };
      const kwth = v.Q * v.rho / 3600 * v.cp * KJ * dT, tr = kwth / TR, kwtr = v.kw / tr, cop = kwth / v.kw;
      const band = v.Tout < 0 ? ['Brine at sub-zero temperatures needs much more power per TR; compare with chillers at the same temperature.', 'warn'] : kwtr < 0.55 ? ['Very good, or check the meters.', 'good'] : kwtr <= 0.8 ? ['Typical of a water-cooled screw or centrifugal chiller.', 'good'] : kwtr <= 1.3 ? ['Typical of an air-cooled chiller, or a water-cooled one with fouled tubes or a warm condenser.', 'warn'] : ['High. Check condenser water temperature, refrigerant charge and part-load running.', 'bad'];
      return { rows: [['Cooling delivered', F(tr, 1), 'TR'], ['Cooling delivered', F(v.Q * v.rho * v.cp * dT, 0), 'kcal/h'], ['Specific power', F(kwtr, 2), 'kW/TR'], ['COP', F(cop, 2), ''], ['Heat to cooling tower', F((kwth + v.kw) / TR, 0), 'TR (approx.)']], notes: [band] };
    } };
  const VAM = { de: ['Double-effect, steam (8–9 barg)', 1.3, 8], se: ['Single-effect, steam (≈1 barg)', 0.7, 1], hw: ['Single-effect, hot water (85–95 °C)', 0.7, null] };
  C.vam = { title: 'VAM steam or hot-water consumption', sub: 'Vapour absorption machine: heat input for a cooling load',
    inputs: [{ k: 'tr', label: 'Cooling load', unit: 'TR', v: 200 }, { k: 'type', label: 'Machine type', type: 'sel', v: 'de', opts: Object.entries(VAM).map(([k, m]) => [k, m[0]]) },
      { k: 'cop', label: 'COP', unit: '', v: 1.3 }, { k: 'P', label: 'Steam pressure', unit: 'barg', v: 8, show: v => v.type !== 'hw' },
      { k: 'dT', label: 'Hot water temperature drop', unit: '°C', v: 10, show: v => v.type === 'hw' }],
    onSel: (k, v) => k === 'type' ? Object.assign({ cop: VAM[v][1] }, VAM[v][2] != null ? { P: VAM[v][2] } : {}) : null,
    run(v) {
      const kwc = v.tr * TR, heat = kwc / v.cop, ct = kwc + heat, rows = [['Heat input', F(heat * 3600 / KJ, 0), 'kcal/h']];
      if (v.type === 'hw') rows.push(['Hot water flow', F(heat * 3600 / KJ / (1.0 * v.dT) / 1000, 1), 'm³/h']);
      else { const s = steam(v.P), kg = heat * 3600 / s.hfg; rows.push(['Steam consumption', F(kg, 0), 'kg/h'], ['Specific steam', F(kg / v.tr, 2), 'kg/h per TR']); }
      rows.push(['Heat to cooling tower', F(ct / TR, 0), 'TR'], ['Cooling tower size vs cooling load', F(ct / kwc, 2), '× (electric chiller ≈ 1.2–1.25 ×)']);
      return { rows, notes: [['A VAM rejects its heat input as well as the cooling load, so it needs a bigger cooling tower and more condenser water than an electric chiller.']] };
    } };
  C.chillerVsVam = { title: 'Electric chiller vs VAM running cost', sub: 'Which is cheaper per year for the same cooling',
    inputs: [{ k: 'tr', label: 'Average cooling load', unit: 'TR', v: 200 }, { k: 'hrs', label: 'Running hours per year', unit: 'h', v: 6000 },
      { k: 'kwtr', label: 'Electric chiller kW/TR (incl. CT and pumps share)', unit: 'kW/TR', v: 0.85 }, { k: 'pc', label: 'Power cost', unit: '₹/kWh', v: 8 },
      { k: 'stm', label: 'VAM specific steam', unit: 'kg/h per TR', v: 4.6 }, { k: 'sc', label: 'Steam cost', unit: '₹/tonne', v: 2500 },
      { k: 'aux', label: 'VAM auxiliary power (pumps, CT fans)', unit: 'kW/TR', v: 0.15 }],
    run(v) {
      const e = v.tr * v.kwtr * v.hrs * v.pc, sv = v.tr * v.stm / 1000 * v.hrs * v.sc + v.tr * v.aux * v.hrs * v.pc;
      const be = (v.kwtr - v.aux) * v.pc / (v.stm / 1000);
      const win = e < sv ? ['Electric chiller is cheaper by ₹ ' + F((sv - e) / 1e5, 1) + ' lakh per year.', 'good'] : ['VAM is cheaper by ₹ ' + F((e - sv) / 1e5, 1) + ' lakh per year.', 'good'];
      return { rows: [['Electric chiller', '₹ ' + F(e / 1e5, 1), 'lakh per year'], ['VAM', '₹ ' + F(sv / 1e5, 1), 'lakh per year'], ['Break-even steam cost', '₹ ' + F(be, 0), 'per tonne']],
        notes: [win, ['VAM pays when steam is cheap or free: waste heat, exhaust, back-pressure steam or a cheap solid-fuel boiler.']] };
    } };

  /* ---------------- Compressed air & nitrogen ---------------- */
  C.airLeak = { title: 'Compressed air leak cost', sub: 'Flow through a hole and the power wasted',
    inputs: [{ k: 'd', label: 'Leak hole diameter', unit: 'mm', v: 3 }, { k: 'P', label: 'Line pressure', unit: 'barg', v: 7 }, { k: 'n', label: 'Number of such leaks', unit: '', v: 10 },
      { k: 'cd', label: 'Discharge coefficient', unit: '', v: 0.65 }, { k: 'sp', label: 'Compressor specific power', unit: 'kW per m³/min', v: 6.5 },
      { k: 'pc', label: 'Power cost', unit: '₹/kWh', v: 8 }, { k: 'hrs', label: 'Hours per year', unit: 'h', v: 8000 }],
    run(v) {
      const A = Math.PI / 4 * Math.pow(v.d / 1000, 2), P0 = (v.P + PATM) * 1e5, k = 1.4, R = 287, T = 293.15;
      const m = v.cd * A * P0 * Math.sqrt(k / (R * T) * Math.pow(2 / (k + 1), (k + 1) / (k - 1))); // kg/s, choked
      const fad = m / 1.204 * 60 * v.n, kw = fad * v.sp, cost = kw * v.hrs * v.pc;
      return { rows: [['Air lost', F(fad, 2), 'm³/min free air'], ['Air lost', F(fad * 35.31, 0), 'cfm'], ['Power wasted', F(kw, 1), 'kW'], ['Cost', '₹ ' + F(cost / 1e5, 2), 'lakh per year']],
        notes: [['Choked flow through a sharp hole. Leaks are usually 20–30 % of compressor output in plants without a leak programme.']] };
    } };
  C.receiver = { title: 'Air receiver size', sub: 'Volume to cover a demand peak or a compressor stop',
    inputs: [{ k: 'q', label: 'Air demand to cover', unit: 'm³/min free air', v: 10 }, { k: 't', label: 'For how long', unit: 'min', v: 1 },
      { k: 'p1', label: 'Pressure at start', unit: 'barg', v: 7.5 }, { k: 'p2', label: 'Lowest allowed pressure', unit: 'barg', v: 6.5 }],
    run(v) {
      if (v.p1 <= v.p2) return { rows: [], notes: [['Starting pressure must be above the lowest allowed pressure.', 'bad']] };
      const V = v.q * v.t * PATM / (v.p1 - v.p2);
      return { rows: [['Receiver volume', F(V, 2), 'm³'], ['Receiver volume', F(V * 1000, 0), 'litres']], notes: [['V = Q × t × P<sub>atm</sub> ÷ (P<sub>1</sub> − P<sub>2</sub>). Pick the next standard size up.']] };
    } };
  C.compPower = { title: 'Compressor power', sub: 'Ideal (adiabatic) power and shaft power for a duty',
    inputs: [{ k: 'q', label: 'Free air delivery', unit: 'm³/min', v: 10 }, { k: 'p', label: 'Discharge pressure', unit: 'barg', v: 7 },
      { k: 'st', label: 'Stages', type: 'sel', v: '1', opts: [['1', 'Single stage'], ['2', 'Two stage']] }, { k: 'eta', label: 'Overall efficiency', unit: '%', v: 75 },
      { k: 'pc', label: 'Power cost', unit: '₹/kWh', v: 8 }, { k: 'hrs', label: 'Hours per year', unit: 'h', v: 8000 }],
    run(v) {
      const k = 1.4, n = +v.st, P1 = PATM * 100, Q = v.q / 60, r = (v.p + PATM) / PATM;
      const ad = n * k / (k - 1) * P1 * Q * (Math.pow(r, (k - 1) / (n * k)) - 1), sh = ad / (v.eta / 100);
      return { rows: [['Adiabatic power', F(ad, 1), 'kW'], ['Shaft power', F(sh, 1), 'kW'], ['Specific power', F(sh / v.q, 2), 'kW per m³/min'], ['Running cost', '₹ ' + F(sh * v.hrs * v.pc / 1e5, 1), 'lakh per year']],
        notes: [['Each 1 bar of extra discharge pressure costs about 6–8 % more power. Run at the lowest pressure the users need.']] };
    } };
  C.n2Purge = { title: 'Nitrogen for inerting a vessel', sub: 'Pressure purge, vacuum purge or sweep: cycles and N₂ used',
    inputs: [{ k: 'V', label: 'Vessel gas space', unit: 'm³', v: 6 }, { k: 'm', label: 'Method', type: 'sel', v: 'press', opts: [['press', 'Pressure purge'], ['vac', 'Vacuum purge'], ['sweep', 'Sweep (continuous flow-through)']] },
      { k: 'ph', label: 'Nitrogen pressure', unit: 'barg', v: 2, show: v => v.m === 'press' }, { k: 'pv', label: 'Vacuum reached', unit: 'mbar abs', v: 200, show: v => v.m === 'vac' },
      { k: 'c0', label: 'Starting oxygen', unit: '%', v: 21 }, { k: 'c1', label: 'Target oxygen', unit: '%', v: 8 }, { k: 'cost', label: 'Nitrogen cost', unit: '₹/Nm³', v: 12 }],
    run(v) {
      if (!(v.c1 > 0 && v.c1 < v.c0)) return { rows: [], notes: [['Target oxygen must be above 0 and below the starting value.', 'bad']] };
      let n, nm3, rows = [];
      if (v.m === 'sweep') { nm3 = v.V * Math.log(v.c0 / v.c1); rows.push(['Nitrogen needed (ideal mixing)', F(nm3, 1), 'Nm³'], ['With a 1.5 × mixing allowance', F(nm3 * 1.5, 1), 'Nm³']); }
      else {
        const lo = v.m === 'press' ? PATM : v.pv / 1000, hi = v.m === 'press' ? v.ph + PATM : PATM, r = lo / hi;
        n = Math.ceil(Math.log(v.c1 / v.c0) / Math.log(r)); nm3 = n * v.V * (hi - lo) / PATM;
        rows.push(['Cycles needed', F(n, 0), ''], ['Oxygen after these cycles', F(v.c0 * Math.pow(r, n), 2), '%'], ['Nitrogen used', F(nm3, 1), 'Nm³']);
      }
      rows.push(['Nitrogen cost', '₹ ' + F((v.m === 'sweep' ? nm3 * 1.5 : nm3) * v.cost, 0), 'per inerting']);
      return { rows, notes: [['Confirm the oxygen with an analyser. Most solvent vapours cannot burn below about 10 % O₂; plants commonly aim for 8 % or less.']] };
    } };
  C.n2Blanket = { title: 'Nitrogen for blanketing while emptying', sub: 'Gas needed to replace liquid pumped out of a blanketed tank',
    inputs: [{ k: 'L', label: 'Liquid pumped out', unit: 'm³/h', v: 20 }, { k: 'p', label: 'Blanket pressure', unit: 'mbarg', v: 50 }, { k: 't', label: 'Gas temperature', unit: '°C', v: 30 }, { k: 'h', label: 'Pumping hours per day', unit: 'h', v: 4 }],
    run(v) { const nm3 = v.L * (PATM + v.p / 1000) / PATM * 273.15 / (v.t + 273.15); return { rows: [['Nitrogen rate', F(nm3, 1), 'Nm³/h'], ['Per day', F(nm3 * v.h, 0), 'Nm³/day']], notes: [['Size the N₂ regulator for the fastest pump-out, plus thermal in-breathing when a warm tank cools in rain.']] }; } };

  /* ---------------- Water, DG & power ---------------- */
  C.dg = { title: 'DG set fuel and cost per unit', sub: 'Diesel use, loading and ₹/kWh compared with the grid',
    inputs: [{ k: 'kva', label: 'DG rating', unit: 'kVA', v: 1010 }, { k: 'kw', label: 'Average load', unit: 'kW', v: 560 }, { k: 'sec', label: 'Specific energy (from log)', unit: 'kWh per litre', v: 3.4 },
      { k: 'dp', label: 'Diesel price', unit: '₹/litre', v: 90 }, { k: 'grid', label: 'Grid power cost', unit: '₹/kWh', v: 8 }, { k: 'h', label: 'DG hours per month', unit: 'h', v: 60 }],
    run(v) {
      const load = v.kw / (v.kva * 0.8) * 100, lph = v.kw / v.sec, unit = v.dp / v.sec, extra = (unit - v.grid) * v.kw * v.h;
      const band = load < 40 ? ['Below about 40 % load the kWh per litre drops and engines wet-stack. Run fewer DG sets at higher load.', 'warn'] : load > 85 ? ['Running above about 85 % leaves little margin for motor starts.', 'warn'] : ['Loading is in the efficient range.', 'good'];
      return { rows: [['DG loading', F(load, 0), '% (at 0.8 PF)'], ['Diesel use', F(lph, 0), 'litres/h'], ['Cost of DG power', '₹ ' + F(unit, 2), 'per kWh'], ['Extra cost over grid', '₹ ' + F(extra / 1e5, 2), 'lakh per month']], notes: [band] };
    } };
  C.pf = { title: 'Power factor correction', sub: 'Capacitor kVAR to raise the power factor',
    inputs: [{ k: 'kw', label: 'Load', unit: 'kW', v: 800 }, { k: 'pf1', label: 'Present power factor', unit: '', v: 0.82 }, { k: 'pf2', label: 'Target power factor', unit: '', v: 0.98 }, { k: 'V', label: 'Supply voltage (line)', unit: 'V', v: 415 }],
    run(v) {
      if (!(v.pf1 > 0 && v.pf1 < 1 && v.pf2 > v.pf1 && v.pf2 <= 1)) return { rows: [], notes: [['Power factors must be between 0 and 1, with the target above the present value.', 'bad']] };
      const t = p => Math.tan(Math.acos(p)), kvar = v.kw * (t(v.pf1) - t(v.pf2)), k1 = v.kw / v.pf1, k2 = v.kw / v.pf2, I = k => k * 1000 / (Math.sqrt(3) * v.V);
      return { rows: [['Capacitor needed', F(kvar, 0), 'kVAR'], ['kVA before → after', F(k1, 0) + ' → ' + F(k2, 0), 'kVA'], ['Current before → after', F(I(k1), 0) + ' → ' + F(I(k2), 0), 'A'], ['Current reduced by', F((1 - k2 / k1) * 100, 0), '%']],
        notes: [['Lower current means lower cable and transformer losses, and less kVA demand charge. Use detuned capacitors where there are VFDs (harmonics).']] };
    } };
  C.vfd = { title: 'VFD savings on a pump or fan', sub: 'Affinity laws: power falls with the cube of speed',
    inputs: [{ k: 'kw', label: 'Motor input power at full flow', unit: 'kW', v: 45 }, { k: 'f', label: 'Flow actually needed', unit: '% of full flow', v: 70 },
      { k: 'sh', label: 'Static head share of total head', unit: '%', v: 0 }, { k: 'loss', label: 'VFD loss', unit: '%', v: 3 }, { k: 'pc', label: 'Power cost', unit: '₹/kWh', v: 8 }, { k: 'hrs', label: 'Hours per year', unit: 'h', v: 8000 },
      { k: 'thr', label: 'Power drawn now with a throttled valve', unit: '% of full-flow power', v: 90 }],
    run(v) {
      const q = v.f / 100, s = v.sh / 100, p = Math.min(1, (s + (1 - s) * q * q) * q) * (1 + v.loss / 100); // power ∝ flow × head; head = static + friction ∝ q²
      const now = v.kw * v.thr / 100, vfd = v.kw * p, save = Math.max(0, now - vfd);
      return { rows: [['Power with VFD', F(vfd, 1), 'kW'], ['Power now (throttled)', F(now, 1), 'kW'], ['Saving', F(save, 1), 'kW'], ['Saving', '₹ ' + F(save * v.hrs * v.pc / 1e5, 2), 'lakh per year']],
        notes: [s > 0.4 ? ['With a high static head the cube law overstates the saving; the pump must still lift the static head at low speed.', 'warn'] : ['Cube law: at 80 % speed the power is about 51 %, at 70 % about 34 %.']] };
    } };
  C.motor = { title: 'Motor input power and loading', sub: 'From measured current, voltage and power factor',
    inputs: [{ k: 'V', label: 'Line voltage', unit: 'V', v: 415 }, { k: 'I', label: 'Measured current', unit: 'A', v: 52 }, { k: 'pf', label: 'Power factor', unit: '', v: 0.85 },
      { k: 'kwr', label: 'Motor rating', unit: 'kW', v: 37 }, { k: 'eta', label: 'Motor efficiency', unit: '%', v: 93 }, { k: 'pc', label: 'Power cost', unit: '₹/kWh', v: 8 }, { k: 'hrs', label: 'Hours per year', unit: 'h', v: 8000 }],
    run(v) {
      const kin = Math.sqrt(3) * v.V * v.I * v.pf / 1000, load = kin * v.eta / 100 / v.kwr * 100;
      const band = load < 50 ? ['Under 50 % loaded: efficiency and PF fall. Consider a smaller motor or star mode.', 'warn'] : load > 100 ? ['Overloaded. Check the duty and the motor temperature.', 'bad'] : ['Loading is fine.', 'good'];
      return { rows: [['Input power', F(kin, 1), 'kW'], ['Motor loading', F(load, 0), '%'], ['Energy cost', '₹ ' + F(kin * v.hrs * v.pc / 1e5, 2), 'lakh per year']], notes: [band] };
    } };
  C.ro = { title: 'RO plant recovery and rejection', sub: 'Mass balance from flows and TDS',
    inputs: [{ k: 'f', label: 'Feed flow', unit: 'm³/h', v: 20 }, { k: 'p', label: 'Permeate flow', unit: 'm³/h', v: 15 }, { k: 'tf', label: 'Feed TDS', unit: 'ppm', v: 900 }, { k: 'tp', label: 'Permeate TDS', unit: 'ppm', v: 25 }],
    run(v) {
      if (!(v.p < v.f)) return { rows: [], notes: [['Permeate must be less than the feed.', 'bad']] };
      const r = v.f - v.p, rec = v.p / v.f * 100, rej = (1 - v.tp / v.tf) * 100, tr = (v.f * v.tf - v.p * v.tp) / r;
      const band = rej < 95 ? ['Salt rejection under 95 % points to membrane damage, O-ring leaks or scaling.', 'warn'] : rec > 80 ? ['Above about 75–80 % recovery the scaling risk rises; check the antiscalant dose and the LSI.', 'warn'] : ['Recovery and rejection look normal.', 'good'];
      return { rows: [['Recovery', F(rec, 0), '%'], ['Salt rejection', F(rej, 1), '%'], ['Reject flow', F(r, 1), 'm³/h'], ['Reject TDS', F(tr, 0), 'ppm'], ['Concentration factor', F(tr / v.tf, 1), '×']], notes: [band] };
    } };

  /* ---------------- Reactor & vessel ---------------- */
  const HEADS = [['tori', 'Torispherical (Klöpper, DIN 28011)'], ['ell', '2:1 elliptical'], ['flat', 'Flat']];
  const HF = { tori: [0.1935, 0.0999, 0.90], ell: [0.25, 0.1309, 1.084], flat: [0, 0, 0.785] }; // depth/D, volume/D³, inside area/D²
  function vesselVol(D, H, head, L) { // m, m³
    const hd = HF[head][0] * D, Vd = HF[head][1] * D * D * D, A = Math.PI * D * D / 4, cap = (h) => hd > 0 ? Vd * Math.pow(h / hd, 2) * (3 - h / hd) / 2 : 0;
    if (L <= hd) return cap(Math.max(0, L));
    if (L <= hd + H) return Vd + A * (L - hd);
    const e = hd - Math.min(L - hd - H, hd); return Vd + A * H + Vd - cap(e);
  }
  const XHD = `IF({head}="tori",0.1935,IF({head}="ell",0.25,0))`, XVD = `IF({head}="tori",0.0999,IF({head}="ell",0.1309,0))`;
  C.dish = { title: 'Vessel volume and level', sub: 'Dished-end vessel: total volume, liquid volume at a level, and the level for a volume',
    inputs: [{ k: 'D', label: 'Inside diameter', unit: 'm', v: 1.6 }, { k: 'H', label: 'Straight side (tangent to tangent)', unit: 'm', v: 1.8 },
      { k: 'head', label: 'Dished ends', type: 'sel', v: 'tori', opts: HEADS }, { k: 'L', label: 'Liquid level from the bottom', unit: 'm', v: 1.5 },
      { k: 'Vt', label: 'Find the level for this volume', unit: 'litres', v: 3000 }],
    run(v) {
      const hd = HF[v.head][0] * v.D, Vd = HF[v.head][1] * Math.pow(v.D, 3), A = Math.PI * v.D * v.D / 4, Vt = 2 * Vd + A * v.H, Ht = 2 * hd + v.H;
      const VL = vesselVol(v.D, v.H, v.head, Math.min(v.L, Ht));
      let lo = 0, hi = Ht; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; vesselVol(v.D, v.H, v.head, m) * 1000 < v.Vt ? lo = m : hi = m; }
      const notes = [[`Dish depth ${F(hd * 1000, 0)} mm. Volumes are inside volumes; nozzles, agitator and baffles take a little space. The level-volume formula for the dished end is an ellipsoid approximation, within about 2 % for Klöpper heads.`]];
      if (v.L > Ht) notes.push(['The level is above the top of the vessel.', 'bad']);
      if (v.Vt / 1000 > Vt) notes.push(['The target volume is more than the vessel holds.', 'bad']);
      return { rows: [['Total vessel volume', F(Vt * 1000, 0), 'litres'], ['Liquid volume at that level', F(VL * 1000, 0), 'litres'], ['Fill', F(VL / Vt * 100, 0), '% of total'],
        ['Level for ' + F(v.Vt, 0) + ' litres', v.Vt / 1000 > Vt ? 'over full' : F((lo + hi) / 2, 3), 'm from bottom'], ['Bottom dish volume', F(Vd * 1000, 0), 'litres'], ['Per 10 cm of straight side', F(A * 100, 0), 'litres'], ['Overall inside height', F(Ht, 3), 'm']], notes };
    },
    xl: [['hd', 'Dish depth', `${XHD}*{D}`, 'm'], ['Vd', 'Bottom dish volume', `${XVD}*{D}^3*1000`, 'litres'], ['A', 'Cross-section area', `PI()*{D}^2/4`, 'm²'],
      ['Vt', 'Total vessel volume', `2*{Vd}+{A}*{H}*1000`, 'litres'],
      ['VL', 'Liquid volume at that level', `IF({L}<={hd},IF({hd}=0,0,{Vd}*({L}/{hd})^2*(3-{L}/{hd})/2),IF({L}<={hd}+{H},{Vd}+{A}*({L}-{hd})*1000,{Vd}+{A}*{H}*1000+{Vd}-IF({hd}=0,0,{Vd}*(({hd}-MIN({L}-{hd}-{H},{hd}))/{hd})^2*(3-({hd}-MIN({L}-{hd}-{H},{hd}))/{hd})/2)))`, 'litres'],
      ['fill', 'Fill', `{VL}/{Vt}*100`, '% of total'], ['p10', 'Per 10 cm of straight side', `{A}*100`, 'litres']] };

  C.batchFit = { title: 'Batch size feasibility', sub: 'Does every step fit between the minimum stirrable and maximum working volume?',
    inputs: [{ k: 'Vg', label: 'Reactor gross volume', unit: 'litres', v: 6300 }, { k: 'Vmin', label: 'Minimum stirrable volume', unit: 'litres', v: 800 }, { k: 'fmax', label: 'Maximum working fill', unit: '% of gross', v: 80 },
      { k: 's1', label: 'Step 1 volume (e.g. after charging)', unit: 'litres', v: 3500 }, { k: 's2', label: 'Step 2 volume (e.g. after dosing)', unit: 'litres', v: 5200 },
      { k: 's3', label: 'Step 3 volume (e.g. after quench)', unit: 'litres', v: 4800 }, { k: 's4', label: 'Step 4 volume (e.g. after distillation)', unit: 'litres', v: 1500 }],
    run(v) {
      const Vmax = v.Vg * v.fmax / 100, s = [v.s1, v.s2, v.s3, v.s4], st = x => x < v.Vmin ? 'Below minimum stir' : x > Vmax ? 'Overfills' : 'OK';
      const lo = v.Vmin / Math.min(...s), hi = Vmax / Math.max(...s), ok = s.every(x => st(x) === 'OK');
      const rows = [['Maximum working volume', F(Vmax, 0), 'litres']].concat(s.map((x, i) => ['Step ' + (i + 1) + ': ' + st(x), F(x / v.Vg * 100, 0), '% of gross']));
      rows.push(['Batch can be scaled between', lo <= hi ? F(lo, 2) + ' and ' + F(hi, 2) : 'no range', '× this batch']);
      return { rows, notes: [ok ? ['Every step fits.', 'good'] : lo <= hi ? [`Scale the batch by a factor between ${F(lo, 2)} and ${F(hi, 2)} so every step fits.`, 'warn'] : ['No single batch size fits both the smallest and the largest step. Split the batch, change the reactor, or change the step volumes.', 'bad'],
        ['Use 4 steps; if you have fewer, repeat a step volume.']] };
    },
    xl: [['Vmax', 'Maximum working volume', `{Vg}*{fmax}/100`, 'litres'], ['p1', 'Step 1, % of gross', `{s1}/{Vg}*100`, '%'], ['c1', 'Step 1', `IF({s1}<{Vmin},"Below minimum stir",IF({s1}>{Vmax},"Overfills","OK"))`, ''],
      ['p2', 'Step 2, % of gross', `{s2}/{Vg}*100`, '%'], ['c2', 'Step 2', `IF({s2}<{Vmin},"Below minimum stir",IF({s2}>{Vmax},"Overfills","OK"))`, ''],
      ['p3', 'Step 3, % of gross', `{s3}/{Vg}*100`, '%'], ['c3', 'Step 3', `IF({s3}<{Vmin},"Below minimum stir",IF({s3}>{Vmax},"Overfills","OK"))`, ''],
      ['p4', 'Step 4, % of gross', `{s4}/{Vg}*100`, '%'], ['c4', 'Step 4', `IF({s4}<{Vmin},"Below minimum stir",IF({s4}>{Vmax},"Overfills","OK"))`, ''],
      ['lo', 'Smallest scale factor', `{Vmin}/MIN({s1},{s2},{s3},{s4})`, '×'], ['hi', 'Largest scale factor', `{Vmax}/MAX({s1},{s2},{s3},{s4})`, '×']] };

  const WALLS = { ss: ['Stainless steel', 8, 14, 0], cs: ['Carbon steel', 10, 43, 0], gl: ['Glass-lined steel', 12, 43, 1.5], hast: ['Hastelloy', 8, 8.6, 0] }; // k in kcal/h·m·°C
  C.overallU = { title: 'Overall heat transfer coefficient (U)', sub: 'From the film coefficients, wall and fouling',
    inputs: [{ k: 'hp', label: 'Process-side film coefficient', unit: 'kcal/h·m²·°C', v: 700 }, { k: 'hj', label: 'Jacket-side film coefficient', unit: 'kcal/h·m²·°C', v: 1700 },
      { k: 'wall', label: 'Wall', type: 'sel', v: 'gl', opts: Object.entries(WALLS).map(([k, w]) => [k, w[0]]) }, { k: 't', label: 'Steel wall thickness', unit: 'mm', v: 12 }, { k: 'k', label: 'Wall conductivity', unit: 'kcal/h·m·°C', v: 43 },
      { k: 'tg', label: 'Glass thickness (0 if none)', unit: 'mm', v: 1.5 }, { k: 'rf', label: 'Total fouling allowance', unit: 'm²·h·°C/kcal', v: 0.00035 }],
    onSel: (k, val) => k === 'wall' ? { t: WALLS[val][1], k: WALLS[val][2], tg: WALLS[val][3] } : null,
    run(v) {
      const r = [1 / v.hp, v.t / 1000 / v.k, v.tg / 1000 / 0.86, v.rf, 1 / v.hj], R = r.reduce((a, b) => a + b, 0), p = x => F(x / R * 100, 0) + ' %';
      return { rows: [['Overall U', F(1 / R, 0), 'kcal/h·m²·°C'], ['Process film share', p(r[0]), 'of resistance'], ['Wall share', p(r[1]), 'of resistance'], ['Glass share', p(r[2]), 'of resistance'], ['Fouling share', p(r[3]), 'of resistance'], ['Jacket film share', p(r[4]), 'of resistance']],
        notes: [['Improve the largest share first. Glass is taken as 0.86 kcal/h·m·°C. Typical process films in agitated reactors are 250–1,300 kcal/h·m²·°C. 1 kcal/h·m²·°C = 1.163 W/m²·K.']] };
    },
    xl: [['R', 'Total resistance', `1/{hp}+{t}/1000/{k}+{tg}/1000/0.86+{rf}+1/{hj}`, 'm²·h·°C/kcal'], ['U', 'Overall U', `1/{R}`, 'kcal/h·m²·°C'],
      ['s1', 'Process film share', `1/{hp}/{R}*100`, '%'], ['s2', 'Wall share', `{t}/1000/{k}/{R}*100`, '%'], ['s3', 'Glass share', `{tg}/1000/0.86/{R}*100`, '%'], ['s4', 'Fouling share', `{rf}/{R}*100`, '%'], ['s5', 'Jacket film share', `1/{hj}/{R}*100`, '%']] };

  const SOLV = { tol: ['Toluene', 363, 1.70, 110.6], meoh: ['Methanol', 1100, 2.53, 64.7], etoh: ['Ethanol', 841, 2.44, 78.3], ipa: ['IPA', 667, 2.60, 82.3], ace: ['Acetone', 518, 2.17, 56.1],
    water: ['Water', 2257, 4.18, 100], mdc: ['MDC (dichloromethane)', 330, 1.19, 39.6], etac: ['Ethyl acetate', 367, 1.92, 77.1], thf: ['THF', 410, 1.72, 66], hep: ['n-Heptane', 317, 2.24, 98.4], chx: ['Cyclohexane', 358, 1.85, 80.7] };
  const SP_OPTS = [0.5, 1, 2, 3, 4, 5, 6, 8, 10].map(p => [String(p), p + ' barg (' + F(steam(p).T, 0) + ' °C)']);
  C.steamHeat = { title: 'Steam to heat a batch', sub: 'Steam consumption for heating a reactor: batch, vessel metal and losses',
    inputs: [{ k: 'm', label: 'Batch mass', unit: 'kg', v: 5000 }, { k: 'cp', label: 'Batch cp', unit: 'kcal/kg·°C', v: 0.5 }, { k: 'T1', label: 'Start temperature', unit: '°C', v: 30 }, { k: 'T2', label: 'Final temperature', unit: '°C', v: 90 },
      { k: 'mv', label: 'Vessel metal heated (shell, jacket, agitator)', unit: 'kg', v: 3000 }, { k: 'cpv', label: 'Metal cp (steel 0.12)', unit: 'kcal/kg·°C', v: 0.12 },
      { k: 'P', label: 'Steam pressure in the jacket', type: 'sel', v: '2', opts: SP_OPTS }, { k: 'lam', label: 'Latent heat at that pressure', unit: 'kcal/kg', v: 517 },
      { k: 'loss', label: 'Heat losses (lagging, vent, trap)', unit: '%', v: 10 }, { k: 't', label: 'Heating time', unit: 'h', v: 2 }],
    onSel: (k, val) => k === 'P' ? { lam: Math.round(steam(+val).hfg / KJ) } : null,
    run(v) {
      const s = steam(+v.P);
      if (!(v.T2 > v.T1)) return { rows: [], notes: [['The final temperature must be above the start temperature.', 'bad']] };
      const qb = v.m * v.cp * (v.T2 - v.T1), qv = v.mv * v.cpv * (v.T2 - v.T1), Q = (qb + qv) * (1 + v.loss / 100), S = Q / v.lam;
      return { rows: [['Heat to the batch', F(qb, 0), 'kcal'], ['Heat to the vessel metal', F(qv, 0), 'kcal'], ['Total with losses', F(Q, 0), 'kcal'],
        ['Steam needed', F(S, 0), 'kg per batch'], ['Steam per kg of batch', F(S / v.m, 3), 'kg/kg'], ['Average steam rate', F(S / v.t, 0), 'kg/h']],
        notes: [[`Steam at ${v.P} barg condenses at ${F(s.T, 1)} °C. Each kg gives up its latent heat; the condensate is taken to leave the trap at saturation, so no sensible heat is counted.`],
          s.T - v.T2 < 15 ? ['The final temperature is within 15 °C of the steam temperature, so the last part of the heating will be slow. Use higher-pressure steam or allow more time.', 'warn'] : ['The heating rate is highest at the start, when the batch is coldest, so the peak steam rate is above the average.']] };
    },
    xl: [['qb', 'Heat to the batch', `{m}*{cp}*({T2}-{T1})`, 'kcal'], ['qv', 'Heat to the vessel metal', `{mv}*{cpv}*({T2}-{T1})`, 'kcal'], ['Q', 'Total with losses', `({qb}+{qv})*(1+{loss}/100)`, 'kcal'],
      ['S', 'Steam needed', `{Q}/{lam}`, 'kg per batch'], ['Sk', 'Steam per kg of batch', `{S}/{m}`, 'kg/kg'], ['Sr', 'Average steam rate', `{S}/{t}`, 'kg/h']] };

  /* Multiple-effect evaporator (MEE): forward feed, equal driving force per effect.
     Each effect: heat from the previous effect's vapour (live steam for effect 1), less losses, heats or flashes the incoming
     liquor and evaporates water. Evaporation is linear in the live steam S, so S is solved directly. */
  const LAMW = T => 597.3 - 0.566 * T; // latent heat of water, kcal/kg at T °C
  const PWAT = T => 1.33322 * Math.pow(10, 8.07131 - 1730.63 / (233.426 + T)); // water vapour pressure, mbar
  function meeSolve(v) {
    const N = +v.N, s = steam(+v.P), Ts = s.T, lamS = s.hfg / KJ, E = v.F * (1 - v.xf / v.xp);
    const dT = (Ts - v.Tl - N * v.bpr) / N, t = [], tv = [Ts];
    for (let i = 1; i <= N; i++) { t[i] = tv[i - 1] - dT; tv[i] = t[i] - v.bpr; }
    const run = S => { let L = v.F, Tin = v.Tf, heat = S * lamS; const V = [];
      for (let i = 1; i <= N; i++) { const q = heat * (1 - v.loss / 100), w = (q - L * v.cp * (t[i] - Tin)) / LAMW(tv[i]); V.push(w); L -= w; Tin = t[i]; heat = w * LAMW(tv[i]); }
      return V; };
    const sum = a => a.reduce((x, y) => x + y, 0), V0 = sum(run(0)), S = (E - V0) / (sum(run(1)) - V0), V = run(S);
    return { N, Ts, lamS, E, dT, t, tv, S, V, econ: E / S, feedShare: v.F * v.cp * (t[1] - v.Tf) / (S * lamS * (1 - v.loss / 100)) };
  }
  C.mee = { title: 'MEE steam economy', sub: 'Live steam, steam economy and condenser load for a forward-feed multiple-effect evaporator',
    inputs: [{ k: 'F', label: 'Feed rate', unit: 'kg/h', v: 10000 }, { k: 'xf', label: 'Feed solids (TDS)', unit: '%', v: 5 }, { k: 'xp', label: 'Concentrate solids', unit: '%', v: 30 },
      { k: 'N', label: 'Number of effects', type: 'sel', v: '4', opts: [1, 2, 3, 4, 5, 6, 7].map(n => [String(n), n + (n === 1 ? ' effect' : ' effects')]) },
      { k: 'P', label: 'Live steam to the first effect', type: 'sel', v: '3', opts: SP_OPTS },
      { k: 'Tl', label: 'Last-effect vapour temperature (sets the vacuum)', unit: '°C', v: 55 },
      { k: 'bpr', label: 'Boiling point rise, average per effect', unit: '°C', v: 2 },
      { k: 'Tf', label: 'Feed temperature entering the first effect', unit: '°C', v: 40 },
      { k: 'cp', label: 'Liquor cp (dilute brine about 0.95)', unit: 'kcal/kg·°C', v: 0.95 },
      { k: 'loss', label: 'Heat loss per effect', unit: '%', v: 3 },
      { k: 'cw', label: 'Cooling water rise in the condenser', unit: '°C', v: 8 },
      { k: 'cost', label: 'Your steam cost', unit: '₹ per tonne', v: 3000 }],
    run(v) {
      if (!(v.xp > v.xf && v.xf >= 0)) return { rows: [], notes: [['The concentrate solids must be higher than the feed solids.', 'bad']] };
      const r = meeSolve(v);
      if (!(r.dT > 0)) return { rows: [], notes: [[`There is no temperature difference left to drive the effects: the steam condenses at ${F(r.Ts, 1)} °C, but the last effect and the boiling point rises take up all of it. Use higher-pressure steam, a deeper vacuum or fewer effects.`, 'bad']] };
      if (r.V.some(x => !(x > 0))) return { rows: [], notes: [['With this feed temperature the first effect only heats the feed and evaporates nothing. Preheat the feed or check the inputs.', 'bad']] };
      const cond = r.V[r.N - 1] * LAMW(r.tv[r.N]);
      const rows = [['Steam economy', F(r.econ, 2), 'kg water per kg steam'], ['Water evaporated', F(r.E, 0), 'kg/h'], ['Live steam', F(r.S, 0), 'kg/h'],
        ['Steam per kg of water evaporated', F(1 / r.econ, 3), 'kg/kg'], ['Concentrate out', F(v.F - r.E, 0), 'kg/h'], ['Steam condenses at', F(r.Ts, 1), '°C'],
        ['Driving force per effect', F(r.dT, 1), '°C'], ['Last-effect pressure', F(PWAT(r.tv[r.N]), 0), 'mbar abs']];
      for (let i = 1; i <= r.N; i++) rows.push([`Effect ${i}: boils at ${F(r.t[i], 1)} °C`, F(r.V[i - 1], 0), 'kg/h evaporated']);
      rows.push(['Condenser load', F(cond, 0), 'kcal/h'], ['Cooling water', F(cond / v.cw / 1000, 1), 'm³/h'], ['Steam cost per m³ evaporated', F(v.cost / r.econ, 0), '₹']);
      const notes = [['Steam economy = water evaporated ÷ live steam. A well-run forward-feed MEE with feed preheating usually reaches about 0.8 to 0.9 times the number of effects.', 'lead']];
      if (r.dT < 6) notes.push([`Only ${F(r.dT, 1)} °C of driving force per effect. The heating surface needed rises steeply below about 6 to 8 °C: fewer effects, higher steam pressure or a deeper vacuum.`, 'warn']);
      if (r.feedShare > 0.15) notes.push([`The feed enters ${F(r.t[1] - v.Tf, 0)} °C below the first effect's boiling point, so about ${F(100 * r.feedShare, 0)} % of the live steam only heats the feed. Preheating it with hot condensate or vapour from a later effect raises the economy.`, 'warn']);
      notes.push(['Model: forward feed, equal temperature difference per effect, latent heat of water at each effect, condensate leaving at saturation. Thermo- or mechanical vapour recompression (TVR, MVR) and feed preheating with live steam are not included. Use it to compare options; the supplier\'s heat and mass balance governs the design.']);
      return { rows, notes };
    } };

  C.batchTR = { title: 'Refrigeration needed to cool a batch', sub: 'Average and peak TR, brine flow and the UA the jacket must give',
    inputs: [{ k: 'm', label: 'Batch mass', unit: 'kg', v: 4000 }, { k: 'cp', label: 'Batch cp', unit: 'kcal/kg·°C', v: 0.48 }, { k: 'T1', label: 'Start temperature', unit: '°C', v: 40 }, { k: 'T2', label: 'Final temperature', unit: '°C', v: 5 },
      { k: 't', label: 'Cooling time wanted', unit: 'h', v: 3 }, { k: 'Tb', label: 'Brine supply temperature', unit: '°C', v: -10 }, { k: 'dTb', label: 'Brine temperature rise', unit: '°C', v: 5 },
      { k: 'cb', label: 'Brine cp', unit: 'kcal/kg·°C', v: 0.84 }, { k: 'q', label: 'Other heat (reaction, agitator)', unit: 'kcal/h', v: 4300 }, { k: 'loss', label: 'Losses and margin', unit: '%', v: 15 }],
    run(v) {
      if (!(v.T1 > v.T2 && v.T2 > v.Tb)) return { rows: [], notes: [['Need start > final > brine temperature.', 'bad']] };
      const avg = (v.m * v.cp * (v.T1 - v.T2) / v.t + v.q) * (1 + v.loss / 100), r = Math.log((v.T1 - v.Tb) / (v.T2 - v.Tb)), peak = (v.m * v.cp * (v.T1 - v.T2) / v.t * (v.T1 - v.Tb) * r / (v.T1 - v.T2) + v.q) * (1 + v.loss / 100);
      const UA = v.m * v.cp * r / v.t, bf = peak / (v.cb * v.dTb) / 1000;
      return { rows: [['Average load', F(avg / TRK, 1), 'TR'], ['Peak load (start of cooling)', F(peak / TRK, 1), 'TR'], ['Peak load', F(peak, 0), 'kcal/h'], ['Brine flow at peak', F(bf, 1), 'm³/h'], ['UA the jacket must give', F(UA, 0), 'kcal/h·°C']],
        notes: [['With a fixed jacket area, cooling is fastest at the start and slows as the batch approaches the brine temperature, so the chiller must cover the peak, not the average. Divide the UA by your U to get the area needed (overall U and area calculators on this page).']] };
    },
    xl: [['r', 'ln((T1−Tb)/(T2−Tb))', `LN(({T1}-{Tb})/({T2}-{Tb}))`, ''], ['avg', 'Average load', `({m}*{cp}*({T1}-{T2})/{t}+{q})*(1+{loss}/100)/3024`, 'TR'],
      ['pk', 'Peak load', `({m}*{cp}*({T1}-{T2})/{t}*({T1}-{Tb})*{r}/({T1}-{T2})+{q})*(1+{loss}/100)`, 'kcal/h'], ['pkTR', 'Peak load', `{pk}/3024`, 'TR'],
      ['bf', 'Brine flow at peak', `{pk}/({cb}*{dTb})/1000`, 'm³/h'], ['UA', 'UA the jacket must give', `{m}*{cp}*{r}/{t}`, 'kcal/h·°C']] };

  C.addTime = { title: 'Reagent addition time from RC1 data', sub: 'Shortest safe dosing time for the plant cooling, and the MTSR',
    inputs: [{ k: 'm', label: 'Batch mass at end of dosing', unit: 'kg', v: 3000 }, { k: 'cp', label: 'Batch cp', unit: 'kcal/kg·°C', v: 0.43 }, { k: 'Hr', label: 'Reaction heat (RC1)', unit: 'kcal per kg batch', v: 62 },
      { k: 'acc', label: 'Accumulation at end of dosing (RC1)', unit: '%', v: 15 }, { k: 'Tp', label: 'Reaction temperature', unit: '°C', v: 60 }, { k: 'MTT', label: 'MTT (boiling point or limit)', unit: '°C', v: 111 },
      { k: 'U', label: 'Overall U', unit: 'kcal/h·m²·°C', v: 300 }, { k: 'A', label: 'Wetted jacket area', unit: 'm²', v: 9 }, { k: 'Tj', label: 'Coolant temperature', unit: '°C', v: 30 }, { k: 'use', label: 'Use this much of the cooling', unit: '%', v: 70 }],
    run(v) {
      const Q = v.m * v.Hr, cool = v.U * v.A * (v.Tp - v.Tj), usable = cool * v.use / 100, td = Q * (1 - v.acc / 100) / usable, dTad = v.Hr / v.cp, mtsr = v.Tp + v.acc / 100 * dTad;
      return { rows: [['Shortest dosing time', F(td, 1), 'h'], ['Cooling capacity', F(cool, 0), 'kcal/h'], ['Heat release at that time', F(usable, 0), 'kcal/h'], ['Adiabatic temperature rise', F(dTad, 0), '°C'], ['MTSR', F(mtsr, 0), '°C']],
        notes: [mtsr >= v.MTT ? ['MTSR is above the MTT: a cooling failure would boil the batch or exceed the limit. Lower the accumulation (dose slower or hotter, if the chemistry allows) and check the relief case.', 'bad'] : ['MTSR stays below the MTT.', 'good'],
          ['Accumulation depends on the dosing time. Confirm with an RC1 run at the chosen time before using it in the plant.']] };
    },
    xl: [['Q', 'Total reaction heat', `{m}*{Hr}`, 'kcal'], ['cool', 'Cooling capacity', `{U}*{A}*({Tp}-{Tj})`, 'kcal/h'], ['td', 'Shortest dosing time', `{Q}*(1-{acc}/100)/({cool}*{use}/100)`, 'h'],
      ['dT', 'Adiabatic temperature rise', `{Hr}/{cp}`, '°C'], ['mtsr', 'MTSR', `{Tp}+{acc}/100*{dT}`, '°C'], ['ok', 'MTSR below MTT?', `IF({mtsr}<{MTT},"Yes","No")`, '']] };

  /* ---------------- Process: agitation, properties, drying, scrubbing ---------------- */
  const PRE = { water: ['Water', 997, 0.89, 18.02], meoh: ['Methanol', 791, 0.54, 32.04], etoh: ['Ethanol', 789, 1.07, 46.07], ipa: ['IPA', 786, 2.04, 60.1], ace: ['Acetone', 784, 0.31, 58.08],
    tol: ['Toluene', 867, 0.56, 92.14], mdc: ['MDC', 1326, 0.41, 84.93], etac: ['Ethyl acetate', 897, 0.42, 88.11], thf: ['THF', 889, 0.46, 72.11], hep: ['n-Heptane', 684, 0.39, 100.2],
    dmf: ['DMF', 944, 0.80, 73.09], acoh: ['Acetic acid', 1049, 1.13, 60.05], none: ['(not used)', 1000, 1, 100] };
  const comp = (i, d, w) => [{ k: 'c' + i, label: 'Component ' + i, type: 'sel', v: d, opts: Object.entries(PRE).map(([k, p]) => [k, p[0]]) }, { k: 'w' + i, label: 'Component ' + i + ' mass', unit: '%', v: w },
    { k: 'r' + i, label: 'Component ' + i + ' density', unit: 'kg/m³', v: PRE[d][1] }, { k: 'm' + i, label: 'Component ' + i + ' viscosity', unit: 'cP', v: PRE[d][2] }, { k: 'M' + i, label: 'Component ' + i + ' molar mass', unit: 'g/mol', v: PRE[d][3] }];
  C.mixProps = { title: 'Density and viscosity of a solvent mixture', sub: 'Ideal mixing rules for up to three liquids at about 25 °C',
    inputs: [].concat(comp(1, 'tol', 70), comp(2, 'meoh', 30), comp(3, 'none', 0)),
    onSel: (k, val) => { const i = k.slice(1); const p = PRE[val]; const o = {}; o['r' + i] = p[1]; o['m' + i] = p[2]; o['M' + i] = p[3]; if (val === 'none') o['w' + i] = 0; return o; },
    run(v) {
      const I = [1, 2, 3], W = I.reduce((a, i) => a + v['w' + i], 0); if (!(W > 0)) return { rows: [], notes: [['Enter at least one mass %.', 'bad']] };
      const rho = W / I.reduce((a, i) => a + v['w' + i] / v['r' + i], 0), mol = I.map(i => v['w' + i] / v['M' + i]), nt = mol.reduce((a, b) => a + b, 0), x = mol.map(m => m / nt);
      const mu = Math.exp(I.reduce((a, i, j) => a + (x[j] > 0 ? x[j] * Math.log(v['m' + i]) : 0), 0));
      const hasW = I.some(i => v['c' + i] === 'water' && v['w' + i] > 0), hasA = I.some(i => ['meoh', 'etoh', 'ipa', 'acoh', 'dmf'].includes(v['c' + i]) && v['w' + i] > 0);
      return { rows: [['Mixture density', F(rho, 0), 'kg/m³'], ['Mixture viscosity (estimate)', F(mu, 2), 'cP']].concat(I.filter(i => v['w' + i] > 0).map((i, j) => ['Mole fraction, component ' + i, F(x[i - 1], 3), ''])),
        notes: [hasW && hasA ? ['Water with alcohols, acids or DMF mixes far from ideal: the real viscosity can be twice the estimate (methanol-water peaks near 40 % methanol), and the volume shrinks a few %. Measure it for design.', 'warn'] : ['Density assumes volumes add; viscosity uses the Arrhenius (Grunberg-Nissan, G = 0) log rule on mole fractions.'], ['Mass % are normalised if they do not add to 100.']] };
    },
    xl: [['W', 'Total mass %', `{w1}+{w2}+{w3}`, '%'], ['rho', 'Mixture density', `{W}/({w1}/{r1}+{w2}/{r2}+{w3}/{r3})`, 'kg/m³'], ['n', 'Total moles (per 100 g)', `{w1}/{M1}+{w2}/{M2}+{w3}/{M3}`, ''],
      ['mu', 'Mixture viscosity (estimate)', `EXP(({w1}/{M1}*LN({m1})+{w2}/{M2}*LN({m2})+{w3}/{M3}*LN({m3}))/{n})`, 'cP']] };

  const ABS = { s3a: ['Molecular sieve 3A', 10], s4a: ['Molecular sieve 4A', 10], na2so4: ['Sodium sulphate (anhydrous)', 15], mgso4: ['Magnesium sulphate (anhydrous)', 20], sg: ['Silica gel', 10] };
  C.moisture = { title: 'Moisture absorbent requirement', sub: 'How much drying agent to bring a solvent down to a water specification',
    inputs: [{ k: 'V', label: 'Solvent volume', unit: 'litres', v: 2000 }, { k: 'rho', label: 'Solvent density', unit: 'kg/m³', v: 870 }, { k: 'w0', label: 'Water now (KF)', unit: 'ppm', v: 2000 },
      { k: 'w1', label: 'Water target', unit: 'ppm', v: 200 }, { k: 'ab', label: 'Absorbent', type: 'sel', v: 's3a', opts: Object.entries(ABS).map(([k, a]) => [k, a[0]]) },
      { k: 'cap', label: 'Working capacity', unit: 'g water per 100 g', v: 10 }, { k: 'sf', label: 'Safety factor', unit: '', v: 1.3 }],
    onSel: (k, val) => k === 'ab' ? { cap: ABS[val][1] } : null,
    run(v) {
      if (!(v.w0 > v.w1)) return { rows: [], notes: [['The target must be lower than the present water.', 'bad']] };
      const kg = v.V * v.rho / 1000, water = kg * (v.w0 - v.w1) / 1e6, ab = water / (v.cap / 100) * v.sf;
      return { rows: [['Absorbent needed', F(ab, 1), 'kg'], ['Water to remove', F(water, 2), 'kg'], ['Solvent mass', F(kg, 0), 'kg']],
        notes: [['Use 3A sieves for methanol, ethanol and other small molecules: 4A also takes up methanol. Working capacity is well below the saturation figure and falls with lower target water; confirm by a small trial with KF before and after.'], v.w1 < 100 && ['na2so4', 'mgso4', 'sg'].includes(v.ab) ? ['Salts and silica gel rarely reach below about 100 ppm; molecular sieves do better for very dry solvents.', 'warn'] : ['']].filter(n => n[0]) };
    },
    xl: [['kg', 'Solvent mass', `{V}*{rho}/1000`, 'kg'], ['water', 'Water to remove', `{kg}*({w0}-{w1})/1E6`, 'kg'], ['ab', 'Absorbent needed', `{water}/({cap}/100)*{sf}`, 'kg']] };

  // gas -> [label, MW, agent, agent MW, mol agent per mol gas, reaction, heat kcal per mol gas, product, product kg per kmol gas, saturation % (0 = none), default strength %, note]
  const POL = {
    hcl: ['HCl (hydrogen chloride)', 36.46, 'NaOH', 40.00, 1, 'HCl + NaOH → NaCl + H₂O', 31.2, 'NaCl', 58.44, 26, 10, 'A water stage first can recover hydrochloric acid; caustic polishes the outlet.'],
    hbr: ['HBr (hydrogen bromide)', 80.91, 'NaOH', 40.00, 1, 'HBr + NaOH → NaBr + H₂O', 33.7, 'NaBr', 102.89, 48, 10, ''],
    hf: ['HF (hydrogen fluoride)', 20.01, 'KOH', 56.11, 1, 'HF + KOH → KF + H₂O', 27.5, 'KF', 58.10, 48, 10, 'KOH, not NaOH: sodium fluoride saturates at about 4 % and scales the packing. No glass or glass-lined parts.'],
    so2: ['SO₂ (sulphur dioxide)', 64.07, 'NaOH', 40.00, 2, 'SO₂ + 2NaOH → Na₂SO₃ + H₂O', 39.3, 'Na₂SO₃', 126.04, 23, 10, 'Below about pH 9 sulphite turns to bisulphite and SO₂ starts to slip: change out on pH.'],
    cl2: ['Cl₂ (chlorine)', 70.90, 'NaOH', 40.00, 2, 'Cl₂ + 2NaOH → NaCl + NaOCl + H₂O', 23.9, 'NaCl + NaOCl', 132.88, 26, 10, 'Keep free caustic and the liquor below about 40 °C (chlorate forms when hot). Never let this liquor meet acid or ammonia.'],
    br2: ['Br₂ (bromine)', 159.81, 'NaOH', 40.00, 2, 'Br₂ + 2NaOH → NaBr + NaOBr + H₂O', 17.3, 'NaBr + NaOBr', 221.8, 40, 10, 'Sodium bisulphite or thiosulphate can be used instead to reduce bromine to bromide.'],
    cocl2: ['COCl₂ (phosgene)', 98.92, 'NaOH', 40.00, 4, 'COCl₂ + 4NaOH → Na₂CO₃ + 2NaCl + 2H₂O', 106.1, 'Na₂CO₃ + 2NaCl', 222.87, 17, 10, 'Generous excess, good contact time, phosgene detection at the outlet and a back-up destruct system (wet activated carbon).'],
    no2: ['NO₂ (nitrogen dioxide)', 46.01, 'H₂O₂', 34.01, 0.5, '2NO₂ + H₂O₂ → 2HNO₃', 34.7, 'HNO₃', 63.01, 0, 5, 'The nitric acid formed is neutralised in a following caustic stage.'],
    no: ['NO (nitric oxide)', 30.01, 'H₂O₂', 34.01, 1.5, '2NO + 3H₂O₂ → 2HNO₃ + 2H₂O', 71, 'HNO₃', 63.01, 0, 5, 'NO is barely soluble: the peroxide must oxidise it before it can be absorbed. Then neutralise the acid with caustic.'],
    hcn: ['HCN (hydrogen cyanide)', 27.03, 'NaOH', 40.00, 1, 'HCN + NaOH → NaCN + H₂O (then NaCN + NaOCl → NaOCN + NaCl)', 9.6, 'NaCN', 49.01, 37, 10, 'Keep pH above 11 in absorption. Then oxidise with hypochlorite (2.75 kg NaOCl per kg HCN) at pH above 10, or toxic cyanogen chloride forms.'],
    nh3: ['NH₃ (ammonia)', 17.03, 'H₂SO₄', 98.08, 0.5, '2NH₃ + H₂SO₄ → (NH₄)₂SO₄', 20.6, '(NH₄)₂SO₄', 66.07, 43, 10, 'Water absorbs ammonia but releases it again when warm; acid fixes it as ammonium sulphate. Same for volatile amines.'],
    h2s: ['H₂S (hydrogen sulphide)', 34.08, 'NaOH', 40.00, 1, 'H₂S + NaOH → NaHS + H₂O', 12.6, 'NaHS', 56.06, 37, 10, 'Spent liquor gives H₂S back with acid: keep it away from acid drains, or oxidise the sulphide with hypochlorite or peroxide.'],
    mesh: ['CH₃SH (methyl mercaptan)', 48.11, 'NaOH', 40.00, 1, 'CH₃SH + NaOH → CH₃SNa + H₂O', 10, 'CH₃SNa', 70.09, 40, 10, 'Odour threshold in the ppb range: follow with hypochlorite oxidation.'],
    co2: ['CO₂ (carbon dioxide, if it reaches a caustic scrubber)', 44.01, 'NaOH', 40.00, 2, 'CO₂ + 2NaOH → Na₂CO₃ + H₂O', 26.2, 'Na₂CO₃', 105.99, 17, 10, 'CO₂ is normally vented, not scrubbed. In a caustic scrubber it only uses caustic and sodium carbonate crystallises above about 17 %.'],
    so3: ['SO₃ (sulphur trioxide)', 80.06, 'none', 0, 0, 'SO₃ + H₂O → H₂SO₄ (in 98 % sulphuric acid)', 0, '', 0, 0, 10, 'Not for a caustic packed scrubber: SO₃ forms a fine acid mist that passes through. Absorb in 98 % H₂SO₄ and fit a candle-filter mist eliminator.'],
    h2: ['H₂ (hydrogen)', 2.016, 'none', 0, 0, 'Not absorbed by any scrubbing liquor', 0, '', 0, 0, 10, 'Do not scrub. Dedicated nitrogen-swept vent below 25 % of LEL (about 1 % H₂), hydrogen-rated (IIC) flame arrester, safe discharge height; flare or catalytic recombiner for large flows. Keep it out of the scrubber fan.'],
    co: ['CO (carbon monoxide)', 28.01, 'none', 0, 0, 'Not absorbed; destroyed by oxidation: 2CO + O₂ → 2CO₂', 0, '', 0, 0, 10, 'Do not scrub. Thermal or catalytic oxidiser or flare; small flows diluted through a stack checked for dispersion; fixed CO detectors (TLV 25 ppm).'],
    butane: ['Butane and light hydrocarbons', 58.12, 'none', 0, 0, 'Not absorbed by aqueous liquors', 0, '', 0, 0, 10, 'Do not scrub. Recover by refrigerated condensation, then thermal oxidiser or flare; nitrogen-swept header with flame arrester. Heavier than air.'],
  };
  const SCR_CP = 0.9; // kcal/kg.degC, dilute liquor
  C.scrubber = { title: 'Packed scrubber sizing and scrubbing solution', sub: 'Pick the gas: the scrubbing agent and reaction follow, then the column size and the solution needed',
    inputs: [{ k: 'pol', label: 'Gas to remove', type: 'sel', v: 'hcl', opts: Object.entries(POL).map(([k, p]) => [k, p[0]]) },
      { k: 'Q', label: 'Total vent gas flow', unit: 'Nm³/h', v: 500 }, { k: 'T', label: 'Gas temperature', unit: '°C', v: 40 },
      { k: 'pm', label: 'Pollutant load at peak', unit: 'kg/h', v: 5 }, { k: 'eff', label: 'Removal efficiency', unit: '%', v: 99 },
      { k: 'u', label: 'Design gas velocity', unit: 'm/s', v: 1.2 }, { k: 'htu', label: 'Height of a transfer unit (HTU)', unit: 'm', v: 0.5 }, { k: 'wr', label: 'Liquid wetting rate', unit: 'm³/m²·h', v: 12 },
      { k: 'st', label: 'Reagent per kg of gas (from the reaction)', unit: 'kg/kg', v: +(40 / 36.46).toFixed(3), show: v => POL[v.pol][2] !== 'none' },
      { k: 'cs', label: 'Reagent strength in the liquor', unit: 'wt %', v: 10, show: v => POL[v.pol][2] !== 'none' },
      { k: 'mb', label: 'Gas released per batch', unit: 'kg', v: 60, show: v => POL[v.pol][2] !== 'none' },
      { k: 'M', label: 'Liquor charge in the tank', unit: 'kg', v: 2000, show: v => POL[v.pol][2] !== 'none' },
      { k: 'cmin', label: 'Change-out (minimum free) strength', unit: 'wt %', v: 2, show: v => POL[v.pol][2] !== 'none' },
      { k: 'ex', label: 'Design excess on the reagent', unit: '%', v: 20, show: v => POL[v.pol][2] !== 'none' }],
    onSel: (k, val) => k === 'pol' && POL[val][2] !== 'none' ? { st: +(POL[val][4] * POL[val][3] / POL[val][1]).toFixed(3), cs: POL[val][10], cmin: POL[val][2] === 'H₂O₂' ? 0.5 : POL[val][2] === 'H₂SO₄' ? 1 : 2 } : null,
    run(v) {
      const P = POL[v.pol], ag = P[2], none = ag === 'none';
      if (!(v.eff > 0 && v.eff < 100)) return { rows: [], notes: [['Efficiency must be between 0 and 100 %.', 'bad']] };
      const head = [`<b>Scrubbing agent:</b> ${none ? 'none: a liquid scrubber does not remove this gas' : ag + ' solution'}<br><b>Reaction:</b> ${P[5]}`, 'lead'];
      if (none) return { rows: [], notes: [head, [P[11], 'bad'], ['See <a href="/articles/gas-scrubbing-agents/#notscrub">standard practice for gases you cannot scrub</a>.']] };
      const Qa = v.Q * (273.15 + v.T) / 273.15 / 3600, D = Math.sqrt(4 * Qa / (Math.PI * v.u)), A = Math.PI * D * D / 4, ntu = Math.log(1 / (1 - v.eff / 100)), Z = ntu * v.htu, re = v.pm * v.st;
      const heatPk = v.pm / P[1] * 1000 * P[6];
      const perBatch = v.mb * v.st, design = perBatch * (1 + v.ex / 100), usable = v.M * (v.cs - v.cmin) / 100;
      const nb = design > 0 ? Math.floor(usable / design) : 0, heatB = v.mb / P[1] * 1000 * P[6], dT = v.M > 0 ? heatB / (v.M * SCR_CP) : NaN;
      const minCharge = (v.cs > v.cmin) ? design / ((v.cs - v.cmin) / 100) : NaN;
      const prod = v.mb / P[1] * P[8], nbx = Math.max(nb, 1), pct = 100 * nbx * prod / (v.M + nbx * v.mb);
      const notes = [head];
      if (!(v.cs > v.cmin)) notes.push(['The change-out strength must be lower than the starting strength.', 'bad']);
      else if (nb < 1) notes.push([`This liquor charge cannot take even one batch: use at least ${F(minCharge, 0)} kg of ${F(v.cs, 0)} % liquor, a stronger liquor, or smaller batches.`, 'bad']);
      if (P[9] && pct > 0.8 * P[9]) notes.push([`${P[7]} reaches about ${F(pct, 1)} % at change-out, close to saturation (about ${P[9]} %): solids can block packing and nozzles. Change out earlier or use a more dilute liquor.`, 'warn']);
      if (dT > 15) notes.push([`A batch heats the liquor by about ${F(dT, 0)} °C with no cooling. Hot liquor absorbs worse and can release the gas again: cool the recirculation loop or use a bigger charge.`, 'warn']);
      if (P[11]) notes.push([P[11]]);
      notes.push(['NTU = ln(1/(1−η)) assumes a fast reaction with no back-pressure of the gas over the liquor, true for acid gases in excess reagent. Check the gas velocity against the packing supplier\'s flooding chart (aim for 60–80 % of flood). Heats are from standard enthalpies of formation, about ±10 %.']);
      return { rows: [['Column diameter', F(D * 1000, 0), 'mm'], ['Packed height (NTU × HTU)', F(Z, 2), 'm'], ['With 20 % margin', F(Z * 1.2, 2), 'm'], ['Recirculation flow', F(v.wr * A, 1), 'm³/h'],
        ['Number of transfer units', F(ntu, 2), ''], [ag + ' used at peak', F(re, 2), 'kg/h'], [F(v.cs, 0) + ' % solution used at peak', F(re / (v.cs / 100), 1), 'kg/h'], ['Heat released at peak', F(heatPk, 0), 'kcal/h'],
        [ag + ' used per batch (with excess)', F(design, 1), 'kg'], ['Batches per liquor charge', isFinite(nb) ? String(nb) : '–', 'before change-out'], ['Minimum charge for one batch', F(minCharge, 0), 'kg of ' + F(v.cs, 0) + ' % liquor'],
        ['Heat per batch', F(heatB, 0), 'kcal'], ['Liquor temperature rise per batch', F(dT, 1), '°C, no cooling'], [P[7] + ' formed per batch', F(prod, 1), 'kg']], notes };
    },
    xl: [['Qa', 'Actual gas flow', `{Q}*(273.15+{T})/273.15/3600`, 'm³/s'], ['D', 'Column diameter', `SQRT(4*{Qa}/(PI()*{u}))*1000`, 'mm'], ['A', 'Column area', `PI()*({D}/1000)^2/4`, 'm²'],
      ['ntu', 'Number of transfer units', `LN(1/(1-{eff}/100))`, ''], ['Z', 'Packed height', `{ntu}*{htu}`, 'm'], ['Z2', 'With 20 % margin', `{Z}*1.2`, 'm'], ['L', 'Recirculation flow', `{wr}*{A}`, 'm³/h'],
      ['re', 'Reagent used at peak', `{pm}*{st}`, 'kg/h'], ['sol', 'Reagent solution used at peak', `{re}/({cs}/100)`, 'kg/h'],
      ['design', 'Reagent per batch with excess', `{mb}*{st}*(1+{ex}/100)`, 'kg'], ['usable', 'Usable reagent above change-out', `{M}*({cs}-{cmin})/100`, 'kg'], ['nb', 'Batches per liquor charge', `ROUNDDOWN({usable}/{design},0)`, 'batches'],
      ['minc', 'Minimum charge for one batch', `{design}/(({cs}-{cmin})/100)`, 'kg']] };

  /* ---------------- render ---------------- */
  // links that carry the inputs: everything after "#s=" stays in the browser and is never sent to a server
  const pcmeEnc = (o) => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const pcmeLink = (o) => location.origin + location.pathname + "#s=" + pcmeEnc(o);
  const pcmeRead = (k) => { try { const m = location.hash.match(/[#&]s=([A-Za-z0-9_-]+)/); if (!m) return null; const o = JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))))); return o && o.k === k ? o : null; } catch (e) { return null; } };
  function mount(el) {
    const id = el.dataset.calc, c = C[id]; if (!c) return;
    const v = {}; c.inputs.forEach(i => v[i.k] = i.v);
    { const st = pcmeRead('ut'); if (st && st.id === id && st.v) Object.keys(v).forEach(k => { if (st.v[k] !== undefined) v[k] = st.v[k]; }); }
    el.innerHTML = `<div class="ut-card"><div class="ut-hd"><h3>${esc(c.title)}</h3><p>${esc(c.sub)}</p></div><div class="ut-body"><form class="ut-in" autocomplete="off"></form><div class="ut-out" aria-live="polite"></div></div><div class="ut-tools"><button type="button" class="ut-xl">Download PDF</button><span>${c.xl ? 'with live formulas' : 'inputs and results'}</span></div></div>`;
    const form = el.querySelector('.ut-in'), out = el.querySelector('.ut-out'), xb = el.querySelector('.ut-xl');
    xb.addEventListener('click', () => {
      if (!window.PCME_XL) { alert('Download is not available on this page.'); return; }
      const ins = c.inputs.filter(i => !i.show || i.show(v)), r = c.run(v);
      xb.disabled = true; xb.textContent = 'Preparing…';
      window.PCME_XL.calcSheet({ link: pcmeLink({ k: 'ut', id, v }), title: c.title, sub: c.sub, inputs: ins.map(i => ({ k: i.k, label: i.label, unit: i.type === 'sel' ? 'type one of: ' + i.opts.map(o => o[0]).join(', ') : i.unit, value: v[i.k], text: i.type === 'sel' ? (i.opts.find(o => o[0] === v[i.k]) || [, ''])[1] : '' })),
        xl: r.rows.length ? c.xl : null, rows: r.rows, notes: (r.notes || []).map(n => n[0]) })
        .then(() => { xb.disabled = false; xb.textContent = 'Download PDF'; }, e => window.PCME_XL.fail(xb, e));
    });
    function drawInputs() {
      form.innerHTML = c.inputs.filter(i => !i.show || i.show(v)).map(i => `<label class="ut-f"><span>${esc(i.label)}${i.unit && i.type !== 'sel' ? ` <i>${esc(i.unit)}</i>` : ''}</span>${i.type === 'sel'
        ? `<select data-k="${i.k}">${i.opts.map(o => `<option value="${o[0]}"${o[0] === v[i.k] ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
        : `<input data-k="${i.k}" type="number" step="any" inputmode="decimal" value="${v[i.k]}">`}</label>`).join('');
    }
    function calc() {
      const bad = c.inputs.filter(i => i.type !== 'sel' && (!i.show || i.show(v)) && !isFinite(v[i.k]));
      if (bad.length) { out.innerHTML = '<p class="ut-empty">Fill in every value to see the result.</p>'; return; }
      const r = c.run(v);
      const leadN = (r.notes || []).filter(n => n[1] === 'lead'); r.notes = (r.notes || []).filter(n => n[1] !== 'lead');
      out.innerHTML = leadN.map(n => `<p class="ut-note lead">${n[0]}</p>`).join('') + (r.rows.length ? `<dl class="ut-res">${r.rows.map((x, j) => `<div${j === 0 ? ' class="lead"' : ''}><dt>${esc(x[0])}</dt><dd>${esc(x[1])} <small>${esc(x[2])}</small></dd></div>`).join('')}</dl>` : '') +
        (r.notes || []).map(n => `<p class="ut-note ${n[1] || ''}">${n[0]}</p>`).join('');
    }
    form.addEventListener('input', e => { const k = e.target.dataset.k; if (!k) return; const spec = c.inputs.find(i => i.k === k);
      v[k] = spec.type === 'sel' ? e.target.value : (e.target.value === '' ? NaN : +e.target.value);
      if (spec.type === 'sel') { const o = c.onSel && c.onSel(k, v[k]); if (o) Object.assign(v, o); drawInputs(); const f = form.querySelector(`[data-k="${k}"]`); if (f) f.focus(); }
      calc(); });
    drawInputs(); calc();
  }
  window.PCME_UTIL = { C, steam };
  document.querySelectorAll('.ut-calc').forEach(mount);
})();
