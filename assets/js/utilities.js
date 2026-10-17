/* PharmaChemE: utility system calculators (steam & boiler, cooling tower, chillers & VAM, compressed air & N2, water, DG & power).
   Each calculator is a definition: inputs, a run() that returns result rows, and notes. Pages place <div class="ut-calc" data-calc="id"></div>. */
(function () {
  'use strict';
  const F = (x, d) => (isFinite(x) ? Number(x).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PATM = 1.01325, TR = 3.517; // bar abs, kW per ton of refrigeration

  /* Saturated steam (bar abs): T °C, hf, hfg, hg kJ/kg */
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
  const COOL = { water: ['Water', 4.186, 1000], g30: ['Glycol 30 % (MEG)', 3.70, 1040], g40: ['Glycol 40 % (MEG)', 3.50, 1055], custom: ['Other (type cp and density)', 3.0, 1100] };

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
        ['Evaporation ratio', F(er, 2), 'kg steam per ' + u + ' fuel'], ['Heat added per kg steam', F(dh, 0), 'kJ/kg'], ['Fuel cost', '₹ ' + F(cost, 0), 'per day'], ['Steam cost (fuel only)', '₹ ' + F(perT, 0), 'per tonne']],
        notes: [[`Saturated steam at ${v.P} barg is ${F(s.T, 1)} °C with h<sub>g</sub> = ${F(s.hg, 0)} kJ/kg.`]].concat(s.clipped ? [['Pressure is outside 0 to 20 barg; the steam table end value is used.', 'warn']] : []) };
    } };
  C.boilerEff = { title: 'Boiler efficiency, direct method', sub: 'From measured steam and fuel over the same period',
    inputs: [
      { k: 'S', label: 'Steam generated', unit: 'kg/h', v: 5000 }, { k: 'P', label: 'Steam pressure', unit: 'barg', v: 10 },
      { k: 'Tfw', label: 'Feed water temperature', unit: '°C', v: 80 }, { k: 'fu', label: 'Fuel used', unit: 'kg/h or Sm³/h', v: 1000 },
      { k: 'gcv', label: 'Fuel GCV', unit: 'kcal/kg or /Sm³', v: 4000 }],
    run(v) {
      const s = steam(v.P), dh = s.hg - 4.186 * v.Tfw, eff = v.S * dh / (v.fu * v.gcv * 4.1868) * 100, er = v.S / v.fu;
      const band = eff > 95 ? ['Above 95 % is not possible on GCV: check the steam meter, fuel weight or GCV.', 'bad'] : eff < 65 ? ['Low. Check excess air, unburnt carbon in ash, blowdown and insulation.', 'warn'] : ['Within the usual range for this kind of boiler.', 'good'];
      return { rows: [['Boiler efficiency', F(eff, 1), '%'], ['Evaporation ratio', F(er, 2), 'kg steam per unit fuel'], ['Heat to steam', F(v.S * dh / 3600, 0), 'kW']], notes: [band] };
    } };
  C.flash = { title: 'Flash steam from condensate', sub: 'How much condensate flashes when its pressure drops',
    inputs: [
      { k: 'm', label: 'Condensate flow', unit: 'kg/h', v: 2000 }, { k: 'P1', label: 'Condensate pressure (trap inlet)', unit: 'barg', v: 8 },
      { k: 'P2', label: 'Flash vessel / return pressure', unit: 'barg', v: 0.5 }, { k: 'cost', label: 'Steam cost', unit: '₹/tonne', v: 2500 }, { k: 'hrs', label: 'Hours per year', unit: 'h', v: 7200 }],
    run(v) {
      if (v.P2 >= v.P1) return { rows: [], notes: [['The flash pressure must be lower than the condensate pressure.', 'bad']] };
      const a = steam(v.P1), b = steam(v.P2), x = Math.max(0, (a.hf - b.hf) / b.hfg), fl = x * v.m;
      return { rows: [['Flash fraction', F(x * 100, 1), '%'], ['Flash steam', F(fl, 0), 'kg/h'], ['Low-pressure steam value', '₹ ' + F(fl / 1000 * v.cost * v.hrs / 1e5, 2), 'lakh per year']],
        notes: [[`h<sub>f</sub> falls from ${F(a.hf, 0)} to ${F(b.hf, 0)} kJ/kg; that heat boils off part of the condensate.`], ['Recovered only if a flash vessel feeds a low-pressure user; otherwise it vents.']] };
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
      return { rows: [['Heat recovered', F(q / 3600, 0), 'kW'], ['Fuel saved', F(fuel, 1), u + '/h'], ['Fuel saving', '₹ ' + F(fc / 1e5, 2), 'lakh per year'],
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
      return { rows: [['Range', F(R, 1), '°C'], ['Approach', F(A, 1), '°C'], ['Effectiveness', F(eff, 0), '%'], ['Heat rejected', F(kw, 0), 'kW'], ['Heat rejected', F(kw / TR, 0), 'TR'], ['Evaporation loss', F(E, 2), 'm³/h']], notes: [note] };
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
    inputs: [{ k: 'kw', label: 'Heat to remove', unit: 'kW', v: 350 }, { k: 'dT', label: 'Water temperature rise', unit: '°C', v: 5 }],
    run(v) { const q = v.kw * 3600 / (4.186 * v.dT) / 1000; return { rows: [['Water flow', F(q, 1), 'm³/h'], ['Heat load', F(v.kw / TR, 1), 'TR'], ['Heat load', F(v.kw * 860, 0), 'kcal/h']], notes: [['Q (m³/h) = kW × 3,600 ÷ (4.186 × ΔT × 1,000).']] }; } };

  /* ---------------- Chillers & VAM ---------------- */
  const coolInputs = [{ k: 'fl', label: 'Fluid', type: 'sel', v: 'water', opts: Object.entries(COOL).map(([k, c]) => [k, c[0]]) },
    { k: 'cp', label: 'Specific heat', unit: 'kJ/kg·K', v: 4.186 }, { k: 'rho', label: 'Density', unit: 'kg/m³', v: 1000 }];
  C.chillerTR = { title: 'Chiller load and kW/TR', sub: 'Tonnage from flow and ΔT, then efficiency from power',
    inputs: [{ k: 'Q', label: 'Chilled water or brine flow', unit: 'm³/h', v: 120 }, { k: 'Tin', label: 'Return (inlet) temperature', unit: '°C', v: 12 }, { k: 'Tout', label: 'Supply (outlet) temperature', unit: '°C', v: 7 }]
      .concat(coolInputs, [{ k: 'kw', label: 'Chiller power input (measured)', unit: 'kW', v: 140 }]),
    onSel: (k, v) => k === 'fl' ? { cp: COOL[v][1], rho: COOL[v][2] } : null,
    run(v) {
      const dT = v.Tin - v.Tout; if (dT <= 0) return { rows: [], notes: [['Return must be warmer than supply.', 'bad']] };
      const kwth = v.Q * v.rho / 3600 * v.cp * dT, tr = kwth / TR, kwtr = v.kw / tr, cop = kwth / v.kw;
      const band = v.Tout < 0 ? ['Brine at sub-zero temperatures needs much more power per TR; compare with chillers at the same temperature.', 'warn'] : kwtr < 0.55 ? ['Very good, or check the meters.', 'good'] : kwtr <= 0.8 ? ['Typical of a water-cooled screw or centrifugal chiller.', 'good'] : kwtr <= 1.3 ? ['Typical of an air-cooled chiller, or a water-cooled one with fouled tubes or a warm condenser.', 'warn'] : ['High. Check condenser water temperature, refrigerant charge and part-load running.', 'bad'];
      return { rows: [['Cooling delivered', F(tr, 1), 'TR'], ['Cooling delivered', F(kwth, 0), 'kW'], ['Specific power', F(kwtr, 2), 'kW/TR'], ['COP', F(cop, 2), ''], ['Heat to cooling tower', F((kwth + v.kw) / TR, 0), 'TR (approx.)']], notes: [band] };
    } };
  const VAM = { de: ['Double-effect, steam (8–9 barg)', 1.3, 8], se: ['Single-effect, steam (≈1 barg)', 0.7, 1], hw: ['Single-effect, hot water (85–95 °C)', 0.7, null] };
  C.vam = { title: 'VAM steam or hot-water consumption', sub: 'Vapour absorption machine: heat input for a cooling load',
    inputs: [{ k: 'tr', label: 'Cooling load', unit: 'TR', v: 200 }, { k: 'type', label: 'Machine type', type: 'sel', v: 'de', opts: Object.entries(VAM).map(([k, m]) => [k, m[0]]) },
      { k: 'cop', label: 'COP', unit: '', v: 1.3 }, { k: 'P', label: 'Steam pressure', unit: 'barg', v: 8, show: v => v.type !== 'hw' },
      { k: 'dT', label: 'Hot water temperature drop', unit: '°C', v: 10, show: v => v.type === 'hw' }],
    onSel: (k, v) => k === 'type' ? Object.assign({ cop: VAM[v][1] }, VAM[v][2] != null ? { P: VAM[v][2] } : {}) : null,
    run(v) {
      const kwc = v.tr * TR, heat = kwc / v.cop, ct = kwc + heat, rows = [['Heat input', F(heat, 0), 'kW']];
      if (v.type === 'hw') rows.push(['Hot water flow', F(heat * 3600 / (4.186 * v.dT) / 1000, 1), 'm³/h']);
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

  /* ---------------- render ---------------- */
  function mount(el) {
    const id = el.dataset.calc, c = C[id]; if (!c) return;
    const v = {}; c.inputs.forEach(i => v[i.k] = i.v);
    el.innerHTML = `<div class="ut-card"><div class="ut-hd"><h3>${esc(c.title)}</h3><p>${esc(c.sub)}</p></div><div class="ut-body"><form class="ut-in" autocomplete="off"></form><div class="ut-out" aria-live="polite"></div></div></div>`;
    const form = el.querySelector('.ut-in'), out = el.querySelector('.ut-out');
    function drawInputs() {
      form.innerHTML = c.inputs.filter(i => !i.show || i.show(v)).map(i => `<label class="ut-f"><span>${esc(i.label)}${i.unit && i.type !== 'sel' ? ` <i>${esc(i.unit)}</i>` : ''}</span>${i.type === 'sel'
        ? `<select data-k="${i.k}">${i.opts.map(o => `<option value="${o[0]}"${o[0] === v[i.k] ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`
        : `<input data-k="${i.k}" type="number" step="any" inputmode="decimal" value="${v[i.k]}">`}</label>`).join('');
    }
    function calc() {
      const bad = c.inputs.filter(i => i.type !== 'sel' && (!i.show || i.show(v)) && !isFinite(v[i.k]));
      if (bad.length) { out.innerHTML = '<p class="ut-empty">Fill in every value to see the result.</p>'; return; }
      const r = c.run(v);
      out.innerHTML = (r.rows.length ? `<dl class="ut-res">${r.rows.map((x, j) => `<div${j === 0 ? ' class="lead"' : ''}><dt>${esc(x[0])}</dt><dd>${esc(x[1])} <small>${esc(x[2])}</small></dd></div>`).join('')}</dl>` : '') +
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
